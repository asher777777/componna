import React, { useState, useEffect, useMemo } from 'react';
import {
  DecorativeDividerSectionConfig,
  DecorativeDividerBackgroundType,
  DecorativeDividerDistribution,
  DecorativeDividerIconStretch,
} from '../../types/sectionConfigs';
import { TenantStylePreset, AiTextAssistantContract, BrandDnaContract, MediaPickerContract } from '../../../../core/contracts';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { resolveCurrentTenantId, ROOT_TENANT_ID } from '../../../../core/tenant/tenantResolver';
import { resolveLiveBrandDna } from '../../services/brandSectionHydrator';
import { loadBrandDna } from '../../../KosBranding/services/brandDnaFirestore';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import {
  SHAPES_AND_SYMBOLS_COLLECTION,
  StyleShapeSymbolItem,
  buildShapeSvgDataUrl,
} from './shapesAndSymbolsData';
import {
  Sliders,
  Sparkles,
  Save,
  X,
  CheckCircle2,
  Image as ImageIcon,
  Palette,
  Maximize2,
  Box,
  Layers,
  ArrowUpDown,
  MoveHorizontal,
  Wand2,
  Grid,
  Video,
  Film,
  Repeat,
  RotateCw,
  Zap,
  Activity,
  Heart,
  Shield,
  Compass,
  Crosshair,
  Loader2,
  FolderOpen,
  ChevronDown,
} from 'lucide-react';
import { clsx } from 'clsx';

export interface DecorativeDividerEditorProps {
  config: DecorativeDividerSectionConfig;
  onChange: (updated: DecorativeDividerSectionConfig) => void;
  onClose?: () => void;
}

export const DecorativeDividerEditor: React.FC<DecorativeDividerEditorProps> = ({
  config,
  onChange,
  onClose,
}) => {
  const { db } = useSystemConnection();
  const { getCapability } = useHostCapabilities();
  const aiAssistant = getCapability<AiTextAssistantContract>('ai-assistant');
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');
  const rawBrandCap = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;

  const effTenant = useMemo(
    () => (typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID) || '_master',
    []
  );

  // Local draft state for Dirty tracking & saving
  const [localConfig, setLocalConfig] = useState<DecorativeDividerSectionConfig>(config);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isBrandSynced, setIsBrandSynced] = useState(false);

  // AI loading indicator
  const [aiLoading, setAiLoading] = useState(false);

  // Search filter for Shapes and Symbols
  const [shapeSearch, setShapeSearch] = useState<string>('');
  const [selectedShapeArchetype, setSelectedShapeArchetype] = useState<string>('all');

  // Synchronize when outer config changes and not dirty
  useEffect(() => {
    if (!isDirty) {
      setLocalConfig(config);
    }
  }, [config, isDirty]);

  // Firestore Brand DNA state
  const [firestoreBrand, setFirestoreBrand] = useState<any>(null);

  useEffect(() => {
    let active = true;
    async function fetchBrand() {
      try {
        const dna = await loadBrandDna(db, effTenant);
        if (active && dna) {
          setFirestoreBrand(dna);
        }
      } catch {}
    }
    fetchBrand();
    return () => {
      active = false;
    };
  }, [db, effTenant]);

  const liveBrand = useMemo(
    () => resolveLiveBrandDna(firestoreBrand || rawBrandCap, effTenant),
    [firestoreBrand, rawBrandCap, effTenant]
  );

  // Nested Exclusive Accordions - ALL CLOSED BY DEFAULT
  const [openMainAccordion, setOpenMainAccordion] = useState<string | null>(null);
  const [openNestedAccordion, setOpenNestedAccordion] = useState<string | null>(null);

  const toggleMainAccordion = (id: string) => {
    setOpenMainAccordion((prev) => (prev === id ? null : id));
    setOpenNestedAccordion(null);
  };

  const toggleNestedAccordion = (id: string) => {
    setOpenNestedAccordion((prev) => (prev === id ? null : id));
  };

  // Update handler
  const handleUpdate = (updated: Partial<DecorativeDividerSectionConfig>) => {
    const next = { ...localConfig, ...updated };
    setLocalConfig(next);
    setIsDirty(true);
    onChange(next);
  };

  // Synchronize with Brand DNA Colors
  const handleSyncBrandDna = () => {
    if (!liveBrand) return;
    const primaryColor = liveBrand.designTokens?.primaryColor || '#4f46e5';
    const preset = liveBrand.designTokens?.defaultStylePreset as TenantStylePreset;

    const next: DecorativeDividerSectionConfig = {
      ...localConfig,
      stylePreset: preset || localConfig.stylePreset,
      iconColor: primaryColor,
      solidColor: localConfig.bgType === 'solid' ? primaryColor : localConfig.solidColor,
      gradientFrom: primaryColor,
      textColor: liveBrand.designTokens?.textColorH1 || '#ffffff',
    };

    setLocalConfig(next);
    setIsDirty(true);
    setIsBrandSynced(true);
    onChange(next);
    setTimeout(() => setIsBrandSynced(false), 2500);
  };

  // Save handler
  const handleSave = (andClose = false) => {
    setIsSaving(true);
    onChange(localConfig);
    setIsDirty(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    setIsSaving(false);
    if (andClose && onClose) {
      onClose();
    }
  };

  // Close handler with confirmation
  const handleRequestClose = () => {
    if (isDirty) {
      setShowUnsavedConfirm(true);
      return;
    }
    if (onClose) onClose();
  };

  // AI Text Enhancement for decorative micro-label
  const handleEnhanceTextWithAi = async () => {
    if (!aiAssistant) return;
    setAiLoading(true);
    try {
      const voiceHint = liveBrand?.voice?.powerWords?.slice(0, 3).join(', ') || '';
      const res = await aiAssistant.enhanceText({
        originalText: localConfig.decorativeText || '',
        instruction: `נסח מילת עיטור או סלוגן קצרצר של 1-3 מילים שמתאים כעיטור עיצובי מרהיב בין אזורים. מילות מפתח: ${voiceHint}. פנייה: ${liveBrand?.voice?.genderAddressing || 'direct'}.`,
        brandDna: liveBrand,
      });
      if (res && res.text) {
        handleUpdate({ decorativeText: res.text });
      }
    } catch (err) {
      console.warn('AI enhance failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // Filtered Shapes and Symbols from the Curated Catalog
  const filteredShapes = useMemo(() => {
    return SHAPES_AND_SYMBOLS_COLLECTION.filter((shape) => {
      const matchArch =
        selectedShapeArchetype === 'all' || shape.archetype === selectedShapeArchetype;
      const matchSearch =
        !shapeSearch ||
        shape.name.includes(shapeSearch) ||
        shape.titleHe.includes(shapeSearch) ||
        shape.keywords.some((kw) => kw.includes(shapeSearch));
      return matchArch && matchSearch;
    });
  }, [shapeSearch, selectedShapeArchetype]);

  // Handle Pick Shape from Curated Collection
  const handleSelectShapeItem = (shape: StyleShapeSymbolItem) => {
    const svgUrl = buildShapeSvgDataUrl(shape, localConfig.iconColor || liveBrand?.designTokens?.primaryColor);
    handleUpdate({
      iconName: shape.id,
      customSvgDataUrl: svgUrl,
      effectType: shape.effect,
      stylePreset: shape.archetype,
    });
  };

  // Open KOSCLOUD Media Picker specifically for Shapes & Symbols / SVGs
  const handleOpenKosCloudPicker = async () => {
    if (!mediaPicker) return;
    try {
      const selected = await mediaPicker.openPicker({
        multiple: false,
        initialTab: 'icons',
        accept: 'image/svg+xml,image/*',
      });
      if (selected) {
        const url = Array.isArray(selected) ? selected[0] : selected;
        if (url) {
          handleUpdate({
            customSvgDataUrl: url,
            iconName: undefined,
          });
        }
      }
    } catch (err) {
      console.warn('Failed opening KOSCLOUD picker:', err);
    }
  };

  return (
    <div
      className="w-full rounded-3xl sm:rounded-[2.5rem] p-3.5 sm:p-5 relative shadow-2xl flex flex-col no-scrollbar border transition-colors font-sans text-right bg-[#0a0a0a] border-white/10 text-white"
      style={{ fontFamily: "'Heebo', sans-serif" }}
      dir="rtl"
    >
      {/* 1. Header: Two-Letter Avatar (DD), Title, Brand Sync, Save & Close */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b shrink-0 border-white/10">
        <div className="flex items-center gap-2 max-w-[70%]">
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black shrink-0 shadow-sm border select-none bg-amber-500/20 text-amber-400 border-amber-500/30"
            title="עורך אזור עיצוב, מרווחים ועיטורי SVG"
          >
            DD
          </div>

          <div className="truncate">
            <div className="text-xs sm:text-sm font-black truncate leading-tight text-white flex items-center gap-1.5">
              <span>אזור עיצוב, מרווח ואייקון SVG (Design & Spacer)</span>
            </div>
            <div className="text-[10px] truncate leading-none mt-0.5 text-zinc-400">
              גובה פעיל: {localConfig.height || 120}px • סגנון: {localConfig.stylePreset || 'standard'}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleSyncBrandDna}
            className={clsx(
              'p-1.5 rounded-full border transition hover:opacity-80 cursor-pointer',
              isBrandSynced
                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                : 'border-amber-900 text-amber-400 bg-amber-950/30'
            )}
            title="סנכרן צבעים וסגנון מ-Brand DNA"
          >
            {isBrandSynced ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className={clsx(
              'p-1.5 rounded-full transition shadow-sm cursor-pointer disabled:opacity-50',
              isDirty
                ? 'bg-amber-500 hover:bg-amber-400 text-black ring-2 ring-amber-400/50 animate-pulse'
                : saveSuccess
                ? 'bg-emerald-500 text-black'
                : 'bg-white/10 hover:bg-white/20 text-white'
            )}
            title={isDirty ? 'שמור שינויים' : saveSuccess ? 'נשמר בהצלחה!' : 'שמור'}
          >
            {saveSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={handleRequestClose}
              className="p-1.5 rounded-full transition cursor-pointer bg-white/10 hover:bg-white/20 text-white"
              title="סגור"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Unsaved Changes Confirmation */}
      {showUnsavedConfirm && (
        <div className="mb-2.5 p-3 rounded-2xl border flex flex-col gap-2 animate-fadeIn bg-amber-950/40 border-amber-500/40 text-amber-200">
          <div className="text-xs font-bold">יש שינויים שלא נשמרו. מה ברצונך לעשות?</div>
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition cursor-pointer"
            >
              שמור וסגור
            </button>
            <button
              type="button"
              onClick={() => {
                setShowUnsavedConfirm(false);
                if (onClose) onClose();
              }}
              className="px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/50"
            >
              צא ללא שמירה
            </button>
            <button
              type="button"
              onClick={() => setShowUnsavedConfirm(false)}
              className="px-2.5 py-1 rounded-xl text-xs opacity-70 hover:opacity-100 transition cursor-pointer"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* 2. Top Presets Bar (6 Synced Style Presets) */}
      <div className="p-2.5 mb-2.5 rounded-2xl border relative transition-all bg-[#141414] border-white/5">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
            <Wand2 className="w-3 h-3" />
            <span>6 ארכיטיפי סגנון (מתאימים אוטומטית צבעים, צורות ואפקטים)</span>
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-500/15 text-amber-300 border-amber-500/30">
            פעיל: {localConfig.stylePreset || 'standard'}
          </span>
        </div>

        <div className="grid grid-cols-6 gap-1.5">
          {[
            { id: 'feminine', label: 'נשי', icon: Heart, effect: 'pulse-glow' },
            { id: 'masculine', label: 'גברי', icon: Shield, effect: 'shimmer-beam' },
            { id: 'standard', label: 'סטנדרט', icon: Layers, effect: 'float-bob' },
            { id: 'spiritual', label: 'רוחני', icon: Compass, effect: 'wave-drift' },
            { id: 'sharp', label: 'חד 0px', icon: Crosshair, effect: 'cyber-scan' },
            { id: 'analytical', label: 'אנליטי', icon: Activity, effect: 'rotate-slow' },
          ].map((preset) => {
            const IconComp = preset.icon;
            const isSelected = (localConfig.stylePreset || 'standard') === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() =>
                  handleUpdate({
                    stylePreset: preset.id as TenantStylePreset,
                    effectType: preset.effect as any,
                  })
                }
                className={clsx(
                  'w-full py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer',
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-md ring-1 ring-amber-500/40'
                    : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                )}
                title={`סגנון ${preset.label}`}
              >
                <IconComp className="w-4 h-4 shrink-0" />
                <span className="text-[10px] font-bold truncate">{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Exclusive Nested Accordions (Closed by default) */}
      <div className="flex flex-col gap-2">
        {/* Accordion 1: גובה האזור ומתיחה (Height Dragging & Dimensions) */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
          <button
            type="button"
            onClick={() => toggleMainAccordion('height_dimensions')}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
            title="קביעת גובה האזור, גרירה אינטראקטיבית ומתיחה לרוחב מלא"
          >
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-amber-400" />
              <span>1. קביעת גובה, גרירה ומתיחה (Height & Stretch)</span>
            </div>
            <ChevronDown
              className={clsx(
                'w-4 h-4 transition-transform duration-200',
                openMainAccordion === 'height_dimensions' ? 'rotate-180 text-amber-400' : 'text-zinc-500'
              )}
            />
          </button>

          {openMainAccordion === 'height_dimensions' && (
            <div className="p-3.5 border-t border-white/10 space-y-3.5 bg-black/30">
              {/* Height Slider & Exact Numeric Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-semibold">גובה האזור בפיקסלים:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={32}
                      max={600}
                      value={localConfig.height || 120}
                      onChange={(e) => handleUpdate({ height: Number(e.target.value) || 120 })}
                      className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-center font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-zinc-400 text-[10px]">PX</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={32}
                  max={600}
                  step={4}
                  value={localConfig.height || 120}
                  onChange={(e) => handleUpdate({ height: Number(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />

                <span className="text-[10px] text-zinc-500 block">
                  * ניתן גם לקבוע את הגובה ישירות על ידי גרירת הידית בתחתית האזור בעמוד
                </span>
              </div>

              {/* Stretch & Container Width */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <div className="p-3 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">מתיחה לרוחב מלא (Full Width)</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">פריסה מרווחת מקצה לקצה</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localConfig.fullWidth !== false}
                      onChange={(e) => handleUpdate({ fullWidth: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300">ריווח שוליים צדדיים (Padding X):</label>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { id: 0, label: '0px' },
                      { id: 16, label: '16px' },
                      { id: 32, label: '32px' },
                      { id: 64, label: '64px' },
                    ].map((pad) => (
                      <button
                        key={pad.id}
                        type="button"
                        onClick={() => handleUpdate({ containerPaddingX: pad.id })}
                        className={clsx(
                          'p-1.5 rounded-lg border text-xs text-center transition cursor-pointer',
                          (localConfig.containerPaddingX ?? 24) === pad.id
                            ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                            : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                        )}
                      >
                        {pad.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accordion 2: קביעת רקע - סוליד, גרדיאנט, תמונה ווידאו */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
          <button
            type="button"
            onClick={() => toggleMainAccordion('background_settings')}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
            title="בחירת סוג רקע: שקוף, צבע סוליד, גרדיאנט, תמונה או וידאו"
          >
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>2. קביעת רקע - סוליד, גרדיאנט, תמונה ווידאו (Background)</span>
            </div>
            <ChevronDown
              className={clsx(
                'w-4 h-4 transition-transform duration-200',
                openMainAccordion === 'background_settings' ? 'rotate-180 text-amber-400' : 'text-zinc-500'
              )}
            />
          </button>

          {openMainAccordion === 'background_settings' && (
            <div className="p-3.5 border-t border-white/10 space-y-3.5 bg-black/30">
              {/* Background Type Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {[
                  { id: 'transparent', label: 'שקוף', icon: Box },
                  { id: 'solid', label: 'צבע סוליד', icon: Palette },
                  { id: 'gradient', label: 'גרדיאנט', icon: Sparkles },
                  { id: 'image', label: 'תמונה', icon: ImageIcon },
                  { id: 'video', label: 'וידאו', icon: Video },
                ].map((bg) => {
                  const IconComp = bg.icon;
                  const isSelected = (localConfig.bgType || 'transparent') === bg.id;
                  return (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => handleUpdate({ bgType: bg.id as DecorativeDividerBackgroundType })}
                      className={clsx(
                        'p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1',
                        isSelected
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                          : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                      )}
                    >
                      <IconComp className="w-4 h-4" />
                      <span className="text-[11px]">{bg.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Solid Color Options */}
              {localConfig.bgType === 'solid' && (
                <div className="p-3 rounded-xl border border-white/10 bg-white/5 animate-fadeIn">
                  <PageBuilderColorPicker
                    label="צבע רקע סוליד"
                    value={localConfig.solidColor || '#000000'}
                    onChange={(color) => handleUpdate({ solidColor: color })}
                  />
                </div>
              )}

              {/* Gradient Options */}
              {localConfig.bgType === 'gradient' && (
                <div className="p-3 rounded-xl border border-white/10 bg-white/5 space-y-3 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <PageBuilderColorPicker
                      label="צבע התחלה"
                      value={localConfig.gradientFrom || '#4f46e5'}
                      onChange={(c) => handleUpdate({ gradientFrom: c })}
                    />
                    <PageBuilderColorPicker
                      label="צבע אמצע (אופציונלי)"
                      value={localConfig.gradientVia || ''}
                      onChange={(c) => handleUpdate({ gradientVia: c })}
                    />
                    <PageBuilderColorPicker
                      label="צבע סיום"
                      value={localConfig.gradientTo || '#000000'}
                      onChange={(c) => handleUpdate({ gradientTo: c })}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-zinc-300">
                      <span>זווית מעבר (Gradient Angle):</span>
                      <span className="font-mono text-amber-400 font-bold">{localConfig.gradientAngle ?? 135}°</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={15}
                      value={localConfig.gradientAngle ?? 135}
                      onChange={(e) => handleUpdate({ gradientAngle: Number(e.target.value) })}
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Image Background */}
              {localConfig.bgType === 'image' && (
                <div className="p-3 rounded-xl border border-white/10 bg-white/5 space-y-3 animate-fadeIn">
                  <PageBuilderImageUpload
                    label="תמונת רקע (KOSCLOUD בלבד)"
                    value={localConfig.bgImageUrl}
                    onChange={(url) => handleUpdate({ bgImageUrl: url })}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <PageBuilderColorPicker
                      label="צבע שכבת כיסוי (Overlay Color)"
                      value={localConfig.bgOverlayColor || '#000000'}
                      onChange={(c) => handleUpdate({ bgOverlayColor: c })}
                    />

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-zinc-300">
                        <span>שקיפות שכבת כיסוי:</span>
                        <span className="font-mono text-amber-400 font-bold">{localConfig.bgOverlayOpacity ?? 0}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={localConfig.bgOverlayOpacity ?? 0}
                        onChange={(e) => handleUpdate({ bgOverlayOpacity: Number(e.target.value) })}
                        className="w-full accent-amber-500 mt-2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Video Background */}
              {localConfig.bgType === 'video' && (
                <div className="p-3 rounded-xl border border-white/10 bg-white/5 space-y-3 animate-fadeIn">
                  <PageBuilderImageUpload
                    label="סרטון וידאו לרקע (KOSCLOUD בלבד - MP4 / WebM)"
                    value={localConfig.bgVideoUrl}
                    onChange={(url) => handleUpdate({ bgVideoUrl: url })}
                    allowedMimeTypes={['video/mp4', 'video/webm']}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <PageBuilderColorPicker
                      label="צבע שכבת כיסוי (Overlay Color)"
                      value={localConfig.bgOverlayColor || '#000000'}
                      onChange={(c) => handleUpdate({ bgOverlayColor: c })}
                    />

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-zinc-300">
                        <span>שקיפות שכבת כיסוי:</span>
                        <span className="font-mono text-amber-400 font-bold">{localConfig.bgOverlayOpacity ?? 20}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={localConfig.bgOverlayOpacity ?? 20}
                        onChange={(e) => handleUpdate({ bgOverlayOpacity: Number(e.target.value) })}
                        className="w-full accent-amber-500 mt-2"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Accordion 3: גלריית צורות וסמלים (Shapes & Symbols Catalog) */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
          <button
            type="button"
            onClick={() => toggleMainAccordion('shapes_catalog')}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
            title="סל אפשרויות לכל אחד מהסגנונות - צורות וסמלים, סמלי מותג ו-SVG מותאם"
          >
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-amber-400" />
              <span>3. גלריית ״צורות וסמלים״ ואייקון SVG (Shapes & Symbols)</span>
            </div>
            <ChevronDown
              className={clsx(
                'w-4 h-4 transition-transform duration-200',
                openMainAccordion === 'shapes_catalog' ? 'rotate-180 text-amber-400' : 'text-zinc-500'
              )}
            />
          </button>

          {openMainAccordion === 'shapes_catalog' && (
            <div className="p-3.5 border-t border-white/10 space-y-3 bg-black/30">
              {/* Top Action Bar: Search & KOSCLOUD Button */}
              <div className="flex flex-col sm:flex-row items-center gap-2 justify-between">
                <input
                  type="text"
                  placeholder="חיפוש צורה או סמל לפי שם, סגנון או משמעות..."
                  value={shapeSearch}
                  onChange={(e) => setShapeSearch(e.target.value)}
                  className="w-full sm:flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />

                <button
                  type="button"
                  onClick={handleOpenKosCloudPicker}
                  className="w-full sm:w-auto px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  title="בחר או העלה אייקון SVG ישירות מכספת המדיה KOSCLOUD"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>ייבוא מ-KOSCLOUD</span>
                </button>
              </div>

              {/* Filter Pills by Archetype */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
                {[
                  { id: 'all', label: 'הכל' },
                  { id: 'feminine', label: 'נשי' },
                  { id: 'masculine', label: 'גברי' },
                  { id: 'standard', label: 'סטנדרט' },
                  { id: 'spiritual', label: 'רוחני' },
                  { id: 'sharp', label: 'חד' },
                  { id: 'analytical', label: 'אנליטי' },
                ].map((arch) => (
                  <button
                    key={arch.id}
                    type="button"
                    onClick={() => setSelectedShapeArchetype(arch.id)}
                    className={clsx(
                      'px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer shrink-0',
                      selectedShapeArchetype === arch.id
                        ? 'bg-amber-500 text-black'
                        : 'bg-white/5 text-zinc-400 hover:text-white'
                    )}
                  >
                    {arch.label}
                  </button>
                ))}
              </div>

              {/* Shapes Grid */}
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-64 overflow-y-auto no-scrollbar p-1">
                {filteredShapes.map((shape) => {
                  const isSelected = localConfig.iconName === shape.id;
                  return (
                    <div
                      key={shape.id}
                      onClick={() => handleSelectShapeItem(shape)}
                      className={clsx(
                        'p-2.5 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition cursor-pointer select-none hover:-translate-y-0.5',
                        isSelected
                          ? 'border-amber-500 bg-amber-500/20 ring-1 ring-amber-400 text-amber-300'
                          : 'border-white/5 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                      )}
                      title={`${shape.titleHe} (${shape.archetype})`}
                    >
                      <div
                        className="w-8 h-8 flex items-center justify-center"
                        style={{ color: isSelected ? '#fbbf24' : shape.defaultStrokeColor }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="w-full h-full"
                          dangerouslySetInnerHTML={{ __html: shape.svgContent }}
                        />
                      </div>
                      <span className="text-[10px] font-bold truncate max-w-full">{shape.name}</span>
                    </div>
                  );
                })}
              </div>

              {/* Color & Size Controls for Selected Shape / Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <PageBuilderColorPicker
                  label="צבע האייקון / הצורה"
                  value={localConfig.iconColor || liveBrand?.designTokens?.primaryColor || '#4f46e5'}
                  onChange={(c) => {
                    handleUpdate({ iconColor: c });
                    const activeShape = SHAPES_AND_SYMBOLS_COLLECTION.find((s: StyleShapeSymbolItem) => s.id === localConfig.iconName || s.name === localConfig.iconName);
                    if (activeShape) {
                      const updatedSvg = buildShapeSvgDataUrl(activeShape, c);
                      handleUpdate({ iconColor: c, customSvgDataUrl: updatedSvg });
                    }
                  }}
                />

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-zinc-300">
                    <span>גודל האייקון / SVG:</span>
                    <span className="font-mono text-amber-400 font-bold">{localConfig.iconSize || 36}px</span>
                  </div>
                  <input
                    type="range"
                    min={16}
                    max={160}
                    step={4}
                    value={localConfig.iconSize || 36}
                    onChange={(e) => handleUpdate({ iconSize: Number(e.target.value) })}
                    className="w-full accent-amber-500 mt-2"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accordion 4: הכלה, פריסה מרובה ומתיחה (Contain, Distribution & Stretch) */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
          <button
            type="button"
            onClick={() => toggleMainAccordion('distribution_stretch')}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
            title="הכלה, פריסה מרובה (יחיד, חזרתי, מרקיז נע), מרווחים ומתיחה"
          >
            <div className="flex items-center gap-2">
              <MoveHorizontal className="w-4 h-4 text-amber-400" />
              <span>4. הכלה, פריסה מרובה ומתיחה (Layout & Distribution)</span>
            </div>
            <ChevronDown
              className={clsx(
                'w-4 h-4 transition-transform duration-200',
                openMainAccordion === 'distribution_stretch' ? 'rotate-180 text-amber-400' : 'text-zinc-500'
              )}
            />
          </button>

          {openMainAccordion === 'distribution_stretch' && (
            <div className="p-3.5 border-t border-white/10 space-y-3.5 bg-black/30">
              {/* Distribution Mode */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300">אופן פריסת האלמנטים באזור:</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {[
                    { id: 'single', label: 'אלמנט בודד', desc: 'במרכז האזור' },
                    { id: 'spaced-3', label: 'שלישייה מרווחת', desc: '3 אלמנטים' },
                    { id: 'spaced-5', label: 'חמישייה מעוצבת', desc: '5 אלמנטים' },
                    { id: 'repeat', label: 'חזרתיות רציפה', desc: 'גריד חוזר' },
                    { id: 'flow-marquee', label: 'תנועה רציפה', desc: 'מרקיז נע (Loop)' },
                  ].map((dist) => (
                    <button
                      key={dist.id}
                      type="button"
                      onClick={() => handleUpdate({ distribution: dist.id as DecorativeDividerDistribution })}
                      className={clsx(
                        'p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-0.5',
                        (localConfig.distribution || 'single') === dist.id
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                          : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                      )}
                    >
                      <span className="text-xs">{dist.label}</span>
                      <span className="text-[10px] opacity-75">{dist.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stretch Mode */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
                <label className="text-xs font-semibold text-zinc-300">הכלה ומתיחת האלמנט (Fit & Stretch):</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'contain', label: 'הכלה (Contain)', desc: 'פרופורציה מדויקת' },
                    { id: 'cover', label: 'כיסוי מלא (Cover)', desc: 'מילוי שטח החלל' },
                    { id: 'stretch', label: 'מתיחה (Stretch)', desc: 'מתיחה לאורך ולרוחב' },
                    { id: 'original', label: 'גודל מקורי', desc: 'ללא שינוי קנה מידה' },
                  ].map((fit) => (
                    <button
                      key={fit.id}
                      type="button"
                      onClick={() => handleUpdate({ iconStretch: fit.id as DecorativeDividerIconStretch })}
                      className={clsx(
                        'p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-0.5',
                        (localConfig.iconStretch || 'contain') === fit.id
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                          : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                      )}
                    >
                      <span className="text-xs">{fit.label}</span>
                      <span className="text-[10px] opacity-75">{fit.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Items Gap Slider */}
              <div className="space-y-1 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <span>מרווח בין אלמנטים (Gap):</span>
                  <span className="font-mono text-amber-400 font-bold">{localConfig.itemsGap ?? 24}px</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={96}
                  step={4}
                  value={localConfig.itemsGap ?? 24}
                  onChange={(e) => handleUpdate({ itemsGap: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Accordion 5: אפקטים מונפשים ל-6 הסגנונות (Synced Animations & Effects) */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
          <button
            type="button"
            onClick={() => toggleMainAccordion('effects_animations')}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
            title="אפקטי תנועה והילה מותאמים לכל אחד מ-6 הסגנונות"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>5. אפקטים מונפשים לכל הסגנונות (Synced Visual Effects)</span>
            </div>
            <ChevronDown
              className={clsx(
                'w-4 h-4 transition-transform duration-200',
                openMainAccordion === 'effects_animations' ? 'rotate-180 text-amber-400' : 'text-zinc-500'
              )}
            />
          </button>

          {openMainAccordion === 'effects_animations' && (
            <div className="p-3.5 border-t border-white/10 space-y-3.5 bg-black/30">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'none', label: 'ללא אפקט', desc: 'סטטי' },
                  { id: 'pulse-glow', label: 'הילת נשימה (נשי)', desc: 'זוהר עדין' },
                  { id: 'shimmer-beam', label: 'ברק פלדה (גברי)', desc: 'עוצמתי וממוקד' },
                  { id: 'float-bob', label: 'ציפה מאוזנת (סטנדרט)', desc: 'ריחוף אלגנטי' },
                  { id: 'wave-drift', label: 'זרימת גל (רוחני)', desc: 'תנועה הרמונית' },
                  { id: 'cyber-scan', label: 'סריקת ניאון (חד)', desc: 'ניגודיות שיא' },
                  { id: 'rotate-slow', label: 'סיבוב ליבה (אנליטי)', desc: 'רדאר מדעי' },
                ].map((eff) => (
                  <button
                    key={eff.id}
                    type="button"
                    onClick={() => handleUpdate({ effectType: eff.id as any })}
                    className={clsx(
                      'p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-0.5',
                      (localConfig.effectType || 'none') === eff.id
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                        : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                    )}
                  >
                    <span className="text-xs">{eff.label}</span>
                    <span className="text-[10px] opacity-75">{eff.desc}</span>
                  </button>
                ))}
              </div>

              {/* Speed Control */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
                <label className="text-xs font-semibold text-zinc-300">מהירות האפקט:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'slow', label: 'איטי ומרגיע' },
                    { id: 'normal', label: 'מאוזן' },
                    { id: 'fast', label: 'מהיר ותזזיתי' },
                  ].map((spd) => (
                    <button
                      key={spd.id}
                      type="button"
                      onClick={() => handleUpdate({ animationSpeed: spd.id as any })}
                      className={clsx(
                        'p-1.5 rounded-lg border text-xs text-center transition cursor-pointer',
                        (localConfig.animationSpeed || 'normal') === spd.id
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                          : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                      )}
                    >
                      {spd.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accordion 6: טקסט עיטורי נלווה ועוזר AI (Optional Decorative Text & AI) */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
          <button
            type="button"
            onClick={() => toggleMainAccordion('decorative_text')}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
            title="טקסט עיטורי קצר, מיקום כיתוב וחיבור סוכן AI"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>6. טקסט עיטורי נלווה וסוכן AI (Decorative Label & AI)</span>
            </div>
            <ChevronDown
              className={clsx(
                'w-4 h-4 transition-transform duration-200',
                openMainAccordion === 'decorative_text' ? 'rotate-180 text-amber-400' : 'text-zinc-500'
              )}
            />
          </button>

          {openMainAccordion === 'decorative_text' && (
            <div className="p-3.5 border-t border-white/10 space-y-3 bg-black/30">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={localConfig.decorativeText || ''}
                  onChange={(e) => handleUpdate({ decorativeText: e.target.value })}
                  placeholder="כיתוב עיטורי קצר (למשל: עוגן השקט, יציבות, KOSUN)..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleEnhanceTextWithAi}
                  disabled={aiLoading}
                  className="p-2 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 cursor-pointer shrink-0"
                  title="שפר או הצע מילת עיטור באמצעות סוכן AI"
                >
                  {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                </button>
              </div>

              {localConfig.decorativeText && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-zinc-300">מיקום הכיתוב העיטורי:</label>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { id: 'before', label: 'לפני האייקון' },
                          { id: 'center-overlay', label: 'על האייקון' },
                          { id: 'after', label: 'אחרי האייקון' },
                        ].map((pos) => (
                          <button
                            key={pos.id}
                            type="button"
                            onClick={() => handleUpdate({ textPosition: pos.id as any })}
                            className={clsx(
                              'p-1.5 rounded-lg border text-xs text-center transition cursor-pointer',
                              (localConfig.textPosition || 'center-overlay') === pos.id
                                ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                                : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                            )}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <PageBuilderColorPicker
                      label="צבע הכיתוב"
                      value={localConfig.textColor || '#ffffff'}
                      onChange={(c) => handleUpdate({ textColor: c })}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
