import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Firestore } from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';
import {
  MediaItem,
  MediaFolder,
  MediaType,
  MediaFilterOptions,
  MediaGalleryCollectionsConfig,
  MediaGalleryModuleConfig,
} from '../types';
import { resolveMediaCollections, INITIAL_SERVER_MEDIA } from '../config';
import { FirestoreMediaService } from '../services/firestoreMediaService';
import { FirebaseStorageMediaService } from '../services/firebaseStorageMediaService';
import { MediaIndexedDbService } from '../services/mediaIndexedDbService';
import { FileCompressionService } from '../services/fileCompressionService';
import { eventBus } from '../../../core/bridge/EventBus';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';

export interface ModuleSourceInfo {
  id: string;
  name: string;
  shortLabel: string;
  icon: string;
  color: string;
}

export const KNOWN_MODULE_SOURCES: Record<string, ModuleSourceInfo> = {
  'all': {
    id: 'all',
    name: 'כל הרכיבים והמודולים',
    shortLabel: 'הכל',
    icon: 'Layers',
    color: '#eab308',
  },
  'video-producer-studio': {
    id: 'video-producer-studio',
    name: 'סטודיו וידאו ואווטאר (HeyGen & Veo)',
    shortLabel: 'סטודיו וידאו',
    icon: 'Video',
    color: '#8b5cf6',
  },
  'flow-player-engine': {
    id: 'flow-player-engine',
    name: 'מנוע נגן זרימה אינטראקטיבי',
    shortLabel: 'נגן זרימה',
    icon: 'PlayCircle',
    color: '#3b82f6',
  },
  'page-builder': {
    id: 'page-builder',
    name: 'יוצר העמודים והאתרים',
    shortLabel: 'בונה עמודים',
    icon: 'Layout',
    color: '#10b981',
  },
  'crm-analytics': {
    id: 'crm-analytics',
    name: 'אנליטיקה ודוחות CRM',
    shortLabel: 'אנליטיקה',
    icon: 'BarChart3',
    color: '#f97316',
  },
  'media-gallery-hub': {
    id: 'media-gallery-hub',
    name: 'העלאה ישירה במאגר המדיה',
    shortLabel: 'מאגר מדיה',
    icon: 'HardDrive',
    color: '#eab308',
  },
};

interface MediaGalleryContextValue {
  mediaItems: MediaItem[];
  filteredItems: MediaItem[];
  folders: MediaFolder[];
  activeFolderId: string | null;
  setActiveFolderId: (id: string | null) => void;
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
  addMediaItems: (
    items: MediaItem[],
    files?: (File | Blob)[],
    onProgress?: (fileIndex: number, pct: number) => void
  ) => Promise<void>;
  deleteMediaItems: (ids: string[]) => Promise<void>;
  updateMediaItem: (id: string, updates: Partial<MediaItem>) => Promise<void>;
  renameMediaItem: (id: string, newName: string) => Promise<void>;
  
  // Folder Operations
  createFolder: (name: string, color?: string, icon?: string, parentId?: string | null) => Promise<MediaFolder>;
  updateFolder: (id: string, updates: Partial<MediaFolder>) => Promise<void>;
  deleteFolder: (id: string, deleteContents?: boolean) => Promise<void>;
  moveItemsToFolder: (itemIds: string[], targetFolderId: string | null) => Promise<void>;

  // Theme support
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;

  // Folder Modals UI state
  isFolderModalOpen: boolean;
  setIsFolderModalOpen: (open: boolean) => void;
  editingFolder: MediaFolder | null;
  setEditingFolder: (folder: MediaFolder | null) => void;
  isMoveModalOpen: boolean;
  setIsMoveModalOpen: (open: boolean) => void;
  itemsToMove: string[];
  setItemsToMove: (ids: string[]) => void;

  // Modern UI states
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isInspectorOpen: boolean;
  setIsInspectorOpen: (open: boolean) => void;
  isUploaderOpen: boolean;
  setIsUploaderOpen: (open: boolean) => void;
  totalStorageBytes: number;
  focusedItem: MediaItem | null;
  setFocusedItem: (item: MediaItem | null) => void;

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
  const systemConn = useSystemConnection();
  const firebaseApp = config.firebaseApp || systemConn.firebaseApp;
  const db = config.db || systemConn.db;

  const {
    customCollections,
    collectionPrefix,
    allowedTypes,
    maxSelectCount = 1,
    selectionMode = false,
    defaultFolderId = null,
    onSelectMedia,
    onClosePicker,
  } = config;

  const collections = useMemo(
    () => resolveMediaCollections(collectionPrefix, customCollections),
    [collectionPrefix, customCollections]
  );

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(defaultFolderId);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [converterItem, setConverterItem] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Folder Modal state
  const [isFolderModalOpen, setIsFolderModalOpen] = useState<boolean>(false);
  const [editingFolder, setEditingFolder] = useState<MediaFolder | null>(null);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState<boolean>(false);
  const [itemsToMove, setItemsToMove] = useState<string[]>([]);

  // Modern UI states
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [isUploaderOpen, setIsUploaderOpen] = useState<boolean>(false);
  const [focusedItem, setFocusedItem] = useState<MediaItem | null>(null);

  // Theme Support (Day / Night Mode)
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('sdo_media_theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('sdo_media_theme', newTheme);
    } catch {}
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const totalStorageBytes = useMemo(() => {
    return mediaItems.reduce((acc, it) => acc + (it.sizeBytes || 0), 0);
  }, [mediaItems]);

  const [filters, setFilters] = useState<MediaFilterOptions>({
    searchQuery: '',
    typeFilter: 'all',
    sortBy: 'date_desc',
    sourceModuleFilter: 'all',
    folderId: defaultFolderId,
  });

  // Automatically detect sourceModule & human readable label
  const detectSourceModule = (item: Partial<MediaItem>): { sourceModule: string; sourceModuleLabel: string } => {
    if (item.sourceModule && KNKNOWN_SOURCE(item.sourceModule)) {
      return {
        sourceModule: item.sourceModule,
        sourceModuleLabel: KNOWN_MODULE_SOURCES[item.sourceModule]?.name || item.sourceModuleLabel || item.sourceModule,
      };
    }

    const tags = (item.tags || []).map((t) => t.toLowerCase().trim());
    const metadata = item.metadata || {};

    if (
      tags.includes('heygen') ||
      tags.includes('sdo_studio') ||
      tags.includes('banana_pro') ||
      tags.includes('google_veo') ||
      tags.includes('google_tts') ||
      metadata.source === 'sdo_video_producer'
    ) {
      return {
        sourceModule: 'video-producer-studio',
        sourceModuleLabel: 'סטודיו וידאו ואווטאר (HeyGen & Veo)',
      };
    }

    if (tags.includes('flow_player') || tags.includes('interactive_flow') || tags.includes('sdo_player')) {
      return {
        sourceModule: 'flow-player-engine',
        sourceModuleLabel: 'מנוע נגן זרימה אינטראקטיבי',
      };
    }

    if (tags.includes('page_builder') || tags.includes('pagebuilder')) {
      return {
        sourceModule: 'page-builder',
        sourceModuleLabel: 'יוצר העמודים והאתרים',
      };
    }

    if (tags.includes('crm') || tags.includes('analytics')) {
      return {
        sourceModule: 'crm-analytics',
        sourceModuleLabel: 'אנליטיקה ודוחות CRM',
      };
    }

    return {
      sourceModule: 'media-gallery-hub',
      sourceModuleLabel: 'העלאה ישירה במאגר המדיה',
    };
  };

  function KNKNOWN_SOURCE(source: string) {
    return Boolean(KNOWN_MODULE_SOURCES[source]);
  }

  // Load all media sources directly from Server Cloud Storage + IndexedDB + Firestore + Folders
  useEffect(() => {
    let isMounted = true;

    const loadServerSources = async () => {
      setIsLoading(true);
      try {
        const mergedMap = new Map<string, MediaItem>();

        const normalizeItem = (rawItem: MediaItem): MediaItem => {
          const { type, mimeType } = FileCompressionService.detectFileType(rawItem.name || '', rawItem.mimeType);
          const itemType = rawItem.type && rawItem.type !== 'other' ? rawItem.type : type;
          const { sourceModule, sourceModuleLabel } = detectSourceModule(rawItem);

          return {
            ...rawItem,
            type: itemType,
            mimeType: rawItem.mimeType || mimeType,
            sourceModule: rawItem.sourceModule || sourceModule,
            sourceModuleLabel: rawItem.sourceModuleLabel || sourceModuleLabel,
          };
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

        // 1. Initial confirmed server media
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

        // 5. Load Folders (Firestore + IndexedDB + LocalStorage)
        let loadedFolders: MediaFolder[] = [];
        try {
          if (db) {
            loadedFolders = await FirestoreMediaService.fetchFolders(db, collections);
          }
          if (loadedFolders.length === 0) {
            loadedFolders = await MediaIndexedDbService.getFolders();
          }
        } catch (fErr) {
          console.warn('[MediaGallery] Folder loading notice:', fErr);
          loadedFolders = await MediaIndexedDbService.getFolders();
        }

        if (!isMounted) return;

        const finalMerged = Array.from(mergedMap.values()).sort((a, b) => b.createdAt - a.createdAt);
        setMediaItems(finalMerged);
        setFolders(loadedFolders);

        // Sync to IndexedDB
        finalMerged.forEach((item) => MediaIndexedDbService.saveMedia(item).catch(() => {}));
      } catch (err) {
        console.warn('[MediaGallery] Failed to load server media sources:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadServerSources();

    // Cross-module media update listener
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

  // Recalculate folder item counts
  const foldersWithCounts = useMemo(() => {
    const counts = new Map<string, number>();
    mediaItems.forEach((item) => {
      if (item.folderId) {
        counts.set(item.folderId, (counts.get(item.folderId) || 0) + 1);
      }
    });
    return folders.map((f) => ({
      ...f,
      itemCount: counts.get(f.id) || 0,
    }));
  }, [folders, mediaItems]);

  const addMediaItems = async (
    newItems: MediaItem[],
    files?: (File | Blob)[],
    onProgress?: (fileIndex: number, pct: number) => void
  ) => {
    // 1. Optimistic Immediate Update in UI
    const enrichedItems = newItems.map((item) => {
      const { sourceModule, sourceModuleLabel } = detectSourceModule(item);
      return {
        ...item,
        folderId: item.folderId !== undefined ? item.folderId : activeFolderId,
        sourceModule: item.sourceModule || sourceModule,
        sourceModuleLabel: item.sourceModuleLabel || sourceModuleLabel,
      };
    });

    setMediaItems((prev) => {
      const map = new Map<string, MediaItem>();
      enrichedItems.forEach((it) => map.set(it.name.toLowerCase().trim(), it));
      prev.forEach((it) => {
        const k = it.name.toLowerCase().trim();
        if (!map.has(k)) map.set(k, it);
      });
      return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
    });

    // 2. Upload each file directly to Firebase Cloud Storage and save JSON to Firestore & IndexedDB
    const uploadPromises = enrichedItems.map(async (initialItem, index) => {
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
            await FirestoreMediaService.saveMediaItem(
              db,
              { mediaItems: 'sdo_media_items', folders: 'sdo_media_folders' },
              finalItem
            );
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
        prev.map((it) => (it.name.toLowerCase().trim() === finalItem.name.toLowerCase().trim() ? finalItem : it))
      );

      // Broadcast via global EventBus
      if (finalItem.url) {
        eventBus.emit('media:uploaded', {
          url: finalItem.url,
          fileName: finalItem.name,
          type: finalItem.type,
          sourceModule: finalItem.sourceModule,
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

    // Save tombstone in LocalStorage
    try {
      const existingDeleted = JSON.parse(localStorage.getItem('sdo_media_deleted_ids') || '[]');
      const updatedDeleted = Array.from(
        new Set([...existingDeleted, ...ids, ...toDelete.map((i) => i.name), ...toDelete.map((i) => i.id)])
      );
      localStorage.setItem('sdo_media_deleted_ids', JSON.stringify(updatedDeleted));
    } catch {}

    // Update UI immediately
    setMediaItems((prev) =>
      prev.filter((item) => !deleteIds.has(item.id) && !deleteNames.has(item.name.toLowerCase().trim()))
    );
    setSelectedIds([]);

    for (const item of toDelete) {
      await MediaIndexedDbService.deleteMedia(item.id);

      if (db) {
        try {
          await FirestoreMediaService.deleteMediaItem(db, collections, item.id);
          if (collections.mediaItems !== 'sdo_media_items') {
            await FirestoreMediaService.deleteMediaItem(
              db,
              { mediaItems: 'sdo_media_items', folders: 'sdo_media_folders' },
              item.id
            );
          }
        } catch (e) {}
      }

      if (firebaseApp) {
        try {
          await FirebaseStorageMediaService.deleteStorageFile(firebaseApp, item);
        } catch (e) {}
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sdo_media_deleted', { detail: { ids } }));
    }
  };

  const updateMediaItem = async (id: string, updates: Partial<MediaItem>) => {
    setMediaItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: Date.now() } : item))
    );

    if (focusedItem?.id === id) {
      setFocusedItem((prev) => (prev ? { ...prev, ...updates, updatedAt: Date.now() } : null));
    }

    if (db) {
      await FirestoreMediaService.updateMediaMetadata(db, collections, id, updates);
    }
  };

  const renameMediaItem = async (id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    const targetItem = mediaItems.find((i) => i.id === id);
    if (!targetItem) return;

    let finalName = trimmed;
    const origExt = targetItem.name.includes('.') ? targetItem.name.split('.').pop() : '';
    if (origExt && !finalName.includes('.')) {
      finalName = `${finalName}.${origExt}`;
    }

    const { type, mimeType } = FileCompressionService.detectFileType(finalName, targetItem.mimeType);

    const updates: Partial<MediaItem> = {
      name: finalName,
      type: targetItem.type && targetItem.type !== 'other' ? targetItem.type : type,
      mimeType: targetItem.mimeType || mimeType,
      updatedAt: Date.now(),
    };

    setMediaItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );

    if (focusedItem?.id === id) {
      setFocusedItem((prev) => (prev ? { ...prev, ...updates } : null));
    }

    const updatedItem = { ...targetItem, ...updates };
    await MediaIndexedDbService.saveMedia(updatedItem);

    if (db) {
      try {
        await FirestoreMediaService.updateMediaMetadata(db, collections, id, updates);
      } catch (e) {
        console.warn('[MediaGallery] Rename in Firestore error:', e);
      }
    }
  };

  // --- Folder Management Methods ---

  const createFolder = async (
    name: string,
    color: string = '#eab308',
    icon: string = 'Folder',
    parentId: string | null = null
  ): Promise<MediaFolder> => {
    const newFolder: MediaFolder = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: name.trim(),
      color,
      icon,
      parentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      itemCount: 0,
    };

    setFolders((prev) => [newFolder, ...prev]);
    await MediaIndexedDbService.saveFolder(newFolder);

    if (db) {
      try {
        await FirestoreMediaService.saveFolder(db, collections, newFolder);
      } catch (e) {
        console.warn('[MediaGallery] Error saving folder to Firestore:', e);
      }
    }

    return newFolder;
  };

  const updateFolder = async (id: string, updates: Partial<MediaFolder>) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates, updatedAt: Date.now() } : f))
    );

    const folderToUpdate = folders.find((f) => f.id === id);
    if (folderToUpdate) {
      const updated = { ...folderToUpdate, ...updates, updatedAt: Date.now() };
      await MediaIndexedDbService.saveFolder(updated);
      if (db) {
        try {
          await FirestoreMediaService.saveFolder(db, collections, updated);
        } catch (e) {}
      }
    }
  };

  const deleteFolder = async (id: string, deleteContents: boolean = false) => {
    const folder = folders.find((f) => f.id === id);
    if (!folder) return;

    if (deleteContents) {
      const itemsInFolder = mediaItems.filter((i) => i.folderId === id);
      if (itemsInFolder.length > 0) {
        await deleteMediaItems(itemsInFolder.map((i) => i.id));
      }
    } else {
      // Unlink items from folder, move back to root
      setMediaItems((prev) =>
        prev.map((item) => (item.folderId === id ? { ...item, folderId: null, folderName: undefined } : item))
      );
      if (db) {
        const itemsToUnlink = mediaItems.filter((i) => i.folderId === id);
        for (const it of itemsToUnlink) {
          FirestoreMediaService.updateMediaMetadata(db, collections, it.id, { folderId: null }).catch(() => {});
        }
      }
    }

    setFolders((prev) => prev.filter((f) => f.id !== id));
    if (activeFolderId === id) {
      setActiveFolderId(null);
    }

    await MediaIndexedDbService.deleteFolder(id);
    if (db) {
      try {
        await FirestoreMediaService.deleteFolder(db, collections, id);
      } catch (e) {}
    }
  };

  const moveItemsToFolder = async (itemIds: string[], targetFolderId: string | null) => {
    const targetFolder = targetFolderId ? folders.find((f) => f.id === targetFolderId) : null;
    const folderName = targetFolder ? targetFolder.name : undefined;

    setMediaItems((prev) =>
      prev.map((item) =>
        itemIds.includes(item.id)
          ? { ...item, folderId: targetFolderId, folderName, updatedAt: Date.now() }
          : item
      )
    );

    for (const id of itemIds) {
      const item = mediaItems.find((i) => i.id === id);
      if (item) {
        const updated = { ...item, folderId: targetFolderId, folderName, updatedAt: Date.now() };
        MediaIndexedDbService.saveMedia(updated).catch(() => {});
        if (db) {
          FirestoreMediaService.updateMediaMetadata(db, collections, id, {
            folderId: targetFolderId,
            updatedAt: Date.now(),
          }).catch(() => {});
        }
      }
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
        // Allowed Types
        if (config?.allowedTypes && config.allowedTypes.length > 0) {
          if (!config.allowedTypes.includes(item.type)) return false;
        }

        // Folder Filtering: if activeFolderId is set, show only items in this folder
        if (activeFolderId) {
          if (item.folderId !== activeFolderId) return false;
        }

        // Type Filter Tab
        if (filters.typeFilter !== 'all' && item.type !== filters.typeFilter) {
          return false;
        }

        // Source Module Filter
        if (filters.sourceModuleFilter && filters.sourceModuleFilter !== 'all') {
          if (item.sourceModule !== filters.sourceModuleFilter) return false;
        }

        // Search Query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchesName = item.name.toLowerCase().includes(q);
          const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(q));
          const matchesSource = item.sourceModuleLabel?.toLowerCase().includes(q);
          if (!matchesName && !matchesTags && !matchesSource) return false;
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
  }, [mediaItems, filters, activeFolderId, config?.allowedTypes]);

  return (
    <MediaGalleryContext.Provider
      value={{
        mediaItems,
        filteredItems,
        folders: foldersWithCounts,
        activeFolderId,
        setActiveFolderId,
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
        renameMediaItem,

        theme,
        setTheme,
        toggleTheme,

        createFolder,
        updateFolder,
        deleteFolder,
        moveItemsToFolder,

        isFolderModalOpen,
        setIsFolderModalOpen,
        editingFolder,
        setEditingFolder,
        isMoveModalOpen,
        setIsMoveModalOpen,
        itemsToMove,
        setItemsToMove,

        isSidebarOpen,
        setIsSidebarOpen,
        isInspectorOpen,
        setIsInspectorOpen,
        isUploaderOpen,
        setIsUploaderOpen,
        totalStorageBytes,
        focusedItem,
        setFocusedItem,

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