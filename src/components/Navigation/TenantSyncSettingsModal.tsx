import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  CreditCard,
  MessageSquare,
  Sparkles,
  Mail,
  Film,
  Building,
  Save,
  ChevronDown,
  Globe,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { TenantRecord } from '../../core/contracts';
import { useSystemConnection } from '../../core/connection/SystemConnectionContext';
import { doc, setDoc } from 'firebase/firestore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tenantRecord: TenantRecord | null;
  onSaved?: (updated: TenantRecord) => void;
}

export type AccordionSection =
  | 'overview'
  | 'kesher'
  | 'whatsapp'
  | 'ai'
  | 'email'
  | 'video';

export const TenantSyncSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  tenantRecord,
  onSaved,
}) => {
  const { tenantApiKeys, updateApiKeys, db } = useSystemConnection();

  const [formData, setFormData] = useState({
    clientName: tenantRecord?.clientName || '',
    ownerEmail: tenantRecord?.ownerEmail || '',
    ownerPhone: tenantRecord?.ownerPhone || '',
    // Keys from tenantApiKeys
    kesherUserName: (tenantApiKeys.kesherUserName as string) || '',
    kesherApiKey: (tenantApiKeys.kesherApiKey as string) || '',
    kesherPaymentPageId: (tenantApiKeys.kesherPaymentPageId as string) || '',
    kesherEzCountToken: (tenantApiKeys.kesherEzCountToken as string) || '',
    kesherDefaultReceiptType: Number(tenantApiKeys.kesherDefaultReceiptType) || 405,
    greenApiInstanceId: (tenantApiKeys.greenApiInstanceId as string) || '',
    greenApiToken: (tenantApiKeys.greenApiToken as string) || '',
    customWebhookUrl: (tenantApiKeys.customWebhookUrl as string) || '',
    googleAiApiKey: (tenantApiKeys.googleAiApiKey as string) || '',
    geminiModel: (tenantApiKeys.geminiModel as string) || 'gemini-3.8-flash',
    heygenApiKey: (tenantApiKeys.heygenApiKey as string) || '',
    elevenLabsApiKey: (tenantApiKeys.elevenLabsApiKey as string) || '',
  });

  const [initialData, setInitialData] = useState({ ...formData });
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    overview: true,
    kesher: true,
    whatsapp: true,
    ai: false,
    email: false,
    video: false,
  });

  const [showKesherKey, setShowKesherKey] = useState(false);
  const [showGreenToken, setShowGreenToken] = useState(false);
  const [showAiKey, setShowAiKey] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);

  // Dynamic light / dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (tenantRecord) {
      const fresh = {
        clientName: tenantRecord.clientName || '',
        ownerEmail: tenantRecord.ownerEmail || '',
        ownerPhone: tenantRecord.ownerPhone || '',
        kesherUserName: (tenantApiKeys.kesherUserName as string) || '',
        kesherApiKey: (tenantApiKeys.kesherApiKey as string) || '',
        kesherPaymentPageId: (tenantApiKeys.kesherPaymentPageId as string) || '',
        kesherEzCountToken: (tenantApiKeys.kesherEzCountToken as string) || '',
        kesherDefaultReceiptType: Number(tenantApiKeys.kesherDefaultReceiptType) || 405,
        greenApiInstanceId: (tenantApiKeys.greenApiInstanceId as string) || '',
        greenApiToken: (tenantApiKeys.greenApiToken as string) || '',
        customWebhookUrl: (tenantApiKeys.customWebhookUrl as string) || '',
        googleAiApiKey: (tenantApiKeys.googleAiApiKey as string) || '',
        geminiModel: (tenantApiKeys.geminiModel as string) || 'gemini-3.8-flash',
        heygenApiKey: (tenantApiKeys.heygenApiKey as string) || '',
        elevenLabsApiKey: (tenantApiKeys.elevenLabsApiKey as string) || '',
      };
      setFormData(fresh);
      setInitialData(fresh);
      setShowUnsavedConfirm(false);
    }
  }, [tenantRecord, tenantApiKeys]);

  const activeModules = useMemo(() => {
    return (tenantRecord?.activeModules || []).map((m) => m.toLowerCase());
  }, [tenantRecord]);

  const hasKesher = activeModules.some((m) => m.includes('kesher') || m.includes('pay'));
  const hasWhatsApp = activeModules.some((m) => m.includes('whatsapp') || m.includes('whatsup'));
  const hasAi = activeModules.some((m) => m.includes('ai') || m.includes('page') || m.includes('board'));
  const hasAm = activeModules.some((m) => m.includes('am') || m.includes('mail'));
  const hasVideo = activeModules.some((m) => m.includes('video') || m.includes('studio'));

  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  if (!isOpen || !tenantRecord) return null;

  const toggleSection = (sec: AccordionSection) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Save secret keys via useSystemConnection (writes to tenants/{subdomain}/settings/api_keys)
      await updateApiKeys({
        kesherUserName: formData.kesherUserName.trim(),
        kesherApiKey: formData.kesherApiKey.trim(),
        kesherPaymentPageId: formData.kesherPaymentPageId.trim(),
        kesherEzCountToken: formData.kesherEzCountToken.trim(),
        kesherDefaultReceiptType: formData.kesherDefaultReceiptType,
        greenApiInstanceId: formData.greenApiInstanceId.trim(),
        greenApiToken: formData.greenApiToken.trim(),
        customWebhookUrl: formData.customWebhookUrl.trim(),
        googleAiApiKey: formData.googleAiApiKey.trim(),
        geminiModel: formData.geminiModel.trim(),
        heygenApiKey: formData.heygenApiKey.trim(),
        elevenLabsApiKey: formData.elevenLabsApiKey.trim(),
      });

      // 2. Update tenant overview info in Firestore and master contacts
      if (db) {
        const cleanSub = tenantRecord.subdomain.toLowerCase();
        const tenantUpdates = {
          clientName: formData.clientName.trim(),
          ownerEmail: formData.ownerEmail.trim(),
          ownerPhone: formData.ownerPhone.trim(),
          updatedAt: new Date().toISOString(),
        };

        try {
          await setDoc(doc(db, 'tenants', cleanSub), tenantUpdates, { merge: true });
        } catch (err) {
          console.warn('[TenantSyncSettingsModal] Tenant update warning:', err);
        }

        try {
          // Sync with master CRM contacts
          await setDoc(
            doc(db, 'tenants', '_master', 'contacts', `tenant_admin_${cleanSub}`),
            {
              company_name: formData.clientName.trim(),
              conta_name: formData.clientName.trim(),
              kosun_crm_name: formData.clientName.trim(),
              email: formData.ownerEmail.trim(),
              kosun_crm_email: formData.ownerEmail.trim(),
              conta_phone: formData.ownerPhone.trim(),
              kosun_crm_phone: formData.ownerPhone.trim(),
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (err) {
          console.warn('[TenantSyncSettingsModal] Master contact sync warning:', err);
        }
      }

      const updatedRecord: TenantRecord = {
        ...tenantRecord,
        clientName: formData.clientName.trim(),
        ownerEmail: formData.ownerEmail.trim(),
        ownerPhone: formData.ownerPhone.trim(),
        updatedAt: new Date().toISOString(),
      };

      setInitialData({ ...formData });
      onSaved?.(updatedRecord);
      showNotification('ההגדרות והמפתחות נשמרו וסונכרנו בהצלחה!');
      setTimeout(() => onClose(), 600);
    } catch (err: any) {
      showNotification(err?.message || 'שגיאה בשמירת ההגדרות');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestClose = () => {
    if (isDirty) {
      setShowUnsavedConfirm(true);
    } else {
      onClose();
    }
  };

  const businessInitials = (tenantRecord.clientName || tenantRecord.subdomain)
    .trim()
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 transition-all duration-300 font-sans"
      dir="rtl"
    >
      <div
        className={`w-full max-w-[500px] max-h-[92vh] overflow-y-auto rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-6 relative shadow-2xl flex flex-col no-scrollbar border transition-colors ${
          isDarkMode
            ? 'bg-[#0a0a0a] border-white/10 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-base shadow-md shadow-indigo-500/20 shrink-0">
              {businessInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                  {formData.clientName || tenantRecord.subdomain}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  פעיל
                </span>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono block">
                {tenantRecord.fullDomain}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRequestClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
            title="סגירה"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unsaved Changes Confirmation Warning */}
        {showUnsavedConfirm && (
          <div className="mt-3 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-2xl flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>ישנם שינויים שלא נשמרו. האם לסגור בכל זאת?</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition"
              >
                סגור
              </button>
              <button
                type="button"
                onClick={() => setShowUnsavedConfirm(false)}
                className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-black/5 rounded-lg"
              >
                המשך עריכה
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Content: Accordion Sections */}
        <div className="flex-1 py-4 space-y-3">
          {/* Section 1: Overview & Domain Link */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50/50 dark:bg-white/[0.02]">
            <button
              type="button"
              onClick={() => toggleSection('overview')}
              className="w-full p-3.5 flex items-center justify-between text-right font-bold text-xs sm:text-sm hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4 text-indigo-500" />
                <span>פרטי העסק והסאב-דומיין</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  openSections.overview ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openSections.overview && (
              <div className="p-3.5 pt-0 space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    שם העסק / המותג
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => handleFieldChange('clientName', e.target.value)}
                    placeholder="שם העסק"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      דוא״ל מנהל
                    </label>
                    <input
                      type="email"
                      value={formData.ownerEmail}
                      onChange={(e) => handleFieldChange('ownerEmail', e.target.value)}
                      placeholder="admin@email.com"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      טלפון
                    </label>
                    <input
                      type="tel"
                      value={formData.ownerPhone}
                      onChange={(e) => handleFieldChange('ownerPhone', e.target.value)}
                      placeholder="050-0000000"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Subdomain URL with Copy and Go To Home */}
                <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="font-mono text-xs text-indigo-900 dark:text-indigo-200 truncate" dir="ltr">
                      https://{tenantRecord.fullDomain}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`https://${tenantRecord.fullDomain}`, 'domain')}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition shadow-xs"
                      title="העתק קישור"
                    >
                      {copiedField === 'domain' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href={`https://${tenantRecord.fullDomain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-xs"
                      title="פתח עמוד בית בלשונית חדשה"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Kesher Payments (Shown ONLY if tenant has kesher-payments-hub) */}
          {hasKesher && (
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50/50 dark:bg-white/[0.02]">
              <button
                type="button"
                onClick={() => toggleSection('kesher')}
                className="w-full p-3.5 flex items-center justify-between text-right font-bold text-xs sm:text-sm hover:bg-black/5 dark:hover:bg-white/5 transition"
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  <span>הגדרות סליקה וקשר (Kesher Pay)</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openSections.kesher ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openSections.kesher && (
                <div className="p-3.5 pt-0 space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      שם משתמש קשר (User Name)
                    </label>
                    <input
                      type="text"
                      value={formData.kesherUserName}
                      onChange={(e) => handleFieldChange('kesherUserName', e.target.value)}
                      placeholder="שם משתמש במסוף קשר"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      מפתח API קשר (API Key)
                    </label>
                    <div className="relative">
                      <input
                        type={showKesherKey ? 'text' : 'password'}
                        value={formData.kesherApiKey}
                        onChange={(e) => handleFieldChange('kesherApiKey', e.target.value)}
                        placeholder="••••••••••••••••••••"
                        className="w-full pl-10 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKesherKey(!showKesherKey)}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showKesherKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        מזהה עמוד תשלום (Page ID)
                      </label>
                      <input
                        type="text"
                        value={formData.kesherPaymentPageId}
                        onChange={(e) => handleFieldChange('kesherPaymentPageId', e.target.value)}
                        placeholder="מזהה דף"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        טוקן איזיקאונט לחשבוניות
                      </label>
                      <input
                        type="text"
                        value={formData.kesherEzCountToken}
                        onChange={(e) => handleFieldChange('kesherEzCountToken', e.target.value)}
                        placeholder="טוקן EzCount"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      סוג קבלה ברירת מחדל
                    </label>
                    <select
                      value={formData.kesherDefaultReceiptType}
                      onChange={(e) => handleFieldChange('kesherDefaultReceiptType', Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    >
                      <option value={400}>קבלה רגילה (400)</option>
                      <option value={405}>קבלה עבור תרומה (405)</option>
                      <option value={320}>חשבונית מס קבלה (320)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 3: WhatsApp (Shown ONLY if tenant has KosWhatsUp) */}
          {hasWhatsApp && (
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50/50 dark:bg-white/[0.02]">
              <button
                type="button"
                onClick={() => toggleSection('whatsapp')}
                className="w-full p-3.5 flex items-center justify-between text-right font-bold text-xs sm:text-sm hover:bg-black/5 dark:hover:bg-white/5 transition"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  <span>הגדרות וואטסאפ (Green API)</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openSections.whatsapp ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openSections.whatsapp && (
                <div className="p-3.5 pt-0 space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      מזהה מופע (Instance ID)
                    </label>
                    <input
                      type="text"
                      value={formData.greenApiInstanceId}
                      onChange={(e) => handleFieldChange('greenApiInstanceId', e.target.value)}
                      placeholder="לדוגמה: 7103123456"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      טוקן API (Green API Token)
                    </label>
                    <div className="relative">
                      <input
                        type={showGreenToken ? 'text' : 'password'}
                        value={formData.greenApiToken}
                        onChange={(e) => handleFieldChange('greenApiToken', e.target.value)}
                        placeholder="••••••••••••••••••••"
                        className="w-full pl-10 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowGreenToken(!showGreenToken)}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showGreenToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      כתובת Webhook מותאמת אישית (אופציונלי)
                    </label>
                    <input
                      type="url"
                      value={formData.customWebhookUrl}
                      onChange={(e) => handleFieldChange('customWebhookUrl', e.target.value)}
                      placeholder="https://your-domain.com/webhook"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 4: AI & Gemini (Shown if tenant has AI components) */}
          {hasAi && (
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50/50 dark:bg-white/[0.02]">
              <button
                type="button"
                onClick={() => toggleSection('ai')}
                className="w-full p-3.5 flex items-center justify-between text-right font-bold text-xs sm:text-sm hover:bg-black/5 dark:hover:bg-white/5 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>הגדרות בינה מלאכותית (Google AI / Gemini)</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openSections.ai ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openSections.ai && (
                <div className="p-3.5 pt-0 space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      מפתח Google AI API
                    </label>
                    <div className="relative">
                      <input
                        type={showAiKey ? 'text' : 'password'}
                        value={formData.googleAiApiKey}
                        onChange={(e) => handleFieldChange('googleAiApiKey', e.target.value)}
                        placeholder="AIzaSy••••••••••••••••••••"
                        className="w-full pl-10 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAiKey(!showAiKey)}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showAiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      דגם שפה נבחר
                    </label>
                    <select
                      value={formData.geminiModel}
                      onChange={(e) => handleFieldChange('geminiModel', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-mono"
                    >
                      <option value="gemini-3.8-flash">gemini-3.8-flash (מומלץ ומהיר)</option>
                      <option value="gemini-2.5-pro">gemini-2.5-pro (מתקדם)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 5: Email (Shown if tenant has kosun-am) */}
          {hasAm && (
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50/50 dark:bg-white/[0.02]">
              <button
                type="button"
                onClick={() => toggleSection('email')}
                className="w-full p-3.5 flex items-center justify-between text-right font-bold text-xs sm:text-sm hover:bg-black/5 dark:hover:bg-white/5 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-orange-500" />
                  <span>הגדרות דיוור ואימייל (Kosun AM)</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openSections.email ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openSections.email && (
                <div className="p-3.5 pt-0 space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      שם השולח בדיוור
                    </label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => handleFieldChange('clientName', e.target.value)}
                      placeholder="שם שיופיע ללקוחות"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      כתובת דוא״ל שולח
                    </label>
                    <input
                      type="email"
                      value={formData.ownerEmail}
                      onChange={(e) => handleFieldChange('ownerEmail', e.target.value)}
                      placeholder="newsletter@domain.com"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 6: Video Studio (Shown if tenant has video-producer-studio) */}
          {hasVideo && (
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50/50 dark:bg-white/[0.02]">
              <button
                type="button"
                onClick={() => toggleSection('video')}
                className="w-full p-3.5 flex items-center justify-between text-right font-bold text-xs sm:text-sm hover:bg-black/5 dark:hover:bg-white/5 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Film className="w-4 h-4 text-violet-500" />
                  <span>הגדרות סטודיו וידאו (HeyGen & ElevenLabs)</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openSections.video ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openSections.video && (
                <div className="p-3.5 pt-0 space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      מפתח HeyGen API
                    </label>
                    <input
                      type="password"
                      value={formData.heygenApiKey}
                      onChange={(e) => handleFieldChange('heygenApiKey', e.target.value)}
                      placeholder="מפתח HeyGen"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      מפתח ElevenLabs API
                    </label>
                    <input
                      type="password"
                      value={formData.elevenLabsApiKey}
                      onChange={(e) => handleFieldChange('elevenLabsApiKey', e.target.value)}
                      placeholder="מפתח ElevenLabs"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer: Save & Sync Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-white/10 shrink-0">
          {toastMessage && (
            <div className="mb-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
              isDirty
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/20'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>שומר הגדרות ומסנכרן...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>שמור שינויים וסנכרן</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
