/**
 * Tenant-Scoped API Keys Registry (מאגר מפתחות API לפי טננט)
 *
 * Single Source of Truth for all secret integration keys (AI / Gemini, Kesher clearing,
 * GREEN-API WhatsApp, HeyGen, etc.).
 *
 * Storage (Firestore only – NO localStorage / NO import.meta.env fallbacks):
 *   tenants/{tenantId}/settings/api_keys
 *
 * Resolution rules:
 *   - Root tenant (`_master`, main domain path)  → always uses `tenants/_master/settings/api_keys`.
 *   - Subdomain tenant                           → uses its OWN `tenants/{sub}/settings/api_keys`
 *                                                  ONLY for modules it purchased (tenants/{sub}.activeModules).
 *                                                  Non-purchased module → no keys (module is blocked).
 *
 * The in-memory state is hydrated in real-time by `SystemConnectionProvider` (onSnapshot),
 * so plain (non-React) services can read keys synchronously via `getModuleApiKeys(moduleId)`.
 */

import { ROOT_TENANT_ID } from '../tenant/tenantResolver';
import { SYSTEM_COLLECTIONS } from '../contracts/collections';

export interface SystemApiKeysConfig {
  googleAiApiKey?: string;
  geminiModel?: string;
  geminiImageModel?: string;
  geminiVideoModel?: string;
  heygenApiKey?: string;
  elevenLabsApiKey?: string;
  openaiApiKey?: string;
  whatsappApiToken?: string;
  greenApiInstanceId?: string;
  greenApiToken?: string;
  customWebhookUrl?: string;
  kesherUserName?: string;
  kesherApiKey?: string;
  kesherPaymentPageId?: string;
  kesherEzCountToken?: string;
  kesherDefaultReceiptType?: number;
  [key: string]: any;
}

/** Non-secret defaults (model names etc.). Secrets are always empty by default. */
export const DEFAULT_API_KEYS: SystemApiKeysConfig = {
  googleAiApiKey: '',
  geminiModel: 'gemini-3.8-flash',
  geminiImageModel: 'gemini-3.1-flash-image',
  geminiVideoModel: 'veo-3.1-generate-preview',
  heygenApiKey: '',
  elevenLabsApiKey: '',
  openaiApiKey: '',
  whatsappApiToken: '',
  greenApiInstanceId: '',
  greenApiToken: '',
  customWebhookUrl: '',
  kesherUserName: '',
  kesherApiKey: '',
  kesherPaymentPageId: '',
  kesherEzCountToken: '',
  kesherDefaultReceiptType: 405,
};

/** Firestore location of the keys document inside a tenant */
export const API_KEYS_SETTINGS_DOC_ID = 'api_keys';

export function getTenantApiKeysDocSegments(tenantId: string): [string, string, string, string] {
  return ['tenants', tenantId || ROOT_TENANT_ID, SYSTEM_COLLECTIONS.SETTINGS, API_KEYS_SETTINGS_DOC_ID];
}

/** Legacy local storage keys – purged on startup (keys are never stored locally anymore) */
export const LEGACY_LOCAL_API_KEY_ENTRIES = [
  'kosun_system_apikeys_config',
  'googleAiApiKey',
  'geminiApiKey',
  'gemini_api_key',
];

export function purgeLegacyLocalApiKeys(): void {
  try {
    LEGACY_LOCAL_API_KEY_ENTRIES.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

/** Legacy purchase IDs → canonical module IDs */
const MODULE_ID_ALIASES: Record<string, string> = {
  'video-producer': 'video-producer-studio',
  'flow-player': 'flow-player-engine',
  'whatsapp-hub': 'whatsapp-green-api-hub',
  'kesher-payments': 'kesher-payments-hub',
  'smart-forms': 'smart-form-builder',
  'crm-groups': 'crm-groups-hub',
  'brand-dna': 'brand-dna-hub',
  'campaigns-hub': 'ambassador-campaigns-hub',
  'ambassador-campaigns': 'ambassador-campaigns-hub',
};

export function normalizeModuleId(id: string): string {
  const clean = (id || '').trim().toLowerCase();
  return MODULE_ID_ALIASES[clean] || clean;
}

/** Route prefix → module ID (used to detect the currently active module) */
const ROUTE_TO_MODULE: Array<[string, string]> = [
  ['/control-center', 'control-center-hub'],
  ['/saas-storefront', 'saas-storefront-composer'],
  ['/brand-dna', 'brand-dna-hub'],
  ['/kesher-payments', 'kesher-payments-hub'],
  ['/whatsapp-hub', 'whatsapp-green-api-hub'],
  ['/crm-groups', 'crm-groups-hub'],
  ['/campaigns-hub', 'ambassador-campaigns-hub'],
  ['/ambassador-campaigns', 'ambassador-campaigns-hub'],
  ['/smart-forms', 'smart-form-builder'],
  ['/video-producer', 'video-producer-studio'],
  ['/db-connector', 'db-connector-hub'],
  ['/client-platform', 'client-platform'],
  ['/crm-analytics', 'crm-analytics'],
  ['/page-builder', 'page-builder'],
  ['/auth-portal', 'auth-portal'],
  ['/flow-player-engine', 'flow-player-engine'],
  ['/media-gallery-hub', 'media-gallery-hub'],
  ['/db-collections', 'db-collections-hub'],
  ['/template', 'template'],
];

export function resolveModuleIdFromPath(pathname: string): string | undefined {
  const path = (pathname || '').toLowerCase();
  const hit = ROUTE_TO_MODULE.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`));
  return hit?.[1];
}

// ---------------------------------------------------------------------------
// In-memory state (hydrated by SystemConnectionProvider)
// ---------------------------------------------------------------------------

interface TenantApiKeysState {
  tenantId: string;
  isRootTenant: boolean;
  /** Raw keys of the current tenant (tenants/{tenantId}/settings/api_keys) */
  tenantKeys: SystemApiKeysConfig;
  /** Canonical module IDs purchased by the current tenant (subdomain only) */
  purchasedModules: string[];
  /** Module currently on screen (derived from route) */
  activeModuleId?: string;
  loaded: boolean;
}

let state: TenantApiKeysState = {
  tenantId: ROOT_TENANT_ID,
  isRootTenant: true,
  tenantKeys: { ...DEFAULT_API_KEYS },
  purchasedModules: [],
  activeModuleId: undefined,
  loaded: false,
};

type Listener = () => void;
const listeners = new Set<Listener>();

export function updateTenantApiKeysState(patch: Partial<TenantApiKeysState>): void {
  const next = { ...state, ...patch };
  if (patch.purchasedModules) {
    next.purchasedModules = Array.from(new Set(patch.purchasedModules.map(normalizeModuleId)));
  }
  if (patch.tenantId !== undefined) {
    next.isRootTenant = patch.tenantId === ROOT_TENANT_ID;
  }
  state = next;
  listeners.forEach((l) => {
    try { l(); } catch {}
  });
}

export function subscribeTenantApiKeys(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTenantApiKeysState(): Readonly<TenantApiKeysState> {
  return state;
}

export interface ApiKeysResolutionInput {
  isRootTenant: boolean;
  tenantKeys: SystemApiKeysConfig;
  purchasedModules: string[];
  activeModuleId?: string;
}

/** Pure entitlement check (shared by React context + plain services) */
export function isModuleEntitledFor(input: ApiKeysResolutionInput, moduleId?: string): boolean {
  if (input.isRootTenant) return true;
  const target = moduleId ? normalizeModuleId(moduleId) : input.activeModuleId;
  if (!target) return false;
  return input.purchasedModules.includes(target);
}

/** Pure resolver: keys a module may use for the given tenant state */
export function resolveApiKeysFor(input: ApiKeysResolutionInput, moduleId?: string): SystemApiKeysConfig {
  if (!isModuleEntitledFor(input, moduleId)) {
    // Not entitled → secrets stripped, only non-secret model defaults kept
    return {
      ...DEFAULT_API_KEYS,
      geminiModel: input.tenantKeys.geminiModel || DEFAULT_API_KEYS.geminiModel,
      geminiImageModel: input.tenantKeys.geminiImageModel || DEFAULT_API_KEYS.geminiImageModel,
      geminiVideoModel: input.tenantKeys.geminiVideoModel || DEFAULT_API_KEYS.geminiVideoModel,
    };
  }
  return { ...DEFAULT_API_KEYS, ...input.tenantKeys };
}

/** Whether the current tenant is entitled to use keys for the given module */
export function isModuleEntitled(moduleId?: string): boolean {
  return isModuleEntitledFor(state, moduleId);
}

/**
 * Resolve the API keys a module is allowed to use.
 * @param moduleId Calling module ID (e.g. 'kesher-payments-hub'). Defaults to the active (on-screen) module.
 */
export function getModuleApiKeys(moduleId?: string): SystemApiKeysConfig {
  return resolveApiKeysFor(state, moduleId);
}

/** Convenience: resolved Google AI / Gemini key for a module ('' if none / not entitled) */
export function getModuleGeminiKey(moduleId?: string): string {
  return (getModuleApiKeys(moduleId).googleAiApiKey || '').trim();
}

/** Convenience: resolved GREEN-API credentials for a module */
export function getModuleGreenApiCredentials(moduleId?: string): { instanceId: string; token: string } {
  const keys = getModuleApiKeys(moduleId);
  return {
    instanceId: (keys.greenApiInstanceId || '').trim(),
    token: (keys.greenApiToken || '').trim(),
  };
}
