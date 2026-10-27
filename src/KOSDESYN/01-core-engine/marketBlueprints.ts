import { TenantProfile, CognitiveNodeModel, EntityProduct } from '../components/action-portal/cognitive-portal/types';

export interface MarketBlueprint {
  marketId: string;
  marketName: string;
  categoryName: string;
  icon: string;
  description: string;
  tenantTemplate: Partial<TenantProfile>;
  cognitiveNodesTemplate: Omit<CognitiveNodeModel, 'tenantId'>[];
  productsTemplate: EntityProduct[];
}

export const MARKET_BLUEPRINTS: Record<string, MarketBlueprint> = {
  // 1. נדל״ן, תיווך ומגרשים
  real_estate: {
    marketId: 'real_estate',
    marketName: 'נדל״ן, פרויקטים ותיווך יוקרה',
    categoryName: 'real_estate',
    icon: 'Building',
    description: 'סוכנויות תיווך, יזמי נדל״ן, פרויקטים חדשים מקבלן והשקעות מעבר לים.',
    tenantTemplate: {
      category: 'real_estate',
      tagline: 'נכסי יוקרה והשקעות נדל״ן מניבות בהתאמה אישית',
      archetypeId: 'masculine',
      openingHours: 'א-ה: 09:00-19:00 | תיאום סיור בנכס בתיאום מראש',
      agentName: 'יועץ הנדל״ן וההשקעות האישי',
      themeColors: {
        primary: '#EAB308',
        micColor: '#EAB308',
        micGlow: 'rgba(234, 179, 8, 0.4)',
        capsuleBg: '#090d16',
        capsuleBorder: '#EAB308',
        accent: '#EAB308'
      },
      welcomeExperience: {
        type: 'video',
        mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-living-room-with-a-view-of-the-city-42998-large.mp4',
        fallbackImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        title: 'נכסי יוקרה והשקעות במיקומים המובילים',
        subtitle: 'פנטהאוזים, וילות יוקרה והזדמנויות השקעה עם תשואה מוכחת',
        badgeText: 'PRIME REAL ESTATE',
        ctaText: 'לכל הנכסים והפרויקטים ◀'
      },
      aboutStory: {
        title: 'אודות חברת הנדל״ן והפיתוח',
        badge: 'ניסיון ומצוינות',
        quote: '״נדל״ן איכותי אינו רק 4 קירות - הוא עוגן כלכלי ואיכות חיים יוצאת דופן.״',
        paragraphs: [
          'אנו מתמחים באיתור, שיווק וניהול נכסי יוקרה והשקעות אסטרטגיות באזורי הביקוש החמים ביותר.',
          'מעטפת הליווי שלנו כוללת בדיקת נאותות משפטית, ייעוץ משכנתאות מותאם אישית וליווי עד לקבלת המפתח.'
        ],
        pillars: [
          { title: 'בדיקת נאותות ושקיפות מלאה', desc: 'בדיקה הנדסית, שמאית ומשפטית מקיפה לכל נכס.', icon: 'ShieldCheck' },
          { title: 'מיקומי פרימיום מנצחים', desc: 'קרבה לצירי תחבורה, נוף פתוח ותשואה מובטחת.', icon: 'MapPin' },
          { title: 'ליווי פיננסי ומשכנתאות 360°', desc: 'תפירת חבילת מימון אופטימלית מול כל הבנקים.', icon: 'TrendingUp' }
        ],
        stats: [
          { label: 'עסקאות מוצלחות', value: '450+', icon: 'CheckCircle2' },
          { label: 'תשואה שנתית ממוצעת', value: '8.4%', icon: 'Percent' },
          { label: 'שנות ניסיון', value: '15+', icon: 'Award' },
          { label: 'סניפים ומרכזי ייעוץ', value: '2', icon: 'Building' }
        ]
      },
      compassConfig: {
        up: { action: 'newest', tooltip: 'פרויקטים חדשים מקבלן (על הנייר)', filterPrompt: 'תציג לי פרויקטים חדשים' },
        down: { action: 'oldest', tooltip: 'הזדמנויות יד שנייה ומחיר הזדמנות', filterPrompt: 'תציג לי נכסים בהזדמנות' },
        right: { action: 'priciest', tooltip: 'פנטהאוזים ווילות קצה יוקרתיות', filterPrompt: 'מה נכסי היוקרה המובילים?' },
        left: { action: 'cheapest', tooltip: 'דירות השקעה קומפקטיות ותשואה גבוהה', filterPrompt: 'תציג לי דירות להשקעה' }
      }
    },
    cognitiveNodesTemplate: [
      {
        id: 'node_root_properties',
        parentId: null,
        indexBadge: '01',
        audience: 'guest',
        contentPurpose: 'product_showcase',
        questionText: 'קטלוג הנכסים והפרויקטים המובילים',
        shortAnswer: 'פנטהאוזים, דירות גן, מגדלי יוקרה והשקעות תשואה',
        primaryIcon: 'Building',
        secondaryIcon: 'Home',
        navigation: { type: 'ENTITY_VIEW' }
      },
      {
        id: 'node_root_mortgage',
        parentId: null,
        indexBadge: '02',
        audience: 'guest',
        contentPurpose: 'service_consultation',
        questionText: 'תכנון מימון, משכנתאות ותשואה שנתית',
        shortAnswer: 'מחשבון החזרים, ייעוץ משכנתא מותאם והתאמת תנאי תשלום',
        primaryIcon: 'Calculator',
        secondaryIcon: 'TrendingUp',
        navigation: { type: 'DRILL_DOWN' }
      },
      {
        id: 'node_root_location',
        parentId: null,
        indexBadge: '03',
        audience: 'guest',
        contentPurpose: 'main_hub',
        questionText: 'משרדי החברה ומרכזי המכירות בשטח',
        shortAnswer: 'משרד ראשי בתל אביב, משרד מכירות בשרון ומענה טלפוני',
        primaryIcon: 'MapPin',
        secondaryIcon: 'Navigation',
        navigation: { type: 'SHOW_BRANCHES' }
      },
      {
        id: 'node_root_contact',
        parentId: null,
        indexBadge: '04',
        audience: 'guest',
        contentPurpose: 'service_consultation',
        questionText: 'אודותינו ותיאום סיור בנכס',
        shortAnswer: 'פגישת ייעוץ ללא התחייבות וסיור פרטי בליווי יועץ בכיר',
        primaryIcon: 'PhoneCall',
        secondaryIcon: 'Calendar',
        navigation: { type: 'SHOW_ABOUT' }
      }
    ],
    productsTemplate: [
      {
        id: 'prop_penthouse_tlv',
        title: 'פנטהאוז יוקרה מגדלי הים תל אביב',
        subtitle: '240 מ״ר + 80 מ״ר מרפסת שמש | קו ראשון לים | 3 חניות',
        category: 'פנטהאוזים',
        price: 14500000,
        badgeText: 'הזדמנות בלעדית',
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
        status: 'active',
        isAvailable: true,
        specsGrid: [
          { id: 'area', label: 'שטח בנוי', value: '240 מ״ר + 80 מרפסת', icon: 'Maximize2' },
          { id: 'rooms', label: 'חדרים', value: '5 חדרים + מאסטר ענק', icon: 'Home' },
          { id: 'parking', label: 'חניות ומחסן', value: '3 חניות תת-קרקעיות', icon: 'Car' },
          { id: 'view', label: 'נוף', value: 'קו ראשון פנורמי לים', icon: 'Compass' }
        ],
        detailsCards: [
          { id: 'p1', title: 'מפרט טכני עשיר', subtitle: 'מטבח איטלקי יוקרתי, מערכת מיזוג VRF ובית חכם מלא', icon: 'Cpu', badge: 'Smart Home', highlightColor: '#EAB308' },
          { id: 'p2', title: 'שירותי המגדל', subtitle: 'שוער 24/7, בריכה חצי אולימפית, חדר כושר וספא פרטי', icon: 'Crown', badge: 'VIP Living', highlightColor: '#3B82F6' },
          { id: 'p3', title: 'תנאי תשלום גמישים', subtitle: 'אפשרות לפריסת תשלומים 20/80 ללא הצמדה למדד', icon: 'CreditCard', badge: 'Finance', highlightColor: '#10B981' },
          { id: 'p4', title: 'מסירה מהירה', subtitle: 'הנכס מוכן למגורים מיידיים או להשכרה בתשואת שיא', icon: 'Key', badge: 'Ready', highlightColor: '#8B5CF6' }
        ]
      },
      {
        id: 'prop_villa_herzliya',
        title: 'וילת בוטיק מודרנית הרצליה פיתוח',
        subtitle: 'מגרש 500 מ״ר | בריכת גלישה | גינה מעוצבת ופרטיות מושלמת',
        category: 'וילות',
        price: 21000000,
        badgeText: 'פרטיות ויוקרה',
        imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
        status: 'active',
        isAvailable: true,
        specsGrid: [
          { id: 'lot', label: 'שטח מגרש', value: '500 מ״ר', icon: 'Maximize2' },
          { id: 'pool', label: 'בריכה פרטית', value: 'בריכת אינפיניטי מחוממת', icon: 'Waves' },
          { id: 'rooms', label: 'חדרים', value: '7 חדרים + יחידת מרתף', icon: 'Home' },
          { id: 'loc', label: 'מיקום', value: 'רחוב שקט ומבוקש', icon: 'MapPin' }
        ],
        detailsCards: [
          { id: 'v1', title: 'אדריכלות מודרנית', subtitle: 'תקרות גבוהות, מפתחי זכוכית ענקיים וחיפויי אבן טבעית', icon: 'Sparkles', badge: 'Design', highlightColor: '#EAB308' },
          { id: 'v2', title: 'מרתף מניב', subtitle: 'יחידת מרתף עצמאית עם כניסה נפרדת אידיאלית לקליניקה או משרד', icon: 'Briefcase', badge: 'Flexible', highlightColor: '#10B981' }
        ]
      }
    ]
  },

  // 2. משפטי, עורכי דין וגישור
  legal_firm: {
    marketId: 'legal_firm',
    marketName: 'משרדי עורכי דין, נוטריון וגישור',
    categoryName: 'legal',
    icon: 'Scale',
    description: 'משרדי עורכי דין מקרקעין, מסחרי, דיני עבודה, נזיקין ומשפחה.',
    tenantTemplate: {
      category: 'legal',
      tagline: 'מצוינות משפטית, ייצוג חסר פשרות וליווי אישי דיסקרטי',
      archetypeId: 'lawyer',
      openingHours: 'א-ה: 08:30-18:30 | מענה דחוף ב-WhatsApp',
      agentName: 'עוזר משפטי דיגיטלי לבדיקת זכאויות',
      themeColors: {
        primary: '#38BDF8',
        micColor: '#38BDF8',
        micGlow: 'rgba(56, 189, 248, 0.4)',
        capsuleBg: '#090d16',
        capsuleBorder: '#38BDF8',
        accent: '#38BDF8'
      },
      welcomeExperience: {
        type: 'video',
        mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-people-working-on-a-table-42999-large.mp4',
        fallbackImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
        title: 'הגנה משפטית מקיפה וליווי אישי',
        subtitle: 'בדיקת חוזים, ייצוג בבתי משפט ופתרון סכסוכים ביעילות מקסימלית',
        badgeText: 'LEGAL EXPERTS',
        ctaText: 'לכל תחומי העיסוק והשירותים ◀'
      },
      aboutStory: {
        title: 'אודות הפירמה המשפטית',
        badge: 'מוניטין ומקצועיות',
        quote: '״ההצלחה בתיק מתחילה בהכנה קפדנית, אסטרטגיה חדה ונחישות ללא פשרות.״',
        paragraphs: [
          'פירמת עורכי הדין מעניקה שירותים משפטיים מהשורה הראשונה ללקוחות פרטיים, יזמים וחברות מובילות במשק.',
          'אנו מאמינים בשקיפות מלאה, זמינות גבוהה ויחס אישי לכל לקוח ולקוח.'
        ],
        pillars: [
          { title: 'דיסקרטיות ואתיקה ללא פשרות', desc: 'שמירה מוחלטת על סודיות הלקוח ונאמנות מלאה.', icon: 'Lock' },
          { title: 'אסטרטגיה מנצחת מותאמת אישית', desc: 'בניית קו פעולה משפטי מדויק החוסך זמן ומשאבים.', icon: 'Target' },
          { title: 'זמינות גבוהה ומענה מהיר', desc: 'ערוץ תקשורת ישיר עם עורך הדין המטפל בתיק.', icon: 'PhoneCall' }
        ],
        stats: [
          { label: 'תיקים שטופלו בהצלחה', value: '1,200+', icon: 'CheckCircle2' },
          { label: 'אחוזי הצלחה ופשרות מיטיבות', value: '96%', icon: 'Percent' },
          { label: 'שנות ותק משפטי', value: '20+', icon: 'Award' }
        ]
      },
      compassConfig: {
        up: { action: 'newest', tooltip: 'שירותי ליווי עסקי וריטיינר חודשי', filterPrompt: 'תציג לי שירותי ריטיינר' },
        down: { action: 'oldest', tooltip: 'ייעוץ חד-פעמי ובדיקת מסמכים מהירה', filterPrompt: 'תציג לי ייעוץ מהיר' },
        right: { action: 'priciest', tooltip: 'ייצוג בערכאות ותביעות מורכבות', filterPrompt: 'מה שירותי הייצוג המורכבים?' },
        left: { action: 'cheapest', tooltip: 'עריכת ייפוי כוח מתמשך וצוואות', filterPrompt: 'תציג לי עריכת צוואות' }
      }
    },
    cognitiveNodesTemplate: [
      {
        id: 'node_root_legal_services',
        parentId: null,
        indexBadge: '01',
        audience: 'guest',
        contentPurpose: 'product_showcase',
        questionText: 'תחומי העיסוק והשירותים המשפטיים',
        shortAnswer: 'מקרקעין ונדל״ן, דיני עבודה, חוזים, צוואות וייפוי כוח מתמשך',
        primaryIcon: 'Scale',
        secondaryIcon: 'Briefcase',
        navigation: { type: 'ENTITY_VIEW' }
      },
      {
        id: 'node_root_faq',
        parentId: null,
        indexBadge: '02',
        audience: 'guest',
        contentPurpose: 'service_consultation',
        questionText: 'שאלות נפוצות ובדיקת זכאות ראשונית',
        shortAnswer: 'בירור ראשוני של זכויותיך המשפטיות ועלויות משוערות',
        primaryIcon: 'HelpCircle',
        secondaryIcon: 'FileCheck',
        navigation: { type: 'DRILL_DOWN' }
      },
      {
        id: 'node_root_location',
        parentId: null,
        indexBadge: '03',
        audience: 'guest',
        contentPurpose: 'main_hub',
        questionText: 'מיקום המשרד ודרכי הגעה',
        shortAnswer: 'רמת גן (מתחם הבורסה) וחניה צמודה לאורחים',
        primaryIcon: 'MapPin',
        secondaryIcon: 'Navigation',
        navigation: { type: 'SHOW_BRANCHES' }
      },
      {
        id: 'node_root_contact',
        parentId: null,
        indexBadge: '04',
        audience: 'guest',
        contentPurpose: 'service_consultation',
        questionText: 'פגישת ייעוץ דיסקרטית עם עו״ד',
        shortAnswer: 'תיאום מועד פגישה במשרד או ב-Zoom לשמירה על זכויותיך',
        primaryIcon: 'PhoneCall',
        secondaryIcon: 'Calendar',
        navigation: { type: 'SHOW_ABOUT' }
      }
    ],
    productsTemplate: [
      {
        id: 'serv_realestate_deal',
        title: 'ליווי משפטי מקיף לרכישת / מכירת דירה',
        subtitle: 'בדיקת נאותות בטאבו ועירייה | ניהול משא ומתן | דיווח למיסוי מקרקעין',
        category: 'מקרקעין',
        price: 4500,
        badgeText: 'הגנה מקסימלית',
        imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
        status: 'active',
        isAvailable: true,
        specsGrid: [
          { id: 'check', label: 'בדיקות', value: 'טאבו, תכנון ועירייה', icon: 'Search' },
          { id: 'tax', label: 'מיסוי', value: 'תכנון מס שבח ורכישה', icon: 'Percent' },
          { id: 'contract', label: 'חוזה', value: 'ניסוח והגנה על כספך', icon: 'FileText' },
          { id: 'escrow', label: 'נאמנות', value: 'חשבון נאמנות בנקאי', icon: 'ShieldCheck' }
        ],
        detailsCards: [
          { id: 'lc1', title: 'בדיקה הנדסית ומשפטית', subtitle: 'איתור חריגות בניה, צווי הריסה ועיקולים לפני חתימה', icon: 'AlertTriangle', badge: 'Due Diligence', highlightColor: '#EF4444' },
          { id: 'lc2', title: 'ליווי עד רישום הבעלות', subtitle: 'רישום הערת אזהרה מיידית והעברת זכויות מלאה בלשכת הטאבו', icon: 'CheckCircle', badge: 'Full Process', highlightColor: '#10B981' }
        ]
      },
      {
        id: 'serv_will_power',
        title: 'עריכת ייפוי כוח מתמשך וצוואה מוגנת',
        subtitle: 'עו״ד מוסמך משרד המשפטים | הפקדה מקוונת | תכנון עתידי בטוח',
        category: 'משפחה ומעמד אישי',
        price: 2800,
        badgeText: 'מוסמך משרד המשפטים',
        imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
        status: 'active',
        isAvailable: true,
        specsGrid: [
          { id: 'auth', label: 'הסמכה', value: 'עו״ד מוסמך משרד המשפטים', icon: 'Award' },
          { id: 'scope', label: 'היקף', value: 'עניינים אישיים, רכושיים ורפואיים', icon: 'Heart' },
          { id: 'deposit', label: 'הפקדה', value: 'רישום דיגיטלי אצל האפוטרופוס', icon: 'CloudUpload' }
        ],
        detailsCards: [
          { id: 'wc1', title: 'הגנה על עצמאותך בעתיד', subtitle: 'קביעה מראש מי יקבל החלטות עבורך ומניעת הצורך במינוי אפוטרופוס בבית משפט', icon: 'Shield', badge: 'Peace of Mind', highlightColor: '#38BDF8' }
        ]
      }
    ]
  },

  // 3. אסתטיקה, יופי וקוסמטיקה פרא-רפואית
  beauty_clinic: {
    marketId: 'beauty_clinic',
    marketName: 'קליניקות אסתטיקה, טיפוח ויופי פרא-רפואי',
    categoryName: 'beauty_clinic',
    icon: 'Sparkles',
    description: 'מכוני טיפוח, קליניקות אסתטיקה רפואית, טיפולי פנים, לייזר ועיצוב גבות.',
    tenantTemplate: {
      category: 'beauty_clinic',
      tagline: 'טכנולוגיות מתקדמות, תוצאות מוכחות וטיפוח בהתאמה אישית',
      archetypeId: 'feminine',
      openingHours: 'א-ה: 09:30-19:30 | ו: 08:30-13:30 (בתיאום תור מראש)',
      agentName: 'יועצת טיפוח ואסתטיקה אישית',
      themeColors: {
        primary: '#EC4899',
        micColor: '#EC4899',
        micGlow: 'rgba(236, 72, 153, 0.4)',
        capsuleBg: '#090d16',
        capsuleBorder: '#EC4899',
        accent: '#EC4899'
      },
      welcomeExperience: {
        type: 'video',
        mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-with-clear-skin-touching-her-face-42407-large.mp4',
        fallbackImageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
        title: 'חוויית טיפוח ויופי ברמה הגבוהה ביותר',
        subtitle: 'מכשור מתקדם, חומרים באישור משרד הבריאות ויחס אישי מחבק',
        badgeText: 'BEAUTY & CARE',
        ctaText: 'לכל הטיפולים ותיאום תור ◀'
      },
      aboutStory: {
        title: 'אודות הקליניקה והצוות',
        badge: 'מקצועיות וזוהר',
        quote: '״היופי הטבעי שלך הוא נקודת המוצא שלנו - אנו רק מעצימים ומדייקים אותו.״',
        paragraphs: [
          'הקליניקה מציעה את מיטב הטיפולים האסתטיים הפרא-רפואיים באמצעות מכשור מהמובילים בעולם.',
          'אנו מקפידים על אבחון עור קפדני והתאמה אישית של פרוטוקול טיפול לכל לקוחה.'
        ],
        pillars: [
          { title: 'מכשור מוסמך באישור משרד הבריאות', desc: 'טכנולוגיות מהמתקדמות בעולם לתוצאות מהירות ובטוחות.', icon: 'ShieldCheck' },
          { title: 'אבחון עור מעמיק', desc: 'התאמת שגרת טיפוח ייעודית לפי סוג העור ואורח החיים.', icon: 'Search' },
          { title: 'חוויית פינוק ורוגע VIP', desc: 'קליניקה שקטה ומרגיעה עם יחס אישי ומלטף.', icon: 'Heart' }
        ],
        stats: [
          { label: 'לקוחות מרוצות', value: '3,800+', icon: 'Smile' },
          { label: 'שנות ניסיון והסמכות', value: '12+', icon: 'Award' },
          { label: 'טיפולים טכנולוגיים', value: '15+', icon: 'Sparkles' }
        ]
      },
      compassConfig: {
        up: { action: 'newest', tooltip: 'טיפולים בטכנולוגיות לייזר ו-RF חדשות', filterPrompt: 'תציגי לי טיפולים חדשים' },
        down: { action: 'oldest', tooltip: 'טיפולי תחזוקה וזוהר קלאסיים', filterPrompt: 'תציגי לי טיפולי זוהר' },
        right: { action: 'priciest', tooltip: 'סדרות אנטי-אייג׳ינג ושיקום עמוק', filterPrompt: 'מה סדרות האנטי אייג׳ינג המובילות?' },
        left: { action: 'cheapest', tooltip: 'טיפול אבחון והיכרות במחיר מיוחד', filterPrompt: 'יש לכם טיפול היכרות מוזל?' }
      }
    },
    cognitiveNodesTemplate: [
      {
        id: 'node_root_treatments',
        parentId: null,
        indexBadge: '01',
        audience: 'guest',
        contentPurpose: 'product_showcase',
        questionText: 'תפריט הטיפולים והחבילות בקליניקה',
        shortAnswer: 'הצערת עור, מזותרפיה, פיגמנטציה, אקנה והסרת שיער',
        primaryIcon: 'Sparkles',
        secondaryIcon: 'Heart',
        navigation: { type: 'ENTITY_VIEW' }
      },
      {
        id: 'node_root_diagnosis',
        parentId: null,
        indexBadge: '02',
        audience: 'guest',
        contentPurpose: 'service_consultation',
        questionText: 'אבחון סוג העור והתאמת שגרת טיפוח',
        shortAnswer: 'ייעוץ והתאמה אישית של פרוטוקול טיפול בהתאם למצב עורך',
        primaryIcon: 'Search',
        secondaryIcon: 'Smile',
        navigation: { type: 'DRILL_DOWN' }
      },
      {
        id: 'node_root_location',
        parentId: null,
        indexBadge: '03',
        audience: 'guest',
        contentPurpose: 'main_hub',
        questionText: 'מיקום הקליניקה ושעות קבלה',
        shortAnswer: 'רחוב אחוזה, רעננה | חניה מסודרת לאורחות',
        primaryIcon: 'MapPin',
        secondaryIcon: 'Navigation',
        navigation: { type: 'SHOW_BRANCHES' }
      },
      {
        id: 'node_root_contact',
        parentId: null,
        indexBadge: '04',
        audience: 'guest',
        contentPurpose: 'service_consultation',
        questionText: 'תיאום תור לאבחון ראשוני',
        shortAnswer: 'שמירת מועד לקליניקה או ייעוץ מהיר ב-WhatsApp',
        primaryIcon: 'Calendar',
        secondaryIcon: 'MessageCircle',
        navigation: { type: 'SHOW_ABOUT' }
      }
    ],
    productsTemplate: [
      {
        id: 'treat_glow_rf',
        title: 'טיפול פרימיום RF Glow & Lift',
        subtitle: 'גלי רדיו למיצוק עמוק | החדרת סרומים היאלורוניים | זוהר מיידי',
        category: 'אנטי-אייג׳ינג',
        price: 650,
        badgeText: 'הכי מבוקש',
        imageUrl: 'https://images.unsplash.com/photo-1512290900672-1f55a1d1d87f?auto=format&fit=crop&w=800&q=80',
        status: 'active',
        isAvailable: true,
        specsGrid: [
          { id: 'dur', label: 'משך טיפול', value: '60 דקות', icon: 'Clock' },
          { id: 'tech', label: 'טכנולוגיה', value: 'RF + אולטרסוניק', icon: 'Zap' },
          { id: 'down', label: 'זמן החלמה', value: 'אפס החלמה, זוהר מיידי', icon: 'Smile' }
        ],
        detailsCards: [
          { id: 'bc1', title: 'תוצאה מיידית', subtitle: 'עור מתוח, קורן ומוזן כבר ביציאה מהקליניקה, מושלם לפני אירועים', icon: 'Sparkles', badge: 'Instant Glow', highlightColor: '#EC4899' }
        ]
      }
    ]
  }
};
