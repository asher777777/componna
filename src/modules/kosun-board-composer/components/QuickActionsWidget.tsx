import React from 'react';
import {
  Send,
  GitBranch,
  Users,
  SendHorizontal,
  FileText,
  Link,
  Receipt,
  PlusCircle,
  Inbox,
  Edit3,
  FilePlus,
  PieChart,
  Flag,
  Clapperboard,
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import { ModuleActionDescriptor, BentoWidgetSize } from '../types';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Send,
  GitBranch,
  Users,
  SendHorizontal,
  FileText,
  Link,
  Receipt,
  PlusCircle,
  Inbox,
  Edit3,
  FilePlus,
  PieChart,
  Flag,
  Clapperboard,
  Zap,
};

export interface QuickActionsWidgetProps {
  title: string;
  subtitle?: string;
  actions: ModuleActionDescriptor[];
  size?: BentoWidgetSize;
  onNavigate: (route: string) => void;
}

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({
  title,
  subtitle,
  actions,
  size = 'lg',
  onNavigate,
}) => {
  return (
    <div
      className={`p-4 rounded-2xl border bg-slate-900/70 border-slate-800 flex flex-col justify-between ${
        size === 'lg'
          ? 'col-span-1 md:col-span-2'
          : size === 'full'
          ? 'col-span-1 md:col-span-3'
          : 'col-span-1'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-200">{title}</h4>
            {subtitle && (
              <p className="text-[10px] text-slate-400">{subtitle}</p>
            )}
          </div>
        </div>
        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-mono">
          {actions.length} פעולות
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
        {actions.map((act) => {
          const IconComp = ICON_MAP[act.iconName] || Zap;

          return (
            <button
              key={act.id}
              type="button"
              onClick={() => onNavigate(act.targetRoute)}
              className="p-2.5 rounded-xl bg-slate-850/80 hover:bg-slate-800 border border-slate-750/60 hover:border-indigo-500/40 transition text-right flex items-center justify-between group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-slate-800 group-hover:bg-indigo-600/30 text-indigo-300 flex items-center justify-center shrink-0 transition">
                  <IconComp className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <div className="font-bold text-xs text-slate-200 group-hover:text-white transition truncate">
                    {act.label}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {act.description}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 mr-1.5">
                {act.badge && (
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                    {act.badge}
                  </span>
                )}
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
