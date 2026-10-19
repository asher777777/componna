export * from './types';
export * from './config';
export * from './context/MediaGalleryContext';
export * from './hooks';
export * from './api';
export * from './routes';

// Services
export * from './services/imageConverterService';
export * from './services/firestoreMediaService';
export * from './services/firebaseStorageMediaService';
export * from './services/mediaIndexedDbService';
export * from './services/geminiImageService';
export * from './services/geminiPromptAssistant';
export * from './services/backgroundRemovalService';
export * from './services/fileCompressionService';

// Components
export * from './components/MediaUploader';
export * from './components/MediaGalleryGrid';
export * from './components/MediaPreviewModal';
export * from './components/ImageConverterModal';
export * from './components/GeminiImageStudioModal';
export * from './components/MediaPickerModal';
export * from './components/MediaPickerHostBridge';
export * from './components/LuxuryIconsGallery';
export * from './components/BulkActionBar';
export * from './components/DocumentViewerModal';
export * from './components/QuickImageEditorModal';
export * from './components/QuickTextEditorModal';
export * from './components/DocToLandingPageModal';
export * from './components/MobileMediaGalleryGrid';
export * from './components/MobileMediaPreviewModal';
export * from './components/MobileUploadFab';
export * from './components/MobileDriveBottomNav';

// UI Capability Slots Registration (Zero Cross-Module UI Bridge)
import { registerCapabilityUI } from '../../core/bridge/CapabilitySlot';
import { MediaPickerModal } from './components/MediaPickerModal';
import { MediaGalleryGrid } from './components/MediaGalleryGrid';
import { LuxuryIconsGallery } from './components/LuxuryIconsGallery';

registerCapabilityUI('media-picker', MediaPickerModal);
registerCapabilityUI('media-gallery', MediaGalleryGrid);
registerCapabilityUI('luxury-icons-gallery', LuxuryIconsGallery);
registerCapabilityUI('community-gallery-picker', MediaPickerModal);

export {
  KosCloudStoreStandaloneView,
  KosCloudStoreStandaloneView as default,
  MediaGalleryHubStandaloneView,
} from './StandaloneView';