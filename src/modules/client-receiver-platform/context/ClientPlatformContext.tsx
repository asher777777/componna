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
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { TenantRecord } from '../../saas-storefront-composer/types';

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

export interface ClientPlatformProviderProps {
  children: React.ReactNode;
  tenantRecord?: TenantRecord | null;
  initialRoute?: string;
}

export const ClientPlatformProvider: React.FC<ClientPlatformProviderProps> = ({ 
  children,
  tenantRecord,
  initialRoute
}) => {
  const { db } = useSystemConnection();

  const [session, setSession] = useState<ClientUserSession>(() => {
    if (tenantRecord) {
      return {
        uid: `user_${tenantRecord.subdomain}`,
        email: tenantRecord.ownerEmail || `${tenantRecord.subdomain}@kosun.pro`,
        displayName: tenantRecord.clientName || `מנהל ${tenantRecord.subdomain}`,
        role: 'admin',
        clientId: tenantRecord.subdomain,
        isAuthenticated: true,
      };
    }
    return {
      uid: 'user_101',
      email: 'admin@client-business.co.il',
      displayName: 'ישראל מנהל מערכת',
      role: 'admin',
      clientId: 'client_demo_77',
      isAuthenticated: true,
    };
  });

  const [settings, setSettings] = useState<ClientPlatformSettings>(() => {
    if (tenantRecord) {
      const activeMods = tenantRecord.activeModules || [];
      const modSettings: Record<string, ClientModuleSetting> = {};
      
      MASTER_AVAILABLE_MODULES.forEach((m) => {
        // Module is enabled if purchased OR if page-builder (default landing page editor for all tenants)
        const isPurchased = activeMods.includes(m.id);
        const isEnabled = isPurchased || m.id === 'page-builder';
        modSettings[m.id] = {
          moduleId: m.id,
          isEnabled,
          customSlug: m.defaultSlug,
          customTitle: m.defaultTitle,
          requiredRole: 'viewer',
          thirdPartyKeys: {},
          collectionPrefix: `${tenantRecord.collectionPrefix}${m.id}_`,
        };
      });

      try {
        const storageKey = `client_platform_settings_${tenantRecord.subdomain}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            clientId: tenantRecord.subdomain,
            clientName: tenantRecord.clientName || `עסק ${tenantRecord.subdomain}`,
            logoUrl: parsed.logoUrl || '',
            primaryColor: parsed.primaryColor || '#6366f1',
            modules: {
              ...modSettings,
              ...(parsed.modules || {}),
            },
            updatedAt: parsed.updatedAt || new Date().toISOString(),
          };
        }
      } catch {}

      return {
        clientId: tenantRecord.subdomain,
        clientName: tenantRecord.clientName || `עסק ${tenantRecord.subdomain}`,
        logoUrl: '',
        primaryColor: '#6366f1',
        modules: modSettings,
        updatedAt: new Date().toISOString(),
      };
    }

    try {
      const saved = localStorage.getItem('client_platform_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_CLIENT_PLATFORM_SETTINGS,
          ...parsed,
          modules: {
            ...DEFAULT_CLIENT_PLATFORM_SETTINGS.modules,
            ...(parsed.modules || {}),
          },
        };
      }
    } catch {}
    return DEFAULT_CLIENT_PLATFORM_SETTINGS;
  });

  const [activeRoute, setActiveRoute] = useState<string>(() => {
    if (initialRoute) return initialRoute;
    if (tenantRecord && tenantRecord.activeModules && tenantRecord.activeModules.length > 0) {
      return tenantRecord.activeModules[0];
    }
    return 'page-builder';
  });

  // Real-time Firestore sync for client platform settings
  useEffect(() => {
    if (!db) return;
    try {
      const clientId = settings.clientId || 'client_demo_77';
      const ref = doc(db, 'client_platform_config', clientId);
      const unsub = onSnapshot(
        ref,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as ClientPlatformSettings;
            setSettings((prev) => ({
              ...prev,
              ...data,
              modules: {
                ...prev.modules,
                ...(data.modules || {}),
              },
            }));
            try {
              localStorage.setItem('client_platform_settings', JSON.stringify(data));
            } catch {}
          }
        },
        (err) => {
          console.warn('[ClientPlatformContext] Firestore listener notice:', err);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('[ClientPlatformContext] Firestore subscription setup notice:', e);
    }
  }, [db, settings.clientId]);

  useEffect(() => {
    const storageKey = settings.clientId ? `client_platform_settings_${settings.clientId}` : 'client_platform_settings';
    localStorage.setItem(storageKey, JSON.stringify(settings));
    if (db) {
      const clientId = settings.clientId || 'client_demo_77';
      const ref = doc(db, 'client_platform_config', clientId);
      const cleanPayload = JSON.parse(JSON.stringify(settings));
      setDoc(ref, cleanPayload, { merge: true }).catch((err) =>
        console.warn('[ClientPlatformContext] Firestore save notice:', err)
      );
    }
  }, [settings, db]);

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
