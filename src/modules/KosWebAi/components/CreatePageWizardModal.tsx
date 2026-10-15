import React, { useState } from 'react';
import {
  PageCategory,
  PAGE_CATEGORIES,
  PageBuilderConfig,
} from '../types/pageBuilder.types';
import { SECTION_REGISTRY } from '../registry/sectionRegistry';
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

  // Product / Service specific
  servicePrice?: number;
  enableDirectPayment?: boolean;
  features?: string[];

  // Campaign specific
  targetGoal?: number;
  campaignTiers?: Array<{ title: string; amount: number }>;

  // Video / KosTube specific
  youtubeUrl?: string;
}

interface CreatePageWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: PageCreationOptions) => Promise<void>;
  brandDna?: any;
}

export const CreatePageWizardModal: React.FC<CreatePageWizardModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  brandDna,
}) => {
  const [step, setStep] = useState<'category' | 'details'>('category');
  const [category, setCategory] = useState<PageCategory>('service_product');

  // Form State
  const [pageTitle, setPageTitle] = useState('');
  const [slugSuffix, setSlugSuffix] = useState('');
  const [description, setDescription] = useState('');

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

  // Service Specific
  const [servicePrice, setServicePrice] = useState(499);
  const [enableDirectPayment, setEnableDirectPayment] = useState(true);

  // Campaign Specific
  const [targetGoal, setTargetGoal] = useState(150000);

  // Video Specific
  const [youtubeUrl, setYoutubeUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentCategoryConfig = PAGE_CATEGORIES[category] || PAGE_CATEGORIES.service_product;
  const calculatedSlug = `${currentCategoryConfig.slugPrefixLower}-${(slugSuffix || pageTitle || 'new')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || Math.floor(Math.random() * 9000 + 1000)}`;

  const handleSelectCategory = (cat: PageCategory) => {
    setCategory(cat);
    // Apply smart default titles based on category
    if (cat === 'event') {
      setPageTitle('אירוע קהילה וכנס מקצועי 2026');
      setDescription('הצטרפו אלינו לערב מלא השראה, נטוורקינג וכלים מעשיים.');
    } else if (cat === 'service_product') {
      setPageTitle('חבילת שירות מקיפה ופתרונות צמיחה');
      setDescription('השירות המקצועי המוביל שיקח את הפעילות שלכם לשלב הבא.');
    } else if (cat === 'fundraising') {
      setPageTitle('קמפיין גיוס שותפים ותרומות');
      setDescription('יחד מגייסים למען המטרה החשובה שלנו. כל תרומה משפיעה.');
    } else if (cat === 'info_content') {
      setPageTitle('מדריך מקיף ומרכז ידע מקצועי');
      setDescription('כל מה שרציתם לדעת – תובנות, שאלות נפוצות ומידע שימושי.');
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
            <div className="py-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Option 1: Service / Product (KOSASS) */}
              <button
                type="button"
                onClick={() => handleSelectCategory('service_product')}
                className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 text-right transition-all flex items-start gap-3.5 cursor-pointer hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      שירות / מוצר
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-mono font-bold">
                      KOSASS
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    מכירת מוצרים ושירותים, מחירונים, הצעות ערך וסליקה ישירה
                  </p>
                </div>
              </button>

              {/* Option 2: Info & Content (KOSINFO) */}
              <button
                type="button"
                onClick={() => handleSelectCategory('info_content')}
                className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 text-right transition-all flex items-start gap-3.5 cursor-pointer hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      מידע ותוכן
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-mono font-bold">
                      KOSINFO
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    מאמרים ומדריכים, שאלות נפוצות ומרכז ידע מקצועי
                  </p>
                </div>
              </button>

              {/* Option 3: Event Pages (KOSEVENT) */}
              <button
                type="button"
                onClick={() => handleSelectCategory('event')}
                className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 text-right transition-all flex items-start gap-3.5 cursor-pointer hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      אירועים ו-RSVP
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-mono font-bold">
                      KOSEVENT
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    כנסים והשקות עם זמנים, מקום, שמירה ביומן, Waze, הרשמת CRM ותשלום
                  </p>
                </div>
              </button>

              {/* Option 4: Campaign & Fundraising (KOSFUNRISE) */}
              <button
                type="button"
                onClick={() => handleSelectCategory('fundraising')}
                className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-rose-500 dark:hover:border-rose-500 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 text-right transition-all flex items-start gap-3.5 cursor-pointer hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      גיוס כספים וקמפיינים
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-mono font-bold">
                      KOSFUNRISE
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    קמפיינים לגיוס תרומות, מדרגות נתינה, קיר תורמים ומד יעד חי
                  </p>
                </div>
              </button>

              {/* Option 5: YouTube Video Post (KOSTUBE) */}
              <button
                type="button"
                onClick={() => handleSelectCategory('youtube_post')}
                className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-red-500 dark:hover:border-red-500 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-red-50/40 dark:hover:bg-red-950/20 text-right transition-all flex items-start gap-3.5 cursor-pointer hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Youtube className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      פוסט וידאו יוטיוב
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-[10px] font-mono font-bold">
                      KOSTUBE
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    עמודי וידאו מבוססי AI, נגן FlowPlayer ומאמרי SEO
                  </p>
                </div>
              </button>

              {/* Option 6: General Page (P) */}
              <button
                type="button"
                onClick={() => handleSelectCategory('general')}
                className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 text-right transition-all flex items-start gap-3.5 cursor-pointer hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      עמוד נחיתה כללי
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold">
                      P
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    עמוד נחיתה חופשי לבחירה ידנית של כל האזורים
                  </p>
                </div>
              </button>
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
                  /p/{calculatedSlug}
                </div>
              </div>

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

              {/* SERVICE / PRODUCT SPECIFIC */}
              {category === 'service_product' && (
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/60 flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 text-xs font-bold">
                    <ShoppingBag className="w-4 h-4" />
                    <span>הגדרות מוצר / שירות ותשלום</span>
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
                        <span>שילוב טופס רכישה ותשלום ישיר בעמוד</span>
                      </label>
                    </div>
                  </div>

                  <p className="text-[11px] text-blue-600 dark:text-blue-400">
                    * עם יצירת העמוד, רכיב המיתוג (Brand DNA) יעודכן אוטומטית לגבי הסלאג {calculatedSlug}.
                  </p>
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
