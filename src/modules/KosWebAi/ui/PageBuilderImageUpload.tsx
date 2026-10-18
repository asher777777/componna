import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, Link, Sparkles, X, FolderOpen, Edit3, Trash2, Crown, Video as VideoIcon, Loader2 } from 'lucide-react';
import { PageBuilderButton } from './PageBuilderButton';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract } from '../../../core/contracts';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import { FirebaseStorageMediaService } from '../../KosCloudStore/services/firebaseStorageMediaService';
import { ImageConverterService } from '../../KosCloudStore/services/imageConverterService';

interface PageBuilderImageUploadProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  allowedMimeTypes?: string[];
  maxSizeBytes?: number;
}

const isVideoMedia = (url?: string): boolean => {
  if (!url) return false;
  if (url.startsWith('data:video/')) return true;
  if (url.startsWith('data:image/')) return false;
  const clean = decodeURIComponent(url.split('?')[0].split('#')[0]).toLowerCase();
  return /\.(mp4|webm|ogg|mov|mkv|m4v)$/i.test(clean);
};

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
];

export const PageBuilderImageUpload: React.FC<PageBuilderImageUploadProps> = ({
  label = 'תמונה / מדיה',
  value,
  onChange,
  className,
  allowedMimeTypes,
  maxSizeBytes,
}) => {
  const { getCapability } = useHostCapabilities();
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const systemConn = useSystemConnection();
  const { tenantId } = useTenantScope();
  const [tab, setTab] = useState<'media' | 'url' | 'samples' | 'ai'>('media');
  const [urlInput, setUrlInput] = useState(value || '');
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isJpgRestricted = allowedMimeTypes?.some((m) => m.includes('jpeg') || m.includes('jpg'));

  const handleOpenMediaGallery = async (initialTab: 'gallery' | 'icons' = 'gallery') => {
    setValidationError(null);
    if (mediaPicker) {
      try {
        const selected = await mediaPicker.openPicker({
          multiple: false,
          initialTab,
          accept: isJpgRestricted ? 'image/jpeg' : undefined,
          allowedMimeTypes,
          maxSizeBytes,
        });
        if (selected) {
          const finalUrl = Array.isArray(selected) ? selected[0] : selected;
          if (finalUrl) {
            onChange(finalUrl);
            setUrlInput(finalUrl);
            return;
          }
        }
      } catch (err) {
        console.warn('Host media picker fallback to direct file input:', err);
      }
    }
    // Graceful fallback to local file upload input
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    let targetFile: File | Blob = file;
    let targetFileName = file.name;

    // Auto-convert to JPG if restricted (e.g. for SEO og:image) or if image exceeds maxSizeBytes
    const isImageFile = file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|svg|avif)$/i.test(file.name);
    if (isImageFile && (isJpgRestricted || (maxSizeBytes && file.size > maxSizeBytes))) {
      try {
        const converted = await ImageConverterService.convertImage(file, {
          targetFormat: 'image/jpeg',
          quality: 0.85,
          maxWidth: 1200,
          maxHeight: 630,
          preserveAspectRatio: true,
        });
        targetFile = converted.blob;
        targetFileName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
      } catch (convErr) {
        console.warn('[PageBuilderImageUpload] Auto JPG conversion notice:', convErr);
      }
    }

    if (maxSizeBytes && targetFile.size > maxSizeBytes) {
      const maxKb = Math.round(maxSizeBytes / 1024);
      const actualKb = Math.round(targetFile.size / 1024);
      setValidationError(`שגיאה: משקל הקובץ (${actualKb}KB) חורג מהמותר (עד ${maxKb}KB).`);
      e.target.value = '';
      return;
    }

    // Immediate 0ms local preview
    const localUrl = URL.createObjectURL(targetFile);
    onChange(localUrl);
    setUrlInput(localUrl);

    // Asynchronously upload to Firebase Cloud Storage for permanent public URL (SEO / OpenGraph compatible)
    if (systemConn?.firebaseApp) {
      setIsUploading(true);
      setUploadProgress(10);
      try {
        const permanentUrl = await FirebaseStorageMediaService.uploadFileToStorage(
          systemConn.firebaseApp,
          targetFile,
          targetFileName,
          (pct) => setUploadProgress(pct),
          {
            sourceModule: 'KosWebAi',
            sourceModuleLabel: 'בונה דפים ו-SEO',
            type: targetFile.type?.startsWith('video/') ? 'video' : 'image',
            mimeType: targetFile.type || (isJpgRestricted ? 'image/jpeg' : undefined),
          },
          tenantId
        );
        if (permanentUrl) {
          onChange(permanentUrl);
          setUrlInput(permanentUrl);
        }
      } catch (uploadErr) {
        console.warn('[PageBuilderImageUpload] Firebase Storage upload error:', uploadErr);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const handleApplyUrl = () => {
    setValidationError(null);
    if (urlInput.trim()) {
      const clean = urlInput.trim();
      if (isJpgRestricted && !/\.(jpg|jpeg)(\?.*)?$/i.test(clean) && !clean.startsWith('data:image/jpeg')) {
        setValidationError('שגיאה: הקישור חייב להפנות לקובץ JPG בלבד (.jpg / .jpeg).');
        return;
      }
      onChange(clean);
      setIsEditingUrl(false);
    }
  };

  const handleGenerateAi = () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    // AI Mock generator for fast preview
    setTimeout(() => {
      const generated = `https://picsum.photos/seed/${encodeURIComponent(aiPrompt)}/1200/800`;
      onChange(generated);
      setUrlInput(generated);
      setIsGenerating(false);
    }, 800);
  };

  return (
    <div className={twMerge(clsx('flex flex-col gap-2 w-full text-right', className))} dir="rtl">
      {/* Label and Top Actions */}
      <div className="flex items-center justify-between">
        {label && <label className="text-xs font-semibold text-slate-300">{label}</label>}
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setUrlInput('');
              setIsEditingUrl(false);
              setValidationError(null);
            }}
            className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3 h-3" /> הסר מדיה
          </button>
        )}
      </div>

      {validationError && (
        <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-[11px] font-bold flex items-center justify-between gap-2">
          <span>{validationError}</span>
          <button type="button" onClick={() => setValidationError(null)} className="text-rose-300 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept={isJpgRestricted ? '.jpg,.jpeg,image/jpeg' : 'image/*,video/*,audio/*'}
        className="hidden"
        onChange={handleFileUpload}
      />

      {value ? (
        <div className="flex flex-col gap-2">
          {/* Active Image/Video Card with Hover Overlay */}
          <div className="relative group rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 aspect-video w-full flex items-center justify-center shadow-lg">
            {isUploading && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                <span className="text-[11px] font-bold text-amber-300">
                  מעלה ענן ומייצר קישור קבוע... {uploadProgress > 0 ? `${uploadProgress}%` : ''}
                </span>
              </div>
            )}
            {isVideoMedia(value) ? (
              <video
                src={`${value}${value.includes('#') ? '' : '#t=0.001'}`}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-contain p-2 max-h-full"
                onError={(e) => {
                  console.warn('[PageBuilderImageUpload] Preview load error for:', value);
                }}
              />
            )}

            {isVideoMedia(value) && (
              <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-sky-500/40 text-sky-300 text-[10px] font-bold flex items-center gap-1.5 shadow-lg">
                <VideoIcon className="w-3 h-3 text-sky-400" />
                <span>וידאו פעיל</span>
              </div>
            )}
            
            {/* Action Overlay */}
            <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
              <span className="text-xs font-bold text-white mb-1">
                {isVideoMedia(value) ? 'החלפת מדיה / וידאו' : 'החלפת תמונה / מדיה'}
              </span>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={() => handleOpenMediaGallery('gallery')}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-yellow-500/20 transition-all cursor-pointer active:scale-95"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>גלריית מדיה</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenMediaGallery('icons')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-amber-500/40 transition-all cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>אייקונים</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-600 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>העלאה</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingUrl(!isEditingUrl)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-600 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>ערוך כתובת</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons Under Preview (Always Visible) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleOpenMediaGallery('gallery')}
              className="py-1.5 px-2.5 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="פתח גלריית מדיה לבחירה או העלאה"
            >
              <FolderOpen className="w-3.5 h-3.5 text-yellow-400" />
              <span>גלריית מדיה</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenMediaGallery('icons')}
              className="py-1.5 px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="בחר מתוך מאגר האייקונים היוקרתיים של רכיב המדיה"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>אייקונים</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="העלה קובץ מהמחשב"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>העלאה</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditingUrl(!isEditingUrl)}
              className="py-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="ערוך כתובת מדיה ידנית"
            >
              <Link className="w-3.5 h-3.5 text-slate-400" />
              <span>URL</span>
            </button>
          </div>

          {/* Inline URL Edit Drawer */}
          {isEditingUrl && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 animate-in fade-in">
              <input
                type="text"
                placeholder="https://example.com/media.mp4 או image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-yellow-500"
                dir="ltr"
              />
              <PageBuilderButton size="xs" variant="primary" onClick={handleApplyUrl} disabled={!urlInput.trim()}>
                החל
              </PageBuilderButton>
              <button
                type="button"
                onClick={() => setIsEditingUrl(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-3.5 flex flex-col gap-3">
          {/* Mode Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-800 pb-2 overflow-x-auto custom-scrollbar">
            <button
              type="button"
              onClick={() => setTab('media')}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shrink-0',
                tab === 'media' ? 'bg-amber-500 text-black font-bold shadow' : 'text-slate-400 hover:text-white'
              )}
            >
              <FolderOpen className="w-3.5 h-3.5" /> מאגר מדיה ואייקונים
            </button>
            <button
              type="button"
              onClick={() => setTab('url')}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shrink-0',
                tab === 'url' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              <Link className="w-3.5 h-3.5" /> קישור (URL)
            </button>
            <button
              type="button"
              onClick={() => setTab('samples')}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shrink-0',
                tab === 'samples' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              <ImageIcon className="w-3.5 h-3.5" /> דוגמאות
            </button>
            <button
              type="button"
              onClick={() => setTab('ai')}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shrink-0',
                tab === 'ai' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> יצירה ב-AI
            </button>
          </div>

          {/* TAB 1: Media Hub, Luxury Icons and Local Upload Cards */}
          {tab === 'media' && (
            <div className="flex flex-col gap-3 py-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. Media Picker Hub */}
                <button
                  type="button"
                  onClick={() => handleOpenMediaGallery('gallery')}
                  className="p-4 rounded-2xl bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-600/20 hover:from-yellow-500/30 hover:to-amber-500/30 border-2 border-dashed border-yellow-500/50 hover:border-yellow-400 text-yellow-300 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-md group active:scale-98"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-500 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-extrabold text-white">גלריית המדיה</div>
                    <div className="text-[10px] text-yellow-300/80">עיון בכל הקבצים והתיקיות</div>
                  </div>
                </button>

                {/* 2. Luxury Icons via Media Picker Hub */}
                <button
                  type="button"
                  onClick={() => handleOpenMediaGallery('icons')}
                  className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-600/20 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border-2 border-dashed border-amber-500/50 hover:border-amber-400 text-amber-300 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-md group active:scale-98"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-extrabold text-white">אייקונים יוקרתיים</div>
                    <div className="text-[10px] text-amber-300/80">סמלי זהב, פלטינה וטכנולוגיה</div>
                  </div>
                </button>

                {/* 3. Local Upload */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 rounded-2xl bg-slate-950/60 hover:bg-slate-950 border-2 border-dashed border-slate-700 hover:border-slate-500 text-slate-300 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group active:scale-98"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center shadow group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-white">העלאה מהמחשב</div>
                    <div className="text-[10px] text-slate-400">תמונות, וידאו וקובצי מדיה</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Direct URL */}
          {tab === 'url' && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                dir="ltr"
              />
              <PageBuilderButton size="xs" onClick={handleApplyUrl} disabled={!urlInput.trim()}>
                החל
              </PageBuilderButton>
            </div>
          )}

          {/* TAB 3: Samples */}
          {tab === 'samples' && (
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_IMAGES.map((sampleUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChange(sampleUrl);
                    setUrlInput(sampleUrl);
                  }}
                  className="rounded-xl overflow-hidden border border-slate-800 hover:border-indigo-500 transition-all aspect-video group relative cursor-pointer"
                >
                  <img src={sampleUrl} alt="Sample" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </button>
              ))}
            </div>
          )}

          {/* TAB 4: AI Generation */}
          {tab === 'ai' && (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="תאר את התמונה שתרצה ליצור (למשל: רקע טכנולוגי עתידני כחול)..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
              />
              <PageBuilderButton
                size="xs"
                variant="gradient"
                onClick={handleGenerateAi}
                disabled={!aiPrompt || isGenerating}
                icon={<Sparkles className="w-3.5 h-3.5" />}
              >
                {isGenerating ? 'יוצר תמונה...' : 'צור תמונה עם AI'}
              </PageBuilderButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
