import React, { useState } from 'react';
import { PageBuilderConfig } from '../types/pageBuilder.types';
import {
  Globe,
  CheckCircle2,
  Copy,
  ExternalLink,
  Share2,
  ShieldCheck,
  X,
  Sparkles,
} from 'lucide-react';
import { clsx } from 'clsx';

interface PublishPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PageBuilderConfig;
  onTogglePublish: (updated: PageBuilderConfig) => void;
  onOpenShortener: (config: PageBuilderConfig) => void;
}

export const PublishPageModal: React.FC<PublishPageModalProps> = ({
  isOpen,
  onClose,
  config,
  onTogglePublish,
  onOpenShortener,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.comona.io';
  const publicUrl = `${origin}/p/${config.slug || config.pageId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle = () => {
    const isNowPublished = !config.published;
    const updated: PageBuilderConfig = {
      ...config,
      published: isNowPublished,
      publishedAt: isNowPublished ? new Date().toISOString() : undefined,
      publishedUrl: isNowPublished ? publicUrl : undefined,
    };
    onTogglePublish(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" dir="rtl">
      <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-right flex flex-col gap-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 text-slate-400 hover:text-white p-1 rounded-full bg-slate-900 border border-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className={clsx(
            'w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg',
            config.published ? 'bg-emerald-600 shadow-emerald-600/30' : 'bg-indigo-600 shadow-indigo-600/30'
          )}>
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">פרסום עמוד לאוויר</h3>
            <p className="text-xs text-slate-400">
              {config.published ? 'העמוד מפורסם ונגיש לכל הגולשים ברשת' : 'העמוד כרגע במצב טיוטה פנימית'}
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={clsx(
              'w-3 h-3 rounded-full animate-ping',
              config.published ? 'bg-emerald-400' : 'bg-amber-400'
            )} />
            <span className="text-sm font-bold text-white">
              סטטוס: {config.published ? '🟢 פעיל ומפורסם' : '🟡 טיוטה (לא מפורסם)'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggle}
            className={clsx(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md',
              config.published
                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600 hover:text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            )}
          >
            {config.published ? 'בטל פרסום' : 'פרסם עכשיו 🚀'}
          </button>
        </div>

        {/* Public URL Box */}
        {config.published && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-300">כתובת העמוד הציבורי:</label>
            <div className="flex items-center gap-2 p-3 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="flex-1 bg-transparent text-xs text-indigo-300 font-mono outline-none"
                dir="ltr"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'הועתק!' : 'העתק'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Short Link Action */}
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-indigo-300">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>רוצים קישור קצר, קליט וקוד QR מעוצב?</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenShortener(config);
            }}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
          >
            פתח מקצר URL ✨
          </button>
        </div>
      </div>
    </div>
  );
};
