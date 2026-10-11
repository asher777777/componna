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
  Menu
} from 'lucide-react';
import { REGISTERED_MODULES } from '../moduleRegistry';
import { useSystemConnection } from '../../core/connection/SystemConnectionContext';
import { DatabaseConnectorModal } from '../../modules/db-connector-hub';
import { subscribeToAuth, AuthState, logoutUser } from '../../services/firebaseAuth';
import { SmartTooltip } from '../../components/Ui/SmartTooltip';

const MODULE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'kosai-engine': Bot,
  'control-center-hub': Sparkles,
  'saas-storefront-composer': ShoppingBag,
  'brand-dna-hub': Sparkles,
  'kesher-payments-hub': CreditCard,
  'whatsapp-green-api-hub': MessageSquare,
  'crm-groups-hub': Layers,
  'smart-form-builder': BookOpen,
  'video-producer-studio': Film,
  'page-builder': Layout,
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
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-600/20 group-hover:bg-indigo-500 transition-all">
              ק
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white leading-tight">
                קושאן
              </span>
              <span className="text-[10px] text-slate-400 font-medium leading-none hidden sm:inline">
                שותף אישי חכם
              </span>
            </div>
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
              </div>
            )}
          </div>
        </div>

        {/* Center: Top Nav Quick Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <NavLink
            to="/control-center"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-xl transition ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`
            }
          >
            מרכז שליטה
          </NavLink>
          <NavLink
            to="/page-builder"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-xl transition ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`
            }
          >
            בונה עמודים
          </NavLink>
          <NavLink
            to="/saas-storefront"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-xl transition ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`
            }
          >
            חנות רכיבים
          </NavLink>
          <NavLink
            to="/kesher-payments"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-xl transition ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`
            }
          >
            תשלומים
          </NavLink>
        </nav>

        {/* Right: Actions, Theme Toggle & Auth */}
        <div className="flex items-center gap-2">
          {/* Day / Night Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={theme === 'dark' ? 'מעבר לתצוגת יום' : 'מעבר לתצוגת לילה'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile or Login */}
          {authState.isAuthenticated && !authState.isAnonymous ? (
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 py-1 px-2 rounded-xl text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 hidden sm:inline max-w-[100px] truncate">
                {authState.displayName || authState.email?.split('@')[0]}
              </span>
              <button
                type="button"
                onClick={() => logoutUser(firebaseApp)}
                className="text-slate-400 hover:text-rose-500 p-1"
                title="התנתק"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              כניסה
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-150">
          <NavLink
            to="/control-center"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            מרכז שליטה
          </NavLink>
          <NavLink
            to="/page-builder"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            בונה עמודים
          </NavLink>
          <NavLink
            to="/saas-storefront"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            חנות רכיבים
          </NavLink>
          <NavLink
            to="/kesher-payments"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            תשלומים
          </NavLink>
        </div>
      )}

      <DatabaseConnectorModal />
    </header>
  );
};

export default CashwanTopNav;
