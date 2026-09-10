import React, { useMemo, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  Layers,
  UploadCloud,
  FolderPlus,
  Menu,
  X,
  HardDrive,
  SlidersHorizontal,
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

const MediaGalleryHubContent: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-yellow-500 selection:text-black" dir="rtl">
      {/* 1. Ultra-Sleek Top Bar (Only 52px height) */}
      <header className="h-14 px-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between flex-shrink-0 z-20">
        {/* Logo & Drive Title */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-yellow-500 via-amber-500 to-yellow-400 text-black flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.4)]">
            <Layers className="w-4 h-4" />
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <h1 className="text-sm sm:text-base font-black text-white">Drive Vault</h1>
            <span className="bg-yellow-500/20 text-yellow-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-yellow-500/40 hidden sm:inline-block">
              Universal Storage
            </span>
          </div>
        </div>

        {/* Top Right Status & Quick Info */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse text-xs">
          <div className="hidden sm:flex items-center space-x-2 rtl:space-x-reverse text-slate-400 text-[11px] bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Cloud Vault Sync</span>
          </div>
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
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-3 sm:p-4 space-y-4 custom-scrollbar bg-slate-950">
          {/* Uploader (Floating overlay & collapsible tray) */}
          <MediaUploader />

          {/* Core Explorer Grid / List */}
          <MediaGalleryGrid />
        </main>

        {/* Right Details Inspector Pane */}
        <MediaFileInspector />
      </div>

      {/* 3. Global Modals & Bulk Actions */}
      <MediaPreviewModal />
      <ImageConverterModal />
      <FolderManagerModal />
      <MoveToFolderModal />
      <BulkActionBar />
    </div>
  );
};

export const MediaGalleryHubStandaloneView: React.FC = () => {
  const firebaseApp = useMemo(() => {
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
      console.warn('[MediaGalleryHub] Firebase init fallback:', e);
      return undefined;
    }
  }, []);

  const db = useMemo(() => {
    if (!firebaseApp) return undefined;
    try {
      const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID;
      return databaseId && databaseId !== '(default)'
        ? getFirestore(firebaseApp, databaseId)
        : getFirestore(firebaseApp);
    } catch (e) {
      console.warn('[MediaGalleryHub] Firestore init fallback:', e);
      return undefined;
    }
  }, [firebaseApp]);

  return (
    <MediaGalleryProvider
      config={{
        firebaseApp,
        db,
        collectionPrefix: 'sdo_media_',
      }}
    >
      <MediaGalleryHubContent />
    </MediaGalleryProvider>
  );
};

export default MediaGalleryHubStandaloneView;