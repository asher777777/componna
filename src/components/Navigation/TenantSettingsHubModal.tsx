import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Settings,
  KeyRound,
  CreditCard,
  Layers,
  Sparkles,
  CheckCircle2,
  Lock,
  ExternalLink,
  Save,
  Eye,
  EyeOff,
  RefreshCw,
  Crown,
  Cpu,
  MessageSquare,
  Film,
  ArrowLeft,
  Zap,
  ShieldCheck,
  Check,
  Send,
} from 'lucide-react';
import { doc, getDoc, setDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { useSystemConnection } from '../../core/connection/SystemConnectionContext';
import { useTenantScope, ROOT_TENANT_ID, toCanonicalModuleId } from '../../core/tenant';
import { AVAILABLE_MODULES_CATALOG } from '../../modules/KosTenantProvisioner/services/tenantProvisionerService';
import { TenantTokenTracker, TenantTokenUsage, getDefaultTokenUsage } from '../../core/ai/tenantTokenTracker';
import { CANONICAL_MODULE_ROUTES } from './KosNevModal';

export interface TenantSettingsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'keys' | 'billing' | 'active_modules' | 'upsells';
}

interface ModuleRichDetails {
  capabilities: string[];
  idealFor: string;
  monthlyPriceILS: number;
  highlightBadge?: string;
}

const MODULE_RICH_CATALOG: Record<string, ModuleRichDetails> = {
  KosBranding: {
    capabilities: [
      'בניית ספר מותג דיגיטלי (Brand DNA) מלא: צבעים, פונטים, לוגו ושפה מותגית',
      'סנכרון אוטומטי של צבעי המותג והלוגו לכל עמודי הנחיתה, הטפסים והמיילים',
      'הגדרת טון דיבור (Brand Voice) שמנחה את סוכן ה-AI בכל התוכן שלך',
      'ניהול פרטי אמון, טלפון, וואטסאפ וכתובת במקום אחד',
    ],
    idealFor: 'שמירה על מראה אחיד ויוקרתי בכל נקודת מגע עם הלקוחות',
    monthlyPriceILS: 49,
    highlightBadge: 'ליבת המערכת',
  },
  KosWebAi: {
    capabilities: [
      'מחולל עמודי נחיתה ואתרים עם AI בעברית מלאה (RTL)',
      'עריכה חיה ישירות על העמוד (WYSIWYG) כולל גרסאות מובייל ודסקטופ',
      'ספריית סקשנים מעוצבים: Hero, עדויות, גלריות וידאו, שאלות ותשובות וטפסים',
      'חיבור מובנה ל-SEO, מפת אתר (Sitemap) ועמודי תנאי שימוש ופרטיות',
    ],
    idealFor: 'הקמת דפי נחיתה, עמודי מכירה ואתר עסקי תוך דקות',
    monthlyPriceILS: 99,
    highlightBadge: 'הכי פופולרי',
  },
  KSF: {
    capabilities: [
      'בניית טפסי לידים, הרשמה, שאלונים חכמים ומבדקים אינטראקטיביים',
      'סנכרון אוטומטי של כל הגשה ישירות לכרטיס איש הקשר ב-CRM',
      'שליחת הודעת WhatsApp אוטומטית לנרשם מיד לאחר מילוי הטופס',
      'ניתוח שיעורי המרה וצפייה בטבלת הגשות מלאה עם ייצוא לאקסל',
    ],
    idealFor: 'איסוף לידים, הרשמות לאירועים ושאלוני התאמה',
    monthlyPriceILS: 59,
  },
  KosWhatsUp: {
    capabilities: [
      'חיבור ישיר ל-WhatsApp דרך Green-API לשליחה וקבלה של הודעות',
      'בוטים חכמים למענה אוטומטי 24/7 וזיהוי כוונות לקוח',
      'שליחת תפוצות וקמפיינים מותאמים אישית לקבוצות ותגיות מה-CRM',
      'תיעוד אוטומטי של היסטוריית שיחות בתוך כרטיס הלקוח',
    ],
    idealFor: 'סגירת מכירות מהירה ושירות לקוחות אוטומטי בוואטסאפ',
    monthlyPriceILS: 89,
    highlightBadge: 'מומלץ למכירות',
  },
  'crm-analytics': {
    capabilities: [
      'ניהול אנשי קשר ולידים ב-360° עם תגיות, קהילות ושדות מותאמים אישית',
      'ייבוא חכם מאקסל, Google Sheets וקבוצות וואטסאפ + מיזוג כפילויות',
      'דשבורד אנליטיקה וגרפים דינמיים של הכנסות, מקורות הגעה והמרות',
      'ייצוא מהיר ל-Excel ו-vCard ישירות לנייד',
    ],
    idealFor: 'ניהול מרוכז של כל הלקוחות, הלידים והפעילות העסקית',
    monthlyPriceILS: 79,
  },
  'kesher-payments-hub': {
    capabilities: [
      'סליקת אשראי, ביט והוראות קבע ישירות דרך מסוף קשר הפרטי שלך',
      'הפקת קבלות וחשבוניות מס אוטומטית (כולל תרומות סעיף 46 ב-EzCount)',
      'שיתוף קבלה דיגיטלית בווטסאפ בלחיצת כפתור',
      'שיוך אוטומטי של כל תשלום להיסטוריית הרכישות של הלקוח ב-CRM',
    ],
    idealFor: 'גבייה מסודרת, הוראות קבע והפקת קבלות אוטומטית',
    monthlyPriceILS: 79,
    highlightBadge: 'סליקה ישירה',
  },
  KosTogether: {
    capabilities: [
      'ניהול קהילות, חוגים וקבוצות תוכן עם הרשאות גישה',
      'מעקב מעורבות חברים, הודעות קבוצתיות ואירועי קהילה',
      'חיבור ישיר לרשימות התפוצה ולסגמנטים ב-CRM',
    ],
    idealFor: 'ניהול קהילות, מוסדות, קבוצות ליווי ומועדוני לקוחות',
    monthlyPriceILS: 69,
  },
  'media-gallery-hub': {
    capabilities: [
      'מאגר ענן מאובטח לתמונות, סרטונים וקבצי העסק בתיקיות מסודרות',
      'יצירת תמונות שיווקיות מותאמות למותג באמצעות בינה מלאכותית (AI)',
      'שילוב מהיר של קבצים מתוך המאגר בכל עמודי הנחיתה והקמפיינים',
    ],
    idealFor: 'ניהול נכסי מדיה ויצירת ויז׳ואל מקצועי בלי מעצב',
    monthlyPriceILS: 49,
  },
  'kosai-engine': {
    capabilities: [
      'סוכן בינה מלאכותית אישי שמכיר את המותג, המוצרים והשירותים שלך',
      'מענה אוטומטי לשאלות גולשים באתר ובצ׳אט הצף',
      'אימון הסוכן על מסמכים, חוקים עסקיים ותסריטי מכירה',
    ],
    idealFor: 'אוטומציה של מענה ללקוחות והגדלת המרות 24/7',
    monthlyPriceILS: 99,
    highlightBadge: 'בינה מלאכותית',
  },
  KosTube: {
    capabilities: [
      'ספריית וידאו ממותגת (בסגנון YouTube פרטי) לשיעורים, קורסים והקלטות',
      'ארגון סרטונים לפי ערוצים, פלייליסטים וקטגוריות',
      'דפי צפייה נקיים ללא פרסומות והסחות דעת + שילוב בעמודי האתר',
    ],
    idealFor: 'מרצים, קורסים דיגיטליים, שיעורי תורה ותוכן וידאו',
    monthlyPriceILS: 69,
  },
  KosSubscribed: {
    capabilities: [
      'מכירת מנויים חודשיים/שנתיים לגישה לתוכן סגור וקורסים',
      'שער תוכן חכם (Content Gate) שפותח גישה אוטומטית למנויים משלמים',
      'ניהול קופונים, הנחות, מבחנים ופורטל מנויים אישי',
    ],
    idealFor: 'הכנסה חוזרת ממנויים, תוכן פרימיום וקורסים',
    monthlyPriceILS: 89,
  },
  'kosun-am': {
    capabilities: [
      'מערכת דיוור אלקטרוני וניוזלטרים מעוצבים בהתאמה למותג',
      'סדרות מסרים אוטומטיות (Autoresponders) לנרשמים חדשים',
      'מעקב פתיחות, הקלקות וביצועי קמפיינים',
    ],
    idealFor: 'שמירה על קשר רציף עם רשימת התפוצה והגדלת מכירות',
    monthlyPriceILS: 59,
  },
  'kosun-board-composer': {
    capabilities: [
      'בניית לוחות בקרה (Dashboards) מותאמים אישית עם AI',
      'מעקב KPI בזמן אמת אחרי מכירות, לידים ופעילות המערכת',
    ],
    idealFor: 'שליטה ניהולית ומעקב יומי אחרי מדדי הצמיחה',
    monthlyPriceILS: 59,
  },
  'video-producer-studio': {
    capabilities: [
      'הפקת סרטוני שיווק ואווטאר אינטראקטיביים עם AI',
      'יצירת נגני זרימה (Flow Player) ומסלולי תוכן אינטראקטיביים',
    ],
    idealFor: 'שיווק בוידאו מתקדם והדרכות אינטראקטיביות',
    monthlyPriceILS: 99,
  },
  KosCampaigns: {
    capabilities: [
      'ניהול קמפייני גיוס המונים, שגרירים ושיווק שותפים',
      'דפי שגרירים אישיים עם מד יעד חי ודירוג מובילים',
    ],
    idealFor: 'עמותות, מוסדות וקמפייני התרמה או השקות',
    monthlyPriceILS: 89,
  },
  KoSeoPowerEngin: {
    capabilities: [
      'אופטימיזציית SEO מתקדמת, מטא-תגיות ומילות מפתח בעזרת AI',
      'ניתוח עמודים ושיפור הדירוג האורגני בגוגל',
    ],
    idealFor: 'הבאת תנועה אורגנית חינמית מגוגל',
    monthlyPriceILS: 59,
  },
  KosAccess: {
    capabilities: [
      'ווידג׳ט נגישות מלא לאתר והצהרת נגישות אוטומטית',
      'עמידה בתקני הנגישות הישראליים בקליק',
    ],
    idealFor: 'עמידה בחוק הנגישות לכל אתר עסקי',
    monthlyPriceILS: 39,
  },
  KosTikTok: {
    capabilities: [
      'חיבור וניהול קמפיינים ותוכן קצר לרשתות החברתיות וטיקטוק',
      'איסוף לידים ישיר מקמפיינים ל-CRM',
    ],
    idealFor: 'חשיפה ויראלית וגיוס לידים צעירים',
    monthlyPriceILS: 59,
  },
  KosProjects: {
    capabilities: [
      'ניהול פרויקטים דו-מסלולי: צד שיווקי (דפי נחיתה עם הרשמה ו-QR) וצד תפעולי (גאנט, מועדים, בעלי תפקידים וספקים)',
      'העלאת נתוני פרויקטים מ-Excel/CSV, תבניות Blueprints ופענוח בריף אוטומטי ב-AI',
      'סנכרון מלא מול KosCrm, קהילות KosTogether וסוכן KosAi הפעיל',
    ],
    idealFor: 'ניהול פרויקטי לקוחות, השקות, אירועים ותוכניות עבודה מורכבות',
    monthlyPriceILS: 89,
    highlightBadge: 'חדש במערכת',
  },
};

function getModuleRichDetails(modId: string, fallbackDesc: string): ModuleRichDetails {
  const canonical = toCanonicalModuleId(modId);
  return (
    MODULE_RICH_CATALOG[modId] ||
    MODULE_RICH_CATALOG[canonical] || {
      capabilities: [fallbackDesc, 'סנכרון מלא עם שאר רכיבי קושאן וה-CRM שלך', 'התאמה אוטומטית למיתוג העסקי (Brand DNA)'],
      idealFor: 'הרחבת היכולות הדיגיטליות של העסק במערכת KOSUN',
      monthlyPriceILS: 59,
    }
  );
}

export const TenantSettingsHubModal: React.FC<TenantSettingsHubModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'active_modules',
}) => {
  const { db, tenantApiKeys, updateApiKeys, purchasedModules } = useSystemConnection();
  const { tenantId: scopeTenantId, isRootTenant } = useTenantScope();
  const activeTenantId = (scopeTenantId || ROOT_TENANT_ID).toLowerCase().trim();
  const isMaster = isRootTenant || activeTenantId === ROOT_TENANT_ID || activeTenantId === '_master';

  const [activeTab, setActiveTab] = useState<'keys' | 'billing' | 'active_modules' | 'upsells'>(initialTab);
  const [tenantDoc, setTenantDoc] = useState<any>(null);
  const [tokenUsage, setTokenUsage] = useState<TenantTokenUsage>(() => getDefaultTokenUsage(activeTenantId));
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Selected module for detailed inner modal
  const [inspectingModule, setInspectingModule] = useState<{
    mod: (typeof AVAILABLE_MODULES_CATALOG)[number];
    isOwned: boolean;
  } | null>(null);

  // Upsell request state
  const [requestingModId, setRequestingModId] = useState<string | null>(null);
  const [requestedModIds, setRequestedModIds] = useState<Set<string>>(new Set());

  // Keys form state
  const [keysForm, setKeysForm] = useState({
    googleAiApiKey: '',
    geminiModel: 'gemini-3.8-flash',
    geminiImageModel: 'gemini-3.1-flash-image',
    geminiVideoModel: 'veo-3.1-generate-preview',
    kesherUserName: '',
    kesherApiKey: '',
    kesherPaymentPageId: '',
    kesherEzCountToken: '',
    kesherDefaultReceiptType: 405,
    greenApiInstanceId: '',
    greenApiToken: '',
    customWebhookUrl: '',
    heygenApiKey: '',
    elevenLabsApiKey: '',
  });
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [savingKeys, setSavingKeys] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Load tenant metadata, keys, token usage, and payment history when modal opens
  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;

    const loadAll = async () => {
      setLoadingData(true);
      try {
        // Hydrate keys from context immediately
        setKeysForm({
          googleAiApiKey: String(tenantApiKeys.googleAiApiKey || ''),
          geminiModel: String(tenantApiKeys.geminiModel || 'gemini-3.8-flash'),
          geminiImageModel: String(tenantApiKeys.geminiImageModel || 'gemini-3.1-flash-image'),
          geminiVideoModel: String(tenantApiKeys.geminiVideoModel || 'veo-3.1-generate-preview'),
          kesherUserName: String(tenantApiKeys.kesherUserName || ''),
          kesherApiKey: String(tenantApiKeys.kesherApiKey || ''),
          kesherPaymentPageId: String(tenantApiKeys.kesherPaymentPageId || ''),
          kesherEzCountToken: String(tenantApiKeys.kesherEzCountToken || ''),
          kesherDefaultReceiptType: Number(tenantApiKeys.kesherDefaultReceiptType) || 405,
          greenApiInstanceId: String(tenantApiKeys.greenApiInstanceId || ''),
          greenApiToken: String(tenantApiKeys.greenApiToken || ''),
          customWebhookUrl: String(tenantApiKeys.customWebhookUrl || ''),
          heygenApiKey: String(tenantApiKeys.heygenApiKey || ''),
          elevenLabsApiKey: String(tenantApiKeys.elevenLabsApiKey || ''),
        });

        if (db) {
          const [tSnap, kSnap, usage] = await Promise.all([
            getDoc(doc(db, 'tenants', activeTenantId)).catch(() => null),
            getDoc(doc(db, 'tenants', activeTenantId, 'settings', 'api_keys')).catch(() => null),
            TenantTokenTracker.getTenantTokenUsage(db, activeTenantId).catch(() => getDefaultTokenUsage(activeTenantId)),
          ]);

          if (!mounted) return;
          if (tSnap && tSnap.exists()) {
            setTenantDoc(tSnap.data());
          }
          if (kSnap && kSnap.exists()) {
            const kd = kSnap.data() || {};
            setKeysForm((prev) => ({
              googleAiApiKey: String(kd.googleAiApiKey ?? prev.googleAiApiKey),
              geminiModel: String(kd.geminiModel ?? prev.geminiModel),
              geminiImageModel: String(kd.geminiImageModel ?? prev.geminiImageModel),
              geminiVideoModel: String(kd.geminiVideoModel ?? prev.geminiVideoModel),
              kesherUserName: String(kd.kesherUserName ?? prev.kesherUserName),
              kesherApiKey: String(kd.kesherApiKey ?? prev.kesherApiKey),
              kesherPaymentPageId: String(kd.kesherPaymentPageId ?? prev.kesherPaymentPageId),
              kesherEzCountToken: String(kd.kesherEzCountToken ?? prev.kesherEzCountToken),
              kesherDefaultReceiptType: Number(kd.kesherDefaultReceiptType) || prev.kesherDefaultReceiptType,
              greenApiInstanceId: String(kd.greenApiInstanceId ?? prev.greenApiInstanceId),
              greenApiToken: String(kd.greenApiToken ?? prev.greenApiToken),
              customWebhookUrl: String(kd.customWebhookUrl ?? prev.customWebhookUrl),
              heygenApiKey: String(kd.heygenApiKey ?? prev.heygenApiKey),
              elevenLabsApiKey: String(kd.elevenLabsApiKey ?? prev.elevenLabsApiKey),
            }));
          }
          setTokenUsage(usage);

          // Load recent KOSUN payments / transactions recorded under this tenant
          try {
            const txSnap = await getDocs(collection(db, 'tenants', activeTenantId, 'kesher_transactions'));
            if (mounted && !txSnap.empty) {
              const list = txSnap.docs
                .map((d) => ({ id: d.id, ...d.data() }))
                .sort((a: any, b: any) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
              setPayments(list.slice(0, 15));
            }
          } catch {}
        }
      } finally {
        if (mounted) setLoadingData(false);
      }
    };

    loadAll();
    return () => {
      mounted = false;
    };
  }, [isOpen, db, activeTenantId, tenantApiKeys]);

  // Compute owned vs upsell modules
  const { ownedModules, upsellModules } = useMemo(() => {
    const rawOwned: string[] = Array.isArray(tenantDoc?.activeModules) && tenantDoc.activeModules.length > 0
      ? tenantDoc.activeModules
      : (Array.isArray(purchasedModules) ? purchasedModules : []);

    const ownedCanonical = new Set(rawOwned.map((m) => toCanonicalModuleId(m).toLowerCase()));
    const owned: typeof AVAILABLE_MODULES_CATALOG = [];
    const upsells: typeof AVAILABLE_MODULES_CATALOG = [];

    AVAILABLE_MODULES_CATALOG.forEach((mod) => {
      const canonical = toCanonicalModuleId(mod.id).toLowerCase();
      if (isMaster || ownedCanonical.has(canonical) || ownedCanonical.has(mod.id.toLowerCase())) {
        owned.push(mod);
      } else {
        upsells.push(mod);
      }
    });

    return { ownedModules: owned, upsellModules: upsells };
  }, [tenantDoc, purchasedModules, isMaster]);

  if (!isOpen) return null;

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingKeys(true);
    try {
      const payload: Record<string, any> = {
        kesherUserName: keysForm.kesherUserName.trim(),
        kesherApiKey: keysForm.kesherApiKey.trim(),
        kesherPaymentPageId: keysForm.kesherPaymentPageId.trim(),
        kesherEzCountToken: keysForm.kesherEzCountToken.trim(),
        kesherDefaultReceiptType: Number(keysForm.kesherDefaultReceiptType) || 405,
        greenApiInstanceId: keysForm.greenApiInstanceId.trim(),
        greenApiToken: keysForm.greenApiToken.trim(),
        customWebhookUrl: keysForm.customWebhookUrl.trim(),
        heygenApiKey: keysForm.heygenApiKey.trim(),
        elevenLabsApiKey: keysForm.elevenLabsApiKey.trim(),
      };
      if (isMaster) {
        payload.googleAiApiKey = keysForm.googleAiApiKey.trim();
        payload.geminiModel = keysForm.geminiModel.trim() || 'gemini-3.8-flash';
        payload.geminiImageModel = keysForm.geminiImageModel.trim() || 'gemini-3.1-flash-image';
        payload.geminiVideoModel = keysForm.geminiVideoModel.trim() || 'veo-3.1-generate-preview';
      }
      await updateApiKeys(payload, activeTenantId);
      if (db) {
        await setDoc(
          doc(db, 'tenants', activeTenantId, 'settings', 'api_keys'),
          { ...payload, updatedAt: Date.now() },
          { merge: true }
        );
      }
      notify('מפתחות השירותים נשמרו בהצלחה בחשבונך!');
    } catch (err: any) {
      notify(err?.message || 'שגיאה בשמירת המפתחות');
    } finally {
      setSavingKeys(false);
    }
  };

  const handleRequestUpgrade = async (mod: (typeof AVAILABLE_MODULES_CATALOG)[number]) => {
    setRequestingModId(mod.id);
    try {
      if (db) {
        await addDoc(collection(db, 'tenants', activeTenantId, 'upgrade_requests'), {
          tenantId: activeTenantId,
          parentTenantId: tenantDoc?.parentTenantId || '_master',
          moduleId: mod.id,
          moduleName: mod.name,
          status: 'pending',
          requestedAt: new Date().toISOString(),
        }).catch(() => {});
      }
      setRequestedModIds((prev) => new Set(prev).add(mod.id));
      notify(`בקשת שדרוג עבור "${mod.name}" נשלחה! ניצור איתך קשר בהקדם.`);

      // Open ready WhatsApp message to KOSUN support for instant activation
      const text = encodeURIComponent(
        `שלום צוות קושאן! אשמח להוסיף לחשבון שלי (${activeTenantId}.kosun.pro) את הרכיב: ${mod.name} (${mod.id}).`
      );
      window.open(`https://api.whatsapp.com/send?phone=972526968008&text=${text}`, '_blank');
    } finally {
      setRequestingModId(null);
    }
  };

  const handleOpenModule = (modId: string) => {
    const canonical = toCanonicalModuleId(modId);
    const route = CANONICAL_MODULE_ROUTES[canonical] || `/${canonical}`;
    onClose();
    window.location.href = route;
  };

  const quota = tokenUsage.monthlyQuota || 1_000_000;
  const usedPct = Math.min(100, Math.round(((tokenUsage.totalTokens || 0) / quota) * 100));
  const useMasterBilling = Boolean(tenantDoc?.useMasterKesherBilling);

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-l from-indigo-600/10 via-purple-600/5 to-transparent flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                הגדרות חשבון, מפתחות ורכיבים
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate" dir="ltr">
                {isMaster ? 'kosun.pro (Master)' : `${activeTenantId}.kosun.pro`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            title="סגור"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast feedback */}
        {toastMsg && (
          <div className="mx-5 mt-3 px-4 py-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('active_modules')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === 'active_modules'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>רכיבים פעילים ({ownedModules.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upsells')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === 'upsells'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/40 hover:bg-amber-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>שדרוגים ואפסיילים ({upsellModules.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('keys')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === 'keys'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>מפתחות ושירותים</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('billing')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === 'billing'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>מצב חשבון ותשלומים</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loadingData && (
            <div className="flex items-center justify-center gap-2 py-4 text-xs text-slate-400">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
              <span>טוען נתוני חשבון...</span>
            </div>
          )}

          {/* TAB 1: ACTIVE MODULES */}
          {activeTab === 'active_modules' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    הרכיבים הפעילים ברשותך ({ownedModules.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    לחץ על כל רכיב כדי לראות את כל האפשרויות והפיצ׳רים הכלולים בו או לפתוח אותו ישירות
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ownedModules.map((mod) => {
                  const details = getModuleRichDetails(mod.id, mod.description);
                  return (
                    <div
                      key={mod.id}
                      onClick={() => setInspectingModule({ mod, isOwned: true })}
                      className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            פעיל אצלך
                          </span>
                          <span className="font-mono text-[10px] text-slate-400" dir="ltr">
                            {mod.englishPrefix}{mod.englishRest}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                          {mod.name}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          {mod.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        <span>{details.capabilities.length} יכולות זמינות — לחץ לפירוט</span>
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: UPSELLS */}
          {activeTab === 'upsells' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-l from-amber-500/15 via-orange-500/10 to-indigo-500/10 border border-amber-300/50 dark:border-amber-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-black text-sm">
                    <Crown className="w-4 h-4" />
                    <span>הרחב את המערכת שלך עם רכיבי KOSUN נוספים</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    כל רכיב מתחבר אוטומטית למיתוג (Brand DNA), ל-CRM ולסאב-דומיין שלך ללא התקנה מורכבת.
                  </p>
                </div>
              </div>

              {upsellModules.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
                  <Crown className="w-8 h-8 text-emerald-500 mx-auto" />
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    יש לך את כל רכיבי המערכת (Full Suite)!
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    כל מודולי קושאן כבר פעילים ופתוחים אצלך בחשבון.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {upsellModules.map((mod) => {
                    const details = getModuleRichDetails(mod.id, mod.description);
                    const isRequested = requestedModIds.has(mod.id);
                    return (
                      <div
                        key={mod.id}
                        onClick={() => setInspectingModule({ mod, isOwned: false })}
                        className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/30 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                              <Lock className="w-3 h-3" />
                              {details.highlightBadge || 'זמין לשדרוג'}
                            </span>
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              ₪{details.monthlyPriceILS}
                              <span className="text-[10px] font-normal text-slate-400">/חודש</span>
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                            {mod.name}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                            {mod.description}
                          </p>
                          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                            מתאים ל: {details.idealFor}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-amber-600 transition">
                            לפירוט יכולות מלא ←
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRequestUpgrade(mod);
                            }}
                            disabled={requestingModId === mod.id}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                              isRequested
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-sm'
                            }`}
                          >
                            {isRequested ? <Check className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                            <span>{isRequested ? 'נשלחה בקשה' : 'שדרג עכשיו'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: API KEYS */}
          {activeTab === 'keys' && (
            <form onSubmit={handleSaveKeys} className="space-y-4">
              {/* Master-only Google AI / Gemini API Key Card */}
              {isMaster && (
                <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/30 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-black text-indigo-900 dark:text-indigo-200">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>מפתח Google AI / Gemini (מאסטר ראשי)</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600/15 text-indigo-700 dark:text-indigo-300">
                      משרת את כלל הטננטים
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                        Google AI / Gemini API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showSecrets.gemini ? 'text' : 'password'}
                          value={keysForm.googleAiApiKey}
                          onChange={(e) => setKeysForm((p) => ({ ...p, googleAiApiKey: e.target.value }))}
                          placeholder="AIzaSy..."
                          dir="ltr"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-900 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecrets((s) => ({ ...s, gemini: !s.gemini }))}
                          className="absolute left-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          title={showSecrets.gemini ? 'הסתר מפתח' : 'הצג מפתח'}
                        >
                          {showSecrets.gemini ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                        מודל טקסט (Gemini Model)
                      </label>
                      <input
                        type="text"
                        value={keysForm.geminiModel}
                        onChange={(e) => setKeysForm((p) => ({ ...p, geminiModel: e.target.value }))}
                        placeholder="gemini-3.8-flash"
                        dir="ltr"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                        מודל תמונות (Image Model)
                      </label>
                      <input
                        type="text"
                        value={keysForm.geminiImageModel}
                        onChange={(e) => setKeysForm((p) => ({ ...p, geminiImageModel: e.target.value }))}
                        placeholder="gemini-3.1-flash-image"
                        dir="ltr"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {useMasterBilling && (
                <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-800 dark:text-indigo-200 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <div className="font-black">סליקת קשר מנוהלת דרך המאסטר</div>
                    <div className="opacity-85">
                      טננט זה מוגדר לסליקה מרכזית דרך מסוף המאסטר. ניתן להגדיר כאן מפתחות וואטסאפ, וידאו ו-Webhooks פרטיים.
                    </div>
                  </div>
                </div>
              )}

              {/* Kesher Billing Keys */}
              {!useMasterBilling && (
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    <span>מסוף סליקה קשר (Kesher) וקבלות EzCount</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">שם משתמש קשר</label>
                      <input
                        type="text"
                        value={keysForm.kesherUserName}
                        onChange={(e) => setKeysForm((p) => ({ ...p, kesherUserName: e.target.value }))}
                        placeholder="userName"
                        dir="ltr"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">סיסמה / API Key קשר</label>
                      <div className="relative">
                        <input
                          type={showSecrets.kesher ? 'text' : 'password'}
                          value={keysForm.kesherApiKey}
                          onChange={(e) => setKeysForm((p) => ({ ...p, kesherApiKey: e.target.value }))}
                          placeholder="••••••••"
                          dir="ltr"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecrets((s) => ({ ...s, kesher: !s.kesher }))}
                          className="absolute left-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showSecrets.kesher ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">מספר פרויקט / מסוף (PaymentPageId)</label>
                      <input
                        type="text"
                        value={keysForm.kesherPaymentPageId}
                        onChange={(e) => setKeysForm((p) => ({ ...p, kesherPaymentPageId: e.target.value }))}
                        placeholder="12345"
                        dir="ltr"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">טוקן EzCount (הפקת קבלות)</label>
                      <input
                        type={showSecrets.ezcount ? 'text' : 'password'}
                        value={keysForm.kesherEzCountToken}
                        onChange={(e) => setKeysForm((p) => ({ ...p, kesherEzCountToken: e.target.value }))}
                        placeholder="EzCount API Token"
                        dir="ltr"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* WhatsApp Green-API Keys */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-3">
                <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  <span>חיבור WhatsApp (Green-API) ו-Webhooks</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Green-API Instance ID</label>
                    <input
                      type="text"
                      value={keysForm.greenApiInstanceId}
                      onChange={(e) => setKeysForm((p) => ({ ...p, greenApiInstanceId: e.target.value }))}
                      placeholder="7103..."
                      dir="ltr"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Green-API Token</label>
                    <div className="relative">
                      <input
                        type={showSecrets.green ? 'text' : 'password'}
                        value={keysForm.greenApiToken}
                        onChange={(e) => setKeysForm((p) => ({ ...p, greenApiToken: e.target.value }))}
                        placeholder="••••••••"
                        dir="ltr"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecrets((s) => ({ ...s, green: !s.green }))}
                        className="absolute left-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showSecrets.green ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Custom Webhook URL (Make / Zapier / n8n)</label>
                    <input
                      type="url"
                      value={keysForm.customWebhookUrl}
                      onChange={(e) => setKeysForm((p) => ({ ...p, customWebhookUrl: e.target.value }))}
                      placeholder="https://hook.eu1.make.com/..."
                      dir="ltr"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Video & Voice Keys */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-3">
                <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                  <Film className="w-4 h-4 text-purple-500" />
                  <span>מפתחות וידאו ואודיו (HeyGen / ElevenLabs)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">HeyGen API Key</label>
                    <input
                      type="password"
                      value={keysForm.heygenApiKey}
                      onChange={(e) => setKeysForm((p) => ({ ...p, heygenApiKey: e.target.value }))}
                      placeholder="••••••••"
                      dir="ltr"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">ElevenLabs API Key</label>
                    <input
                      type="password"
                      value={keysForm.elevenLabsApiKey}
                      onChange={(e) => setKeysForm((p) => ({ ...p, elevenLabsApiKey: e.target.value }))}
                      placeholder="••••••••"
                      dir="ltr"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingKeys}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {savingKeys ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>שמור מפתחות שירותים</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: ACCOUNT STATUS & KOSUN BILLING */}
          {activeTab === 'billing' && (
            <div className="space-y-4">
              {/* Account KPI Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">סטטוס חשבון קושאן</div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${tenantDoc?.status === 'suspended' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {tenantDoc?.status === 'suspended' ? 'מושעה' : 'פעיל ותקין'}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400 font-mono" dir="ltr">
                    {tenantDoc?.fullDomain || `${activeTenantId}.kosun.pro`}
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">מסלול מנוי</div>
                  <div className="mt-1.5 text-base font-black text-slate-900 dark:text-white">
                    {tenantDoc?.billingPlan === 'annual' ? 'מנוי שנתי' : tenantDoc?.billingPlan === 'custom' ? 'מסלול מותאם' : 'מנוי חודשי'}
                  </div>
                  <div className="mt-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {Number(tenantDoc?.monthlyTotal || 0) > 0 ? `₪${Number(tenantDoc.monthlyTotal).toLocaleString()} / חודש` : 'ללא חיוב חודשי פעיל'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-purple-500" />
                    <span>צריכת טוקנים AI</span>
                  </div>
                  <div className="mt-1.5 text-base font-black text-slate-900 dark:text-white font-mono">
                    {(tokenUsage.totalTokens || 0).toLocaleString()}
                  </div>
                  <div className="mt-1.5 w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${usedPct}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400">
                    {usedPct}% מתוך מכסה של {quota.toLocaleString()} טוקנים
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/30 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    היסטוריית תשלומים וחשבוניות לקושאן
                  </h4>
                  {tenantDoc?.paymentTransactionId && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                      אסמכתא: {tenantDoc.paymentTransactionId}
                    </span>
                  )}
                </div>

                {payments.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
                    <p>לא נמצאו חיובים אחרונים רשומים בטבלה זו.</p>
                    <a
                      href={`https://api.whatsapp.com/send?phone=972526968008&text=${encodeURIComponent(`שלום, אשמח לקבל פירוט תשלומים וחשבוניות עבור החשבון ${activeTenantId}.kosun.pro`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>פנה להנהלת חשבונות קושאן בוואטסאפ</span>
                    </a>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-right">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                          <th className="py-2 px-2 font-bold">תאריך</th>
                          <th className="py-2 px-2 font-bold">תיאור / מסלול</th>
                          <th className="py-2 px-2 font-bold">סכום</th>
                          <th className="py-2 px-2 font-bold">אסמכתא</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {payments.map((tx: any) => (
                          <tr key={tx.id}>
                            <td className="py-2 px-2 text-slate-600 dark:text-slate-300 font-mono">
                              {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('he-IL') : '—'}
                            </td>
                            <td className="py-2 px-2 font-bold text-slate-800 dark:text-slate-200">
                              {tx.description || (tx.mode === 'subscription' ? 'מנוי KOSUN' : 'תשלום קשר')}
                            </td>
                            <td className="py-2 px-2 font-black text-emerald-600 dark:text-emerald-400">
                              ₪{Number(tx.amount || 0).toLocaleString()}
                            </td>
                            <td className="py-2 px-2 font-mono text-[11px] text-slate-400">
                              {tx.transactionId || tx.id}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Inner Detail Modal for Active Module or Upsell Module */}
        {inspectingModule && (
          <div
            className="absolute inset-0 z-20 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
            onClick={() => setInspectingModule(null)}
          >
            <div
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const { mod, isOwned } = inspectingModule;
                const details = getModuleRichDetails(mod.id, mod.description);
                const isRequested = requestedModIds.has(mod.id);
                return (
                  <>
                    <div className={`p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 ${
                      isOwned
                        ? 'bg-gradient-to-l from-indigo-600/15 to-transparent'
                        : 'bg-gradient-to-l from-amber-500/15 to-transparent'
                    }`}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            isOwned
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                          }`}>
                            {isOwned ? 'רכיב פעיל אצלך' : `שדרוג • ₪${details.monthlyPriceILS}/חודש`}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400" dir="ltr">
                            {mod.englishPrefix}{mod.englishRest}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">{mod.name}</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{mod.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setInspectingModule(null)}
                        className="p-1.5 rounded-xl hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-5 overflow-y-auto space-y-4">
                      <div>
                        <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 mb-2.5">
                          מה אפשר לעשות עם הרכיב הזה?
                        </h4>
                        <ul className="space-y-2">
                          {details.capabilities.map((cap, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                              <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${isOwned ? 'text-emerald-500' : 'text-amber-500'}`} />
                              <span>{cap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs">
                        <span className="font-black text-slate-800 dark:text-white">למי זה הכי מתאים? </span>
                        <span className="text-slate-600 dark:text-slate-300">{details.idealFor}</span>
                      </div>
                    </div>

                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-950/40">
                      <button
                        type="button"
                        onClick={() => setInspectingModule(null)}
                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        חזרה לרשימה
                      </button>

                      {isOwned ? (
                        <button
                          type="button"
                          onClick={() => handleOpenModule(mod.id)}
                          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition cursor-pointer"
                        >
                          <span>פתח את הרכיב עכשיו</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRequestUpgrade(mod)}
                          disabled={requestingModId === mod.id}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer"
                        >
                          {isRequested ? <Check className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                          <span>{isRequested ? 'בקשת השדרוג נשלחה' : `הוסף לחשבון (₪${details.monthlyPriceILS}/חודש)`}</span>
                        </button>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantSettingsHubModal;
