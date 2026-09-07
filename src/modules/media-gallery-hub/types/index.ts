import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';

export type MediaType = 'video' | 'image' | 'audio' | 'other';

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
  folderId?: string;
  isFavorite?: boolean;
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
  onSelectMedia?: (items: MediaItem[]) => void;
  onClosePicker?: () => void;
}