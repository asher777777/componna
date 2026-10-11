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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">1. בחירת קהל יעד ותחום פעילות</span>
          <Tooltip content="ה-AI יתאים את שפת הממשק, המדדים והאוטומציות במדויק לענף שבחרת." />
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          נבחר: {selectedAudience.name}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
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
              className={`text-right p-3 rounded-2xl border transition duration-150 cursor-pointer flex flex-col justify-between select-none relative ${
                isSelected
                  ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 animate-in fade-in" />
                  )}
                </div>

                <h4 className="font-bold text-sm text-slate-100 mb-1">
                  {aud.name}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {aud.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                <span className="bg-slate-800/80 px-1.5 py-0.5 rounded text-indigo-300">
                  {aud.category}
                </span>
                <span>{aud.recommendedModuleIds.length} רכיבים מומלצים</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
