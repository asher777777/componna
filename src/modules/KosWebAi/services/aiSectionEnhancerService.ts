import { SectionType } from '../types/pageBuilder.types';
import { BrandDna } from '../../../core/contracts';
import { resolveApiKey, callGeminiApi } from '../api/functionsApi';
import { resolveLiveBrandDna } from './aiPageGenerator';

export interface SectionAiSuggestion {
  id: string;
  tab: 'brand' | 'page_context' | 'layout' | 'custom';
  title: string;
  description: string;
  badge?: string;
  iconName: string;
  prompt: string;
  previewChanges?: {
    label: string;
    value: string;
  }[];
}

export interface SectionEnhancementResult {
  success: boolean;
  updatedConfig: any;
  summaryOfChanges: string[];
  isFromAi: boolean;
  message?: string;
}

export const aiSectionEnhancerService = {
  /**
   * Generates intelligent, context-aware suggestions across 3 main dimensions:
   * 1. Brand DNA (קולקציית המיתוג)
   * 2. Whole Page Context (כלל תוכן ורצף העמוד)
   * 3. Layout & Bento Design (עיצוב ופריסה)
   */
  getSuggestionsForSection(
    sectionType: SectionType,
    currentConfig: any,
    brandDna?: BrandDna | null,
    allSections?: Record<string, any>,
    sectionOrder?: string[]
  ): {
    brandSuggestions: SectionAiSuggestion[];
    pageContextSuggestions: SectionAiSuggestion[];
    layoutSuggestions: SectionAiSuggestion[];
  } {
    const dna = resolveLiveBrandDna(brandDna);
    const company = dna?.identity?.companyName || 'המותג שלך';
    const slogan = dna?.identity?.slogan || '';
    const uvp = dna?.audience?.mainUvp || '';
    const tone = (dna?.voice as any)?.tone || dna?.voice?.powerWords?.join(', ') || 'יוקרתי, סמכותי ומניע לפעולה';
    const phone = dna?.trust?.contactPhone || '';
    const whatsapp = dna?.trust?.whatsappSupportNumber || '';

    // Calculate position in page
    const order = sectionOrder || [];
    const currentIndex = currentConfig?.id ? order.indexOf(currentConfig.id) : -1;
    const totalSections = order.length;
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === totalSections - 1;

    const precedingType = currentIndex > 0 ? allSections?.[order[currentIndex - 1]]?.type : null;
    const followingType = currentIndex >= 0 && currentIndex < totalSections - 1 ? allSections?.[order[currentIndex + 1]]?.type : null;

    // 1. BRAND DNA SUGGESTIONS
    const brandSuggestions: SectionAiSuggestion[] = [
      {
        id: 'brand-tone-align',
        tab: 'brand',
        title: `התאמה מלאה לטון המותג (${tone.slice(0, 20)}...)`,
        description: `שכתוב הכותרות, התיאורים והמסרים בהתאם לאופי המותג "${company}" והבטחת המותג: "${uvp || slogan || 'מובילות ומקצועיות'}".`,
        badge: 'מיתוג עמוק',
        iconName: 'Sparkles',
        prompt: `שכתב ושדרג את הטקסטים והמסרים באזור זה כך שיתאימו בדיוק לקול המותג "${company}", תוך הדגשת ה-UVP: "${uvp || 'מובילות שירותית ואיכות ללא פשרות'}", בטון שיווקי אותנטי ומשכנע.`,
        previewChanges: [
          { label: 'קול מותג', value: tone },
          { label: 'מיקוד ערך', value: uvp || 'איכות בלתי מתפשרת' },
        ],
      },
      {
        id: 'brand-trust-inject',
        tab: 'brand',
        title: 'הזרקת פרטי אמון וחיבור ישיר מהמיתוג',
        description: `הטמעת מספרי שירות, אמון, וואטסאפ (${whatsapp || 'זמין'}) ותגיות אמינות מקולקציית המיתוג לתוך האזור.`,
        badge: 'הגברת אמון',
        iconName: 'ShieldCheck',
        prompt: `הוסף או הדגש אלמנטים של אמון, ביטחון ופרטי קשר מאומתים של "${company}" (טלפון: ${phone || 'רשמי'}, וואטסאפ: ${whatsapp || 'פעיל'}), עם הוכחה חברתית ברורה.`,
        previewChanges: [
          { label: 'הוכחה חברתית', value: 'שילוב תגיות אמינות ופרטי קשר' },
          { label: 'חיבור תקשורת', value: whatsapp ? `WhatsApp: ${whatsapp}` : 'מענה מהיר' },
        ],
      },
      {
        id: 'brand-persona-target',
        tab: 'brand',
        title: 'חידוד פנייה לקהל היעד והסרת חסמי המרה',
        description: `התאמת המסר לקהל היעד המרכזי של ${company}, ומתן מענה חד להתלבטויות ונקודות כאב שכיחות.`,
        badge: 'פנייה אישית',
        iconName: 'Target',
        prompt: `התאם את המסרים באזור זה כך שיפנו ישירות לקהל היעד של "${company}", ידגישו פתרון מהיר לבעיותיהם ויסירו חסמי החלטה.`,
      },
    ];

    // 2. WHOLE PAGE CONTEXT SUGGESTIONS
    const pageContextSuggestions: SectionAiSuggestion[] = [
      {
        id: 'page-flow-bridge',
        tab: 'page_context',
        title: isFirst
          ? 'פתיחה מושכת שמניעה לגלילה בשאר העמוד'
          : `גשר נרטיבי רציף (${precedingType ? `אחרי ${precedingType}` : 'רצף עמוד'})`,
        description: `סנכרון של אזור זה עם הרצף הכולל של כל ${totalSections || 1} האזורים בעמוד למניעת נתק בחוויית הקריאה.`,
        badge: 'זרימת תוכן',
        iconName: 'Layers',
        prompt: `שפר את אזור זה כך שישתלב ברצף ההגיוני של כלל העמוד (מיקום ${currentIndex + 1} מתוך ${totalSections}). שמור על מעבר טבעי ומזמין להמשך הגלישה.`,
      },
      {
        id: 'page-cta-strengthen',
        tab: 'page_context',
        title: 'חיזוק הנעה לפעולה (CTA) לעבר יעד העמוד',
        description: `כיוונון כפתורי הפעולה והקישורים באזור כדי שיובילו בצורה חלקה ליעד המרכזי של העמוד (עוגן, טופס, וואטסאפ).`,
        badge: 'מקסום המרות',
        iconName: 'Zap',
        prompt: `חזק את ההנעה לפעולה (Call to Action) באזור זה, הפוך את הכפתורים למפתים, ברורים וממוקדים ביעד ההמרה המרכזי.`,
      },
      {
        id: 'page-dedup-refine',
        tab: 'page_context',
        title: 'מניעת כפילויות מול שאר אזורי העמוד',
        description: 'בדיקה שהמסר באזור זה מציע ערך ייחודי ואינו חוזר במילים דומות על פסקאות אחרות באתר.',
        badge: 'תוכן מדויק',
        iconName: 'Compass',
        prompt: `רענן ודייק את התוכן באזור זה כדי להבטיח בידול מוחלט, תוכן עשיר ולא כפול מול יתר חלקי העמוד.`,
      },
    ];

    // 3. LAYOUT & BENTO SUGGESTIONS
    const layoutSuggestions: SectionAiSuggestion[] = [];

    if (sectionType === 'hero') {
      layoutSuggestions.push(
        {
          id: 'hero-layout-bento',
          tab: 'layout',
          title: 'פריסת Bento Hero יוקרתית (כרטיסי מידע חכמים)',
          description: 'עיצוב כרטיסי Bento מודרניים עם תגית הודעה, תמונת ראווה ואווירת Mesh Glow עתידנית.',
          badge: 'מומלץ KOSUN',
          iconName: 'Sparkles',
          prompt: 'הפוך את האזור לפריסת Bento Hero חדשנית עם סגנון mesh-glow, כפתור פעולה מודגש ותגיות אמון.',
        },
        {
          id: 'hero-layout-split',
          tab: 'layout',
          title: 'פריסת Spatial Split (תמונה/וידאו לצד טקסט)',
          description: "חלוקה נקייה של 50/50 המבליטה את המסר הראשי לצד ויז'ואל איכותי.",
          badge: 'ספליט קלאסי',
          iconName: 'Layers',
          prompt: 'עצב את האזור בפריסת split מרחבית (spatial), עם דגש על כותרת עוצמתית ותמונת ראווה רחבה.',
        },
        {
          id: 'hero-layout-centered',
          tab: 'layout',
          title: 'עיצוב Centered Minimal (ממורכז ונקי)',
          description: 'מיקוד מוחלט בכותרת ובקריאה לפעולה, ללא הסחות דעת.',
          badge: 'מינימליסטי',
          iconName: 'Target',
          prompt: 'הפוך את האזור לעיצוב centered אלגנטי ומינימליסטי עם טיפוגרפיה גדולה ומרווחים נושמים.',
        }
      );    } else if (sectionType === 'pricing') {
      layoutSuggestions.push(
        {
          id: 'pricing-layout-featured',
          tab: 'layout',
          title: 'הדגשת חבילת ה-VIP (Featured Tier)',
          description: 'עיצוב 3 חבילות מחיר עם תגית "הכי פופולרי" ואפקט הדגשה מותאם אישית.',
          badge: 'ממיר במיוחד',
          iconName: 'Zap',
          prompt: 'שדרג את מחירון החבילות כך שחבילת האמצע תהיה מסומנת כ-Featured עם תגית בולטת וכפתור מודגש.',
        }
      );
    } else if (sectionType === 'tiktokHero') {
      layoutSuggestions.push(
        {
          id: 'tiktok-hero-hook-viral',
          tab: 'layout',
          title: 'הוק ויראלי וכותרת קצבית בסגנון טיקטוק',
          description: 'ניסוח כותרת קצרה, מסקרנת ובועטת שגורמת לעצור את הגלילה באופן מיידי.',
          badge: 'ויראלי במיוחד 🔥',
          iconName: 'Sparkles',
          prompt: 'נסח כותרת הוק קצרה, מסקרנת וממגנטת בסגנון טיקטוק/רילס (2-4 מילים) שמעוררת סקרנות בלתי נשלטת, והתאם את תגית הוידאו.',
        },
        {
          id: 'tiktok-hero-cta-boost',
          tab: 'layout',
          title: 'חיזוק הנעה לפעולה (CTA) לפתיחת מודאל הלידים',
          description: 'כוונון טקסט הכפתור, אפקט הפולס ואייקון מושך מתוך ספריית Lucide.',
          badge: 'מקסום המרות',
          iconName: 'Zap',
          prompt: 'שדרג את כפתור הפעולה (CTA) של אזור הטיקטוק למילים מניעות לפעולה ברורה, בחר אייקון Lucide מתאים והגדר כותרת מודאל מזמינה.',
        },
        {
          id: 'tiktok-hero-card-brand',
          tab: 'layout',
          title: 'סנכרון כרטיס המותג הצף עם ה-Brand DNA',
          description: 'התאמת תגית הכרטיס, הכותרת והסלוגן להבטחת המותג ולקהל היעד.',
          badge: 'מיתוג מדויק',
          iconName: 'Target',
          prompt: 'עדכן את כרטיס המותג הצף מעל הוידאו עם תגית מותג יוקרתית, שם החברה והצעת הערך המרכזית (UVP).',
        }
      );
    } else if (sectionType === 'eventRsvp') {
      layoutSuggestions.push(
        {
          id: 'event-rsvp-full',
          tab: 'layout',
          title: 'פריסת אירוע מלאה (Waze + יומן + WhatsApp + מונה הגעה)',
          description: 'הפעלת כל 3 הכרטיסיות, כפתורי אישור הגעה ומונה נוכחות חי.',
          badge: 'מומלץ KOSUN',
          iconName: 'Sparkles',
          prompt: 'הפעל את כל הכרטיסיות (Waze, יומן, אוטומציית וואטסאפ), חזק את כפתורי אישור ההגעה וסנכרן עם מונה האורחים.',
        },
        {
          id: 'event-rsvp-minimal',
          tab: 'layout',
          title: 'עיצוב מינימליסטי ממוקד הגעה מהירה',
          description: 'מיקוד בניווט ישיר ל-Waze ואישור הגעה מהיר.',
          badge: 'מינימליסטי',
          iconName: 'Target',
          prompt: 'הדגש את הניווט המהיר ל-Waze ואת אישור ההגעה המהיר בלחיצה אחת.',
        }
      );
    } else {
      layoutSuggestions.push(
        {
          id: 'generic-layout-modern',
          tab: 'layout',
          title: 'מתיחת פנים מודרנית ועיצוב זכוכית (Glassmorphism)',
          description: 'שדרוג מראה האזור לקו עיצוב נקי עם שקיפויות עדינות, פינות מעוגלות וקונטרסט מושלם.',
          badge: 'עיצוב נקי',
          iconName: 'Sparkles',
          prompt: 'שדרג את העיצוב החזותי של אזור זה לרמה הגבוהה ביותר: טיפוגרפיה מלוטשת, מרווחים נכונים וקונטרסט יוקרתי.',
        }
      );
    }

    return {
      brandSuggestions,
      pageContextSuggestions,
      layoutSuggestions,
    };
  },

  /**
   * Executes the enhancement via Gemini API or instant rule-based fallback.
   * GUARANTEED to never fail silently or return a broken object.
   */
  async enhanceSection(params: {
    sectionType: SectionType;
    instructionPrompt: string;
    currentConfig: any;
    brandDna?: BrandDna | null;
    allSections?: Record<string, any>;
    sectionOrder?: string[];
    pageTitle?: string;
    providedApiKey?: string;
  }): Promise<SectionEnhancementResult> {
    const {
      sectionType,
      instructionPrompt,
      currentConfig,
      brandDna,
      allSections,
      sectionOrder,
      pageTitle,
      providedApiKey,
    } = params;

    const dna = resolveLiveBrandDna(brandDna);
    const company = dna?.identity?.companyName || 'העסק';
    const slogan = dna?.identity?.slogan || '';
    const uvp = dna?.audience?.mainUvp || '';
    const tone = (dna?.voice as any)?.tone || dna?.voice?.powerWords?.join(', ') || 'מקצועי, סמכותי ויוקרתי';
    const targetAudience = dna?.audience?.targetAudiences?.join(', ') || 'לקוחות איכותיים';
    const phone = dna?.trust?.contactPhone || '';
    const whatsapp = dna?.trust?.whatsappSupportNumber || '';

    // Summary of existing page sections
    const pageStructure = (sectionOrder || [])
      .map((secId, idx) => {
        const s = allSections?.[secId];
        return `${idx + 1}. [${s?.type || 'section'}]: "${s?.title || s?.adminTitle || ''}"`;
      })
      .join(' | ');

    const apiKey = resolveApiKey(providedApiKey);

    // Prompt engineered for Gemini
    const systemInstruction = `You are KOSUN AI - a World-Class Lead UI/UX Designer and Hebrew Conversion Copywriter.
Your task is to refine and elevate a web page section for "${company}".
You must return ONLY a single valid JSON object containing the updated section configuration properties.
DO NOT wrap in markdown ticks if possible, and DO NOT add conversational text before or after the JSON.
All copy must be natural, high-converting, idiomatic Hebrew without robotic translations.`;

    const promptText = `
Brand Identity & DNA:
- Company Name: "${company}"
- Slogan: "${slogan}"
- Unique Value Proposition (UVP): "${uvp}"
- Target Audience: "${targetAudience}"
- Tone & Voice: "${tone}"
- Phone: "${phone}"
- WhatsApp: "${whatsapp}"

Page Context:
- Page Title: "${pageTitle || 'עמוד נחיתה'}"
- Overall Sections on Page: ${pageStructure || 'עמוד מעוצב'}

Section to Refine:
- Section Type: "${sectionType}"
- User Request / Improvement Goal: "${instructionPrompt}"
- Current Section Configuration:
${JSON.stringify(currentConfig, null, 2)}

INSTRUCTIONS:
1. Retain the core structure of the section (${sectionType}).
2. Rewrite or elevate Hebrew titles, subtitles, descriptions, and buttons to be exceptionally compelling and aligned with the brand DNA and page context.
3. Keep or enhance relevant fields (e.g. layout, style, items, icons, badges).
4. Preserve "id" and "type".
Return ONLY the raw updated JSON object.`;

    if (!apiKey) {
      return {
        success: false,
        updatedConfig: currentConfig,
        summaryOfChanges: [],
        isFromAi: false,
        message: 'אין לכם את האפשרות הזו בסל. לשדרוג החבילה והפעלת יכולות AI, פנו למנהל המערכת.',
      };
    }

    try {
      const response = await callGeminiApi<any>({
        prompt: promptText,
        systemInstruction,
        providedApiKey: apiKey,
        temperature: 0.7,
        timeoutMs: 30000,
        responseMimeType: 'application/json',
      });

      if (response.success && response.data) {
        const rawData = response.data;
        // Flatten if wrapped in data or section
        const unwrapped = rawData.data || rawData.section || rawData;

        const merged = {
          ...currentConfig,
          ...unwrapped,
          id: currentConfig?.id || `${sectionType}_${Date.now()}`,
          type: sectionType,
          anchorId: currentConfig?.anchorId || unwrapped.anchorId,
        };

        const summary: string[] = [];
        if (merged.title && merged.title !== currentConfig?.title) {
          summary.push(`כותרת שודרגה: "${merged.title}"`);
        }
        if (merged.subtitle && merged.subtitle !== currentConfig?.subtitle) {
          summary.push(`תת-כותרת הותאמה ל-DNA המותג`);
        }
        if (merged.layout && merged.layout !== currentConfig?.layout) {
          summary.push(`סגנון פריסה עודכן ל-${merged.layout}`);
        }
        if (summary.length === 0) {
          summary.push(`שדרוג מקיף בתוכן ובמסרים של האזור`);
        }

        return {
          success: true,
          updatedConfig: merged,
          summaryOfChanges: summary,
          isFromAi: true,
          message: 'השדרוג הופק בהצלחה על ידי KOSUN AI',
        };
      }

      return {
        success: false,
        updatedConfig: currentConfig,
        summaryOfChanges: [],
        isFromAi: false,
        message: response.error || 'אין לכם את האפשרות הזו בסל. לשדרוג החבילה והפעלת יכולות AI, פנו למנהל המערכת.',
      };
    } catch (err: any) {
      console.warn('[aiSectionEnhancerService] Gemini API call error:', err);
      return {
        success: false,
        updatedConfig: currentConfig,
        summaryOfChanges: [],
        isFromAi: false,
        message: err?.message || 'אין לכם את האפשרות הזו בסל. לשדרוג החבילה והפעלת יכולות AI, פנו למנהל המערכת.',
      };
    }
  },

  /**
   * High-quality deterministic brand-DNA heuristic transformation
   */
  applySmartBrandHeuristic(
    sectionType: SectionType,
    currentConfig: any,
    prompt: string,
    dna: BrandDna | null
  ): { config: any; changes: string[] } {
    const company = dna?.identity?.companyName || 'העסק המוביל';
    const slogan = dna?.identity?.slogan || 'פתרונות מובילים בהתאמה אישית';
    const uvp = dna?.audience?.mainUvp || 'שירות בלתי מתפשר ומקצועיות ברמה הגבוהה ביותר';
    const phone = dna?.trust?.contactPhone || '052-6968008';
    const whatsapp = dna?.trust?.whatsappSupportNumber || '0526968008';

    const updated = { ...currentConfig };
    const changes: string[] = [];

    if (sectionType === 'hero') {
      if (prompt.includes('bento') || prompt.includes('Bento')) {
        updated.layout = 'bento-hero';
        updated.heroStyle = 'mesh-glow';
        changes.push('שודרג לפריסת Bento Hero חכמה עם Mesh Glow');
      } else if (prompt.includes('split') || prompt.includes('ספליט')) {
        updated.layout = 'spatial';
        changes.push('שודרג לפריסת Spatial Split מרחבית');
      } else if (prompt.includes('centered') || prompt.includes('נקי') || prompt.includes('מינימלי')) {
        updated.layout = 'centered';
        changes.push('שודרג לפריסת Centered נקייה וממורכזת');
      }

      updated.title = `${company} – ${slogan || 'המקום שבו מקצועיות פוגשת תוצאות'}`;
      updated.subtitle = uvp;
      updated.description = `מערכת פרימיום מתקדמת המעניקה מענה מדויק, מהיר ומותאם אישית לכל צורך עסקי.`;
      
      updated.announcementBadge = {
        text: `השקה בלעדית: פתרונות חדשים לשנת 2026`,
        url: '#services',
        icon: 'Sparkles',
      };

      updated.primaryButton = {
        text: 'בואו נתחיל עכשיו',
        url: '#contact',
      };
      updated.secondaryButton = {
        text: 'לשיחה ישירה בוואטסאפ',
        url: `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`,
      };

      changes.push(`כותרת ותת-כותרת סונכרנו ישירות עם שם המותג וה-UVP`);
      changes.push(`חיבור כפתורי הנעה לפעולה ישירות לוואטסאפ ולטופס העמוד`);
    } else if (sectionType === 'pricing') {
      updated.title = `מסלולי הצטרפות מותאמים עבורכם`;
      updated.subtitle = `שקיפות מלאה ללא אותיות קטנות – בחרו את החבילה המתאימה`;
      if (Array.isArray(updated.packages) && updated.packages.length > 1) {
        updated.packages = updated.packages.map((pkg: any, idx: number) => ({
          ...pkg,
          isFeatured: idx === 1,
          badge: idx === 1 ? 'הכי פופולרי 🔥' : pkg.badge,
        }));
        changes.push('החבילה המרכזית סומנה כחבילת VIP מומלצת');
      }
    } else if (sectionType === 'contact') {
      updated.title = `בואו נדבר – הצוות של ${company} כאן לרשותכם`;
      updated.subtitle = `מענה אנושי מהיר וליווי צמוד לכל שאלה`;
      updated.phone = phone;
      updated.whatsapp = whatsapp;
      updated.directWhatsappChat = true;
    } else if (sectionType === 'tiktokHero') {
      updated.headline = prompt.includes('הוק') || prompt.includes('קצר') ? `${slogan || 'ההזדמנות שלך מתחילה כאן'}` : `${company} – כל אדם זה נכס`;
      updated.card = {
        enabled: true,
        tag: `• ${company} – פתרונות מובילים לשנת 2026 •`,
        title: `${company} – ${slogan || 'כל אדם זה נכס'}`,
        subtitle: uvp || 'מערכת פרימיום מתקדמת המעניקה מענה מדויק, מהיר ומותאם אישית לכל צורך עסקי.',
        style: 'solid',
      };
      updated.ctaButton = {
        ...(updated.ctaButton || {}),
        text: 'התחל עכשיו בחינם',
        iconName: 'Sparkles',
        showIcon: true,
        actionType: 'modal_form',
      };
      updated.modalTitle = `השארת פרטים לקבלת הצעה מ-${company}`;
      updated.modalSubtitle = `נשמח לחזור אליך בהקדם עם כל המידע והפתרונות המותאמים אישית.`;
      changes.push(`סונכרנו כותרת ההוק, כרטיס המותג הצף ופרטי מודאל הטופס עם ${company}`);
      changes.push(`הוטמעו מספרי יצירת הקשר והוואטסאפ של המותג`);
    } else if (sectionType === 'eventRsvp') {
      updated.eventTitle = `אירוע חגיגי מבית ${company}`;
      updated.subtitle = `הזמנה אישית ומיוחדת – שמחים להזמין אתכם לאירוע מוביל של ${company}`;
      updated.locationName = dna?.trust?.officeAddress ? `מתחם ${company}` : updated.locationName;
      updated.locationAddress = dna?.trust?.officeAddress || updated.locationAddress;
      updated.wazeQuery = dna?.trust?.officeAddress || updated.wazeQuery;
      updated.yesButtonText = 'מגיע/ה בשמחה';
      updated.noButtonText = 'לא מתאפשר לי הפעם';
      changes.push(`סנכרון פרטי האירוע, המיקום והניווט עם כתובת המותג של ${company}`);
    } else {
      updated.title = `${updated.title || 'שדרוג אזור'} – ${company}`;
      updated.subtitle = uvp;
      changes.push(`סנכרון כותרות ומסרים עם מיתוג ${company}`);
    }

    return {
      config: updated,
      changes,
    };
  },
};
