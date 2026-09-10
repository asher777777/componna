import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';

export type MediaType = 'video' | 'image' | 'audio' | 'document' | 'archive' | 'code' | 'other';

export interface MediaFolder {
  id: string;
  name: string;
  parentId?: string | null;
  color?: string;
  icon?: string;
  sourceModule?: string;
  createdAt: number;
  updatedAt?: number;
  itemCount?: number;
}

export interface MediaItem {
  id: string;
  name: string;
  type: MediaType;
  mimeType: string;
  url: string; // Object URL or Remote URL
  thumbnailUrl?: string;
  sizeBytes: number;
  durationSec?: number; // For video & audio
  width?: number; // For image & video
  height?: number; // For image & video
  createdAt: number;
  updatedAt?: number;
  tags?: string[];
  description?: string;
  folderId?: string | null;
  folderName?: string;
  sourceModule?: string; // Module ID where file was created/uploaded e.g. 'video-producer-studio'
  sourceModuleLabel?: string; // Hebrew human-readable name e.g. 'סטודיו וידאו ואווטאר'
  isFavorite?: boolean;
  metadata?: Record<string, any>;
}

export interface MediaUploadProgress {
  id: string;
  fileName: string;
  type: MediaType;
  progressPercent: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

export interface ImageConversionOptions {
  targetFormat: 'image/png' | 'image/jpeg' | 'image/webp';
  quality: number; // 0.1 to 1.0
  maxWidth?: number;
  maxHeight?: number;
  preserveAspectRatio?: boolean;
}

export interface MediaFilterOptions {
  searchQuery: string;
  typeFilter: 'all' | MediaType;
  sortBy: 'date_desc' | 'date_asc' | 'size_desc' | 'name_asc';
  selectedTag?: string;
  folderId?: string | null; // null/undefined means root or all depending on view
  sourceModuleFilter?: 'all' | string;
}

export interface MediaGalleryCollectionsConfig {
  mediaItems?: string;
  folders?: string;
}

export interface MediaGalleryModuleConfig {
  firebaseApp?: FirebaseApp;
  db?: Firestore;
  databaseId?: string;
  collectionPrefix?: string;
  customCollections?: MediaGalleryCollectionsConfig;
  initialItems?: MediaItem[];
  selectionMode?: boolean; // When opened as a picker
  allowedTypes?: MediaType[];
  maxSelectCount?: number;
  defaultFolderId?: string;
  onSelectMedia?: (items: MediaItem[]) => void;
  onClosePicker?: () => void;
}