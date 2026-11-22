import { PageBuilderConfig, SectionType } from '../types/pageBuilder.types';
import { BrandDna } from '../../../core/contracts';
import { SECTION_REGISTRY } from '../registry/sectionRegistry';
import { resolveLiveBrandDna } from './brandSectionHydrator';
import { dispatchStructuredDraftToKosai, dispatchHeroImageToKosai } from '../kosai/promptToKosai';
import { resolveApiKey } from '../api/functionsApi';
import {
  MatrixPageTypeId,
  CrmFormFieldSpec,
  STANDARD_CRM_FORM_FIELDS,
  getMatrixPageType,
  mapMatrixIdToPageCategory,
} from '../config/pageArchitectureMatrix';
import { applyStylePresetToPage } from './pageStylePresetService';

/**
 * Generates a real custom Hero image strictly via the KOSAI AI Monopoly contract (Master key).
 */
export async function generateHeroImageViaProxy(
  prompt: string,
  aspectRatio: '16:9' | '4:3' | '1:1' | '9:16' = '16:9',
  tenantId?: string
): Promise<string | null> {
  if (!prompt?.trim()) return null;
  try {
    return await dispatchHeroImageToKosai(
      { prompt: prompt.trim(), aspectRatio },
      { tenantId }
    );
  } catch (err) {
    console.warn('[structuredPageAiService] KOSAI image generation failed:', err);
    return null;
  }
}

export interface WizardStepOptions {
  promptTopic: string;
  selectedSectionTypes: SectionType[];
  pageTypeId?: MatrixPageTypeId;
  groundingSources?: Array<{
    label: string;
    extractedText: string;
  }>;
  eventDetails?: {
    locationName?: string;
    locationAddress?: string;
    wazeQuery?: string;
    eventDate?: string;
    eventTime?: string;
    eventEndTime?: string;
  };
  campaignDetails?: {
    targetGoal?: number;
    totalRaised?: number;
    campaignCause?: string;
    daysLeft?: number;
    tiers?: Array<{ id: string; title: string; amount: number; description: string; isPopular?: boolean }>;
  };
  pricingDetails?: {
    documentType?: 320 | 400 | 405;
    enableInstallments?: boolean;
    maxInstallments?: number;
    plans?: Array<{
      id: string;
      name: string;
      priceMonthly: number;
      description: string;
      features?: string[];
      isFeatured?: boolean;
    }>;
  };
  geoDetails?: {
    targetCity?: string;
    serviceAreas?: string[];
  };
  crmFormFields?: CrmFormFieldSpec[];
  seoGeoFocus?: {
    authorName?: string;
    targetQuestion?: string;
  };
  preGeneratedFaqs?: Array<{ id: string; question: string; answer: string }>;
  newsDetails?: {
    currentAffairsTopic?: string;
    mainPoints?: string;
  };
  imageSelection: {
    mode: 'gallery' | 'ai' | 'unsplash' | 'none';
    selectedImageUrl?: string;
    aiImagePrompt?: string;
  };
}

export interface StructuredPageDraft {
  pageTitle: string;
  slug: string;
  hero: {
    title: string;
    subtitle: string;
    badge: string;
    ctaPrimaryText: string;
    ctaPrimaryUrl: string;
    ctaSecondaryText: string;
    ctaSecondaryUrl: string;
    imageUrl: string;
  };
  richContent?: {
    heading: string;
    body: string;
  };
  beforeAfter?: {
    title: string;
    subtitle: string;
    beforeLabel: string;
    afterLabel: string;
  };
  event?: {
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    eventEndTime?: string;
    locationName: string;
    locationAddress: string;
    wazeQuery?: string;
  };
  campaign?: {
    title: string;
    subtitle: string;
    targetGoal: number;
    totalRaised: number;
    donorsCount: number;
    daysLeft: number;
    tiers: Array<{ id: string; title: string; amount: number; description: string; isPopular?: boolean }>;
  };
  news?: {
    topic: string;
    headline: string;
    points: string[];
  };
  pricing?: {
    title: string;
    subtitle: string;
    plans: Array<{ id: string; name: string; priceMonthly: number; description: string; features: string[]; isFeatured?: boolean }>;
  };
  stats?: Array<{ id: string; number: string; suffix: string; label: string; description: string }>;
  testimonials?: Array<{ id: string; name: string; role: string; company: string; content: string; rating: number }>;
  faqs?: Array<{ id: string; question: string; answer: string }>;
  contact?: {
    title: string;
    subtitle: string;
    phone: string;
    email: string;
    whatsapp: string;
    address: string;
  };
  seoGeo?: {
    title: string;
    description: string;
    keywords: string[];
    aiKnowledgeSummary: string;
    aiTargetQuestions: string[];
    author: string;
  };
}

export interface StreamStepInfo {
  stepIndex: number;
  totalSteps: number;
  sectionType: SectionType;
  stepTitle: string;
  statusText: string;
  progressPercent: number;
}

/**
 * Builds high-converting heuristic content from Brand DNA & user inputs.
 * Guaranteed 100% resilient - 0 errors, 0 tokens, pure personalized quality.
 */
export function generateHeuristicStructuredDraft(
  options: WizardStepOptions,
  brandDna?: BrandDna | null,
  tenantId?: string
): StructuredPageDraft {
  const liveDna = resolveLiveBrandDna(brandDna, tenantId);
  const company = liveDna?.identity?.companyName || 'העסק המוביל';
  const slogan = liveDna?.identity?.slogan || 'חדשנות, איכות וצמיחה מתמדת';
  const uvp = liveDna?.audience?.mainUvp || 'מעטפת שירות מקצועית, אמינה ומותאמת אישית';
  const cleanTopic = options.promptTopic.trim() || 'עמוד שירות ופעילות מקצועי';

  // Slug generator
  const slugSeed = cleanTopic
    .replace(/[^\u0590-\u05FFa-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  const slug = `p-${Date.now().toString(36)}`;

  // Resolve Image
  let finalImage = '';
  if (options.imageSelection.mode === 'gallery' && options.imageSelection.selectedImageUrl) {
    finalImage = options.imageSelection.selectedImageUrl;
  } else if (options.imageSelection.mode === 'unsplash' || options.imageSelection.mode === 'ai') {
    finalImage = 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80';
  }

  // Event details normalization
  const eventDate = options.eventDetails?.eventDate || '2026-11-20';
  const eventTime = options.eventDetails?.eventTime || '19:30';
  const locationName = options.eventDetails?.locationName || 'מרכז הכנסים והאירועים';
  const locationAddress = options.eventDetails?.locationAddress || liveDna?.trust?.officeAddress || 'דרך מנחם בגין 144, תל אביב';
  const wazeQuery = options.eventDetails?.wazeQuery || locationAddress;

  // Campaign details normalization
  const targetGoal = Number(options.campaignDetails?.targetGoal) || 100000;
  const totalRaised = Number(options.campaignDetails?.totalRaised) || Math.round(targetGoal * 0.45);
  const campaignCause = options.campaignDetails?.campaignCause || cleanTopic || 'שותפות וחיזוק הפעילות';

  return {
    pageTitle: `${cleanTopic} | ${company}`,
    slug,
    hero: {
      title: cleanTopic,
      subtitle: `${slogan} • ${uvp}`,
      badge: '• רשמי ומאומת •',
      ctaPrimaryText: 'השאירו פרטים ונחזור אליכם',
      ctaPrimaryUrl: '#contact',
      ctaSecondaryText: 'שיחה ישירה ב-WhatsApp',
      ctaSecondaryUrl: `https://wa.me/${(liveDna?.trust?.whatsappSupportNumber || '0526968008').replace(/\D/g, '')}`,
      imageUrl: finalImage,
    },
    richContent: {
      heading: `אודות ${cleanTopic}`,
      body: `<p>ב-${company} אנו פועלים מתוך מחויבות עמוקה להעניק את השירות והמענה המובילים ביותר בתחום.</p><p>${uvp}. תוכנית העבודה נבנתה במיוחד כדי לתת מענה מקיף, מהיר ואיכותי ללא פשרות.</p>`,
    },
    event: {
      eventTitle: cleanTopic,
      eventDate,
      eventTime,
      eventEndTime: options.eventDetails?.eventEndTime || '22:00',
      locationName,
      locationAddress,
      wazeQuery,
    },
    campaign: {
      title: `קמפיין שותפות: ${campaignCause}`,
      subtitle: 'יחד מגיעים אל היעד ומבטיחים את המשך הפעילות',
      targetGoal,
      totalRaised,
      donorsCount: 142,
      daysLeft: options.campaignDetails?.daysLeft || 14,
      tiers: [
        { id: 't1', title: 'שותף לדרך', amount: 180, description: 'תמיכה חודשית בפעילות השוטפת', isPopular: false },
        { id: 't2', title: 'עמוד התווך', amount: 360, description: 'הקדשת יום פעילות והנצחה אישית', isPopular: true },
        { id: 't3', title: 'בונה עולם', amount: 1000, description: 'שותפות זהב ושילוט של כבוד', isPopular: false },
      ],
    },
    news: {
      topic: options.newsDetails?.currentAffairsTopic || cleanTopic,
      headline: options.newsDetails?.mainPoints || `${cleanTopic} – עדכונים שוטפים ותובנות מעשיות`,
      points: [
        `הודעה רשמית מטעם ${company} בנושא ${cleanTopic}`,
        'סקירת הדגשים החשובים ביותר וההשלכות המעשיות',
        'צעדים מומלצים לפעולה מיידית ושמירה על יתרון מוביל',
      ],
    },
    pricing: {
      title: 'חבילות ומסלולים מותאמים',
      subtitle: 'בחרו את המסלול המתאים ביותר עבורכם',
      plans: [
        {
          id: 'p1',
          name: 'מסלול בסיסי',
          priceMonthly: 490,
          description: 'מענה ממוקד ומהיר',
          features: ['מעטפת שירות מלאה', 'ליווי מקצועי', 'מענה בוואטסאפ'],
          isFeatured: false,
        },
        {
          id: 'p2',
          name: 'מסלול פרימיום',
          priceMonthly: 990,
          description: 'המסלול המבוקש ביותר',
          features: ['כל יתרונות המסלול הבסיסי', 'זמינות עדיפה VIP', 'דוחות תקופתיים', 'התאמה אישית מלאה'],
          isFeatured: true,
        },
      ],
    },
    stats: [
      { id: 's1', number: '99.4', suffix: '%', label: 'שביעות רצון לקוחות', description: 'מדד איכות בלתי מתפשר' },
      { id: 's2', number: '1,500', suffix: '+', label: 'לקוחות פעילים', description: 'בפריסה ארצית רחבה' },
      { id: 's3', number: '100', suffix: '%', label: 'אחריות וליווי אישי', description: 'זמינות מלאה לאורך כל הדרך' },
    ],
    testimonials: [
      {
        id: 'tm1',
        name: 'דניאל כהן',
        role: 'מנהל פעילות',
        company: 'קבוצת אורן',
        content: `״העבודה מול ${company} הוכיחה את עצמה מהיום הראשון. המקצועיות, הדיוק והיחס החם עשו את כל ההבדל!״`,
        rating: 5,
      },
      {
        id: 'tm2',
        name: 'רעות מזרחי',
        role: 'יזמת ובעלת עסק',
        company: 'סטודיו דיגיטל',
        content: '״שירות מעל המצופה! הכל ברור, מהיר ומלווה בחיוך ובשקיפות מלאה. ממליצה בחום!״',
        rating: 5,
      },
    ],
    faqs: [
      {
        id: 'f1',
        question: `מה כולל בדיוק השירות סביב ${cleanTopic}?`,
        answer: `השירות כולל מעטפת מקצועית שלמה, ליווי אישי וכלים יישומיים מבית ${company}.`,
      },
      {
        id: 'f2',
        question: 'האם נדרש ידע מקדים או הכנה מיוחדת?',
        answer: 'ממש לא! הצוות שלנו מנחה ומלווה בכל צעד, ומספק את כל המידע הנדרש בצורה ברורה ונגישה.',
      },
      {
        id: 'f3',
        question: 'איך מתחילים ויוצאים לדרך?',
        answer: 'פשוט משאירים פרטים כאן בעמוד או לוחצים על כפתור הוואטסאפ ונציג יחזור אליכם בהקדם.',
      },
    ],
    contact: {
      title: 'בואו נעשה את הצעד הבא יחד',
      subtitle: 'השאירו פרטים ונחזור אליכם לשיחת ייעוץ אישית, או פנו ישירות בוואטסאפ',
      phone: liveDna?.trust?.contactPhone || '052-6968008',
      email: liveDna?.trust?.contactEmail || 'ovt5771@gmail.com',
      whatsapp: liveDna?.trust?.whatsappSupportNumber || '0526968008',
      address: liveDna?.trust?.officeAddress || 'דרך מנחם בגין 144, תל אביב',
    },
  };
}

/**
 * Generates StructuredPageDraft using KOSAI (single unified schema, zero prompt conflict)
 * with full Brand DNA, grounding sources, hard facts, and 2026.4 GEO/SEO rules.
 */
export async function generateStructuredPageDraft(
  options: WizardStepOptions,
  brandDna?: BrandDna | null,
  providedApiKey?: string,
  tenantId?: string
): Promise<StructuredPageDraft> {
  const fallback = generateHeuristicStructuredDraft(options, brandDna, tenantId);

  // Merge user-entered hard pricing/campaign tiers into fallback immediately
  if (options.pricingDetails?.plans && options.pricingDetails.plans.length > 0) {
    fallback.pricing = {
      title: fallback.pricing?.title || 'חבילות ומסלולים מותאמים',
      subtitle: fallback.pricing?.subtitle || 'בחרו את המסלול המתאים ביותר עבורכם',
      plans: options.pricingDetails.plans.map((p, idx) => ({
        id: p.id || `p_${idx + 1}`,
        name: p.name,
        priceMonthly: Number(p.priceMonthly) || 0,
        description: p.description || '',
        features: p.features && p.features.length > 0 ? p.features : ['מעטפת שירות מלאה', 'ליווי מקצועי'],
        isFeatured: Boolean(p.isFeatured),
      })),
    };
  }
  if (options.campaignDetails?.tiers && options.campaignDetails.tiers.length > 0 && fallback.campaign) {
    fallback.campaign.tiers = options.campaignDetails.tiers;
  }

  const apiKey = resolveApiKey(providedApiKey);
  if (!apiKey) {
    return fallback;
  }

  const liveDna = resolveLiveBrandDna(brandDna, tenantId);
  const company = liveDna?.identity?.companyName || 'העסק';
  const slogan = liveDna?.identity?.slogan || '';
  const tone =
    (liveDna?.voice as any)?.tone ||
    (liveDna?.identity as any)?.brandPersonality ||
    'מקצועי, מוביל ומשכנע';

  const matrixDef = options.pageTypeId ? getMatrixPageType(options.pageTypeId) : getMatrixPageType('landing');
  const groundingFacts = (options.groundingSources || [])
    .filter((s) => s.extractedText?.trim())
    .map((s) => `[מקור: ${s.label}]\n${s.extractedText}`)
    .join('\n\n');

  // Generate custom AI Hero image in parallel if requested and no image was picked yet
  const shouldGenerateAiImage =
    options.imageSelection.mode === 'ai' && !options.imageSelection.selectedImageUrl;
  const aiImagePromise = shouldGenerateAiImage
    ? generateHeroImageViaProxy(options.imageSelection.aiImagePrompt || options.promptTopic, '16:9', tenantId)
    : Promise.resolve(null);

  try {
    const [rawRes, generatedHeroImage] = await Promise.all([
      dispatchStructuredDraftToKosai(
        {
          pageTypeTitle: matrixDef.titleHe,
          pageEssenceAndFlow: matrixDef.essenceAndFlow,
          selectedSections: options.selectedSectionTypes,
          userTopic: options.promptTopic,
          groundingFacts: groundingFacts || undefined,
          authorName: options.seoGeoFocus?.authorName || company,
          targetQuestion: options.seoGeoFocus?.targetQuestion,
          companyName: company,
          slogan,
          uvp: liveDna?.audience?.mainUvp,
          voiceTone: tone,
          powerWords: liveDna?.voice?.powerWords,
          targetAudiences: liveDna?.audience?.targetAudiences,
          commonObjections: liveDna?.audience?.commonObjections,
          stylePreset: liveDna?.designTokens?.defaultStylePreset || 'standard',
          uiVocabulary: liveDna?.uiVocabulary
            ? {
                primaryCta: liveDna.uiVocabulary.primaryCta,
                whatsappCta: liveDna.uiVocabulary.whatsappCta,
                formSubmitText: liveDna.uiVocabulary.formSubmitText,
              }
            : undefined,
          eventDetails: options.eventDetails,
          campaignDetails: options.campaignDetails,
          pricingInput: options.pricingDetails?.plans,
          geoDetails: options.geoDetails,
        },
        { apiKey, tenantId }
      ),
      aiImagePromise,
    ]);

    if (generatedHeroImage) {
      fallback.hero.imageUrl = generatedHeroImage;
    }

    if (rawRes) {
      let parsed = rawRes;
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim());
        } catch {
          const firstBrace = parsed.indexOf('{');
          const lastBrace = parsed.lastIndexOf('}');
          if (firstBrace >= 0 && lastBrace > firstBrace) {
            parsed = JSON.parse(parsed.slice(firstBrace, lastBrace + 1));
          }
        }
      }

      if (parsed && typeof parsed === 'object') {
        // Preserve user hard-fact prices if provided; otherwise accept AI plans
        const resolvedPricingPlans =
          options.pricingDetails?.plans && options.pricingDetails.plans.length > 0
            ? options.pricingDetails.plans.map((userPlan, idx) => {
                const aiMatch = Array.isArray(parsed.pricing?.plans) ? parsed.pricing.plans[idx] : null;
                return {
                  id: userPlan.id || `p_${idx + 1}`,
                  name: userPlan.name || aiMatch?.name || `מסלול ${idx + 1}`,
                  priceMonthly: Number(userPlan.priceMonthly) || 0,
                  description: userPlan.description || aiMatch?.description || '',
                  features:
                    userPlan.features && userPlan.features.length > 0
                      ? userPlan.features
                      : Array.isArray(aiMatch?.features) && aiMatch.features.length > 0
                      ? aiMatch.features
                      : ['מעטפת שירות מלאה', 'ליווי מקצועי'],
                  isFeatured: Boolean(userPlan.isFeatured),
                };
              })
            : Array.isArray(parsed.pricing?.plans) && parsed.pricing.plans.length > 0
            ? parsed.pricing.plans.map((p: any, idx: number) => ({
                id: `p_${idx + 1}`,
                name: p.name || `מסלול ${idx + 1}`,
                priceMonthly: Number(p.priceMonthly) || 490,
                description: p.description || '',
                features: Array.isArray(p.features) ? p.features : [],
                isFeatured: Boolean(p.isFeatured),
              }))
            : fallback.pricing?.plans || [];

        const { slugPrefixLower } = mapMatrixIdToPageCategory(options.pageTypeId || 'landing');
        const rawSuffix = String(parsed.slugSuffix || parsed.slug || '')
          .toLowerCase()
          .replace(/[^a-z0-9-]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        const cleanSuffix = rawSuffix
          .replace(new RegExp(`^${slugPrefixLower}-`), '')
          .slice(0, 48);
        const resolvedSlug =
          options.pageTypeId === 'homepage'
            ? 'home'
            : cleanSuffix
            ? `${slugPrefixLower}-${cleanSuffix}`
            : `${slugPrefixLower}-${Date.now().toString(36)}`;

        return {
          ...fallback,
          pageTitle: parsed.pageTitle || fallback.pageTitle,
          slug: resolvedSlug,
          hero: {
            ...fallback.hero,
            title: parsed.hero?.title || fallback.hero.title,
            subtitle: parsed.hero?.subtitle || fallback.hero.subtitle,
            badge: parsed.hero?.badge || fallback.hero.badge,
            ctaPrimaryText: parsed.hero?.ctaPrimaryText || fallback.hero.ctaPrimaryText,
            ctaSecondaryText: parsed.hero?.ctaSecondaryText || fallback.hero.ctaSecondaryText,
          },
          richContent: parsed.richContent
            ? {
                heading: parsed.richContent.heading || fallback.richContent?.heading || '',
                body: parsed.richContent.body || fallback.richContent?.body || '',
              }
            : fallback.richContent,
          beforeAfter: parsed.beforeAfter
            ? {
                title: parsed.beforeAfter.title || 'השינוי שאנחנו מביאים',
                subtitle: parsed.beforeAfter.subtitle || 'לפני ואחרי העבודה איתנו',
                beforeLabel: parsed.beforeAfter.beforeLabel || 'לפני',
                afterLabel: parsed.beforeAfter.afterLabel || 'אחרי',
              }
            : fallback.beforeAfter,
          stats:
            Array.isArray(parsed.stats) && parsed.stats.length > 0
              ? parsed.stats.map((s: any, idx: number) => ({
                  id: `s_${idx + 1}`,
                  number: String(s.number || '100'),
                  suffix: String(s.suffix || ''),
                  label: s.label || '',
                  description: s.description || '',
                }))
              : fallback.stats,
          testimonials:
            Array.isArray(parsed.testimonials) && parsed.testimonials.length > 0
              ? parsed.testimonials.map((t: any, idx: number) => ({
                  id: `tm_${idx + 1}`,
                  name: t.name || 'לקוח מאומת',
                  role: t.role || '',
                  company: t.company || '',
                  content: t.content || '',
                  rating: Number(t.rating) || 5,
                }))
              : fallback.testimonials,
          pricing: {
            title: parsed.pricing?.title || fallback.pricing?.title || 'מסלולים וחבילות',
            subtitle: parsed.pricing?.subtitle || fallback.pricing?.subtitle || '',
            plans: resolvedPricingPlans,
          },
          faqs:
            options.preGeneratedFaqs && options.preGeneratedFaqs.length > 0
              ? options.preGeneratedFaqs
              : Array.isArray(parsed.faqs) && parsed.faqs.length > 0
              ? parsed.faqs.map((f: any, idx: number) => ({
                  id: `f_${idx + 1}`,
                  question: f.question || f.q || '',
                  answer: f.answer || f.a || '',
                }))
              : fallback.faqs,
          contact: {
            ...fallback.contact!,
            title: parsed.contact?.title || fallback.contact?.title || 'בואו נדבר',
            subtitle: parsed.contact?.subtitle || fallback.contact?.subtitle || '',
          },
          seoGeo: parsed.seoGeo
            ? {
                title: parsed.seoGeo.title || `${parsed.pageTitle || fallback.pageTitle} | ${company}`,
                description: parsed.seoGeo.description || parsed.hero?.subtitle || fallback.hero.subtitle,
                keywords: Array.isArray(parsed.seoGeo.keywords) ? parsed.seoGeo.keywords : [company, options.promptTopic],
                aiKnowledgeSummary: parsed.seoGeo.aiKnowledgeSummary || '',
                aiTargetQuestions: Array.isArray(parsed.seoGeo.aiTargetQuestions) ? parsed.seoGeo.aiTargetQuestions : [],
                author: parsed.seoGeo.author || options.seoGeoFocus?.authorName || company,
              }
            : undefined,
        };
      }
    }
  } catch (err) {
    console.warn('[structuredPageAiService] AI generation notice, engaging fallback:', err);
  }

  return fallback;
}

/**
 * Builds the complete PageBuilderConfig from the user-reviewed draft, selected sections,
 * Brand DNA style presets, UI vocabulary, CRM field mappings, Kesher checkout params, and 2026.4 GEO/SEO.
 */
export function buildPageConfigFromStructuredDraft(
  draft: StructuredPageDraft,
  options: WizardStepOptions,
  brandDna?: BrandDna | null,
  tenantId?: string
): PageBuilderConfig {
  const liveDna = resolveLiveBrandDna(brandDna, tenantId);
  const companyName = liveDna?.identity?.companyName || 'קושאן';
  const slogan = liveDna?.identity?.slogan || '';
  const pageId = `page_${Date.now()}`;
  const matrixDef = options.pageTypeId ? getMatrixPageType(options.pageTypeId) : null;
  const shouldShowHeader = matrixDef ? matrixDef.hasHeader : true;
  const { pageCategory, slugPrefixLower } = mapMatrixIdToPageCategory(options.pageTypeId || 'landing');
  const cleanDraftSlug = (draft.slug || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const finalSlug =
    options.pageTypeId === 'homepage'
      ? 'home'
      : cleanDraftSlug.startsWith(`${slugPrefixLower}-`)
      ? cleanDraftSlug
      : `${slugPrefixLower}-${cleanDraftSlug || Date.now().toString(36)}`;

  const crmFields =
    options.crmFormFields && options.crmFormFields.length > 0
      ? options.crmFormFields
      : STANDARD_CRM_FORM_FIELDS.filter((f) => f.defaultSelected);

  const config: PageBuilderConfig = {
    pageId,
    pageTitle: draft.pageTitle,
    slug: finalSlug,
    pageCategory,
    published: false,
    isHomePage: options.pageTypeId === 'homepage',
    viewsCount: 0,
    leadsCount: 0,
    globalSettings: {
      siteTitle: `${draft.pageTitle} | ${companyName}`,
      companyName,
      slogan,
      siteLogoUrl: liveDna?.identity?.logoUrl || '',
      theme: (liveDna?.designTokens?.defaultStylePreset as any) || 'modern',
      headerLayout: 'capsule-floating',
      headerSticky: true,
      isHeaderVisible: shouldShowHeader,
      isFooterVisible: true,
      primaryColor: liveDna?.designTokens?.primaryColor || '#6366f1',
      secondaryColor: liveDna?.designTokens?.secondaryColor || '#ec4899',
      backgroundColor: liveDna?.designTokens?.backgroundColor || '#ffffff',
      textColor: liveDna?.designTokens?.textColor || '#0f172a',
      fontFamily: liveDna?.designTokens?.fontFamily || 'Heebo, sans-serif',
      borderRadius: liveDna?.designTokens?.borderRadius || 'md',
      buttonStyle: liveDna?.designTokens?.buttonStyle || 'gradient',
      contactWhatsApp: draft.contact?.whatsapp || liveDna?.trust?.whatsappSupportNumber || '0526968008',
      contactPhone: draft.contact?.phone || liveDna?.trust?.contactPhone || '052-6968008',
      contactEmail: draft.contact?.email || liveDna?.trust?.contactEmail || 'ovt5771@gmail.com',
      address: draft.contact?.address || liveDna?.trust?.officeAddress || 'דרך מנחם בגין 144, תל אביב',
      brandDnaSynced: true,
    },
    seoSettings: {
      title: draft.seoGeo?.title || `${draft.pageTitle} | ${companyName}`,
      description: draft.seoGeo?.description || draft.hero.subtitle || slogan,
      keywords: draft.seoGeo?.keywords || [companyName, draft.pageTitle],
      author: draft.seoGeo?.author || options.seoGeoFocus?.authorName || companyName,
      ogType: options.pageTypeId === 'pillar_article' ? 'article' : 'website',
      twitterCard: 'summary_large_image',
      aiKnowledgeSummary: draft.seoGeo?.aiKnowledgeSummary || draft.hero.subtitle,
      aiTargetQuestions:
        draft.seoGeo?.aiTargetQuestions && draft.seoGeo.aiTargetQuestions.length > 0
          ? draft.seoGeo.aiTargetQuestions
          : draft.faqs?.slice(0, 3).map((f) => f.question),
      aiEntitySchemaType: (matrixDef?.recommendedSchemaType as any) || 'ProfessionalService',
      aiBotIndexingEnabled: true,
      geo: options.geoDetails?.targetCity
        ? {
            enabled: true,
            targetCity: options.geoDetails.targetCity,
            serviceAreas: options.geoDetails.serviceAreas || [options.geoDetails.targetCity],
            localBusinessName: companyName,
            businessAddress: liveDna?.trust?.officeAddress,
            businessPhone: liveDna?.trust?.contactPhone,
            businessEmail: liveDna?.trust?.contactEmail,
          }
        : undefined,
    },
    sectionOrder: [],
    sections: {},
  };

  const rawSelected = options.selectedSectionTypes.length > 0
    ? options.selectedSectionTypes
    : (['hero', 'richContent', 'statsBento', 'testimonials', 'faq', 'contact'] as SectionType[]);

  // Respect matrix hasHeader rule: omit 'header' section if page type is distraction-free (landing / campaign)
  const selectedSections = shouldShowHeader ? rawSelected : rawSelected.filter((t) => t !== 'header');

  selectedSections.forEach((type, index) => {
    const secDef = SECTION_REGISTRY[type];
    const secId = `${type}_${Date.now()}_${index + 1}`;
    const base = secDef ? JSON.parse(JSON.stringify(secDef.defaultConfig)) : { type, visible: true };

    let enrichedData: any = {
      ...base,
      id: secId,
      type,
      visible: true,
    };

    // Inject tailored drafted fields according to type
    if (type === 'hero') {
      enrichedData.title = draft.hero.title;
      enrichedData.subtitle = draft.hero.subtitle;
      enrichedData.badge = draft.hero.badge;
      enrichedData.imageUrl = draft.hero.imageUrl;
      enrichedData.imageSrc = draft.hero.imageUrl;
      if (enrichedData.primaryButton) {
        enrichedData.primaryButton.text = draft.hero.ctaPrimaryText;
        enrichedData.primaryButton.url = draft.hero.ctaPrimaryUrl;
      }
      if (enrichedData.secondaryButton) {
        enrichedData.secondaryButton.text = draft.hero.ctaSecondaryText;
        enrichedData.secondaryButton.url = draft.hero.ctaSecondaryUrl;
      }
    } else if (type === 'richContent' && draft.richContent) {
      enrichedData.heading = draft.richContent.heading;
      enrichedData.body = draft.richContent.body;
    } else if (type === 'beforeAfter' && draft.beforeAfter) {
      enrichedData.title = draft.beforeAfter.title;
      enrichedData.subtitle = draft.beforeAfter.subtitle;
      enrichedData.beforeLabel = draft.beforeAfter.beforeLabel;
      enrichedData.afterLabel = draft.beforeAfter.afterLabel;
    } else if (type === 'eventRsvp' && draft.event) {
      enrichedData.title = draft.event.eventTitle;
      enrichedData.eventTitle = draft.event.eventTitle;
      enrichedData.eventDate = draft.event.eventDate;
      enrichedData.eventTime = draft.event.eventTime;
      enrichedData.eventEndTime = draft.event.eventEndTime;
      enrichedData.locationName = draft.event.locationName;
      enrichedData.locationAddress = draft.event.locationAddress;
      enrichedData.wazeQuery = draft.event.wazeQuery;
      enrichedData.crmFields = crmFields;
    } else if (type === 'timer' && draft.event) {
      enrichedData.title = `ספירה לאחור: ${draft.event.eventTitle}`;
      enrichedData.subtitle = `${draft.event.locationName} • ${draft.event.eventDate}`;
      enrichedData.targetDate = `${draft.event.eventDate}T${draft.event.eventTime || '20:00'}:00`;
    } else if (type === 'campaignHeader' && draft.campaign) {
      enrichedData.title = draft.campaign.title;
      enrichedData.subtitle = draft.campaign.subtitle;
      enrichedData.targetGoal = draft.campaign.targetGoal;
      enrichedData.totalRaised = draft.campaign.totalRaised;
      enrichedData.donorsCount = draft.campaign.donorsCount;
      enrichedData.daysLeft = draft.campaign.daysLeft;
    } else if (type === 'campaignTiers' && draft.campaign) {
      enrichedData.tiers = draft.campaign.tiers.map((t) => ({
        ...t,
        actionType: 'kesher_checkout',
        documentType: 405,
      }));
    } else if (type === 'pricing' && draft.pricing) {
      const docType = options.pricingDetails?.documentType || 320;
      const maxInst = options.pricingDetails?.enableInstallments ? options.pricingDetails.maxInstallments || 12 : 1;
      enrichedData.title = draft.pricing.title;
      enrichedData.subtitle = draft.pricing.subtitle;
      enrichedData.packages = draft.pricing.plans.map((p) => ({
        ...p,
        priceMonthly: String(p.priceMonthly),
        actionType: 'kesher_checkout',
        documentType: docType,
        maxInstallments: maxInst,
        buttonText: liveDna?.uiVocabulary?.primaryCta || 'להצטרפות ותשלום מאובטח',
      }));
    } else if (type === 'statsBento' && draft.stats) {
      enrichedData.stats = draft.stats;
    } else if (type === 'testimonials' && draft.testimonials) {
      enrichedData.items = draft.testimonials;
    } else if (type === 'faq' && draft.faqs) {
      enrichedData.items = draft.faqs;
    } else if (type === 'geoLocal') {
      enrichedData.city = options.geoDetails?.targetCity || enrichedData.city || 'תל אביב';
      enrichedData.serviceAreas = options.geoDetails?.serviceAreas || enrichedData.serviceAreas || ['כל הארץ'];
      enrichedData.phone = config.globalSettings.contactPhone;
      enrichedData.email = config.globalSettings.contactEmail;
      enrichedData.address = config.globalSettings.address;
    } else if (type === 'smartForm' || type === 'landingSection') {
      enrichedData.sectionTitle = enrichedData.sectionTitle || draft.contact?.title || 'השאירו פרטים ונחזור אליכם';
      enrichedData.sectionSubtitle = enrichedData.sectionSubtitle || draft.contact?.subtitle || '';
      enrichedData.crmFields = crmFields;
    } else if (type === 'contact') {
      enrichedData.title = draft.contact?.title || 'יצירת קשר מהירה';
      enrichedData.subtitle = draft.contact?.subtitle || 'השאירו פרטים ונחזור אליכם בהקדם';
      enrichedData.phone = draft.contact?.phone || config.globalSettings.contactPhone;
      enrichedData.email = draft.contact?.email || config.globalSettings.contactEmail;
      enrichedData.whatsapp = draft.contact?.whatsapp || config.globalSettings.contactWhatsApp;
      enrichedData.address = draft.contact?.address || config.globalSettings.address;
      enrichedData.directWhatsappChat = true;
      enrichedData.showForm = true;
      enrichedData.crmFields = crmFields;
    }

    config.sectionOrder.push(secId);
    config.sections[secId] = enrichedData;
  });

  // Apply tenant Brand Style Preset (colors, radius, button styles) WITHOUT overwriting AI-generated copy
  const preset = liveDna?.designTokens?.defaultStylePreset;
  let finalPage = config;
  if (preset) {
    finalPage = applyStylePresetToPage(finalPage, preset).updatedPage;
  }

  return finalPage;
}

/**
 * Asynchronously streams section building with progress updates.
 */
export async function streamPageBuilding(
  draft: StructuredPageDraft,
  options: WizardStepOptions,
  brandDna: BrandDna | null,
  onStep: (step: StreamStepInfo, partialConfig: PageBuilderConfig) => void,
  tenantId?: string
): Promise<PageBuilderConfig> {
  const fullConfig = buildPageConfigFromStructuredDraft(draft, options, brandDna, tenantId);
  const totalSteps = fullConfig.sectionOrder.length;

  const progressiveConfig: PageBuilderConfig = {
    ...fullConfig,
    sectionOrder: [],
    sections: {},
  };

  for (let i = 0; i < totalSteps; i++) {
    const secId = fullConfig.sectionOrder[i];
    const secData = fullConfig.sections[secId];
    const secType = secData.type as SectionType;

    progressiveConfig.sectionOrder.push(secId);
    progressiveConfig.sections[secId] = secData;

    const progressPercent = Math.min(100, Math.round(((i + 1) / totalSteps) * 100));

    onStep(
      {
        stepIndex: i + 1,
        totalSteps,
        sectionType: secType,
        stepTitle: `אזור ${i + 1} מתוך ${totalSteps}: ${SECTION_REGISTRY[secType]?.name || secType}`,
        statusText: `מזרים תוכן, עיצוב ונתונים לאזור ${SECTION_REGISTRY[secType]?.name || secType}...`,
        progressPercent,
      },
      JSON.parse(JSON.stringify(progressiveConfig))
    );

    // Smooth and realistic visual streaming pace
    await new Promise((resolve) => setTimeout(resolve, 350));
  }

  return fullConfig;
}
