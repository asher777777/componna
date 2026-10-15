import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Trash2,
  Pencil,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { MediaItem } from '../types';
import { FileCompressionService } from '../services/fileCompressionService';

interface MobileMediaPreviewModalProps {
  items: MediaItem[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onEditImage?: (item: MediaItem) => void;
  onDocToLandingPage?: (item: MediaItem) => void;
  onDelete?: (id: string) => void;
  theme?: 'dark' | 'light';
}

export const MobileMediaPreviewModal: React.FC<MobileMediaPreviewModalProps> = ({
  items,
  initialIndex,
  isOpen,
  onClose,
  onEditImage,
  onDocToLandingPage,
  onDelete,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Touch Swipe tracking
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoomLevel(1);
  }, [initialIndex, isOpen]);

  if (!isOpen || items.length === 0) return null;

  const currentItem = items[currentIndex] || items[0];

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setZoomLevel(1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setZoomLevel(1);
    }
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchStartYRef.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartXRef.current - touchEndX;

    // RTL swipe: diffX > 0 is swipe left (next), diffX < 0 is swipe right (prev)
    if (Math.abs(diffX) > minSwipeDistance) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  const handleResetZoom = () => setZoomLevel(1);

  const handleDownload = () => {
    FileCompressionService.downloadMedia(currentItem.url, currentItem.name);
  };

  const isImage =
    currentItem.type === 'image' ||
    currentItem.mimeType?.startsWith('image/') ||
    Boolean(currentItem.name.match(/\.(png|jpe?g|webp|gif|svg|avif|bmp)$/i));

  const isVideo =
    currentItem.type === 'video' ||
    currentItem.mimeType?.startsWith('video/') ||
    Boolean(currentItem.name.match(/\.(mp4|webm|mov|mkv|m4v)$/i));

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95 text-white animate-fade-in touch-none select-none"
      dir="rtl"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top action header */}
      <div className="h-14 px-4 bg-black/50 backdrop-blur-md flex items-center justify-between border-b border-white/10 z-10">
        <div className="flex items-center space-x-2 rtl:space-x-reverse min-w-0">
          <span className="text-xs text-slate-400 font-mono">
            {currentIndex + 1} / {items.length}
          </span>
          <h3 className="text-sm font-bold truncate max-w-[180px] sm:max-w-xs" dir="auto">
            {currentItem.name}
          </h3>
        </div>

        <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
          {/* Zoom controls for images */}
          {isImage && (
            <>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-2 rounded-xl text-slate-300 hover:text-white"
                title="הגדל"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              {zoomLevel > 1 && (
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="p-2 rounded-xl text-amber-400 hover:text-amber-300"
                  title="איפוס הגדלה"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={handleDownload}
            className="p-2 rounded-xl text-slate-300 hover:text-white"
            title="הורד קובץ"
          >
            <Download className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-red-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Preview Center Area */}
      <div className="flex-1 relative flex items-center justify-center p-2 overflow-hidden">
        {/* Navigation arrows (desktop / tablet) */}
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute right-4 z-20 p-2.5 rounded-full bg-black/60 border border-white/20 text-white hover:bg-black/90 cursor-pointer hidden sm:flex"
            title="הקודם"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {currentIndex < items.length - 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute left-4 z-20 p-2.5 rounded-full bg-black/60 border border-white/20 text-white hover:bg-black/90 cursor-pointer hidden sm:flex"
            title="הבא"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Media display */}
        <div
          className="max-w-full max-h-full flex items-center justify-center transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {isImage ? (
            <img
              src={currentItem.url}
              alt={currentItem.name}
              className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
            />
          ) : isVideo ? (
            <video
              src={currentItem.url}
              controls
              autoPlay
              playsInline
              className="max-h-[75vh] max-w-full rounded-lg shadow-2xl"
            />
          ) : currentItem.type === 'pdf' ? (
            <iframe
              src={`${currentItem.url}#toolbar=0`}
              className="w-[90vw] h-[70vh] rounded-lg border border-slate-700 bg-white"
              title={currentItem.name}
            />
          ) : (
            <div className="p-8 text-center space-y-4 max-w-sm">
              <h4 className="font-bold text-lg">{currentItem.name}</h4>
              <p className="text-xs text-slate-400">
                {FileCompressionService.formatBytes(currentItem.sizeBytes)} • {currentItem.type}
              </p>
              <button
                type="button"
                onClick={handleDownload}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-sm shadow-lg mx-auto"
              >
                הורד לצפייה
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar for quick mobile actions */}
      <div className="h-16 px-4 bg-black/70 backdrop-blur-md border-t border-white/10 flex items-center justify-around z-10">
        {isImage && onEditImage && (
          <button
            type="button"
            onClick={() => onEditImage(currentItem)}
            className="flex flex-col items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-bold"
          >
            <Pencil className="w-5 h-5" />
            <span>ערוך תמונה</span>
          </button>
        )}

        {onDocToLandingPage && (
          <button
            type="button"
            onClick={() => onDocToLandingPage(currentItem)}
            className="flex flex-col items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-bold"
          >
            <Sparkles className="w-5 h-5" />
            <span>המר לדף נחיתה</span>
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={() => {
              onDelete(currentItem.id);
              onClose();
            }}
            className="flex flex-col items-center gap-1 text-[11px] text-red-400 hover:text-red-300 font-bold"
          >
            <Trash2 className="w-5 h-5" />
            <span>מחק</span>
          </button>
        )}
      </div>
    </div>
  );
};
