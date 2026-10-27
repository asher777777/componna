export interface TenantDnaContext {
  tenantId: string;
  businessName: string;
  category: string;
  currentTagline?: string;
  targetAudience?: string;
  primaryColor?: string;
  city?: string;
  existingProductsCount?: number;
}

export type OwnerAiIntentType = 
  | 'ADD_PRODUCT_OR_SERVICE'
  | 'BOOST_SEO_AND_DISCOVERY'
  | 'UPDATE_IMAGES_AND_VISUALS'
  | 'REFINE_STORY_AND_VISION'
  | 'ADD_DAILY_UPDATE';

/**
 * 🎯 מחולל פרומפטים דינמיים לפי שוק והקשר הטננט
 */
export function buildDynamicOwnerPrompt(
  intent: OwnerAiIntentType,
  userMessage: string,
  context: TenantDnaContext
): { systemInstruction: string; userPrompt: string } {
  const categoryHebrew = getCategoryHebrew(context.category);

  const baseContext = `
הקשר העסק הנוכחי:
- שם העסק: "${context.businessName}"
- שוק וקטגוריה: "${categoryHebrew}" (${context.category})
- סלוגן נוכחי: "${context.currentTagline || 'לא צוין'}"
- עיר ומיקום: "${context.city || 'תל אביב / ארצי'}"
`.trim();

  switch (intent) {
    case 'ADD_PRODUCT_OR_SERVICE':
      return {
        systemInstruction: `אתה סוכן AI מומחה ליצירה והרחבה של קולקציות עסקיות עבור KOSUN 2026.
תפקידך לקלוט בקשה של בעל העסק (בטקסט או בקול), ולחלץ ממנה פריט קולקציה מושלם (מוצר, שירות, קורס או טיפול) עם מפרט טכני 2x2, שאלות לקפסולת ה-AI, וכותרות SEO מושכות.
החזר אך ורק אובייקט JSON תקין.`,
        userPrompt: `${baseContext}

בקשת בעל העסק:
"${userMessage}"

הנחיות הפקה:
1. title: כותרת שיווקית חדה וממירה (עד 40 תווים).
2. subtitle: תת-כותרת מעוררת עניין עם מפרט עיקרי (עד 75 תווים).
3. price: מחיר מספרי משוער בש"ח (אם לא צוין, שערך מחיר ריאלי לשוק זה).
4. category: קטגוריית משנה מותאמת לשוק ${categoryHebrew}.
5. badgeText: תגית מושכת (למשל: "הכי מבוקש", "בלעדי", "מהדורה מוגבלת", "חבילת השקה").
6. suggestedQuestions: מערך של 3 שאלות קצרות וקולעות שהלקוח עשוי לשאול על פריט זה בקפסולת ה-AI.
7. specsGrid: מערך של 3-4 פריטי מפרט (id, label, value, icon מתוך ספריית Lucide כגון Clock, ShieldCheck, Zap, Sparkles, Award).
8. detailsCards: מערך של 2 כרטיסיות הרחבה מודגשות (id, title, subtitle, icon, badge, highlightColor).
9. seoKeywords: 5 מילות מפתח מובילות לקידום הפריט במנועי חיפוש ו-AI.
10. explanationToOwner: הסבר קצר (משפט אחד) לבעל העסק מה יצרת עבורו.`
      };

    case 'BOOST_SEO_AND_DISCOVERY':
      return {
        systemInstruction: `אתה סוכן AI מומחה ל-SEO סמנטי וקידום בינה מלאכותית (Generative Engine Optimization - GEO) לשנת 2026.
תפקידך לשדרג את הנראות של העסק במנועי AI (כמו Gemini, ChatGPT, Perplexity) ובגוגל.
החזר אך ורק אובייקט JSON תקין.`,
        userPrompt: `${baseContext}

בקשת בעל העסק:
"${userMessage}"

הנחיות הפקה:
1. metaTitle: כותרת מטא אופטימלית כולל מילות חיפוש מבוקשות ומיקום (עד 60 תווים).
2. metaDescription: תיאור מטא ממיר עם קריאה לפעולה (עד 155 תווים).
3. powerSeoQuestions: מערך של 4 שאלות ותשובות (FAQ Schema) שהלקוחות שואלים בינה מלאכותית על תחום זה, עם תשובות מדויקות שמבליטות את העסק.
4. suggestedKeywords: 10 מילות מפתח ממוקדות זנב-ארוך (Long-tail).
5. aiSummarySnippet: פסקת סיכום סמנטית בת 3 שורות שמנועי AI יצטטו כשהם ממליצים על העסק.
6. explanationToOwner: הסבר ברור איך השינויים יביאו לקוחות חדשים.`
      };

    case 'UPDATE_IMAGES_AND_VISUALS':
      return {
        systemInstruction: `אתה ארט דיירקטור ויועץ מיתוג ויזואלי של KOSUN 2026.
תפקידך להמליץ על סגנון תמונות, להציע תמונות מתוך ה-CloudStore (פורמט WEBP), ולנסח הנחיות מדויקות ליצירת תמונות AI.
החזר אך ורק אובייקט JSON תקין.`,
        userPrompt: `${baseContext}

בקשת בעל העסק:
"${userMessage}"

הנחיות הפקה:
1. visualVibe: הגדרת האווירה הוויזואלית (למשל: תאורת סטודיו רכה, ניאון עתידני, מינימליזם יוקרתי).
2. recommendedCloudStorePath: נתיב מומלץ מתוך מאגר CloudStore (למשל /cloudstore/beauty_glow.webp, /cloudstore/realestate_hero.webp).
3. aiImagePrompt: פרומפט מקצועי באנגלית ליצירת תמונה פוטוריאליסטית חדשה בכלי AI (Midjourney/Imagen 3).
4. altTextHe: תיאור תמונה בעברית מותאם לנגישות ו-SEO (Alt Text).
5. explanationToOwner: הסבר למה התמונה הזו תחזק את האמון וההמרות.`
      };

    case 'REFINE_STORY_AND_VISION':
      return {
        systemInstruction: `אתה קופירייטר ומספר סיפורי מותג (Storyteller) בכיר של KOSUN.
תפקידך ללטש את סיפור המותג, הסלוגן, הציטוט המוביל ועמודי התווך של העסק.
החזר אך ורק אובייקט JSON תקין.`,
        userPrompt: `${baseContext}

בקשת בעל העסק:
"${userMessage}"

הנחיות הפקה:
1. tagline: סלוגן חדש, קליט ומנצח (עד 50 תווים).
2. quote: ציטוט השראה ייחודי של מייסד העסק (עד 80 תווים).
3. storyParagraphs: מערך של 2-3 פסקאות קולחות, מרגשות ומקצועיות המתארות את החזון והשירות.
4. pillars: מערך של 3 עמודי תווך מלוטשים (title, desc, icon).
5. explanationToOwner: הסבר קצר על הדיוקים שנעשו.`
      };

    case 'ADD_DAILY_UPDATE':
    default:
      return {
        systemInstruction: `אתה מנהל תוכן ופרודוקטיביות אוטונומי של KOSUN 2026.
תפקידך לקלוט עדכון יומי מבעל העסק (מבצע היום, אירוע מיוחד, טיפ מקצועי, הודעה ללקוחות), לנסח אותו בסטייל מרהיב ולחבר אותו לקפסולת העוזר.
החזר אך ורק אובייקט JSON תקין.`,
        userPrompt: `${baseContext}

בקשת / עדכון בעל העסק:
"${userMessage}"

הנחיות הפקה:
1. updateTitle: כותרת העדכון היומי (עד 35 תווים).
2. updateText: תוכן העדכון בשפה מקרבת וממירה (עד 120 תווים).
3. badge: תגית בולטת (למשל: "עדכון יומי", "הודעה חשובה", "הטבת השבוע").
4. capsulePrompt: שאלה שנוספת אוטומטית לקפסולת הסוכן עבור הלקוחות הנכנסים היום.
5. actionCta: כפתור הנעה לפעולה (למשל: "תיאום עכשיו ◀", "לפרטים המלאים ◀").
6. explanationToOwner: סיכום קצר של העדכון שפורסם.`
      };
  }
}

function getCategoryHebrew(cat: string): string {
  switch (cat) {
    case 'beauty_clinic': return 'אסתטיקה, טיפוח ויופי פרא-רפואי';
    case 'real_estate': return 'נדל״ן, תיווך והשקעות';
    case 'legal': case 'legal_firm': return 'משרד עורכי דין ומשפטי';
    case 'automotive': return 'סוכנות רכבי יוקרה וספורט';
    case 'saas_productivity': return 'פלטפורמת תוכנה ופרודוקטיביות';
    case 'community': return 'מרכז קהילתי ותרבות';
    case 'education': return 'מרכז לימוד והעשרה';
    default: return cat || 'עסקים ושירותים';
  }
}
