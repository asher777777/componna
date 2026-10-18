import React from 'react';
import {
  UserPlus,
  Receipt,
  Send,
  Layout,
  PlusCircle,
  FileText,
  CreditCard,
  MessageCircle,
  Settings,
  ArrowUpRight,
} from 'lucide-react';
import { DashboardQuickActionsConfig, DashboardActionButtonItem } from '../types';

export interface DashboardQuickActionsSectionProps {
  config: DashboardQuickActionsConfig;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  UserPlus,
  Receipt,
  Send,
  Layout,
  PlusCircle,
  FileText,
  CreditCard,
  MessageCircle,
  Settings,
};

const VARIANT_STYLES: Record<string, string> = {
  primary:
    'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 border-transparent',
  secondary:
    'bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 border-transparent',
  outline:
    'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700',
  danger:
    'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20 border-transparent',
};

export const DashboardQuickActionsSection: React.FC<DashboardQuickActionsSectionProps> = ({ config }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4" dir="rtl">
      {config.title && (
        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
          {config.title}
        </h3>
      )}

      <div
        className={
          config.layout === 'row'
            ? 'flex flex-wrap items-center gap-3'
            : 'grid grid-cols-2 sm:grid-cols-4 gap-3'
        }
      >
        {config.buttons.map((btn: DashboardActionButtonItem) => {
          const Icon = (btn.icon && ICON_MAP[btn.icon]) || PlusCircle;
          const style = VARIANT_STYLES[btn.variant || 'outline'] || VARIANT_STYLES.outline;

          return (
            <a
              key={btn.id}
              href={btn.target}
              className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all duration-200 cursor-pointer group ${style}`}
            >
              <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>{btn.label}</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          );
        })}
      </div>
    </div>
  );
};
