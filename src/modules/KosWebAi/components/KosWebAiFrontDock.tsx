import React, { useState, useEffect } from 'react';
import { 
  Edit3, 
  Settings2, 
  Globe, 
  Sparkles, 
  Sun, 
  Moon, 
  Eye, 
  Check, 
  ChevronUp, 
  X, 
  Layers, 
  Palette,
  ExternalLink,
  Plus
} from 'lucide-react';

export interface KosWebAiFrontDockProps {
  pageId?: string;
  isEditing?: boolean;
  onToggleEditMode?: () => void;
  isSaving?: boolean;
  onOpenSettings?: () => void;
  onOpenAddSection?: () => void;
  className?: string;
}

export const KosWebAiFrontDock: React.FC<KosWebAiFrontDockProps> = ({
  pageId,
  isEditing = false,
  onToggleEditMode,
  isSaving = false,
  onOpenSettings,
  onOpenAddSection,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Day / Night mode
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('kosun_theme') as 'light' | 'dark') ||
      (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  });

  useEffect(() => {
    const handleThemeChange = (e: any) => {
      const next = e?.detail?.theme || (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      setTheme(next);
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

  const handleGoToStudio = () => {
    const target = pageId ? `/KosWebAi?pageId=${pageId}` : '/KosWebAi';
    window.location.href = target;
  };

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 select-none ${className}`}
      dir="rtl"
      style={{ fontFamily: 'Heebo, sans-serif' }}
    >
      {/* Minimized Dock Trigger (Default Discreet State) */}
      {!isExpanded ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full backdrop-blur-xl border shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer ${
            isEditing
              ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400 ring-4 ring-amber-500/20 shadow-amber-600/30'
              : 'bg-slate-900/95 hover:bg-slate-800 text-slate-100 border-slate-700/80 shadow-black/40'
          }`}
          title="פתח פקדי בונה האתרים (KosWebAi)"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>

          <span className="text-xs font-extrabold tracking-tight">
            {isEditing ? 'מצב עריכה פעיל' : 'KosWebAi'}
          </span>

          {isEditing && (
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping pointer-events-none" />
          )}

          <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform" />
        </button>
      ) : (
        /* Full Expanded Dock Belonging Exclusively to KosWebAi */
        <nav className="flex items-center gap-2 bg-slate-900/95 dark:bg-[#0c0c0e]/95 backdrop-blur-2xl border border-slate-700/80 p-2 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95">
          {/* Module Monopoly Badge */}
          <div className="flex items-center gap-1.5 pl-2 pr-1 border-l border-slate-700/80 text-xs font-black text-indigo-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>KosWebAi</span>
          </div>

          {/* 1. Toggle In-Place Visual Edit Mode */}
          {onToggleEditMode && (
            <button
              type="button"
              onClick={onToggleEditMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                isEditing
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
              title={isEditing ? 'יציאה ממצב עריכה' : 'הפעל עריכה חיה בעמוד'}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'סיים עריכה' : 'עריכה חיה'}</span>
            </button>
          )}

          {/* 2. Add Section (when editing) */}
          {isEditing && onOpenAddSection && (
            <button
              type="button"
              onClick={onOpenAddSection}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
              title="הוסף אזור חדש לעמוד"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span>הוסף אזור</span>
            </button>
          )}

          {/* 3. Open Studio Editor */}
          <button
            type="button"
            onClick={handleGoToStudio}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
            title="מעבר לסטודיו בונה האתרים המלא"
          >
            <Palette className="w-3.5 h-3.5 text-purple-400" />
            <span>סטודיו מלא</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>

          {/* 4. Settings Drawer */}
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="הגדרות עמוד ו-SEO"
            >
              <Settings2 className="w-4 h-4 text-slate-400" />
            </button>
          )}

          {/* 5. Day / Night Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition cursor-pointer"
            title={theme === 'dark' ? 'מעבר למצב יום' : 'מעבר למצב לילה'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* 6. Saving Status or Collapse Button */}
          {isSaving ? (
            <span className="text-[11px] font-bold text-amber-400 px-1 animate-pulse">
              שומר...
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              title="מזער תפריט"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </nav>
      )}
    </div>
  );
};
