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
}

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

  const brandBg = isUsingBrandColors ? brandTokens?.backgroundColor : undefined;
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

  const resolvedColors: ResolvedSectionColors = {
    backgroundColor: hasExplicitBg ? input.backgroundColor : brandBg,
    titleColor: input.titleColor || brandTitle,
    subtitleColor: input.accentColor || brandSecondary || brandPrimary,
    descriptionColor: input.descriptionColor || brandDesc,
    accentColor: input.accentColor || brandPrimary || tokens.defaults.accentColor,
    primaryButtonColor: input.primaryButtonColor || brandBtnBg,
    primaryButtonTextColor: brandBtnText,
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
