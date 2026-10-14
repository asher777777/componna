import React, { useState, useEffect, useMemo } from 'react';
import { 
  Grid, 
  X, 
  Lock, 
  User, 
  LogOut, 
  ChevronLeft,
  Search,
  Sparkles,
  Layers,
  BookOpen,
  Film,
  Database,
  Mail,
  Bot,
  CreditCard,
  MessageSquare,
  Layout,
  LayoutGrid,
  Youtube
} from 'lucide-react';
import { REGISTERED_MODULES, ModuleDefinition } from '../../workbench/moduleRegistry';
import { useSystemConnection } from '../../core/connection/SystemConnectionContext';
import { subscribeToAuth, AuthState, logoutUser } from '../../services/firebaseAuth';
import { TenantAuthService } from '../../modules/KosTenantProvisioner/services/tenantAuthService';

// Module metadata: Hebrew label, English prefix/rest, and dedicated Lucide icon
export const MODULE_META_CONFIG: Record<string, {
  hebrewName: string;
  englishPrefix: string;
  englishRest: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  'KosTube': {
    hebrewName: 'יוטיוב וקידום SEO מבוסס AI',
    englishPrefix: 'KOS',
    englishRest: 'Tube SEO',
    icon: Youtube,
  },
  'kosun-board-composer': {
    hebrewName: 'מחולל מערכות ולוחות בקרה',
    englishPrefix: 'KOS',
    englishRest: 'Board Composer',
    icon: Layout,
  },
  'kosun-am': {
    hebrewName: 'מערכת דיוור ואוטומציה',
    englishPrefix: 'KOS',
    englishRest: 'UN AM Mail',
    icon: Mail,
  },
  'kosai-engine': {
    hebrewName: 'מנוע בינה מלאכותית וסוכנים',
    englishPrefix: 'KOS',
    englishRest: 'AI Engine',
    icon: Bot,
  },
  'KosBranding': {
    hebrewName: 'מרכז זהות ומיתוג עסקי',
    englishPrefix: 'KOS',
    englishRest: 'Brand DNA',
    icon: Sparkles,
  },
  'kesher-payments-hub': {
    hebrewName: 'פתרונות סליקה ותשלומים',
    englishPrefix: 'KOS',
    englishRest: 'Pay Terminal',
    icon: CreditCard,
  },
  'KosWhatsUp': {
    hebrewName: 'אוטומציות ושירות WhatsApp',
    englishPrefix: 'KOS',
    englishRest: 'WhatsUp',
    icon: MessageSquare,
  },
  'whatsapp-green-api-hub': {
    hebrewName: 'אוטומציות ושירות WhatsApp',
    englishPrefix: 'KOS',
    englishRest: 'WhatsUp',
    icon: MessageSquare,
  },
  'KosTogether': {
    hebrewName: 'ניהול קהילות וסגמנטים CRM',
    englishPrefix: 'KOS',
    englishRest: 'Together CRM',
    icon: Layers,
  },
  'crm-groups-hub': {
    hebrewName: 'ניהול קהילות וסגמנטים CRM',
    englishPrefix: 'KOS',
    englishRest: 'Together CRM',
    icon: Layers,
  },
  'ksf': {
    hebrewName: 'מחולל טפסים ושאלונים שלביים',
    englishPrefix: 'KOS',
    englishRest: 'Smart Forms (KSF)',
    icon: BookOpen,
  },
  'smart-form-builder': {
    hebrewName: 'טפסים חכמים',
    englishPrefix: 'KOS',
    englishRest: 'Forms Studio',
    icon: BookOpen,
  },
  'video-producer-studio': {
    hebrewName: 'סטודיו הפקות וידאו ואווטאר',
    englishPrefix: 'KOS',
    englishRest: 'Video Studio',
    icon: Film,
  },
  'db-connector-hub': {
    hebrewName: 'מחולל אינטגרציות וחיבורים',
    englishPrefix: 'KOS',
    englishRest: 'Connector Hub',
    icon: Database,
  },
  'client-platform': {
    hebrewName: 'קליטת לקוחות ואונבורדינג',
    englishPrefix: 'KOS',
    englishRest: 'Client Platform',
    icon: User,
  },
  'crm-analytics': {
    hebrewName: 'ניהול CRM ואנליטיקה עסקית',
    englishPrefix: 'KOS',
    englishRest: 'CRM Analytics',
    icon: Layout,
  },
  'media-gallery-hub': {
    hebrewName: 'ספריית מדיה ותוכן עשיר',
    englishPrefix: 'KOS',
    englishRest: 'Media Gallery',
    icon: Sparkles,
  },
  'KosTenantProvisioner': {
    hebrewName: 'ניהול סאב-דומיינים והטענת רכיבים',
    englishPrefix: 'KOS',
    englishRest: 'KosTenantProvisioner',
    icon: Grid,
  },
  'KosWebAi': {
    hebrewName: 'בונה אתרים ודפי נחיתה AI',
    englishPrefix: 'KOS',
    englishRest: 'Web AI Builder',
    icon: Layout,
  },
};

export interface KosNevModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModules?: string[];
  isSubdomain?: boolean;
  tenantId?: string;
  activeModuleId?: string | null;
  onSelectModule?: (moduleId: string, route: string) => void;
  onOpenAuthModal?: () => void;
}

/**
 * Canonical KosNev Modal - Official KOSUN26 Navigation Center
 * Shows Hebrew title, English KOS pill, usage stats, and tenant isolation.
 */
export const KosNevModal: React.FC<KosNevModalProps> = ({
  isOpen,
  onClose,
  activeModules,
  isSubdomain = false,
  tenantId,
  activeModuleId,
  onSelectModule,
  onOpenAuthModal,
}) => {
  const { firebaseApp } = useSystemConnection();
  const [searchQuery, setSearchQuery] = useState('');
  const [authState, setAuthState] = useState<AuthState | null>(null);

  // System modules that should NEVER appear on a subdomain
  const SYSTEM_MODULES = useMemo(
    () =>
      new Set([
        'auth-portal',
        'db-collections-hub',
        'db-connector-hub',
        'KosTenantProvisioner',
        'template',
        '_template',
        'control-center-hub',
        'saas-storefront-composer',
      ]),
    []
  );

  // Load and sync module usage statistics
  const [moduleUsageStats, setModuleUsageStats] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem('kosun_module_usage_stats');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!firebaseApp) return;
    const unsub = subscribeToAuth(firebaseApp, (state) => {
      setAuthState(state);
    });
    return () => unsub();
  }, [firebaseApp]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered and sorted modules
  const sortedModules = useMemo(() => {
    if (!isOpen) return [];

    const list = REGISTERED_MODULES.filter((m: ModuleDefinition) => {
      // 1. Hide system modules on subdomains
      if (isSubdomain && SYSTEM_MODULES.has(m.id)) {
        return false;
      }

      // 2. Filter by activeModules collection if provided
      if (activeModules && activeModules.length > 0) {
        const lowerList = activeModules.map((x) => x.toLowerCase());
        const isMatch = lowerList.includes(m.id.toLowerCase()) ||
          (m.id.toLowerCase() === 'kostogether' && lowerList.includes('crm-groups-hub')) ||
          (m.id.toLowerCase() === 'crm-groups-hub' && lowerList.includes('kostogether')) ||
          (m.id.toLowerCase() === 'ksf' && lowerList.includes('smart-form-builder')) ||
          (m.id.toLowerCase() === 'smart-form-builder' && lowerList.includes('ksf')) ||
          (m.id.toLowerCase() === 'koswhatsup' && lowerList.includes('whatsapp-green-api-hub')) ||
          (m.id.toLowerCase() === 'whatsapp-green-api-hub' && lowerList.includes('koswhatsup'));
        if (!isMatch) return false;
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const meta = MODULE_META_CONFIG[m.id];
        const heb = meta?.hebrewName || m.name;
        const eng = `${meta?.englishPrefix || 'KOS'} ${meta?.englishRest || m.id}`;
        const query = searchQuery.toLowerCase();
        return heb.toLowerCase().includes(query) || eng.toLowerCase().includes(query) || (m.name || '').toLowerCase().includes(query);
      }

      return true;
    });

    // De-duplicate by canonical route so legacy alias routes don't show twice
    const seenRoutes = new Set<string>();
    const uniqueList = list.filter((m) => {
      if (seenRoutes.has(m.route)) return false;
      seenRoutes.add(m.route);
      return true;
    });

    // Sort dynamically by usage count (highest first), then alphabetically
    return uniqueList.sort((a, b) => {
      const countA = moduleUsageStats[a.id] || 0;
      const countB = moduleUsageStats[b.id] || 0;
      if (countB !== countA) return countB - countA;
      return a.name.localeCompare(b.name, 'he');
    });
  }, [isOpen, searchQuery, isSubdomain, activeModules, SYSTEM_MODULES, moduleUsageStats]);

  if (!isOpen) return null;

  const handleNavigateToModule = (moduleId: string, route: string) => {
    // Record usage dynamically
    setModuleUsageStats((prev) => {
      const updated = { ...prev, [moduleId]: (prev[moduleId] || 0) + 1 };
      try {
        localStorage.setItem('kosun_module_usage_stats', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    onClose();

    if (onSelectModule) {
      onSelectModule(moduleId, route);
    } else {
      window.location.href = route;
    }
  };

  const handleLogout = async () => {
    onClose();
    if (isSubdomain && tenantId) {
      TenantAuthService.logoutTenant(tenantId);
      sessionStorage.setItem(`tenant_admin_${tenantId}`, 'false');
      const isLocal = window.location.hostname.startsWith('localhost') || window.location.hostname.startsWith('127.0.0.1');
      if (isLocal) {
        window.location.href = `/?tenant=${tenantId}&mode=public`;
      } else {
        window.location.href = `https://${tenantId}.kosun.pro/?mode=public`;
      }
    } else {
      await logoutUser(firebaseApp);
      window.location.href = '/';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn"
      dir="rtl"
      style={{ fontFamily: 'Heebo, sans-serif' }}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-scaleUp">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <Grid className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping pointer-events-none" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                  KosNev
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 font-sans">
                  תפריט רכיבים
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl transition cursor-pointer"
            title="סגירת תפריט KosNev (Esc)"
            aria-label="סגירה"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 sm:px-5 pb-0 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש מהיר ברכיבי המערכת..."
              className="w-full pl-4 pr-11 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 transition font-bold"
              autoFocus
            />
          </div>
        </div>

        {/* Modules List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {sortedModules.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-3">
              <Lock className="w-8 h-8 mx-auto opacity-50" />
              <p className="font-bold">לא נמצאו רכיבים מורשים</p>
              {onOpenAuthModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuthModal();
                  }}
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl hover:bg-indigo-100 transition cursor-pointer"
                >
                  התחבר מחדש
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {sortedModules.map((module, index) => {
                const isActive = activeModuleId === module.id;
                const meta = MODULE_META_CONFIG[module.id] || {
                  hebrewName: module.name,
                  englishPrefix: 'KOS',
                  englishRest: module.id,
                  icon: (module as any).icon || LayoutGrid,
                };
                const Icon = meta.icon;
                const usageCount = moduleUsageStats[module.id] || 0;

                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => handleNavigateToModule(module.id, module.route)}
                    className={`text-right w-full p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 group cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-500/20 shadow-xs'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-xs'
                    }`}
                  >
                    {/* Right Section: Icon + Hebrew Name */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${
                        isActive 
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs' 
                          : 'bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/80 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:border-indigo-200'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm truncate ${isActive ? 'text-indigo-950 dark:text-indigo-100' : 'text-slate-900 dark:text-white'}`}>
                            {meta.hebrewName}
                          </span>
                          {isActive && (
                            <span className="px-1.5 py-0.2 rounded-full bg-indigo-500 text-[9px] text-white font-bold shrink-0">
                              נוכחי
                            </span>
                          )}
                          {usageCount > 0 && index < 3 && (
                            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-md bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-[9px] text-amber-700 dark:text-amber-400 font-bold shrink-0">
                              מוביל בשימוש ({usageCount})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Left Section: English Name with Flashing KOS Badge */}
                    <div className="flex items-center gap-2.5 shrink-0 pl-1" dir="ltr">
                      <div className="flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group-hover:border-indigo-300 dark:group-hover:border-indigo-700 transition-colors">
                        <span className="text-indigo-600 dark:text-indigo-400 font-black animate-pulse drop-shadow-xs">
                          {meta.englishPrefix}
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">
                          {meta.englishRest}
                        </span>
                      </div>

                      <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:-translate-x-0.5 transition-all" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* User Session & Logout Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          {(authState && authState.isAuthenticated && !authState.isAnonymous) || isSubdomain ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                  {authState?.displayName ? authState.displayName[0].toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {authState?.displayName || authState?.email?.split('@')[0] || (tenantId ? `מנהל ${tenantId}` : 'מנהל מורשה')}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                    {authState?.email || (tenantId ? `${tenantId}.kosun.pro` : 'מערכת קושאן')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                title="התנתק מהחשבון"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>התנתק</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500 dark:text-slate-400">אורח במערכת</span>
              {onOpenAuthModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuthModal();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>כניסה</span>
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
