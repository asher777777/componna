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
} from 'lucide-react';

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

export const BrandIdentitySection: React.FC = () => {
  const { brandDna, updateIdentity, updateDesignTokens } = useBrandDna();
  const { apiKeys } = useSystemConnection();
  const { getCapability } = useHostCapabilities();
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');

  const [isExtractingColors, setIsExtractingColors] = useState(false);
  const [extractedColorsList, setExtractedColorsList] = useState<string[]>([]);
  const [colorsExtractedSuccess, setColorsExtractedSuccess] = useState(false);

  // AI Shorten Vision State
  const [isShortening, setIsShortening] = useState(false);
  const [isImprovingVision, setIsImprovingVision] = useState(false);
  const [customAiPrompt, setCustomAiPrompt] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPreviewResult, setAiPreviewResult] = useState('');

  // Process a selected image URL for color extraction and saving
  const handleProcessLogoUrl = async (url: string) => {
    updateIdentity({ logoUrl: url });
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

  // Open Media Gallery for Logo
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

  // Open Media Gallery for Vibe Images (Multiple)
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
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">זהות עסקית והתאגדות</h3>
            <p className="text-xs text-slate-400">הגדר את סוג הישות המשפטית, שם המותג והסלוגן המוביל</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Organization Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">סוג הישות המשפטית</label>
            <div className="grid grid-cols-3 gap-2">
              {ORG_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateIdentity({ organizationType: type })}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                    brandDna.identity.organizationType === type
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                      : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              שם {brandDna.identity.organizationType}
            </label>
            <input
              type="text"
              value={brandDna.identity.companyName}
              onChange={(e) => updateIdentity({ companyName: e.target.value })}
              placeholder="לדוגמה: קומונה טכנולוגיות בע״מ"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Member count */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">היקף כוח אדם / חברים</label>
            <div className="grid grid-cols-4 gap-2">
              {['אני לבד', 'עד 10', 'עד 50', '50+'].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => updateIdentity({ memberCount: count })}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all text-center ${
                    brandDna.identity.memberCount === count
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Slogan */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">סלוגן המותג (Tagline)</label>
            <input
              type="text"
              value={brandDna.identity.slogan}
              onChange={(e) => updateIdentity({ slogan: e.target.value })}
              placeholder="לדוגמה: מובילים את המהפכה הדיגיטלית שלך"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">מטרת וייעוד הארגון</label>
          <input
            type="text"
            value={brandDna.identity.organizationPurpose}
            onChange={(e) => updateIdentity({ organizationPurpose: e.target.value })}
            placeholder="תאר את ייעוד הארגון או בחר תבנית..."
            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors mb-2"
          />
          <div className="flex flex-wrap gap-2">
            {PURPOSE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => updateIdentity({ organizationPurpose: preset })}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/50 hover:bg-indigo-500/20 hover:text-indigo-300 text-slate-400 border border-slate-700/50 transition-colors"
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Logo Upload & Automatic Color Extractor with Gallery Integration */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">לוגו המותג וחילוץ צבעים אוטומטי</h3>
              <p className="text-xs text-slate-400">בחר לוגו מגלריית המדיה המערכתית או העלה קובץ, ונשלוף ממנו פלטת צבעים</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Logo Area */}
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-900/40 hover:bg-slate-900/70 transition-colors relative min-h-[170px]">
            {brandDna.identity.logoUrl ? (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={brandDna.identity.logoUrl}
                  alt="Brand Logo"
                  className="max-h-24 max-w-full object-contain drop-shadow-md rounded-lg"
                />
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenLogoFromGallery}
                    className="text-xs font-semibold px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    בחר מגלריה
                  </button>
                  <label className="cursor-pointer text-xs font-semibold px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm">
                    <UploadCloud className="w-3.5 h-3.5" />
                    העלה קובץ
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      updateIdentity({ logoUrl: '' });
                      setExtractedColorsList([]);
                    }}
                    className="text-xs px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center w-full space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">הגדר את לוגו המותג</span>
                  <span className="text-[11px] text-slate-500">בחר מגלריית המדיה המערכתית או העלה ישירות</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleOpenLogoFromGallery}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
                  >
                    <FolderOpen className="w-4 h-4" />
                    בחר מגלריית המדיה
                  </button>
                  <label className="cursor-pointer px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5">
                    <UploadCloud className="w-4 h-4" />
                    העלה מהמחשב
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Color Extraction Palette Card */}
          <div className="bg-slate-900/70 border border-slate-700/70 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-pink-400" />
                צבעים שחולצו מהתמונה
              </span>
              {isExtractingColors && <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />}
            </div>

            {extractedColorsList.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {extractedColorsList.map((hex, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <div
                        className="w-9 h-9 rounded-xl border border-white/20 shadow-sm cursor-pointer hover:scale-105 transition-transform"
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                      <span className="text-[10px] font-mono text-slate-400">{hex}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleApplyExtractedColors}
                  className="w-full py-2 px-3 bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/40 text-pink-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Palette className="w-3.5 h-3.5" />
                  קבע כצבעי Design Tokens גלובליים
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-3 text-center">
                בחר לוגו או תמונת אווירה כדי לחלץ צבעים באופן אוטומטי.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Vibe Images & Brand Media Gallery Section */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">תמונות אווירה ונכסי מדיה של המותג</h3>
              <p className="text-xs text-slate-400">נהל את מאגר התמונות המרכזי של המותג לשימוש בדפי נחיתה, סרטונים וקמפיינים</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddVibeImagesFromGallery}
            className="text-xs px-3.5 py-2 bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/30 text-teal-300 rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow-sm"
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
              className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-video flex items-center justify-center shadow-md"
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
            className="rounded-xl border-2 border-dashed border-slate-700 hover:border-teal-500/50 bg-slate-900/50 hover:bg-slate-900 text-slate-400 hover:text-teal-300 flex flex-col items-center justify-center aspect-video transition-all text-xs font-semibold gap-1 p-2"
          >
            <Plus className="w-4 h-4" />
            <span>הוסף מגלריה</span>
          </button>
        </div>
      </div>

      {/* 4. Company Vision & Short Vision AI */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">חזון המותג ועוזר ה-AI</h3>
              <p className="text-xs text-slate-400">החזון מגדיר את שאיפת העסק ומשמש כעוגן לפרומפטים של Gemini</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenAiImprove}
            className="text-xs px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 rounded-xl font-bold flex items-center gap-1.5 transition-colors"
          >
            <Wand2 className="w-3.5 h-3.5" />
            שפר עם AI
          </button>
        </div>

        {/* Vision textarea */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">חזון מפורט</label>
          <textarea
            rows={4}
            value={brandDna.identity.companyVision}
            onChange={(e) => updateIdentity({ companyVision: e.target.value })}
            placeholder="הזן את חזון המותג בפירוט (ערכים מובילים, השפעה, ייחודיות)..."
            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
          />
        </div>

        {/* Short Vision Generator */}
        <div className="p-4 bg-slate-900/60 border border-slate-700/60 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200">תמצית חזון (עד 15 מילים)</label>
            <button
              type="button"
              onClick={handleGenerateShortVision}
              disabled={isShortening}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold disabled:opacity-50"
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
            className="w-full bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* AI Improvement Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in" dir="rtl">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-400" />
                שיפור ושדרוג חזון ב-Gemini AI
              </h3>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">דגשים מיוחדים לשדרוג (אופציונלי)</label>
              <input
                type="text"
                value={customAiPrompt}
                onChange={(e) => setCustomAiPrompt(e.target.value)}
                placeholder="לדוגמה: הפוך את הטקסט ליותר מרגש, הדגש שירות אישי..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {aiPreviewResult ? (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-emerald-400">התוצאה שנוצרה על ידי Gemini:</label>
                <div className="p-3.5 bg-slate-950/90 border border-emerald-500/30 rounded-xl text-sm text-slate-200 leading-relaxed max-h-48 overflow-y-auto">
                  {aiPreviewResult}
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
              >
                ביטול
              </button>
              {aiPreviewResult ? (
                <button
                  type="button"
                  onClick={handleAcceptAiResult}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-1.5 shadow-md"
                >
                  <CheckCircle className="w-4 h-4" />
                  החלף טקסט קיים
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRunAiImprove}
                  disabled={isImprovingVision}
                  className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-xl flex items-center gap-1.5 shadow-md disabled:opacity-50"
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
