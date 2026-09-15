import React, { useState } from 'react';
import { PageBuilderConfig } from '../types/pageBuilder.types';
import { urlShortenerService, ShortUrlResult } from '../services/urlShortenerService';
import {
  Sparkles,
  Link,
  Copy,
  CheckCircle2,
  QrCode,
  Download,
  Share2,
  X,
  ExternalLink,
} from 'lucide-react';

interface UrlShortenerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PageBuilderConfig;
  onSaveShortUrl?: (shortUrl: string, shortSlug: string) => void;
}

export const UrlShortenerModal: React.FC<UrlShortenerModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveShortUrl,
}) => {
  const [customSlug, setCustomSlug] = useState(config.shortSlug || '');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shortResult: ShortUrlResult = urlShortenerService.createShortUrl(
    config.pageTitle,
    config.slug || config.pageId,
    customSlug
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(shortResult.shortUrl);
    setCopied(true);
    if (onSaveShortUrl) {
      onSaveShortUrl(shortResult.shortUrl, shortResult.shortSlug);
    }
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" dir="rtl">
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Link className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">מקצר URL וקוד QR חכם</h3>
            <p className="text-xs text-slate-400">
              כתובת קצרה וממותגת על בסיס תוכן העמוד עם קוד QR להדפסה ושיתוף.
            </p>
          </div>
        </div>

        {/* Shortened URL Preview Card */}
        <div className="p-4 bg-slate-900/90 border border-indigo-500/40 rounded-2xl flex flex-col gap-3 shadow-xl">
          <span className="text-xs font-bold text-indigo-400">הקישור המקוצר שלכם:</span>
          <div className="flex items-center justify-between gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-sm sm:text-base font-black text-white font-mono" dir="ltr">
              {shortResult.shortUrl}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shrink-0"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'הועתק!' : 'העתק'}</span>
            </button>
          </div>
        </div>

        {/* Slug Suggestions */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2">
            הצעות לכתובות חכמות מבוססות תוכן:
          </label>
          <div className="flex flex-wrap gap-2">
            {shortResult.suggestedSlugs.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setCustomSlug(s)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-mono transition-colors"
                dir="ltr"
              >
                /{s}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Slug Input */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            התאמה אישית של הסלאג (Slug):
          </label>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs">
            <span className="text-slate-500 font-mono">cmn.to/</span>
            <input
              type="text"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
              placeholder="my-custom-slug"
              className="flex-1 bg-transparent text-white font-mono outline-none"
              dir="ltr"
            />
          </div>
        </div>

        {/* QR Code Section */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 p-1 flex items-center justify-center overflow-hidden shrink-0">
              <img src={shortResult.qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                <span>קוד QR ייעודי לעמוד</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                מוכן להדפסה על פוסטרים, כרטיסי ביקור ושיתוף במדיה.
              </p>
            </div>
          </div>

          <a
            href={shortResult.qrCodeUrl}
            target="_blank"
            download="page-qr-code.png"
            rel="noreferrer"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="הורד קוד QR"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
