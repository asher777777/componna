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
 * Computes the permanent Firebase Storage direct URL for a media item.
 */
export function getPermanentMediaUrl(item?: Partial<MediaItem>, bucket: string = SYSTEM_MAIN_STORAGE_BUCKET): string {
  if (!item) return '';

  const isTenant = Boolean(item.tenantId && item.tenantId !== '_master');
  const folderPrefix = isTenant ? `tenants/${item.tenantId}/media` : 'sdo_media_vault';

  if (item.storagePath) {
    const cleanPath = sanitizeVaultPath(item.storagePath, item.tenantId);
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(cleanPath)}?alt=media`;
  }

  if (item.name) {
    const safeName = item.name.replace(/[\\/:*?"<>|]/g, '_').trim();
    const timeStamp = item.createdAt;
    const vaultPath = timeStamp && !safeName.startsWith(`${timeStamp}_`)
      ? `${folderPrefix}/${timeStamp}_${safeName}`
      : `${folderPrefix}/${safeName}`;
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(vaultPath)}?alt=media`;
  }

  return '';
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

  // 1. If valid external or direct http(s) URL that's not an alien blob
  if (url && !isAlienBlobUrl(url)) {
    add(url);
    if (url.includes(LEGACY_VAULT_BUCKET)) {
      add(url.replace(LEGACY_VAULT_BUCKET, SYSTEM_MAIN_STORAGE_BUCKET));
    } else if (url.includes(SYSTEM_MAIN_STORAGE_BUCKET)) {
      add(url.replace(SYSTEM_MAIN_STORAGE_BUCKET, LEGACY_VAULT_BUCKET));
    }
  }

  // 2. Canonical permanent system storage URL
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

  // 4. Data URL fallback
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
