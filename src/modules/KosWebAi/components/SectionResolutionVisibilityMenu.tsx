import React, { useState, useRef, useEffect } from 'react';
import { Monitor, Tablet, Smartphone, Globe, Check, EyeOff, Sparkles, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { DeviceVisibilityMode } from '../types/pageBuilder.types';
import { getSectionResolutionState, getResolutionBadgeInfo } from '../utils/resolutionVisibility';

export interface SectionResolutionVisibilityMenuProps {
  sectionId: string;
  sectionData: any;
  onUpdateSection?: (sectionId: string, updatedData: any) => void;
  compact?: boolean;
}

export const SectionResolutionVisibilityMenu: React.FC<SectionResolutionVisibilityMenuProps> = ({
  sectionId,
  sectionData,
  onUpdateSection,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const state = getSectionResolutionState(sectionData);
  const badgeInfo = getResolutionBadgeInfo(sectionData);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const handleApplyPreset = (mode: DeviceVisibilityMode) => {
    if (!onUpdateSection) return;

    let desktop = true;
    let tablet = true;
    let mobile = true;

    switch (mode) {
      case 'desktop_only':
        desktop = true;
        tablet = false;
        mobile = false;
        break;
      case 'mobile_only':
        desktop = false;
        tablet = false;
        mobile = true;
        break;
      case 'tablet_only':
        desktop = false;
        tablet = true;
        mobile = false;
        break;
      case 'desktop_tablet':
        desktop = true;
        tablet = true;
        mobile = false;
        break;
      case 'mobile_tablet':
        desktop = false;
        tablet = true;
        mobile = true;
        break;
      case 'all':
      default:
        desktop = true;
        tablet = true;
        mobile = true;
        break;
    }

    const updated = {
      ...sectionData,
      deviceVisibility: mode,
      screenVisibility: { desktop, tablet, mobile },
      mobileHidden: !mobile,
    };

    onUpdateSection(sectionId, updated);
  };

  const handleToggleDevice = (device: 'desktop' | 'tablet' | 'mobile') => {
    if (!onUpdateSection) return;

    const nextDesktop = device === 'desktop' ? !state.desktop : state.desktop;
    const nextTablet = device === 'tablet' ? !state.tablet : state.tablet;
    const nextMobile = device === 'mobile' ? !state.mobile : state.mobile;

    // Determine mode
    let nextMode: DeviceVisibilityMode = 'all';
    if (nextDesktop && nextTablet && nextMobile) nextMode = 'all';
    else if (nextDesktop && !nextTablet && !nextMobile) nextMode = 'desktop_only';
    else if (!nextDesktop && !nextTablet && nextMobile) nextMode = 'mobile_only';
    else if (!nextDesktop && nextTablet && !nextMobile) nextMode = 'tablet_only';
    else if (nextDesktop && nextTablet && !nextMobile) nextMode = 'desktop_tablet';
    else if (!nextDesktop && nextTablet && nextMobile) nextMode = 'mobile_tablet';

    const updated = {
      ...sectionData,
      deviceVisibility: nextMode,
      screenVisibility: {
        desktop: nextDesktop,
        tablet: nextTablet,
        mobile: nextMobile,
      },
      mobileHidden: !nextMobile,
    };

    onUpdateSection(sectionId, updated);
  };

  // Render trigger icon based on active resolution restriction
  const renderTriggerIcon = () => {
    if (state.mode === 'mobile_only') {
      return <Smartphone className="w-3.5 h-3.5 text-amber-400" />;
    }
    if (state.mode === 'tablet_only') {
      return <Tablet className="w-3.5 h-3.5 text-cyan-400" />;
    }
    if (state.mode === 'desktop_only') {
      return <Monitor className="w-3.5 h-3.5 text-indigo-400" />;
    }
    if (state.mode === 'desktop_tablet') {
      return (
        <div className="flex items-center -space-x-1">
          <Monitor className="w-3.5 h-3.5 text-rose-400" />
        </div>
      );
    }
    if (state.mode === 'mobile_tablet') {
      return <Smartphone className="w-3.5 h-3.5 text-purple-400" />;
    }
    return <Monitor className="w-3.5 h-3.5" />;
  };

  return (
    <div className="relative inline-block text-right" ref={containerRef} dir="rtl">
      {/* Trigger Button in Section Toolbar */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={clsx(
          'flex items-center gap-1.5 p-1.5 rounded-xl border transition-all cursor-pointer select-none text-xs',
          isOpen
            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-500/30'
            : badgeInfo.isRestricted
              ? clsx('border shadow-sm font-bold', badgeInfo.colorClass)
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:text-white'
        )}
        title={`גילוי והצגה לפי רזולוציית מסך: ${badgeInfo.label}`}
      >
        {renderTriggerIcon()}
        {!compact && badgeInfo.isRestricted && (
          <span className="text-[10px] font-bold truncate max-w-[80px] hidden sm:inline">
            {badgeInfo.label}
          </span>
        )}
        <ChevronDown className={clsx('w-3 h-3 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180 text-white')} />
      </button>

      {/* Floating Resolution Popover */}
      {isOpen && (
        <div className="absolute left-0 sm:right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-[#0b0f19] border border-slate-700 p-3 shadow-2xl z-50 text-right backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="text-xs font-black text-white flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-indigo-400" />
              <span>הצגה לפי רזולוציית מסך</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 border border-slate-700">
              {badgeInfo.label}
            </span>
          </div>

          {/* 3 Interactive Device Toggles */}
          <div className="mb-2.5">
            <label className="text-[10px] font-bold text-slate-400 block mb-1">
              שליטה ישירה לפי מכשיר:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {/* Desktop */}
              <button
                type="button"
                onClick={() => handleToggleDevice('desktop')}
                className={clsx(
                  'p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer',
                  state.desktop
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-500 opacity-60 hover:opacity-90'
                )}
                title={state.desktop ? 'מוצג במחשב (לחץ להסתרה)' : 'מוסתר במחשב (לחץ להצגה)'}
              >
                <Monitor className="w-4 h-4" />
                <span className="text-[10px] font-bold">מחשב</span>
                <span className={clsx('w-1.5 h-1.5 rounded-full', state.desktop ? 'bg-emerald-400' : 'bg-slate-600')} />
              </button>

              {/* Tablet */}
              <button
                type="button"
                onClick={() => handleToggleDevice('tablet')}
                className={clsx(
                  'p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer',
                  state.tablet
                    ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-500 opacity-60 hover:opacity-90'
                )}
                title={state.tablet ? 'מוצג בטאבלט (לחץ להסתרה)' : 'מוסתר בטאבלט (לחץ להצגה)'}
              >
                <Tablet className="w-4 h-4" />
                <span className="text-[10px] font-bold">טאבלט</span>
                <span className={clsx('w-1.5 h-1.5 rounded-full', state.tablet ? 'bg-emerald-400' : 'bg-slate-600')} />
              </button>

              {/* Mobile */}
              <button
                type="button"
                onClick={() => handleToggleDevice('mobile')}
                className={clsx(
                  'p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer',
                  state.mobile
                    ? 'bg-amber-600/20 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-500 opacity-60 hover:opacity-90'
                )}
                title={state.mobile ? 'מוצג בסלולר (לחץ להסתרה)' : 'מוסתר בסלולר (לחץ להצגה)'}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-[10px] font-bold">סלולר</span>
                <span className={clsx('w-1.5 h-1.5 rounded-full', state.mobile ? 'bg-emerald-400' : 'bg-slate-600')} />
              </button>
            </div>
          </div>

          {/* Quick Presets List */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block mb-1">
              מצבי תצוגה מוגדרים מראש:
            </label>

            {[
              {
                id: 'all',
                label: 'כל המסכים (מחשב, טאבלט וסלולר)',
                desc: 'מוצג בכל רזולוציה ללא הגבלה',
                icon: Globe,
                active: state.desktop && state.tablet && state.mobile,
              },
              {
                id: 'desktop_only',
                label: 'מחשב בלבד (Desktop >= 1024px)',
                desc: 'מוסתר לגמרי במסכי טאבלט וסלולר',
                icon: Monitor,
                active: state.desktop && !state.tablet && !state.mobile,
              },
              {
                id: 'mobile_only',
                label: 'סלולר בלבד (Mobile < 768px)',
                desc: 'מוסתר במחשב ובטאבלט, מוצג רק בנייד',
                icon: Smartphone,
                active: !state.desktop && !state.tablet && state.mobile,
              },
              {
                id: 'tablet_only',
                label: 'טאבלט בלבד (768px - 1023px)',
                desc: 'מוצג רק במסכי טאבלט בינוניים',
                icon: Tablet,
                active: !state.desktop && state.tablet && !state.mobile,
              },
              {
                id: 'desktop_tablet',
                label: 'מחשב וטאבלט (מוסתר בסלולר)',
                desc: 'אידיאלי לאזורים עמוסי תוכן או טבלאות',
                icon: Monitor,
                active: state.desktop && state.tablet && !state.mobile,
              },
              {
                id: 'mobile_tablet',
                label: 'סלולר וטאבלט (מוסתר במחשב)',
                desc: 'אידיאלי לפעולות מהירות בטאץ׳',
                icon: Smartphone,
                active: !state.desktop && state.tablet && state.mobile,
              },
            ].map((preset) => {
              const IconComp = preset.icon;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    handleApplyPreset(preset.id as DeviceVisibilityMode);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    'w-full p-2 rounded-xl text-right transition flex items-center justify-between gap-2 cursor-pointer',
                    preset.active
                      ? 'bg-indigo-600/25 border border-indigo-500 text-white font-bold'
                      : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800/80 hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <IconComp className={clsx('w-3.5 h-3.5 shrink-0', preset.active ? 'text-indigo-400' : 'text-slate-400')} />
                    <div className="min-w-0 truncate">
                      <div className="text-xs truncate">{preset.label}</div>
                      <div className="text-[9px] text-slate-400 truncate opacity-80">{preset.desc}</div>
                    </div>
                  </div>
                  {preset.active && (
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
