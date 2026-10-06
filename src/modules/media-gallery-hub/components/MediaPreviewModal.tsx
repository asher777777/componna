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
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  FileVideo,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useMediaGallery } from '../context/MediaGalleryContext';
import { FileCompressionService } from '../services/fileCompressionService';
import { MediaItem } from '../types';

export const MediaPreviewModal: React.FC = () => {
  const {
    filteredItems,
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
  const [mediaError, setMediaError] = useState(false);

  // Video playback speed
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Image Zoom & Rotate
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  // Rename state in modal
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Reset viewer adjustments on item change
  useEffect(() => {
    if (previewItem) {
      setEditNameValue(previewItem.name);
      setIsEditingName(false);
      setZoomLevel(1);
      setRotation(0);
      setMediaError(false);
      setPlaybackSpeed(1);
    }
  }, [previewItem?.id, previewItem?.name, previewItem?.url]);

  useEffect(() => {
    if (isEditingName && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isEditingName]);

  // Gallery Navigation (Previous / Next)
  const currentIndex = previewItem
    ? filteredItems.findIndex((it) => it.id === previewItem.id)
    : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < filteredItems.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      setPreviewItem(filteredItems[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setPreviewItem(filteredItems[currentIndex + 1]);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditingName) return;
      if (e.key === 'Escape') {
        setPreviewItem(null);
      } else if (e.key === 'ArrowRight') {
        // In RTL, right is previous in chronological list
        if (hasPrev) handlePrev();
      } else if (e.key === 'ArrowLeft') {
        if (hasNext) handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, hasPrev, hasNext, isEditingName]);

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

  // Speed toggle for video
  const handleToggleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const newSpeed = speeds[nextIdx];
    setPlaybackSpeed(newSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
  };

  // Fetch text/code content if the item is text/code/json/csv
  useEffect(() => {
    if (!previewItem) {
      setTextContent(null);
      return;
    }

    if (
      previewItem.type === 'code' ||
      previewItem.mimeType?.includes('text') ||
      previewItem.mimeType?.includes('json')
    ) {
      setIsLoadingText(true);
      fetch(previewItem.url)
        .then((res) => res.text())
        .then((txt) => {
          setTextContent(txt.slice(0, 50000));
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

  const isVideo =
    previewItem.type === 'video' ||
    previewItem.mimeType?.startsWith('video/') ||
    Boolean(previewItem.name.match(/\.(mp4|webm|mov|mkv|m4v|3gp|flv)$/i));

  const isImage =
    previewItem.type === 'image' ||
    previewItem.mimeType?.startsWith('image/') ||
    Boolean(previewItem.name.match(/\.(png|jpe?g|webp|gif|svg|avif|bmp|ico)$/i));

  const isAudio =
    previewItem.type === 'audio' ||
    previewItem.mimeType?.startsWith('audio/') ||
    Boolean(previewItem.name.match(/\.(mp3|wav|ogg|aac|m4a|flac)$/i));

  const isPdf =
    previewItem.type === 'pdf' ||
    previewItem.mimeType?.includes('pdf') ||
    previewItem.name.toLowerCase().endsWith('.pdf');

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
        <bdi className={`font-black text-sm sm:text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
          {baseName}
        </bdi>
        <span
          dir="ltr"
          className={`font-mono text-xs px-2 py-0.5 rounded font-bold ${
            isLight ? 'bg-slate-200 text-slate-800' : 'bg-slate-800 text-slate-300'
          }`}
        >
          .{ext}
        </span>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-xl animate-fade-in select-none"
      dir="rtl"
    >
      <div
        className={`w-full max-w-6xl h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-up border ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-slate-900 border-slate-700/80 text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.8)]'
        }`}
      >
        {/* Top Header */}
        <div
          className={`p-3.5 sm:p-4 border-b flex items-center justify-between flex-shrink-0 z-10 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/90 border-slate-700/80'
          }`}
        >
          {/* File details & Bidi Title */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0 flex-1">
            <span className="text-2xl flex-shrink-0">
              {isVideo
                ? '🎬'
                : isImage
                ? '🖼️'
                : isAudio
                ? '🎙️'
                : isPdf
                ? '📄'
                : previewItem.type === 'document'
                ? '📝'
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
                    className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                    title="שמור שם"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
                    className="p-1.5 rounded-lg bg-slate-600 hover:bg-slate-500 text-white cursor-pointer"
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
                    className="opacity-70 group-hover/hdr:opacity-100 p-1 text-slate-400 hover:text-amber-500 cursor-pointer transition-opacity"
                    title="שנה שם קובץ"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div
                className={`flex items-center gap-2 text-xs font-mono truncate mt-0.5 ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                <span>{FileCompressionService.formatBytes(previewItem.sizeBytes)}</span>
                <span>•</span>
                <span>{previewItem.mimeType || 'קובץ מדיה'}</span>
                {currentIndex >= 0 && (
                  <>
                    <span>•</span>
                    <span className="font-semibold text-amber-500">
                      קובץ {currentIndex + 1} מתוך {filteredItems.length}
                    </span>
                  </>
                )}
                {previewItem.folderName && (
                  <>
                    <span>•</span>
                    <span className="text-indigo-400 font-semibold">📁 {previewItem.folderName}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Top Right: Prev/Next Quick Navigation & Close */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {/* Prev button */}
            <button
              type="button"
              onClick={handlePrev}
              disabled={!hasPrev}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                hasPrev
                  ? isLight
                    ? 'hover:bg-slate-200 text-slate-700'
                    : 'hover:bg-slate-700 text-slate-200'
                  : 'opacity-30 cursor-not-allowed text-slate-500'
              }`}
              title="הקובץ הקודם (חץ ימינה)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Next button */}
            <button
              type="button"
              onClick={handleNext}
              disabled={!hasNext}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                hasNext
                  ? isLight
                    ? 'hover:bg-slate-200 text-slate-700'
                    : 'hover:bg-slate-700 text-slate-200'
                  : 'opacity-30 cursor-not-allowed text-slate-500'
              }`}
              title="הקובץ הבא (חץ שמאלה)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => setPreviewItem(null)}
              className={`p-2 rounded-xl transition-colors cursor-pointer mr-2 rtl:mr-0 rtl:ml-2 ${
                isLight
                  ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="סגור תצוגה (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media Viewer Area - Full Height & Crisp Aspect Ratio */}
        <div className="flex-1 min-h-0 bg-black flex items-center justify-center p-2 sm:p-4 overflow-hidden relative group/viewer">
          {/* Floating Left Arrow Overlay */}
          {hasPrev && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-amber-500 hover:text-black text-white flex items-center justify-center shadow-2xl backdrop-blur-md opacity-0 group-hover/viewer:opacity-100 transition-all cursor-pointer border border-white/10"
              title="הקובץ הקודם"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Floating Right Arrow Overlay */}
          {hasNext && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-amber-500 hover:text-black text-white flex items-center justify-center shadow-2xl backdrop-blur-md opacity-0 group-hover/viewer:opacity-100 transition-all cursor-pointer border border-white/10"
              title="הקובץ הבא"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* VIDEO VIEWER */}
          {isVideo && (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <video
                ref={videoRef}
                key={previewItem.url}
                src={previewItem.url}
                controls
                autoPlay
                playsInline
                preload="auto"
                className="w-full h-full max-h-full rounded-2xl object-contain shadow-2xl bg-black"
                onError={() => setMediaError(true)}
              />

              {/* Video Floating Controls Pill */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black/75 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 text-white">
                <button
                  type="button"
                  onClick={handleToggleSpeed}
                  className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold hover:bg-white/20 transition-colors"
                  title="מהירות ניגון"
                >
                  {playbackSpeed}x
                </button>
                <a
                  href={previewItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                  title="פתח וידאו בחלון נפרד"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {mediaError && (
                <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-4 z-30">
                  <FileVideo className="w-16 h-16 text-amber-500 animate-pulse" />
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white">לא ניתן לנגן וידאו זה ישירות בדפדפן</h4>
                    <p className="text-xs text-slate-400 max-w-md">
                      ייתכן שהקובץ דורש קודק מיוחד או חסום בגלל הגדרות אבטחת דפדפן (CORS).
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={previewItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs shadow-lg"
                    >
                      פתח בחלון חדש
                    </a>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs border border-slate-700"
                    >
                      הורד למחשב
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* IMAGE VIEWER */}
          {isImage && (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              {/* Floating Image Control Toolbar */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-black/75 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 text-white shadow-xl">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3))}
                  className="p-1.5 rounded-xl hover:bg-white/20 text-slate-200 hover:text-white"
                  title="הגדל תמונה (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}
                  className="p-1.5 rounded-xl hover:bg-white/20 text-slate-200 hover:text-white"
                  title="הקטן תמונה (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoomLevel(1);
                    setRotation(0);
                  }}
                  className="px-2 py-1 rounded-xl hover:bg-white/20 text-[11px] font-mono text-slate-200 hover:text-white"
                  title="איפוס גודל"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1.5 rounded-xl hover:bg-white/20 text-slate-200 hover:text-white"
                  title="סובב 90 מעלות"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <a
                  href={previewItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl hover:bg-white/20 text-slate-200 hover:text-white"
                  title="פתח ברזולוציה מלאה בחלון נפרד"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <img
                key={previewItem.url}
                src={previewItem.url}
                alt={previewItem.name}
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease-out',
                }}
                className="w-full h-full max-h-full rounded-2xl object-contain shadow-2xl select-none"
                onError={() => setMediaError(true)}
              />

              {mediaError && (
                <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-3 z-30">
                  <div className="text-4xl">🖼️</div>
                  <h4 className="text-sm font-bold text-white">לא ניתן לטעון את התמונה</h4>
                  <a
                    href={previewItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs"
                  >
                    פתח ישירות
                  </a>
                </div>
              )}
            </div>
          )}

          {/* AUDIO VIEWER */}
          {isAudio && (
            <div className="flex flex-col items-center justify-center space-y-4 w-full max-w-lg p-6 bg-slate-900/95 border border-yellow-500/30 rounded-3xl shadow-2xl">
              <div className="w-20 h-20 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400 animate-pulse shadow-inner">
                <Music className="w-10 h-10" />
              </div>
              <div className="text-center w-full">
                <div className="font-bold text-white text-base">{previewItem.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">קובץ שמע וקול</div>
              </div>

              {(previewItem.metadata?.subtitleText ||
                previewItem.metadata?.scriptText ||
                previewItem.description) && (
                <div className="w-full bg-slate-950/80 border border-yellow-500/30 rounded-2xl p-4 text-right shadow-inner" dir="rtl">
                  <div className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <span>💬</span>
                    <span>כתוביות ותמליל הקריינות:</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium select-text whitespace-pre-wrap">
                    {previewItem.metadata?.subtitleText ||
                      previewItem.metadata?.scriptText ||
                      previewItem.description}
                  </p>
                </div>
              )}

              <audio src={previewItem.url} controls autoPlay className="w-full" />
            </div>
          )}

          {/* PDF VIEWER */}
          {isPdf && (
            <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden bg-slate-950 flex flex-col items-center justify-center">
              <iframe
                src={`${previewItem.url}#toolbar=1`}
                className="w-full h-full min-h-[400px] rounded-2xl border border-slate-800"
                title={previewItem.name}
              />
            </div>
          )}

          {/* GENERIC DOCUMENT */}
          {!isVideo && !isImage && !isAudio && !isPdf && previewItem.type === 'document' && (
            <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-slate-900/90 border border-blue-500/30 rounded-3xl text-center max-w-md">
              <div className="w-20 h-20 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
                <FileText className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{previewItem.name}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  מסמך ({FileCompressionService.formatBytes(previewItem.sizeBytes)})
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

          {/* CODE / TEXT */}
          {previewItem.type === 'code' && (
            <div className="w-full h-full max-h-[60vh] bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-auto text-left font-mono text-xs text-emerald-400" dir="ltr">
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

          {/* OTHER BINARY */}
          {!isVideo && !isImage && !isAudio && !isPdf && previewItem.type !== 'document' && previewItem.type !== 'code' && previewItem.type !== 'archive' && (
            <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-slate-900/90 border border-slate-800 rounded-3xl text-center max-w-md">
              <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <HardDrive className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{previewItem.name}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  קובץ ({FileCompressionService.formatBytes(previewItem.sizeBytes)})
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

        {/* Info & Action Bar */}
        <div
          className={`p-3.5 sm:p-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0 ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-700'
              : 'bg-slate-950/95 border-slate-800 text-slate-300'
          }`}
        >
          {/* Metadata tags */}
          <div className="flex flex-wrap items-center gap-3 text-slate-500">
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
          <div className="flex items-center space-x-2 rtl:space-x-reverse flex-wrap gap-y-2">
            {/* Convert Button */}
            {(isImage || previewItem.type === 'code' || previewItem.type === 'document') && (
              <button
                onClick={handleOpenConverter}
                className={`px-3 py-2 rounded-xl font-semibold flex items-center space-x-1.5 rtl:space-x-reverse transition-all cursor-pointer border ${
                  isLight
                    ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-200'
                    : 'bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 border-indigo-700/60'
                }`}
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
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

            {/* Share WhatsApp */}
            <button
              onClick={() => {
                const text = encodeURIComponent(`מצורף קובץ: ${previewItem.name}\n${previewItem.url}`);
                window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
              }}
              className={`px-3 py-2 rounded-xl font-semibold flex items-center space-x-1.5 rtl:space-x-reverse transition-all cursor-pointer border ${
                isLight
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border-emerald-800/60'
              }`}
              title="שתף בוואטסאפ"
            >
              <span>💬</span>
              <span>וואטסאפ</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyUrl}
              className={`px-3 py-2 rounded-xl font-semibold flex items-center space-x-1.5 rtl:space-x-reverse transition-all cursor-pointer border ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="העתק קישור ישיר לקובץ"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'הועתק!' : 'העתק קישור'}</span>
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black flex items-center space-x-1.5 rtl:space-x-reverse shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>הורד קובץ</span>
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