import {
  dispatchFlyerScanToKosai,
  FlyerScanPaletteOption,
  FlyerScanReport,
} from '../kosai/promptToKosai';

const VALID_PRESETS = ['standard', 'feminine', 'masculine', 'spiritual', 'sharp', 'analytical'] as const;
type ValidPreset = (typeof VALID_PRESETS)[number];

function isHexColor(val: unknown): val is string {
  return typeof val === 'string' && /^#[0-9a-fA-F]{6}$/.test(val.trim());
}

/**
 * Computes relative luminance (0..1) of a #RRGGBB hex color for automatic contrast protection.
 */
export function getHexLuminance(hex: string): number {
  if (!isHexColor(hex)) return 1;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

/**
 * Ensures textColor always has high contrast against backgroundColor.
 */
export function ensureReadableTextColor(backgroundColor: string, candidateTextColor?: string): string {
  const bgLum = getHexLuminance(backgroundColor);
  if (candidateTextColor && isHexColor(candidateTextColor)) {
    const textLum = getHexLuminance(candidateTextColor);
    const ratio = (Math.max(bgLum, textLum) + 0.05) / (Math.min(bgLum, textLum) + 0.05);
    if (ratio >= 4.5) return candidateTextColor;
  }
  return bgLum > 0.45 ? '#0f172a' : '#f8fafc';
}

function normalizePaletteOption(
  raw: Partial<FlyerScanPaletteOption> | undefined,
  fallbackId: string,
  fallbackName: string,
  fallbackPrimary = '#6366f1',
  fallbackSecondary = '#0ea5e9'
): FlyerScanPaletteOption {
  const preset: ValidPreset = VALID_PRESETS.includes(raw?.stylePreset as ValidPreset)
    ? (raw!.stylePreset as ValidPreset)
    : 'standard';
  const primaryColor = isHexColor(raw?.primaryColor) ? raw!.primaryColor : fallbackPrimary;
  const secondaryColor = isHexColor(raw?.secondaryColor) ? raw!.secondaryColor : fallbackSecondary;
  const backgroundColor = isHexColor(raw?.backgroundColor) ? raw!.backgroundColor : '#ffffff';
  const textColor = ensureReadableTextColor(backgroundColor, raw?.textColor);
  const borderRadius = (['none', 'sm', 'md', 'lg', 'full'] as const).includes(raw?.borderRadius as any)
    ? (raw!.borderRadius as FlyerScanPaletteOption['borderRadius'])
    : 'lg';
  const buttonStyle = (['solid', 'gradient', 'outline', 'glass'] as const).includes(raw?.buttonStyle as any)
    ? (raw!.buttonStyle as FlyerScanPaletteOption['buttonStyle'])
    : 'gradient';

  return {
    id: raw?.id || fallbackId,
    nameHe: raw?.nameHe?.trim() || fallbackName,
    stylePreset: preset,
    primaryColor,
    secondaryColor,
    backgroundColor,
    textColor,
    borderRadius,
    buttonStyle,
  };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const base64 = result.includes('base64,') ? result.split('base64,')[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('שגיאה בקריאת הקובץ'));
    reader.readAsDataURL(file);
  });
}

export async function scanFlyerFileForPageModel(params: {
  file: File;
  companyName: string;
  availableIconNames?: string[];
  tenantId?: string;
}): Promise<{ report: FlyerScanReport; previewImageDataUrl?: string }> {
  const { file, companyName, availableIconNames, tenantId } = params;
  const lowerName = file.name.toLowerCase();
  const isMarkdown =
    lowerName.endsWith('.md') ||
    lowerName.endsWith('.markdown') ||
    lowerName.endsWith('.txt') ||
    file.type.startsWith('text/');

  let imageBase64: string | undefined;
  let mimeType: string | undefined;
  let markdownText: string | undefined;
  let previewImageDataUrl: string | undefined;

  if (isMarkdown) {
    markdownText = await file.text();
  } else {
    mimeType = file.type || (lowerName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
    imageBase64 = await fileToBase64(file);
    if (mimeType.startsWith('image/')) {
      previewImageDataUrl = `data:${mimeType};base64,${imageBase64}`;
    }
  }

  const raw = await dispatchFlyerScanToKosai({
    companyName,
    fileName: file.name,
    imageBase64,
    mimeType,
    markdownText,
    availableIconNames,
    tenantId,
  });

  const extractedPalette = normalizePaletteOption(
    raw?.designPlan?.extractedPalette,
    'flyer_extracted',
    'פלטת הפלייר המקורית',
    '#6366f1',
    '#0ea5e9'
  );

  const defaultAlternatives: FlyerScanPaletteOption[] = [
    {
      id: 'alt_clean_light',
      nameHe: 'נקי ומודרני (בהיר)',
      stylePreset: 'standard',
      primaryColor: '#2563eb',
      secondaryColor: '#0ea5e9',
      backgroundColor: '#f8fafc',
      textColor: '#0f172a',
      borderRadius: 'md',
      buttonStyle: 'solid',
    },
    {
      id: 'alt_luxury_dark',
      nameHe: 'יוקרתי ועוצמתי (כהה)',
      stylePreset: 'sharp',
      primaryColor: '#f59e0b',
      secondaryColor: '#ea580c',
      backgroundColor: '#090a0f',
      textColor: '#f8fafc',
      borderRadius: 'md',
      buttonStyle: 'gradient',
    },
    {
      id: 'alt_warm_nature',
      nameHe: 'רענן וקהילתי (ירוק-טבעי)',
      stylePreset: 'analytical',
      primaryColor: '#16a34a',
      secondaryColor: '#059669',
      backgroundColor: '#f0fdf4',
      textColor: '#0f172a',
      borderRadius: 'lg',
      buttonStyle: 'gradient',
    },
  ];

  const rawAlts = Array.isArray(raw?.designPlan?.alternativePalettes) ? raw.designPlan.alternativePalettes : [];
  const alternativePalettes =
    rawAlts.length > 0
      ? rawAlts.slice(0, 3).map((p, idx) =>
          normalizePaletteOption(p, `alt_${idx + 1}`, p?.nameHe || `חלופה ${idx + 1}`)
        )
      : defaultAlternatives;

  const allowedSections = new Set([
    'hero',
    'timer',
    'statsBento',
    'services',
    'richContent',
    'testimonials',
    'pricing',
    'faq',
    'smartForm',
  ]);
  const rawOrder = Array.isArray(raw?.designPlan?.sectionOrder)
    ? raw.designPlan.sectionOrder.filter((s) => allowedSections.has(s))
    : [];
  const sectionOrder = rawOrder.length >= 3 ? rawOrder : ['hero', 'statsBento', 'richContent', 'faq', 'smartForm'];
  if (!sectionOrder.includes('hero')) sectionOrder.unshift('hero');
  if (!sectionOrder.includes('smartForm')) sectionOrder.push('smartForm');

  const normalized: FlyerScanReport = {
    title: String(raw?.title || file.name.replace(/\.[^.]+$/, '')).trim(),
    subtitle: String(raw?.subtitle || '').trim(),
    description: String(raw?.description || '').trim(),
    eventDetails: {
      date: raw?.eventDetails?.date || '',
      time: raw?.eventDetails?.time || '',
      location: raw?.eventDetails?.location || '',
      price: raw?.eventDetails?.price || '',
      audience: raw?.eventDetails?.audience || '',
      contactInfo: raw?.eventDetails?.contactInfo || '',
    },
    highlights: Array.isArray(raw?.highlights) && raw.highlights.length > 0
      ? raw.highlights.slice(0, 6).map((h) => ({
          title: String(h?.title || '').trim(),
          description: String(h?.description || '').trim(),
          iconName: h?.iconName || 'Sparkles',
        }))
      : [],
    faqs: Array.isArray(raw?.faqs)
      ? raw.faqs.slice(0, 5).map((f) => ({
          question: String(f?.question || '').trim(),
          answer: String(f?.answer || '').trim(),
        }))
      : [],
    ctaText: String(raw?.ctaText || 'להרשמה מהירה').trim(),
    recommendedFormMode: raw?.recommendedFormMode === 'payment' ? 'payment' : 'registration',
    recommendedPaymentAmount: Number(raw?.recommendedPaymentAmount || 0) || 0,
    recommendedFormFields: Array.isArray(raw?.recommendedFormFields) && raw.recommendedFormFields.length > 0
      ? raw.recommendedFormFields
      : ['kosun_crm_name', 'kosun_crm_phone', 'kosun_crm_email'],
    designPlan: {
      goalCategory: raw?.designPlan?.goalCategory || 'event_workshop',
      goalLabelHe: String(raw?.designPlan?.goalLabelHe || 'דף נחיתה מותאם מטרה').trim(),
      visualMood: raw?.designPlan?.visualMood || 'light',
      heroLayout: (['split', 'centered', 'minimal'] as const).includes(raw?.designPlan?.heroLayout as any)
        ? raw.designPlan.heroLayout
        : 'split',
      contentLayout: (['highlight-box', 'cards-grid', 'split-image'] as const).includes(raw?.designPlan?.contentLayout as any)
        ? raw.designPlan.contentLayout
        : 'cards-grid',
      sectionOrder,
      designRationaleHe: String(raw?.designPlan?.designRationaleHe || '').trim(),
      extractedPalette,
      alternativePalettes,
      heroImagePrompt: String(
        raw?.designPlan?.heroImagePrompt ||
          'Clean modern editorial atmospheric visual matching the flyer topic, strictly NO text, NO words, NO letters'
      ).trim(),
    },
  };

  return { report: normalized, previewImageDataUrl };
}
