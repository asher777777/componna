import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Check,
  Sparkles,
  Layers,
  Save,
  Undo2,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { MediaItem } from '../types';
import { useFileEditor, ImageCropArea } from '../hooks/useFileEditor';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../core/contracts';

interface QuickImageEditorModalProps {
  item: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

type AspectRatioOption = 'free' | '1:1' | '16:9' | '9:16' | '4:3';

export const QuickImageEditorModal: React.FC<QuickImageEditorModalProps> = ({
  item,
  isOpen,
  onClose,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const { isProcessing, error, transformImage, removeBackground } = useFileEditor();
  const { getCapability } = useHostCapabilities();
  const brandContract = getCapability<BrandDnaContract>('brand-dna');

  // Edit states
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('free');
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [watermarkPosition, setWatermarkPosition] = useState<
    'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'center'
  >('bottom-right');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.85);
  const [saveAsCopy, setSaveAsCopy] = useState(true);

  // Background Studio state
  const [magicBgColor, setMagicBgColor] = useState<string>('transparent');

  useEffect(() => {
    if (isOpen) {
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setAspectRatio('free');
      setWatermarkEnabled(false);
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const brandDna = brandContract ? brandContract.getBrandDna() : null;
  const brandLogo = brandDna?.identity?.logoUrl;

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleSave = async () => {
    let cropArea: ImageCropArea | undefined;
    if (aspectRatio === '1:1') {
      cropArea = { x: 10, y: 10, width: 80, height: 80 };
    } else if (aspectRatio === '16:9') {
      cropArea = { x: 0, y: 15, width: 100, height: 70 };
    } else if (aspectRatio === '9:16') {
      cropArea = { x: 20, y: 0, width: 60, height: 100 };
    }

    await transformImage(item, {
      rotation,
      flipH,
      flipV,
      crop: cropArea,
      watermarkUrl: watermarkEnabled && brandLogo ? brandLogo : undefined,
      watermarkOpacity,
      watermarkPosition,
      asNewItem: saveAsCopy,
    });

    onClose();
  };

  const handleRemoveBackground = async () => {
    await removeBackground(item, { tolerance: 25, feather: 2 }, saveAsCopy);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      dir="rtl"
    >
      <div
        className={`w-full max-w-4xl h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Header */}
        <div
          className={`h-14 px-4 border-b flex items-center justify-between flex-shrink-0 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}
        >
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">עורך תמונות מהיר (In-Drive Studio)</h3>
              <p className="text-[11px] text-slate-400">{item.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              type="button"
              onClick={handleSave}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs sm:text-sm flex items-center space-x-1.5 rtl:space-x-reverse cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saveAsCopy ? 'שמור כעותק חדש' : 'עדכן קובץ קיים'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isLight ? 'bg-white hover:bg-red-50 border-slate-200 text-slate-500' : 'bg-slate-800 hover:bg-red-950/40 border-slate-700 text-slate-400'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workspace: Image preview + Editor Controls */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* Main preview canvas */}
          <div className="flex-1 min-h-[300px] bg-slate-950/60 p-4 flex items-center justify-center relative overflow-hidden">
            <div
              className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-200"
              style={{
                transform: `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
              }}
            >
              <img
                src={item.url}
                alt={item.name}
                className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-2xl"
              />

              {/* Watermark preview overlay */}
              {watermarkEnabled && brandLogo && (
                <div
                  className={`absolute pointer-events-none p-2 ${
                    watermarkPosition === 'bottom-left'
                      ? 'bottom-2 left-2'
                      : watermarkPosition === 'top-left'
                      ? 'top-2 left-2'
                      : watermarkPosition === 'top-right'
                      ? 'top-2 right-2'
                      : watermarkPosition === 'center'
                      ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                      : 'bottom-2 right-2'
                  }`}
                  style={{ opacity: watermarkOpacity }}
                >
                  <img src={brandLogo} alt="Brand Watermark" className="w-16 h-auto drop-shadow-md" />
                </div>
              )}
            </div>

            {/* Error badge */}
            {error && (
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-xs">
                {error}
              </div>
            )}
          </div>

          {/* Right/Bottom Controls Panel */}
          <div
            className={`w-full md:w-80 border-t md:border-t-0 md:border-r p-4 overflow-y-auto space-y-5 flex-shrink-0 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            {/* 1. Transformations */}
            <div>
              <h4 className="text-xs font-black uppercase text-slate-400 mb-2">סיבוב והיפוך</h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleRotate}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-xs font-bold gap-1 transition-colors cursor-pointer ${
                    isLight ? 'bg-white hover:bg-slate-100 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                  }`}
                >
                  <RotateCw className="w-4 h-4 text-amber-500" />
                  <span>90° ימינה</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFlipH(!flipH)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-xs font-bold gap-1 transition-colors cursor-pointer ${
                    flipH
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                      : isLight
                      ? 'bg-white hover:bg-slate-100 border-slate-200'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                  }`}
                >
                  <FlipHorizontal className="w-4 h-4 text-amber-500" />
                  <span>היפוך אופקי</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFlipV(!flipV)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-xs font-bold gap-1 transition-colors cursor-pointer ${
                    flipV
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                      : isLight
                      ? 'bg-white hover:bg-slate-100 border-slate-200'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                  }`}
                >
                  <FlipVertical className="w-4 h-4 text-amber-500" />
                  <span>היפוך אנכי</span>
                </button>
              </div>
            </div>

            {/* 2. Aspect Ratio Crop Presets */}
            <div>
              <h4 className="text-xs font-black uppercase text-slate-400 mb-2">יחס חיתוך (Crop Aspect Ratio)</h4>
              <div className="grid grid-cols-2 gap-2">
                {(['free', '1:1', '16:9', '9:16'] as AspectRatioOption[]).map((aspect) => (
                  <button
                    key={aspect}
                    type="button"
                    onClick={() => setAspectRatio(aspect)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                      aspectRatio === aspect
                        ? 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20'
                        : isLight
                        ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                    }`}
                  >
                    {aspect === 'free' && 'מקור / חופשי'}
                    {aspect === '1:1' && '1:1 (פרופיל / ריבוע)'}
                    {aspect === '16:9' && '16:9 (לרוחב / וידאו)'}
                    {aspect === '9:16' && '9:16 (סטורי / רילס)'}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Magic Background Studio */}
            <div className="p-3 rounded-xl border bg-gradient-to-br from-indigo-950/30 to-purple-950/30 border-indigo-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs flex items-center gap-1.5 text-indigo-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>הסרת רקע קסומה (Magic BG)</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                זיהוי והסרה אוטומטית של רקע לבן או אחיד והפיכתו לשקוף בלחיצה אחת
              </p>
              <button
                type="button"
                onClick={handleRemoveBackground}
                disabled={isProcessing}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 rtl:space-x-reverse cursor-pointer shadow-md disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>הסר רקע עכשיו</span>
              </button>
            </div>

            {/* 4. Brand Watermark */}
            {brandLogo && (
              <div className="p-3 rounded-xl border border-slate-700 bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs flex items-center gap-1.5 text-slate-300">
                    <Layers className="w-3.5 h-3.5 text-yellow-500" />
                    <span>חותמת מותג (Watermark)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={watermarkEnabled}
                    onChange={(e) => setWatermarkEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                </div>
                {watermarkEnabled && (
                  <div className="space-y-2 pt-2 border-t border-slate-700/60 text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span>מיקום:</span>
                      <select
                        value={watermarkPosition}
                        onChange={(e) => setWatermarkPosition(e.target.value as any)}
                        className="p-1 rounded bg-slate-900 border border-slate-700 text-xs"
                      >
                        <option value="bottom-right">ימין למטה</option>
                        <option value="bottom-left">שמאל למטה</option>
                        <option value="top-right">ימין למעלה</option>
                        <option value="top-left">שמאל למעלה</option>
                        <option value="center">מרכז</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. Save mode toggle */}
            <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-xs">
              <span className="text-slate-400">שמור כקובץ חדש (עותק):</span>
              <input
                type="checkbox"
                checked={saveAsCopy}
                onChange={(e) => setSaveAsCopy(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
