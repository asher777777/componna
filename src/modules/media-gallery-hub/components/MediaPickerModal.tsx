import React, { useState } from 'react';
import {
  X,
  Layers,
  Moon,
  Sun,
  SlidersHorizontal,
  Menu,
} from 'lucide-react';
import { MediaGalleryProvider, useMediaGallery } from '../context/MediaGalleryContext';
import { MediaDriveSidebar } from './MediaDriveSidebar';
import { MediaGalleryGrid } from './MediaGalleryGrid';
import { MediaFileInspector } from './MediaFileInspector';
import { MediaUploader } from './MediaUploader';
import { MediaPreviewModal } from './MediaPreviewModal';
import { ImageConverterModal } from './ImageConverterModal';
import { FolderManagerModal } from './FolderManagerModal';
import { MoveToFolderModal } from './MoveToFolderModal';
import { BulkActionBar } from './BulkActionBar';
import { MediaGalleryModuleConfig, MediaItem, MediaType } from '../types';

export interface MediaPickerModalProps extends MediaGalleryModuleConfig {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  allowedTypes?: MediaType[];
}

const MediaPickerModalContent: React.FC<{
  title: string;
  onClose: () => void;
}> = ({ title, onClose }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { isSidebarOpen, setIsSidebarOpen, theme, toggleTheme } = useMediaGallery();
  const isLight = theme === 'light';

  return (
    <div
      className={`flex flex-col h-[90vh] max-h-[92vh] w-full max-w-7xl rounded-3xl overflow-hidden border shadow-2xl transition-colors duration-200 ${
        isLight
          ? 'bg-slate-100 text-slate-900 border-slate-300'
          : 'bg-slate-950 text-slate-100 border-slate-700/80'
      }`}
      dir="rtl"
    >
      {/* 1. Modal Top Bar */}
      <header
        className={`h-14 px-4 sm:px-6 border-b flex items-center justify-between flex-shrink-0 z-20 ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-800'
            : 'bg-slate-900/95 border-slate-800 text-white'
        }`}
      >
        {/* Title & Icon */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className={`md:hidden p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight
                ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-yellow-500 via-amber-500 to-yellow-400 text-black flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.4)] shrink-0">
            <Layers className="w-4 h-4" />
          </div>

          <div className="truncate">
            <h2 className={`text-sm sm:text-base font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {title}
            </h2>
            <p className={`text-[11px] truncate hidden sm:block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              בחר קובץ קיים מהגלריה או העלה קובץ חדש ישירות לסצנה
            </p>
          </div>
        </div>

        {/* Controls & Close */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs shrink-0">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
            }`}
            title={isLight ? 'מעבר למצב לילה' : 'מעבר למצב יום'}
          >
            {isLight ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Sidebar visibility toggle */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 rtl:space-x-reverse transition-colors cursor-pointer ${
              isSidebarOpen
                ? isLight
                  ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow'
            }`}
            title={isSidebarOpen ? 'הסתר סרגל ניווט' : 'הצג סרגל ניווט'}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">{isSidebarOpen ? 'הסתר סרגל' : 'סרגל ניווט'}</span>
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/40 rounded-xl border border-transparent transition-colors cursor-pointer"
            title="סגור חלון"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-red-400" />
          </button>
        </div>
      </header>

      {/* 2. Main 3-Pane Body Workspace */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Navigation Sidebar */}
        <MediaDriveSidebar
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Center Explorer Main View */}
        <main
          className={`flex-1 flex flex-col min-w-0 overflow-y-auto p-3 sm:p-4 space-y-4 custom-scrollbar transition-colors ${
            isLight ? 'bg-slate-100/70' : 'bg-slate-950'
          }`}
        >
          {/* Uploader */}
          <MediaUploader />

          {/* Core Explorer Grid / List */}
          <MediaGalleryGrid />
        </main>

        {/* Right Details Inspector Pane */}
        <MediaFileInspector />
      </div>

      {/* 3. Modals & Bulk Actions */}
      <MediaPreviewModal />
      <ImageConverterModal />
      <FolderManagerModal />
      <MoveToFolderModal />
      <BulkActionBar />
    </div>
  );
};

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
      <MediaGalleryProvider
        config={{
          ...restConfig,
          selectionMode: true,
          allowedTypes,
          onSelectMedia: handleSelectAndClose,
          onClosePicker: onClose,
        }}
      >
        <MediaPickerModalContent title={title} onClose={onClose} />
      </MediaGalleryProvider>
    </div>
  );
};