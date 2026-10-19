import React, { useState } from 'react';
import {
  X,
  Layers,
  Moon,
  Sun,
  SlidersHorizontal,
  Menu,
  Crown,
  CheckCircle2,
} from 'lucide-react';
import { MediaGalleryProvider, useMediaGallery } from '../context/MediaGalleryContext';
import { LuxuryIconsGallery } from './LuxuryIconsGallery';
import { MediaDriveSidebar } from './MediaDriveSidebar';
import { MediaGalleryGrid } from './MediaGalleryGrid';
import { MediaFileInspector } from './MediaFileInspector';
import { MediaUploader } from './MediaUploader';
import { MediaPreviewModal } from './MediaPreviewModal';
import { ImageConverterModal } from './ImageConverterModal';
import { FolderManagerModal } from './FolderManagerModal';
import { MoveToFolderModal } from './MoveToFolderModal';
import { BulkActionBar } from './BulkActionBar';
import { GeminiImageStudioModal } from './GeminiImageStudioModal';
import { DocumentViewerModal } from './DocumentViewerModal';
import { QuickImageEditorModal } from './QuickImageEditorModal';
import { QuickTextEditorModal } from './QuickTextEditorModal';
import { DocToLandingPageModal } from './DocToLandingPageModal';
import { MediaGalleryModuleConfig, MediaItem, MediaType } from '../types';

export interface MediaPickerModalProps extends MediaGalleryModuleConfig {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  allowedTypes?: MediaType[];
  initialTab?: 'gallery' | 'icons';
}

const MediaPickerModalContent: React.FC<{
  title: string;
  onClose: () => void;
  initialTab?: 'gallery' | 'icons';
}> = ({ title, onClose, initialTab = 'gallery' }) => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'icons'>(initialTab);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    theme,
    toggleTheme,
    isAiGeneratorOpen,
    setIsAiGeneratorOpen,
    aiGeneratorInitialImage,
    onSelectMedia,
    imageEditorItem,
    closeImageEditor,
    docViewerItem,
    closeDocViewer,
    textEditorItem,
    isTextEditorOpen,
    closeTextEditor,
    docToLandingItem,
    closeDocToLanding,
    setDocToLandingItem,
    selectedIds,
    mediaItems,
    maxSelectCount,
    clearSelection,
  } = useMediaGallery();
  const isLight = theme === 'light';

  return (
    <div
      className={`flex flex-col h-screen w-screen overflow-hidden transition-colors duration-200 ${
        isLight
          ? 'bg-slate-100 text-slate-900'
          : 'bg-slate-950 text-slate-100'
      }`}
      dir="rtl"
    >
      {/* 1. KOSUN2026 Sleek Top Bar */}
      <header
        className={`h-14 px-4 sm:px-6 border-b flex items-center justify-between flex-shrink-0 z-20 ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-800 shadow-sm'
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
              KosCloudStore - בחר קובץ קיים, ערוך תמונה או העלה קובץ חדש ישירות לרכיב המארח
            </p>
          </div>
        </div>

        {/* Gallery / Luxury Icons Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-700/60 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-amber-500 text-black shadow font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>קבצי מדיה</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('icons')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'icons'
                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow font-extrabold'
                : 'text-amber-400/90 hover:text-amber-300'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>אייקונים יוקרתיים</span>
          </button>
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

      {/* 2. Main Body Workspace */}
      {activeTab === 'icons' ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 flex flex-col items-center custom-scrollbar">
          <div className="w-full max-w-5xl">
            <LuxuryIconsGallery
              onSelectIcon={(svgDataUrl, iconName) => {
                onSelectMedia?.([
                  {
                    id: `icon_${Date.now()}`,
                    name: iconName,
                    url: svgDataUrl,
                    type: 'image',
                    mimeType: 'image/svg+xml',
                    sizeBytes: 1024,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    sourceModule: 'luxury-icons',
                    sourceModuleLabel: 'אייקונים וסמלים יוקרתיים',
                  },
                ]);
                onClose();
              }}
            />
          </div>
        </div>
      ) : (
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
      )}

      {/* 3. Modals & Bulk Actions */}
      <MediaPreviewModal />
      <ImageConverterModal />
      <FolderManagerModal />
      <MoveToFolderModal />
      <BulkActionBar />

      {/* 4. Connected In-Drive Editing & AI Modals */}
      <DocumentViewerModal
        item={docViewerItem}
        isOpen={Boolean(docViewerItem)}
        onClose={closeDocViewer}
        onOpenDocToLandingPage={(it) => setDocToLandingItem(it)}
        theme={theme}
      />
      <QuickImageEditorModal
        item={imageEditorItem}
        isOpen={Boolean(imageEditorItem)}
        onClose={closeImageEditor}
        theme={theme}
      />
      <QuickTextEditorModal
        item={textEditorItem}
        isOpen={isTextEditorOpen}
        onClose={closeTextEditor}
        theme={theme}
      />
      <DocToLandingPageModal
        item={docToLandingItem}
        isOpen={Boolean(docToLandingItem)}
        onClose={closeDocToLanding}
        theme={theme}
      />

      <GeminiImageStudioModal
        isOpen={isAiGeneratorOpen}
        onClose={() => setIsAiGeneratorOpen(false)}
        initialReferenceImage={aiGeneratorInitialImage}
        useButtonLabel="בחר והשתמש בתמונה זו"
        onUseImage={(imageUrl, metadata) => {
          if (onSelectMedia) {
            onSelectMedia([
              {
                id: `ai_${Date.now()}`,
                name: metadata.title || 'תמונת AI.png',
                url: imageUrl,
                thumbnailUrl: imageUrl,
                type: 'image',
                mimeType: 'image/png',
                sizeBytes: 1024 * 500,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                tags: metadata.tags,
                sourceModule: 'gemini-image-generation',
                sourceModuleLabel: 'מחולל תמונות Gemini AI',
              },
            ]);
          }
          setIsAiGeneratorOpen(false);
        }}
      />

      {/* 5. Sticky Selection Footer Bar */}
      <footer
        className={`h-16 px-4 sm:px-6 border-t flex items-center justify-between flex-shrink-0 z-30 transition-colors ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]'
            : 'bg-slate-900/95 border-slate-800 text-white shadow-[0_-4px_25px_rgba(0,0,0,0.4)]'
        }`}
      >
        <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                selectedIds.length > 0
                  ? 'bg-amber-500 text-black'
                  : isLight
                  ? 'bg-slate-200 text-slate-500'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {selectedIds.length}
            </span>
            <div className="text-xs">
              <span className="font-bold">
                {selectedIds.length === 0
                  ? 'לא נבחרו קבצים עדיין'
                  : selectedIds.length === 1
                  ? 'נבחר קובץ 1'
                  : `נבחרו ${selectedIds.length} קבצים`}
              </span>
              {maxSelectCount && maxSelectCount > 1 && (
                <span className={`text-[11px] mr-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  (עד {maxSelectCount} קבצים)
                </span>
              )}
            </div>
          </div>

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={clearSelection}
              className="text-[11px] text-red-400 hover:text-red-300 underline mr-2"
            >
              נקה בחירה
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            ביטול
          </button>

          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={() => {
              const selectedItems = mediaItems.filter((it) => selectedIds.includes(it.id));
              if (selectedItems.length > 0 && onSelectMedia) {
                onSelectMedia(selectedItems);
              }
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              selectedIds.length > 0
                ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400 hover:from-yellow-400 hover:to-amber-400 text-black shadow-yellow-500/20 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>אישור בחירה והחלה ({selectedIds.length})</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  title = 'KosCloudStore - בחר קובץ מהענן',
  allowedTypes,
  initialTab,
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
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in text-slate-100"
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
        <MediaPickerModalContent title={title} onClose={onClose} initialTab={initialTab} />
      </MediaGalleryProvider>
    </div>
  );
};