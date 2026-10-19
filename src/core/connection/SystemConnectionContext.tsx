import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, getDocs, getDoc, limit, query, doc, onSnapshot, setDoc, updateDoc, deleteField } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { ensureAnonymousAuth } from '../../services/firebaseAuth';
import { useTenantScope } from '../tenant/TenantScopeContext';
import { ROOT_TENANT_ID } from '../tenant/tenantResolver';
import { TenantCoreService } from '../tenant/tenantService';
import { setTokenTrackerFirestore } from '../ai/tenantTokenTracker';
import {
  SystemApiKeysConfig,
  DEFAULT_API_KEYS,
  getTenantApiKeysDocSegments,
  purgeLegacyLocalApiKeys,
  normalizeModuleId,
  resolveModuleIdFromPath,
  resolveApiKeysFor,
  isModuleEntitledFor,
  updateTenantApiKeysState,
} from './tenantApiKeys';

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

export interface SystemConnectionContextValue {
  config: SystemFirebaseConfig;
  collections: SystemCollectionsConfig;
  /** Keys resolved for the currently active module (respecting tenant purchase entitlement) */
  apiKeys: SystemApiKeysConfig;
  /** Raw keys document of the current tenant (for the settings editor only) */
  tenantApiKeys: SystemApiKeysConfig;
  /** Current tenant ID whose settings collection holds the keys */
  apiKeysTenantId: string;
  /** Modules purchased by the current subdomain tenant (empty for root) */
  purchasedModules: string[];
  /** Resolve keys for an explicit module ID */
  getApiKeysForModule: (moduleId?: string) => SystemApiKeysConfig;
  /** Whether the current tenant may use keys for the module */
  isModuleEntitled: (moduleId?: string) => boolean;
  firebaseApp?: FirebaseApp;
  db?: Firestore;
  storage?: FirebaseStorage;
  isConnected: boolean;
  isTesting: boolean;
  isCloudSynced: boolean;
  cloudSyncTime?: number;
  lastPingLatency?: number;
  lastPingError?: string;
  updateConfig: (newConfig: Partial<SystemFirebaseConfig>, newCollections?: Partial<SystemCollectionsConfig>) => Promise<void>;
  updateApiKeys: (newKeys: Partial<SystemApiKeysConfig>, targetTenantId?: string) => Promise<void>;
  testGoogleAiKey: (keyToTest?: string) => Promise<{ success: boolean; error?: string }>;
  testHeyGenKey: (keyToTest?: string) => Promise<{ success: boolean; error?: string }>;
  testConnection: (customConfig?: SystemFirebaseConfig) => Promise<{ success: boolean; latency?: number; error?: string }>;
  resetToDefaults: () => void;
  openConnectorModal: (initialTab?: string | any) => void;
  closeConnectorModal: () => void;
  isConnectorModalOpen: boolean;
  connectorModalInitialTab?: string;
}

const STORAGE_KEY = 'kosun_system_connection_config';
const COLLECTIONS_KEY = 'kosun_system_collections_config';

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

export const SystemConnectionContext = createContext<SystemConnectionContextValue | null>(null);

/**
 * Purge any legacy API keys that might linger in localStorage on client devices.
 * Keys are strictly stored in Firestore and In-Memory state.
 */
purgeLegacyLocalApiKeys();

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

  // ---- Tenant-scoped API keys (Firestore only: tenants/{tenantId}/settings/api_keys) ----
  const { tenantId: scopedTenantId } = useTenantScope();
  const apiKeysTenantId = scopedTenantId || ROOT_TENANT_ID;
  const isRootTenant = apiKeysTenantId === ROOT_TENANT_ID;
  const location = useLocation();
  const activeModuleId = useMemo(() => resolveModuleIdFromPath(location.pathname), [location.pathname]);

  const [tenantApiKeys, setTenantApiKeys] = useState<SystemApiKeysConfig>(DEFAULT_API_KEYS);
  const [masterApiKeys, setMasterApiKeys] = useState<SystemApiKeysConfig>(DEFAULT_API_KEYS);
  const [purchasedModules, setPurchasedModules] = useState<string[]>([]);


  const [isConnectorModalOpen, setIsConnectorModalOpen] = useState(false);
  const [connectorModalInitialTab, setConnectorModalInitialTab] = useState<string | undefined>(undefined);
  const [isTesting, setIsTesting] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [cloudSyncTime, setCloudSyncTime] = useState<number | undefined>(undefined);
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

  // Real-time Cloud Synchronization with Firestore (system_settings/global)
  useEffect(() => {
    if (!db) return;

    try {
      const settingsDocRef = doc(db, 'system_settings', 'global');
      const unsubscribe = onSnapshot(
        settingsDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.config && typeof data.config === 'object') {
              setConfig((prev) => {
                const merged = { ...prev, ...data.config };
                try {
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
                } catch {}
                return merged;
              });
            }

            if (data.collections && typeof data.collections === 'object') {
              setCollections((prev) => {
                const merged = { ...prev, ...data.collections };
                try {
                  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(merged));
                } catch {}
                return merged;
              });
            }

            setIsCloudSynced(true);
            setCloudSyncTime(Date.now());
          } else {
            // First time initialization on Firestore (API keys live in tenants/{tenantId}/settings/api_keys)
            setDoc(
              settingsDocRef,
              {
                config,
                collections,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
              { merge: true }
            ).catch((err) => console.warn('[SystemConnection] Auto-init cloud settings notice:', err));
            setIsCloudSynced(true);
            setCloudSyncTime(Date.now());
          }
        },
        (error) => {
          console.warn('[SystemConnection] Cloud settings sync notice:', error);
          setIsCloudSynced(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('[SystemConnection] Cloud sync setup notice:', err);
    }
  }, [db]);

  // One-time migration (root tenant only): system_settings/global.apiKeys (+ legacy local keys)
  // → tenants/_master/settings/api_keys, then delete apiKeys from the legacy global document.
  useEffect(() => {
    if (!db || !isRootTenant) return;
    let cancelled = false;

    (async () => {
      try {
        const keysRef = doc(db, ...getTenantApiKeysDocSegments(ROOT_TENANT_ID));
        const globalRef = doc(db, 'system_settings', 'global');
        const [keysSnap, globalSnap] = await Promise.all([getDoc(keysRef), getDoc(globalRef)]);
        if (cancelled) return;

        const legacyCloudKeys = globalSnap.exists() ? (globalSnap.data()?.apiKeys as Partial<SystemApiKeysConfig> | undefined) : undefined;

        if (!keysSnap.exists()) {
          const migrated: SystemApiKeysConfig = {
            ...DEFAULT_API_KEYS,
            ...(legacyCloudKeys || {}),
          };
          await setDoc(
            keysRef,
            { ...migrated, migratedAt: Date.now(), updatedAt: Date.now() },
            { merge: true }
          );
          console.info('[SystemConnection] API keys migrated to tenants/_master/settings/api_keys');
        }

        if (legacyCloudKeys !== undefined) {
          await updateDoc(globalRef, { apiKeys: deleteField(), updatedAt: Date.now() });
          console.info('[SystemConnection] Removed legacy apiKeys from system_settings/global');
        }
      } catch (err) {
        console.warn('[SystemConnection] API keys migration notice:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [db, isRootTenant]);

  // Real-time tenant API keys: tenants/{tenantId}/settings/api_keys
  useEffect(() => {
    setTenantApiKeys(DEFAULT_API_KEYS);
    if (!db) return;
    try {
      const keysRef = doc(db, ...getTenantApiKeysDocSegments(apiKeysTenantId));
      const unsubscribe = onSnapshot(
        keysRef,
        (snap) => {
          if (snap.exists()) {
            const { updatedAt: _u, migratedAt: _m, createdAt: _c, ...keys } = (snap.data() || {}) as Record<string, any>;
            setTenantApiKeys({ ...DEFAULT_API_KEYS, ...keys });
          } else {
            setTenantApiKeys(DEFAULT_API_KEYS);
          }
        },
        (error) => console.warn('[SystemConnection] Tenant API keys sync notice:', error)
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('[SystemConnection] Tenant API keys setup notice:', err);
    }
  }, [db, apiKeysTenantId]);

  // Real-time master API keys: tenants/_master/settings/api_keys
  // Clause ה: AI keys are ALWAYS taken through the master collection
  useEffect(() => {
    if (!db) return;
    setTokenTrackerFirestore(db);
    try {
      const masterKeysRef = doc(db, ...getTenantApiKeysDocSegments(ROOT_TENANT_ID));
      const unsubscribe = onSnapshot(
        masterKeysRef,
        async (snap) => {
          if (snap.exists()) {
            const { updatedAt: _u, migratedAt: _m, createdAt: _c, ...keys } = (snap.data() || {}) as Record<string, any>;
            let resolvedKeys: SystemApiKeysConfig = { ...DEFAULT_API_KEYS, ...keys };

            // If master doc exists but has no googleAiApiKey, check system_settings/global
            if (!resolvedKeys.googleAiApiKey || !resolvedKeys.googleAiApiKey.trim()) {
              try {
                const gSnap = await getDoc(doc(db, 'system_settings', 'global'));
                if (gSnap.exists()) {
                  const gData = gSnap.data();
                  if (gData?.apiKeys?.googleAiApiKey) {
                    resolvedKeys.googleAiApiKey = gData.apiKeys.googleAiApiKey.trim();
                  }
                }
              } catch {}
            }

            setMasterApiKeys(resolvedKeys);
            if (resolvedKeys.googleAiApiKey && resolvedKeys.googleAiApiKey.trim()) {
              try {
                localStorage.setItem('googleAiApiKey', resolvedKeys.googleAiApiKey.trim());
                localStorage.setItem('geminiApiKey', resolvedKeys.googleAiApiKey.trim());
              } catch {}
            }
          } else {
            // Check global settings document if master keys doc does not exist yet
            getDoc(doc(db, 'system_settings', 'global')).then((gSnap) => {
              if (gSnap.exists()) {
                const gData = gSnap.data();
                if (gData?.apiKeys) {
                  const merged = { ...DEFAULT_API_KEYS, ...gData.apiKeys };
                  setMasterApiKeys(merged);
                  if (merged.googleAiApiKey && merged.googleAiApiKey.trim()) {
                    try {
                      localStorage.setItem('googleAiApiKey', merged.googleAiApiKey.trim());
                      localStorage.setItem('geminiApiKey', merged.googleAiApiKey.trim());
                    } catch {}
                  }
                  return;
                }
              }
              setMasterApiKeys(DEFAULT_API_KEYS);
            }).catch(() => {
              setMasterApiKeys(DEFAULT_API_KEYS);
            });
          }
        },
        (error) => console.warn('[SystemConnection] Master API keys sync notice:', error)
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('[SystemConnection] Master API keys setup notice:', err);
    }
  }, [db]);

  // Purchased modules of a subdomain tenant: tenants/{tenantId}.activeModules
  useEffect(() => {
    setPurchasedModules([]);
    if (!db || isRootTenant) return;
    try {
      const tenantRef = doc(db, 'tenants', apiKeysTenantId);
      const unsubscribe = onSnapshot(
        tenantRef,
        (snap) => {
          const data = snap.exists() ? snap.data() : undefined;
          let mods: string[] = Array.isArray(data?.activeModules) ? data!.activeModules : [];
          // Local fallback if Firestore document not yet populated
          if (mods.length === 0) {
            const localTenants = TenantCoreService.getLocalTenants();
            const cleanTarget = apiKeysTenantId.toLowerCase().trim();
            const found = localTenants.find((t) => (t.subdomain || '').toLowerCase().trim() === cleanTarget);
            if (found && Array.isArray(found.activeModules) && found.activeModules.length > 0) {
              mods = found.activeModules;
            }
          }
          setPurchasedModules(Array.from(new Set(mods.map(normalizeModuleId))));
        },
        (error) => console.warn('[SystemConnection] Tenant purchases sync notice:', error)
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('[SystemConnection] Tenant purchases setup notice:', err);
    }
  }, [db, apiKeysTenantId, isRootTenant]);

  // Resolution input shared by the context and non-React services
  const resolutionInput = useMemo(
    () => ({ isRootTenant, tenantKeys: tenantApiKeys, masterKeys: masterApiKeys, purchasedModules, activeModuleId }),
    [isRootTenant, tenantApiKeys, masterApiKeys, purchasedModules, activeModuleId]
  );

  // Mirror into the plain store so services (outside React) read the same keys synchronously
  useEffect(() => {
    updateTenantApiKeysState({
      tenantId: apiKeysTenantId,
      tenantKeys: tenantApiKeys,
      masterKeys: masterApiKeys,
      purchasedModules,
      activeModuleId,
      loaded: true,
    });
  }, [apiKeysTenantId, tenantApiKeys, masterApiKeys, purchasedModules, activeModuleId]);

  const apiKeys = useMemo(() => resolveApiKeysFor(resolutionInput), [resolutionInput]);
  const getApiKeysForModule = useCallback(
    (moduleId?: string) => resolveApiKeysFor(resolutionInput, moduleId),
    [resolutionInput]
  );
  const isModuleEntitled = useCallback(
    (moduleId?: string) => isModuleEntitledFor(resolutionInput, moduleId),
    [resolutionInput]
  );

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
      const key = keyToTest || tenantApiKeys.googleAiApiKey;
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
    [tenantApiKeys.googleAiApiKey]
  );

  // Test HeyGen API Key
  const testHeyGenKey = useCallback(
    async (keyToTest?: string): Promise<{ success: boolean; error?: string }> => {
      const key = keyToTest || tenantApiKeys.heygenApiKey;
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

      let cleanedCols: SystemCollectionsConfig | undefined = undefined;
      if (newCollections) {
        cleanedCols = { ...collections };
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

      if (db) {
        try {
          const ref = doc(db, 'system_settings', 'global');
          await setDoc(
            ref,
            {
              config: updatedConfig,
              ...(cleanedCols ? { collections: cleanedCols } : {}),
              updatedAt: Date.now(),
            },
            { merge: true }
          );
        } catch (err) {
          console.warn('[SystemConnection] Cloud save config notice:', err);
        }
      }
    },
    [config, collections, db]
  );

  const updateApiKeys = useCallback(
    async (newKeys: Partial<SystemApiKeysConfig>, targetTenantId?: string) => {
      const targetTenant = (targetTenantId || apiKeysTenantId || ROOT_TENANT_ID).toLowerCase().trim();
      const updated = { ...tenantApiKeys, ...newKeys };
      if (targetTenant === apiKeysTenantId) {
        setTenantApiKeys(updated);
      }

      if (newKeys.googleAiApiKey && newKeys.googleAiApiKey.trim()) {
        const cleanAiKey = newKeys.googleAiApiKey.trim();
        setMasterApiKeys((prev) => ({ ...prev, googleAiApiKey: cleanAiKey }));
        try {
          localStorage.setItem('googleAiApiKey', cleanAiKey);
          localStorage.setItem('geminiApiKey', cleanAiKey);
        } catch {}
      }

      // Immediately sync masterApiKeys in memory if TikTok keys are modified
      if (
        newKeys.tiktokClientKey !== undefined ||
        newKeys.tiktokClientSecret !== undefined ||
        newKeys.tiktokAccessToken !== undefined
      ) {
        setMasterApiKeys((prev) => ({
          ...prev,
          ...(newKeys.tiktokClientKey !== undefined ? { tiktokClientKey: (newKeys.tiktokClientKey || '').trim() } : {}),
          ...(newKeys.tiktokClientSecret !== undefined ? { tiktokClientSecret: (newKeys.tiktokClientSecret || '').trim() } : {}),
          ...(newKeys.tiktokAccessToken !== undefined ? { tiktokAccessToken: (newKeys.tiktokAccessToken || '').trim() } : {}),
        }));
      }

      if (!db) {
        console.warn('[SystemConnection] Cannot save API keys – Firestore is not connected');
        return;
      }
      try {
        // Strip undefined values to prevent Firestore setDoc error
        const cleanPayload: Record<string, any> = { updatedAt: Date.now() };
        for (const [k, v] of Object.entries(newKeys)) {
          if (v !== undefined) {
            cleanPayload[k] = v;
          }
        }

        const ref = doc(db, ...getTenantApiKeysDocSegments(targetTenant));
        await setDoc(ref, cleanPayload, { merge: true });

        // Clause ה: AI keys belong to Master. Whenever an AI key is saved, also persist into master
        if (newKeys.googleAiApiKey && newKeys.googleAiApiKey.trim() && targetTenant !== ROOT_TENANT_ID) {
          const masterRef = doc(db, ...getTenantApiKeysDocSegments(ROOT_TENANT_ID));
          await setDoc(masterRef, { googleAiApiKey: newKeys.googleAiApiKey.trim(), updatedAt: Date.now() }, { merge: true });
        }

        // TikTok developer keys belong to Master. Whenever saved, always persist into master so all subdomains inherit
        if ((newKeys.tiktokClientKey || newKeys.tiktokClientSecret || newKeys.tiktokAccessToken) && targetTenant !== ROOT_TENANT_ID) {
          const masterRef = doc(db, ...getTenantApiKeysDocSegments(ROOT_TENANT_ID));
          const masterPatch: Record<string, any> = { updatedAt: Date.now() };
          if (newKeys.tiktokClientKey !== undefined) masterPatch.tiktokClientKey = (newKeys.tiktokClientKey || '').trim();
          if (newKeys.tiktokClientSecret !== undefined) masterPatch.tiktokClientSecret = (newKeys.tiktokClientSecret || '').trim();
          if (newKeys.tiktokAccessToken !== undefined) masterPatch.tiktokAccessToken = (newKeys.tiktokAccessToken || '').trim();
          await setDoc(masterRef, masterPatch, { merge: true });
        }
      } catch (err) {
        console.warn('[SystemConnection] Cloud save API keys notice:', err);
      }
    },
    [tenantApiKeys, db, apiKeysTenantId]
  );

  const resetToDefaults = useCallback(() => {
    setConfig(DEFAULT_FIREBASE_CONFIG);
    setCollections(DEFAULT_SYSTEM_COLLECTIONS);
    setTenantApiKeys(DEFAULT_API_KEYS);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(COLLECTIONS_KEY);
    } catch {}
    purgeLegacyLocalApiKeys();

    if (db) {
      try {
        const ref = doc(db, 'system_settings', 'global');
        setDoc(
          ref,
          {
            config: DEFAULT_FIREBASE_CONFIG,
            collections: DEFAULT_SYSTEM_COLLECTIONS,
            updatedAt: Date.now(),
          },
          { merge: true }
        ).catch(() => {});

        const keysRef = doc(db, ...getTenantApiKeysDocSegments(apiKeysTenantId));
        setDoc(keysRef, { ...DEFAULT_API_KEYS, updatedAt: Date.now() }).catch(() => {});
      } catch {}
    }
  }, [db, apiKeysTenantId]);

  const openConnectorModal = useCallback((initialTab?: string | any) => {
    if (typeof initialTab === 'string') {
      setConnectorModalInitialTab(initialTab);
    }
    setIsConnectorModalOpen(true);
  }, []);
  const closeConnectorModal = useCallback(() => setIsConnectorModalOpen(false), []);

  return (
    <SystemConnectionContext.Provider
      value={{
        config,
        collections,
        apiKeys,
        tenantApiKeys,
        apiKeysTenantId,
        purchasedModules,
        getApiKeysForModule,
        isModuleEntitled,
        firebaseApp,
        db,
        storage,
        isConnected: !!db,
        isTesting,
        isCloudSynced,
        cloudSyncTime,
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
        connectorModalInitialTab,
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

export const useOptionalSystemConnection = () => {
  return useContext(SystemConnectionContext);
};

