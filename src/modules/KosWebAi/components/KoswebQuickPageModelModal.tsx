import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Loader2,
  CreditCard,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CloudUpload,
  Palette,
  Info,
  Trash2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { BrandDna, MediaPickerContract } from '../../../core/contracts';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { CapabilitySlot } from '../../../core/bridge/CapabilitySlot';
import { getKoscloudBrandingIconsForStyle } from '../../../core/ui/BrandIconPicker';
import { PageBuilderConfig } from '../types/pageBuilder.types';
import {
  generatePageWithKoswebModel,
  KoswebModelFormRequirement,
} from '../services/koswebPageModelService';
import { resolveLiveBrandDna } from '../services/brandSectionHydrator';
import { DynamicIcon } from '../ui/PageBuilderIconPicker';

interface KoswebQuickPageModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandDna?: BrandDna | null;
  tenantId?: string;
  onPageGenerated: (pageConfig: PageBuilderConfig) => void;
}

const TOTAL_STEPS = 6;

const STEP_META: Array<{ title: string; description: string; explanation: string }> = [
  {
    title: 'מהי הכותרת הראשית של העמוד?',
    description: 'הכותרת שתופיע בראש אזור ה-Hero ותגדיר את נושא העמוד.',
    explanation: 'כותרת קצרה וממוקדת עוזרת ל-KOSAI לבנות מסר פתיחה חד ומדויק עבור המבקרים שלך.',
  },
  {
    title: 'מהו התיאור והמסר המרכזי?',
    description: 'תיאור קצר של השירות, המוצר או התוכן שיוצג בעמוד.',
    explanation: 'התיאור משמש לבניית הטקסטים באזור ה-Hero וברשימת האיקונים של פרטי העמוד.',
  },
  {
    title: 'מהי המטרה העיקרית של העמוד?',
    description: 'בחר או כתוב מה הפעולה שתרצה שהגולש יבצע בעמוד.',
    explanation: 'המטרה מכוונת את הניסוח השיווקי, כפתורי ההנעה לפעולה (CTA) ומבנה ההמרה.',
  },
  {
    title: 'האם לכלול טופס הרשמה או תשלום?',
    description: 'כל שדות הטופס מסונכרנים אוטומטית עם מזהי רכיב ה-CRM.',
    explanation: 'בטופס הרשמה או תשלום, הפרמטרים המזהים (`kosun_crm_*`) מוגדרים מראש ונשלחים ישירות ל-CRM.',
  },
  {
    title: 'העלאת מסמך או תמונה דרך KOSCLOUD',
    description: 'בחר או העלה קובץ מתוך כספת הענן של KOSCLOUD.',
    explanation: 'תוכל להעלות מסמך או תמונה דרך המודל של KOSCLOUD; אם תבחר ליצור תמונת Hero חדשה, היא תישמר ב-KOSCLOUD באופן אוטומטי.',
  },
  {
    title: 'בחירת איקונים מסגנון המיתוג ב-KOSCLOUD',
    description: 'בחר את האיקונים שילוו את רשימת פרטי העמוד מתוך גלריית המיתוג.',
    explanation: 'לחץ על איקונים מתוך KOSCLOUD להוספה או הסרה (עד 6 איקונים). אם לא תבחר, המערכת תבחר אוטומטית לפי סגנון המיתוג.',
  },
];

const GOAL_PRESETS = [
  {
    label: 'מידע ותדמית',
    goal: 'הצגת מידע מקצועי, יתרונות השירות ובניית אמון',
    form: 'auto' as KoswebModelFormRequirement,
  },
  {
    label: 'הרשמה ולידים (CRM)',
    goal: 'הרשמה מהירה והשארת פרטים מסונכרנת ל-CRM',
    form: 'registration' as KoswebModelFormRequirement,
  },
  {
    label: 'מכירה וטופס תשלום',
    goal: 'רכישה מקוונת עם טופס תשלום וסליקה מסונכרן CRM',
    form: 'payment' as KoswebModelFormRequirement,
  },
];

export const KoswebQuickPageModelModal: React.FC<KoswebQuickPageModelModalProps> = ({
  isOpen,
  onClose,
  brandDna,
  tenantId,
  onPageGenerated,
}) => {
  const { getCapability } = useHostCapabilities();
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [formRequirement, setFormRequirement] = useState<KoswebModelFormRequirement>('auto');
  const [paymentAmount, setPaymentAmount] = useState<string>('199');

  // Step 5: KOSCLOUD file / image state
  const [cloudAssetUrl, setCloudAssetUrl] = useState('');
  const [cloudAssetLabel, setCloudAssetLabel] = useState('');
  const [generateHeroImageWithAi, setGenerateHeroImageWithAi] = useState(true);
  const [isCloudPickerFallbackOpen, setIsCloudPickerFallbackOpen] = useState(false);

  // Step 6: KOSCLOUD icons selection
  const [selectedIcons, setSelectedIcons] = useState<string[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const liveDna = resolveLiveBrandDna(brandDna, tenantId);
  const activeStylePreset = liveDna?.designTokens?.defaultStylePreset || 'standard';
  const fallbackIcons = getKoscloudBrandingIconsForStyle(activeStylePreset);

  const currentMeta = STEP_META[step - 1];
  const isImageUrl = (url: string) =>
    /^data:image\//i.test(url) || /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(url);

  const handleOpenKoscloudPicker = async () => {
    setErrorMessage(null);
    if (mediaPicker?.openPicker) {
      try {
        const picked = await mediaPicker.openPicker({
          multiple: false,
          initialTab: 'gallery',
        });
        const selectedUrl = Array.isArray(picked) ? picked[0] : picked;
        if (selectedUrl) {
          setCloudAssetUrl(selectedUrl);
          const inferredName = selectedUrl.split('/').pop()?.split('?')[0] || 'קובץ מ-KOSCLOUD';
          setCloudAssetLabel(decodeURIComponent(inferredName));
        }
        return;
      } catch (err) {
        console.warn('[KoswebQuickPageModelModal] mediaPicker error:', err);
      }
    }
    setIsCloudPickerFallbackOpen(true);
  };

  const toggleIconSelection = (iconName: string) => {
    setSelectedIcons((prev) => {
      if (prev.includes(iconName)) {
        return prev.filter((item) => item !== iconName);
      }
      if (prev.length >= 6) {
        return [...prev.slice(1), iconName];
      }
      return [...prev, iconName];
    });
  };

  const handleNext = () => {
    setErrorMessage(null);
    if (step === 1 && !title.trim()) {
      setErrorMessage('נא להזין כותרת לעמוד כדי להמשיך');
      return;
    }
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    setErrorMessage(null);
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  const handleGenerate = async () => {
    if (!title.trim()) {
      setStep(1);
      setErrorMessage('נא להזין כותרת לעמוד');
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);

    try {
      const parsedAmount = Number(paymentAmount);
      const selectedIsImage = cloudAssetUrl ? isImageUrl(cloudAssetUrl) : false;

      const result = await generatePageWithKoswebModel(
        {
          title: title.trim(),
          description: description.trim(),
          goal: goal.trim() || 'הנעה לפעולה והצגת ערך מרכזי',
          extractedDocumentText:
            cloudAssetUrl && !selectedIsImage
              ? `קובץ מסמך מקושר מ-KOSCLOUD: ${cloudAssetLabel} (${cloudAssetUrl})`
              : undefined,
          formRequirement,
          paymentAmount: formRequirement === 'payment' && parsedAmount > 0 ? parsedAmount : undefined,
          uploadedHeroImageUrl: selectedIsImage ? cloudAssetUrl : undefined,
          generateHeroImageWithAi: !selectedIsImage && generateHeroImageWithAi,
          selectedBrandIcons: selectedIcons.length > 0 ? selectedIcons : undefined,
          saveGeneratedImageToKoscloud: mediaPicker?.saveGeneratedImage,
        },
        liveDna,
        tenantId
      );

      onPageGenerated(result.pageConfig);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'אירעה שגיאה ביצירת העמוד');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-3 sm:p-6 overflow-y-auto"
      dir="rtl"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Minimal Top Strip (No Modal Title Header) */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <span>
                שלב {step} מתוך {TOTAL_STEPS}
              </span>
              <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-l from-indigo-600 to-purple-600 transition-all duration-300"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="סגור"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Single-Question Step Body */}
        <div className="px-6 py-4 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Step Title, Description, Explanation */}
          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {currentMeta.title}
            </h3>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {currentMeta.description}
            </p>
            <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/60 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
              <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>{currentMeta.explanation}</span>
            </div>
          </div>

          {/* Step 1: Title */}
          {step === 1 && (
            <div>
              <input
                type="text"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleNext();
                  }
                }}
                placeholder="לדוגמה: סדנת AI מעשית למנהלים / חבילת ליווי עסקי VIP"
                className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-4 py-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Step 2: Description */}
          {step === 2 && (
            <div>
              <textarea
                rows={4}
                autoFocus
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="תאר בקצרה את השירות, המוצר או המסר שיופיע בהירו וברשימת האיקונים..."
                className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          )}

          {/* Step 3: Goal */}
          {step === 3 && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {GOAL_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setGoal(preset.goal);
                      setFormRequirement(preset.form);
                    }}
                    className={clsx(
                      'px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer',
                      goal === preset.goal
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="לדוגמה: הרשמה לוובינר / איסוף לידים / רכישת חבילה ב-₪290..."
                className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Step 4: CRM Form Requirement */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'auto', label: 'זיהוי אוטומטי', desc: 'לפי המטרה והתוכן' },
                  { id: 'registration', label: 'טופס הרשמה', desc: 'מסונכרן שדות CRM' },
                  { id: 'payment', label: 'טופס תשלום', desc: 'סליקה + סנכרון CRM' },
                  { id: 'none', label: 'ללא טופס', desc: 'תוכן ואיקונים בלבד' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormRequirement(opt.id as KoswebModelFormRequirement)}
                    className={clsx(
                      'p-3.5 rounded-2xl text-right border transition-all cursor-pointer',
                      formRequirement === opt.id
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                    )}
                  >
                    <div className="text-xs font-black">{opt.label}</div>
                    <div
                      className={clsx(
                        'text-[11px] mt-0.5',
                        formRequirement === opt.id
                          ? 'text-emerald-100'
                          : 'text-slate-500 dark:text-slate-400'
                      )}
                    >
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>

              {formRequirement === 'payment' && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-indigo-500 shrink-0" />
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    סכום לתשלום (₪):
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-32 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm font-mono text-slate-900 dark:text-white"
                    dir="ltr"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 5: File / Image Upload via KOSCLOUD */}
          {step === 5 && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleOpenKoscloudPicker}
                className="w-full py-5 px-4 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <CloudUpload className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  פתח את KOSCLOUD להעלאה או בחירת קובץ / תמונה
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  מסמכים, תמונות או יצירת מדיה בענן KOSCLOUD
                </span>
              </button>

              {cloudAssetUrl && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {isImageUrl(cloudAssetUrl) && (
                      <img
                        src={cloudAssetUrl}
                        alt={cloudAssetLabel}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>נבחר מתוך KOSCLOUD</span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 truncate">
                        {cloudAssetLabel || cloudAssetUrl}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCloudAssetUrl('');
                      setCloudAssetLabel('');
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer"
                    title="הסר קובץ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {(!cloudAssetUrl || !isImageUrl(cloudAssetUrl)) && (
                <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <input
                    type="checkbox"
                    checked={generateHeroImageWithAi}
                    onChange={(e) => setGenerateHeroImageWithAi(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span>צור תמונת Hero דרך KOSAI ושמור אותה אוטומטית ב-KOSCLOUD</span>
                </label>
              )}
            </div>
          )}

          {/* Step 6: Icons Selection from KOSCLOUD */}
          {step === 6 && (
            <div className="space-y-3">
              {selectedIcons.length > 0 && (
                <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-800/60 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-purple-800 dark:text-purple-200 flex items-center gap-1.5">
                    <Palette className="w-4 h-4" />
                    נבחרו {selectedIcons.length} איקונים:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedIcons.map((icName) => (
                      <button
                        key={icName}
                        type="button"
                        onClick={() => toggleIconSelection(icName)}
                        title="לחץ להסרה"
                        className="px-2 py-1 rounded-xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-300 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                      >
                        <DynamicIcon name={icName} className="w-3.5 h-3.5" />
                        <X className="w-3 h-3 opacity-60" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[340px] overflow-y-auto p-2 bg-slate-50/60 dark:bg-slate-950/50">
                <CapabilitySlot
                  name="luxury-icons-gallery"
                  props={{
                    selectedIconName: selectedIcons[selectedIcons.length - 1],
                    onSelectIconSvg: (_svgDataUrl: string, iconName: string) => {
                      if (iconName) toggleIconSelection(iconName);
                    },
                    onSelectIcon: (_svgDataUrl: string, iconName: string) => {
                      if (iconName) toggleIconSelection(iconName);
                    },
                  }}
                  fallback={
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-2">
                      {fallbackIcons.map((ic) => {
                        const isSelected = selectedIcons.includes(ic.name);
                        return (
                          <button
                            key={ic.name}
                            type="button"
                            onClick={() => toggleIconSelection(ic.name)}
                            title={ic.labelHe}
                            className={clsx(
                              'p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer',
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                            )}
                          >
                            <DynamicIcon name={ic.name} className="w-4 h-4" />
                            <span className="text-[10px] truncate w-full text-center">
                              {ic.labelHe}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  }
                />
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Step Navigation Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={step === 1 ? onClose : handlePrev}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {step === 1 ? (
              <span>ביטול</span>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                <span>הקודם</span>
              </>
            )}
          </button>

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>הבא</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>בונה ושומר...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>צור עמוד עכשיו</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Fallback CapabilitySlot for KOSCLOUD MediaPickerModal if host bridge wasn't mounted */}
      {isCloudPickerFallbackOpen && (
        <CapabilitySlot
          name="media-picker"
          props={{
            isOpen: isCloudPickerFallbackOpen,
            onClose: () => setIsCloudPickerFallbackOpen(false),
            initialTab: 'gallery',
            title: 'KOSCLOUD — בחירה והעלאת קובץ',
            onSelectMedia: (items: Array<{ name?: string; url?: string }>) => {
              const first = items?.[0];
              if (first?.url) {
                setCloudAssetUrl(first.url);
                setCloudAssetLabel(first.name || 'קובץ מ-KOSCLOUD');
              }
              setIsCloudPickerFallbackOpen(false);
            },
          }}
        />
      )}
    </div>
  );
};

export default KoswebQuickPageModelModal;
