import React, { useState, useEffect } from 'react';
import { 
  X, Layers, KeyRound, Cpu, ShieldCheck, Check, Save, 
  Eye, EyeOff, RefreshCw, AlertCircle, Copy, Sparkles, 
  Crown, Film, MessageSquare, Image, FileText, Lock, Globe
} from 'lucide-react';
import { useTenantProvisioner } from '../hooks/useTenantProvisioner';
import { AVAILABLE_MODULES_CATALOG } from '../services/tenantProvisionerService';
import { TenantTokenTracker, TenantTokenUsage, getDefaultTokenUsage } from '../../../core/ai/tenantTokenTracker';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';

type ActiveTab = 'modules' | 'keys' | 'tokens' | 'details';

export const TenantComprehensiveEditModal: React.FC = () => {
  const { 
    editingTenant, 
    setEditingTenant, 
    updateModules, 
    updateTenantAccount,
    updateTenantKeys,
    getTenantKeys,
    updateCredentials
  } = useTenantProvisioner();
  const { db } = useSystemConnection();

  const [activeTab, setActiveTab] = useState<ActiveTab>('modules');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Tenant Details state
  const [clientName, setClientName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [status, setStatus] = useState<'active' | 'suspended'>('active');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Keys state
  const [keysData, setKeysData] = useState({
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

  const [showKesherKey, setShowKesherKey] = useState(false);
  const [showGreenToken, setShowGreenToken] = useState(false);
  const [showHeygenKey, setShowHeygenKey] = useState(false);
  const [showMasterAiKey, setShowMasterAiKey] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Token usage state
  const [tokenUsage, setTokenUsage] = useState<TenantTokenUsage>(() => 
    getDefaultTokenUsage(editingTenant?.subdomain || '_master')
  );

  useEffect(() => {
    if (editingTenant) {
      setSelectedModules(editingTenant.activeModules || []);
      setClientName(editingTenant.clientName || '');
      setOwnerEmail(editingTenant.ownerEmail || '');
      setOwnerPhone(editingTenant.ownerPhone || '');
      setStatus((editingTenant.status as 'active' | 'suspended') || 'active');
      setAdminUsername(editingTenant.adminUsername || '');
      setAdminPassword(editingTenant.adminPassword || '');

      // Load keys
      getTenantKeys(editingTenant.subdomain).then((loaded) => {
        setKeysData((prev) => ({
          ...prev,
          ...loaded,
        }));
      });

      // Load token usage & subscribe
      let unsub = () => {};
      TenantTokenTracker.getTenantTokenUsage(db, editingTenant.subdomain).then(setTokenUsage);
      unsub = TenantTokenTracker.subscribe(db, editingTenant.subdomain, setTokenUsage);
      return () => unsub();
    }
  }, [editingTenant, db, getTenantKeys]);

  if (!editingTenant) return null;

  const isMaster = editingTenant.isMaster || editingTenant.subdomain === '_master';

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const notifySuccess = (msg: string) => {
    setSaveSuccessMessage(msg);
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Save Modules
  const handleSaveModules = async () => {
    setSaving(true);
    try {
      await updateModules(editingTenant.subdomain, selectedModules);
      notifySuccess('הרכיבים המוטענים עודכנו בהצלחה!');
    } catch (e) {
      console.warn('Error updating modules:', e);
    } finally {
      setSaving(false);
    }
  };

  // Save Keys
  const handleSaveKeys = async () => {
    setSaving(true);
    try {
      await updateTenantKeys(editingTenant.subdomain, keysData);
      notifySuccess('הגדרות המפתחות נשמרו בהצלחה תחת הטננט!');
    } catch (e) {
      console.warn('Error updating keys:', e);
    } finally {
      setSaving(false);
    }
  };

  // Save Details & Credentials
  const handleSaveDetails = async () => {
    setSaving(true);
    try {
      await updateTenantAccount(editingTenant.subdomain, {
        clientName,
        ownerEmail,
        ownerPhone,
        status,
      });
      if (adminUsername && adminPassword) {
        await updateCredentials(editingTenant.subdomain, {
          username: adminUsername,
          password: adminPassword,
        });
      }
      notifySuccess('פרטי הדייר עודכנו בהצלחה!');
    } catch (e) {
      console.warn('Error updating details:', e);
    } finally {
      setSaving(false);
    }
  };

  // Token Quota Progress Calculation
  const quota = tokenUsage.monthlyQuota || 1_000_000;
  const used = tokenUsage.totalTokens || 0;
  const percentUsed = Math.min(100, Math.round((used / quota) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-scaleUp">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
              isMaster 
                ? 'bg-amber-400 text-slate-950 shadow-amber-400/20' 
                : 'bg-indigo-600 text-white shadow-indigo-600/20'
            }`}>
              {isMaster ? <Crown className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {isMaster ? 'ניהול הדומיין הראשי (Master Domain)' : `עריכת סאב-דומיין: ${editingTenant.clientName}`}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isMaster 
                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700' 
                    : 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                }`}>
                  {isMaster ? 'Master Core' : editingTenant.subdomain}
                </span>
              </div>
              <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400" dir="ltr">
                {editingTenant.fullDomain}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEditingTenant(null)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('modules')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'modules'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>רכיבים מוטענים ({selectedModules.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('keys')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'keys'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>הגדרות מפתחות API</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tokens')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'tokens'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>מד טוקנים ושימוש AI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'details'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>פרטי דייר וגישה</span>
          </button>
        </div>

        {/* Success Alert Banner */}
        {saveSuccessMessage && (
          <div className="bg-emerald-50 dark:bg-emerald-950/70 border-b border-emerald-200 dark:border-emerald-800 px-4 py-2 flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {/* Tab 1: Modules Management (Clause ב) */}
        {activeTab === 'modules' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  בחירת רכיבים מודולריים להפעלה
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  הוסף או הסר רכיבים מסאב-דומיין זה. כל רכיב נטען באופן מבודד 100%.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedModules(AVAILABLE_MODULES_CATALOG.map((m) => m.id))}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  בחר הכל
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedModules([])}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  נקה הכל
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto p-1">
              {AVAILABLE_MODULES_CATALOG.map((mod) => {
                const isChecked = selectedModules.includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    onClick={() => toggleModule(mod.id)}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-start gap-3 cursor-pointer select-none ${
                      isChecked
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 shadow-xs'
                        : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold truncate ${isChecked ? 'text-indigo-950 dark:text-indigo-100' : 'text-slate-800 dark:text-slate-200'}`}>
                          {mod.name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 shrink-0" dir="ltr">
                          {mod.englishPrefix}{mod.englishRest}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {mod.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
              <button
                type="button"
                onClick={handleSaveModules}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition cursor-pointer"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>שמור שינויים ברכיבים</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: API Keys Management (Clause ג & Clause ד) */}
        {activeTab === 'keys' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 max-h-[60vh]">
            {/* Clause ה Notice: AI keys come from master, transactional keys are tenant-scoped */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-2">
              <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>מדיניות מפתחות KOSUN26:</span>
              </div>
              <p className="text-[11px] text-indigo-800 dark:text-indigo-300 leading-relaxed">
                {isMaster ? (
                  <span>
                    כאן מוגדרים מפתחות המאסטר המרכזיים של המערכת (כולל Google AI Gemini). מפתחות ה-AI כאן מזינים את כלל הסאב-דומיינים, והטוקנים נספרים באופן מבודד עבור כל טננט.
                  </span>
                ) : (
                  <span>
                    <b>מפתחות AI:</b> נמשכים תמיד ישירות מקולקציית המסטר. הטוקנים נספרים ומנוטרים במד הטוקנים של הסאב-דומיין.
                    <br />
                    <b>מפתחות API עצמאיים:</b> מפתחות סליקה (Kesher), וואטסאפ (Green API), וסטודיו וידאו (HeyGen) נשמרים תחת קולקציית הטננט (<code>tenants/{editingTenant.subdomain}/settings/api_keys</code>) ומועברים בכל פניות ה-API מהסאב-דומיין.
                  </span>
                )}
              </p>
            </div>

            {/* Master AI Key (Only editable on Master domain, displayed as read-only on subdomains) */}
            {isMaster ? (
              <div className="space-y-3 p-4 rounded-2xl border border-amber-300/60 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span>מפתח Google AI Gemini (Master AI Key)</span>
                  </div>
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold">מפתח מאסטר לכלל המערכת</span>
                </div>

                <div className="relative">
                  <input
                    type={showMasterAiKey ? 'text' : 'password'}
                    value={keysData.googleAiApiKey}
                    onChange={(e) => setKeysData((prev) => ({ ...prev, googleAiApiKey: e.target.value }))}
                    placeholder="AIzaSy..."
                    className="w-full pl-20 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs outline-none"
                    dir="ltr"
                  />
                  <div className="absolute left-2 top-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowMasterAiKey(!showMasterAiKey)}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                    >
                      {showMasterAiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(keysData.googleAiApiKey, 'masterAi')}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                    >
                      {copiedField === 'masterAi' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Kesher Clearing Keys */}
            <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>סליקה וקבלות קשר (Kesher Clearing & EzCount)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                  tenants/{editingTenant.subdomain}/settings/api_keys
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">שם משתמש קשר (UserName)</label>
                  <input
                    type="text"
                    value={keysData.kesherUserName}
                    onChange={(e) => setKeysData((prev) => ({ ...prev, kesherUserName: e.target.value }))}
                    placeholder="שם משתמש קשר"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">מזהה דף תשלום (PaymentPageId)</label>
                  <input
                    type="text"
                    value={keysData.kesherPaymentPageId}
                    onChange={(e) => setKeysData((prev) => ({ ...prev, kesherPaymentPageId: e.target.value }))}
                    placeholder="12345"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">מפתח API קשר (ApiKey)</label>
                  <div className="relative">
                    <input
                      type={showKesherKey ? 'text' : 'password'}
                      value={keysData.kesherApiKey}
                      onChange={(e) => setKeysData((prev) => ({ ...prev, kesherApiKey: e.target.value }))}
                      placeholder="מפתח סודי קשר"
                      className="w-full pl-16 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs outline-none"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKesherKey(!showKesherKey)}
                      className="absolute left-2 top-2 p-1 text-slate-400 hover:text-slate-600"
                    >
                      {showKesherKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">טוקן איזיקאונט (EzCount Token)</label>
                  <input
                    type="text"
                    value={keysData.kesherEzCountToken}
                    onChange={(e) => setKeysData((prev) => ({ ...prev, kesherEzCountToken: e.target.value }))}
                    placeholder="טוקן הפקת חשבוניות"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">סוג מסמך ברירת מחדל</label>
                  <select
                    value={keysData.kesherDefaultReceiptType}
                    onChange={(e) => setKeysData((prev) => ({ ...prev, kesherDefaultReceiptType: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none cursor-pointer"
                  >
                    <option value={400}>400 - חשבונית מס קבלה</option>
                    <option value={405}>405 - קבלה על תרומה</option>
                    <option value={320}>320 - חשבונית מס</option>
                  </select>
                </div>
              </div>
            </div>

            {/* WhatsApp Green-API Keys */}
            <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                <span>וואטסאפ ובוטים (Green-API WhatsApp)</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Instance ID</label>
                  <input
                    type="text"
                    value={keysData.greenApiInstanceId}
                    onChange={(e) => setKeysData((prev) => ({ ...prev, greenApiInstanceId: e.target.value }))}
                    placeholder="7103..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">API Token</label>
                  <div className="relative">
                    <input
                      type={showGreenToken ? 'text' : 'password'}
                      value={keysData.greenApiToken}
                      onChange={(e) => setKeysData((prev) => ({ ...prev, greenApiToken: e.target.value }))}
                      placeholder="טוקן Green API"
                      className="w-full pl-16 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs outline-none"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGreenToken(!showGreenToken)}
                      className="absolute left-2 top-2 p-1 text-slate-400 hover:text-slate-600"
                    >
                      {showGreenToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Custom Webhook URL</label>
                  <input
                    type="text"
                    value={keysData.customWebhookUrl}
                    onChange={(e) => setKeysData((prev) => ({ ...prev, customWebhookUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* HeyGen Video Studio Key */}
            <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-purple-500" />
                <span>סטודיו וידאו ואווטאר (HeyGen API Key)</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">HeyGen API Key</label>
                  <div className="relative">
                    <input
                      type={showHeygenKey ? 'text' : 'password'}
                      value={keysData.heygenApiKey}
                      onChange={(e) => setKeysData((prev) => ({ ...prev, heygenApiKey: e.target.value }))}
                      placeholder="מפתח HeyGen סודי"
                      className="w-full pl-16 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs outline-none"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowHeygenKey(!showHeygenKey)}
                      className="absolute left-2 top-2 p-1 text-slate-400 hover:text-slate-600"
                    >
                      {showHeygenKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
              <button
                type="button"
                onClick={handleSaveKeys}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition cursor-pointer"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>שמור הגדרות מפתחות</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Token Meter & AI Usage (Clause ה) */}
        {activeTab === 'tokens' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 max-h-[60vh]">
            {/* Header KPI Meter */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/20 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-300">מד טוקנים כולל לסאב-דומיין</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                      {percentUsed}% מנוצל
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                      {tokenUsage.totalTokens.toLocaleString()}
                    </span>
                    <span className="text-xs text-indigo-300 font-mono">
                      / {quota.toLocaleString()} טוקנים
                    </span>
                  </div>
                </div>

                <div className="text-left space-y-1 sm:border-r sm:border-white/10 sm:pr-6" dir="ltr">
                  <span className="text-[11px] text-slate-400 block">Estimated Cost</span>
                  <div className="font-mono text-lg font-black text-emerald-400">
                    ${tokenUsage.totalCostUSD.toFixed(3)}
                    <span className="text-xs text-slate-400 ml-1.5 font-sans">(~₪{tokenUsage.totalCostILS.toFixed(2)})</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${percentUsed}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>0 טוקנים</span>
                  <span>מכסה חודשית: {quota.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Breakdown by Consumer (Clause ה: Gallery, Video/HeyGen, Content, Chatbots) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                פירוט צריכת טוקנים לפי רכיבים ושירותים:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Media Gallery / Image Generation */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 shadow-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center shrink-0">
                      <Image className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        מאגר מדיה ותמונות AI
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        {tokenUsage.imageGenerationsCount} תמונות נוצרו
                      </span>
                    </div>
                  </div>
                  <div className="text-left font-mono" dir="ltr">
                    <span className="text-sm font-black text-slate-900 dark:text-white block">
                      {tokenUsage.galleryTokens.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">טוקנים</span>
                  </div>
                </div>

                {/* 2. Video Studio / HeyGen */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 shadow-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center justify-center shrink-0">
                      <Film className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        סטודיו וידאו ו-HeyGen
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        {tokenUsage.heygenVideoSeconds} שניות וידאו
                      </span>
                    </div>
                  </div>
                  <div className="text-left font-mono" dir="ltr">
                    <span className="text-sm font-black text-slate-900 dark:text-white block">
                      {tokenUsage.videoTokens.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">טוקנים</span>
                  </div>
                </div>

                {/* 3. Content & Page Builder */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 shadow-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        יצירת תוכן, עמודים ושאלונים
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        KosWebAi, BrandDNA, טפסים
                      </span>
                    </div>
                  </div>
                  <div className="text-left font-mono" dir="ltr">
                    <span className="text-sm font-black text-slate-900 dark:text-white block">
                      {tokenUsage.contentTokens.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">טוקנים</span>
                  </div>
                </div>

                {/* 4. Chatbots & WhatsApp */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 shadow-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        צ'אטבוטים ו-WhatsApp
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        בוטים חכמים ותשובות אוטומטיות
                      </span>
                    </div>
                  </div>
                  <div className="text-left font-mono" dir="ltr">
                    <span className="text-sm font-black text-slate-900 dark:text-white block">
                      {tokenUsage.chatbotTokens.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">טוקנים</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Tenant Details & Security */}
        {activeTab === 'details' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">שם העסק / הלקוח</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">סטטוס סאב-דומיין</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'suspended')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none cursor-pointer"
                >
                  <option value="active">פעיל (Active)</option>
                  <option value="suspended">מושעה (Suspended)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">אימייל בעל העסק</label>
                <input
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">טלפון בעל העסק</label>
                <input
                  type="tel"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">שם משתמש למנהל</label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none font-mono"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">סיסמת כניסה למנהל</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none font-mono"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
              <button
                type="button"
                onClick={handleSaveDetails}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition cursor-pointer"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>שמור פרטי דייר וגישה</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            KOSUN26 Multi-Tenant Isolation Standard
          </span>

          <button
            type="button"
            onClick={() => setEditingTenant(null)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            סגור חלון
          </button>
        </div>

      </div>
    </div>
  );
};
