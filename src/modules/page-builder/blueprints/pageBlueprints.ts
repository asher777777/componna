import { PageBuilderConfig } from '../types/pageBuilder.types';
import { PageTemplateBlueprint } from '../types';
import { SECTION_REGISTRY } from '../registry/sectionRegistry';

/**
 * 5 Premium Built-in Page Blueprints (תבניות פרימיום מובנות)
 */

export const PAGE_BLUEPRINTS: PageTemplateBlueprint[] = [
  // 1. Sales & Checkout Funnel
  {
    id: 'sales-funnel',
    title: 'משפך מכירה והשקה פרימיום',
    category: 'sales',
    description: 'Hero מפוצל עם תמונה/וידאו, באנר לוגואים, כרטיסי יתרונות, מחירון חבילות, ביקורות לקוחות, טיימר דחיפות וטופס רכישה.',
    badge: 'הכי ממיר 🔥',
    icon: 'Zap',
    sectionTypes: ['hero', 'logoMarquee', 'services', 'pricing', 'testimonials', 'timer', 'contact'],
    config: {
      pageId: 'bp-sales-funnel',
      pageTitle: 'השקה מיוחדת - חבילות VIP והטבת פריסייל',
      slug: 'special-offer',
      published: false,
      isHomePage: false,
      viewsCount: 0,
      leadsCount: 0,
      globalSettings: {
        siteTitle: 'ההצעה הבלעדית של השנה',
        companyName: 'מותג הפרימיום',
        slogan: 'מקפצה אמיתית לתוצאות בלתי מתפשרות',
        theme: 'modern',
        headerLayout: 'floating-glass',
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
        contactWhatsApp: '972501234567',
        contactPhone: '03-1234567',
        contactEmail: 'sales@example.com',
        address: 'מגדלי עזריאלי, תל אביב',
      },
      seoSettings: {
        title: 'השקה מיוחדת - הצטרפו לנבחרת המובילה',
        description: 'הצטרפו עוד היום להשקה הבלעדית וקבלו חבילת הטבות ייחודית במחיר היכרות.',
        keywords: ['מכירה', 'השקה', 'קורס', 'שירות פרימיום'],
      },
      sectionOrder: ['hero-1', 'marquee-1', 'services-1', 'pricing-1', 'testimonials-1', 'timer-1', 'contact-1'],
      sections: {
        'hero-1': {
          ...SECTION_REGISTRY.hero.defaultConfig,
          id: 'hero-1',
          title: 'הדרך המהירה והבטוחה להכפיל את התוצאות שלכם',
          subtitle: 'הזדמנות בלעדית לתקופת ההשקה בלבד',
          description: 'פתרון מוכח, מקיף ומדויק שנוצר כדי לקחת אתכם צעד אחד קדימה – עם ליווי אישי, כלים בלעדיים ותמיכה מלאה.',
          layout: 'split',
          heroStyle: 'mesh-glow',
          badgeText: 'ההרשמה נסגרת בקרוב',
          buttonsVisible: true,
          primaryButton: { text: 'הבטיחו את מקומכם עכשיו', url: '#pricing' },
          secondaryButton: { text: 'לפרטים נוספים', url: '#services' },
          socialProofEnabled: true,
          socialProofText: 'מעל 1,250 לקוחות מרוצים כבר בפנים',
          imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
        },
        'marquee-1': {
          ...SECTION_REGISTRY.logoMarquee.defaultConfig,
          id: 'marquee-1',
          title: 'החברות המובילות בישראל שבחרו בנו',
        },
        'services-1': {
          ...SECTION_REGISTRY.services.defaultConfig,
          id: 'services-1',
          title: 'מה מחכה לכם בפנים?',
          subtitle: 'מעטפת מלאה שתוכננה להביא אתכם לתוצאות מקסימליות',
        },
        'pricing-1': {
          ...SECTION_REGISTRY.pricing.defaultConfig,
          id: 'pricing-1',
          title: 'בחרו את המסלול המתאים לכם ביותר',
          subtitle: 'מחירים מיוחדים לתקופת ההשקה • ביטול בכל עת',
        },
        'testimonials-1': {
          ...SECTION_REGISTRY.testimonials.defaultConfig,
          id: 'testimonials-1',
          title: 'סיפורי הצלחה אמיתיים מהשטח',
          subtitle: 'ראו מה אומרים אלו שכבר עשו את הצעד',
        },
        'timer-1': {
          ...SECTION_REGISTRY.timer.defaultConfig,
          id: 'timer-1',
          title: 'הטבת ההשקה מוגבלת בזמן!',
          subtitle: 'המקומות במסלול ה-VIP מוגבלים ל-30 משתתפים ראשונים בלבד',
        },
        'contact-1': {
          ...SECTION_REGISTRY.contact.defaultConfig,
          id: 'contact-1',
          title: 'יש לכם שאלה לפני שמצטרפים?',
          subtitle: 'הצוות שלנו זמין עבורכם לייעוץ מהיר ב-WhatsApp',
        },
      },
    },
  },

  // 2. Local Geo Authority Landing
  {
    id: 'geo-local-authority',
    title: 'דף שירות מקומי ו-SEO (Local GEO)',
    category: 'geo',
    description: 'כותרת ממוקדת עיר/אזור, מפת פעילות וזמני הגעה, שירותים אזוריים, ביקורות מאומתות וכפתור חיוג מהיר ו-WhatsApp צף.',
    badge: 'דירוג מקומי 📍',
    icon: 'MapPin',
    sectionTypes: ['hero', 'geoLocal', 'services', 'statsBento', 'testimonials', 'faq', 'contact'],
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
        companyName: 'מומחי המרכז',
        slogan: 'זמינות גבוהה, שירות ללא פשרות והגעה עד 60 דקות',
        theme: 'emerald',
        headerLayout: 'floating-glass',
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
        contactWhatsApp: '972501234567',
        contactPhone: '03-5551234',
        contactEmail: 'service@example.com',
        address: 'רחוב ויצמן 14, תל אביב',
      },
      seoSettings: {
        title: 'שירות מומחה בתל אביב והמרכז | זמינות מיידית',
        description: 'שירות מקצועי, אמין ומהיר בתל אביב, רמת גן, גבעתיים וגוש דן. שירות לקוחות 24/6.',
        keywords: ['שירות מומחה תל אביב', 'שירות מקומי', 'בעל מקצוע מומלץ'],
        geo: {
          enabled: true,
          targetCity: 'תל אביב',
          targetRegion: 'גוש דן והמרכז',
          targetCountry: 'ישראל',
          serviceAreas: ['תל אביב', 'רמת גן', 'גבעתיים', 'חולון', 'הרצליה'],
          localBusinessName: 'מומחי המרכז',
          businessAddress: 'רחוב ויצמן 14, תל אביב',
          businessPhone: '03-5551234',
          openingHours: 'א-ה 08:00-20:00, ו 08:00-13:00',
        },
      },
      sectionOrder: ['geo-hero', 'geo-map', 'geo-services', 'geo-stats', 'geo-testimonials', 'geo-faq', 'geo-contact'],
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
        'geo-services': {
          ...SECTION_REGISTRY.services.defaultConfig,
          id: 'geo-services',
          title: 'השירותים שלנו באזורכם',
          subtitle: 'פתרון מקצועי מקיף לכל צורך עם אחריות בכתב',
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

  // 3. Knowledge & Authority Page
  {
    id: 'knowledge-authority',
    title: 'עמוד מאמר ידע וסמכות (Authority Lead Hub)',
    category: 'authority',
    description: 'Hero אלגנטי, תוכן עשיר עם טיפוגרפיה מושלמת, בלוקי ציטוטים והדגשה, פרופיל מומחה, ומגנט לידים להורדת המדריך המלא.',
    badge: 'סמכות מקצועית 📚',
    icon: 'GraduationCap',
    sectionTypes: ['hero', 'richContent', 'statsBento', 'faq', 'contact'],
    config: {
      pageId: 'bp-knowledge-hub',
      pageTitle: 'המדריך המלא והמעשי להצלחה מקצועית',
      slug: 'authority-guide',
      published: false,
      isHomePage: false,
      viewsCount: 0,
      leadsCount: 0,
      globalSettings: {
        siteTitle: 'מרכז הידע וההכשרה המוביל',
        companyName: 'המומחה הדיגיטלי',
        slogan: 'תובנות מעשיות וידע עמוק למקבלי החלטות',
        theme: 'modern',
        headerLayout: 'centered',
        headerSticky: true,
        isHeaderVisible: true,
        isFooterVisible: true,
        primaryColor: '#8b5cf6',
        secondaryColor: '#3b82f6',
        backgroundColor: '#09090b',
        textColor: '#fafafa',
        fontFamily: 'Heebo, sans-serif',
        borderRadius: 'md',
        buttonStyle: 'glass',
        contactWhatsApp: '972501234567',
        contactPhone: '03-1234567',
        contactEmail: 'academy@example.com',
      },
      seoSettings: {
        title: 'המדריך המקיף לבכירים ומנהלים - הורדה ישירה',
        description: 'מאמר עומק מקיף הכולל עקרונות פעולה, מחקרי שוק ותובנות אסטרטגיות שחייבים להכיר.',
        keywords: ['מאמר עומק', 'מדריך חינמי', 'סמכות מקצועית', 'תובנות שוק'],
      },
      sectionOrder: ['auth-hero', 'auth-content', 'auth-stats', 'auth-faq', 'auth-lead'],
      sections: {
        'auth-hero': {
          ...SECTION_REGISTRY.hero.defaultConfig,
          id: 'auth-hero',
          title: 'המתודולוגיה השלמה לבניית יתרון תחרותי בלתי מנוצח',
          subtitle: 'מאת מומחי האסטרטגיה המובילים',
          description: 'ניתוח מעמיק של התהליכים, הכלים והעקרונות שמאפשרים לארגונים מובילים לצמוח בעקביות גם בסביבה תחרותית.',
          layout: 'centered',
          heroStyle: 'modern',
          badgeText: 'מאמר מקצועי • זמן קריאה: 6 דקות',
          buttonsVisible: true,
          primaryButton: { text: 'הורדת המדריך המלא (PDF)', url: '#lead' },
          secondaryButton: { text: 'קריאת המאמר', url: '#content' },
        },
        'auth-content': {
          ...SECTION_REGISTRY.richContent.defaultConfig,
          id: 'auth-content',
          heading: 'עקרונות הליבה של השיטה',
          subtitle: 'שלושת עמודי התווך של מצוינות תפעולית ואסטרטגית',
        },
        'auth-stats': {
          ...SECTION_REGISTRY.statsBento.defaultConfig,
          id: 'auth-stats',
          title: 'השפעה בשטח ומחקר אמפירי',
        },
        'auth-faq': {
          ...SECTION_REGISTRY.faq.defaultConfig,
          id: 'auth-faq',
          title: 'שאלות ותשובות למנהלים',
          subtitle: 'מענה לשאלות מפתח בנוגע ליישום השיטה',
        },
        'auth-lead': {
          ...SECTION_REGISTRY.contact.defaultConfig,
          id: 'auth-lead',
          title: 'קבלו את המדריך המלא וטמפלייטים יישומיים למייל',
          subtitle: 'הזינו כתובת דוא"ל והמדריך יישלח אליכם באופן מיידי',
        },
      },
    },
  },

  // 4. Community Hub
  {
    id: 'community-hub',
    title: 'עמוד קהילה והרשמה (Community & VIP Hub)',
    category: 'community',
    description: 'תמונת קאבר קהילתית, מונה חברים חי, הטבות בלעדיות לחברים, לוח אירועים ופעילויות, וטופס הצטרפות מהיר.',
    badge: 'חוויית שייכות 👥',
    icon: 'Users',
    sectionTypes: ['hero', 'community', 'statsBento', 'services', 'testimonials', 'contact'],
    config: {
      pageId: 'bp-community-hub',
      pageTitle: 'הקהילה הרשמית - מקום המפגש של המקצוענים',
      slug: 'community',
      published: false,
      isHomePage: false,
      viewsCount: 0,
      leadsCount: 0,
      globalSettings: {
        siteTitle: 'הקהילה המובילה בישראל',
        companyName: 'מועדון החברים',
        slogan: 'נטוורקינג, שיתופי פעולה ותוכן בלעדי שאי אפשר למצוא בשום מקום אחר',
        theme: 'purple',
        headerLayout: 'floating-glass',
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
        contactWhatsApp: '972501234567',
        contactPhone: '03-1234567',
        contactEmail: 'club@example.com',
      },
      seoSettings: {
        title: 'הצטרפו לקהילת המקצוענים - מפגשים, הטבות ונטוורקינג',
        description: 'הבית של המובילים בתחום. מפגשי חברים חודשיים, קבוצת דיונים סגורה והטבות מיוחדות.',
        keywords: ['קהילה', 'מועדון חברים', 'נטוורקינג', 'וובינרים'],
      },
      sectionOrder: ['comm-hero', 'comm-main', 'comm-stats', 'comm-benefits', 'comm-testimonials', 'comm-join'],
      sections: {
        'comm-hero': {
          ...SECTION_REGISTRY.hero.defaultConfig,
          id: 'comm-hero',
          title: 'המקום שבו המובילים בתחום נפגשים, משתפים וצומחים יחד',
          subtitle: 'קהילה מקצועית סגורה לחברים בלבד',
          description: 'הצטרפו למעגל של מאות מקצוענים וקבלו גישה מיידית להרצאות סגורות, מאגר ידע שיתופי והזדמנויות עסקיות אמיתיות.',
          layout: 'spatial',
          heroStyle: 'mesh-glow',
          badgeText: 'ההרשמה למחזור הקרוב פתוחה',
          buttonsVisible: true,
          primaryButton: { text: 'הצטרפו לקהילה עכשיו', url: '#join' },
          secondaryButton: { text: 'לוח אירועים קרובים', url: '#events' },
        },
        'comm-main': {
          ...SECTION_REGISTRY.community.defaultConfig,
          id: 'comm-main',
          title: 'הטבות בלעדיות לחברי הקהילה',
          subtitle: 'כל מה שאתם מקבלים מהיום הראשון להצטרפותכם',
          memberCount: '3,800+',
        },
        'comm-stats': {
          ...SECTION_REGISTRY.statsBento.defaultConfig,
          id: 'comm-stats',
          title: 'עוצמת הקהילה במספרים',
        },
        'comm-benefits': {
          ...SECTION_REGISTRY.services.defaultConfig,
          id: 'comm-benefits',
          title: 'פעילויות ואירועים שוטפים',
          subtitle: 'מפגשי זום שבועיים, כנסי נטוורקינג פרונטליים וסדנאות עבודה',
        },
        'comm-testimonials': {
          ...SECTION_REGISTRY.testimonials.defaultConfig,
          id: 'comm-testimonials',
          title: 'מה חברי הקהילה מספרים?',
          subtitle: 'הקשרים והעסקאות שנוצרו בזכות המפגשים',
        },
        'comm-join': {
          ...SECTION_REGISTRY.contact.defaultConfig,
          id: 'comm-join',
          title: 'הבטיחו את מקומכם בקהילה עוד היום',
          subtitle: 'מלאו פרטים קצרים והצוות יאשר את הרשמתכם תוך 24 שעות',
        },
      },
    },
  },

  // 5. Donation & Crowdfunding Campaign
  {
    id: 'campaign-donation',
    title: 'עמוד קמפיין וגיוס תרומות (Crowdfunding & Impact)',
    category: 'campaign',
    description: 'כותרת קמפיין מרגשת, סרגל יעד כספי דינמי (% גיוס), מסלולי תרומה עם אפשרות לסעיף 46, רשימת תורמים ותעודת הוקרה.',
    badge: 'השפעה ונתינה ❤️',
    icon: 'Heart',
    sectionTypes: ['campaignHeader', 'campaignTiers', 'statsBento', 'campaignDonors', 'faq', 'contact'],
    config: {
      pageId: 'bp-campaign-impact',
      pageTitle: 'קמפיין גיוס שנתי - ביחד מייצרים שינוי אמיתי',
      slug: 'give-impact',
      published: false,
      isHomePage: false,
      viewsCount: 0,
      leadsCount: 0,
      globalSettings: {
        siteTitle: 'קמפיין שותפות ונתינה 2026',
        companyName: 'עמותת האור והתקווה',
        slogan: 'כל תרומה מוכפלת ומגיעה ישירות למי שזקוק לה',
        theme: 'sunset',
        headerLayout: 'floating-glass',
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
        contactWhatsApp: '972501234567',
        contactPhone: '03-1234567',
        contactEmail: 'donations@example.org',
        address: 'רחוב יפו 45, ירושלים',
      },
      seoSettings: {
        title: 'קמפיין שותפות וגיוס - תרומה מוכרת לפי סעיף 46',
        description: 'היו שותפים בעשייה מצילת חיים. תרומה מאובטחת בכרטיס אשראי, ביט והעברה בנקאית עם קבלה מיידית.',
        keywords: ['תרומות', 'סעיף 46', 'קמפיין גיוס', 'עמותה'],
      },
      sectionOrder: ['camp-header', 'camp-tiers', 'camp-stats', 'camp-donors', 'camp-faq', 'camp-contact'],
      sections: {
        'camp-header': {
          ...SECTION_REGISTRY.campaignHeader.defaultConfig,
          id: 'camp-header',
          campaignTitle: 'ביחד מגיעים ליעד – פותחים את הלב ומאירים חיים',
          storyHeadline: 'השותפות שלכם מאפשרת לנו להמשיך להוביל, להשפיע ולהעניק סיוע לאלפי משפחות בכל חודש.',
          goalAmount: 500000,
          currentAmount: 382500,
          daysLeft: 8,
          taxDeductibleBadge: 'מוכר לצרכי מס לפי סעיף 46 לפקודה',
        },
        'camp-tiers': {
          ...SECTION_REGISTRY.campaignTiers.defaultConfig,
          id: 'camp-tiers',
          title: 'מסלולי שותפות ונתינה',
          subtitle: 'בחרו את סכום התרומה שלכם – קבלה דיגיטלית מיידית מוכרת לסעיף 46',
        },
        'camp-stats': {
          ...SECTION_REGISTRY.statsBento.defaultConfig,
          id: 'camp-stats',
          title: 'ההשפעה בשטח השנה',
        },
        'camp-donors': {
          ...SECTION_REGISTRY.campaignDonors.defaultConfig,
          id: 'camp-donors',
          title: 'תורמים אחרונים ומילות ברכה',
        },
        'camp-faq': {
          ...SECTION_REGISTRY.faq.defaultConfig,
          id: 'camp-faq',
          title: 'שאלות ותשובות בנושא התרומה',
          subtitle: 'שקיפות מלאה, אבטחת מידע ואישורי מס',
        },
        'camp-contact': {
          ...SECTION_REGISTRY.contact.defaultConfig,
          id: 'camp-contact',
          title: 'רוצים לתרום בהעברה בנקאית או הקדשה מיוחדת?',
          subtitle: 'צוות קשרי תורמים זמין עבורכם לכל שאלה',
        },
      },
    },
  },
];

/**
 * Hydrates a blueprint with live Brand DNA contact details, colors and identity
 */
export function hydrateBlueprintWithBrandDna(
  blueprintConfig: PageBuilderConfig,
  brandDna?: any
): PageBuilderConfig {
  const cloned: PageBuilderConfig = JSON.parse(JSON.stringify(blueprintConfig));
  if (!brandDna) return cloned;

  const companyName = brandDna?.identity?.companyName;
  const slogan = brandDna?.identity?.slogan;
  const logoUrl = brandDna?.identity?.logoUrl;
  const primaryColor = brandDna?.designTokens?.primaryColor;
  const secondaryColor = brandDna?.designTokens?.secondaryColor;
  const phone = brandDna?.trust?.contactPhone;
  const email = brandDna?.trust?.contactEmail;
  const whatsapp = brandDna?.trust?.whatsappSupportNumber;
  const address = brandDna?.trust?.officeAddress;

  if (companyName) cloned.globalSettings.companyName = companyName;
  if (slogan) cloned.globalSettings.slogan = slogan;
  if (logoUrl) cloned.globalSettings.siteLogoUrl = logoUrl;
  if (primaryColor) cloned.globalSettings.primaryColor = primaryColor;
  if (secondaryColor) cloned.globalSettings.secondaryColor = secondaryColor;
  if (phone) cloned.globalSettings.contactPhone = phone;
  if (email) cloned.globalSettings.contactEmail = email;
  if (whatsapp) cloned.globalSettings.contactWhatsApp = whatsapp;
  if (address) cloned.globalSettings.address = address;
  cloned.globalSettings.brandDnaSynced = true;

  // Sync sections contact info
  Object.keys(cloned.sections).forEach((secKey) => {
    const sec = cloned.sections[secKey];
    if (sec.type === 'contact') {
      if (phone) sec.phone = phone;
      if (email) sec.email = email;
      if (whatsapp) sec.whatsapp = whatsapp;
      if (address) sec.address = address;
    } else if (sec.type === 'geoLocal') {
      if (phone) sec.phone = phone;
      if (email) sec.email = email;
      if (whatsapp) sec.whatsapp = whatsapp;
      if (address) sec.address = address;
      if (companyName) sec.businessName = companyName;
    } else if (sec.type === 'hero') {
      if (companyName && !sec.title.includes(companyName)) {
        sec.title = `${companyName} - ${sec.title}`;
      }
      if (slogan && !sec.subtitle) {
        sec.subtitle = slogan;
      }
    }
  });

  return cloned;
}
