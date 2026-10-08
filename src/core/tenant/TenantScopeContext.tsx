import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Firestore, collection, CollectionReference, DocumentData } from 'firebase/firestore';
import {
  resolveCurrentTenantId,
  ROOT_TENANT_ID,
  getTenantCollectionPath,
  getTenantStoragePath,
  getTenantStorageKey
} from './tenantResolver';
import { SystemCollectionName, SYSTEM_COLLECTIONS } from '../contracts/collections';

export interface TenantScopeContextValue {
  tenantId: string;
  isRootTenant: boolean;
  setTenantId: (id: string) => void;
  getScopedCollectionName: (collectionName: string) => string;
  getScopedCollectionPath: (collectionName: string) => string;
  getScopedCollectionRef: <T = DocumentData>(db: Firestore, collectionName: string) => CollectionReference<T>;
  getScopedStoragePath: (folder: string, fileName: string) => string;
  getScopedStorageKey: (key: string) => string;
}

const TenantScopeContext = createContext<TenantScopeContextValue | null>(null);

export const TenantScopeProvider: React.FC<{ children: React.ReactNode; initialTenantId?: string }> = ({
  children,
  initialTenantId
}) => {
  const [tenantId, setTenantIdState] = useState<string>(() => {
    return initialTenantId || resolveCurrentTenantId();
  });

  const isRootTenant = tenantId === ROOT_TENANT_ID;

  const setTenantId = useCallback((newId: string) => {
    const clean = newId.trim().toLowerCase() || ROOT_TENANT_ID;
    setTenantIdState(clean);
    try {
      localStorage.setItem('kosun_active_tenant_id', clean);
    } catch {}
  }, []);

  const getScopedCollectionName = useCallback((collectionName: string) => {
    return getTenantCollectionPath(collectionName, tenantId);
  }, [tenantId]);

  const getScopedCollectionRef = useCallback(<T = DocumentData>(db: Firestore, collectionName: string): CollectionReference<T> => {
    // Scoped Subcollection pattern: collection(db, 'tenants', tenantId, collectionName)
    return collection(db, 'tenants', tenantId, collectionName) as CollectionReference<T>;
  }, [tenantId]);

  const getScopedStoragePath = useCallback((folder: string, fileName: string) => {
    return getTenantStoragePath(folder, fileName, tenantId);
  }, [tenantId]);

  const getScopedStorageKey = useCallback((key: string) => {
    return getTenantStorageKey(key, tenantId);
  }, [tenantId]);

  const value = useMemo<TenantScopeContextValue>(() => ({
    tenantId,
    isRootTenant,
    setTenantId,
    getScopedCollectionName,
    getScopedCollectionPath: getScopedCollectionName,
    getScopedCollectionRef,
    getScopedStoragePath,
    getScopedStorageKey,
  }), [tenantId, isRootTenant, setTenantId, getScopedCollectionName, getScopedCollectionRef, getScopedStoragePath, getScopedStorageKey]);

  return (
    <TenantScopeContext.Provider value={value}>
      {children}
    </TenantScopeContext.Provider>
  );
};

export function useTenantScope(): TenantScopeContextValue {
  const ctx = useContext(TenantScopeContext);
  if (!ctx) {
    // Fallback safe resolver if Provider is not in upper tree
    const defaultTenant = resolveCurrentTenantId();
    return {
      tenantId: defaultTenant,
      isRootTenant: defaultTenant === ROOT_TENANT_ID,
      setTenantId: () => {},
      getScopedCollectionName: (name: string) => getTenantCollectionPath(name, defaultTenant),
      getScopedCollectionPath: (name: string) => getTenantCollectionPath(name, defaultTenant),
      getScopedCollectionRef: <T = DocumentData>(db: Firestore, name: string) =>
        collection(db, 'tenants', defaultTenant, name) as CollectionReference<T>,
      getScopedStoragePath: (folder: string, file: string) => getTenantStoragePath(folder, file, defaultTenant),
      getScopedStorageKey: (key: string) => getTenantStorageKey(key, defaultTenant),
    };
  }
  return ctx;
}
