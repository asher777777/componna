import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sun, 
  Moon, 
  ChevronUp, 
  LayoutGrid, 
  Search, 
  X, 
  Edit3,
  Settings2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { REGISTERED_MODULES, ModuleDefinition } from '../../workbench/moduleRegistry';

interface FloatingSystemDockProps {
  editPageUrl?: string;
  isEditing?: boolean;
  onToggleEditMode?: () => void;
  isSaving?: boolean;
  onEnterDevWorkbench?: () => void;
  onOpenSettings?: () => void;
  className?: string;
}

export const FloatingSystemDock: React.FC<FloatingSystemDockProps> = ({
  editPageUrl,
  isEditing = false,
  onToggleEditMode,
  isSaving = false,
  onEnterDevWorkbench,
  onOpenSettings,
  className = '',
}) => {
  const navigate = useNavigate();

  const [isModulesMenuOpen, setIsModulesMenuOpen] = useState(false);
  const [moduleSearchQuery, setModuleSearchQuery] = useState('');
  // By default per Cashwan branding standard, the dock is minimized to an elegant floating icon button
  const [isDockExpanded, setIsDockExpanded] = useState(false);

  // Day / Night Theme (Light is default per Cashwan standard)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('kosun_theme') as 'light' | 'dark') || 
      (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  });

  useEffect(() => {
    const handleThemeChange = (e: any) => {
      const newTheme = e?.detail?.theme || (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      setTheme(newTheme);
    };
    window.addEventListener('kosun_theme_changed', handleThemeChange);
    return () => window.removeEventListener('kosun_theme_changed', handleThemeChange);
  }, []);

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

  const filteredModules = useMemo(() => {
    if (!moduleSearchQuery.trim()) return REGISTERED_MODULES;
    return REGISTERED_MODULES.filter((m: ModuleDefinition) =>
      m.name.toLowerCase().includes(moduleSearchQuery.toLowerCase())
    );
  }, [moduleSearchQuery]);

  return (
    <>
      {/* Minimized Floating Trigger Icon (Default) */}
      {!isDockExpanded ? (
        <button
          type="button"
          onClick={() => setIsDockExpanded(true)}
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 p-2.5 rounded-full bg-slate-900/95 hover:bg-slate-800 text-slate-200 hover:text-white backdrop-blur-xl border border-slate-700/80 shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer flex items-center gap-2 group ${className}`}
          title="פתיחת תפריט מערכת קושאן (Floating Dock)"
          aria-label="פתח תפריט צף"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-xs shadow-md shadow-indigo-600/40">
            ק
          </div>
          <span className="text-xs font-bold pl-2 pr-1 text-slate-300 group-hover:text-white transition hidden group-hover:inline-block">
            תפריט קושאן
          </span>
        </button>
      ) : (
        /* Full Floating Dock Bar */
        <nav 
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 px-3 py-2 rounded-2xl shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95 ${className}`}
          dir="rtl"
          aria-label="תפריט מערכת צף (קושאן)"
        >
          {/* Collapse Icon */}
          <button
            type="button"
            onClick={() => setIsDockExpanded(false)}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="מזער תפריט צף"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Quick Edit Page button */}
          {(onToggleEditMode || editPageUrl) && (
            <button
              type="button"
              onClick={() => {
                if (onToggleEditMode) {
                  onToggleEditMode();
                } else if (editPageUrl) {
                  if (onEnterDevWorkbench) onEnterDevWorkbench();
                  navigate(editPageUrl);
                }
              }}
              disabled={isSaving}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-bold transition shadow-sm cursor-pointer ${
                isEditing
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-300 font-black'
                  : 'bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40'
              }`}
              title={isEditing ? 'סיום עריכה ושמירת העמוד' : 'עריכת עמוד זה על גבי הדומיין'}
            >
              <Edit3 className={`w-3.5 h-3.5 ${isEditing ? 'text-slate-950' : 'text-indigo-400'}`} />
              <span className="hidden sm:inline">
                {isSaving ? 'שומר שינויים...' : isEditing ? 'סיום עריכה' : 'ערוך עמוד'}
              </span>
            </button>
          )}

          {/* Quick Page Settings & SEO Button */}
          {isEditing && onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 text-xs bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 px-3 py-1.5 rounded-xl font-bold transition shadow-sm cursor-pointer"
              title="הגדרות עמוד, SEO ואנליטיקס"
            >
              <Settings2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">הגדרות ו-SEO</span>
            </button>
          )}

          {/* Components Menu Button */}
          <button
            type="button"
            onClick={() => setIsModulesMenuOpen(!isModulesMenuOpen)}
            className="flex items-center gap-1.5 text-xs bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 px-3 py-1.5 rounded-xl font-bold transition shadow-sm cursor-pointer"
            title="מעבר בין כלי ורכיבי המערכת"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">רכיבים</span>
            <ChevronUp className={`w-3 h-3 text-indigo-300 transition-transform ${isModulesMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Day / Night Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-xl border border-slate-700/80 hover:bg-slate-800 text-amber-400 transition cursor-pointer"
            title={theme === 'light' ? 'מעבר למצב לילה (Dark Mode)' : 'מעבר למצב יום (Light Mode)'}
            aria-label="החלף ערכת נושא"
          >
            {theme === 'light' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-300" />}
          </button>
        </nav>
      )}

      {/* 100% Full-Screen Components & SEO Menu (Cashwan Branding Standard) */}
      {isModulesMenuOpen && (
        <div className="fixed inset-0 w-screen h-screen z-50 bg-[#090a0f]/98 backdrop-blur-2xl p-6 sm:p-10 flex flex-col justify-start items-center overflow-y-auto animate-in fade-in duration-200" dir="rtl">
          {/* Header Bar */}
          <div className="max-w-xl w-full flex items-center justify-between pb-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">רכיבי מערכת קושאן</h2>
                <span className="text-xs text-slate-400">מעבר מהיר לרכיבים והגדרות</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsModulesMenuOpen(false)}
              className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              title="סגירה"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl w-full mt-6">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={moduleSearchQuery}
                onChange={(e) => setModuleSearchQuery(e.target.value)}
                placeholder="חיפוש רכיב..."
                className="w-full pl-4 pr-11 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 transition font-bold"
                autoFocus
              />
            </div>
          </div>

          {/* Vertical Stack: Row under Row, Clean Names Only */}
          <div className="max-w-xl w-full flex flex-col gap-2.5 py-6">
            {/* SEO & Promotion Modal Action Item */}
            {onOpenSettings && (
              <button
                type="button"
                onClick={() => {
                  setIsModulesMenuOpen(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-indigo-950/70 to-purple-950/50 hover:from-indigo-900/80 hover:to-purple-900/60 border border-indigo-500/40 text-right transition-all group cursor-pointer shadow-lg shadow-indigo-950/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="font-bold text-sm text-white group-hover:text-indigo-200 transition-colors">
                    קידום ו-SEO (גוגל, בינה מלאכותית ואנליטיקס)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:translate-x-[-4px] transition-transform">
                  <span>פתח הגדרות</span>
                  <ArrowLeft className="w-4 h-4" />
                </div>
              </button>
            )}

            {/* Modules List - Single column row under row, clean name only */}
            {filteredModules.map((module: ModuleDefinition) => (
              <button
                key={module.id}
                type="button"
                onClick={() => {
                  setIsModulesMenuOpen(false);
                  if (onEnterDevWorkbench) onEnterDevWorkbench();
                  navigate(module.route);
                }}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/40 text-right transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 group-hover:text-indigo-400 group-hover:bg-indigo-600/10 flex items-center justify-center transition-colors">
                    <LayoutGrid className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                    {module.name.split('-')[0].trim()}
                  </span>
                </div>
                <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-[-4px] transition-all" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
