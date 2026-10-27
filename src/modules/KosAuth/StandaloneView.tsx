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
