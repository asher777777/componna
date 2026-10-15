import React, { useState } from 'react';
import { GlobalPageSettings, SeoSettings } from '../types/pageBuilder.types';
import { PageBuilderInput, PageBuilderTextarea } from '../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../ui/PageBuilderImageUpload';
import { PageBuilderButton } from '../ui/PageBuilderButton';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../core/contracts';
import { X, Settings2, Palette, Globe, Sparkles, Layout, Phone, MapPin, CheckCircle2, ShieldCheck, Check, AlertCircle, BarChart3, Activity } from 'lucide-react';
import { clsx } from 'clsx';
import { generateGoogleCompliantSeo } from '../services/aiGoogleSeoService';

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
  const { getCapability } = useHostCapabilities();
  const brandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;

  const [activeTab, setActiveTab] = useState<'general' | 'design' | 'seo' | 'analytics' | 'contact'>('general');
  const [isAiGeneratingSeo, setIsAiGeneratingSeo] = useState(false);
  const [isBrandSynced, setIsBrandSynced] = useState(false);
  const [auditRecommendations, setAuditRecommendations] = useState<string[]>(seoSettings.googleAuditRecommendations || []);
  const [auditScore, setAuditScore] = useState<number | null>(seoSettings.googleAuditScore || null);

  if (!isOpen) return null;

  const updateGlobal = <K extends keyof GlobalPageSettings>(key: K, value: GlobalPageSettings[K]) => {
    onUpdateGlobalSettings({ ...globalSettings, [key]: value });
  };

  const updateSeo = <K extends keyof SeoSettings>(key: K, value: SeoSettings[K]) => {
    onUpdateSeoSettings({ ...seoSettings, [key]: value });
  };

  // One-click Brand DNA Synchronization (Default values from Brand DNA without overwriting Brand collection)
  const handleSyncBrandDna = () => {
    if (!brandDna) return;
    onUpdateGlobalSettings({
      ...globalSettings,
      companyName: brandDna.identity.companyName || globalSettings.companyName,
      siteTitle: `${brandDna.identity.companyName} | האתר הרשמי`,
      slogan: brandDna.identity.slogan || globalSettings.slogan,
      siteLogoUrl: brandDna.identity.logoUrl || globalSettings.siteLogoUrl,
      primaryColor: brandDna.designTokens.primaryColor || globalSettings.primaryColor,
      secondaryColor: brandDna.designTokens.secondaryColor || globalSettings.secondaryColor,
      backgroundColor: brandDna.designTokens.backgroundColor || globalSettings.backgroundColor,
      textColor: brandDna.designTokens.textColor || globalSettings.textColor,
      buttonBgColor: brandDna.designTokens.buttonBgColor || globalSettings.buttonBgColor,
      fontFamily: brandDna.designTokens.fontFamily || globalSettings.fontFamily,
      borderRadius: brandDna.designTokens.borderRadius || globalSettings.borderRadius,
      buttonStyle: brandDna.designTokens.buttonStyle || globalSettings.buttonStyle,
      contactPhone: brandDna.trust.contactPhone || globalSettings.contactPhone,
      contactEmail: brandDna.trust.contactEmail || globalSettings.contactEmail,
      address: brandDna.trust.officeAddress || globalSettings.address,
      contactWhatsApp: brandDna.trust.whatsappSupportNumber || globalSettings.contactWhatsApp,
      brandDnaSynced: true,
    });

    // Populate SEO defaults from Brand DNA if not explicitly customized
    onUpdateSeoSettings({
      ...seoSettings,
      title: seoSettings.title || `${brandDna.identity.companyName} | ${brandDna.identity.slogan || 'האתר הרשמי'}`,
      description: seoSettings.description || `${brandDna.identity.companyName} - ${brandDna.identity.slogan || ''}. שירות וליווי מקצועי.`,
      keywords: seoSettings.keywords && seoSettings.keywords.length > 0 ? seoSettings.keywords : [brandDna.identity.companyName, 'שירות', 'קהילה'],
      faviconUrl: seoSettings.faviconUrl || brandDna.identity.logoUrl,
      author: seoSettings.author || brandDna.identity.companyName,
    });

    setIsBrandSynced(true);
    setTimeout(() => setIsBrandSynced(false), 2500);
  };

  const handleGenerateAiSeo = async () => {
    setIsAiGeneratingSeo(true);
    try {
      const result = await generateGoogleCompliantSeo({
        pageTitle: globalSettings.siteTitle || pageTitle,
        brandDna,
        pageSections,
        currentSeo: seoSettings,
      });

      onUpdateSeoSettings({
        ...seoSettings,
        title: result.title,
        description: result.description,
        keywords: result.keywords,
        author: result.author,
        ogType: result.ogType,
        twitterCard: result.twitterCard,
        googleAuditScore: result.googleAuditScore,
        googleAuditRecommendations: result.googleAuditRecommendations,
        faviconUrl: seoSettings.faviconUrl || brandDna?.identity?.logoUrl || globalSettings.siteLogoUrl,
        aiKnowledgeSummary: result.aiKnowledgeSummary,
        aiTargetQuestions: result.aiTargetQuestions,
        aiEntitySchemaType: result.aiEntitySchemaType,
        aiBotIndexingEnabled: result.aiBotIndexingEnabled ?? true,
      });

      setAuditScore(result.googleAuditScore);
      setAuditRecommendations(result.googleAuditRecommendations);
    } catch (err) {
      console.warn('[PageSettingsDrawer] Failed generating Google SEO:', err);
    } finally {
      setIsAiGeneratingSeo(false);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen z-50 bg-[#090a0f]/98 backdrop-blur-2xl flex flex-col overflow-hidden animate-in fade-in duration-200" dir="rtl">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80 backdrop-blur shrink-0">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">הגדרות עמוד, קידום ו-SEO</h3>
              <p className="text-xs text-slate-400">קידום במנועי AI, דירוג גוגל E-E-A-T, אנליטיקס ומיתוג</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="סגירה"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col p-4 sm:p-8 gap-6">
          {/* Brand DNA Sync Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-500/30 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-indigo-200">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                סנכרון מיתוג מ-<strong>Brand DNA Hub</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={handleSyncBrandDna}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shrink-0"
            >
              {isBrandSynced ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{isBrandSynced ? 'סונכרן בהצלחה!' : 'סנכרן עכשיו'}</span>
            </button>
          </div>

          {/* Tab Switcher */}
        <div className="grid grid-cols-5 p-2 bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={clsx(
              'py-2 rounded-xl transition-all text-center',
              activeTab === 'general' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            )}
          >
            כללי
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('design')}
            className={clsx(
              'py-2 rounded-xl transition-all text-center',
              activeTab === 'design' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            )}
          >
            צבעים
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={clsx(
              'py-2 rounded-xl transition-all text-center',
              activeTab === 'seo' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            )}
          >
            SEO ו-AI
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={clsx(
              'py-2 rounded-xl transition-all text-center',
              activeTab === 'analytics' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            )}
          >
            אנליטיקס
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={clsx(
              'py-2 rounded-xl transition-all text-center',
              activeTab === 'contact' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            )}
          >
            קשר ו-GEO
          </button>
        </div>

        {/* Body Content */}
        <div className="flex flex-col gap-6 text-right">
          {activeTab === 'general' && (
            <div className="flex flex-col gap-4">
              <PageBuilderInput
                label="שם האתר / ארגון"
                value={globalSettings.siteTitle || ''}
                onChange={(val) => updateGlobal('siteTitle', val)}
                placeholder="למשל: מרכז קהילתי אופק"
              />
              <PageBuilderInput
                label="שם החברה"
                value={globalSettings.companyName || ''}
                onChange={(val) => updateGlobal('companyName', val)}
                placeholder="למשל: עמותת אופק לפיתוח קהילתי"
              />
              <PageBuilderInput
                label="סלוגן / מוטו"
                value={globalSettings.slogan || ''}
                onChange={(val) => updateGlobal('slogan', val)}
                placeholder="למשל: מחברים לבבות, בונים עתיד"
              />
              <PageBuilderImageUpload
                label="לוגו האתר (URL)"
                value={globalSettings.siteLogoUrl}
                onChange={(url) => updateGlobal('siteLogoUrl', url)}
              />

              {/* Header Layout Options */}
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-xs font-bold text-slate-300">פריסת אזור ההדר (Header Layout):</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'capsule-floating', label: 'קפסולה צפה (KosTogether Style - ברירת מחדל)', desc: 'כפתור קפסולה צף ומגירה' },
                    { id: 'floating-glass', label: 'זכוכית צפה (Floating Glass)', desc: 'מעוגל ומרחף' },
                    { id: 'classic', label: 'קלאסי מלא (Classic)', desc: 'לוגו בצד ופעולות בצד' },
                    { id: 'centered', label: 'מרכוז מלא (Centered)', desc: 'לוגו ושם במרכז' },
                    { id: 'minimal', label: 'מינימליסטי נקי (Minimal)', desc: 'קומפקטי ודק' },
                    { id: 'transparent', label: 'שקוף מעל התוכן (Transparent)', desc: 'משתלב בהירו' },
                  ].map((layout) => {
                    const activeHeaderLayout = (!globalSettings.headerLayout || globalSettings.headerLayout === 'floating-glass') ? 'capsule-floating' : globalSettings.headerLayout;
                    const isSelected = activeHeaderLayout === layout.id;
                    return (
                      <button
                        key={layout.id}
                        type="button"
                        onClick={() => updateGlobal('headerLayout', layout.id as any)}
                        className={`p-3 rounded-2xl border text-right transition-all flex flex-col gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-200">{layout.label}</span>
                        <span className="text-[10px] text-slate-400">{layout.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 mt-2">
                <label className="text-xs font-semibold text-slate-300">הצג תפריט עליון (Header)</label>
                <input
                  type="checkbox"
                  checked={globalSettings.isHeaderVisible ?? true}
                  onChange={(e) => updateGlobal('isHeaderVisible', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <label className="text-xs font-semibold text-slate-300">תפריט עליון דביק וצף (Floating Glass)</label>
                <input
                  type="checkbox"
                  checked={globalSettings.headerSticky ?? true}
                  onChange={(e) => updateGlobal('headerSticky', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <label className="text-xs font-semibold text-slate-300">הצג פוטר תחתון (Footer)</label>
                <input
                  type="checkbox"
                  checked={globalSettings.isFooterVisible ?? true}
                  onChange={(e) => updateGlobal('isFooterVisible', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700 cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="flex flex-col gap-4">
              {/* Theme Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">ערכת נושא מוגדרת מראש (Preset):</label>
                <div className="grid grid-cols-2 gap-2">
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
                        onUpdateGlobalSettings({
                          ...globalSettings,
                          theme: preset.id as any,
                          backgroundColor: preset.bg,
                          primaryColor: preset.p,
                        });
                      }}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 text-right flex items-center justify-between text-xs text-white"
                    >
                      <span>{preset.label}</span>
                      <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: preset.p }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">גופן האתר (Font Family):</label>
                <select
                  value={globalSettings.fontFamily || 'Heebo, sans-serif'}
                  onChange={(e) => updateGlobal('fontFamily', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                >
                  <option value="Heebo, sans-serif">Heebo (היבו - מודרני ונקי)</option>
                  <option value="Assistant, sans-serif">Assistant (אסיסטנט - עדין ואלגנטי)</option>
                  <option value="Rubik, sans-serif">Rubik (רוביק - יוקרתי ועגול)</option>
                  <option value="Alef, sans-serif">Alef (אלף - מסורתי ורשמי)</option>
                  <option value="'Varela Round', sans-serif">Varela Round (ורלה עגול)</option>
                </select>
              </div>

              <PageBuilderColorPicker
                label="צבע ראשי (Primary Color)"
                value={globalSettings.primaryColor || '#6366f1'}
                onChange={(c) => updateGlobal('primaryColor', c)}
              />
              <PageBuilderColorPicker
                label="צבע משני (Secondary Color)"
                value={globalSettings.secondaryColor || '#0ea5e9'}
                onChange={(c) => updateGlobal('secondaryColor', c)}
              />
              <PageBuilderColorPicker
                label="צבע רקע כללי לדף"
                value={globalSettings.backgroundColor || '#0a0a0c'}
                onChange={(c) => updateGlobal('backgroundColor', c)}
              />
              <PageBuilderColorPicker
                label="צבע טקסט ראשי"
                value={globalSettings.textColor || '#f8fafc'}
                onChange={(c) => updateGlobal('textColor', c)}
              />
              <PageBuilderColorPicker
                label="צבע רקע לכפתורים"
                value={globalSettings.buttonBgColor || '#6366f1'}
                onChange={(c) => updateGlobal('buttonBgColor', c)}
              />
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> מחולל SEO חכם עם AI
                  </span>
                  <PageBuilderButton
                    size="xs"
                    variant="gradient"
                    onClick={handleGenerateAiSeo}
                    disabled={isAiGeneratingSeo}
                  >
                    {isAiGeneratingSeo ? 'מייצר...' : 'צור אוטומטית'}
                  </PageBuilderButton>
                </div>
                <p className="text-[11px] text-slate-400">
                  בלחיצה אחת, ה-AI ייצור עבורכם כותרת מושכת, תיאור מטא ומילות מפתח מותאמות לגוגל.
                </p>
              </div>

              {/* Google Criteria SEO Audit Score Card */}
              {auditScore !== null && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>ציון התאמה לקריטריונים של גוגל (Google E-E-A-T):</span>
                    </span>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {auditScore}/100
                    </span>
                  </div>
                  {auditRecommendations.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {auditRecommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300 leading-tight">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Favicon for Browser Tab */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">אייקון כרטיסיית דפדפן (Favicon)</span>
                    <span className="text-[11px] text-slate-400">מוצג בלשונית הדפדפן ובסימניות של המשתמשים</span>
                  </div>
                  {seoSettings.faviconUrl && (
                    <img
                      src={seoSettings.faviconUrl}
                      alt="Favicon preview"
                      className="w-7 h-7 rounded-lg object-contain bg-slate-950 p-1 border border-slate-700"
                    />
                  )}
                </div>
                <PageBuilderImageUpload
                  label="כתובת אייקון הכרטיסייה (URL / קובץ)"
                  value={seoSettings.faviconUrl || brandDna?.identity?.logoUrl || globalSettings.siteLogoUrl}
                  onChange={(url) => updateSeo('faviconUrl', url)}
                />
              </div>

              <PageBuilderInput
                label="כותרת SEO (Meta Title - מומלץ 50-60 תווים)"
                value={seoSettings.title || ''}
                onChange={(val) => updateSeo('title', val)}
                placeholder="כותרת שתופיע בתוצאות החיפוש בגוגל"
              />
              <PageBuilderTextarea
                label="תיאור מטא (Meta Description - מומלץ 140-160 תווים)"
                value={seoSettings.description || ''}
                onChange={(val) => updateSeo('description', val)}
                rows={3}
                placeholder="תיאור קצר ומזמין של הדף..."
              />
              <PageBuilderInput
                label="מילות מפתח (מופרדות בפסיקים)"
                value={(seoSettings.keywords || []).join(', ')}
                onChange={(e) => {
                  const str = typeof e === 'string' ? e : e?.target?.value || '';
                  updateSeo(
                    'keywords',
                    str.split(',').map((k: string) => k.trim()).filter(Boolean)
                  );
                }}
                placeholder="קהילה, תרומות, הרשמה..."
              />
              <PageBuilderImageUpload
                label="תמונת שיתוף חברתי (OG Image)"
                value={seoSettings.ogImage}
                onChange={(url) => updateSeo('ogImage', url)}
              />

              {/* Generative Engine Optimization (GEO / AIO) Card */}
              <div className="mt-2 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>קידום במנועי AI (ChatGPT, Perplexity, Gemini)</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 font-bold">
                    AIO / GEO 2026
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  הגדרות אלו מעשירות את נתוני ה-JSON-LD והמטא-תגיות כדי שמנועי AI יוכלו לצטט את האתר כמקור מוסמך ואמין בתשובותיהם לגולשים.
                </p>

                <PageBuilderTextarea
                  label="תמצית ידע מותאמת ל-AI (Knowledge Snippet for LLMs)"
                  value={seoSettings.aiKnowledgeSummary || ''}
                  onChange={(val) => updateSeo('aiKnowledgeSummary', val)}
                  rows={3}
                  placeholder="הסבר תמציתי ומדויק על הפעילות, השירות או הארגון שבוטי AI יצטטו..."
                />

                <PageBuilderTextarea
                  label="שאלות מפתח שהעמוד עונה עליהן (שאלה אחת בכל שורה)"
                  value={(seoSettings.aiTargetQuestions || []).join('\n')}
                  onChange={(val) =>
                    updateSeo(
                      'aiTargetQuestions',
                      val.split('\n').map((q: string) => q.trim()).filter(Boolean)
                    )
                  }
                  rows={3}
                  placeholder="מה זה השירות?&#10;איך מצטרפים?&#10;מה היתרונות?"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">סוג ישות סכמה (Schema Type):</label>
                    <select
                      value={seoSettings.aiEntitySchemaType || 'ProfessionalService'}
                      onChange={(e) => updateSeo('aiEntitySchemaType', e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="ProfessionalService">ProfessionalService (שירות מקצועי / עסק)</option>
                      <option value="Organization">Organization (ארגון / עמותה / חברה)</option>
                      <option value="Product">Product (מוצר / שירות ספציפי)</option>
                      <option value="FAQPage">FAQPage (דף שאלות ותשובות מקיף)</option>
                      <option value="Article">Article (מאמר תוכן מקצועי)</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-end">
                    <button
                      type="button"
                      onClick={() => updateSeo('aiBotIndexingEnabled', seoSettings.aiBotIndexingEnabled !== false ? false : true)}
                      className={clsx(
                        'w-full p-2.5 rounded-xl border text-right flex items-center justify-between text-xs transition',
                        seoSettings.aiBotIndexingEnabled !== false
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      )}
                    >
                      <span>אינדוקס ע"י בוטים (GPTBot / Claude / Perplexity)</span>
                      <div
                        className={clsx(
                          'w-4 h-4 rounded-md border flex items-center justify-center',
                          seoSettings.aiBotIndexingEnabled !== false
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'border-slate-700 bg-slate-800'
                        )}
                      >
                        {seoSettings.aiBotIndexingEnabled !== false && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-amber-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">חיבור Google Analytics 4 (GA4)</span>
                      <span className="text-[11px] text-slate-400">מעקב תנועה, אירועים והמרות בנכס שלכם</span>
                    </div>
                  </div>
                  {globalSettings.googleAnalyticsId ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      פעיל ומחובר
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">
                      טרם הוגדר
                    </span>
                  )}
                </div>

                <PageBuilderInput
                  label="מזהה מדידה של Google Analytics (Measurement ID)"
                  value={globalSettings.googleAnalyticsId || ''}
                  onChange={(val) => updateGlobal('googleAnalyticsId', val)}
                  placeholder="G-XXXXXXXXXX"
                  dir="ltr"
                />
                <p className="text-[11px] text-slate-400 leading-tight">
                  הזינו את מזהה המדידה מתוך מסוף Google Analytics (מתחיל ב-<strong>G-</strong>). בעת טעינת העמוד הציבורי, המערכת תטעין את תגית המעקב ותשדר אירועים בזמן אמת.
                </p>
              </div>

              {/* Tenant Storage Isolation Card */}
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span>אחסון נתוני אנליטיקס תחת ה-Tenant שלכם</span>
                </div>
                <p className="text-[11px] text-indigo-200/80 leading-relaxed">
                  כל נתוני הגולשים, הצפיות, האינטראקציות, הקלקות על CTA וציטוטי מנועי AI נשמרים ומבודדים באופן מלא בקולקציה תחת הטננט שלכם:
                </p>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-cyan-300 text-left" dir="ltr">
                  tenants/{'{tenantId}'}/page_analytics_telemetry/{'{pageId}'}
                </div>
                <p className="text-[11px] text-slate-400">
                  ניתן להוסיף את אזור <strong>"אנליטיקס וביצועי דף חיים"</strong> ישירות לעמוד שלכם מתוך כפתור "הוסף אזור", כדי להציג את הנתונים בלייב למנהלים או לגולשים.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="flex flex-col gap-4">
              {/* GEO SEO Quick Link */}
              {onOpenGeoDrawer && (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-emerald-300">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>הגדרות מתקדמות לקידום מקומי (GEO SEO)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenGeoDrawer();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    פתח הגדרות GEO
                  </button>
                </div>
              )}

              <PageBuilderInput
                label="מספר וואטסאפ ראשי"
                value={globalSettings.contactWhatsApp || ''}
                onChange={(val) => updateGlobal('contactWhatsApp', val)}
                placeholder="972545947701"
                dir="ltr"
              />
              <PageBuilderInput
                label="טלפון ליצירת קשר"
                value={globalSettings.contactPhone || ''}
                onChange={(val) => updateGlobal('contactPhone', val)}
                placeholder="03-1234567"
                dir="ltr"
              />
              <PageBuilderInput
                label="אימייל ארגון"
                value={globalSettings.contactEmail || ''}
                onChange={(val) => updateGlobal('contactEmail', val)}
                placeholder="info@example.com"
                dir="ltr"
              />
              <PageBuilderInput
                label="כתובת פיזית"
                value={globalSettings.address || ''}
                onChange={(val) => updateGlobal('address', val)}
                placeholder="רחוב הרצל 1, תל אביב"
              />
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur shrink-0">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-end">
          <PageBuilderButton size="sm" variant="primary" onClick={onClose}>
            סגור הגדרות
          </PageBuilderButton>
        </div>
      </div>
    </div>
  );
};
