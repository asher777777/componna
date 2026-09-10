import React, { useState } from 'react';
import {
  X,
  HardDrive,
  Calendar,
  Layers,
  Folder,
  Download,
  Sparkles,
  FolderInput,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  FileVideo,
  Image as ImageIcon,
  Music,
  FileText,
  Archive,
  Code2,
  Eye,
} from 'lucide-react';
import { useMediaGallery } from '../context/MediaGalleryContext';
import { FileCompressionService } from '../services/fileCompressionService';
import { MediaItem } from '../types';

export const MediaFileInspector: React.FC = () => {
  const {
    focusedItem,
    setFocusedItem,
    isInspectorOpen,
    setIsInspectorOpen,
    setPreviewItem,
    setConverterItem,
    setIsMoveModalOpen,
    setItemsToMove,
    deleteMediaItems,
  } = useMediaGallery();

  const [copied, setCopied] = useState(false);

  if (!isInspectorOpen || !focusedItem) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(focusedItem.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    FileCompressionService.downloadMedia(focusedItem.url, focusedItem.name);
  };

  const handleDelete = async () => {
    if (confirm(`האם למחוק את "${focusedItem.name}"?`)) {
      await deleteMediaItems([focusedItem.id]);
      setFocusedItem(null);
    }
  };

  const handleMove = () => {
    setItemsToMove([focusedItem.id]);
    setIsMoveModalOpen(true);
  };

  const handleConvert = () => {
    setConverterItem(focusedItem);
  };

  return (
    <aside
      className="w-72 lg:w-80 flex-shrink-0 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between overflow-y-auto custom-scrollbar p-4 space-y-4"
      dir="rtl"
    >
      {/* Inspector Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-bold text-slate-300">
          <Eye className="w-4 h-4 text-yellow-400" />
          <span>פרטי קובץ</span>
        </div>
        <button
          type="button"
          onClick={() => setIsInspectorOpen(false)}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Preview Thumbnail Box */}
      <div className="w-full h-44 rounded-2xl bg-black/80 border border-slate-800 flex items-center justify-center overflow-hidden relative group">
        {focusedItem.type === 'video' && (
          <video src={focusedItem.url} className="w-full h-full object-cover" />
        )}
        {focusedItem.type === 'image' && (
          <img src={focusedItem.url} alt={focusedItem.name} className="w-full h-full object-contain" />
        )}
        {focusedItem.type === 'audio' && (
          <div className="flex flex-col items-center justify-center space-y-2 text-yellow-400">
            <Music className="w-10 h-10 animate-pulse" />
            <span className="text-[11px] text-slate-400 font-bold">שמע</span>
          </div>
        )}
        {focusedItem.type === 'document' && (
          <div className="flex flex-col items-center justify-center space-y-2 text-blue-400">
            <FileText className="w-10 h-10" />
            <span className="text-[11px] text-slate-400 font-bold">מסמך</span>
          </div>
        )}
        {focusedItem.type === 'archive' && (
          <div className="flex flex-col items-center justify-center space-y-2 text-purple-400">
            <Archive className="w-10 h-10" />
            <span className="text-[11px] text-slate-400 font-bold">ארכיון ZIP</span>
          </div>
        )}
        {focusedItem.type === 'code' && (
          <div className="flex flex-col items-center justify-center space-y-2 text-pink-400">
            <Code2 className="w-10 h-10" />
            <span className="text-[11px] text-slate-400 font-bold">קוד ונתונים</span>
          </div>
        )}
        {focusedItem.type === 'other' && (
          <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
            <HardDrive className="w-10 h-10" />
            <span className="text-[11px] text-slate-400 font-bold">קובץ</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setPreviewItem(focusedItem)}
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center space-x-1.5 rtl:space-x-reverse text-xs font-bold text-white transition-opacity cursor-pointer"
        >
          <ExternalLink className="w-4 h-4 text-yellow-400" />
          <span>פתח מציג מלא</span>
        </button>
      </div>

      {/* File Name & MIME */}
      <div className="space-y-1">
        <h4 className="font-bold text-sm text-white break-words" title={focusedItem.name}>
          {focusedItem.name}
        </h4>
        <div className="text-[11px] font-mono text-slate-400 truncate">{focusedItem.mimeType}</div>
      </div>

      {/* Details List */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 space-y-2.5 text-xs">
        {/* Size */}
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center space-x-1.5 rtl:space-x-reverse">
            <HardDrive className="w-3.5 h-3.5 text-yellow-400" />
            <span>נפח קובץ:</span>
          </span>
          <span className="font-mono text-white font-bold">
            {FileCompressionService.formatBytes(focusedItem.sizeBytes)}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center space-x-1.5 rtl:space-x-reverse">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>תאריך יצירה:</span>
          </span>
          <span className="text-slate-200">
            {new Date(focusedItem.createdAt).toLocaleDateString('he-IL')}
          </span>
        </div>

        {/* Source Component */}
        {focusedItem.sourceModuleLabel && (
          <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-900">
            <span className="flex items-center space-x-1.5 rtl:space-x-reverse">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>רכיב יוצר:</span>
            </span>
            <span className="text-yellow-400 font-bold truncate max-w-[140px]">
              {focusedItem.sourceModuleLabel}
            </span>
          </div>
        )}

        {/* Folder */}
        {focusedItem.folderName && (
          <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-900">
            <span className="flex items-center space-x-1.5 rtl:space-x-reverse">
              <Folder className="w-3.5 h-3.5 text-amber-400" />
              <span>תיקייה:</span>
            </span>
            <span className="text-white font-medium truncate max-w-[140px]">
              {focusedItem.folderName}
            </span>
          </div>
        )}
      </div>

      {/* Tags */}
      {focusedItem.tags && focusedItem.tags.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-slate-400">תגיות:</div>
          <div className="flex flex-wrap gap-1">
            {focusedItem.tags.map((tag) => (
              <span
                key={tag}
                className="bg-slate-950 text-slate-300 text-[10px] px-2 py-0.5 rounded-lg border border-slate-800"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons Grid */}
      <div className="pt-2 border-t border-slate-800 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 rtl:space-x-reverse border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-yellow-400" />
            <span>הורד</span>
          </button>

          {/* Move to Folder */}
          <button
            type="button"
            onClick={handleMove}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 rtl:space-x-reverse border border-slate-700 transition-colors cursor-pointer"
          >
            <FolderInput className="w-3.5 h-3.5 text-amber-400" />
            <span>העבר</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Convert */}
          <button
            type="button"
            onClick={handleConvert}
            className="p-2 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 text-indigo-200 text-xs font-semibold flex items-center justify-center space-x-1.5 rtl:space-x-reverse border border-indigo-800/40 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>המר / דחוס</span>
          </button>

          {/* Copy Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center space-x-1.5 rtl:space-x-reverse border border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'הועתק!' : 'קישור'}</span>
          </button>
        </div>

        {/* Delete */}
        <button
          type="button"
          onClick={handleDelete}
          className="w-full p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/30 text-xs font-semibold flex items-center justify-center space-x-1.5 rtl:space-x-reverse transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>מחק קובץ מהמאגר</span>
        </button>
      </div>
    </aside>
  );
};
