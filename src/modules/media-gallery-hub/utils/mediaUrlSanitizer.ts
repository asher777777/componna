import { MediaItem } from '../types';

export const SYSTEM_MAIN_STORAGE_BUCKET = 'glowmanage.firebasestorage.app';
export const LEGACY_VAULT_BUCKET = 'aioffice-1426f.firebasestorage.app';

/**
 * Checks if a URL is an alien or invalid blob URL.
 * An alien blob is a blob: URL originating from a different origin or localhost
 * while running on a different domain (e.g. blob:http://localhost:5173 on https://kosun.pro).
 */
export function isAlienBlobUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (!url.startsWith('blob:')) return false;
  if (typeof window === 'undefined') return true;

  try {
    const currentOrigin = window.location.origin;
    // If running on production (e.g. kosun.pro) and blob is from localhost/127.0.0.1
    if (!currentOrigin.includes('localhost') && !currentOrigin.includes('127.0.0.1')) {
      if (url.includes('localhost') || url.includes('127.0.0.1')) {
        return true;
      }
    }
    // If the blob URL does not match current window origin, browser blocks it
    return !url.startsWith(`blob:${currentOrigin}`);
  } catch {
    return true;
  }
}

/**
 * Normalizes and cleans corrupted or scrambled storage paths.
 * E.g. removes double timestamps or double vault prefixes.
 */
export function sanitizeVaultPath(path: string, tenantId?: string): string {
  if (tenantId && tenantId !== '_master') {
    if (path.startsWith(`tenants/${tenantId}/`)) return path;
    const clean = path.replace(/^(\/?sdo_media_vault\/)+/, '').replace(/^(\/?tenants\/[^/]+\/)+/, '');
    return `tenants/${tenantId}/media/${clean}`;
  }
  let clean = path.replace(/^(\/?sdo_media_vault\/)+/, 'sdo_media_vault/');
  if (!clean.startsWith('sdo_media_vault/') && !clean.startsWith('tenants/')) {
    clean = `sdo_media_vault/${clean}`;
  }
  // Remove duplicate concatenated timestamps like "1788..._1788..."
  clean = clean.replace(/(\d{13})_(\d{13})_/g, '$1_');
  return clean;
}

/**
 * Returns the customized public URL for media under https://kosun.pro or the tenant's custom subdomain.
 * E.g. https://kosun.pro/media/sdo_media_vault/123_file.jpg or https://mlea.kosun.pro/media/123_file.jpg
 */
export function getTenantPublicMediaUrl(item?: Partial<MediaItem>, preferredHost?: string): string {
  if (!item) return '';

  const tenantId = item.tenantId && item.tenantId !== '_master' ? item.tenantId : '';
  const currentHost = preferredHost || (typeof window !== 'undefined' ? window.location.host : 'kosun.pro');
  
  // Decide domain origin
  let domain = 'https://kosun.pro';
  if (currentHost.includes('localhost') || currentHost.includes('127.0.0.1')) {
    domain = `http://${currentHost}`;
  } else if (tenantId && !currentHost.startsWith(`${tenantId}.`)) {
    domain = `https://${tenantId}.kosun.pro`;
  } else if (!currentHost.includes('localhost')) {
    domain = `https://${currentHost}`;
  }

  let mediaPath = '';
  if (item.storagePath) {
    mediaPath = sanitizeVaultPath(item.storagePath, item.tenantId);
  } else if (item.name) {
    const safeName = item.name.replace(/[\\/:*?"<>|]/g, '_').trim();
    const timeStamp = item.createdAt;
    const folderPrefix = tenantId ? `tenants/${tenantId}/media` : 'sdo_media_vault';
    mediaPath = timeStamp && !safeName.startsWith(`${timeStamp}_`)
      ? `${folderPrefix}/${timeStamp}_${safeName}`
      : `${folderPrefix}/${safeName}`;
  }

  if (!mediaPath) return '';
  // Encode individual path segments to keep forward slashes intact for Firebase Hosting /media/** rewrite
  const cleanPath = mediaPath
    .split('/')
    .map((seg) => encodeURIComponent(decodeURIComponent(seg)))
    .join('/');
  return `${domain}/media/${cleanPath}`;
}

/**
 * Computes the permanent Firebase Storage direct URL for a media item.
 */
export function getPermanentMediaUrl(item?: Partial<MediaItem>, bucket: string = SYSTEM_MAIN_STORAGE_BUCKET): string {
  if (!item) return '';

  const isTenant = Boolean(item.tenantId && item.tenantId !== '_master');
  const folderPrefix = isTenant ? `tenants/${item.tenantId}/media` : 'sdo_media_vault';

  if (item.storagePath) {
    const cleanPath = sanitizeVaultPath(item.storagePath, item.tenantId);
    const encodedPath = encodeURIComponent(decodeURIComponent(cleanPath));
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
  }

  if (item.name) {
    const safeName = item.name.replace(/[\\/:*?"<>|]/g, '_').trim();
    const timeStamp = item.createdAt;
    const vaultPath = timeStamp && !safeName.startsWith(`${timeStamp}_`)
      ? `${folderPrefix}/${timeStamp}_${safeName}`
      : `${folderPrefix}/${safeName}`;
    const encodedPath = encodeURIComponent(decodeURIComponent(vaultPath));
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
  }

  return '';
}

/**
 * Extracts Cloud Storage path from any custom domain media proxy URL or returns null.
 * E.g.:
 * - https://mlea.kosun.pro/media/tenants/mlea/media/file.jpg -> tenants/mlea/media/file.jpg
 * - https://kosun.pro/media/sdo_media_vault/file.jpg -> sdo_media_vault/file.jpg
 * - /media/tenants/mlea/media/file.jpg -> tenants/mlea/media/file.jpg
 */
export function extractStoragePathFromProxyUrl(url?: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/\/media\/(.+?)(\?.*)?$/i);
  if (!match || !match[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

/**
 * Returns an array of viable candidate URLs to attempt loading media/video.
 */
export function getMediaUrlCandidates(url?: string, item?: Partial<MediaItem>): string[] {
  const candidates: string[] = [];

  const add = (u?: string) => {
    if (u && typeof u === 'string' && u.trim() && !candidates.includes(u.trim())) {
      candidates.push(u.trim());
    }
  };

  // If a custom proxy URL (/media/...) is provided as the URL, convert it to a direct Cloud Storage URL FIRST!
  // This guarantees that if the domain/subdomain rewrite isn't active or on another tenant origin,
  // the browser directly fetches the file from Google Cloud Storage without breaking.
  if (url && url.includes('/media/')) {
    const extractedPath = extractStoragePathFromProxyUrl(url);
    if (extractedPath) {
      const encoded = encodeURIComponent(extractedPath);
      add(`https://firebasestorage.googleapis.com/v0/b/${SYSTEM_MAIN_STORAGE_BUCKET}/o/${encoded}?alt=media`);
      add(`https://firebasestorage.googleapis.com/v0/b/${LEGACY_VAULT_BUCKET}/o/${encoded}?alt=media`);
    }
  }

  // 1. If valid external or direct http(s) URL that's not an alien blob or proxy URL
  if (url && !isAlienBlobUrl(url)) {
    const isProxyUrl = url.includes('/media/');
    if (!isProxyUrl) {
      add(url);
      if (url.includes(LEGACY_VAULT_BUCKET)) {
        add(url.replace(LEGACY_VAULT_BUCKET, SYSTEM_MAIN_STORAGE_BUCKET));
      } else if (url.includes(SYSTEM_MAIN_STORAGE_BUCKET)) {
        add(url.replace(SYSTEM_MAIN_STORAGE_BUCKET, LEGACY_VAULT_BUCKET));
      }
    }
  }

  // 2. Canonical permanent system storage URL (DIRECT Firebase Storage URL - highest reliability across dev and prod)
  if (item) {
    const isLegacy = (item.url && item.url.includes(LEGACY_VAULT_BUCKET)) || (item.storagePath && item.storagePath.includes(LEGACY_VAULT_BUCKET));
    if (isLegacy) {
      add(getPermanentMediaUrl(item, LEGACY_VAULT_BUCKET));
      add(getPermanentMediaUrl(item, SYSTEM_MAIN_STORAGE_BUCKET));
    } else {
      add(getPermanentMediaUrl(item, SYSTEM_MAIN_STORAGE_BUCKET));
      add(getPermanentMediaUrl(item, LEGACY_VAULT_BUCKET));
    }
  }

  // 3. Fallback without timestamp prefix
  if (item?.name) {
    const cleanName = item.name.replace(/[\\/:*?"<>|]/g, '_').replace(/^\d+_/, '').trim();
    const isLegacy = (item.url && item.url.includes(LEGACY_VAULT_BUCKET));
    const isTenant = Boolean(item.tenantId && item.tenantId !== '_master');
    const folderPrefix = isTenant ? `tenants/${item.tenantId}/media` : 'sdo_media_vault';
    if (isLegacy) {
      add(`https://firebasestorage.googleapis.com/v0/b/${LEGACY_VAULT_BUCKET}/o/${encodeURIComponent(`${folderPrefix}/${cleanName}`)}?alt=media`);
      add(`https://firebasestorage.googleapis.com/v0/b/${SYSTEM_MAIN_STORAGE_BUCKET}/o/${encodeURIComponent(`${folderPrefix}/${cleanName}`)}?alt=media`);
    } else {
      add(`https://firebasestorage.googleapis.com/v0/b/${SYSTEM_MAIN_STORAGE_BUCKET}/o/${encodeURIComponent(`${folderPrefix}/${cleanName}`)}?alt=media`);
      add(`https://firebasestorage.googleapis.com/v0/b/${LEGACY_VAULT_BUCKET}/o/${encodeURIComponent(`${folderPrefix}/${cleanName}`)}?alt=media`);
    }
  }

  // 4. Custom Domain Media Proxy (as fallback only if direct storage doesn't respond)
  if (item) {
    const customPublicUrl = getTenantPublicMediaUrl(item);
    if (customPublicUrl && !customPublicUrl.includes('localhost') && !customPublicUrl.includes('127.0.0.1')) {
      add(customPublicUrl);
    }
  }

  // 5. Data URL fallback
  if (item?.metadata?.dataUrl && !item.metadata.dataUrl.startsWith('blob:')) {
    add(item.metadata.dataUrl);
  }

  return candidates;
}

/**
 * Safely resolves a media URL with system main path prioritization.
 */
export function resolveSafeMediaUrl(url?: string, item?: Partial<MediaItem>): string {
  const candidates = getMediaUrlCandidates(url, item);
  return candidates[0] || url || '';
}
