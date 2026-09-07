import React, { useMemo } from 'react';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { AuthPortalProvider } from './context/AuthPortalContext';
import { AuthPortalRoutes } from './routes/ModuleRoutes';

export const AuthPortalStandaloneView: React.FC = () => {
  const firebaseApp = useMemo<FirebaseApp | undefined>(() => {
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
    } catch {
      return undefined;
    }
  }, []);

  return (
    <AuthPortalProvider
      config={{
        firebaseApp,
        databaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)',
        collectionPrefix: 'mod_auth_',
      }}
    >
      <AuthPortalRoutes />
    </AuthPortalProvider>
  );
};

export default AuthPortalStandaloneView;
