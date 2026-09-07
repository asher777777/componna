import React, { useState, useEffect } from 'react';
import { X, Sparkles, Download, Save, Check, RefreshCw, Layers } from 'lucide-react';
import { useMediaGallery } from '../context/MediaGalleryContext';
import { ImageConverterService } from '../services/imageConverterService';
import { ImageConversionOptions, MediaItem } from '../types';

export const ImageConverterModal: React.FC = () => {
  const { converterItem, setConverterItem, addMediaItems } = useMediaGallery();

  const [targetFormat, setTargetFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/webp');
  const [quality, setQuality] = useState<number>(0.85);
  const [maxWidth, setMaxWidth] = useState<string>('');
  const [maxHeight, setMaxHeight] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [convertedResult, setConvertedResult] = useState<{
    blob: Blob;
    dataUrl: string;
    objectUrl: string;
    sizeBytes: number;
  } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!converterItem) {
      setConvertedResult(null);
      return;
    }

    handleConvertPreview();
  }, [converterItem, targetFormat, quality, maxWidth, maxHeight]);

  if (!converterItem) return null;

  const handleConvertPreview = async () => {
    if (!converterItem) return;
    setIsProcessing(true);
    try {
      const options: ImageConversionOptions = {
        targetFormat,
        quality,
        maxWidth: maxWidth ? parseInt(maxWidth, 10) : undefined,
        maxHeight: maxHeight ? parseInt(maxHeight, 10) : undefined,
        preserveAspectRatio: true,
      };

      const res = await ImageConverterService.convertImage(converterItem.url, options);
      setConvertedResult(res);
    } catch (err) {
      console.warn('[ImageConverter] Conversion preview error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadConverted = () => {
    if (!convertedResult) return;
    const ext = targetFormat.split('/')[1];
    const baseName = converterItem.name.replace(/\.[^/.]+$/, '');
    const newFileName = `${baseName}_converted.${ext}`;
    ImageConverterService.downloadMedia(convertedResult.objectUrl, newFileName);
  };

  const handleSaveToGallery = async () => {
    if (!convertedResult) return;
    const ext = targetFormat.split('/')[1];
    const baseName = converterItem.name.replace(/\.[^/.]+$/, '');
    const newFileName = `${baseName}_${ext.toUpperCase()}.${ext}`;

    const newItem: MediaItem = {
      id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: newFileName,
      type: 'image',
      mimeType: targetFormat,
      url: convertedResult.objectUrl,
      sizeBytes: convertedResult.sizeBytes,
      createdAt: Date.now(),
      tags: [...(converterItem.tags || []), 'converted', ext],
    };

    await addMediaItems([newItem], [convertedResult.blob]);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setConverterItem(null);
    }, 1200);
  };

  const formatExt = targetFormat.split('/')[1].toUpperCase();
  const sizeDiffPercent = convertedResult
    ? Math.round(((convertedResult.sizeBytes - converterItem.sizeBytes) / converterItem.sizeBytes) * 100)
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in text-slate-100"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">ממיר תמונות ודוחס איכות</h2>
              <p className="text-xs text-slate-400">המרת פורמט (WEBP, PNG, JPG), שינוי רזולוציה ודחיסה מיידית</p>
            </div>
          </div>

          <button
            onClick={() => setConverterItem(null)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto">
          {/* Controls Sidebar */}
          <div className="w-full md:w-80 p-5 bg-slate-950/70 border-b md:border-b-0 md:border-l border-slate-800 space-y-5">
            {/* Format Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">פורמט יעד:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'WEBP (מומלץ)', val: 'image/webp' },
                  { label: 'JPG', val: 'image/jpeg' },
                  { label: 'PNG', val: 'image/png' },
                ].map((f) => (
                  <button
                    key={f.val}
                    type="button"
                    onClick={() => setTargetFormat(f.val as any)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      targetFormat === f.val
                        ? 'bg-yellow-500 text-black border-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.4)]'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Slider (for JPG & WEBP) */}
            {targetFormat !== 'image/png' && (
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                  <span>איכות דחיסה:</span>
                  <span className="text-yellow-400 font-mono font-bold">{Math.round(quality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-yellow-500 cursor-pointer"
                />
              </div>
            )}

            {/* Resize Dimensions */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">שינוי רזולוציה (אופציונלי):</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="block text-[11px] text-slate-400 mb-1">רוחב מקסימלי (px)</span>
                  <input
                    type="number"
                    placeholder="ללא"
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-yellow-500"
                  />
                </div>
                <div>
                  <span className="block text-[11px] text-slate-400 mb-1">גובה מקסימלי (px)</span>
                  <input
                    type="number"
                    placeholder="ללא"
                    value={maxHeight}
                    onChange={(e) => setMaxHeight(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-yellow-500"
                  />
                </div>
              </div>
            </div>

            {/* Comparison Stats */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
              <div className="font-bold text-slate-300 flex items-center space-x-1.5 rtl:space-x-reverse">
                <Layers className="w-4 h-4 text-yellow-400" />
                <span>השוואת גודל:</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>גודל מקורי:</span>
                <span className="font-mono text-white">{ImageConverterService.formatBytes(converterItem.sizeBytes)}</span>
              </div>
              {convertedResult && (
                <>
                  <div className="flex justify-between text-slate-400">
                    <span>גודל מומר ({formatExt}):</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {ImageConverterService.formatBytes(convertedResult.sizeBytes)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800 text-[11px]">
                    <span>חיסכון בנפח:</span>
                    <span className={`font-bold ${sizeDiffPercent < 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {sizeDiffPercent < 0 ? `${Math.abs(sizeDiffPercent)}%- חיסכון` : `${sizeDiffPercent}%+`}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-black/90 p-5 flex flex-col items-center justify-center min-h-[300px] relative">
            {isProcessing && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                <RefreshCw className="w-8 h-8 text-yellow-400 animate-spin" />
              </div>
            )}

            {convertedResult ? (
              <img
                src={convertedResult.objectUrl}
                alt="Converted Preview"
                className="max-w-full max-h-[45vh] rounded-2xl object-contain shadow-2xl border border-slate-800"
              />
            ) : (
              <img
                src={converterItem.url}
                alt="Original Preview"
                className="max-w-full max-h-[45vh] rounded-2xl object-contain shadow-2xl"
              />
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-800/80 border-t border-slate-700/80 flex items-center justify-between">
          <button
            onClick={() => setConverterItem(null)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            סגור
          </button>

          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <button
              onClick={handleDownloadConverted}
              disabled={!convertedResult || isProcessing}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center space-x-1.5 rtl:space-x-reverse border border-slate-700 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-yellow-400" />
              <span>הורד קובץ מומר</span>
            </button>

            <button
              onClick={handleSaveToGallery}
              disabled={!convertedResult || isProcessing}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-black flex items-center space-x-2 rtl:space-x-reverse shadow-lg transition-all active:scale-95 cursor-pointer ${
                saveSuccess
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300'
              }`}
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>נשמר לגלריה!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>שמור תמונה בגלריה</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};