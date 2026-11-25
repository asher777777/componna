import { PageBuilderConfig, PageCategory } from '../types/pageBuilder.types';
import { Firestore } from 'firebase/firestore';
import { BrandDna, KOSUN_CRM_FIELD_KEYS, TenantStylePreset } from '../../../core/contracts';
import { getKoscloudBrandingIconsForStyle } from '../../../core/ui/BrandIconPicker';
import { fetchPublicBrandIcons } from '../../../core/ui/publicBrandIconsService';
import { SECTION_REGISTRY } from '../registry/sectionRegistry';
import { resolveLiveBrandDna, hydrateSectionWithBrandDna } from './brandSectionHydrator';
import { applyStylePresetToPage } from './pageStylePresetService';
import { STANDARD_CRM_FORM_FIELDS } from '../config/pageArchitectureMatrix';
import {
  dispatchKoswebModelPageToKosai,
  dispatchHeroImageToKosai,
  FlyerScanReport,
} from '../kosai/promptToKosai';
import { ensureReadableTextColor } from './flyerScannerService';
import { resolveApiKey } from '../api/functionsApi';

export type KoswebModelFormRequirement = 'auto' | 'none' | 'registration' | 'payment';
export type KoswebStyleColorMode = 'brand' | 'ai' | 'palette';

export interface KoswebPaletteSelection {
  id: string;
  label: string;
  stylePreset?: TenantStylePreset;
  primaryColor: string;
  secondaryColor: string;
}

export interface KoswebPageModelInput {
  title: string;
  description: string;
  goal: string;
  extractedDocumentText?: string;
  formRequirement: KoswebModelFormRequirement;
  paymentAmount?: number;
  styleColorMode?: KoswebStyleColorMode;
  selectedPalette?: KoswebPaletteSelection;
  flyerScanReport?: FlyerScanReport;
  heroLayoutOverride?: 'split' | 'centered' | 'minimal';
  contentLayoutOverride?: 'highlight-box' | 'cards-grid' | 'split-image';
  customPaletteOverride?: {
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
    buttonStyle?: 'solid' | 'gradient' | 'outline' | 'glass';
  };
  uploadedHeroImageUrl?: string;
  generateHeroImageWithAi?: boolean;
  selectedBrandIcons?: string[];
  saveGeneratedImageToKoscloud?: (opts: {
    imageUrl: string;
    name?: string;
    sourceModule?: string;
    sourceModuleLabel?: string;
  }) => Promise<string | null>;
}

export interface KoswebPageModelResult {
  pageConfig: PageBuilderConfig;
  usedStylePreset: TenantStylePreset;
  selectedIconsCount: number;
  hasCrmForm: boolean;
  formMode?: 'registration' | 'payment';
  crmFieldKeys: string[];
  usedAiFallback: boolean;
}

/**
 * Converts a Hero image URL/dataUrl into a compressed <100KB JPEG thumbnail data URL for OG social sharing.
 */
async function createOgThumbnailJpgDataUrl(sourceUrl: string): Promise<string | null> {
  if (!sourceUrl || typeof document === 'undefined') return null;
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.crossOrigin = 'anonymous';
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Image load failed'));
      el.src = sourceUrl;
    });

    const maxW = 1200;
    const maxH = 630;
    const scale = Math.min(maxW / (img.naturalWidth || maxW), maxH / (img.naturalHeight || maxH), 1);
    const width = Math.max(1, Math.round((img.naturalWidth || maxW) * scale));
    const height = Math.max(1, Math.round((img.naturalHeight || maxH) * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, width, height);

    for (const q of [0.76, 0.62, 0.48]) {
      const dataUrl = canvas.toDataURL('image/jpeg', q);
      // Approximate base64 byte length (~0.75 of string length)
      if (dataUrl.length * 0.75 <= 95 * 1024 || q === 0.48) {
        return dataUrl;
      }
    }
    return canvas.toDataURL('image/jpeg', 0.48);
  } catch {
    return null;
  }
}

/**
 * Resolves a valid KOSCLOUD branding icon name from the tenant's style catalog.
 */
function resolveKoscloudIconName(
  requestedIcon: string | undefined,
  allowedIcons: Array<{ name: string; labelHe: string; svgUrl?: string }>,
  fallbackIndex: number
): string {
  if (requestedIcon) {
    const exact = allowedIcons.find(
      (ic) => ic.name.toLowerCase() === requestedIcon.trim().toLowerCase()
    );
    if (exact) return exact.svgUrl || exact.name;
  }
  const fallback = allowedIcons[fallbackIndex % allowedIcons.length];
  return fallback?.svgUrl || fallback?.name || 'Sparkles';
}

/**
 * Generates a complete KOSWEB page via KOSAI (Gemini), hydrated with:
 * 1. Hero section
 * 2. Icon list with page details using KOSCLOUD branding style icons
 * 3. Optional CRM-synchronized registration or payment SmartForm
 */
export async function generatePageWithKoswebModel(
  input: KoswebPageModelInput,
  brandDna?: BrandDna | null,
  tenantId?: string,
  db?: Firestore | null
): Promise<KoswebPageModelResult> {
  const liveDna = resolveLiveBrandDna(brandDna, tenantId);
  const companyName = liveDna?.identity?.companyName || 'קושאן';
  const brandStylePreset: TenantStylePreset = liveDna?.designTokens?.defaultStylePreset || 'standard';
  const stylePreset: TenantStylePreset =
    input.styleColorMode === 'palette' && input.selectedPalette?.stylePreset
      ? input.selectedPalette.stylePreset
      : brandStylePreset;
  const primaryColor = liveDna?.designTokens?.primaryColor || '#6366f1';
  const voiceTone = liveDna?.voice?.personality
    ? `רשמיות ${liveDna.voice.personality.formality}/100, חמימות ${liveDna.voice.personality.warmth}/100, יוקרתיות ${liveDna.voice.personality.luxury}/100, אנרגיה ${liveDna.voice.personality.energy}/100`
    : 'מקצועי, ברור ומניע לפעולה';

  const publicIcons = await fetchPublicBrandIcons(db, stylePreset);
  const brandingIcons =
    publicIcons.length > 0 ? publicIcons : getKoscloudBrandingIconsForStyle(stylePreset);
  const apiKey = resolveApiKey() || undefined;

  let aiData: any = null;
  let usedAiFallback = false;

  try {
    aiData = await dispatchKoswebModelPageToKosai(
      {
        title: input.title.trim(),
        description: input.description.trim(),
        goal: input.goal.trim(),
        extractedDocumentText: input.extractedDocumentText?.trim(),
        formRequirement: input.formRequirement,
        paymentAmount: input.paymentAmount,
        companyName,
        voiceTone,
        stylePreset,
        primaryColor,
        colorMode: input.styleColorMode || 'brand',
        availableBrandIcons: brandingIcons.map((ic) => ({
          name: ic.name,
          labelHe: ic.labelHe,
          category: ic.category,
        })),
        availableCrmFields: STANDARD_CRM_FORM_FIELDS.map((f) => ({
          crmFieldKey: f.crmFieldKey,
          labelHe: f.labelHe,
        })),
      },
      { apiKey, tenantId }
    );
  } catch (err) {
    console.warn('[koswebPageModelService] KOSAI generation failed, using structured fallback:', err);
    usedAiFallback = true;
  }

  if (!aiData || typeof aiData !== 'object') {
    usedAiFallback = true;
  }

  const pageId = `page_${Date.now()}`;
  const cleanTitle = String(aiData?.pageTitle || input.title || 'עמוד חדש').trim();
  const rawSlug = String(aiData?.slug || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const finalSlug = `p-${rawSlug || Date.now().toString(36)}`;

  // Resolve Hero Image (uploaded image > KOSAI generated image saved to KOSCLOUD > default)
  let heroImageUrl = input.uploadedHeroImageUrl || '';
  if (!heroImageUrl && input.generateHeroImageWithAi) {
    try {
      const baseImgPrompt =
        aiData?.hero?.imagePrompt ||
        `Modern editorial hero visual for ${input.title}, brand style ${stylePreset}`;
      const imgPrompt = `${baseImgPrompt}, pure clean visual photography with NO text, NO words, NO letters, NO English signage or banners`;
      const generatedUrl = await dispatchHeroImageToKosai(
        { prompt: imgPrompt, aspectRatio: '16:9' },
        { tenantId }
      );
      if (generatedUrl) {
        heroImageUrl = generatedUrl;
        if (typeof input.saveGeneratedImageToKoscloud === 'function') {
          try {
            const savedCloudUrl = await input.saveGeneratedImageToKoscloud({
              imageUrl: generatedUrl,
              name: `${cleanTitle || 'KoswebHero'}_${Date.now()}.png`,
              sourceModule: 'KosWebAi',
              sourceModuleLabel: 'מודל יצירת דף חכם (KOSWEB)',
            });
            if (savedCloudUrl) {
              heroImageUrl = savedCloudUrl;
            }
          } catch (saveErr) {
            console.warn('[koswebPageModelService] KOSCLOUD auto-save notice:', saveErr);
          }
        }
      }
    } catch (imgErr) {
      console.warn('[koswebPageModelService] Hero image generation skipped:', imgErr);
    }
  }

  // 1b. Create compressed <100KB JPG OG thumbnail flyer from Hero image and save to KOSCLOUD
  let ogThumbnailUrl = '';
  if (heroImageUrl) {
    try {
      const thumbDataUrl = await createOgThumbnailJpgDataUrl(heroImageUrl);
      if (thumbDataUrl && typeof input.saveGeneratedImageToKoscloud === 'function') {
        const savedOgUrl = await input.saveGeneratedImageToKoscloud({
          imageUrl: thumbDataUrl,
          name: `og_${pageId}.jpg`,
          sourceModule: 'KosWebAi',
          sourceModuleLabel: 'תמונת שיתוף OG (פלייר הירו ממוזער)',
        });
        if (savedOgUrl) ogThumbnailUrl = savedOgUrl;
      } else if (thumbDataUrl) {
        ogThumbnailUrl = thumbDataUrl;
      }
    } catch (ogErr) {
      console.warn('[koswebPageModelService] OG thumbnail generation skipped:', ogErr);
    }
    if (!ogThumbnailUrl && !heroImageUrl.startsWith('data:')) {
      ogThumbnailUrl = heroImageUrl;
    }
  }

  const cleanSeoDescription = String(
    aiData?.hero?.description || input.description || cleanTitle
  )
    .replace(/\*\*/g, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);

  // 1. Build Hero section (hydrate BrandDna first, then apply AI copy on top so BrandDna NEVER overwrites AI title/subtitle)
  const heroDefault = SECTION_REGISTRY.hero?.defaultConfig || {};
  const hydratedHeroBase = hydrateSectionWithBrandDna(
    { ...heroDefault, id: 'hero', type: 'hero' },
    liveDna,
    'hero',
    tenantId
  );
  const resolvedHeroLayout =
    input.heroLayoutOverride || input.flyerScanReport?.designPlan?.heroLayout || 'split';
  const heroConfig = {
    ...hydratedHeroBase,
    id: 'hero',
    type: 'hero' as const,
    layout: resolvedHeroLayout,
    heroStyle: resolvedHeroLayout === 'centered' ? 'mesh-glow' : resolvedHeroLayout === 'minimal' ? 'classic' : 'modern',
    imagePosition: 'left',
    textBgEnabled: false,
    badge: String(aiData?.hero?.badge || input.goal || cleanTitle).trim(),
    title: String(aiData?.hero?.title || cleanTitle).trim(),
    subtitle: String(aiData?.hero?.subtitle || input.description || cleanTitle).trim(),
    description: String(
      aiData?.hero?.description ||
        input.description ||
        `פתרון מותאם מבית ${companyName} להשגת המטרה: ${input.goal}`
    ).trim(),
    buttonsVisible: true,
    primaryButton: {
      text: String(aiData?.hero?.ctaPrimaryText || 'לפרטים והרשמה').trim(),
      url: '#section-smartForm',
    },
    secondaryButton: {
      text: String(aiData?.hero?.ctaSecondaryText || 'צפו בפרטי העמוד').trim(),
      url: '#section-statsBento',
    },
    ...(heroImageUrl ? { imageSrc: heroImageUrl } : {}),
  };

  // 2. Build Icon Details section (statsBento using KOSCLOUD branding style icons)
  const rawItems: any[] = Array.isArray(aiData?.iconDetails?.items)
    ? aiData.iconDetails.items
    : [];
  const userChosenIcons = Array.isArray(input.selectedBrandIcons)
    ? input.selectedBrandIcons.filter(Boolean)
    : [];

  const iconItems =
    rawItems.length > 0
      ? rawItems.slice(0, 6).map((item, idx) => ({
          id: `icon_detail_${idx + 1}`,
          icon:
            userChosenIcons[idx] ||
            resolveKoscloudIconName(item?.icon, brandingIcons, idx),
          number: String(item?.number || `0${idx + 1}`),
          prefix: '',
          suffix: '',
          label: String(item?.title || item?.label || `יתרון ${idx + 1}`),
          description: String(item?.description || input.description || ''),
        }))
      : [
          {
            id: 'icon_detail_1',
            icon: userChosenIcons[0] || resolveKoscloudIconName(undefined, brandingIcons, 0),
            number: '01',
            prefix: '',
            suffix: '',
            label: cleanTitle,
            description: input.description || 'מותאם אישית לצרכים ולמטרות העמוד.',
          },
          {
            id: 'icon_detail_2',
            icon: userChosenIcons[1] || resolveKoscloudIconName(undefined, brandingIcons, 1),
            number: '02',
            prefix: '',
            suffix: '',
            label: 'מיקוד במטרה',
            description: input.goal || 'מבנה ממיר המכוון לתוצאות מדידות.',
          },
          {
            id: 'icon_detail_3',
            icon: userChosenIcons[2] || resolveKoscloudIconName(undefined, brandingIcons, 2),
            number: '03',
            prefix: '',
            suffix: '',
            label: 'שפה מיתוגית אחידה',
            description: `איקונים ועיצוב מתוך סגנון המיתוג (${stylePreset}) ב-KOSCLOUD.`,
          },
        ];

  const statsBentoDefault = SECTION_REGISTRY.statsBento?.defaultConfig || {};
  const hydratedStatsBase = hydrateSectionWithBrandDna(
    { ...statsBentoDefault, id: 'statsBento', type: 'statsBento' },
    liveDna,
    'statsBento',
    tenantId
  );
  const iconListConfig = {
    ...hydratedStatsBase,
    id: 'statsBento',
    type: 'statsBento' as const,
    badge: String(aiData?.iconDetails?.badge || cleanTitle).trim(),
    title: String(aiData?.iconDetails?.title || `מה מחכה לכם ב-${cleanTitle}`).trim(),
    subtitle: String(
      aiData?.iconDetails?.subtitle ||
        input.description ||
        'כל הפרטים והיתרונות המרכזיים במקום אחד'
    ).trim(),
    layout: stylePreset,
    viewMode: iconItems.length <= 3 ? 'cards-3' : 'grid-4',
    stats: iconItems,
  };

  // 2b. Build Rich Content section (high-quality landing page editorial body)
  const richDefault = SECTION_REGISTRY.richContent?.defaultConfig || {};
  const hydratedRichBase = hydrateSectionWithBrandDna(
    { ...richDefault, id: 'richContent', type: 'richContent' },
    liveDna,
    'richContent',
    tenantId
  );
  const resolvedContentLayout =
    input.contentLayoutOverride || input.flyerScanReport?.designPlan?.contentLayout || 'highlight-box';
  const richContentConfig = {
    ...hydratedRichBase,
    id: 'richContent',
    type: 'richContent' as const,
    contentLayout: resolvedContentLayout,
    backgroundColor: 'transparent',
    headingColor: undefined,
    bodyColor: undefined,
    titleColor: undefined,
    subtitleColor: undefined,
    descriptionColor: undefined,
    heading: String(aiData?.richContent?.heading || `על ${cleanTitle}`).trim(),
    subtitle: String(aiData?.richContent?.subtitle || input.goal || '').trim(),
    body: String(
      aiData?.richContent?.body ||
        input.description ||
        `${cleanTitle} — חוויה מוקפדת ומעשית המותאמת במיוחד עבורכם.`
    ).trim(),
  };

  // 2c. Build FAQ section (topic-specific Q&A)
  const rawFaqs: any[] = Array.isArray(aiData?.faqs) ? aiData.faqs : [];
  const faqItems =
    rawFaqs.length > 0
      ? rawFaqs.slice(0, 6).map((f, idx) => ({
          id: `faq_${idx + 1}`,
          question: String(f?.question || f?.q || '').trim(),
          answer: String(f?.answer || f?.a || '').trim(),
        })).filter((f) => f.question && f.answer)
      : [
          {
            id: 'faq_1',
            question: `למי מתאים ${cleanTitle}?`,
            answer: input.description || 'הפעילות מותאמת לקהל היעד בצורה נגישה ומעשית.',
          },
          {
            id: 'faq_2',
            question: 'איך נרשמים ומקבלים פרטים נוספים?',
            answer: 'ניתן להשאיר פרטים בטופס שבהמשך העמוד ונחזור אליכם עם כל המידע.',
          },
        ];

  const faqDefault = SECTION_REGISTRY.faq?.defaultConfig || {};
  const hydratedFaqBase = hydrateSectionWithBrandDna(
    { ...faqDefault, id: 'faq', type: 'faq' },
    liveDna,
    'faq',
    tenantId
  );
  const faqConfig = {
    ...hydratedFaqBase,
    id: 'faq',
    type: 'faq' as const,
    title: 'שאלות נפוצות',
    subtitle: `כל מה שחשוב לדעת על ${cleanTitle}`,
    items: faqItems,
  };

  // 3. Determine & Build CRM-Synced Registration / Payment Form
  const goalAndDesc = `${input.goal} ${input.description} ${input.title} ${input.extractedDocumentText || ''}`;
  const detectedPayment = /תשלום|סליקה|רכישה|מחיר|₪|קנייה|הזמנה/i.test(goalAndDesc);
  const detectedRegistration = /הרשמה|ליד|השארת פרטים|טופס|הצטרפות|תיאום|פגישה|רישום/i.test(goalAndDesc);

  let includeForm = false;
  let formMode: 'registration' | 'payment' = 'registration';

  if (input.formRequirement === 'payment') {
    includeForm = true;
    formMode = 'payment';
  } else if (input.formRequirement === 'registration') {
    includeForm = true;
    formMode = 'registration';
  } else if (input.formRequirement === 'auto') {
    if (aiData?.form?.includeForm === true) {
      includeForm = true;
      formMode = aiData?.form?.formMode === 'payment' || detectedPayment ? 'payment' : 'registration';
    } else if (detectedPayment) {
      includeForm = true;
      formMode = 'payment';
    } else if (detectedRegistration) {
      includeForm = true;
      formMode = 'registration';
    }
  }

  const sectionOrder: string[] = ['hero', 'statsBento', 'richContent', 'faq'];
  const sections: Record<string, any> = {
    hero: heroConfig,
    statsBento: iconListConfig,
    richContent: richContentConfig,
    faq: faqConfig,
  };

  let usedCrmKeys: string[] = [];

  if (includeForm) {
    const requestedKeys: string[] = Array.isArray(aiData?.form?.crmFieldKeys)
      ? aiData.form.crmFieldKeys
      : [];

    const validKeySet = new Set(Object.values(KOSUN_CRM_FIELD_KEYS) as string[]);
    const filteredKeys = requestedKeys.filter((k) => validKeySet.has(k));

    // Ensure baseline CRM keys exist
    if (!filteredKeys.includes(KOSUN_CRM_FIELD_KEYS.NAME)) {
      filteredKeys.unshift(KOSUN_CRM_FIELD_KEYS.NAME);
    }
    if (!filteredKeys.includes(KOSUN_CRM_FIELD_KEYS.PHONE)) {
      filteredKeys.push(KOSUN_CRM_FIELD_KEYS.PHONE);
    }
    if (formMode === 'payment' && !filteredKeys.includes(KOSUN_CRM_FIELD_KEYS.EMAIL)) {
      filteredKeys.push(KOSUN_CRM_FIELD_KEYS.EMAIL);
    }

    usedCrmKeys = filteredKeys;

    const crmFields = filteredKeys
      .map((key) => STANDARD_CRM_FORM_FIELDS.find((f) => f.crmFieldKey === key))
      .filter((f): f is NonNullable<typeof f> => Boolean(f))
      .map((f) => ({
        crmFieldKey: f.crmFieldKey,
        labelHe: f.labelHe,
        inputType: f.inputType,
        autocomplete: f.autocomplete,
        required: f.required,
      }));

    const resolvedAmount =
      formMode === 'payment'
        ? Number(input.paymentAmount || aiData?.form?.paymentAmount || 199)
        : undefined;

    const smartFormDefault = SECTION_REGISTRY.smartForm?.defaultConfig || {};
    sections.smartForm = hydrateSectionWithBrandDna(
      {
        ...smartFormDefault,
        id: 'smartForm',
        type: 'smartForm',
        formId: `kosweb_crm_${pageId}`,
        sectionTitle:
          aiData?.form?.sectionTitle ||
          (formMode === 'payment' ? 'פרטי הרשמה ותשלום מאובטח' : 'טופס הרשמה מהירה'),
        sectionSubtitle:
          aiData?.form?.sectionSubtitle ||
          'השדות מסונכרנים ישירות עם רכיב ה-CRM של המערכת',
        crmFields,
        formMode,
        paymentAmount: resolvedAmount,
        paymentCurrency: 'ILS',
        paymentItemTitle: aiData?.form?.paymentItemTitle || cleanTitle,
        submitButtonText:
          aiData?.form?.submitButtonText ||
          (formMode === 'payment'
            ? `אישור פרטים ומעבר לתשלום (₪${resolvedAmount})`
            : 'שליחת הרשמה וסנכרון ל-CRM'),
      },
      liveDna,
      'smartForm',
      tenantId
    );

    sectionOrder.push('smartForm');
  }

  const pageCategory: PageCategory =
    formMode === 'payment' && includeForm ? 'checkout' : 'service_product';

  const baseConfig: PageBuilderConfig = {
    pageId,
    pageTitle: cleanTitle,
    slug: finalSlug,
    pageCategory,
    published: false,
    sectionOrder,
    sections,
    globalSettings: {
      siteTitle: companyName,
      companyName,
      slogan: liveDna?.identity?.slogan || '',
      theme: stylePreset,
      primaryColor,
      secondaryColor: liveDna?.designTokens?.secondaryColor || '#8b5cf6',
      backgroundColor: liveDna?.designTokens?.backgroundColor || '#090a0f',
      textColor: liveDna?.designTokens?.textColor || '#f8fafc',
      fontFamily: liveDna?.designTokens?.fontFamily || 'Heebo',
      contactPhone: liveDna?.trust?.contactPhone || '',
      contactEmail: liveDna?.trust?.contactEmail || '',
      contactWhatsApp: liveDna?.trust?.whatsappSupportNumber || '',
      address: liveDna?.trust?.officeAddress || '',
    },
    seoSettings: {
      title: `${cleanTitle} | ${companyName}`,
      description: cleanSeoDescription,
      keywords: [cleanTitle, input.goal, companyName].filter(Boolean),
      ...(ogThumbnailUrl ? { ogImage: ogThumbnailUrl } : {}),
    },
    lastModified: Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Determine effective stylePreset & per-page color overrides
  let effectiveStylePreset: TenantStylePreset = stylePreset;
  let overridePrimary = '';
  let overrideSecondary = '';

  if (input.styleColorMode === 'palette' && input.selectedPalette) {
    overridePrimary = input.selectedPalette.primaryColor;
    overrideSecondary = input.selectedPalette.secondaryColor;
    effectiveStylePreset = input.selectedPalette.stylePreset || 'standard';
  } else if (input.styleColorMode === 'ai') {
    const aiSuggestedPreset = aiData?.suggestedPalette?.stylePreset as TenantStylePreset | undefined;
    const validPresets: TenantStylePreset[] = ['standard', 'feminine', 'masculine', 'spiritual', 'sharp', 'analytical'];
    effectiveStylePreset =
      aiSuggestedPreset && validPresets.includes(aiSuggestedPreset)
        ? aiSuggestedPreset
        : 'standard';

    const rawPrimary = String(aiData?.suggestedPalette?.primaryColor || '').trim();
    const rawSecondary = String(aiData?.suggestedPalette?.secondaryColor || rawPrimary).trim();
    if (/^#[0-9a-fA-F]{3,8}$/.test(rawPrimary)) {
      overridePrimary = rawPrimary;
      overrideSecondary = /^#[0-9a-fA-F]{3,8}$/.test(rawSecondary) ? rawSecondary : rawPrimary;
    }
  }

  let finalPage = applyStylePresetToPage(baseConfig, effectiveStylePreset).updatedPage;

  // Ensure light-card sections never inherit unreadable white/light-rose BrandDna text colors
  for (const secKey of ['statsBento', 'richContent', 'faq', 'smartForm']) {
    if (finalPage.sections?.[secKey]) {
      delete finalPage.sections[secKey].headingColor;
      delete finalPage.sections[secKey].bodyColor;
      delete finalPage.sections[secKey].titleColor;
      delete finalPage.sections[secKey].subtitleColor;
      delete finalPage.sections[secKey].descriptionColor;
    }
  }

  if (overridePrimary) {
    const resolvedBg = input.customPaletteOverride?.backgroundColor || finalPage.globalSettings.backgroundColor || '#ffffff';
    const resolvedText = ensureReadableTextColor(
      resolvedBg,
      input.customPaletteOverride?.textColor || finalPage.globalSettings.textColor
    );
    const updatedSections: Record<string, any> = {};
    for (const [secId, sec] of Object.entries(finalPage.sections || {})) {
      updatedSections[secId] = {
        ...sec,
        ...(secId !== 'hero' ? { layout: effectiveStylePreset } : {}),
        accentColor: overridePrimary,
        primaryButtonColor: overridePrimary,
        secondaryButtonColor: overrideSecondary,
      };
    }
    finalPage = {
      ...finalPage,
      globalSettings: {
        ...finalPage.globalSettings,
        theme: effectiveStylePreset,
        primaryColor: overridePrimary,
        secondaryColor: overrideSecondary,
        buttonBgColor: overridePrimary,
        ...(input.customPaletteOverride?.backgroundColor ? { backgroundColor: resolvedBg, textColor: resolvedText } : {}),
        ...(input.customPaletteOverride?.borderRadius ? { borderRadius: input.customPaletteOverride.borderRadius } : {}),
        ...(input.customPaletteOverride?.buttonStyle ? { buttonStyle: input.customPaletteOverride.buttonStyle } : {}),
      },
      sections: updatedSections,
    };
  }

  return {
    pageConfig: finalPage,
    usedStylePreset: stylePreset,
    selectedIconsCount: iconItems.length,
    hasCrmForm: includeForm,
    formMode: includeForm ? formMode : undefined,
    crmFieldKeys: usedCrmKeys,
    usedAiFallback,
  };
}
