import React, { useState, useEffect, useRef } from 'react';
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
  Pencil,
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
    renameMediaItem,
    theme,
  } = useMediaGallery();

  const isLight = theme === 'light';
  const [copied, setCopied] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusedItem) {
      setEditNameValue(focusedItem.name);
      setIsEditingName(false);
    }
  }, [focusedItem?.id, focusedItem?.name]);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  if (!isInspectorOpen || !focusedItem) return null;

  const handleStartRename = () => {
    setEditNameValue(focusedItem.name);
    setIsEditingName(true);
  };

  const handleSaveRename = async () => {
    const trimmed = editNameValue.trim();
    if (trimmed && trimmed !== focusedItem.name) {
      await renameMediaItem(focusedItem.id, trimmed);
    }
    setIsEditingName(false);
  };

  const handleCancelRename = () => {
    setEditNameValue(focusedItem.name);
    setIsEditingName(false);
  };

  const handleKeyDownRename = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveRename();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelRename();
    }
  };

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

  const renderBidiFileName = (name: string) => {
    const lastDotIndex = name.lastIndexOf('.');
    if (lastDotIndex <= 0 || lastDotIndex === name.length - 1) {
      return (
        <span className="truncate break-words" dir="auto">
          {name}
        </span>
      );
    }
    const baseName = name.slice(0, lastDotIndex);
    const ext = name.slice(lastDotIndex + 1);
    return (
      <div className="flex items-baseline gap-1.5 flex-wrap" dir="rtl">
        <bdi className="font-bold text-sm break-words">{baseName}</bdi>
        <span
          dir="ltr"
          className={`font-mono text-[11px] px-1.5 py-0.5 rounded font-semibold ${
            isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
          }`}
        >
          .{ext}
        </span>
      </div>
    );
  };

  return (
    <aside
      className={`w-72 lg:w-80 flex-shrink-0 border-r flex flex-col justify-between overflow-y-auto custom-scrollbar p-4 space-y-4 transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800 shadow-sm'
          : 'bg-slate-900/95 border-slate-800 text-slate-100'
      }`}
      dir="rtl"
    >
      {/* Inspector Top Bar */}
      <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-200 text-slate-700' : 'border-slate-800 text-slate-300'}`}>
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-bold">
          <Eye className={`w-4 h-4 ${isLight ? 'text-amber-600' : 'text-yellow-400'}`} />
          <span>פרטי קובץ</span>
        </div>
        <button
          type="button"
          onClick={() => setIsInspectorOpen(false)}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Preview Thumbnail Box */}
      <div
        className={`w-full h-44 rounded-2xl border flex items-center justify-center overflow-hidden relative group ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/80 border-slate-800'
        }`}
      >
        {focusedItem.type === 'video' && (
          <video src={focusedItem.url} className="w-full h-full object-cover" />
        )}
        {focusedItem.type === 'image' && (
          <img src={focusedItem.url} alt={focusedItem.name} className="w-full h-full object-contain" />
        )}
        {focusedItem.type === 'audio' && (
          <div className="flex flex-col items-center justify-center space-y-2 text-amber-500">
            <Music className="w-10 h-10 animate-pulse" />
            <span className="text-[11px] font-bold">שמע</span>
          </div>
        )}
        {focusedItem.type === 'document' && (
          <div className="flex flex-col items-center justify-center space-y-2 text-blue-500">
            <FileText className="w-10 h-10" />
            <span className="text-[11px] font-bold">מסמך</span>
          </div>
        )}
        {focusedItem.type === 'archive' && (
          <div className="flex flex-col items-center justify-center space-y-2 text-purple-500">
            <Archive className="w-10 h-10" />
            <span className="text-[11px] font-bold">ארכיון ZIP</span>
          </div>
        )}
        {focusedItem.type === 'code' && (
          <div className="flex flex-col items-center justify-center space-y-2 text-pink-500">
            <Code2 className="w-10 h-10" />
            <span className="text-[11px] font-bold">קוד ונתונים</span>
          </div>
        )}
        {focusedItem.type === 'other' && (
          <div className="flex flex-col items-center justify-center space-y-2 text-slate-500">
            <HardDrive className="w-10 h-10" />
            <span className="text-[11px] font-bold">קובץ</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setPreviewItem(focusedItem)}
          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center space-x-1.5 rtl:space-x-reverse text-xs font-bold text-white transition-opacity cursor-pointer"
        >
          <ExternalLink className="w-4 h-4 text-amber-400" />
          <span>פתח מציג מלא</span>
        </button>
      </div>

      {/* File Name & MIME with Edit Support */}
      <div className="space-y-1.5">
        {isEditingName ? (
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-400">עריכת שם קובץ:</div>
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <input
                ref={nameInputRef}
                type="text"
                value={editNameValue}
                onChange={(e) => setEditNameValue(e.target.value)}
                onKeyDown={handleKeyDownRename}
                className={`w-full text-xs px-2.5 py-1.5 rounded-xl border focus:outline-none ${
                  isLight
                    ? 'bg-slate-50 border-amber-500 text-slate-900'
                    : 'bg-slate-950 border-yellow-500 text-white'
                }`}
                dir="auto"
              />
              <button
                type="button"
                onClick={handleSaveRename}
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                title="שמור שם חדש"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleCancelRename}
                className="p-2 rounded-xl bg-slate-600 hover:bg-slate-500 text-white shadow-sm"
                title="בטל"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-1 group/name">
            <div className="min-w-0 flex-1">
              {renderBidiFileName(focusedItem.name)}
            </div>
            <button
              type="button"
              onClick={handleStartRename}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer opacity-70 group-hover/name:opacity-100 ${
                isLight ? 'hover:bg-slate-100 text-slate-600 hover:text-amber-600' : 'hover:bg-slate-800 text-slate-400 hover:text-yellow-400'
              }`}
              title="שנה שם קובץ"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className={`text-[11px] font-mono truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          {focusedItem.mimeType}
        </div>
      </div>

      {/* Details List */}
      <div
        className={`border rounded-2xl p-3 space-y-2.5 text-xs ${
          isLight
            ? 'bg-slate-50 border-slate-200 text-slate-700'
            : 'bg-slate-950/70 border-slate-800/80 text-slate-300'
        }`}
      >
        {/* Size */}
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1.5 rtl:space-x-reverse text-slate-500">
            <HardDrive className={`w-3.5 h-3.5 ${isLight ? 'text-amber-600' : 'text-yellow-400'}`} />
            <span>נפח קובץ:</span>
          </span>
          <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {FileCompressionService.formatBytes(focusedItem.sizeBytes)}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1.5 rtl:space-x-reverse text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>תאריך יצירה:</span>
          </span>
          <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>
            {new Date(focusedItem.createdAt).toLocaleDateString('he-IL')}
          </span>
        </div>

        {/* Source Component */}
        {focusedItem.sourceModuleLabel && (
          <div className={`flex items-center justify-between pt-1 border-t ${isLight ? 'border-slate-200' : 'border-slate-900'}`}>
            <span className="flex items-center space-x-1.5 rtl:space-x-reverse text-slate-500">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>רכיב יוצר:</span>
            </span>
            <span className={`font-bold truncate max-w-[140px] ${isLight ? 'text-amber-800' : 'text-yellow-400'}`}>
              {focusedItem.sourceModuleLabel}
            </span>
          </div>
        )}

        {/* Folder */}
        {focusedItem.folderName && (
          <div className={`flex items-center justify-between pt-1 border-t ${isLight ? 'border-slate-200' : 'border-slate-900'}`}>
            <span className="flex items-center space-x-1.5 rtl:space-x-reverse text-slate-500">
              <Folder className="w-3.5 h-3.5 text-amber-500" />
              <span>תיקייה:</span>
            </span>
            <span className={`font-medium truncate max-w-[140px] ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {focusedItem.folderName}
            </span>
          </div>
        )}
      </div>

      {/* Tags */}
      {focusedItem.tags && focusedItem.tags.length > 0 && (
        <div className="space-y-1.5">
          <div className={`text-[11px] font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>תגיות:</div>
          <div className="flex flex-wrap gap-1">
            {focusedItem.tags.map((tag) => (
              <span
                key={tag}
                className={`text-[10px] px-2 py-0.5 rounded-lg border ${
                  isLight
                    ? 'bg-slate-100 text-slate-700 border-slate-300'
                    : 'bg-slate-950 text-slate-300 border-slate-800'
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons Grid */}
      <div className={`pt-2 border-t space-y-2 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <div className="grid grid-cols-2 gap-2">
          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 rtl:space-x-reverse border transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-amber-500" />
            <span>הורד</span>
          </button>

          {/* Move to Folder */}
          <button
            type="button"
            onClick={handleMove}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 rtl:space-x-reverse border transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
            }`}
          >
            <FolderInput className="w-3.5 h-3.5 text-amber-500" />
            <span>העבר</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Convert */}
          <button
            type="button"
            onClick={handleConvert}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 rtl:space-x-reverse border transition-colors cursor-pointer ${
              isLight
                ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                : 'bg-indigo-950/70 hover:bg-indigo-900 text-indigo-200 border-indigo-800/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>המר / דחוס</span>
          </button>

          {/* Copy Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 rtl:space-x-reverse border transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'הועתק!' : 'קישור'}</span>
          </button>
        </div>

        {/* Delete */}
        <button
          type="button"
          onClick={handleDelete}
          className={`w-full p-2 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 rtl:space-x-reverse transition-colors cursor-pointer ${
            isLight
              ? 'text-red-700 hover:bg-red-50 border-red-200'
              : 'text-red-400 hover:text-red-300 hover:bg-red-950/40 border-red-900/30'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>מחק קובץ מהמאגר</span>
        </button>
      </div>
    </aside>
  );
};
