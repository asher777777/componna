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
  Youtube,
  HardDrive,
  Accessibility,
  FolderKanban,
} from 'lucide-react';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { REGISTERED_MODULES } from '../../workbench/moduleRegistry';
import { useSystemConnection } from '../../core/connection/SystemConnectionContext';
import { subscribeToAuth, AuthState, logoutUser } from '../../services/firebaseAuth';
import { TenantAuthService } from '../../modules/KosTenantProvisioner/services/tenantAuthService';
import { TenantCoreService } from '../../core/tenant/tenantService';
import { toCanonicalModuleId, ROOT_TENANT_ID, resolveCurrentTenantId } from '../../core/tenant/tenantResolver';

// Canonical Module Metadata: Hebrew Name, English KOS pill, and Lucide Icon
export const MODULE_META_CONFIG: Record<string, {
  hebrewName: string;
  englishPrefix: string;
  englishRest: string;
  slogan?: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  KosAccess: {
    hebrewName: 'נגישות ת"י 5568 ומשרד התקשורת',
    englishPrefix: 'KOS',
    englishRest: 'Access',
    slogan: 'התאמת נגישות WCAG 2.2 AA וניהול הצהרות',
    icon: Accessibility,
  },
  KosSubscribed: {
    hebrewName: 'מנויי תוכן, חבילות ומבחנים',
    englishPrefix: 'KOS',
    englishRest: 'Subscribed',
    slogan: 'ניהול תוכניות מנויים ובדיקות גישה',
    icon: CreditCard,
  },
  KosTube: {
    hebrewName: 'יוטיוב וקידום SEO מבוסס AI',
    englishPrefix: 'KOS',
    englishRest: 'Tube SEO',
    slogan: 'אופטימיזציית ערוצים ומחולל סרטונים',
    icon: Youtube,
  },
  KosTikTok: {
    hebrewName: 'טיקטוק ויוצרי תוכן ויראלי',
    englishPrefix: 'KOS',
    englishRest: 'TikTok Studio',
    slogan: 'ניהול קמפיינים ותוכן קצר לרשתות',
    icon: Film,
  },
  KosBoard: {
    hebrewName: 'מחולל מערכות ולוחות בקרה',
    englishPrefix: 'KOS',
    englishRest: 'Board Composer',
    slogan: 'הרכבה ובניית לוחות מחוונים ודשבורדים',
    icon: Layout,
  },
  KosMail: {
    hebrewName: 'מערכת דיוור ואוטומציה',
    englishPrefix: 'KOS',
    englishRest: 'UN AM Mail',
    slogan: 'קמפיינים, ניוזלטרים ואוטומציות דוא"ל',
    icon: Mail,
  },
  KosAi: {
    hebrewName: 'מנוע בינה מלאכותית וסוכנים',
    englishPrefix: 'KOS',
    englishRest: 'AI Engine',
    slogan: 'סוכנים אוטונומיים ופרומפטים חכמים',
    icon: Bot,
  },
  KosBranding: {
    hebrewName: 'מרכז זהות ומיתוג עסקי',
    englishPrefix: 'KOS',
    englishRest: 'Brand DNA',
    slogan: 'ניהול צבעים, לוגו, גופנים וערכי מותג',
    icon: Sparkles,
  },
  KosPay: {
    hebrewName: 'פתרונות סליקה ותשלומים',
    englishPrefix: 'KOS',
    englishRest: 'Pay Terminal',
    slogan: 'סליקת אשראי, הוראות קבע וחשבוניות',
    icon: CreditCard,
  },
  KosWhatsUp: {
    hebrewName: 'אוטומציות ושירות WhatsApp',
    englishPrefix: 'KOS',
    englishRest: 'WhatsUp',
    slogan: 'אינטגרציית Green API והודעות תפוצה',
    icon: MessageSquare,
  },
  KosTogether: {
    hebrewName: 'ניהול קהילות וסגמנטים CRM',
    englishPrefix: 'KOS',
    englishRest: 'Together CRM',
    slogan: 'קבוצות דינמיות וסגמנטציה חכמה',
    icon: Layers,
  },
  KosForms: {
    hebrewName: 'מחולל טפסים ושאלונים שלביים',
    englishPrefix: 'KOS',
    englishRest: 'Smart Forms (KSF)',
    slogan: 'טפסים חכמים, סקרים וקליטת מידע',
    icon: BookOpen,
  },
  KosConnector: {
    hebrewName: 'מחולל אינטגרציות וחיבורים',
    englishPrefix: 'KOS',
    englishRest: 'Connector Hub',
    slogan: 'סנכרון בסיסי נתונים ו-Webhooks',
    icon: Database,
  },
  KosClientPlatform: {
    hebrewName: 'קליטת לקוחות ואונבורדינג',
    englishPrefix: 'KOS',
    englishRest: 'Client Platform',
    slogan: 'ניהול תהליכי קליטה וטפסי קבלה',
    icon: User,
  },
  KosCrm: {
    hebrewName: 'ניהול CRM ואנליטיקה עסקית',
    englishPrefix: 'KOS',
    englishRest: 'CRM Analytics',
    slogan: 'דשבורד מכירות, לידים ודוחות מתקדמים',
    icon: LayoutGrid,
  },
  KosCloudStore: {
    hebrewName: 'כספת ענן ומדיה',
    englishPrefix: 'KOS',
    englishRest: 'CloudStore',
    slogan: 'אחסון קבצים, מסמכים ותמונות מאובטח',
    icon: HardDrive,
  },
  KosTenantProvisioner: {
    hebrewName: 'ניהול סאב-דומיינים והטענת רכיבים',
    englishPrefix: 'KOS',
    englishRest: 'Tenant Provisioner',
    slogan: 'הקצאת דיירים והרשאות מודולים',
    icon: Grid,
  },
  KosWebAi: {
    hebrewName: 'KosWebBuilder - מחולל אתרים ודפי נחיתה',
    englishPrefix: 'KOS',
    englishRest: 'WebBuilder',
    slogan: 'Building Your Digital Interaction',
    icon: Layout,
  },
  KosFlowPlayer: {
    hebrewName: 'סטודיו הפקות וידאו ונגן מדיה',
    englishPrefix: 'KOS',
    englishRest: 'Flow Player',
    slogan: 'הפקות וידאו אינטראקטיביות וסטרימינג',
    icon: Film,
  },
  KoSeoPowerEngin: {
    hebrewName: 'מנוע קידום ואופטימיזציה SEO',
    englishPrefix: 'KOS',
    englishRest: 'SEO Power',
    slogan: 'ניתוח מילות מפתח ומטא-דאטה',
    icon: Sparkles,
  },
  KosLive: {
    hebrewName: 'שידורים חיים ואינטראקציה',
    englishPrefix: 'KOS',
    englishRest: 'Live Studio',
    slogan: 'חדרי שידור חי ואירועים וירטואליים',
    icon: Film,
  },
  KosCampaigns: {
    hebrewName: 'ניהול קמפיינים ושגרירים',
    englishPrefix: 'KOS',
    englishRest: 'Campaigns Hub',
    slogan: 'שיווק שותפים, משפכי המרה ומעקב המרות',
    icon: Layers,
  },
  KosData: {
    hebrewName: 'ניהול נתונים וקולקציות',
    englishPrefix: 'KOS',
    englishRest: 'Data Hub',
    slogan: 'טבלאות מידע, שאילתות ומאגרי נתונים',
    icon: Database,
  },
  KosAuth: {
    hebrewName: 'פורטל אימות והרשאות',
    englishPrefix: 'KOS',
    englishRest: 'Auth Portal',
    slogan: 'ניהול משתמשים ורמות אבטחה',
    icon: Lock,
  },
  KosProjects: {
    hebrewName: 'פרויקטים ותוכנית עבודה',
    englishPrefix: 'KOS',
    englishRest: 'PROJECTS',
    slogan: 'שיווק, גאנט וספקים במקום אחד',
    icon: FolderKanban,
  },
};

// Canonical preferred routes for each canonical module
export const CANONICAL_MODULE_ROUTES: Record<string, string> = {
  KosAccess: '/KosAccess',
  KosSubscribed: '/KosSubscribed',
  KosTube: '/KosTube',
  KosTikTok: '/KosTikTok',
  KosBoard: '/KosBoard',
  KosMail: '/KosMail',
  KosAi: '/KosAi',
  KosBranding: '/brand-dna',
  KosPay: '/KosPay',
  KosWhatsUp: '/whatsapp-hub',
  KosTogether: '/crm-groups',
  KosForms: '/ksf',
  KosConnector: '/KosConnector',
  KosClientPlatform: '/client-platform',
  KosCrm: '/KosCrm',
  KosCloudStore: '/KosCloudStore',
  KosTenantProvisioner: '/tenant-provisioner',
  KosWebAi: '/KosWebAi',
  KosFlowPlayer: '/KosFlowPlayer',
  KoSeoPowerEngin: '/KoSeoPowerEngin',
  KosLive: '/koslive',
  KosCampaigns: '/ambassador-campaigns',
  KosData: '/db-collections',
  KosAuth: '/auth-portal',
  KosProjects: '/projects',
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
 * Shows Hebrew title, English KOS pill, usage stats, and strict tenant isolation.
 * De-duplicates alias routes completely and shows only provisioned modules for tenants.
 */
export const KosNevModal: React.FC<KosNevModalProps> = ({
  isOpen,
  onClose,
  activeModules,
  isSubdomain,
  tenantId,
  activeModuleId,
  onSelectModule,
  onOpenAuthModal,
}) => {
  const { firebaseApp, purchasedModules } = useSystemConnection();
  const [searchQuery, setSearchQuery] = useState('');
  const [authState, setAuthState] = useState<AuthState | null>(null);

  // System modules that should NEVER appear on a tenant subdomain
  const SYSTEM_MODULES = useMemo(
    () =>
      new Set([
        'auth-portal',
        'KosAuth',
        'db-collections-hub',
        'db-collections',
        'KosData',
        'db-connector-hub',
        'KosConnector',
        'KosTenantProvisioner',
        'tenant-provisioner',
        'template',
        '_template',
        'KosTemplate',
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

  // Effective Tenant Resolution
  const resolvedTenantId = useMemo(() => {
    if (tenantId) return tenantId;
    return resolveCurrentTenantId();
  }, [tenantId]);

  const isMasterTenant = !resolvedTenantId || resolvedTenantId === ROOT_TENANT_ID || resolvedTenantId === '_master';
  const effectiveIsSubdomain = isSubdomain ?? !isMasterTenant;

  // Real-time Firestore activeModules synchronization for this tenant
  const [liveTenantModules, setLiveTenantModules] = useState<string[] | null>(null);

  useEffect(() => {
    if (isMasterTenant || !resolvedTenantId || !firebaseApp) {
      setLiveTenantModules(null);
      return;
    }
    try {
      const db = getFirestore(firebaseApp);
      const tenantRef = doc(db, 'tenants', resolvedTenantId);
      const unsub = onSnapshot(
        tenantRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (Array.isArray(data.activeModules)) {
              setLiveTenantModules(data.activeModules);
            }
          }
        },
        (err) => {
          console.warn('[KosNevModal] Realtime tenant modules sync note:', err);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('[KosNevModal] Failed to listen to tenant activeModules:', e);
    }
  }, [resolvedTenantId, isMasterTenant, firebaseApp]);

  // Dynamic Tenant Entitlement Set
  const canonicalAllowedSet = useMemo<Set<string> | null>(() => {
    // If master tenant on apex domain, they have full access to all modules
    if (isMasterTenant) {
      return null;
    }

    // 1. Live Firestore active modules for this tenant
    if (liveTenantModules && liveTenantModules.length > 0) {
      return new Set(liveTenantModules.map(toCanonicalModuleId));
    }

    // 2. Prop passed from parent dock/view
    if (activeModules && activeModules.length > 0) {
      return new Set(activeModules.map(toCanonicalModuleId));
    }

    // 3. System Connection purchased modules
    if (purchasedModules && purchasedModules.length > 0) {
      return new Set(purchasedModules.map(toCanonicalModuleId));
    }

    // 4. Local storage / mock tenant store
    const local = (TenantCoreService.getLocalTenants() as any[]).find(
      (t: any) => t?.subdomain && t.subdomain.toLowerCase() === resolvedTenantId.toLowerCase()
    );
    if (local && Array.isArray(local.activeModules) && local.activeModules.length > 0) {
      return new Set(local.activeModules.map(toCanonicalModuleId));
    }

    // Tenant exists but has 0 modules provisioned
    return new Set<string>();
  }, [isMasterTenant, liveTenantModules, activeModules, purchasedModules, resolvedTenantId]);

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

  // Filtered, strictly deduplicated, and sorted modules
  const sortedModules = useMemo(() => {
    if (!isOpen) return [];

    const seenCanonical = new Set<string>();
    const list: Array<{
      id: string;
      canonicalId: string;
      name: string;
      route: string;
      meta: typeof MODULE_META_CONFIG[string];
      usageCount: number;
    }> = [];

    for (const m of REGISTERED_MODULES) {
      const canonicalId = toCanonicalModuleId(m.id);

      // 1. Hide system modules on subdomains/tenants
      if (effectiveIsSubdomain && SYSTEM_MODULES.has(canonicalId)) {
        continue;
      }

      // 2. Strictly eliminate duplicates by canonical identity
      if (seenCanonical.has(canonicalId)) {
        continue;
      }

      // 3. Dynamic tenant isolation: show ONLY provisioned modules for this tenant
      if (canonicalAllowedSet !== null) {
        if (!canonicalAllowedSet.has(canonicalId)) {
          continue; // Module is not unlocked for this tenant
        }
      }

      // 4. Resolve official metadata
      const meta = MODULE_META_CONFIG[canonicalId] || MODULE_META_CONFIG[m.id] || {
        hebrewName: m.name,
        englishPrefix: 'KOS',
        englishRest: canonicalId.replace(/^Kos/, ''),
        icon: LayoutGrid,
      };

      // 5. Search query filter
      if (searchQuery.trim()) {
        const heb = meta.hebrewName || m.name;
        const eng = `${meta.englishPrefix} ${meta.englishRest}`;
        const slogan = meta.slogan || '';
        const query = searchQuery.toLowerCase().trim();
        const matches = 
          heb.toLowerCase().includes(query) ||
          eng.toLowerCase().includes(query) ||
          (m.name || '').toLowerCase().includes(query) ||
          slogan.toLowerCase().includes(query) ||
          canonicalId.toLowerCase().includes(query) ||
          (canonicalId === 'KosWebAi' && (query === 'kwb' || query.includes('builder') || query.includes('bulider') || query.includes('בונה') || query.includes('אתר')));
        if (!matches) continue;
      }

      seenCanonical.add(canonicalId);

      const preferredRoute = CANONICAL_MODULE_ROUTES[canonicalId] || m.route;

      list.push({
        id: m.id,
        canonicalId,
        name: meta.hebrewName,
        route: preferredRoute,
        meta,
        usageCount: moduleUsageStats[canonicalId] || moduleUsageStats[m.id] || 0,
      });
    }

    // Sort dynamically by usage count (highest first), then alphabetically in Hebrew
    return list.sort((a, b) => {
      if (b.usageCount !== a.usageCount) return b.usageCount - a.usageCount;
      return a.name.localeCompare(b.name, 'he');
    });
  }, [isOpen, searchQuery, effectiveIsSubdomain, canonicalAllowedSet, SYSTEM_MODULES, moduleUsageStats]);

  if (!isOpen) return null;

  const handleNavigateToModule = (canonicalId: string, preferredRoute: string) => {
    // Record usage dynamically
    setModuleUsageStats((prev) => {
      const updated = { ...prev, [canonicalId]: (prev[canonicalId] || 0) + 1 };
      try {
        localStorage.setItem('kosun_module_usage_stats', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    onClose();

    let targetRoute = preferredRoute;
    const isLocal = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.endsWith('.local')
    );
    if (isLocal && !isMasterTenant && resolvedTenantId) {
      const separator = targetRoute.includes('?') ? '&' : '?';
      targetRoute = `${targetRoute}${separator}tenant=${encodeURIComponent(resolvedTenantId)}`;
    }

    if (onSelectModule) {
      onSelectModule(canonicalId, targetRoute);
    } else {
      window.location.href = targetRoute;
    }
  };

  const handleLogout = async () => {
    onClose();
    if (effectiveIsSubdomain && resolvedTenantId) {
      TenantAuthService.logoutTenant(resolvedTenantId);
      sessionStorage.setItem(`tenant_admin_${resolvedTenantId}`, 'false');
      const isLocal = window.location.hostname.startsWith('localhost') || window.location.hostname.startsWith('127.0.0.1');
      if (isLocal) {
        window.location.href = `/?tenant=${resolvedTenantId}&mode=public`;
      } else {
        window.location.href = `https://${resolvedTenantId}.kosun.pro/?mode=public`;
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
                {!isMasterTenant && resolvedTenantId && (
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                    @{resolvedTenantId}
                  </span>
                )}
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
              <p className="font-bold text-sm">לא נמצאו רכיבים מורשים לטננט זה</p>
              <p className="text-xs text-slate-400">רכיבים מוצגים בהתאם לחבילה שהוקצתה לחשבונך בלבד</p>
              {onOpenAuthModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuthModal();
                  }}
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl hover:bg-indigo-100 transition cursor-pointer mt-2"
                >
                  התחבר מחדש
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {sortedModules.map((module, index) => {
                const isActive = activeModuleId === module.canonicalId || activeModuleId === module.id;
                const meta = module.meta;
                const Icon = meta.icon;
                const usageCount = module.usageCount;

                return (
                  <button
                    key={module.canonicalId}
                    type="button"
                    onClick={() => handleNavigateToModule(module.canonicalId, module.route)}
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
                        {meta.slogan && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                            {meta.slogan}
                          </div>
                        )}
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
          {(authState && authState.isAuthenticated && !authState.isAnonymous) || effectiveIsSubdomain ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                  {authState?.displayName ? authState.displayName[0].toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {authState?.displayName || authState?.email?.split('@')[0] || (resolvedTenantId ? `מנהל ${resolvedTenantId}` : 'מנהל מורשה')}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                    {authState?.email || (resolvedTenantId ? `${resolvedTenantId}.kosun.pro` : 'מערכת קושאן')}
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
