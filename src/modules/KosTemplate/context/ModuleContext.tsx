import React, { createContext, useContext, useMemo } from 'react';
import { FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { TemplateModuleConfig } from '../types';
import { resolveCollections } from '../config';

interface ModuleContextValue {
  firebaseApp?: FirebaseApp;
  db?: Firestore;
  collections: { items: string; logs: string };
  currentUser?: any;
  functionsBaseUrl?: string;
}

const ModuleContext = createContext<ModuleContextValue | null>(null);

export const TemplateModuleProvider: React.FC<{
  config: TemplateModuleConfig;
  children: React.ReactNode;
}> = ({ config, children }) => {
  const db = useMemo(() => {
    if (config.firebaseApp) {
      return getFirestore(config.firebaseApp);
    }
    return undefined;
  }, [config.firebaseApp]);

  const collections = useMemo(() => {
    return resolveCollections(config.collectionPrefix, config.customCollections);
  }, [config.collectionPrefix, config.customCollections]);

  const value: ModuleContextValue = {
    firebaseApp: config.firebaseApp,
    db,
    collections,
    currentUser: config.currentUser,
    functionsBaseUrl: config.functionsBaseUrl,
  };

  return <ModuleContext.Provider value={value}>{children}</ModuleContext.Provider>;
};

export function useTemplateModule(): ModuleContextValue {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error('useTemplateModule must be used within a TemplateModuleProvider');
  }
  return context;
}
