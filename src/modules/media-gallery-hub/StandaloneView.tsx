import React, { useMemo, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { Sparkles, Layers, HardDrive } from 'lucide-react';
import { MediaGalleryProvider } from './context/MediaGalleryContext';
import { MediaUploader } from './components/MediaUploader';
import { MediaGalleryGrid } from './components/MediaGalleryGrid';
import { MediaPreviewModal } from './components/MediaPreviewModal';
import { ImageConverterModal } from './components/ImageConverterModal';
import { BulkActionBar } from './components/BulkActionBar';
import { ensureAnonymousAuth } from '../../services/firebaseAuth';

export const MediaGalleryHubStandaloneView: React.FC = () => {
  const firebaseApp = useMemo(() => {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      return existingApps[0];
    }

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD3c5Xw3ybrPg68BlmO3g9KwGaiqssmqws',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'aioffice-1426f.firebaseapp.com',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'aioffice-1426f',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'aioffice-1426f.firebasestorage.app',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '485069254738',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:485069254738:web:839cab90b6a4d201a7af8b',
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-31LX81VN8B',
    };

    try {
      return initializeApp(firebaseConfig);
    } catch (e) {
      console.warn('[MediaGalleryHub] Firebase init fallback:', e);
      return undefined;
    }
  }, []);

  useEffect(() => {
    if (firebaseApp) {
      ensureAnonymousAuth(firebaseApp);
    }
  }, [firebaseApp]);

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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans selection:bg-yellow-500 selection:text-black" dir="rtl">
      <MediaGalleryProvider
        config={{
          firebaseApp,
          db,
          collectionPrefix: 'sdo_media_',
        }}
      >
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Main Top Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-yellow-500 via-amber-500 to-yellow-400 text-black flex items-center justify-center shadow-[0_0_25px_rgba(234,179,8,0.4)]">
                <Layers className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <h1 className="text-xl sm:text-2xl font-black text-white">מנהל מדיה וגלריה אוניברסלי</h1>
                  <span className="bg-yellow-500/20 text-yellow-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-yellow-500/40">
                    Media Vault v1.0
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  העלאה מרובה, גלריית סרטונים, תמונות וקבצי קול, המרת פורמטים והורדה מרוכזת
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{db ? 'מחובר ל-Firestore (sdo_media_items)' : 'מצב מקומי Standalone'}</span>
            </div>
          </div>

          {/* Section 1: Upload Dropzone */}
          <MediaUploader />

          {/* Section 2: Media Gallery */}
          <MediaGalleryGrid />

          {/* Modals & Bulk Actions */}
          <MediaPreviewModal />
          <ImageConverterModal />
          <BulkActionBar />
        </div>
      </MediaGalleryProvider>
    </div>
  );
};

export default MediaGalleryHubStandaloneView;