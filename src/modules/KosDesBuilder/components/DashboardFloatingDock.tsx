import React from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  MessageCircle,
  Settings,
  Layers,
  Sparkles,
} from 'lucide-react';
import { DashboardFloatingDockConfig, DashboardFloatingDockItem } from '../types';

export interface DashboardFloatingDockProps {
  config: DashboardFloatingDockConfig;
  activeTarget?: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  CreditCard,
  MessageCircle,
  Settings,
  Layers,
  Sparkles,
};

export const DashboardFloatingDock: React.FC<DashboardFloatingDockProps> = ({
  config,
  activeTarget = '/dashboard',
}) => {
  return (
    <div className="w-full flex items-center justify-center py-4" dir="rtl">
      <nav className="inline-flex items-center gap-1.5 sm:gap-2 p-2 rounded-3xl bg-slate-900/90 dark:bg-slate-950/90 text-white backdrop-blur-xl border border-white/10 shadow-2xl">
        {config.items.map((item: DashboardFloatingDockItem) => {
          const Icon = (item.icon && ICON_MAP[item.icon]) || LayoutDashboard;
          const isActive = activeTarget === item.targetUrl;

          return (
            <a
              key={item.id}
              href={item.targetUrl}
              className={`relative inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {config.showLabels && <span className="hidden sm:inline">{item.label}</span>}

              {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-[10px] font-black text-white flex items-center justify-center shrink-0">
                  {item.badgeCount}
                </span>
              )}
            </a>
          );
        })}
      </nav>
    </div>
  );
};
