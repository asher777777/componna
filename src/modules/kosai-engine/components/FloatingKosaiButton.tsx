import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useKosai } from '../context/KosaiContext';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../core/contracts';
import { 
  Sparkles, 
  Sun, 
  Moon, 
  LayoutGrid, 
  X, 
  Settings, 
  HelpCircle, 
  ChevronUp,
  Plus,
  Wand2,
  Sliders,
  MessageSquare,
  BarChart3,
  FileText,
  Send,
  CreditCard,
  Image,
  Users,
  User,
  Target,
  Eye,
  LogOut
} from 'lucide-react';
import { REGISTERED_MODULES } from '../../../workbench/moduleRegistry';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { subscribeToAuth, AuthState } from '../../../services/firebaseAuth';
import { useTenantScope } from '../../../core/tenant';
import { TenantAuthService } from '../../KosTenantProvisioner/services/tenantAuthService';

export const FloatingKosaiButton: React.FC = () => {
  const { firebaseApp } = useSystemConnection();
  const { tenantId, isRootTenant } = useTenantScope();
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const { isOpen, setIsOpen, activeRoleMode, activeModule } = useKosai();

  useEffect(() => {
    if (!firebaseApp) return;
    const unsub = subscribeToAuth(firebaseApp, (state) => {
      setAuthState(state);
    });
    return () => unsub();
  }, [firebaseApp]);

  const isAllowedEditor = Boolean(
    authState &&
    authState.isAuthenticated &&
    !authState.isAnonymous &&
    (authState.role === 'admin' || authState.role === 'editor')
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Detect whether we are on the frontend / website / page builder area
  const isFront =
    location.pathname === '/' ||
    location.pathname === '' ||
    location.pathname.startsWith('/p/') ||
    location.pathname.startsWith('/to/') ||
    location.pathname.startsWith('/page/') ||
    location.pathname.startsWith('/preview') ||
    location.pathname.startsWith('/builder') ||
    location.pathname.toLowerCase().startsWith('/koswebai') ||
    location.hash.includes('/p/') ||
    location.hash.includes('/page/') ||
    location.hash.includes('/preview') ||
    location.hash.includes('preview') ||
    location.search.includes('pageId=');

  // Day / Night mode handling (Day is strict default per Cashwan constitution)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('kosun_theme');
    if (saved === 'dark') return 'dark';
    if (saved === 'light') return 'light';
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  useEffect(() => {
    const handleThemeChange = (e: any) => {
      const next = e?.detail?.theme || (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      setTheme(next);
    };
    window.addEventListener('kosun_theme_changed', handleThemeChange);
    return () => window.removeEventListener('kosun_theme_changed', handleThemeChange);
  }, []);

  const toggleTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('kosun_theme', next);
    localStorage.setItem('kosun_home_theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.dispatchEvent(new CustomEvent('kosun_theme_changed', { detail: { theme: next } }));
  };

  // Close popup menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Brand DNA Dynamic Colors
  const { getCapability } = useHostCapabilities();
  const brandContract = getCapability<BrandDnaContract>('brand-dna');
  // Dynamic module actions menu open state
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  // Curated quick actions based on the active component
  const moduleQuickActions = useMemo(() => {
    switch (activeModule.moduleId) {
      case 'KSF':
        return [
          {
            id: 'ksf-ai-wizard',
            label: 'סיעור מוחות AI (אשף 100%)',
            desc: 'יצירת שאלון חכם שלב-אחר-שלב',
            icon: Wand2,
            action: () => {
              setIsQuickActionsOpen(false);
              setIsMenuOpen(false);
              window.dispatchEvent(new CustomEvent('ksf_open_ai_brainstorm'));
            },
          },
          {
            id: 'ksf-editor',
            label: 'עורך שלבים ושאלות',
            desc: 'הוספה ועריכה של שאלות השאלון',
            icon: Sliders,
            action: () => {
              setIsQuickActionsOpen(false);
              setIsMenuOpen(false);
              window.dispatchEvent(new CustomEvent('ksf_navigate_tab', { detail: { tab: 'editor' } }));
            },
          },
          {
            id: 'ksf-whatsapp',
            label: 'אוטומציות WhatsApp',
            desc: 'הגדרת מענה וטריגרים לנרשמים',
            icon: MessageSquare,
            action: () => {
              setIsQuickActionsOpen(false);
              setIsMenuOpen(false);
              window.dispatchEvent(new CustomEvent('ksf_navigate_tab', { detail: { tab: 'whatsapp' } }));
            },
          },
          {
            id: 'ksf-analytics',
            label: 'אנליטיקה וטבלת לידים',
            desc: 'צפייה בלידים והמרות מהטפסים',
            icon: BarChart3,
            action: () => {
              setIsQuickActionsOpen(false);
              setIsMenuOpen(false);
              window.dispatchEvent(new CustomEvent('ksf_navigate_tab', { detail: { tab: 'analytics' } }));
            },
          },
          {
            id: 'ksf-forms-list',
            label: 'רשימת כל הטפסים',
            desc: 'ניהול ובחירת טפסים פעילים',
            icon: FileText,
            action: () => {
              setIsQuickActionsOpen(false);
              setIsMenuOpen(false);
              window.dispatchEvent(new CustomEvent('ksf_navigate_tab', { detail: { tab: 'list' } }));
            },
          },
        ];

      case 'KosWebAi':
        return [
          {
            id: 'pb-add-section',
            label: 'הוספת סקשן חדש',
            desc: 'בחירת תבנית עיצובית לעמוד',
            icon: Plus,
            action: () => {
              setIsQuickActionsOpen(false);
              setIsMenuOpen(false);
              window.dispatchEvent(new CustomEvent('pb_add_section'));
            },
          },
          {
            id: 'pb-seo',
            label: 'הגדרות SEO ומטא',
            desc: 'עדכון כותרות ותגיות חיפוש',
            icon: Target,
            action: () => {
              setIsQuickActionsOpen(false);
              setIsMenuOpen(false);
              window.dispatchEvent(new CustomEvent('pb_open_seo'));
            },
          },
          {
            id: 'pb-brand-dna',
            label: 'סנכרון Brand DNA',
            desc: 'החלת צבעי ופונט המותג',
            icon: Sparkles,
            action: () => {
              setIsQuickActionsOpen(false);
              setIsMenuOpen(false);
              navigate('/brand-dna');
            },
          },
        ];

      case 'crm-analytics':
        return [
          {
            id: 'crm-new-contact',
            label: 'איש קשר חדש',
            desc: 'הזנת לקוח ישירות למאגר ה-CRM',
            icon: User,
            action: () => {
              setIsQuickActionsOpen(false);
              setIsMenuOpen(false);
              window.dispatchEvent(new CustomEvent('crm_create_contact'));
            },
          },
          {
            id: 'crm-add-chart',
            label: 'יצירת תרשים AI חדש',
            desc: 'הפקת גרף אנליטי מותאם אישית',
            icon: BarChart3,
            action: () => {
              setIsQuickActionsOpen(false);
              setIsMenuOpen(false);
              window.dispatchEvent(new CustomEvent('crm_create_chart'));
            },
          },
          {
            id: 'crm-groups',
            label: 'פילוח וקהילות CRM',
            desc: 'ניהול קבוצות וסגמנטים',
            icon: Users,
            action: () => {
              setIsQuickActionsOpen(false);
              setIsMenuOpen(false);
              navigate('/crm-groups');
            },
          },
        ];

      case 'whatsapp-green-api-hub':
        return [
          {
            id: 'wa-send-bulk',
            label: 'שידור דינמי / תפוצה',
            desc: 'שליחת הודעה לקבוצה או תפוצה',
            icon: Send,
            action: () => {
              setIsQuickActionsOpen(false);
              setIsMenuOpen(false);
              window.dispatchEvent(new CustomEvent('wa_open_bulk_modal'));
            },
          },
          {
            id: 'wa-new-chat',
            label: 'שיחת WhatsApp חדשה',
            desc: 'פתיחת שיחה ישירה עם לקוח',
            icon: MessageSquare,
            action: () => {
              setIsQuickActionsOpen(false);
              setIsMenuOpen(false);
              window.dispatchEvent(new CustomEvent('wa_open_new_chat'));
            },
          },
        ];

      case 'kesher-payments-hub':
        return [
          {
            id: 'kesher-new-tx',
            label: 'סליקה / חיוב מהיר',
            desc: 'סליקת אשראי, ביט או מזומן',
            icon: CreditCard,
            action: () => {
              setIsQuickActionsOpen(false);
              setIsMenuOpen(false);
              window.dispatchEvent(new CustomEvent('kesher_open_payment_modal'));
            },
          },
        ];

      case 'media-gallery-hub':
        return [
          {
            id: 'media-upload',
            label: 'העלאת קבצי מדיה',
            desc: 'הוספת תמונות לספרייה המרכזית',
            icon: Image,
            action: () => {
              setIsQuickActionsOpen(false);
              setIsMenuOpen(false);
              window.dispatchEvent(new CustomEvent('media_open_upload'));
            },
          },
        ];

      default:
        // Default system actions (Agents fleet, New Page, Form Wizard)
        return [
          {
            id: 'sys-ksf-wizard',
            label: 'יצירת טופס חכם (KSF)',
            desc: 'אשף סיעור מוחות AI לשאלון חדש',
            icon: Wand2,
            action: () => {
              setIsQuickActionsOpen(false);
              setIsMenuOpen(false);
              navigate('/ksf');
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('ksf_open_ai_brainstorm'));
              }, 200);
            },
          },
          {
            id: 'sys-agents-fleet',
            label: 'ניהול סוכני KOSAI',
            desc: 'מרכז שליטה ובקרה לצוות המומחים',
            icon: Settings,
            action: () => {
              setIsQuickActionsOpen(false);
              setIsMenuOpen(false);
              handleOpenAgentsBackoffice({ stopPropagation: () => {} } as any);
            },
          },
        ];
    }
  }, [activeModule.moduleId, navigate]);

  const primaryColor = brandContract?.getBrandDna()?.designTokens?.primaryColor || '#4f46e5';

  const handleOpenAiChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    setIsOpen(true);
  };

  const handleOpenAgentsBackoffice = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    window.dispatchEvent(new CustomEvent('kosun_open_agents_backoffice'));
  };

  const handleOpenModulesDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    window.dispatchEvent(new CustomEvent('kosun_open_modules_menu'));
  };

  // If chat is already open, do not render dock
  if (isOpen) return null;

  // The control center floating menu button must NEVER appear on the website or page builder area
  if (isFront) {
    return null;
  }

  return (
    <div 
      ref={menuRef} 
      className={`fixed select-none z-[60] flex flex-col items-center transition-all duration-300 ${
        isFront
          ? 'bottom-6 left-6'
          : 'bottom-6 left-1/2 -translate-x-1/2'
      }`}
      dir="rtl"
      style={{ fontFamily: 'Heebo, sans-serif' }}
    >
      {/* 1. Dynamic Component Quick Actions Popup (Internal modules only, hidden on front) */}
      {!isFront && isQuickActionsOpen && (
        <div className="mb-3.5 w-80 max-w-[90vw] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-3xl p-3 shadow-2xl shadow-indigo-500/20 flex flex-col gap-1.5 animate-scaleUp">
          <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-100 dark:border-slate-800 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-black text-xs text-slate-800 dark:text-white font-mono">
                פעולות {activeModule.name.split(' ')[0]}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold">
              {activeModule.roleBadge}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            {moduleQuickActions.map((qa) => {
              const Icon = qa.icon;
              return (
                <button
                  key={qa.id}
                  type="button"
                  onClick={qa.action}
                  className="flex items-center gap-2.5 p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-right transition cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800/60 group-hover:scale-105 transition-transform">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {qa.label}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {qa.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Expanded Central Actions Dock Menu (Control Center menu - internal modules only, hidden on front) */}
      {!isFront && isMenuOpen && (
        <div className="mb-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-3xl p-2.5 shadow-2xl shadow-indigo-500/20 flex items-center gap-2 animate-scaleUp">
          {/* 1. Open KosAi Chat */}
          <button
            type="button"
            onClick={handleOpenAiChat}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 transition text-xs font-black font-mono cursor-pointer"
            title="פתח צ'אט KosAi"
          >
            <span>KosAi</span>
          </button>

          {/* 2. Luxury Plus icon for Dynamic Component Quick Actions */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsQuickActionsOpen((prev) => !prev);
            }}
            className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-md shadow-indigo-500/20 transition cursor-pointer flex items-center justify-center group"
            title={`תפריט פעולות מהיר (${activeModule.name})`}
            aria-label="תפריט פעולות רכיב"
          >
            <Plus className={`w-4 h-4 stroke-[2.5] transition-transform duration-300 ${isQuickActionsOpen ? 'rotate-45' : 'group-hover:rotate-90'}`} />
          </button>

          {/* 3. Open All Tools / Modules (KosNev) */}
          <button
            type="button"
            onClick={handleOpenModulesDialog}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition text-xs font-bold cursor-pointer"
            title="תפריט רכיבים - KosNev"
          >
            <LayoutGrid className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>KosNev</span>
          </button>

          {/* 4. Subdomain Tenant Admin Controls (Unified Single Menu standard) */}
          {!isRootTenant && (
            <>
              {/* View as Visitor */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  const url = new URL(window.location.href);
                  url.searchParams.delete('admin');
                  url.pathname = '/';
                  window.location.href = url.toString();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 transition text-xs font-bold cursor-pointer"
                title="צפייה באתר כפי שרואה מבקר"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">צפייה באתר</span>
              </button>

              {/* Logout */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  TenantAuthService.logoutTenant(tenantId);
                  const url = new URL(window.location.href);
                  url.searchParams.delete('admin');
                  url.pathname = '/';
                  window.location.href = url.toString();
                }}
                className="p-2 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-600 dark:text-rose-400 transition cursor-pointer"
                title="התנתק ממערכת הניהול"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}

          {/* 5. Day / Night Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-amber-500 transition cursor-pointer"
            title={theme === 'dark' ? 'מעבר למצב יום' : 'מעבר למצב לילה'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            )}
          </button>

          {/* 5. Close Menu */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(false);
              setIsQuickActionsOpen(false);
            }}
            className="p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
            title="סגור תפריט"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Single Floating Button: K blinking with Star */}
      <button
        onClick={() => {
          if (isFront) {
            setIsOpen(!isOpen);
          } else {
            setIsMenuOpen((prev) => !prev);
          }
        }}
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, #4338ca)`,
          boxShadow: `0 12px 36px -6px ${primaryColor}80`,
        }}
        className="relative w-14 h-14 rounded-2xl text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 group border border-white/30 cursor-pointer overflow-visible animate-pulse"
        title={isFront ? "סוכן שירות לקוחות - מענה לפניות ושאלות" : "תפריט KOSAI - לחץ לפתיחת כל כפתורי ופעולות המערכת"}
        aria-label={isFront ? "סוכן שירות לקוחות" : "כפתור KosAi"}
      >
        {/* Kosun Official Vector Symbol from Gallery */}
        <img
          src="/images/kosun-symbol.svg"
          alt="KOSUN"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/images/kosun-official-logo.png';
          }}
          className="w-7 h-7 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
        />

        {/* Blinking Star & Ping Badge on corner */}
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 pointer-events-none">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-90"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-gradient-to-tr from-amber-400 to-amber-300 items-center justify-center shadow-sm">
            <Sparkles className="w-2.5 h-2.5 text-slate-950 animate-spin" style={{ animationDuration: '4s' }} />
          </span>
        </span>
      </button>
    </div>
  );
};
