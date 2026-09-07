import React from 'react';
import { SectionType } from '../types/pageBuilder.types';

// Display Views
import { HeroSection } from '../sections/hero/HeroSection';
import { ServicesGridSection } from '../sections/services/ServicesGridSection';
import { CourseBannerSection } from '../sections/courseBanner/CourseBannerSection';
import { CampaignHeaderSection } from '../sections/campaign/CampaignHeaderSection';
import { CampaignTiersSection } from '../sections/campaign/CampaignTiersSection';
import { CampaignDonorsSection } from '../sections/campaign/CampaignDonorsSection';
import { VideoGallerySection } from '../sections/videoGallery/VideoGallerySection';
import { ImageListingSection } from '../sections/imageListing/ImageListingSection';
import { FaqSection } from '../sections/faq/FaqSection';
import { TimerSection } from '../sections/timer/TimerSection';
import { PricingSection } from '../sections/pricing/PricingSection';
import { RichContentSection } from '../sections/richContent/RichContentSection';
import { CommunitySection } from '../sections/community/CommunitySection';
import { LivePostsGridSection } from '../sections/livePosts/LivePostsGridSection';
import { LandingSection } from '../sections/landing/LandingSection';
import { ContactSection } from '../sections/contact/ContactSection';

// Editors
import { HeroEditor } from '../sections/hero/HeroEditor';
import { ServicesGridEditor } from '../sections/services/ServicesGridEditor';
import { CourseBannerEditor } from '../sections/courseBanner/CourseBannerEditor';
import { CampaignHeaderEditor } from '../sections/campaign/CampaignHeaderEditor';
import { CampaignTiersEditor } from '../sections/campaign/CampaignTiersEditor';
import { CampaignDonorsEditor } from '../sections/campaign/CampaignDonorsEditor';
import { VideoGalleryEditor } from '../sections/videoGallery/VideoGalleryEditor';
import { ImageListingEditor } from '../sections/imageListing/ImageListingEditor';
import { FaqSectionEditor } from '../sections/faq/FaqSectionEditor';
import { TimerEditor } from '../sections/timer/TimerEditor';
import { PricingEditor } from '../sections/pricing/PricingEditor';
import { RichContentEditor } from '../sections/richContent/RichContentEditor';
import { CommunityEditor } from '../sections/community/CommunityEditor';
import { LivePostsGridEditor } from '../sections/livePosts/LivePostsGridEditor';
import { LandingEditor } from '../sections/landing/LandingEditor';
import { ContactEditor } from '../sections/contact/ContactEditor';

// Icons
import {
  LayoutTemplate,
  Grid,
  GraduationCap,
  Target,
  Heart,
  Users,
  Video,
  Image as ImageIcon,
  HelpCircle,
  Clock,
  CreditCard,
  FileText,
  MessageCircle,
  Calendar,
  Send,
  Phone,
} from 'lucide-react';

export interface SectionDefinition {
  type: SectionType;
  name: string;
  category: 'headers' | 'content' | 'media' | 'campaign' | 'marketing' | 'contact';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  viewComponent: React.ComponentType<{ config: any; [key: string]: any }>;
  editorComponent: React.ComponentType<{ config: any; onChange: (updated: any) => void }>;
  defaultConfig: any;
}

export const SECTION_REGISTRY: Record<SectionType, SectionDefinition> = {
  hero: {
    type: 'hero',
    name: 'אזור ראשי (Hero)',
    category: 'headers',
    description: 'כותרת ענקית, תת-כותרת, תמונת אווירה/וידאו, כפתורי הנעה לפעולה או טופס לידים',
    icon: LayoutTemplate,
    viewComponent: HeroSection,
    editorComponent: HeroEditor,
    defaultConfig: {
      type: 'hero',
      visible: true,
      anchorId: 'hero',
      title: 'הפלטפורמה המובילה לניהול קהילות ודפי נחיתה',
      subtitle: 'חדש! גרסה 2.0 זמינה כעת',
      description: 'עצבו, ערכו ופרסמו דפי אינטרנט מתקדמים בקלות, במהירות ובהתאמה מלאה למובייל.',
      imageSrc: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
      layout: 'fz',
      heroStyle: 'classic',
      flexDirection: 'row',
      buttonsVisible: true,
      primaryButton: { text: 'התחל עכשיו בחינם', url: '#', target: '_self' },
      secondaryButton: { text: 'צפה בהדגמה חיה', url: '#', target: '_self' },
      backgroundColor: 'transparent',
    },
  },
  services: {
    type: 'services',
    name: 'שירותים וכרטיסיות',
    category: 'content',
    description: 'גריד מעוצב של כרטיסי שירותים, תכונות ופיצ׳רים עם אייקונים ואפקטים',
    icon: Grid,
    viewComponent: ServicesGridSection,
    editorComponent: ServicesGridEditor,
    defaultConfig: {
      type: 'services',
      visible: true,
      anchorId: 'services',
      title: 'השירותים והפתרונות המובילים שלנו',
      description: 'מגוון כלים מתקדמים שנבנו במיוחד עבור הצמיחה והניהול שלכם',
      columns: 3,
      effect: 'hover-scale',
      backgroundColor: 'transparent',
      items: [
        { id: '1', title: 'בניית דפים ויזואלית', description: 'יוצר עמודים מלא בגרור ושחרר', icon: 'Layout', url: '#', isVisible: true },
        { id: '2', title: 'סנכרון CRM אוטומטי', description: 'כל הלידים מוזרמים מיידית למערכת', icon: 'Users', url: '#', isVisible: true, badge: 'מומלץ' },
        { id: '3', title: 'תמיכה במובייל ו-RTL', description: 'חוויית משתמש מושלמת בעברית', icon: 'Sparkles', url: '#', isVisible: true },
      ],
    },
  },
  mainContent: {
    type: 'mainContent',
    name: 'באנר קורס / תוכן מודגש',
    category: 'content',
    description: 'באנר מרכזי מודגש עם נקודות מפתח, כפתורי הרשמה ופס תחתון צבעוני',
    icon: GraduationCap,
    viewComponent: CourseBannerSection,
    editorComponent: CourseBannerEditor,
    defaultConfig: {
      type: 'mainContent',
      visible: true,
      anchorId: 'mainContent',
      title: 'הצטרפו למחזור ההכשרה המקצועי הקרוב',
      subtitle: 'הרשמה מוקדמת בהנחה מיוחדת',
      features: ['ליווי אישי של מנטור צמוד', 'פרויקטים מעשיים מהעולם האמיתי', 'תעודת הסמכה בינלאומית', 'גישה לכל החיים להקלטות'],
      buttonsVisible: true,
      primaryButton: { text: 'שריינו מקום עכשיו', url: '#' },
      imageSrc: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      bottomStripeColor: '#4f46e5',
      backgroundColor: 'transparent',
    },
  },
  campaignHeader: {
    type: 'campaignHeader',
    name: 'מד התקדמות קמפיין תרומות',
    category: 'campaign',
    description: 'מד יעד כספי, סכום שגויס, גרף התקדמות וסטטיסטיקות תורמים וימים שנותרו',
    icon: Target,
    viewComponent: CampaignHeaderSection,
    editorComponent: CampaignHeaderEditor,
    defaultConfig: {
      type: 'campaignHeader',
      visible: true,
      anchorId: 'campaignHeader',
      title: 'קמפיין שותפות: בונים את העתיד',
      subtitle: 'יחד מגיעים אל היעד',
      targetGoal: 100000,
      totalRaised: 64500,
      donorsCount: 184,
      daysLeft: 14,
      backgroundColor: 'transparent',
    },
  },
  campaignTiers: {
    type: 'campaignTiers',
    name: 'מדרגות תרומה וסכומים',
    category: 'campaign',
    description: 'כפתורי סכומים מהירים, תרומה חד-פעמית והוראות קבע עם כרטיסיות הדגשה',
    icon: Heart,
    viewComponent: CampaignTiersSection,
    editorComponent: CampaignTiersEditor,
    defaultConfig: {
      type: 'campaignTiers',
      visible: true,
      anchorId: 'campaignTiers',
      title: 'בחרו סכום לתרומה והיו שותפים',
      subtitle: 'כל תרומה מתקבלת בברכה ומקדמת את הפעילות',
      donationType: 'both',
      backgroundColor: 'transparent',
      tiers: [
        { id: '1', title: 'שותף בבניין', amount: 180, description: 'תמיכה חודשית בפעילות', isPopular: false },
        { id: '2', title: 'בונה עולם', amount: 360, description: 'הקדשת יום לימוד שלם', isPopular: true, badgeText: 'הכי נבחר' },
        { id: '3', title: 'עמוד התווך', amount: 1000, description: 'הנצחה על לוח התורמים', isPopular: false },
      ],
    },
  },
  campaignDonors: {
    type: 'campaignDonors',
    name: 'כרטיסיות תורמים ושגרירים',
    category: 'campaign',
    description: 'פיד תורמים בזמן אמת, חיפוש שמות, מיון לפי סכומים והקדשות אישיות',
    icon: Users,
    viewComponent: CampaignDonorsSection,
    editorComponent: CampaignDonorsEditor,
    defaultConfig: {
      type: 'campaignDonors',
      visible: true,
      anchorId: 'campaignDonors',
      title: 'תורמים אחרונים ושגרירים',
      showSearch: true,
      showSort: true,
      cardLayout: 'grid-3',
      backgroundColor: 'transparent',
      donors: [
        { id: '1', name: 'משפחת כהן', amount: 1800, date: 'לפני שעתיים', message: 'לרפואת כל חולי עמו ישראל', isAnonymous: false },
        { id: '2', name: 'תורם אנונימי', amount: 500, date: 'לפני 4 שעות', isAnonymous: true },
        { id: '3', name: 'ישראל ישראלי', amount: 360, date: 'אתמול', message: 'בהצלחה רבה בפעילות הקדושה!', isAnonymous: false },
      ],
    },
  },
  videoGallery: {
    type: 'videoGallery',
    name: 'גלריית וידאו ומדיה',
    category: 'media',
    description: 'נגן וידאו מרכזי (YouTube / Vimeo / MP4) עם תמונות ממוזערות',
    icon: Video,
    viewComponent: VideoGallerySection,
    editorComponent: VideoGalleryEditor,
    defaultConfig: {
      type: 'videoGallery',
      visible: true,
      anchorId: 'videoGallery',
      title: 'צפו בסרטוני הדרכה והרצאות',
      subtitle: 'מגוון תכני וידאו באיכות גבוהה',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      desktopHeight: '480px',
      backgroundColor: 'transparent',
      images: [],
    },
  },
  imageListing: {
    type: 'imageListing',
    name: 'גלריית תמונות וכרטיסים',
    category: 'media',
    description: 'גריד תמונות רספונסיבי עם כותרות, תגיות ואפקטים',
    icon: ImageIcon,
    viewComponent: ImageListingSection,
    editorComponent: ImageListingEditor,
    defaultConfig: {
      type: 'imageListing',
      visible: true,
      anchorId: 'imageListing',
      title: 'גלריית תמונות מהאירועים שלנו',
      imagesPerRow: 3,
      backgroundColor: 'transparent',
      images: [
        { id: '1', imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80', title: 'אירוע פתיחה מרכזי', subtitle: 'תשרי תשפ״ו' },
        { id: '2', imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', title: 'צוות ההדרכה והפיתוח', subtitle: 'כנס שנתי' },
        { id: '3', imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80', title: 'מרכז הלמידה הדיגיטלי', subtitle: 'חדר מחשבים' },
      ],
    },
  },
  faq: {
    type: 'faq',
    name: 'שאלות ותשובות (FAQ)',
    category: 'content',
    description: 'אקורדיון שאלות ותשובות נפתחות בעיצוב נקי ונוח לקריאה',
    icon: HelpCircle,
    viewComponent: FaqSection,
    editorComponent: FaqSectionEditor,
    defaultConfig: {
      type: 'faq',
      visible: true,
      anchorId: 'faq',
      title: 'שאלות ותשובות נפוצות',
      subtitle: 'כל מה שרציתם לדעת על הפלטפורמה והשירות',
      backgroundColor: 'transparent',
      items: [
        { id: '1', question: 'איך מתחילים לעבוד עם המערכת?', answer: 'נרשמים בקלות, בוחרים תבנית עיצוב או מתחילים מאפס, ומעצבים את העמוד בעזרת עורך הבית הוויזואלי הנוח.' },
        { id: '2', question: 'האם ניתן לחבר דומיין מותאם אישית?', answer: 'בהחלט! המערכת תומכת בחיבור דומיין פרטי לכל עמוד, קמפיין או דף נחיתה שתקימו.' },
        { id: '3', question: 'איך עובד הסנכרון עם מערכת ה-CRM?', answer: 'כל פנייה דרך הטפסים בעמוד נשמרת ומוזרמת באופן אוטומטי לכרטיסיות הלידים במערכת ה-CRM.' },
      ],
    },
  },
  timer: {
    type: 'timer',
    name: 'טיימר ספירה לאחור',
    category: 'marketing',
    description: 'שעון רץ לאחור לימי אירוע, מבצעים, השקות או סיום קמפיין',
    icon: Clock,
    viewComponent: TimerSection,
    editorComponent: TimerEditor,
    defaultConfig: {
      type: 'timer',
      visible: true,
      anchorId: 'timer',
      title: 'הספירה לאחור החלה',
      subtitle: 'אל תפספסו את ההזדמנות להצטרף',
      targetDate: '2026-12-31T23:59:59',
      backgroundColor: 'transparent',
      boxBackgroundColor: '#0f172a',
      numberColor: '#ffffff',
      labelColor: '#94a3b8',
    },
  },
  pricing: {
    type: 'pricing',
    name: 'מחירונים וחבילות',
    category: 'marketing',
    description: 'טבלת חבילות, מחירים, רשימת פיצ׳רים והבלטת חבילה מומלצת',
    icon: CreditCard,
    viewComponent: PricingSection,
    editorComponent: PricingEditor,
    defaultConfig: {
      type: 'pricing',
      visible: true,
      anchorId: 'pricing',
      title: 'תוכניות ומחירים מותאמים',
      subtitle: 'בחרו את המסלול המתאים ביותר לעסק או לקהילה שלכם',
      backgroundColor: 'transparent',
      packages: [
        { id: '1', name: 'בסיסי', price: '₪99', period: '/ חודש', description: 'למשתמשים יחידים ומתחילים', features: ['עד 5 דפים מעוצבים', 'חיבור דומיין מותאם', 'טפסי לידים בסיסיים', 'תמיכה באימייל'], buttonText: 'התחל בחינם', buttonUrl: '#' },
        { id: '2', name: 'מקצועי (Pro)', price: '₪249', period: '/ חודש', description: 'לקהילות, מוסדות ועסקים בצמיחה', isFeatured: true, badge: 'הכי משתלם', features: ['דפים ועמודים ללא הגבלה', 'סנכרון מלא למערכת CRM', 'עוזר AI ליצירת תוכן ותמונות', 'תמיכת VIP 24/7 בוואטסאפ'], buttonText: 'בחר מסלול Pro', buttonUrl: '#' },
        { id: '3', name: 'ארגוני (Enterprise)', price: '₪590', period: '/ חודש', description: 'לארגונים ורשתות עם דרישות מתקדמות', features: ['פתרון מותאם אישית (Custom SLA)', 'מנהל חשבון אישי ייעודי', 'אינטגרציות API מתקדמות', 'הדרכות צוות פרונטליות'], buttonText: 'צור קשר להתאמה', buttonUrl: '#' },
      ],
    },
  },
  richContent: {
    type: 'richContent',
    name: 'אודות / תוכן מעוצב',
    category: 'content',
    description: 'עורך תוכן עשיר עבור פסקאות אודות, חזון, סיפורי הצלחה ופירוט נרחב',
    icon: FileText,
    viewComponent: RichContentSection,
    editorComponent: RichContentEditor,
    defaultConfig: {
      type: 'richContent',
      visible: true,
      anchorId: 'richContent',
      heading: 'אודות הפרויקט והחזון שלנו',
      body: '<p>אנו פועלים מתוך תחושת שליחות עמוקה לחבר, להנגיש ולהעצים את הקהילה בכל מקום בעולם.</p><p>הפלטפורמה שלנו פותחה במיוחד כדי לתת מענה שלם, טכנולוגי ואיכותי לכל יוזמה וקהילה.</p>',
      layout: 'standard',
      backgroundColor: 'transparent',
    },
  },
  community: {
    type: 'community',
    name: 'קהילה וחיבור וואטסאפ',
    category: 'contact',
    description: 'כרטיס קהילה חמה, קישור מהיר לקבוצת וואטסאפ, ציטוט ותגית חברים',
    icon: MessageCircle,
    viewComponent: CommunitySection,
    editorComponent: CommunityEditor,
    defaultConfig: {
      type: 'community',
      visible: true,
      anchorId: 'community',
      title: 'הצטרפו לקהילה שלנו',
      subtitle: 'קהילה חמה, תומכת ומחוברת',
      description: 'קבוצת הוואטסאפ של הקהילה היא המקום להתעדכן בזמן אמת, לשאול שאלות ולקחת חלק פעיל.',
      quote: '״הכוח של הקהילה הוא הערבות ההדדית והחיבור בין כולם״',
      buttonText: 'הצטרפות לקבוצת הוואטסאפ',
      whatsappNumber: '972545947701',
      badgeTitle: '5,000+ חברים',
      badgeSubtitle: 'בכל רחבי הארץ',
      backgroundColor: 'transparent',
    },
  },
  livePosts: {
    type: 'livePosts',
    name: 'עדכונים ואירועים (פוסטים)',
    category: 'content',
    description: 'גריד פוסטים וידיעות אחרונות עם תמונות, תאריכים ותגיות',
    icon: Calendar,
    viewComponent: LivePostsGridSection,
    editorComponent: LivePostsGridEditor,
    defaultConfig: {
      type: 'livePosts',
      visible: true,
      anchorId: 'livePosts',
      title: 'עדכונים ואירועים אחרונים',
      description: 'כל מה שחדש וקורה בפעילות ובקהילה שלנו',
      backgroundColor: 'transparent',
      customPages: [
        { id: '1', title: 'סיכום כנס הקיץ השנתי בהשתתפות מאות משפחות', excerpt: 'חוויה מעצימה ומרגשת של חיבור ולימוד משותף...', date: '15 באוגוסט 2026', tag: 'אירועים', imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80', linkUrl: '#' },
        { id: '2', title: 'השקת תוכנית המלגות לסטודנטים וחוקרים', excerpt: 'פתיחת מסלול חדש להענקת מלגות מחקר וסיוע לימודי...', date: '02 באוגוסט 2026', tag: 'חדשות', imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80', linkUrl: '#' },
        { id: '3', title: 'פרויקט שיפוץ והרחבת מרכז הפעילות הקהילתי', excerpt: 'התקדמות העבודות לקראת פתיחת השנה החדשה...', date: '28 ביולי 2026', tag: 'פיתוח', imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80', linkUrl: '#' },
      ],
    },
  },
  landingSection: {
    type: 'landingSection',
    name: 'דף נחיתה וטופס הרשמה',
    category: 'marketing',
    description: 'אזור קמפיין ייעודי עם טופס איסוף לידים מובנה',
    icon: Send,
    viewComponent: LandingSection,
    editorComponent: LandingEditor,
    defaultConfig: {
      type: 'landingSection',
      visible: true,
      anchorId: 'landingSection',
      title: 'השאירו פרטים לקבלת מידע נוסף',
      subtitle: 'הצטרפו למאות המשתתפים שכבר עשו את הצעד הראשון',
      description: 'מלאו את הפרטים הקצרים בטופס ונציג מקצועי יחזור אליכם בהקדם האפשרי.',
      buttonText: 'שלח פרטים עכשיו',
      backgroundColor: 'transparent',
    },
  },
  contact: {
    type: 'contact',
    name: 'אזור צור קשר',
    category: 'contact',
    description: 'פרטי התקשרות (טלפון, מייל, כתובת, וואטסאפ) וטופס פנייה ישיר',
    icon: Phone,
    viewComponent: ContactSection,
    editorComponent: ContactEditor,
    defaultConfig: {
      type: 'contact',
      visible: true,
      anchorId: 'contact',
      title: 'צרו איתנו קשר',
      subtitle: 'נשמח לעמוד לשירותכם לכל שאלה, פנייה או התייעצות',
      phone: '03-1234567',
      email: 'info@example.com',
      address: 'רחוב הרצל 1, תל אביב',
      whatsapp: '972545947701',
      showForm: true,
      backgroundColor: 'transparent',
    },
  },
};
