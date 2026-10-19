import { PageBuilderConfig } from '../types/pageBuilder.types';
import { PageTemplateBlueprint } from '../types';
import { SECTION_REGISTRY } from '../registry/sectionRegistry';
import { hydrateSectionWithBrandDna } from '../services/brandSectionHydrator';

/**
 * 6 Core Archive Blueprints (7 אזורים לכל ארכיון) + Specialized Blueprints
 */

let _cachedBlueprints: PageTemplateBlueprint[] | null = null;

export function getPageBlueprints(): PageTemplateBlueprint[] {
  if (_cachedBlueprints) return _cachedBlueprints;

  _cachedBlueprints = [
    // 1. Content Pages Archive (עמודי תוכן ומאמרים - KOSINFO)
    {
      id: 'content-archive',
      title: 'תבנית ארכיון עמודי תוכן ומאמרים (KOSINFO)',
      category: 'content',
      description: 'מבנה 7 אזורים עשיר לעמודי תוכן: Hero מאמר, RichContent גוף מאמר עשיר, StatsBento נתונים ומחקרים, FAQ שאלות נפוצות, Testimonials ביקורות קוראים, Community קהילת קוראים ו-Contact הרשמה לניוזלטר והורדת PDF.',
      badge: '7 אזורים • KOSINFO',
      icon: 'BookOpen',
      sectionTypes: ['hero', 'richContent', 'statsBento', 'faq', 'testimonials', 'community', 'contact'],
      config: {
        pageId: 'bp-kosinfo-guide',
        pageTitle: 'המדריך המלא והמעשי לתוצאות מקצועיות',
        slug: 'kosinfo-master-guide',
        pageCategory: 'info_content',
        published: false,
        isHomePage: false,
        viewsCount: 0,
        leadsCount: 0,
        globalSettings: {
          siteTitle: 'מרכז התוכן והידע המקצועי',
          companyName: 'קמונה פתרונות דיגיטליים',
          slogan: 'תובנות מעשיות, מחקרים וידע עמוק למקבלי החלטות',
          theme: 'modern',
          headerLayout: 'capsule-floating',
          headerSticky: true,
          isHeaderVisible: true,
          isFooterVisible: true,
          primaryColor: '#059669',
          secondaryColor: '#0284c7',
          backgroundColor: '#090a0f',
          textColor: '#f8fafc',
          fontFamily: 'Heebo, sans-serif',
          borderRadius: 'lg',
          buttonStyle: 'gradient',
          contactWhatsApp: '0526968008',
          contactPhone: '052-6968008',
          contactEmail: 'ovt5771@gmail.com',
          address: 'דרך מנחם בגין 144, תל אביב',
        },
        seoSettings: {
          title: 'המדריך המקיף לבכירים ומנהלים - קריאה ישירה',
          description: 'מאמר עומק מקיף הכולל עקרונות פעולה, מחקרי שוק ותובנות אסטרטגיות שחייבים להכיר.',
          keywords: ['תוכן', 'מאמר עומק', 'מדריך', 'ידע מקצועי', 'בלוג'],
        },
        sectionOrder: ['hero-1', 'richContent-1', 'statsBento-1', 'faq-1', 'testimonials-1', 'community-1', 'contact-1'],
        sections: {
          'hero-1': {
            ...SECTION_REGISTRY.hero.defaultConfig,
            id: 'hero-1',
            title: 'המתודולוגיה השלמה לבניית יתרון תחרותי ומצוינות',
            subtitle: 'מאת מומחי האסטרטגיה והתוכן המובילים בתעשייה',
            description: 'ניתוח מעמיק של התהליכים, הכלים והעקרונות שמאפשרים לצמוח בעקביות ובאיכות ללא פשרות.',
            layout: 'split',
            heroStyle: 'mesh-glow',
            badgeText: 'מאמר מקצועי • זמן קריאה: 6 דקות',
            buttonsVisible: true,
            primaryButton: { text: 'הורדת המדריך המלא (PDF)', url: '#contact' },
            secondaryButton: { text: 'קריאת המאמר', url: '#richContent' },
          },
          'richContent-1': {
            ...SECTION_REGISTRY.richContent.defaultConfig,
            id: 'richContent-1',
            heading: 'עקרונות הליבה של השיטה',
            subtitle: 'שלושת עמודי התווך של מצוינות תפעולית ואסטרטגית',
          },
          'statsBento-1': {
            ...SECTION_REGISTRY.statsBento.defaultConfig,
            id: 'statsBento-1',
            title: 'השפעה בשטח ומחקר אמפירי',
          },
          'faq-1': {
            ...SECTION_REGISTRY.faq.defaultConfig,
            id: 'faq-1',
            title: 'שאלות ותשובות בנושא המאמר',
            subtitle: 'מענה מפורט לשאלות מפתח שעלו מהקוראים',
          },
          'testimonials-1': {
            ...SECTION_REGISTRY.testimonials.defaultConfig,
            id: 'testimonials-1',
            title: 'מה קוראים בכירים אומרים על המדריך?',
            subtitle: 'משובים וחוות דעת של מובילי דעה ומנהלים',
          },
          'community-1': {
            ...SECTION_REGISTRY.community.defaultConfig,
            id: 'community-1',
            title: 'הצטרפו לקהילת מקבלי ההחלטות',
            subtitle: 'קבלו עדכונים שוטפים, ניתוחי עומק ומפגשים סגורים',
          },
          'contact-1': {
            ...SECTION_REGISTRY.contact.defaultConfig,
            id: 'contact-1',
            title: 'קבלו את המדריך המלא ישירות למייל',
            subtitle: 'הזינו פרטים קצרים ועותק PDF יישלח אליכם באופן מיידי',
          },
        },
      },
    },

    // 2. Events Archive (עמודי אירועים וכנסים - KOSEVENT)
    {
      id: 'event-archive',
      title: 'תבנית ארכיון עמודי אירועים וכנסים (KOSEVENT)',
      category: 'events',
      description: 'מבנה 7 אזורים מלא לאירועים וכנסים: Hero אירוע, Timer ספירה לאחור, EventRsvp אישור הגעה ויומן, RichContent אג\'נדה ולו"ז, StatsBento נתוני אירוע, FAQ שאלות נפוצות ו-Contact מוקד הפקה.',
      badge: '7 אזורים • KOSEVENT',
      icon: 'Calendar',
      sectionTypes: ['hero', 'timer', 'eventRsvp', 'richContent', 'statsBento', 'faq', 'contact'],
      config: {
        pageId: 'bp-kosevent-summit',
        pageTitle: 'כנס המנהיגות והחדשנות השנתי 2026',
        slug: 'kosevent-annual-summit',
        pageCategory: 'event',
        published: false,
        isHomePage: false,
        viewsCount: 0,
        leadsCount: 0,
        globalSettings: {
          siteTitle: 'כנס החדשנות השנתי 2026',
          companyName: 'קמונה הפקות וכנסים',
          slogan: 'המפגש השנתי המרכזי של קהילת העסקים והטכנולוגיה',
          theme: 'modern',
          headerLayout: 'capsule-floating',
          headerSticky: true,
          isHeaderVisible: true,
          isFooterVisible: true,
          primaryColor: '#f59e0b',
          secondaryColor: '#ef4444',
          backgroundColor: '#0c0a09',
          textColor: '#fef3c7',
          fontFamily: 'Heebo, sans-serif',
          borderRadius: 'lg',
          buttonStyle: 'gradient',
          contactWhatsApp: '0526968008',
          contactPhone: '052-6968008',
          contactEmail: 'ovt5771@gmail.com',
          address: 'דרך מנחם בגין 144, תל אביב',
        },
        seoSettings: {
          title: 'כנס החדשנות והמנהיגות 2026 - שריון מקום מיידי',
          description: 'הצטרפו למאות משתתפים בכנס המוביל של השנה. הרצאות מומחים, נטוורקינג יוקרתי וכלים מעשיים.',
          keywords: ['כנס', 'אירוע', 'RSVP', 'חדשנות', 'הרשמה'],
        },
        sectionOrder: ['hero-1', 'timer-1', 'eventRsvp-1', 'richContent-1', 'statsBento-1', 'faq-1', 'contact-1'],
        sections: {
          'hero-1': {
            ...SECTION_REGISTRY.hero.defaultConfig,
            id: 'hero-1',
            title: 'כנס החדשנות והמנהיגות העסקית 2026',
            subtitle: 'יום חמישי, 20 בנובמבר | מרכז הכנסים, תל אביב',
            description: 'יום שלם של הרצאות עומק, חשיפת מגמות עתידיות, פאנלים של בכירים ונטוורקינג ברמה הגבוהה ביותר.',
            layout: 'split',
            heroStyle: 'mesh-glow',
            badgeText: 'ההרשמה המוקדמת נסגרת בקרוב',
            buttonsVisible: true,
            primaryButton: { text: 'הבטיחו את מקומכם (RSVP)', url: '#rsvp' },
            secondaryButton: { text: 'לצפייה בלוח הזמנים', url: '#agenda' },
          },
          'timer-1': {
            ...SECTION_REGISTRY.timer.defaultConfig,
            id: 'timer-1',
            title: 'האירוע המרכזי נפתח בעוד:',
            subtitle: 'המקומות באולם מוגבלים ל-250 משתתפים ראשונים בלבד',
            targetDate: '2026-11-20T18:00:00',
          },
          'eventRsvp-1': {
            ...SECTION_REGISTRY.eventRsvp.defaultConfig,
            id: 'eventRsvp-1',
            title: 'אישור הגעה ושריון כרטיס (RSVP)',
            subtitle: 'מלאו פרטים קצרים, שמרו ביומן וקבלו קישור הגעה ישיר ב-Waze',
          },
          'richContent-1': {
            ...SECTION_REGISTRY.richContent.defaultConfig,
            id: 'richContent-1',
            heading: 'לוח זמנים ואג\'נדת ההרצאות',
            subtitle: 'מפגשים מרתקים עם המומחים המובילים בישראל',
          },
          'statsBento-1': {
            ...SECTION_REGISTRY.statsBento.defaultConfig,
            id: 'statsBento-1',
            title: 'הכנס במספרים',
          },
          'faq-1': {
            ...SECTION_REGISTRY.faq.defaultConfig,
            id: 'faq-1',
            title: 'שאלות ותשובות למשתתפי הכנס',
            subtitle: 'חניה, דרכי הגעה, נגישות, תעודות השתתפות וכיבוד',
          },
          'contact-1': {
            ...SECTION_REGISTRY.contact.defaultConfig,
            id: 'contact-1',
            title: 'צוות ההפקה זמין עבורכם לכל שאלה',
            subtitle: 'פנו אלינו ב-WhatsApp לקבלת מענה מהיר',
          },
        },
      },
    },

    // 3. Checkout Pages Archive (דפי סליקה ומכירה - KOSCHECKOUT)
    {
      id: 'checkout-archive',
      title: 'תבנית ארכיון דפי סליקה ותשלום (KOSCHECKOUT)',
      category: 'checkout',
      description: 'משפך סליקה מושלם ב-7 אזורים: Hero הצעת ערך, Pricing חבילות ומסלולים, SmartForm טופס סליקה מאובטח, Timer הטבה מוגבלת בזמן, Testimonials לקוחות ממליצים, FAQ מדיניות ואבטחה ו-Contact תמיכה מהירה.',
      badge: '7 אזורים • KOSCHECKOUT',
      icon: 'CreditCard',
      sectionTypes: ['hero', 'pricing', 'smartForm', 'timer', 'testimonials', 'faq', 'contact'],
      config: {
        pageId: 'bp-koscheckout-deal',
        pageTitle: 'הצטרפות והסדרת תשלום מאובטח',
        slug: 'koscheckout-exclusive-offer',
        pageCategory: 'checkout',
        published: false,
        isHomePage: false,
        viewsCount: 0,
        leadsCount: 0,
        globalSettings: {
          siteTitle: 'סליקה ותשלום מאובטח',
          companyName: 'קמונה סליקה דיגיטלית',
          slogan: 'אבטחה מקסימלית, סליקה מהירה ושירות אישי',
          theme: 'modern',
          headerLayout: 'capsule-floating',
          headerSticky: true,
          isHeaderVisible: true,
          isFooterVisible: true,
          primaryColor: '#6366f1',
          secondaryColor: '#ec4899',
          backgroundColor: '#090a0f',
          textColor: '#f8fafc',
          fontFamily: 'Heebo, sans-serif',
          borderRadius: 'lg',
          buttonStyle: 'gradient',
          contactWhatsApp: '0526968008',
          contactPhone: '052-6968008',
          contactEmail: 'ovt5771@gmail.com',
          address: 'דרך מנחם בגין 144, תל אביב',
        },
        seoSettings: {
          title: 'הצטרפות מהירה וסליקה מאובטחת | מחיר היכרות מיוחד',
          description: 'רכשו בביטחון מלא עם הצפנת SSL ותקן PCI-DSS המחמיר ביותר. קבלה דיגיטלית מיידית.',
          keywords: ['סליקה', 'רכישה מאובטחת', 'מחירון', 'הזמנה', 'תשלום אשראי'],
        },
        sectionOrder: ['hero-1', 'pricing-1', 'smartForm-1', 'timer-1', 'testimonials-1', 'faq-1', 'contact-1'],
        sections: {
          'hero-1': {
            ...SECTION_REGISTRY.hero.defaultConfig,
            id: 'hero-1',
            title: 'השקעה מוכחת בעתיד ובהצלחה שלכם',
            subtitle: 'מחיר היכרות בלעדי לתקופת ההשקה • ביטול בכל עת',
            description: 'קבלו גישה מיידית לפתרון המלא עם כל הכלים, התמיכה והליווי האישי הנדרשים לזינוק אמיתי.',
            layout: 'split',
            heroStyle: 'mesh-glow',
            badgeText: 'סליקה מאובטחת SSL 256-bit',
            buttonsVisible: true,
            primaryButton: { text: 'בחרו חבילה והתקדמו לסליקה', url: '#pricing' },
            secondaryButton: { text: 'פרטים נוספים', url: '#faq' },
          },
          'pricing-1': {
            ...SECTION_REGISTRY.pricing.defaultConfig,
            id: 'pricing-1',
            title: 'בחרו את המסלול המתאים לכם ביותר',
            subtitle: 'תשלום שקוף, ללא אותיות קטנות וללא התחייבות',
          },
          'smartForm-1': {
            ...SECTION_REGISTRY.smartForm.defaultConfig,
            id: 'smartForm-1',
            title: 'השלמת ההזמנה וסליקה מאובטחת',
            subtitle: 'כרטיס אשראי, Bit או העברה בנקאית עם אישור מיידי',
          },
          'timer-1': {
            ...SECTION_REGISTRY.timer.defaultConfig,
            id: 'timer-1',
            title: 'הטבת הפריסייל מסתיימת בקרוב!',
            subtitle: 'הבטיחו את תנאי ההשקה המיוחדים לפני עליית המחיר',
          },
          'testimonials-1': {
            ...SECTION_REGISTRY.testimonials.defaultConfig,
            id: 'testimonials-1',
            title: 'מה לקוחות שכבר הצטרפו מספרים?',
            subtitle: 'ביקורות מאומתות ודירוגי שביעות רצון גבוהים',
          },
          'faq-1': {
            ...SECTION_REGISTRY.faq.defaultConfig,
            id: 'faq-1',
            title: 'שאלות ותשובות על התשלום והאבטחה',
            subtitle: 'מדיניות החזרים, חשבוניות מס ירוקות ואמצעי תשלום',
          },
          'contact-1': {
            ...SECTION_REGISTRY.contact.defaultConfig,
            id: 'contact-1',
            title: 'רוצים להתייעץ לפני שמבצעים תשלום?',
            subtitle: 'הצוות שלנו זמין עבורכם לייעוץ מהיר ב-WhatsApp',
          },
        },
      },
    },

    // 4. Community Pages Archive (דפי קהילה ומועדון - KOSCOMMUNITY)
    {
      id: 'community-archive',
      title: 'תבנית ארכיון דפי קהילה ומועדון VIP (KOSCOMMUNITY)',
      category: 'community',
      description: '7 אזורים למועדון חברים וקהילות VIP: Hero קהילתי, Community הטבות וזכויות חברים, StatsBento עוצמת הקהילה, LivePosts לוח פוסטים חי, Testimonials שיתופי פעולה, FAQ תנאי קבלה ו-Contact טופס הרשמה.',
      badge: '7 אזורים • KOSCOMMUNITY',
      icon: 'Users',
      sectionTypes: ['hero', 'community', 'statsBento', 'livePosts', 'testimonials', 'faq', 'contact'],
      config: {
        pageId: 'bp-koscommunity-hub',
        pageTitle: 'קהילת המובילים הרשמית - מועדון חברים סגור',
        slug: 'koscommunity-leaders-hub',
        pageCategory: 'community',
        published: false,
        isHomePage: false,
        viewsCount: 0,
        leadsCount: 0,
        globalSettings: {
          siteTitle: 'קהילת המובילים VIP',
          companyName: 'קמונה קהילת מנהיגים',
          slogan: 'נטוורקינג איכותי, שיתופי פעולה ותוכן בלעדי שאי אפשר למצוא בשום מקום אחר',
          theme: 'purple',
          headerLayout: 'capsule-floating',
          headerSticky: true,
          isHeaderVisible: true,
          isFooterVisible: true,
          primaryColor: '#a855f7',
          secondaryColor: '#ec4899',
          backgroundColor: '#0c0714',
          textColor: '#faf5ff',
          fontFamily: 'Heebo, sans-serif',
          borderRadius: 'full',
          buttonStyle: 'gradient',
          contactWhatsApp: '0526968008',
          contactPhone: '052-6968008',
          contactEmail: 'ovt5771@gmail.com',
        },
        seoSettings: {
          title: 'הצטרפו לקהילת המקצוענים המובילה בישראל | מפגשים ונטוורקינג',
          description: 'הבית של אנשי העשייה והמנהיגות. מפגשי חברים חודשיים, קבוצת דיונים סגורה והטבות בלעדיות.',
          keywords: ['קהילה', 'מועדון חברים', 'נטוורקינג', 'וובינרים סגורים', 'VIP'],
        },
        sectionOrder: ['hero-1', 'community-1', 'statsBento-1', 'livePosts-1', 'testimonials-1', 'faq-1', 'contact-1'],
        sections: {
          'hero-1': {
            ...SECTION_REGISTRY.hero.defaultConfig,
            id: 'hero-1',
            title: 'המקום שבו המובילים נפגשים, משתפים וצומחים יחד',
            subtitle: 'קהילה מקצועית סגורה לחברים בלבד • הרשמה למחזור הקרוב',
            description: 'הצטרפו למעגל של מאות אנשי מקצוע ומנהלים, וקבלו גישה ישירה למאגר ידע בלעדי, קשרים ועסקאות משותפות.',
            layout: 'spatial',
            heroStyle: 'mesh-glow',
            badgeText: 'ההרשמה למחזור הקרוב פתוחה כעת',
            buttonsVisible: true,
            primaryButton: { text: 'הגישו מועמדות להצטרפות', url: '#join' },
            secondaryButton: { text: 'הטבות לחברי הקהילה', url: '#benefits' },
          },
          'community-1': {
            ...SECTION_REGISTRY.community.defaultConfig,
            id: 'community-1',
            title: 'הטבות בלעדיות לחברי הקהילה',
            subtitle: 'כל מה שאתם מקבלים מהיום הראשון להצטרפותכם למועדון',
            memberCount: '3,800+',
          },
          'statsBento-1': {
            ...SECTION_REGISTRY.statsBento.defaultConfig,
            id: 'statsBento-1',
            title: 'עוצמת הקהילה במספרים',
          },
          'livePosts-1': {
            ...SECTION_REGISTRY.livePosts.defaultConfig,
            id: 'livePosts-1',
            title: 'עדכונים ודיונים חמים מהרשת הפנימית',
            subtitle: 'הצצה לפעילות השוטפת ולשיח הפורה בקבוצות החברים',
          },
          'testimonials-1': {
            ...SECTION_REGISTRY.testimonials.defaultConfig,
            id: 'testimonials-1',
            title: 'מה חברי הקהילה מספרים?',
            subtitle: 'הקשרים והעסקאות שנוצרו בזכות המפגשים',
          },
          'faq-1': {
            ...SECTION_REGISTRY.faq.defaultConfig,
            id: 'faq-1',
            title: 'שאלות ותשובות על מועדון החברים',
            subtitle: 'קריטריונים לקבלה, דמי חבר, מפגשים ותקנון הקהילה',
          },
          'contact-1': {
            ...SECTION_REGISTRY.contact.defaultConfig,
            id: 'contact-1',
            title: 'הבטיחו את מקומכם בקהילה עוד היום',
            subtitle: 'מלאו פרטים קצרים וצוות הקהילה יחזור אליכם לשיחת התאמה',
          },
        },
      },
    },

    // 5. Fundraising Campaign Pages Archive (דפי קמפיין לגיוס - KOSFUNRISE)
    {
      id: 'campaign-archive',
      title: 'תבנית ארכיון דפי קמפיין וגיוס תרומות (KOSFUNRISE)',
      category: 'campaign',
      description: 'מערך גיוס המונים ב-7 אזורים: מד יעד, סיפור מרגש, מדרגות תרומה, קיר תורמים, נתוני השפעה, סעיף 46 וקשרי תורמים.',
      badge: '7 אזורים • KOSFUNRISE',
      icon: 'Heart',
      sectionTypes: ['campaignHeader', 'hero', 'campaignTiers', 'campaignDonors', 'statsBento', 'faq', 'contact'],
      config: {
        pageId: 'bp-kosfunrise-campaign',
        pageTitle: 'קמפיין שותפות ונתינה - ביחד מייצרים שינוי',
        slug: 'kosfunrise-partnership-goal',
        pageCategory: 'fundraising',
        published: false,
        isHomePage: false,
        viewsCount: 0,
        leadsCount: 0,
        globalSettings: {
          siteTitle: 'קמפיין שותפות ונתינה 2026',
          companyName: 'עמותת קמונה חסד ונתינה',
          slogan: 'כל תרומה מוכפלת ומגיעה ישירות למי שזקוק לה',
          theme: 'sunset',
          headerLayout: 'capsule-floating',
          headerSticky: true,
          isHeaderVisible: true,
          isFooterVisible: true,
          primaryColor: '#f43f5e',
          secondaryColor: '#f59e0b',
          backgroundColor: '#0f0709',
          textColor: '#fff1f2',
          fontFamily: 'Heebo, sans-serif',
          borderRadius: 'lg',
          buttonStyle: 'gradient',
          contactWhatsApp: '0526968008',
          contactPhone: '052-6968008',
          contactEmail: 'ovt5771@gmail.com',
          address: 'דרך מנחם בגין 144, תל אביב',
        },
        seoSettings: {
          title: 'קמפיין שותפות וגיוס - תרומה מוכרת לפי סעיף 46',
          description: 'היו שותפים בעשייה מצילת חיים. תרומה מאובטחת בכרטיס אשראי, ביט והעברה בנקאית עם קבלה מיידית.',
          keywords: ['תרומות', 'סעיף 46', 'קמפיין גיוס', 'עמותה'],
        },
        sectionOrder: ['campHeader-1', 'hero-1', 'campTiers-1', 'campDonors-1', 'statsBento-1', 'faq-1', 'contact-1'],
        sections: {
          'campHeader-1': {
            ...SECTION_REGISTRY.campaignHeader.defaultConfig,
            id: 'campHeader-1',
            title: 'ביחד מגיעים ליעד – פותחים את הלב ומאירים חיים',
            subtitle: 'השותפות שלכם מאפשרת לנו להמשיך להוביל, להשפיע ולהעניק סיוע לאלפי משפחות בכל חודש.',
            targetGoal: 500000,
            totalRaised: 382500,
            donorsCount: 420,
            daysLeft: 8,
          },
          'hero-1': {
            ...SECTION_REGISTRY.hero.defaultConfig,
            id: 'hero-1',
            title: 'כל תרומה יוצרת השפעה אמיתית בשטח',
            subtitle: 'שותפות שמשנה מציאות • קבלה דיגיטלית מיידית מוכרת לסעיף 46',
            description: 'בזכותכם, אנחנו מעניקים מעטפת תמיכה מקיפה, מזון, ציוד וחינוך לאלו הזקוקים לכך יותר מכל.',
            layout: 'split',
            heroStyle: 'mesh-glow',
            buttonsVisible: true,
            primaryButton: { text: 'לתרומה מהירה ומאובטחת', url: '#tiers' },
            secondaryButton: { text: 'קיר התורמים שלנו', url: '#donors' },
          },
          'campTiers-1': {
            ...SECTION_REGISTRY.campaignTiers.defaultConfig,
            id: 'campTiers-1',
            title: 'מסלולי שותפות ונתינה',
            subtitle: 'בחרו את סכום התרומה שלכם – קבלה דיגיטלית מיידית מוכרת לסעיף 46',
          },
          'campDonors-1': {
            ...SECTION_REGISTRY.campaignDonors.defaultConfig,
            id: 'campDonors-1',
            title: 'תורמים אחרונים ומילות ברכה',
          },
          'statsBento-1': {
            ...SECTION_REGISTRY.statsBento.defaultConfig,
            id: 'statsBento-1',
            title: 'ההשפעה בשטח השנה',
          },
          'faq-1': {
            ...SECTION_REGISTRY.faq.defaultConfig,
            id: 'faq-1',
            title: 'שאלות ותשובות בנושא התרומה',
            subtitle: 'שקיפות מלאה, אבטחת מידע ואישורי מס',
          },
          'contact-1': {
            ...SECTION_REGISTRY.contact.defaultConfig,
            id: 'contact-1',
            title: 'רוצים לתרום בהעברה בנקאית או הקדשה מיוחדת?',
            subtitle: 'צוות קשרי תורמים זמין עבורכם לכל שאלה',
          },
        },
      },
    },

    // 6. Courses & Academy Pages Archive (דפי קורסים והכשרות - KOSCOURSE)
    {
      id: 'course-archive',
      title: 'תבנית ארכיון דפי קורסים והכשרות (KOSCOURSE)',
      category: 'courses',
      description: 'דף קורס מקצועי ב-7 אזורים: Hero קורס וסילבוס, MainContent באנר תוכן מודגש, StatsBento נתוני הצלחה, Pricing מסלולי לימוד, Testimonials ביקורות בוגרים, FAQ שאלות נפוצות ו-Contact ייעוץ ב-WhatsApp.',
      badge: '7 אזורים • KOSCOURSE',
      icon: 'GraduationCap',
      sectionTypes: ['hero', 'mainContent', 'statsBento', 'pricing', 'testimonials', 'faq', 'contact'],
      config: {
        pageId: 'bp-koscourse-mastery',
        pageTitle: 'הכשרה מקצועית מקיפה - תכנית הדגל 2026',
        slug: 'koscourse-fullstack-mastery',
        pageCategory: 'course',
        published: false,
        isHomePage: false,
        viewsCount: 0,
        leadsCount: 0,
        globalSettings: {
          siteTitle: 'האקדמיה המקצועית להכשרה מעשית',
          companyName: 'קמונה אקדמיה',
          slogan: 'ללמוד מהמומחים המובילים • סילבוס מעשי ופרויקטים אמיתיים מהתעשייה',
          theme: 'modern',
          headerLayout: 'capsule-floating',
          headerSticky: true,
          isHeaderVisible: true,
          isFooterVisible: true,
          primaryColor: '#4f46e5',
          secondaryColor: '#06b6d4',
          backgroundColor: '#0a0a12',
          textColor: '#f8fafc',
          fontFamily: 'Heebo, sans-serif',
          borderRadius: 'lg',
          buttonStyle: 'gradient',
          contactWhatsApp: '0526968008',
          contactPhone: '052-6968008',
          contactEmail: 'ovt5771@gmail.com',
          address: 'דרך מנחם בגין 144, תל אביב',
        },
        seoSettings: {
          title: 'תכנית ההכשרה המקצועית המובילה | הרשמה מוקדמת',
          description: 'הצטרפו לתכנית הדגל המקיפה ביותר. מנטור צמוד, פרויקטים מעשיים ותעודת הסמכה מקצועית.',
          keywords: ['קורס', 'סדנה', 'הכשרה מקצועית', 'לימודים', 'סילבוס'],
        },
        sectionOrder: ['hero-1', 'mainContent-1', 'statsBento-1', 'pricing-1', 'testimonials-1', 'faq-1', 'contact-1'],
        sections: {
          'hero-1': {
            ...SECTION_REGISTRY.hero.defaultConfig,
            id: 'hero-1',
            title: 'המסלול המלא להכשרה מקצועית ולתוצאות מוכחות',
            subtitle: 'מחזור 2026 נפתח בקרוב • הרשמה מוקדמת בהטבה בלעדית',
            description: 'תכנית מעשית, מדויקת וממוקדת שנועדה להעניק לכם את כל הידע, הכלים והפרויקטים הנדרשים להצלחה אמיתית.',
            layout: 'split',
            heroStyle: 'mesh-glow',
            badgeText: 'מסלול מנטורינג אישי • מקומות מוגבלים',
            buttonsVisible: true,
            primaryButton: { text: 'שריון מקום במסלול ההכשרה', url: '#pricing' },
            secondaryButton: { text: 'לצפייה בסילבוס המלא', url: '#syllabus' },
          },
          'mainContent-1': {
            ...SECTION_REGISTRY.mainContent.defaultConfig,
            id: 'mainContent-1',
            title: 'תכנית הלימודים והסילבוס המודולרי',
            subtitle: 'מסלול צעד-אחר-צעד מהבסיס ועד לרמת מומחה',
          },
          'statsBento-1': {
            ...SECTION_REGISTRY.statsBento.defaultConfig,
            id: 'statsBento-1',
            title: 'ההישגים והבוגרים במספרים',
          },
          'pricing-1': {
            ...SECTION_REGISTRY.pricing.defaultConfig,
            id: 'pricing-1',
            title: 'מסלולי לימוד והרשמה לקורס',
            subtitle: 'בחרו את רמת הליווי המתאימה לכם ביותר • אפשרות לפריסת תשלומים נוחה',
          },
          'testimonials-1': {
            ...SECTION_REGISTRY.testimonials.defaultConfig,
            id: 'testimonials-1',
            title: 'מה בוגרי הקורס מספרים?',
            subtitle: 'סיפורי הצלחה, קידום מקצועי ופרויקטים שיצאו לפועל',
          },
          'faq-1': {
            ...SECTION_REGISTRY.faq.defaultConfig,
            id: 'faq-1',
            title: 'שאלות ותשובות על הקורס והתעודה',
            subtitle: 'דרישות קדם, שעות לימוד, גישה לחומרים מוקלטים ותעודת גמר',
          },
          'contact-1': {
            ...SECTION_REGISTRY.contact.defaultConfig,
            id: 'contact-1',
            title: 'רוצים להתייעץ עם יועץ לימודים?',
            subtitle: 'אנחנו כאן לעזור לכם לבחור את המסלול הנכון בשיחת WhatsApp מהירה',
          },
        },
      },
    },

    // 7. Kosvidio - YouTube AI SEO Video Page
    {
      id: 'kosvidio',
      title: 'דף וידאו ומאמר AI SEO (Kosvidio)',
      category: 'video',
      description: 'נגן וידאו חדשני, כותרת, תוויות עדינות, שיתוף חברתי, תגובות בעיצוב יוטיוב, תיאור קצר ומאמר עומק מותאם SEO & AI-SEO.',
      badge: 'Kosvidio AI',
      icon: 'Video',
      sectionTypes: ['header', 'kosvidio', 'contact'],
      config: {
        pageId: 'bp-kosvidio',
        pageTitle: 'נגן ועמוד וידאו חכם - Kosvidio',
        slug: 'Kosvidio',
        published: true,
        isHomePage: false,
        viewsCount: 0,
        leadsCount: 0,
        globalSettings: {
          siteTitle: 'Kosvidio - מרכז הוידאו והתוכן החכם',
          companyName: 'קושאן דיגיטל',
          slogan: 'חווית צפייה חכמה ומאמרי SEO מעמיקים',
          theme: 'dark',
          headerLayout: 'capsule-floating',
          headerSticky: true,
          isHeaderVisible: true,
          isFooterVisible: true,
          primaryColor: '#ef4444',
          secondaryColor: '#8b5cf6',
          backgroundColor: '#090a0f',
          textColor: '#f8fafc',
          fontFamily: 'Heebo, sans-serif',
          borderRadius: 'lg',
          buttonStyle: 'gradient',
          contactWhatsApp: '0526968008',
          contactPhone: '052-6968008',
          contactEmail: 'ovt5771@gmail.com',
        },
        seoSettings: {
          title: 'Kosvidio - עמוד וידאו ומאמר מקודם',
          description: 'צפו בוידאו וקראו את המאמר המלא עם תובנות עומק, שאלות נפוצות וסיכום מנהלים.',
          keywords: ['וידאו', 'יוטיוב', 'SEO', 'AISEO', 'מאמר תוכן'],
        },
        sectionOrder: ['header-1', 'kosvidio-1', 'contact-1'],
        sections: {
          'header-1': {
            ...SECTION_REGISTRY.header.defaultConfig,
            id: 'header-1',
            title: 'Kosvidio',
            showLogoText: true,
            logoText: 'Kosvidio',
          },
          'kosvidio-1': {
            ...SECTION_REGISTRY.kosvidio.defaultConfig,
            id: 'kosvidio-1',
          },
          'contact-1': {
            ...SECTION_REGISTRY.contact.defaultConfig,
            id: 'contact-1',
            title: 'יש לכם שאלות או רוצים לשתף פעולה?',
            subtitle: 'צרו קשר ישיר עם יוצר התוכן והצוות',
          },
        },
      },
    },

    // 8. Local Geo Authority Landing
    {
      id: 'geo-local-authority',
      title: 'דף שירות מקומי ו-SEO (Local GEO)',
      category: 'geo',
      description: 'כותרת ממוקדת עיר/אזור, מפת פעילות וזמני הגעה, שירותים אזוריים, ביקורות מאומתות וכפתור חיוג מהיר ו-WhatsApp צף.',
      badge: 'דירוג מקומי',
      icon: 'MapPin',
      sectionTypes: ['hero', 'geoLocal', 'statsBento', 'testimonials', 'faq', 'contact'],
      config: {
        pageId: 'bp-geo-local',
        pageTitle: 'שירות מומחה באזור המרכז וגוש דן - הגעה מהירה',
        slug: 'local-expert',
        published: false,
        isHomePage: false,
        viewsCount: 0,
        leadsCount: 0,
        globalSettings: {
          siteTitle: 'שירות מומחה מקומי עם אחריות מלאה',
          companyName: 'קמונה פתרונות דיגיטליים',
          slogan: 'זמינות גבוהה, שירות ללא פשרות והגעה מהירה',
          theme: 'emerald',
          headerLayout: 'capsule-floating',
          headerSticky: true,
          isHeaderVisible: true,
          isFooterVisible: true,
          primaryColor: '#059669',
          secondaryColor: '#0284c7',
          backgroundColor: '#04100c',
          textColor: '#f0fdf4',
          fontFamily: 'Heebo, sans-serif',
          borderRadius: 'lg',
          buttonStyle: 'solid',
          contactWhatsApp: '0526968008',
          contactPhone: '052-6968008',
          contactEmail: 'ovt5771@gmail.com',
          address: 'דרך מנחם בגין 144, תל אביב',
        },
        seoSettings: {
          title: 'שירות מומחה בתל אביב והמרכז | זמינות מיידית',
          description: 'שירות מקצועי, אמין ומהיר בתל אביב, רמת גן, גבעתיים וגוש דן. שירות לקוחות 24/6.',
          keywords: ['שירות מומחה תל אביב', 'שירות מקומי', 'בעל מקצוע מומלץ'],
        },
        sectionOrder: ['geo-hero', 'geo-map', 'geo-stats', 'geo-testimonials', 'geo-faq', 'geo-contact'],
        sections: {
          'geo-hero': {
            ...SECTION_REGISTRY.hero.defaultConfig,
            id: 'geo-hero',
            title: 'השירות המוביל בתל אביב וגוש דן – ישירות אליכם תוך 60 דקות',
            subtitle: 'מקצועיות, שקיפות מלאה ומאות המלצות מתושבי האזור',
            description: 'צוות מוסמך וזמין לכל קריאה באזור המרכז. מענה מהיר בווטסאפ והצעת מחיר שקופה עוד בשיחת הטלפון.',
            layout: 'bento-hero',
            heroStyle: 'mesh-glow',
            badgeText: 'זמין כעת לקריאות במרכז',
            buttonsVisible: true,
            primaryButton: { text: 'חיוג מהיר למוקד', url: 'tel:03-5551234' },
            secondaryButton: { text: 'הודעת WhatsApp מיידית', url: 'https://wa.me/972501234567' },
          },
          'geo-map': {
            ...SECTION_REGISTRY.geoLocal.defaultConfig,
            id: 'geo-map',
            title: 'אזורי שירות וזמני הגעה',
            subtitle: 'פריסה רחבה בכל ערי גוש דן והשרון',
            city: 'תל אביב וגוש דן',
            serviceAreas: ['תל אביב-יפו', 'רמת גן', 'גבעתיים', 'פתח תקווה', 'חולון ובת ים', 'הרצליה ורמת השרון'],
          },
          'geo-stats': {
            ...SECTION_REGISTRY.statsBento.defaultConfig,
            id: 'geo-stats',
            title: 'המספרים מדברים בעד עצמם',
          },
          'geo-testimonials': {
            ...SECTION_REGISTRY.testimonials.defaultConfig,
            id: 'geo-testimonials',
            title: 'מה אומרים השכנים שלכם?',
            subtitle: 'ביקורות מאומתות מתושבי תל אביב והמרכז',
          },
          'geo-faq': {
            ...SECTION_REGISTRY.faq.defaultConfig,
            id: 'geo-faq',
            title: 'שאלות ותשובות נפוצות',
            subtitle: 'כל מה שחשוב לדעת לפני שמזמינים שירות',
          },
          'geo-contact': {
            ...SECTION_REGISTRY.contact.defaultConfig,
            id: 'geo-contact',
            title: 'צריכים הגעה מהירה? צרו קשר עכשיו',
            subtitle: 'אנחנו זמינים לענות לכם מיד',
          },
        },
      },
    },
  ];

  return _cachedBlueprints || [];
}

export const PAGE_BLUEPRINTS: PageTemplateBlueprint[] = new Proxy([] as PageTemplateBlueprint[], {
  get(target, prop, receiver) {
    const list = getPageBlueprints();
    const val = Reflect.get(list, prop, receiver);
    if (typeof val === 'function') {
      return val.bind(list);
    }
    return val;
  },
  has(target, prop) {
    return Reflect.has(getPageBlueprints(), prop);
  },
  ownKeys() {
    return Reflect.ownKeys(getPageBlueprints());
  },
  getOwnPropertyDescriptor(target, prop) {
    return Reflect.getOwnPropertyDescriptor(getPageBlueprints(), prop);
  },
});

/**
 * Hydrates a blueprint with live Brand DNA contact details, colors and identity
 */
export function hydrateBlueprintWithBrandDna(
  blueprintConfig: PageBuilderConfig,
  brandDna?: any
): PageBuilderConfig {
  const cloned: PageBuilderConfig = JSON.parse(JSON.stringify(blueprintConfig));

  const companyName = brandDna?.identity?.companyName || 'קמונה פתרונות דיגיטליים';
  const slogan = brandDna?.identity?.slogan || 'חדשנות, איכות וצמיחה מתמדת';
  const logoUrl = brandDna?.identity?.logoUrl;
  const primaryColor = brandDna?.designTokens?.primaryColor;
  const secondaryColor = brandDna?.designTokens?.secondaryColor;
  const phone = brandDna?.trust?.contactPhone || '052-6968008';
  const email = brandDna?.trust?.contactEmail || 'ovt5771@gmail.com';
  const whatsapp = brandDna?.trust?.whatsappSupportNumber || '0526968008';
  const address = brandDna?.trust?.officeAddress || 'דרך מנחם בגין 144, תל אביב';

  cloned.globalSettings.companyName = companyName;
  if (slogan) cloned.globalSettings.slogan = slogan;
  if (logoUrl) cloned.globalSettings.siteLogoUrl = logoUrl;
  if (primaryColor) cloned.globalSettings.primaryColor = primaryColor;
  if (secondaryColor) cloned.globalSettings.secondaryColor = secondaryColor;
  cloned.globalSettings.contactPhone = phone;
  cloned.globalSettings.contactEmail = email;
  cloned.globalSettings.contactWhatsApp = whatsapp;
  cloned.globalSettings.address = address;
  cloned.globalSettings.brandDnaSynced = true;

  // Sync all sections with live Brand DNA dynamically
  Object.keys(cloned.sections).forEach((secKey) => {
    const sec = cloned.sections[secKey];
    cloned.sections[secKey] = hydrateSectionWithBrandDna(sec, brandDna, sec.type);
  });

  return cloned;
}
