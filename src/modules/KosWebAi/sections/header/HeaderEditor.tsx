import React, { useState } from 'react';
import { HeaderSectionConfig } from '../../types/sectionConfigs';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { useBrandDna } from '../../../KosBranding/hooks/useBrandDna';
import {
  LayoutTemplate,
  Check,
  Plus,
  Trash2,
  Info,
  Sparkles,
  Link as LinkIcon,
  Phone,
  MessageCircle,
  LogIn,
  Layers,
  Image as ImageIcon,
  Anchor,
  FileText,
  Globe,
  Eye,
  EyeOff,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../../core/tenant';
import { pageBuilderFirestore } from '../../services/pageBuilderFirestore';
import { PageBuilderConfig } from '../../types/pageBuilder.types';
import { usePageBuilderContext } from '../../context/PageBuilderContext';

interface HeaderEditorProps {
  config: HeaderSectionConfig;
  onChange: (updated: HeaderSectionConfig) => void;
}

export const HeaderEditor: React.FC<HeaderEditorProps> = ({ config, onChange }) => {
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const brandContext = useBrandDna();
  const brandLogo = brandContext?.brandDna?.identity?.logoUrl;
  const brandCompanyName = brandContext?.brandDna?.identity?.companyName || 'קושאן';

  const [tenantPages, setTenantPages] = useState<PageBuilderConfig[]>([]);

  const updateConfig = (patch: Partial<HeaderSectionConfig>) => {
    onChange({
      ...config,
      ...patch,
    });
  };

  React.useEffect(() => {
    let mounted = true;
    pageBuilderFirestore.getAllPages(db, tenantId)
      .then((pages) => {
        if (mounted && pages) {
          const published = pages.filter((p) => p.published !== false);
          published.sort((a, b) => {
            if (a.isHomePage) return -1;
            if (b.isHomePage) return 1;
            return 0;
          });
          setTenantPages(published);
        }
      })
      .catch((err) => console.warn('[HeaderEditor] Failed loading pages:', err));

    return () => {
      mounted = false;
    };
  }, [db, tenantId]);

  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const layouts = [
    { id: 'capsule-floating', label: 'קפסולה צפה (KosTogether Style - ברירת מחדל)', desc: 'כפתור קפסולה מעוצב עם אייקון מותג, תפריט מגירה צדדי ומצב יום/לילה' },
    { id: 'floating-glass', label: 'צף עם זכוכית (Glass)', desc: 'פינות מעוגלות, אפקט טשטוש צף ומודרני 2026' },
    { id: 'classic', label: 'קלאסי מלא', desc: 'תפריט לרוחב מלא עם גבול תחתון עדין' },
    { id: 'logo-center', label: 'לוגו במרכז', desc: 'לוגו ואייקון באמצע, תפריטים ופעולות בצדדים' },
    { id: 'logo-right', label: 'לוגו בימין מלא', desc: 'לוגו מיושר לימין, תפריט במרכז ופעולות בשמאל' },
    { id: 'minimal', label: 'מינימליסטי', desc: 'גובה קומפקטי, מרווחים צפופים ונקיים' },
    { id: 'transparent', label: 'שקוף מעל התוכן', desc: 'רקע שקוף המשתלב עם אזור ה-Hero' },
  ];

  // Extract page sections for anchor selection
  let pbContext: any = null;
  try {
    pbContext = usePageBuilderContext();
  } catch (e) {
    // Context might be optional if rendered standalone
  }

  const availableAnchors = React.useMemo(() => {
    const pageCfg = pbContext?.currentPageConfig;
    if (!pageCfg?.sections) return [];
    const sectionOrder: string[] = pageCfg.sectionOrder || Object.keys(pageCfg.sections);

    return sectionOrder
      .map((secId) => {
        const sec = pageCfg.sections[secId];
        if (!sec || sec.type === 'header') return null; // Don't link to header itself
        const anchor = sec.anchorId || sec.id || secId;
        const title = sec.adminTitle || sec.title || sec.type;
        return {
          id: anchor,
          label: `${title} (#${anchor})`,
          value: `#${anchor}`,
          cleanTitle: title,
        };
      })
      .filter(Boolean) as Array<{ id: string; label: string; value: string; cleanTitle: string }>;
  }, [pbContext?.currentPageConfig]);

  const handleAddCustomLink = () => {
    const existing = config.customLinks || [];
    updateConfig({
      customLinks: [...existing, { label: 'קישור חדש', url: '#' }],
    });
  };

  const handleUpdateCustomLink = (index: number, field: 'label' | 'url', value: string) => {
    const existing = [...(config.customLinks || [])];
    if (existing[index]) {
      existing[index] = { ...existing[index], [field]: value };
      updateConfig({ customLinks: existing });
    }
  };

  const handleSelectLinkTarget = (index: number, selectedValue: string) => {
    const existing = [...(config.customLinks || [])];
    const current = existing[index];
    if (!current) return;

    if (selectedValue === 'custom') {
      // Keep existing URL or set empty if default hash
      updateConfig({ customLinks: existing });
      return;
    }

    let suggestedLabel = current.label;

    // Check if it's an anchor
    const matchedAnchor = availableAnchors.find((a) => a.value === selectedValue);
    if (matchedAnchor) {
      if (!current.label || current.label === 'קישור חדש' || current.label.trim() === '') {
        suggestedLabel = matchedAnchor.cleanTitle;
      }
    } else {
      // Check if it's a tenant page
      const matchedPage = tenantPages.find((p) => {
        const pageUrl = p.isHomePage ? '/' : `/${(p.slug || p.pageId).replace(/^\/?p\//i, '')}`;
        return pageUrl === selectedValue;
      });
      if (matchedPage) {
        if (!current.label || current.label === 'קישור חדש' || current.label.trim() === '') {
          suggestedLabel = matchedPage.pageTitle || 'עמוד';
        }
      }
    }

    existing[index] = {
      ...current,
      label: suggestedLabel,
      url: selectedValue,
    };
    updateConfig({ customLinks: existing });
  };

  const handleRemoveCustomLink = (index: number) => {
    const existing = (config.customLinks || []).filter((_, i) => i !== index);
    updateConfig({ customLinks: existing });
  };

  return (
    <div className="flex flex-col gap-6 text-right font-sans" dir="rtl">
      {/* 1. Layout Selection */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white">סגנון ופריסת ההדר</h4>
            <button
              type="button"
              onClick={() => setActiveTooltip(activeTooltip === 'layout' ? null : 'layout')}
              className="p-1 rounded-full text-slate-400 hover:text-indigo-400 transition"
              title="מידע נוסף"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
            {config.layout || 'floating-glass'}
          </span>
        </div>

        {activeTooltip === 'layout' && (
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-700 text-xs text-slate-300 relative">
            <button
              type="button"
              onClick={() => setActiveTooltip(null)}
              className="absolute left-2.5 top-2.5 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            בחרו את הפריסה הרצויה להדר. כל הפריסות נבנו בגישת Mobile-First ומתאימות אוטומטית למסכי טלפון.
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {layouts.map((l) => {
            const activeLayout = (!config.layout || config.layout === 'floating-glass') ? 'capsule-floating' : config.layout;
            const isSelected = activeLayout === l.id;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => updateConfig({ layout: l.id as any })}
                className={clsx(
                  'p-3 rounded-2xl border text-right transition-all flex flex-col justify-between gap-1 cursor-pointer',
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/15'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold">{l.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <span className="text-[10px] text-slate-400 leading-tight">{l.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Sticky Navbar Toggle */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <div>
            <span className="text-xs font-bold text-white block">תפריט דביק (Sticky)</span>
            <span className="text-[11px] text-slate-400">נשאר קבוע בראש העמוד בזמן גלילה</span>
          </div>
          <button
            type="button"
            onClick={() => updateConfig({ sticky: config.sticky === false ? true : false })}
            className={clsx(
              'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
              config.sticky !== false ? 'bg-indigo-600' : 'bg-slate-800'
            )}
          >
            <span
              className={clsx(
                'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                config.sticky !== false ? 'left-1' : 'right-1'
              )}
            />
          </button>
        </div>

        {/* Visibility Toggle Inside Editor */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <div>
            <span className="text-xs font-bold text-white block">נראות אזור ההדר (הצג / הסתר)</span>
            <span className="text-[11px] text-slate-400">
              {config.visible !== false ? 'ההדר מוצג לגולשים בראש העמוד' : 'ההדר מוסתר מגולשים (מופיע כטיוטה בעריכה)'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => updateConfig({ visible: config.visible === false ? true : false })}
            className={clsx(
              'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
              config.visible !== false ? 'bg-indigo-600' : 'bg-slate-800'
            )}
          >
            <span
              className={clsx(
                'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                config.visible !== false ? 'left-1' : 'right-1'
              )}
            />
          </button>
        </div>
      </div>

      {/* 2. Logo & Branding Settings */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-indigo-400" />
            <span>הגדרות לוגו ומיתוג</span>
          </h4>
          {brandLogo && (
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              לוגו מותג זמין
            </span>
          )}
        </div>

        {/* Use Brand DNA Logo Toggle */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {brandLogo ? (
              <img
                src={brandLogo}
                alt="Brand DNA Logo"
                className="w-8 h-8 rounded-lg object-contain bg-slate-900 p-0.5 border border-slate-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-xs">
                ק
              </div>
            )}
            <div>
              <span className="text-xs font-bold text-white block">
                השתמש בלוגו מרכיב המיתוג (Brand DNA)
              </span>
              <span className="text-[11px] text-slate-400">
                {brandCompanyName ? `מותג פעיל: ${brandCompanyName}` : 'מסנכרן אוטומטית עם הגדרות העסק'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => updateConfig({ useBrandLogo: config.useBrandLogo === false ? true : false })}
            className={clsx(
              'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
              config.useBrandLogo !== false ? 'bg-indigo-600' : 'bg-slate-800'
            )}
          >
            <span
              className={clsx(
                'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                config.useBrandLogo !== false ? 'left-1' : 'right-1'
              )}
            />
          </button>
        </div>

        {/* Custom Logo URL (if not using brand logo) */}
        {config.useBrandLogo === false && (
          <PageBuilderInput
            label="כתובת לוגו מותאם אישית (URL)"
            placeholder="https://example.com/logo.png"
            value={config.customLogoUrl || ''}
            onChange={(e) => updateConfig({ customLogoUrl: e.target.value })}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <PageBuilderInput
            label="שם העסק / כותרת הלוגו"
            placeholder={brandCompanyName}
            value={config.logoText || ''}
            onChange={(e) => updateConfig({ logoText: e.target.value })}
          />
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800 mt-5">
            <span className="text-xs font-bold text-white">הצג טקסט ליד הלוגו</span>
            <button
              type="button"
              onClick={() => updateConfig({ showLogoText: config.showLogoText === false ? true : false })}
              className={clsx(
                'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
                config.showLogoText !== false ? 'bg-indigo-600' : 'bg-slate-800'
              )}
            >
              <span
                className={clsx(
                'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                config.showLogoText !== false ? 'left-1' : 'right-1'
                )}
              />
            </button>
          </div>
        </div>

        {/* Logo Sizing & Alignment */}
        <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-white mb-2 block">גודל הלוגו / אייקון</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'sm', label: 'קטן (S)' },
                { id: 'md', label: 'רגיל (M)' },
                { id: 'lg', label: 'גדול (L)' },
                { id: 'xl', label: 'ענק (XL)' },
              ].map((s) => {
                const isSelected = (config.logoSize || 'md') === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => updateConfig({ logoSize: s.id as any })}
                    className={clsx(
                      'py-2 px-1 rounded-xl text-center text-xs font-bold border transition cursor-pointer',
                      isSelected
                        ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    )}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-white mb-2 block">מיקום הלוגו והתפריט</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'right', label: 'בימין' },
                { id: 'center', label: 'באמצע' },
                { id: 'left', label: 'בשמאל' },
              ].map((al) => {
                const isSelected = (config.logoAlignment || (config.layout === 'logo-center' || config.layout === 'centered' ? 'center' : 'right')) === al.id;
                return (
                  <button
                    key={al.id}
                    type="button"
                    onClick={() => updateConfig({ logoAlignment: al.id as any })}
                    className={clsx(
                      'py-2 px-1 rounded-xl text-center text-xs font-bold border transition cursor-pointer',
                      isSelected
                        ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    )}
                  >
                    {al.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Menu Settings */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>סוג התפריט והניווט</span>
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => updateConfig({ menuMode: 'dynamic-tenant' })}
            className={clsx(
              'p-3 rounded-2xl border text-right transition-all flex flex-col gap-1 cursor-pointer',
              (config.menuMode || 'dynamic-tenant') === 'dynamic-tenant'
                ? 'bg-indigo-600/20 border-indigo-500 text-white'
                : 'bg-slate-950/70 border-slate-800 text-slate-300'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">תפריט דינמי</span>
              {(config.menuMode || 'dynamic-tenant') === 'dynamic-tenant' && (
                <Check className="w-3.5 h-3.5 text-indigo-400" />
              )}
            </div>
            <span className="text-[10px] text-slate-400">קולקציית עמודי התוכן של ה-Tenant</span>
          </button>

          <button
            type="button"
            onClick={() => updateConfig({ menuMode: 'custom' })}
            className={clsx(
              'p-3 rounded-2xl border text-right transition-all flex flex-col gap-1 cursor-pointer',
              config.menuMode === 'custom'
                ? 'bg-indigo-600/20 border-indigo-500 text-white'
                : 'bg-slate-950/70 border-slate-800 text-slate-300'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">קישורים ידניים</span>
              {config.menuMode === 'custom' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
            </div>
            <span className="text-[10px] text-slate-400">הגדרה אישית של קישורים וכפתורים</span>
          </button>

          <button
            type="button"
            onClick={() => updateConfig({ menuMode: 'none' })}
            className={clsx(
              'p-3 rounded-2xl border text-right transition-all flex flex-col gap-1 cursor-pointer',
              config.menuMode === 'none'
                ? 'bg-indigo-600/20 border-indigo-500 text-white'
                : 'bg-slate-950/70 border-slate-800 text-slate-300'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">ללא תפריט</span>
              {config.menuMode === 'none' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
            </div>
            <span className="text-[10px] text-slate-400">הצגת לוגו וכפתורי פעולה בלבד</span>
          </button>
        </div>

        {/* Desktop vs Mobile Menu Display (Hamburger Option) */}
        {config.menuMode !== 'none' && (
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 pt-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">תצוגת התפריט בדסקטופ ובמובייל</span>
                <span className="text-[11px] text-slate-400">
                  במובייל תפריט המבורגר מוגדר כברירת מחדל קבועה שאינה ניתנת לשינוי. בדסקטופ ניתן לבחור:
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'links', label: 'קישורים גלויים', desc: 'תפריט אופקי רגיל' },
                { id: 'hamburger', label: 'תפריט המבורגר', desc: 'כפתור המבורגר בלבד' },
                { id: 'both', label: 'קישורים + המבורגר', desc: 'תפריט גלוי וגם כפתור' },
              ].map((opt) => {
                const isSel = (config.desktopMenuDisplay || 'links') === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateConfig({ desktopMenuDisplay: opt.id as any })}
                    className={clsx(
                      'p-2.5 rounded-xl border text-right transition cursor-pointer flex flex-col gap-0.5',
                      isSel
                        ? 'bg-indigo-600/25 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{opt.label}</span>
                      {isSel && <Check className="w-3 h-3 text-indigo-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Tenant Info Notice & Menu Title Overrides */}
        {(config.menuMode || 'dynamic-tenant') === 'dynamic-tenant' && (
          <div className="space-y-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>
                התפריט מושך את עמודי האתר המפורסמים. באפשרותך להתאים אישית כותרות או להסתיר עמודים ספציפיים מלהופיע בתפריט הניווט:
              </span>
            </div>

            {/* List of tenant pages with custom label override fields */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-white block">ניהול פריטי התפריט (עריכת כותרת / הצגה והסתרה)</span>
              {tenantPages.length === 0 ? (
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                  טוען עמודי תוכן פעילים...
                </div>
              ) : (
                tenantPages.map((page) => {
                  const key = page.slug || page.shortSlug || page.pageId || (page.isHomePage ? 'home' : '');
                  const currentOverride = (config.menuTitleOverrides && (config.menuTitleOverrides[key] || config.menuTitleOverrides[page.pageId])) || '';
                  const isHidden = (config.hiddenPageIds || []).includes(page.pageId) || (config.hiddenPageIds || []).includes(key);

                  const toggleHidePage = () => {
                    const currentHidden = config.hiddenPageIds || [];
                    let updated: string[];
                    if (isHidden) {
                      updated = currentHidden.filter((id) => id !== page.pageId && id !== key);
                    } else {
                      updated = [...currentHidden, page.pageId];
                    }
                    updateConfig({ hiddenPageIds: updated });
                  };

                  return (
                    <div
                      key={page.pageId}
                      className={clsx(
                        'p-3 rounded-2xl border flex items-center justify-between gap-3 text-right transition-all',
                        isHidden
                          ? 'bg-slate-950/40 border-slate-800/50 opacity-60'
                          : 'bg-slate-950/80 border-slate-800'
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={clsx('text-xs font-bold truncate', isHidden ? 'text-slate-400 line-through' : 'text-white')}>
                            {page.pageTitle || 'עמוד ללא שם'}
                          </span>
                          {page.isHomePage && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              עמוד הבית
                            </span>
                          )}
                          {isHidden && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
                              מוסתר מהתפריט
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-500" dir="ltr">
                          {page.isHomePage ? '/' : `/${(page.slug || page.pageId).replace(/^\/?p\//i, '')}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 w-48 sm:w-64">
                        <input
                          type="text"
                          disabled={isHidden}
                          value={currentOverride}
                          placeholder={page.pageTitle || 'כותרת בתפריט'}
                          onChange={(e) => {
                            const val = e.target.value;
                            const overrides = { ...(config.menuTitleOverrides || {}) };
                            if (val.trim()) {
                              overrides[key] = val;
                              overrides[page.pageId] = val;
                            } else {
                              delete overrides[key];
                              delete overrides[page.pageId];
                            }
                            updateConfig({ menuTitleOverrides: overrides });
                          }}
                          className={clsx(
                            'flex-1 bg-slate-900 border text-xs rounded-xl px-3 py-1.5 focus:outline-none placeholder:text-slate-500 transition-colors',
                            isHidden
                              ? 'border-slate-800 text-slate-500 cursor-not-allowed bg-slate-950/50'
                              : 'border-slate-700 text-white focus:border-indigo-500'
                          )}
                        />
                        <button
                          type="button"
                          onClick={toggleHidePage}
                          title={isHidden ? 'הצג עמוד בתפריט' : 'הסתר עמוד מהתפריט'}
                          className={clsx(
                            'p-2 rounded-xl border transition-colors flex items-center justify-center shrink-0 cursor-pointer',
                            isHidden
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                          )}
                        >
                          {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Custom Links List Editor */}
        {config.menuMode === 'custom' && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">רשימת קישורים מותאמים אישית</span>
                <span className="text-[11px] text-slate-400">
                  ניתן לבחור ישירות מתוך עמודי האתר, עוגנים בעמוד הנוכחי או להזין כתובת חיצונית
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddCustomLink}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 cursor-pointer transition hover:bg-indigo-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>הוסף קישור</span>
              </button>
            </div>

            {(config.customLinks || []).length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-center text-xs text-slate-400">
                לא הוגדרו עדיין קישורים לתפריט. לחצו על "הוסף קישור" כדי להתחיל.
              </div>
            ) : (
              (config.customLinks || []).map((link, idx) => {
                // Determine if link.url matches a page or an anchor
                const isAnchor = link.url.startsWith('#');
                const isTenantPage = tenantPages.some((p) => {
                  const u = p.isHomePage ? '/' : `/${(p.slug || p.pageId).replace(/^\/?p\//i, '')}`;
                  return u === link.url;
                });
                const isKnownTarget = isAnchor || isTenantPage;
                const selectValue = isKnownTarget ? link.url : 'custom';

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                        <LinkIcon className="w-3 h-3 text-indigo-400" />
                        <span>פריט #{idx + 1}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveCustomLink(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer rounded-lg hover:bg-rose-500/10"
                        title="מחק קישור"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      {/* Name / Label */}
                      <div className="sm:col-span-4">
                        <label className="text-[10px] text-slate-400 mb-1 block">כותרת הקישור בתפריט</label>
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => handleUpdateCustomLink(idx, 'label', e.target.value)}
                          placeholder="לדוגמה: אודותינו"
                          className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Dropdown Selector */}
                      <div className="sm:col-span-4">
                        <label className="text-[10px] text-slate-400 mb-1 block">יעד הקישור (בחירה מהירה)</label>
                        <select
                          value={selectValue}
                          onChange={(e) => handleSelectLinkTarget(idx, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                          <optgroup label="עמודי האתר (Tenant)">
                            {tenantPages.map((p) => {
                              const pageUrl = p.isHomePage ? '/' : `/${(p.slug || p.pageId).replace(/^\/?p\//i, '')}`;
                              return (
                                <option key={p.pageId} value={pageUrl}>
                                  עמוד: {p.pageTitle || 'עמוד'} {p.isHomePage ? '(ראשי)' : ''}
                                </option>
                              );
                            })}
                          </optgroup>

                          {availableAnchors.length > 0 && (
                            <optgroup label="עוגנים לאזורים בעמוד הנוכחי">
                              {availableAnchors.map((anc) => (
                                <option key={anc.id} value={anc.value}>
                                  אזור: {anc.label}
                                </option>
                              ))}
                            </optgroup>
                          )}

                          <optgroup label="מותאם אישית / חיצוני">
                            <option value="custom">קישור חיצוני / הזנה ידנית</option>
                          </optgroup>
                        </select>
                      </div>

                      {/* Explicit URL string */}
                      <div className="sm:col-span-4">
                        <label className="text-[10px] text-slate-400 mb-1 block">כתובת יעד (URL / עוגן)</label>
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => handleUpdateCustomLink(idx, 'url', e.target.value)}
                          placeholder="#anchor או https://..."
                          className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 font-mono"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 4. Action Buttons (Login, CTA, WhatsApp, Phone) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h4 className="text-sm font-bold text-white">כפתורי פעולה והתחברות</h4>

        {/* Login Button */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogIn className="w-4 h-4 text-indigo-400" />
            <div>
              <span className="text-xs font-bold text-white block">אייקון התחברות</span>
              <span className="text-[11px] text-slate-400">פותח חלון התחברות מהיר למערכת</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => updateConfig({ showLoginButton: config.showLoginButton === false ? true : false })}
            className={clsx(
              'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
              config.showLoginButton !== false ? 'bg-indigo-600' : 'bg-slate-800'
            )}
          >
            <span
              className={clsx(
                'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                config.showLoginButton !== false ? 'left-1' : 'right-1'
              )}
            />
          </button>
        </div>

        {/* CTA Button */}
        <div className="space-y-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">כפתור הנעה לפעולה (CTA)</span>
              <span className="text-[11px] text-slate-400">כפתור בולט בראש התפריט</span>
            </div>
            <button
              type="button"
              onClick={() => updateConfig({ showCtaButton: config.showCtaButton === false ? true : false })}
              className={clsx(
                'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
                config.showCtaButton !== false ? 'bg-indigo-600' : 'bg-slate-800'
              )}
            >
              <span
                className={clsx(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  config.showCtaButton !== false ? 'left-1' : 'right-1'
                )}
              />
            </button>
          </div>

          {config.showCtaButton !== false && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <PageBuilderInput
                label="טקסט הכפתור"
                placeholder="התחל עכשיו"
                value={config.ctaButtonText || ''}
                onChange={(e) => updateConfig({ ctaButtonText: e.target.value })}
              />
              <PageBuilderInput
                label="קישור הכפתור (URL / Anchor)"
                placeholder="#contact"
                value={config.ctaButtonUrl || ''}
                onChange={(e) => updateConfig({ ctaButtonUrl: e.target.value })}
                dir="ltr"
              />
            </div>
          )}
        </div>

        {/* WhatsApp & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>וואטסאפ בהדר</span>
              </span>
              <button
                type="button"
                onClick={() => updateConfig({ showWhatsApp: config.showWhatsApp === true ? false : true })}
                className={clsx(
                  'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
                  config.showWhatsApp === true ? 'bg-emerald-600' : 'bg-slate-800'
                )}
              >
                <span
                  className={clsx(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    config.showWhatsApp === true ? 'left-1' : 'right-1'
                  )}
                />
              </button>
            </div>
            {config.showWhatsApp === true && (
              <input
                type="text"
                placeholder="050-0000000"
                value={config.whatsApp || ''}
                onChange={(e) => updateConfig({ whatsApp: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-mono"
                dir="ltr"
              />
            )}
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>טלפון בהדר</span>
              </span>
              <button
                type="button"
                onClick={() => updateConfig({ showPhone: config.showPhone === true ? false : true })}
                className={clsx(
                  'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
                  config.showPhone === true ? 'bg-indigo-600' : 'bg-slate-800'
                )}
              >
                <span
                  className={clsx(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    config.showPhone === true ? 'left-1' : 'right-1'
                  )}
                />
              </button>
            </div>
            {config.showPhone === true && (
              <input
                type="text"
                placeholder="03-0000000"
                value={config.phone || ''}
                onChange={(e) => updateConfig({ phone: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 font-mono"
                dir="ltr"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
