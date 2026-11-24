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
} from '../kosai/promptToKosai';
import { resolveApiKey } from '../api/functionsApi';

export type KoswebModelFormRequirement = 'auto' | 'none' | 'registration' | 'payment';

export interface KoswebPageModelInput {
  title: string;
  description: string;
  goal: string;
  extractedDocumentText?: string;
  formRequirement: KoswebModelFormRequirement;
  paymentAmount?: number;
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
  const stylePreset: TenantStylePreset = liveDna?.designTokens?.defaultStylePreset || 'standard';
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
      const imgPrompt =
        aiData?.hero?.imagePrompt ||
        `Modern editorial hero visual for ${input.title}, brand style ${stylePreset}`;
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

  // 1. Build Hero section
  const heroDefault = SECTION_REGISTRY.hero?.defaultConfig || {};
  const heroConfig = hydrateSectionWithBrandDna(
    {
      ...heroDefault,
      id: 'hero',
      type: 'hero',
      badge: aiData?.hero?.badge || input.goal || 'מודל יצירת דף חכם',
      title: aiData?.hero?.title || cleanTitle,
      subtitle: aiData?.hero?.subtitle || input.description || companyName,
      description:
        aiData?.hero?.description ||
        input.description ||
        `פתרון מותאם מבית ${companyName} להשגת המטרה: ${input.goal}`,
      buttonsVisible: true,
      primaryButton: {
        text: aiData?.hero?.ctaPrimaryText || 'לפרטים והרשמה',
        url: '#section-smartForm',
      },
      secondaryButton: {
        text: aiData?.hero?.ctaSecondaryText || 'צפו בפרטי העמוד',
        url: '#section-statsBento',
      },
      ...(heroImageUrl ? { imageSrc: heroImageUrl } : {}),
    },
    liveDna,
    'hero',
    tenantId
  );

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
  const iconListConfig = hydrateSectionWithBrandDna(
    {
      ...statsBentoDefault,
      id: 'statsBento',
      type: 'statsBento',
      badge: aiData?.iconDetails?.badge || `איקוני מיתוג • ${stylePreset}`,
      title: aiData?.iconDetails?.title || 'פרטי העמוד והיתרונות המרכזיים',
      subtitle:
        aiData?.iconDetails?.subtitle ||
        'רשימת פרטים מותאמת עם איקוני המיתוג של המערכת ב-KOSCLOUD',
      layout: stylePreset,
      viewMode: iconItems.length <= 3 ? 'cards-3' : 'grid-4',
      stats: iconItems,
    },
    liveDna,
    'statsBento',
    tenantId
  );

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

  const sectionOrder: string[] = ['hero', 'statsBento'];
  const sections: Record<string, any> = {
    hero: heroConfig,
    statsBento: iconListConfig,
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
      description: input.description || cleanTitle,
      keywords: [cleanTitle, input.goal, companyName].filter(Boolean),
    },
    lastModified: Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const finalPage = applyStylePresetToPage(baseConfig, stylePreset).updatedPage;

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
