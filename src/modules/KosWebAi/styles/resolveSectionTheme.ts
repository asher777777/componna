import { BrandDna } from '../../../core/contracts';
import {
  SECTION_THEMES,
  SectionStyleKey,
  SectionThemeTokens,
  normalizeStylePreset,
} from './sectionThemePresets';

export interface ResolveThemeInput {
  layout?: string;
  useBrandColors?: boolean;
  backgroundColor?: string;
  titleColor?: string;
  descriptionColor?: string;
  accentColor?: string;
  primaryButtonColor?: string;
  secondaryButtonColor?: string;
  buttonShape?: string;
  textBgEnabled?: boolean;
  textBgOverlayColor?: string;
}

const parseRgb = (color?: string): [number, number, number] | null => {
  if (!color || typeof color !== 'string') return null;
  const c = color.trim().toLowerCase();
  if (c === 'white' || c === '#fff') return [255, 255, 255];
  if (c === 'black' || c === '#000') return [0, 0, 0];

  const hexMatch = c.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
      ];
    }
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  }

  const rgbMatch = c.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])];
  }
  return null;
};

const getRelativeLuminance = ([r, g, b]: [number, number, number]): number => {
  const toLinear = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
};

export const getContrastRatio = (colorA?: string, colorB?: string): number | null => {
  const a = parseRgb(colorA);
  const b = parseRgb(colorB);
  if (!a || !b) return null;
  const lumA = getRelativeLuminance(a);
  const lumB = getRelativeLuminance(b);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
};

export const isDarkSurfaceColor = (color?: string): boolean => {
  const rgb = parseRgb(color);
  if (!rgb) return false;
  return getRelativeLuminance(rgb) < 0.35;
};

export const ensureReadableTextColor = (
  candidate: string | undefined,
  surfaceHex: string,
  minRatio: number,
  fallbackOnDark: string,
  fallbackOnLight: string,
  forceFallbackIfMissing = false
): string | undefined => {
  const surfaceIsDark = isDarkSurfaceColor(surfaceHex);
  if (!candidate) {
    return forceFallbackIfMissing ? (surfaceIsDark ? fallbackOnDark : fallbackOnLight) : undefined;
  }
  const ratio = getContrastRatio(candidate, surfaceHex);
  if (ratio === null) return candidate;
  if (ratio >= minRatio) return candidate;
  return surfaceIsDark ? fallbackOnDark : fallbackOnLight;
};

const ensureAccentContrast = (
  candidate: string | undefined,
  surfaceHex: string,
  minRatio = 3.0
): string | undefined => {
  if (!candidate) return undefined;
  const rgb = parseRgb(candidate);
  const surfaceRgb = parseRgb(surfaceHex);
  if (!rgb || !surfaceRgb) return candidate;

  const initialRatio = getContrastRatio(candidate, surfaceHex);
  if (initialRatio !== null && initialRatio >= minRatio) return candidate;

  const surfaceIsDark = getRelativeLuminance(surfaceRgb) < 0.35;
  const target: [number, number, number] = surfaceIsDark ? [255, 255, 255] : [15, 23, 42];
  for (let step = 1; step <= 8; step++) {
    const t = step / 8;
    const mixed: [number, number, number] = [
      Math.round(rgb[0] + (target[0] - rgb[0]) * t),
      Math.round(rgb[1] + (target[1] - rgb[1]) * t),
      Math.round(rgb[2] + (target[2] - rgb[2]) * t),
    ];
    const hex = `#${mixed.map((n) => n.toString(16).padStart(2, '0')).join('')}`;
    const r = getContrastRatio(hex, surfaceHex);
    if (r !== null && r >= minRatio) return hex;
  }
  return surfaceIsDark ? '#f8fafc' : '#0f172a';
};

export interface ResolvedSectionColors {
  backgroundColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  descriptionColor?: string;
  accentColor: string;
  primaryButtonColor?: string;
  primaryButtonTextColor?: string;
  secondaryButtonColor?: string;
  overlayHex: string;
}

export interface ResolvedSectionTheme {
  styleKey: SectionStyleKey;
  tokens: SectionThemeTokens;
  isUsingBrandPreset: boolean;
  isUsingBrandColors: boolean;
  resolvedColors: ResolvedSectionColors;
  effectiveButtonShape: string;
}

const mapBrandRadiusToButtonShape = (
  borderRadius?: BrandDna['designTokens']['borderRadius']
): string | undefined => {
  if (!borderRadius) return undefined;
  if (borderRadius === 'none') return 'sharp';
  if (borderRadius === 'sm') return 'chiseled';
  if (borderRadius === 'md' || borderRadius === 'lg') return 'rounded';
  if (borderRadius === 'full') return 'pill';
  return undefined;
};

/**
 * מחשב את הסגנון והצבעים הסופיים של סקשן לפי סדר עדיפויות:
 * 1. דריסה ידנית ברמת הסקשן (config)
 * 2. טוקנים מרכיב המיתוג (BrandDna.designTokens) כשהם מופעלים
 * 3. ברירת המחדל של הסגנון מתוך SECTION_THEMES
 */
export function resolveSectionTheme(
  input: ResolveThemeInput,
  brandDna?: BrandDna | null
): ResolvedSectionTheme {
  const brandTokens = brandDna?.designTokens;
  const isUsingBrandPreset = !input.layout || input.layout === 'auto';
  const styleKey = normalizeStylePreset(input.layout, brandTokens?.defaultStylePreset);
  const tokens = SECTION_THEMES[styleKey];

  const isUsingBrandColors = Boolean(input.useBrandColors && brandTokens);

  const hasExplicitBg = Boolean(
    input.backgroundColor && input.backgroundColor !== 'transparent'
  );

  const isPageDark =
    typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : true;

  // In light (day) mode, never force a dark BrandDNA background onto a section without explicit section backgroundColor
  const rawBrandBg = isUsingBrandColors ? brandTokens?.backgroundColor : undefined;
  const brandBg =
    rawBrandBg && (!isPageDark && isDarkSurfaceColor(rawBrandBg))
      ? undefined
      : rawBrandBg;

  const brandPrimary = isUsingBrandColors ? brandTokens?.primaryColor : undefined;
  const brandSecondary = isUsingBrandColors ? brandTokens?.secondaryColor : undefined;
  const brandTitle = isUsingBrandColors
    ? brandTokens?.textColorH1 || brandTokens?.textColor
    : undefined;
  const brandDesc = isUsingBrandColors ? brandTokens?.textColor : undefined;
  const brandBtnBg = isUsingBrandColors
    ? brandTokens?.buttonBgColor || brandTokens?.primaryColor
    : undefined;
  const brandBtnText = isUsingBrandColors ? brandTokens?.buttonTextColor : undefined;

  const resolvedBg = hasExplicitBg ? input.backgroundColor : brandBg;

  // Determine the actual surface color behind the section text for WCAG contrast enforcement
  const effectiveSurfaceHex = input.textBgEnabled
    ? (input.textBgOverlayColor && input.textBgOverlayColor !== 'transparent'
        ? input.textBgOverlayColor
        : tokens.defaultOverlayHex)
    : resolvedBg && parseRgb(resolvedBg)
      ? resolvedBg
      : isPageDark
        ? '#0a0a0c'
        : '#f8fafc';

  const surfaceIsDark = isDarkSurfaceColor(effectiveSurfaceHex);
  const surfaceDiffersFromPage = surfaceIsDark !== isPageDark;

  const rawTitleColor = input.titleColor || brandTitle;
  const rawDescColor = input.descriptionColor || brandDesc;
  const rawSubtitleColor = input.accentColor || brandSecondary || brandPrimary;
  const resolvedPrimaryBtnColor = input.primaryButtonColor || brandBtnBg;

  const resolvedColors: ResolvedSectionColors = {
    backgroundColor: resolvedBg,
    titleColor: ensureReadableTextColor(
      rawTitleColor,
      effectiveSurfaceHex,
      3.5,
      '#ffffff',
      '#0f172a',
      surfaceDiffersFromPage
    ),
    subtitleColor: ensureAccentContrast(rawSubtitleColor, effectiveSurfaceHex, 3.0),
    descriptionColor: ensureReadableTextColor(
      rawDescColor,
      effectiveSurfaceHex,
      4.5,
      '#e2e8f0',
      '#334155',
      surfaceDiffersFromPage
    ),
    accentColor: input.accentColor || brandPrimary || tokens.defaults.accentColor,
    primaryButtonColor: resolvedPrimaryBtnColor,
    primaryButtonTextColor: resolvedPrimaryBtnColor
      ? ensureReadableTextColor(
          brandBtnText,
          resolvedPrimaryBtnColor,
          4.5,
          '#ffffff',
          '#0f172a',
          true
        )
      : brandBtnText,
    secondaryButtonColor: input.secondaryButtonColor,
    overlayHex: tokens.defaultOverlayHex,
  };

  const brandButtonShape = isUsingBrandColors
    ? mapBrandRadiusToButtonShape(brandTokens?.borderRadius)
    : undefined;

  const effectiveButtonShape =
    input.buttonShape && input.buttonShape !== 'auto'
      ? input.buttonShape
      : brandButtonShape || 'auto';

  return {
    styleKey,
    tokens,
    isUsingBrandPreset,
    isUsingBrandColors,
    resolvedColors,
    effectiveButtonShape,
  };
}
