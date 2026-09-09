import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, getDocs, limit, query } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { ensureAnonymousAuth } from '../../services/firebaseAuth';

export interface SystemFirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
  databaseId?: string;
}

export interface SystemCollectionsConfig {
  mediaItems: string;
  mediaFolders: string;
  playerCampaigns: string;
  playerScenes: string;
  contacts: string;
  users: string;
  [key: string]: string;
}

export interface SystemApiKeysConfig {
  googleAiApiKey?: string;
  geminiModel?: string;
  geminiImageModel?: string;
  geminiVideoModel?: string;
  heygenApiKey?: string;
  elevenLabsApiKey?: string;
  openaiApiKey?: string;
  whatsappApiToken?: string;
  greenApiInstanceId?: string;
  greenApiToken?: string;
  customWebhookUrl?: string;
  [key: string]: string | undefined;
}

export interface SystemConnectionContextValue {
  config: SystemFirebaseConfig;
  collections: SystemCollectionsConfig;
  apiKeys: SystemApiKeysConfig;
  firebaseApp?: FirebaseApp;
  db?: Firestore;
  storage?: FirebaseStorage;
  isConnected: boolean;
  isTesting: boolean;
  lastPingLatency?: number;
  lastPingError?: string;
  updateConfig: (newConfig: Partial<SystemFirebaseConfig>, newCollections?: Partial<SystemCollectionsConfig>) => Promise<void>;
  updateApiKeys: (newKeys: Partial<SystemApiKeysConfig>) => Promise<void>;
  testGoogleAiKey: (keyToTest?: string) => Promise<{ success: boolean; error?: string }>;
  testHeyGenKey: (keyToTest?: string) => Promise<{ success: boolean; error?: string }>;
  testConnection: (customConfig?: SystemFirebaseConfig) => Promise<{ success: boolean; latency?: number; error?: string }>;
  resetToDefaults: () => void;
  openConnectorModal: () => void;
  closeConnectorModal: () => void;
  isConnectorModalOpen: boolean;
}

const STORAGE_KEY = 'comona_system_connection_config';
const COLLECTIONS_KEY = 'comona_system_collections_config';
const APIKEYS_KEY = 'comona_system_apikeys_config';

export const DEFAULT_API_KEYS: SystemApiKeysConfig = {
  googleAiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  geminiModel: 'gemini-3.8-flash',
  geminiImageModel: 'gemini-3.1-flash-image',
  geminiVideoModel: 'veo-3.1-generate-preview',
  heygenApiKey: import.meta.env.VITE_HEYGEN_API_KEY || '',
  elevenLabsApiKey: import.meta.env.VITE_ELEVENLABS_API_KEY || '',
  openaiApiKey: '',
  whatsappApiToken: '',
  greenApiInstanceId: '',
  greenApiToken: '',
  customWebhookUrl: '',
};

export const DEFAULT_FIREBASE_CONFIG: SystemFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyC011dhtJddDjLmTQ2HCvgVA0DPN8rKFwQ',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'glowmanage.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'glowmanage',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'glowmanage.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '174552708887',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:174552708887:web:70b91e3994c66db0336952',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-FCJ0889DPN',
  databaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)',
};

export const DEFAULT_SYSTEM_COLLECTIONS: SystemCollectionsConfig = {
  mediaItems: 'sdo_media_items',
  mediaFolders: 'sdo_media_folders',
  playerCampaigns: 'sdo_player_campaign_configs',
  playerScenes: 'scenes',
  contacts: 'contacts',
  users: 'users',
};

const SystemConnectionContext = createContext<SystemConnectionContextValue | null>(null);

export const SystemConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SystemFirebaseConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...DEFAULT_FIREBASE_CONFIG, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_FIREBASE_CONFIG;
  });

  const [collections, setCollections] = useState<SystemCollectionsConfig>(() => {
    try {
      const saved = localStorage.getItem(COLLECTIONS_KEY);
      if (saved) return { ...DEFAULT_SYSTEM_COLLECTIONS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_SYSTEM_COLLECTIONS;
  });

  const [apiKeys, setApiKeys] = useState<SystemApiKeysConfig>(() => {
    try {
      const saved = localStorage.getItem(APIKEYS_KEY);
      if (saved) return { ...DEFAULT_API_KEYS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_API_KEYS;
  });

  const [isConnectorModalOpen, setIsConnectorModalOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [lastPingLatency, setLastPingLatency] = useState<number | undefined>(undefined);
  const [lastPingError, setLastPingError] = useState<string | undefined>(undefined);

  // Initialize or re-initialize Firebase App
  const firebaseApp = useMemo<FirebaseApp | undefined>(() => {
    if (!config.apiKey || !config.projectId) return undefined;
    try {
      const existing = getApps();
      const app = existing.find(a => a.name === '[DEFAULT]') || existing[0];
      if (app && app.options.projectId === config.projectId) {
        return app;
      }
      return initializeApp(config);
    } catch {
      try {
        return getApp();
      } catch (err) {
        console.warn('[SystemConnection] Firebase App init notice:', err);
        return undefined;
      }
    }
  }, [config]);

  // Authenticate anonymously
  useEffect(() => {
    if (firebaseApp) {
      ensureAnonymousAuth(firebaseApp);
    }
  }, [firebaseApp]);

  // Firestore DB instance
  const db = useMemo<Firestore | undefined>(() => {
    if (!firebaseApp) return undefined;
    try {
      const databaseId = config.databaseId;
      return databaseId && databaseId !== '(default)'
        ? getFirestore(firebaseApp, databaseId)
        : getFirestore(firebaseApp);
    } catch (err) {
      console.warn('[SystemConnection] Firestore init notice:', err);
      return undefined;
    }
  }, [firebaseApp, config.databaseId]);

  // Storage instance
  const storage = useMemo<FirebaseStorage | undefined>(() => {
    if (!firebaseApp) return undefined;
    try {
      return getStorage(firebaseApp, config.storageBucket ? `gs://${config.storageBucket}` : undefined);
    } catch (err) {
      console.warn('[SystemConnection] Storage init notice:', err);
      return undefined;
    }
  }, [firebaseApp, config.storageBucket]);

  // Test live connection to Firestore
  const testConnection = useCallback(
    async (testCfg?: SystemFirebaseConfig): Promise<{ success: boolean; latency?: number; error?: string }> => {
      setIsTesting(true);
      setLastPingError(undefined);
      const start = Date.now();

      try {
        const targetApp = testCfg
          ? initializeApp(testCfg, `test-${Date.now()}`)
          : firebaseApp;

        if (!targetApp) {
          throw new Error('Firebase App is not initialized. Please verify your Project ID and API Key.');
        }

        const targetDb = testCfg?.databaseId && testCfg.databaseId !== '(default)'
          ? getFirestore(targetApp, testCfg.databaseId)
          : getFirestore(targetApp);

        // Ping test query on default collection with limit 1
        const testQuery = query(collection(targetDb, collections.mediaItems), limit(1));
        await getDocs(testQuery);

        const latency = Date.now() - start;
        setLastPingLatency(latency);
        setLastPingError(undefined);
        setIsTesting(false);
        return { success: true, latency };
      } catch (err: any) {
        const errorMsg = err?.message || String(err);
        setLastPingError(errorMsg);
        setLastPingLatency(undefined);
        setIsTesting(false);
        return { success: false, error: errorMsg };
      }
    },
    [firebaseApp, collections.mediaItems]
  );

  // Test Google AI / Gemini API Key
  const testGoogleAiKey = useCallback(
    async (keyToTest?: string): Promise<{ success: boolean; error?: string }> => {
      const key = keyToTest || apiKeys.googleAiApiKey || (import.meta.env.VITE_GEMINI_API_KEY as string);
      if (!key || key.trim().length === 0) {
        return { success: false, error: 'לא הוזן מפתח Google AI / Gemini API Key' };
      }

      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${key.trim()}`
        );
        if (res.ok) {
          return { success: true };
        } else {
          const errJson = await res.json().catch(() => ({}));
          return {
            success: false,
            error: errJson?.error?.message || `שגיאה באימות Google API (${res.status} ${res.statusText})`,
          };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'שגיאת רשת בבדיקת מפתח Gemini' };
      }
    },
    [apiKeys.googleAiApiKey]
  );

  // Test HeyGen API Key
  const testHeyGenKey = useCallback(
    async (keyToTest?: string): Promise<{ success: boolean; error?: string }> => {
      const key = keyToTest || apiKeys.heygenApiKey || (import.meta.env.VITE_HEYGEN_API_KEY as string);
      if (!key || key.trim().length === 0) {
        return { success: false, error: 'לא הוזן מפתח HeyGen API Key' };
      }

      try {
        const res = await fetch('https://api.heygen.com/v2/avatars', {
          headers: {
            'X-Api-Key': key.trim(),
            'Accept': 'application/json'
          }
        });

        if (res.ok) {
          return { success: true };
        } else {
          const errJson = await res.json().catch(() => ({}));
          return {
            success: false,
            error: errJson?.error || errJson?.message || `שגיאה באימות HeyGen (${res.status} ${res.statusText})`,
          };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'שגיאת רשת בבדיקת מפתח HeyGen' };
      }
    },
    [apiKeys.heygenApiKey]
  );

  const updateConfig = useCallback(
    async (newConfig: Partial<SystemFirebaseConfig>, newCollections?: Partial<SystemCollectionsConfig>) => {
      const updatedConfig = { ...config, ...newConfig };
      setConfig(updatedConfig);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
      } catch {}

      if (newCollections) {
        const cleanedCols: SystemCollectionsConfig = { ...collections };
        for (const [k, v] of Object.entries(newCollections)) {
          if (v !== undefined) {
            cleanedCols[k] = v;
          }
        }
        setCollections(cleanedCols);
        try {
          localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(cleanedCols));
        } catch {}
      }
    },
    [config, collections]
  );

  const updateApiKeys = useCallback(
    async (newKeys: Partial<SystemApiKeysConfig>) => {
      const updated = { ...apiKeys, ...newKeys };
      setApiKeys(updated);
      try {
        localStorage.setItem(APIKEYS_KEY, JSON.stringify(updated));
      } catch {}
    },
    [apiKeys]
  );

  const resetToDefaults = useCallback(() => {
    setConfig(DEFAULT_FIREBASE_CONFIG);
    setCollections(DEFAULT_SYSTEM_COLLECTIONS);
    setApiKeys(DEFAULT_API_KEYS);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(COLLECTIONS_KEY);
      localStorage.removeItem(APIKEYS_KEY);
    } catch {}
  }, []);

  const openConnectorModal = useCallback(() => setIsConnectorModalOpen(true), []);
  const closeConnectorModal = useCallback(() => setIsConnectorModalOpen(false), []);

  return (
    <SystemConnectionContext.Provider
      value={{
        config,
        collections,
        apiKeys,
        firebaseApp,
        db,
        storage,
        isConnected: !!db,
        isTesting,
        lastPingLatency,
        lastPingError,
        updateConfig,
        updateApiKeys,
        testGoogleAiKey,
        testHeyGenKey,
        testConnection,
        resetToDefaults,
        openConnectorModal,
        closeConnectorModal,
        isConnectorModalOpen,
      }}
    >
      {children}
    </SystemConnectionContext.Provider>
  );
};

export const useSystemConnection = () => {
  const ctx = useContext(SystemConnectionContext);
  if (!ctx) {
    throw new Error('useSystemConnection must be used within a SystemConnectionProvider');
  }
  return ctx;
};
