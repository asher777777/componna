import React from 'react';
import {
  X,
  Download,
  Trash2,
  Calendar,
  HardDrive,
  Copy,
  Check,
  Sparkles,
  Music,
  ExternalLink,
} from 'lucide-react';
import { useMediaGallery } from '../context/MediaGalleryContext';
import { ImageConverterService } from '../services/imageConverterService';

export const MediaPreviewModal: React.FC = () => {
  const { previewItem, setPreviewItem, setConverterItem, deleteMediaItems } = useMediaGallery();
  const [copied, setCopied] = React.useState(false);

  if (!previewItem) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(previewItem.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    ImageConverterService.downloadMedia(previewItem.url, previewItem.name);
  };

  const handleDelete = async () => {
    if (confirm(`האם אתה בטוח שברצונך למחוק את "${previewItem.name}"?`)) {
      await deleteMediaItems([previewItem.id]);
      setPreviewItem(null);
    }
  };

  const handleOpenConverter = () => {
    setConverterItem(previewItem);
    setPreviewItem(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in text-slate-100"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse truncate">
            <span className="text-xl">
              {previewItem.type === 'video' ? '🎬' : previewItem.type === 'image' ? '🖼️' : '🎙️'}
            </span>
            <div className="truncate">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">{previewItem.name}</h2>
              <p className="text-xs text-slate-400 font-mono truncate">{previewItem.mimeType}</p>
            </div>
          </div>

          <button
            onClick={() => setPreviewItem(null)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Viewer Area */}
        <div className="flex-1 bg-black/95 flex items-center justify-center p-4 min-h-[300px] sm:min-h-[420px] max-h-[55vh] overflow-hidden relative">
          {previewItem.type === 'video' && (
            <video
              src={previewItem.url}
              controls
              autoPlay
              className="max-w-full max-h-[50vh] rounded-xl object-contain shadow-2xl"
            />
          )}

          {previewItem.type === 'image' && (
            <img
              src={previewItem.url}
              alt={previewItem.name}
              className="max-w-full max-h-[50vh] rounded-xl object-contain shadow-2xl"
            />
          )}

          {previewItem.type === 'audio' && (
            <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-md p-6 bg-slate-900/90 border border-yellow-500/30 rounded-3xl shadow-2xl">
              <div className="w-20 h-20 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400 animate-pulse">
                <Music className="w-10 h-10" />
              </div>
              <div className="text-center">
                <div className="font-bold text-white text-base">{previewItem.name}</div>
                <div className="text-xs text-slate-400 mt-1">קובץ שמע</div>
              </div>
              <audio src={previewItem.url} controls autoPlay className="w-full" />
            </div>
          )}
        </div>

        {/* Info & Metadata Bar */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span className="flex items-center space-x-1.5 rtl:space-x-reverse">
              <HardDrive className="w-3.5 h-3.5 text-yellow-400" />
              <span>{ImageConverterService.formatBytes(previewItem.sizeBytes)}</span>
            </span>

            <span className="flex items-center space-x-1.5 rtl:space-x-reverse">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{new Date(previewItem.createdAt).toLocaleDateString('he-IL')}</span>
            </span>

            {previewItem.tags && previewItem.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {previewItem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-slate-800 text-yellow-300 text-[10px] px-2.5 py-0.5 rounded-full border border-yellow-500/30 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {previewItem.type === 'image' && (
              <button
                onClick={handleOpenConverter}
                className="px-3.5 py-2 rounded-xl bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/60 font-semibold flex items-center space-x-1.5 rtl:space-x-reverse transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>המר תמונה</span>
              </button>
            )}

            <button
              onClick={handleCopyUrl}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center space-x-1.5 rtl:space-x-reverse transition-all cursor-pointer"
              title="העתק קישור לקובץ"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'הועתק!' : 'העתק קישור'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-bold flex items-center space-x-1.5 rtl:space-x-reverse shadow transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>הורד</span>
            </button>

            <button
              onClick={handleDelete}
              className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/50 border border-red-900/40 transition-colors cursor-pointer"
              title="מחק קובץ"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};