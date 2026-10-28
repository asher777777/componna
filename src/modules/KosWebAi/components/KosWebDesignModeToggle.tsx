import React from 'react';
import { Sparkles, History, LayoutTemplate, Layers } from 'lucide-react';
import { KosWebDesignMode } from '../hooks/useKosWebDesignMode';

interface KosWebDesignModeToggleProps {
  mode: KosWebDesignMode;
  onToggle: () => void;
  className?: string;
  compact?: boolean;
}

export const KosWebDesignModeToggle: React.FC<KosWebDesignModeToggleProps> = ({
  mode,
  onToggle,
  className = '',
  compact = false,
}) => {
  const isDesyn = mode === 'kosdesyn';

  return (
    <button
      type="button"
      onClick={onToggle}
      title={isDesyn ? 'חזרה לעיצוב קלאסי מקורי' : 'מעבר לעיצוב KOSDESYN החדש (באקאופיס מתקדם)'}
      className={`group relative inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 shadow-sm cursor-pointer select-none border ${
        isDesyn
          ? 'bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-600/10 text-amber-300 border-amber-400/40 hover:border-amber-400 hover:shadow-amber-500/20 hover:shadow-lg'
          : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border-indigo-400/30 hover:border-indigo-400/60'
      } ${className}`}
      dir="rtl"
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isDesyn ? 'bg-amber-400' : 'bg-indigo-400'
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isDesyn ? 'bg-amber-500' : 'bg-indigo-500'
          }`}
        />
      </span>

      {isDesyn ? (
        <>
          <History className="w-3.5 h-3.5 text-amber-400 group-hover:-rotate-45 transition-transform" />
          {!compact && <span>עיצוב KOSDESYN פעיל • לחץ לחזרה למקורי</span>}
          {compact && <span>KOSDESYN (פעיל)</span>}
        </>
      ) : (
        <>
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-125 transition-transform" />
          {!compact && <span>מעבר לעיצוב KOSDESYN החדש</span>}
          {compact && <span>חדש: KOSDESYN</span>}
        </>
      )}
    </button>
  );
};
