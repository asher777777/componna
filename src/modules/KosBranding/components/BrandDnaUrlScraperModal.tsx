import React, { useState } from 'react';
import { useBrandDna } from '../context/BrandDnaContext';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { getModuleGeminiKey } from '../../../core/connection/tenantApiKeys';
import { useTenantScope } from '../../../core/tenant';
import {
  scrapeAndLearnWebsiteWithKosai,
  WebsiteLearnResult,
} from '../services/brandCopilotService';
import { WebsiteScanScope } from '../types/brandDna';
import { saveBrandDnaBackup } from '../services/brandDnaFirestore';
import {
  applyBrandDesignTokensToAllTenantPages,
  applyLayoutArchetypeToAllTenantPages,
} from '../../KosWebAi/services/pageStylePresetService';
import { syncAllTenantPagesWithBrandDna } from '../../KosWebAi/services/pageBrandSyncService';
import { LAYOUT_ARCHETYPES, LayoutArchetype } from '../../KosWebAi/types/pageBuilder.types';
import {
  Globe,
  Sparkles,
  Loader2,
  CheckCircle2,
  HelpCircle,
  X,
  Zap,
  Palette,
  LayoutTemplate,
  FileText,
  Wand2,
} from 'lucide-react';

interface BrandDnaUrlScraperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandDnaUrlScraperModal: React.FC<BrandDnaUrlScraperModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    brandDna,
    updateIdentity,
    updateVoice,
    updateAudience,
    updateDesignTokens,
    updateUiVocabulary,
    setFullBrandDna,
    saveNow,
  } = useBrandDna();
  const { apiKeys, db } = useSystemConnection();
  const { tenantId } = useTenantScope();

  const [urlInput, setUrlInput] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [scope, setScope] = useState<WebsiteScanScope>({
    content: false,
    colors: true,
    designAndLayout: true,
  });

  // Selective global site apply toggles after learning
  const [applyToSiteDesign, setApplyToSiteDesign] = useState(false);
  const [applyToSiteLayout, setApplyToSiteLayout] = useState(false);
  const [applyToSiteMicrocopy, setApplyToSiteMicrocopy] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [extractedResult, setExtractedResult] = useState<WebsiteLearnResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleScope = (key: keyof WebsiteScanScope) => {
    setScope((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next.content && !next.colors && !next.designAndLayout) {
        return prev; // Keep at least one scope selected
      }
      return next;
    });
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsLoading(true);
    setError(null);
    setExtractedResult(null);
    setAppliedNotice(null);

    try {
      const apiKey = apiKeys.googleAiApiKey || getModuleGeminiKey('KosBranding') || '';
      const res = await scrapeAndLearnWebsiteWithKosai(urlInput.trim(), {
        scope,
        userPrompt: userPrompt.trim(),
        apiKey,
        tenantId: tenantId || '_master',
      });
      if (res.success && res.extractedBrand) {
        setExtractedResult(res);
      } else {
        setError(res.error || 'שגיאה בסריקת הקישור');
      }
    } catch (err: any) {
      setError(err.message || 'שגיאה בלתי צפויה');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToBrandDna = async () => {
    if (!extractedResult?.extractedBrand) return;
    if (scope.content && brandDna.identity?.companyName?.trim()) {
      const ok = window.confirm(
        `שימו לב: סימנתם החלפת תוכן וזהות מותג עבור "${brandDna.identity.companyName}". פעולה זו תחליף את פרטי המותג הקיימים (נשמר גיבוי אוטומטי). להמשיך?`
      );
      if (!ok) return;
    }

    setIsApplying(true);
    setError(null);

    try {
      await saveBrandDnaBackup(
        brandDna,
        scope.content ? 'לפני החלת תוכן וצבעים מסורק האתרים' : 'לפני החלת צבעים ועיצוב מסורק האתרים',
        db || undefined,
        tenantId || '_master'
      );
      const eb = extractedResult.extractedBrand;

      const nextBrandDna = {
        ...brandDna,
        identity: scope.content && eb.identity ? { ...brandDna.identity, ...eb.identity } : brandDna.identity,
        voice: scope.content && eb.voice ? { ...brandDna.voice, ...eb.voice } : brandDna.voice,
        audience: scope.content && eb.audience ? { ...brandDna.audience, ...eb.audience } : brandDna.audience,
        uiVocabulary:
          scope.content && eb.uiVocabulary
            ? {
                ...(brandDna.uiVocabulary || {}),
                ...eb.uiVocabulary,
                sectionHeadings: {
                  ...(brandDna.uiVocabulary?.sectionHeadings || {}),
                  ...(eb.uiVocabulary.sectionHeadings || {}),
                },
              }
            : brandDna.uiVocabulary,
        designTokens:
          (scope.colors || scope.designAndLayout) && eb.designTokens
            ? {
                ...brandDna.designTokens,
                ...(scope.colors
                  ? {
                      primaryColor: eb.designTokens.primaryColor || brandDna.designTokens.primaryColor,
                      secondaryColor: eb.designTokens.secondaryColor || brandDna.designTokens.secondaryColor,
                      backgroundColor: eb.designTokens.backgroundColor || brandDna.designTokens.backgroundColor,
                      textColor: eb.designTokens.textColor || brandDna.designTokens.textColor,
                      textColorH1: eb.designTokens.textColorH1 || brandDna.designTokens.textColorH1,
                      textColorH2: eb.designTokens.textColorH2 || brandDna.designTokens.textColorH2,
                      buttonBgColor: eb.designTokens.buttonBgColor || brandDna.designTokens.buttonBgColor,
                      buttonTextColor: eb.designTokens.buttonTextColor || brandDna.designTokens.buttonTextColor,
                    }
                  : {}),
                ...(scope.designAndLayout
                  ? {
                      fontFamily: eb.designTokens.fontFamily || brandDna.designTokens.fontFamily,
                      borderRadius: eb.designTokens.borderRadius || brandDna.designTokens.borderRadius,
                      buttonStyle: eb.designTokens.buttonStyle || brandDna.designTokens.buttonStyle,
                      defaultStylePreset: eb.designTokens.defaultStylePreset || brandDna.designTokens.defaultStylePreset,
                      defaultLayoutArchetype:
                        eb.designTokens.defaultLayoutArchetype || brandDna.designTokens.defaultLayoutArchetype,
                    }
                  : {}),
              }
            : brandDna.designTokens,
        learnedSiteProfile: extractedResult.learnedSiteProfile || eb.learnedSiteProfile || brandDna.learnedSiteProfile,
      };

      if (scope.content && eb.identity) updateIdentity(eb.identity);
      if (scope.content && eb.voice) updateVoice(eb.voice);
      if (scope.content && eb.audience) updateAudience(eb.audience);
      if (scope.content && eb.uiVocabulary) updateUiVocabulary(eb.uiVocabulary);
      if ((scope.colors || scope.designAndLayout) && eb.designTokens) {
        updateDesignTokens(nextBrandDna.designTokens);
      }
      setFullBrandDna(nextBrandDna);
      await saveNow();

      const activeTenant = tenantId || '_master';
      const siteUpdates: string[] = [];

      if (applyToSiteDesign) {
        const res = await applyBrandDesignTokensToAllTenantPages(db || null, activeTenant, nextBrandDna.designTokens);
        siteUpdates.push(`עיצוב וצבעים (${res.updatedCount} עמודים)`);
      }
      if (applyToSiteLayout && nextBrandDna.designTokens.defaultLayoutArchetype) {
        const res = await applyLayoutArchetypeToAllTenantPages(
          db || null,
          activeTenant,
          nextBrandDna.designTokens.defaultLayoutArchetype as LayoutArchetype,
          nextBrandDna
        );
        siteUpdates.push(`פריסה (${res.updatedCount} עמודים)`);
      }
      if (applyToSiteMicrocopy) {
        const res = await syncAllTenantPagesWithBrandDna(db || undefined, activeTenant, nextBrandDna);
        siteUpdates.push(`מיני-קופי (${res.updatedCount} עמודים)`);
      }

      const msg =
        siteUpdates.length > 0
          ? `נשמר ל-Brand DNA של הטננט והוחל גורפת על: ${siteUpdates.join(' • ')}`
          : 'הנתונים שנלמדו מהאתר נשמרו ב-Brand DNA של הטננט בהצלחה!';

      setAppliedNotice(msg);
      setTimeout(() => {
        setAppliedNotice(null);
        onClose();
      }, 2200);
    } catch (err: any) {
      setError(err?.message || 'שגיאה בשמירת הנתונים');
    } finally {
      setIsApplying(false);
    }
  };

  const eb = extractedResult?.extractedBrand;
  const tokens = eb?.designTokens;
  const profile = extractedResult?.learnedSiteProfile;
  const archetypeName =
    tokens?.defaultLayoutArchetype && LAYOUT_ARCHETYPES[tokens.defaultLayoutArchetype as LayoutArchetype]
      ? LAYOUT_ARCHETYPES[tokens.defaultLayoutArchetype as LayoutArchetype].name
      : tokens?.defaultLayoutArchetype;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                סורק אתרים ולמידת מיתוג חכמה (KOSAI)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                KOSAI סורק את האתר, לומד צבעים, פריסה, אלמנטים עיצוביים ותוכן — ובונה בסיס נתונים לטננט
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-xs">
              {error}
            </div>
          )}

          {appliedNotice && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>{appliedNotice}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleScan} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                כתובת URL של האתר לסריקה:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Globe className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="לדוגמה: https://mybusiness.co.il"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-indigo-500 rounded-2xl pr-10 pl-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white outline-none transition-all shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !urlInput.trim()}
                  className="px-5 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>KOSAI סורק...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>סרוק ולמד אתר</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Scope selection */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                מה תרצו ש-KOSAI ילמד וייצור מהאתר?
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => toggleScope('content')}
                  className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-2.5 ${
                    scope.content
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-200'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-slate-500'
                  }`}
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="text-xs font-black">תוכן ומיני-קופי</div>
                    <div className="text-[10px] opacity-80">זהות, טון, כפתורים וכותרות</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => toggleScope('colors')}
                  className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-2.5 ${
                    scope.colors
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-200'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-slate-500'
                  }`}
                >
                  <Palette className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="text-xs font-black">צבעים ופלטה</div>
                    <div className="text-[10px] opacity-80">צבע ראשי, משני, רקע וכפתורים</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => toggleScope('designAndLayout')}
                  className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-2.5 ${
                    scope.designAndLayout
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-200'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-slate-500'
                  }`}
                >
                  <LayoutTemplate className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="text-xs font-black">אלמנטים ופריסה</div>
                    <div className="text-[10px] opacity-80">פונט, פינות, סגנון וארכיטיפ</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Custom User Instruction */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                בקשה / הנחיה מיוחדת ל-KOSAI (אופציונלי):
              </label>
              <input
                type="text"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="לדוגמה: תלמד רק את פלטת הצבעים והפריסה הנקייה, אבל תכתוב מיני-קופי יוקרתי יותר..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition-all"
              />
            </div>
          </form>

          {/* Extracted Results */}
          {extractedResult && (
            <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800 animate-in fade-in">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    סיכום למידת האתר ע״י KOSAI
                  </span>
                  {extractedResult.liveScraped ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                      ✓ נשאבו נתוני אמת מקוד האתר וה-CSS
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                      ⚠ לא ניתן היה למשוך HTML ישירות — הניתוח מבוסס הערכת AI
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                  {extractedResult.summary}
                </p>
              </div>

              {/* Colors Preview */}
              {scope.colors && tokens && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-rose-500" />
                    צבעים ופלטה שנלמדו:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'ראשי', hex: tokens.primaryColor },
                      { label: 'משני', hex: tokens.secondaryColor },
                      { label: 'רקע', hex: tokens.backgroundColor },
                      { label: 'טקסט', hex: tokens.textColor },
                      { label: 'כפתור', hex: tokens.buttonBgColor },
                    ].map(
                      (c) =>
                        c.hex && (
                          <div
                            key={c.label}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]"
                          >
                            <span
                              className="w-4 h-4 rounded-md border border-slate-300 dark:border-slate-700 shrink-0"
                              style={{ backgroundColor: c.hex }}
                            />
                            <span className="font-bold text-slate-700 dark:text-slate-200">{c.label}</span>
                            <span className="font-mono text-[10px] text-slate-400">{c.hex}</span>
                          </div>
                        )
                    )}
                  </div>
                  {extractedResult.rawSignals?.topColors && extractedResult.rawSignals.topColors.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800/70">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1.5">
                        גוונים גולמיים שזוהו בקוד ה-CSS של האתר:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {extractedResult.rawSignals.topColors.slice(0, 10).map((c) => (
                          <span
                            key={c.hex}
                            title={`${c.hex} (${c.count} מופעים)`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-500"
                          >
                            <span
                              className="w-3 h-3 rounded-sm border border-slate-300 dark:border-slate-700"
                              style={{ backgroundColor: c.hex }}
                            />
                            {c.hex}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Design & Layout Preview */}
              {scope.designAndLayout && (tokens || profile) && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <LayoutTemplate className="w-4 h-4 text-emerald-500" />
                    אלמנטים עיצוביים ופריסה שנלמדו:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">ארכיטיפ פריסה</span>
                      <strong className="text-slate-800 dark:text-slate-100">{archetypeName || 'bento_hub'}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">סגנון מוביל</span>
                      <strong className="text-slate-800 dark:text-slate-100">{tokens?.defaultStylePreset || 'standard'}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">פונט</span>
                      <strong className="text-slate-800 dark:text-slate-100">{tokens?.fontFamily || 'Heebo'}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">כפתורים ופינות</span>
                      <strong className="text-slate-800 dark:text-slate-100">
                        {tokens?.buttonStyle || 'gradient'} / {tokens?.borderRadius || 'md'}
                      </strong>
                    </div>
                  </div>
                  {(profile?.designElementsSummary || profile?.layoutNotes) && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                      {profile.designElementsSummary} {profile.layoutNotes ? `• ${profile.layoutNotes}` : ''}
                    </p>
                  )}
                </div>
              )}

              {/* Content & Microcopy Snapshot */}
              {scope.content && eb?.identity && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    תוכן ומיני-קופי שנלמדו:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">שם מותג:</span>
                      <strong className="text-slate-800 dark:text-slate-100">{eb.identity.companyName || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">סלוגן:</span>
                      <span className="text-slate-800 dark:text-slate-100">{eb.identity.slogan || '—'}</span>
                    </div>
                    {eb.uiVocabulary?.primaryCta && (
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 block text-[10px]">מיני-קופי (CTA ראשי / כותרת):</span>
                        <span className="text-slate-700 dark:text-slate-200">
                          "{eb.uiVocabulary.primaryCta}" • {eb.uiVocabulary.sectionHeadings?.heroTitle || ''}
                        </span>
                      </div>
                    )}
                  </div>
                  {extractedResult.rawSignals?.topColors && extractedResult.rawSignals.topColors.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800/70">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1.5">
                        גוונים גולמיים שזוהו בקוד ה-CSS של האתר:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {extractedResult.rawSignals.topColors.slice(0, 10).map((c) => (
                          <span
                            key={c.hex}
                            title={`${c.hex} (${c.count} מופעים)`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-500"
                          >
                            <span
                              className="w-3 h-3 rounded-sm border border-slate-300 dark:border-slate-700"
                              style={{ backgroundColor: c.hex }}
                            />
                            {c.hex}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Positioning Questions */}
              {extractedResult.positioningQuestions && extractedResult.positioningQuestions.length > 0 && (
                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-2xl space-y-1.5">
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    שאלות מיצוב שנולדו מהסריקה:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                    {extractedResult.positioningQuestions.map((q, qIdx) => (
                      <li key={qIdx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Optional immediate global site apply */}
              <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5" />
                  השפעה גורפת מיידית על האתר (אופציונלי — ניתן גם בהמשך מטאב העיצוב):
                </span>
                <div className="flex flex-wrap gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={applyToSiteDesign}
                      onChange={(e) => setApplyToSiteDesign(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                    <span>החל עיצוב וצבעים על כל העמודים</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={applyToSiteLayout}
                      onChange={(e) => setApplyToSiteLayout(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                    <span>החל פריסה על כל העמודים</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={applyToSiteMicrocopy}
                      onChange={(e) => setApplyToSiteMicrocopy(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                    <span>החל מיני-קופי על כל העמודים</span>
                  </label>
                </div>
              </div>

              {/* Apply Action */}
              <button
                type="button"
                disabled={isApplying}
                onClick={handleApplyToBrandDna}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>שמור לדאטה-בייס הטננט (Brand DNA){applyToSiteDesign || applyToSiteLayout || applyToSiteMicrocopy ? ' והחל על האתר' : ''}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end bg-slate-50/80 dark:bg-slate-950/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
