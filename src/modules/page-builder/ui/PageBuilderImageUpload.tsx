import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, Link, Sparkles, X, Check, Layers, FolderOpen } from 'lucide-react';
import { PageBuilderButton } from './PageBuilderButton';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract } from '../../../core/contracts';

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

  const [tab, setTab] = useState<'url' | 'samples' | 'ai' | 'gallery'>('url');
  const [urlInput, setUrlInput] = useState(value || '');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleOpenMediaGallery = async () => {
    if (mediaPicker) {
      const selected = await mediaPicker.openPicker({ accept: 'image/*' });
      if (selected) {
        const finalUrl = Array.isArray(selected) ? selected[0] : selected;
        onChange(finalUrl);
        setUrlInput(finalUrl);
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleApplyUrl = () => {
    onChange(urlInput);
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
      <div className="flex items-center justify-between">
        {label && <label className="text-xs font-semibold text-slate-300">{label}</label>}
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setUrlInput('');
            }}
            className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" /> הסר תמונה
          </button>
        )}
      </div>

      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 aspect-video w-full flex items-center justify-center">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <PageBuilderButton
              size="xs"
              variant="secondary"
              onClick={() => {
                const newUrl = prompt('הזן כתובת תמונה חדשה (URL):', value);
                if (newUrl !== null) {
                  onChange(newUrl);
                  setUrlInput(newUrl);
                }
              }}
            >
              החלף כתובת
            </PageBuilderButton>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-3.5 flex flex-col gap-3">
          <div className="flex items-center gap-1 border-b border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setTab('url')}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5',
                tab === 'url' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              <Link className="w-3.5 h-3.5" /> קישור ישיר (URL)
            </button>
            <button
              type="button"
              onClick={handleOpenMediaGallery}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <FolderOpen className="w-3.5 h-3.5 text-yellow-400" />
              <span>{mediaPicker ? 'גלריית מדיה' : 'העלאת קובץ'}</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('samples')}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5',
                tab === 'samples' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              <ImageIcon className="w-3.5 h-3.5" /> תמונות דוגמה
            </button>
            <button
              type="button"
              onClick={() => setTab('ai')}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5',
                tab === 'ai' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> יצירה ב-AI
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const localUrl = URL.createObjectURL(file);
                onChange(localUrl);
                setUrlInput(localUrl);
              }
            }}
          />

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
              <PageBuilderButton size="xs" onClick={handleApplyUrl} disabled={!urlInput}>
                החל
              </PageBuilderButton>
            </div>
          )}

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
                  className="rounded-xl overflow-hidden border border-slate-800 hover:border-indigo-500 transition-all aspect-video group relative"
                >
                  <img src={sampleUrl} alt="Sample" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </button>
              ))}
            </div>
          )}

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
