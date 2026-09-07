import React, { useMemo } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { TemplateModuleProvider } from './context/ModuleContext';
import { TemplateModuleRoutes } from './routes/ModuleRoutes';
import { TemplateModuleConfig } from './types';

export const TemplateStandaloneView: React.FC = () => {
  const firebaseApp = useMemo(() => {
    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    if (!config.apiKey || !config.projectId) {
      return undefined;
    }

    const appName = 'TemplateModuleDevApp';
    return getApps().some((a) => a.name === appName)
      ? getApp(appName)
      : initializeApp(config, appName);
  }, []);

  const moduleConfig: TemplateModuleConfig = {
    firebaseApp,
    collectionPrefix: 'mod_template_',
    functionsBaseUrl: import.meta.env.VITE_FUNCTIONS_BASE_URL,
  };

  return (
    <TemplateModuleProvider config={moduleConfig}>
      <TemplateModuleRoutes />
    </TemplateModuleProvider>
  );
};
