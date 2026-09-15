import { PageBuilderConfig, SectionType } from '../types/pageBuilder.types';
import { BrandDna } from '../../brand-dna-hub/types/brandDna';

export interface GenerationStep {
  stepIndex: number;
  totalSteps: number;
  sectionType: SectionType;
  stepTitle: string;
  statusText: string;
  progressPercent: number;
}

export type OnStepCallback = (step: GenerationStep, partialConfig: PageBuilderConfig) => void;

export const aiPageGenerator = {
  // Preset prompts for quick generation
  presetPrompts: [
    {
      id: 'course-masterclass',
      title: 'קורס והכשרה מקצועית',
      description: 'דף נחיתה יוקרתי לקורס מאסטרקלס עם מחירון, ביקורות, שאלות נפוצות והרשמה.',
      icon: 'GraduationCap',
      prompt: 'דף נחיתה יוקרתי וממיר לקורס הכשרה מעשי בדיגיטל, כולל הישגי בוגרים, מחירון חבילות, שאלות נפוצות וטופס הרשמה מוקדמת.',
    },
    {
      id: 'saas-tech',
      title: 'מוצר SaaS וטכנולוגיה',
      description: 'עיצוב Bento Grid עתידני להשקת מערכת טכנולוגית, עם לוגואים נעים וטיימר השקה.',
      icon: 'Sparkles',
      prompt: 'דף השקה למערכת טכנולוגית חכמה מבוססת AI, בעיצוב Bento Grid מודרני, שורת שותפים, מדדי מפתח והנעה מהירה לפעולה.',
    },
    {
      id: 'fundraising-campaign',
      title: 'קמפיין גיוס תרומות וחסד',
      description: 'דף קמפיין שותפות עם מד גיוס חי, מדרגות תרומה ופיד תורמים בזמן אמת.',
      icon: 'Heart',
      prompt: 'קמפיין שותפות וגיוס תרומות לבניית מרכז קהילתי, עם מד גיוס שקוף, מדרגות תרומה מהירות וחיבור לקהילה.',
    },
    {
      id: 'local-business',
      title: 'עסק מקומי ושירותי VIP',
      description: 'דף שירותים ממוקד קידום מקומי (GEO SEO) עם מפה, שעות פתיחה וצ’אט וואטסאפ.',
      icon: 'MapPin',
      prompt: 'דף נחיתה מקצועי למשרד שירותי פרימיום במרכז הארץ, עם מפת הגעה, אזורי שירות, ביקורות לקוחות וטופס יצירת קשר מהיר.',
    },
  ],

  // Step-by-step live streaming builder
  async generatePageLive(
    userPrompt: string,
    brandDna?: BrandDna | null,
    onStep?: OnStepCallback
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

    const pageId = `page_ai_${Date.now()}`;
    const slug = `launch-${Math.floor(Math.random() * 9000 + 1000)}`;

    const pageConfig: PageBuilderConfig = {
      pageId,
      pageTitle: `${companyName} - השקה רשמית`,
      slug,
      published: false,
      isHomePage: false,
      viewsCount: 0,
      leadsCount: 0,
      globalSettings: {
        siteTitle: `${companyName} | האתר הרשמי`,
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
        backgroundColor: '#0a0a0c',
        textColor: '#f8fafc',
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
        description: brandDna?.identity?.shortVision || `${companyName} מציגה פתרונות מתקדמים ואיכותיים ללא פשרות.`,
        keywords: ['שירותים מקצועיים', 'חדשנות', 'דיגיטל', companyName],
        geo: {
          enabled: true,
          targetCity: 'תל אביב',
          targetRegion: 'גוש דן והמרכז',
          targetCountry: 'ישראל',
          serviceAreas: ['תל אביב והמרכז', 'ירושלים והסביבה', 'שרון', 'כל הארץ'],
          localBusinessName: companyName,
          businessAddress: address,
          businessPhone: phone,
          businessEmail: email,
          openingHours: 'א-ה 09:00-18:00',
        },
      },
      sectionOrder: [],
      sections: {},
    };

    const steps = [
      {
        sectionType: 'hero' as SectionType,
        stepTitle: 'בניית אזור ראשי (Hero 2.0)',
        statusText: 'יוצר כותרת ענקית, הדגשות צבע, באדג׳ הכרזה ו-Social Proof Avatars...',
        data: {
          id: 'hero',
          type: 'hero',
          visible: true,
          anchorId: 'hero',
          title: `הצעד הבא שלכם עם ${companyName}`,
          subtitle: 'השקה מיוחדת ל-2026',
          description: brandDna?.identity?.shortVision || 'הפלטפורמה והשירותים המתקדמים ביותר שנועדו להזניק את התוצאות שלכם לגבהים חדשים.',
          layout: 'bento-hero',
          heroStyle: 'mesh-glow',
          imageSrc: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
          buttonsVisible: true,
          primaryButton: { text: 'התחילו עכשיו בחינם', url: '#pricing' },
          secondaryButton: { text: 'קראו המלצות לקוחות', url: '#testimonials' },
          announcementBadge: { text: '🚀 מהדורה חדשה לשנת 2026 זמינה כעת', url: '#services' },
          socialProofAvatars: {
            visible: true,
            ratingText: 'מדורג 4.9/5 על ידי יותר מ-1,200+ לקוחות',
            starsCount: 5,
            avatars: [
              { id: '1', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80' },
              { id: '2', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80' },
              { id: '3', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80' },
              { id: '4', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80' },
            ],
          },
        },
      },
      {
        sectionType: 'logoMarquee' as SectionType,
        stepTitle: 'יצירת שורת שותפים ולוגואים נעה',
        statusText: 'מחבר מותגים מובילים והוכחה חברתית אינסופית...',
        data: {
          id: 'logoMarquee',
          type: 'logoMarquee',
          visible: true,
          anchorId: 'partners',
          title: 'נבחר על ידי הארגונים והחברות המובילות במשק',
          speed: 'medium',
          direction: 'left',
          grayscale: false,
          logos: [
            { id: '1', name: 'Google Partner', logoUrl: 'https://cdn.worldvectorlogo.com/logos/google-g-2015.svg' },
            { id: '2', name: 'Microsoft Azure', logoUrl: 'https://cdn.worldvectorlogo.com/logos/microsoft-5.svg' },
            { id: '3', name: 'Meta Verified', logoUrl: 'https://cdn.worldvectorlogo.com/logos/meta-1.svg' },
            { id: '4', name: 'Stripe Security', logoUrl: 'https://cdn.worldvectorlogo.com/logos/stripe-4.svg' },
            { id: '5', name: 'AWS Cloud', logoUrl: 'https://cdn.worldvectorlogo.com/logos/amazon-web-services-2.svg' },
          ],
        },
      },
      {
        sectionType: 'services' as SectionType,
        stepTitle: 'בניית Bento Grid 2.0 אינטראקטיבי',
        statusText: 'יוצר כרטיסיות פיצ׳רים א-סימטריות עם נתונים חיים ומסגרות זוהרות...',
        data: {
          id: 'services',
          type: 'services',
          visible: true,
          anchorId: 'services',
          title: 'כל מה שאתם צריכים במקום אחד',
          subtitle: 'פתרון שלם ואיכותי',
          description: 'ארכיטקטורה חדישה, חיבור אוטומטי וניהול קל שחוסכים לכם שעות יקרות.',
          layout: 'bento',
          effect: 'border-beam',
          items: [
            {
              id: '1',
              title: 'מנוע AI מתקדם ויצירת תוכן מיידית',
              description: 'מייצר דפים, תמונות וקופירייטינג ממיר תוך שניות בלחיצת כפתור אחת.',
              icon: 'Sparkles',
              badge: 'בלעדי לגרסה 2.0',
              span: '2',
              highlight: true,
              imageSrc: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
            },
            {
              id: '2',
              title: 'סנכרון CRM ו-WhatsApp',
              description: 'כל פנייה מוזרמת מיידית לוואטסאפ ולמאגר הנתונים ללא עיכוב.',
              icon: 'MessageCircle',
              badge: 'חיבור מיידי',
              span: '1',
              statNumber: '100%',
              statLabel: 'אוטומציה מלאה',
            },
            {
              id: '3',
              title: 'ביצועים מהירים במיוחד',
              description: 'טעינה סופר-מהירה והתאמה של 100% לכל מכשירי המובייל ו-RTL.',
              icon: 'Zap',
              badge: 'Ultra Fast',
              span: '1',
              statNumber: '<0.5s',
              statLabel: 'זמן טעינה',
            },
            {
              id: '4',
              title: 'אבטחה והגנה בתקן PCI-DSS',
              description: 'הצפנה מתקדמת, גיבויים שוטפים ושקט נפשי מוחלט לכל פעילות.',
              icon: 'ShieldCheck',
              badge: 'בטוח לחלוטין',
              span: '2',
            },
          ],
        },
      },
      {
        sectionType: 'statsBento' as SectionType,
        stepTitle: 'הטמעת מדדי מפתח (Stats & Milestones)',
        statusText: 'מייצר מספרים רצים והישגים מוכחים...',
        data: {
          id: 'statsBento',
          type: 'statsBento',
          visible: true,
          anchorId: 'stats',
          title: 'התוצאות מדברות בעד עצמן',
          subtitle: 'מדדי ביצוע מובילים',
          layout: 'bento-4',
          stats: [
            { id: '1', number: '99.8', suffix: '%', label: 'שביעות רצון לקוחות', description: 'מדד שירות מעולה', color: 'emerald', icon: 'Heart' },
            { id: '2', number: '12,500', suffix: '+', label: 'משתמשים פעילים', description: 'קהילה בצמיחה מתמדת', color: 'indigo', icon: 'Users' },
            { id: '3', number: '3.4', suffix: 'X', label: 'גידול ממוצע בהמרות', description: 'תוצאה מוכחת לכל לקוח', color: 'purple', icon: 'TrendingUp' },
            { id: '4', number: '24/7', suffix: '', label: 'תמיכה וליווי אישי', description: 'מענה אנושי מהיר בוואטסאפ', color: 'amber', icon: 'Sparkles' },
          ],
        },
      },
      {
        sectionType: 'testimonials' as SectionType,
        stepTitle: 'הוספת ביקורות והמלצות לקוחות 2.0',
        statusText: 'יוצר כרטיסי המלצה אותנטיים עם דירוגי 5 כוכבים ותגיות אימות...',
        data: {
          id: 'testimonials',
          type: 'testimonials',
          visible: true,
          anchorId: 'testimonials',
          title: 'מה אומרים הלקוחות שלנו?',
          subtitle: 'ביקורות מאומתות',
          description: 'ההצלחה שלכם היא המדד האמיתי למקצועיות שלנו.',
          layout: 'grid',
          showRatingSummary: true,
          overallRating: 4.9,
          totalReviewsCount: '250+ ביקורות בגוגל וברשת',
          trustBadgeText: 'לקוחות מאומתים 100%',
          items: [
            {
              id: '1',
              name: 'רועי שפירא',
              role: 'מנכ״ל ומייסד',
              company: 'סטודיו דיגיטל פרו',
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
              rating: 5,
              content: '״המערכת שינתה לנו את כל תהליך העבודה! תוך פחות מיום אחד העלינו דף נחיתה מושלם שייצר לנו עשרות לידים איכותיים. שירות ברמה הכי גבוהה שפגשתי.״',
              isVerified: true,
              badge: 'לקוח VIP',
            },
            {
              id: '2',
              name: 'מיכל אברהמי',
              role: 'מנהלת שיווק וקהילה',
              company: 'עמותת שותפים לדרך',
              avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
              rating: 5,
              content: '״החיבור לוואטסאפ ול-CRM עובד בצורה חלקה ומופלאה. הכל ברור, בעברית מלאה וברמת גימור שאין באף מערכת אחרת. פשוט תענוג לעבוד!״',
              isVerified: true,
              badge: 'קנייה מאומתת',
            },
            {
              id: '3',
              name: 'יונתן גולדשטיין',
              role: 'יועץ אסטרטגי',
              company: 'גולד ייעוץ עסקי',
              avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
              rating: 5,
              content: '״העיצוב של ה-Bento Grid פשוט הפיל לנו את הלקוחות מהכיסא. מקצועי, יוקרתי וממיר בטירוף. ממליץ בחום לכל בעל עסק!״',
              isVerified: true,
              badge: 'שותף מוסמך',
            },
          ],
        },
      },
      {
        sectionType: 'pricing' as SectionType,
        stepTitle: 'בניית מחירון מודרני עם מתג חודשי/שנתי',
        statusText: 'מעצב 3 חבילות מחיר, תגית חיסכון שנתית והבלטת Pro זוהרת...',
        data: {
          id: 'pricing',
          type: 'pricing',
          visible: true,
          anchorId: 'pricing',
          title: 'תוכניות ומחירים שקופים',
          subtitle: 'בחרו את המסלול המתאים בדיוק עבורכם',
          description: 'ללא אותיות קטנות, ללא התחייבות, ואפשרות לשדרוג או ביטול בכל עת.',
          showBillingToggle: true,
          yearlyDiscountBadge: 'חיסכון של 20% 🎉',
          packages: [
            {
              id: '1',
              name: 'בסיסי (Starter)',
              priceMonthly: '₪99',
              priceYearly: '₪79',
              period: '/ חודש',
              description: 'מתאים לעסקים קטנים ויזמים בתחילת הדרך',
              features: ['דפי נחיתה מעוצבים', 'חיבור דומיין עצמאי', 'סנכרון לידים בסיסי', 'תמיכה בדוא״ל'],
              buttonText: 'התחל עכשיו',
              buttonUrl: '#contact',
            },
            {
              id: '2',
              name: 'מקצועי (Pro 2026)',
              priceMonthly: '₪249',
              priceYearly: '₪199',
              period: '/ חודש',
              description: 'המסלול המוביל לעסקים, קהילות ויוצרי תוכן בצמיחה',
              isFeatured: true,
              badge: 'הכי מבוקש ⭐️',
              features: [
                'דפים בלתי מוגבלים',
                'עיצובי Bento Grid מתקדמים',
                'סנכרון מלא ל-WhatsApp ו-CRM',
                'עוזר AI ליצירת תוכן ותמונות',
                'ליווי VIP אישי 24/7',
              ],
              buttonText: 'בחר מסלול Pro',
              buttonUrl: '#contact',
            },
            {
              id: '3',
              name: 'ארגוני (Enterprise)',
              priceMonthly: '₪590',
              priceYearly: '₪470',
              period: '/ חודש',
              description: 'פתרון מקיף ומותאם אישית לארגונים ורשתות',
              features: [
                'התאמה מלאה אישית (Custom SLA)',
                'מנהל תיק לקוח ייעודי',
                'אינטגרציות API בלתי מוגבלות',
                'הדרכות צוות אישיות',
              ],
              buttonText: 'דברו עם מומחה',
              buttonUrl: '#contact',
            },
          ],
        },
      },
      {
        sectionType: 'faq' as SectionType,
        stepTitle: 'שאלות ותשובות (FAQ 2.0) בסגנון Notion',
        statusText: 'יוצר שאלות נפוצות, סינון חי וכרטיס שיחה בוואטסאפ...',
        data: {
          id: 'faq',
          type: 'faq',
          visible: true,
          anchorId: 'faq',
          title: 'שאלות ותשובות נפוצות',
          subtitle: 'כל מה שחשוב לדעת',
          showSearchBar: true,
          showContactCard: true,
          whatsappContact: whatsapp,
          items: [
            {
              id: '1',
              question: 'כמה זמן לוקח להקים את העמוד ולהתחיל לקבל פניות?',
              answer: 'ההקמה היא מיידית! תוך פחות מ-5 דקות העמוד מוכן לחלוטין לפרסום עם כל הקישורים, הטפסים והמיתוג שלכם.',
            },
            {
              id: '2',
              question: 'האם העמודים מותאמים לצפייה בטלפונים ניידים ו-RTL?',
              answer: 'בהחלט! כל הרכיבים נבנו Mobile-First וכוללים תמיכה מלאה בעברית ו-RTL ברמה הגבוהה ביותר.',
            },
            {
              id: '3',
              question: 'איך הלידים והפניות מגיעים אליי?',
              answer: 'כל פנייה נשלחת מיידית להתראת וואטסאפ, נשמרת במערכת ה-CRM ומועברת ישירות לדוא״ל שלכם.',
            },
            {
              id: '4',
              question: 'האם ניתן לחבר דומיין פרטי וכתובת מקוצרת?',
              answer: 'כן, המערכת כוללת מקצר כתובות מובנה (cmn.to/...) וכן אפשרות חיבור קלה לכל דומיין פרטי שתבחרו.',
            },
          ],
        },
      },
      {
        sectionType: 'contact' as SectionType,
        stepTitle: 'יצירת אזור צור קשר חכם ותמיכת GEO',
        statusText: 'יוצר טופס לידים מהיר, פרטי התקשרות ומפת סניף מקומית...',
        data: {
          id: 'contact',
          type: 'contact',
          visible: true,
          anchorId: 'contact',
          title: 'בואו נעשה את הצעד הראשון יחד',
          subtitle: 'השאירו פרטים ונציג בכיר יחזור אליכם תוך זמן קצר',
          phone,
          email,
          address,
          whatsapp,
          showForm: true,
          showMap: true,
          openingHours: 'ימים א׳-ה׳: 09:00 - 19:00 | יום ו׳: 09:00 - 13:00',
          directWhatsappChat: true,
        },
      },
    ];

    // Stream through steps
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      pageConfig.sectionOrder.push(step.data.id);
      pageConfig.sections[step.data.id] = step.data;

      if (onStep) {
        onStep(
          {
            stepIndex: i + 1,
            totalSteps: steps.length,
            sectionType: step.sectionType,
            stepTitle: step.stepTitle,
            statusText: step.statusText,
            progressPercent: Math.round(((i + 1) / steps.length) * 100),
          },
          JSON.parse(JSON.stringify(pageConfig))
        );
      }

      // Small natural pause for real-time visual streaming experience
      await new Promise((r) => setTimeout(r, 600));
    }

    return pageConfig;
  },
};
