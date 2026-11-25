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
  Info,
  Trash2,
  FileText,
  Palette,
  Layout,
  Plus,
} from 'lucide-react';
import { clsx } from 'clsx';
import { BrandDna, MediaPickerContract } from '../../../core/contracts';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { CapabilitySlot } from '../../../core/bridge/CapabilitySlot';
import { PageBuilderConfig } from '../types/pageBuilder.types';
import {
  generatePageWithKoswebModel,
  KoswebModelFormRequirement,
  KoswebStyleColorMode,
  KoswebPaletteSelection,
} from '../services/koswebPageModelService';
import { STYLE_GLOBAL_THEMES, PRESET_TITLE_MAP } from '../services/pageStylePresetService';
import { pageBuilderFirestore } from '../services/pageBuilderFirestore';
import { resolveLiveBrandDna } from '../services/brandSectionHydrator';
import { scanFlyerFileForPageModel, scanFlyerUrlForPageModel } from '../services/flyerScannerService';
import { FlyerScanPaletteOption, FlyerScanReport } from '../kosai/promptToKosai';

interface KoswebQuickPageModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandDna?: BrandDna | null;
  tenantId?: string;
  onPageGenerated: (pageConfig: PageBuilderConfig) => void;
}

const TOTAL_STEPS = 6;

const PAGE_STYLE_PALETTES: KoswebPaletteSelection[] = [
  {
    id: 'nature_green',
    label: 'ירוק טבע וזית',
    stylePreset: 'analytical',
    primaryColor: '#16a34a',
    secondaryColor: '#059669',
  },
  {
    id: 'honey_gold',
    label: 'זהב ודבש חם',
    stylePreset: 'standard',
    primaryColor: '#d97706',
    secondaryColor: '#f59e0b',
  },
  ...(Object.keys(STYLE_GLOBAL_THEMES) as Array<keyof typeof STYLE_GLOBAL_THEMES>).map((key) => ({
    id: key,
    label: PRESET_TITLE_MAP[key]?.split(' (')[0] || key,
    stylePreset: key,
    primaryColor: STYLE_GLOBAL_THEMES[key].primaryColor || '#6366f1',
    secondaryColor: STYLE_GLOBAL_THEMES[key].secondaryColor || '#0ea5e9',
  })),
];

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
    title: 'בחר את סגנון וצבעי העמוד',
    description: 'התאם את פלטת הצבעים של העמוד לפי המיתוג, הצעת AI או בחירה ידנית.',
    explanation: 'כברירת מחדל העמוד שומר על צבעי המיתוג שלך. תוכל לבחור התאמה אוטומטית ע"י ה-AI לפי הנושא או לבחור פלטת צבעים אחרת.',
  },
  {
    title: 'העלאת מסמך או תמונה דרך KOSCLOUD',
    description: 'בחר או העלה קובץ מתוך כספת הענן של KOSCLOUD.',
    explanation: 'תוכל להעלות מסמך או תמונה דרך המודל של KOSCLOUD; איקוני העמוד יותאמו ויתלבשו אוטומטית מתוך סגנון המיתוג ב-KOSCLOUD.',
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
  const { db } = useSystemConnection();
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');

  const [flowMode, setFlowMode] = useState<'flyer_ask' | 'flyer_review' | 'manual_wizard'>('flyer_ask');
  const [flyerFileName, setFlyerFileName] = useState('');
  const [flyerPreviewUrl, setFlyerPreviewUrl] = useState<string | undefined>(undefined);
  const [isScanningFlyer, setIsScanningFlyer] = useState(false);
  const [flyerReport, setFlyerReport] = useState<FlyerScanReport | null>(null);
  const [selectedFlyerPalette, setSelectedFlyerPalette] = useState<FlyerScanPaletteOption | null>(null);
  const [selectedHeroLayout, setSelectedHeroLayout] = useState<'split' | 'centered' | 'minimal'>('split');
  const [selectedContentLayout, setSelectedContentLayout] = useState<'highlight-box' | 'cards-grid' | 'split-image'>('cards-grid');
  const [useFlyerImageAsHero, setUseFlyerImageAsHero] = useState(false);

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [formRequirement, setFormRequirement] = useState<KoswebModelFormRequirement>('auto');
  const [paymentAmount, setPaymentAmount] = useState<string>('199');
  const [styleColorMode, setStyleColorMode] = useState<KoswebStyleColorMode>('brand');
  const [selectedPalette, setSelectedPalette] = useState<KoswebPaletteSelection>(PAGE_STYLE_PALETTES[0]);

  // Step 5: KOSCLOUD file / image state
  const [cloudAssetUrl, setCloudAssetUrl] = useState('');
  const [cloudAssetLabel, setCloudAssetLabel] = useState('');
  const [generateHeroImageWithAi, setGenerateHeroImageWithAi] = useState(true);
  const [isCloudPickerFallbackOpen, setIsCloudPickerFallbackOpen] = useState(false);
  const [cloudPickerPurpose, setCloudPickerPurpose] = useState<'flyer' | 'asset'>('asset');

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const liveDna = resolveLiveBrandDna(brandDna, tenantId);

  const currentMeta = STEP_META[step - 1];
  const isImageUrl = (url: string) =>
    /^data:image\//i.test(url) || /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(url);

  const handleScanFlyerUrl = async (url: string, label?: string) => {
    setErrorMessage(null);
    const derivedName = label || decodeURIComponent(url.split('?')[0].split('/').pop() || 'flyer');
    setFlyerFileName(derivedName);
    setIsScanningFlyer(true);
    try {
      const { report, previewImageDataUrl } = await scanFlyerUrlForPageModel({
        url,
        fileName: derivedName,
        companyName: liveDna?.identity?.companyName || 'העסק שלי',
        tenantId,
      });
      setFlyerReport(report);
      setFlyerPreviewUrl(previewImageDataUrl);
      setSelectedFlyerPalette(report.designPlan.extractedPalette);
      setSelectedHeroLayout(report.designPlan.heroLayout);
      setSelectedContentLayout(report.designPlan.contentLayout);
      setUseFlyerImageAsHero(Boolean(previewImageDataUrl && report.designPlan.heroLayout === 'split'));
      setFlowMode('flyer_review');
    } catch (err: any) {
      setErrorMessage(err?.message || 'לא הצלחנו לסרוק את הקובץ מ-KOSCLOUD, נסה קובץ אחר או המשך לשאלון המהיר');
    } finally {
      setIsScanningFlyer(false);
    }
  };

  const handleOpenKoscloudFlyerPicker = async () => {
    setErrorMessage(null);
    setCloudPickerPurpose('flyer');
    if (mediaPicker?.openPicker) {
      try {
        const picked = await mediaPicker.openPicker({
          multiple: false,
          initialTab: 'gallery',
        });
        const selectedUrl = Array.isArray(picked) ? picked[0] : picked;
        if (selectedUrl) {
          await handleScanFlyerUrl(selectedUrl);
        }
        return;
      } catch (err: any) {
        setErrorMessage(err?.message || 'לא הצלחנו לפתוח את KOSCLOUD');
        return;
      }
    }
    setIsCloudPickerFallbackOpen(true);
  };

  const handleOpenKoscloudPicker = async () => {
    setErrorMessage(null);
    setCloudPickerPurpose('asset');
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
          styleColorMode,
          selectedPalette: styleColorMode === 'palette' ? selectedPalette : undefined,
          uploadedHeroImageUrl: selectedIsImage ? cloudAssetUrl : undefined,
          generateHeroImageWithAi: !selectedIsImage && generateHeroImageWithAi,
          saveGeneratedImageToKoscloud: mediaPicker?.saveGeneratedImage,
        },
        liveDna,
        tenantId,
        db
      );

      await pageBuilderFirestore.savePage(result.pageConfig, db, tenantId);
      onPageGenerated(result.pageConfig);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'אירעה שגיאה ביצירת העמוד');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFlyerFileSelected = async (file?: File | null) => {
    if (!file) return;
    setErrorMessage(null);
    setFlyerFileName(file.name);
    setIsScanningFlyer(true);
    try {
      const { report, previewImageDataUrl } = await scanFlyerFileForPageModel({
        file,
        companyName: liveDna?.identity?.companyName || 'העסק שלי',
        tenantId,
      });
      setFlyerReport(report);
      setFlyerPreviewUrl(previewImageDataUrl);
      setSelectedFlyerPalette(report.designPlan.extractedPalette);
      setSelectedHeroLayout(report.designPlan.heroLayout);
      setSelectedContentLayout(report.designPlan.contentLayout);
      setUseFlyerImageAsHero(Boolean(previewImageDataUrl && report.designPlan.heroLayout === 'split'));
      setFlowMode('flyer_review');
    } catch (err: any) {
      setErrorMessage(err?.message || 'לא הצלחנו לסרוק את הפלייר, נסה קובץ אחר או המשך לשאלון המהיר');
    } finally {
      setIsScanningFlyer(false);
    }
  };

  const handleGenerateFromFlyer = async () => {
    if (!flyerReport || !flyerReport.title.trim()) {
      setErrorMessage('נא לוודא שיש כותרת לעמוד');
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);

    try {
      const activePalette = selectedFlyerPalette || flyerReport.designPlan.extractedPalette;
      const detailsSummary = [
        flyerReport.eventDetails.date ? `תאריך: ${flyerReport.eventDetails.date}` : '',
        flyerReport.eventDetails.time ? `שעה: ${flyerReport.eventDetails.time}` : '',
        flyerReport.eventDetails.location ? `מיקום: ${flyerReport.eventDetails.location}` : '',
        flyerReport.eventDetails.price ? `עלות: ${flyerReport.eventDetails.price}` : '',
        flyerReport.eventDetails.audience ? `קהל יעד: ${flyerReport.eventDetails.audience}` : '',
        flyerReport.highlights.length > 0
          ? `נקודות מרכזיות: ${flyerReport.highlights.map((h) => `${h.title} (${h.description})`).join(' | ')}`
          : '',
      ]
        .filter(Boolean)
        .join('\n');

      const result = await generatePageWithKoswebModel(
        {
          title: flyerReport.title.trim(),
          description: [flyerReport.subtitle, flyerReport.description].filter(Boolean).join('\n'),
          goal: flyerReport.designPlan.goalLabelHe || 'הרשמה והנעה לפעולה',
          extractedDocumentText: detailsSummary,
          formRequirement: flyerReport.recommendedFormMode,
          paymentAmount:
            flyerReport.recommendedFormMode === 'payment' && (flyerReport.recommendedPaymentAmount || 0) > 0
              ? flyerReport.recommendedPaymentAmount
              : undefined,
          styleColorMode: 'palette',
          selectedPalette: {
            id: activePalette.id,
            label: activePalette.nameHe,
            stylePreset: activePalette.stylePreset,
            primaryColor: activePalette.primaryColor,
            secondaryColor: activePalette.secondaryColor,
          },
          flyerScanReport: flyerReport,
          heroLayoutOverride: selectedHeroLayout,
          contentLayoutOverride: selectedContentLayout,
          customPaletteOverride: {
            backgroundColor: activePalette.backgroundColor,
            textColor: activePalette.textColor,
            borderRadius: activePalette.borderRadius,
            buttonStyle: activePalette.buttonStyle,
          },
          uploadedHeroImageUrl: useFlyerImageAsHero && flyerPreviewUrl ? flyerPreviewUrl : undefined,
          generateHeroImageWithAi: !(useFlyerImageAsHero && flyerPreviewUrl),
          saveGeneratedImageToKoscloud: mediaPicker?.saveGeneratedImage,
        },
        liveDna,
        tenantId,
        db
      );

      await pageBuilderFirestore.savePage(result.pageConfig, db, tenantId);
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
            {flowMode === 'manual_wizard' ? (
              <>
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
              </>
            ) : (
              <div className="flex items-center gap-2 text-xs font-black text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-4 h-4" />
                <span>
                  {flowMode === 'flyer_ask'
                    ? 'שלב 1 — סריקת פלייר חכמה (אופציונלי)'
                    : 'שלב 2 — דוח סריקה ועיצוב לעריכה ואישור'}
                </span>
              </div>
            )}
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

        {/* Mode 1: Flyer Ask (First Question) */}
        {flowMode === 'flyer_ask' && (
          <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                האם יש לך פלייר עבור עמוד הנחיתה?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                העלה תמונה, קובץ PDF או מסמך Markdown (`.md`) — ג׳ימיני יסרוק את הפלייר, יחלץ את כל הפרטים, יתאים פלטת צבעים ויציע פריסה מותאמת לעריכה ואישור לפני יצירת העמוד.
              </p>
            </div>

            <button
              type="button"
              disabled={isScanningFlyer}
              onClick={handleOpenKoscloudFlyerPicker}
              className="w-full rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 transition-all p-6 text-center cursor-pointer disabled:opacity-60"
            >
              {isScanningFlyer ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <Loader2 className="w-9 h-9 animate-spin text-indigo-600" />
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    סורק את הפלייר &quot;{flyerFileName}&quot; ב־Gemini...
                  </div>
                  <div className="text-xs text-slate-500">
                    מחלץ טקסטים, תאריכים, פלטת צבעים והמלצת פריסה מותאמת אישית
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2.5 py-2">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <CloudUpload className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    פתח את KOSCLOUD להעלאה או בחירת פלייר (תמונה, PDF או MD)
                  </div>
                  <div className="text-xs text-slate-500">
                    מתוך KOSCLOUD ניתן להעלות קובץ חדש או לבחור קובץ קיים מהכספת שלך
                  </div>
                </div>
              )}
            </button>

            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isScanningFlyer}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ביטול
              </button>
              <button
                type="button"
                disabled={isScanningFlyer}
                onClick={() => {
                  setErrorMessage(null);
                  setFlowMode('manual_wizard');
                  setStep(1);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>אין לי פלייר — מעבר לשאלון המהיר</span>
              </button>
            </div>
          </div>
        )}

        {/* Mode 2: Editable Flyer Scan & Design Report */}
        {flowMode === 'flyer_review' && flyerReport && (
          <>
            <div className="px-6 py-4 space-y-5 max-h-[72vh] overflow-y-auto">
              {/* AI Design Insight Banner */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-indigo-700 dark:text-indigo-300">
                    מטרה שזוהתה: {flyerReport.designPlan.goalLabelHe}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 text-indigo-600 border border-indigo-200 dark:border-indigo-700">
                    {flyerFileName}
                  </span>
                </div>
                {flyerReport.designPlan.designRationaleHe && (
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {flyerReport.designPlan.designRationaleHe}
                  </p>
                )}
              </div>

              {/* Editable Core Text */}
              <div className="space-y-3">
                <label className="block space-y-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">כותרת ראשית</span>
                  <input
                    type="text"
                    value={flyerReport.title}
                    onChange={(e) => setFlyerReport({ ...flyerReport, title: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">תת-כותרת</span>
                  <input
                    type="text"
                    value={flyerReport.subtitle}
                    onChange={(e) => setFlyerReport({ ...flyerReport, subtitle: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">תיאור ותוכן מרכזי</span>
                  <textarea
                    rows={3}
                    value={flyerReport.description}
                    onChange={(e) => setFlyerReport({ ...flyerReport, description: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-sm text-slate-900 dark:text-white resize-none"
                  />
                </label>

                {/* Event Details Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="תאריך"
                    value={flyerReport.eventDetails.date || ''}
                    onChange={(e) =>
                      setFlyerReport({
                        ...flyerReport,
                        eventDetails: { ...flyerReport.eventDetails, date: e.target.value },
                      })
                    }
                    className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="שעה"
                    value={flyerReport.eventDetails.time || ''}
                    onChange={(e) =>
                      setFlyerReport({
                        ...flyerReport,
                        eventDetails: { ...flyerReport.eventDetails, time: e.target.value },
                      })
                    }
                    className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="מיקום"
                    value={flyerReport.eventDetails.location || ''}
                    onChange={(e) =>
                      setFlyerReport({
                        ...flyerReport,
                        eventDetails: { ...flyerReport.eventDetails, location: e.target.value },
                      })
                    }
                    className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="מחיר / עלות"
                    value={flyerReport.eventDetails.price || ''}
                    onChange={(e) =>
                      setFlyerReport({
                        ...flyerReport,
                        eventDetails: { ...flyerReport.eventDetails, price: e.target.value },
                      })
                    }
                    className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Editable Highlights */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">נקודות מפתח שיוצגו בעמוד</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFlyerReport({
                        ...flyerReport,
                        highlights: [...flyerReport.highlights, { title: '', description: '', iconName: 'Sparkles' }],
                      })
                    }
                    className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>הוסף נקודה</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {flyerReport.highlights.map((h, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <input
                        type="text"
                        placeholder="כותרת"
                        value={h.title}
                        onChange={(e) => {
                          const next = [...flyerReport.highlights];
                          next[idx] = { ...next[idx], title: e.target.value };
                          setFlyerReport({ ...flyerReport, highlights: next });
                        }}
                        className="w-1/3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-bold"
                      />
                      <input
                        type="text"
                        placeholder="פירוט קצר"
                        value={h.description}
                        onChange={(e) => {
                          const next = [...flyerReport.highlights];
                          next[idx] = { ...next[idx], description: e.target.value };
                          setFlyerReport({ ...flyerReport, highlights: next });
                        }}
                        className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFlyerReport({
                            ...flyerReport,
                            highlights: flyerReport.highlights.filter((_, i) => i !== idx),
                          })
                        }
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                        aria-label="הסר נקודה"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Palette Selection */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Palette className="w-4 h-4 text-indigo-500" />
                  <span>בחירת פלטת צבעים (חולצה מהפלייר + חלופות):</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[flyerReport.designPlan.extractedPalette, ...flyerReport.designPlan.alternativePalettes].map((pal) => {
                    const active = (selectedFlyerPalette?.id || flyerReport.designPlan.extractedPalette.id) === pal.id;
                    return (
                      <button
                        key={pal.id}
                        type="button"
                        onClick={() => setSelectedFlyerPalette(pal)}
                        className={clsx(
                          'p-2.5 rounded-xl border text-right transition-all flex items-center justify-between gap-2 cursor-pointer',
                          active
                            ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        )}
                      >
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {pal.nameHe}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: pal.primaryColor }} />
                          <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: pal.secondaryColor }} />
                          <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: pal.backgroundColor }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Layout Selection */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Layout className="w-4 h-4 text-indigo-500" />
                  <span>פריסת כותרת ראשית (Hero) ותוכן:</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'split', label: 'מפוצל + תמונה' },
                      { id: 'centered', label: 'מרכוז דרמטי' },
                      { id: 'minimal', label: 'מינימליסטי נקי' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedHeroLayout(opt.id)}
                      className={clsx(
                        'py-2 px-2 rounded-xl border text-xs font-bold cursor-pointer',
                        selectedHeroLayout === opt.id
                          ? 'border-indigo-500 bg-indigo-600 text-white'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {flyerPreviewUrl && (
                  <label className="flex items-center gap-2 pt-1 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useFlyerImageAsHero}
                      onChange={(e) => setUseFlyerImageAsHero(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                    <span>השתמש בתמונת הפלייר עצמה ב-Hero (במקום ליצור תמונת אווירה חדשה ב-AI)</span>
                  </label>
                )}
              </div>

              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => {
                  setErrorMessage(null);
                  setFlowMode('flyer_ask');
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>העלאת פלייר אחר</span>
              </button>
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerateFromFlyer}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>בונה ושומר את העמוד...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>אשר וצור עמוד עכשיו</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {flowMode === 'manual_wizard' && (
        <>

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

          {/* Step 5: Page Style & Color Palette */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'brand' as KoswebStyleColorMode, label: 'לפי המיתוג (ברירת מחדל)', desc: 'שומר על צבעי העסק' },
                  { id: 'ai' as KoswebStyleColorMode, label: 'לפי הצעת ה-AI', desc: 'מתאים צבעים לנושא העמוד' },
                  { id: 'palette' as KoswebStyleColorMode, label: 'בחר פלטה', desc: 'בחירה מפלטות הסגנונות' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStyleColorMode(opt.id)}
                    className={clsx(
                      'p-3 rounded-2xl text-right border transition-all cursor-pointer',
                      styleColorMode === opt.id
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                    )}
                  >
                    <div className="text-xs font-black">{opt.label}</div>
                    <div
                      className={clsx(
                        'text-[11px] mt-0.5',
                        styleColorMode === opt.id
                          ? 'text-indigo-100'
                          : 'text-slate-500 dark:text-slate-400'
                      )}
                    >
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>

              {styleColorMode === 'palette' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {PAGE_STYLE_PALETTES.map((pal) => {
                    const isSelected = selectedPalette.id === pal.id;
                    return (
                      <button
                        key={pal.id}
                        type="button"
                        onClick={() => setSelectedPalette(pal)}
                        className={clsx(
                          'p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col gap-2',
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30 shadow'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-5 h-5 rounded-full border border-white/30 shadow-sm"
                            style={{ backgroundColor: pal.primaryColor }}
                          />
                          <span
                            className="w-5 h-5 rounded-full border border-white/30 shadow-sm -mr-1.5"
                            style={{ backgroundColor: pal.secondaryColor }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {pal.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 6: File / Image Upload via KOSCLOUD */}
          {step === 6 && (
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
        </>
        )}
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
              setIsCloudPickerFallbackOpen(false);
              if (first?.url) {
                if (cloudPickerPurpose === 'flyer') {
                  void handleScanFlyerUrl(first.url, first.name);
                } else {
                  setCloudAssetUrl(first.url);
                  setCloudAssetLabel(first.name || 'קובץ מ-KOSCLOUD');
                }
              }
            },
          }}
        />
      )}
    </div>
  );
};

export default KoswebQuickPageModelModal;
