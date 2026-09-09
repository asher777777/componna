import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ClientPlatformSettings, 
  ClientUserSession, 
  ClientModuleSetting 
} from '../types';
import { 
  DEFAULT_CLIENT_PLATFORM_SETTINGS, 
  MASTER_AVAILABLE_MODULES 
} from '../config';

interface ClientPlatformContextValue {
  session: ClientUserSession;
  login: (email: string, role?: 'admin' | 'editor' | 'viewer') => void;
  logout: () => void;
  settings: ClientPlatformSettings;
  updateSettings: (newSettings: ClientPlatformSettings) => void;
  toggleModule: (moduleId: string, isEnabled: boolean) => void;
  updateModuleConfig: (moduleId: string, config: Partial<ClientModuleSetting>) => void;
  activeRoute: string;
  setActiveRoute: (route: string) => void;
}

const ClientPlatformContext = createContext<ClientPlatformContextValue | null>(null);

export const ClientPlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<ClientUserSession>({
    uid: 'user_101',
    email: 'admin@client-business.co.il',
    displayName: 'ישראל מנהל מערכת',
    role: 'admin',
    clientId: 'client_demo_77',
    isAuthenticated: true,
  });

  const [settings, setSettings] = useState<ClientPlatformSettings>(() => {
    try {
      const saved = localStorage.getItem('client_platform_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_CLIENT_PLATFORM_SETTINGS;
  });

  const [activeRoute, setActiveRoute] = useState<string>('control_panel');

  useEffect(() => {
    localStorage.setItem('client_platform_settings', JSON.stringify(settings));
  }, [settings]);

  const login = (email: string, role: 'admin' | 'editor' | 'viewer' = 'admin') => {
    setSession({
      uid: `u_${Date.now()}`,
      email,
      displayName: email.split('@')[0],
      role,
      clientId: settings.clientId,
      isAuthenticated: true,
    });
  };

  const logout = () => {
    setSession(prev => ({ ...prev, isAuthenticated: false }));
  };

  const toggleModule = (moduleId: string, isEnabled: boolean) => {
    setSettings(prev => {
      const currentMod = prev.modules[moduleId] || {
        moduleId,
        isEnabled: false,
        customSlug: `/${moduleId}`,
        customTitle: MASTER_AVAILABLE_MODULES.find(m => m.id === moduleId)?.defaultTitle || moduleId,
        requiredRole: 'viewer',
        thirdPartyKeys: {},
      };

      return {
        ...prev,
        modules: {
          ...prev.modules,
          [moduleId]: { ...currentMod, isEnabled },
        },
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const updateModuleConfig = (moduleId: string, config: Partial<ClientModuleSetting>) => {
    setSettings(prev => {
      const currentMod = prev.modules[moduleId] || {
        moduleId,
        isEnabled: true,
        customSlug: `/${moduleId}`,
        customTitle: MASTER_AVAILABLE_MODULES.find(m => m.id === moduleId)?.defaultTitle || moduleId,
        requiredRole: 'viewer',
        thirdPartyKeys: {},
      };

      return {
        ...prev,
        modules: {
          ...prev.modules,
          [moduleId]: { ...currentMod, ...config },
        },
        updatedAt: new Date().toISOString(),
      };
    });
  };

  return (
    <ClientPlatformContext.Provider
      value={{
        session,
        login,
        logout,
        settings,
        updateSettings: setSettings,
        toggleModule,
        updateModuleConfig,
        activeRoute,
        setActiveRoute,
      }}
    >
      {children}
    </ClientPlatformContext.Provider>
  );
};

export const useClientPlatform = () => {
  const ctx = useContext(ClientPlatformContext);
  if (!ctx) throw new Error('useClientPlatform must be used within ClientPlatformProvider');
  return ctx;
};
