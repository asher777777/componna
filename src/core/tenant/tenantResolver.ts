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

/** Hosting hostnames that always represent the main platform path (root tenant) */
export const ROOT_PLATFORM_HOST_PREFIXES = ['kosun', 'glowmanage', 'compona', 'comona', 'aioffice'];

/**
 * Checks whether the current hostname represents the primary platform (root tenant _master)
 */
export function isRootPlatformHost(hostname: string): boolean {
  if (!hostname) return true;
  const h = hostname.toLowerCase().trim();

  // 1. Localhost and development domains
  if (h === 'localhost' || h === '127.0.0.1' || h.endsWith('.local')) {
    return true;
  }

  // Support local subdomains (e.g. client1.localhost)
  if (h.endsWith('.localhost')) {
    const parts = h.split('.');
    if (parts.length >= 2 && !RESERVED_TENANT_SUBDOMAINS.includes(parts[0])) {
      return false;
    }
    return true;
  }

  // 2. Known root platform brand / project names
  if (ROOT_PLATFORM_HOST_PREFIXES.some((p) => h.startsWith(p))) {
    // If it's a direct project hosting (e.g. compona.web.app or kosun.pro or glowmanage.web.app)
    const parts = h.split('.');
    if (h.endsWith('.web.app') || h.endsWith('.firebaseapp.com')) {
      return parts.length <= 3;
    }
    // Apex domain or reserved subdomain (e.g. kosun.pro, www.kosun.pro)
    if (parts.length <= 2 || (parts.length === 3 && RESERVED_TENANT_SUBDOMAINS.includes(parts[0]))) {
      return true;
    }
  }

  // 3. Firebase Hosting root project sites (*.web.app or *.firebaseapp.com)
  if (h.endsWith('.web.app') || h.endsWith('.firebaseapp.com')) {
    const parts = h.split('.');
    // Standard site root (e.g. compona.web.app) has exactly 3 parts: site + web + app
    if (parts.length <= 3) {
      return true;
    }
  }

  // 4. Standard Apex domains with 2 parts (e.g. kosun.pro, compona.com)
  const parts = h.split('.');
  if (parts.length <= 2) {
    return true;
  }

  // 5. Reserved subdomains on apex domains (e.g. www.kosun.pro)
  if (parts.length === 3 && RESERVED_TENANT_SUBDOMAINS.includes(parts[0])) {
    return true;
  }

  return false;
}

/**
 * Extracts custom tenant subdomain from hostname if present, or null if on root platform
 */
export function extractSubdomainFromHost(hostname: string): string | null {
  if (!hostname) return null;
  const h = hostname.toLowerCase().trim();

  if (isRootPlatformHost(h)) {
    return null;
  }

  const parts = h.split('.');

  // On local development: e.g. client1.localhost
  if (h.endsWith('.localhost') && parts.length >= 2) {
    const sub = parts[0];
    if (!RESERVED_TENANT_SUBDOMAINS.includes(sub)) {
      return sub;
    }
    return null;
  }

  // On Firebase Hosting, subdomains require 4 parts: e.g. client1.compona.web.app
  if (h.endsWith('.web.app') || h.endsWith('.firebaseapp.com')) {
    if (parts.length > 3) {
      const sub = parts[0];
      if (!RESERVED_TENANT_SUBDOMAINS.includes(sub)) {
        return sub;
      }
    }
    return null;
  }

  // On custom domain: e.g. client1.kosun.pro (3 parts)
  if (parts.length > 2) {
    const sub = parts[0];
    if (!RESERVED_TENANT_SUBDOMAINS.includes(sub)) {
      return sub;
    }
  }

  return null;
}

/**
 * Extracts tenant identifier based on production hostname:
 * - `subdomain.domain.com` -> `subdomain`
 * - `domain.com` / `www.domain.com` / `compona.web.app` -> `_master`
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

  // 2. Resolve from actual Hostname (Production or Local Subdomain)
  const hostname = window.location.hostname.toLowerCase().trim();
  const extracted = extractSubdomainFromHost(hostname);
  if (extracted) {
    return extracted;
  }

  // 3. Allow stored manual override ONLY on root platform / Workbench mode
  try {
    const storedTenant = localStorage.getItem('kosun_active_tenant_id');
    if (storedTenant && storedTenant.trim()) {
      return storedTenant.trim().toLowerCase();
    }
  } catch {}

  // Root / Apex Domain
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
 * Pattern: `kosun_{tenantId}_{key}`
 */
export function getTenantStorageKey(key: string, customTenantId?: string): string {
  const tenantId = customTenantId || resolveCurrentTenantId();
  return `kosun_${tenantId}_${key}`;
}
