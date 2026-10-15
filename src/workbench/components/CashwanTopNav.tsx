import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  Layers,
  Layout,
  CreditCard,
  MessageSquare,
  ShoppingBag,
  Film,
  BookOpen,
  Image,
  Database,
  BarChart3,
  ShieldCheck,
  ChevronDown,
  Globe,
  User,
  LogOut,
  Sun,
  Moon,
  Search,
  Check,
  X,
  Menu,
  Mail,
  Building2,
  Sliders,
  Target,
  Palette,
} from 'lucide-react';
import { REGISTERED_MODULES } from '../moduleRegistry';
import { useSystemConnection } from '../../core/connection/SystemConnectionContext';
import { DatabaseConnectorModal } from '../../modules/db-connector-hub';
import { subscribeToAuth, AuthState, logoutUser } from '../../services/firebaseAuth';
import { SmartTooltip } from '../../components/Ui/SmartTooltip';
import { useBrandDna } from '../../modules/KosBranding/hooks/useBrandDna';
import { TenantTokenBadge } from '../../core/ai';

const BRAND_DNA_TABS = [
  { id: 'identity', label: '1. זהות עסקית', icon: Building2 },
  { id: 'voice', label: '2. שפת מותג וטון', icon: Sliders },
  { id: 'audience', label: '3. קהלי יעד ובידול', icon: Target },
  { id: 'ecosystem', label: '4. מבנה שירותים', icon: Layers },
  { id: 'design', label: '5. שפה חזותית', icon: Palette },
  { id: 'trust', label: '6. אמינות וסליקה', icon: ShieldCheck },
  { id: 'market', label: '7. מחקר שוק ומתחרים (AI)', icon: Globe },
];

const MODULE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'kosun-am': Mail,
  'kosai-engine': Bot,
  'KosBranding': Sparkles,
  'kesher-payments-hub': CreditCard,
  'KosWhatsUp': MessageSquare,
  'whatsapp-green-api-hub': MessageSquare,
  'crm-groups-hub': Layers,
  'smart-form-builder': BookOpen,
  'video-producer-studio': Film,
  'KosWebAi': Layout,
  'crm-analytics': BarChart3,
  'media-gallery-hub': Image,
  'db-connector-hub': Database,
  'auth-portal': ShieldCheck,
};

interface CashwanTopNavProps {
  onOpenAuthModal?: () => void;
}

/**
 * Cashwan 2026 Top Navigation (Rule 2 in cashwan-branding)
 * - Pure Top Navigation: Zero Sidebars / Sliders
 * - Mobile-first, sleek glass design with negative space
 * - Quick module picker dropdown & Bento search
 * - Lucide icons only (Zero emojis)
 * - Day / Night mode support
 */
export const CashwanTopNav: React.FC<CashwanTopNavProps> = ({ onOpenAuthModal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { firebaseApp, purchasedModules } = useSystemConnection();
  const { brandDna } = useBrandDna();
  const [logoError, setLogoError] = useState(false);
  const logoUrl = brandDna?.identity?.logoUrl || '/images/kosun-logo.svg';

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('kosun_theme') as 'light' | 'dark') || 'light';
  });

  const toggleTheme = () => {
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

  const [authState, setAuthState] = useState<AuthState>({
    user: null, uid: null, email: null, displayName: null, photoURL: null,
    role: 'viewer', isAuthenticated: false, isAnonymous: false, loading: true, error: null
  });

  useEffect(() => {
    if (!firebaseApp) return;
    const unsub = subscribeToAuth(firebaseApp, (state) => {
      setAuthState(state);
    });
    return () => unsub();
  }, [firebaseApp]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const isBrandDna = location.pathname.startsWith('/brand-dna');
  const [dnaActiveTab, setDnaActiveTab] = useState<string>('identity');
  const [dnaScore, setDnaScore] = useState<number | null>(() => {
    const saved = localStorage.getItem('brand_dna_score');
    return saved ? Number(saved) : 100;
  });

  useEffect(() => {
    const handleScoreChange = (e: any) => {
      if (typeof e.detail?.score === 'number') {
        setDnaScore(e.detail.score);
      }
    };
    const handleTabChange = (e: any) => {
      if (e.detail?.tab) {
        setDnaActiveTab(e.detail.tab);
      }
    };
    window.addEventListener('brand_dna_score_changed', handleScoreChange);
    window.addEventListener('brand_dna_active_tab_changed', handleTabChange);
    return () => {
      window.removeEventListener('brand_dna_score_changed', handleScoreChange);
      window.removeEventListener('brand_dna_active_tab_changed', handleTabChange);
    };
  }, []);

  const handleSwitchBrandDnaTab = (tabId: string) => {
    setDnaActiveTab(tabId);
    window.dispatchEvent(new CustomEvent('brand_dna_switch_tab', { detail: { tab: tabId } }));
  };

  const activeModule = REGISTERED_MODULES.find((m) =>
    location.pathname.startsWith(m.route)
  );

  const filteredModules = REGISTERED_MODULES.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors select-none" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Left: Brand & Module Dropdown */}
        <div className="flex items-center gap-3">
          {/* Logo */}
          <NavLink
            to="/"
            className="flex items-center gap-2 group cursor-pointer"
            title="קושאן - דף הבית"
          >
            {!logoError && logoUrl ? (
              <img
                src={logoUrl}
                alt={brandDna?.identity?.companyName || 'קושאן'}
                onError={() => setLogoError(true)}
                className="h-8 sm:h-9 w-auto max-w-[130px] object-contain group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-600/20 group-hover:bg-indigo-500 transition-all">
                  ק
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white leading-tight">
                    {brandDna?.identity?.companyName || 'קושאן'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium leading-none hidden sm:inline">
                    {brandDna?.identity?.slogan || 'שותף אישי חכם'}
                  </span>
                </div>
              </div>
            )}
          </NavLink>

          {/* Module Selector Pill */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition border border-slate-200/80 dark:border-slate-700/80 cursor-pointer"
            >
              {activeModule ? (
                <>
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">
                    {activeModule.name.split('-')[0].trim()}
                  </span>
                </>
              ) : (
                <span>בחר כלי</span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Bento Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Search */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="חיפוש כלי בקושאן..."
                    className="w-full pl-3 pr-8 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="max-h-72 overflow-y-auto space-y-1 custom-scrollbar">
                  {filteredModules.map((module) => {
                    const Icon = MODULE_ICONS[module.id] || Sparkles;
                    const isActive = location.pathname.startsWith(module.route);

                    return (
                      <button
                        key={module.id}
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate(module.route);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-right transition cursor-pointer ${
                          isActive
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isActive
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <span className="text-xs truncate block">{module.name}</span>
                          </div>
                        </div>
                        {isActive && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* User Session & Logout in Modules Menu */}
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  {authState.isAuthenticated && !authState.isAnonymous ? (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {authState.displayName ? authState.displayName[0].toUpperCase() : <User className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                            {authState.displayName || authState.email?.split('@')[0]}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                            {authState.email}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          setIsDropdownOpen(false);
                          await logoutUser(firebaseApp);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-[11px] font-bold flex items-center gap-1 transition shrink-0 cursor-pointer"
                        title="התנתק מהחשבון"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>התנתק</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenAuthModal?.();
                      }}
                      className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>כניסה לחשבון</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Component Category Tabs (Pinned to Top) */}
        {isBrandDna && (
          <div className="flex-1 flex items-center justify-center overflow-x-auto scrollbar-none px-2">
            <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              {BRAND_DNA_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = dnaActiveTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleSwitchBrandDnaTab(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Right: Tenant AI Tokens Badge & Day/Night Mode Toggle */}
        <div className="flex items-center gap-2">
          {/* Reactive Tenant Token Counter Badge */}
          <TenantTokenBadge />

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            {isBrandDna && dnaScore !== null && (
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-colors ${
                  dnaScore >= 80
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                    : dnaScore >= 50
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
                }`}
                title="אחוז שלמות ה-Brand DNA"
              >
                <span>{dnaScore}%</span>
                <span className="text-[10px] font-normal hidden sm:inline">שלמות</span>
              </div>
            )}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
              title={theme === 'dark' ? 'מעבר לתצוגת יום' : 'מעבר לתצוגת לילה'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </div>

      <DatabaseConnectorModal />
    </header>
  );
};

export default CashwanTopNav;
