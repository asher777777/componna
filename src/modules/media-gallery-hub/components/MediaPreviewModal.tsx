import React, { useState, useEffect, useRef } from 'react';
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
  FolderInput,
  Folder,
  Layers,
  FileText,
  Archive,
  Code2,
  ExternalLink,
  Pencil,
} from 'lucide-react';
import { useMediaGallery } from '../context/MediaGalleryContext';
import { FileCompressionService } from '../services/fileCompressionService';

export const MediaPreviewModal: React.FC = () => {
  const {
    previewItem,
    setPreviewItem,
    setConverterItem,
    deleteMediaItems,
    renameMediaItem,
    theme,
    setIsMoveModalOpen,
    setItemsToMove,
  } = useMediaGallery();

  const isLight = theme === 'light';
  const [copied, setCopied] = useState(false);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoadingText, setIsLoadingText] = useState(false);

  // Rename state in modal
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (previewItem) {
      setEditNameValue(previewItem.name);
      setIsEditingName(false);
    }
  }, [previewItem?.id, previewItem?.name]);

  useEffect(() => {
    if (isEditingName && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isEditingName]);

  const handleSaveRename = async () => {
    if (!previewItem) return;
    const trimmed = editNameValue.trim();
    if (trimmed && trimmed !== previewItem.name) {
      await renameMediaItem(previewItem.id, trimmed);
    }
    setIsEditingName(false);
  };

  const handleKeyDownRename = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveRename();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditingName(false);
    }
  };

  // Fetch text/code content if the item is text/code/json/csv
  useEffect(() => {
    if (!previewItem) {
      setTextContent(null);
      return;
    }

    if (previewItem.type === 'code' || previewItem.mimeType?.includes('text') || previewItem.mimeType?.includes('json')) {
      setIsLoadingText(true);
      fetch(previewItem.url)
        .then((res) => res.text())
        .then((txt) => {
          setTextContent(txt.slice(0, 50000)); // preview up to 50KB
        })
        .catch(() => {
          setTextContent(null);
        })
        .finally(() => setIsLoadingText(false));
    } else {
      setTextContent(null);
    }
  }, [previewItem]);

  if (!previewItem) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(previewItem.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    FileCompressionService.downloadMedia(previewItem.url, previewItem.name);
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

  const handleMoveToFolder = () => {
    setItemsToMove([previewItem.id]);
    setIsMoveModalOpen(true);
  };

  const isPdf = previewItem.mimeType?.includes('pdf') || previewItem.name.toLowerCase().endsWith('.pdf');

  const renderBidiHeader = (name: string) => {
    const lastDotIndex = name.lastIndexOf('.');
    if (lastDotIndex <= 0 || lastDotIndex === name.length - 1) {
      return (
        <span className="truncate" dir="auto">
          {name}
        </span>
      );
    }
    const baseName = name.slice(0, lastDotIndex);
    const ext = name.slice(lastDotIndex + 1);
    return (
      <div className="flex items-baseline gap-1.5 flex-wrap" dir="rtl">
        <bdi className={`font-bold text-sm sm:text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>{baseName}</bdi>
        <span
          dir="ltr"
          className={`font-mono text-xs px-1.5 py-0.5 rounded font-semibold ${
            isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-700 text-slate-300'
          }`}
        >
          .{ext}
        </span>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in"
      dir="rtl"
    >
      <div
        className={`w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-up border ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-slate-900 border-slate-700 text-slate-100'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/90 border-slate-700/80'
          }`}
        >
          <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0 flex-1">
            <span className="text-xl flex-shrink-0">
              {previewItem.type === 'video'
                ? '🎬'
                : previewItem.type === 'image'
                ? '🖼️'
                : previewItem.type === 'audio'
                ? '🎙️'
                : previewItem.type === 'document'
                ? '📄'
                : previewItem.type === 'archive'
                ? '📦'
                : previewItem.type === 'code'
                ? '💻'
                : '📁'}
            </span>
            <div className="min-w-0 flex-1">
              {isEditingName ? (
                <div className="flex items-center space-x-1.5 rtl:space-x-reverse max-w-md">
                  <input
                    ref={renameInputRef}
                    type="text"
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    onKeyDown={handleKeyDownRename}
                    className={`w-full text-xs sm:text-sm px-2.5 py-1 rounded-xl border focus:outline-none ${
                      isLight
                        ? 'bg-white border-amber-500 text-slate-900'
                        : 'bg-slate-950 border-yellow-500 text-white'
                    }`}
                    dir="auto"
                  />
                  <button
                    type="button"
                    onClick={handleSaveRename}
                    className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                    title="שמור שם"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
                    className="p-1.5 rounded-lg bg-slate-600 hover:bg-slate-500 text-white"
                    title="בטל"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 rtl:space-x-reverse group/hdr">
                  {renderBidiHeader(previewItem.name)}
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="opacity-70 group-hover/hdr:opacity-100 p-1 text-slate-400 hover:text-amber-500"
                    title="שנה שם קובץ"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className={`flex items-center gap-2 text-xs font-mono truncate mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                <span>{previewItem.mimeType}</span>
                {previewItem.sourceModuleLabel && (
                  <>
                    <span>•</span>
                    <span className={isLight ? 'text-amber-700 font-semibold' : 'text-yellow-400'}>{previewItem.sourceModuleLabel}</span>
                  </>
                )}
                {previewItem.folderName && (
                  <>
                    <span>•</span>
                    <span className="text-indigo-500 font-semibold">📁 {previewItem.folderName}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setPreviewItem(null)}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Viewer Area */}
        <div className="flex-1 bg-black/95 flex items-center justify-center p-4 min-h-[300px] sm:min-h-[420px] max-h-[55vh] overflow-auto relative">
          {/* VIDEO */}
          {previewItem.type === 'video' && (
            <video
              src={previewItem.url}
              controls
              autoPlay
              className="max-w-full max-h-[50vh] rounded-xl object-contain shadow-2xl"
            />
          )}

          {/* IMAGE */}
          {previewItem.type === 'image' && (
            <img
              src={previewItem.url}
              alt={previewItem.name}
              className="max-w-full max-h-[50vh] rounded-xl object-contain shadow-2xl"
            />
          )}

          {/* AUDIO */}
          {previewItem.type === 'audio' && (
            <div className="flex flex-col items-center justify-center space-y-4 w-full max-w-lg p-6 bg-slate-900/90 border border-yellow-500/30 rounded-3xl shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400 animate-pulse shadow-inner">
                <Music className="w-8 h-8" />
              </div>
              <div className="text-center w-full">
                <div className="font-bold text-white text-base">{previewItem.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">קובץ שמע וקול</div>
              </div>

              {/* Spoken Subtitle / Narration Box */}
              {(previewItem.metadata?.subtitleText || previewItem.metadata?.scriptText || previewItem.description) && (
                <div className="w-full bg-slate-950/80 border border-yellow-500/30 rounded-2xl p-4 text-right shadow-inner" dir="rtl">
                  <div className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <span>💬</span>
                    <span>כתוביות ותמליל הקריינות:</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium select-text whitespace-pre-wrap">
                    {previewItem.metadata?.subtitleText || previewItem.metadata?.scriptText || previewItem.description}
                  </p>
                </div>
              )}

              <audio src={previewItem.url} controls autoPlay className="w-full" />
            </div>
          )}

          {/* PDF DOCUMENT */}
          {previewItem.type === 'document' && isPdf && (
            <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden bg-slate-950 flex flex-col items-center justify-center">
              <iframe
                src={`${previewItem.url}#toolbar=1`}
                className="w-full h-full min-h-[400px] rounded-xl border border-slate-800"
                title={previewItem.name}
              />
            </div>
          )}

          {/* GENERIC DOCUMENT */}
          {previewItem.type === 'document' && !isPdf && (
            <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-slate-900/90 border border-blue-500/30 rounded-3xl text-center max-w-md">
              <div className="w-20 h-20 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
                <FileText className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{previewItem.name}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  מסמך {FileCompressionService.formatBytes(previewItem.sizeBytes)}
                </p>
              </div>
              <button
                onClick={handleDownload}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-2 rtl:space-x-reverse shadow-lg cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>הורד לצפייה במחשב</span>
              </button>
            </div>
          )}

          {/* CODE / DATA / TEXT PREVIEW */}
          {previewItem.type === 'code' && (
            <div className="w-full h-full max-h-[50vh] bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-auto text-left font-mono text-xs text-emerald-400" dir="ltr">
              {isLoadingText ? (
                <div className="text-center text-slate-400 py-10">טוען תוכן קובץ...</div>
              ) : textContent ? (
                <pre className="whitespace-pre-wrap break-all">{textContent}</pre>
              ) : (
                <div className="text-center text-slate-400 py-10">
                  <Code2 className="w-12 h-12 mx-auto text-pink-400 mb-2" />
                  <div>קובץ קוד / נתונים ({FileCompressionService.formatBytes(previewItem.sizeBytes)})</div>
                </div>
              )}
            </div>
          )}

          {/* ARCHIVE */}
          {previewItem.type === 'archive' && (
            <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-slate-900/90 border border-purple-500/30 rounded-3xl text-center max-w-md">
              <div className="w-20 h-20 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-inner">
                <Archive className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{previewItem.name}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  ארכיון דחוס ({FileCompressionService.formatBytes(previewItem.sizeBytes)})
                </p>
              </div>
              <button
                onClick={handleDownload}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-2 rtl:space-x-reverse shadow-lg cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>הורד וחלץ ארכיון</span>
              </button>
            </div>
          )}

          {/* OTHER */}
          {previewItem.type === 'other' && (
            <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-slate-900/90 border border-slate-800 rounded-3xl text-center max-w-md">
              <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <HardDrive className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{previewItem.name}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  קובץ בינארי ({FileCompressionService.formatBytes(previewItem.sizeBytes)})
                </p>
              </div>
              <button
                onClick={handleDownload}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center space-x-2 rtl:space-x-reverse shadow-lg cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>הורד קובץ</span>
              </button>
            </div>
          )}
        </div>

        {/* Info & Metadata Bar */}
        <div
          className={`p-4 border-t flex flex-wrap items-center justify-between gap-4 text-xs ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950/90 border-slate-800 text-slate-300'
          }`}
        >
          <div className="flex flex-wrap items-center gap-4 text-slate-500">
            <span className="flex items-center space-x-1.5 rtl:space-x-reverse">
              <HardDrive className={`w-3.5 h-3.5 ${isLight ? 'text-amber-600' : 'text-yellow-400'}`} />
              <span className={`font-mono font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                {FileCompressionService.formatBytes(previewItem.sizeBytes)}
              </span>
            </span>

            <span className="flex items-center space-x-1.5 rtl:space-x-reverse">
              <Calendar className="w-3.5 h-3.5" />
              <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>
                {new Date(previewItem.createdAt).toLocaleDateString('he-IL')}
              </span>
            </span>

            {previewItem.tags && previewItem.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {previewItem.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium border ${
                      isLight
                        ? 'bg-amber-50 text-amber-900 border-amber-300'
                        : 'bg-slate-800 text-yellow-300 border-yellow-500/30'
                    }`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {/* Convert Button */}
            {(previewItem.type === 'image' || previewItem.type === 'code' || previewItem.type === 'document') && (
              <button
                onClick={handleOpenConverter}
                className={`px-3.5 py-2 rounded-xl font-semibold flex items-center space-x-1.5 rtl:space-x-reverse transition-all cursor-pointer border ${
                  isLight
                    ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-200'
                    : 'bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 border-indigo-700/60'
                }`}
              >
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>המר / דחוס</span>
              </button>
            )}

            {/* Move to Folder */}
            <button
              onClick={handleMoveToFolder}
              className={`px-3 py-2 rounded-xl font-semibold flex items-center space-x-1.5 rtl:space-x-reverse transition-all cursor-pointer border ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-amber-800 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-yellow-400 border-slate-700'
              }`}
              title="העבר לתיקייה"
            >
              <FolderInput className="w-4 h-4" />
              <span>תיקייה</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyUrl}
              className={`px-3 py-2 rounded-xl font-semibold flex items-center space-x-1.5 rtl:space-x-reverse transition-all cursor-pointer border ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="העתק קישור לקובץ"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'הועתק!' : 'העתק קישור'}</span>
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold flex items-center space-x-1.5 rtl:space-x-reverse shadow transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>הורד</span>
            </button>

            {/* Delete */}
            <button
              onClick={handleDelete}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isLight
                  ? 'text-red-700 hover:bg-red-50 border-red-200'
                  : 'text-red-400 hover:text-red-300 hover:bg-red-950/50 border-red-900/40'
              }`}
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