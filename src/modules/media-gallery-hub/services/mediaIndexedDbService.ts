import { MediaItem } from '../types';

const DB_NAME = 'ComonaMediaVaultDB';
const DB_VERSION = 1;
const STORE_ITEMS = 'media_items';
const STORE_BLOBS = 'media_blobs';
const LOCAL_STORAGE_KEY = 'sdo_media_vault_items';

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
      // 1. Backup metadata to LocalStorage
      try {
        const existingRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
        const existing: MediaItem[] = existingRaw ? JSON.parse(existingRaw) : [];
        const filtered = existing.filter((i) => i.id !== item.id);
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
      } else if (item.url && item.url.startsWith('blob:')) {
        try {
          const resp = await fetch(item.url);
          const blob = await resp.blob();
          blobsStore.put({ id: item.id, blob, name: item.name, mimeType: item.mimeType });
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

      // Re-create fresh Object URLs for each local item if it has a stored Blob
      const reconstructed: MediaItem[] = items.map((item) => {
        const storedBlob = blobsMap.get(item.id);
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
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing.filter((i) => i.id !== id)));
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
}