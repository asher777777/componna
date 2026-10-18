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

/** Standard provisioned modules enabled by default for subdomain tenants */
export const DEFAULT_SUBDOMAIN_MODULES: string[] = [
  'KosSubscribed',
  'KosTube',
  'kosun-board-composer',
  'kosun-am',
  'kosai-engine',
  'KosBranding',
  'kesher-payments-hub',
  'KosWhatsUp',
  'KosTogether',
  'ksf',
  'video-producer-studio',
  'client-platform',
  'crm-analytics',
  'KosWebAi',
  'flow-player-engine',
  'media-gallery-hub',
  'ambassador-campaigns-hub',
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
 * Builds canonical URL to a tenant's admin dashboard:
 * - On local development (localhost / 127.0.0.1): `/?tenant=xyz`
 * - In production: `https://xyz.kosun.pro/brand-dna` (or custom fullDomain) - 100% clean, zero noisy query params
 */
export function buildTenantAdminUrl(subdomain: string, fullDomain?: string): string {
  if (!subdomain) return '/';
  const cleanSub = subdomain.trim().toLowerCase();
  if (cleanSub === ROOT_TENANT_ID) return '/dashboard';

  const isLocal = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.endsWith('.local')
  );

  if (isLocal) {
    return `/?tenant=${encodeURIComponent(cleanSub)}`;
  }

  const domain = fullDomain ? fullDomain.trim().toLowerCase() : `${cleanSub}.kosun.pro`;
  return `https://${domain}/brand-dna`;
}

/**
 * Builds canonical URL to a tenant's public landing page:
 * - On local development (localhost / 127.0.0.1): `/?tenant=xyz&mode=public`
 * - In production: `https://xyz.kosun.pro/` (or custom fullDomain)
 */
export function buildTenantPublicUrl(subdomain: string, fullDomain?: string): string {
  if (!subdomain) return '/';
  const cleanSub = subdomain.trim().toLowerCase();
  if (cleanSub === ROOT_TENANT_ID) return '/';

  const isLocal = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.endsWith('.local')
  );

  if (isLocal) {
    return `/?tenant=${encodeURIComponent(cleanSub)}&mode=public`;
  }

  const domain = fullDomain ? fullDomain.trim().toLowerCase() : `${cleanSub}.kosun.pro`;
  return `https://${domain}/`;
}

/**
 * Extracts tenant identifier based on production hostname:
 * - `subdomain.domain.com` -> `subdomain`
 * - `kosun.pro` / `www.kosun.pro` / `compona.web.app` -> `_master`
 * - `localhost` / `127.0.0.1` -> checks URL query `?tenant=X` during dev, default `_master`
 */
export function resolveCurrentTenantId(): string {
  if (typeof window === 'undefined') {
    return ROOT_TENANT_ID;
  }

  const hostname = window.location.hostname.toLowerCase().trim();
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local');

  // 1. On localhost only: allow URL query parameter override for local development
  if (isLocal) {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const queryTenant = searchParams.get('tenant');
      if (queryTenant !== null) {
        const cleanQuery = queryTenant.trim().toLowerCase();
        if (cleanQuery && cleanQuery !== ROOT_TENANT_ID && !RESERVED_TENANT_SUBDOMAINS.includes(cleanQuery)) {
          try {
            sessionStorage.setItem('kosun_active_tenant_id', cleanQuery);
            localStorage.setItem('kosun_active_tenant_id', cleanQuery);
          } catch {}
          return cleanQuery;
        } else if (cleanQuery === ROOT_TENANT_ID || cleanQuery === '') {
          try {
            sessionStorage.removeItem('kosun_active_tenant_id');
            localStorage.removeItem('kosun_active_tenant_id');
          } catch {}
          return ROOT_TENANT_ID;
        }
      }

      // Check stored active tenant on localhost across inner route navigations
      try {
        const stored = sessionStorage.getItem('kosun_active_tenant_id') || localStorage.getItem('kosun_active_tenant_id');
        if (stored && stored.trim() && stored !== ROOT_TENANT_ID && !RESERVED_TENANT_SUBDOMAINS.includes(stored.trim().toLowerCase())) {
          return stored.trim().toLowerCase();
        }
      } catch {}

      // If no explicit tenant on localhost, default to ROOT_TENANT_ID (_master)
      return ROOT_TENANT_ID;
    } catch {}
  }

  // 2. Resolve from actual Hostname (Production or Local Subdomain)
  const extracted = extractSubdomainFromHost(hostname);
  if (extracted) {
    return extracted;
  }

  // 3. For Root Platform host (kosun.pro, compona.web.app, etc.):
  if (isRootPlatformHost(hostname)) {
    try {
      const storedTenant = localStorage.getItem('kosun_active_tenant_id');
      if (storedTenant && storedTenant !== ROOT_TENANT_ID && !isLocal) {
        localStorage.removeItem('kosun_active_tenant_id');
      }
    } catch {}
    return ROOT_TENANT_ID;
  }

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
