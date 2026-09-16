import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, Link, Sparkles, X, Check, Layers, FolderOpen, Edit3, Trash2 } from 'lucide-react';
import { PageBuilderButton } from './PageBuilderButton';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract } from '../../../core/contracts';
import { MediaPickerModal } from '../../media-gallery-hub';

interface PageBuilderImageUploadProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

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
}) => {
  const { getCapability } = useHostCapabilities();
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<'gallery' | 'url' | 'samples' | 'ai'>('gallery');
  const [urlInput, setUrlInput] = useState(value || '');
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleOpenMediaGallery = async () => {
    if (mediaPicker) {
      try {
        const selected = await mediaPicker.openPicker({ accept: 'image/*' });
        if (selected) {
          const finalUrl = Array.isArray(selected) ? selected[0] : selected;
          if (finalUrl) {
            onChange(finalUrl);
            setUrlInput(finalUrl);
            return;
          }
        }
      } catch (err) {
        console.warn('Host media picker fallback to direct modal:', err);
      }
    }
    setIsGalleryModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      onChange(localUrl);
      setUrlInput(localUrl);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
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
            }}
            className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3 h-3" /> הסר תמונה
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {value ? (
        <div className="flex flex-col gap-2">
          {/* Active Image Card with Hover Overlay */}
          <div className="relative group rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 aspect-video w-full flex items-center justify-center shadow-lg">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            
            {/* Action Overlay */}
            <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
              <span className="text-xs font-bold text-white mb-1">החלפת תמונה</span>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={handleOpenMediaGallery}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-yellow-500/20 transition-all cursor-pointer active:scale-95"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>בחר מגלריה</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-600 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>העלה קובץ</span>
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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenMediaGallery}
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="פתח גלריית מדיה לבחירה או העלאה"
            >
              <FolderOpen className="w-3.5 h-3.5 text-yellow-400" />
              <span>החלף מגלריית המדיה</span>
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
              title="ערוך כתובת תמונה ידנית"
            >
              <Link className="w-3.5 h-3.5 text-slate-400" />
              <span>כתובת URL</span>
            </button>
          </div>

          {/* Inline URL Edit Drawer */}
          {isEditingUrl && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 animate-in fade-in">
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
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
          <div className="flex items-center gap-1 border-b border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setTab('gallery')}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer',
                tab === 'gallery' ? 'bg-amber-500 text-black font-bold shadow' : 'text-slate-400 hover:text-white'
              )}
            >
              <FolderOpen className="w-3.5 h-3.5" /> גלריית מדיה והעלאה
            </button>
            <button
              type="button"
              onClick={() => setTab('url')}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer',
                tab === 'url' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              <Link className="w-3.5 h-3.5" /> קישור ישיר (URL)
            </button>
            <button
              type="button"
              onClick={() => setTab('samples')}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer',
                tab === 'samples' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              <ImageIcon className="w-3.5 h-3.5" /> דוגמאות
            </button>
            <button
              type="button"
              onClick={() => setTab('ai')}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer',
                tab === 'ai' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> יצירה ב-AI
            </button>
          </div>

          {/* TAB 1: Main Gallery Hub & Local Upload */}
          {tab === 'gallery' && (
            <div className="flex flex-col gap-3 py-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleOpenMediaGallery}
                  className="p-4 rounded-2xl bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-600/20 hover:from-yellow-500/30 hover:to-amber-500/30 border-2 border-dashed border-yellow-500/50 hover:border-yellow-400 text-yellow-300 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-md group active:scale-98"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-500 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-extrabold text-white">בחר מגלריית המדיה</div>
                    <div className="text-[10px] text-yellow-300/80">עיון בכל הקבצים והתיקיות במאגר</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 rounded-2xl bg-slate-950/60 hover:bg-slate-950 border-2 border-dashed border-slate-700 hover:border-slate-500 text-slate-300 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group active:scale-98"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center shadow group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-white">העלה קובץ מהמחשב</div>
                    <div className="text-[10px] text-slate-400">PNG, JPG, WEBP, GIF</div>
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

      {/* Direct Media Gallery Hub Modal */}
      {isGalleryModalOpen && (
        <MediaPickerModal
          isOpen={isGalleryModalOpen}
          onClose={() => setIsGalleryModalOpen(false)}
          title="בחירת תמונה מגלריית המדיה"
          allowedTypes={['image']}
          onSelectMedia={(items) => {
            const first = items[0];
            if (first?.url) {
              onChange(first.url);
              setUrlInput(first.url);
            }
            setIsGalleryModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

