import test, { describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Tier 5: Milestone 2 Adversarial Empirical Challenge Suite', () => {

  // =========================================================================
  // Challenge 1: Triple-Sync Contract Verification
  // =========================================================================
  describe('Challenge 1: Triple-Sync Registry Deep Integrity', () => {
    const requiredCollections = [
      'mod_kosun_am_campaigns',
      'mod_kosun_am_templates',
      'mod_kosun_am_automations',
      'mod_kosun_am_logs',
    ] as const;

    const collectionsContent = fs.readFileSync(path.resolve('src/core/contracts/collections.ts'), 'utf8');
    const hubConfigContent = fs.readFileSync(path.resolve('src/modules/db-collections-hub/config/index.ts'), 'utf8');
    const seedDataContent = fs.readFileSync(path.resolve('src/modules/db-collections-hub/config/seedData.ts'), 'utf8');

    test('1.1 - All 4 collections must be registered in collections.ts with MOD_ prefix and alias', () => {
      for (const col of requiredCollections) {
        assert.ok(
          collectionsContent.includes(`'${col}'`),
          `Collection '${col}' must exist as a literal value in src/core/contracts/collections.ts`
        );
      }

      assert.ok(collectionsContent.includes("MOD_KOSUN_AM_CAMPAIGNS: 'mod_kosun_am_campaigns'"));
      assert.ok(collectionsContent.includes("MOD_KOSUN_AM_TEMPLATES: 'mod_kosun_am_templates'"));
      assert.ok(collectionsContent.includes("MOD_KOSUN_AM_AUTOMATIONS: 'mod_kosun_am_automations'"));
      assert.ok(collectionsContent.includes("MOD_KOSUN_AM_LOGS: 'mod_kosun_am_logs'"));
      assert.ok(collectionsContent.includes("KOSUN_AM_CAMPAIGNS: 'mod_kosun_am_campaigns'"));
      assert.ok(collectionsContent.includes("KOSUN_AM_TEMPLATES: 'mod_kosun_am_templates'"));
      assert.ok(collectionsContent.includes("KOSUN_AM_AUTOMATIONS: 'mod_kosun_am_automations'"));
      assert.ok(collectionsContent.includes("KOSUN_AM_LOGS: 'mod_kosun_am_logs'"));
    });

    test('1.2 - All 4 collections must be registered in PREDEFINED_COLLECTIONS with valid Lucide icons', () => {
      for (const col of requiredCollections) {
        assert.ok(
          hubConfigContent.includes(`id: '${col}'`),
          `Collection '${col}' must be registered with id in PREDEFINED_COLLECTIONS`
        );
      }

      // Verify Lucide icon assignments
      const iconMatches = [
        { id: 'mod_kosun_am_campaigns', icon: 'Mail' },
        { id: 'mod_kosun_am_templates', icon: 'Layout' },
        { id: 'mod_kosun_am_automations', icon: 'GitBranch' },
        { id: 'mod_kosun_am_logs', icon: 'FileText' },
      ];

      for (const item of iconMatches) {
        const regex = new RegExp(`id:\\s*'${item.id}'[\\s\\S]*?icon:\\s*'${item.icon}'`);
        assert.ok(
          regex.test(hubConfigContent),
          `Collection ${item.id} must be paired with Lucide icon ${item.icon}`
        );
      }
    });

    test('1.3 - All 4 collections must be present in PROJECT_SEED_DATA with valid non-empty seed items', () => {
      for (const col of requiredCollections) {
        assert.ok(
          seedDataContent.includes(`${col}: [`),
          `PROJECT_SEED_DATA must contain an entry for ${col}`
        );
      }

      // Check specific rich seed items
      assert.ok(seedDataContent.includes('cmp_welcome_2026'), 'Must contain seed campaign cmp_welcome_2026');
      assert.ok(seedDataContent.includes('cmp_summer_promo'), 'Must contain seed campaign cmp_summer_promo');
      assert.ok(seedDataContent.includes('tpl_welcome_modern'), 'Must contain seed template tpl_welcome_modern');
      assert.ok(seedDataContent.includes('tpl_promo_bento'), 'Must contain seed template tpl_promo_bento');
      assert.ok(seedDataContent.includes('aut_new_lead_journey'), 'Must contain seed automation aut_new_lead_journey');
      assert.ok(seedDataContent.includes('log_1001'), 'Must contain seed log log_1001');
      assert.ok(seedDataContent.includes('log_1002'), 'Must contain seed log log_1002');
      assert.ok(seedDataContent.includes('log_1003'), 'Must contain seed log log_1003');
    });

    test('1.4 - Module config KOSUN_AM_COLLECTIONS matches exact collection names', () => {
      const kosunConfigContent = fs.readFileSync(path.resolve('src/modules/kosun-am/config/index.ts'), 'utf8');
      assert.ok(kosunConfigContent.includes("CAMPAIGNS: 'mod_kosun_am_campaigns'"));
      assert.ok(kosunConfigContent.includes("TEMPLATES: 'mod_kosun_am_templates'"));
      assert.ok(kosunConfigContent.includes("AUTOMATIONS: 'mod_kosun_am_automations'"));
      assert.ok(kosunConfigContent.includes("LOGS: 'mod_kosun_am_logs'"));
    });
  });

  // =========================================================================
  // Challenge 2: Scoped Multi-Tenant Isolation & Zero Mock Data Fallback
  // =========================================================================
  describe('Challenge 2: Scoped Multi-Tenant Isolation & Zero Mock Data Fallback', () => {
    const firestoreSvcContent = fs.readFileSync(
      path.resolve('src/modules/kosun-am/services/emailFirestoreService.ts'),
      'utf8'
    );

    test('2.1 - EmailFirestoreService path derivation strictly scopes under tenants/{tenantId}/', () => {
      assert.ok(
        firestoreSvcContent.includes("return `tenants/${this.tenantId}/${collectionName}`;"),
        'getScopedPath must strictly format tenants/${this.tenantId}/${collectionName}'
      );
      assert.ok(
        firestoreSvcContent.includes("collection(this.db, 'tenants', this.tenantId, collectionName)"),
        'Direct getRef must scope under collection(this.db, "tenants", this.tenantId, collectionName)'
      );
      assert.ok(
        firestoreSvcContent.includes("doc(this.db, 'tenants', this.tenantId, KOSUN_AM_COLLECTIONS.CAMPAIGNS, id)"),
        'Campaign document references must be scoped to tenants/{tenantId}/mod_kosun_am_campaigns'
      );
    });

    test('2.2 - Tenant ID normalization handles whitespace, casing and fallback to _master', () => {
      assert.ok(
        firestoreSvcContent.includes("(tenantId || '').trim().toLowerCase() || '_master'"),
        'Tenant ID must be trimmed, lowercased, and default to _master'
      );
    });

    test('2.3 - When db is unavailable or error occurs, service returns [] or null (ZERO mock fallback)', () => {
      // Ensure no mock fallback references in emailFirestoreService.ts
      assert.strictEqual(
        firestoreSvcContent.includes('MOCK_CAMPAIGNS'),
        false,
        'emailFirestoreService.ts must NOT reference MOCK_CAMPAIGNS'
      );
      assert.strictEqual(
        firestoreSvcContent.includes('MOCK_TEMPLATES'),
        false,
        'emailFirestoreService.ts must NOT reference MOCK_TEMPLATES'
      );
      assert.strictEqual(
        firestoreSvcContent.includes('MOCK_AUTOMATIONS'),
        false,
        'emailFirestoreService.ts must NOT reference MOCK_AUTOMATIONS'
      );
      assert.strictEqual(
        firestoreSvcContent.includes('MOCK_LOGS'),
        false,
        'emailFirestoreService.ts must NOT reference MOCK_LOGS'
      );

      // Verify that failure handlers return []
      assert.ok(
        firestoreSvcContent.includes('return [];'),
        'getCampaigns/Templates/Automations/Logs must return [] on missing db or error'
      );
      assert.ok(
        firestoreSvcContent.includes('return null;'),
        'getCampaign/Template/Automation must return null on missing doc or error'
      );
    });
  });

  // =========================================================================
  // Challenge 3: Zero LocalStorage & Secure Credentials
  // =========================================================================
  describe('Challenge 3: Zero LocalStorage & Secure Credentials', () => {
    test('3.1 - Codebase audit: zero localStorage / sessionStorage calls in src/modules/kosun-am/ executable code', () => {
      const moduleDir = path.resolve('src/modules/kosun-am');

      function scanDir(dir: string): { file: string; match: string }[] {
        const violations: { file: string; match: string }[] = [];
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            violations.push(...scanDir(fullPath));
          } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            // Strip comments
            const codeOnly = content
              .replace(/\/\*[\s\S]*?\*\//g, '')
              .replace(/\/\/.*$/gm, '');

            if (/\blocalStorage\b/.test(codeOnly)) {
              violations.push({ file: fullPath, match: 'localStorage' });
            }
            if (/\bsessionStorage\b/.test(codeOnly)) {
              violations.push({ file: fullPath, match: 'sessionStorage' });
            }
          }
        }
        return violations;
      }

      const foundViolations = scanDir(moduleDir);
      assert.strictEqual(
        foundViolations.length,
        0,
        `Forbidden storage calls detected: ${JSON.stringify(foundViolations)}`
      );
    });

    test('3.2 - EmailDispatchService loads API keys strictly via tenantApiKeys.ts and checks entitlement', () => {
      const dispatchSvcContent = fs.readFileSync(
        path.resolve('src/modules/kosun-am/services/emailDispatchService.ts'),
        'utf8'
      );

      assert.ok(
        dispatchSvcContent.includes("from '../../../core/connection/tenantApiKeys'"),
        'Must import from tenantApiKeys'
      );
      assert.ok(
        dispatchSvcContent.includes('isModuleEntitled(this.moduleId)'),
        'Must verify isModuleEntitled'
      );
      assert.ok(
        dispatchSvcContent.includes('getModuleApiKeys(this.moduleId)'),
        'Must retrieve keys via getModuleApiKeys'
      );
      assert.ok(
        dispatchSvcContent.includes('לא הוגדרו מפתחות API עבור שליחת מיילים בטננט זה'),
        'Must return Hebrew error referencing missing tenant keys'
      );
    });
  });

  // =========================================================================
  // Challenge 4: EventBus Subscriptions, Publishing & Robustness
  // =========================================================================
  describe('Challenge 4: EventBus Subscriptions, Publishing & Robustness', () => {
    const contractsIndexContent = fs.readFileSync(
      path.resolve('src/core/contracts/index.ts'),
      'utf8'
    );
    const moduleContextContent = fs.readFileSync(
      path.resolve('src/modules/kosun-am/context/ModuleContext.tsx'),
      'utf8'
    );

    test('4.1 - CoreEventMap defines all required inbound and outbound email events', () => {
      assert.ok(contractsIndexContent.includes("'crm:lead:created': LeadPayload;"));
      assert.ok(contractsIndexContent.includes("'smart_form:submitted': {"));
      assert.ok(contractsIndexContent.includes("'campaign:ambassador:created': {"));
      assert.ok(contractsIndexContent.includes("'email:campaign:sent':"));
      assert.ok(contractsIndexContent.includes("'email:automation:triggered':"));
      assert.ok(contractsIndexContent.includes("'email:delivery:failed': {"));
    });

    test('4.2 - ModuleContext subscribes to all 3 inbound events and unregisters on unmount', () => {
      assert.ok(
        moduleContextContent.includes('KOSUN_AM_EVENT_TOPICS.CRM_LEAD_CREATED'),
        'Must subscribe to CRM_LEAD_CREATED'
      );
      assert.ok(
        moduleContextContent.includes('KOSUN_AM_EVENT_TOPICS.SMART_FORM_SUBMITTED'),
        'Must subscribe to SMART_FORM_SUBMITTED'
      );
      assert.ok(
        moduleContextContent.includes('KOSUN_AM_EVENT_TOPICS.AMBASSADOR_CREATED'),
        'Must subscribe to AMBASSADOR_CREATED'
      );

      // Verify unsubscription cleanup
      assert.ok(
        moduleContextContent.includes('unsubLead();'),
        'Cleanup must call unsubLead()'
      );
      assert.ok(
        moduleContextContent.includes('unsubForm();'),
        'Cleanup must call unsubForm()'
      );
      assert.ok(
        moduleContextContent.includes('unsubAmbassador();'),
        'Cleanup must call unsubAmbassador()'
      );
    });

    test('4.3 - ModuleContext publishes CAMPAIGN_SENT on success and DELIVERY_FAILED on failure', () => {
      assert.ok(
        moduleContextContent.includes('eventBus.publish(KOSUN_AM_EVENT_TOPICS.CAMPAIGN_SENT,'),
        'Must publish CAMPAIGN_SENT on success'
      );
      assert.ok(
        moduleContextContent.includes('eventBus.publish(KOSUN_AM_EVENT_TOPICS.DELIVERY_FAILED,'),
        'Must publish DELIVERY_FAILED on failure'
      );
      assert.ok(
        moduleContextContent.includes('eventBus.publish(KOSUN_AM_EVENT_TOPICS.AUTOMATION_TRIGGERED,'),
        'Must publish AUTOMATION_TRIGGERED when trigger matches'
      );
    });

    test('4.4 - HostCapabilities registers email-dispatcher and unregisters on unmount', () => {
      assert.ok(
        moduleContextContent.includes("hostCapabilities.registerCapability('email-dispatcher',"),
        'Must register email-dispatcher capability'
      );
      assert.ok(
        moduleContextContent.includes("hostCapabilities.unregisterCapability('email-dispatcher')"),
        'Must unregister email-dispatcher on unmount'
      );
    });
  });

  // =========================================================================
  // Challenge 5: Persona Language, RTL & Zero Textual Emojis
  // =========================================================================
  describe('Challenge 5: Persona Language, RTL & Zero Textual Emojis', () => {
    test('5.1 - Zero textual emojis in all module component files', () => {
      const componentsDir = path.resolve('src/modules/kosun-am/components');
      const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

      const violations: { file: string; char: string }[] = [];
      const files = fs.readdirSync(componentsDir);
      for (const file of files) {
        if (/\.(tsx|ts)$/.test(file)) {
          const content = fs.readFileSync(path.join(componentsDir, file), 'utf8');
          const match = emojiRegex.exec(content);
          if (match) {
            violations.push({ file, char: match[0] });
          }
        }
      }

      assert.strictEqual(
        violations.length,
        0,
        `Textual emojis found in components: ${JSON.stringify(violations)}`
      );
    });

    test('5.2 - Official Living Persona naming compliance: Kosun / קושאן', () => {
      const configContent = fs.readFileSync(path.resolve('src/modules/kosun-am/config/index.ts'), 'utf8');
      assert.ok(
        configContent.includes("KOSUN_AM_DISPLAY_NAME_HE = 'קושאן מייל אוטומטי'"),
        'Hebrew display name must be "קושאן מייל אוטומטי"'
      );
      assert.ok(
        configContent.includes("KOSUN_AM_DISPLAY_NAME_EN = 'KOSUN AM'"),
        'English display name must be "KOSUN AM"'
      );
      assert.ok(
        configContent.includes("KOSUN_AM_COLLECTION_PREFIX = 'mod_kosun_am_'"),
        'Collection prefix must be "mod_kosun_am_"'
      );
    });
  });
});
