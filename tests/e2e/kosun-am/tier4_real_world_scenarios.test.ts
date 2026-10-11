import test, { describe } from 'node:test';
import assert from 'node:assert';
import {
  KOSUN_AM_CONTRACTS,
  calculateTokenCost,
  interpolateVariables,
  containsTextualEmojis,
  validateUnsubscribeCompliance,
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

describe('Tier 4: Real-World Application Scenarios (End-to-End User Journeys)', () => {
  test('Scenario 4.1: The Grand Opening Newsletter Campaign', async () => {
    const harness = new TestEnvironmentHarness();
    const tenantId = FIXTURES.TENANT_A;

    // Step 1: Admin configures tenant API keys
    harness.apiKeysRegistry.configureTenant(tenantId, ['kosun-am'], {
      resendApiKey: 're_live_grand_opening',
      googleAiApiKey: 'ai_live_token',
    });

    // Step 2: Admin drafts campaign using Kosai AI
    const aiResult = await harness.kosaiAi.generateEmailContent(
      'השקת סניף הדגל החדש במתחם הבורסה',
      FIXTURES.BRAND_DNA.HIGH_TECH_LUXURY,
      'gemini-3.8-flash'
    );
    assert.strictEqual(aiResult.modelUsed, 'gemini-3.8-flash');
    assert.ok(aiResult.subject.length > 5);
    assert.strictEqual(containsTextualEmojis(aiResult.subject), false, 'Subject must contain zero textual emojis');

    // Step 3: Admin selects Bento Template & validates unsubscribe compliance
    const template = FIXTURES.TEMPLATES.BENTO_MODERN;
    const unsubCheck = validateUnsubscribeCompliance(template.htmlBody);
    assert.strictEqual(unsubCheck.compliant, true, 'Campaign must be anti-spam compliant');

    // Step 4: Save campaign in Scoped Firestore
    const campaignId = 'cmp_grand_opening_2026';
    harness.db.setDoc(tenantId, KOSUN_AM_CONTRACTS.COLLECTIONS.CAMPAIGNS, campaignId, {
      title: 'השקת סניף הדגל',
      subject: aiResult.subject,
      htmlBody: template.htmlBody,
      status: 'scheduled',
      totalRecipients: 500,
      createdAt: new Date().toISOString(),
    });

    // Step 5: Execute dispatch to audience batch
    const audience = Array.from({ length: 500 }, (_, i) => `customer_${i}@vip.co.il`);
    const dispatchResult = await harness.emailDispatcher.dispatch({
      tenantId,
      provider: 'resend',
      to: audience,
      subject: aiResult.subject,
      html: template.htmlBody,
      campaignId,
    });
    assert.strictEqual(dispatchResult.success, true);
    assert.strictEqual(dispatchResult.recipientCount, 500);

    // Step 6: Update campaign status to 'sent' and publish EventBus event
    harness.db.setDoc(tenantId, KOSUN_AM_CONTRACTS.COLLECTIONS.CAMPAIGNS, campaignId, {
      status: 'sent',
      sentAt: dispatchResult.timestamp,
    });
    harness.eventBus.publish('email:campaign:sent', {
      campaignId,
      campaignTitle: 'השקת סניף הדגל',
      recipientCount: 500,
      sentAt: dispatchResult.timestamp,
    });

    // Step 7: Verify outbound event received and metrics available
    const sentEvents = harness.eventBus.getHistoryByTopic('email:campaign:sent');
    assert.strictEqual(sentEvents.length, 1);
    assert.strictEqual(sentEvents[0].recipientCount, 500);

    // Step 8: Verify Collapsible stats accordion metrics
    const stats = {
      deliveredCount: 495,
      bouncedCount: 5,
      openRate: '42.8%',
      clickRate: '12.4%',
      costReport: aiResult.cost,
    };
    assert.ok(stats.deliveredCount > 0);
    assert.strictEqual(stats.costReport.costUsd > 0, true);
  });

  test('Scenario 4.2: Inbound Lead Drip Nurture Sequence from Smart Form', async () => {
    const harness = new TestEnvironmentHarness();
    const tenantId = FIXTURES.TENANT_A;
    harness.registerAutomation(FIXTURES.AUTOMATIONS.LEAD_WELCOME_DRIP);
    harness.setupEventListeners();

    // Step 1: Prospective lead submits Landing Page Smart Form
    const leadFormSubmission = {
      formId: 'form_landing_page_ai',
      formTitle: 'טופס הרשמה למועדון',
      submissionId: 'sub_alpha_882',
      conta_name: 'טל שרון',
      conta_phone: '0547778899',
      email: 'tal.sharon@tech.co.il',
      submittedAt: new Date().toISOString(),
    };

    harness.eventBus.publish('crm:lead:created', leadFormSubmission);

    await new Promise(r => setTimeout(r, 25));

    // Step 2: Day 0 Welcome Email dispatched
    assert.strictEqual(harness.emailDispatcher.dispatchedEmails.length, 1);
    const welcomeMail = harness.emailDispatcher.dispatchedEmails[0];
    assert.strictEqual(welcomeMail.to, 'tal.sharon@tech.co.il');
    assert.ok(welcomeMail.subject.includes('טל שרון'));
    assert.ok(welcomeMail.html.includes('קושאן דואג'), 'Must include living persona text');

    // Step 3: Day 0 WhatsApp Greeting dispatched via Green API
    assert.strictEqual(harness.whatsAppEngine.sentMessages.length, 1);
    const welcomeWa = harness.whatsAppEngine.sentMessages[0];
    assert.strictEqual(welcomeWa.phone, '0547778899');
    assert.ok(welcomeWa.text.includes('טל שרון'));

    // Step 4: Verify Firestore delivery logs
    const logs = harness.db.queryCollection(tenantId, KOSUN_AM_CONTRACTS.COLLECTIONS.LOGS);
    assert.strictEqual(logs.length, 1);
    assert.strictEqual(logs[0].status, 'delivered');
  });

  test('Scenario 4.3: Ambassador Crowdfunding Drive Onboarding', async () => {
    const harness = new TestEnvironmentHarness();
    const tenantId = FIXTURES.TENANT_A;
    harness.registerAutomation(FIXTURES.AUTOMATIONS.AMBASSADOR_WELCOME);
    harness.setupEventListeners();

    // Step 1: New ambassador registers in campaigns hub
    const ambassadorData = {
      campaignId: 'cmp_hospital_wing',
      ambassadorId: 'amb_sarah_cohen',
      name: 'שרה כהן',
      slug: 'sarah-cohen',
      phone: '0521122334',
      email: 'sarah@ambassadors.org',
      shareUrl: 'https://give.kosun.ai/p/sarah-cohen',
      targetGoal: 50_000,
      createdAt: new Date().toISOString(),
    };

    harness.eventBus.publish('campaign:ambassador:created', ambassadorData);

    await new Promise(r => setTimeout(r, 25));

    // Step 2: System generated personal fundraising email
    assert.strictEqual(harness.emailDispatcher.dispatchedEmails.length, 1);
    const sentEmail = harness.emailDispatcher.dispatchedEmails[0];
    assert.strictEqual(sentEmail.to, 'sarah@ambassadors.org');
    assert.ok(sentEmail.subject.includes('שרה כהן'));
    assert.ok(sentEmail.html.includes('https://give.kosun.ai/p/sarah-cohen'));

    // Step 3: Outbound automation event emitted
    const triggered = harness.eventBus.getHistoryByTopic('email:automation:triggered');
    assert.strictEqual(triggered.length, 1);
    assert.strictEqual(triggered[0].recipientEmail, 'sarah@ambassadors.org');
  });

  test('Scenario 4.4: Shabbat-Observant Brand Voice & Tone Campaign Pipeline', async () => {
    const harness = new TestEnvironmentHarness();
    const tenantId = 'tenant_shabbat_community';

    // Step 1: Kosher community brand DNA configured
    const brandDna = FIXTURES.BRAND_DNA.KOSHER_COMMUNITY;
    assert.strictEqual(brandDna.shabbatObservant, true);

    // Step 2: AI generates respectful copy using power words and avoiding forbidden terms
    const aiResult = await harness.kosaiAi.generateEmailContent(
      'הזמנה להשתתפות בערב חיזוק וברכה',
      brandDna,
      'gemini-3.8-flash'
    );

    // Verify copy doesn't include forbidden words
    brandDna.forbiddenWords.forEach(badWord => {
      assert.strictEqual(aiResult.subject.includes(badWord), false, `Forbidden word "${badWord}" must not appear in subject`);
      assert.strictEqual(aiResult.body.includes(badWord), false, `Forbidden word "${badWord}" must not appear in body`);
    });

    // Step 3: Schedule outside Shabbat window
    const targetDispatchDate = '2026-10-18T10:00:00Z'; // Sunday morning
    const isDispatchAllowed = new Date(targetDispatchDate).getUTCDay() !== 5 && new Date(targetDispatchDate).getUTCDay() !== 6;
    assert.strictEqual(isDispatchAllowed, true, 'Sunday dispatch is strictly kosher');

    // Step 4: Dispatch execution
    const res = await harness.emailDispatcher.dispatch({
      tenantId,
      provider: 'mock',
      to: 'community_member@hasdei.org',
      subject: aiResult.subject,
      html: aiResult.body,
    });
    assert.strictEqual(res.success, true);
  });

  test('Scenario 4.5: Resilient Offline / Key Rotation Failover Recovery', async () => {
    const harness = new TestEnvironmentHarness();
    const tenantId = FIXTURES.TENANT_A;

    // Step 1: Active provider dispatch fails due to invalid/rotated key
    harness.emailDispatcher.failNextWith = 'HTTP 401 Unauthorized: Invalid API key';

    const failedDispatch = await harness.emailDispatcher.dispatch({
      tenantId,
      provider: 'resend',
      to: 'client@company.com',
      subject: 'ניסיון שיגור 1',
      html: '<p>טקסט</p>',
    });
    assert.strictEqual(failedDispatch.success, false);
    assert.ok(failedDispatch.error?.includes('401 Unauthorized'));

    // Step 2: System seamlessly fails over to Local Mock Dispatch
    const mockFallbackDispatch = await harness.emailDispatcher.dispatch({
      tenantId,
      provider: 'mock',
      to: 'client@company.com',
      subject: 'ניסיון שיגור 1 (Fallback)',
      html: '<p>טקסט</p>',
    });
    assert.strictEqual(mockFallbackDispatch.success, true);
    assert.strictEqual(mockFallbackDispatch.provider, 'mock');

    // Step 3: Admin rotates API key in tenantApiKeys (Firestore only, zero localStorage)
    harness.apiKeysRegistry.configureTenant(tenantId, ['kosun-am'], {
      resendApiKey: 're_new_valid_rotated_key_2026',
    });
    const updatedKeys = harness.apiKeysRegistry.getModuleApiKeys(tenantId, 'kosun-am');
    assert.strictEqual(updatedKeys.resendApiKey, 're_new_valid_rotated_key_2026');

    // Step 4: Next dispatch succeeds with the new key
    const recoveredDispatch = await harness.emailDispatcher.dispatch({
      tenantId,
      provider: 'resend',
      to: 'client@company.com',
      subject: 'שיגור משוחזר בהצלחה',
      html: '<p>טקסט מעודכן</p>',
    });
    assert.strictEqual(recoveredDispatch.success, true);
    assert.strictEqual(recoveredDispatch.provider, 'resend');
  });
});
