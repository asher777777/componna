import React, { useState } from 'react';
import {
  EventsListingSectionConfig,
  EventListingItem,
  EventImageMaskShape,
  EventListingCardLayout,
  EventListingStylePreset,
} from '../../types/sectionConfigs';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { RichContentWysiwygEditor } from '../richContent/RichContentWysiwygEditor';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract, AiTextAssistantContract } from '../../../../core/contracts';
import { resolveLiveBrandDna } from '../../services/brandSectionHydrator';
import { pageBuilderFirestore } from '../../services/pageBuilderFirestore';
import { resolveCurrentTenantId, ROOT_TENANT_ID } from '../../../../core/tenant/tenantResolver';
import {
  Palette,
  Type,
  Layout,
  Layers,
  Sparkles,
  ChevronDown,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Users,
  Image as ImageIcon,
  Bold,
  Italic,
  Underline,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Wand2,
  Loader2,
  Shield,
  Heart,
  Flower2,
  Compass,
  Cpu,
  Sliders,
  Check,
  FolderArchive,
} from 'lucide-react';
import { clsx } from 'clsx';

export interface EventsListingEditorProps {
  config: EventsListingSectionConfig;
  onChange: (updated: EventsListingSectionConfig) => void;
  onClose?: () => void;
}

const STYLE_PRESETS: Array<{
  id: EventListingStylePreset;
  title: string;
  icon: any;
  color: string;
}> = [
  { id: 'standard', title: 'סטנדרטי ומאוזן (קרם וענבר)', icon: Layers, color: '#f59e0b' },
  { id: 'feminine', title: 'נשי ורך (ורוד/פסטל מעוגל)', icon: Heart, color: '#ec4899' },
  { id: 'masculine', title: 'גברי ועוצמתי (שחור/כחול חד)', icon: Shield, color: '#2563eb' },
  { id: 'spiritual', title: 'רוחני ועדין (סגול/לוטוס)', icon: Flower2, color: '#8b5cf6' },
  { id: 'sharp', title: 'חד וטכנולוגי (0px קווים חדים)', icon: Compass, color: '#06b6d4' },
  { id: 'analytical', title: 'אנליטי ומדעי (מסגרות ירוקות)', icon: Cpu, color: '#10b981' },
];

const MASK_SHAPES: Array<{
  id: EventImageMaskShape;
  title: string;
  desc: string;
}> = [
  { id: 'arch', title: 'קשת עליונה (Arch)', desc: 'כיפה מעוגלת עליונה עם פינות תחתונות רכות' },
  { id: 'oval', title: 'אליפסה שלמה (Oval)', desc: 'צורת חלון אליפטית עגולה' },
  { id: 'flower', title: 'עלי כותרת (Flower)', desc: 'פינות נגדיות מעוגלות ורכות' },
  { id: 'heart', title: 'צורת לב עדינה (Heart)', desc: 'קשתות עליונות מעוגלות עם בסיס מודגש' },
  { id: 'rounded', title: 'מעוגל קלאסי (Rounded)', desc: 'רדיוס פינות סטנדרטי ואלגנטי' },
  { id: 'sharp', title: 'חד גיאומטרי (Sharp)', desc: 'ללא רדיוס פינות (0px)' },
  { id: 'hud', title: 'מסגרת טכנולוגית (HUD)', desc: 'חיתוך טכנולוגי מסוגנן עם גבולות עדינים' },
];

export const EventsListingEditor: React.FC<EventsListingEditorProps> = ({
  config,
  onChange,
  onClose,
}) => {
  const { getCapability } = useHostCapabilities();
  const rawBrandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;
  const brandDna = resolveLiveBrandDna(rawBrandDna);
  const aiAssistant = getCapability<AiTextAssistantContract>('ai-assistant');

  // Tenant Pages dynamic lookup for selection menu
  const [availablePages, setAvailablePages] = useState<Array<{ pageId: string; pageTitle: string; pageCategory?: string; slug: string }>>([]);
  const [loadingPages, setLoadingPages] = useState(false);

  React.useEffect(() => {
    let isMounted = true;
    const loadPages = async () => {
      setLoadingPages(true);
      try {
        const tenantId = resolveCurrentTenantId() || ROOT_TENANT_ID;
        const pages = await pageBuilderFirestore.getAllPages(null, tenantId);
        if (isMounted) {
          setAvailablePages(
            (pages || []).map((p) => ({
              pageId: p.pageId,
              pageTitle: p.seoSettings?.title || p.pageTitle || p.slug,
              pageCategory: p.pageCategory || 'general',
              slug: p.slug,
            }))
          );
        }
      } catch (err) {
        console.warn('EventsListingEditor: failed to load pages for selector', err);
      } finally {
        if (isMounted) setLoadingPages(false);
      }
    };
    loadPages();
    return () => {
      isMounted = false;
    };
  }, []);

  // Accordion State - ALL CLOSED BY DEFAULT, EXCLUSIVE
  const [openMainAccordion, setOpenMainAccordion] = useState<string | null>(null);
  const [openNestedAccordion, setOpenNestedAccordion] = useState<string | null>(null);

  const toggleMainAccordion = (id: string) => {
    setOpenMainAccordion((prev) => (prev === id ? null : id));
    setOpenNestedAccordion(null);
  };

  const toggleNestedAccordion = (id: string) => {
    setOpenNestedAccordion((prev) => (prev === id ? null : id));
  };

  // AI loading per field
  const [aiLoadingField, setAiLoadingField] = useState<string | null>(null);

  const handleUpdate = (patch: Partial<EventsListingSectionConfig>) => {
    onChange({ ...config, ...patch });
  };

  // AI Text Assistant handler
  const handleEnhanceTextWithAi = async (
    fieldKey: 'title' | 'subtitle' | 'badge' | 'defaultCtaText',
    instruction: string
  ) => {
    if (!aiAssistant) return;
    const currentText = (config as any)[fieldKey] || '';
    setAiLoadingField(fieldKey);
    try {
      const voiceHint = brandDna.voice.powerWords?.slice(0, 3).join(', ') || '';
      const res = await aiAssistant.enhanceText({
        originalText: currentText,
        instruction: `${instruction}. מילות כוח: ${voiceHint}. פנייה: ${brandDna.voice.genderAddressing || 'direct'}.`,
        brandDna,
      });
      if (res && res.text) {
        handleUpdate({ [fieldKey]: res.text });
      }
    } catch (err) {
      console.warn('AI Enhance failed:', err);
    } finally {
      setAiLoadingField(null);
    }
  };

  // Items CRUD (Zero mock data - manual items populated only by user or from DNA)
  const handleAddItem = () => {
    const newItem: EventListingItem = {
      id: `evt_${Date.now()}`,
      title: 'אירוע חדש',
      subtitle: 'תיאור קצר ומזמין',
      badge: 'ההרשמה בעיצומה',
      imageUrl: '',
      dayAndTime: 'בימי ראשון 20:00-22:30',
      locationFormat: 'מפגש מקוון / היברידי',
      startDateText: 'בקרוב',
      sessionsCount: '4 מפגשים',
      ctaText: config.defaultCtaText || brandDna?.uiVocabulary?.primaryCta || 'לפרטים והצטרפות',
      linkUrl: '#',
    };
    handleUpdate({ items: [...(config.items || []), newItem] });
  };

  const handleUpdateItem = (idx: number, patch: Partial<EventListingItem>) => {
    const list = [...(config.items || [])];
    list[idx] = { ...list[idx], ...patch };
    handleUpdate({ items: list });
  };

  const handleRemoveItem = (idx: number) => {
    const list = [...(config.items || [])];
    list.splice(idx, 1);
    handleUpdate({ items: list });
  };

  return (
    <div dir="rtl" className="space-y-3 p-1 font-sans text-xs text-zinc-300">
      {/* =========================================================================
          ACCORDION 1: 6 STYLES PRESETS & LAYOUT (כל הלשוניות סגורות כברירת מחדל)
      ========================================================================= */}
      <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
        <button
          type="button"
          onClick={() => toggleMainAccordion('styles')}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
          title="בחירת אחד מ-6 סגנונות העיצוב המסונכרנים עם המותג וסגנון הכרטיס"
        >
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-sky-400" />
            <span>סגנונות עיצוב ומבנה פריסה</span>
          </div>
          <ChevronDown
            className={clsx(
              'w-4 h-4 transition-transform duration-200',
              openMainAccordion === 'styles' ? 'rotate-180 text-sky-400' : 'text-zinc-500'
            )}
          />
        </button>

        {openMainAccordion === 'styles' && (
          <div className="p-3.5 border-t border-white/10 space-y-4 bg-black/40">
            {/* 6 Visual Style Presets Grid */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-zinc-400">6 ארכיטיפי סגנון:</span>
              <div className="grid grid-cols-2 gap-2">
                {STYLE_PRESETS.map((p) => {
                  const IconComp = p.icon;
                  const isSelected = (config.stylePreset || 'standard') === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleUpdate({ stylePreset: p.id })}
                      className={clsx(
                        'p-2 rounded-xl border text-right transition flex items-center gap-2 cursor-pointer',
                        isSelected
                          ? 'border-sky-500 bg-sky-500/20 text-white font-bold'
                          : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                      )}
                      title={p.title}
                    >
                      <span style={{ color: p.color }} className="shrink-0">
                        <IconComp className="w-4 h-4" />
                      </span>
                      <span className="truncate">{p.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card Layout Choice: Classic vs Split Arch */}
            <div className="pt-2 border-t border-white/10 space-y-1.5">
              <span className="text-[11px] font-semibold text-zinc-400">מבנה כרטיס האירוע:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdate({ cardLayout: 'classic-card' })}
                  className={clsx(
                    'p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer',
                    (config.cardLayout || 'classic-card') === 'classic-card'
                      ? 'border-amber-500 bg-amber-500/20 text-white font-bold'
                      : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                  )}
                  title="תמונה עליונה עם סרט הרשמה + כותרת + 3 עמודות נתונים (מתי / מיקום / תאריך)"
                >
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px]">כרטיס קלאסי (3 עמודות)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdate({ cardLayout: 'split-arch' })}
                  className={clsx(
                    'p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer',
                    config.cardLayout === 'split-arch'
                      ? 'border-amber-500 bg-amber-500/20 text-white font-bold'
                      : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                  )}
                  title="פיצול אופקי: טקסט ומפגשים בימין + מסכת קשת עם תמונה משמאל"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px]">מפוצל עם קשת (Split Arch)</span>
                </button>
              </div>
            </div>

            {/* Image Mask Shape Selector */}
            <div className="pt-2 border-t border-white/10 space-y-1.5">
              <span className="text-[11px] font-semibold text-zinc-400">צורת מסכת התמונה (Image Mask Shape):</span>
              <div className="grid grid-cols-2 gap-1.5">
                {MASK_SHAPES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleUpdate({ imageMaskShape: m.id })}
                    className={clsx(
                      'p-2 rounded-lg border text-right transition flex items-center justify-between cursor-pointer',
                      (config.imageMaskShape || 'arch') === m.id
                        ? 'border-emerald-500 bg-emerald-500/20 text-white font-bold'
                        : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                    )}
                    title={m.desc}
                  >
                    <span className="text-[11px] truncate">{m.title}</span>
                    {(config.imageMaskShape || 'arch') === m.id && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Effects */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400">אפקט כרטיס:</span>
              <div className="flex items-center gap-1">
                {[
                  { id: 'lift-shadow', title: 'ציפה והרמה' },
                  { id: 'glow-hover', title: 'הילת מותג' },
                  { id: 'border-beam', title: 'קרן אור' },
                  { id: 'tilt-3d', title: 'הטיית 3D' },
                ].map((ef) => (
                  <button
                    key={ef.id}
                    type="button"
                    onClick={() => handleUpdate({ cardEffect: ef.id as any })}
                    className={clsx(
                      'px-2 py-1 rounded-lg border text-[10px] cursor-pointer transition',
                      (config.cardEffect || 'lift-shadow') === ef.id
                        ? 'border-sky-500 bg-sky-500/30 text-white font-bold'
                        : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                    )}
                    title={ef.title}
                  >
                    {ef.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          ACCORDION 2: NESTED ACCORDION FOR CONTENT & FULL TYPOGRAPHY
      ========================================================================= */}
      <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
        <button
          type="button"
          onClick={() => toggleMainAccordion('content_typography')}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
          title="עריכת תוכן, כותרות, פונטים, עורך WYSIWYG וסוכן AI"
        >
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-emerald-400" />
            <span>תוכן וטיפוגרפיה (Nested Accordion)</span>
          </div>
          <ChevronDown
            className={clsx(
              'w-4 h-4 transition-transform duration-200',
              openMainAccordion === 'content_typography' ? 'rotate-180 text-emerald-400' : 'text-zinc-500'
            )}
          />
        </button>

        {openMainAccordion === 'content_typography' && (
          <div className="p-3 border-t border-white/10 space-y-2 bg-black/40">
            {/* Nested Item 1: Main Title & Typography */}
            <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
              <button
                type="button"
                onClick={() => toggleNestedAccordion('title_sub')}
                className="w-full p-2.5 flex items-center justify-between text-xs font-semibold text-zinc-300 hover:bg-white/5 cursor-pointer"
                title="עריכת כותרת ראשית, גודל גופן, משקל, צבע ויישור"
              >
                <span>כותרת ראשית ותת-כותרת</span>
                <ChevronDown
                  className={clsx(
                    'w-3.5 h-3.5 transition-transform',
                    openNestedAccordion === 'title_sub' ? 'rotate-180 text-emerald-400' : 'text-zinc-500'
                  )}
                />
              </button>

              {openNestedAccordion === 'title_sub' && (
                <div className="p-3 border-t border-white/10 space-y-3 bg-black/30">
                  {/* Badge with AI button */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={config.badge || ''}
                      onChange={(e) => handleUpdate({ badge: e.target.value })}
                      placeholder="תגית עליונה (באדג')..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleEnhanceTextWithAi('badge', 'נסח תגית קצרה, יוקרתית וממוקדת לאירועים')
                      }
                      disabled={aiLoadingField === 'badge'}
                      className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 cursor-pointer"
                      title="שפר תגית באמצעות סוכן AI"
                    >
                      {aiLoadingField === 'badge' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Title with AI button */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={config.title || ''}
                      onChange={(e) => handleUpdate({ title: e.target.value })}
                      placeholder="כותרת אזור האירועים..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleEnhanceTextWithAi('title', 'שפר והתאם את כותרת אזור האירועים למותג')
                      }
                      disabled={aiLoadingField === 'title'}
                      className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 cursor-pointer"
                      title="שפר כותרת באמצעות סוכן AI"
                    >
                      {aiLoadingField === 'title' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Subtitle with AI button */}
                  <div className="flex items-center gap-1.5">
                    <textarea
                      rows={2}
                      value={config.subtitle || ''}
                      onChange={(e) => handleUpdate({ subtitle: e.target.value })}
                      placeholder="תת-כותרת והסבר קצר..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleEnhanceTextWithAi('subtitle', 'נסח תת-כותרת שיווקית ומזמינה להרשמה לאירועים')
                      }
                      disabled={aiLoadingField === 'subtitle'}
                      className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 cursor-pointer shrink-0"
                      title="שפר תת-כותרת באמצעות סוכן AI"
                    >
                      {aiLoadingField === 'subtitle' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Full Typography Controls - Icons & Tooltips Only */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-1 flex-wrap">
                    {/* Font Size */}
                    <div className="flex items-center gap-1">
                      {(['xl', '2xl', '3xl', '4xl'] as const).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleUpdate({ titleFontSize: sz })}
                          className={clsx(
                            'px-2 py-1 rounded border text-[10px] cursor-pointer transition',
                            (config.titleFontSize || '3xl') === sz
                              ? 'border-emerald-500 bg-emerald-500/30 text-white font-bold'
                              : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                          )}
                          title={`גודל גופן ${sz}`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>

                    {/* Weight & Style Toggles */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdate({
                            titleFontWeight:
                              config.titleFontWeight === 'extrabold'
                                ? 'bold'
                                : config.titleFontWeight === 'bold'
                                ? 'normal'
                                : 'extrabold',
                          })
                        }
                        className={clsx(
                          'p-1.5 rounded border cursor-pointer transition',
                          config.titleFontWeight === 'extrabold' || config.titleFontWeight === 'bold'
                            ? 'border-emerald-500 bg-emerald-500/30 text-white'
                            : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                        )}
                        title="הדגשה (Bold)"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdate({ titleItalic: !config.titleItalic })}
                        className={clsx(
                          'p-1.5 rounded border cursor-pointer transition',
                          config.titleItalic
                            ? 'border-emerald-500 bg-emerald-500/30 text-white'
                            : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                        )}
                        title="נטוי (Italic)"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdate({ titleUnderline: !config.titleUnderline })}
                        className={clsx(
                          'p-1.5 rounded border cursor-pointer transition',
                          config.titleUnderline
                            ? 'border-emerald-500 bg-emerald-500/30 text-white'
                            : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                        )}
                        title="קו תחתון (Underline)"
                      >
                        <Underline className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Alignment */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleUpdate({ titleAlignment: 'right' })}
                        className={clsx(
                          'p-1.5 rounded border cursor-pointer',
                          (config.titleAlignment || 'center') === 'right'
                            ? 'border-emerald-500 bg-emerald-500/30 text-white'
                            : 'border-white/10 bg-white/5 text-zinc-400'
                        )}
                        title="יישור לימין"
                      >
                        <AlignRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdate({ titleAlignment: 'center' })}
                        className={clsx(
                          'p-1.5 rounded border cursor-pointer',
                          (config.titleAlignment || 'center') === 'center'
                            ? 'border-emerald-500 bg-emerald-500/30 text-white'
                            : 'border-white/10 bg-white/5 text-zinc-400'
                        )}
                        title="יישור למרכז"
                      >
                        <AlignCenter className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdate({ titleAlignment: 'left' })}
                        className={clsx(
                          'p-1.5 rounded border cursor-pointer',
                          config.titleAlignment === 'left'
                            ? 'border-emerald-500 bg-emerald-500/30 text-white'
                            : 'border-white/10 bg-white/5 text-zinc-400'
                        )}
                        title="יישור לשמאל"
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title Color Picker */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400">צבע כותרת:</span>
                    <PageBuilderColorPicker
                      label="צבע כותרת"
                      value={config.titleColor || '#ffffff'}
                      onChange={(c) => handleUpdate({ titleColor: c })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Nested Item 2: WYSIWYG Rich Content Description */}
            <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
              <button
                type="button"
                onClick={() => toggleNestedAccordion('wysiwyg')}
                className="w-full p-2.5 flex items-center justify-between text-xs font-semibold text-zinc-300 hover:bg-white/5 cursor-pointer"
                title="עורך WYSIWYG עשיר עם כפתור AI מובנה"
              >
                <span>תיאור מורחב (עורך WYSIWYG עשיר)</span>
                <ChevronDown
                  className={clsx(
                    'w-3.5 h-3.5 transition-transform',
                    openNestedAccordion === 'wysiwyg' ? 'rotate-180 text-emerald-400' : 'text-zinc-500'
                  )}
                />
              </button>

              {openNestedAccordion === 'wysiwyg' && (
                <div className="p-3 border-t border-white/10 space-y-2 bg-black/30">
                  <RichContentWysiwygEditor
                    value={config.descriptionHtml || ''}
                    onChange={(html) => handleUpdate({ descriptionHtml: html })}
                    brandDna={brandDna}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          ACCORDION 3: EVENT ITEMS & TIME/LOCATION SYNC (כרטיסים ומפגשים)
      ========================================================================= */}
      <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
        <button
          type="button"
          onClick={() => toggleMainAccordion('items')}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
          title="ניהול רשימת האירועים, תאריכים, זמנים, מיקומים ומסכות תמונה (KOSCLOUD בלבד)"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>אירועים וזמנים ({config.items?.length || 0})</span>
          </div>
          <ChevronDown
            className={clsx(
              'w-4 h-4 transition-transform duration-200',
              openMainAccordion === 'items' ? 'rotate-180 text-amber-400' : 'text-zinc-500'
            )}
          />
        </button>

        {openMainAccordion === 'items' && (
          <div className="p-3.5 border-t border-white/10 space-y-3 bg-black/40">
            {/* Source Mode Selector: Auto Pages vs Selected Pages vs Manual */}
            <div className="space-y-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-300">מקור נתוני האזור:</span>
                <span className="text-[10px] text-zinc-500">שאיבה דינמית מעמודים והגדרות SEO</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'auto-pages', title: 'שאיבה אוטומטית' },
                  { id: 'selected-pages', title: 'בחירת עמודים' },
                  { id: 'manual', title: 'הזנה ידנית' },
                ].map((srcOption) => (
                  <button
                    key={srcOption.id}
                    type="button"
                    onClick={() => handleUpdate({ source: srcOption.id as any })}
                    className={clsx(
                      'py-1.5 px-2 rounded-lg border text-[11px] font-semibold text-center cursor-pointer transition',
                      (config.source || 'auto-pages') === srcOption.id
                        ? 'border-sky-500 bg-sky-500/20 text-sky-400 font-bold'
                        : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                    )}
                    title={srcOption.title}
                  >
                    {srcOption.title}
                  </button>
                ))}
              </div>

              {/* Dynamic Pages Multi-Select Dropdown if source === 'selected-pages' */}
              {config.source === 'selected-pages' && (
                <div className="mt-2.5 pt-2.5 border-t border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-amber-400">
                      בחירת עמודים מהמערכת (כותרת, SEO ותמונה):
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      נבחרו: {(config.selectedPageIds || []).length}
                    </span>
                  </div>

                  {loadingPages ? (
                    <div className="p-3 text-center text-zinc-400 text-xs flex items-center justify-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>טוען רשימת עמודים...</span>
                    </div>
                  ) : availablePages.length === 0 ? (
                    <p className="text-[11px] text-zinc-500">לא נמצאו עמודים קיימים בטננט.</p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1 border border-white/10 rounded-lg p-1.5 bg-black/40">
                      {availablePages.map((page) => {
                        const isSelected = (config.selectedPageIds || []).includes(page.pageId);
                        return (
                          <button
                            key={page.pageId}
                            type="button"
                            onClick={() => {
                              const currentSelected = config.selectedPageIds || [];
                              const nextSelected = isSelected
                                ? currentSelected.filter((id) => id !== page.pageId)
                                : [...currentSelected, page.pageId];
                              handleUpdate({ selectedPageIds: nextSelected });
                            }}
                            className={clsx(
                              'w-full p-2 rounded-lg text-right text-xs flex items-center justify-between transition cursor-pointer',
                              isSelected
                                ? 'bg-sky-500/20 text-white border border-sky-500/40 font-bold'
                                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200 border border-transparent'
                            )}
                            title={`קטגוריה: ${page.pageCategory} • נתיב: /${page.slug}`}
                          >
                            <div className="flex flex-col text-right truncate">
                              <span className="truncate">{page.pageTitle}</span>
                              <span className="text-[10px] text-zinc-500">/{page.slug} ({page.pageCategory})</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* List of items */}
            <div className="space-y-3">
              {(config.items || []).map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-3 rounded-xl border border-white/10 bg-white/5 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400">אירוע #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 rounded text-red-400 hover:bg-red-500/20 transition cursor-pointer"
                      title="הסר אירוע זה"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title & Badge */}
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => handleUpdateItem(idx, { title: e.target.value })}
                      placeholder="שם האירוע / הקורס..."
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={item.badge || ''}
                      onChange={(e) => handleUpdateItem(idx, { badge: e.target.value })}
                      placeholder="סרט עליון (מחזור תשפ״ז...)"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300"
                    />
                  </div>

                  {/* Subtitle / Excerpt */}
                  <textarea
                    rows={2}
                    value={item.subtitle || ''}
                    onChange={(e) => handleUpdateItem(idx, { subtitle: e.target.value })}
                    placeholder="תיאור קצר או מנחה האירוע..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300"
                  />

                  {/* Time & Location 3 Synced Grid Fields */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-zinc-500 block mb-0.5">מתי (ימים ושעות):</span>
                      <input
                        type="text"
                        value={item.dayAndTime || ''}
                        onChange={(e) => handleUpdateItem(idx, { dayAndTime: e.target.value })}
                        placeholder="בימי ראשון 20:00"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block mb-0.5">מיקום / פורמט:</span>
                      <input
                        type="text"
                        value={item.locationFormat || ''}
                        onChange={(e) => handleUpdateItem(idx, { locationFormat: e.target.value })}
                        placeholder="היברידי: זום ומרכז חיבה"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block mb-0.5">מתחילים ב / מפגשים:</span>
                      <input
                        type="text"
                        value={item.startDateText || ''}
                        onChange={(e) => handleUpdateItem(idx, { startDateText: e.target.value })}
                        placeholder="כ״א חשון • 10 מפגשים"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white"
                      />
                    </div>
                  </div>

                  {/* KOSCLOUD Image Upload / Selection */}
                  <div className="pt-1">
                    <span className="text-[10px] text-zinc-500 block mb-1">
                      תמונת האירוע (בחירה והעלאה אך ורק מתוך KOSCLOUD):
                    </span>
                    <PageBuilderImageUpload
                      value={item.imageUrl || ''}
                      onChange={(url) => handleUpdateItem(idx, { imageUrl: url })}
                      label="תמונת אירוע (KOSCLOUD)"
                    />
                  </div>

                  {/* CTA Text and URL */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <input
                      type="text"
                      value={item.ctaText || ''}
                      onChange={(e) => handleUpdateItem(idx, { ctaText: e.target.value })}
                      placeholder="טקסט כפתור (לפרטים והצטרפות)"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white"
                    />
                    <input
                      type="text"
                      value={item.linkUrl || ''}
                      onChange={(e) => handleUpdateItem(idx, { linkUrl: e.target.value })}
                      placeholder="כתובת קישור (URL / #sec-rsvp)"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddItem}
                className="w-full py-2.5 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition flex items-center justify-center gap-2 font-bold cursor-pointer text-xs"
                title="הוספת אירוע חדש לרשימה"
              >
                <Plus className="w-4 h-4" />
                <span>הוסף אירוע חדש</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          ACCORDION 4: BACKGROUND & CLOUD MEDIA OVERLAY (KOSCLOUD)
      ========================================================================= */}
      <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
        <button
          type="button"
          onClick={() => toggleMainAccordion('background_media')}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
          title="הגדרת צבע רקע, גבולות ומדיית רקע מתוך KOSCLOUD"
        >
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-400" />
            <span>צבעי רקע ומדיה מתוך KOSCLOUD</span>
          </div>
          <ChevronDown
            className={clsx(
              'w-4 h-4 transition-transform duration-200',
              openMainAccordion === 'background_media' ? 'rotate-180 text-purple-400' : 'text-zinc-500'
            )}
          />
        </button>

        {openMainAccordion === 'background_media' && (
          <div className="p-3.5 border-t border-white/10 space-y-3 bg-black/40">
            <div className="grid grid-cols-2 gap-3">
              <PageBuilderColorPicker
                label="צבע רקע לאזור"
                value={config.backgroundColor || 'transparent'}
                onChange={(c) => handleUpdate({ backgroundColor: c })}
              />
              <PageBuilderColorPicker
                label="צבע רקע לכרטיס"
                value={config.cardBackgroundColor || '#ffffff'}
                onChange={(c) => handleUpdate({ cardBackgroundColor: c })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
              <PageBuilderColorPicker
                label="צבע הדגשה / כפתור"
                value={config.accentColor || brandDna?.designTokens?.primaryColor || '#0284c7'}
                onChange={(c) => handleUpdate({ accentColor: c })}
              />
              <PageBuilderColorPicker
                label="צבע גבולות"
                value={config.borderColor || 'transparent'}
                onChange={(c) => handleUpdate({ borderColor: c })}
              />
            </div>

            {/* Cloud Media Background */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <span className="text-[11px] font-semibold text-zinc-400">
                מדיית רקע לאזור מתוך KOSCLOUD:
              </span>
              <PageBuilderImageUpload
                value={config.bgMediaUrl || ''}
                onChange={(url) => handleUpdate({ bgMediaUrl: url })}
                label="מדיית רקע (KOSCLOUD)"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
