import React from 'react';
import {
  ShoppingBag,
  Stethoscope,
  Building2,
  Dumbbell,
  HeartHandshake,
  GraduationCap,
  Briefcase,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { TargetAudience } from '../types';
import { Tooltip } from './Tooltip';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  ShoppingBag,
  Stethoscope,
  Building2,
  Dumbbell,
  HeartHandshake,
  GraduationCap,
  Briefcase,
};

export interface AudienceSelectorProps {
  audiences: TargetAudience[];
  selectedAudience: TargetAudience;
  onSelect: (audience: TargetAudience) => void;
}

export const AudienceSelector: React.FC<AudienceSelectorProps> = ({
  audiences,
  selectedAudience,
  onSelect,
}) => {
  return (
    <div className="space-y-4" dir="rtl">
      {/* Step Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-100 dark:border-indigo-500/20">
            1
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">מי קהל היעד של לוח הבקרה?</h3>
              <Tooltip content="ה-AI יבנה את לוח הבקרה, השפה, התובנות והמדדים בהתאם לענף הנבחר." />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              בחר את תחום הפעילות של העסק או הלקוח
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-850 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-750 font-medium">
          <span>נבחר:</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-300">{selectedAudience.name}</span>
        </div>
      </div>

      {/* Grid of Audience Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {audiences.map((aud) => {
          const isSelected = selectedAudience.id === aud.id;
          const IconComp = ICON_MAP[aud.iconName] || Users;

          return (
            <div
              key={aud.id}
              onClick={() => onSelect(aud)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelect(aud);
                }
              }}
              className={`p-4 rounded-2xl border transition duration-150 cursor-pointer flex flex-col justify-between text-right select-none relative ${
                isSelected
                  ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-500 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      נבחר
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5 leading-snug">
                  {aud.name}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300/80 leading-relaxed line-clamp-2">
                  {aud.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[10px] text-indigo-700 dark:text-indigo-300 font-medium">
                  {aud.category}
                </span>
                <span className="text-[10px]">
                  {aud.recommendedModuleIds.length} רכיבים מומלצים
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
