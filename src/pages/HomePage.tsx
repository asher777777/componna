import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  User as UserIcon,
  LogIn,
  LogOut,
  ShieldCheck,
  Sun,
  Moon,
  ArrowLeft,
  ChevronDown,
  CheckCircle2,
  Users,
  Filter,
  Database,
  FileSpreadsheet,
  Tag,
  BarChart3,
  Send,
  Zap,
  Clock,
  QrCode,
  Bot,
  Calendar,
  RefreshCw,
  Webhook,
  MessageSquare,
  Image as ImageIcon,
  MousePointerClick,
  Layers,
  Smartphone,
  Palette,
  Search,
  Globe,
  Gauge,
  Copy,
  TrendingUp,
  Share2,
  UserCheck,
  Target,
  Trophy,
  Bell,
  Award,
  CreditCard,
  Heart,
  MessageCircle,
  Sliders,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Lock
} from 'lucide-react';
import { useBrandDna } from '../modules/brand-dna-hub/context/BrandDnaContext';
import { useSystemConnection } from '../core/connection/SystemConnectionContext';
import { AuthModal } from '../components/Auth/AuthModal';
import { AuthState, subscribeToAuth, logoutUser, fetchUserRole } from '../services/firebaseAuth';
import { StorefrontService } from '../modules/saas-storefront-composer/services/storefrontService';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { brandDna } = useBrandDna();
  const { firebaseApp, isConnected } = useSystemConnection();

  // Theme state: defaults to light (Day Mode)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('comona_home_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try {
      localStorage.setItem('comona_home_theme', next);
    } catch {}
  };

  const isLight = theme === 'light';

  // Auth modal & state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    uid: null,
    email: null,
    displayName: null,
    photoURL: null,
    role: 'viewer',
    isAuthenticated: false,
    isAnonymous: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsub = subscribeToAuth(firebaseApp, (state) => {
      setAuthState(state);
    });
    return () => unsub();
  }, [firebaseApp]);

  /**
   * ניתוב משתמש חכם לאחר התחברות:
   * 1. לקוח עם סאב-דומיין (Customer) -> מעבר ללוח הבקרה שבסאב-דומיין שלו (?tenant=...&mode=admin)
   * 2. מנהל מערכת (Admin) -> מעבר ללוח הבקרה הראשי (/control-center)
   * 3. אורח רשום (Registered User / Viewer) -> נשאר בעמוד הבית עם חיווי התחברות מלא
   */
  const handleAuthSuccess = async (user: any) => {
    setIsAuthModalOpen(false);
    if (!user) return;

    const email = user.email || '';
    const phone = user.phoneNumber || '';
    const uid = user.uid || '';

    // א. בדיקת הרשאת המשתמש ב-Firebase / Firestore תחילה (מניעת הפניית מנהל לסאב-דומיין)
    const userRole = await fetchUserRole(uid, firebaseApp);

    if (userRole === 'admin') {
      // מנהל מערכת ראשי -> נשאר בפלטפורמה המרכזית ומנווט ללוח הבקרה הראשי
      navigate('/control-center');
      return;
    }

    // ב. אם המשתמש אינו מנהל מערכת - בדיקה אם הוא לקוח בעל סאב-דומיין קיים
    const tenantByEmail = email ? StorefrontService.findTenantForUser(email) : null;
    const tenantByPhone = phone ? StorefrontService.findTenantForUser(phone) : null;
    const matchedTenant = tenantByEmail || tenantByPhone;

    if (matchedTenant && matchedTenant.subdomain) {
      const isLocal = window.location.hostname.startsWith('localhost') || window.location.hostname.startsWith('127.0.0.1');
      if (isLocal) {
        window.location.href = `${window.location.origin}/?tenant=${matchedTenant.subdomain}&mode=admin`;
      } else {
        window.location.href = `https://${matchedTenant.fullDomain}/?mode=admin`;
      }
      return;
    }

    // ג. משתמש רשום רגיל (viewer / client) ללא סאב-דומיין -> נשאר בעמוד הבית הרגיל בהתאם לבקשת המשתמש
  };

  // Brand DNA values with graceful defaults
  const companyName = brandDna.identity.companyName || 'Comona Workspace';
  const slogan = brandDna.identity.slogan || 'פלטפורמת SaaS מודולרית מתקדמת לניהול, שיווק וגיוס';
  const shortVision = brandDna.identity.shortVision || 'הפלטפורמה המובילה לניהול קהילות, אוטומציות וואטסאפ, הקמת אתרים וגיוס המונים חכם.';
  const primaryColor = brandDna.designTokens.primaryColor || '#6366f1';
  const supportPhone = brandDna.trust.contactPhone || '050-0000000';
  const supportEmail = brandDna.trust.contactEmail || 'contact@comona.pro';
  const officeAddress = brandDna.trust.officeAddress || 'ישראל';

  const scrollToSection = (id: string) => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 10 מעלות של CRM
  const crmFeatures = [
    { num: '01', title: 'תיעוד וניהול לקוחות 360°', desc: 'כרטיס לקוח מקיף המרכז היסטוריית שיחות, רכישות, תרומות, טפסים ותגיות במקום אחד.', icon: Users },
    { num: '02', title: 'פילוח קהילות וקבוצות חכמות', desc: 'יצירת פלחים דינמיים לפי מאפיינים, פעילות והעדפות (Smart Groups) בלחיצת כפתור.', icon: Filter },
    { num: '03', title: 'סנכרון דו-כיווני חי עם Firestore', desc: 'אפס השהיות – כל איש קשר חדש מתעדכן אוטומטית בכל רכיבי המערכת בזמן אמת.', icon: Database },
    { num: '04', title: 'ייצוא מהיר וגמיש ל-Excel ו-vCard', desc: 'הורדת נתונים מרוכזת ל-Excel, CSV וייצוא אנשי קשר לקובץ vCard ישירות לסמארטפון.', icon: FileSpreadsheet },
    { num: '05', title: 'מערכת תיוג דינמית רב-ממדית', desc: 'תיוג חכם לצביעת לידים, מעקב אחר שלבי משפך מכירה וסטטוס התקשרות אישי.', icon: Tag },
    { num: '06', title: 'אנליטיקה ומדדי המרה גרפיים', desc: 'גרפים אינטראקטיביים של שיעורי המרה, צמיחת לקוחות לאורך זמן ומשפך הכנסות חי.', icon: BarChart3 },
    { num: '07', title: 'שליחת הודעות מרוכזות ומותאמות', desc: 'חיבור ישיר לוואטסאפ לשיגור פניות אישיות ממוקדות בהתאמה לקבוצות המפולחות.', icon: Send },
    { num: '08', title: 'אוטומציית קליטת לידים (Zero Leak)', desc: 'קליטה אוטומטית מטפסים חכמים, עמודי נחיתה ומערכת הגיוס ישירות ל-CRM ללא אובדן.', icon: Zap },
    { num: '09', title: 'היסטוריית פעילות וציר זמן אישי', desc: 'מעקב מדויק אחר כל אירוע, שינוי סטטוס, פנייה ותרומה שבוצעו על ידי איש הקשר.', icon: Clock },
    { num: '10', title: 'אבטחה והפרדת נתונים מוחלטת', desc: 'בידוד מלא של נתוני הלקוחות ברמת טננט בהתאם לתקני אבטחה ופרטיות מחמירים.', icon: ShieldCheck },
  ];

  // 10 מעלות של וואטסאפ
  const whatsappFeatures = [
    { num: '01', title: 'חיבור ישיר ויציב דרך Green-API', desc: 'סנכרון מהיר ופשוט לסמארטפון באמצעות סריקת קוד QR בתוך שניות ספורות.', icon: QrCode },
    { num: '02', title: 'בוט שירות ומכירות מבוסס AI', desc: 'מענה חכם, טבעי ומיידי ללקוחות 24/7 המונע על ידי מודלי Google Gemini מתקדמים.', icon: Bot },
    { num: '03', title: 'שיגור הודעות מותאמות אישית בלחיצה', desc: 'שליחת הודעות אישיות עם פרמטרים דינמיים: שם הלקוח, קישור אישי וסכום תשלום.', icon: Send },
    { num: '04', title: 'תזמון וניהול סטטוסים אוטומטי', desc: 'העלאת תמונות וסרטונים לסטטוס וואטסאפ לפי לוח זמנים מדויק שנקבע מראש.', icon: Calendar },
    { num: '05', title: 'סנכרון מלא ל-CRM בזמן אמת', desc: 'כל שיחה, הודעה נכנסת או מענה אוטומטי מתועדים מיידית בכרטיס הלקוח.', icon: RefreshCw },
    { num: '06', title: 'תרחישים ואוטומציות (Webhook Triggers)', desc: 'שיגור אוטומטי של הודעת תודה, אישור הזמנה או תזכורת לאחר כל אירוע מערכת.', icon: Webhook },
    { num: '07', title: 'צ\'אט-רום חי לשירות לקוחות', desc: 'ממשק שיחה פנימי ונוח המאפשר למנהל ולנציגים להשתלט על שיחה ידנית בכל עת.', icon: MessageSquare },
    { num: '08', title: 'תמיכה עשירה בקבצי מדיה', desc: 'שליחת תמונות, מסמכי PDF, קישורים וסרטונים ישירות מגלריית המדיה המרכזית.', icon: ImageIcon },
    { num: '09', title: 'שידור ממוקד לקבוצות ורשימות תפוצה', desc: 'הפצת הודעות ממוקדות לפלחי ה-CRM ללא סיכון חסימה ועל פי כללי השידור.', icon: Users },
    { num: '10', title: 'ממשק API פתוח ואינטגרציות', desc: 'שילוב מיידי של אירועי סליקה, קמפיינים וטפסים אל תוך ערוצי השיחה בוואטסאפ.', icon: Zap },
  ];

  // 10 מעלות של בונה העמודים
  const pageBuilderFeatures = [
    { num: '01', title: 'עורך ויזואלי Drag & Drop מתקדם', desc: 'בנייה ועריכה מהירה של דפי נחיתה ללא צורך בידע בקוד, עם תצוגה חיה בזמן אמת.', icon: MousePointerClick },
    { num: '02', title: 'ספריית סקציות עשירה ומודולרית', desc: 'עשרות סקציות מוכנות: הירו, מחירונים, המלצות, טפסים חכמים, גלריות ונגני וידאו.', icon: Layers },
    { num: '03', title: 'התאמה רספונסיבית מושלמת (Mobile-First)', desc: 'תצוגה אופטימלית וחלקה לחלוטין בכל מסך – סמארטפון, טאבלט ומחשב שולחני.', icon: Smartphone },
    { num: '04', title: 'שילוב רכיבי מערכת חיים (Embedded)', desc: 'הטמעת טפסים חכמים, מסופי סליקה ונגני Flow Player ישירות בתוך העמוד.', icon: Zap },
    { num: '05', title: 'סנכרון מלא ל-Brand DNA של המותג', desc: 'יישום אוטומטי של צבעי המותג, הפונטים, הטיפוגרפיה והסגנון העיצובי שלכם.', icon: Palette },
    { num: '06', title: 'אופטימיזציית SEO מובנית למנועי חיפוש', desc: 'ניהול מטא-תגיות, כותרות, תיאורים וסכמות מקומיות (Local SEO) לדירוג גבוה בגוגל.', icon: Search },
    { num: '07', title: 'חיבור סאב-דומיינים ודומיינים פרטיים', desc: 'פרסום עמודים תחת דומיין אישי מותאם או סאב-דומיין מאובטח בלחיצת כפתור אחת.', icon: Globe },
    { num: '08', title: 'ביצועי טעינה מהירים במיוחד', desc: 'ארכיטקטורת קוד קלת משקל ודחיסת תמונות אוטומטית להשגת ציון מהירות מקסימלי.', icon: Gauge },
    { num: '09', title: 'מנגנון תבניות (Blueprints) לשכפול', desc: 'יצירת עמודים חדשים מתוך תבניות מקצועיות מוכחות בתוך שניות ספורות.', icon: Copy },
    { num: '10', title: 'מעקב המרות וסטטיסטיקה מובנית', desc: 'מוני צפיות מדויקים, מעקב הקלקות על כפתורי הנעה לפעולה ורישום לידים בזמן אמת.', icon: TrendingUp },
  ];

  // 10 מעלות של מערכת הגיוס
  const fundraisingFeatures = [
    { num: '01', title: 'הקמת קמפיינים מבוססי שגרירים', desc: 'רתימת שגרירים ומעגלי השפעה קהילתיים להכפלת כוח הגיוס וההגעה לקהלים חדשים.', icon: Share2 },
    { num: '02', title: 'דף אישי וקישור ייחודי לכל שגריר', desc: 'כל שגריר מקבל דף נחיתה אישי עם יעד גיוס עצמאי וקישור שיתוף פרטי למעקב.', icon: UserCheck },
    { num: '03', title: 'מד יעד גיוס אינטראקטיבי בזמן אמת', desc: 'סרגל התקדמות חי המציג את סך הגיוס, אחוז הביצוע, יתרת היעד והימים שנותרו.', icon: Target },
    { num: '04', title: 'לוח מובילים גיימיפיקטיבי (Leaderboard)', desc: 'דירוג שגרירים מעורר תחרות חיובית עם גביעים, מדליות ותגי הישג בזמן אמת.', icon: Trophy },
    { num: '05', title: 'התראות תרומה חיות (Live Donation Alerts)', desc: 'פופ-אפ מרהיב המקפיץ כל תרומה חדשה על המסך ומעודד תורמים נוספים להצטרף.', icon: Bell },
    { num: '06', title: 'כרטיסי מדרגות תרומה (Donation Tiers)', desc: 'מדרגות תרומה מוגדרות מראש עם זכויות והוקרות המעלות את גובה התרומה הממוצע.', icon: Award },
    { num: '07', title: 'סליקה מאובטחת והפקת קבלות אוטומטית', desc: 'סליקת אשראי ו-Bit מהירה דרך קשר עם שליחת קבלה ואישור תרומה מיידי לתורם.', icon: CreditCard },
    { num: '08', title: 'קיר תורמים חי וברכות אישיות', desc: 'הצגת התורמים האחרונים עם הקדשות וברכות חמות המעניקות תחושת שותפות וקהילה.', icon: Heart },
    { num: '09', title: 'שיתוף חכם בוואטסאפ וברשתות', desc: 'כפתורי שיתוף מהירים היוצרים הודעת וואטסאפ מוכנה עם הקישור האישי של השגריר.', icon: MessageCircle },
    { num: '10', title: 'דשבורד ניהול קמפיין מקיף למנהל', desc: 'שליטה מלאה על הוספת שגרירים, עדכון יעדים, אישור תרומות וייצוא דוחות מסודרים.', icon: Sliders },
  ];

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 selection:bg-indigo-500 selection:text-white ${
        isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#06080e] text-slate-100'
      }`}
      dir="rtl"
    >
      {/* ========================================================= */}
      {/* HEADER / NAVIGATION BAR                                   */}
      {/* ========================================================= */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${
          isLight
            ? 'bg-white/90 border-slate-200/90 shadow-sm'
            : 'bg-slate-950/85 border-slate-800/80 shadow-lg'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/30 shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-black text-lg sm:text-xl tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {companyName}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-mono">
                  v2.0 Clean
                </span>
              </div>
              <p className={`text-xs hidden sm:block truncate max-w-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {slogan}
              </p>
            </div>
          </div>

          {/* Center: Section Navigation Anchors */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-2xl border bg-slate-100/60 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 text-xs font-semibold">
            <button
              onClick={() => scrollToSection('crm')}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                isLight ? 'text-slate-700 hover:text-indigo-600 hover:bg-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              ניהול CRM
            </button>
            <button
              onClick={() => scrollToSection('whatsapp')}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                isLight ? 'text-slate-700 hover:text-indigo-600 hover:bg-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              וואטסאפ ובוטים
            </button>
            <button
              onClick={() => scrollToSection('page-builder')}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                isLight ? 'text-slate-700 hover:text-indigo-600 hover:bg-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              בונה העמודים
            </button>
            <button
              onClick={() => scrollToSection('fundraising')}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                isLight ? 'text-slate-700 hover:text-indigo-600 hover:bg-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              מערכת הגיוס
            </button>
          </nav>

          {/* Right Controls: Theme Toggle + Login Modal Icon + Control Center Button */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-amber-600 border-slate-200 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-800'
              }`}
              title={isLight ? 'מעבר למצב לילה (Dark Mode)' : 'מעבר למצב יום (Light Mode)'}
              aria-label="החלף ערכת נושא"
            >
              {isLight ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-300" />}
            </button>

            {/* LOGIN / AUTH MODAL TRIGGER ICON (As explicitly requested) */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className={`relative p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-center group ${
                authState.isAuthenticated
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
              title={
                authState.isAuthenticated
                  ? `מחובר: ${authState.displayName || authState.email || 'משתמש'} (${authState.role}) - לחץ לפרטים`
                  : 'התחברות למערכת (Auth Modal)'
              }
              aria-label="מודל התחברות"
            >
              <UserIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {authState.isAuthenticated && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950 animate-pulse" />
              )}
            </button>

            {/* Direct Control Center Launcher */}
            <button
              onClick={() => navigate('/control-center')}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/25 transition transform active:scale-95 cursor-pointer"
              title="כניסה למרכז השליטה והבקרה הראשי"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>מרכז השליטה</span>
            </button>
          </div>

        </div>
      </header>

      {/* ========================================================= */}
      {/* HERO SECTION                                              */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold shadow-sm bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>פלטפורמת הניהול והשיווק המודולרית המובילה • אפס נתוני דמה</span>
          </div>

          {/* Main Headline */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              כל הכלים העסקיים שלך{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                תחת מערכת אחת חכמה
              </span>
            </h1>
            <p className={`text-base sm:text-lg lg:text-xl font-normal leading-relaxed max-w-2xl mx-auto ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}>
              {shortVision}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/control-center')}
              className="flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm px-6 py-3.5 rounded-2xl shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>כניסה ללוח הבקרה והניהול</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection('crm')}
              className={`flex items-center gap-2 font-bold text-sm px-6 py-3.5 rounded-2xl border transition cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-800'
              }`}
            >
              <span>גלה את 4 הרכיבים</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Feature Badges Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-8">
            <div
              onClick={() => scrollToSection('crm')}
              className={`p-4 rounded-2xl border transition text-center cursor-pointer hover:border-emerald-500/50 ${
                isLight ? 'bg-white/80 border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-2 font-bold">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs">ניהול CRM וקהילות</h3>
              <p className="text-[11px] text-slate-400 mt-1">10 מעלות מובילות</p>
            </div>

            <div
              onClick={() => scrollToSection('whatsapp')}
              className={`p-4 rounded-2xl border transition text-center cursor-pointer hover:border-green-500/50 ${
                isLight ? 'bg-white/80 border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-2 font-bold">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs">וואטסאפ ובוטים AI</h3>
              <p className="text-[11px] text-slate-400 mt-1">10 מעלות מובילות</p>
            </div>

            <div
              onClick={() => scrollToSection('page-builder')}
              className={`p-4 rounded-2xl border transition text-center cursor-pointer hover:border-blue-500/50 ${
                isLight ? 'bg-white/80 border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-2 font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs">בונה עמודים ואתרים</h3>
              <p className="text-[11px] text-slate-400 mt-1">10 מעלות מובילות</p>
            </div>

            <div
              onClick={() => scrollToSection('fundraising')}
              className={`p-4 rounded-2xl border transition text-center cursor-pointer hover:border-amber-500/50 ${
                isLight ? 'bg-white/80 border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-2 font-bold">
                <Trophy className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs">מערכת גיוס ושגרירים</h3>
              <p className="text-[11px] text-slate-400 mt-1">10 מעלות מובילות</p>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 1: CRM & AUDIENCE MANAGEMENT                      */}
      {/* ========================================================= */}
      <section id="crm" className="py-20 border-b border-slate-200/80 dark:border-slate-800/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header & Image Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left 5 Cols: Showcase Image */}
            <div className="lg:col-span-5 relative group">
              <div className="relative rounded-3xl overflow-hidden border border-emerald-500/30 shadow-2xl shadow-emerald-500/10">
                <img
                  src="/images/crm_showcase.jpg"
                  alt="CRM Showcase"
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-6">
                  <div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950">
                      CRM 360° LIVE
                    </span>
                    <h4 className="text-white font-bold text-base mt-2">ניהול לקוחות, קהילות ולידים</h4>
                    <p className="text-xs text-slate-300">אפס דמה • סנכרון חי ל-Firestore</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 7 Cols: Title & Description */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Users className="w-3.5 h-3.5" />
                <span>רכיב ה-CRM ואנשי הקשר</span>
              </div>
              <h2 className={`text-2xl sm:text-4xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                מערכת CRM חכמה לשליטה מוחלטת בכל קשרי הלקוחות
              </h2>
              <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                מרכז ניהול קשרים מתקדם המאחד את כל היסטוריית הלקוח, פילוח קהילות חכמות (Smart Groups), תיוג דינמי ואנליטיקה גרפית חיה, עם סנכרון מלא לכל מודולי הפלטפורמה.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/crm-analytics')}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  <span>כניסה ללוח ה-CRM</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => navigate('/crm-groups')}
                  className={`flex items-center gap-2 font-bold text-xs px-4 py-2.5 rounded-xl border transition cursor-pointer ${
                    isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
                  }`}
                >
                  <span>ניהול קבוצות וקהילות</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* 10 ADVANTAGES GRID (רשימה של 10 מעלות) */}
          <div className="space-y-4">
            <h3 className={`text-lg font-black flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>10 המעלות המובילות של רכיב ה-CRM:</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {crmFeatures.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.num}
                    className={`p-4 rounded-2xl border transition-all duration-300 hover:shadow-lg flex flex-col justify-between ${
                      isLight
                        ? 'bg-white border-slate-200/90 hover:border-emerald-400 hover:shadow-emerald-500/5'
                        : 'bg-slate-900/60 border-slate-800 hover:border-emerald-500/40 hover:shadow-emerald-500/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          {item.num}
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <h4 className={`font-bold text-xs leading-snug mb-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {item.title}
                      </h4>
                    </div>
                    <p className={`text-[11px] leading-relaxed mt-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: WHATSAPP AUTOMATION & BOT                      */}
      {/* ========================================================= */}
      <section id="whatsapp" className="py-20 border-b border-slate-200/80 dark:border-slate-800/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header & Image Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left 7 Cols: Title & Description */}
            <div className="lg:col-span-7 space-y-4 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>רכיב הוואטסאפ והאוטומציה</span>
              </div>
              <h2 className={`text-2xl sm:text-4xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                ערוץ וואטסאפ עסקי ואוטומציות AI חכמות
              </h2>
              <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                חיבור ישיר באמצעות Green-API לשיגור הודעות מותאמות אישית, הפעלת בוט שיחות חכם המבוסס על Google Gemini AI, תזמון סטטוסים אוטומטי וסנכרון מיידי לכרטיס הלקוח ב-CRM.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/whatsapp-hub')}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-green-600/20 transition cursor-pointer"
                >
                  <span>כניסה למרכז ה-WhatsApp</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right 5 Cols: Showcase Image */}
            <div className="lg:col-span-5 relative group order-1 lg:order-2">
              <div className="relative rounded-3xl overflow-hidden border border-green-500/30 shadow-2xl shadow-green-500/10">
                <img
                  src="/images/whatsapp_automation.jpg"
                  alt="WhatsApp Automation Showcase"
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-6">
                  <div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-500 text-slate-950">
                      GREEN-API & GEMINI AI
                    </span>
                    <h4 className="text-white font-bold text-base mt-2">בוטים, אוטומציות וסטטוסים</h4>
                    <p className="text-xs text-slate-300">שירות ומכירות 24/7 ללא הפסקה</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* 10 ADVANTAGES GRID (רשימה של 10 מעלות) */}
          <div className="space-y-4">
            <h3 className={`text-lg font-black flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>10 המעלות המובילות של רכיב הוואטסאפ:</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {whatsappFeatures.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.num}
                    className={`p-4 rounded-2xl border transition-all duration-300 hover:shadow-lg flex flex-col justify-between ${
                      isLight
                        ? 'bg-white border-slate-200/90 hover:border-green-400 hover:shadow-green-500/5'
                        : 'bg-slate-900/60 border-slate-800 hover:border-green-500/40 hover:shadow-green-500/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md">
                          {item.num}
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <h4 className={`font-bold text-xs leading-snug mb-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {item.title}
                      </h4>
                    </div>
                    <p className={`text-[11px] leading-relaxed mt-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: PAGE BUILDER & LANDING SITES                   */}
      {/* ========================================================= */}
      <section id="page-builder" className="py-20 border-b border-slate-200/80 dark:border-slate-800/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header & Image Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left 5 Cols: Showcase Image */}
            <div className="lg:col-span-5 relative group">
              <div className="relative rounded-3xl overflow-hidden border border-blue-500/30 shadow-2xl shadow-blue-500/10">
                <img
                  src="/images/page_builder_mockup.jpg"
                  alt="Page Builder Showcase"
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-6">
                  <div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500 text-slate-950">
                      DRAG & DROP EDITOR
                    </span>
                    <h4 className="text-white font-bold text-base mt-2">בונה עמודים ואתרים רספונסיבי</h4>
                    <p className="text-xs text-slate-300">התאמה מלאה למובייל • אפס קוד</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 7 Cols: Title & Description */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Layers className="w-3.5 h-3.5" />
                <span>רכיב בונה העמודים והאתרים</span>
              </div>
              <h2 className={`text-2xl sm:text-4xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                יצירת דפי נחיתה ואתרים ממירים במהירות הבזק
              </h2>
              <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                עורך ויזואלי מהפכני עם ספריית סקציות מודולרית עשירה, הטמעת רכיבי מערכת חיים (טפסים, סליקה, נגנים), סנכרון אוטומטי לצבעי ה-Brand DNA ואופטימיזציית SEO מובנית.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/page-builder')}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition cursor-pointer"
                >
                  <span>כניסה לבונה העמודים</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* 10 ADVANTAGES GRID (רשימה של 10 מעלות) */}
          <div className="space-y-4">
            <h3 className={`text-lg font-black flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
              <span>10 המעלות המובילות של בונה העמודים:</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {pageBuilderFeatures.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.num}
                    className={`p-4 rounded-2xl border transition-all duration-300 hover:shadow-lg flex flex-col justify-between ${
                      isLight
                        ? 'bg-white border-slate-200/90 hover:border-blue-400 hover:shadow-blue-500/5'
                        : 'bg-slate-900/60 border-slate-800 hover:border-blue-500/40 hover:shadow-blue-500/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md">
                          {item.num}
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <h4 className={`font-bold text-xs leading-snug mb-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {item.title}
                      </h4>
                    </div>
                    <p className={`text-[11px] leading-relaxed mt-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: FUNDRAISING & AMBASSADOR CAMPAIGNS             */}
      {/* ========================================================= */}
      <section id="fundraising" className="py-20 border-b border-slate-200/80 dark:border-slate-800/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header & Image Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left 7 Cols: Title & Description */}
            <div className="lg:col-span-7 space-y-4 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Trophy className="w-3.5 h-3.5" />
                <span>מערכת הגיוס והשגרירים</span>
              </div>
              <h2 className={`text-2xl sm:text-4xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                פלטפורמת גיוס המונים חכמה מבוססת שגרירים
              </h2>
              <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                הכפלת פוטנציאל הגיוס באמצעות רתימת מעגלי השפעה קהילתיים, דפים אישיים לכל שגריר עם יעדים נפרדים, לוח מובילים תחרותי, התראות תרומה חיות וסליקה מיידית באשראי וב-Bit.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/ambassador-campaigns')}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md shadow-amber-500/20 transition cursor-pointer"
                >
                  <span>כניסה למערכת הגיוס</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right 5 Cols: Showcase Image */}
            <div className="lg:col-span-5 relative group order-1 lg:order-2">
              <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl shadow-amber-500/10">
                <img
                  src="/images/campaign_fundraising.jpg"
                  alt="Campaign Fundraising Showcase"
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-6">
                  <div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500 text-slate-950">
                      AMBASSADOR CROWDFUNDING
                    </span>
                    <h4 className="text-white font-bold text-base mt-2">יעדי גיוס, לוח מובילים והתראות</h4>
                    <p className="text-xs text-slate-300">סליקת Bit ואשראי • קבלות מיידיות</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* 10 ADVANTAGES GRID (רשימה של 10 מעלות) */}
          <div className="space-y-4">
            <h3 className={`text-lg font-black flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <CheckCircle2 className="w-5 h-5 text-amber-500" />
              <span>10 המעלות המובילות של מערכת הגיוס:</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {fundraisingFeatures.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.num}
                    className={`p-4 rounded-2xl border transition-all duration-300 hover:shadow-lg flex flex-col justify-between ${
                      isLight
                        ? 'bg-white border-slate-200/90 hover:border-amber-400 hover:shadow-amber-500/5'
                        : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/40 hover:shadow-amber-500/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                          {item.num}
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <h4 className={`font-bold text-xs leading-snug mb-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {item.title}
                      </h4>
                    </div>
                    <p className={`text-[11px] leading-relaxed mt-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* BOTTOM CTA BANNER                                         */}
      {/* ========================================================= */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-tr from-indigo-900/30 via-purple-900/20 to-transparent">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>סביבת עבודה מאוחדת ומקצועית</span>
          </div>
          <h2 className={`text-3xl sm:text-5xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
            מוכן לקחת שליטה על כל הפעילות העסקית?
          </h2>
          <p className={`text-sm sm:text-base max-w-xl mx-auto ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
            כל 4 הרכיבים מסונכרנים במלואם למרכז השליטה הראשי, ללא נתוני דמה, עם ביצועים מהירים ותמיכה מובנית ב-Firestore.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/control-center')}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>שגר את מרכז השליטה עכשיו</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className={`flex items-center gap-2 font-bold text-sm px-6 py-4 rounded-2xl border transition cursor-pointer ${
                isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
              }`}
            >
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>התחברות מנהל מערכת</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FOOTER                                                    */}
      {/* ========================================================= */}
      <footer className={`border-t py-12 text-xs transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-slate-950 border-slate-800 text-slate-400'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {companyName}
                </span>
                <p className="text-[11px] text-slate-400">{slogan}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-500" />
                <span>{supportPhone}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-500" />
                <span>{supportEmail}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                <span>{officeAddress}</span>
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© {new Date().getFullYear()} {companyName}. כל הזכויות שמורות.</p>
            <div className="flex items-center gap-4 text-slate-400">
              <span>תקן מודולרי 11 שכבות</span>
              <span>•</span>
              <span>Zero Mock Data</span>
              <span>•</span>
              <span>RTL מלא</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* AUTH MODAL                                                */}
      {/* ========================================================= */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        firebaseApp={firebaseApp}
        title="התחברות למערכת"
        subtitle="כניסה מאובטחת לניהול מודולים ומרכז השליטה"
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default HomePage;
