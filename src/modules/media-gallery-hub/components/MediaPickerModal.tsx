import React from 'react';
import { X, Layers } from 'lucide-react';
import { MediaGalleryProvider } from '../context/MediaGalleryContext';
import { MediaUploader } from './MediaUploader';
import { MediaGalleryGrid } from './MediaGalleryGrid';
import { MediaPreviewModal } from './MediaPreviewModal';
import { ImageConverterModal } from './ImageConverterModal';
import { BulkActionBar } from './BulkActionBar';
import { MediaGalleryModuleConfig, MediaItem, MediaType } from '../types';

export interface MediaPickerModalProps extends MediaGalleryModuleConfig {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  allowedTypes?: MediaType[];
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  title = 'בחר קובץ מגלריית המדיה',
  allowedTypes,
  onSelectMedia,
  ...restConfig
}) => {
  if (!isOpen) return null;

  const handleSelectAndClose = (items: MediaItem[]) => {
    if (onSelectMedia) {
      onSelectMedia(items);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in text-slate-100"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl max-h-[94vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">{title}</h2>
              <p className="text-xs text-slate-400">בחר קובץ קיים מהגלריה או העלה קובץ חדש</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
          <MediaGalleryProvider
            config={{
              ...restConfig,
              selectionMode: true,
              allowedTypes,
              onSelectMedia: handleSelectAndClose,
              onClosePicker: onClose,
            }}
          >
            <MediaUploader />
            <MediaGalleryGrid />
            <MediaPreviewModal />
            <ImageConverterModal />
            <BulkActionBar />
          </MediaGalleryProvider>
        </div>
      </div>
    </div>
  );
};