import React, { useState } from 'react';
import {
  PageCategory,
  PAGE_CATEGORIES,
  PageBuilderConfig,
  ARCHIVE_7_SECTIONS_SPECS,
  LayoutArchetype,
  LAYOUT_ARCHETYPES,
} from '../types/pageBuilder.types';
import { SECTION_REGISTRY } from '../registry/sectionRegistry';
import { resolveLiveBrandDna } from '../services/brandSectionHydrator';
import {
  X,
  Sparkles,
  ShoppingBag,
  BookOpen,
  Calendar,
  HeartHandshake,
  Youtube,
  Globe,
  ArrowRight,
  ArrowLeft,
  Clock,
  MapPin,
  Navigation,
  CreditCard,
  Users,
  CalendarPlus,
  Check,
  ChevronRight,
  DollarSign,
  FileText,
  HelpCircle,
  Flame,
  GraduationCap,
  LayoutGrid,
  Zap,
} from 'lucide-react';
import { clsx } from 'clsx';

export interface PageCreationOptions {
  category: PageCategory;
  pageTitle: string;
  slugSuffix?: string;
  description?: string;

  // Event specific
  eventDate?: string;
  eventTime?: string;
  eventEndTime?: string;
  locationName?: string;
  locationAddress?: string;
  wazeQuery?: string;
  enableCrmRsvp?: boolean;
  crmGroupName?: string;
  isPaidEvent?: boolean;
  ticketPrice?: number;
  enableCalendarAdd?: boolean;

  // Product / Service / Checkout specific
  servicePrice?: number;
  enableDirectPayment?: boolean;
  features?: string[];

  // Campaign specific
  targetGoal?: number;
  campaignTiers?: Array<{ title: string; amount: number }>;

  // Video / KosTube specific
  youtubeUrl?: string;

  // Homepage / Ecosystem specific
  layoutArchetype?: LayoutArchetype;
  isHomePage?: boolean;
}

interface CreatePageWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: PageCreationOptions) => Promise<void>;
  brandDna?: any;
  tenantId?: string;
}

export const CreatePageWizardModal: React.FC<CreatePageWizardModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  brandDna,
  tenantId,
}) => {
  const effBrand = brandDna || resolveLiveBrandDna(null, tenantId);
  const [step, setStep] = useState<'category' | 'details'>('category');
  const [category, setCategory] = useState<PageCategory>('info_content');

  // Form State
  const [pageTitle, setPageTitle] = useState('');
  const [slugSuffix, setSlugSuffix] = useState('');
  const [description, setDescription] = useState('');
  const [layoutArchetype, setLayoutArchetype] = useState<LayoutArchetype>('bento_hub');

  // Event Specific
  const [eventDate, setEventDate] = useState('2026-11-20');
  const [eventTime, setEventTime] = useState('19:30');
  const [eventEndTime, setEventEndTime] = useState('22:00');
  const [locationName, setLocationName] = useState('מתחם האירועים המרכזי');
  const [locationAddress, setLocationAddress] = useState('דרך מנחם בגין 144, תל אביב');
  const [wazeQuery, setWazeQuery] = useState('דרך מנחם בגין 144 תל אביב');
  const [enableCrmRsvp, setEnableCrmRsvp] = useState(true);
  const [crmGroupName, setCrmGroupName] = useState('נרשמי אירוע השקה');
  const [isPaidEvent, setIsPaidEvent] = useState(false);
  const [ticketPrice, setTicketPrice] = useState(120);
  const [enableCalendarAdd, setEnableCalendarAdd] = useState(true);

  // Service / Checkout / Course Specific
  const [servicePrice, setServicePrice] = useState(499);
  const [enableDirectPayment, setEnableDirectPayment] = useState(true);

  // Campaign Specific
  const [targetGoal, setTargetGoal] = useState(150000);

  // Video Specific
  const [youtubeUrl, setYoutubeUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentCategoryConfig = PAGE_CATEGORIES[category] || PAGE_CATEGORIES.info_content;
  const calculatedSlug = category === 'home'
    ? ((slugSuffix || 'home').toLowerCase().trim().replace(/[^a-z0-9-]/g, '-') || 'home')
    : `${currentCategoryConfig.slugPrefixLower}-${(slugSuffix || pageTitle || 'new')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || Math.floor(Math.random() * 9000 + 1000)}`;

  const handleSelectCategory = (cat: PageCategory) => {
    setCategory(cat);
    // Apply smart default titles based on category
    if (cat === 'home') {
      const company = effBrand?.identity?.companyName || (tenantId && tenantId !== '_master' ? tenantId : 'המותג שלנו');
      setPageTitle(`${company} - עמוד בית ראשי`);
      setDescription(effBrand?.identity?.slogan || 'שער הכניסה הדינמי לכל התכנים, המוצרים, השירותים והאירועים שלנו');
      setSlugSuffix('home');
    } else if (cat === 'info_content') {
      setPageTitle('מדריך מקיף ומרכז ידע מקצועי');
      setDescription('כל מה שרציתם לדעת – תובנות מעמיקות, שאלות נפוצות ומידע שימושי.');
    } else if (cat === 'event') {
      setPageTitle('כנס שנתי ואירוע קהילה 2026');
      setDescription('הצטרפו אלינו לערב מלא השראה, נטוורקינג וכלים מעשיים.');
    } else if (cat === 'checkout') {
      setPageTitle('הצטרפות והסדרת תשלום מאובטח');
      setDescription('הצעה מיוחדת לתקופת ההשקה • סליקה מהירה בתקן אבטחה מחמיר.');
    } else if (cat === 'community') {
      setPageTitle('קהילת המובילים הרשמית VIP');
      setDescription('מועדון חברים סגור לנטוורקינג, מפגשים חודשיים והטבות בלעדיות.');
    } else if (cat === 'fundraising') {
      setPageTitle('קמפיין שותפות וגיוס תרומות');
      setDescription('יחד מגייסים למען המטרה החשובה שלנו. כל תרומה משפיעה.');
    } else if (cat === 'course') {
      setPageTitle('התכנית המקיפה להכשרה מקצועית 2026');
      setDescription('סילבוס מעשי, פרויקטים מהשטח וליווי צמוד של מנטור מוביל.');
    } else if (cat === 'service_product') {
      setPageTitle('חבילת שירות מקיפה ופתרונות צמיחה');
      setDescription('השירות המקצועי המוביל שיקח את הפעילות שלכם לשלב הבא.');
    } else if (cat === 'youtube_post') {
      setPageTitle('הרצאה מקצועית ותובנות וידאו');
      setDescription('צפו בהרצאה המלאה כולל תמליל וניתוח מעמיק.');
    } else {
      setPageTitle('דף נחיתה חדש');
      setDescription('עמוד נחיתה מעוצב ומותאם אישית.');
    }
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await onConfirm({
        category,
        pageTitle: pageTitle.trim(),
        slugSuffix: calculatedSlug,
        description: description.trim(),
        layoutArchetype,
        isHomePage: category === 'home',
        eventDate,
        eventTime,
        eventEndTime,
        locationName,
        locationAddress,
        wazeQuery: wazeQuery || locationAddress,
        enableCrmRsvp,
        crmGroupName,
        isPaidEvent,
        ticketPrice: Number(ticketPrice),
        enableCalendarAdd,
        servicePrice: Number(servicePrice),
        enableDirectPayment,
        targetGoal: Number(targetGoal),
        youtubeUrl,
      });
      onClose();
    } catch (err) {
      console.error('[CreatePageWizardModal] submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md select-none overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-right animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col justify-between">
        {/* Header Bar */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {step === 'category' ? 'יצירת עמוד חדש - בחר קטגוריה' : `הגדרת עמוד: ${currentCategoryConfig.label}`}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {step === 'category'
                    ? 'בחר את סוג העמוד ליצירת מבנה, סלג וחיבורים מותאמים אישית'
                    : category === 'home'
                    ? 'סלג שייווצר: / (עמוד הבית הראשי של הדומיין)'
                    : `סלג שייווצר: /p/${calculatedSlug}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {step === 'details' && (
                <button
                  type="button"
                  onClick={() => setStep('category')}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>חזרה</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* STEP 1: CATEGORY SELECTION */}
          {step === 'category' && (
            <div className="py-5 flex flex-col gap-4">
              {/* FEATURED: Living Ecosystem Master Homepage */}
              <button
                type="button"
                onClick={() => handleSelectCategory('home')}
                className="group p-4 sm:p-5 rounded-2xl border-2 border-indigo-500/40 hover:border-indigo-500 bg-gradient-to-r from-indigo-50/80 via-purple-50/40 to-pink-50/40 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-900 text-right transition-all flex items-start gap-4 cursor-pointer hover:shadow-lg shadow-indigo-500/10"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-indigo-500/20">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                      עמוד בית חי ומערכתי (Master Homepage Ecosystem)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold shadow-sm">
                      מומלץ • 10 אזורים מחוברים
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    שער כניסה חי ונושם המחבר בזמן אמת את כל 6 הארכיונים (תוכן, אירועים, קורסים, סליקה, קהילה, קמפיינים) לצד מוצרי דגל ושירותים – עם בחירה בין 5 ארכיטיפי עימוד ייחודיים ללא שבלונה קבועה!
                  </p>
                  <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                      5 ארכיטיפי פריסה (Bento, Luxury, Community, Academy, Sales)
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      נתיב ראשי /
                    </span>
                  </div>
                </div>
              </button>

              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                  תבניות ארכיון מובנות (7 אזורים לכל ארכיון)
                </span>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                  הצמדה ישירה לנתיב הארכיון
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Content Pages Archive (KOSINFO) */}
                <button
                  type="button"
                  onClick={() => handleSelectCategory('info_content')}
                  className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 text-right transition-all flex items-start gap-3.5 cursor-pointer hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        עמודי תוכן ומאמרים
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-mono font-bold">
                        KOSINFO
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      7 אזורים: Hero מאמר, RichContent, מדדי עומק, שאלות נפוצות, ביקורות, קהילה והורדת PDF
                    </p>
                    <span className="inline-block mt-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      7 אזורים מובנים
                    </span>
                  </div>
                </button>

                {/* 2. Events Archive (KOSEVENT) */}
                <button
                  type="button"
                  onClick={() => handleSelectCategory('event')}
                  className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 text-right transition-all flex items-start gap-3.5 cursor-pointer hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        עמודי אירועים וכנסים
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-mono font-bold">
                        KOSEVENT
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      7 אזורים: Hero אירוע, ספירה לאחור, אישור RSVP ו-Waze, אג'נדה, מדדים, שאלות נפוצות ומוקד
                    </p>
                    <span className="inline-block mt-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                      7 אזורים מובנים
                    </span>
                  </div>
                </button>

                {/* 3. Checkout Pages Archive (KOSCHECKOUT) */}
                <button
                  type="button"
                  onClick={() => handleSelectCategory('checkout')}
                  className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 text-right transition-all flex items-start gap-3.5 cursor-pointer hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        דפי סליקה ותשלום
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-mono font-bold">
                        KOSCHECKOUT
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      7 אזורים: Hero הצעת ערך, מחירון, טופס סליקה מאובטח, טיימר דחיפות, המלצות, FAQ ותמיכה
                    </p>
                    <span className="inline-block mt-1.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                      7 אזורים מובנים
                    </span>
                  </div>
                </button>

                {/* 4. Community Pages Archive (KOSCOMMUNITY) */}
                <button
                  type="button"
                  onClick={() => handleSelectCategory('community')}
                  className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 text-right transition-all flex items-start gap-3.5 cursor-pointer hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        דפי קהילה ומועדון
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[10px] font-mono font-bold">
                        KOSCOMMUNITY
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      7 אזורים: Hero קהילתי, כרטיסי הטבות, מדדי קהילה, פוסטים חיים, סיפורי חברים, FAQ והרשמה
                    </p>
                    <span className="inline-block mt-1.5 text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                      7 אזורים מובנים
                    </span>
                  </div>
                </button>

                {/* 5. Campaign & Fundraising (KOSFUNRISE) */}
                <button
                  type="button"
                  onClick={() => handleSelectCategory('fundraising')}
                  className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-rose-500 dark:hover:border-rose-500 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 text-right transition-all flex items-start gap-3.5 cursor-pointer hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        דפי קמפיין לגיוס
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-mono font-bold">
                        KOSFUNRISE
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      7 אזורים: מד יעד חי, סיפור קמפיין, מדרגות תרומה, קיר תורמים, נתוני השפעה, סעיף 46 ומוקד
                    </p>
                    <span className="inline-block mt-1.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                      7 אזורים מובנים
                    </span>
                  </div>
                </button>

                {/* 6. Courses Archive (KOSCOURSE) */}
                <button
                  type="button"
                  onClick={() => handleSelectCategory('course')}
                  className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 text-right transition-all flex items-start gap-3.5 cursor-pointer hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        דפי קורסים והכשרות
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-mono font-bold">
                        KOSCOURSE
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      7 אזורים: Hero קורס, באנר תוכן וסילבוס, נתוני הצלחה, מסלולי לימוד, ביקורות בוגרים, FAQ ו-WhatsApp
                    </p>
                    <span className="inline-block mt-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                      7 אזורים מובנים
                    </span>
                  </div>
                </button>
              </div>

              {/* Optional & General Categories */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  עמודים נוספים וכלליים:
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* YouTube Video Post (KOSTUBE) */}
                <button
                  type="button"
                  onClick={() => handleSelectCategory('youtube_post')}
                  className="group p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-red-500 dark:hover:border-red-500 bg-slate-50/50 dark:bg-slate-950/50 text-right transition-all flex items-center gap-3 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                    <Youtube className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      פוסט וידאו יוטיוב (KOSTUBE)
                    </span>
                  </div>
                </button>

                {/* General Page (P) */}
                <button
                  type="button"
                  onClick={() => handleSelectCategory('general')}
                  className="group p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-500 dark:hover:border-slate-500 bg-slate-50/50 dark:bg-slate-950/50 text-right transition-all flex items-center gap-3 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-500/10 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      עמוד נחיתה כללי (P)
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: RELEVANT QUESTIONS & PROPOSALS */}
          {step === 'details' && (
            <form onSubmit={handleSubmit} className="py-4 flex flex-col gap-5 overflow-y-auto max-h-[62vh] pr-1 pl-1">
              {/* Category Badge & Live Slug Banner */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={clsx('px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border', currentCategoryConfig.badgeStyle)}>
                    {currentCategoryConfig.slugPrefix}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    סוג עמוד נבחר: <strong>{currentCategoryConfig.label}</strong>
                  </span>
                </div>
                <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold" dir="ltr">
                  {category === 'home' ? '/' : `/p/${calculatedSlug}`}
                </div>
              </div>

              {/* 7-Sections Archive Blueprint Preview Banner */}
              {ARCHIVE_7_SECTIONS_SPECS[category as keyof typeof ARCHIVE_7_SECTIONS_SPECS] && (
                <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/60 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300 text-xs font-bold">
                      <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>7 האזורים שיוצמדו לנתיב /{currentCategoryConfig.slugPrefixLower}:</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                      תבנית ארכיון מלאה
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ARCHIVE_7_SECTIONS_SPECS[category as keyof typeof ARCHIVE_7_SECTIONS_SPECS].sections.map((secType, i) => (
                      <span
                        key={secType}
                        className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/80 text-[11px] text-slate-800 dark:text-slate-200 font-medium shadow-2xs"
                      >
                        <strong className="text-indigo-600 dark:text-indigo-400 ml-1">{i + 1}.</strong>
                        {SECTION_REGISTRY[secType]?.name || secType}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Title & Slogan Fields */}
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    כותרת ראשית לעמוד *
                  </label>
                  <input
                    type="text"
                    required
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                    placeholder="לדוגמה: כנס הנדל״ן השנתי 2026"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    תיאור קצר / תת-כותרת
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="תקציר שיווקי של העמוד..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>

              {/* ================= CATEGORY SPECIFIC SECTIONS ================= */}

              {/* HOMEPAGE ECOSYSTEM SPECIFIC: 5 Layout Archetypes Selector */}
              {category === 'home' && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-pink-50/40 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-800/80 flex flex-col gap-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 text-xs font-black">
                      <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>בחר ארכיטיפ עימוד ייחודי לסאב-דומיין (Layout Archetype)</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      ללא שבלונה קבועה
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    כדי למנוע תסמונת שבלונה גנרית, כל סאב-דומיין יכול לבחור מבנה וסדר אזורים ייעודי בהתאם לאופיו:
                  </p>

                  <div className="grid grid-cols-1 gap-2.5">
                    {(Object.keys(LAYOUT_ARCHETYPES) as LayoutArchetype[]).map((archKey) => {
                      const spec = LAYOUT_ARCHETYPES[archKey];
                      const isSelected = layoutArchetype === archKey;
                      return (
                        <button
                          key={archKey}
                          type="button"
                          onClick={() => setLayoutArchetype(archKey)}
                          className={clsx(
                            'p-3.5 rounded-2xl border text-right transition-all flex items-start justify-between cursor-pointer',
                            isSelected
                              ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                              : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={clsx(
                              'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            )}>
                              {archKey === 'bento_hub' && <LayoutGrid className="w-4 h-4" />}
                              {archKey === 'editorial_boutique' && <FileText className="w-4 h-4" />}
                              {archKey === 'warm_community' && <Users className="w-4 h-4" />}
                              {archKey === 'knowledge_academy' && <GraduationCap className="w-4 h-4" />}
                              {archKey === 'direct_showcase' && <Zap className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={clsx('text-xs font-black', isSelected ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-900 dark:text-white')}>
                                  {spec.name}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                                  {spec.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                {spec.description}
                              </p>
                              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                <span className="text-[10px] text-slate-400 font-bold">מבנה מוביל:</span>
                                {spec.sectionOrder.slice(0, 5).map((sec, sIdx) => (
                                  <span key={sIdx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    {SECTION_REGISTRY[sec]?.name || sec}
                                  </span>
                                ))}
                                {spec.sectionOrder.length > 5 && (
                                  <span className="text-[9px] text-slate-400">+{spec.sectionOrder.length - 5}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0 mr-2">
                            <div className={clsx(
                              'w-5 h-5 rounded-full flex items-center justify-center border transition-all',
                              isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-700'
                            )}>
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* EVENT SPECIFIC: Time, Location, Waze, Calendar, CRM & Payments */}
              {category === 'event' && (
                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/60 flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-bold">
                    <Calendar className="w-4 h-4" />
                    <span>פרטי האירוע: זמנים, מקום, שמירה ביומן ואישורי הגעה</span>
                  </div>

                  {/* Date & Time Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        תאריך האירוע
                      </label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        שעת התחלה
                      </label>
                      <input
                        type="time"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        שעת סיום משוערת
                      </label>
                      <input
                        type="time"
                        value={eventEndTime}
                        onChange={(e) => setEventEndTime(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Location & Waze */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        שם המקום / אולם
                      </label>
                      <input
                        type="text"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        placeholder="מתחם האירועים קושאן"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        כתובת מלאה להגעה
                      </label>
                      <input
                        type="text"
                        value={locationAddress}
                        onChange={(e) => {
                          setLocationAddress(e.target.value);
                          setWazeQuery(e.target.value);
                        }}
                        placeholder="דרך מנחם בגין 144, תל אביב"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Features Toggles */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-amber-200/50 dark:border-amber-800/40">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={enableCalendarAdd}
                        onChange={(e) => setEnableCalendarAdd(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                      <CalendarPlus className="w-3.5 h-3.5 text-amber-600" />
                      <span>אזור שמירה ביומן (סנכרון מיידי ל-Google Calendar / Apple Calendar)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={enableCrmRsvp}
                        onChange={(e) => setEnableCrmRsvp(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                      <Users className="w-3.5 h-3.5 text-amber-600" />
                      <span>הרשמה באמצעות טופס חכם עם חיבור אוטומטי למערכת ה-CRM</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={isPaidEvent}
                        onChange={(e) => setIsPaidEvent(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                      <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                      <span>אירוע כרוך בתשלום (חיבור למערכת התשלומים של קשר)</span>
                    </label>

                    {isPaidEvent && (
                      <div className="mr-6 mt-1 flex items-center gap-2">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          מחיר כרטיס (₪):
                        </label>
                        <input
                          type="number"
                          value={ticketPrice}
                          onChange={(e) => setTicketPrice(Number(e.target.value))}
                          className="w-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CHECKOUT / SERVICE / PRODUCT SPECIFIC */}
              {(category === 'service_product' || category === 'checkout') && (
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/60 flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 text-xs font-bold">
                    <CreditCard className="w-4 h-4" />
                    <span>הגדרות סליקה, מחירון ותשלום מאובטח</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        מחיר מומלץ / חבילת בסיס (₪)
                      </label>
                      <input
                        type="number"
                        value={servicePrice}
                        onChange={(e) => setServicePrice(Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200 pb-2">
                        <input
                          type="checkbox"
                          checked={enableDirectPayment}
                          onChange={(e) => setEnableDirectPayment(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        />
                        <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                        <span>שילוב טופס רכישה וסליקה ישירה בעמוד</span>
                      </label>
                    </div>
                  </div>

                  <p className="text-[11px] text-blue-600 dark:text-blue-400">
                    * עם יצירת העמוד, רכיב המיתוג (Brand DNA) יעודכן אוטומטית לגבי הסלאג {calculatedSlug}.
                  </p>
                </div>
              )}

              {/* COURSE SPECIFIC */}
              {category === 'course' && (
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/60 flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300 text-xs font-bold">
                    <GraduationCap className="w-4 h-4" />
                    <span>הגדרות קורס והרשמת תלמידים (KOSCOURSE)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        מחיר הקורס / מסלול לימוד (₪)
                      </label>
                      <input
                        type="number"
                        value={servicePrice}
                        onChange={(e) => setServicePrice(Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CAMPAIGN SPECIFIC */}
              {category === 'fundraising' && (
                <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/60 flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 text-xs font-bold">
                    <HeartHandshake className="w-4 h-4" />
                    <span>הגדרות קמפיין גיוס כספים ושגרירים (KOSFUNRISE)</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      סכום יעד הגיוס (₪)
                    </label>
                    <input
                      type="number"
                      value={targetGoal}
                      onChange={(e) => setTargetGoal(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <p className="text-[11px] text-rose-600 dark:text-rose-400">
                    * העמוד ייווצר עם מד התקדמות לגיוס, מדרגות תרומה מהירות וחיבור לסליקה ישירה.
                  </p>
                </div>
              )}

              {/* YOUTUBE VIDEO SPECIFIC */}
              {category === 'youtube_post' && (
                <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/60 flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-300 text-xs font-bold">
                    <Youtube className="w-4 h-4" />
                    <span>קישור וידאו מיוטיוב (KOSTUBE)</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      כתובת הסרטון ביוטיוב (YouTube URL)
                    </label>
                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('category')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  חזרה לבחירת סוג
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !pageTitle.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>יוצר עמוד...</span>
                  ) : (
                    <>
                      <span>צור עמוד תחת {currentCategoryConfig.slugPrefix}</span>
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
