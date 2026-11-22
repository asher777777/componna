import React from 'react';
import { getApps, initializeApp } from 'firebase/app';
import { useSystemConnection } from '../../core/connection/SystemConnectionContext';
import { KosProjectsProvider } from './context/KosProjectsContext';
import { KosProjectsRoutes } from './routes';

let standaloneApp = getApps().length > 0 ? getApps()[0] : undefined;
try {
  if (!standaloneApp && import.meta.env.VITE_FIREBASE_API_KEY) {
    standaloneApp = initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    });
  }
} catch (err) {
  console.warn('Could not initialize standalone Firebase App in KosProjects:', err);
}

export const KosProjectsStandaloneView: React.FC = () => {
  const sys = useSystemConnection();
  const firebaseApp = sys?.firebaseApp || standaloneApp;

  return (
    <KosProjectsProvider firebaseApp={firebaseApp}>
      <KosProjectsRoutes />
    </KosProjectsProvider>
  );
};

export default KosProjectsStandaloneView;
