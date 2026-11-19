import React from 'react';
import { CrmAnalyticsProvider } from './context/CrmAnalyticsContext';
import { CrmAnalyticsMainView } from './components/CrmAnalyticsMainView';
import { getApps, initializeApp } from 'firebase/app';
import { useSystemConnection } from '../../core/connection/SystemConnectionContext';

// Safe standalone Firebase initialization from environment variables if present
let fallbackApp = getApps().length > 0 ? getApps()[0] : undefined;
try {
  if (!fallbackApp && import.meta.env.VITE_FIREBASE_API_KEY) {
    fallbackApp = initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    });
  }
} catch (e) {
  console.warn('Could not initialize standalone Firebase App in CrmAnalytics:', e);
}

export const CrmAnalyticsStandaloneView: React.FC<{ ownerId?: string }> = ({ ownerId }) => {
  const { firebaseApp: systemApp } = useSystemConnection();
  const effectiveApp = systemApp || (getApps().length > 0 ? getApps()[0] : undefined) || fallbackApp;

  return (
    <CrmAnalyticsProvider firebaseApp={effectiveApp} ownerId={ownerId}>
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <CrmAnalyticsMainView />
      </div>
    </CrmAnalyticsProvider>
  );
};
