import React, { useMemo, useState, useRef } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { useOptionalSystemConnection } from '../../core/connection/SystemConnectionContext';
import {
  Layers,
  UploadCloud,
  FolderPlus,
  Menu,
  X,
  HardDrive,
  SlidersHorizontal,
  Sun,
  Moon,
  Sparkles,
  LayoutGrid,
  List as ListIcon,
  Search,
} from 'lucide-react';
import { MediaGalleryProvider } from './context/MediaGalleryContext';
import { MediaDriveSidebar } from './components/MediaDriveSidebar';
import { MediaGalleryGrid } from './components/MediaGalleryGrid';
import { MediaFileInspector } from './components/MediaFileInspector';
import { MediaUploader } from './components/MediaUploader';
import { MediaPreviewModal } from './components/MediaPreviewModal';
import { ImageConverterModal } from './components/ImageConverterModal';
import { FolderManagerModal } from './components/FolderManagerModal';
import { MoveToFolderModal } from './components/MoveToFolderModal';
import { BulkActionBar } from './components/BulkActionBar';
import { GeminiImageStudioModal } from './components/GeminiImageStudioModal';

// Mobile & In-Drive Studio Components
import { MobileUploadFab } from './components/MobileUploadFab';
import { MobileDriveBottomNav, MobileDriveTab } from './components/MobileDriveBottomNav';
import { MobileMediaGalleryGrid } from './components/MobileMediaGalleryGrid';
import { MobileMediaPreviewModal } from './components/MobileMediaPreviewModal';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { QuickImageEditorModal } from './components/QuickImageEditorModal';
import { QuickTextEditorModal } from './components/QuickTextEditorModal';
import { DocToLandingPageModal } from './components/DocToLandingPageModal';
import { KosunUniversalDock } from '../../components/Navigation/KosunUniversalDock';

import { useMediaGallery } from './context/MediaGalleryContext';
import { useMediaUploader } from './hooks/useMediaUploader';
import { MediaItem } from './types';

const KosCloudStoreContent: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<MobileDriveTab>('recents');
  const [mobileViewMode, setMobileViewMode] = useState<'grid' | 'list'>('grid');
  const [mobilePreviewItem, setMobilePreviewItem] = useState<MediaItem | null>(null);

  const {
    mediaItems,
    filteredItems,
    selectedIds,
    toggleSelect,
    isSidebarOpen,
    setIsSidebarOpen,
    isInspectorOpen,
    setIsInspectorOpen,
    theme,
    toggleTheme,
    isAiGeneratorOpen,
    setIsAiGeneratorOpen,
    aiGeneratorInitialImage,
    openAiImageGenerator,
    setFilters,
    setActiveFolderId,
    deleteMediaItems,
    setPreviewItem,

    // In-Drive Editing & Viewer Modals from Context
    imageEditorItem,
    closeImageEditor,
    openImageEditor,
    docViewerItem,
    closeDocViewer,
    openDocViewer,
    textEditorItem,
    isTextEditorOpen,
    closeTextEditor,
    openTextEditor,
    docToLandingItem,
    closeDocToLanding,
    openDocToLanding,
  } = useMediaGallery();
  const isLight = theme === 'light';

  // Hidden native file inputs for Mobile FAB triggers
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

  const { processAndUploadFiles } = useMediaUploader();

  const handleMobileTabChange = (tab: MobileDriveTab) => {
    setMobileActiveTab(tab);
    if (tab === 'recents') {
      setActiveFolderId(null);
      setFilters((prev) => ({ ...prev, typeFilter: 'all', sortBy: 'date_desc' }));
    } else if (tab === 'folders') {
      setActiveFolderId(null);
      setIsMobileSidebarOpen(true);
    } else if (tab === 'documents') {
      setActiveFolderId(null);
      setFilters((prev) => ({ ...prev, typeFilter: 'pdf' }));
    } else if (tab === 'ai_studio') {
      openAiImageGenerator();
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processAndUploadFiles(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div
      className={`flex flex-col h-screen max-h-screen overflow-hidden font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200 ${
        isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}
      dir="rtl"
    >
      {/* Hidden File Inputs for Native Mobile Camera & Picker */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileInputChange}
      />
      <input
        ref={scanInputRef}
        type="file"
        accept="image/*,application/pdf"
        capture="environment"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* 1. KOSUN2026 Minimalist Header / Glass Bar */}
      <header
        className={`h-14 px-4 sm:px-6 border-b flex items-center justify-between flex-shrink-0 z-20 transition-colors ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-800 shadow-sm'
            : 'bg-slate-900/95 border-slate-800 text-white'
        }`}
      >
        {/* Logo & KosCloudStore Title */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
          {/* Mobile drawer toggle */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className={`md:hidden p-1.5 rounded-xl transition-colors cursor-pointer ${
              isLight
                ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="תפריט תיקיות וניווט"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0">
            <HardDrive className="w-4 h-4" />
          </div>

          <div className="truncate">
            <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
              <span className="font-black text-sm sm:text-base tracking-tight text-indigo-600 dark:text-indigo-400">
                KosCloudStore
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 hidden sm:inline">
                2026
              </span>
            </div>
            <p className={`text-[11px] truncate hidden sm:block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              כספת ענן חכמה, סטודיו עריכת מדיה ומסמכים
            </p>
          </div>
        </div>

        {/* Top Controls & Toggles */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs shrink-0">
          {/* Mobile view mode toggle (grid vs list) */}
          <div className="md:hidden flex items-center bg-slate-800/60 p-1 rounded-xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => setMobileViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                mobileViewMode === 'grid' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="תצוגת גריד"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setMobileViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                mobileViewMode === 'list' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="תצוגת רשימה"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
            }`}
            title={isLight ? 'מעבר למצב לילה' : 'מעבר למצב יום'}
          >
            {isLight ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-sky-400" />}
          </button>

          {/* Sidebar Toggle (Desktop) - Icon only with tooltip */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`hidden md:flex p-2 rounded-xl border text-xs items-center justify-center transition-colors cursor-pointer ${
              isSidebarOpen
                ? isLight
                  ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow'
            }`}
            title={isSidebarOpen ? 'הסתר סרגל צדדי' : 'הצג סרגל צדדי'}
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </button>

          {/* Cloud Sync Status Indicator */}
          <div className="hidden sm:flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>מאובטח בענן</span>
          </div>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Navigation Sidebar (Desktop & Mobile Drawer) */}
        <MediaDriveSidebar
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Center Explorer Main View */}
        <main
          className={`flex-1 flex flex-col min-w-0 overflow-y-auto p-3 sm:p-4 space-y-4 pb-28 md:pb-8 custom-scrollbar transition-colors ${
            isLight ? 'bg-slate-100/70' : 'bg-slate-950'
          }`}
        >
          {/* Uploader (collapsible tray) */}
          <MediaUploader />

          {/* Desktop File Explorer Grid / List */}
          <div className="hidden md:block">
            <MediaGalleryGrid />
          </div>

          {/* Mobile File Explorer (Clean 2-column Touch Grid or Drive List) */}
          <div className="block md:hidden">
            <MobileMediaGalleryGrid
              items={filteredItems}
              selectedIds={selectedIds}
              viewMode={mobileViewMode}
              onToggleSelect={toggleSelect}
              onPreview={(item) => {
                setMobilePreviewItem(item);
              }}
              onEditImage={(item) => openImageEditor(item)}
              onEditDoc={(item) => openDocViewer(item)}
              onDocToLandingPage={(item) => openDocToLanding(item)}
              theme={theme}
            />
          </div>
        </main>

        {/* Right Details Inspector Pane (Desktop) */}
        <MediaFileInspector />
      </div>

      {/* 3. Mobile FAB & Bottom Navigation Bar */}
      <MobileUploadFab
        onCaptureCamera={() => cameraInputRef.current?.click()}
        onScanReceipt={() => scanInputRef.current?.click()}
        onUploadFile={() => fileInputRef.current?.click()}
        onOpenAiStudio={() => openAiImageGenerator()}
        onCreateNewNote={() => openTextEditor()}
        theme={theme}
      />
      <MobileDriveBottomNav
        activeTab={mobileActiveTab}
        onTabChange={handleMobileTabChange}
        theme={theme}
      />

      {/* 4. Global Modals & Bulk Actions */}
      <MediaPreviewModal />
      <MobileMediaPreviewModal
        items={mobilePreviewItem ? [mobilePreviewItem] : []}
        initialIndex={0}
        isOpen={Boolean(mobilePreviewItem)}
        onClose={() => setMobilePreviewItem(null)}
        onEditImage={(it) => {
          setMobilePreviewItem(null);
          openImageEditor(it);
        }}
        theme={theme}
      />
      <ImageConverterModal />
      <FolderManagerModal />
      <MoveToFolderModal />
      <BulkActionBar />

      {/* 5. In-Drive Editing & AI Modals */}
      <DocumentViewerModal
        item={docViewerItem}
        isOpen={Boolean(docViewerItem)}
        onClose={closeDocViewer}
        onOpenDocToLandingPage={(it) => openDocToLanding(it)}
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
      />

      {/* 6. KOSUN2026 Exclusive Universal Floating Dock */}
      <KosunUniversalDock mode="backoffice" />
    </div>
  );
};

export const KosCloudStoreStandaloneView: React.FC = () => {
  const systemConn = useOptionalSystemConnection();

  const firebaseApp = useMemo(() => {
    if (systemConn?.firebaseApp) {
      return systemConn.firebaseApp;
    }
    const existingApps = getApps();
    if (existingApps.length > 0) {
      return existingApps[0];
    }

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyC011dhtJddDjLmTQ2HCvgVA0DPN8rKFwQ',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'glowmanage.firebaseapp.com',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'glowmanage',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'glowmanage.firebasestorage.app',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '174552708887',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:174552708887:web:70b91e3994c66db0336952',
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-FCJ0889DPN',
    };

    try {
      return initializeApp(firebaseConfig);
    } catch (e) {
      console.warn('[KosCloudStore] Firebase init fallback:', e);
      return undefined;
    }
  }, [systemConn?.firebaseApp]);

  const db = useMemo(() => {
    if (systemConn?.db) {
      return systemConn.db;
    }
    if (!firebaseApp) return undefined;
    try {
      const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID;
      return databaseId && databaseId !== '(default)'
        ? getFirestore(firebaseApp, databaseId)
        : getFirestore(firebaseApp);
    } catch (e) {
      console.warn('[KosCloudStore] Firestore init fallback:', e);
      return undefined;
    }
  }, [systemConn?.db, firebaseApp]);

  return (
    <MediaGalleryProvider
      config={{
        firebaseApp,
        db,
        collectionPrefix: 'sdo_media_',
      }}
    >
      <KosCloudStoreContent />
    </MediaGalleryProvider>
  );
};

// Aliases for seamless backward compatibility
export const MediaGalleryHubStandaloneView = KosCloudStoreStandaloneView;
export default KosCloudStoreStandaloneView;