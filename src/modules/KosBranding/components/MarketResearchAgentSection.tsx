import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useBrandDna } from '../hooks/useBrandDna';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { getModuleGeminiKey } from '../../../core/connection/tenantApiKeys';
import { useTenantScope } from '../../../core/tenant';
import { runMarketResearchAgent } from '../services/geminiBrandPrompt';
import {
  scrapeAndLearnWebsiteWithKosai,
  WebsiteLearnResult,
} from '../services/brandCopilotService';
import { marketResearchFirestore } from '../services/marketResearchFirestore';
import { generateInfoPageFromMarketResearch } from '../services/marketResearchPageGenerator';
import { MarketResearchItem, WebsiteScanScope } from '../types/brandDna';
import { LAYOUT_ARCHETYPES, LayoutArchetype } from '../../KosWebAi/types/pageBuilder.types';
import {
  Globe,
  Lightbulb,
  Activity,
  TrendingUp,
  Paintbrush,
  DollarSign,
  Wand2,
  Check,
  Sparkles,
  Loader2,
  Palette,
  LayoutTemplate,
  FileText,
  ExternalLink,
  Copy,
  Trash2,
  FolderKanban,
  Search,
  RefreshCw,
  CheckCircle2,
  Zap,
  FilePlus2,
} from 'lucide-react';

export const MarketResearchAgentSection: React.FC = () => {
  const {
    brandDna,
    setFullBrandDna,
    updateIdentity,
    updateVoice,
    updateAudience,
    updateDesignTokens,
    updateUiVocabulary,
    saveNow,
  } = useBrandDna();
  const { apiKeys, db } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const activeTenant = tenantId || '_master';

  // Collection state ("מחקר שוק")
  const [researchList, setResearchList] = useState<MarketResearchItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'market_research' | 'website_scan'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generatingPageId, setGeneratingPageId] = useState<string | null>(null);

  // Market Research Agent state
  const [isResearching, setIsResearching] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [appliedUpdates, setAppliedUpdates] = useState(false);

  // KOSAI Website Scanner state (moved into Research tab)
  const [urlInput, setUrlInput] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [scope, setScope] = useState<WebsiteScanScope>({
    content: true,
    colors: true,
    designAndLayout: true,
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<WebsiteLearnResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const loadResearchCollection = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const items = await marketResearchFirestore.list(db, activeTenant);
      setResearchList(items);
    } catch (err) {
      console.warn('[MarketResearchAgentSection] Failed to load collection:', err);
    } finally {
      setIsLoadingList(false);
    }
  }, [db, activeTenant]);

  useEffect(() => {
    loadResearchCollection();
  }, [loadResearchCollection]);

  const toggleScope = (key: keyof WebsiteScanScope) => {
    setScope((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next.content && !next.colors && !next.designAndLayout) return prev;
      return next;
    });
  };

  // Run KOSAI Website Scan -> Save to "מחקר שוק" collection -> Generate Reusable Info Page
  const handleWebsiteScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsScanning(true);
    setScanError(null);
    setScanResult(null);

    try {
      const apiKey = apiKeys.googleAiApiKey || getModuleGeminiKey('KosBranding') || '';
      const res = await scrapeAndLearnWebsiteWithKosai(urlInput.trim(), {
        scope,
        userPrompt: userPrompt.trim(),
        apiKey,
        tenantId: activeTenant,
      });

      if (!res.success || !res.extractedBrand) {
        setScanError(res.error || 'שגיאה בסריקת האתר');
        return;
      }

      setScanResult(res);

      // Save automatically to "מחקר שוק" collection & generate reusable Info Page
      const cleanUrl = /^https?:\/\//i.test(urlInput.trim()) ? urlInput.trim() : `https://${urlInput.trim()}`;
      const domain = cleanUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split(/[\/?#]/)[0];
      const nowIso = new Date().toISOString();
      const itemId = `res_scan_${Date.now()}`;

      let item: MarketResearchItem = {
        id: itemId,
        title: res.extractedBrand.identity?.companyName || domain || 'סריקת אתר',
        type: 'website_scan',
        sourceUrl: cleanUrl,
        summary: res.summary || `סריקת אתר עבור ${domain}`,
        designLanguageRecommendations: [
          res.learnedSiteProfile?.designElementsSummary,
          res.learnedSiteProfile?.layoutNotes,
        ]
          .filter(Boolean)
          .join(' • '),
        learnedSiteProfile: res.learnedSiteProfile,
        extractedBrand: res.extractedBrand,
        rawColors: res.rawSignals?.topColors?.slice(0, 10),
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      const infoPage = await generateInfoPageFromMarketResearch(item, brandDna, db, activeTenant);
      item = {
        ...item,
        infoPageId: infoPage.pageId,
        infoPageSlug: infoPage.slug,
        infoPageUrl: infoPage.publicUrl,
      };

      await marketResearchFirestore.save(item, db, activeTenant);
      await loadResearchCollection();
      showNotice(`סריקת "${item.title}" נשמרה בקולקציית "מחקר שוק" והופק עמוד מידע לשימוש חוזר!`);
    } catch (err: any) {
      setScanError(err?.message || 'שגיאה בלתי צפויה בסריקה');
    } finally {
      setIsScanning(false);
    }
  };

  const handleApplyScanToBrandDna = async (
    eb: Partial<typeof brandDna> | undefined,
    learnedProfile?: typeof brandDna.learnedSiteProfile,
    applyScope: WebsiteScanScope = scope
  ) => {
    if (!eb) return;
    const nextBrandDna = {
      ...brandDna,
      identity: applyScope.content && eb.identity ? { ...brandDna.identity, ...eb.identity } : brandDna.identity,
      voice: applyScope.content && eb.voice ? { ...brandDna.voice, ...eb.voice } : brandDna.voice,
      audience: applyScope.content && eb.audience ? { ...brandDna.audience, ...eb.audience } : brandDna.audience,
      uiVocabulary:
        applyScope.content && eb.uiVocabulary
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
        (applyScope.colors || applyScope.designAndLayout) && eb.designTokens
          ? {
              ...brandDna.designTokens,
              ...(applyScope.colors
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
              ...(applyScope.designAndLayout
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
      learnedSiteProfile: learnedProfile || eb.learnedSiteProfile || brandDna.learnedSiteProfile,
    };

    if (applyScope.content && eb.identity) updateIdentity(eb.identity);
    if (applyScope.content && eb.voice) updateVoice(eb.voice);
    if (applyScope.content && eb.audience) updateAudience(eb.audience);
    if (applyScope.content && eb.uiVocabulary) updateUiVocabulary(eb.uiVocabulary);
    if ((applyScope.colors || applyScope.designAndLayout) && eb.designTokens) {
      updateDesignTokens(nextBrandDna.designTokens);
    }
    setFullBrandDna(nextBrandDna);
    await saveNow();
    showNotice('נתוני המיתוג הוטמעו ונשמרו ב-Brand DNA של הטננט בהצלחה!');
  };

  // Run Market Research Agent -> Save to "מחקר שוק" collection -> Generate Reusable Info Page
  const handleRunResearch = async () => {
    setIsResearching(true);
    setAppliedUpdates(false);
    try {
      const result = await runMarketResearchAgent(brandDna);
      setReport(result);

      if (result) {
        const nowIso = new Date().toISOString();
        const itemId = `res_mkt_${Date.now()}`;
        const brandTitle = brandDna.identity.companyName?.trim() || 'המותג';
        let item: MarketResearchItem = {
          id: itemId,
          title: `מחקר שוק — ${brandTitle}`,
          type: 'market_research',
          summary:
            result.competitiveness ||
            result.marketTrends?.[0] ||
            `ניתוח שוק, מתחרים ותמחור עבור ${brandTitle}`,
          marketTrends: result.marketTrends,
          competitiveness: result.competitiveness,
          pricingRecommendations: result.pricingRecommendations,
          designLanguageRecommendations: result.designLanguageRecommendations,
          competitors: result.competitors,
          actionableUpdates: result.actionableUpdates,
          createdAt: nowIso,
          updatedAt: nowIso,
        };

        const infoPage = await generateInfoPageFromMarketResearch(item, brandDna, db, activeTenant);
        item = {
          ...item,
          infoPageId: infoPage.pageId,
          infoPageSlug: infoPage.slug,
          infoPageUrl: infoPage.publicUrl,
        };

        await marketResearchFirestore.save(item, db, activeTenant);
        await loadResearchCollection();
        showNotice(`מחקר השוק נשמר בקולקציית "מחקר שוק" והופק עמוד מידע לשימוש חוזר!`);
      }
    } finally {
      setIsResearching(false);
    }
  };

  const handleApplyUpdates = () => {
    if (!report?.actionableUpdates) return;
    const { slogan, primaryColor, newService } = report.actionableUpdates;
    let updatedBrand = { ...brandDna };

    if (slogan) {
      updatedBrand = { ...updatedBrand, identity: { ...updatedBrand.identity, slogan } };
    }
    if (primaryColor) {
      updatedBrand = {
        ...updatedBrand,
        designTokens: { ...updatedBrand.designTokens, primaryColor, buttonBgColor: primaryColor },
      };
    }
    if (newService) {
      const currentServices = updatedBrand.ecosystem?.services || [];
      if (!currentServices.includes(newService)) {
        updatedBrand = {
          ...updatedBrand,
          ecosystem: {
            products: [],
            annualEvents: [],
            communities: [],
            ...(updatedBrand.ecosystem || {}),
            services: [...currentServices, newService],
          },
        };
      }
    }

    setFullBrandDna(updatedBrand);
    setAppliedUpdates(true);
  };

  const handleRegenerateInfoPage = async (item: MarketResearchItem) => {
    setGeneratingPageId(item.id);
    try {
      const infoPage = await generateInfoPageFromMarketResearch(item, brandDna, db, activeTenant);
      const updatedItem: MarketResearchItem = {
        ...item,
        infoPageId: infoPage.pageId,
        infoPageSlug: infoPage.slug,
        infoPageUrl: infoPage.publicUrl,
      };
      await marketResearchFirestore.save(updatedItem, db, activeTenant);
      await loadResearchCollection();
      showNotice(`עמוד המידע "${updatedItem.title}" הופק ונשמר לשימוש חוזר (${infoPage.slug})!`);
    } catch (err: any) {
      showNotice(err?.message || 'שגיאה בהפקת עמוד המידע');
    } finally {
      setGeneratingPageId(null);
    }
  };

  const handleDeleteResearch = async (id: string) => {
    await marketResearchFirestore.remove(id, db, activeTenant);
    await loadResearchCollection();
    showNotice('המחקר הוסר מקולקציית מחקר שוק.');
  };

  const handleCopyUrl = (item: MarketResearchItem) => {
    const url = item.infoPageUrl || (item.infoPageSlug ? `${window.location.origin}/${item.infoPageSlug}` : '');
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLoadItemToView = (item: MarketResearchItem) => {
    if (item.type === 'market_research') {
      setReport({
        marketTrends: item.marketTrends || [],
        competitiveness: item.competitiveness || item.summary,
        pricingRecommendations: item.pricingRecommendations || '',
        designLanguageRecommendations: item.designLanguageRecommendations || '',
        competitors: item.competitors || [],
        actionableUpdates: item.actionableUpdates,
      });
      setAppliedUpdates(false);
    } else if (item.type === 'website_scan' && item.extractedBrand) {
      setUrlInput(item.sourceUrl || '');
      setScanResult({
        success: true,
        liveScraped: true,
        summary: item.summary,
        extractedBrand: item.extractedBrand,
        learnedSiteProfile: item.learnedSiteProfile,
        rawSignals: item.rawColors ? { topColors: item.rawColors } : undefined,
      });
    }
  };

  const filteredResearch = useMemo(() => {
    return researchList.filter((item) => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          (item.sourceUrl || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [researchList, typeFilter, searchQuery]);

  const eb = scanResult?.extractedBrand;
  const tokens = eb?.designTokens;
  const archetypeName =
    tokens?.defaultLayoutArchetype && LAYOUT_ARCHETYPES[tokens.defaultLayoutArchetype as LayoutArchetype]
      ? LAYOUT_ARCHETYPES[tokens.defaultLayoutArchetype as LayoutArchetype].name
      : tokens?.defaultLayoutArchetype;

  return (
    <div className="space-y-6 animate-in fade-in" dir="rtl">
      {statusNotice && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl flex items-center gap-2 text-emerald-300 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* 1. KOSAI Website Scanner & Brand Learner (moved into Research Tab) */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              1. סריקת אתר ולמידת מיתוג חכמה (KOSAI)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              KOSAI סורק את האתר, לומד צבעים, פריסה, אלמנטים עיצוביים ותוכן — שומר בקולקציית &quot;מחקר שוק&quot; ומפיק עמוד מידע לשימוש חוזר
            </p>
          </div>
        </div>

        {scanError && (
          <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-300 text-xs">
            {scanError}
          </div>
        )}

        <form onSubmit={handleWebsiteScan} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="הזן כתובת URL של אתר לסריקה (לדוגמה: https://makom.org.il)"
                className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-2xl pr-10 pl-4 py-3 text-xs sm:text-sm text-white outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isScanning || !urlInput.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>KOSAI סורק ולומד...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>סרוק, שמור והפק עמוד מידע</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => toggleScope('content')}
              className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-2.5 ${
                scope.content
                  ? 'border-indigo-500 bg-indigo-500/15 text-indigo-200'
                  : 'border-slate-800 bg-slate-950/60 text-slate-500'
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
                  ? 'border-rose-500 bg-rose-500/15 text-rose-200'
                  : 'border-slate-800 bg-slate-950/60 text-slate-500'
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
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-200'
                  : 'border-slate-800 bg-slate-950/60 text-slate-500'
              }`}
            >
              <LayoutTemplate className="w-4 h-4 shrink-0" />
              <div>
                <div className="text-xs font-black">אלמנטים ופריסה</div>
                <div className="text-[10px] opacity-80">פונט, פינות, סגנון וארכיטיפ</div>
              </div>
            </button>
          </div>

          <input
            type="text"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="הנחיה מיוחדת ל-KOSAI (אופציונלי): למשל, אמץ רק את הצבעים והפריסה..."
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-2xl px-4 py-2.5 text-xs text-white outline-none"
          />
        </form>

        {/* Live Scan Result Preview */}
        {scanResult && (
          <div className="space-y-3 pt-3 border-t border-slate-800 animate-in fade-in">
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-indigo-300">סיכום הסריקה</span>
                {scanResult.liveScraped ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                    ✓ נשאבו נתוני אמת מקוד האתר וה-CSS
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold">
                    ⚠ לא ניתן היה למשוך HTML ישירות — הערכה מבוססת AI
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{scanResult.summary}</p>
            </div>

            {tokens && (
              <div className="flex flex-wrap items-center gap-2">
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
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-200"
                      >
                        <span className="w-4 h-4 rounded-md border border-slate-700" style={{ backgroundColor: c.hex }} />
                        <span className="font-bold">{c.label}</span>
                        <span className="font-mono text-[10px] text-slate-400">{c.hex}</span>
                      </div>
                    )
                )}
                {archetypeName && (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-300">
                    פריסה: {archetypeName}
                  </span>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => handleApplyScanToBrandDna(eb, scanResult.learnedSiteProfile, scope)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>החל את תוצאות הסריקה על ה-Brand DNA של הטננט</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Market Research AI Agent */}
      <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">2. סוכן מחקר שוק ומתחרים (AI)</h2>
              <p className="text-xs sm:text-sm text-indigo-200">
                מנתח מגמות, מתחרים ותמחור, שומר בקולקציית &quot;מחקר שוק&quot; ומפיק עמוד מידע לשימוש חוזר.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunResearch}
            disabled={isResearching}
            className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/20 text-xs sm:text-sm shrink-0"
          >
            {isResearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>מנתח שוק ומפיק עמוד מידע...</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                <span>{report ? 'הרץ מחקר שוק חדש' : 'הפעל סוכן מחקר שוק AI'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trends */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
              <h3 className="font-bold text-white">מגמות בשוק</h3>
            </div>
            <ul className="space-y-3">
              {report.marketTrends?.map((trend: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{trend}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Competitiveness */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4 text-fuchsia-400">
              <Activity className="w-5 h-5" />
              <h3 className="font-bold text-white">יתרון תחרותי ופערים</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{report.competitiveness}</p>
          </div>

          {/* Pricing & Design */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4 text-amber-400">
              <DollarSign className="w-5 h-5" />
              <h3 className="font-bold text-white">המלצות תמחור</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">{report.pricingRecommendations}</p>

            <div className="flex items-center gap-2 mb-4 text-cyan-400 border-t border-slate-700/50 pt-6">
              <Paintbrush className="w-5 h-5" />
              <h3 className="font-bold text-white">שפה עיצובית מומלצת</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{report.designLanguageRecommendations}</p>
          </div>

          {/* Competitors */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4 text-rose-400">
              <Globe className="w-5 h-5" />
              <h3 className="font-bold text-white">מתחרים בולטים</h3>
            </div>
            <div className="space-y-4">
              {report.competitors?.map((comp: any, i: number) => (
                <div key={i} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white">{comp.name}</span>
                    <span className="text-[10px] px-2 py-1 bg-slate-800 text-slate-400 rounded-full">
                      תמחור: {comp.pricingTier}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>
                      <span className="text-emerald-400/80">חוזקות:</span> {comp.strengths}
                    </p>
                    <p>
                      <span className="text-rose-400/80">חולשות:</span> {comp.weaknesses}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Updates */}
          {report.actionableUpdates && (
            <div className="md:col-span-2 bg-indigo-900/20 border border-indigo-500/30 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4 text-indigo-400">
                <Lightbulb className="w-5 h-5" />
                <h3 className="font-bold text-white">עדכונים מומלצים למותג</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {report.actionableUpdates.slogan && (
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-1">סלוגן חדש</div>
                    <div className="text-sm font-medium text-white">{report.actionableUpdates.slogan}</div>
                  </div>
                )}
                {report.actionableUpdates.primaryColor && (
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-1">צבע ראשי</div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: report.actionableUpdates.primaryColor }}
                      />
                      <div className="text-sm font-medium text-white">{report.actionableUpdates.primaryColor}</div>
                    </div>
                  </div>
                )}
                {report.actionableUpdates.newService && (
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-1">שירות מומלץ להוספה</div>
                    <div className="text-sm font-medium text-white">{report.actionableUpdates.newService}</div>
                  </div>
                )}
              </div>
              <button
                onClick={handleApplyUpdates}
                disabled={appliedUpdates}
                className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                {appliedUpdates ? (
                  <>
                    <Check className="w-5 h-5" />
                    ההמלצות יושמו בהצלחה!
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    עדכן את ה-DNA של המותג
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Market Research Collection Listing ("מחקר שוק") + Reusable Info Pages */}
      <div className="bg-slate-900/80 border border-slate-700/60 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                3. קולקציית &quot;מחקר שוק&quot; — מאגר מחקרים ועמודי מידע לשימוש חוזר ({researchList.length})
              </h3>
              <p className="text-xs text-slate-400">
                כל סריקת אתר או מחקר שוק נשמרים כאן עם עמוד מידע ייעודי לשימוש חוזר
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadResearchCollection}
            disabled={isLoadingList}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingList ? 'animate-spin' : ''}`} />
            <span>רענן מאגר</span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חפש במחקרי השוק וסריקות האתרים..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-1.5">
            {(
              [
                { id: 'all', label: 'הכל' },
                { id: 'website_scan', label: 'סריקות אתר' },
                { id: 'market_research', label: 'מחקרי שוק' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setTypeFilter(f.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  typeFilter === f.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Listing Grid */}
        {filteredResearch.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
            {isLoadingList
              ? 'טוען מחקרים מקולקציית מחקר שוק...'
              : 'אין עדיין מחקרים שמורים. הפעל סריקת אתר או סוכן מחקר שוק למעלה כדי ליצור את המחקר ועמוד המידע הראשונים.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResearch.map((item) => {
              const isScan = item.type === 'website_scan';
              const dateLabel = new Date(item.createdAt).toLocaleDateString('he-IL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              });
              const palette =
                item.learnedSiteProfile?.extractedPalette ||
                item.rawColors?.slice(0, 5).map((c) => c.hex) ||
                [];

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mb-1 ${
                            isScan
                              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                              : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {isScan ? 'סריקת אתר (KOSAI)' : 'מחקר שוק (AI)'}
                        </span>
                        <h4 className="text-sm font-black text-white">{item.title}</h4>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0">{dateLabel}</span>
                    </div>

                    {item.sourceUrl && (
                      <div className="text-[11px] text-indigo-400 truncate" dir="ltr">
                        {item.sourceUrl}
                      </div>
                    )}

                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{item.summary}</p>

                    {palette.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1">
                        {palette.slice(0, 6).map((hex, i) => (
                          <span
                            key={i}
                            title={hex}
                            className="w-4 h-4 rounded-md border border-slate-700"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions for reuse */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
                    {item.infoPageUrl ? (
                      <a
                        href={item.infoPageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 text-[11px] font-bold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>פתח עמוד מידע</span>
                      </a>
                    ) : null}

                    <button
                      type="button"
                      disabled={generatingPageId === item.id}
                      onClick={() => handleRegenerateInfoPage(item)}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 text-[11px] font-bold flex items-center gap-1"
                    >
                      {generatingPageId === item.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <FilePlus2 className="w-3 h-3" />
                      )}
                      <span>{item.infoPageUrl ? 'סנכרן עמוד מידע' : 'הפק עמוד מידע'}</span>
                    </button>

                    {item.infoPageUrl && (
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedId === item.id ? 'הועתק!' : 'העתק קישור'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleLoadItemToView(item)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold"
                    >
                      הצג פרטים
                    </button>

                    {item.extractedBrand && (
                      <button
                        type="button"
                        onClick={() =>
                          handleApplyScanToBrandDna(item.extractedBrand, item.learnedSiteProfile, {
                            content: true,
                            colors: true,
                            designAndLayout: true,
                          })
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-[11px] font-bold"
                      >
                        החל מיתוג
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteResearch(item.id)}
                      title="מחק מהקולקציה"
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 mr-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
