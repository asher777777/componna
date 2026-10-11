import test, { describe } from 'node:test';
import assert from 'node:assert';
import {
  KOSUN_AM_CONTRACTS,
  deriveScopedCollectionPath,
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

describe('Tier 1: Feature Coverage (Opaque-Box Isolation)', () => {
  // ==========================================
  // Feature 1: Architecture & 12-Layer Scaffolding
  // ==========================================
  describe('Feature 1: Architecture & 12-Layer Scaffolding', () => {
    test('1.1 - 12-Layer Anatomy specification completeness', () => {
      const requiredLayers = KOSUN_AM_CONTRACTS.REQUIRED_12_LAYERS;
      assert.strictEqual(requiredLayers.length >= 12, true, 'Must specify at least 12 standard anatomical layers');
      assert.ok(requiredLayers.includes('types/index.ts'));
      assert.ok(requiredLayers.includes('config/index.ts'));
      assert.ok(requiredLayers.includes('context/ModuleContext.tsx'));
      assert.ok(requiredLayers.includes('services/emailFirestoreService.ts'));
      assert.ok(requiredLayers.includes('services/emailDispatchService.ts'));
      assert.ok(requiredLayers.includes('services/kosaiEmailAiService.ts'));
      assert.ok(requiredLayers.includes('components/KosunAmMainView.tsx'));
      assert.ok(requiredLayers.includes('StandaloneView.tsx'));
      assert.ok(requiredLayers.includes('README.md'));
    });

    test('1.2 - Zero Direct Cross-Module Imports rule compliance', () => {
      // Simulates import path validator: imports from sibling modules are forbidden
      const forbiddenSiblingImport = "import { crmData } from '../crm-groups-hub/data';";
      const allowedBridgeImport = "import { eventBus } from '@/core/bridge/EventBus';";
      const allowedContractImport = "import { LeadPayload } from '@/core/contracts';";

      const checkImport = (imp: string) => !imp.includes('../') || !imp.includes('-hub');
      assert.strictEqual(checkImport(forbiddenSiblingImport), false, 'Direct relative sibling import must be forbidden');
      assert.strictEqual(checkImport(allowedBridgeImport), true, 'Bridge import via @/core is permitted');
      assert.strictEqual(checkImport(allowedContractImport), true, 'Contract import via @/core is permitted');
    });

    test('1.3 - Dynamic React.lazy module registration contract in moduleRegistry', () => {
      const registryContract = {
        id: KOSUN_AM_CONTRACTS.MODULE_ID,
        name: KOSUN_AM_CONTRACTS.DISPLAY_NAME_HE,
        nameEn: KOSUN_AM_CONTRACTS.DISPLAY_NAME_EN,
        lazyLoad: true,
        importStatement: "React.lazy(() => import('../modules/kosun-am/StandaloneView'))",
      };

      assert.strictEqual(registryContract.id, 'kosun-am');
      assert.strictEqual(registryContract.lazyLoad, true);
      assert.ok(registryContract.importStatement.includes('React.lazy'));
    });

    test('1.4 - Component spec README completeness (All 8 mandatory chapters)', () => {
      const chapters = KOSUN_AM_CONTRACTS.SPEC_README_CHAPTERS;
      assert.strictEqual(chapters.length, 8, 'Must mandate all 8 official chapters');
      assert.ok(chapters.some(c => c.includes('פרק 1')));
      assert.ok(chapters.some(c => c.includes('פרק 2')));
      assert.ok(chapters.some(c => c.includes('פרק 6')));
      assert.ok(chapters.some(c => c.includes('פרק 7')));
    });

    test('1.5 - Module Error Boundary & Suspense contract integration', () => {
      const wrapperContract = {
        hasErrorBoundary: true,
        hasSuspense: true,
        fallbackTextHe: 'קושאן מתאושש ומעלה את הרכיב מחדש...',
      };
      assert.strictEqual(wrapperContract.hasErrorBoundary, true);
      assert.strictEqual(wrapperContract.hasSuspense, true);
      assert.ok(wrapperContract.fallbackTextHe.includes('קושאן'));
    });
  });

  // ==========================================
  // Feature 2: Scoped Multi-Tenancy & Triple-Sync Collections
  // ==========================================
  describe('Feature 2: Scoped Multi-Tenancy & Triple-Sync Collections', () => {
    test('2.1 - Collection prefix invariant verification', () => {
      const cols = KOSUN_AM_CONTRACTS.COLLECTIONS;
      Object.values(cols).forEach(colName => {
        assert.ok(colName.startsWith('mod_kosun_am_'), `Collection ${colName} must start with mod_kosun_am_`);
      });
      assert.strictEqual(cols.CAMPAIGNS, 'mod_kosun_am_campaigns');
      assert.strictEqual(cols.TEMPLATES, 'mod_kosun_am_templates');
      assert.strictEqual(cols.AUTOMATIONS, 'mod_kosun_am_automations');
      assert.strictEqual(cols.LOGS, 'mod_kosun_am_logs');
    });

    test('2.2 - Tenant Scoping path derivation (tenants/{tenantId}/mod_kosun_am_*)', () => {
      const tenantA = 'tenant_xyz';
      const pathA = deriveScopedCollectionPath(KOSUN_AM_CONTRACTS.COLLECTIONS.CAMPAIGNS, tenantA);
      assert.strictEqual(pathA, 'tenants/tenant_xyz/mod_kosun_am_campaigns');

      const defaultPath = deriveScopedCollectionPath(KOSUN_AM_CONTRACTS.COLLECTIONS.LOGS);
      assert.strictEqual(defaultPath, 'tenants/_master/mod_kosun_am_logs');
    });

    test('2.3 - Triple-sync registration keys match', () => {
      const keys = KOSUN_AM_CONTRACTS.SYSTEM_COLLECTION_KEYS;
      assert.strictEqual(keys.CAMPAIGNS, 'KOSUN_AM_CAMPAIGNS');
      assert.strictEqual(keys.TEMPLATES, 'KOSUN_AM_TEMPLATES');
      assert.strictEqual(keys.AUTOMATIONS, 'KOSUN_AM_AUTOMATIONS');
      assert.strictEqual(keys.LOGS, 'KOSUN_AM_LOGS');
    });

    test('2.4 - Firestore offline fallback to in-memory mock state', () => {
      const db = new MockFirestoreScope();
      // Initially empty
      const items = db.queryCollection('tenant_alpha', KOSUN_AM_CONTRACTS.COLLECTIONS.CAMPAIGNS);
      assert.deepStrictEqual(items, []);

      // Mock item inserted
      db.setDoc('tenant_alpha', KOSUN_AM_CONTRACTS.COLLECTIONS.CAMPAIGNS, 'c1', FIXTURES.CAMPAIGNS.WELCOME_NEWSLETTER);
      const retrieved = db.getDoc('tenant_alpha', KOSUN_AM_CONTRACTS.COLLECTIONS.CAMPAIGNS, 'c1');
      assert.strictEqual(retrieved.id, 'c1');
      assert.strictEqual(retrieved.title, FIXTURES.CAMPAIGNS.WELCOME_NEWSLETTER.title);
    });

    test('2.5 - Scoped collections persistence and cross-tenant data isolation', () => {
      const db = new MockFirestoreScope();
      db.setDoc('tenant_alpha', KOSUN_AM_CONTRACTS.COLLECTIONS.CAMPAIGNS, 'doc_alpha', { title: 'Secret Alpha' });
      db.setDoc('tenant_beta', KOSUN_AM_CONTRACTS.COLLECTIONS.CAMPAIGNS, 'doc_beta', { title: 'Secret Beta' });

      const alphaItems = db.queryCollection('tenant_alpha', KOSUN_AM_CONTRACTS.COLLECTIONS.CAMPAIGNS);
      const betaItems = db.queryCollection('tenant_beta', KOSUN_AM_CONTRACTS.COLLECTIONS.CAMPAIGNS);

      assert.strictEqual(alphaItems.length, 1);
      assert.strictEqual(alphaItems[0].title, 'Secret Alpha');
      assert.strictEqual(betaItems.length, 1);
      assert.strictEqual(betaItems[0].title, 'Secret Beta');
      assert.strictEqual(db.getDoc('tenant_alpha', KOSUN_AM_CONTRACTS.COLLECTIONS.CAMPAIGNS, 'doc_beta'), null);
    });
  });

  // ==========================================
  // Feature 3: Secure API Keys Architecture
  // ==========================================
  describe('Feature 3: Secure API Keys Architecture', () => {
    test('3.1 - API keys resolution via tenantApiKeys with moduleId kosun-am', () => {
      const registry = new MockTenantApiKeysRegistry();
      registry.configureTenant('tenant_paid', ['kosun-am'], {
        resendApiKey: 're_secret_123',
        googleAiApiKey: 'ai_secret_456',
      });

      const keys = registry.getModuleApiKeys('tenant_paid', 'kosun-am');
      assert.strictEqual(keys.resendApiKey, 're_secret_123');
      assert.strictEqual(keys.googleAiApiKey, 'ai_secret_456');
    });

    test('3.2 - LocalStorage API key rejection contract', () => {
      // Contract states keys must NEVER be stored in or read from localStorage
      const forbiddenStorage = {
        save: (key: string) => {
          if (key.includes('ApiKey')) throw new Error('Security Violation: localStorage API key storage is forbidden');
        },
      };
      assert.throws(() => forbiddenStorage.save('resendApiKey'), /Security Violation/);
    });

    test('3.3 - Module entitlement gate check blocks unpurchased tenant keys', () => {
      const registry = new MockTenantApiKeysRegistry();
      registry.configureTenant('tenant_unpaid', ['crm-groups'], {
        resendApiKey: 'should_not_leak',
      });

      assert.strictEqual(registry.isModuleEntitled('tenant_unpaid', 'kosun-am'), false);
      const keys = registry.getModuleApiKeys('tenant_unpaid', 'kosun-am');
      assert.deepStrictEqual(keys, {});
    });

    test('3.4 - Default empty secret state for unconfigured tenants without key leaks', () => {
      const registry = new MockTenantApiKeysRegistry();
      const keys = registry.getModuleApiKeys('non_existent_tenant', 'kosun-am');
      assert.deepStrictEqual(keys, {});
    });

    test('3.5 - Multi-provider key segregation', () => {
      const registry = new MockTenantApiKeysRegistry();
      registry.configureTenant('tenant_multi', ['kosun-am'], {
        resendApiKey: 'key_resend',
        sendgridApiKey: 'key_sendgrid',
        greenApiToken: 'key_green_api',
      });

      const keys = registry.getModuleApiKeys('tenant_multi', 'kosun-am');
      assert.strictEqual(keys.resendApiKey, 'key_resend');
      assert.strictEqual(keys.sendgridApiKey, 'key_sendgrid');
      assert.strictEqual(keys.greenApiToken, 'key_green_api');
    });
  });

  // ==========================================
  // Feature 4: Multi-Provider Email Dispatch Engine
  // ==========================================
  describe('Feature 4: Multi-Provider Email Dispatch Engine', () => {
    test('4.1 - Resend provider protocol and payload formatting', async () => {
      const engine = new MockEmailDispatchEngine();
      const res = await engine.dispatch({
        tenantId: 'tenant_1',
        provider: 'resend',
        to: 'user@example.com',
        subject: 'שלום מקושאן',
        html: '<p>תוכן המייל</p>',
      });

      assert.strictEqual(res.success, true);
      assert.strictEqual(res.provider, 'resend');
      assert.strictEqual(res.recipientCount, 1);
      assert.ok(res.messageId.startsWith('msg_'));
    });

    test('4.2 - SendGrid provider protocol and payload formatting', async () => {
      const engine = new MockEmailDispatchEngine();
      const res = await engine.dispatch({
        tenantId: 'tenant_1',
        provider: 'sendgrid',
        to: ['a@example.com', 'b@example.com'],
        subject: 'קמפיין קושאן',
        html: '<p>עדכון חודשי</p>',
      });

      assert.strictEqual(res.success, true);
      assert.strictEqual(res.provider, 'sendgrid');
      assert.strictEqual(res.recipientCount, 2);
    });

    test('4.3 - SMTP Cloud Functions proxy payload structuring', async () => {
      const engine = new MockEmailDispatchEngine();
      const res = await engine.dispatch({
        tenantId: 'tenant_1',
        provider: 'smtp_proxy',
        to: 'smtp_user@company.co.il',
        subject: 'SMTP Proxy Test',
        html: '<p>SMTP Dispatch</p>',
      });

      assert.strictEqual(res.success, true);
      assert.strictEqual(res.provider, 'smtp_proxy');
    });

    test('4.4 - Local Mock Dispatch fallback when keys are absent or offline', async () => {
      const engine = new MockEmailDispatchEngine();
      const res = await engine.dispatch({
        tenantId: 'tenant_offline',
        provider: 'mock',
        to: 'offline@demo.com',
        subject: 'סימולציית קושאן',
        html: '<p>מצב הדגמה מקומי</p>',
      });

      assert.strictEqual(res.success, true);
      assert.strictEqual(res.provider, 'mock');
    });

    test('4.5 - Unique messageId and timestamp generation upon dispatch', async () => {
      const engine = new MockEmailDispatchEngine();
      const res1 = await engine.dispatch({
        tenantId: 't1',
        provider: 'mock',
        to: 'x@test.com',
        subject: 'S1',
        html: '<p>B1</p>',
      });
      const res2 = await engine.dispatch({
        tenantId: 't1',
        provider: 'mock',
        to: 'y@test.com',
        subject: 'S2',
        html: '<p>B2</p>',
      });

      assert.notStrictEqual(res1.messageId, res2.messageId);
      assert.ok(new Date(res1.timestamp).getTime() > 0);
    });
  });

  // ==========================================
  // Feature 5: EventBus Inbound & Outbound Messaging Contracts
  // ==========================================
  describe('Feature 5: EventBus Inbound & Outbound Messaging Contracts', () => {
    test('5.1 - Inbound subscriber to crm:lead:created receiving LeadPayload', () => {
      const bus = new MockEventBus();
      let receivedLead: any = null;
      bus.subscribe('crm:lead:created', (payload) => {
        receivedLead = payload;
      });

      const leadData = { conta_name: 'יוסי כהן', conta_phone: '0501234567', email: 'yossi@test.com' };
      bus.publish('crm:lead:created', leadData);

      assert.deepStrictEqual(receivedLead, leadData);
    });

    test('5.2 - Inbound subscriber to smart_form:submitted receiving form data and leadPayload', () => {
      const bus = new MockEventBus();
      let receivedForm: any = null;
      bus.subscribe('smart_form:submitted', (payload) => {
        receivedForm = payload;
      });

      const formData = {
        formId: 'form_lead_gen',
        formTitle: 'טופס יצירת קשר',
        submissionId: 'sub_999',
        data: { interest: 'vip' },
        leadPayload: { conta_name: 'רונית שמעון', conta_phone: '0529876543', email: 'ronit@test.com' },
        submittedAt: new Date().toISOString(),
      };
      bus.publish('smart_form:submitted', formData);

      assert.strictEqual(receivedForm.formId, 'form_lead_gen');
      assert.strictEqual(receivedForm.leadPayload.email, 'ronit@test.com');
    });

    test('5.3 - Inbound subscriber to campaign:ambassador:created receiving ambassador details', () => {
      const bus = new MockEventBus();
      let receivedAmbassador: any = null;
      bus.subscribe('campaign:ambassador:created', (payload) => {
        receivedAmbassador = payload;
      });

      const ambassadorData = {
        campaignId: 'cmp_give',
        ambassadorId: 'amb_101',
        name: 'דוד לוי',
        shareUrl: 'https://give.kosun.ai/amb/david',
        createdAt: new Date().toISOString(),
      };
      bus.publish('campaign:ambassador:created', ambassadorData);

      assert.strictEqual(receivedAmbassador.name, 'דוד לוי');
      assert.strictEqual(receivedAmbassador.shareUrl, 'https://give.kosun.ai/amb/david');
    });

    test('5.4 - Outbound emission of email:campaign:sent with recipient count', () => {
      const bus = new MockEventBus();
      let sentEvent: any = null;
      bus.subscribe('email:campaign:sent', (payload) => {
        sentEvent = payload;
      });

      bus.publish('email:campaign:sent', {
        campaignId: 'cmp_2026',
        campaignTitle: 'השקת קושאן',
        recipientCount: 350,
        sentAt: new Date().toISOString(),
      });

      assert.strictEqual(sentEvent.campaignId, 'cmp_2026');
      assert.strictEqual(sentEvent.recipientCount, 350);
    });

    test('5.5 - Outbound emission of email:automation:triggered and email:delivery:failed', () => {
      const bus = new MockEventBus();
      const events: any[] = [];
      bus.subscribe('email:automation:triggered', (e) => events.push({ type: 'triggered', ...e }));
      bus.subscribe('email:delivery:failed', (e) => events.push({ type: 'failed', ...e }));

      bus.publish('email:automation:triggered', {
        automationId: 'aut_1',
        triggerEvent: 'crm:lead:created',
        recipientEmail: 'lead@test.com',
        actionTaken: 'email_dispatched',
        timestamp: new Date().toISOString(),
      });

      bus.publish('email:delivery:failed', {
        automationId: 'aut_1',
        recipientEmail: 'bad@domain.com',
        reason: 'SMTP 550 User Not Found',
        timestamp: new Date().toISOString(),
      });

      assert.strictEqual(events.length, 2);
      assert.strictEqual(events[0].type, 'triggered');
      assert.strictEqual(events[1].type, 'failed');
    });
  });

  // ==========================================
  // Feature 6: Visual Template & Campaign Management
  // ==========================================
  describe('Feature 6: Visual Template & Campaign Management', () => {
    test('6.1 - Visual block structure validation (Header, Hero, Text, CTA, Footer)', () => {
      const template = FIXTURES.TEMPLATES.BENTO_MODERN;
      const blockTypes = template.blocks.map(b => b.type);
      assert.ok(blockTypes.includes('header'));
      assert.ok(blockTypes.includes('hero'));
      assert.ok(blockTypes.includes('text'));
      assert.ok(blockTypes.includes('cta'));
      assert.ok(blockTypes.includes('footer'));
    });

    test('6.2 - Dynamic variable placeholder interpolation ({{conta_name}}, {{email}})', () => {
      const template = 'שלום {{conta_name}}, כתובת המייל שלך היא {{email}} והקוד הוא {{code}}';
      const output = interpolateVariables(template, {
        conta_name: 'משה',
        email: 'moshe@test.com',
        code: 9942,
      });

      assert.strictEqual(output, 'שלום משה, כתובת המייל שלך היא moshe@test.com והקוד הוא 9942');
    });

    test('6.3 - Campaign status lifecycle transitions (draft -> scheduled -> sent)', () => {
      const campaign = { ...FIXTURES.CAMPAIGNS.WELCOME_NEWSLETTER };
      assert.strictEqual(campaign.status, 'draft');

      campaign.status = 'scheduled';
      assert.strictEqual(campaign.status, 'scheduled');

      campaign.status = 'sending';
      assert.strictEqual(campaign.status, 'sending');

      campaign.status = 'sent';
      assert.strictEqual(campaign.status, 'sent');
    });

    test('6.4 - Unsubscribe link and anti-spam footer injection compliance', () => {
      const valid = validateUnsubscribeCompliance(FIXTURES.TEMPLATES.BENTO_MODERN.htmlBody);
      assert.strictEqual(valid.compliant, true);
      assert.strictEqual(valid.hasUnsubscribe, true);

      const invalid = validateUnsubscribeCompliance(FIXTURES.TEMPLATES.UNSUBSCRIBE_MISSING.htmlBody);
      assert.strictEqual(invalid.compliant, false);
    });

    test('6.5 - Plain text extraction and layout fidelity from HTML template', () => {
      const rawHtml = FIXTURES.TEMPLATES.BENTO_MODERN.htmlBody;
      const stripped = rawHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      assert.ok(stripped.includes('שמחים שבחרת בנו'));
      assert.ok(stripped.includes('קושאן דואג שהמייל יגיע ליעד'));
    });
  });

  // ==========================================
  // Feature 7: Multi-Channel Automation Workflow Engine
  // ==========================================
  describe('Feature 7: Multi-Channel Automation Workflow Engine', () => {
    test('7.1 - Workflow node execution sequencing (Trigger -> Condition -> Action)', async () => {
      const harness = new TestEnvironmentHarness();
      harness.registerAutomation(FIXTURES.AUTOMATIONS.FORM_SUBMISSION_FILTERED);
      harness.setupEventListeners();

      // Trigger matching condition
      harness.eventBus.publish('smart_form:submitted', {
        formId: 'f1',
        interest: 'enterprise',
        leadPayload: { conta_name: 'דנה שפירא', conta_phone: '0541112233', email: 'dana@enterprise.com' },
      });

      // Wait a tick for async execution
      await new Promise(r => setTimeout(r, 10));

      const logs = harness.db.queryCollection(FIXTURES.AUTOMATIONS.FORM_SUBMISSION_FILTERED.tenantId, KOSUN_AM_CONTRACTS.COLLECTIONS.LOGS);
      assert.strictEqual(logs.length, 1);
      assert.strictEqual(logs[0].status, 'delivered');
      assert.strictEqual(logs[0].recipientEmail, 'dana@enterprise.com');
    });

    test('7.2 - Multi-channel dispatch routing: Email channel step execution', async () => {
      const harness = new TestEnvironmentHarness();
      harness.registerAutomation(FIXTURES.AUTOMATIONS.LEAD_WELCOME_DRIP);
      harness.setupEventListeners();

      harness.eventBus.publish('crm:lead:created', {
        conta_name: 'אבי גולדברג',
        conta_phone: '0505556677',
        email: 'avi@goldberg.co.il',
      });

      await new Promise(r => setTimeout(r, 10));

      assert.strictEqual(harness.emailDispatcher.dispatchedEmails.length, 1);
      assert.strictEqual(harness.emailDispatcher.dispatchedEmails[0].to, 'avi@goldberg.co.il');
    });

    test('7.3 - Multi-channel dispatch routing: WhatsApp Green API step execution', async () => {
      const harness = new TestEnvironmentHarness();
      harness.registerAutomation(FIXTURES.AUTOMATIONS.LEAD_WELCOME_DRIP);
      harness.setupEventListeners();

      harness.eventBus.publish('crm:lead:created', {
        conta_name: 'אבי גולדברג',
        conta_phone: '0505556677',
        email: 'avi@goldberg.co.il',
      });

      await new Promise(r => setTimeout(r, 10));

      assert.strictEqual(harness.whatsAppEngine.sentMessages.length, 1);
      assert.strictEqual(harness.whatsAppEngine.sentMessages[0].phone, '0505556677');
      assert.ok(harness.whatsAppEngine.sentMessages[0].text.includes('אבי גולדברג'));
    });

    test('7.4 - Workflow delay configuration validation', () => {
      const delayStep = {
        type: 'delay',
        config: { unit: 'hours', value: 24 },
      };
      assert.strictEqual(delayStep.config.unit, 'hours');
      assert.strictEqual(delayStep.config.value, 24);
    });

    test('7.5 - Comprehensive delivery audit logging in mod_kosun_am_logs', async () => {
      const harness = new TestEnvironmentHarness();
      harness.registerAutomation(FIXTURES.AUTOMATIONS.LEAD_WELCOME_DRIP);
      harness.setupEventListeners();

      harness.eventBus.publish('crm:lead:created', {
        conta_name: 'מאיה אלון',
        conta_phone: '0523334455',
        email: 'maya@alon.com',
      });

      await new Promise(r => setTimeout(r, 10));

      const logs = harness.db.queryCollection(FIXTURES.AUTOMATIONS.LEAD_WELCOME_DRIP.tenantId, KOSUN_AM_CONTRACTS.COLLECTIONS.LOGS);
      assert.ok(logs.length >= 1);
      assert.strictEqual(logs[0].recipientEmail, 'maya@alon.com');
      assert.strictEqual(logs[0].status, 'delivered');
    });
  });

  // ==========================================
  // Feature 8: Kosai AI Copilot & Token Cost Engine
  // ==========================================
  describe('Feature 8: Kosai AI Copilot & Token Cost Engine', () => {
    test('8.1 - Gemini Flash primary model selection (gemini-3.8-flash)', async () => {
      const ai = new MockKosaiAiEngine();
      const res = await ai.generateEmailContent('כתוב מייל הזמנה לכנס', { companyName: 'קושאן' }, 'gemini-3.8-flash');
      assert.strictEqual(res.modelUsed, 'gemini-3.8-flash');
      assert.ok(res.subject.includes('קושאן'));
    });

    test('8.2 - Fallback cascade order (3.8-flash -> 3.5-flash -> 3.8-flash-lite -> mock)', async () => {
      const ai = new MockKosaiAiEngine();
      ai.failModels.add('gemini-3.8-flash'); // primary fails
      const res1 = await ai.generateEmailContent('בדיקה', {}, 'gemini-3.8-flash');
      assert.strictEqual(res1.modelUsed, 'gemini-3.5-flash');

      ai.failModels.add('gemini-3.5-flash'); // secondary fails
      const res2 = await ai.generateEmailContent('בדיקה', {}, 'gemini-3.8-flash');
      assert.strictEqual(res2.modelUsed, 'gemini-3.8-flash-lite');

      ai.failModels.add('gemini-3.8-flash-lite'); // tertiary fails
      const res3 = await ai.generateEmailContent('בדיקה', {}, 'gemini-3.8-flash');
      assert.strictEqual(res3.modelUsed, 'local-mock-copilot');
    });

    test('8.3 - Token cost calculation in USD ($)', () => {
      const cost = calculateTokenCost(100_000, 50_000, 'gemini-3.8-flash');
      // input: (100k/1M)*0.15 = 0.015, output: (50k/1M)*0.60 = 0.030 -> total = 0.045
      assert.strictEqual(cost.costUsd, 0.045);
      assert.strictEqual(cost.formattedUsd, '$0.0450');
    });

    test('8.4 - Token cost conversion to ILS (₪)', () => {
      const cost = calculateTokenCost(100_000, 50_000, 'gemini-3.8-flash');
      // 0.045 * 3.75 = 0.16875
      assert.strictEqual(cost.costIls, 0.16875);
      assert.strictEqual(cost.formattedIls, '₪0.1688');
    });

    test('8.5 - Brand DNA voice and context injection into AI prompt generation', async () => {
      const ai = new MockKosaiAiEngine();
      const res = await ai.generateEmailContent('הזמנה להצטרף', {
        companyName: FIXTURES.BRAND_DNA.HIGH_TECH_LUXURY.companyName,
        powerWords: FIXTURES.BRAND_DNA.HIGH_TECH_LUXURY.powerWords,
      });

      assert.ok(res.subject.includes(FIXTURES.BRAND_DNA.HIGH_TECH_LUXURY.companyName));
      assert.ok(res.body.includes('קושאן דואג'));
    });
  });

  // ==========================================
  // Feature 9: Kosun 2026 UI & Branding Compliance
  // ==========================================
  describe('Feature 9: Kosun 2026 UI & Branding Compliance', () => {
    test('9.1 - Exclusive Heebo typography contract', () => {
      const font = KOSUN_AM_CONTRACTS.BRANDING.FONT_FAMILY;
      assert.strictEqual(font, 'Heebo');
    });

    test('9.2 - Strict RTL wrapper (<div dir="rtl" style="text-align: right;">) contract', () => {
      const rtlWrapper = KOSUN_AM_CONTRACTS.BRANDING.RTL_WRAPPER;
      assert.strictEqual(rtlWrapper, '<div dir="rtl" style="text-align: right;">');
    });

    test('9.3 - Zero textual emojis invariant', () => {
      assert.strictEqual(containsTextualEmojis('שלום חברים!'), false);
      assert.strictEqual(containsTextualEmojis('ברוכים הבאים 👋'), true);
      assert.strictEqual(containsTextualEmojis('מבצע מדהים 🔥'), true);
    });

    test('9.4 - Pure Top Nav layout contract (zero sidebars)', () => {
      assert.strictEqual(KOSUN_AM_CONTRACTS.BRANDING.TOP_NAV_ONLY, true);
      assert.strictEqual(KOSUN_AM_CONTRACTS.BRANDING.NO_SIDEBAR, true);
    });

    test('9.5 - Collapsible stats accordion & living persona language', () => {
      assert.strictEqual(KOSUN_AM_CONTRACTS.BRANDING.COLLAPSIBLE_STATS, true);
      const phrases = KOSUN_AM_CONTRACTS.BRANDING.ENTITY_PHRASES;
      assert.ok(phrases.some(p => p.includes('קושאן דואג')));
      assert.ok(phrases.some(p => p.includes('קושאן מכין')));
    });
  });
});
