import React, { createContext, useContext, useRef, useMemo, useCallback } from 'react';

type CapabilityName = 'media-picker' | 'lead-capture' | 'notification' | 'auth-session' | string;

interface HostCapabilitiesContextValue {
  registerCapability: (name: CapabilityName, implementation: any) => void;
  unregisterCapability: (name: CapabilityName) => void;
  getCapability: <T = any>(name: CapabilityName) => T | null;
  hasCapability: (name: CapabilityName) => boolean;
}

const HostCapabilitiesContext = createContext<HostCapabilitiesContextValue | null>(null);

export const HostCapabilitiesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const capabilitiesRef = useRef<Map<CapabilityName, any>>(new Map());

  const registerCapability = useCallback((name: CapabilityName, implementation: any) => {
    capabilitiesRef.current.set(name, implementation);
  }, []);

  const unregisterCapability = useCallback((name: CapabilityName) => {
    capabilitiesRef.current.delete(name);
  }, []);

  const getCapability = useCallback(<T = any>(name: CapabilityName): T | null => {
    return capabilitiesRef.current.get(name) || null;
  }, []);

  const hasCapability = useCallback((name: CapabilityName): boolean => {
    return capabilitiesRef.current.has(name);
  }, []);

  const value = useMemo(
    () => ({
      registerCapability,
      unregisterCapability,
      getCapability,
      hasCapability,
    }),
    [registerCapability, unregisterCapability, getCapability, hasCapability]
  );

  return (
    <HostCapabilitiesContext.Provider value={value}>
      {children}
    </HostCapabilitiesContext.Provider>
  );
};

export const useHostCapabilities = () => {
  const ctx = useContext(HostCapabilitiesContext);
  if (!ctx) {
    // Graceful fallback dummy if provider is not present
    return {
      registerCapability: () => {},
      unregisterCapability: () => {},
      getCapability: () => null,
      hasCapability: () => false,
    };
  }
  return ctx;
};
