import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  Layers,
  File,
} from 'lucide-react';
import { MediaItem } from '../types';
import { FileCompressionService } from '../services/fileCompressionService';

interface DocumentViewerModalProps {
  item: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDocToLandingPage?: (item: MediaItem) => void;
  theme?: 'dark' | 'light';
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  item,
  isOpen,
  onClose,
  onOpenDocToLandingPage,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !item) return null;

  const isPdf = item.type === 'pdf' || item.name.toLowerCase().endsWith('.pdf') || item.mimeType?.includes('pdf');
  const isSpreadsheet =
    item.type === 'spreadsheet' ||
    ['xls', 'xlsx', 'csv'].includes(item.extension || '') ||
    item.name.match(/\.(xlsx?|csv)$/i);
  const isDoc = item.type === 'document' || item.name.match(/\.(docx?|pptx?|odt|txt)$/i);
  const isArchive = item.type === 'archive' || item.name.match(/\.(zip|rar|7z|tar|gz)$/i);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(item.url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownload = () => {
    FileCompressionService.downloadMedia(item.url, item.name);
  };

  const handleShareWhatsapp = () => {
    const text = encodeURIComponent(`מצורף קובץ: ${item.name}\n${item.url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      dir="rtl"
    >
      <div
        className={`w-full max-w-5xl h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Header Bar */}
        <div
          className={`h-14 px-4 border-b flex items-center justify-between flex-shrink-0 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}
        >
          <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 flex-shrink-0">
              {isPdf ? (
                <FileText className="w-5 h-5 text-red-500" />
              ) : isSpreadsheet ? (
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
              ) : isArchive ? (
                <FileArchive className="w-5 h-5 text-purple-500" />
              ) : (
                <File className="w-5 h-5 text-blue-500" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base truncate" title={item.name}>
                {item.name}
              </h3>
              <p className="text-[11px] text-slate-400">
                {FileCompressionService.formatBytes(item.sizeBytes)} • {item.extension?.toUpperCase() || item.type}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {/* AI Landing page button */}
            {onOpenDocToLandingPage && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDocToLandingPage(item);
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 rtl:space-x-reverse shadow-lg shadow-purple-500/20 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">המר לדף נחיתה ב-AI</span>
              </button>
            )}

            {/* Share Whatsapp */}
            <button
              type="button"
              onClick={handleShareWhatsapp}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-emerald-600' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-emerald-400'
              }`}
              title="שתף בוואטסאפ"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Copy link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isLight ? 'bg-white hover:bg-slate-100 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
              }`}
              title="העתק קישור ישיר"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Download */}
            <button
              type="button"
              onClick={handleDownload}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-blue-600' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-blue-400'
              }`}
              title="הורד קובץ"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isLight ? 'bg-white hover:bg-red-50 text-slate-500 hover:text-red-500 border-slate-200' : 'bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border-slate-700'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Content View Area */}
        <div className="flex-1 min-h-0 bg-slate-950/40 relative overflow-hidden flex items-center justify-center">
          {isPdf ? (
            <iframe
              src={`${item.url}#toolbar=1&navpanes=0`}
              className="w-full h-full border-0"
              title={item.name}
            />
          ) : isSpreadsheet ? (
            <div className="max-w-md p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-lg">טבלה / גיליון נתונים</h4>
              <p className="text-sm text-slate-400">
                קובץ גיליון נתונים ({item.extension?.toUpperCase() || 'EXCEL/CSV'}). ניתן להורידו או לפתוח ישירות בתוכנת הגיליונות שלך.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center space-x-2 rtl:space-x-reverse cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  <Download className="w-4 h-4" />
                  <span>הורד גיליון</span>
                </button>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 font-bold text-sm flex items-center space-x-2 rtl:space-x-reverse cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>פתיחה בלשונית חדשה</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="max-w-md p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <File className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-lg">{item.name}</h4>
              <p className="text-sm text-slate-400">
                סוג קובץ: {item.type} ({item.mimeType}). תצוגה מקדימה ישירה אינה נתמכת עבור פורמט זה בדפדפן.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center space-x-2 rtl:space-x-reverse cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>הורדת קובץ</span>
                </button>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 font-bold text-sm flex items-center space-x-2 rtl:space-x-reverse cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>פתח קובץ</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
