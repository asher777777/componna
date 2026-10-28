import { KosunDiscoveryLayoutMode } from '../../../KOSDESYN/01-core-engine/areaCollectionManager';

export interface WebFunctionItem {
  id: string;
  name: string;
  title: string;
  category: 'page_management' | 'ai_generation' | 'seo_geo' | 'legal_infrastructure';
  categoryLabel: string;
  summary: string;
  processStep: string;
  actionKey: string;
  badge: string;
  icon: string;
  ctaText: string;
  tags: string[];
  targetLayout: KosunDiscoveryLayoutMode;
}

export const KOS_WEB_FUNCTIONS_COLLECTION: WebFunctionItem[] = [
  // 1. ניהול ויצירת עמודים
  {
    id: 'fn_create_new_page',
    name: 'createNewPageWizard',
    title: 'הקמת עמוד אינטרנט חדש',
    category: 'page_management',
    categoryLabel: 'ניהול עמודים',
    summary: 'אשף הקמת עמוד חדש לפי קטגוריה: KOSASS, KOSINFO, KOSEVENT, KOSCOMMUNITY, KOSTUBE.',
    processStep: 'שלב 1: בחירת קטגוריית עמוד ➔ הגדרת כותרת וסלאג ➔ פריסת מקטעים.',
    actionKey: 'open_new_page',
    badge: 'עמוד חדש',
    icon: 'PlusCircle',
    ctaText: 'הקם עמוד עכשיו ◀',
    tags: [
      'עמוד חדש', 'דף חדש', 'יצירת עמוד', 'הוספת דף', 'דף נחיתה', 'landing page',
      'createnewpage', 'הקמת עמוד', 'פתיחת דף', 'אשף הקמה'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_open_editor',
    name: 'openPageEditor',
    title: 'עריכת עמוד ומקטעים',
    category: 'page_management',
    categoryLabel: 'ניהול עמודים',
    summary: 'כניסה לעורך המקטעים: הזזת שכבות, עריכת תכנים והתאמת צבעים.',
    processStep: 'בחירת עמוד ➔ כניסה לעורך ➔ עריכת מקטע בודד או שינוי סדר.',
    actionKey: 'open_editor',
    badge: 'עריכת דף',
    icon: 'Edit3',
    ctaText: 'פתח עורך עמוד ◀',
    tags: [
      'עריכה', 'עורך', 'עריכת עמוד', 'ערוך דף', 'editor', 'מקטעים', 'sections',
      'פתיחת עורך', 'שינוי תוכן', 'עיצוב עמוד'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_duplicate_page',
    name: 'duplicatePage',
    title: 'שכפול עמוד קיים',
    category: 'page_management',
    categoryLabel: 'ניהול עמודים',
    summary: 'שכפול מהיר של עמוד שלם כולל כל המקטעים, העיצובים והגדרות ה-SEO.',
    processStep: 'בחירת עמוד מקור ➔ שכפול נתונים מלא ➔ שמירה כטיוטה.',
    actionKey: 'duplicate_page',
    badge: 'שכפול',
    icon: 'Copy',
    ctaText: 'שכפל עמוד ◀',
    tags: [
      'שכפול', 'duplicate', 'העתקה', 'להעתיק עמוד', 'עותק', 'קופי', 'שכפול דף'
    ],
    targetLayout: 'spotlight_stage',
  },
  {
    id: 'fn_toggle_publish_page',
    name: 'togglePublishPage',
    title: 'פרסום / הורדה מאוויר (Toggle)',
    category: 'page_management',
    categoryLabel: 'ניהול עמודים',
    summary: 'שינוי סטטוס עמוד בלחיצה אחת בין מצב טיוטה פרטית למצב מפורסם ברשת.',
    processStep: 'לחיצה על סטטוס העמוד ➔ עדכון Firestore ➔ סנכרון דומיין חי.',
    actionKey: 'toggle_publish',
    badge: 'סטטוס פרסום',
    icon: 'Globe',
    ctaText: 'עדכן סטטוס ◀',
    tags: [
      'פרסום', 'publish', 'טיוטה', 'draft', 'העלאה לאוויר', 'הורדה מהאוויר', 'סטטוס'
    ],
    targetLayout: 'spotlight_stage',
  },

  // 2. בינה מלאכותית ו-AI Studio
  {
    id: 'fn_ai_live_page_builder',
    name: 'aiLivePageBuilderModal',
    title: 'מחולל עמודים חי ב-AI Studio',
    category: 'ai_generation',
    categoryLabel: 'בינה מלאכותית',
    summary: 'יצירת עמודים ורעיונות שיווקיים שלמים מתוך פרומפט והתאמה עמוקה ל-Brand DNA.',
    processStep: 'הזנת רעיון בשפה חופשית ➔ הזרקת ה-DNA של הטננט ➔ יצירת עמוד מלא תוך שניות.',
    actionKey: 'open_ai_builder',
    badge: 'KosAi Studio',
    icon: 'Sparkles',
    ctaText: 'הפעל יוצר AI ◀',
    tags: [
      'ai', 'בינה מלאכותית', 'מחולל', 'גנרטור', 'יוצר עמודים', 'kosai', 'ai builder',
      'יצירה אוטומטית', 'פרומפט', 'רעיון שיווקי', 'marketing ideas'
    ],
    targetLayout: 'accordion_morph',
  },
  {
    id: 'fn_brand_marketing_ideas',
    name: 'continuousMarketingIdeasDrawer',
    title: 'הצעות שיווקיות רציפות מה-DNA',
    category: 'ai_generation',
    categoryLabel: 'בינה מלאכותית',
    summary: 'שליפת רעיונות לקמפיינים ודפי נחיתה חדשים המותאמים בדיוק לשפת המותג של הטננט.',
    processStep: 'סריקת BrandDNA ➔ יצירת 4 הצעות ערך ממוקדות ➔ שיגור לבנייה מהירה.',
    actionKey: 'open_marketing_ideas',
    badge: 'רעיונות שיווק',
    icon: 'Lightbulb',
    ctaText: 'קבל רעיונות ◀',
    tags: [
      'רעיונות', 'שיווק', 'קמפיין', 'השראה', 'marketing', 'marketing ideas', 'רעיונות שיווקיים'
    ],
    targetLayout: 'spotlight_stage',
  },

  // 3. SEO, GEO וקידום
  {
    id: 'fn_koseo_power_engin',
    name: 'openSeoPowerEngin',
    title: 'KoSeoPowerEngin: קונסול ואנליטיקס',
    category: 'seo_geo',
    categoryLabel: 'קידום ו-SEO',
    summary: 'לוח בקרה מרכזי לגוגל סרצ׳ קונסול, אנליטיקס 4 ומנוע קידום GEO לדומיין וסאב-דומיינים.',
    processStep: 'לחיצה ➔ פתיחת מסך KoSeoPowerEngin ➔ סקירת ביצועי חיפוש והמרות.',
    actionKey: 'open_seo_hub',
    badge: 'SEO & Console',
    icon: 'BarChart3',
    ctaText: 'פתח KoSeo ◀',
    tags: [
      'seo', 'koseo', 'גוגל קונסול', 'search console', 'אנליטיקס', 'analytics', 'קידום',
      'דירוג', 'טראפיק', 'כניסות', 'דומיין'
    ],
    targetLayout: 'glass_flip_overlay',
  },
  {
    id: 'fn_url_shortener_modal',
    name: 'urlShortenerModal',
    title: 'קיצור קישורים ושיתוף מהיר',
    category: 'seo_geo',
    categoryLabel: 'קידום ו-SEO',
    summary: 'הפקת קישור מקוצר וקליט לעמוד, הפקת ברקוד QR ושיתוף מהיר ב-WhatsApp.',
    processStep: 'בחירת עמוד ➔ יצירת slug מקוצר ➔ העתקה לשיתוף.',
    actionKey: 'open_shortener',
    badge: 'שיתוף ו-QR',
    icon: 'Share2',
    ctaText: 'קצר ושתף ◀',
    tags: [
      'קיצור קישור', 'קישור קצר', 'shortener', 'qr', 'שיתוף', 'whatsapp', 'וואטסאפ'
    ],
    targetLayout: 'spotlight_stage',
  },

  // 4. תשתיות משפטיות וארכיון
  {
    id: 'fn_ensure_legal_pages',
    name: 'ensureDefaultLegalPages',
    title: 'הקמת עמודי תקנון, פרטיות ונגישות',
    category: 'legal_infrastructure',
    categoryLabel: 'תשתיות ומשפטי',
    summary: 'סנכרון ויצירה אוטומטית של עמודי חובה משפטיים: תנאי שימוש, מדיניות פרטיות והצהרת נגישות.',
    processStep: 'שאיבת נתוני חברה מה-DNA ➔ יצירת עמודי תקנון מותאמים ➔ פרסום באתר.',
    actionKey: 'ensure_legal_pages',
    badge: 'משפטי ונגישות',
    icon: 'ShieldCheck',
    ctaText: 'סנכרן עמודי חובה ◀',
    tags: [
      'תקנון', 'תנאי שימוש', 'פרטיות', 'מדיניות פרטיות', 'נגישות', 'הצהרת נגישות',
      'legal', 'privacy', 'terms', 'עמודי חובה'
    ],
    targetLayout: 'spotlight_stage',
  },
  {
    id: 'fn_convert_to_video',
    name: 'convertToVideoStudio',
    title: 'המרה לסטודיו וידאו ומשפכים (Video Funnel)',
    category: 'page_management',
    categoryLabel: 'ניהול עמודים',
    summary: 'המרה אוטומטית של תכני העמוד למשפך וידאו אינטראקטיבי ורילס ב-Video Studio.',
    processStep: 'בחירת עמוד ➔ שליחת מקטעים ל-Studio ➔ הפקת וידאו אינטראקטיבי.',
    actionKey: 'convert_to_video',
    badge: 'וידאו ומשפך',
    icon: 'Film',
    ctaText: 'המר לווידאו ◀',
    tags: [
      'וידאו', 'video', 'המרה', 'סטודיו וידאו', 'משפך', 'funnel', 'רילס', 'סטורי'
    ],
    targetLayout: 'spotlight_stage',
  },
];

/**
 * התאמת שאילתת שפה טבעית לפונקציות המובילות של KosWeb (בדיוק 4 כרטיסים!)
 */
export function matchWebFunctionsForAdvisor(
  queryText: string
): Array<{ item: WebFunctionItem; score: number; matchReasons: string[] }> {
  const clean = (queryText || '').trim().toLowerCase();
  if (!clean) {
    const defaultIds = [
      'fn_create_new_page',
      'fn_ai_live_page_builder',
      'fn_koseo_power_engin',
      'fn_ensure_legal_pages',
    ];
    return defaultIds
      .map((id) => KOS_WEB_FUNCTIONS_COLLECTION.find((f) => f.id === id)!)
      .filter(Boolean)
      .map((item) => ({ item, score: 90, matchReasons: ['ברירת מחדל מומלצת'] }));
  }

  const queryTokens = clean.split(/[\s,._\-+/]+/).filter((t) => t.length > 1);

  const scored = KOS_WEB_FUNCTIONS_COLLECTION.map((fn) => {
    let score = 0;
    const reasons: string[] = [];

    const lowerName = fn.name.toLowerCase();
    const lowerTitle = fn.title.toLowerCase();
    const lowerSummary = fn.summary.toLowerCase();

    if (lowerName.includes(clean) || clean.includes(lowerName)) {
      score += 60;
      reasons.push('התאמת שם פונקציה');
    }
    if (lowerTitle.includes(clean) || clean.includes(lowerTitle)) {
      score += 50;
      reasons.push('התאמת כותרת מדויקת');
    }

    fn.tags.forEach((tag) => {
      const lowerTag = tag.toLowerCase();
      if (clean === lowerTag) {
        score += 45;
        reasons.push(`תגית מדויקת: "${tag}"`);
      } else if (clean.includes(lowerTag) || lowerTag.includes(clean)) {
        score += 30;
        reasons.push(`תגית: "${tag}"`);
      } else {
        queryTokens.forEach((token) => {
          if (lowerTag.includes(token)) {
            score += 15;
            reasons.push(`מילת מפתח: "${token}"`);
          }
        });
      }
    });

    queryTokens.forEach((token) => {
      if (lowerSummary.includes(token)) score += 8;
      if (lowerTitle.includes(token)) score += 12;
    });

    return {
      item: fn,
      score,
      matchReasons: Array.from(new Set(reasons)),
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 4);
}
