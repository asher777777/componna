import React, { createContext, useContext, useMemo } from 'react';
import { FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { FlowPlayerModuleConfig, FlowPlayerCollectionsConfig } from '../types';
import { resolveCollections } from '../config';

interface ModuleContextValue {
  firebaseApp?: FirebaseApp;
  db?: Firestore;
  databaseId?: string;
  collections: Required<FlowPlayerCollectionsConfig>;
  geminiApiKey?: string;
  functionsBaseUrl?: string;
  onNavigate?: (path: string) => void;
  config: FlowPlayerModuleConfig;
}

const ModuleContext = createContext<ModuleContextValue | null>(null);

export const FlowPlayerModuleProvider: React.FC<{
  config: FlowPlayerModuleConfig;
  children: React.ReactNode;
}> = ({ config, children }) => {
  const db = useMemo(() => {
    if (config.db) {
      return config.db;
    }
    if (config.firebaseApp) {
      try {
        if (config.databaseId && config.databaseId !== '(default)' && config.databaseId !== 'aioffice') {
          return getFirestore(config.firebaseApp, config.databaseId);
        }
        return getFirestore(config.firebaseApp);
      } catch {
        return getFirestore(config.firebaseApp);
      }
    }
    return undefined;
  }, [config.firebaseApp, config.db, config.databaseId]);

  const collections = useMemo(() => {
    return resolveCollections(config.collectionPrefix, config.customCollections);
  }, [config.collectionPrefix, config.customCollections]);

  const value: ModuleContextValue = {
    firebaseApp: config.firebaseApp,
    db,
    databaseId: config.databaseId,
    collections,
    geminiApiKey: config.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY,
    functionsBaseUrl: config.functionsBaseUrl || import.meta.env.VITE_FUNCTIONS_BASE_URL,
    onNavigate: config.onNavigate,
    config,
  };

  return <ModuleContext.Provider value={value}>{children}</ModuleContext.Provider>;
};

export function useFlowPlayerModule(): ModuleContextValue {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error('useFlowPlayerModule must be used within a FlowPlayerModuleProvider');
  }
  return context;
}