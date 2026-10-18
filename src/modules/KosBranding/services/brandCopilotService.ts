import { BrandDna } from '../types/brandDna';
import { getModuleGeminiKey } from '../../../core/connection/tenantApiKeys';
import {
  dispatchBrandSummaryParagraphToKosai,
  dispatchBrandDiscoveryToKosai,
  dispatchBrandRephraseToKosai,
  dispatchStepAssistanceToKosai,
  dispatchContentStrategiesToKosai,
  dispatchEntityItemToKosai,
  dispatchFlagshipProductToKosai,
  dispatchCoreServiceToKosai,
  dispatchBusinessPackagesToKosai,
  dispatchEcosystemItemsToKosai,
  dispatchPersonaToKosai,
  dispatchObjectionToKosai,
  dispatchMarketResearchToKosai,
} from '../kosai/promptToKosai';
import { buildBrandSystemContext } from '../prompts';

export { buildBrandSystemContext };

export interface StepAiSuggestion {
  title: string;
  value: any;
  subtitle?: string;
  rationale?: string;
  isRecommended?: boolean;
}

export interface StepAiAssistanceResult {
  success: boolean;
  suggestions: StepAiSuggestion[];
  recommendedIndex: number;
  recommendationReason: string;
  smartInsight?: string;
  isLiveAi?: boolean;
  liveModel?: string;
  error?: string;
}

export function resolveGeminiApiKey(providedKey?: string): string {
  if (providedKey && providedKey.trim()) return providedKey.trim();
  return getModuleGeminiKey('KosBranding');
}

export const AUTHORIZED_BRAND_MODEL = 'gemini-3.8-flash-lite';
export const NOT_IN_BASKET_MESSAGE = 'אין לכם את האפשרות הזו בסל. לשדרוג החבילה והפעלת יכולות AI, פנו למנהל המערכת.';

/**
 * מפיק פסקת תמצית מותג דחוסה ומרוכזת (250-300 מילים - "מועט המחזיק את המרובה") מתוך קולקציית המיתוג
 */
export async function generateBrandSummaryParagraph(
  brand: BrandDna,
  apiKey?: string
): Promise<{ success: boolean; paragraph: string; wordCount: number; error?: string }> {
  const activeKey = resolveGeminiApiKey(apiKey);
  try {
    const res = await dispatchBrandSummaryParagraphToKosai(brand, { apiKey: activeKey });
    if (res && res.summaryParagraph) {
      return {
        success: true,
        paragraph: res.summaryParagraph,
        wordCount: res.wordCount || res.summaryParagraph.trim().split(/\s+/).length,
      };
    }
  } catch (err: any) {
    console.warn('[brandCopilotService] KOSAI summary paragraph failed, using heuristic fallback:', err);
  }

  // מנגנון חלופי דחוס מקומי באפס טוקנים (Zero-Token Heuristic Paragraph Engine)
  const company = brand.identity.companyName || 'העסק המוביל';
  const purpose = brand.identity.organizationPurpose || 'מתן שירותים ופתרונות מקצועיים מקיפים';
  const slogan = brand.identity.slogan || 'איכות, מקצוענות וצמיחה מתמדת';
  const uvp = brand.audience.mainUvp || 'מעטפת שירות אישית וחדשנית המעניקה שקט נפשי מלא ותוצאות מוכחות';
  const audiences = (brand.audience.targetAudiences || []).join(', ') || 'עסקים ולקוחות פרטיים';
  const powerWords = (brand.voice.powerWords || []).join(', ') || 'אמינות, מקצוענות, תוצאות';

  const fallbackText = `${company} פועלת מתוך שליחות עסקית ברורה ובלתי מתפשרת להוביל את תחום ה${purpose}, תוך הצבת סטנדרט חדש של איכות, אמינות וחדשנות דיגיטלית מתקדמת. תחת המוטו המוביל "${slogan}", המותג מבסס את מעמדו כשותף אסטרטגי מהימן עבור ${audiences}, המבקשים לא רק מענה מקצועי נקודתי אלא מעטפת שלמה ומדויקת המעניקה שקט נפשי מלא ותוצאות מוחשיות לאורך זמן. הצעת הערך הייחודית של המותג (UVP) מתמקדת ב${uvp}, המשלבת מומחיות מעמיקה, יחס אישי בלתי אמצעי ותהליכי עבודה מהירים וסדורים המבטיחים ביצוע ללא פשרות. שפת המותג מעוגנת בערכי ליבה של ${powerWords}, ומאופיינת בדיאלוג ישיר, בגובה העיניים, המשלב סמכות מקצועית בלתי מעורערת לצד חמימות ונגישות אנושית מקרבת. במציאות דיגיטלית המשתנה בקצב מהיר, ${company} מחויבת להעניק לכל לקוח ושותף דרך חוויית שירות הוליסטית, המשלבת טכנולוגיה חכמה עם ליווי אנושי מוקפד, המייצרת ביטחון מוחלט ומובילה לצמיחה עסקית מתמדת. המותג מנטרל מראש כל חשש באמצעות שקיפות מלאה, מדיניות אחריות מחמירה ומחויבות בלתי מתפשרת להצלחת הלקוח בכל נקודת מגע לאורך המסע המשותף. שילוב זה של ראייה רחבה, ביצוע מדויק ותפיסה שיווקית מתקדמת הופך את ${company} לבחירה הטבעית והמובילה בשוק עבור אלו שאינם מתפשרים על פחות מהטוב ביותר.`;

  const wordCount = fallbackText.trim().split(/\s+/).length;

  return {
    success: true,
    paragraph: fallbackText,
    wordCount,
  };
}

/**
 * שכתוב טקסט לפי שפת המותג
 */
export async function rephraseTextWithBrandAi(
  originalText: string,
  apiKey: string,
  brand: BrandDna,
  customInstructions?: string
): Promise<{ success: boolean; text?: string; modelUsed?: string; error?: string }> {
  const activeKey = resolveGeminiApiKey(apiKey);
  try {
    const text = await dispatchBrandRephraseToKosai(originalText, brand, customInstructions, { apiKey: activeKey });
    return {
      success: true,
      text,
      modelUsed: AUTHORIZED_BRAND_MODEL,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || NOT_IN_BASKET_MESSAGE,
    };
  }
}

/**
 * חילוץ Brand DNA מלא מתמלול ראיון
 */
export async function generateBrandDnaFromInterview(
  interviewNotes: string,
  apiKey?: string
): Promise<{ success: boolean; brandDna?: Partial<BrandDna>; error?: string }> {
  const activeKey = resolveGeminiApiKey(apiKey);
  try {
    const brandDna = await dispatchBrandDiscoveryToKosai(interviewNotes, { apiKey: activeKey });
    return {
      success: true,
      brandDna,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || NOT_IN_BASKET_MESSAGE,
    };
  }
}

/**
 * סיוע מותאם לשלב בשאלון המיתוג
 */
export async function generateStepAiAssistance(
  stepId: string,
  brand: BrandDna,
  userDraft?: string,
  apiKey?: string
): Promise<StepAiAssistanceResult> {
  const activeKey = resolveGeminiApiKey(apiKey);
  if (!activeKey) {
    return generateSmartFallbackSuggestions(stepId, brand, userDraft);
  }

  try {
    const data = await dispatchStepAssistanceToKosai(stepId, brand, userDraft, { apiKey: activeKey });
    if (data && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
      return {
        success: true,
        suggestions: data.suggestions,
        recommendedIndex: data.recommendedIndex ?? 0,
        recommendationReason: data.recommendationReason || 'הצעה זו מדויקת ומתאימה ביותר לפרופיל המותג.',
        smartInsight: data.smartInsight,
        isLiveAi: true,
        liveModel: AUTHORIZED_BRAND_MODEL,
      };
    }
  } catch (err) {
    console.warn('[brandCopilotService] Step assistance live AI failed, falling back:', err);
  }

  return generateSmartFallbackSuggestions(stepId, brand, userDraft);
}

/**
 * יצירת אסטרטגיות תוכן (עמודי שירות ומכירה)
 */
export async function generateBrandContentStrategies(
  brand: BrandDna,
  apiKey?: string
): Promise<{ success: boolean; strategies: any[]; error?: string }> {
  const activeKey = resolveGeminiApiKey(apiKey);
  try {
    const strategies = await dispatchContentStrategiesToKosai(brand, { apiKey: activeKey });
    if (Array.isArray(strategies) && strategies.length > 0) {
      return {
        success: true,
        strategies,
      };
    }
  } catch (err: any) {
    console.warn('[brandCopilotService] Content strategies live AI failed, falling back:', err);
  }

  // Fallback strategies
  const company = brand.identity.companyName || 'העסק';
  const fallbackStrategies = [
    {
      id: 'strat_service',
      type: 'service_page',
      title: `עמוד שירות וסמכות - ${company}`,
      targetAudience: brand.audience.targetAudiences[0] || 'לקוחות איכותיים',
      heroHeadline: `פתרונות מקצועיים ומוכחים מבית ${company}`,
      heroSubheadline: brand.audience.mainUvp || 'מעטפת מקצועית מלאה ושקט נפשי מתמיד',
      coreValuePoints: ['אמינות וניסיון מוכח', 'ליווי אישי מקצה לקצה', 'תוצאות ממוקדות מטרה'],
      callToAction: 'לתיאום שיחת היכרות וייעוץ',
      objectionKiller: 'ללא התחייבות מראש, עם אחריות מלאה על שביעות הרצון.',
      persuasiveClosing: 'הצטרף למעגל הלקוחות המרוצים שלנו עוד היום.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'strat_sales',
      type: 'sales_page',
      title: `עמוד מכירה והשקה - ${company}`,
      targetAudience: brand.audience.targetAudiences[0] || 'רוכשים ישירים',
      heroHeadline: `קבל גישה מלאה לשירותי ${company} בתנאי השקה בלעדיים`,
      heroSubheadline: 'הזדמנות מוגבלת לשדרג את העסק שלך עם תוצאות מיידיות',
      coreValuePoints: ['מחיר השקה מיוחד', 'מענה מהיר ומיידי', 'ערך מוסף ללא תחרות'],
      callToAction: 'הבטח את מקומך עכשיו',
      pricingHook: 'הנחה מיוחדת לנרשמים השבוע בלבד',
      objectionKiller: 'אחריות החזר כספי מלאה במידה ואינך מרוצה.',
      persuasiveClosing: 'המבצע לזמן מוגבל - הבטח את מקומך כעת.',
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    success: true,
    strategies: fallbackStrategies,
  };
}

/**
 * יצירת פרסונה בודדת מותאמת ל-DNA (תומך גם בשדות הקצרים של TargetAudienceSection וגם בשדות המלאים של PersonaItem)
 */
export async function generateAiPersona(brand: BrandDna, apiKey?: string): Promise<any> {
  const activeKey = resolveGeminiApiKey(apiKey);
  try {
    const res = await dispatchPersonaToKosai(brand, { apiKey: activeKey });
    if (res && typeof res === 'object') {
      const roleVal = res.role || res.roleOrProfile || 'לקוח יעד מרכזי';
      const painVal = res.pain || res.mainPain || 'חיפוש אחר מענה מקצועי, אמין ואישי';
      const dreamVal = res.dream || res.dreamOutcome || 'שקט נפשי, מענה מדויק ותוצאות מוכחות';
      return {
        id: res.id || `p_${Date.now()}`,
        name: res.name || 'לקוח יעד מוביל',
        role: roleVal,
        roleOrProfile: roleVal,
        pain: painVal,
        mainPain: painVal,
        dream: dreamVal,
        dreamOutcome: dreamVal,
      };
    }
  } catch (err) {
    console.warn('[brandCopilotService] generateAiPersona fallback:', err);
  }

  return {
    id: `p_${Date.now()}`,
    name: `לקוח/ה של ${brand.identity?.companyName || 'המותג'}`,
    role: brand.audience?.targetAudiences?.[0] || 'קהל יעד מרכזי המחפש פתרון אמין ואיכותי',
    roleOrProfile: brand.audience?.targetAudiences?.[0] || 'קהל יעד מרכזי המחפש פתרון אמין ואיכותי',
    pain: 'עומס, חוסר ודאות וצורך במענה מקצועי בגובה העיניים',
    mainPain: 'עומס, חוסר ודאות וצורך במענה מקצועי בגובה העיניים',
    dream: 'חוויה מעצימה, שקט נפשי מלא ופתרון מותאם אישית',
    dreamOutcome: 'חוויה מעצימה, שקט נפשי מלא ופתרון מותאם אישית',
  };
}

/**
 * יצירת התנגדות ומענה מותאם
 */
export async function generateAiObjection(brand: BrandDna, apiKey?: string): Promise<any> {
  const activeKey = resolveGeminiApiKey(apiKey);
  try {
    const res = await dispatchObjectionToKosai(brand, { apiKey: activeKey });
    if (res && typeof res === 'object' && res.objection && res.rebuttal) {
      return {
        id: res.id || `o_${Date.now()}`,
        objection: res.objection,
        rebuttal: res.rebuttal,
      };
    }
  } catch (err) {
    console.warn('[brandCopilotService] generateAiObjection fallback:', err);
  }

  return {
    id: `o_${Date.now()}`,
    objection: 'האם השירות והמענה באמת מותאמים לצרכים האישיים שלי?',
    rebuttal: `ב-${brand.identity?.companyName || 'ארגוננו'} אנו מעניקים יחס אישי ומעטפת מותאמת במדויק לכל פונה, עם ליווי מקצועי ומסור לכל אורך הדרך.`,
  };
}

const DEFAULT_PAIN_ICONS = ['AlertCircle', 'Clock', 'HeartHandshake', 'ShieldCheck', 'Compass', 'Sparkles'];
const DEFAULT_AUDIENCE_ICONS = ['Users', 'Briefcase', 'Heart'];
const DEFAULT_ADVANTAGE_ICONS = ['Award', 'CheckCircle2', 'Sparkles', 'HeartHandshake', 'Star', 'Shield'];
const DEFAULT_FAQ_ICONS = ['HelpCircle', 'CheckCircle2', 'Info', 'Sparkles', 'Clock', 'Heart', 'Shield', 'Users', 'Phone', 'Star'];

/**
 * מפרסר תשובת טקסט מובנית (Delimited Plain Text) של מוצר או שירות מ-Gemini
 * מגן מפני כפילויות, חוסך טוקנים מסיביים ומחלץ את כל השדות בצורה דטרמיניסטית
 */
export function parseDelimitedFlagshipText(raw: any, cleanIdea: string, company: string): Record<string, any> {
  let text = '';
  if (typeof raw === 'string') {
    text = raw.trim();
  } else if (raw && typeof raw === 'object') {
    if (raw.painPoints || raw.targetAudiences || raw.nameAndSlogan) {
      return raw;
    }
    text = JSON.stringify(raw);
  }

  // If text is wrapped in JSON codeblock or braces
  if (text.startsWith('```json') || text.startsWith('```')) {
    text = text.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/, '').trim();
  }
  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      const obj = JSON.parse(text);
      if (obj && typeof obj === 'object') return obj;
    } catch {
      // Continue to regex delimited parsing
    }
  }

  const sections: Record<string, string> = {};
  const sectionRegex = /===([A-Z_]+)===\s*([\s\S]*?)(?=(?:===[A-Z_]+===|$))/g;
  let match;
  while ((match = sectionRegex.exec(text)) !== null) {
    const key = match[1].trim();
    const content = match[2].trim();
    sections[key] = content;
  }

  const parseLines = (rawBlock: string | undefined) => {
    if (!rawBlock) return [];
    return rawBlock
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('==='))
      .map((line) => {
        const cleaned = line.replace(/^\d+[\.\)\-]\s*/, '').trim();
        if (cleaned.includes('|')) {
          const parts = cleaned.split('|');
          return {
            title: parts[0].trim(),
            text: parts.slice(1).join('|').trim(),
          };
        }
        if (cleaned.includes(':')) {
          const parts = cleaned.split(':');
          return {
            title: parts[0].trim(),
            text: parts.slice(1).join(':').trim(),
          };
        }
        return {
          title: cleaned.slice(0, 35).trim(),
          text: cleaned,
        };
      })
      .filter((item) => item.title.length > 0 || item.text.length > 0);
  };

  const painPoints = parseLines(sections.PAIN_POINTS);
  const targetAudiences = parseLines(sections.TARGET_AUDIENCES);
  const competitiveAdvantages = parseLines(sections.COMPETITIVE_ADVANTAGES);

  // Parse FAQs
  const faqLines = (sections.FAQS || '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('==='))
    .map((line) => {
      const cleaned = line.replace(/^\d+[\.\)\-]\s*/, '').trim();
      if (cleaned.includes('|')) {
        const parts = cleaned.split('|');
        return {
          question: parts[0].trim(),
          answer: parts.slice(1).join('|').trim(),
        };
      }
      if (cleaned.includes('?')) {
        const idx = cleaned.indexOf('?');
        return {
          question: cleaned.slice(0, idx + 1).trim(),
          answer: cleaned.slice(idx + 1).replace(/^[\s:\-]+/, '').trim(),
        };
      }
      if (cleaned.includes(':')) {
        const parts = cleaned.split(':');
        return {
          question: parts[0].trim(),
          answer: parts.slice(1).join(':').trim(),
        };
      }
      return {
        question: cleaned,
        answer: `מענה מקצועי, אישי ומדויק מבית ${company} עבור ${cleanIdea}.`,
      };
    })
    .filter((f) => f.question.length > 0);

  // Parse SEO block
  const seoBlock = sections.SEO || '';
  const getSeoVal = (key: string) => {
    const m = new RegExp(`^${key}:\\s*(.*)$`, 'm').exec(seoBlock);
    return m ? m[1].trim() : '';
  };

  const seoSlug = getSeoVal('SLUG');
  const metaTitle = getSeoVal('META_TITLE');
  const metaDescription = getSeoVal('META_DESCRIPTION');
  const keywords = getSeoVal('KEYWORDS');
  const aiSummary = getSeoVal('AI_SUMMARY');
  const aiQuestionsRaw = getSeoVal('AI_QUESTIONS');
  const aiTargetQuestions = aiQuestionsRaw
    ? aiQuestionsRaw.split('|').map((q) => q.trim()).filter(Boolean)
    : [];

  return {
    nameAndSlogan: sections.NAME_AND_SLOGAN || '',
    shortDescription: sections.SHORT_DESCRIPTION || '',
    longDescription: sections.LONG_DESCRIPTION || '',
    painPoints,
    targetAudiences,
    competitiveAdvantages,
    faqs: faqLines,
    seo: {
      slug: seoSlug || undefined,
      metaTitle,
      metaDescription,
      keywords,
      aiKnowledgeSummary: aiSummary,
      aiTargetQuestions,
      aiEntitySchemaType: 'Product',
      aiBotIndexingEnabled: true,
    },
  };
}

function normalizeRepeaterHelper(
  rawList: any,
  targetCount: number,
  prefix: string,
  defaultIcons: string[],
  fallbacks: Array<{ title: string; text: string }>
) {
  const arr = Array.isArray(rawList) ? rawList : [];
  return Array.from({ length: targetCount }, (_, idx) => {
    const item = arr[idx];
    const fb = fallbacks[idx % fallbacks.length];
    if (item && typeof item === 'object') {
      return {
        id: String(item.id || `${prefix}_${idx + 1}`),
        title: String(item.title || item.heading || fb.title).trim(),
        text: String(item.text || item.description || item.content || fb.text).trim(),
        icon: String(item.icon || defaultIcons[idx % defaultIcons.length]).trim(),
      };
    }
    if (typeof item === 'string' && item.trim()) {
      return {
        id: `${prefix}_${idx + 1}`,
        title: fb.title,
        text: item.trim(),
        icon: defaultIcons[idx % defaultIcons.length],
      };
    }
    return {
      id: `${prefix}_${idx + 1}`,
      title: fb.title,
      text: fb.text,
      icon: defaultIcons[idx % defaultIcons.length],
    };
  });
}

function normalizeFaqsHelper(
  rawFaqs: any,
  defaultFaqIcons: string[],
  defaultFaqFallbacks: Array<{ question: string; answer: string }>
) {
  const arr = Array.isArray(rawFaqs) ? rawFaqs : [];
  return Array.from({ length: 10 }, (_, idx) => {
    const item = arr[idx];
    const fb = defaultFaqFallbacks[idx % defaultFaqFallbacks.length];
    if (item && typeof item === 'object' && (item.question || item.q) && (item.answer || item.a)) {
      return {
        id: String(item.id || `faq_${idx + 1}`),
        question: String(item.question || item.q).trim(),
        answer: String(item.answer || item.a).trim(),
        icon: String(item.icon || defaultFaqIcons[idx % defaultFaqIcons.length]).trim(),
      };
    }
    return {
      id: `faq_${idx + 1}`,
      question: fb.question,
      answer: fb.answer,
      icon: defaultFaqIcons[idx % defaultFaqIcons.length],
    };
  });
}

/**
 * יצירת מוצר דגל מותאם למותג לפי החוזה המדויק של FlagshipProduct & FlagshipProductsEditor
 */
export async function generateAiFlagshipProduct(
  idea: string,
  brand: BrandDna,
  apiKey?: string
): Promise<{
  nameAndSlogan: string;
  shortDescription: string;
  longDescription: string;
  painPointSolved: string;
  targetAudience: string;
  competitiveAdvantage: string;
  painPoints: Array<{ id: string; title: string; text: string; icon?: string }>;
  targetAudiences: Array<{ id: string; title: string; text: string; icon?: string }>;
  competitiveAdvantages: Array<{ id: string; title: string; text: string; icon?: string }>;
  faqs: Array<{ id: string; question: string; answer: string; icon?: string }>;
  seo: {
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
    ogImage?: string;
    aiKnowledgeSummary?: string;
    aiTargetQuestions?: string[];
    aiEntitySchemaType?: 'Organization' | 'LocalBusiness' | 'Product' | 'Service' | 'Course' | 'FAQPage';
    aiBotIndexingEnabled?: boolean;
  };
} | null> {
  const activeKey = resolveGeminiApiKey(apiKey);
  const cleanIdea = (idea || brand.identity?.organizationPurpose || 'מוצר דגל מוביל').trim();
  const company = brand.identity?.companyName || 'המותג';
  const slogan = brand.identity?.slogan || '';
  const uvp = brand.audience?.mainUvp || brand.identity?.companyVision || '';

  const defaultPainFallbacks = [
    { title: 'חוסר בזמן ומשאבים', text: `עומס יומיומי וקושי לפנות זמן להתמקצעות ולהתפתחות עסקית בתחום ${cleanIdea}.` },
    { title: 'היעדר ליווי והכוונה', text: `תחושת בדידות בקבלת החלטות ללא גורם מקצועי שמלווה יד ביד מבית ${company}.` },
    { title: 'פיזור ואי-סדר במערכות', text: `עבודה עם כלים מרובים ולא מסונכרנים היוצרת בלבול ואיבוד הזדמנויות.` },
    { title: 'קושי בסגירת עסקאות', text: `פניות שמגיעות אך אינן מבשילות להכנסה עקב מחסור בתהליך מכירה מסודר.` },
    { title: 'שחיקה ועומס מנטלי', text: `צורך בעוגן יציב ומערכת אוטומטית שמעניקה שקט נפשי מלא לעסק.` },
    { title: 'חוסר ודאות לגבי צמיחה', text: `צורך בתוכנית ברורה ומוכחת שמביאה תוצאות מדידות ועקביות לאורך זמן.` },
  ];

  const defaultAudienceFallbacks = [
    { title: 'בעלי עסקים ועצמאיים', text: `המחפשים שקט נפשי, סדר וייעול משמעותי בפעילות השוטפת בתחום ${cleanIdea}.` },
    { title: 'מנהלי קהילות וארגונים', text: `המעוניינים לחזק את הקשר עם החברים ולנהל פעילות צומחת בקלות.` },
    { title: 'יזמים ומובילי דרך', text: `הרוצים להזניק מוצר או שירות לשוק במהירות ובסטנדרט הגבוה ביותר.` },
  ];

  const defaultAdvantageFallbacks = [
    { title: 'מעטפת מקצועית שלמה', text: `פתרון הוליסטי מקצה לקצה המשלב טכנולוגיה עילית עם ליווי אנושי של ${company}.` },
    { title: 'זמינות ויחס אישי', text: `מענה מהיר, אכפתי ומסור הרואה בכל אדם ולקוח נכס אמיתי.` },
    { title: 'טכנולוגיית AI מתקדמת', text: `אוטומציות חכמות החוסכות שעות עבודה שבועיות ומייצרות דיוק מקסימלי.` },
    { title: 'פשטות והטמעה מהירה', text: `מערכת אינטואיטיבית שניתן להתחיל לעבוד איתה מיד ללא עקומת למידה מסורבלת.` },
    { title: 'ביטחון ואחריות מלאה', text: `התחייבות בלתי מתפשרת לאיכות, שקיפות מלאה ושקט נפשי מתמשך.` },
    { title: 'קהילה ורשת קשרים', text: `חיבור למעגל לקוחות ועמיתים פורה התומך בהצלחה הדדית וצמיחה משותפת.` },
  ];

  const defaultFaqFallbacks = [
    { question: `מה כולל בדיוק המוצר "${cleanIdea}"?`, answer: `המוצר כולל מעטפת מלאה, כלים יישומיים וליווי צמוד של צוות ${company}.` },
    { question: `למי המוצר מתאים ביותר?`, answer: `התוכנית מותאמת אישית לכל עסק או יזם המעוניין לצמוח בצורה מסודרת ומקצועית.` },
    { question: `מהם לוחות הזמנים עד לקבלת תוצאות?`, answer: `ניתן לראות תוצאות והתקדמות משמעותית כבר בשבועות הראשונים לעבודה המשותפת.` },
    { question: `האם נדרש ידע טכני מוקדם?`, answer: `ממש לא! המערכת והתהליך נבנו במיוחד כך שיהיו נגישים, פשוטים ואינטואיטיביים לכל אחד.` },
    { question: `כיצד מתבצע תהליך הליווי?`, answer: `אנו מספקים ליווי היברידי המשלב הדרכות, מענה בוואטסאפ ופגישות עבודה אישיות.` },
    { question: `במה המוצר שונה מפתרונות אחרים בשוק?`, answer: uvp || `הבידול שלנו הוא שילוב נדיר בין טכנולוגיית AI מתקדמת ליחס אישי חם ומסור.` },
    { question: `האם קיימת אחריות על שביעות הרצון?`, answer: `כן, אנו עומדים ב-100% מאחורי איכות השירות ומחויבים להצלחה המשותפת שלך.` },
    { question: `מהן אפשרויות התשלום והתמחור?`, answer: `אנו מציעים מודל תשלום נוח וגמיש, כולל פריסת תשלומים בהתאמה אישית.` },
    { question: `האם ניתן לשדרג או להרחיב את החבילה בהמשך?`, answer: `בהחלט, המערכת מודולרית וצומחת יחד עם העסק לפי הצרכים המשתנים.` },
    { question: `איך מתחילים ויוצאים לדרך?`, answer: `משאירים פרטים כאן בעמוד ונציג מטעמנו יחזור אליכם לתיאום שיחת היכרות קצרה.` },
  ];

  if (!activeKey) {
    return null;
  }

  try {
    const rawRes = await dispatchFlagshipProductToKosai(cleanIdea, brand, { apiKey: activeKey });
    const res = parseDelimitedFlagshipText(rawRes, cleanIdea, company);

    if (res && typeof res === 'object') {
      const nameAndSlogan =
        res.nameAndSlogan ||
        (res.title && res.subtitle ? `${res.title} – ${res.subtitle}` : res.title) ||
        `${cleanIdea}${slogan ? ` – ${slogan}` : ''}`;

      const shortDescription =
        res.shortDescription ||
        res.subtitle ||
        res.description ||
        `מענה מקצועי, מעצים ומותאם אישית בתחום ${cleanIdea} מבית ${company}.`;

      const longDescription =
        res.longDescription ||
        res.description ||
        `ב-${company} פיתחנו את "${cleanIdea}" כדי להעניק מעטפת שלמה, איכותית ומעצימה לקהל שלנו. התוכנית משלבת מקצועיות ללא פשרות עם יחס אישי, חם ומסור, ונועדה לתת מענה אמיתי ומעמיק לצרכים היומיומיים שלך. ${uvp}`;

      const painPoints = normalizeRepeaterHelper(res.painPoints, 6, 'pain', DEFAULT_PAIN_ICONS, defaultPainFallbacks);
      const targetAudiences = normalizeRepeaterHelper(res.targetAudiences, 3, 'aud', DEFAULT_AUDIENCE_ICONS, defaultAudienceFallbacks);
      const competitiveAdvantages = normalizeRepeaterHelper(res.competitiveAdvantages, 6, 'adv', DEFAULT_ADVANTAGE_ICONS, defaultAdvantageFallbacks);
      const faqs = normalizeFaqsHelper(res.faqs, DEFAULT_FAQ_ICONS, defaultFaqFallbacks);

      const painPointSolved =
        res.painPointSolved ||
        painPoints.map((p) => `${p.title}: ${p.text}`).join(' | ');

      const targetAudience =
        res.targetAudience ||
        targetAudiences.map((a) => `${a.title}: ${a.text}`).join(' | ');

      const competitiveAdvantage =
        res.competitiveAdvantage ||
        competitiveAdvantages.map((c) => `${c.title}: ${c.text}`).join(' | ');

      const rawSeo = res.seo && typeof res.seo === 'object' ? res.seo : {};
      const seo = {
        slug: String(rawSeo.slug || '').trim() || undefined,
        metaTitle: String(rawSeo.metaTitle || `${nameAndSlogan} | ${company}`).trim(),
        metaDescription: String(rawSeo.metaDescription || shortDescription).trim().slice(0, 160),
        keywords: String(rawSeo.keywords || `${cleanIdea}, ${company}`).trim(),
        aiKnowledgeSummary: String(
          rawSeo.aiKnowledgeSummary ||
            `${nameAndSlogan} מבית ${company}: ${shortDescription} מעניק מענה ל-${targetAudiences.map((t) => t.title).join(', ')}.`
        ).trim(),
        aiTargetQuestions: Array.isArray(rawSeo.aiTargetQuestions) && rawSeo.aiTargetQuestions.length > 0
          ? rawSeo.aiTargetQuestions.map((q: any) => String(q).trim()).filter(Boolean)
          : faqs.slice(0, 5).map((f) => f.question),
        aiEntitySchemaType: (['Organization', 'LocalBusiness', 'Product', 'Service', 'Course', 'FAQPage'].includes(rawSeo.aiEntitySchemaType)
          ? rawSeo.aiEntitySchemaType
          : 'Service') as 'Organization' | 'LocalBusiness' | 'Product' | 'Service' | 'Course' | 'FAQPage',
        aiBotIndexingEnabled: rawSeo.aiBotIndexingEnabled !== false,
      };

      return {
        nameAndSlogan: String(nameAndSlogan).trim(),
        shortDescription: String(shortDescription).trim(),
        longDescription: String(longDescription).trim(),
        painPointSolved: String(painPointSolved).trim(),
        targetAudience: String(targetAudience).trim(),
        competitiveAdvantage: String(competitiveAdvantage).trim(),
        painPoints,
        targetAudiences,
        competitiveAdvantages,
        faqs,
        seo,
      };
    }
  } catch (err) {
    console.warn('[brandCopilotService] generateAiFlagshipProduct live AI fallback:', err);
  }

  const fallbackPainPoints = normalizeRepeaterHelper([], 6, 'pain', DEFAULT_PAIN_ICONS, defaultPainFallbacks);
  const fallbackTargetAudiences = normalizeRepeaterHelper([], 3, 'aud', DEFAULT_AUDIENCE_ICONS, defaultAudienceFallbacks);
  const fallbackAdvantages = normalizeRepeaterHelper([], 6, 'adv', DEFAULT_ADVANTAGE_ICONS, defaultAdvantageFallbacks);
  const fallbackFaqs = normalizeFaqsHelper([], DEFAULT_FAQ_ICONS, defaultFaqFallbacks);

  return {
    nameAndSlogan: `${cleanIdea} – ${slogan || `המענה המוביל מבית ${company}`}`,
    shortDescription: `מעטפת מקצועית, חמה ומותאמת אישית עבור ${cleanIdea} מבית ${company}.`,
    longDescription: `מוצר הדגל "${cleanIdea}" מבית ${company} נבנה מתוך היכרות עמוקה עם הצרכים של הקהילה וקהל היעד שלנו. אנו מעניקים שילוב נדיר של איכות מוקפדת, ליווי אישי בגובה העיניים ומענה שלם שמייצר שקט נפשי, חיבור אמיתי ותוצאות משמעותיות לאורך זמן.`,
    painPointSolved: fallbackPainPoints.map((p) => `${p.title}: ${p.text}`).join(' | '),
    targetAudience: fallbackTargetAudiences.map((a) => `${a.title}: ${a.text}`).join(' | '),
    competitiveAdvantage: fallbackAdvantages.map((c) => `${c.title}: ${c.text}`).join(' | '),
    painPoints: fallbackPainPoints,
    targetAudiences: fallbackTargetAudiences,
    competitiveAdvantages: fallbackAdvantages,
    faqs: fallbackFaqs,
    seo: {
      metaTitle: `${cleanIdea} | ${company}`,
      metaDescription: `מעטפת מקצועית, חמה ומותאמת אישית עבור ${cleanIdea} מבית ${company}.`,
      keywords: `${cleanIdea}, ${company}`,
      aiKnowledgeSummary: `${cleanIdea} מבית ${company} מעניק מענה שלם ומקצועי לקהל היעד של הארגון.`,
      aiTargetQuestions: fallbackFaqs.slice(0, 5).map((f) => f.question),
      aiEntitySchemaType: 'Product',
      aiBotIndexingEnabled: true,
    },
  };
}

/**
 * יצירת שירות מרכזי מותאם למותג (CoreService) לפי החוזה המדויק של CoreServicesEditor
 * מפיק 6 נקודות כאב, 3 קהלי יעד, 6 יתרונות, 10 שאלות ותשובות ונתוני SEO/AIO בפורמט טקסט מובנה חסכוני
 */
export async function generateAiCoreService(
  idea: string,
  brand: BrandDna,
  apiKey?: string
): Promise<{
  nameAndSlogan: string;
  shortDescription: string;
  longDescription: string;
  painPointSolved: string;
  targetAudience: string;
  competitiveAdvantage: string;
  painPoints: Array<{ id: string; title: string; text: string; icon?: string }>;
  targetAudiences: Array<{ id: string; title: string; text: string; icon?: string }>;
  competitiveAdvantages: Array<{ id: string; title: string; text: string; icon?: string }>;
  faqs: Array<{ id: string; question: string; answer: string; icon?: string }>;
  seo: {
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
    ogImage?: string;
    aiKnowledgeSummary?: string;
    aiTargetQuestions?: string[];
    aiEntitySchemaType?: 'Organization' | 'LocalBusiness' | 'Product' | 'Service' | 'Course' | 'FAQPage';
    aiBotIndexingEnabled?: boolean;
  };
} | null> {
  const activeKey = resolveGeminiApiKey(apiKey);
  const cleanIdea = (idea || brand.identity?.organizationPurpose || 'שירות מקצועי מוביל').trim();
  const company = brand.identity?.companyName || 'הארגון';
  const slogan = brand.identity?.slogan || '';
  const uvp = brand.audience?.mainUvp || brand.identity?.companyVision || '';

  const defaultPainFallbacks = [
    { title: 'קושי במציאת מענה מקצועי ואמין', text: `התמודדות עם פתרונות חלקיים וחוסר שקט נפשי בכל הנוגע ל-${cleanIdea}.` },
    { title: 'בזבוז זמן יקר ומאמצים מיותרים', text: `ניסיונות חוזרים להסתדר לבד ללא ליווי מומחה מבית ${company}.` },
    { title: 'עלויות נסתרות והיעדר שקיפות', text: `חוסר בהירות לגבי התוצאות הסופיות וחשש מהוצאות בלתי צפויות בשוק.` },
    { title: 'עומס מנטלי וחוסר ודאות', text: `צורך בעוגן מקצועי יציב שיודע להוביל את התהליך בביטחון וברוגע מלא.` },
    { title: 'שירות מנוכר וללא מענה אישי', text: `תחושת אכזבה מנותני שירות שאינם קשובים באמת לצרכים הייחודיים של הלקוח.` },
    { title: 'פער בין הבטחות למציאות', text: `צורך בתוצאות מוכחות בשטח ובמעטפת שלמה שמעניקה ביטחון מקצה לקצה.` },
  ];

  const defaultAudienceFallbacks = [
    { title: 'לקוחות פרטיים ומשפחות', text: `המחפשים מענה אישי, מסור ואיכותי בתחום ${cleanIdea} עם ליווי מקצועי מלא.` },
    { title: 'בעלי עסקים ומנהלים', text: `הרוצים לייעל תהליכים, לחסוך זמן ולקבל תוצאות מדויקות ושקט נפשי מתמיד.` },
    { title: 'קהילות ומוסדות', text: `הזקוקים לפתרון הוליסטי מקיף המשלב ידע מעמיק, סטנדרט ביצוע גבוה ויחס חם.` },
  ];

  const defaultAdvantageFallbacks = [
    { title: 'ליווי אישי מקצה לקצה', text: `מענה אנושי ומסור הרואה בכם שותפים אמיתיים מבית ${company}.` },
    { title: 'מקצועיות וניסיון מוכח', text: `ידע מעמיק, שיטות עבודה מתקדמות ומחויבות בלתי מתפשרת להצלחה.` },
    { title: 'טכנולוגיה מתקדמת ודיוק', text: `שימוש בכלי AI ואוטומציות מתקדמות המבטיחים מהירות, דיוק ואיכות עילאית.` },
    { title: 'שקיפות מלאה ושקט נפשי', text: `הסבר ברור על כל שלב בתהליך, ללא אותיות קטנות או הפתעות.` },
    { title: 'זמינות ומענה מהיר', text: `ערוצי תקשורת פתוחים וישירים בוואטסאפ ובטלפון לכל שאלה ועניין.` },
    { title: 'התאמה אישית מלאה', text: `שירות שנתפר בדיוק לפי המידות והמטרות הספציפיות שלכם.` },
  ];

  const defaultFaqFallbacks = [
    { question: `מה כולל בדיוק שירות "${cleanIdea}"?`, answer: `השירות כולל מעטפת מלאה, אבחון הצרכים וליווי צמוד של צוות ${company}.` },
    { question: `למי השירות מתאים ביותר?`, answer: `השירות מותאם אישית לכל מי שמחפש פתרון אמין, איכותי ושקט נפשי מלא.` },
    { question: `מהם שלבי העבודה וההתקדמות?`, answer: `אנו מתחילים בשיחת היכרות ואפיון, מגדירים יעדים ויוצאים לדרך צעד אחר צעד.` },
    { question: `כמה זמן אורך התהליך?`, answer: `לוחות הזמנים מותאמים לצרכים שלכם, תוך שמירה על יעילות ומהירות מקסימלית.` },
    { question: `האם נדרשת הכנה מוקדמת מצידי?`, answer: `לא, אנו מנחים אתכם בכל פרט ומספקים מענה שלם ומודרך לכל אורך הדרך.` },
    { question: `במה השירות שונה מפתרונות אחרים?`, answer: uvp || `הייחוד שלנו הוא שילוב נדיר בין טכנולוגיה חדשנית ליחס אישי חם ומסור.` },
    { question: `כיצד ניתן ליצור קשר במהלך השירות?`, answer: `אנו זמינים בוואטסאפ, במייל ובטלפון למענה מהיר ורציף.` },
    { question: `מהם תנאי התשלום והאפשרויות הקיימות?`, answer: `אנו מציעים מגוון מסלולים גמישים ונוחים בהתאמה לצרכים שלכם.` },
    { question: `האם קיימת אחריות על שביעות הרצון?`, answer: `כן, אנו מחויבים ב-100% לאיכות השירות ולהצלחה המשותפת שלכם.` },
    { question: `איך עושים את הצעד הראשון?`, answer: `משאירים פרטים בטופס ונציג מטעמנו יחזור אליכם לתיאום שיחת ייעוץ קצרה.` },
  ];

  if (!activeKey) {
    return null;
  }

  try {
    const rawRes = await dispatchCoreServiceToKosai(cleanIdea, brand, { apiKey: activeKey });
    const res = parseDelimitedFlagshipText(rawRes, cleanIdea, company);

    if (res && typeof res === 'object') {
      const nameAndSlogan =
        res.nameAndSlogan ||
        (res.title && res.subtitle ? `${res.title} – ${res.subtitle}` : res.title) ||
        `${cleanIdea}${slogan ? ` – ${slogan}` : ''}`;

      const shortDescription =
        res.shortDescription ||
        res.subtitle ||
        res.description ||
        `מענה מקצועי, מעצים ומותאם אישית בתחום ${cleanIdea} מבית ${company}.`;

      const longDescription =
        res.longDescription ||
        res.description ||
        `ב-${company} פיתחנו את שירות "${cleanIdea}" כדי להעניק מעטפת שלמה, איכותית ומעצימה ללקוחותינו. השירות משלב מקצועיות ללא פשרות עם יחס אישי, חם ומסור, ונועד לתת מענה אמיתי ומעמיק לצרכים שלכם. ${uvp}`;

      const painPoints = normalizeRepeaterHelper(res.painPoints, 6, 'pain', DEFAULT_PAIN_ICONS, defaultPainFallbacks);
      const targetAudiences = normalizeRepeaterHelper(res.targetAudiences, 3, 'aud', DEFAULT_AUDIENCE_ICONS, defaultAudienceFallbacks);
      const competitiveAdvantages = normalizeRepeaterHelper(res.competitiveAdvantages, 6, 'adv', DEFAULT_ADVANTAGE_ICONS, defaultAdvantageFallbacks);
      const faqs = normalizeFaqsHelper(res.faqs, DEFAULT_FAQ_ICONS, defaultFaqFallbacks);

      const painPointSolved =
        res.painPointSolved ||
        painPoints.map((p) => `${p.title}: ${p.text}`).join(' | ');

      const targetAudience =
        res.targetAudience ||
        targetAudiences.map((a) => `${a.title}: ${a.text}`).join(' | ');

      const competitiveAdvantage =
        res.competitiveAdvantage ||
        competitiveAdvantages.map((c) => `${c.title}: ${c.text}`).join(' | ');

      const rawSeo = res.seo && typeof res.seo === 'object' ? res.seo : {};
      const seo = {
        slug: String(rawSeo.slug || '').trim() || undefined,
        metaTitle: String(rawSeo.metaTitle || `${nameAndSlogan} | ${company}`).trim(),
        metaDescription: String(rawSeo.metaDescription || shortDescription).trim().slice(0, 160),
        keywords: String(rawSeo.keywords || `${cleanIdea}, ${company}`).trim(),
        aiKnowledgeSummary: String(
          rawSeo.aiKnowledgeSummary ||
            `${nameAndSlogan} מבית ${company}: ${shortDescription} מעניק מענה ל-${targetAudiences.map((t) => t.title).join(', ')}.`
        ).trim(),
        aiTargetQuestions: Array.isArray(rawSeo.aiTargetQuestions) && rawSeo.aiTargetQuestions.length > 0
          ? rawSeo.aiTargetQuestions.map((q: any) => String(q).trim()).filter(Boolean)
          : faqs.slice(0, 5).map((f) => f.question),
        aiEntitySchemaType: 'Service' as const,
        aiBotIndexingEnabled: rawSeo.aiBotIndexingEnabled !== false,
      };

      return {
        nameAndSlogan: String(nameAndSlogan).trim(),
        shortDescription: String(shortDescription).trim(),
        longDescription: String(longDescription).trim(),
        painPointSolved: String(painPointSolved).trim(),
        targetAudience: String(targetAudience).trim(),
        competitiveAdvantage: String(competitiveAdvantage).trim(),
        painPoints,
        targetAudiences,
        competitiveAdvantages,
        faqs,
        seo,
      };
    }
  } catch (err) {
    console.warn('[brandCopilotService] generateAiCoreService live AI fallback:', err);
  }

  const fallbackPainPoints = normalizeRepeaterHelper([], 6, 'pain', DEFAULT_PAIN_ICONS, defaultPainFallbacks);
  const fallbackTargetAudiences = normalizeRepeaterHelper([], 3, 'aud', DEFAULT_AUDIENCE_ICONS, defaultAudienceFallbacks);
  const fallbackAdvantages = normalizeRepeaterHelper([], 6, 'adv', DEFAULT_ADVANTAGE_ICONS, defaultAdvantageFallbacks);
  const fallbackFaqs = normalizeFaqsHelper([], DEFAULT_FAQ_ICONS, defaultFaqFallbacks);

  return {
    nameAndSlogan: `${cleanIdea} – ${slogan || `השירות המוביל מבית ${company}`}`,
    shortDescription: `מעטפת שירות מקצועית, חמה ומותאמת אישית עבור ${cleanIdea} מבית ${company}.`,
    longDescription: `שירות "${cleanIdea}" מבית ${company} נבנה מתוך היכרות עמוקה עם הצרכים של לקוחותינו. אנו מעניקים שילוב נדיר של איכות מוקפדת, ליווי אישי בגובה העיניים ומענה שלם שמייצר שקט נפשי, חיבור אמיתי ותוצאות משמעותיות לאורך זמן.`,
    painPointSolved: fallbackPainPoints.map((p) => `${p.title}: ${p.text}`).join(' | '),
    targetAudience: fallbackTargetAudiences.map((a) => `${a.title}: ${a.text}`).join(' | '),
    competitiveAdvantage: fallbackAdvantages.map((c) => `${c.title}: ${c.text}`).join(' | '),
    painPoints: fallbackPainPoints,
    targetAudiences: fallbackTargetAudiences,
    competitiveAdvantages: fallbackAdvantages,
    faqs: fallbackFaqs,
    seo: {
      metaTitle: `${cleanIdea} | ${company}`,
      metaDescription: `מעטפת מקצועית, חמה ומותאמת אישית עבור ${cleanIdea} מבית ${company}.`,
      keywords: `${cleanIdea}, ${company}`,
      aiKnowledgeSummary: `${cleanIdea} מבית ${company} מעניק מענה שלם ומקצועי ללקוחות הארגון.`,
      aiTargetQuestions: fallbackFaqs.slice(0, 5).map((f) => f.question),
      aiEntitySchemaType: 'Service',
      aiBotIndexingEnabled: true,
    },
  };
}

/**
 * יצירת חבילות עסקיות מומלצות לפי החוזה של BrandEcosystemSection
 */
export async function generateAiBusinessPackages(brand: BrandDna, apiKey?: string): Promise<any[]> {
  const activeKey = resolveGeminiApiKey(apiKey);
  const company = brand.identity?.companyName || 'המותג';
  const defaultAudience = brand.audience?.targetAudiences?.[0] || 'לקוחות המחפשים פתרון מקיף';

  try {
    const res = await dispatchBusinessPackagesToKosai(brand, { apiKey: activeKey });
    const list = Array.isArray(res) ? res : Array.isArray(res?.packages) ? res.packages : [];
    if (list.length > 0) {
      return list.map((pkg: any, idx: number) => ({
        name: pkg.name || `חבילת פתרון ${idx + 1}`,
        description: pkg.description || (Array.isArray(pkg.features) ? pkg.features.join(', ') : `חבילת שירות מקיפה מבית ${company}`),
        painPointsAddressed: pkg.painPointsAddressed || 'חיסכון בזמן, סדר ארגוני ומענה מקצועי שלם',
        competitiveAdvantage: pkg.competitiveAdvantage || brand.audience?.mainUvp || `ליווי אישי ומעטפת מלאה של ${company}`,
        targetAudience: pkg.targetAudience || defaultAudience,
        callToAction: pkg.callToAction || 'לתיאום שיחת התאמה ללא התחייבות',
      }));
    }
  } catch (err) {
    console.warn('[brandCopilotService] generateAiBusinessPackages fallback:', err);
  }

  return [
    {
      name: `חבילת יסוד והיכרות – ${company}`,
      description: 'מעטפת ראשונית ממוקדת המעניקה כניסה חלקה, אבחון מדויק ומענה מיידי לצרכים המרכזיים.',
      painPointsAddressed: 'חוסר ודאות ראשוני וצורך בפתרון ממוקד, נגיש וברור.',
      competitiveAdvantage: `יחס אישי וליווי צמוד מצוות ${company} כבר מהצעד הראשון.`,
      targetAudience: defaultAudience,
      callToAction: 'התחילו עכשיו בשיחת היכרות קצרה',
    },
    {
      name: `חבילת צמיחה וליווי מלא – ${company}`,
      description: 'המסלול המרכזי והמומלץ הכולל ליווי שוטף, כלים יישומיים ומעטפת תמיכה מלאה לאורך כל הדרך.',
      painPointsAddressed: 'עומס מתמשך וצורך בעוגן קבוע המייצר התקדמות עקבית ושקט נפשי.',
      competitiveAdvantage: brand.audience?.mainUvp || `שילוב מנצח של מקצועיות, זמינות וקהילה תומכת ב-${company}.`,
      targetAudience: defaultAudience,
      callToAction: 'הצטרפו למסלול המוביל שלנו',
    },
    {
      name: `מעטפת VIP אישית – ${company}`,
      description: 'תוכנית פרימיום בהתאמה אישית מלאה (1-על-1) עם זמינות מרבית ופתרון מקצה לקצה.',
      painPointsAddressed: 'צורך בפתרון ייחודי המותאם אישית ללא פשרות ובליווי צמוד.',
      competitiveAdvantage: `גישה ישירה וליווי אישי צמוד של מומחי ${company}.`,
      targetAudience: defaultAudience,
      callToAction: 'תיאום פגישת VIP אישית',
    },
  ];
}

/**
 * יצירת פריטי אקו-סיסטם (שירותים, אירועים, קהילות)
 */
export async function generateAiEcosystemItems(
  brand: BrandDna,
  category: string,
  currentItems: string[],
  apiKey?: string
): Promise<string[]> {
  const activeKey = resolveGeminiApiKey(apiKey);
  try {
    const res = await dispatchEcosystemItemsToKosai(brand, category, currentItems, { apiKey: activeKey });
    if (Array.isArray(res) && res.length > 0) return res.map(String);
    if (res && Array.isArray(res.items) && res.items.length > 0) return res.items.map(String);
  } catch (err) {
    console.warn('[brandCopilotService] generateAiEcosystemItems fallback:', err);
  }

  return ['ליווי וייעוץ אישי מותאם', 'סדנאות ומפגשי העשרה', 'קהילת תוכן וחיבורים'];
}

/**
 * הרצת סוכן חקר שוק ומתחרים לפי החוזה של MarketResearchAgentSection
 */
export async function runMarketResearchAgent(brand: BrandDna, apiKey?: string): Promise<any> {
  const activeKey = resolveGeminiApiKey(apiKey);
  const company = brand.identity?.companyName || 'המותג';

  try {
    const res = await dispatchMarketResearchToKosai(brand, { apiKey: activeKey });
    if (res && typeof res === 'object' && Array.isArray(res.marketTrends)) {
      return {
        marketTrends: res.marketTrends,
        competitors: Array.isArray(res.competitors) ? res.competitors : [],
        competitiveness: res.competitiveness || res.recommendedAction || '',
        pricingRecommendations: res.pricingRecommendations || 'מומלץ להציע מודל מדורג המשלב מסלול כניסה נגיש לצד חבילת ליווי מלאה.',
        designLanguageRecommendations: res.designLanguageRecommendations || 'מומלץ לשמור על שפה ויזואלית נקייה, חמה ומזמינה המשדרת אמון וביטחון.',
        actionableUpdates: res.actionableUpdates || {
          slogan: brand.identity?.slogan || '',
          primaryColor: brand.designTokens?.primaryColor || '#6366f1',
          newService: '',
        },
      };
    }
  } catch (err) {
    console.warn('[brandCopilotService] runMarketResearchAgent fallback:', err);
  }

  return {
    marketTrends: [
      'עלייה בביקוש למענה אישי וקהילתי המשלב תוכן איכותי וליווי אנושי',
      'מעבר לחוויות דיגיטליות נגישות, מהירות ומותאמות אישית במובייל',
      'חשיבות גוברת לאמון, שקיפות וחיבור ערכי למותג',
    ],
    competitors: [
      {
        name: 'גופים מסורתיים בתחום',
        strengths: 'ותק והיכרות ראשונית בשוק',
        weaknesses: 'חוסר בגמישות, דיגיטציה איטית ופחות יחס אישי מותאם',
        pricingTier: 'בינוני - גבוה',
      },
      {
        name: 'פתרונות דיגיטליים כלליים',
        strengths: 'זמינות מהירה ברשת',
        weaknesses: 'היעדר ליווי אנושי חם, קהילה תומכת והתאמה ערכית עמוקה',
        pricingTier: 'נמוך - בינוני',
      },
    ],
    competitiveness: `היתרון הבולט של ${company} טמון בשילוב שבין עומק ומקצועיות לבין יחס אישי חם וקהילה עוטפת.`,
    pricingRecommendations: 'מומלץ לבנות תמחור מדורג המאפשר כניסה קלה ונגישה לצד תוכניות דגל מעמיקות בעלות ערך מוסף גבוה.',
    designLanguageRecommendations: 'שימוש בצבעוניות הרמונית וחמה, טיפוגרפיה ברורה וקריאה, והדגשת אלמנטים של קהילה ואמון.',
    actionableUpdates: {
      slogan: brand.identity?.slogan || `${company} – הבית שלך לצמיחה ומשמעות`,
      primaryColor: brand.designTokens?.primaryColor || '#6366f1',
      newService: 'תוכנית ליווי וקהילה היברידית מותאמת אישית',
    },
  };
}

/**
 * סריקת מותג מתוך אתר או קישור
 */
export async function scrapeBrandFromUrlOrSocial(
  targetUrl: string,
  apiKey?: string
): Promise<{
  success: boolean;
  extractedBrand?: Partial<BrandDna>;
  positioningQuestions?: string[];
  summary?: string;
  error?: string;
}> {
  const activeKey = resolveGeminiApiKey(apiKey);
  if (!targetUrl || !targetUrl.trim()) {
    return { success: false, error: 'יש להזין כתובת אתר או קישור לפייסבוק' };
  }

  const cleanUrl = targetUrl.trim();
  const domainGuess = cleanUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split(/[\/?#]/)[0];

  const prompt = `אתה מומחה חילוץ מותג וסורק תוכן דיגיטלי.
קיבלת קישור לאתר אינטרנט או עמוד פייסבוק עסקי:
כתובת URL: "${cleanUrl}"

אנא נתח את מהות העסק המיוצגת בקישור זה, את תחום הפעילות וההקשר העסקי, וחלץ:
1. נתוני Brand DNA משוערכים (שם, תכלית, סלוגן, חזון, טון דיבור, מילות כוח, קהלי יעד, והצעת ערך ייחודית UVP).
2. 3 שאלות מיצוב חדות וממוקדות שיעזרו לבעל העסק לחדד את המיתוג שלו במערכת.
3. סיכום תמציתי של מהות המותג שזוהתה.

החזר אך ורק אובייקט JSON תקין ללא שום טקסט מסביב:
{
  "summary": "סיכום תמציתי של מהות המותג",
  "positioningQuestions": [
    "שאלה 1 לחידוד המיצוב",
    "שאלה 2 לחידוד המיצוב",
    "שאלה 3 לחידוד המיצוב"
  ],
  "extractedBrand": {
    "identity": {
      "companyName": "שם המותג",
      "organizationType": "חברה",
      "organizationPurpose": "תכלית ותחום עיסוק",
      "memberCount": "עד 10",
      "slogan": "סלוגן קליט",
      "companyVision": "חזון מותג",
      "shortVision": "תמצית חזון במשפט אחד"
    },
    "voice": {
      "personality": { "formality": 3, "warmth": 4, "luxury": 3, "energy": 4 },
      "genderAddressing": "plural",
      "sectorCompliance": "general",
      "powerWords": ["מובילות", "איכות", "שירות", "ביטחון"],
      "forbiddenWords": ["חובבני"]
    },
    "audience": {
      "mainUvp": "הצעת הערך הייחודית",
      "targetAudiences": ["קהל 1", "קהל 2"]
    }
  }
}`;

  try {
    const parsed = await dispatchEntityItemToKosai(prompt, { apiKey: activeKey });
    if (parsed && typeof parsed === 'object') {
      return {
        success: true,
        summary: parsed.summary || `נותח בהצלחה: ${domainGuess}`,
        extractedBrand: parsed.extractedBrand || parsed,
        positioningQuestions: Array.isArray(parsed.positioningQuestions) ? parsed.positioningQuestions : [
          'מה היתרון המרכזי ביותר שמבדיל אתכם ממתחרים אחרים ברשת?',
          'האם האתר פונה לקהל עסקי (B2B) או לצרכנים פרטיים (B2C)?',
          'מהו המוצר או השירות הרווחי ביותר שתרצו להציב בפרונט של המותג?'
        ],
      };
    }
  } catch (err) {
    console.warn('[brandCopilotService] scrapeBrandFromUrlOrSocial live AI fallback:', err);
  }

  // 0-token intelligent fallback
  return {
    success: true,
    summary: `נותח על בסיס הכתובת: ${domainGuess}`,
    extractedBrand: {
      identity: {
        companyName: domainGuess.split('.')[0].toUpperCase(),
        organizationPurpose: `שירותים מקצועיים ופתרונות מקיפים מתוך ${cleanUrl}`,
        slogan: 'איכות, מקצועיות ושירות ללא פשרות',
        companyVision: 'להיות הכתובת המובילה בתחום תוך מתן ערך מרבי לכל לקוח.',
        shortVision: 'שירות מתקדם המותאם אישית לצרכים שלך.',
        organizationType: 'חברה',
        memberCount: 'עד 10',
        logoUrl: '',
      },
      voice: {
        personality: { formality: 3, warmth: 4, luxury: 3, energy: 4 },
        genderAddressing: 'plural',
        sectorCompliance: 'general',
        shabbatObservant: false,
        powerWords: ['איכות', 'מובילות', 'ביטחון', 'מקצועיות', 'תוצאות'],
        forbiddenWords: ['חובבני', 'זול', 'אולי'],
      },
      audience: {
        mainUvp: 'מענה מקיף ומקצועי המשלב ידע מעמיק ושירות אישי.',
        targetAudiences: ['לקוחות פרטיים', 'עסקים וחברות', 'מקבלי החלטות'],
        personas: [],
        commonObjections: [
          { id: 'o-1', objection: 'האם השירות מתאים בדיוק עבורי?', rebuttal: 'אנו מתאימים את המעטפת באופן אישי ומדויק לכל צורך.' }
        ],
      },
    },
    positioningQuestions: [
      'מה היתרון המרכזי ביותר שמבדיל אתכם ממתחרים אחרים ברשת?',
      'האם האתר פונה לקהל עסקי (B2B) או לצרכנים פרטיים (B2C)?',
      'מהו המוצר או השירות הרווחי ביותר שתרצו להציב בפרונט של המותג?',
    ],
  };
}

/**
 * הצעות ברירת מחדל חכמות באפס טוקנים עבור כל שלב
 */
export function generateSmartFallbackSuggestions(
  stepId: string,
  brand: BrandDna,
  userDraft?: string
): StepAiAssistanceResult {
  const company = brand.identity.companyName?.trim() || userDraft?.trim() || 'העסק שלך';
  const purpose = brand.identity.organizationPurpose?.trim() || 'מתן שירותים ופתרונות מקצועיים';

  switch (stepId) {
    case 'step_identity_name':
      return {
        success: true,
        recommendedIndex: 0,
        recommendationReason: `על בסיס התחום "${purpose}", שם מקצועי וממוקד סמכות יוצר אמון מיידי במפגש הראשון עם הלקוח.`,
        smartInsight: 'שם מותג מדויק חוסך אלפי שקלים בהסברים שיווקיים ומעביר מסר ברור.',
        suggestions: [
          {
            title: 'סמכותי ומוביל',
            value: company,
            subtitle: 'פנייה ישירה המבטאת מובילות ומקצוענות',
            rationale: 'יוצר נוכחות חזקה וביטחון בקרב מקבלי החלטות',
            isRecommended: true,
          },
          {
            title: 'חדשני ודיגיטלי',
            value: `${company} טק`,
            subtitle: 'שילוב ניחוח טכנולוגי ומתקדם',
            rationale: 'מתאים במיוחד לעסקים המציעים שירותים אוטומטיים ופתרונות ענן',
            isRecommended: false,
          },
          {
            title: 'אישי וערכי',
            value: `${company} פלוס`,
            subtitle: 'הדגשת היחס האישי והערך המוסף',
            rationale: 'מחבר רגשית לקוחות המחפשים שותף אמין לטווח ארוך',
            isRecommended: false,
          },
        ],
      };

    case 'step_identity_purpose':
      return {
        success: true,
        recommendedIndex: 1,
        recommendationReason: `עבור המותג "${company}", ניסוח תכלית המשלב תוצאה עסקית לצד ליווי אישי מניב את יחס ההמרה הגבוה ביותר.`,
        smartInsight: 'תכלית ברורה מונעת בלבול ומאפשרת ללקוח להבין תוך 3 שניות מה הוא מקבל.',
        suggestions: [
          {
            title: 'ממוקד תוצאות ומקצועיות',
            value: `מתן פתרונות מקיפים ומתקדמים בתחום ${purpose}, המבטיחים מקצועיות ללא פשרות ותוצאות מוכחות.`,
            subtitle: 'דגש על איכות ביצוע ואמינות טכנית',
            rationale: 'משדר יציבות ורמת שירות גבוהה',
            isRecommended: false,
          },
          {
            title: 'מוכוון צמיחה ושקט נפשי',
            value: `הענקת מעטפת ליווי הוליסטית בתחום ${purpose}, המשלבת חדשנות, חיסכון בזמן ושקט נפשי מלא לעסק.`,
            subtitle: 'שילוב בין תועלת מעשית לביטחון רגשי',
            rationale: 'מבדל אותך כשותף אסטרטגי ולא רק כספק שירות',
            isRecommended: true,
          },
          {
            title: 'מהיר, נגיש ודיגיטלי',
            value: `הנגשת שירותי ${purpose} מתקדמים בקלות, במהירות ובמחירים שקופים המתאימים לכל עסק.`,
            subtitle: 'דגש על פשטות, מהירות ושקיפות',
            rationale: 'פונה ללקוחות המחפשים יעילות ומענה מהיר',
            isRecommended: false,
          },
        ],
      };

    default:
      return {
        success: true,
        recommendedIndex: 0,
        recommendationReason: 'הצעה זו מותאמת באופן מדויק על בסיס נתוני המותג הקיימים.',
        smartInsight: 'דיוק המסרים יוצר אחידות ועוצמה בכל נקודות המפגש עם הלקוח.',
        suggestions: [
          {
            title: 'הכיוון המוביל',
            value: company,
            subtitle: 'התאמה מלאה לפרופיל העסק',
            rationale: 'מחזק את הבידול והסמכות בשוק',
            isRecommended: true,
          },
          {
            title: 'כיוון אלטרנטיבי',
            value: `${company} - איכות ללא פשרות`,
            subtitle: 'דגש על אמינות ושירות',
            rationale: 'מתאים לקהל מסורתי המחפש ביטחון',
            isRecommended: false,
          },
        ],
      };
  }
}
