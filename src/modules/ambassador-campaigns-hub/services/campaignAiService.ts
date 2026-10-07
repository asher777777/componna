/**
 * CampaignAiService: Generates AI-powered campaign recommendations matching Brand DNA.
 *
 * Capabilities:
 * 1. Analyzes Brand DNA (Identity, Tone of Voice, Target Audiences, Slogan, Power Words)
 * 2. Integrates available Media Gallery items and CRM Groups
 * 3. Connects to Gemini API via cascading models fallback (gemini-3.8-flash -> gemini-3.5-flash)
 * 4. Provides high-fidelity intelligent fallback suggestions when offline or without API key
 */

import { getModuleGeminiKey } from '../../../core/connection/tenantApiKeys';
import { DonationTier, CampaignBranding } from '../types';
import { BrandProfileSummary, CrmGroupSummary, GalleryImageSummary } from './campaignBrandIntegrationService';

export interface AiCampaignRecommendation {
  id: string;
  conceptTitle: string;
  conceptTag: string;
  title: string;
  subtitle: string;
  description: string;
  targetGoal: number;
  donationType: 'both' | 'recurring' | 'one_time';
  branding: CampaignBranding;
  tiers: DonationTier[];
  suggestedGroupIds: string[];
  suggestedGroupNames: string[];
  featuredImageUrl: string;
  themeMode: 'brand_dna';
  reasoning: string;
}

export interface GenerateAiCampaignParams {
  brand: BrandProfileSummary;
  groups: CrmGroupSummary[];
  media: GalleryImageSummary[];
  userGoalFocus?: string;
  targetBudget?: number;
}

const GEMINI_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.8-flash-lite',
  'gemini-2.5-flash',
] as const;

/**
 * Generate 3 tailored campaign packages matching the brand's identity and groups
 */
export async function generateAiCampaignRecommendations(
  params: GenerateAiCampaignParams
): Promise<{ success: boolean; recommendations: AiCampaignRecommendation[]; isLiveAi: boolean; error?: string }> {
  const { brand, groups, media, userGoalFocus, targetBudget } = params;

  // Resolve API Key
  const apiKey = getModuleGeminiKey('ambassador-campaigns-hub') || getModuleGeminiKey('brand-dna-hub');

  // If no API key or offline, use smart context-aware generator
  if (!apiKey) {
    const fallbackRecs = buildSmartFallbackRecommendations(brand, groups, media, userGoalFocus, targetBudget);
    return {
      success: true,
      recommendations: fallbackRecs,
      isLiveAi: false,
    };
  }

  // Construct Gemini Prompt
  const systemInstruction = `אתה מומחה בכיר להפקת קמפיינים דיגיטליים, גיוס המונים וניהול שגרירים עבור ארגונים, עמותות ועסקים (Charidy / CauseMatch / Kampin).
תפקידך לייצר 3 הצעות קמפיין מרהיבות בעברית שמותאמות במדויק לפרופיל המיתוג (Brand DNA), לקבוצות השגרירים הזמינות ולנכסי המדיה.
הפלט חייב להיות בפורמט JSON תקין בלבד (מערך של 3 אובייקטים לפי הסכמה).`;

  const userPrompt = `
פרופיל המיתוג של הארגון (Brand DNA):
- שם הארגון: ${brand.companyName}
- סוג ארגון: ${brand.organizationType}
- סלוגן: ${brand.slogan}
- חזון: ${brand.vision}
- מילות כוח שיווקיות: ${brand.powerWords.join(', ')}
- קהלי יעד: ${brand.targetAudiences.join(', ')}
- צבע מיתוג ראשי: ${brand.primaryColor}
- צבע מיתוג משני: ${brand.secondaryColor}

קבוצות שגרירים קיימות במערכת CRM:
${groups.map((g) => `- [${g.id}] ${g.name} (מוביל: ${g.leaderName || 'ללא'}, יעד קבוצתי: ₪${g.targetGoal || 25000})`).join('\n')}

נכסי מדיה זמינים בגלריה:
${media.map((m) => `- [${m.url}] ${m.title || m.fileName}`).join('\n')}

${userGoalFocus ? `דגש או בקשה מיוחדת מצד המשתמש: ${userGoalFocus}` : ''}
${targetBudget ? `סכום יעד מבוקש לקמפיין: ₪${targetBudget.toLocaleString()}` : ''}

הפק 3 הצעות קמפיין מגוונות:
1. קמפיין שותפות שנתי / גיוס המונים רחב (מסורתי ויוקרתי)
2. קמפיין שגרירים וקהילות מבוזר (תחרותי, ממוקד ראשי קבוצות וואטסאפ)
3. קמפיין פרויקט תנופה / השפעה מיידית (קצר, נמרץ ורגשי)

החזר בפורמט JSON הבא בלבד:
[
  {
    "id": "rec-1",
    "conceptTitle": "כותרת קונספט קצרה",
    "conceptTag": "תגית קצרה",
    "title": "כותרת הקמפיין הראשית",
    "subtitle": "תת-כותרת שיווקית וסוחפת",
    "description": "סיפור הקמפיין המלא בן 2-3 פסקאות מרגשות הפונות ללב התורם ומשלבות את מילות הכוח",
    "targetGoal": 250000,
    "donationType": "both",
    "reasoning": "מדוע קמפיין זה מתאים במיוחד לפרופיל המותג ולקהל היעד",
    "suggestedGroupIds": ["${groups[0]?.id || 'grp-1'}"],
    "tiers": [
      { "id": "t1", "name": "שותף", "title": "מתחילה בברכה", "amount": 180, "monthlyAmount": 180, "subtitle": "₪180 לחודש ל-12 חודשים" },
      { "id": "t2", "name": "תומך", "title": "מכפילה הצלחה", "amount": 360, "monthlyAmount": 360, "subtitle": "₪360 לחודש ל-12 חודשים" },
      { "id": "t3", "name": "ידיד", "title": "מרחיבה את הכלי", "amount": 770, "monthlyAmount": 770, "subtitle": "₪770 לחודש ל-12 חודשים" },
      { "id": "t4", "name": "שותף אמת", "title": "פותחת שפע", "amount": 1500, "monthlyAmount": 1500, "subtitle": "₪1,500 לחודש ל-12 חודשים" }
    ]
  }
]
`;

  // Attempt live Gemini execution with cascading fallback
  for (const model of GEMINI_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            temperature: 0.7,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!res.ok) {
        console.warn(`[CampaignAI] Gemini model ${model} failed (${res.status})`);
        continue;
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const recs: AiCampaignRecommendation[] = parsed.map((item, idx) => {
            const chosenImage = media[idx]?.url || brand.vibeImages?.[idx] || brand.vibeImages?.[0] || '';
            const matchedGroups = groups.filter((g) => (item.suggestedGroupIds || []).includes(g.id));

            return {
              id: item.id || `rec-${idx + 1}`,
              conceptTitle: item.conceptTitle || `המלצה ${idx + 1}`,
              conceptTag: item.conceptTag || 'מותאם מיתוג',
              title: item.title,
              subtitle: item.subtitle,
              description: item.description,
              targetGoal: Number(item.targetGoal || targetBudget || 250000),
              donationType: item.donationType || 'both',
              branding: {
                primaryColor: brand.primaryColor,
                accentColor: brand.secondaryColor,
                theme: 'gradient',
                svgTrendPreset: 'curve_up',
              },
              tiers: Array.isArray(item.tiers) && item.tiers.length > 0 ? item.tiers : buildDefaultTiersForBrand(brand),
              suggestedGroupIds: item.suggestedGroupIds || groups.map((g) => g.id),
              suggestedGroupNames: matchedGroups.length > 0 ? matchedGroups.map((g) => g.name) : groups.map((g) => g.name),
              featuredImageUrl: chosenImage,
              themeMode: 'brand_dna',
              reasoning: item.reasoning || 'נבחר במדויק בהתאמה לטון המותג ולקהל היעד',
            };
          });

          return { success: true, recommendations: recs, isLiveAi: true };
        }
      }
    } catch (err) {
      console.warn(`[CampaignAI] Error with model ${model}:`, err);
    }
  }

  // If live calls failed, return rich fallback
  const fallbackRecs = buildSmartFallbackRecommendations(brand, groups, media, userGoalFocus, targetBudget);
  return {
    success: true,
    recommendations: fallbackRecs,
    isLiveAi: false,
    error: 'הופעלו המלצות חכמות מקומיות מבוססות מיתוג (Gemini במצב Fallback)',
  };
}

/**
 * Context-aware intelligent fallback recommendations generator
 */
export function buildSmartFallbackRecommendations(
  brand: BrandProfileSummary,
  groups: CrmGroupSummary[],
  media: GalleryImageSummary[],
  userGoalFocus?: string,
  targetBudget?: number
): AiCampaignRecommendation[] {
  const primaryImg = media[0]?.url || brand.vibeImages?.[0] || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&auto=format&fit=crop';
  const secondaryImg = media[1]?.url || brand.vibeImages?.[1] || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&auto=format&fit=crop';
  const thirdImg = media[2]?.url || brand.vibeImages?.[2] || 'https://images.unsplash.com/photo-1526976668912-1a811878dd37?w=1200&auto=format&fit=crop';

  const defaultGoal = targetBudget || 250000;
  const brandPower = brand.powerWords.slice(0, 3).join(', ') || 'ערבות הדדית, שותפות והשפעה';

  return [
    {
      id: 'rec-partner-growth',
      conceptTitle: 'קמפיין שותפות שנתי: שותפים לצמיחה ולחזון',
      conceptTag: 'יוקרתי וממוקד מיתוג',
      title: `שותפים לחזון של ${brand.companyName}: בונים עתיד ביחד`,
      subtitle: `${brand.slogan} - מתחברים יחד כדי להכפיל את מעגלי ההשפעה`,
      description: `במשך שנות פעילותנו, ${brand.companyName} מובילה עשייה משמעותית המשלבת ${brandPower}.
כעת, אנו יוצאים בקמפיין שותפות ייחודי שנועד להבטיח את המשך הצמיחה ולהרחיב את המענה לכלל ${brand.targetAudiences.join(' וכן ')}.
כל שקל שנתרם מהווה חלק ישיר מהחזון ומאפשר לנו להמשיך להוביל במקצועיות ובשקיפות מלאה. יחד איתכם, אנחנו מגיעים ליעד!`,
      targetGoal: defaultGoal,
      donationType: 'both',
      branding: {
        primaryColor: brand.primaryColor,
        accentColor: brand.secondaryColor,
        theme: 'gradient',
        svgTrendPreset: 'curve_up',
      },
      tiers: [
        { id: 't1', name: 'שותף לדרך', title: 'מתחילה בברכה', amount: 180, monthlyAmount: 180, subtitle: '₪180 לחודש ל-12 חודשים', imageShape: 'circle', isDefault: true },
        { id: 't2', name: 'תומך פעיל', title: 'מכפילה הצלחה', amount: 360, monthlyAmount: 360, subtitle: '₪360 לחודש ל-12 חודשים', imageShape: 'circle' },
        { id: 't3', name: 'ידיד אמת', title: 'מרחיבה את הכלי', amount: 770, monthlyAmount: 770, subtitle: '₪770 לחודש ל-12 חודשים', imageShape: 'circle' },
        { id: 't4', name: 'עמוד התווך', title: 'פותחת שפע', amount: 1500, monthlyAmount: 1500, subtitle: '₪1,500 לחודש ל-12 חודשים', imageShape: 'circle' },
      ],
      suggestedGroupIds: groups.slice(0, 3).map((g) => g.id),
      suggestedGroupNames: groups.slice(0, 3).map((g) => g.name),
      featuredImageUrl: primaryImg,
      themeMode: 'brand_dna',
      reasoning: `נשען ישירות על ערכי המותג והסלוגן של ${brand.companyName}. פונה לקהל רחב עם מדרגות תרומה מדורגות ומאפשר תרומה חד-פעמית לצד הוראת קבע.`,
    },
    {
      id: 'rec-ambassadors-community',
      conceptTitle: 'קמפיין שגרירים וקהילות: נבחרת המנהיגות המובילה',
      conceptTag: 'מבוסס רשת שגרירים ו-CRM',
      title: `קהילה אחת, מטרה אחת: נבחרת השגרירים של ${brand.companyName}`,
      subtitle: `כל קהילה נרתמת, כל שגריר משפיע - 48 שעות של ערבות הדדית וגיוס המונים`,
      description: `הכוח האמיתי של ${brand.companyName} טמון בקהילות ובאנשים המרכיבים אותה.
בקמפיין זה, כל שגריר וכל קבוצת שותפים מקבלים עמוד אישי ייחודי ויעד קבוצתי. 
דרך שיתופים בוואטסאפ וחיבור ישיר למעגלי החברים והמשפחה, אנו מניעים גל תמיכה חסר תקדים שיוביל אותנו להשגת היעד הכולל.`,
      targetGoal: Math.round(defaultGoal * 1.2),
      donationType: 'both',
      branding: {
        primaryColor: brand.primaryColor,
        accentColor: '#10b981',
        theme: 'gradient',
        svgTrendPreset: 'curve_up',
      },
      tiers: [
        { id: 't1', name: 'מעגל החברים', title: 'שותפות קהילתית', amount: 100, monthlyAmount: 100, subtitle: '₪100 לחודש ל-12 חודשים', imageShape: 'circle' },
        { id: 't2', name: 'מאיצי הצמיחה', title: 'שגריר מוביל', amount: 250, monthlyAmount: 250, subtitle: '₪250 לחודש ל-12 חודשים', imageShape: 'circle', isDefault: true },
        { id: 't3', name: 'לב הקהילה', title: 'מכפיל כוח', amount: 500, monthlyAmount: 500, subtitle: '₪500 לחודש ל-12 חודשים', imageShape: 'circle' },
        { id: 't4', name: 'מוביל חזון', title: 'נאמן הקהילה', amount: 1000, monthlyAmount: 1000, subtitle: '₪1,000 לחודש ל-12 חודשים', imageShape: 'circle' },
      ],
      suggestedGroupIds: groups.map((g) => g.id),
      suggestedGroupNames: groups.map((g) => g.name),
      featuredImageUrl: secondaryImg,
      themeMode: 'brand_dna',
      reasoning: `ממנף ישירות את קבוצות ה-CRM המוגדרות במערכת (${groups.length} קבוצות). אידיאלי ליצירת תחרות חיובית ולחיבור מובילי קהילות.`,
    },
    {
      id: 'rec-impact-leap',
      conceptTitle: 'קמפיין פרויקט תנופה והשפעה: פורצים קדימה',
      conceptTag: 'קצבי, רגשי וממוקד יעד',
      title: `פורצים קדימה: פרויקט התנופה של ${brand.companyName}`,
      subtitle: `מגייסים יחד למען פריצת דרך משמעותית שתשפיע על מאות אנשים ומשפחות`,
      description: `ישנם רגעים שבהם נדרש זינוק קדימה. ${brand.companyName} ניצבת כעת בפני שלב התפתחות מכריע.
הפרויקט המיוחד שלנו נועד להקים תשתית מתקדמת שתעניק ${brand.shortVision}.
בתמיכתכם המיידית, נוכל להגשים את המהלך ולהביא לתוצאות מיידיות בשטח. כל תרומה נחשבת ומקדמת אותנו אל הרגע המכריע.`,
      targetGoal: Math.round(defaultGoal * 0.8),
      donationType: 'one_time',
      branding: {
        primaryColor: brand.secondaryColor,
        accentColor: brand.primaryColor,
        theme: 'dark',
        svgTrendPreset: 'percentage_gauge',
      },
      tiers: [
        { id: 't1', name: 'תרומת התחלה', title: 'צעד ראשון', amount: 180, subtitle: 'תרומה חד פעמית', imageShape: 'circle' },
        { id: 't2', name: 'שותפות מואצת', title: 'לב רחב', amount: 360, subtitle: 'תרומה חד פעמית', imageShape: 'circle', isDefault: true },
        { id: 't3', name: 'השפעה משמעותית', title: 'עמוד ברכה', amount: 770, subtitle: 'תרומה חד פעמית', imageShape: 'circle' },
        { id: 't4', name: 'פטרון הפרויקט', title: 'שותף זהב', amount: 2500, subtitle: 'תרומה חד פעמית', imageShape: 'circle' },
      ],
      suggestedGroupIds: groups.slice(0, 2).map((g) => g.id),
      suggestedGroupNames: groups.slice(0, 2).map((g) => g.name),
      featuredImageUrl: thirdImg,
      themeMode: 'brand_dna',
      reasoning: `קמפיין נמרץ וממוקד, המתאים לפרויקטים עונתיים או יעדי בזק (כגון חגים או פתיחת שנה).`,
    },
  ];
}

function buildDefaultTiersForBrand(brand: BrandProfileSummary): DonationTier[] {
  return [
    { id: 't1', name: 'שותף', title: 'מתחילה בברכה', amount: 180, monthlyAmount: 180, subtitle: '₪180 לחודש ל-12 חודשים', imageShape: 'circle', isDefault: true },
    { id: 't2', name: 'תומך', title: 'מכפילה הצלחה', amount: 360, monthlyAmount: 360, subtitle: '₪360 לחודש ל-12 חודשים', imageShape: 'circle' },
    { id: 't3', name: 'ידיד', title: 'מרחיבה את הכלי', amount: 550, monthlyAmount: 550, subtitle: '₪550 לחודש ל-12 חודשים', imageShape: 'circle' },
    { id: 't4', name: 'שותף אמת', title: 'פותחת שפע', amount: 770, monthlyAmount: 770, subtitle: '₪770 לחודש ל-12 חודשים', imageShape: 'circle' },
    { id: 't5', name: 'פורצת דרך', title: 'פורצת דרך', amount: 1500, monthlyAmount: 1500, subtitle: '₪1,500 לחודש ל-12 חודשים', imageShape: 'circle' },
  ];
}
