import React, { useState } from 'react';
import { useBrandDna } from '../hooks/useBrandDna';
import { OrganizationType } from '../types/brandDna';
import { extractDominantColorsFromImage } from '../services/colorExtractor';
import { rephraseTextWithBrandAi } from '../services/geminiBrandPrompt';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract } from '../../../core/contracts';
import {
  Building2,
  Sparkles,
  Wand2,
  UploadCloud,
  Image as ImageIcon,
  Palette,
  Loader2,
  CheckCircle,
  FolderOpen,
  Plus,
  Trash2,
  HelpCircle,
  Link,
  Copy,
} from 'lucide-react';

import { SmartTooltip } from '../../../components/Ui/SmartTooltip';

const ORG_TYPES: OrganizationType[] = [
  'חברה',
  'עמותה',
  'שותפות',
  'עוסק מורשה',
  'עוסק פטור',
  'אחר',
];

const PURPOSE_PRESETS = [
  'כספית - מכירת מוצרים ומתן שירותים',
  'ציבורית - פעילות לרווחת הקהילה והחברה',
  'אידאולוגית / חברתית - חינוך, דת וערכים',
  'טכנולוגית - פיתוח מוצרים ומיזמים דיגיטליים',
];

// Tooltip Component using Cashwan 2026 SmartTooltip standard
const Tooltip: React.FC<{ text: string }> = ({ text }) => <SmartTooltip text={text} />;

export const BrandIdentitySection: React.FC = () => {
  const { brandDna, updateIdentity, updateDesignTokens, setLogoUrl } = useBrandDna();
  const { apiKeys } = useSystemConnection();
  const { getCapability } = useHostCapabilities();
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');

  const [isExtractingColors, setIsExtractingColors] = useState(false);
  const [extractedColorsList, setExtractedColorsList] = useState<string[]>([]);
  const [colorsExtractedSuccess, setColorsExtractedSuccess] = useState(false);
  const [logoCopied, setLogoCopied] = useState(false);

  // AI Shorten Vision State
  const [isShortening, setIsShortening] = useState(false);
  const [isImprovingVision, setIsImprovingVision] = useState(false);
  const [customAiPrompt, setCustomAiPrompt] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPreviewResult, setAiPreviewResult] = useState('');

  const handleProcessLogoUrl = async (url: string) => {
    updateIdentity({ logoUrl: url });
    if (setLogoUrl) {
      await setLogoUrl(url);
    }
    if (!url.trim()) {
      setExtractedColorsList([]);
      return;
    }
    setIsExtractingColors(true);
    try {
      const colors = await extractDominantColorsFromImage(url, 4);
      setExtractedColorsList(colors);
      setIsExtractingColors(false);
      setColorsExtractedSuccess(true);
      setTimeout(() => setColorsExtractedSuccess(false), 4000);
    } catch (err) {
      console.error('Error extracting colors from logo URL:', err);
      setIsExtractingColors(false);
    }
  };

  const handleLogoUrlInputChange = (url: string) => {
    updateIdentity({ logoUrl: url });
    if (setLogoUrl) {
      setLogoUrl(url);
    }
  };

  const handleCopyLogoUrl = () => {
    if (brandDna.identity.logoUrl) {
      navigator.clipboard.writeText(brandDna.identity.logoUrl);
      setLogoCopied(true);
      setTimeout(() => setLogoCopied(false), 2000);
    }
  };

  const handleOpenLogoFromGallery = async () => {
    if (mediaPicker) {
      const selected = await mediaPicker.openPicker({ accept: 'image/*' });
      if (selected) {
        const finalUrl = Array.isArray(selected) ? selected[0] : selected;
        if (finalUrl) {
          handleProcessLogoUrl(finalUrl);
        }
      }
    } else {
      alert('רכיב גלריית המדיה אינו זמין כעת.');
    }
  };

  const handleAddVibeImagesFromGallery = async () => {
    if (mediaPicker) {
      const selected = await mediaPicker.openPicker({
        accept: 'image/*',
        multiple: true,
      });
      if (selected) {
        const urls = Array.isArray(selected) ? selected : [selected];
        const existing = brandDna.identity.vibeImages || [];
        const newImages = [...existing, ...urls.filter((u) => !existing.includes(u))];
        updateIdentity({ vibeImages: newImages });
      }
    }
  };

  const handleRemoveVibeImage = (indexToRemove: number) => {
    const existing = brandDna.identity.vibeImages || [];
    updateIdentity({ vibeImages: existing.filter((_, idx) => idx !== indexToRemove) });
  };

  const handleExtractColorsFromVibeImage = async (url: string) => {
    setIsExtractingColors(true);
    const colors = await extractDominantColorsFromImage(url, 4);
    setExtractedColorsList(colors);
    setIsExtractingColors(false);
    setColorsExtractedSuccess(true);
    setTimeout(() => setColorsExtractedSuccess(false), 4000);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtractingColors(true);
    try {
                      const reader = new FileReader();
        reader.onload = async (event) => {
          const dataUrl = event.target?.result as string;
          if (dataUrl.length > 1024 * 1024 * 2) {
             alert('התמונה גדולה מידי, אנא העלה תמונה קטנה מ-1MB');
             setIsExtractingColors(false);
             return;
          }
          handleProcessLogoUrl(dataUrl);
        };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Logo upload error:', err);
      setIsExtractingColors(false);
    }
  };

  const handleApplyExtractedColors = () => {
    if (extractedColorsList.length >= 1) {
      updateDesignTokens({
        primaryColor: extractedColorsList[0],
        secondaryColor: extractedColorsList[1] || brandDna.designTokens.secondaryColor,
        buttonBgColor: extractedColorsList[0],
      });
      alert('פלטת הצבעים שחולצה הוחלה בהצלחה כ-Design Tokens עבור עמודים וטפסים!');
    }
  };

  const handleGenerateShortVision = async () => {
    if (!brandDna.identity.companyVision.trim()) {
      alert('אנא הזן תחילה את חזון המותג המלא');
      return;
    }
    const apiKey = apiKeys.googleAiApiKey || '';
    if (!apiKey) {
      alert('יש להגדיר מפתח Gemini API בהגדרות המערכת');
      return;
    }

    setIsShortening(true);
    const res = await rephraseTextWithBrandAi(
      brandDna.identity.companyVision,
      apiKey,
      brandDna,
      'תמצת את החזון הזה למשפט אחד קצר, יוקרתי וקולע של עד 15 מילים בלבד.'
    );
    setIsShortening(false);

    if (res.success && res.text) {
      updateIdentity({ shortVision: res.text });
    } else {
      alert(res.error || 'שגיאה ביצירת תמצית חזון');
    }
  };

  const handleOpenAiImprove = () => {
    setAiPreviewResult('');
    setCustomAiPrompt('');
    setShowAiModal(true);
  };

  const handleRunAiImprove = async () => {
    const apiKey = apiKeys.googleAiApiKey || '';
    if (!apiKey) {
      alert('יש להגדיר מפתח Gemini API');
      return;
    }
    setIsImprovingVision(true);
    const res = await rephraseTextWithBrandAi(
      brandDna.identity.companyVision,
      apiKey,
      brandDna,
      customAiPrompt || 'שפר את הניסוח, הפוך אותו ליוקרתי, סוחף ומעורר אמון והשראה.'
    );
    setIsImprovingVision(false);
    if (res.success && res.text) {
      setAiPreviewResult(res.text);
    } else {
      alert(res.error || 'שגיאה בעריכת הטקסט');
    }
  };

  const handleAcceptAiResult = () => {
    if (aiPreviewResult) {
      updateIdentity({ companyVision: aiPreviewResult });
      setShowAiModal(false);
      setAiPreviewResult('');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Identity Type */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-lg space-y-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">זהות עסקית והתאגדות</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">הגדר את סוג הישות המשפטית, שם המותג והסלוגן המוביל</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Organization Type */}
          <div>
            <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              סוג הישות המשפטית
              <Tooltip text="חשוב להגדרות המשפטיות בדפי התשלום (למשל, האם להפיק קבלות עוסק פטור או חשבוניות מס)." />
            </label>
            <div className="flex flex-col space-y-2">
              {ORG_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateIdentity({ organizationType: type })}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-medium border text-right transition-all flex items-center justify-between ${
                    brandDna.identity.organizationType === type
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-600/20 dark:border-indigo-500 dark:text-indigo-300 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-900/60 dark:border-slate-700/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700/40'
                  }`}
                >
                  <span>{type}</span>
                  {brandDna.identity.organizationType === type && (
                    <CheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Left Column: Company Name & Logo Area */}
          <div className="flex flex-col space-y-3.5">
            {/* Company Name */}
            <div>
              <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                שם {brandDna.identity.organizationType}
                <Tooltip text="השם הרשמי של העסק כפי שיופיע בכותרות ובמסמכים רשמיים שה-AI כותב עבורך." />
              </label>
              <input
                type="text"
                value={brandDna?.identity?.companyName ?? ''}
                onChange={(e) => updateIdentity({ companyName: e.target.value })}
                placeholder="לדוגמה: קומונה טכנולוגיות בע״מ"
                dir="auto"
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Embedded Logo & Color Extraction Area */}
            <div className="bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/70 rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                  <ImageIcon className="w-3.5 h-3.5 ml-1 text-indigo-500" />
                  לוגו המותג וסנכרון גלריה
                  <Tooltip text="בחר לוגו מהגלריה, העלה מהמחשב או הזן כתובת ישירה. הצבעים נחלצים אוטומטית ומסונכרנים לכל הרכיבים." />
                </label>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>

              {/* URL input & Quick Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={brandDna.identity.logoUrl || ''}
                    onChange={(e) => handleLogoUrlInputChange(e.target.value)}
                    onBlur={() => {
                      if (brandDna.identity.logoUrl) {
                        handleProcessLogoUrl(brandDna.identity.logoUrl);
                      }
                    }}
                    placeholder="כתובת לוגו או בחירה מגלריה..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-2.5 py-2 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono transition-all"
                    dir="ltr"
                  />
                  {brandDna.identity.logoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        updateIdentity({ logoUrl: '' });
                        if (setLogoUrl) setLogoUrl('');
                        setExtractedColorsList([]);
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 p-0.5 transition-colors"
                      title="נקה"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={handleOpenLogoFromGallery}
                    className="px-2.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                    title="בחר מגלריית המדיה המערכתית"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>גלריה</span>
                  </button>

                  <label className="cursor-pointer px-2.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>העלה</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>

                  {brandDna.identity.logoUrl && (
                    <>
                      <button
                        type="button"
                        onClick={handleCopyLogoUrl}
                        className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                        title="העתק קישור"
                      >
                        {logoCopied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (brandDna.identity.logoUrl) {
                            handleProcessLogoUrl(brandDna.identity.logoUrl);
                          }
                        }}
                        disabled={isExtractingColors}
                        className="p-2 bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 rounded-xl border border-pink-200 dark:border-pink-800/60 transition-colors"
                        title="חלץ צבעים מחדש"
                      >
                        <Palette className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Logo Preview and Extracted Colors Row */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                {/* Visual Preview Box */}
                <div className="w-full sm:w-28 h-20 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                  {brandDna.identity.logoUrl ? (
                    <img
                      src={brandDna.identity.logoUrl}
                      alt="לוגו"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-400 dark:text-slate-500 text-[10px] flex flex-col items-center gap-0.5">
                      <ImageIcon className="w-4 h-4 opacity-50" />
                      <span>אין לוגו</span>
                    </div>
                  )}
                </div>

                {/* Extracted Colors Palette */}
                <div className="flex-1 w-full bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Palette className="w-3 h-3 text-pink-500" />
                      צבעי מותג מחולצים
                    </span>
                    {isExtractingColors && <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />}
                  </div>

                  {extractedColorsList.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {extractedColorsList.map((hex, idx) => (
                          <div key={idx} className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                            <span
                              className="w-3.5 h-3.5 rounded-md border border-slate-300 dark:border-white/20 shadow-xs cursor-pointer"
                              style={{ backgroundColor: hex }}
                              title={`העתק ${hex}`}
                              onClick={() => navigator.clipboard.writeText(hex)}
                            />
                            <span className="text-[10px] font-mono text-slate-600 dark:text-slate-300" dir="ltr">
                              {hex}
                            </span>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyExtractedColors}
                        className="w-full py-1 px-2 bg-pink-50 hover:bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:hover:bg-pink-900/60 dark:text-pink-300 rounded-lg text-[11px] font-bold transition-all border border-pink-200 dark:border-pink-800/60 flex items-center justify-center gap-1"
                      >
                        <Palette className="w-3 h-3" />
                        החל כצבעי עיצוב (Tokens)
                      </button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 py-1 text-center">
                      חילוץ צבעים אוטומטי בעת בחירת הלוגו
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Member count */}
          <div>
            <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              היקף כוח אדם / חברים
              <Tooltip text="עוזר ל-AI להבין את גודל הארגון, כדי לשדר 'צוות מומחים' מול 'שירות בוטיק אישי'." />
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['אני לבד', 'עד 10', 'עד 50', '50+'].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => updateIdentity({ memberCount: count })}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all text-center ${
                    brandDna.identity.memberCount === count
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-600/20 dark:border-indigo-500 dark:text-indigo-300'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-900/60 dark:border-slate-700/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700/40'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Slogan */}
          <div>
            <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              סלוגן המותג (Tagline)
              <Tooltip text="המשפט הקצר שמופיע מתחת ללוגו, מייצג את ההבטחה שלך ללקוח." />
            </label>
            <input
              type="text"
              value={brandDna?.identity?.slogan ?? ''}
              onChange={(e) => updateIdentity({ slogan: e.target.value })}
              placeholder="לדוגמה: מובילים את המהפכה הדיגיטלית שלך"
              dir="auto"
              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Purpose */}
        <div>
          <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            מטרת וייעוד הארגון
            <Tooltip text="מה העסק שלך עושה ולמה הוא קיים? ה-AI ישתמש בזה כרקע לייצור טקסטים מכירתיים." />
          </label>
          <input
            type="text"
            value={brandDna?.identity?.organizationPurpose ?? ''}
            onChange={(e) => updateIdentity({ organizationPurpose: e.target.value })}
            placeholder="תאר את ייעוד הארגון או בחר תבנית..."
            dir="auto"
            className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:border-indigo-500 transition-colors mb-2"
          />
          <div className="flex flex-wrap gap-2">
            {PURPOSE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => updateIdentity({ organizationPurpose: preset })}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-slate-900/50 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-300 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 transition-colors"
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Vibe Images & Brand Media Gallery Section */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-lg space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="flex items-center text-base font-bold text-slate-800 dark:text-white">
                תמונות אווירה 
                <Tooltip text="תמונות אלו ישמשו את ה-AI כשהוא בונה עבורך דפי נחיתה או שולח הודעות עשירות בווייב של המותג." />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">מאגר התמונות המרכזי של המותג</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddVibeImagesFromGallery}
            className="text-xs px-3.5 py-2 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 dark:bg-teal-600/20 dark:hover:bg-teal-600/30 dark:border-teal-500/30 dark:text-teal-300 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <FolderOpen className="w-4 h-4" />
            בחר מגלריית המדיה
          </button>
        </div>

        {/* Vibe Images Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
          {(brandDna.identity.vibeImages || []).map((imgUrl, idx) => (
            <div
              key={idx}
              className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 aspect-video flex items-center justify-center shadow-sm dark:shadow-md"
            >
              <img src={imgUrl} alt={`Vibe ${idx}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                <button
                  type="button"
                  onClick={() => handleExtractColorsFromVibeImage(imgUrl)}
                  className="p-1.5 rounded-lg bg-pink-600/80 text-white hover:bg-pink-500 text-[10px]"
                  title="שלוף צבעים מתמונה זו"
                >
                  <Palette className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveVibeImage(idx)}
                  className="p-1.5 rounded-lg bg-red-600/80 text-white hover:bg-red-500 text-[10px]"
                  title="הסר תמונה"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}

          {/* Add Image Card */}
          <button
            type="button"
            onClick={handleAddVibeImagesFromGallery}
            className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500/50 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900 text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-300 flex flex-col items-center justify-center aspect-video transition-all text-xs font-semibold gap-1 p-2"
          >
            <Plus className="w-4 h-4" />
            <span>הוסף תמונה</span>
          </button>
        </div>
      </div>

      {/* 4. Company Vision & Short Vision AI */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-lg space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="flex items-center text-base font-bold text-slate-800 dark:text-white">
                חזון המותג ועוזר ה-AI
                <Tooltip text="שתף את ה'למה' של העסק. ה-AI ישתמש בחזון הזה כדי לוודא שכל הפוסטים והקמפיינים משדרים את הערכים העמוקים שלך." />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">משמש כעוגן לפרומפטים של Gemini</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenAiImprove}
            className="text-xs px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 dark:bg-purple-600/20 dark:hover:bg-purple-600/30 dark:border-purple-500/30 dark:text-purple-300 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Wand2 className="w-3.5 h-3.5" />
            שפר עם AI
          </button>
        </div>

        {/* Vision textarea */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">חזון מפורט</label>
          <textarea
            rows={4}
            value={brandDna.identity.companyVision}
            onChange={(e) => updateIdentity({ companyVision: e.target.value })}
            placeholder="הזן את חזון המותג בפירוט (ערכים מובילים, השפעה, ייחודיות)..."
            className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:border-indigo-500 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
        </div>

        {/* Short Vision Generator */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center text-xs font-bold text-slate-700 dark:text-slate-200">
              תמצית חזון (עד 15 מילים)
              <Tooltip text="משפט המחץ! ה-AI לוקח את החזון הארוך שלך ומזקק אותו למשפט אחד חזק עבור כותרות מודעות קמפיינים." />
            </label>
            <button
              type="button"
              onClick={handleGenerateShortVision}
              disabled={isShortening}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 font-semibold disabled:opacity-50"
            >
              {isShortening ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
              ייצר תמצית בעזרת AI
            </button>
          </div>
          <input
            type="text"
            value={brandDna.identity.shortVision}
            onChange={(e) => updateIdentity({ shortVision: e.target.value })}
            placeholder="משפט תמציתי ומנצח עבור כותרות משנה..."
            className="w-full bg-white dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:border-indigo-500"
          />
        </div>
      </div>

      {/* AI Improvement Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/70 backdrop-blur-sm animate-in fade-in" dir="rtl">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-lg rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                שיפור ושדרוג חזון ב-Gemini AI
              </h3>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">דגשים מיוחדים לשדרוג (אופציונלי)</label>
              <input
                type="text"
                value={customAiPrompt}
                onChange={(e) => setCustomAiPrompt(e.target.value)}
                placeholder="לדוגמה: הפוך את הטקסט ליותר מרגש, הדגש שירות אישי..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:border-purple-500"
              />
            </div>

            {aiPreviewResult ? (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400">התוצאה שנוצרה על ידי Gemini:</label>
                <div className="p-3.5 bg-emerald-50 dark:bg-slate-950/90 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-sm text-slate-800 dark:text-slate-200 leading-relaxed max-h-48 overflow-y-auto">
                  {aiPreviewResult}
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-xl"
              >
                ביטול
              </button>
              {aiPreviewResult ? (
                <button
                  type="button"
                  onClick={handleAcceptAiResult}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white rounded-xl flex items-center gap-1.5 shadow-md"
                >
                  <CheckCircle className="w-4 h-4" />
                  החלף טקסט קיים
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRunAiImprove}
                  disabled={isImprovingVision}
                  className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 dark:hover:bg-purple-500 text-white rounded-xl flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {isImprovingVision ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  הפעל שיפור
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
