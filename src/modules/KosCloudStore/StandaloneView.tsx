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

      {/* 1. Floating Capsule Menu Trigger (fixed top-4 right-4, Official Kosun Symbol + English name) */}
      <div className="fixed top-4 right-4 z-40">
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(true)}
          className="h-10 px-3.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-slate-900 dark:text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <img
            src="/images/kosun-symbol.svg"
            onError={(e: any) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/kosun-official-logo.png';
            }}
            alt="KOSUN"
            className="w-5 h-5 object-contain"
          />
          <span className="font-extrabold text-xs tracking-tight">KosCloudStore</span>
          <Menu className="w-4 h-4 text-slate-400 mr-1" />
        </button>
      </div>

      {/* 2. Slide-over Navigation Drawer */}
      {isMobileSidebarOpen && (
        <MediaDriveSidebar
          isOpenMobile={true}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* 3. Main Workspace Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
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