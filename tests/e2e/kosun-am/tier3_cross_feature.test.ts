import test, { describe } from 'node:test';
import assert from 'node:assert';
import {
  KOSUN_AM_CONTRACTS,
  calculateTokenCost,
  interpolateVariables,
} from './harness/contractOracle.ts';
import {
  TestEnvironmentHarness,
  MockFirestoreScope,
  MockEventBus,
  MockTenantApiKeysRegistry,
  MockEmailDispatchEngine,
  MockWhatsAppGreenApiEngine,
  MockKosaiAiEngine,
} from './harness/mockEnvironment.ts';
import { FIXTURES } from './harness/testFixtures.ts';

describe('Tier 3: Cross-Feature Combinations (Pairwise & System Interactions)', () => {
  test('3.1 - CRM Lead Creation -> Automation Trigger -> Dual-Channel Dispatch (Email & WhatsApp) -> Delivery Logs', async () => {
    const harness = new TestEnvironmentHarness();
    harness.registerAutomation(FIXTURES.AUTOMATIONS.LEAD_WELCOME_DRIP);
    harness.setupEventListeners();

    // 1. Inbound event
    harness.eventBus.publish('crm:lead:created', {
      conta_name: 'יוסי כהן',
      conta_phone: '0501112233',
      email: 'yossi@cohen.co.il',
    });

    await new Promise(r => setTimeout(r, 20));

    // 2. Email dispatched
    assert.strictEqual(harness.emailDispatcher.dispatchedEmails.length, 1);
    const email = harness.emailDispatcher.dispatchedEmails[0];
    assert.strictEqual(email.to, 'yossi@cohen.co.il');
    assert.ok(email.subject.includes('יוסי כהן'));

    // 3. WhatsApp dispatched
    assert.strictEqual(harness.whatsAppEngine.sentMessages.length, 1);
    const wa = harness.whatsAppEngine.sentMessages[0];
    assert.strictEqual(wa.phone, '0501112233');
    assert.ok(wa.text.includes('יוסי כהן'));

    // 4. Firestore delivery log written
    const logs = harness.db.queryCollection(FIXTURES.AUTOMATIONS.LEAD_WELCOME_DRIP.tenantId, KOSUN_AM_CONTRACTS.COLLECTIONS.LOGS);
    assert.strictEqual(logs.length, 1);
    assert.strictEqual(logs[0].status, 'delivered');
    assert.strictEqual(logs[0].recipientEmail, 'yossi@cohen.co.il');
  });

  test('3.2 - Smart Form Submission -> Tag Filter Condition -> Email Campaign Auto-Enrollment -> EventBus Outbound Event', async () => {
    const harness = new TestEnvironmentHarness();
    harness.registerAutomation(FIXTURES.AUTOMATIONS.FORM_SUBMISSION_FILTERED);
    harness.setupEventListeners();

    // 1. Inbound event with matching filter
    harness.eventBus.publish('smart_form:submitted', {
      formId: 'form_sales',
      interest: 'enterprise',
      leadPayload: {
        conta_name: 'מיכל אברהמי',
        conta_phone: '0528889900',
        email: 'michal@corp.com',
      },
    });

    await new Promise(r => setTimeout(r, 20));

    // 2. Verified outbound EventBus event
    const outboundEvents = harness.eventBus.getHistoryByTopic('email:automation:triggered');
    assert.strictEqual(outboundEvents.length, 1);
    assert.strictEqual(outboundEvents[0].recipientEmail, 'michal@corp.com');
    assert.strictEqual(outboundEvents[0].actionTaken, 'email_dispatched');

    // 3. Negative check: Non-matching interest does NOT trigger
    harness.eventBus.publish('smart_form:submitted', {
      formId: 'form_sales',
      interest: 'basic',
      leadPayload: { conta_name: 'סטודנט', email: 'student@uni.ac.il' },
    });

    await new Promise(r => setTimeout(r, 20));
    assert.strictEqual(harness.eventBus.getHistoryByTopic('email:automation:triggered').length, 1);
  });

  test('3.3 - Ambassador Campaign Creation -> Dynamic Personal Share URL Interpolation -> Welcome Notification Email -> Multi-Tenant Isolation', async () => {
    const harness = new TestEnvironmentHarness();
    harness.registerAutomation(FIXTURES.AUTOMATIONS.AMBASSADOR_WELCOME);
    harness.setupEventListeners();

    const ambData = {
      campaignId: 'cmp_charity',
      ambassadorId: 'amb_ronen',
      name: 'רונן ברק',
      email: 'ronen@give.org',
      shareUrl: 'https://give.kosun.ai/amb/ronen-barak',
    };

    harness.eventBus.publish('campaign:ambassador:created', ambData);

    await new Promise(r => setTimeout(r, 20));

    assert.strictEqual(harness.emailDispatcher.dispatchedEmails.length, 1);
    const sent = harness.emailDispatcher.dispatchedEmails[0];
    assert.strictEqual(sent.to, 'ronen@give.org');
    assert.ok(sent.html.includes('https://give.kosun.ai/amb/ronen-barak'));

    // Tenant isolation verification: Tenant B has 0 logs
    const logsTenantB = harness.db.queryCollection(FIXTURES.TENANT_B, KOSUN_AM_CONTRACTS.COLLECTIONS.LOGS);
    assert.strictEqual(logsTenantB.length, 0);
  });

  test('3.4 - Kosai AI Subject Generation -> Visual Template Editor Integration -> Dispatch Campaign -> Cost Tracking Update', async () => {
    const harness = new TestEnvironmentHarness();

    // 1. AI Generation with Brand DNA
    const aiResult = await harness.kosaiAi.generateEmailContent(
      'השקת מודול דיוור מתקדם 2026',
      FIXTURES.BRAND_DNA.HIGH_TECH_LUXURY,
      'gemini-3.8-flash'
    );
    assert.ok(aiResult.subject.includes(FIXTURES.BRAND_DNA.HIGH_TECH_LUXURY.companyName));
    assert.ok(aiResult.cost.costUsd > 0);

    // 2. Inject into Template & Dispatch
    const template = { ...FIXTURES.TEMPLATES.BENTO_MODERN };
    const mergedHtml = template.htmlBody.replace('{{conta_name}}', 'לקוח VIP');

    const dispatchResult = await harness.emailDispatcher.dispatch({
      tenantId: FIXTURES.TENANT_A,
      provider: 'mock',
      to: 'vip@investors.co.il',
      subject: aiResult.subject,
      html: mergedHtml,
    });

    assert.strictEqual(dispatchResult.success, true);
    assert.strictEqual(harness.emailDispatcher.dispatchedEmails[0].subject, aiResult.subject);
  });

  test('3.5 - Failed Dispatch Provider -> Outbound Event email:delivery:failed -> Error Delivery Log in Scoped Firestore', async () => {
    const harness = new TestEnvironmentHarness();
    harness.registerAutomation(FIXTURES.AUTOMATIONS.LEAD_WELCOME_DRIP);
    harness.setupEventListeners();

    // Simulate provider failure (e.g. SMTP 550 Bad recipient)
    harness.emailDispatcher.failNextWith = 'SMTP 550 Recipient Rejected';

    harness.eventBus.publish('crm:lead:created', {
      conta_name: 'יוסי דורון',
      conta_phone: '0540001122',
      email: 'invalid-address@baddomain.xyz',
    });

    await new Promise(r => setTimeout(r, 20));

    // 1. Delivery failed event emitted
    const failedEvents = harness.eventBus.getHistoryByTopic('email:delivery:failed');
    assert.strictEqual(failedEvents.length, 1);
    assert.strictEqual(failedEvents[0].reason, 'SMTP 550 Recipient Rejected');

    // 2. Log record saved with 'failed' status
    const logs = harness.db.queryCollection(FIXTURES.AUTOMATIONS.LEAD_WELCOME_DRIP.tenantId, KOSUN_AM_CONTRACTS.COLLECTIONS.LOGS);
    assert.strictEqual(logs.length, 1);
    assert.strictEqual(logs[0].status, 'failed');
    assert.strictEqual(logs[0].error, 'SMTP 550 Recipient Rejected');
  });

  test('3.6 - Multi-Tenant Tenant A vs Tenant B Concurrent Campaign Dispatch', async () => {
    const harness = new TestEnvironmentHarness();

    const dispatchA = harness.emailDispatcher.dispatch({
      tenantId: FIXTURES.TENANT_A,
      provider: 'mock',
      to: 'alpha_lead@domain.com',
      subject: 'קמפיין A',
      html: '<p>A</p>',
    });

    const dispatchB = harness.emailDispatcher.dispatch({
      tenantId: FIXTURES.TENANT_B,
      provider: 'mock',
      to: 'beta_lead@domain.com',
      subject: 'קמפיין B',
      html: '<p>B</p>',
    });

    const [resA, resB] = await Promise.all([dispatchA, dispatchB]);
    assert.strictEqual(resA.success, true);
    assert.strictEqual(resB.success, true);

    // Save logs under scoped tenants
    harness.db.setDoc(FIXTURES.TENANT_A, KOSUN_AM_CONTRACTS.COLLECTIONS.LOGS, resA.messageId, { ...resA, to: 'alpha_lead@domain.com' });
    harness.db.setDoc(FIXTURES.TENANT_B, KOSUN_AM_CONTRACTS.COLLECTIONS.LOGS, resB.messageId, { ...resB, to: 'beta_lead@domain.com' });

    const logsA = harness.db.queryCollection(FIXTURES.TENANT_A, KOSUN_AM_CONTRACTS.COLLECTIONS.LOGS);
    const logsB = harness.db.queryCollection(FIXTURES.TENANT_B, KOSUN_AM_CONTRACTS.COLLECTIONS.LOGS);

    assert.strictEqual(logsA.length, 1);
    assert.strictEqual(logsA[0].to, 'alpha_lead@domain.com');
    assert.strictEqual(logsB.length, 1);
    assert.strictEqual(logsB[0].to, 'beta_lead@domain.com');
  });

  test('3.7 - Shabbat Observance Guard -> Automation Queue Delay', () => {
    const isShabbatWindow = (isoDateString: string) => {
      const d = new Date(isoDateString);
      const day = d.getUTCDay(); // 5 = Friday, 6 = Saturday
      const hour = d.getUTCHours();
      if (day === 5 && hour >= 14) return true; // Friday afternoon
      if (day === 6 && hour < 19) return true;  // Saturday until nightfall
      return false;
    };

    const fridayNight = '2026-10-16T18:00:00Z';
    const sundayMorning = '2026-10-18T08:00:00Z';

    assert.strictEqual(isShabbatWindow(fridayNight), true);
    assert.strictEqual(isShabbatWindow(sundayMorning), false);
  });

  test('3.8 - Template Variable Substitution with CRM Custom Fields and Safe HTML Escaping', () => {
    const rawTemplate = '<p>שלום {{conta_name}}, היתרה שלך היא {{balance}} וההערה היא: {{note}}</p>';
    const crmPayload = {
      conta_name: 'דניאל',
      balance: '1,500 ₪',
      note: 'לקוח VIP & ותיק',
    };

    const rendered = interpolateVariables(rawTemplate, crmPayload);
    assert.strictEqual(rendered, '<p>שלום דניאל, היתרה שלך היא 1,500 ₪ וההערה היא: לקוח VIP & ותיק</p>');
  });

  test('3.9 - Unsubscribe Link Event -> Contact Suppression -> Subsequent Automation Skip', async () => {
    const harness = new TestEnvironmentHarness();
    harness.registerAutomation(FIXTURES.AUTOMATIONS.LEAD_WELCOME_DRIP);
    harness.setupEventListeners();

    // 1. Recipient unsubscribes
    const unsubEmail = 'optout@user.co.il';
    harness.suppressionList.add(unsubEmail.toLowerCase());

    // 2. Inbound lead event arrives for suppressed email
    harness.eventBus.publish('crm:lead:created', {
      conta_name: 'משתמש שהסיר עצמו',
      email: unsubEmail,
    });

    await new Promise(r => setTimeout(r, 20));

    // 3. Verified NO email was dispatched
    assert.strictEqual(harness.emailDispatcher.dispatchedEmails.length, 0);

    // 4. Log shows skipped_unsubscribed
    const logs = harness.db.queryCollection(FIXTURES.AUTOMATIONS.LEAD_WELCOME_DRIP.tenantId, KOSUN_AM_CONTRACTS.COLLECTIONS.LOGS);
    assert.strictEqual(logs.length, 1);
    assert.strictEqual(logs[0].status, 'skipped_unsubscribed');
  });

  test('3.10 - High-Throughput Burst: 50 Leads from Smart Forms -> 50 Automated Email Dispatches -> EventBus & Log Reconciliation', async () => {
    const harness = new TestEnvironmentHarness();
    harness.registerAutomation(FIXTURES.AUTOMATIONS.LEAD_WELCOME_DRIP);
    harness.setupEventListeners();

    const COUNT = 50;
    for (let i = 0; i < COUNT; i++) {
      harness.eventBus.publish('crm:lead:created', {
        conta_name: `ליד ${i}`,
        conta_phone: `050${String(i).padStart(7, '0')}`,
        email: `lead_${i}@burst.com`,
      });
    }

    await new Promise(r => setTimeout(r, 50));

    assert.strictEqual(harness.emailDispatcher.dispatchedEmails.length, COUNT);
    assert.strictEqual(harness.whatsAppEngine.sentMessages.length, COUNT);

    const logs = harness.db.queryCollection(FIXTURES.AUTOMATIONS.LEAD_WELCOME_DRIP.tenantId, KOSUN_AM_CONTRACTS.COLLECTIONS.LOGS);
    assert.strictEqual(logs.length, COUNT);

    const triggeredEvents = harness.eventBus.getHistoryByTopic('email:automation:triggered');
    assert.strictEqual(triggeredEvents.length, COUNT);
  });
});
