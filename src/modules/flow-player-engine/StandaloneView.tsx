import React, { useMemo, useEffect } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { FlowPlayerModuleProvider } from './context/ModuleContext';
import { FlowPlayerRoutes } from './routes/ModuleRoutes';
import { DEFAULT_CAMPAIGN_CONFIG } from './config';
import { ensureAnonymousAuth } from '../../services/firebaseAuth';

const FALLBACK_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyD3c5Xw3ybrPg68BlmO3g9KwGaiqssmqws',
  authDomain: 'aioffice-1426f.firebaseapp.com',
  projectId: 'aioffice-1426f',
  storageBucket: 'aioffice-1426f.firebasestorage.app',
  messagingSenderId: '485069254738',
  appId: '1:485069254738:web:839cab90b6a4d201a7af8b',
  measurementId: 'G-31LX81VN8B',
};

export const FlowPlayerEngineStandaloneView: React.FC = () => {
  // Initialize Firebase App safely
  const firebaseApp = useMemo<FirebaseApp | undefined>(() => {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || FALLBACK_FIREBASE_CONFIG.apiKey;
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || FALLBACK_FIREBASE_CONFIG.projectId;

    const firebaseConfig = {
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || FALLBACK_FIREBASE_CONFIG.authDomain,
      projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || FALLBACK_FIREBASE_CONFIG.storageBucket,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || FALLBACK_FIREBASE_CONFIG.messagingSenderId,
      appId: import.meta.env.VITE_FIREBASE_APP_ID || FALLBACK_FIREBASE_CONFIG.appId,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || FALLBACK_FIREBASE_CONFIG.measurementId,
    };

    try {
      const existingApps = getApps();
      if (existingApps.length > 0) {
        return existingApps[0];
      }
      return initializeApp(firebaseConfig);
    } catch {
      try {
        return getApp();
      } catch {
        return initializeApp(firebaseConfig, 'flow-player-app');
      }
    }
  }, []);

  const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID;
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

  useEffect(() => {
    if (firebaseApp) {
      ensureAnonymousAuth(firebaseApp);
    }
  }, [firebaseApp]);

  return (
    <FlowPlayerModuleProvider
      config={{
        firebaseApp,
        databaseId,
        collectionPrefix: 'sdo_player_',
        geminiApiKey,
        initialCampaign: DEFAULT_CAMPAIGN_CONFIG,
      }}
    >
      <div className="w-full min-h-[calc(100vh-80px)] bg-slate-950 flex flex-col items-center justify-center p-2 sm:p-4 text-slate-100">
        <FlowPlayerRoutes />
      </div>
    </FlowPlayerModuleProvider>
  );
};