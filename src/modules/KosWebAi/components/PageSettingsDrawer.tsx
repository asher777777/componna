import React, { useState, useEffect, useMemo } from 'react';
import { GlobalPageSettings, SeoSettings } from '../types/pageBuilder.types';
import { PageBuilderColorPicker } from '../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../ui/PageBuilderImageUpload';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract, AiTextAssistantContract } from '../../../core/contracts';
import { 
  X, 
  Save, 
  ChevronDown, 
  Sparkles, 
  Globe, 
  Palette, 
  Search, 
  BarChart3, 
  Phone, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Check, 
  Activity, 
  Layers,
  Layout,
  ExternalLink,
  Cookie
} from 'lucide-react';
import { clsx } from 'clsx';
import { generateCompliantSeo } from '../generators/seoService';
import { CookieConsentBanner } from './CookieConsentBanner';
import { syncBrandDnaFromLegalSettings } from '../generators/legalPagesGenerator';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';

interface PageSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  globalSettings: GlobalPageSettings;
  onUpdateGlobalSettings: (updated: GlobalPageSettings) => void;
  seoSettings: SeoSettings;
  onUpdateSeoSettings: (updated: SeoSettings) => void;
  onOpenGeoDrawer?: () => void;
  pageTitle?: string;
  pageSections?: any[];
}

export type SettingsAccordionSection = 'general' | 'design' | 'seo' | 'analytics' | 'contact' | 'cookies';

export const PageSettingsDrawer: React.FC<PageSettingsDrawerProps> = ({
  isOpen,
  onClose,
  globalSettings,
  onUpdateGlobalSettings,
  seoSettings,
  onUpdateSeoSettings,
  onOpenGeoDrawer,
  pageTitle = 'עמוד',
  pageSections = [],
}) => {
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const { getCapability } = useHostCapabilities();
  const brandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;
  const aiAssistant = getCapability<AiTextAssistantContract>('ai-assistant');

  // Local state for editing - mirrors CRM Contact360Modal
  const [formDataGlobal, setFormDataGlobal] = useState<GlobalPageSettings>({ ...globalSettings });
  const [initialGlobalData, setInitialGlobalData] = useState<GlobalPageSettings>({ ...globalSettings });

  const [formDataSeo, setFormDataSeo] = useState<SeoSettings>({ ...seoSettings });
  const [initialSeoData, setInitialSeoData] = useState<SeoSettings>({ ...seoSettings });

  // Accordion state: by default ALL sections are closed as requested
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);

  // AI & Brand DNA states
  const [isAiGeneratingSeo, setIsAiGeneratingSeo] = useState(false);
  const [isBrandSynced, setIsBrandSynced] = useState(false);
  const [aiFallbackNotice, setAiFallbackNotice] = useState<string | null>(null);
  const [auditRecommendations, setAuditRecommendations] = useState<string[]>(seoSettings.googleAuditRecommendations || []);
  const [auditScore, setAuditScore] = useState<number | null>(seoSettings.googleAuditScore || null);

  // Dynamic Light / Dark mode sync from document element (default: dark)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark') || true;
    }
    return true;
  });

  useEffect(() => {
    setFormDataGlobal({ ...globalSettings });
    setInitialGlobalData({ ...globalSettings });
    setFormDataSeo({ ...seoSettings });
    setInitialSeoData({ ...seoSettings });
    setShowUnsavedConfirm(false);
  }, [globalSettings, seoSettings]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Check if user made unsaved changes
  const isDirty = useMemo(() => {
    return (
      JSON.stringify(formDataGlobal) !== JSON.stringify(initialGlobalData) ||
      JSON.stringify(formDataSeo) !== JSON.stringify(initialSeoData)
    );
  }, [formDataGlobal, initialGlobalData, formDataSeo, initialSeoData]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleSection = (section: SettingsAccordionSection) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleGlobalChange = <K extends keyof GlobalPageSettings>(key: K, value: GlobalPageSettings[K]) => {
    setFormDataGlobal((prev) => ({ ...prev, [key]: value }));
  };

  const handleSeoChange = <K extends keyof SeoSettings>(key: K, value: SeoSettings[K]) => {
    setFormDataSeo((prev) => ({ ...prev, [key]: value }));
  };

  // Save handler: triggers updates to parent and persists
  const handleSave = async () => {
    setIsSaving(true);
    try {
      onUpdateGlobalSettings(formDataGlobal);
      onUpdateSeoSettings(formDataSeo);
      setInitialGlobalData({ ...formDataGlobal });
      setInitialSeoData({ ...formDataSeo });

      // Bidirectional sync: sync back to Brand DNA if details were modified
      try {
        await syncBrandDnaFromLegalSettings(db, tenantId, {
          companyName: formDataGlobal.companyName,
          legalEntityId: formDataGlobal.legalEntityId,
          contactPhone: formDataGlobal.contactPhone,
          contactEmail: formDataGlobal.contactEmail,
          officeAddress: formDataGlobal.address,
          whatsappSupportNumber: formDataGlobal.contactWhatsApp,
          primaryColor: formDataGlobal.primaryColor,
          secondaryColor: formDataGlobal.secondaryColor,
        });
      } catch (syncErr) {
        console.warn('[PageSettingsDrawer] Two-way sync to Brand DNA warning:', syncErr);
      }

      showNotification('ההגדרות נשמרו וסונכרנו בהצלחה עם שפת המותג');
    } catch (e: any) {
      showNotification(e?.message || 'שגיאה בשמירת הגדרות העמוד');
    } finally {
      setIsSaving(false);
    }
  };

  // Safe Close with dirty check warning
  const handleRequestClose = () => {
    if (isDirty) {
      setShowUnsavedConfirm(true);
    } else {
      onClose();
    }
  };

  // Sync with Brand DNA
  const handleSyncBrandDna = () => {
    if (!brandDna) {
      showNotification('לא נמצאו נתוני מיתוג ב-Brand DNA');
      return;
    }

    const updatedGlobal: GlobalPageSettings = {
      ...formDataGlobal,
      companyName: brandDna.identity.companyName || formDataGlobal.companyName,
      legalEntityId: brandDna.trust?.legalEntityId || formDataGlobal.legalEntityId,
      siteTitle: `${brandDna.identity.companyName} | האתר הרשמי`,
      slogan: brandDna.identity.slogan || formDataGlobal.slogan,
      siteLogoUrl: brandDna.identity.logoUrl || formDataGlobal.siteLogoUrl,
      primaryColor: brandDna.designTokens.primaryColor || formDataGlobal.primaryColor,
      secondaryColor: brandDna.designTokens.secondaryColor || formDataGlobal.secondaryColor,
      backgroundColor: brandDna.designTokens.backgroundColor || formDataGlobal.backgroundColor,
      textColor: brandDna.designTokens.textColor || formDataGlobal.textColor,
      buttonBgColor: brandDna.designTokens.buttonBgColor || formDataGlobal.buttonBgColor,
      fontFamily: brandDna.designTokens.fontFamily || formDataGlobal.fontFamily,
      borderRadius: brandDna.designTokens.borderRadius || formDataGlobal.borderRadius,
      buttonStyle: brandDna.designTokens.buttonStyle || formDataGlobal.buttonStyle,
      contactPhone: brandDna.trust.contactPhone || formDataGlobal.contactPhone,
      contactEmail: brandDna.trust.contactEmail || formDataGlobal.contactEmail,
      address: brandDna.trust.officeAddress || formDataGlobal.address,
      contactWhatsApp: brandDna.trust.whatsappSupportNumber || formDataGlobal.contactWhatsApp,
      brandDnaSynced: true,
    };

    const updatedSeo: SeoSettings = {
      ...formDataSeo,
      title: formDataSeo.title || `${brandDna.identity.companyName} | ${brandDna.identity.slogan || 'האתר הרשמי'}`,
      description: formDataSeo.description || `${brandDna.identity.companyName} - ${brandDna.identity.slogan || ''}. שירות וליווי מקצועי.`,
      keywords: formDataSeo.keywords && formDataSeo.keywords.length > 0 ? formDataSeo.keywords : [brandDna.identity.companyName, 'שירות', 'קהילה'],
      faviconUrl: formDataSeo.faviconUrl || brandDna.identity.logoUrl,
      author: formDataSeo.author || brandDna.identity.companyName,
    };

    setFormDataGlobal(updatedGlobal);
    setFormDataSeo(updatedSeo);
    setIsBrandSynced(true);
    showNotification('המיתוג סונכרן מ-Brand DNA בהצלחה');
    setTimeout(() => setIsBrandSynced(false), 2500);
  };

  // Generate AI SEO
  const handleGenerateAiSeo = async () => {
    setIsAiGeneratingSeo(true);
    try {
      const response = await generateCompliantSeo({
        pageTitle: formDataGlobal.siteTitle || pageTitle,
        brandDna,
        pageSections,
        currentSeo: formDataSeo,
        aiAssistant,
      });

      const result = response.data;
      const updatedSeo: SeoSettings = {
        ...formDataSeo,
        title: result.title,
        description: result.description,
        keywords: result.keywords,
        author: result.author,
        ogType: result.ogType,
        twitterCard: result.twitterCard,
        googleAuditScore: result.googleAuditScore,
        googleAuditRecommendations: result.googleAuditRecommendations,
        faviconUrl: formDataSeo.faviconUrl || brandDna?.identity?.logoUrl || formDataGlobal.siteLogoUrl,
        aiKnowledgeSummary: result.aiKnowledgeSummary,
        aiTargetQuestions: result.aiTargetQuestions,
        aiEntitySchemaType: result.aiEntitySchemaType,
        aiBotIndexingEnabled: result.aiBotIndexingEnabled ?? true,
      };

      setFormDataSeo(updatedSeo);
      setAuditScore(result.googleAuditScore);
      setAuditRecommendations(result.googleAuditRecommendations);

      if (response.success && !response.isFallback) {
        setAiFallbackNotice(null);
        showNotification('נוצר מטא-מידע מותאם גוגל ו-AI בהצלחה');
      } else {
        const friendlyMsg = response.error || 'שירות הבינה המלאכותית אינו זמין כעת. נתוני ברירת המחדל הוגדרו עבורך ותוכל לערוך אותם ידנית.';
        setAiFallbackNotice(friendlyMsg);
        showNotification(friendlyMsg);
      }
    } catch (err: any) {
      console.warn('[PageSettingsDrawer] Failed generating Google SEO:', err);
      const friendlyMsg = 'שירות הבינה המלאכותית אינו זמין כעת. נתוני ברירת המחדל הוגדרו עבורך.';
      setAiFallbackNotice(friendlyMsg);
      showNotification(friendlyMsg);
    } finally {
      setIsAiGeneratingSeo(false);
    }
  };

  const displayName = formDataGlobal.siteTitle || formDataGlobal.companyName || pageTitle || 'דף ראשי';

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 transition-all duration-300 font-sans"
      dir="rtl"
    >
      {/* Modal Container: Adapts automatically to Light Mode or Dark Mode */}
      <div 
        className={`w-full max-w-[500px] max-h-[92vh] overflow-y-auto rounded-3xl sm:rounded-[2.5rem] p-3 sm:p-4 relative shadow-2xl flex flex-col no-scrollbar border transition-colors ${
          isDarkMode 
            ? 'bg-[#0a0a0a] border-white/10 text-white' 
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
        style={{ fontFamily: "'Heebo', sans-serif" }}
      >
        {/* 1. Header: Compact with Avatar Icon, Title, Brand DNA Sync, Save Icon and Close */}
        <div className={`flex items-center justify-between pb-2 mb-2 border-b shrink-0 ${
          isDarkMode ? 'border-white/10' : 'border-slate-100'
        }`}>
          {/* Right: Connected Two-Letter Avatar Icon (SO) + Title */}
          <div className="flex items-center gap-2 max-w-[65%]">
            <div 
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black shrink-0 shadow-sm border select-none ${
                isDarkMode 
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}
              title="SEO"
            >
              SO
            </div>

            <div className="truncate">
              <div className={`text-xs sm:text-sm font-black truncate leading-tight ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                הגדרות עמוד ו-SEO
              </div>
              <div className={`text-[10px] truncate leading-none mt-0.5 ${
                isDarkMode ? 'text-zinc-400' : 'text-slate-500'
              }`}>
                {displayName}
              </div>
            </div>
          </div>

          {/* Left: Quick Actions (Brand DNA, Save Icon in Header, Close) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Brand DNA Sync Quick Action */}
            <button
              type="button"
              onClick={handleSyncBrandDna}
              className={`p-1.5 rounded-full border transition hover:opacity-80 cursor-pointer ${
                isBrandSynced
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                  : isDarkMode
                    ? 'border-indigo-900 text-indigo-400 bg-indigo-950/30'
                    : 'border-indigo-200 text-indigo-600 bg-indigo-50/50'
              }`}
              title="סנכרן מ-Brand DNA"
            >
              {isBrandSynced ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            </button>

            {/* Save Button as Icon in Header */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`p-1.5 rounded-full transition shadow-sm cursor-pointer disabled:opacity-50 ${
                isDirty
                  ? 'bg-amber-500 hover:bg-amber-400 text-black ring-2 ring-amber-400/50 animate-pulse'
                  : isDarkMode
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title={isDirty ? "שמור שינויים שלא נשמרו" : "שמור"}
            >
              <Save className="w-3.5 h-3.5" />
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
          <div className="mb-2.5 p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-xs space-y-2 animate-fadeIn shrink-0">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>ישנם שינויים שלא נשמרו</span>
            </div>
            <div className="flex items-center justify-end gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedConfirm(false);
                  onClose();
                }}
                className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white/5 hover:bg-white/10 text-zinc-300 cursor-pointer"
              >
                סגור ללא שמירה
              </button>
              <button
                type="button"
                onClick={async () => {
                  await handleSave();
                  setShowUnsavedConfirm(false);
                  onClose();
                }}
                className="px-3 py-1 rounded-xl text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-md cursor-pointer"
              >
                שמור וסגור
              </button>
            </div>
          </div>
        )}

        {/* 3. Toast Message */}
        {toastMessage && (
          <div className="mb-2 p-1.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 text-xs text-center font-bold animate-fadeIn shrink-0">
            {toastMessage}
          </div>
        )}

        {/* 4. Accordion Sections - Closed by default as per specification */}
        <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar">

          {/* 1. פרטי עמוד וארגון (General) */}
          <div className={`w-full flex flex-col rounded-2xl border overflow-hidden transition-all ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <button
              type="button"
              onClick={() => toggleSection('general')}
              className={`w-full h-10 px-3 flex items-center justify-between font-bold text-xs cursor-pointer transition-all ${
                isDarkMode ? 'text-white hover:bg-[#1a1a1a]' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5 text-amber-400' : 'bg-white text-indigo-600 shadow-sm'
                }`}>
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <span>פרטי עמוד וארגון</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openSections['general'] ? 'rotate-180' : ''}`} />
            </button>

            {openSections['general'] && (
              <div className={`p-3 border-t space-y-2 text-xs animate-fadeIn ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}>
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-amber-500 block">שם האתר / ארגון</label>
                  <input
                    type="text"
                    value={formDataGlobal.siteTitle || ''}
                    onChange={(e) => handleGlobalChange('siteTitle', e.target.value)}
                    placeholder="למשל: מרכז קהילתי אופק"
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500' : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-bold text-amber-500 block">שם החברה</label>
                    <input
                      type="text"
                      value={formDataGlobal.companyName || ''}
                      onChange={(e) => handleGlobalChange('companyName', e.target.value)}
                      placeholder="עמותת אופק"
                      className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                        isDarkMode ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500' : 'bg-white border-amber-500/60 text-slate-900'
                      }`}
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-bold text-amber-500 block">סלוגן / מוטו</label>
                    <input
                      type="text"
                      value={formDataGlobal.slogan || ''}
                      onChange={(e) => handleGlobalChange('slogan', e.target.value)}
                      placeholder="מחברים לבבות"
                      className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                        isDarkMode ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500' : 'bg-white border-amber-500/60 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-0.5 pt-1">
                  <PageBuilderImageUpload
                    label="לוגו האתר (URL / העלאה)"
                    value={formDataGlobal.siteLogoUrl}
                    onChange={(url) => handleGlobalChange('siteLogoUrl', url)}
                  />
                </div>

                {/* Header Layout Options */}
                <div className="space-y-1 pt-1">
                  <label className="text-[10px] font-bold text-amber-500 block">פריסת אזור ההדר (Header Layout)</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'capsule-floating', label: 'קפסולה צפה (KosTogether)', desc: 'כפתור צף ומגירה' },
                      { id: 'floating-glass', label: 'זכוכית צפה (Floating Glass)', desc: 'מעוגל ומרחף' },
                      { id: 'classic', label: 'קלאסי מלא (Classic)', desc: 'לוגו בצד ופעולות' },
                      { id: 'centered', label: 'מרכוז מלא (Centered)', desc: 'לוגו במרכז' },
                      { id: 'minimal', label: 'מינימליסטי (Minimal)', desc: 'קומפקטי ונקי' },
                      { id: 'transparent', label: 'שקוף מעל הירו (Transparent)', desc: 'משתלב ברקע' },
                    ].map((layout) => {
                      const activeHeaderLayout = (!formDataGlobal.headerLayout || formDataGlobal.headerLayout === 'floating-glass') 
                        ? 'capsule-floating' 
                        : formDataGlobal.headerLayout;
                      const isSelected = activeHeaderLayout === layout.id;
                      return (
                        <button
                          key={layout.id}
                          type="button"
                          onClick={() => handleGlobalChange('headerLayout', layout.id as any)}
                          className={`p-2 rounded-xl border text-right transition-all flex flex-col gap-0.5 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                              : isDarkMode
                                ? 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'
                                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span className="text-[11px] font-bold leading-tight">{layout.label}</span>
                          <span className="text-[9px] opacity-75">{layout.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-1.5 pt-1">
                  <div className={`flex items-center justify-between p-2 rounded-xl border ${
                    isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-xs font-medium">הצג תפריט עליון (Header)</span>
                    <input
                      type="checkbox"
                      checked={formDataGlobal.isHeaderVisible ?? true}
                      onChange={(e) => handleGlobalChange('isHeaderVisible', e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 bg-transparent border-amber-500/60 cursor-pointer"
                    />
                  </div>

                  <div className={`flex items-center justify-between p-2 rounded-xl border ${
                    isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-xs font-medium">תפריט עליון דביק ומרחף (Sticky)</span>
                    <input
                      type="checkbox"
                      checked={formDataGlobal.headerSticky ?? true}
                      onChange={(e) => handleGlobalChange('headerSticky', e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 bg-transparent border-amber-500/60 cursor-pointer"
                    />
                  </div>

                  <div className={`flex items-center justify-between p-2 rounded-xl border ${
                    isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-xs font-medium">הצג פוטר תחתון (Footer)</span>
                    <input
                      type="checkbox"
                      checked={formDataGlobal.isFooterVisible ?? true}
                      onChange={(e) => handleGlobalChange('isFooterVisible', e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 bg-transparent border-amber-500/60 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. נראות, צבעים וגופנים (Design) */}
          <div className={`w-full flex flex-col rounded-2xl border overflow-hidden transition-all ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <button
              type="button"
              onClick={() => toggleSection('design')}
              className={`w-full h-10 px-3 flex items-center justify-between font-bold text-xs cursor-pointer transition-all ${
                isDarkMode ? 'text-white hover:bg-[#1a1a1a]' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5 text-amber-400' : 'bg-white text-indigo-600 shadow-sm'
                }`}>
                  <Palette className="w-3.5 h-3.5" />
                </div>
                <span>נראות, צבעים וגופנים</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openSections['design'] ? 'rotate-180' : ''}`} />
            </button>

            {openSections['design'] && (
              <div className={`p-3 border-t space-y-2 text-xs animate-fadeIn ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}>
                {/* Theme Presets */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-amber-500 block">ערכת נושא מוכנה (Preset)</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'modern', label: 'Modern Dark', bg: '#0a0a0c', p: '#6366f1' },
                      { id: 'cyber-neon', label: 'Cyber Neon', bg: '#050814', p: '#06b6d4' },
                      { id: 'emerald', label: 'Emerald Trust', bg: '#061a14', p: '#10b981' },
                      { id: 'light-minimal', label: 'Light Minimal', bg: '#f8fafc', p: '#4f46e5' },
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setFormDataGlobal((prev) => ({
                            ...prev,
                            theme: preset.id as any,
                            backgroundColor: preset.bg,
                            primaryColor: preset.p,
                          }));
                        }}
                        className={`p-2 rounded-xl border text-right flex items-center justify-between text-xs transition cursor-pointer ${
                          formDataGlobal.theme === preset.id
                            ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                            : isDarkMode
                              ? 'bg-white/5 border-white/5 text-zinc-300 hover:text-white'
                              : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="text-[11px] font-bold">{preset.label}</span>
                        <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: preset.p }} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Selector */}
                <div className="space-y-0.5 pt-1">
                  <label className="text-[10px] font-bold text-amber-500 block">גופן האתר (Font Family)</label>
                  <select
                    value={formDataGlobal.fontFamily || 'Heebo, sans-serif'}
                    onChange={(e) => handleGlobalChange('fontFamily', e.target.value)}
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode ? 'bg-[#161616] border-amber-500/60 text-white' : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  >
                    <option value="Heebo, sans-serif">Heebo (היבו - מודרני ונקי - ברירת מחדל)</option>
                    <option value="Assistant, sans-serif">Assistant (אסיסטנט - עדין ואלגנטי)</option>
                    <option value="Rubik, sans-serif">Rubik (רוביק - יוקרתי ועגול)</option>
                    <option value="Alef, sans-serif">Alef (אלף - מסורתי ורשמי)</option>
                    <option value="'Varela Round', sans-serif">Varela Round (ורלה עגול)</option>
                  </select>
                </div>

                {/* Color Pickers */}
                <div className="space-y-2 pt-1">
                  <PageBuilderColorPicker
                    label="צבע ראשי (Primary Color)"
                    value={formDataGlobal.primaryColor || '#6366f1'}
                    onChange={(c) => handleGlobalChange('primaryColor', c)}
                  />
                  <PageBuilderColorPicker
                    label="צבע משני (Secondary Color)"
                    value={formDataGlobal.secondaryColor || '#0ea5e9'}
                    onChange={(c) => handleGlobalChange('secondaryColor', c)}
                  />
                  <PageBuilderColorPicker
                    label="צבע רקע כללי לדף"
                    value={formDataGlobal.backgroundColor || '#0a0a0c'}
                    onChange={(c) => handleGlobalChange('backgroundColor', c)}
                  />
                  <PageBuilderColorPicker
                    label="צבע טקסט ראשי"
                    value={formDataGlobal.textColor || '#f8fafc'}
                    onChange={(c) => handleGlobalChange('textColor', c)}
                  />
                  <PageBuilderColorPicker
                    label="צבע רקע לכפתורים"
                    value={formDataGlobal.buttonBgColor || '#6366f1'}
                    onChange={(c) => handleGlobalChange('buttonBgColor', c)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. קידום, SEO ומנועי AI (SEO) */}
          <div className={`w-full flex flex-col rounded-2xl border overflow-hidden transition-all ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <button
              type="button"
              onClick={() => toggleSection('seo')}
              className={`w-full h-10 px-3 flex items-center justify-between font-bold text-xs cursor-pointer transition-all ${
                isDarkMode ? 'text-white hover:bg-[#1a1a1a]' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5 text-amber-400' : 'bg-white text-indigo-600 shadow-sm'
                }`}>
                  <Search className="w-3.5 h-3.5" />
                </div>
                <span>קידום, SEO ומנועי AI</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openSections['seo'] ? 'rotate-180' : ''}`} />
            </button>

            {openSections['seo'] && (
              <div className={`p-3 border-t space-y-2 text-xs animate-fadeIn ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}>
                {/* AI Generator Compact Banner */}
                <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                  isDarkMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>מחולל SEO ו-Meta מותאם AI</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateAiSeo}
                    disabled={isAiGeneratingSeo}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold shadow transition cursor-pointer disabled:opacity-50"
                  >
                    {isAiGeneratingSeo ? 'מייצר...' : 'צור אוטומטית'}
                  </button>
                </div>

                {/* Friendly AI Fallback Notification Banner */}
                {aiFallbackNotice && (
                  <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2 animate-fadeIn">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <span className="font-bold block text-amber-400">הודעת מערכת:</span>
                      <span className="text-[11px] text-zinc-300 leading-tight block">{aiFallbackNotice}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setAiFallbackNotice(null)} 
                      className="text-zinc-400 hover:text-white p-0.5 rounded cursor-pointer"
                      title="סגור הודעה"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Audit Score Card if available */}
                {auditScore !== null && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-white flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        ציון גוגל E-E-A-T:
                      </span>
                      <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {auditScore}/100
                      </span>
                    </div>
                    {auditRecommendations.length > 0 && (
                      <div className="space-y-1 pt-0.5">
                        {auditRecommendations.map((rec, idx) => (
                          <div key={idx} className="flex items-start gap-1 text-[10px] text-zinc-300 leading-tight">
                            <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Favicon */}
                <div className="space-y-0.5">
                  <PageBuilderImageUpload
                    label="אייקון כרטיסיית דפדפן (Favicon)"
                    value={formDataSeo.faviconUrl || brandDna?.identity?.logoUrl || formDataGlobal.siteLogoUrl}
                    onChange={(url) => handleSeoChange('faviconUrl', url)}
                  />
                </div>

                {/* Meta Title */}
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-amber-500 block">כותרת SEO (Meta Title)</label>
                  <input
                    type="text"
                    value={formDataSeo.title || ''}
                    onChange={(e) => handleSeoChange('title', e.target.value)}
                    placeholder="כותרת שתופיע בגוגל (50-60 תווים)"
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500' : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  />
                </div>

                {/* Meta Description */}
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-amber-500 block">תיאור מטא (Meta Description)</label>
                  <textarea
                    rows={2}
                    value={formDataSeo.description || ''}
                    onChange={(e) => handleSeoChange('description', e.target.value)}
                    placeholder="תיאור קצר ומזמין של הדף..."
                    className={`w-full border rounded-xl p-2 text-xs font-normal focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none ${
                      isDarkMode ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500' : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  />
                </div>

                {/* Keywords */}
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-amber-500 block">מילות מפתח (מופרדות בפסיקים)</label>
                  <input
                    type="text"
                    value={(formDataSeo.keywords || []).join(', ')}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleSeoChange(
                        'keywords',
                        val.split(',').map((k) => k.trim()).filter(Boolean)
                      );
                    }}
                    placeholder="קהילה, שירות, נכס, קושאן..."
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500' : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  />
                </div>

                {/* OG Image */}
                <div className="space-y-0.5">
                  <PageBuilderImageUpload
                    label="תמונת שיתוף ברשתות (OG Image - קובץ JPG בלבד עד 100KB)"
                    value={formDataSeo.ogImage}
                    onChange={(url) => handleSeoChange('ogImage', url)}
                    allowedMimeTypes={['image/jpeg', 'image/jpg']}
                    maxSizeBytes={100 * 1024}
                  />
                </div>

                {/* Generative Engine Optimization (GEO / AIO) Accordion sub-block */}
                <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2 mt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      קידום במנועי AI (ChatGPT, Perplexity, Gemini)
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      AIO 2026
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[10px] font-bold text-amber-500 block">תמצית ידע מותאמת ל-AI</label>
                    <textarea
                      rows={2}
                      value={formDataSeo.aiKnowledgeSummary || ''}
                      onChange={(e) => handleSeoChange('aiKnowledgeSummary', e.target.value)}
                      placeholder="הסבר תמציתי ומדויק שבוטי AI יצטטו..."
                      className={`w-full border rounded-xl p-2 text-xs font-normal focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none ${
                        isDarkMode ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500' : 'bg-white border-amber-500/60 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[10px] font-bold text-amber-500 block">שאלות מפתח (שאלה בכל שורה)</label>
                    <textarea
                      rows={2}
                      value={(formDataSeo.aiTargetQuestions || []).join('\n')}
                      onChange={(e) =>
                        handleSeoChange(
                          'aiTargetQuestions',
                          e.target.value.split('\n').map((q) => q.trim()).filter(Boolean)
                        )
                      }
                      placeholder="מה זה השירות?&#10;איך מצטרפים?"
                      className={`w-full border rounded-xl p-2 text-xs font-normal focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none ${
                        isDarkMode ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500' : 'bg-white border-amber-500/60 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-amber-500 block">סוג ישות סכמה</label>
                      <select
                        value={formDataSeo.aiEntitySchemaType || 'ProfessionalService'}
                        onChange={(e) => handleSeoChange('aiEntitySchemaType', e.target.value as any)}
                        className={`w-full border rounded-xl px-2 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                          isDarkMode ? 'bg-[#161616] border-amber-500/60 text-white' : 'bg-white border-amber-500/60 text-slate-900'
                        }`}
                      >
                        <option value="ProfessionalService">שירות מקצועי / עסק</option>
                        <option value="Organization">ארגון / עמותה / חברה</option>
                        <option value="Product">מוצר / שירות ספציפי</option>
                        <option value="FAQPage">דף שאלות ותשובות</option>
                        <option value="Article">מאמר תוכן</option>
                      </select>
                    </div>

                    <div className="flex flex-col justify-end">
                      <button
                        type="button"
                        onClick={() => handleSeoChange('aiBotIndexingEnabled', formDataSeo.aiBotIndexingEnabled !== false ? false : true)}
                        className={`w-full p-1.5 rounded-xl border text-right flex items-center justify-between text-[11px] transition cursor-pointer ${
                          formDataSeo.aiBotIndexingEnabled !== false
                            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                            : isDarkMode
                              ? 'bg-white/5 border-white/5 text-zinc-400'
                              : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="font-bold truncate">אינדוקס בוטים</span>
                        <div
                          className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                            formDataSeo.aiBotIndexingEnabled !== false
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'border-zinc-600 bg-zinc-800'
                          }`}
                        >
                          {formDataSeo.aiBotIndexingEnabled !== false && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. אנליטיקס ומעקב תנועה (Analytics) */}
          <div className={`w-full flex flex-col rounded-2xl border overflow-hidden transition-all ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <button
              type="button"
              onClick={() => toggleSection('analytics')}
              className={`w-full h-10 px-3 flex items-center justify-between font-bold text-xs cursor-pointer transition-all ${
                isDarkMode ? 'text-white hover:bg-[#1a1a1a]' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5 text-amber-400' : 'bg-white text-indigo-600 shadow-sm'
                }`}>
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <span>אנליטיקס ומעקב תנועה</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openSections['analytics'] ? 'rotate-180' : ''}`} />
            </button>

            {openSections['analytics'] && (
              <div className={`p-3 border-t space-y-2 text-xs animate-fadeIn ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}>
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between pb-0.5">
                    <label className="text-[10px] font-bold text-amber-500 block">מזהה Google Analytics 4 (GA4)</label>
                    {formDataGlobal.googleAnalyticsId ? (
                      <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
                        פעיל
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded-md bg-white/5 text-zinc-400 text-[9px]">
                        טרם הוגדר
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formDataGlobal.googleAnalyticsId || ''}
                    onChange={(e) => handleGlobalChange('googleAnalyticsId', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    dir="ltr"
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500' : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  />
                  <p className="text-[10px] text-zinc-400 pt-0.5 leading-tight">
                    הזן מזהה מדידה המתחיל ב-<strong>G-</strong>. תגית המעקב תופעל אוטומטית בדף הציבורי.
                  </p>
                </div>

                {/* Tenant Isolation Info */}
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1 mt-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
                    <Activity className="w-3.5 h-3.5" />
                    <span>אחסון טלמטריה תחת ה-Tenant</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-tight">
                    כל נתוני הגולשים, הצפיות והאינטראקציות נשמרים מבודדים במסד הנתונים של ה-Tenant שלכם.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 5. פרטי יצירת קשר ו-GEO (Contact) */}
          <div className={`w-full flex flex-col rounded-2xl border overflow-hidden transition-all ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <button
              type="button"
              onClick={() => toggleSection('contact')}
              className={`w-full h-10 px-3 flex items-center justify-between font-bold text-xs cursor-pointer transition-all ${
                isDarkMode ? 'text-white hover:bg-[#1a1a1a]' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5 text-amber-400' : 'bg-white text-indigo-600 shadow-sm'
                }`}>
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <span>פרטי יצירת קשר ו-GEO</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openSections['contact'] ? 'rotate-180' : ''}`} />
            </button>

            {openSections['contact'] && (
              <div className={`p-3 border-t space-y-2 text-xs animate-fadeIn ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}>
                {/* GEO SEO Quick Link */}
                {onOpenGeoDrawer && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-bold">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>קידום מקומי מתקדם (GEO SEO)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenGeoDrawer();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow transition cursor-pointer"
                    >
                      פתח GEO
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-bold text-amber-500 block">וואטסאפ ראשי</label>
                    <input
                      type="text"
                      value={formDataGlobal.contactWhatsApp || ''}
                      onChange={(e) => handleGlobalChange('contactWhatsApp', e.target.value)}
                      placeholder="052-6968008"
                      dir="ltr"
                      className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                        isDarkMode ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500' : 'bg-white border-amber-500/60 text-slate-900'
                      }`}
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-bold text-amber-500 block">טלפון ליצירת קשר</label>
                    <input
                      type="text"
                      value={formDataGlobal.contactPhone || ''}
                      onChange={(e) => handleGlobalChange('contactPhone', e.target.value)}
                      placeholder="03-1234567"
                      dir="ltr"
                      className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                        isDarkMode ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500' : 'bg-white border-amber-500/60 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-amber-500 block">אימייל ארגון</label>
                  <input
                    type="email"
                    value={formDataGlobal.contactEmail || ''}
                    onChange={(e) => handleGlobalChange('contactEmail', e.target.value)}
                    placeholder="info@example.com"
                    dir="ltr"
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500' : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-amber-500 block">כתובת פיזית</label>
                  <input
                    type="text"
                    value={formDataGlobal.address || ''}
                    onChange={(e) => handleGlobalChange('address', e.target.value)}
                    placeholder="רוטשילד 22, תל אביב"
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500' : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-amber-500 block">מספר תאגיד / ח.פ / ע.מ (לצרכים משפטיים)</label>
                  <input
                    type="text"
                    value={formDataGlobal.legalEntityId || ''}
                    onChange={(e) => handleGlobalChange('legalEntityId', e.target.value)}
                    placeholder="512345678"
                    dir="ltr"
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500' : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION: Cookies & Privacy Consent Modal */}
          <div className={`border rounded-2xl overflow-hidden transition-all ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200/80 bg-slate-50'
          }`}>
            <button
              type="button"
              onClick={() => toggleSection('cookies')}
              className={`w-full h-10 px-3 flex items-center justify-between font-bold text-xs cursor-pointer transition-all ${
                isDarkMode ? 'text-white hover:bg-[#1a1a1a]' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5 text-indigo-400' : 'bg-white text-indigo-600 shadow-sm'
                }`}>
                  <Cookie className="w-3.5 h-3.5" />
                </div>
                <span>אישור עוגיות (Cookie Consent) ומדיניות פרטיות</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openSections['cookies'] ? 'rotate-180' : ''}`} />
            </button>

            {openSections['cookies'] && (
              <div className={`p-3 border-t space-y-3 text-xs animate-fadeIn ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}>
                {/* Active switch */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white block">באנר / מודאל עוגיות לאורחים</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">הצגת הודעת אישור עוגיות ועמידה בדרישות החוק למבקרים חדשים</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formDataGlobal.cookieConsent?.enabled !== false}
                      onChange={(e) => {
                        handleGlobalChange('cookieConsent', {
                          ...(formDataGlobal.cookieConsent || {}),
                          enabled: e.target.checked,
                        });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {formDataGlobal.cookieConsent?.enabled !== false && (
                  <>
                    {/* Position selector */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 block">מיקום ומבנה התצוגה</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'bottom-banner', label: 'פס תחתון רוחבי' },
                          { id: 'floating-box', label: 'חלונית צפה בפינה' },
                          { id: 'center-modal', label: 'מודאל מרכזי' },
                        ].map((pos) => {
                          const isSelected = (formDataGlobal.cookieConsent?.position || 'bottom-banner') === pos.id;
                          return (
                            <button
                              key={pos.id}
                              type="button"
                              onClick={() => {
                                handleGlobalChange('cookieConsent', {
                                  ...(formDataGlobal.cookieConsent || {}),
                                  position: pos.id as any,
                                });
                              }}
                              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition cursor-pointer text-center ${
                                isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                                  : isDarkMode
                                  ? 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {pos.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-slate-400 block">כותרת ההודעה</label>
                      <input
                        type="text"
                        value={formDataGlobal.cookieConsent?.title || ''}
                        onChange={(e) => {
                          handleGlobalChange('cookieConsent', {
                            ...(formDataGlobal.cookieConsent || {}),
                            title: e.target.value,
                          });
                        }}
                        placeholder="הודעת פרטיות ושימוש בקובצי עוגיות (Cookies)"
                        className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                          isDarkMode ? 'bg-transparent border-white/10 text-white placeholder-zinc-500' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    {/* Message text */}
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-slate-400 block">תוכן ההסבר</label>
                      <textarea
                        rows={3}
                        value={formDataGlobal.cookieConsent?.message || ''}
                        onChange={(e) => {
                          handleGlobalChange('cookieConsent', {
                            ...(formDataGlobal.cookieConsent || {}),
                            message: e.target.value,
                          });
                        }}
                        placeholder="הסבר על השימוש בעוגיות לצורך תפעול תקין, אבטחה ושיפור חוויית הגלישה..."
                        className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-normal leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                          isDarkMode ? 'bg-transparent border-white/10 text-white placeholder-zinc-500' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    {/* Buttons text */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-bold text-slate-400 block">טקסט כפתור אישור</label>
                        <input
                          type="text"
                          value={formDataGlobal.cookieConsent?.acceptButtonText || ''}
                          onChange={(e) => {
                            handleGlobalChange('cookieConsent', {
                              ...(formDataGlobal.cookieConsent || {}),
                              acceptButtonText: e.target.value,
                            });
                          }}
                          placeholder="מאשר/ת וממשיך/ה"
                          className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                            isDarkMode ? 'bg-transparent border-white/10 text-white placeholder-zinc-500' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-bold text-slate-400 block">טקסט כפתור דחייה / הכרחיות</label>
                        <input
                          type="text"
                          value={formDataGlobal.cookieConsent?.declineButtonText || ''}
                          onChange={(e) => {
                            handleGlobalChange('cookieConsent', {
                              ...(formDataGlobal.cookieConsent || {}),
                              declineButtonText: e.target.value,
                            });
                          }}
                          placeholder="רק הכרחיות"
                          className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                            isDarkMode ? 'bg-transparent border-white/10 text-white placeholder-zinc-500' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Links */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-bold text-slate-400 block">קישור למדיניות פרטיות</label>
                        <input
                          type="text"
                          value={formDataGlobal.cookieConsent?.privacyPolicyUrl || ''}
                          onChange={(e) => {
                            handleGlobalChange('cookieConsent', {
                              ...(formDataGlobal.cookieConsent || {}),
                              privacyPolicyUrl: e.target.value,
                            });
                          }}
                          placeholder="/privacy"
                          dir="ltr"
                          className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                            isDarkMode ? 'bg-transparent border-white/10 text-white placeholder-zinc-500' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-bold text-slate-400 block">קישור לתנאי שימוש</label>
                        <input
                          type="text"
                          value={formDataGlobal.cookieConsent?.termsUrl || ''}
                          onChange={(e) => {
                            handleGlobalChange('cookieConsent', {
                              ...(formDataGlobal.cookieConsent || {}),
                              termsUrl: e.target.value,
                            });
                          }}
                          placeholder="/terms"
                          dir="ltr"
                          className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                            isDarkMode ? 'bg-transparent border-white/10 text-white placeholder-zinc-500' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Interactive Live Preview Box */}
                    <div className="pt-2 border-t border-dashed border-slate-200 dark:border-white/10">
                      <span className="text-[10px] font-bold text-indigo-400 mb-1.5 block">
                        תצוגה מקדימה חיה של המודאל:
                      </span>
                      <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-2 bg-slate-900/40 overflow-hidden">
                        <CookieConsentBanner
                          settings={formDataGlobal.cookieConsent}
                          brandDna={brandDna}
                          previewMode={true}
                        />
                      </div>
                    </div>

                    {/* Testing Action Button */}
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">רוצה לבדוק שוב את הבאנר כאורח חדש?</span>
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            localStorage.removeItem(`kosun_cookie_consent_${tenantId}`);
                            showNotification('בחירת העוגיות אופסה בדפדפן לבדיקה מחדש');
                          } catch {}
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white text-[11px] font-bold transition cursor-pointer"
                      >
                        אפס בחירה בדפדפן
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

        </div>

        {/* 5. Footer: Compact Bottom Actions */}
        <div className={`flex items-center justify-between pt-2.5 mt-2.5 border-t shrink-0 ${
          isDarkMode ? 'border-white/10' : 'border-slate-100'
        }`}>
          <div className="text-[11px] font-medium text-zinc-400">
            {isDirty ? (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                שינויים ממתינים לשמירה
              </span>
            ) : (
              <span className="text-zinc-500">כל השינויים מעודכנים</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRequestClose}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                isDarkMode 
                  ? 'bg-white/5 hover:bg-white/10 text-zinc-300' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              סגור
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50 ${
                isDirty
                  ? 'bg-amber-500 hover:bg-amber-400 text-black ring-2 ring-amber-400/50'
                  : isDarkMode
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'שומר...' : 'שמור'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
