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

export const aiPageGenerator = {
  /**
   * Generates 6 marketing angles derived continuously from Brand DNA
   */
  async generatePageIdeas(
    brandDna?: BrandDna | null,
    providedApiKey?: string
  ): Promise<MarketingIdea[]> {
    const companyName = brandDna?.identity?.companyName || 'העסק המוביל';
    const purpose = brandDna?.identity?.organizationPurpose || '';
    const targetAudiences = brandDna?.audience?.targetAudiences || [];
    const uvp = brandDna?.audience?.mainUvp || '';
    const objections = brandDna?.audience?.commonObjections || [];

    // Fallback set of 6 distinct concepts (Rule: NEVER return only 1 or empty)
    const fallbackIdeas: MarketingIdea[] = [
      {
        id: 'sales-ultimatum',
        title: 'משפך מכירה והשקת VIP',
        description: 'דף נחיתה ישיר וממיר עם חבילות מחיר שקופות, ביקורות לקוחות ותחושת דחיפות לסגירת החודש.',
        prompt: `דף מכירה והשקה יוקרתי וממיר עבור ${companyName}, כולל כותרת Hero מפוצלת, כרטיסי יתרונות, מחירון חבילות, הוכחה חברתית וטופס הצטרפות מהיר.`,
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
    const primaryColor = brandDna?.designTokens?.primaryColor || '#6366f1';
    const secondaryColor = brandDna?.designTokens?.secondaryColor || '#0ea5e9';
    const companyName = brandDna?.identity?.companyName || 'החברה המובילה';
    const slogan = brandDna?.identity?.slogan || 'חדשנות, איכות וצמיחה מתמדת';
    const logoUrl = brandDna?.identity?.logoUrl || '';
    const phone = brandDna?.trust?.contactPhone || '03-1234567';
    const email = brandDna?.trust?.contactEmail || 'contact@example.com';
    const whatsapp = brandDna?.trust?.whatsappSupportNumber || '0501234567';
    const address = brandDna?.trust?.officeAddress || 'תל אביב, ישראל';

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
        backgroundColor: brandDna?.designTokens?.backgroundColor || '#ffffff',
        textColor: brandDna?.designTokens?.textColor || '#0f172a',
        fontFamily: brandDna?.designTokens?.fontFamily || 'Heebo, sans-serif',
        borderRadius: brandDna?.designTokens?.borderRadius || 'md',
        buttonStyle: brandDna?.designTokens?.buttonStyle || 'gradient',
        contactWhatsApp: whatsapp,
        contactPhone: phone,
        contactEmail: email,
        address,
        brandDnaSynced: !!brandDna,
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

      const secData = {
        ...step.data,
        id: secId,
        type: sectionType,
        visible: true,
      };

      // Ensure rich visual assets are attached if needed
      if (options?.generateImages ?? true) {
        if (sectionType === 'hero' && !secData.imageUrl) {
          secData.imageUrl = getSmartPlaceholderImage('hero', i);
        }
        if (sectionType === 'services' && Array.isArray(secData.items)) {
          secData.items = secData.items.map((it: any, itemIdx: number) => ({
            ...it,
            imageUrl: it.imageUrl || getSmartPlaceholderImage('service', itemIdx),
          }));
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

      // Smooth step pacing for streaming experience
      await new Promise((resolve) => setTimeout(resolve, 450));
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
   * NEVER returns 1 section! Always produces a rich, interconnected 6-section blueprint.
   */
  getFullSkeletonFallback(
    prompt: string,
    companyName: string,
    slogan: string,
    brandDna?: BrandDna | null
  ): any[] {
    const isSales = prompt.includes('מכיר') || prompt.includes('מחיר') || prompt.includes('חבילה');
    const isGeo = prompt.includes('מקומי') || prompt.includes('אזור') || prompt.includes('עיר') || prompt.includes('GEO');
    const isCommunity = prompt.includes('קהילה') || prompt.includes('מועדון') || prompt.includes('חברים');

    const primaryColor = brandDna?.designTokens?.primaryColor || '#6366f1';

    return [
      // 1. Hero
      {
        sectionType: 'hero',
        stepTitle: 'בניית אזור ראשי ממיר (Hero 2.0)',
        statusText: 'יוצר כותרת ענק, באדג׳ הכרזה, והוכחה חברתית...',
        data: {
          title: isSales
            ? `ההזדמנות הבלעדית שלכם עם ${companyName}`
            : isGeo
            ? `השירות המקצועי המוביל באזורכם - ${companyName}`
            : `הפתרון השלם מבית ${companyName}`,
          subtitle: slogan || 'איכות, מקצועיות ותוצאות מוכחות בשטח',
          description: 'פתרון הוליסטי ומקיף המותאם לצרכים שלכם, עם שירות ללא פשרות וליווי מלא לאורך כל הדרך.',
          layout: 'split',
          heroStyle: 'mesh-glow',
          badgeText: isSales ? 'הטבה מוגבלת בזמן' : 'המובילים בישראל לשנת 2026',
          buttonsVisible: true,
          primaryButton: { text: isSales ? 'לרכישה מיידית' : 'התחילו עכשיו', url: isSales ? '#pricing' : '#contact' },
          secondaryButton: { text: 'למידע נוסף', url: '#services' },
          socialProofEnabled: true,
          socialProofText: 'מעל 2,400 לקוחות מרוצים כבר איתנו',
          imageUrl: getSmartPlaceholderImage('hero', 0),
        },
      },
      // 2. Services / Value Grid
      {
        sectionType: 'services',
        stepTitle: 'הקמת רשת יתרונות ושירותים (Services Grid)',
        statusText: 'מרכיב כרטיסי שירות עם אייקונים ותיאורי ערך מנצחים...',
        data: {
          title: 'למה לבחור דווקא בנו?',
          subtitle: 'ארבעה עמודי תווך שהופכים אותנו לבחירה הטבעית של לקוחותינו',
          layout: 'grid',
          items: [
            {
              id: 'srv-1',
              title: 'מקצועיות ומומחיות מוכחת',
              description: 'צוות מוסמך עם שנים של ניסיון והצלחות בשטח.',
              icon: 'ShieldCheck',
            },
            {
              id: 'srv-2',
              title: 'מענה מהיר וזמינות גבוהה',
              description: 'אנחנו כאן בשבילכם עם תמיכה מסורה ויחס אישי מהיר.',
              icon: 'Zap',
            },
            {
              id: 'srv-3',
              title: 'טכנולוגיה וחדשנות מתקדמת',
              description: 'הכלים והפתרונות החדשניים ביותר שחוסכים לכם זמן וכסף.',
              icon: 'Sparkles',
            },
            {
              id: 'srv-4',
              title: 'שקיפות ואחריות מלאה',
              description: 'בלי אותיות קטנות – הכל גלוי, מוגדר וברור מראש.',
              icon: 'CheckCircle2',
            },
          ],
        },
      },
      // 3. Stats Bento
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
      // 4. Testimonials (Social Proof)
      {
        sectionType: 'testimonials',
        stepTitle: 'הטמעת ביקורות והוכחה חברתית (Testimonials)',
        statusText: 'בונה ציטוטים ודירוגי כוכבים מלקוחות מאומתים...',
        data: {
          title: 'מה הלקוחות שלנו מספרים?',
          subtitle: 'חוויות אמיתיות של אלו שכבר עשו את הצעד',
          layout: 'grid',
          items: [
            {
              id: 'test-1',
              name: 'יוסי כהן',
              role: 'מנכ״ל ובעלים',
              quote: 'העבודה מול הצוות שינתה לנו את כל תפיסת השירות. המקצועיות והמהירות פשוט יוצאות דופן.',
              rating: 5,
            },
            {
              id: 'test-2',
              name: 'מיכל לוי',
              role: 'מנהלת תפעול',
              quote: 'חיפשנו פתרון אמין לאורך זמן ומצאנו שותפים אמיתיים לדרך. מומלץ בחום לכל מי שמעריך איכות.',
              rating: 5,
            },
            {
              id: 'test-3',
              name: 'דניאל שרון',
              role: 'יזם עצמאי',
              quote: 'התוצאות הגיעו הרבה יותר מהר ממה שציפינו. השקיפות והיחס האישי שווים כל שקל.',
              rating: 5,
            },
          ],
        },
      },
      // 5. FAQ (Addressing Objections)
      {
        sectionType: 'faq',
        stepTitle: 'מענה על שאלות נפוצות והתנגדויות (FAQ)',
        statusText: 'מסיר חסמי המרה באמצעות תשובות מפורטות...',
        data: {
          title: 'שאלות ותשובות נפוצות',
          subtitle: 'כל מה שחשוב לדעת לפני שמקבלים החלטה',
          items: [
            {
              question: 'איך מתחילים וכמה זמן לוקח התהליך?',
              answer: 'ההצטרפות פשוטה ומהירה – מיד עם השארת הפרטים או ההרשמה, נציג מטעמנו יוצר קשר ומספק גישה מיידית.',
            },
            {
              question: 'האם יש התחייבות לתקופה ארוכה?',
              answer: 'ממש לא. אנחנו מאמינים בחופש בחירה ובאיכות השירות שלנו, לכן ניתן לבטל או לשנות מסלול בכל עת ללא אותיות קטנות.',
            },
            {
              question: 'מה קורה אם יש לי שאלה או בעיה?',
              answer: 'מוקד השירות והתמיכה שלנו זמין עבורכם בערוצי WhatsApp, דוא״ל וטלפון עם זמני מענה קצרים במיוחד.',
            },
            {
              question: 'האם המערכת מאובטחת ועומדת בתקנים?',
              answer: 'בהחלט. כל הנתונים מוצפנים לפי תקני האבטחה המחמירים ביותר (SSL/TLS) וסליקה מאובטחת בתקן PCI.',
            },
          ],
        },
      },
      // 6. Contact / Call to Action
      {
        sectionType: 'contact',
        stepTitle: 'הקמת אזור יצירת קשר והנעה לפעולה (Contact)',
        statusText: 'מחבר כפתור WhatsApp ישיר וטופס לידים מותאם...',
        data: {
          title: 'מוכנים לעשות את הצעד הבא?',
          subtitle: 'השאירו פרטים ונחזור אליכם בהקדם, או צרו קשר ישיר בוואטסאפ',
          phone: brandDna?.trust?.contactPhone || '03-1234567',
          email: brandDna?.trust?.contactEmail || 'contact@example.com',
          address: brandDna?.trust?.officeAddress || 'תל אביב, ישראל',
          directWhatsappChat: true,
          showForm: true,
        },
      },
    ];
  },
};
