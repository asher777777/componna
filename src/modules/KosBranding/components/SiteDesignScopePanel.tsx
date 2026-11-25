import React, { useState, useEffect, useCallback } from 'react';
import { useBrandDna } from '../hooks/useBrandDna';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import { TenantStylePreset, TenantLayoutArchetype } from '../types/brandDna';
import { pageBuilderFirestore } from '../../KosWebAi/services/pageBuilderFirestore';
import { PageBuilderConfig, LAYOUT_ARCHETYPES, LayoutArchetype } from '../../KosWebAi/types/pageBuilder.types';
import {
  applyBrandDesignTokensToAllTenantPages,
  applyLayoutArchetypeToAllTenantPages,
  applyStylePresetToPage,
  applyLayoutArchetypeToPage,
  updateSingleSectionDesign,
  restoreAllTenantPagesFromLatestSnapshot,
  PRESET_TITLE_MAP,
} from '../../KosWebAi/services/pageStylePresetService';
import { syncAllTenantPagesWithBrandDna } from '../../KosWebAi/services/pageBrandSyncService';
import {
  listBrandDnaBackups,
  saveBrandDnaBackup,
  BrandDnaBackupEntry,
} from '../services/brandDnaFirestore';
import {
  Globe,
  Layers,
  LayoutTemplate,
  Palette,
  Type,
  Sparkles,
  CheckCircle2,
  Loader2,
  RefreshCw,
  FileCode2,
  Sliders,
  Wand2,
  RotateCcw,
} from 'lucide-react';

interface SiteDesignScopePanelProps {
  onOpenScraper?: () => void;
}

const STYLE_PRESET_LIST: Array<{ id: TenantStylePreset; label: string }> = [
  { id: 'standard', label: 'סטנדרטי ומאוזן' },
  { id: 'feminine', label: 'נשי ורך' },
  { id: 'masculine', label: 'גברי ועוצמתי' },
  { id: 'spiritual', label: 'רוחני ועדין' },
  { id: 'sharp', label: 'חד וטכנולוגי' },
  { id: 'analytical', label: 'אנליטי ומדעי' },
];

const BUTTON_SHAPE_LIST = [
  { id: 'rounded', label: 'מעוגל (Rounded)' },
  { id: 'pill', label: 'קפסולה (Pill)' },
  { id: 'sharp', label: 'חד (Sharp)' },
  { id: 'chiseled', label: 'חתוך (Chiseled)' },
];

export const SiteDesignScopePanel: React.FC<SiteDesignScopePanelProps> = ({ onOpenScraper }) => {
  const { brandDna, updateDesignTokens, setFullBrandDna, saveNow } = useBrandDna();
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const activeTenant = tenantId || '_master';

  // Global site impact checkboxes
  const [applyDesign, setApplyDesign] = useState(true);
  const [applyLayout, setApplyLayout] = useState(false);
  const [applyMicrocopy, setApplyMicrocopy] = useState(false);
  const [selectedGlobalArchetype, setSelectedGlobalArchetype] = useState<TenantLayoutArchetype>(
    brandDna.designTokens.defaultLayoutArchetype ||
      brandDna.learnedSiteProfile?.recommendedLayoutArchetype ||
      'bento_hub'
  );
  const [isBulkRunning, setIsBulkRunning] = useState(false);

  // Per-page & per-section state
  const [pages, setPages] = useState<PageBuilderConfig[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [selectedSectionKey, setSelectedSectionKey] = useState<string>('');

  // Per-page overrides
  const [pagePreset, setPagePreset] = useState<TenantStylePreset>('standard');
  const [pageArchetype, setPageArchetype] = useState<LayoutArchetype>('bento_hub');
  const [includePageLayoutChange, setIncludePageLayoutChange] = useState(false);
  const [isSavingPage, setIsSavingPage] = useState(false);

  // Recovery / Rollback state
  const [dnaBackups, setDnaBackups] = useState<BrandDnaBackupEntry[]>([]);
  const [selectedBackupId, setSelectedBackupId] = useState<string>('');
  const [isRestoringPages, setIsRestoringPages] = useState(false);
  const [isRestoringDna, setIsRestoringDna] = useState(false);

  // Per-section overrides
  const [secPreset, setSecPreset] = useState<TenantStylePreset>('standard');
  const [secUseBrandColors, setSecUseBrandColors] = useState<boolean>(true);
  const [secBgColor, setSecBgColor] = useState<string>('');
  const [secTitleColor, setSecTitleColor] = useState<string>('');
  const [secAccentColor, setSecAccentColor] = useState<string>('');
  const [secButtonColor, setSecButtonColor] = useState<string>('');
  const [secButtonShape, setSecButtonShape] = useState<string>('rounded');
  const [isSavingSection, setIsSavingSection] = useState(false);

  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotice = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4000);
  };

  useEffect(() => {
    const nextArch =
      brandDna.designTokens.defaultLayoutArchetype ||
      brandDna.learnedSiteProfile?.recommendedLayoutArchetype;
    if (nextArch) setSelectedGlobalArchetype(nextArch);
  }, [brandDna.designTokens.defaultLayoutArchetype, brandDna.learnedSiteProfile?.recommendedLayoutArchetype]);

  const loadTenantPages = useCallback(async () => {
    setIsLoadingPages(true);
    try {
      const list = await pageBuilderFirestore.getAllPages(db || null, activeTenant);
      setPages(list || []);
      if (list && list.length > 0) {
        const current = list.find((p) => p.pageId === selectedPageId) || list.find((p) => p.isHomePage) || list[0];
        setSelectedPageId(current.pageId);
      }
    } catch (err) {
      console.warn('[SiteDesignScopePanel] Failed to load tenant pages:', err);
    } finally {
      setIsLoadingPages(false);
    }
  }, [db, activeTenant, selectedPageId]);

  const loadBackups = useCallback(async () => {
    try {
      const list = await listBrandDnaBackups(db || undefined, activeTenant);
      setDnaBackups(list);
      if (list.length > 0 && !selectedBackupId) {
        setSelectedBackupId(list[0].id);
      }
    } catch {}
  }, [db, activeTenant, selectedBackupId]);

  useEffect(() => {
    loadTenantPages();
    loadBackups();
  }, [loadTenantPages, loadBackups]);

  const selectedPage = pages.find((p) => p.pageId === selectedPageId) || null;
  const sectionEntries = selectedPage?.sections ? Object.entries(selectedPage.sections) : [];

  useEffect(() => {
    if (!selectedPage) return;
    setPagePreset((selectedPage.globalSettings?.theme as TenantStylePreset) || 'standard');
    setPageArchetype((selectedPage.globalSettings?.layoutArchetype as LayoutArchetype) || 'bento_hub');

    const keys = Object.keys(selectedPage.sections || {});
    if (keys.length > 0 && (!selectedSectionKey || !selectedPage.sections?.[selectedSectionKey])) {
      setSelectedSectionKey(keys[0]);
    }
  }, [selectedPage, selectedSectionKey]);

  useEffect(() => {
    if (!selectedPage || !selectedSectionKey) return;
    const sec = selectedPage.sections?.[selectedSectionKey];
    if (!sec) return;
    setSecPreset((sec.stylePreset as TenantStylePreset) || (selectedPage.globalSettings?.theme as TenantStylePreset) || 'standard');
    setSecUseBrandColors(sec.useBrandColors !== false);
    setSecBgColor(sec.backgroundColor || '');
    setSecTitleColor(sec.titleColor || '');
    setSecAccentColor(sec.accentColor || brandDna.designTokens.primaryColor || '');
    setSecButtonColor(sec.primaryButtonColor || brandDna.designTokens.buttonBgColor || '');
    setSecButtonShape(sec.buttonShape || 'rounded');
  }, [selectedPage, selectedSectionKey, brandDna.designTokens.primaryColor, brandDna.designTokens.buttonBgColor]);

  const handleBulkApply = async () => {
    if (!applyDesign && !applyLayout && !applyMicrocopy) {
      showNotice('error', 'יש לבחור לפחות רכיב אחד להחלה גורפת (עיצוב, פריסה או מיני-קופי).');
      return;
    }
    setIsBulkRunning(true);
    try {
      if (applyLayout) {
        updateDesignTokens({ defaultLayoutArchetype: selectedGlobalArchetype });
      }
      await saveNow();

      const summaryParts: string[] = [];
      if (applyDesign) {
        const res = await applyBrandDesignTokensToAllTenantPages(db || null, activeTenant, brandDna.designTokens);
        summaryParts.push(`עיצוב וצבעים (${res.updatedCount} עמודים)`);
      }
      if (applyLayout) {
        const res = await applyLayoutArchetypeToAllTenantPages(
          db || null,
          activeTenant,
          selectedGlobalArchetype as LayoutArchetype,
          brandDna
        );
        summaryParts.push(`פריסה (${res.updatedCount} עמודים)`);
      }
      if (applyMicrocopy) {
        const res = await syncAllTenantPagesWithBrandDna(db || undefined, activeTenant, brandDna);
        summaryParts.push(`מיני-קופי (${res.updatedCount} עמודים)`);
      }

      await loadTenantPages();
      showNotice('success', `השינויים הגורפים הוחלו בהצלחה: ${summaryParts.join(' • ')}`);
    } catch (err: any) {
      showNotice('error', err?.message || 'שגיאה בהחלה גורפת על עמודי האתר');
    } finally {
      setIsBulkRunning(false);
    }
  };

  const handleRestoreAllPages = async () => {
    if (!window.confirm('האם לשחזר את כל עמודי הטננט לגיבוי (Snapshot) האחרון שנשמר לפני השינוי?')) return;
    setIsRestoringPages(true);
    try {
      const res = await restoreAllTenantPagesFromLatestSnapshot(db || null, activeTenant);
      await loadTenantPages();
      if (res.restoredCount > 0) {
        showNotice('success', `שוחזרו בהצלחה ${res.restoredCount} עמודים לגרסתם הקודמת!`);
      } else {
        showNotice('error', 'לא נמצאו Snapshots קודמים לשחזור בעמודי הטננט.');
      }
    } catch (err: any) {
      showNotice('error', err?.message || 'שגיאה בשחזור העמודים');
    } finally {
      setIsRestoringPages(false);
    }
  };

  const handleRestoreDnaBackup = async () => {
    const target = dnaBackups.find((b) => b.id === selectedBackupId);
    if (!target) return;
    if (!window.confirm(`האם לשחזר את נתוני המיתוג (Brand DNA) מתוך "${target.label}"?`)) return;
    setIsRestoringDna(true);
    try {
      await saveBrandDnaBackup(brandDna, 'לפני שחזור Brand DNA', db || undefined, activeTenant);
      setFullBrandDna(target.brandDna);
      await saveNow();
      await loadBackups();
      showNotice('success', 'נתוני ה-Brand DNA הקודמים שוחזרו בהצלחה!');
    } catch (err: any) {
      showNotice('error', err?.message || 'שגיאה בשחזור נתוני המיתוג');
    } finally {
      setIsRestoringDna(false);
    }
  };

  const handleApplyPageChanges = async () => {
    if (!selectedPage) return;
    setIsSavingPage(true);
    try {
      const { updatedPage: presetPage } = applyStylePresetToPage(selectedPage, pagePreset);
      const finalPage = includePageLayoutChange
        ? applyLayoutArchetypeToPage(presetPage, pageArchetype, brandDna, activeTenant).updatedPage
        : presetPage;
      await pageBuilderFirestore.savePage(finalPage, db || null, activeTenant);
      await loadTenantPages();
      showNotice(
        'success',
        includePageLayoutChange
          ? `העמוד "${selectedPage.pageTitle || selectedPage.slug}" עודכן עם סגנון ${PRESET_TITLE_MAP[pagePreset] || pagePreset} ופריסת ${LAYOUT_ARCHETYPES[pageArchetype]?.name || pageArchetype}.`
          : `סגנון העמוד "${selectedPage.pageTitle || selectedPage.slug}" עודכן ל-${PRESET_TITLE_MAP[pagePreset] || pagePreset} (ללא שינוי תוכן או פריסה).`
      );
    } catch (err: any) {
      showNotice('error', err?.message || 'שגיאה בעדכון העמוד');
    } finally {
      setIsSavingPage(false);
    }
  };

  const handleSaveSectionDesign = async () => {
    if (!selectedPage || !selectedSectionKey) return;
    setIsSavingSection(true);
    try {
      const res = await updateSingleSectionDesign(db || null, activeTenant, selectedPage.pageId, selectedSectionKey, {
        preset: secPreset,
        useBrandColors: secUseBrandColors,
        backgroundColor: secBgColor || undefined,
        titleColor: secTitleColor || undefined,
        accentColor: secAccentColor || undefined,
        primaryButtonColor: secButtonColor || undefined,
        buttonShape: secButtonShape,
      });
      if (res.success) {
        await loadTenantPages();
        showNotice('success', `העיצוב של האזור "${selectedSectionKey}" בעמוד "${selectedPage.pageTitle || selectedPage.slug}" עודכן ונשמר בהצלחה!`);
      } else {
        showNotice('error', res.error || 'שגיאה בשמירת האזור');
      }
    } catch (err: any) {
      showNotice('error', err?.message || 'שגיאה בעדכון האזור');
    } finally {
      setIsSavingSection(false);
    }
  };

  const learned = brandDna.learnedSiteProfile;

  return (
    <div className="space-y-6 pt-4 border-t border-slate-700/60" dir="rtl">
      {notice && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            notice.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-red-500/15 border-red-500/40 text-red-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice.text}</span>
        </div>
      )}

      {/* Safety Recovery & Rollback Panel */}
      <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
            <RotateCcw className="w-4 h-4" />
            <span>שחזור תוכן ועיצוב קודם (גיבוי אוטומטי לטננט {activeTenant})</span>
          </div>
          <button
            type="button"
            disabled={isRestoringPages}
            onClick={handleRestoreAllPages}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 shrink-0"
          >
            {isRestoringPages ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
            <span>שחזר את כל העמודים לגרסה הקודמת (Snapshot)</span>
          </button>
        </div>

        {dnaBackups.length > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-amber-500/20">
            <select
              value={selectedBackupId}
              onChange={(e) => setSelectedBackupId(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
            >
              {dnaBackups.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label} ({new Date(b.timestamp).toLocaleString('he-IL')})
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={isRestoringDna || !selectedBackupId}
              onClick={handleRestoreDnaBackup}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isRestoringDna ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
              <span>שחזר Brand DNA מגיבוי</span>
            </button>
          </div>
        )}
      </div>

      {/* Learned Website Profile Summary (if exists) */}
      <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                5. למידת אתר חכמה (KOSAI) והחלה על האתר
              </h3>
              <p className="text-xs text-slate-400">
                {learned?.sourceUrl
                  ? `אתר שנלמד לאחרונה: ${learned.sourceUrl}`
                  : 'סרוק אתר קיים עם KOSAI כדי ללמוד צבעים, פריסה, אלמנטים עיצוביים ומיני-קופי'}
              </p>
            </div>
          </div>

          {onOpenScraper && (
            <button
              type="button"
              onClick={onOpenScraper}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 shrink-0"
            >
              <Globe className="w-4 h-4" />
              <span>{learned?.sourceUrl ? 'סרוק אתר מחדש (KOSAI)' : 'סרוק ולמד אתר עם KOSAI'}</span>
            </button>
          )}
        </div>

        {learned && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-[11px]">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px]">פלטה שנלמדה</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(learned.extractedPalette || []).slice(0, 5).map((hex, i) => (
                  <span
                    key={i}
                    title={hex}
                    className="w-5 h-5 rounded-md border border-slate-700"
                    style={{ backgroundColor: hex }}
                  />
                ))}
                {(!learned.extractedPalette || learned.extractedPalette.length === 0) && (
                  <span className="text-slate-500">—</span>
                )}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px]">ארכיטיפ פריסה מומלץ</span>
              <strong className="text-slate-200 block">
                {learned.recommendedLayoutArchetype
                  ? LAYOUT_ARCHETYPES[learned.recommendedLayoutArchetype as LayoutArchetype]?.name ||
                    learned.recommendedLayoutArchetype
                  : '—'}
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px]">סיכום אלמנטים ופריסה</span>
              <span className="text-slate-300 line-clamp-2">
                {learned.designElementsSummary || learned.layoutNotes || '—'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Global Site Impact */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Wand2 className="w-4 h-4 text-amber-400" />
          <span>5.1 השפעה גורפת על כל עמודי האתר (עיצוב / פריסה / מיני-קופי)</span>
        </div>
        <p className="text-xs text-slate-400">
          בחר אילו רכיבים מתוך בסיס הנתונים של הטננט להחיל באופן גורף על כל עמודי האתר (נשמר גיבוי אוטומטי לכל עמוד):
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
              applyDesign
                ? 'bg-indigo-600/15 border-indigo-500 text-indigo-100'
                : 'bg-slate-900/60 border-slate-700/60 text-slate-400'
            }`}
          >
            <input
              type="checkbox"
              checked={applyDesign}
              onChange={(e) => setApplyDesign(e.target.checked)}
              className="mt-0.5 rounded border-slate-600 text-indigo-600"
            />
            <div>
              <div className="text-xs font-black flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-rose-400" />
                <span>עיצוב וצבעים</span>
              </div>
              <p className="text-[11px] opacity-80 mt-0.5">
                פלטת צבעים, פונט, עיגול פינות, סגנון כפתורים והסגנון המוביל
              </p>
            </div>
          </label>

          <label
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
              applyLayout
                ? 'bg-emerald-600/15 border-emerald-500 text-emerald-100'
                : 'bg-slate-900/60 border-slate-700/60 text-slate-400'
            }`}
          >
            <input
              type="checkbox"
              checked={applyLayout}
              onChange={(e) => setApplyLayout(e.target.checked)}
              className="mt-0.5 rounded border-slate-600 text-emerald-600"
            />
            <div className="w-full">
              <div className="text-xs font-black flex items-center gap-1.5">
                <LayoutTemplate className="w-3.5 h-3.5 text-emerald-400" />
                <span>פריסת האתר (Layout)</span>
              </div>
              <select
                value={selectedGlobalArchetype}
                onChange={(e) => {
                  setSelectedGlobalArchetype(e.target.value as TenantLayoutArchetype);
                  setApplyLayout(true);
                }}
                onClick={(e) => e.stopPropagation()}
                className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white outline-none"
              >
                {Object.values(LAYOUT_ARCHETYPES).map((arch) => (
                  <option key={arch.id} value={arch.id}>
                    {arch.name}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <label
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
              applyMicrocopy
                ? 'bg-amber-600/15 border-amber-500 text-amber-100'
                : 'bg-slate-900/60 border-slate-700/60 text-slate-400'
            }`}
          >
            <input
              type="checkbox"
              checked={applyMicrocopy}
              onChange={(e) => setApplyMicrocopy(e.target.checked)}
              className="mt-0.5 rounded border-slate-600 text-amber-600"
            />
            <div>
              <div className="text-xs font-black flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-amber-400" />
                <span>מיני-קופי ושפת ממשק</span>
              </div>
              <p className="text-[11px] opacity-80 mt-0.5">
                כפתורי CTA, כותרות אזורים, טקסטים בטפסים ושפת מותג
              </p>
            </div>
          </label>
        </div>

        <button
          type="button"
          disabled={isBulkRunning}
          onClick={handleBulkApply}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 disabled:opacity-50"
        >
          {isBulkRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
          <span>החל שינויים נבחרים באופן גורף על כל האתר</span>
        </button>
      </div>

      {/* Per-Page & Per-Section Customization */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>5.2 שינוי עיצוב פרטני לעמוד או לאזור מסוים באתר</span>
          </div>
          <button
            type="button"
            onClick={loadTenantPages}
            disabled={isLoadingPages}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 rounded-lg text-[11px] font-bold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPages ? 'animate-spin' : ''}`} />
            <span>רענן עמודים ({pages.length})</span>
          </button>
        </div>

        {pages.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 text-xs text-slate-400">
            {isLoadingPages
              ? 'טוען עמודי אתר של הטננט...'
              : 'לא נמצאו עמודים שמורים לטננט זה עדיין. צרו עמוד ב-KosWebAi כדי לעצב אותו פרטנית מכאן.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Per-Page Box */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-700/60 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-cyan-300">
                <FileCode2 className="w-4 h-4" />
                <span>א. התאמה פרטנית לעמוד מסוים</span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">בחר עמוד:</label>
                <select
                  value={selectedPageId}
                  onChange={(e) => setSelectedPageId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  {pages.map((p) => (
                    <option key={p.pageId} value={p.pageId}>
                      {p.pageTitle || p.slug || p.pageId} {p.isHomePage ? '(עמוד הבית)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">סגנון העמוד:</label>
                  <select
                    value={pagePreset}
                    onChange={(e) => setPagePreset(e.target.value as TenantStylePreset)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    {STYLE_PRESET_LIST.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">פריסת העמוד (אופציונלי):</label>
                  <select
                    value={pageArchetype}
                    disabled={!includePageLayoutChange}
                    onChange={(e) => setPageArchetype(e.target.value as LayoutArchetype)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none disabled:opacity-40"
                  >
                    {Object.values(LAYOUT_ARCHETYPES).map((arch) => (
                      <option key={arch.id} value={arch.id}>
                        {arch.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePageLayoutChange}
                  onChange={(e) => setIncludePageLayoutChange(e.target.checked)}
                  className="rounded border-slate-600 text-cyan-600"
                />
                <span>החל גם שינוי סדר ופריסת אזורים (Layout) בעמוד זה</span>
              </label>

              <button
                type="button"
                disabled={isSavingPage || !selectedPage}
                onClick={handleApplyPageChanges}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSavingPage ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{includePageLayoutChange ? 'שמור סגנון ופריסה לעמוד זה' : 'שמור סגנון וצבעים לעמוד זה (ללא שינוי תוכן)'}</span>
              </button>
            </div>

            {/* Per-Section Box */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-700/60 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-purple-300">
                <Layers className="w-4 h-4" />
                <span>ב. התאמה פרטנית לאזור (Section) מסוים בעמוד</span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">בחר אזור בעמוד:</label>
                <select
                  value={selectedSectionKey}
                  onChange={(e) => setSelectedSectionKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  {sectionEntries.map(([key, sec]) => (
                    <option key={key} value={key}>
                      {sec?.title || sec?.type || key} ({key})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">סגנון האזור:</label>
                  <select
                    value={secPreset}
                    onChange={(e) => setSecPreset(e.target.value as TenantStylePreset)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    {STYLE_PRESET_LIST.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">צורת כפתור:</label>
                  <select
                    value={secButtonShape}
                    onChange={(e) => setSecButtonShape(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    {BUTTON_SHAPE_LIST.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={secUseBrandColors}
                  onChange={(e) => setSecUseBrandColors(e.target.checked)}
                  className="rounded border-slate-600 text-purple-600"
                />
                <span>השתמש בצבעי המותג הראשיים (כבה לדריסת צבעים ידנית לאזור זה)</span>
              </label>

              {!secUseBrandColors && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block">רקע אזור</span>
                    <input
                      type="color"
                      value={secBgColor || '#0f172a'}
                      onChange={(e) => setSecBgColor(e.target.value)}
                      className="w-full h-8 rounded cursor-pointer bg-slate-950 border border-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block">צבע כותרת</span>
                    <input
                      type="color"
                      value={secTitleColor || '#ffffff'}
                      onChange={(e) => setSecTitleColor(e.target.value)}
                      className="w-full h-8 rounded cursor-pointer bg-slate-950 border border-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block">צבע הדגשה</span>
                    <input
                      type="color"
                      value={secAccentColor || '#6366f1'}
                      onChange={(e) => setSecAccentColor(e.target.value)}
                      className="w-full h-8 rounded cursor-pointer bg-slate-950 border border-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block">צבע כפתור</span>
                    <input
                      type="color"
                      value={secButtonColor || '#6366f1'}
                      onChange={(e) => setSecButtonColor(e.target.value)}
                      className="w-full h-8 rounded cursor-pointer bg-slate-950 border border-slate-700"
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={isSavingSection || !selectedPage || !selectedSectionKey}
                onClick={handleSaveSectionDesign}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSavingSection ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>שמור עיצוב לאזור זה בלבד</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
