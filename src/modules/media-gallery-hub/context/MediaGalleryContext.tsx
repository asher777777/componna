import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Firestore } from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';
import {
  MediaItem,
  MediaType,
  MediaFilterOptions,
  MediaGalleryCollectionsConfig,
  MediaGalleryModuleConfig,
} from '../types';
import { resolveMediaCollections, INITIAL_SERVER_MEDIA } from '../config';
import { FirestoreMediaService } from '../services/firestoreMediaService';
import { FirebaseStorageMediaService } from '../services/firebaseStorageMediaService';
import { MediaIndexedDbService } from '../services/mediaIndexedDbService';
import { ensureAnonymousAuth } from '../../../services/firebaseAuth';
import { eventBus } from '../../../core/bridge/EventBus';

interface MediaGalleryContextValue {
  mediaItems: MediaItem[];
  filteredItems: MediaItem[];
  filters: MediaFilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<MediaFilterOptions>>;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  previewItem: MediaItem | null;
  setPreviewItem: (item: MediaItem | null) => void;
  converterItem: MediaItem | null;
  setConverterItem: (item: MediaItem | null) => void;
  isLoading: boolean;
  addMediaItems: (items: MediaItem[], files?: (File | Blob)[], onProgress?: (fileIndex: number, pct: number) => void) => Promise<void>;
  deleteMediaItems: (ids: string[]) => Promise<void>;
  updateMediaItem: (id: string, updates: Partial<MediaItem>) => Promise<void>;
  firebaseApp?: FirebaseApp;
  db?: Firestore;
  collections?: MediaGalleryCollectionsConfig;
  selectionMode?: boolean;
  allowedTypes?: MediaType[];
  maxSelectCount?: number;
  onSelectMedia?: (items: MediaItem[]) => void;
  onClosePicker?: () => void;
}

const MediaGalleryContext = createContext<MediaGalleryContextValue | null>(null);

export const MediaGalleryProvider: React.FC<{
  config: MediaGalleryModuleConfig;
  children: React.ReactNode;
}> = ({ config, children }) => {
  const {
    firebaseApp,
    db,
    customCollections,
    collectionPrefix,
    allowedTypes,
    maxSelectCount = 1,
    selectionMode = false,
    onSelectMedia,
    onClosePicker,
  } = config;

  const collections = useMemo(
    () => resolveMediaCollections(collectionPrefix, customCollections),
    [collectionPrefix, customCollections]
  );

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [converterItem, setConverterItem] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [filters, setFilters] = useState<MediaFilterOptions>({
    searchQuery: '',
    typeFilter: 'all',
    sortBy: 'date_desc',
  });

  // Load all media sources directly from Server Cloud Storage + IndexedDB + Firestore
  useEffect(() => {
    let isMounted = true;

    const loadServerSources = async () => {
      setIsLoading(true);
      try {
        const mergedMap = new Map<string, MediaItem>();

        const normalizeItem = (rawItem: MediaItem): MediaItem => {
          let type = rawItem.type;
          if (!type || type === 'other') {
            const name = (rawItem.name || '').toLowerCase();
            if (name.match(/\.(mp4|webm|mov|avi|mkv|m4v)$/i) || rawItem.mimeType?.startsWith('video/')) {
              type = 'video';
            } else if (name.match(/\.(png|jpg|jpeg|webp|gif|svg|avif)$/i) || rawItem.mimeType?.startsWith('image/')) {
              type = 'image';
            } else if (name.match(/\.(mp3|wav|ogg|aac|m4a|flac)$/i) || rawItem.mimeType?.startsWith('audio/')) {
              type = 'audio';
            }
          }
          return { ...rawItem, type };
        };

        // Filter out deleted items from local tombstone list
        let deletedSet = new Set<string>();
        try {
          const stored = localStorage.getItem('sdo_media_deleted_ids');
          if (stored) {
            deletedSet = new Set(JSON.parse(stored).map((x: string) => x.toLowerCase().trim()));
          }
        } catch {}

        const addDeduplicated = (rawItem: MediaItem) => {
          if (!rawItem) return;
          const item = normalizeItem(rawItem);
          const key = item.id || item.url || (item.name ? item.name.toLowerCase().trim() : '');
          if (!key) return;

          const nameKey = (item.name || '').toLowerCase().trim();
          const idKey = (item.id || '').toLowerCase().trim();
          if (deletedSet.has(nameKey) || deletedSet.has(idKey)) {
            return;
          }

          const existing = mergedMap.get(key);
          if (!existing) {
            mergedMap.set(key, item);
          } else {
            mergedMap.set(key, { ...existing, ...item });
          }
        };

        // 1. Start with initial confirmed server media
        INITIAL_SERVER_MEDIA.forEach(addDeduplicated);

        // 2. Load from local IndexedDB (instant zero-latency cache)
        try {
          const idbItems = await MediaIndexedDbService.getAllMedia();
          idbItems.forEach((it) => {
            if (it && it.url) addDeduplicated(it);
          });
        } catch (idbErr) {
          console.warn('[MediaGallery] IndexedDB load notice:', idbErr);
        }

        // 3. Fetch all files directly from Firebase Storage bucket
        if (firebaseApp) {
          try {
            await ensureAnonymousAuth(firebaseApp);
            const storageItems = await FirebaseStorageMediaService.fetchStorageFiles(firebaseApp);
            storageItems.forEach((item) => {
              addDeduplicated(item);
              if (db) {
                FirestoreMediaService.saveMediaItem(db, collections, item).catch(() => {});
              }
            });
          } catch (storageErr) {
            console.warn('[MediaGallery] Firebase storage list notice:', storageErr);
          }
        }

        // 4. Fetch remote items from Firestore (both active collections & global sdo_media_items)
        if (db) {
          try {
            const remoteItems = await FirestoreMediaService.fetchMediaItems(db, collections);
            remoteItems.forEach((item) => {
              if (item.url) addDeduplicated(item);
            });

            if (collections.mediaItems !== 'sdo_media_items') {
              const defaultItems = await FirestoreMediaService.fetchMediaItems(db, {
                mediaItems: 'sdo_media_items',
                folders: 'sdo_media_folders',
              });
              defaultItems.forEach((item) => {
                if (item.url) addDeduplicated(item);
              });
            }
          } catch (e) {
            console.warn('[MediaGallery] Firestore fetch notice:', e);
          }
        }

        if (!isMounted) return;

        const finalMerged = Array.from(mergedMap.values()).sort((a, b) => b.createdAt - a.createdAt);
        setMediaItems(finalMerged);
        
        // Sync to IndexedDB
        finalMerged.forEach(item => MediaIndexedDbService.saveMedia(item).catch(() => {}));
      } catch (err) {
        console.warn('[MediaGallery] Failed to load server media sources:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadServerSources();

    // Listen for cross-module media additions (e.g. from Interactive Player Studio)
    const handleMediaUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<MediaItem>;
      if (customEvent.detail) {
        setMediaItems((prev) => {
          const newItem = customEvent.detail;
          const filtered = prev.filter(
            (it) => it.id !== newItem.id && it.name.toLowerCase().trim() !== newItem.name.toLowerCase().trim()
          );
          return [newItem, ...filtered];
        });
      }
    };

    const handleMediaDeleted = (e: Event) => {
      const customEvent = e as CustomEvent<{ ids: string[] }>;
      if (customEvent.detail?.ids) {
        const deletedIds = new Set(customEvent.detail.ids);
        setMediaItems((prev) => prev.filter((it) => !deletedIds.has(it.id)));
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('sdo_media_updated', handleMediaUpdated);
      window.addEventListener('sdo_media_deleted', handleMediaDeleted);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('sdo_media_updated', handleMediaUpdated);
        window.removeEventListener('sdo_media_deleted', handleMediaDeleted);
      }
    };
  }, [firebaseApp, db, collections]);

  const addMediaItems = async (
    newItems: MediaItem[],
    files?: (File | Blob)[],
    onProgress?: (fileIndex: number, pct: number) => void
  ) => {
    // 1. Optimistic Immediate Update in UI
    setMediaItems((prev) => {
      const map = new Map<string, MediaItem>();
      newItems.forEach((it) => map.set(it.name.toLowerCase().trim(), it));
      prev.forEach((it) => {
        const k = it.name.toLowerCase().trim();
        if (!map.has(k)) map.set(k, it);
      });
      return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
    });

    // 2. Upload each file directly to Firebase Cloud Storage and save JSON to Firestore & IndexedDB
    const uploadPromises = newItems.map(async (initialItem, index) => {
      const file = files ? files[index] : undefined;
      let finalItem = { ...initialItem };

      if (firebaseApp && file) {
        try {
          const downloadUrl = await FirebaseStorageMediaService.uploadFileToStorage(
            firebaseApp,
            file,
            initialItem.name,
            (pct) => onProgress && onProgress(index, pct)
          );
          finalItem = { ...finalItem, url: downloadUrl };
        } catch (storageErr) {
          console.warn(`[MediaGallery] Cloud storage upload for ${initialItem.name}:`, storageErr);
        }
      }

      // Save complete JSON document to Firestore on the server
      if (db) {
        try {
          await FirestoreMediaService.saveMediaItem(db, collections, finalItem);
          if (collections.mediaItems !== 'sdo_media_items') {
            await FirestoreMediaService.saveMediaItem(db, { mediaItems: 'sdo_media_items', folders: 'sdo_media_folders' }, finalItem);
          }
        } catch (fsErr) {
          console.warn('[MediaGallery] Firestore save notice:', fsErr);
        }
      }

      // Save locally to IndexedDB
      if (file) {
        MediaIndexedDbService.saveMedia(finalItem, file).catch(() => {});
      }

      if (onProgress) onProgress(index, 100);

      // Update state with confirmed permanent URL
      setMediaItems((prev) =>
        prev.map((it) =>
          it.name.toLowerCase().trim() === finalItem.name.toLowerCase().trim() ? finalItem : it
        )
      );

      // Broadcast via global EventBus to all listening modules
      if (finalItem.url) {
        eventBus.emit('media:uploaded', {
          url: finalItem.url,
          fileName: finalItem.name,
          type: finalItem.type,
        });
      }

      return finalItem;
    });

    await Promise.all(uploadPromises);
  };

  const deleteMediaItems = async (ids: string[]) => {
    const toDelete = mediaItems.filter((i) => ids.includes(i.id));
    const deleteNames = new Set(toDelete.map((i) => i.name.toLowerCase().trim()));
    const deleteIds = new Set(ids);

    // Save tombstone in LocalStorage so deleted items are NEVER resurrected on page reload
    try {
      const existingDeleted = JSON.parse(localStorage.getItem('sdo_media_deleted_ids') || '[]');
      const updatedDeleted = Array.from(new Set([...existingDeleted, ...ids, ...toDelete.map(i => i.name), ...toDelete.map(i => i.id)]));
      localStorage.setItem('sdo_media_deleted_ids', JSON.stringify(updatedDeleted));
    } catch {}

    // Update UI immediately
    setMediaItems((prev) => prev.filter((item) => !deleteIds.has(item.id) && !deleteNames.has(item.name.toLowerCase().trim())));
    setSelectedIds([]);

    for (const item of toDelete) {
      // 1. Delete from IndexedDB & LocalStorage cache
      await MediaIndexedDbService.deleteMedia(item.id);

      // 2. Delete from Firestore (both current and default sdo_media_items)
      if (db) {
        try {
          await FirestoreMediaService.deleteMediaItem(db, collections, item.id);
          if (collections.mediaItems !== 'sdo_media_items') {
            await FirestoreMediaService.deleteMediaItem(db, { mediaItems: 'sdo_media_items', folders: 'sdo_media_folders' }, item.id);
          }
        } catch (e) {}
      }

      // 3. Delete from Firebase Cloud Storage and sdo_media_vault
      if (firebaseApp) {
        try {
          await FirebaseStorageMediaService.deleteStorageFile(firebaseApp, item);
        } catch (e) {}
      }
    }

    // Broadcast delete event across windows and modules
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sdo_media_deleted', { detail: { ids } }));
    }
  };

  const updateMediaItem = async (id: string, updates: Partial<MediaItem>) => {
    setMediaItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: Date.now() } : item))
    );

    if (db) {
      await FirestoreMediaService.updateMediaMetadata(db, collections, id, updates);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (config?.maxSelectCount && config.maxSelectCount === 1) {
          return [id];
        }
        return [...prev, id];
      }
    });
  };

  const selectAll = () => {
    setSelectedIds(filteredItems.map((item) => item.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const filteredItems = useMemo(() => {
    return mediaItems
      .filter((item) => {
        if (config?.allowedTypes && config.allowedTypes.length > 0) {
          if (!config.allowedTypes.includes(item.type)) return false;
        }

        if (filters.typeFilter !== 'all' && item.type !== filters.typeFilter) {
          return false;
        }

        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchesName = item.name.toLowerCase().includes(q);
          const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchesName && !matchesTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'date_desc') return b.createdAt - a.createdAt;
        if (filters.sortBy === 'date_asc') return a.createdAt - b.createdAt;
        if (filters.sortBy === 'size_desc') return b.sizeBytes - a.sizeBytes;
        if (filters.sortBy === 'name_asc') return a.name.localeCompare(b.name, 'he');
        return 0;
      });
  }, [mediaItems, filters, config?.allowedTypes]);

  return (
    <MediaGalleryContext.Provider
      value={{
        mediaItems,
        filteredItems,
        filters,
        setFilters,
        selectedIds,
        toggleSelect,
        selectAll,
        clearSelection,
        previewItem,
        setPreviewItem,
        converterItem,
        setConverterItem,
        isLoading,
        addMediaItems,
        deleteMediaItems,
        updateMediaItem,
        firebaseApp,
        db,
        collections,
        selectionMode: config?.selectionMode,
        allowedTypes: config?.allowedTypes,
        maxSelectCount: config?.maxSelectCount,
        onSelectMedia: config?.onSelectMedia,
        onClosePicker: config?.onClosePicker,
      }}
    >
      {children}
    </MediaGalleryContext.Provider>
  );
};

export const useMediaGallery = () => {
  const context = useContext(MediaGalleryContext);
  if (!context) {
    throw new Error('useMediaGallery must be used within a MediaGalleryProvider');
  }
  return context;
};