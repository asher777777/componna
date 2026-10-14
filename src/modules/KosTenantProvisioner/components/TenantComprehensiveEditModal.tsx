import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Layers, KeyRound, Cpu, ShieldCheck, Check, Save, 
  Eye, EyeOff, RefreshCw, AlertCircle, Copy, Sparkles, 
  Crown, Film, MessageSquare, Image, FileText, Lock, Globe,
  ChevronDown, ExternalLink, AlertTriangle
} from 'lucide-react';
import { useTenantProvisioner } from '../hooks/useTenantProvisioner';
import { AVAILABLE_MODULES_CATALOG } from '../services/tenantProvisionerService';
import { TenantTokenTracker, TenantTokenUsage, getDefaultTokenUsage } from '../../../core/ai/tenantTokenTracker';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';

export type TenantAccordionSection = 'modules' | 'keys' | 'tokens' | 'details';

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

  // Collapsible accordion sections (closed by default as per Contact360Modal / Hakel standard)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    modules: true, // First section open for immediate clarity
  });

  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);

  // Dynamic Light / Dark mode sync from document element (default: syncs with main page)
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

  const [initialData, setInitialData] = useState<{
    modules: string[];
    clientName: string;
    ownerEmail: string;
    ownerPhone: string;
    status: string;
    adminUsername: string;
    adminPassword: string;
    keys: typeof keysData;
  } | null>(null);

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
      const initialMods = editingTenant.activeModules || [];
      const initName = editingTenant.clientName || '';
      const initEmail = editingTenant.ownerEmail || '';
      const initPhone = editingTenant.ownerPhone || '';
      const initStatus = (editingTenant.status as 'active' | 'suspended') || 'active';
      const initUser = editingTenant.adminUsername || '';
      const initPass = editingTenant.adminPassword || '';

      setSelectedModules(initialMods);
      setClientName(initName);
      setOwnerEmail(initEmail);
      setOwnerPhone(initPhone);
      setStatus(initStatus);
      setAdminUsername(initUser);
      setAdminPassword(initPass);
      setShowUnsavedConfirm(false);

      // Load keys
      getTenantKeys(editingTenant.subdomain).then((loaded) => {
        const mergedKeys = {
          ...keysData,
          ...loaded,
        };
        setKeysData(mergedKeys);

        setInitialData({
          modules: [...initialMods],
          clientName: initName,
          ownerEmail: initEmail,
          ownerPhone: initPhone,
          status: initStatus,
          adminUsername: initUser,
          adminPassword: initPass,
          keys: { ...mergedKeys }
        });
      });

      // Load token usage & subscribe
      let unsub = () => {};
      TenantTokenTracker.getTenantTokenUsage(db, editingTenant.subdomain).then(setTokenUsage);
      unsub = TenantTokenTracker.subscribe(db, editingTenant.subdomain, setTokenUsage);
      return () => unsub();
    }
  }, [editingTenant, db, getTenantKeys]);

  // Check if user made unsaved changes
  const isDirty = useMemo(() => {
    if (!initialData) return false;
    const modsChanged = JSON.stringify(selectedModules.slice().sort()) !== JSON.stringify(initialData.modules.slice().sort());
    const detailsChanged = clientName !== initialData.clientName ||
      ownerEmail !== initialData.ownerEmail ||
      ownerPhone !== initialData.ownerPhone ||
      status !== initialData.status ||
      adminUsername !== initialData.adminUsername ||
      adminPassword !== initialData.adminPassword;
    const keysChanged = JSON.stringify(keysData) !== JSON.stringify(initialData.keys);
    return modsChanged || detailsChanged || keysChanged;
  }, [selectedModules, clientName, ownerEmail, ownerPhone, status, adminUsername, adminPassword, keysData, initialData]);

  if (!editingTenant) return null;

  const isMaster = editingTenant.isMaster || editingTenant.subdomain === '_master';

  // Avatar initials icon (2 letters connected)
  const initials = useMemo(() => {
    if (isMaster) return '👑';
    const name = clientName || editingTenant.clientName || editingTenant.subdomain || '';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'TN';
  }, [clientName, editingTenant, isMaster]);

  const toggleSection = (section: TenantAccordionSection) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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

  // Save All
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updateModules(editingTenant.subdomain, selectedModules),
        updateTenantKeys(editingTenant.subdomain, keysData),
        updateTenantAccount(editingTenant.subdomain, {
          clientName,
          ownerEmail,
          ownerPhone,
          status,
        }),
        ...(adminUsername && adminPassword ? [
          updateCredentials(editingTenant.subdomain, {
            username: adminUsername,
            password: adminPassword,
          })
        ] : [])
      ]);
      notifySuccess('השינויים נשמרו בהצלחה וסונכרנו עם הטננט');
      setInitialData({
        modules: [...selectedModules],
        clientName,
        ownerEmail,
        ownerPhone,
        status,
        adminUsername,
        adminPassword,
        keys: { ...keysData }
      });
    } catch (e: any) {
      console.warn('Error saving tenant:', e);
      notifySuccess(e?.message || 'שגיאה בשמירת פרטי הדייר');
    } finally {
      setSaving(false);
    }
  };

  // Safe Close with dirty check warning
  const handleRequestClose = () => {
    if (isDirty) {
      setShowUnsavedConfirm(true);
    } else {
      setEditingTenant(null);
    }
  };

  // Token Quota Progress Calculation
  const quota = tokenUsage.monthlyQuota || 1_000_000;
  const used = tokenUsage.totalTokens || 0;
  const percentUsed = Math.min(100, Math.round((used / quota) * 100));

  const domainUrl = editingTenant.fullDomain?.startsWith('http') 
    ? editingTenant.fullDomain 
    : `https://${editingTenant.fullDomain}`;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 transition-all duration-300 font-sans"
      dir="rtl"
    >
      {/* Modal Container: Matches Contact360Modal architecture, adapting automatically to Light Mode or Dark Mode */}
      <div 
        className={`w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl sm:rounded-[2.5rem] p-3.5 sm:p-5 relative shadow-2xl flex flex-col no-scrollbar border transition-colors ${
          isDarkMode 
            ? 'bg-[#0a0a0a] border-white/10 text-white' 
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
        style={{ fontFamily: "'Heebo', sans-serif" }}
      >

        {/* 1. Header: Compact (reduced height), with Save Icon, Avatar Badge, and Close */}
        <div className={`flex items-center justify-between pb-2.5 mb-2.5 border-b shrink-0 ${
          isDarkMode ? 'border-white/10' : 'border-slate-100'
        }`}>
          {/* Right: Connected Two-Letter Avatar Icon + Name + Subdomain badge */}
          <div className="flex items-center gap-2 max-w-[65%]">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 shadow-sm border select-none ${
                isMaster
                  ? isDarkMode 
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                  : isDarkMode 
                    ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' 
                    : 'bg-indigo-100 text-indigo-800 border-indigo-300'
              }`}
              title={isMaster ? 'Master Core' : (clientName || editingTenant.subdomain)}
            >
              {initials}
            </div>

            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className={`text-xs sm:text-sm font-black truncate leading-tight ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  {isMaster ? 'ניהול הדומיין הראשי (Master Core)' : (clientName || editingTenant.clientName)}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isMaster 
                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700' 
                    : 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                }`}>
                  {isMaster ? 'Master Core' : editingTenant.subdomain}
                </span>
              </div>
              <div className={`text-[10px] truncate leading-none mt-0.5 font-mono ${
                isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
              }`} dir="ltr">
                {editingTenant.fullDomain}
              </div>
            </div>
          </div>

          {/* Left: Quick Actions (Visit Domain, Save Icon in Header, Close) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {!isMaster && editingTenant.fullDomain && (
              <a 
                href={domainUrl} 
                target="_blank" 
                rel="noreferrer" 
                className={`p-1.5 rounded-full border transition hover:opacity-80 ${
                  isDarkMode ? 'border-indigo-900 text-indigo-400' : 'border-indigo-200 text-indigo-600 bg-indigo-50/50'
                }`}
                title="פתח סאב-דומיין בדפדפן"
              >
                <Globe className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Save Button as Icon in Header without text label */}
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className={`p-1.5 rounded-full transition shadow-sm cursor-pointer disabled:opacity-50 ${
                isDirty
                  ? 'bg-amber-500 hover:bg-amber-400 text-black ring-2 ring-amber-400/50 animate-pulse'
                  : isDarkMode
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title={isDirty ? "שמור שינויים שלא נשמרו" : "שמור"}
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            </button>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={handleRequestClose}
              className={`p-1.5 rounded-full transition cursor-pointer ${
                isDarkMode 
                  ? 'text-zinc-400 hover:text-white hover:bg-white/10' 
                  : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
              }`}
              title="סגור"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Unsaved Changes Warning Banner */}
        {showUnsavedConfirm && (
          <div className="mb-3 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-xs space-y-2 animate-fadeIn shrink-0">
            <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>שים לב: קיימים שינויים שלא נשמרו בהגדרות הדייר.</span>
            </div>
            <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`}>
              האם ברצונך לשמור את השינויים לפני היציאה, או לצאת ללא שמירה?
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={async () => {
                  await handleSaveAll();
                  setEditingTenant(null);
                }}
                disabled={saving}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-lg text-xs transition cursor-pointer"
              >
                שמור וצא
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedConfirm(false);
                  setEditingTenant(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  isDarkMode 
                    ? 'border-white/10 hover:bg-white/10 text-white' 
                    : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                }`}
              >
                צא ללא שמירה
              </button>
              <button
                type="button"
                onClick={() => setShowUnsavedConfirm(false)}
                className="px-2 py-1 text-xs text-zinc-400 hover:underline mr-auto cursor-pointer"
              >
                המשך עריכה
              </button>
            </div>
          </div>
        )}

        {/* 3. Toast Message */}
        {saveSuccessMessage && (
          <div className="mb-2 p-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-600 dark:text-amber-300 text-xs text-center font-bold animate-fadeIn shrink-0 flex items-center justify-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {/* 4. HAKEL Accordion Sections - Collapsible Tabs Matching Contact360Modal */}
        <div className="space-y-2 flex-1 overflow-y-auto">

          {/* SECTION 1: רכיבים מוטענים (Modules) */}
          <div className={`w-full flex flex-col rounded-2xl border overflow-hidden transition-all ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <button
              type="button"
              onClick={() => toggleSection('modules')}
              className={`w-full h-12 px-3.5 flex items-center justify-between font-bold text-xs cursor-pointer transition-all ${
                isDarkMode ? 'text-white hover:bg-[#1a1a1a]' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-white text-indigo-600 shadow-sm'
                }`}>
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold">רכיבים מוטענים ({selectedModules.length})</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openSections['modules'] ? 'rotate-180' : ''}`} />
            </button>
            
            {openSections['modules'] && (
              <div className={`p-3.5 sm:p-4 border-t space-y-3 text-xs animate-fadeIn ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      בחירת רכיבים מודולריים להפעלה
                    </h4>
                    <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      הוסף או הסר רכיבים מסאב-דומיין זה. כל רכיב נטען באופן מבודד 100%.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedModules(AVAILABLE_MODULES_CATALOG.map((m) => m.id))}
                      className={`text-[10px] px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                        isDarkMode ? 'bg-white/10 text-zinc-300 hover:bg-white/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      בחר הכל
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedModules([])}
                      className={`text-[10px] px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                        isDarkMode ? 'bg-white/10 text-zinc-300 hover:bg-white/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      נקה הכל
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[45vh] overflow-y-auto p-0.5">
                  {AVAILABLE_MODULES_CATALOG.map((mod) => {
                    const isChecked = selectedModules.includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        onClick={() => toggleModule(mod.id)}
                        className={`p-3 rounded-xl border transition-all duration-150 flex items-start gap-2.5 cursor-pointer select-none ${
                          isChecked
                            ? isDarkMode
                              ? 'bg-indigo-950/40 border-indigo-500/50 shadow-xs'
                              : 'bg-indigo-50/70 border-indigo-300 shadow-xs'
                            : isDarkMode
                              ? 'bg-[#181818] border-white/5 hover:border-white/15'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                            isChecked
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : isDarkMode
                                ? 'border-zinc-600 bg-zinc-800'
                                : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-xs font-bold truncate ${
                              isChecked 
                                ? isDarkMode ? 'text-indigo-200' : 'text-indigo-950' 
                                : isDarkMode ? 'text-zinc-200' : 'text-slate-800'
                            }`}>
                              {mod.name}
                            </span>
                            <span className="font-mono text-[9px] text-zinc-400 shrink-0" dir="ltr">
                              {mod.englishPrefix}{mod.englishRest}
                            </span>
                          </div>
                          <p className={`text-[10px] line-clamp-1 mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                            {mod.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={`pt-2.5 border-t flex items-center justify-end ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                  <button
                    type="button"
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>שמור רכיבים מוטענים</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: הגדרות מפתחות API (API Keys) */}
          <div className={`w-full flex flex-col rounded-2xl border overflow-hidden transition-all ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <button
              type="button"
              onClick={() => toggleSection('keys')}
              className={`w-full h-12 px-3.5 flex items-center justify-between font-bold text-xs cursor-pointer transition-all ${
                isDarkMode ? 'text-white hover:bg-[#1a1a1a]' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-white text-indigo-600 shadow-sm'
                }`}>
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold">הגדרות מפתחות API</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openSections['keys'] ? 'rotate-180' : ''}`} />
            </button>
            
            {openSections['keys'] && (
              <div className={`p-3.5 sm:p-4 border-t space-y-4 text-xs animate-fadeIn ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}>
                {/* Notice Block */}
                <div className={`p-3 rounded-xl border text-[11px] leading-relaxed space-y-1 ${
                  isDarkMode 
                    ? 'bg-indigo-950/20 border-indigo-900/40 text-indigo-200' 
                    : 'bg-indigo-50/60 border-indigo-100 text-indigo-900'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>מדיניות מפתחות KOSUN26:</span>
                  </div>
                  <p className="text-[10px]">
                    {isMaster ? (
                      'כאן מוגדרים מפתחות המאסטר המרכזיים (כולל Google AI). מפתחות ה-AI מזינים את כלל הסאב-דומיינים, והטוקנים מנוטרים במד הטוקנים של כל טננט.'
                    ) : (
                      'מפתחות AI נמשכים תמיד מקולקציית המאסטר. מפתחות סליקה, וואטסאפ ווידאו נשמרים תחת קולקציית הטננט ומועברים בכל פניות ה-API.'
                    )}
                  </p>
                </div>

                {/* Master AI Key */}
                {isMaster && (
                  <div className={`p-3 rounded-xl border space-y-2 ${
                    isDarkMode 
                      ? 'border-amber-500/30 bg-amber-500/5' 
                      : 'border-amber-300/70 bg-amber-50/50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-amber-500">
                        <Crown className="w-3.5 h-3.5" />
                        <span>מפתח Google AI Gemini (Master AI Key)</span>
                      </div>
                      <span className="text-[9px] text-amber-400 font-bold">מפתח מאסטר לכלל המערכת</span>
                    </div>

                    <div className="relative">
                      <input
                        type={showMasterAiKey ? 'text' : 'password'}
                        value={keysData.googleAiApiKey}
                        onChange={(e) => setKeysData((prev) => ({ ...prev, googleAiApiKey: e.target.value }))}
                        placeholder="AIzaSy..."
                        className={`w-full pl-16 pr-3 py-2 rounded-xl border text-xs font-mono outline-none ${
                          isDarkMode 
                            ? 'bg-[#181818] border-white/10 text-white' 
                            : 'bg-white border-slate-200 text-slate-900'
                        }`}
                        dir="ltr"
                      />
                      <div className="absolute left-2 top-1.5 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowMasterAiKey(!showMasterAiKey)}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-200"
                        >
                          {showMasterAiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(keysData.googleAiApiKey, 'masterAi')}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-200"
                        >
                          {copiedField === 'masterAi' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Kesher Keys */}
                <div className={`p-3 rounded-xl border space-y-2.5 ${
                  isDarkMode ? 'border-white/5 bg-[#161616]' : 'border-slate-200 bg-slate-50/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>סליקה וקבלות קשר (Kesher & EzCount)</span>
                    </span>
                    <span className="text-[9px] text-zinc-400 font-mono" dir="ltr">
                      tenants/{editingTenant.subdomain}/settings/api_keys
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-500 block">UserName</label>
                      <input
                        type="text"
                        value={keysData.kesherUserName}
                        onChange={(e) => setKeysData((prev) => ({ ...prev, kesherUserName: e.target.value }))}
                        placeholder="שם משתמש קשר"
                        className={`w-full px-2.5 py-1.5 rounded-xl border text-xs outline-none ${
                          isDarkMode ? 'bg-[#111] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                        }`}
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-500 block">PaymentPageId</label>
                      <input
                        type="text"
                        value={keysData.kesherPaymentPageId}
                        onChange={(e) => setKeysData((prev) => ({ ...prev, kesherPaymentPageId: e.target.value }))}
                        placeholder="12345"
                        className={`w-full px-2.5 py-1.5 rounded-xl border text-xs outline-none ${
                          isDarkMode ? 'bg-[#111] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                        }`}
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-bold text-amber-500 block">ApiKey סודי</label>
                      <div className="relative">
                        <input
                          type={showKesherKey ? 'text' : 'password'}
                          value={keysData.kesherApiKey}
                          onChange={(e) => setKeysData((prev) => ({ ...prev, kesherApiKey: e.target.value }))}
                          placeholder="מפתח סודי קשר"
                          className={`w-full pl-14 pr-2.5 py-1.5 rounded-xl border text-xs font-mono outline-none ${
                            isDarkMode ? 'bg-[#111] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                          }`}
                          dir="ltr"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKesherKey(!showKesherKey)}
                          className="absolute left-2 top-1.5 p-1 text-zinc-400 hover:text-zinc-200"
                        >
                          {showKesherKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-500 block">EzCount Token</label>
                      <input
                        type="text"
                        value={keysData.kesherEzCountToken}
                        onChange={(e) => setKeysData((prev) => ({ ...prev, kesherEzCountToken: e.target.value }))}
                        placeholder="טוקן חשבוניות"
                        className={`w-full px-2.5 py-1.5 rounded-xl border text-xs outline-none ${
                          isDarkMode ? 'bg-[#111] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                        }`}
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-500 block">סוג מסמך ברירת מחדל</label>
                      <select
                        value={keysData.kesherDefaultReceiptType}
                        onChange={(e) => setKeysData((prev) => ({ ...prev, kesherDefaultReceiptType: Number(e.target.value) }))}
                        className={`w-full px-2.5 py-1.5 rounded-xl border text-xs outline-none cursor-pointer ${
                          isDarkMode ? 'bg-[#111] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      >
                        <option value={400}>400 - חשבונית מס קבלה</option>
                        <option value={405}>405 - קבלה על תרומה</option>
                        <option value={320}>320 - חשבונית מס</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* WhatsApp & Green-API */}
                <div className={`p-3 rounded-xl border space-y-2.5 ${
                  isDarkMode ? 'border-white/5 bg-[#161616]' : 'border-slate-200 bg-slate-50/50'
                }`}>
                  <span className="font-bold flex items-center gap-1.5 text-xs">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                    <span>וואטסאפ ובוטים (Green-API WhatsApp)</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-500 block">Instance ID</label>
                      <input
                        type="text"
                        value={keysData.greenApiInstanceId}
                        onChange={(e) => setKeysData((prev) => ({ ...prev, greenApiInstanceId: e.target.value }))}
                        placeholder="7103..."
                        className={`w-full px-2.5 py-1.5 rounded-xl border text-xs outline-none ${
                          isDarkMode ? 'bg-[#111] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                        }`}
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-500 block">API Token</label>
                      <div className="relative">
                        <input
                          type={showGreenToken ? 'text' : 'password'}
                          value={keysData.greenApiToken}
                          onChange={(e) => setKeysData((prev) => ({ ...prev, greenApiToken: e.target.value }))}
                          placeholder="טוקן Green API"
                          className={`w-full pl-14 pr-2.5 py-1.5 rounded-xl border text-xs font-mono outline-none ${
                            isDarkMode ? 'bg-[#111] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                          }`}
                          dir="ltr"
                        />
                        <button
                          type="button"
                          onClick={() => setShowGreenToken(!showGreenToken)}
                          className="absolute left-2 top-1.5 p-1 text-zinc-400 hover:text-zinc-200"
                        >
                          {showGreenToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-bold text-amber-500 block">Custom Webhook URL</label>
                      <input
                        type="text"
                        value={keysData.customWebhookUrl}
                        onChange={(e) => setKeysData((prev) => ({ ...prev, customWebhookUrl: e.target.value }))}
                        placeholder="https://..."
                        className={`w-full px-2.5 py-1.5 rounded-xl border text-xs outline-none ${
                          isDarkMode ? 'bg-[#111] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                        }`}
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                {/* HeyGen Video Studio Key */}
                <div className={`p-3 rounded-xl border space-y-2 ${
                  isDarkMode ? 'border-white/5 bg-[#161616]' : 'border-slate-200 bg-slate-50/50'
                }`}>
                  <span className="font-bold flex items-center gap-1.5 text-xs">
                    <Film className="w-3.5 h-3.5 text-purple-500" />
                    <span>סטודיו וידאו ואווטאר (HeyGen API Key)</span>
                  </span>

                  <div className="relative">
                    <input
                      type={showHeygenKey ? 'text' : 'password'}
                      value={keysData.heygenApiKey}
                      onChange={(e) => setKeysData((prev) => ({ ...prev, heygenApiKey: e.target.value }))}
                      placeholder="מפתח HeyGen סודי"
                      className={`w-full pl-14 pr-2.5 py-1.5 rounded-xl border text-xs font-mono outline-none ${
                        isDarkMode ? 'bg-[#111] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowHeygenKey(!showHeygenKey)}
                      className="absolute left-2 top-1.5 p-1 text-zinc-400 hover:text-zinc-200"
                    >
                      {showHeygenKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div className={`pt-2.5 border-t flex items-center justify-end ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                  <button
                    type="button"
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>שמור הגדרות מפתחות</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: מד טוקנים ושימוש AI (Token Usage) */}
          <div className={`w-full flex flex-col rounded-2xl border overflow-hidden transition-all ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <button
              type="button"
              onClick={() => toggleSection('tokens')}
              className={`w-full h-12 px-3.5 flex items-center justify-between font-bold text-xs cursor-pointer transition-all ${
                isDarkMode ? 'text-white hover:bg-[#1a1a1a]' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-white text-indigo-600 shadow-sm'
                }`}>
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold">מד טוקנים ושימוש AI ({percentUsed}%)</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openSections['tokens'] ? 'rotate-180' : ''}`} />
            </button>
            
            {openSections['tokens'] && (
              <div className={`p-3.5 sm:p-4 border-t space-y-3.5 text-xs animate-fadeIn ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}>
                {/* Header KPI Meter Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/20 shadow-md space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-indigo-300">מד טוקנים כולל</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                          {percentUsed}% מנוצל
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                          {tokenUsage.totalTokens.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-indigo-300 font-mono">
                          / {quota.toLocaleString()} טוקנים
                        </span>
                      </div>
                    </div>

                    <div className="text-left space-y-0.5 sm:border-r sm:border-white/10 sm:pr-4" dir="ltr">
                      <span className="text-[10px] text-slate-400 block">Estimated Cost</span>
                      <div className="font-mono text-base font-black text-emerald-400">
                        ${tokenUsage.totalCostUSD.toFixed(3)}
                        <span className="text-[10px] text-slate-400 ml-1 font-sans">(~₪{tokenUsage.totalCostILS.toFixed(2)})</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${percentUsed}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>0 טוקנים</span>
                      <span>מכסה: {quota.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Consumer Breakdown Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* 1. Media Gallery */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 ${
                    isDarkMode ? 'border-white/5 bg-[#161616]' : 'border-slate-200 bg-white shadow-xs'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
                        <Image className="w-4 h-4" />
                      </div>
                      <div>
                        <span className={`text-[11px] font-bold block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          מאגר מדיה ותמונות
                        </span>
                        <span className="text-[10px] text-zinc-400 block">
                          {tokenUsage.imageGenerationsCount} תמונות נוצרו
                        </span>
                      </div>
                    </div>
                    <div className="text-left font-mono" dir="ltr">
                      <span className={`text-xs font-black block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {tokenUsage.galleryTokens.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* 2. Video Studio / HeyGen */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 ${
                    isDarkMode ? 'border-white/5 bg-[#161616]' : 'border-slate-200 bg-white shadow-xs'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                        <Film className="w-4 h-4" />
                      </div>
                      <div>
                        <span className={`text-[11px] font-bold block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          סטודיו וידאו ו-HeyGen
                        </span>
                        <span className="text-[10px] text-zinc-400 block">
                          {tokenUsage.heygenVideoSeconds} שניות וידאו
                        </span>
                      </div>
                    </div>
                    <div className="text-left font-mono" dir="ltr">
                      <span className={`text-xs font-black block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {tokenUsage.videoTokens.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* 3. Content */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 ${
                    isDarkMode ? 'border-white/5 bg-[#161616]' : 'border-slate-200 bg-white shadow-xs'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className={`text-[11px] font-bold block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          יצירת תוכן ועמודים
                        </span>
                        <span className="text-[10px] text-zinc-400 block">
                          KosWebAi, BrandDNA, טפסים
                        </span>
                      </div>
                    </div>
                    <div className="text-left font-mono" dir="ltr">
                      <span className={`text-xs font-black block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {tokenUsage.contentTokens.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* 4. Chatbots */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 ${
                    isDarkMode ? 'border-white/5 bg-[#161616]' : 'border-slate-200 bg-white shadow-xs'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <span className={`text-[11px] font-bold block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          צ'אטבוטים ו-WhatsApp
                        </span>
                        <span className="text-[10px] text-zinc-400 block">
                          בוטים ותשובות AI
                        </span>
                      </div>
                    </div>
                    <div className="text-left font-mono" dir="ltr">
                      <span className={`text-xs font-black block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {tokenUsage.chatbotTokens.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: פרטי דייר וגישה (Tenant Details & Access) */}
          <div className={`w-full flex flex-col rounded-2xl border overflow-hidden transition-all ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <button
              type="button"
              onClick={() => toggleSection('details')}
              className={`w-full h-12 px-3.5 flex items-center justify-between font-bold text-xs cursor-pointer transition-all ${
                isDarkMode ? 'text-white hover:bg-[#1a1a1a]' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-white text-indigo-600 shadow-sm'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold">פרטי דייר וגישה</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openSections['details'] ? 'rotate-180' : ''}`} />
            </button>
            
            {openSections['details'] && (
              <div className={`p-3.5 sm:p-4 border-t space-y-3 text-xs animate-fadeIn ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-500 block">שם העסק / הלקוח</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="שם העסק"
                      className={`w-full px-2.5 py-1.5 rounded-xl border text-xs outline-none ${
                        isDarkMode ? 'bg-[#181818] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-500 block">סטטוס סאב-דומיין</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'active' | 'suspended')}
                      className={`w-full px-2.5 py-1.5 rounded-xl border text-xs outline-none cursor-pointer ${
                        isDarkMode ? 'bg-[#181818] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="active">פעיל (Active)</option>
                      <option value="suspended">מושעה (Suspended)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-500 block">אימייל בעל העסק</label>
                    <input
                      type="email"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="owner@example.com"
                      className={`w-full px-2.5 py-1.5 rounded-xl border text-xs outline-none ${
                        isDarkMode ? 'bg-[#181818] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-500 block">טלפון בעל העסק</label>
                    <input
                      type="tel"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      placeholder="050-1234567"
                      className={`w-full px-2.5 py-1.5 rounded-xl border text-xs outline-none ${
                        isDarkMode ? 'bg-[#181818] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-500 block">שם משתמש למנהל</label>
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="admin"
                      className={`w-full px-2.5 py-1.5 rounded-xl border text-xs outline-none font-mono ${
                        isDarkMode ? 'bg-[#181818] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-500 block">סיסמת כניסה למנהל</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-2.5 py-1.5 rounded-xl border text-xs outline-none font-mono ${
                          isDarkMode ? 'bg-[#181818] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                        }`}
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-2 top-1.5 p-1 text-zinc-400 hover:text-zinc-200"
                      >
                        {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`pt-2.5 border-t flex items-center justify-end ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                  <button
                    type="button"
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>שמור פרטי דייר וגישה</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* 5. Modal Footer: Compact as in Contact360Modal */}
        <div className={`pt-3 mt-3 border-t flex items-center justify-between shrink-0 ${
          isDarkMode ? 'border-white/10' : 'border-slate-100'
        }`}>
          <span className="text-[10px] text-zinc-400">
            KOSUN26 Multi-Tenant Isolation Standard
          </span>

          <button
            type="button"
            onClick={handleRequestClose}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
              isDarkMode 
                ? 'border-white/10 text-zinc-300 hover:bg-white/10' 
                : 'border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            סגור חלון
          </button>
        </div>

      </div>
    </div>
  );
};
