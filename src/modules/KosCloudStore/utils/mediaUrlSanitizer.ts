import { MediaItem } from '../types';

const DEFAULT_STORAGE_BUCKET = 'glowmanage.firebasestorage.app';

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
 * Computes the permanent Firebase Storage direct URL for a media item.
 */
export function getPermanentMediaUrl(item?: Partial<MediaItem>, bucket: string = DEFAULT_STORAGE_BUCKET): string {
  if (!item) return '';

  if (item.storagePath) {
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(item.storagePath)}?alt=media`;
  }

  if (item.name) {
    const safeName = item.name.replace(/[\\/:*?"<>|]/g, '_').trim();
    const timeStamp = item.createdAt;
    const vaultPath = timeStamp ? `sdo_media_vault/${timeStamp}_${safeName}` : `sdo_media_vault/${safeName}`;
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(vaultPath)}?alt=media`;
  }

  return '';
}

/**
 * Safely resolves a media URL:
 * - If url is an alien blob URL (e.g. blob:http://localhost:5173 on kosun.pro), substitutes the permanent storage URL.
 * - If url is missing or empty, returns the permanent storage URL or metadata dataUrl.
 * - Prevents Chrome's "Not allowed to load local resource" security exception.
 */
export function resolveSafeMediaUrl(url?: string, item?: Partial<MediaItem>): string {
  if (!url) {
    return getPermanentMediaUrl(item) || item?.metadata?.dataUrl || '';
  }

  if (isAlienBlobUrl(url)) {
    const permanent = getPermanentMediaUrl(item);
    if (permanent) return permanent;
    if (item?.metadata?.dataUrl && !item.metadata.dataUrl.startsWith('blob:')) {
      return item.metadata.dataUrl;
    }
    return '';
  }

  return url;
}
