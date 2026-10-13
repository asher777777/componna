import React, { useState, useEffect } from 'react';
import { Sun, Moon, Menu, X, LucideIcon } from 'lucide-react';

export interface KosunNavItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  href?: string;
  badge?: string;
}

export interface KosunShellProps {
  /** English component name only (e.g. 'KSF', 'KOSUN Forms') */
  componentName: string;
  /** Navigation links for the floating side drawer */
  navItems?: KosunNavItem[];
  /** Secondary actions inside the floating drawer */
  drawerFooter?: React.ReactNode;
  /** Main view content */
  children: React.ReactNode;
}

export const KosunShell: React.FC<KosunShellProps> = ({
  componentName,
  navItems = [],
  drawerFooter,
  children,
}) => {
  // Day Mode is the strict system default
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('kosun_theme') === 'dark';
  });

  // Floating side drawer is ALWAYS hidden by default
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kosun_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kosun_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 font-sans relative selection:bg-blue-600 selection:text-white"
      dir="rtl"
    >
      {/* 1. כפתור עליון ימני צף: אייקון קושאן + שם רכיב באנגלית בלבד + אייקון תפריט */}
      <div className="fixed top-4 right-4 z-50">
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="h-10 px-3.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-slate-900 dark:text-slate-100 shadow-md hover:scale-105 active:scale-95 transition-all"
          aria-label="Open navigation menu"
        >
          <img
            src="/images/kosun-symbol.svg"
            alt="KOSUN"
            className="w-6 h-6 rounded-md object-contain shadow-sm"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/kosun-official-logo.png';
            }}
          />
          <span className="font-extrabold text-xs tracking-wider font-mono">
            {componentName}
          </span>
          <Menu className="w-4 h-4 text-slate-500 dark:text-slate-400 mr-1" />
        </button>
      </div>

      {/* 3. תפריט צף צדי (Floating Side Drawer) - מוסתר תמיד כברירת מחדל */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isDrawerOpen}
      >
        {/* כותרת התפריט עם כפתור סגירה 'x' */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/images/kosun-symbol.svg"
              alt="KOSUN"
              className="w-7 h-7 rounded-lg object-contain shadow-sm"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/images/kosun-official-logo.png';
              }}
            />
            <span className="font-black text-sm text-slate-900 dark:text-white font-mono">
              {componentName}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
            title="סגור תפריט"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* קישורי התפריט שורה מתחת שורה */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto text-xs font-bold text-slate-600 dark:text-slate-300">
          {navItems.map((item) => {
            const Icon = item.icon;
            const handleClick = () => {
              setIsDrawerOpen(false);
              if (item.onClick) item.onClick();
            };

            return (
              <a
                key={item.id}
                href={item.href || '#'}
                onClick={handleClick}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                <div className="flex items-center gap-3">
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        {/* כפתור החלפת יום/לילה מובנה בתוך התפריט */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 hover:border-indigo-400 transition cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
              <span>{isDarkMode ? 'מצב תצוגה: לילה (החלף ליום)' : 'מצב תצוגה: יום (החלף ללילה)'}</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        </div>

        {drawerFooter && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
            {drawerFooter}
          </div>
        )}
      </aside>

      {/* רקע כהה כשהמגירה פתוחה */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* 4. גוף העמוד - מתחיל בדיוק מ-0px ללא שום סטריפ עליון */}
      <main className="w-full min-h-screen pt-0">{children}</main>
    </div>
  );
};

export default KosunShell;
