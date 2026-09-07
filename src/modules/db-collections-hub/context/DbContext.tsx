import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { initializeApp, getApps, getApp, deleteApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import {
  CollectionMetadata,
  FirebaseCredentialsConfig,
  FirestoreDocumentRecord,
  ViewMode,
} from '../types';
import { DEFAULT_ENV_CREDENTIALS, PREDEFINED_COLLECTIONS } from '../config';
import { PROJECT_SEED_DATA } from '../config/seedData';
import { FirestoreAdminService } from '../services/firestoreAdminService';
import { subscribeToAuth, AuthState } from '../../../services/firebaseAuth';

const STORAGE_KEY_CREDENTIALS = 'comona_firestore_custom_credentials';
const STORAGE_KEY_CUSTOM_COLLECTIONS = 'comona_firestore_custom_collections';

export interface CollectionStats {
  [collectionId: string]: {
    count: number;
    hasData: boolean;
    error?: string;
    loading?: boolean;
  };
}

interface DbContextValue {
  credentials: FirebaseCredentialsConfig;
  isCustomCredentials: boolean;
  saveCredentials: (newCreds: FirebaseCredentialsConfig) => void;
  resetCredentialsToEnv: () => void;
  switchDatabase: (databaseId: string) => void;
  
  firebaseApp: FirebaseApp | null;
  db: Firestore | null;
  adminService: FirestoreAdminService | null;
  authState: AuthState;
  
  connectionStatus: 'connected' | 'connecting' | 'error' | 'unconfigured';
  connectionError: string | null;
  connectionErrorCode?: string | null;
  connectionLatency: number | null;
  testConnection: () => Promise<void>;

  collections: CollectionMetadata[];
  collectionStats: CollectionStats;
  scanAllCollections: () => Promise<void>;
  selectedCollectionId: string;
  setSelectedCollectionId: (id: string) => void;
  addCustomCollection: (name: string, description?: string) => void;
  removeCustomCollection: (id: string) => void;

  documents: FirestoreDocumentRecord[];
  loadingDocs: boolean;
  docError: string | null;
  docErrorCode?: string | null;
  refreshDocuments: () => Promise<void>;

  realtimeSync: boolean;
  setRealtimeSync: (enabled: boolean) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  inspectingDoc: FirestoreDocumentRecord | null;
  setInspectingDoc: (doc: FirestoreDocumentRecord | null) => void;

  editingDoc: FirestoreDocumentRecord | 'new' | null;
  setEditingDoc: (doc: FirestoreDocumentRecord | 'new' | null) => void;

  credentialsModalOpen: boolean;
  setCredentialsModalOpen: (open: boolean) => void;

  handleCreateOrUpdateDoc: (data: Record<string, any>, customId?: string) => Promise<string>;
  handleDeleteDoc: (docId: string) => Promise<void>;
  seedCollectionData: (collectionId: string) => Promise<number>;
  seedAllProjectData: () => Promise<void>;
  seeding: boolean;
}

const DbContext = createContext<DbContextValue | null>(null);

export const DbContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Credentials Management
  const [credentials, setCredentialsState] = useState<FirebaseCredentialsConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CREDENTIALS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved credentials', e);
    }
    return DEFAULT_ENV_CREDENTIALS;
  });

  const isCustomCredentials = useMemo(() => {
    return Boolean(localStorage.getItem(STORAGE_KEY_CREDENTIALS));
  }, [credentials]);

  const saveCredentials = useCallback((newCreds: FirebaseCredentialsConfig) => {
    setCredentialsState(newCreds);
    localStorage.setItem(STORAGE_KEY_CREDENTIALS, JSON.stringify(newCreds));
  }, []);

  const resetCredentialsToEnv = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_CREDENTIALS);
    setCredentialsState(DEFAULT_ENV_CREDENTIALS);
  }, []);

  const switchDatabase = useCallback((newDatabaseId: string) => {
    const updated = { ...credentials, databaseId: newDatabaseId };
    saveCredentials(updated);
  }, [credentials, saveCredentials]);

  // 2. Firebase App & Firestore Initialization
  const { firebaseApp, db, adminService } = useMemo(() => {
    if (!credentials.apiKey || !credentials.projectId) {
      return { firebaseApp: null, db: null, adminService: null };
    }

    try {
      let app: FirebaseApp;
      const appName = `db_hub_${credentials.projectId}`;
      const existingApps = getApps();
      const matchedApp = existingApps.find((a) => a.name === appName || a.name === '[DEFAULT]');

      if (matchedApp && matchedApp.options.projectId === credentials.projectId && matchedApp.options.apiKey === credentials.apiKey) {
        app = matchedApp;
      } else {
        try {
          app = initializeApp({
            apiKey: credentials.apiKey,
            authDomain: credentials.authDomain,
            projectId: credentials.projectId,
            storageBucket: credentials.storageBucket,
            messagingSenderId: credentials.messagingSenderId,
            appId: credentials.appId,
            measurementId: credentials.measurementId,
          }, appName);
        } catch {
          app = existingApps[0] || initializeApp({
            apiKey: credentials.apiKey,
            authDomain: credentials.authDomain,
            projectId: credentials.projectId,
            storageBucket: credentials.storageBucket,
            messagingSenderId: credentials.messagingSenderId,
            appId: credentials.appId,
            measurementId: credentials.measurementId,
          });
        }
      }

      const dbId = credentials.databaseId && credentials.databaseId !== '(default)' && credentials.databaseId.trim() !== ''
        ? credentials.databaseId.trim()
        : undefined;

      const firestoreInstance = dbId ? getFirestore(app, dbId) : getFirestore(app);
      const service = new FirestoreAdminService(firestoreInstance);

      return { firebaseApp: app, db: firestoreInstance, adminService: service };
    } catch (err: any) {
      console.error('Firebase initialization error in DbHub:', err);
      return { firebaseApp: null, db: null, adminService: null };
    }
  }, [credentials]);

  // 3. Auth State Management (Anonymous auto-login)
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    uid: null,
    email: null,
    displayName: null,
    photoURL: null,
    role: 'admin',
    isAuthenticated: false,
    isAnonymous: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!firebaseApp) {
      setAuthState({
        user: null,
        uid: null,
        email: null,
        displayName: null,
        photoURL: null,
        role: 'viewer',
        isAuthenticated: false,
        isAnonymous: false,
        loading: false,
        error: null,
      });
      return;
    }

    const unsub = subscribeToAuth(firebaseApp, (state) => {
      setAuthState(state);
    });

    return () => unsub();
  }, [firebaseApp]);

  // 4. Custom & Predefined Collections
  const [customCollections, setCustomCollections] = useState<CollectionMetadata[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_COLLECTIONS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse custom collections', e);
    }
    return [];
  });

  const allCollections = useMemo(() => {
    return [...PREDEFINED_COLLECTIONS, ...customCollections];
  }, [customCollections]);

  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(
    PREDEFINED_COLLECTIONS[0]?.id || 'sdo_player_campaign_configs'
  );

  const [collectionStats, setCollectionStats] = useState<CollectionStats>({});

  // 5. Connection State
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'error' | 'unconfigured'>('connecting');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionErrorCode, setConnectionErrorCode] = useState<string | null>(null);
  const [connectionLatency, setConnectionLatency] = useState<number | null>(null);

  const testConnection = useCallback(async () => {
    if (!adminService) {
      setConnectionStatus('unconfigured');
      setConnectionError('מפתחות פיירבייס חסרים או לא תקינים');
      return;
    }

    setConnectionStatus('connecting');
    setConnectionError(null);
    setConnectionErrorCode(null);

    const result = await adminService.testConnection(selectedCollectionId || 'sdo_player_campaign_configs');
    if (result.success) {
      setConnectionStatus('connected');
      setConnectionLatency(result.latencyMs);
      setConnectionError(null);
      setConnectionErrorCode(null);
    } else {
      setConnectionStatus('error');
      const errStr = result.error || 'שגיאה בחיבור למסד הנתונים';
      setConnectionError(errStr);
      if (errStr.includes('NOT_FOUND') || errStr.includes('not exist')) {
        setConnectionErrorCode('database-not-found');
      } else if (errStr.includes('permission') || errStr.includes('PERMISSION_DENIED')) {
        setConnectionErrorCode('permission-denied');
      } else {
        setConnectionErrorCode('connection-failed');
      }
    }
  }, [adminService, selectedCollectionId]);

  const scanAllCollections = useCallback(async () => {
    if (!adminService) return;
    const newStats: CollectionStats = {};

    for (const col of allCollections) {
      try {
        const docs = await adminService.getDocuments(col.id, 50);
        newStats[col.id] = {
          count: docs.length,
          hasData: docs.length > 0,
        };
      } catch (err: any) {
        newStats[col.id] = {
          count: 0,
          hasData: false,
          error: err?.message || 'שגיאת גישה',
        };
      }
    }
    setCollectionStats(newStats);
  }, [adminService, allCollections]);

  const addCustomCollection = useCallback((name: string, description?: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (allCollections.some((c) => c.id === trimmed)) {
      setSelectedCollectionId(trimmed);
      return;
    }
    const newColl: CollectionMetadata = {
      id: trimmed,
      name: trimmed,
      description: description || `קולקציה מותאמת: ${trimmed}`,
      category: 'custom',
      icon: 'Database',
    };
    const updated = [newColl, ...customCollections];
    setCustomCollections(updated);
    localStorage.setItem(STORAGE_KEY_CUSTOM_COLLECTIONS, JSON.stringify(updated));
    setSelectedCollectionId(trimmed);
  }, [allCollections, customCollections]);

  const removeCustomCollection = useCallback((id: string) => {
    const updated = customCollections.filter((c) => c.id !== id);
    setCustomCollections(updated);
    localStorage.setItem(STORAGE_KEY_CUSTOM_COLLECTIONS, JSON.stringify(updated));
    if (selectedCollectionId === id) {
      setSelectedCollectionId(PREDEFINED_COLLECTIONS[0]?.id || '');
    }
  }, [customCollections, selectedCollectionId]);

  // 6. Document List & Operations
  const [documents, setDocuments] = useState<FirestoreDocumentRecord[]>([]);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [docErrorCode, setDocErrorCode] = useState<string | null>(null);
  const [realtimeSync, setRealtimeSync] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [seeding, setSeeding] = useState<boolean>(false);

  const [inspectingDoc, setInspectingDoc] = useState<FirestoreDocumentRecord | null>(null);
  const [editingDoc, setEditingDoc] = useState<FirestoreDocumentRecord | 'new' | null>(null);
  const [credentialsModalOpen, setCredentialsModalOpen] = useState<boolean>(false);

  // Load documents
  const refreshDocuments = useCallback(async () => {
    if (!adminService || !selectedCollectionId) {
      setDocuments([]);
      return;
    }
    setLoadingDocs(true);
    setDocError(null);
    setDocErrorCode(null);

    try {
      const docs = await adminService.getDocuments(selectedCollectionId, 150);
      setDocuments(docs);
      setConnectionStatus('connected');
      setCollectionStats((prev) => ({
        ...prev,
        [selectedCollectionId]: { count: docs.length, hasData: docs.length > 0 },
      }));
    } catch (err: any) {
      console.warn(`Collection load notice (${selectedCollectionId}):`, err?.message || err);
      const errMsg = err?.message || 'שגיאה בטעינת מסמכים מקולקציה זו';
      setDocError(errMsg);
      if (errMsg.includes('NOT_FOUND') || errMsg.includes('not exist')) {
        setDocErrorCode('database-not-found');
      } else if (errMsg.includes('permission') || errMsg.includes('PERMISSION_DENIED')) {
        setDocErrorCode('permission-denied');
      } else {
        setDocErrorCode('error');
      }
      setConnectionStatus('error');
    } finally {
      setLoadingDocs(false);
    }
  }, [adminService, selectedCollectionId]);

  // Handle Real-time sync or one-time fetch
  useEffect(() => {
    if (!adminService || !selectedCollectionId) {
      setDocuments([]);
      return;
    }

    if (realtimeSync) {
      setLoadingDocs(true);
      const unsubscribe = adminService.subscribeToCollection(
        selectedCollectionId,
        (docs) => {
          setDocuments(docs);
          setLoadingDocs(false);
          setConnectionStatus('connected');
          setCollectionStats((prev) => ({
            ...prev,
            [selectedCollectionId]: { count: docs.length, hasData: docs.length > 0 },
          }));
        },
        (err: any) => {
          const errMsg = err.message || 'שגיאת סנכרון בזמן אמת';
          setDocError(errMsg);
          if (errMsg.includes('NOT_FOUND') || errMsg.includes('not exist')) {
            setDocErrorCode('database-not-found');
          } else if (errMsg.includes('permission') || errMsg.includes('PERMISSION_DENIED')) {
            setDocErrorCode('permission-denied');
          } else {
            setDocErrorCode('error');
          }
          setLoadingDocs(false);
          setConnectionStatus('error');
        },
        150
      );
      return () => unsubscribe();
    } else {
      refreshDocuments();
    }
  }, [adminService, selectedCollectionId, realtimeSync, refreshDocuments]);

  // Initial connection test & stats scan
  useEffect(() => {
    testConnection();
    scanAllCollections();
  }, [adminService]);

  // Document Operations
  const handleCreateOrUpdateDoc = useCallback(async (data: Record<string, any>, customId?: string): Promise<string> => {
    if (!adminService || !selectedCollectionId) {
      throw new Error('שירות פיירבייס אינו זמין כרגע');
    }
    const docId = await adminService.saveDocument(selectedCollectionId, data, customId);
    await refreshDocuments();
    return docId;
  }, [adminService, selectedCollectionId, refreshDocuments]);

  const handleDeleteDoc = useCallback(async (docId: string): Promise<void> => {
    if (!adminService || !selectedCollectionId) {
      throw new Error('שירות פיירבייס אינו זמין כרגע');
    }
    await adminService.deleteDocument(selectedCollectionId, docId);
    await refreshDocuments();
  }, [adminService, selectedCollectionId, refreshDocuments]);

  // Seed Data into Firestore
  const seedCollectionData = useCallback(async (collectionId: string): Promise<number> => {
    if (!adminService) throw new Error('שירות פיירבייס אינו מחובר');
    const items = PROJECT_SEED_DATA[collectionId];
    if (!items || items.length === 0) {
      throw new Error(`אין נתוני תבנית ראשוניים עבור קולקציה ${collectionId}`);
    }

    setSeeding(true);
    let count = 0;
    try {
      for (const item of items) {
        await adminService.saveDocument(collectionId, item.data, item.id);
        count++;
      }
      await refreshDocuments();
      await scanAllCollections();
      return count;
    } finally {
      setSeeding(false);
    }
  }, [adminService, refreshDocuments, scanAllCollections]);

  const seedAllProjectData = useCallback(async () => {
    if (!adminService) throw new Error('שירות פיירבייס אינו מחובר');
    setSeeding(true);
    try {
      for (const [colId, items] of Object.entries(PROJECT_SEED_DATA)) {
        for (const item of items) {
          await adminService.saveDocument(colId, item.data, item.id);
        }
      }
      await refreshDocuments();
      await scanAllCollections();
    } finally {
      setSeeding(false);
    }
  }, [adminService, refreshDocuments, scanAllCollections]);

  const value: DbContextValue = {
    credentials,
    isCustomCredentials,
    saveCredentials,
    resetCredentialsToEnv,
    switchDatabase,
    firebaseApp,
    db,
    adminService,
    authState,
    connectionStatus,
    connectionError,
    connectionErrorCode,
    connectionLatency,
    testConnection,
    collections: allCollections,
    collectionStats,
    scanAllCollections,
    selectedCollectionId,
    setSelectedCollectionId,
    addCustomCollection,
    removeCustomCollection,
    documents,
    loadingDocs,
    docError,
    docErrorCode,
    refreshDocuments,
    realtimeSync,
    setRealtimeSync,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    inspectingDoc,
    setInspectingDoc,
    editingDoc,
    setEditingDoc,
    credentialsModalOpen,
    setCredentialsModalOpen,
    handleCreateOrUpdateDoc,
    handleDeleteDoc,
    seedCollectionData,
    seedAllProjectData,
    seeding,
  };

  return <DbContext.Provider value={value}>{children}</DbContext.Provider>;
};

export function useDbContext(): DbContextValue {
  const context = useContext(DbContext);
  if (!context) {
    throw new Error('useDbContext must be used within a DbContextProvider');
  }
  return context;
}
