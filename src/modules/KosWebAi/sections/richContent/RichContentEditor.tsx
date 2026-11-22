import { clsx } from 'clsx';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  RichContentSectionConfig,
  RichContentItem,
  RichContentLayoutPreset,
  RichContentDisplayMode,
  HeroTextBgEffect,
} from '../../types/sectionConfigs';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { PageBuilderIconPicker, DynamicIcon } from '../../ui/PageBuilderIconPicker';
import { RichContentWysiwygEditor } from './RichContentWysiwygEditor';
import { resolveLiveBrandDna } from '../../services/brandSectionHydrator';
import { loadBrandDna } from '../../../KosBranding/services/brandDnaFirestore';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { AiTextAssistantContract } from '../../../../core/contracts';
import {
  STYLE_PRESET_DEFINITIONS,
  normalizeStylePreset,
} from '../../styles';
import { BrandDna } from '../../../../core/contracts';
import { resolveCurrentTenantId, ROOT_TENANT_ID } from '../../../../core/tenant/tenantResolver';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import {
  Save,
  X,
  ChevronDown,
  Sparkles,
  Palette,
  LayoutTemplate,
  Type,
  Image as ImageIcon,
  MousePointerClick,
  CheckCircle2,
  Heart,
  Shield,
  Sun,
  Crosshair,
  BarChart3,
  Layers,
  Wand2,
  Info,
  Plus,
  Trash2,
  Quote,
  Compass,
  Milestone,
  Check,
  Columns,
  Grid,
  Split,
  Box,
  Maximize2,
  AlignRight,
  AlignCenter,
  Sliders,
  Square,
  Circle,
  Loader2,
} from 'lucide-react';

interface RichContentEditorProps {
  config: RichContentSectionConfig;
  onChange: (config: RichContentSectionConfig) => void;
  onClose?: () => void;
  isDarkMode?: boolean;
}

const PRESET_DEFINITIONS = STYLE_PRESET_DEFINITIONS;

interface ContentLayoutOption {
  id: RichContentDisplayMode;
  name: string;
  desc: string;
  icon: React.FC<{ className?: string }>;
}

const CONTENT_LAYOUT_OPTIONS: ContentLayoutOption[] = [
  {
    id: 'standard',
    name: 'קלאסי מאוזן',
    desc: 'כותרת, גוף טקסט מעוצב ותמונת נושא לצד התוכן',
    icon: LayoutTemplate,
  },
  {
    id: 'split-story',
    name: 'סיפור מפוצל',
    desc: 'עמודת חזון נרחבת לצד תמונת פורטרט גדולה עם חותמת חזון צפה',
    icon: Split,
  },
  {
    id: 'quote-hero',
    name: 'ציטוט חזון מרכזי',
    desc: 'משפט חזון ענק ממורכז עם מרכאות השראה ועמודי תווך מתחתיו',
    icon: Quote,
  },
  {
    id: 'timeline-vision',
    name: 'ציר זמן ואבני דרך',
    desc: 'מפת דרכים ויזואלית: יסודות, צמיחה וחזון העתיד',
    icon: Milestone,
  },
  {
    id: 'bento-about',
    name: 'בנטו אודות וחזון',
    desc: 'פריסת Bento Grid מודרנית עם כרטיס חזון ראשי, תמונה וערכים',
    icon: Box,
  },
  {
    id: 'two-columns',
    name: 'שני טורים',
    desc: 'חלוקת גוף התוכן לשני טורי קריאה אלגנטיים בסגנון מגזין',
    icon: Columns,
  },
  {
    id: 'highlight-box',
    name: 'תיבת הדגשה מוארת',
    desc: 'כרטיס זכוכית מעוצב עם רקע ייחודי, מסגרת זוהרת וריפוד עשיר',
    icon: Layers,
  },
  {
    id: 'cards-grid-3',
    name: 'רשת 3 עמודי תווך',
    desc: 'רשת 3 כרטיסי ערכים ועקרונות פעולה מתחת לגוף התוכן',
    icon: Grid,
  },
  {
    id: 'cards-grid-2',
    name: 'רשת 2 כרטיסים',
    desc: 'זוג כרטיסים רחבים להבלטת מטרות מרכזיות',
    icon: Grid,
  },
];

export const RichContentEditor: React.FC<RichContentEditorProps> = ({
  config,
  onChange,
  onClose,
}) => {
  const { getCapability } = useHostCapabilities();
  const aiAssistant = getCapability<AiTextAssistantContract>('ai-assistant');

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const syncDark = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    syncDark();
    const obs = new MutationObserver(syncDark);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  // Local state draft to prevent jumping
  const [localConfig, setLocalConfig] = useState<RichContentSectionConfig>(() => ({
    ...config,
    contentLayout: config.contentLayout || (
      config.layout === 'split-story' ||
      config.layout === 'quote-hero' ||
      config.layout === 'timeline-vision' ||
      config.layout === 'bento-about' ||
      config.layout === 'two-columns' ||
      config.layout === 'highlight-box' ||
      config.layout === 'cards-grid-3' ||
      config.layout === 'cards-grid-2'
        ? config.layout
        : 'standard'
    ),
  }));

  const [isDirty, setIsDirty] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [hoveredPreset, setHoveredPreset] = useState<string | null>(null);
  const [hoveredLayout, setHoveredLayout] = useState<string | null>(null);

  // Targeted SEO/GEO 2026 AI Assistant state
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [pageGoal, setPageGoal] = useState('היכרות, בניית סמכות והנעה לפעולה');
  const [aiTargetedLoading, setAiTargetedLoading] = useState(false);
  const [aiFieldLoading, setAiFieldLoading] = useState<'heading' | 'subtitle' | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{
    heading: string;
    subtitle: string;
    bodyHtml: string;
  } | null>(null);

  // Firestore & Brand DNA Sync
  const { db } = useSystemConnection();
  const effTenant = resolveCurrentTenantId() || ROOT_TENANT_ID;
  const [firestoreBrand, setFirestoreBrand] = useState<BrandDna | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const dna = await loadBrandDna(db, effTenant);
        if (active && dna) {
          setFirestoreBrand(dna);
          // Auto-sync preset if default/standard
          if (dna.designTokens?.defaultStylePreset && (!config.layout || config.layout === 'standard')) {
            const tenantPreset = dna.designTokens.defaultStylePreset as RichContentLayoutPreset;
            setLocalConfig((prev) => ({
              ...prev,
              layout: tenantPreset,
            }));
          }
        }
      } catch (err) {
        console.warn('Could not load Brand DNA for richContent:', err);
      }
    })();
    return () => {
      active = false;
    };
  }, [db, effTenant]);

  const liveBrand = useMemo(
    () => resolveLiveBrandDna(firestoreBrand, effTenant),
    [firestoreBrand, effTenant]
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdate = <K extends keyof RichContentSectionConfig>(
    key: K,
    val: RichContentSectionConfig[K]
  ) => {
    setLocalConfig((prev) => {
      const next = { ...prev, [key]: val };
      onChange(next);
      return next;
    });
    setIsDirty(true);
  };

  const handlePatch = (patch: Partial<RichContentSectionConfig>) => {
    setLocalConfig((prev) => {
      const next = { ...prev, ...patch };
      onChange(next);
      return next;
    });
    setIsDirty(true);
  };

  const handleSave = () => {
    onChange(localConfig);
    setIsDirty(false);
    setSaveSuccess(true);
    showToast('הגדרות אודות והחזון נשמרו בהצלחה!');
    setTimeout(() => setSaveSuccess(false), 2200);
  };

  const handleRequestClose = () => {
    if (!onClose) return;
    if (isDirty) {
      setShowUnsavedConfirm(true);
    } else {
      onClose();
    }
  };

  // Full synchronization from Brand DNA (Vision, Slogan, Purpose, Colors, Preset)
  const handleSyncFromBrandDna = () => {
    if (!liveBrand) {
      showToast('לא נמצאו נתוני מיתוג עבור הטננט');
      return;
    }

    const companyName = liveBrand.identity?.companyName || '';
    const companyVision = liveBrand.identity?.companyVision || '';
    const shortVision = liveBrand.identity?.shortVision || '';
    const orgPurpose = liveBrand.identity?.organizationPurpose || '';
    const slogan = liveBrand.identity?.slogan || '';
    const uvp = liveBrand.audience?.mainUvp || '';
    const tenantPreset = liveBrand.designTokens?.defaultStylePreset as RichContentLayoutPreset;

    const visionParagraph = companyVision || shortVision || orgPurpose;
    const purposeParagraph = orgPurpose || uvp;

    const bodyParts: string[] = [];
    if (visionParagraph) {
      bodyParts.push(`<p class="text-lg font-semibold leading-relaxed"><strong>החזון שלנו:</strong> ${visionParagraph}</p>`);
    }
    if (purposeParagraph && purposeParagraph !== visionParagraph) {
      bodyParts.push(`<p class="leading-relaxed">${purposeParagraph}</p>`);
    }
    if (slogan) {
      bodyParts.push(`<blockquote class="border-r-4 border-amber-500 pr-4 italic my-3 text-slate-300">״${slogan}״</blockquote>`);
    }

    const updated: RichContentSectionConfig = {
      ...localConfig,
      heading: companyName ? `אודות ${companyName}` : (localConfig.heading || 'אודות והחזון שלנו'),
      subtitle: shortVision || slogan || 'החזון והשליחות שלנו',
      body: bodyParts.length > 0 ? bodyParts.join('') : localConfig.body,
      layout: tenantPreset || localConfig.layout || 'standard',
      primaryButtonColor: liveBrand.designTokens?.primaryColor || localConfig.primaryButtonColor,
      headingColor: liveBrand.designTokens?.textColorH1 || localConfig.headingColor,
      bodyColor: liveBrand.designTokens?.textColor || localConfig.bodyColor,
    };

    setLocalConfig(updated);
    setIsDirty(true);
    onChange(updated);
    showToast('התוכן, הכותרת והחזון סונכרנו בהצלחה עם ה-Brand DNA!');
  };

  // Collect full visible page content for targeted SEO/GEO 2026 prompt
  const collectFullPageContext = (): string => {
    if (typeof document === 'undefined') return '';
    const snippets: string[] = [];
    document.querySelectorAll('section h1, section h2, section h3, section p').forEach((el) => {
      const txt = (el.textContent || '').trim();
      if (txt && txt.length > 8 && snippets.length < 18) {
        snippets.push(txt);
      }
    });
    return snippets.join(' | ').slice(0, 1800);
  };

  const handleTargetedSeoGeoAi = async () => {
    if (!aiAssistant?.generateJson && !aiAssistant?.generateReply) {
      showToast('סוכן ה-AI אינו זמין כעת');
      return;
    }
    setAiTargetedLoading(true);
    setAiSuggestion(null);

    const company = liveBrand?.identity?.companyName || '';
    const vision = liveBrand?.identity?.companyVision || liveBrand?.identity?.shortVision || '';
    const purpose = liveBrand?.identity?.organizationPurpose || liveBrand?.audience?.mainUvp || '';
    const slogan = liveBrand?.identity?.slogan || '';
    const powerWords = (liveBrand?.voice?.powerWords || []).slice(0, 5).join(', ');
    const forbiddenWords = (liveBrand?.voice?.forbiddenWords || []).slice(0, 5).join(', ');
    const servicesList = (liveBrand?.ecosystem?.services || [])
      .slice(0, 5)
      .map((s: any) => (typeof s === 'string' ? s : s?.name || s?.title || ''))
      .filter(Boolean)
      .join(', ');
    const pageContent = collectFullPageContext();

    const targetedPrompt = `
מטרת העמוד והאזור: "${pageGoal}"

תוכן כל העמוד הנוכחי (לשמירה על רצף, עקביות והקשר מלא):
"${pageContent || localConfig.heading || 'אין תוכן קודם בעמוד'}"

תוכן נוכחי באזור אודות/תוכן:
- כותרת: "${localConfig.heading || ''}"
- תת כותרת: "${localConfig.subtitle || ''}"
- גוף: "${(localConfig.body || '').replace(/<[^>]+>/g, ' ').trim()}"

הקו המיתוגי של העסק (Brand DNA):
- שם היישות/מותג: "${company}"
- חזון: "${vision}"
- מטרת הארגון / UVP: "${purpose}"
- סלוגן: "${slogan}"
- שירותים עיקריים: "${servicesList}"
- מילות כוח: "${powerWords}"
- מילים אסורות לשימוש: "${forbiddenWords}"
- פנייה מגדרית: "${liveBrand?.voice?.genderAddressing || 'plural'}"

דרישות חובה לפי פרוטוקול 2026 SEO, GEO & Agentic Web:
1. מבנה Answer-First: פתיחת התוכן בתשובה ישירה, חדה ועובדתית באורך 40–60 מילים לשאיבה קלה ע"י LLMs (ChatGPT, Gemini, Perplexity).
2. עקרון Information Gain: ללא מליצות AI ריקות! לשלב עובדות קונקרטיות מתוך ה-Brand DNA ותוכן העמוד.
3. פורמטים קריאים למכונה: לכלול רשימה מובנית (<ul><li><strong>כותרת:</strong> תוכן</li></ul>) לצד פסקת פתיחה ברורה.
4. עקביות יישות (Entity): להזכיר את שם העסק המדויק באופן טבעי.

החזר JSON תקני בלבד במבנה:
{
  "heading": "כותרת H2 חדה וממוקדת",
  "subtitle": "תת-כותרת קצרה ותמציתית",
  "bodyHtml": "<p>פסקת Answer-First בת 40-60 מילים...</p><ul><li><strong>יתרון/עקרון:</strong> פירוט עובדתי</li></ul>"
}
`.trim();

    try {
      if (aiAssistant.generateJson) {
        const res = await aiAssistant.generateJson<{
          heading?: string;
          subtitle?: string;
          bodyHtml?: string;
          message?: string;
        }>({
          prompt: targetedPrompt,
          systemPrompt:
            'You are a senior Hebrew Brand Copywriter & 2026 SEO/GEO Architect. Return ONLY valid JSON with keys: heading, subtitle, bodyHtml.',
          brandDna: liveBrand,
        });
        if (res?.data && (res.data.bodyHtml || res.data.heading)) {
          setAiSuggestion({
            heading: res.data.heading || localConfig.heading || '',
            subtitle: res.data.subtitle || localConfig.subtitle || '',
            bodyHtml: res.data.bodyHtml || localConfig.body || '',
          });
          showToast('הצעת AI מותאמת פרוטוקול 2026 SEO/GEO מוכנה!');
          return;
        }
      }
      showToast('לא התקבלה תשובה תקינה מה-AI — נסה שוב בעוד רגע');
    } catch (err) {
      console.warn('[RichContentEditor] Targeted SEO/GEO AI failed:', err);
      showToast('שגיאה בהפקת תוכן עם AI');
    } finally {
      setAiTargetedLoading(false);
    }
  };

  const handleEnhanceHeadingOrSubtitle = async (field: 'heading' | 'subtitle') => {
    if (!aiAssistant?.enhanceText) {
      showToast('סוכן ה-AI אינו זמין כעת');
      return;
    }
    setAiFieldLoading(field);
    try {
      const currentVal = (localConfig[field] || '') as string;
      const res = await aiAssistant.enhanceText({
        originalText: currentVal || localConfig.heading || liveBrand?.identity?.companyName || '',
        instruction:
          field === 'heading'
            ? `נסח כותרת H2 חדה וברורה בהתאם לפרוטוקול SEO/GEO 2026 ומטרת העמוד "${pageGoal}". החזר טקסט בלבד.`
            : `נסח תת-כותרת תמציתית וממוקדת ערך למטרת העמוד "${pageGoal}". החזר טקסט בלבד.`,
        brandDna: liveBrand,
      });
      if (res?.error || res?.isFallback) {
        showToast(res.error || 'שגיאה בשיפור הטקסט עם AI');
        return;
      }
      const cleaned = (res?.text || '').replace(/^["'«]+|["'»]+$/g, '').trim();
      if (cleaned) {
        handleUpdate(field, cleaned);
        showToast('השדה שופר בהצלחה עם סוכן ה-AI');
      }
    } finally {
      setAiFieldLoading(null);
    }
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  // Items Management (Pillars / Timeline steps)
  const items = localConfig.items || [];
  const handleAddItem = () => {
    const newItem: RichContentItem = {
      id: `pillar_${Date.now()}`,
      title: 'ערך או עמוד תווך חדש',
      text: 'פירוט החשיבות, העשייה והשליחות מאחורי ערך זה...',
      icon: 'Sparkles',
    };
    handleUpdate('items', [...items, newItem]);
  };

  const handleUpdateItem = (idx: number, patch: Partial<RichContentItem>) => {
    const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    handleUpdate('items', next);
  };

  const handleRemoveItem = (idx: number) => {
    handleUpdate(
      'items',
      items.filter((_, i) => i !== idx)
    );
  };

  const activePreset = normalizeStylePreset(
    localConfig.layout,
    liveBrand?.designTokens?.defaultStylePreset
  );
  const isFollowingBrandPreset = !localConfig.layout || (localConfig.layout as string) === 'auto';
  const rawLayout = localConfig.layout;
  const activeContentMode: RichContentDisplayMode =
    localConfig.contentLayout ||
    (rawLayout === 'split-story' ||
    rawLayout === 'quote-hero' ||
    rawLayout === 'timeline-vision' ||
    rawLayout === 'bento-about' ||
    rawLayout === 'two-columns' ||
    rawLayout === 'highlight-box' ||
    rawLayout === 'cards-grid-3' ||
    rawLayout === 'cards-grid-2'
      ? rawLayout
      : 'standard');

  const hoveredPresetDef = PRESET_DEFINITIONS.find((p) => p.id === hoveredPreset);
  const hoveredLayoutDef = CONTENT_LAYOUT_OPTIONS.find((l) => l.id === hoveredLayout);

  return (
    <div
      className={`w-full rounded-3xl sm:rounded-[2.5rem] p-3.5 sm:p-5 relative shadow-2xl flex flex-col no-scrollbar border transition-colors font-sans text-right ${
        isDarkMode
          ? 'bg-[#0a0a0a] border-white/10 text-white'
          : 'bg-white border-slate-200 text-slate-900 shadow-xl'
      }`}
      style={{ fontFamily: "'Heebo', sans-serif" }}
      dir="rtl"
    >
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs shadow-xl animate-in slide-in-from-top duration-200">
            {toastMessage}
          </div>
        )}

        {/* 1. Compact Header matching HeroEditor */}
        <div
          className={`flex items-center justify-between pb-2.5 mb-2.5 border-b shrink-0 ${
            isDarkMode ? 'border-white/10' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center gap-2 max-w-[70%]">
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black shrink-0 shadow-sm border select-none ${
                isDarkMode
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}
              title="Rich Content Section Editor"
            >
              RC
            </div>
            <div className="truncate">
              <h2 className={`text-xs sm:text-sm font-extrabold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                עיצוב והגדרות אודות ותוכן (RichContent)
              </h2>
              <p className={`text-[10px] truncate ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                {PRESET_DEFINITIONS.find((p) => p.id === activePreset)?.title || 'סגנון עכשווי'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowAiPanel((prev) => !prev)}
              className={`px-2.5 h-8 rounded-full border text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                showAiPanel
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : isDarkMode
                    ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
              }`}
              title="עזרה חכמה עם AI לפי כל העמוד, המותג ופרוטוקול SEO/GEO 2026"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">עזרת AI</span>
            </button>

            <button
              type="button"
              onClick={handleSyncFromBrandDna}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-white/5 border-white/10 text-indigo-300 hover:bg-indigo-500/20'
                  : 'bg-slate-50 border-slate-200 text-indigo-600 hover:bg-indigo-50'
              }`}
              title="סנכרן את הכותרות, החזון והסגנון מתוך ה-Brand DNA"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleSave}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                saveSuccess
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : isDirty
                    ? 'bg-amber-500 text-slate-950 border-amber-500 animate-pulse'
                    : isDarkMode
                      ? 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title="שמירה"
            >
              {saveSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            </button>

            {onClose && (
              <button
                type="button"
                onClick={handleRequestClose}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="סגור"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Targeted SEO/GEO 2026 AI Assistant Panel */}
        {showAiPanel && (
          <div
            className={`p-3 mb-2.5 rounded-2xl border space-y-2.5 animate-fadeIn ${
              isDarkMode ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-indigo-50/70 border-indigo-200'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-500">
                <Wand2 className="w-3.5 h-3.5" />
                <span>סוכן AI מטורגט (כל תוכן העמוד + מיתוג + פרוטוקול 2026 SEO/GEO)</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={`text-[11px] font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                מטרת העמוד / האזור (ה-AI ישלב את כל תוכן העמוד והקו המיתוגי של העסק):
              </label>
              <input
                type="text"
                value={pageGoal}
                onChange={(e) => setPageGoal(e.target.value)}
                placeholder="למשל: דף אודות שממיר לידים ומציג סמכות מקצועית..."
                className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  isDarkMode
                    ? 'bg-black/40 border-indigo-500/30 text-white'
                    : 'bg-white border-indigo-300 text-slate-900'
                }`}
              />
              <div className="flex flex-wrap gap-1.5">
                {[
                  'היכרות, סמכות והמרה ללידים',
                  'פתיחת Answer-First לציטוטי AI (GEO)',
                  'סיפור המותג, ערכים ויתרון תחרותי',
                ].map((presetGoal) => (
                  <button
                    key={presetGoal}
                    type="button"
                    onClick={() => setPageGoal(presetGoal)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border cursor-pointer transition ${
                      isDarkMode
                        ? 'bg-white/5 border-white/10 text-zinc-300 hover:border-indigo-400'
                        : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                    }`}
                  >
                    {presetGoal}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={handleTargetedSeoGeoAi}
              disabled={aiTargetedLoading}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition disabled:opacity-50"
            >
              {aiTargetedLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>
                {aiTargetedLoading
                  ? 'מנתח את העמוד, המותג ופרוטוקול 2026 SEO/GEO...'
                  : 'נסח כותרת, תת-כותרת ותוכן מותאם SEO/GEO 2026'}
              </span>
            </button>

            {aiSuggestion && (
              <div
                className={`p-2.5 rounded-xl border space-y-2 text-xs ${
                  isDarkMode ? 'bg-black/40 border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="font-extrabold text-sm">{aiSuggestion.heading}</div>
                {aiSuggestion.subtitle && (
                  <div className="text-xs text-indigo-500 font-bold">{aiSuggestion.subtitle}</div>
                )}
                <div
                  className="text-xs leading-relaxed max-h-36 overflow-y-auto border-t pt-2 border-slate-200/20"
                  dangerouslySetInnerHTML={{ __html: aiSuggestion.bodyHtml }}
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setAiSuggestion(null)}
                    className="px-2.5 py-1 rounded-lg text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    בטל
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handlePatch({
                        heading: aiSuggestion.heading,
                        subtitle: aiSuggestion.subtitle,
                        body: aiSuggestion.bodyHtml,
                      });
                      setAiSuggestion(null);
                      showToast('תוכן האזור עודכן לפי המותג ופרוטוקול 2026 SEO/GEO');
                    }}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer"
                  >
                    החל על האזור
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Always-Visible 6-Style Icon Bar matching HeroEditor */}
        <div
          className={`p-2.5 mb-2.5 rounded-2xl border relative transition-all ${
            isDarkMode ? 'bg-[#141414] border-white/5' : 'bg-slate-50/80 border-slate-200'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5 px-1">
            <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
              <Wand2 className="w-3 h-3" />
              <span>תפריט אייקונים לבחירת סגנון פריסה</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleUpdate('layout', 'auto' as any)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                  isFollowingBrandPreset
                    ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50'
                    : isDarkMode
                      ? 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400'
                }`}
              >
                {isFollowingBrandPreset ? 'סגנון מהמותג (פעיל)' : 'עקוב אחרי המותג'}
              </button>
              <button
                type="button"
                onClick={() => handleUpdate('useBrandColors', !localConfig.useBrandColors)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                  localConfig.useBrandColors
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                    : isDarkMode
                      ? 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'
                }`}
              >
                {localConfig.useBrandColors ? 'צבעי מותג: פעיל' : 'החל צבעי מותג'}
              </button>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isDarkMode
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                פעיל: {PRESET_DEFINITIONS.find((p) => p.id === activePreset)?.letter}.{' '}
                {PRESET_DEFINITIONS.find((p) => p.id === activePreset)?.shortLabel}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {PRESET_DEFINITIONS.map((def) => {
              const IconComp = def.icon;
              const isSelected = activePreset === def.id;
              return (
                <button
                  key={def.id}
                  type="button"
                  onClick={() => handleUpdate('layout', def.id as any)}
                  onMouseEnter={() => setHoveredPreset(def.id)}
                  onMouseLeave={() => setHoveredPreset(null)}
                  className={`w-full py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-md ring-1 ring-amber-500/40'
                      : isDarkMode
                        ? 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-black opacity-75">{def.letter}.</span>
                    <IconComp className="w-4 h-4 shrink-0" />
                  </div>
                  <span className="text-[10px] font-bold truncate max-w-full">
                    {def.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
          {hoveredPresetDef && (
            <p className="text-[11px] text-amber-500 font-semibold mt-1.5 px-1">
              {hoveredPresetDef.shortLabel} — {hoveredPresetDef.subtitle}
            </p>
          )}
        </div>

        {/* Scrollable Accordions Body */}
        <div className="flex-1 overflow-y-auto space-y-2.5 no-scrollbar">
          {/* ACCORDION 1: Layouts & Display Modes */}
          <div className={`rounded-2xl border overflow-hidden transition-all ${
            isDarkMode ? 'border-white/10 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <button
              type="button"
              onClick={() => toggleAccordion('layouts')}
              className={`w-full p-3.5 flex items-center justify-between text-right transition-colors cursor-pointer ${
                isDarkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-100 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutTemplate className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-bold">
                  סגנונות פריסה, אופן תצוגת תוכן וגדלים
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
                  isDarkMode ? 'bg-white/5 text-slate-300 border-white/10' : 'bg-white text-slate-700 border-slate-200'
                }`}>
                  {PRESET_DEFINITIONS.find((p) => p.id === activePreset)?.shortLabel || 'סטנדרטי'} •{' '}
                  {CONTENT_LAYOUT_OPTIONS.find((l) => l.id === activeContentMode)?.name || 'קלאסי'}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openAccordion === 'layouts' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openAccordion === 'layouts' && (
              <div className={`p-4 border-t space-y-5 ${
                isDarkMode ? 'border-white/10 bg-[#0f0f0f]' : 'border-slate-200 bg-white'
              }`}>
                {/* 1.1 Brand Style Presets (6 Presets) */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      סגנון מיתוג עיצובי (Brand Presets):
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdate('layout', 'auto' as any)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                          isFollowingBrandPreset
                            ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50'
                            : isDarkMode
                              ? 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400'
                        }`}
                      >
                        {isFollowingBrandPreset ? 'סגנון מהמותג (פעיל)' : 'עקוב אחרי המותג'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdate('useBrandColors', !localConfig.useBrandColors)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                          localConfig.useBrandColors
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                            : isDarkMode
                              ? 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'
                        }`}
                      >
                        {localConfig.useBrandColors ? 'צבעי מותג: פעיל' : 'החל צבעי מותג'}
                      </button>
                    </div>
                  </div>
                  {hoveredPresetDef && (
                    <p className="text-[11px] text-amber-500 font-semibold mb-2 animate-in fade-in duration-150">
                      {hoveredPresetDef.shortLabel} — {hoveredPresetDef.subtitle}
                    </p>
                  )}
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_DEFINITIONS.map((preset) => {
                      const Icon = preset.icon;
                      const isSelected = activePreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleUpdate('layout', preset.id as any)}
                          onMouseEnter={() => setHoveredPreset(preset.id)}
                          onMouseLeave={() => setHoveredPreset(null)}
                          className={`relative p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500 text-amber-500 shadow-md shadow-amber-500/10'
                              : isDarkMode
                                ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/25 hover:bg-white/10'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-amber-400'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isDarkMode ? 'bg-black/40' : 'bg-white border border-slate-200'
                          }`}>
                            {preset.letter}
                          </div>
                          <Icon className="w-4 h-4" />
                          <span className="text-[10px] font-bold text-center leading-tight">
                            {preset.shortLabel.replace('סגנון ', '').replace('פריסה ', '')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 1.2 Content Layout Modes (9 Variations for About & Vision) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-300">
                      פריסת תוכן החזון והאודות (Content Layout):
                    </label>
                    {hoveredLayoutDef && (
                      <span className="text-[11px] text-cyan-400 font-semibold animate-in fade-in duration-150">
                        {hoveredLayoutDef.name} — {hoveredLayoutDef.desc}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {CONTENT_LAYOUT_OPTIONS.map((layout) => {
                      const Icon = layout.icon;
                      const isSelected = activeContentMode === layout.id;
                      return (
                        <button
                          key={layout.id}
                          type="button"
                          onClick={() => handleUpdate('contentLayout', layout.id)}
                          onMouseEnter={() => setHoveredLayout(layout.id)}
                          onMouseLeave={() => setHoveredLayout(null)}
                          className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group ${
                            isSelected
                              ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/25 hover:bg-white/10'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[11px] font-bold text-center leading-tight">
                            {layout.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 1.3 Object Scale, Button Shape, Button Size & Image Placement */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">
                      קנה מידה וטיפוגרפיה:
                    </label>
                    <select
                      value={localConfig.objectScale || 'normal'}
                      onChange={(e) => handleUpdate('objectScale', e.target.value as any)}
                      className="w-full bg-transparent border border-amber-500/50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="compact">קומפקטי (Compact)</option>
                      <option value="normal">רגיל (Normal)</option>
                      <option value="large">גדול ומודגש (Large)</option>
                      <option value="massive">ענק (Massive)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">
                      צורת כפתורים:
                    </label>
                    <select
                      value={localConfig.buttonShape || 'auto'}
                      onChange={(e) => handleUpdate('buttonShape', e.target.value as any)}
                      className="w-full bg-transparent border border-amber-500/50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="auto">אוטומטי (לפי המיתוג)</option>
                      <option value="pill">קפסולה עגולה (Pill)</option>
                      <option value="rounded">מעוגל מודרני (Rounded)</option>
                      <option value="sharp">חד (Sharp)</option>
                      <option value="chiseled">משופע (Chiseled)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">
                      מיקום תמונת נושא:
                    </label>
                    <select
                      value={localConfig.imagePosition || 'auto'}
                      onChange={(e) => handleUpdate('imagePosition', e.target.value as any)}
                      className="w-full bg-transparent border border-amber-500/50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="auto">אוטומטי (לפי הפריסה)</option>
                      <option value="left">משמאל לטקסט</option>
                      <option value="right">מימין לטקסט</option>
                      <option value="top">מעל הטקסט</option>
                      <option value="bottom">מתחת לטקסט</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ACCORDION 2: Headings, WYSIWYG & AI Rewrite */}
          <div className={`rounded-2xl border overflow-hidden transition-all ${isDarkMode ? "border-white/10 bg-[#141414]" : "border-slate-200 bg-slate-50/70"}`}>
            <button
              type="button"
              onClick={() => toggleAccordion('content')}
              className={`w-full p-3.5 flex items-center justify-between text-right transition-colors cursor-pointer ${isDarkMode ? "hover:bg-white/5 text-white" : "hover:bg-slate-100 text-slate-900"}`}
            >
              <div className="flex items-center gap-2.5">
                <Type className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold">
                  כותרות, עורך תוכן WYSIWYG ושכתוב AI
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  WYSIWYG 2026
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openAccordion === 'content' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openAccordion === 'content' && (
              <div className={`p-4 sm:p-6 border-t space-y-5 ${isDarkMode ? "border-white/10 bg-[#0f0f0f]" : "border-slate-200 bg-white"}`}>
                {/* Heading & Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        כותרת ראשית:
                      </label>
                      <button
                        type="button"
                        onClick={() => handleEnhanceHeadingOrSubtitle('heading')}
                        className="p-1 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 cursor-pointer transition"
                        title="שפר כותרת עם AI לפי פרוטוקול 2026 SEO/GEO"
                      >
                        {aiFieldLoading === 'heading' ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={localConfig.heading || ''}
                      onChange={(e) => handleUpdate('heading', e.target.value)}
                      placeholder="אודות והחזון שלנו"
                      className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                        isDarkMode
                          ? 'bg-[#161619] border-white/10 text-white'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        תת כותרת (תגית עליונה):
                      </label>
                      <button
                        type="button"
                        onClick={() => handleEnhanceHeadingOrSubtitle('subtitle')}
                        className="p-1 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 cursor-pointer transition"
                        title="שפר תת-כותרת עם AI לפי פרוטוקול 2026 SEO/GEO"
                      >
                        {aiFieldLoading === 'subtitle' ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={localConfig.subtitle || ''}
                      onChange={(e) => handleUpdate('subtitle', e.target.value)}
                      placeholder="השליחות, הערכים והשאיפה למצוינות"
                      className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                        isDarkMode
                          ? 'bg-[#161619] border-white/10 text-white'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* WYSIWYG Rich Editor Canvas */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    גוף התוכן והחזון (עריכה ויזואלית עשירה):
                  </label>
                  <RichContentWysiwygEditor
                    value={localConfig.body || ''}
                    onChange={(html) => handleUpdate('body', html)}
                    brandDna={liveBrand}
                    isDarkMode={isDarkMode}
                  />
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    תמונת נושא / אודות:
                  </label>
                  <PageBuilderImageUpload
                    value={localConfig.imageSrc || ''}
                    onChange={(url) => handleUpdate('imageSrc', url)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ACCORDION 3: Pillars & Timeline Items */}
          <div className={`rounded-2xl border overflow-hidden transition-all ${isDarkMode ? "border-white/10 bg-[#141414]" : "border-slate-200 bg-slate-50/70"}`}>
            <button
              type="button"
              onClick={() => toggleAccordion('items')}
              className={`w-full p-3.5 flex items-center justify-between text-right transition-colors cursor-pointer ${isDarkMode ? "hover:bg-white/5 text-white" : "hover:bg-slate-100 text-slate-900"}`}
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold">
                  עמודי תווך, ערכים ואבני דרך
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                  {items.length} פריטים
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openAccordion === 'items' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openAccordion === 'items' && (
              <div className={`p-4 sm:p-6 border-t space-y-4 ${isDarkMode ? "border-white/10 bg-[#0f0f0f]" : "border-slate-200 bg-white"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    פריטים אלו מוצגים ככרטיסי ערכים ברשת, שלבים בציר הזמן או קוביות בנטו:
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>הוסף עמוד תווך</span>
                  </button>
                </div>

                {/* Milestone Cards Visual Presentation Toolbar */}
                <div className="p-3.5 rounded-2xl bg-[#141417] border border-white/10 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {/* Icon Position Controls */}
                    <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
                      <button
                        type="button"
                        onClick={() => handleUpdate('cardIconPosition', 'side')}
                        className={clsx(
                          'p-1.5 rounded-lg transition-all cursor-pointer',
                          (localConfig.cardIconPosition || 'side') === 'side'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                        title="איקון לצד הכותרת (אופקי)"
                      >
                        <AlignRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdate('cardIconPosition', 'top')}
                        className={clsx(
                          'p-1.5 rounded-lg transition-all cursor-pointer',
                          localConfig.cardIconPosition === 'top'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                        title="איקון מעל הכותרת (מיושר לימין)"
                      >
                        <Columns className="w-4 h-4 rotate-90" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdate('cardIconPosition', 'top-center')}
                        className={clsx(
                          'p-1.5 rounded-lg transition-all cursor-pointer',
                          localConfig.cardIconPosition === 'top-center'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                        title="איקון מעל הכותרת (מרכז)"
                      >
                        <AlignCenter className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Asymmetric Grid Stagger Toggle */}
                    <button
                      type="button"
                      onClick={() => handleUpdate('isAsymmetricGrid', !localConfig.isAsymmetricGrid)}
                      className={clsx(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer',
                        localConfig.isAsymmetricGrid
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10'
                          : 'bg-black/40 text-slate-400 border-white/5 hover:text-white hover:bg-white/5'
                      )}
                      title="פריסה א-סימטרית מדורגת (גבהים ופערים דינמיים בין כרטיסים)"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{localConfig.isAsymmetricGrid ? 'א-סימטרי פעיל' : 'רשת סימטרית'}</span>
                    </button>
                  </div>

                  {/* Card Frame Shape & Visual Effect Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-white/5">
                    {/* Frame Shape Selector */}
                    <div className="flex items-center justify-between bg-black/30 p-2 rounded-xl border border-white/5">
                      <span className="text-[11px] text-slate-400">מסגרת כרטיס:</span>
                      <div className="flex items-center gap-1">
                        {[
                          { id: 'auto', label: 'אוטומטי (לפי מיתוג)', icon: Wand2 },
                          { id: 'rounded', label: 'מעוגל (Rounded 3XL)', icon: Circle },
                          { id: 'sharp', label: 'חד (זווית 90°)', icon: Square },
                          { id: 'pill', label: 'קפסולה / גלולה (Pill)', icon: Box },
                          { id: 'arched', label: 'קשתי (Arched Top)', icon: Milestone },
                          { id: 'chiseled', label: 'משופע דינמי (Chiseled)', icon: Crosshair },
                        ].map((shape) => {
                          const ShapeIcon = shape.icon;
                          const active = (localConfig.cardFrameShape || 'auto') === shape.id;
                          return (
                            <button
                              key={shape.id}
                              type="button"
                              onClick={() => handleUpdate('cardFrameShape', shape.id as any)}
                              className={clsx(
                                'p-1.5 rounded-lg transition-all cursor-pointer',
                                active
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                              )}
                              title={shape.label}
                            >
                              <ShapeIcon className="w-3.5 h-3.5" />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Visual Brand Effect Selector */}
                    <div className="flex items-center justify-between bg-black/30 p-2 rounded-xl border border-white/5">
                      <span className="text-[11px] text-slate-400">אפקט מיתוגי:</span>
                      <div className="flex items-center gap-1">
                        {[
                          { id: 'auto', label: 'אוטומטי מיתוגי', icon: Sparkles },
                          { id: 'glow', label: 'זוהר מיתוגי מועצם (Brand Glow)', icon: Sun },
                          { id: 'glass', label: 'זכוכית פרוסטד (Glassmorphism)', icon: Box },
                          { id: 'border-beam', label: 'מסגרת הילוכית מודגשת (Border Beam)', icon: Shield },
                          { id: 'heavy-border', label: 'מסגרת עבה מודגשת (Heavy Border)', icon: Layers },
                        ].map((effect) => {
                          const EffectIcon = effect.icon;
                          const active = (localConfig.cardStylePresetEffect || 'auto') === effect.id;
                          return (
                            <button
                              key={effect.id}
                              type="button"
                              onClick={() => handleUpdate('cardStylePresetEffect', effect.id as any)}
                              className={clsx(
                                'p-1.5 rounded-lg transition-all cursor-pointer',
                                active
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                              )}
                              title={effect.label}
                            >
                              <EffectIcon className="w-3.5 h-3.5" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {items.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-slate-400">
                    לא הוגדרו עדיין עמודי תווך. לחצו על "הוסף עמוד תווך" כדי להוסיף ערכים לחזון.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="p-3.5 rounded-2xl bg-[#161619] border border-white/10 flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="w-6 h-6 rounded-lg bg-black/40 flex items-center justify-center font-bold text-xs text-slate-400">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={item.title || ''}
                              onChange={(e) => handleUpdateItem(idx, { title: e.target.value })}
                              placeholder="כותרת הערך/השלב"
                              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <PageBuilderIconPicker
                              value={item.icon || 'Sparkles'}
                              onChange={(iconName) => handleUpdateItem(idx, { icon: iconName })}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1.5 rounded-xl hover:bg-rose-500/20 text-rose-400 transition-colors"
                              title="מחק ערך"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <textarea
                          rows={2}
                          value={item.text || item.description || ''}
                          onChange={(e) => handleUpdateItem(idx, { text: e.target.value })}
                          placeholder="תיאור מורחב של הערך או שלב ההתפתחות..."
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACCORDION 4: Text Background Overlay & Hover Effects */}
          <div className={`rounded-2xl border overflow-hidden transition-all ${isDarkMode ? "border-white/10 bg-[#141414]" : "border-slate-200 bg-slate-50/70"}`}>
            <button
              type="button"
              onClick={() => toggleAccordion('text_bg')}
              className={`w-full p-3.5 flex items-center justify-between text-right transition-colors cursor-pointer ${isDarkMode ? "hover:bg-white/5 text-white" : "hover:bg-slate-100 text-slate-900"}`}
            >
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-4 h-4 text-rose-400" />
                <span className="text-sm font-bold">
                  רקע תמונה מאחורי הטקסט ואפקטי מעבר
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                  {localConfig.textBgEnabled ? 'פעיל' : 'כבוי'}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openAccordion === 'text_bg' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openAccordion === 'text_bg' && (
              <div className={`p-4 sm:p-6 border-t space-y-4 ${isDarkMode ? "border-white/10 bg-[#0f0f0f]" : "border-slate-200 bg-white"}`}>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      הפעלת רקע תמונה מאחורי הטקסט
                    </span>
                    <span className="text-[11px] text-slate-400">
                      יוצר שכבת רקע מרשימה עם 5 אפקטי מעבר חיים בריחוף
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(localConfig.textBgEnabled)}
                    onChange={(e) => handleUpdate('textBgEnabled', e.target.checked)}
                    className="w-5 h-5 rounded-lg accent-amber-500 cursor-pointer"
                  />
                </div>

                {localConfig.textBgEnabled && (
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        תמונת רקע לטקסט:
                      </label>
                      <PageBuilderImageUpload
                        value={localConfig.textBgImageUrl || ''}
                        onChange={(url) => handleUpdate('textBgImageUrl', url)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          אפקט מעבר בריחוף (Hover Effect):
                        </label>
                        <select
                          value={localConfig.textBgEffect || 'zoom-glow'}
                          onChange={(e) => handleUpdate('textBgEffect', e.target.value as HeroTextBgEffect)}
                          className="w-full bg-transparent border border-amber-500/50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="zoom-glow">זום עדין וזוהר (Zoom Glow)</option>
                          <option value="shimmer-sweep">ברק מתכתי (Shimmer Sweep)</option>
                          <option value="float-parallax">ציפה פרלקסית (Float Parallax)</option>
                          <option value="blur-reveal">חשיפה מטושטשת (Blur Reveal)</option>
                          <option value="gradient-shift">תנועת גרדיאנט (Gradient Shift)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          טווח פריסת הרקע:
                        </label>
                        <select
                          value={localConfig.textBgScope || 'text-card'}
                          onChange={(e) => handleUpdate('textBgScope', e.target.value as any)}
                          className="w-full bg-transparent border border-amber-500/50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="text-card">רק סביב כרטיס הטקסט</option>
                          <option value="full-section">על פני כל שטח האזור</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                        <span>אטימות שכבת הרקע (Overlay):</span>
                        <span>{localConfig.textBgOverlayOpacity ?? 70}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="95"
                        value={localConfig.textBgOverlayOpacity ?? 70}
                        onChange={(e) => handleUpdate('textBgOverlayOpacity', Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACCORDION 5: CTA Buttons */}
          <div className={`rounded-2xl border overflow-hidden transition-all ${isDarkMode ? "border-white/10 bg-[#141414]" : "border-slate-200 bg-slate-50/70"}`}>
            <button
              type="button"
              onClick={() => toggleAccordion('buttons')}
              className={`w-full p-3.5 flex items-center justify-between text-right transition-colors cursor-pointer ${isDarkMode ? "hover:bg-white/5 text-white" : "hover:bg-slate-100 text-slate-900"}`}
            >
              <div className="flex items-center gap-2.5">
                <MousePointerClick className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold">כפתורי הנעה לפעולה (CTA)</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                  {localConfig.buttonsVisible ? 'פעיל' : 'כבוי'}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openAccordion === 'buttons' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openAccordion === 'buttons' && (
              <div className={`p-4 sm:p-6 border-t space-y-4 ${isDarkMode ? "border-white/10 bg-[#0f0f0f]" : "border-slate-200 bg-white"}`}>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      הצגת כפתורי הנעה לפעולה
                    </span>
                    <span className="text-[11px] text-slate-400">
                      מוסיף כפתור ראשי ומשני מתחת לתוכן החזון
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(localConfig.buttonsVisible)}
                    onChange={(e) => handleUpdate('buttonsVisible', e.target.checked)}
                    className="w-5 h-5 rounded-lg accent-amber-500 cursor-pointer"
                  />
                </div>

                {localConfig.buttonsVisible && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Primary Button */}
                    <div className="p-3.5 rounded-2xl bg-[#161619] border border-white/10 space-y-2">
                      <span className="text-xs font-bold text-amber-400 block">
                        כפתור ראשי (Primary):
                      </span>
                      <input
                        type="text"
                        value={localConfig.primaryButton?.text || ''}
                        onChange={(e) =>
                          handlePatch({
                            primaryButton: {
                              text: e.target.value,
                              url: localConfig.primaryButton?.url || '#',
                            },
                          })
                        }
                        placeholder="טקסט כפתור (לדוגמה: קרא עוד עלינו)"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <input
                        type="text"
                        value={localConfig.primaryButton?.url || ''}
                        onChange={(e) =>
                          handlePatch({
                            primaryButton: {
                              text: localConfig.primaryButton?.text || 'קרא עוד',
                              url: e.target.value,
                            },
                          })
                        }
                        placeholder="קישור URL (לדוגמה: #contact)"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    {/* Secondary Button */}
                    <div className="p-3.5 rounded-2xl bg-[#161619] border border-white/10 space-y-2">
                      <span className="text-xs font-bold text-slate-300 block">
                        כפתור משני (Secondary):
                      </span>
                      <input
                        type="text"
                        value={localConfig.secondaryButton?.text || ''}
                        onChange={(e) =>
                          handlePatch({
                            secondaryButton: {
                              text: e.target.value,
                              url: localConfig.secondaryButton?.url || '#',
                            },
                          })
                        }
                        placeholder="טקסט כפתור משני (לדוגמה: הצטרפות לקהילה)"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <input
                        type="text"
                        value={localConfig.secondaryButton?.url || ''}
                        onChange={(e) =>
                          handlePatch({
                            secondaryButton: {
                              text: localConfig.secondaryButton?.text || 'הצטרפות',
                              url: e.target.value,
                            },
                          })
                        }
                        placeholder="קישור URL"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACCORDION 6: Colors & Branding */}
          <div className={`rounded-2xl border overflow-hidden transition-all ${isDarkMode ? "border-white/10 bg-[#141414]" : "border-slate-200 bg-slate-50/70"}`}>
            <button
              type="button"
              onClick={() => toggleAccordion('colors')}
              className={`w-full p-3.5 flex items-center justify-between text-right transition-colors cursor-pointer ${isDarkMode ? "hover:bg-white/5 text-white" : "hover:bg-slate-100 text-slate-900"}`}
            >
              <div className="flex items-center gap-2.5">
                <Palette className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold">צבעי מיתוג וכרטיסים</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openAccordion === 'colors' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openAccordion === 'colors' && (
              <div className={`p-4 sm:p-6 border-t space-y-4 ${isDarkMode ? "border-white/10 bg-[#0f0f0f]" : "border-slate-200 bg-white"}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PageBuilderColorPicker
                    label="צבע רקע האזור"
                    value={localConfig.backgroundColor || 'transparent'}
                    onChange={(c) => handleUpdate('backgroundColor', c)}
                  />
                  <PageBuilderColorPicker
                    label="צבע כותרת ראשית"
                    value={localConfig.headingColor || '#ffffff'}
                    onChange={(c) => handleUpdate('headingColor', c)}
                  />
                  <PageBuilderColorPicker
                    label="צבע גוף הטקסט"
                    value={localConfig.bodyColor || '#cbd5e1'}
                    onChange={(c) => handleUpdate('bodyColor', c)}
                  />
                  <PageBuilderColorPicker
                    label="צבע כפתור ראשי"
                    value={localConfig.primaryButtonColor || '#f59e0b'}
                    onChange={(c) => handleUpdate('primaryButtonColor', c)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`p-3.5 mt-3 border-t flex items-center justify-between shrink-0 ${isDarkMode ? "border-white/10 bg-[#141414] text-white" : "border-slate-200 bg-slate-50/70 text-slate-900"}`}>
          <div className="flex items-center gap-2">
            {isDirty && (
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                קיימים שינויים שטרם נשמרו
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRequestClose}
              className="px-4 py-2 rounded-xl hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              ביטול
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              שמור שינויים
            </button>
          </div>
        </div>

        {/* Unsaved Changes Confirmation Dialog */}
        {showUnsavedConfirm && (
          <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`w-full max-w-sm rounded-3xl border p-6 text-right space-y-4 shadow-2xl ${
              isDarkMode ? 'bg-[#1a1a1e] border-amber-500/30 text-white' : 'bg-white border-amber-500/40 text-slate-900'
            }`}>
              <h3 className="text-base font-extrabold">שינויים לא נשמרו</h3>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                ביצעת שינויים באזור האודות והחזון. האם ברצונך לשמור את השינויים לפני סגירת העורך?
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUnsavedConfirm(false);
                    if (onClose) onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl hover:bg-white/10 text-xs text-slate-400"
                >
                  סגור ללא שמירה
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSave();
                    setShowUnsavedConfirm(false);
                    if (onClose) onClose();
                  }}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  שמור וסגור
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};
