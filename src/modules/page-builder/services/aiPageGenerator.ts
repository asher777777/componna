import { PageBuilderConfig, SectionType } from '../types/pageBuilder.types';
import { BrandDna } from '../../../core/contracts';
import { resolveApiKey, callGeminiApi } from '../api/functionsApi';
import {
  GENERATE_MULTI_SECTION_PAGE_PROMPT,
  GENERATE_MARKETING_IDEAS_PROMPT,
  REFINE_SECTION_PROMPT,
} from '../prompts';
import { MarketingIdea, GenerationStep } from '../types';

export type { GenerationStep };
export type OnStepCallback = (step: GenerationStep, partialConfig: PageBuilderConfig) => void;

/**
 * High-Converting Unsplash image seed generator matched to context
 */
function getSmartPlaceholderImage(category: string, index: number = 0): string {
  const images: Record<string, string[]> = {
    hero: [
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    ],
    service: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
    ],
    community: [
      'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80',
    ],
    course: [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    ],
  };
  const pool = images[category] || images.hero;
  return pool[index % pool.length];
}

/**
 * Resolves the real-time Brand DNA from context, LocalStorage, or populated defaults
 */
export function resolveLiveBrandDna(provided?: BrandDna | null): BrandDna | null {
  if (provided && (provided.identity?.companyName || provided.trust?.contactPhone)) {
    // If provided has contact details, still check if localStorage has more specific ones
    try {
      const raw = localStorage.getItem('comona_brand_dna_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.trust?.contactPhone || parsed?.trust?.whatsappSupportNumber) {
          return {
            ...provided,
            ...parsed,
            trust: { ...provided.trust, ...parsed.trust },
            identity: { ...provided.identity, ...parsed.identity },
            designTokens: { ...provided.designTokens, ...parsed.designTokens },
          };
        }
      }
    } catch {}
    return provided;
  }
  try {
    const raw = localStorage.getItem('comona_brand_dna_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed) return parsed;
    }
  } catch {}
  return provided || null;
}

export const aiPageGenerator = {
  /**
   * Generates 6 marketing angles derived continuously from Brand DNA and existing pages
   */
  async generatePageIdeas(
    brandDna?: BrandDna | null,
    providedApiKey?: string,
    existingPages?: PageBuilderConfig[]
  ): Promise<MarketingIdea[]> {
    const effectiveDna = resolveLiveBrandDna(brandDna);
    const companyName = effectiveDna?.identity?.companyName || 'העסק המוביל';
    const purpose = effectiveDna?.identity?.organizationPurpose || '';
    const targetAudiences = effectiveDna?.audience?.targetAudiences || [];
    const uvp = effectiveDna?.audience?.mainUvp || '';
    const objections = effectiveDna?.audience?.commonObjections || [];
    const personas = effectiveDna?.audience?.personas || [];

    const existingPagesSummary = (existingPages || []).map((p) => ({
      title: p.pageTitle,
      slug: p.slug,
      sectionTypes: p.sectionOrder.map((id) => p.sections[id]?.type).filter(Boolean),
    }));

    // Fallback set of 6 distinct concepts (Rule: NEVER return only 1 or empty)
    const fallbackIdeas: MarketingIdea[] = [
      {
        id: 'sales-ultimatum',
        title: 'משפך מכירה והשקת VIP',
        description: 'דף נחיתה ישיר וממיר עם חבילות מחיר שקופות, ביקורות לקוחות ותחושת דחיפות לסגירת החודש.',
        prompt: `דף מכירה והשקה יוקרתי וממיר עבור ${companyName}, כולל כותרת Hero מפוצלת עם תמונת Showcase, כרטיסי יתרונות, מחירון חבילות, הוכחה חברתית וטופס הצטרפות מהיר.`,
        icon: 'Zap',
        targetObjective: 'מכירות והמרות',
        badge: 'הכי ממיר 🔥',
      },
      {
        id: 'lead-magnet-guide',
        title: 'דף מגנט לידים להורדת מדריך',
        description: 'עמוד ידע אלגנטי שמציע תוכן מקצועי בעל ערך ענק בתמורה להשארת פרטי קשר.',
        prompt: `דף נחיתה ממוקד למגנט לידים עבור ${companyName}, המציע הורדת מדריך אסטרטגי חינמי (PDF), מפרט את עיקרי הידע וכולל טופס הרשמה קצר.`,
        icon: 'Layers',
        targetObjective: 'איסוף לידים איכותיים',
        badge: 'לידים מהירים 🧲',
      },
      {
        id: 'geo-fast-response',
        title: 'דף שירות מקומי ו-SEO (GEO)',
        description: 'מיקוד אזורי מדויק לפי עיר ומחוז, עם מפת הגעה, שעות פתיחה, וחיבור מיידי לוואטסאפ.',
        prompt: `דף שירות מקומי ממוקד GEO עבור ${companyName}, כולל כותרת מקומית, אזורי שירות, ביקורות מקומיות מאומתות, מפה וכפתור WhatsApp ישיר.`,
        icon: 'MapPin',
        targetObjective: 'פניות מקומיות',
        badge: 'SEO מקומי 📍',
      },
      {
        id: 'vip-digital-course',
        title: 'דף קורס דיגיטלי / סדנה בלעדית',
        description: 'הצגת סילבוס מודולרי, הישגי בוגרים, וידאו היכרות וספירה לאחור לסגירת ההרשמה.',
        prompt: `דף נחיתה לקורס דיגיטלי והכשרה בלעדית של ${companyName}, עם סילבוס מודולרי, הישגי בוגרים, שאלות נפוצות ומסלולי הרשמה.`,
        icon: 'GraduationCap',
        targetObjective: 'הרשמה להדרכות',
        badge: 'סמכות ומקצועיות 🎓',
      },
      {
        id: 'community-vip-club',
        title: 'דף מועדון חברים וקהילת VIP',
        description: 'עמוד שייכות והרשמה לקהילת לקוחות אקסקלוסיבית עם הטבות חודשיות ונטוורקינג.',
        prompt: `דף קהילה ומועדון לקוחות יוקרתי עבור ${companyName}, עם מונה חברים חי, הטבות בלעדיות, לוח אירועים וטופס הצטרפות מהיר.`,
        icon: 'Heart',
        targetObjective: 'חיזוק מועדון לקוחות',
        badge: 'שייכות ונאמנות 👥',
      },
      {
        id: 'presale-countdown-launch',
        title: 'דף השקת פריסייל עם טיימר',
        description: 'קמפיין השקה מוגבל בכמות ובזמן, עם שעון ספירה לאחור והטבה בלעדית למקדימים להירשם.',
        prompt: `דף השקה עם ספירה לאחור והנחת פריסייל עבור ${companyName}, המשלב טיימר דחיפות, מסלול VIP מוגבל ומענה על התנגדויות מרכזיות.`,
        icon: 'Sparkles',
        targetObjective: 'באזז והשקה מהירה',
        badge: 'דחיפות וסקרנות ⏳',
      },
    ];

    const apiKey = resolveApiKey(providedApiKey);
    if (!apiKey) {
      return fallbackIdeas;
    }

    const prompt = GENERATE_MARKETING_IDEAS_PROMPT({
      companyName,
      purpose,
      targetAudiences,
      uvp,
      objections,
      personas,
      existingPages: existingPagesSummary,
    });

    const response = await callGeminiApi<MarketingIdea[]>({
      prompt,
      providedApiKey: apiKey,
      temperature: 0.85,
    });

    if (response.success && Array.isArray(response.data) && response.data.length >= 3) {
      return response.data;
    }

    return fallbackIdeas;
  },

  /**
   * Generates a complete 4-8 sections page with streaming live updates.
   * GUARANTEE: Never generates a single section!
   */
  async generatePageLive(
    userPrompt: string,
    brandDna?: BrandDna | null,
    onStep?: OnStepCallback,
    options?: { generateImages?: boolean; apiKey?: string }
  ): Promise<PageBuilderConfig> {
    const effectiveDna = resolveLiveBrandDna(brandDna);

    const primaryColor = effectiveDna?.designTokens?.primaryColor || '#6366f1';
    const secondaryColor = effectiveDna?.designTokens?.secondaryColor || '#0ea5e9';
    const companyName = effectiveDna?.identity?.companyName || 'קמונה פתרונות דיגיטליים';
    const slogan = effectiveDna?.identity?.slogan || 'חדשנות, איכות וצמיחה מתמדת';
    const logoUrl = effectiveDna?.identity?.logoUrl || '';

    // Precise contact details resolution: prioritize real inputs from Brand DNA
    const phone = effectiveDna?.trust?.contactPhone || '052-6968008';
    const email = effectiveDna?.trust?.contactEmail || 'ovt5771@gmail.com';
    const whatsapp = effectiveDna?.trust?.whatsappSupportNumber || '0526968008';
    const address = effectiveDna?.trust?.officeAddress || 'דרך מנחם בגין 144, תל אביב';

    const pageId = `page_${Date.now()}`;

    // Base scaffold for the page
    const pageConfig: PageBuilderConfig = {
      pageId,
      pageTitle: `${companyName} - דף אינטרנט חכם`,
      slug: 'launch',
      published: false,
      isHomePage: false,
      viewsCount: 0,
      leadsCount: 0,
      globalSettings: {
        siteTitle: `${companyName} | ${slogan}`,
        companyName,
        slogan,
        siteLogoUrl: logoUrl,
        theme: 'modern',
        headerLayout: 'floating-glass',
        headerSticky: true,
        isHeaderVisible: true,
        isFooterVisible: true,
        primaryColor,
        secondaryColor,
        backgroundColor: effectiveDna?.designTokens?.backgroundColor || '#ffffff',
        textColor: effectiveDna?.designTokens?.textColor || '#0f172a',
        fontFamily: effectiveDna?.designTokens?.fontFamily || 'Heebo, sans-serif',
        borderRadius: effectiveDna?.designTokens?.borderRadius || 'md',
        buttonStyle: effectiveDna?.designTokens?.buttonStyle || 'gradient',
        contactWhatsApp: whatsapp,
        contactPhone: phone,
        contactEmail: email,
        address,
        brandDnaSynced: !!effectiveDna,
      },
      seoSettings: {
        title: `${companyName} - ${slogan}`,
        description: brandDna?.identity?.shortVision || `${companyName} מציעה פתרונות מתקדמים ואיכותיים בהתאמה אישית.`,
        keywords: ['שירותים מקצועיים', 'חדשנות', companyName],
        geo: {
          enabled: true,
          targetCity: 'תל אביב',
          targetRegion: 'גוש דן והמרכז',
          targetCountry: 'ישראל',
          serviceAreas: ['כל הארץ', 'גוש דן', 'השרון'],
          localBusinessName: companyName,
          businessAddress: address,
          businessPhone: phone,
          businessEmail: email,
        },
      },
      sectionOrder: [],
      sections: {},
    };

    let generatedSectionsData: any[] = [];
    const apiKey = resolveApiKey(options?.apiKey);

    if (apiKey) {
      try {
        const fullPrompt = GENERATE_MULTI_SECTION_PAGE_PROMPT({
          companyName,
          slogan,
          targetAudience: brandDna?.audience?.targetAudiences?.join(', '),
          uvp: brandDna?.audience?.mainUvp,
          voiceTone: (brandDna?.identity as any)?.brandPersonality || 'מקצועי, מוביל ומשכנע',
          primaryColor,
          backgroundColor: pageConfig.globalSettings.backgroundColor,
          userPrompt,
          generateImages: options?.generateImages ?? true,
        });

        const apiResult = await callGeminiApi<any>({
          prompt: fullPrompt,
          providedApiKey: apiKey,
          temperature: 0.75,
        });

        if (apiResult.success && apiResult.data) {
          const aiData = apiResult.data;
          if (aiData.slug) pageConfig.slug = aiData.slug;
          if (aiData.pageTitle) pageConfig.pageTitle = aiData.pageTitle;
          if (aiData.backgroundColor) pageConfig.globalSettings.backgroundColor = aiData.backgroundColor;
          if (aiData.textColor) pageConfig.globalSettings.textColor = aiData.textColor;

          if (Array.isArray(aiData.sections) && aiData.sections.length >= 3) {
            generatedSectionsData = aiData.sections;
          }
        }
      } catch (err) {
        console.warn('[AI Page Generator] API live call encountered issue, falling back to full skeleton:', err);
      }
    }

    // MANDATORY RULE: If AI didn't return at least 4 sections, use the rich 5-7 section fallback skeleton!
    if (!generatedSectionsData || generatedSectionsData.length < 4) {
      generatedSectionsData = this.getFullSkeletonFallback(userPrompt, companyName, slogan, brandDna);
    }

    // Live Streaming Simulation: build each section step-by-step
    const totalSteps = generatedSectionsData.length;

    for (let i = 0; i < totalSteps; i++) {
      const step = generatedSectionsData[i];
      const sectionType: SectionType = step.sectionType || 'hero';
      const secId = `${sectionType}_${Date.now()}_${i + 1}`;

      const secData: any = {
        ...step.data,
        id: secId,
        type: sectionType,
        visible: true,
      };

      // Guarantee strict Brand DNA contact details for contact and geoLocal sections
      if (sectionType === 'contact') {
        secData.phone = phone;
        secData.email = email;
        secData.address = address;
        secData.whatsapp = whatsapp;
        secData.directWhatsappChat = true;
        if (secData.showForm === undefined) secData.showForm = true;
      } else if (sectionType === 'geoLocal') {
        secData.phone = phone;
        secData.email = email;
        secData.address = address;
        secData.whatsapp = whatsapp;
        secData.businessName = companyName;
      }

      // Ensure rich visual assets are attached to both imageSrc and imageUrl
      if (options?.generateImages ?? true) {
        if (sectionType === 'hero') {
          const heroImg = secData.imageSrc || secData.imageUrl || getSmartPlaceholderImage('hero', i);
          secData.imageSrc = heroImg;
          secData.imageUrl = heroImg;
        }
        if (sectionType === 'services' && Array.isArray(secData.items)) {
          secData.items = secData.items.map((it: any, itemIdx: number) => {
            const srvImg = it.imageSrc || it.imageUrl || getSmartPlaceholderImage('service', itemIdx);
            return {
              ...it,
              imageSrc: srvImg,
              imageUrl: srvImg,
            };
          });
        }
        if (sectionType === 'testimonials' && Array.isArray(secData.items)) {
          secData.items = secData.items.map((it: any, itemIdx: number) => {
            const avatarUrl = it.avatarUrl || `https://images.unsplash.com/photo-${1534528741775 + itemIdx * 1000}?auto=format&fit=crop&w=120&q=80`;
            return {
              ...it,
              avatarUrl,
              content: it.content || it.quote || 'שירות יוצא דופן!',
            };
          });
        }
      }

      pageConfig.sectionOrder.push(secId);
      pageConfig.sections[secId] = secData;

      const progressPercent = Math.min(100, Math.round(((i + 1) / totalSteps) * 100));

      if (onStep) {
        onStep(
          {
            stepIndex: i + 1,
            totalSteps,
            sectionType,
            stepTitle: step.stepTitle || `הקמת אזור ${sectionType}`,
            statusText: step.statusText || 'מעצב ומזרים תוכן מדויק...',
            progressPercent,
          },
          JSON.parse(JSON.stringify(pageConfig))
        );
      }

      // Smooth and realistic step pacing for rich visual AI streaming
      await new Promise((resolve) => setTimeout(resolve, 850));
    }

    return pageConfig;
  },

  /**
   * Refines a specific section using AI
   */
  async generateSectionLive(
    sectionType: SectionType,
    userPrompt: string,
    brandDna?: BrandDna | null,
    currentConfig?: any,
    providedApiKey?: string
  ): Promise<any> {
    const apiKey = resolveApiKey(providedApiKey);
    if (!apiKey) {
      return currentConfig;
    }

    const companyName = brandDna?.identity?.companyName || 'החברה המובילה';
    const prompt = REFINE_SECTION_PROMPT({
      sectionType,
      userPrompt,
      companyName,
      currentConfig,
    });

    const response = await callGeminiApi<any>({
      prompt,
      providedApiKey: apiKey,
      temperature: 0.7,
    });

    if (response.success && response.data) {
      const updated = {
        ...response.data,
        id: currentConfig?.id || `${sectionType}_${Date.now()}`,
        type: sectionType,
      };
      return updated;
    }

    return currentConfig;
  },

  /**
   * NEVER returns 1 section! Produces diverse, rich multi-section architectures (5-7 sections)
   * tailored to the chosen objective with real Brand DNA contact details.
   */
  getFullSkeletonFallback(
    prompt: string,
    companyName: string,
    slogan: string,
    brandDna?: BrandDna | null
  ): any[] {
    const effectiveDna = resolveLiveBrandDna(brandDna);
    const phone = effectiveDna?.trust?.contactPhone || '052-6968008';
    const email = effectiveDna?.trust?.contactEmail || 'ovt5771@gmail.com';
    const whatsapp = effectiveDna?.trust?.whatsappSupportNumber || '0526968008';
    const address = effectiveDna?.trust?.officeAddress || 'דרך מנחם בגין 144, תל אביב';

    const isSales = prompt.includes('מכיר') || prompt.includes('מחיר') || prompt.includes('חבילה') || prompt.includes('השקה');
    const isGeo = prompt.includes('מקומי') || prompt.includes('אזור') || prompt.includes('עיר') || prompt.includes('GEO');
    const isCommunity = prompt.includes('קהילה') || prompt.includes('מועדון') || prompt.includes('חברים');
    const isCourseOrKnowledge = prompt.includes('קורס') || prompt.includes('מדריך') || prompt.includes('ידע') || prompt.includes('סדנה');

    // 1. High-Converting Sales Funnel Architecture (Hero -> LogoMarquee -> Services -> Pricing -> Testimonials -> Timer -> Contact)
    if (isSales) {
      return [
        {
          sectionType: 'hero',
          stepTitle: 'השקת הצעה מנצחת (Sales Hero)',
          statusText: 'מעצב כותרת פרימיום, באדג׳ ספיישל, וכפתור רכישה מהיר...',
          data: {
            title: `ההזדמנות הבלעדית שלכם עם ${companyName}`,
            subtitle: slogan || 'החבילה המושלמת לשדרוג התוצאות שלכם כבר החודש',
            description: 'פתרון מוכח מקצה לקצה בליווי אישי צמוד, כלים בלעדיים ואחריות מלאה להצלחה.',
            layout: 'split',
            heroStyle: 'mesh-glow',
            badgeText: '🔥 הטבת השקה מוגבלת בזמן',
            buttonsVisible: true,
            primaryButton: { text: 'בחרו חבילה עכשיו', url: '#pricing' },
            secondaryButton: { text: 'למידע נוסף', url: '#services' },
            socialProofEnabled: true,
            socialProofText: 'מעל 2,500 לקוחות מרוצים כבר איתנו',
            imageUrl: getSmartPlaceholderImage('hero', 0),
            imageSrc: getSmartPlaceholderImage('hero', 0),
          },
        },
        {
          sectionType: 'logoMarquee',
          stepTitle: 'באנר הוכחה חברתית (Logo Marquee)',
          statusText: 'מציג שותפים עסקיים וסמלי אמון להגברת סמכות המותג...',
          data: {
            title: 'נבחר על ידי הארגונים והעסקים המובילים בישראל',
            speed: 30,
            direction: 'left',
            grayscale: true,
          },
        },
        {
          sectionType: 'services',
          stepTitle: 'כרטיסי ערך ויתרונות תחרותיים (Services Grid)',
          statusText: 'מבליט את היתרונות הייחודיים שהופכים את ההצעה לבלתי ניתנת לסירוב...',
          data: {
            title: 'למה כולם בוחרים בנו?',
            subtitle: 'ארבעה יתרונות ברורים שמביאים תוצאות אמיתיות',
            layout: 'grid',
            items: [
              { id: 's1', title: 'תוצאות מוכחות בשטח', description: 'שיטות עבודה שעברו בדיקות קפדניות ומביאות הצלחה עקבית.', icon: 'ShieldCheck' },
              { id: 's2', title: 'ליווי וזמינות מלאה', description: 'תמיכה אנושית אישית ומהירה בוואטסאפ ובטלפון לכל שאלה.', icon: 'Zap' },
              { id: 's3', title: 'חדשנות וטכנולוגיה', description: 'כלים אוטומטיים מתקדמים שחוסכים לכם שעות של עבודה.', icon: 'Sparkles' },
              { id: 's4', title: 'אחריות ושקיפות מלאה', description: 'בלי אותיות קטנות – אתם יודעים בדיוק מה אתם מקבלים.', icon: 'CheckCircle2' },
            ],
          },
        },
        {
          sectionType: 'pricing',
          stepTitle: 'מחירון חבילות ומסלולים (Pricing Table)',
          statusText: 'מרכיב 3 מסלולי השקעה שקופים עם הדגשת המסלול המומלץ...',
          data: {
            title: 'חבילות ומסלולי הצטרפות',
            subtitle: 'בחרו את המסלול המתאים ביותר עבורכם',
            layout: 'grid',
            plans: [
              {
                id: 'p1',
                name: 'חבילת בסיס',
                price: '₪490',
                period: 'חד פעמי',
                description: 'מתאים לעסקים בתחילת הדרך',
                features: ['גישה מלאה למערכת', 'תמיכה בדוא״ל תוך 24 שעות', 'מדריכי וידאו מפורטים'],
                buttonText: 'להצטרפות למסלול',
                buttonUrl: '#contact',
                isPopular: false,
              },
              {
                id: 'p2',
                name: 'חבילת VIP Pro',
                price: '₪990',
                period: 'חד פעמי',
                description: 'המסלול הנבחר על ידי 80% מהלקוחות',
                features: ['כל מה שבבסיס', 'ליווי אישי ממוקד 1-על-1', 'תמיכת WhatsApp ישירה', 'הטבות והנחות בלעדיות'],
                buttonText: 'להצטרפות מועדפת 🔥',
                buttonUrl: '#contact',
                isPopular: true,
                badge: 'הכי משתלם',
              },
              {
                id: 'p3',
                name: 'חבילת Enterprise',
                price: '₪1,990',
                period: 'חד פעמי',
                description: 'ליווי מקיף מקצה לקצה',
                features: ['הכל ללא הגבלה', 'הטמעה מלאה על ידי הצוות', 'זמינות טלפונית עדיפה', 'התאמות אישיות מיוחדות'],
                buttonText: 'לשיחת התאמה',
                buttonUrl: '#contact',
                isPopular: false,
              },
            ],
          },
        },
        {
          sectionType: 'timer',
          stepTitle: 'שעון ספירה לאחור (Urgency Timer)',
          statusText: 'יוצר דחיפות אמיתית לסגירת המבצע ומניעת נטישה...',
          data: {
            title: 'מחיר ההשקה המיוחד מסתיים בקרוב!',
            subtitle: 'לאחר סיום הספירה לאחור המחיר יחזור למחירון הרגיל',
            targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            buttonText: 'תפסו את ההטבה עכשיו',
            buttonUrl: '#pricing',
          },
        },
        {
          sectionType: 'testimonials',
          stepTitle: 'הוכחה חברתית וחוות דעת (Testimonials)',
          statusText: 'משלב המלצות חמות מלקוחות מאומתים...',
          data: {
            title: 'מה אומרים הלקוחות שכבר הצטרפו?',
            subtitle: 'סיפורי הצלחה אמיתיים מתוך השטח',
            layout: 'grid',
            items: [
              { id: 't1', name: 'אורן ברק', role: 'בעל עסק', quote: 'ההשקעה החזירה את עצמה תוך פחות משבועיים. שירות מעולה!', rating: 5 },
              { id: 't2', name: 'שירה אלון', role: 'מנהלת שיווק', quote: 'הכל עובד חלק ובקלות, חסך לי המון עבודה וזמן יקר.', rating: 5 },
              { id: 't3', name: 'רועי נווה', role: 'יזם', quote: 'המקצועיות והזמינות של הצוות פשוט ברמה אחרת.', rating: 5 },
            ],
          },
        },
        {
          sectionType: 'contact',
          stepTitle: 'הנעה לפעולה ויצירת קשר (Contact)',
          statusText: 'מחבר את נתוני הקשר האמיתיים של המותג...',
          data: {
            title: 'מעוניינים לשמוע עוד או להצטרף?',
            subtitle: 'השאירו פרטים ונחזור אליכם מיידית, או פנו ישירות בוואטסאפ',
            phone,
            email,
            address,
            whatsapp,
            directWhatsappChat: true,
            showForm: true,
          },
        },
      ];
    }

    // 2. Local GEO Service Architecture (Hero -> Services -> GeoLocal -> StatsBento -> FAQ -> Contact)
    if (isGeo) {
      return [
        {
          sectionType: 'hero',
          stepTitle: 'בניית Hero מקומי (GEO Focus)',
          statusText: 'מדגיש זמינות מיידית באזור השירות ופריסה מקומית...',
          data: {
            title: `השירות המקצועי המוביל באזורכם - ${companyName}`,
            subtitle: slogan || 'הגעה מהירה, שירות מוסמך ומחירים הוגנים',
            description: `צוות המומחים של ${companyName} מציע מענה מהיר בכל אזור המרכז וגוש דן עם 100% אחריות.`,
            layout: 'centered',
            heroStyle: 'gradient',
            badgeText: '📍 שירות מהיר באזורכם',
            buttonsVisible: true,
            primaryButton: { text: 'חייגו עכשיו לייעוץ', url: `tel:${phone}` },
            secondaryButton: { text: 'הודעה בוואטסאפ', url: `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}` },
            imageUrl: getSmartPlaceholderImage('hero', 1),
            imageSrc: getSmartPlaceholderImage('hero', 1),
          },
        },
        {
          sectionType: 'geoLocal',
          stepTitle: 'הגדרת אזורי שירות ומיקום (GEO Local)',
          statusText: 'מייצר מפת הגעה, פרטי התקשרות ואיזורי הגעה מהירים...',
          data: {
            businessName: companyName,
            targetCity: 'תל אביב והמרכז',
            targetRegion: 'גוש דן והשרון',
            serviceAreas: ['תל אביב', 'רמת גן', 'גבעתיים', 'פתח תקווה', 'הרצליה', 'חולון'],
            address,
            phone,
            email,
            whatsapp,
            workingHours: 'א׳-ה׳: 08:30 - 19:30 | ו׳: 08:30 - 13:30',
          },
        },
        {
          sectionType: 'services',
          stepTitle: 'סל השירותים המקומי (Services)',
          statusText: 'מפרט תחומי התמחות עם אייקונים מקצועיים...',
          data: {
            title: 'השירותים שאנחנו מספקים',
            subtitle: 'פתרון מותאם אישית לכל לקוח עם אחריות מלאה',
            layout: 'grid',
            items: [
              { id: 'g1', title: 'שירות ואבחון מהיר', description: 'הגעה בזמנים קצרים ומענה מקיף במקום.', icon: 'Zap' },
              { id: 'g2', title: 'צוות מוסמך ומנוסה', description: 'שנים של ידע וניסיון עם הציוד המוביל.', icon: 'ShieldCheck' },
              { id: 'g3', title: 'שקיפות והצעת מחיר הוגנת', description: 'בלי הפתעות במחיר – הכל גלוי ומוסכם מראש.', icon: 'CheckCircle2' },
              { id: 'g4', title: 'אחריות מקיפה על העבודה', description: 'שקט נפשי מלא לאורך זמן.', icon: 'Award' },
            ],
          },
        },
        {
          sectionType: 'statsBento',
          stepTitle: 'הישגים ומספרים מקומיים (Stats Bento)',
          statusText: 'מציג מדדי אמינות ומהירות...',
          data: {
            title: 'העוצמה שלנו במספרים',
            subtitle: 'עובדות מדויקות שמדברות בעד עצמן',
            layout: 'bento-4',
            stats: [
              { number: '15 דק׳', label: 'זמן מענה ממוצע', description: 'פניות WhatsApp וטלפון' },
              { number: '99%', label: 'שביעות רצון', description: 'לפי דירוג לקוחות מאומת' },
              { number: '10+', label: 'שנות ניסיון', description: 'פעילות רצופה ומובילה' },
              { number: '100%', label: 'אחריות מלאה', description: 'על כל שירות וביצוע' },
            ],
          },
        },
        {
          sectionType: 'faq',
          stepTitle: 'שאלות נפוצות של לקוחות (FAQ)',
          statusText: 'מענה על זמני הגעה, מחירים ואחריות...',
          data: {
            title: 'שאלות נפוצות על השירות',
            subtitle: 'כל מה שחשוב לדעת לפני שיוצרים קשר',
            items: [
              { question: 'מהם זמני המענה וההגעה שלכם?', answer: `אנחנו זמינים בימים א׳-ה׳ בין 08:30 ל-19:30 ומספקים מענה טלפוני מהיר בטלפון ${phone}.` },
              { question: 'באילו אזורים אתם נותנים שירות?', answer: `אזור הפעילות המרכזי הוא ${address} וסביבתה, כולל גוש דן והמרכז.` },
              { question: 'האם ניתן לפנות ישירות בוואטסאפ?', answer: `בהחלט, ניתן ללחוץ על כפתור הוואטסאפ ולשלוח הודעה ישירה למספר ${whatsapp}.` },
            ],
          },
        },
        {
          sectionType: 'contact',
          stepTitle: 'יצירת קשר מהירה (Contact)',
          statusText: 'מחבר כפתור וואטסאפ ישיר וטופס...',
          data: {
            title: 'צריכים שירות מיידי או הצעת מחיר?',
            subtitle: 'צרו איתנו קשר עכשיו ונשמח לעמוד לשירותכם',
            phone,
            email,
            address,
            whatsapp,
            directWhatsappChat: true,
            showForm: true,
          },
        },
      ];
    }

    // 3. Knowledge / Course / Lead-Magnet Architecture (Hero -> RichContent -> BeforeAfter -> Testimonials -> FAQ -> Contact)
    if (isCourseOrKnowledge) {
      return [
        {
          sectionType: 'hero',
          stepTitle: 'בניית Hero לימודי / מגנט לידים',
          statusText: 'יוצר כותרת ידע מסקרנת, באדג׳ מדריך, והנעה להורדה...',
          data: {
            title: `המדריך המלא להצלחה מבית ${companyName}`,
            subtitle: slogan || 'כל הידע, הכלים והשיטות במקום אחד מסודר',
            description: 'גלו את הסודות והתובנות המעשיות שיאפשרו לכם לחסוך טעויות יקרות ולהתקדם במהירות.',
            layout: 'split',
            heroStyle: 'mesh-glow',
            badgeText: '📘 מדריך והכשרה מקצועית',
            buttonsVisible: true,
            primaryButton: { text: 'קבלו גישה מיידית', url: '#contact' },
            secondaryButton: { text: 'קראו על התוכנית', url: '#richContent' },
            socialProofEnabled: true,
            socialProofText: 'מעל 1,800 נרשמים כבר לומדים ומיישמים',
            imageUrl: getSmartPlaceholderImage('course', 0),
            imageSrc: getSmartPlaceholderImage('course', 0),
          },
        },
        {
          sectionType: 'richContent',
          stepTitle: 'תוכן עומק וסילבוס מקצועי (Rich Content)',
          statusText: 'פורס את שלבי הלמידה והערך המקצועי...',
          data: {
            title: 'מה תלמדו ומה תפיקו מהתוכנית?',
            subtitle: 'שלב אחר שלב – מתיאוריה לפרקטיקה מעשית',
            content: `בתוכנית זו ריכזנו עבורכם את כל הניסיון שנצבר ב-${companyName}. תוכלו ליישם מיד את הכלים, לשפר את הביצועים ולקבל ליווי ותשובות לכל שאלה.`,
            features: [
              'מודול 1: יסודות ועקרונות מפתח להצלחה',
              'מודול 2: שיטות עבודה וכלים פרקטיים',
              'מודול 3: מניעת טעויות נפוצות וקיצור זמנים',
              'מודול 4: תוכנית פעולה מותאמת אישית',
            ],
          },
        },
        {
          sectionType: 'beforeAfter',
          stepTitle: 'השוואת לפני ואחרי (Before / After Transformation)',
          statusText: 'מדגים את השינוי הדרמטי שהמשתתפים חווים...',
          data: {
            title: 'הטרנספורמציה שלכם איתנו',
            subtitle: 'ההבדל בין עבודה עצמאית לבין שימוש בשיטה המוכחת',
            beforeTitle: 'לפני התוכנית',
            beforePoints: [
              'תחושת בלבול וחוסר בהירות לגבי הצעד הבא',
              'בזבוז זמן על ניסוי וטעייה מיותרים',
              'היעדר שיטה מסודרת ועקבית',
            ],
            afterTitle: 'אחרי התוכנית איתנו',
            afterPoints: [
              'בהירות מלאה ותוכנית עבודה יומית ברורה',
              'חיסכון משמעותי בזמן ומשאבים',
              'תוצאות מדודות ויכולת שכפול לאורך זמן',
            ],
          },
        },
        {
          sectionType: 'testimonials',
          stepTitle: 'חוות דעת של בוגרים (Testimonials)',
          statusText: 'מציג הצלחות של בוגרים...',
          data: {
            title: 'מה מספרים הבוגרים שלנו?',
            subtitle: 'חוויות אמיתיות של אלו שכבר עשו את התהליך',
            layout: 'grid',
            items: [
              { id: 'km1', name: 'מיכל לוי', role: 'בוגרת התוכנית', quote: 'ההסברים חדים, מדויקים ופרקטיים. שינה לי את כל דרך העבודה.', rating: 5 },
              { id: 'km2', name: 'איתי שגב', role: 'יזם', quote: 'שווה פי עשרה מהעלות. קיבלתי כלים שלא מצאתי בשום מקום אחר.', rating: 5 },
            ],
          },
        },
        {
          sectionType: 'faq',
          stepTitle: 'שאלות ותשובות על התוכנית (FAQ)',
          statusText: 'מענה על פורמט התוכן, גישה ותמיכה...',
          data: {
            title: 'שאלות נפוצות',
            subtitle: 'כל מה שחשוב לדעת',
            items: [
              { question: 'האם התוכן מתאים גם למתחילים?', answer: 'כן, התוכנית בנויה בהדרגה כך שכל אחד יכול להבין וליישם בקלות.' },
              { question: 'לכמה זמן יש לי גישה לחומרים?', answer: 'הגישה הינה ללא הגבלת זמן, כולל עדכונים עתידיים ללא עלות נוספת.' },
              { question: 'איך יוצרים קשר אם משהו לא ברור?', answer: `ניתן לפנות ישירות לצוות התמיכה בטלפון ${phone} או בדוא״ל ${email}.` },
            ],
          },
        },
        {
          sectionType: 'contact',
          stepTitle: 'טופס הצטרפות וקבלת גישה (Contact)',
          statusText: 'הזנת פרטי התקשרות אמיתיים...',
          data: {
            title: 'הירשמו עכשיו וקבלו גישה מיידית',
            subtitle: 'מלאו את הפרטים והתוכן יישלח אליכם ישירות לדוא״ל',
            phone,
            email,
            address,
            whatsapp,
            directWhatsappChat: true,
            showForm: true,
          },
        },
      ];
    }

    // 4. Default Holistic Dynamic Architecture (Hero -> Services -> StatsBento -> Testimonials -> FAQ -> Contact)
    return [
      {
        sectionType: 'hero',
        stepTitle: 'בניית אזור ראשי ממיר (Hero 2.0)',
        statusText: 'יוצר כותרת ענק, באדג׳ הכרזה, והוכחה חברתית...',
        data: {
          title: `הפתרון השלם מבית ${companyName}`,
          subtitle: slogan || 'איכות, מקצועיות ותוצאות מוכחות בשטח',
          description: 'פתרון הוליסטי ומקיף המותאם לצרכים שלכם, עם שירות ללא פשרות וליווי מלא לאורך כל הדרך.',
          layout: 'split',
          heroStyle: 'mesh-glow',
          badgeText: 'המובילים בישראל לשנת 2026',
          buttonsVisible: true,
          primaryButton: { text: 'התחילו עכשיו', url: '#contact' },
          secondaryButton: { text: 'למידע נוסף', url: '#services' },
          socialProofEnabled: true,
          socialProofText: 'מעל 2,400 לקוחות מרוצים כבר איתנו',
          imageUrl: getSmartPlaceholderImage('hero', 0),
          imageSrc: getSmartPlaceholderImage('hero', 0),
        },
      },
      {
        sectionType: 'services',
        stepTitle: 'הקמת רשת יתרונות ושירותים (Services Grid)',
        statusText: 'מרכיב כרטיסי שירות עם אייקונים ותיאורי ערך מנצחים...',
        data: {
          title: 'למה לבחור דווקא בנו?',
          subtitle: 'ארבעה עמודי תווך שהופכים אותנו לבחירה הטבעית של לקוחותינו',
          layout: 'grid',
          items: [
            { id: 'srv-1', title: 'מקצועיות ומומחיות מוכחת', description: 'צוות מוסמך עם שנים של ניסיון והצלחות בשטח.', icon: 'ShieldCheck' },
            { id: 'srv-2', title: 'מענה מהיר וזמינות גבוהה', description: 'אנחנו כאן בשבילכם עם תמיכה מסורה ויחס אישי מהיר.', icon: 'Zap' },
            { id: 'srv-3', title: 'טכנולוגיה וחדשנות מתקדמת', description: 'הכלים והפתרונות החדשניים ביותר שחוסכים לכם זמן וכסף.', icon: 'Sparkles' },
            { id: 'srv-4', title: 'שקיפות ואחריות מלאה', description: 'בלי אותיות קטנות – הכל גלוי, מוגדר וברור מראש.', icon: 'CheckCircle2' },
          ],
        },
      },
      {
        sectionType: 'statsBento',
        stepTitle: 'בניית אזור נתונים והישגים (Stats Bento)',
        statusText: 'יוצר מדדי הצלחה ויזואליים להגברת האמון...',
        data: {
          title: 'העוצמה שלנו במספרים',
          subtitle: 'תוצאות מדויקות שמדברות בעד עצמן',
          layout: 'bento-4',
          stats: [
            { number: '98%', label: 'שביעות רצון לקוחות', description: 'לפי סקר איכות שירות חודשי' },
            { number: '15k+', label: 'פעולות מוצלחות', description: 'נמדדו במערכת' },
            { number: '24/7', label: 'תמיכה וזמינות', description: 'מענה אנושי מהיר' },
            { number: '100%', label: 'אחריות לתוצאה', description: 'עמידה בסטנדרטים הגבוהים ביותר' },
          ],
        },
      },
      {
        sectionType: 'testimonials',
        stepTitle: 'הטמעת ביקורות והוכחה חברתית (Testimonials)',
        statusText: 'בונה ציטוטים ודירוגי כוכבים מלקוחות מאומתים...',
        data: {
          title: 'מה הלקוחות שלנו מספרים?',
          subtitle: 'חוויות אמיתיות של אלו שכבר עשו את הצעד',
          layout: 'grid',
          items: [
            { id: 'test-1', name: 'יוסי כהן', role: 'מנכ״ל ובעלים', quote: 'העבודה מול הצוות שינתה לנו את כל תפיסת השירות. המקצועיות והמהירות פשוט יוצאות דופן.', rating: 5 },
            { id: 'test-2', name: 'מיכל לוי', role: 'מנהלת תפעול', quote: 'חיפשנו פתרון אמין לאורך זמן ומצאנו שותפים אמיתיים לדרך. מומלץ בחום לכל מי שמעריך איכות.', rating: 5 },
            { id: 'test-3', name: 'דניאל שרון', role: 'יזם עצמאי', quote: 'התוצאות הגיעו הרבה יותר מהר ממה שציפינו. השקיפות והיחס האישי שווים כל שקל.', rating: 5 },
          ],
        },
      },
      {
        sectionType: 'faq',
        stepTitle: 'מענה על שאלות נפוצות והתנגדויות (FAQ)',
        statusText: 'מסיר חסמי המרה באמצעות תשובות מפורטות...',
        data: {
          title: 'שאלות ותשובות נפוצות',
          subtitle: 'כל מה שחשוב לדעת לפני שמקבלים החלטה',
          items: [
            { question: 'איך מתחילים וכמה זמן לוקח התהליך?', answer: `ההצטרפות פשוטה ומהירה – צרו קשר בטלפון ${phone} או בטופס ונחזור אליכם מיידית.` },
            { question: 'האם יש התחייבות לתקופה ארוכה?', answer: 'ממש לא. אנחנו מאמינים בחופש בחירה ובאיכות השירות שלנו, לכן ניתן לבטל או לשנות מסלול בכל עת.' },
            { question: 'מה קורה אם יש לי שאלה או בעיה?', answer: `מוקד השירות והתמיכה שלנו זמין עבורכם בערוצי WhatsApp (${whatsapp}), דוא״ל וטלפון עם זמני מענה קצרים במיוחד.` },
            { question: 'האם המערכת מאובטחת ועומדת בתקנים?', answer: 'בהחלט. כל הנתונים מוצפנים לפי תקני האבטחה המחמירים ביותר (SSL/TLS).' },
          ],
        },
      },
      {
        sectionType: 'contact',
        stepTitle: 'הקמת אזור יצירת קשר והנעה לפעולה (Contact)',
        statusText: 'מחבר כפתור WhatsApp ישיר וטופס לידים מותאם...',
        data: {
          title: 'מוכנים לעשות את הצעד הבא?',
          subtitle: 'השאירו פרטים ונחזור אליכם בהקדם, או צרו קשר ישיר בוואטסאפ',
          phone,
          email,
          address,
          whatsapp,
          directWhatsappChat: true,
          showForm: true,
        },
      },
    ];
  },
};
