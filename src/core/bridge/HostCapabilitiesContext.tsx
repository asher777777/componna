import React, { createContext, useContext, useState, useCallback } from 'react';

type CapabilityName = 'media-picker' | 'lead-capture' | 'notification' | 'auth-session' | string;

interface HostCapabilitiesContextValue {
  registerCapability: (name: CapabilityName, implementation: any) => void;
  unregisterCapability: (name: CapabilityName) => void;
  getCapability: <T = any>(name: CapabilityName) => T | null;
  hasCapability: (name: CapabilityName) => boolean;
}

const HostCapabilitiesContext = createContext<HostCapabilitiesContextValue | null>(null);

export const HostCapabilitiesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [capabilities, setCapabilities] = useState<Map<CapabilityName, any>>(() => new Map());

  const registerCapability = useCallback((name: CapabilityName, implementation: any) => {
    setCapabilities(prev => {
      const next = new Map(prev);
      next.set(name, implementation);
      return next;
    });
  }, []);

  const unregisterCapability = useCallback((name: CapabilityName) => {
    setCapabilities(prev => {
      const next = new Map(prev);
      next.delete(name);
      return next;
    });
  }, []);

  const getCapability = useCallback(<T = any>(name: CapabilityName): T | null => {
    return capabilities.get(name) || null;
  }, [capabilities]);

  const hasCapability = useCallback((name: CapabilityName): boolean => {
    return capabilities.has(name);
  }, [capabilities]);

  return (
    <HostCapabilitiesContext.Provider
      value={{
        registerCapability,
        unregisterCapability,
        getCapability,
        hasCapability,
      }}
    >
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
