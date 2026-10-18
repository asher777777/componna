import React from 'react';
import {
  Layers,
  Sparkles,
  Users,
  CreditCard,
  MessageCircle,
  Video,
  FileText,
  Mail,
  Youtube,
  Share2,
  FolderLock,
  ArrowUpRight,
} from 'lucide-react';
import { DashboardCommandMatrixConfig, DashboardCommandMatrixItem } from '../../types';

export interface CommandMatrixSectionProps {
  config: DashboardCommandMatrixConfig;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers,
  Sparkles,
  Users,
  CreditCard,
  MessageCircle,
  Video,
  FileText,
  Mail,
  Youtube,
  Share2,
  FolderLock,
};

export const CommandMatrixSection: React.FC<CommandMatrixSectionProps> = ({ config }) => {
  const cols = config.columns || 3;
  const gridClass =
    cols === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : cols === 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5" dir="rtl">
      <div>
        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
          {config.title || 'מטריצת פקודות ורכיבי מערכת'}
        </h3>
        {config.subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {config.subtitle}
          </p>
        )}
      </div>

      <div className={`grid ${gridClass} gap-3 sm:gap-4`}>
        {config.items.map((item: DashboardCommandMatrixItem) => {
          const Icon = (item.icon && ICON_MAP[item.icon]) || Layers;

          return (
            <a
              key={item.id}
              href={item.targetUrl}
              className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-850 hover:border-indigo-500 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>

                  {item.badge && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h4>
                  {item.subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                <span className="font-mono text-[11px]">{item.moduleId}</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};
