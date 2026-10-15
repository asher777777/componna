import { BrandDna, AiTextAssistantContract } from '../../../core/contracts';
import { dispatchSeoMetadataToKosai } from '../kosai/promptToKosai';

export interface GoogleSeoAuditResult {
  title: string;
  description: string;
  keywords: string[];
  author: string;
  faviconUrl?: string;
  ogType: 'website' | 'article' | 'business.business';
  twitterCard: 'summary_large_image';
  googleAuditScore: number;
  googleAuditRecommendations: string[];
  aiKnowledgeSummary?: string;
  aiTargetQuestions?: string[];
  aiEntitySchemaType?: 'Organization' | 'ProfessionalService' | 'Product' | 'FAQPage' | 'Article';
  aiBotIndexingEnabled?: boolean;
}

export interface GoogleSeoAuditResponse {
  success: boolean;
  data: GoogleSeoAuditResult;
  error?: string;
  isFallback: boolean;
}

/**
 * Generates Google-Compliant SEO Metadata & AI Engine Optimization (GEO/AIO) based on:
 * - Google Search Quality Evaluator Criteria (E-E-A-T)
 * - Generative Engine Optimization (ChatGPT, Perplexity, Gemini, Claude citations)
 * - Schema.org Knowledge Graph structured definitions
 * Connects directly through the KOSAI parent AI module (kosai-engine) when available,
 * and adheres to KOSUN26 rules by explicitly informing the user when AI is unavailable.
 */
export async function generateGoogleCompliantSeo(params: {
  pageTitle: string;
  brandDna?: BrandDna | null;
  pageSections?: any[];
  currentSeo?: any;
  apiKey?: string;
  aiAssistant?: AiTextAssistantContract | null;
}): Promise<GoogleSeoAuditResponse> {
  const { pageTitle, brandDna, pageSections, currentSeo, apiKey, aiAssistant } = params;
  const company = brandDna?.identity?.companyName || 'קושאן';
  const slogan = brandDna?.identity?.slogan || 'כל אדם זה נכס';
  const topics = (pageSections || []).map((s: any) => s.title || s.type).filter(Boolean).slice(0, 5).join(', ');

  const prompt = `You are a World-Class Google Technical SEO & Generative Engine Optimization (GEO/AIO) Expert.
Analyze the website page and generate optimal Hebrew SEO & AI-bot citation metadata:
- Page Subject: "${pageTitle}"
- Brand / Company: "${company}"
- Slogan: "${slogan}"
- Topics: ${topics || 'דף אינטרנט עסקי ושיווקי'}

Strict Google SEO & AI Engine Optimization Criteria:
1. Meta Title: 50 to 60 characters long. Front-load primary high-intent keywords. Conclude with "| ${company}". No clickbait.
2. Meta Description: 140 to 160 characters long. Active value proposition, clear CTA (e.g. "היכנסו עכשיו", "גלו עוד").
3. Keywords: 6-10 focused, localized, high-intent Hebrew keywords.
4. Google SEO Audit: Score out of 100 and provide 3 actionable recommendations for ranking on Google.
5. AI Knowledge Summary (GEO/AIO): A crisp 2-3 sentence factual knowledge definition optimized for LLMs (ChatGPT, Gemini, Perplexity) to cite when answering user prompts.
6. AI Target Questions: 3-4 natural prompt questions in Hebrew that users ask AI assistants, where this page is the definitive answer.
7. AI Entity Schema Type: One of: "ProfessionalService", "Organization", "Product", "FAQPage".

Respond ONLY with valid JSON in this exact structure:
{
  "title": "...",
  "description": "...",
  "keywords": ["...", "..."],
  "author": "${company}",
  "ogType": "website",
  "twitterCard": "summary_large_image",
  "googleAuditScore": 96,
  "googleAuditRecommendations": [
    "...",
    "...",
    "..."
  ],
  "aiKnowledgeSummary": "...",
  "aiTargetQuestions": [
    "...",
    "...",
    "..."
  ],
  "aiEntitySchemaType": "ProfessionalService"
}`;

  const buildFallbackData = (): GoogleSeoAuditResult => ({
    title: `${pageTitle} | ${company} - ${slogan}`,
    description: `ברוכים הבאים ל-${pageTitle} של ${company}. פתרונות מתקדמים, שירות מקצועי ואישי, וכל הכלים הדרושים להצלחה. היכנסו למידע נוסף.`,
    keywords: [pageTitle, company, 'פתרונות', 'שירות', 'אתר רשמי'],
    author: company,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    googleAuditScore: 92,
    googleAuditRecommendations: [
      'כותרת ה-Title עומדת בתקן אורך אופטימלי של גוגל (50-60 תווים)',
      'תיאור ה-Meta כולל הנעה ברורה לפעולה ומתאים להצגה בתוצאות החיפוש',
      'מומלץ לוודא מהירות טעינה גבוהה במובייל לשיפור דירוג Core Web Vitals',
    ],
    aiKnowledgeSummary: `${company} מספקת מענה מוביל ומקיף בתחום ${pageTitle}. הפתרון כולל התאמה מדויקת, אמינות גבוהה ומידע עדכני.`,
    aiTargetQuestions: [
      `מה זה ${pageTitle} ואיך ${company} יכולה לעזור?`,
      `מה היתרונות של ${company} בתחום?`,
      `איך ליצור קשר ולקבל פרטים על ${pageTitle}?`,
    ],
    aiEntitySchemaType: 'ProfessionalService',
    aiBotIndexingEnabled: true,
  });

  const parseResult = (parsed: any): GoogleSeoAuditResult => ({
    title: parsed.title || `${pageTitle} | ${company}`,
    description: parsed.description || `${company} - ${slogan}. ${pageTitle} עם ליווי מקצועי ושירות מתקדם.`,
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [pageTitle, company, 'שירותים', 'קהילה'],
    author: parsed.author || company,
    ogType: parsed.ogType || 'website',
    twitterCard: parsed.twitterCard || 'summary_large_image',
    googleAuditScore: typeof parsed.googleAuditScore === 'number' ? parsed.googleAuditScore : 95,
    googleAuditRecommendations: Array.isArray(parsed.googleAuditRecommendations)
      ? parsed.googleAuditRecommendations
      : [
          'הקפידו על כותרות H1 ו-H2 תואמות לתוכן הדף',
          'ודאו הוספת תגיות Alt לתמונות בדף',
          'הוסיפו קישורים פנימיים לאזורי העמוד השונים',
        ],
    aiKnowledgeSummary:
      parsed.aiKnowledgeSummary ||
      `${company} מספקת מענה מוביל ומקיף בתחום ${pageTitle}. הפתרון כולל התאמה מדויקת, אמינות גבוהה ומידע עדכני.`,
    aiTargetQuestions: Array.isArray(parsed.aiTargetQuestions)
      ? parsed.aiTargetQuestions
      : [
          `מה זה ${pageTitle} ואיך ${company} יכולה לעזור?`,
          `מה היתרונות של ${company} בתחום?`,
          `איך ליצור קשר ולקבל פרטים על ${pageTitle}?`,
        ],
    aiEntitySchemaType: parsed.aiEntitySchemaType || 'ProfessionalService',
    aiBotIndexingEnabled: true,
  });

  // 1. Try parent AI module (kosai-engine) through contract if available
  if (aiAssistant && typeof aiAssistant.generateJson === 'function') {
    try {
      const kosaiRes = await aiAssistant.generateJson<any>({
        prompt,
        systemPrompt: 'You are a World-Class Google Technical SEO & Generative Engine Optimization Expert.',
        brandDna,
      });

      if (!kosaiRes.isFallback && kosaiRes.data) {
        const raw = kosaiRes.data;
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return {
          success: true,
          data: parseResult(parsed),
          isFallback: false,
        };
      } else if (kosaiRes.error) {
        return {
          success: false,
          data: buildFallbackData(),
          error: kosaiRes.error,
          isFallback: true,
        };
      }
    } catch (err: any) {
      console.warn('[aiGoogleSeoService] kosai-engine contract call notice:', err);
    }
  }

  // 2. Route directly through KOSAI Monopoly Contract
  try {
    const seoData = await dispatchSeoMetadataToKosai(
      {
        pageTitle,
        company,
        slogan,
        topics,
      },
      {
        cacheKey: encodeURIComponent(pageTitle).toLowerCase(),
        apiKey,
      }
    );
    const apiRes = { success: !!seoData, data: seoData };

    if (apiRes.success && apiRes.data) {
      const parsed = typeof apiRes.data === 'string' ? JSON.parse(apiRes.data) : apiRes.data;
      return {
        success: true,
        data: parseResult(parsed),
        isFallback: false,
      };
    }

    return {
      success: false,
      data: buildFallbackData(),
      error: apiRes.error || 'לא התקבלה תשובה משרת ה-AI. הוגדרו ערכי ברירת מחדל איכותיים עבורך.',
      isFallback: true,
    };
  } catch (err: any) {
    console.warn('[aiGoogleSeoService] generateGoogleCompliantSeo notice:', err);
    return {
      success: false,
      data: buildFallbackData(),
      error: err?.message || 'שירות הבינה המלאכותית אינו זמין כעת. מולאו נתוני ברירת מחדל מותאמים אישית.',
      isFallback: true,
    };
  }
}
