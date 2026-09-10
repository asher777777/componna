import { MediaItem, MediaFolder } from '../types';

const DB_NAME = 'ComonaMediaVaultDB';
const DB_VERSION = 2;
const STORE_ITEMS = 'media_items';
const STORE_BLOBS = 'media_blobs';
const STORE_FOLDERS = 'media_folders';
const LOCAL_STORAGE_KEY = 'sdo_media_vault_items';
const LOCAL_STORAGE_FOLDERS_KEY = 'sdo_media_vault_folders';

export class MediaIndexedDbService {
  private static openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported in this environment'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_ITEMS)) {
          db.createObjectStore(STORE_ITEMS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_BLOBS)) {
          db.createObjectStore(STORE_BLOBS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_FOLDERS)) {
          db.createObjectStore(STORE_FOLDERS, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Save media item metadata and its binary Blob/File to IndexedDB & localStorage
   */
  public static async saveMedia(item: MediaItem, fileOrBlob?: Blob | File): Promise<void> {
    try {
      // 0. Remove from deleted tombstones list so new uploads are never blocked
      try {
        const stored = localStorage.getItem('sdo_media_deleted_ids');
        if (stored) {
          const deletedArr: string[] = JSON.parse(stored);
          const nameLower = (item.name || '').toLowerCase().trim();
          const idLower = (item.id || '').toLowerCase().trim();
          const filtered = deletedArr.filter(
            (d) => d.toLowerCase().trim() !== nameLower && d.toLowerCase().trim() !== idLower
          );
          localStorage.setItem('sdo_media_deleted_ids', JSON.stringify(filtered));
        }
      } catch {}

      // 1. Backup metadata to LocalStorage
      try {
        const existingRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
        const existing: MediaItem[] = existingRaw ? JSON.parse(existingRaw) : [];
        const filtered = existing.filter((i) => i.id !== item.id && i.name.toLowerCase().trim() !== item.name.toLowerCase().trim());
        filtered.unshift(item);
        // keep up to 100 metadata items in localstorage
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered.slice(0, 100)));
      } catch (lsErr) {
        console.warn('[MediaIndexedDb] LocalStorage metadata backup notice:', lsErr);
      }

      // 2. Save binary Blob and Item to IndexedDB
      const db = await this.openDB();
      const tx = db.transaction([STORE_ITEMS, STORE_BLOBS], 'readwrite');
      const itemsStore = tx.objectStore(STORE_ITEMS);
      const blobsStore = tx.objectStore(STORE_BLOBS);

      itemsStore.put(item);

      if (fileOrBlob) {
        blobsStore.put({ id: item.id, blob: fileOrBlob, name: item.name, mimeType: item.mimeType });
        blobsStore.put({ id: item.name.toLowerCase().trim(), blob: fileOrBlob, name: item.name, mimeType: item.mimeType });
      } else if (item.url && item.url.startsWith('blob:')) {
        try {
          const resp = await fetch(item.url);
          const blob = await resp.blob();
          blobsStore.put({ id: item.id, blob, name: item.name, mimeType: item.mimeType });
          blobsStore.put({ id: item.name.toLowerCase().trim(), blob, name: item.name, mimeType: item.mimeType });
        } catch (e) {
          console.warn('[MediaIndexedDb] Could not extract blob from url:', e);
        }
      }

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      console.warn('[MediaIndexedDb] Failed to save media to IndexedDB:', error);
    }
  }

  /**
   * Load all media items and reconstitute active Object URLs from stored Blobs
   */
  public static async getAllMedia(): Promise<MediaItem[]> {
    try {
      const db = await this.openDB();
      const tx = db.transaction([STORE_ITEMS, STORE_BLOBS], 'readonly');
      const itemsStore = tx.objectStore(STORE_ITEMS);
      const blobsStore = tx.objectStore(STORE_BLOBS);

      const itemsRequest = itemsStore.getAll();
      const blobsRequest = blobsStore.getAll();

      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });

      let items: MediaItem[] = itemsRequest.result || [];
      const blobs: { id: string; blob: Blob }[] = blobsRequest.result || [];
      const blobsMap = new Map<string, Blob>();
      blobs.forEach((b) => blobsMap.set(b.id, b.blob));

      // Merge with LocalStorage if items was empty
      if (items.length === 0) {
        try {
          const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (raw) items = JSON.parse(raw);
        } catch (e) {}
      }

      // Check deleted tombstone set
      let deletedSet = new Set<string>();
      try {
        const stored = localStorage.getItem('sdo_media_deleted_ids');
        if (stored) {
          deletedSet = new Set(JSON.parse(stored).map((x: string) => x.toLowerCase().trim()));
        }
      } catch {}

      // Re-create fresh Object URLs for each local item if it has a stored Blob
      const reconstructed: MediaItem[] = items
        .filter((item) => !deletedSet.has(item.id.toLowerCase().trim()) && !deletedSet.has(item.name.toLowerCase().trim()))
        .map((item) => {
          const storedBlob = blobsMap.get(item.id) || blobsMap.get(item.name.toLowerCase().trim());
          if (storedBlob) {
            const freshObjectUrl = URL.createObjectURL(storedBlob);
            return {
              ...item,
              url: freshObjectUrl,
            };
          }
          return item;
        });

      return reconstructed;
    } catch (error) {
      console.warn('[MediaIndexedDb] Failed to read from IndexedDB, falling back to LocalStorage:', error);
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }
  }

  /**
   * Delete media item and its binary blob
   */
  public static async deleteMedia(id: string): Promise<void> {
    try {
      // LocalStorage
      try {
        const existingRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (existingRaw) {
          const existing: MediaItem[] = JSON.parse(existingRaw);
          const target = existing.find((i) => i.id === id);
          const targetName = target ? target.name.toLowerCase().trim() : '';
          localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify(existing.filter((i) => i.id !== id && i.name.toLowerCase().trim() !== targetName))
          );
        }
      } catch (e) {}

      // IndexedDB
      const db = await this.openDB();
      const tx = db.transaction([STORE_ITEMS, STORE_BLOBS], 'readwrite');
      tx.objectStore(STORE_ITEMS).delete(id);
      tx.objectStore(STORE_BLOBS).delete(id);

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      console.warn('[MediaIndexedDb] Failed to delete media from IndexedDB:', error);
    }
  }

  /**
   * Get an active Object URL for a given media ID, name, or key from IndexedDB
   */
  public static async getBlobUrl(key: string): Promise<string | null> {
    if (!key) return null;
    try {
      const db = await this.openDB();
      const tx = db.transaction([STORE_BLOBS], 'readonly');
      const blobsStore = tx.objectStore(STORE_BLOBS);

      const cleanKey = key.trim();
      const lowerKey = cleanKey.toLowerCase();

      return new Promise<string | null>((resolve) => {
        const req = blobsStore.get(cleanKey);
        req.onsuccess = () => {
          if (req.result?.blob) {
            resolve(URL.createObjectURL(req.result.blob));
            return;
          }
          // Try lower case
          const req2 = blobsStore.get(lowerKey);
          req2.onsuccess = () => {
            if (req2.result?.blob) {
              resolve(URL.createObjectURL(req2.result.blob));
            } else {
              resolve(null);
            }
          };
          req2.onerror = () => resolve(null);
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  /**
   * Rehydrate any ephemeral/blob media URLs in a campaign from persistent IndexedDB Blobs
   */
  public static async rehydrateCampaignMedia<T extends { states?: Record<string, any> }>(
    campaign: T
  ): Promise<T> {
    if (!campaign || !campaign.states || typeof window === 'undefined') {
      return campaign;
    }

    try {
      const allMedia = await this.getAllMedia();
      if (!allMedia || allMedia.length === 0) {
        return campaign;
      }

      const mediaMap = new Map<string, string>();
      allMedia.forEach((item) => {
        if (item.url) {
          mediaMap.set(item.id.toLowerCase().trim(), item.url);
          mediaMap.set(item.name.toLowerCase().trim(), item.url);
        }
      });

      const updatedStates = { ...campaign.states };
      let hasChanges = false;

      for (const [nodeId, node] of Object.entries(updatedStates)) {
        if (!node) continue;
        let freshVideoUrl = node.videoUrl;

        // If videoUrl is missing, or is a dead session blob, or matches mediaId/mediaName
        const isBlob = node.videoUrl && node.videoUrl.startsWith('blob:');
        const mediaId = (node.mediaId || '').toLowerCase().trim();
        const mediaName = (node.mediaName || '').toLowerCase().trim();
        const nodeName = (node.name || '').toLowerCase().trim();

        if (isBlob || !freshVideoUrl || mediaId || mediaName) {
          const resolvedUrl =
            (mediaId && mediaMap.get(mediaId)) ||
            (mediaName && mediaMap.get(mediaName)) ||
            (nodeName && mediaMap.get(nodeName));

          if (resolvedUrl) {
            freshVideoUrl = resolvedUrl;
            hasChanges = true;
          } else if (isBlob) {
            // Try matching any video from stored media if single video exists
            const videoMedia = allMedia.filter((m) => m.type === 'video');
            if (videoMedia.length === 1 && videoMedia[0].url) {
              freshVideoUrl = videoMedia[0].url;
              hasChanges = true;
            }
          }
        }

        // Rehydrate carousel cards images if any
        let updatedOverlays = node.overlays;
        if (node.overlays && Array.isArray(node.overlays)) {
          updatedOverlays = node.overlays.map((ov: any) => {
            if (ov.type === 'carousel' && Array.isArray(ov.carouselItems)) {
              const updatedCards = ov.carouselItems.map((card: any) => {
                if (card.imageUrl && card.imageUrl.startsWith('blob:')) {
                  const cardTitle = (card.title || '').toLowerCase().trim();
                  const resolvedImg = mediaMap.get(cardTitle);
                  if (resolvedImg) {
                    hasChanges = true;
                    return { ...card, imageUrl: resolvedImg };
                  }
                }
                return card;
              });
              return { ...ov, carouselItems: updatedCards };
            }
            return ov;
          });
        }

        updatedStates[nodeId] = {
          ...node,
          videoUrl: freshVideoUrl || node.videoUrl,
          fallbackVideoUrl: freshVideoUrl || node.fallbackVideoUrl,
          overlays: updatedOverlays,
        };
      }

      if (hasChanges) {
        return {
          ...campaign,
          states: updatedStates,
        };
      }
    } catch (e) {
      console.warn('[MediaIndexedDb] Rehydrate campaign media notice:', e);
    }

    return campaign;
  }

  /**
   * Folder Operations in IndexedDB & LocalStorage
   */
  public static async saveFolder(folder: MediaFolder): Promise<void> {
    try {
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_FOLDERS_KEY);
        const folders: MediaFolder[] = raw ? JSON.parse(raw) : [];
        const filtered = folders.filter((f) => f.id !== folder.id);
        filtered.unshift(folder);
        localStorage.setItem(LOCAL_STORAGE_FOLDERS_KEY, JSON.stringify(filtered));
      } catch {}

      const db = await this.openDB();
      if (db.objectStoreNames.contains(STORE_FOLDERS)) {
        const tx = db.transaction([STORE_FOLDERS], 'readwrite');
        tx.objectStore(STORE_FOLDERS).put(folder);
        await new Promise<void>((res) => {
          tx.oncomplete = () => res();
          tx.onerror = () => res();
        });
      }
    } catch (err) {
      console.warn('[MediaIndexedDb] Save folder error:', err);
    }
  }

  public static async getFolders(): Promise<MediaFolder[]> {
    try {
      const db = await this.openDB();
      if (db.objectStoreNames.contains(STORE_FOLDERS)) {
        const tx = db.transaction([STORE_FOLDERS], 'readonly');
        const req = tx.objectStore(STORE_FOLDERS).getAll();
        await new Promise<void>((res) => {
          tx.oncomplete = () => res();
          tx.onerror = () => res();
        });
        if (req.result && req.result.length > 0) {
          return req.result;
        }
      }
    } catch {}

    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_FOLDERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static async deleteFolder(folderId: string): Promise<void> {
    try {
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_FOLDERS_KEY);
        if (raw) {
          const folders: MediaFolder[] = JSON.parse(raw);
          localStorage.setItem(LOCAL_STORAGE_FOLDERS_KEY, JSON.stringify(folders.filter((f) => f.id !== folderId)));
        }
      } catch {}

      const db = await this.openDB();
      if (db.objectStoreNames.contains(STORE_FOLDERS)) {
        const tx = db.transaction([STORE_FOLDERS], 'readwrite');
        tx.objectStore(STORE_FOLDERS).delete(folderId);
        await new Promise<void>((res) => {
          tx.oncomplete = () => res();
          tx.onerror = () => res();
        });
      }
    } catch (err) {
      console.warn('[MediaIndexedDb] Delete folder error:', err);
    }
  }
}