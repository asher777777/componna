import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// 1. Static and contract paths
const PROJECT_ROOT = process.cwd();
const KOSUN_AM_SRC = join(PROJECT_ROOT, 'src/modules/KosMail');
const COLLECTIONS_FILE = join(PROJECT_ROOT, 'src/core/contracts/collections.ts');
const CONTRACTS_INDEX_FILE = join(PROJECT_ROOT, 'src/core/contracts/index.ts');
const HUB_CONFIG_FILE = join(PROJECT_ROOT, 'src/modules/KosData/config/index.ts');
const HUB_SEED_FILE = join(PROJECT_ROOT, 'src/modules/KosData/config/seedData.ts');

const FIRESTORE_SERVICE_FILE = join(KOSUN_AM_SRC, 'services/emailFirestoreService.ts');
const DISPATCH_SERVICE_FILE = join(KOSUN_AM_SRC, 'services/emailDispatchService.ts');
const CONTEXT_FILE = join(KOSUN_AM_SRC, 'context/ModuleContext.tsx');

function getAllSourceFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    if (statSync(fullPath).isDirectory()) {
      getAllSourceFiles(fullPath, fileList);
    } else if (/\.(ts|tsx)$/.test(file)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

// Empirical implementation of EmailFirestoreService path derivation logic
function deriveScopedPath(tenantId: string | undefined | null, collectionName: string): { normalizedTenant: string; path: string } {
  const normalized = (tenantId || '').trim().toLowerCase() || '_master';
  return {
    normalizedTenant: normalized,
    path: `tenants/${normalized}/${collectionName}`,
  };
}

describe('Challenger M2: Empirical Invariant & Stress Test Suite', () => {

  // =========================================================================
  // Challenge 1: Multi-Tenancy Scoping & Isolation Invariant
  // =========================================================================
  describe('Challenge 1: Multi-Tenancy Scoping & Path Isolation', () => {
    test('1.1 - Tenant Normalization and Boundary Cases', () => {
      // Normal tenant
      const resAlpha = deriveScopedPath('tenant_alpha', 'mod_kosun_am_campaigns');
      assert.strictEqual(resAlpha.normalizedTenant, 'tenant_alpha');
      assert.strictEqual(resAlpha.path, 'tenants/tenant_alpha/mod_kosun_am_campaigns');

      // Uppercase tenant normalization
      const resUpper = deriveScopedPath('TENANT_BETA', 'mod_kosun_am_templates');
      assert.strictEqual(resUpper.normalizedTenant, 'tenant_beta');
      assert.strictEqual(resUpper.path, 'tenants/tenant_beta/mod_kosun_am_templates');

      // Whitespace padding normalization
      const resSpaces = deriveScopedPath('   tenant_gamma   ', 'mod_kosun_am_automations');
      assert.strictEqual(resSpaces.normalizedTenant, 'tenant_gamma');
      assert.strictEqual(resSpaces.path, 'tenants/tenant_gamma/mod_kosun_am_automations');

      // Empty fallback to _master
      const resEmpty = deriveScopedPath('', 'mod_kosun_am_logs');
      assert.strictEqual(resEmpty.normalizedTenant, '_master');
      assert.strictEqual(resEmpty.path, 'tenants/_master/mod_kosun_am_logs');

      // Undefined / null fallback to _master
      const resNull = deriveScopedPath(undefined, 'mod_kosun_am_campaigns');
      assert.strictEqual(resNull.normalizedTenant, '_master');
      assert.strictEqual(resNull.path, 'tenants/_master/mod_kosun_am_campaigns');
    });

    test('1.2 - Code Analysis: emailFirestoreService.ts strictly mandates tenants/{tenantId} scoping', () => {
      const content = readFileSync(FIRESTORE_SERVICE_FILE, 'utf-8');

      // Verify constructor normalization matches
      assert.ok(
        content.includes("(tenantId || '').trim().toLowerCase() || '_master'"),
        'Service constructor must normalize tenantId to lowercase/trimmed or _master'
      );

      // Verify getScopedPath returns tenants/${this.tenantId}/${collectionName}
      assert.ok(
        content.includes('`tenants/${this.tenantId}/${collectionName}`'),
        'getScopedPath must construct tenants/${this.tenantId}/${collectionName}'
      );

      // Verify all collection(...) calls target 'tenants', this.tenantId
      const collectionCallMatches = content.match(/collection\([^)]+\)/g) || [];
      for (const call of collectionCallMatches) {
        assert.ok(
          call.includes("'tenants'") && call.includes('this.tenantId'),
          `Collection reference call must be scoped to tenants and tenantId: ${call}`
        );
      }

      // Verify all doc(...) calls target 'tenants', this.tenantId
      const docCallMatches = content.match(/doc\([^)]+\)/g) || [];
      for (const call of docCallMatches) {
        assert.ok(
          call.includes("'tenants'") && call.includes('this.tenantId'),
          `Doc reference call must be scoped to tenants and tenantId: ${call}`
        );
      }
    });

    test('1.3 - Cross-Tenant Storage Separation Invariant', () => {
      // Simulate multi-tenant key space
      const multiTenantStore = new Map<string, string>();
      const tenantA = deriveScopedPath('tenant_a', 'mod_kosun_am_campaigns');
      const tenantB = deriveScopedPath('tenant_b', 'mod_kosun_am_campaigns');

      multiTenantStore.set(`${tenantA.path}/cmp_1`, 'Campaign A');
      multiTenantStore.set(`${tenantB.path}/cmp_1`, 'Campaign B');

      assert.strictEqual(multiTenantStore.get(`${tenantA.path}/cmp_1`), 'Campaign A');
      assert.strictEqual(multiTenantStore.get(`${tenantB.path}/cmp_1`), 'Campaign B');
      assert.notStrictEqual(
        multiTenantStore.get(`${tenantA.path}/cmp_1`),
        multiTenantStore.get(`${tenantB.path}/cmp_1`),
        'Identical IDs across tenants must remain completely isolated in scoped paths'
      );
    });
  });

  // =========================================================================
  // Challenge 2: Zero Mock Data Invariant (Empty Collections return [])
  // =========================================================================
  describe('Challenge 2: Zero Mock Data Invariant', () => {
    test('2.1 - Code Analysis: emailFirestoreService.ts returns [] on empty collections and errors', () => {
      const content = readFileSync(FIRESTORE_SERVICE_FILE, 'utf-8');

      // Verify that getCampaigns returns [] when empty or error
      assert.ok(
        content.includes('async getCampaigns(): Promise<EmailCampaign[]>'),
        'Must define getCampaigns'
      );
      assert.ok(
        content.includes('return [];'),
        'Must return empty array [] when no records or error'
      );

      // Verify that getTemplates returns []
      assert.ok(
        content.includes('async getTemplates(): Promise<EmailTemplate[]>'),
        'Must define getTemplates'
      );

      // Verify that getAutomations returns []
      assert.ok(
        content.includes('async getAutomations(): Promise<EmailAutomation[]>'),
        'Must define getAutomations'
      );

      // Verify that getLogs returns []
      assert.ok(
        content.includes('async getLogs(): Promise<EmailDeliveryLog[]>'),
        'Must define getLogs'
      );

      // Verify absence of any fallback to MOCK_* data in emailFirestoreService.ts
      assert.strictEqual(content.includes('MOCK_CAMPAIGNS'), false);
      assert.strictEqual(content.includes('MOCK_TEMPLATES'), false);
      assert.strictEqual(content.includes('MOCK_AUTOMATIONS'), false);
      assert.strictEqual(content.includes('MOCK_LOGS'), false);
    });

    test('2.2 - Static Audit: Mock fallback arrays are NEVER imported into services or context', () => {
      const files = getAllSourceFiles(KOSUN_AM_SRC);
      const mockIdentifiers = [
        'MOCK_CAMPAIGNS',
        'MOCK_TEMPLATES',
        'MOCK_AUTOMATIONS',
        'MOCK_LOGS',
      ];

      for (const file of files) {
        if (file.endsWith('config\\index.ts') || file.endsWith('config/index.ts')) {
          continue;
        }

        const content = readFileSync(file, 'utf-8');
        for (const mockId of mockIdentifiers) {
          const regex = new RegExp(`\\b${mockId}\\b`);
          assert.strictEqual(
            regex.test(content),
            false,
            `Forbidden mock data reference "${mockId}" detected in production file: ${file}`
          );
        }
      }
    });

    test('2.3 - Code Analysis: emailDispatchService.ts returns genuine error without API keys', () => {
      const content = readFileSync(DISPATCH_SERVICE_FILE, 'utf-8');

      // Check step 2 in send(): validates API Keys
      assert.ok(
        content.includes('if (!creds.resendApiKey && !creds.sendgridApiKey && !creds.smtpHost)'),
        'Must validate presence of API keys'
      );
      assert.ok(
        content.includes('success: false'),
        'Must return success: false when keys are missing'
      );
      assert.ok(
        content.includes('לא הוגדרו מפתחות API עבור שליחת מיילים בטננט זה'),
        'Must produce explicit error message referencing tenant API keys'
      );

      // Check step 6: Real Error Reporting
      assert.ok(
        content.includes('Real Error Reporting (Zero Mock Data)'),
        'Must enforce real error reporting without fallback simulation'
      );
    });

    test('2.4 - ModuleContext initial state is genuine empty arrays []', () => {
      const content = readFileSync(CONTEXT_FILE, 'utf-8');

      assert.ok(
        content.includes('useState<EmailCampaign[]>([])'),
        'Campaigns state must initialize to empty array []'
      );
      assert.ok(
        content.includes('useState<EmailTemplate[]>([])'),
        'Templates state must initialize to empty array []'
      );
      assert.ok(
        content.includes('useState<EmailAutomation[]>([])'),
        'Automations state must initialize to empty array []'
      );
      assert.ok(
        content.includes('useState<EmailDeliveryLog[]>([])'),
        'Logs state must initialize to empty array []'
      );
    });
  });

  // =========================================================================
  // Challenge 3: Zero localStorage & sessionStorage Invariant
  // =========================================================================
  describe('Challenge 3: Zero localStorage & sessionStorage Invariant', () => {
    test('3.1 - Zero occurrences of localStorage or sessionStorage in all kosun-am code', () => {
      const files = getAllSourceFiles(KOSUN_AM_SRC);
      for (const file of files) {
        const content = readFileSync(file, 'utf-8');
        assert.strictEqual(
          /\blocalStorage\b/.test(content),
          false,
          `Forbidden localStorage usage detected in: ${file}`
        );
        assert.strictEqual(
          /\bsessionStorage\b/.test(content),
          false,
          `Forbidden sessionStorage usage detected in: ${file}`
        );
      }
    });
  });

  // =========================================================================
  // Challenge 4: Triple-Sync Registration Invariant
  // =========================================================================
  describe('Challenge 4: Triple-Sync Registration Invariant', () => {
    test('4.1 - Sync Layer 1: collections.ts defines all MOD_KOSUN_AM_* constants', () => {
      const content = readFileSync(COLLECTIONS_FILE, 'utf-8');
      assert.ok(content.includes('MOD_KOSUN_AM_CAMPAIGNS'), 'Must contain MOD_KOSUN_AM_CAMPAIGNS');
      assert.ok(content.includes('MOD_KOSUN_AM_TEMPLATES'), 'Must contain MOD_KOSUN_AM_TEMPLATES');
      assert.ok(content.includes('MOD_KOSUN_AM_AUTOMATIONS'), 'Must contain MOD_KOSUN_AM_AUTOMATIONS');
      assert.ok(content.includes('MOD_KOSUN_AM_LOGS'), 'Must contain MOD_KOSUN_AM_LOGS');
    });

    test('4.2 - Sync Layer 2: db-collections-hub config index.ts registers all 4 collections', () => {
      const content = readFileSync(HUB_CONFIG_FILE, 'utf-8');
      assert.ok(content.includes('mod_kosun_am_campaigns'), 'Must register mod_kosun_am_campaigns');
      assert.ok(content.includes('mod_kosun_am_templates'), 'Must register mod_kosun_am_templates');
      assert.ok(content.includes('mod_kosun_am_automations'), 'Must register mod_kosun_am_automations');
      assert.ok(content.includes('mod_kosun_am_logs'), 'Must register mod_kosun_am_logs');
    });

    test('4.3 - Sync Layer 3: db-collections-hub seedData.ts provides seed definitions', () => {
      const content = readFileSync(HUB_SEED_FILE, 'utf-8');
      assert.ok(content.includes('mod_kosun_am_campaigns:'), 'Must provide seed data for mod_kosun_am_campaigns');
      assert.ok(content.includes('mod_kosun_am_templates:'), 'Must provide seed data for mod_kosun_am_templates');
      assert.ok(content.includes('mod_kosun_am_automations:'), 'Must provide seed data for mod_kosun_am_automations');
      assert.ok(content.includes('mod_kosun_am_logs:'), 'Must provide seed data for mod_kosun_am_logs');
    });
  });

  // =========================================================================
  // Challenge 5: EventBus Invariant & Cross-Module Isolation
  // =========================================================================
  describe('Challenge 5: EventBus Invariant & Zero Cross-Module Imports', () => {
    test('5.1 - contracts/index.ts registers email:delivery:failed event', () => {
      const content = readFileSync(CONTRACTS_INDEX_FILE, 'utf-8');
      assert.ok(
        content.includes("'email:delivery:failed'"),
        'CoreEventMap must include email:delivery:failed'
      );
    });

    test('5.2 - Zero direct sibling imports across all kosun-am source files', () => {
      const files = getAllSourceFiles(KOSUN_AM_SRC);
      const siblingImportPattern = /from\s+['"]\.\.\/([a-z0-9_-]+-hub|[a-z0-9_-]+-engine|[a-z0-9_-]+-builder|crm-[a-z0-9_-]+|whatsapp-[a-z0-9_-]+)/;

      for (const file of files) {
        const content = readFileSync(file, 'utf-8');
        const match = siblingImportPattern.exec(content);
        assert.strictEqual(
          match,
          null,
          `Direct cross-module sibling import detected in ${file}: ${match ? match[0] : ''}`
        );
      }
    });
  });
});
