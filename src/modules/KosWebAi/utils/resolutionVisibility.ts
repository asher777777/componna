import { DeviceVisibilityMode, ScreenVisibilityConfig } from '../types/pageBuilder.types';

export interface ResolutionState {
  desktop: boolean;
  tablet: boolean;
  mobile: boolean;
  mode: DeviceVisibilityMode;
}

/**
 * Normalizes resolution visibility settings from section data
 */
export function getSectionResolutionState(sectionData: any): ResolutionState {
  const dv = sectionData?.deviceVisibility as DeviceVisibilityMode | undefined;
  const sv = sectionData?.screenVisibility as ScreenVisibilityConfig | undefined;
  const legacyMobileHidden = Boolean(sectionData?.mobileHidden);

  // If explicit screenVisibility is set, resolve from it
  if (sv) {
    const d = sv.desktop ?? true;
    const t = sv.tablet ?? true;
    const m = sv.mobile ?? (!legacyMobileHidden);

    let mode: DeviceVisibilityMode = 'all';
    if (d && t && m) mode = 'all';
    else if (d && !t && !m) mode = 'desktop_only';
    else if (!d && !t && m) mode = 'mobile_only';
    else if (!d && t && !m) mode = 'tablet_only';
    else if (d && t && !m) mode = 'desktop_tablet';
    else if (!d && t && m) mode = 'mobile_tablet';

    return { desktop: d, tablet: t, mobile: m, mode };
  }

  // If explicit deviceVisibility is set
  if (dv) {
    switch (dv) {
      case 'desktop_only':
        return { desktop: true, tablet: false, mobile: false, mode: 'desktop_only' };
      case 'mobile_only':
        return { desktop: false, tablet: false, mobile: true, mode: 'mobile_only' };
      case 'tablet_only':
        return { desktop: false, tablet: true, mobile: false, mode: 'tablet_only' };
      case 'desktop_tablet':
        return { desktop: true, tablet: true, mobile: false, mode: 'desktop_tablet' };
      case 'mobile_tablet':
        return { desktop: false, tablet: true, mobile: true, mode: 'mobile_tablet' };
      case 'all':
      default:
        return { desktop: true, tablet: true, mobile: !legacyMobileHidden, mode: legacyMobileHidden ? 'desktop_tablet' : 'all' };
    }
  }

  // Fallback to legacy mobileHidden
  if (legacyMobileHidden) {
    return { desktop: true, tablet: true, mobile: false, mode: 'desktop_tablet' };
  }

  return { desktop: true, tablet: true, mobile: true, mode: 'all' };
}

/**
 * Returns Tailwind responsive utility classes for hiding / displaying sections
 */
export function getResolutionVisibilityClasses(sectionData: any, isEditing: boolean = false): string {
  if (isEditing) {
    // In edit mode we keep the section in DOM so user can interact and edit it
    return '';
  }

  const { desktop, tablet, mobile } = getSectionResolutionState(sectionData);

  // All visible
  if (desktop && tablet && mobile) return '';

  // All hidden
  if (!desktop && !tablet && !mobile) return 'hidden';

  // Desktop only
  if (desktop && !tablet && !mobile) return 'hidden lg:block';

  // Mobile only
  if (!desktop && !tablet && mobile) return 'block md:hidden';

  // Tablet only
  if (!desktop && tablet && !mobile) return 'hidden md:block lg:hidden';

  // Desktop + Tablet (hidden on mobile)
  if (desktop && tablet && !mobile) return 'hidden md:block';

  // Mobile + Tablet (hidden on desktop)
  if (!desktop && tablet && mobile) return 'block lg:hidden';

  // Desktop + Mobile (hidden on tablet)
  if (desktop && !tablet && mobile) return 'block md:hidden lg:block';

  return '';
}

/**
 * Checks if a section should be rendered inside a viewport preview frame
 */
export function isSectionVisibleInViewport(sectionData: any, viewport: 'desktop' | 'tablet' | 'mobile'): boolean {
  if (sectionData.visible === false) return false;
  const state = getSectionResolutionState(sectionData);
  if (viewport === 'desktop') return state.desktop;
  if (viewport === 'tablet') return state.tablet;
  if (viewport === 'mobile') return state.mobile;
  return true;
}

/**
 * Human-readable badge text and icons for the section toolbar
 */
export function getResolutionBadgeInfo(sectionData: any): {
  label: string;
  isRestricted: boolean;
  colorClass: string;
} {
  const { mode, desktop, tablet, mobile } = getSectionResolutionState(sectionData);

  if (desktop && tablet && mobile) {
    return {
      label: 'כל המסכים',
      isRestricted: false,
      colorClass: 'text-slate-400 bg-slate-800/80 border-slate-700',
    };
  }

  if (mode === 'desktop_only' || (desktop && !tablet && !mobile)) {
    return {
      label: 'דסקטופ בלבד',
      isRestricted: true,
      colorClass: 'text-indigo-300 bg-indigo-500/20 border-indigo-500/40',
    };
  }

  if (mode === 'mobile_only' || (!desktop && !tablet && mobile)) {
    return {
      label: 'מובייל בלבד',
      isRestricted: true,
      colorClass: 'text-amber-300 bg-amber-500/20 border-amber-500/40',
    };
  }

  if (mode === 'tablet_only' || (!desktop && tablet && !mobile)) {
    return {
      label: 'טאבלט בלבד',
      isRestricted: true,
      colorClass: 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40',
    };
  }

  if (mode === 'desktop_tablet' || (desktop && tablet && !mobile)) {
    return {
      label: 'מוסתר במובייל',
      isRestricted: true,
      colorClass: 'text-rose-300 bg-rose-500/20 border-rose-500/40',
    };
  }

  if (mode === 'mobile_tablet' || (!desktop && tablet && mobile)) {
    return {
      label: 'מוסתר במחשב',
      isRestricted: true,
      colorClass: 'text-purple-300 bg-purple-500/20 border-purple-500/40',
    };
  }

  return {
    label: 'תצוגה מותאמת',
    isRestricted: true,
    colorClass: 'text-sky-300 bg-sky-500/20 border-sky-500/40',
  };
}
