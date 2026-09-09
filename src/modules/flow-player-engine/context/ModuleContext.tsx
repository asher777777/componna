import React, { createContext, useContext, useMemo } from 'react';
import { FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { FlowPlayerModuleConfig, FlowPlayerCollectionsConfig } from '../types';
import { resolveCollections } from '../config';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';

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
  const systemConn = useSystemConnection();
  const firebaseApp = config.firebaseApp || systemConn.firebaseApp;
  const rawDb = config.db || systemConn.db;

  const db = useMemo(() => {
    if (rawDb) {
      return rawDb;
    }
    if (firebaseApp) {
      try {
        if (config.databaseId && config.databaseId !== '(default)' && config.databaseId !== 'aioffice') {
          return getFirestore(firebaseApp, config.databaseId);
        }
        return getFirestore(firebaseApp);
      } catch {
        return getFirestore(firebaseApp);
      }
    }
    return undefined;
  }, [firebaseApp, rawDb, config.databaseId]);

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