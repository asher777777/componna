/**
 * Production Multi-Tenant Resolver (מחלץ ומפענח טננט לפרודקשן)
 * 
 * Accurately extracts the active tenant ID from window.location.hostname
 * Supporting custom subdomains (e.g. client1.kosun.pro -> "client1"),
 * apex domains (e.g. kosun.pro -> "_master"), and localhost test fallbacks.
 */

export const ROOT_TENANT_ID = '_master';

export const RESERVED_TENANT_SUBDOMAINS = [
  'www', 'app', 'api', 'admin', 'system', 'sys', 'mail', 'mall', 'hub', 'dashboard', 'control', 'auth', 'login', 'store', 'shop'
];

/**
 * Extracts tenant identifier based on production hostname:
 * - `subdomain.domain.com` -> `subdomain`
 * - `domain.com` / `www.domain.com` -> `_master`
 * - `localhost` / `127.0.0.1` -> checks URL query `?tenant=X` or localStorage override, default `_master`
 */
export function resolveCurrentTenantId(): string {
  if (typeof window === 'undefined') {
    return ROOT_TENANT_ID;
  }

  // 1. Allow URL query parameter override for easy testing (?tenant=abc)
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const queryTenant = searchParams.get('tenant');
    if (queryTenant && queryTenant.trim()) {
      return queryTenant.trim().toLowerCase();
    }
  } catch {}

  // 2. Allow stored manual override (Workbench mode)
  try {
    const storedTenant = localStorage.getItem('comona_active_tenant_id');
    if (storedTenant && storedTenant.trim()) {
      return storedTenant.trim().toLowerCase();
    }
  } catch {}

  // 3. Resolve from actual Hostname (Production Subdomain)
  const hostname = window.location.hostname.toLowerCase().trim();

  // If localhost, default to root tenant unless configured
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local')) {
    return ROOT_TENANT_ID;
  }

  const parts = hostname.split('.');

  // e.g., "demo.kosun.pro" -> parts: ["demo", "kosun", "pro"]
  if (parts.length > 2) {
    const sub = parts[0];
    if (!RESERVED_TENANT_SUBDOMAINS.includes(sub)) {
      return sub;
    }
  }

  // Root / Apex Domain (e.g. kosun.pro)
  return ROOT_TENANT_ID;
}

/**
 * Build tenant-scoped Firestore collection path:
 * Pattern: `tenants/{tenantId}/{collectionName}`
 */
export function getTenantCollectionPath(collectionName: string, customTenantId?: string): string {
  const tenantId = customTenantId || resolveCurrentTenantId();
  return `tenants/${tenantId}/${collectionName}`;
}

/**
 * Build tenant-scoped Cloud Storage file path:
 * Pattern: `tenants/{tenantId}/{folder}/{filename}`
 */
export function getTenantStoragePath(folder: string, fileName: string, customTenantId?: string): string {
  const tenantId = customTenantId || resolveCurrentTenantId();
  const safeName = fileName.replace(/[\\/:*?"<>|]/g, '_').trim();
  return `tenants/${tenantId}/${folder}/${safeName}`;
}

/**
 * Build tenant-scoped LocalStorage key:
 * Pattern: `comona_{tenantId}_{key}`
 */
export function getTenantStorageKey(key: string, customTenantId?: string): string {
  const tenantId = customTenantId || resolveCurrentTenantId();
  return `comona_${tenantId}_${key}`;
}
