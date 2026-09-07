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
import { ensureAnonymousAuth } from '../../../services/firebaseAuth';

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
  config?: MediaGalleryModuleConfig;
  children: React.ReactNode;
}> = ({ config, children }) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => config?.initialItems || INITIAL_SERVER_MEDIA);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [converterItem, setConverterItem] = useState<MediaItem | null>(null);

  const [filters, setFilters] = useState<MediaFilterOptions>({
    searchQuery: '',
    typeFilter: 'all',
    sortBy: 'date_desc',
  });

  const firebaseApp = config?.firebaseApp;
  const db = config?.db;
  const collections = useMemo(
    () => resolveMediaCollections(config?.collectionPrefix, config?.customCollections),
    [config?.collectionPrefix, config?.customCollections]
  );

  // Load dynamically from Server (Firebase Storage + Firestore JSON collections) on mount
  useEffect(() => {
    let isMounted = true;

    const loadServerSources = async () => {
      try {
        const mergedMap = new Map<string, MediaItem>();

        const normalizeItem = (rawItem: MediaItem): MediaItem => {
          let type = rawItem.type;
          const name = rawItem.name || '';
          if (!type || type === 'other') {
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

        const addDeduplicated = (rawItem: MediaItem) => {
          if (!rawItem) return;
          const item = normalizeItem(rawItem);
          const key = item.id || item.url || (item.name ? item.name.toLowerCase().trim() : '');
          if (!key) return;

          const existing = mergedMap.get(key);
          if (!existing) {
            mergedMap.set(key, item);
          } else {
            mergedMap.set(key, { ...existing, ...item });
          }
        };

        // 1. Start with initial confirmed server media
        INITIAL_SERVER_MEDIA.forEach(addDeduplicated);

        // 2. Fetch all files directly from Firebase Storage bucket
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

        // 3. Fetch remote items from Firestore (both active collections & global sdo_media_items)
        if (db) {
          try {
            const remoteItems = await FirestoreMediaService.fetchMediaItems(db, collections);
            remoteItems.forEach((item) => {
              if (item.url) addDeduplicated(item);
            });

            // Also check default sdo_media_items if different
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
      } catch (err) {
        console.warn('[MediaGallery] Failed to load server media sources:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadServerSources();

    return () => {
      isMounted = false;
    };
  }, [firebaseApp, db, collections]);

  /**
   * Upload exclusively to Server (Cloud Storage + Firestore JSON)
   */
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

    // 2. Upload each file directly to Firebase Cloud Storage and save JSON to Firestore
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
        } catch (fsErr) {
          console.warn('[MediaGallery] Firestore save notice:', fsErr);
        }
      }

      if (onProgress) onProgress(index, 100);

      // Update state with confirmed permanent Cloud Storage URL
      setMediaItems((prev) =>
        prev.map((it) =>
          it.name.toLowerCase().trim() === finalItem.name.toLowerCase().trim() ? finalItem : it
        )
      );

      return finalItem;
    });

    await Promise.all(uploadPromises);
  };

  const deleteMediaItems = async (ids: string[]) => {
    const toDelete = mediaItems.filter((i) => ids.includes(i.id));
    const deleteNames = new Set(toDelete.map((i) => i.name.toLowerCase().trim()));

    setMediaItems((prev) => prev.filter((item) => !ids.includes(item.id) && !deleteNames.has(item.name.toLowerCase().trim())));
    setSelectedIds([]);

    for (const item of toDelete) {
      if (db) {
        try {
          await FirestoreMediaService.deleteMediaItem(db, collections, item.id);
        } catch (e) {}
      }
      if (firebaseApp) {
        try {
          await FirebaseStorageMediaService.deleteStorageFile(firebaseApp, item.name);
        } catch (e) {}
      }
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