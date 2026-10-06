import React from 'react';
import {
  FileVideo,
  Image as ImageIcon,
  Music,
  FileText,
  Archive,
  Code2,
  HardDrive,
  FileSpreadsheet,
  Download,
  Share2,
  Sparkles,
  Pencil,
  Eye,
  CheckSquare,
  Square,
  MoreVertical,
} from 'lucide-react';
import { MediaItem } from '../types';
import { FileCompressionService } from '../services/fileCompressionService';

interface MobileMediaGalleryGridProps {
  items: MediaItem[];
  selectedIds: string[];
  viewMode: 'grid' | 'list';
  onToggleSelect: (id: string) => void;
  onPreview: (item: MediaItem) => void;
  onEditImage?: (item: MediaItem) => void;
  onEditDoc?: (item: MediaItem) => void;
  onDocToLandingPage?: (item: MediaItem) => void;
  theme?: 'dark' | 'light';
}

export const MobileMediaGalleryGrid: React.FC<MobileMediaGalleryGridProps> = ({
  items,
  selectedIds,
  viewMode,
  onToggleSelect,
  onPreview,
  onEditImage,
  onEditDoc,
  onDocToLandingPage,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  const renderIcon = (item: MediaItem) => {
    switch (item.type) {
      case 'video':
        return <FileVideo className="w-6 h-6 text-indigo-500" />;
      case 'image':
        return <ImageIcon className="w-6 h-6 text-emerald-500" />;
      case 'audio':
        return <Music className="w-6 h-6 text-amber-500" />;
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-6 h-6 text-emerald-500" />;
      case 'document':
        return <FileText className="w-6 h-6 text-blue-500" />;
      case 'archive':
        return <Archive className="w-6 h-6 text-purple-500" />;
      case 'code':
        return <Code2 className="w-6 h-6 text-pink-500" />;
      default:
        return <HardDrive className="w-6 h-6 text-slate-500" />;
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
          <HardDrive className="w-6 h-6" />
        </div>
        <p className="text-sm text-slate-400">אין קבצים להצגה בתיקייה זו</p>
      </div>
    );
  }

  // 1. Mobile List View (Google Drive style)
  if (viewMode === 'list') {
    return (
      <div className="divide-y divide-slate-800/60 rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        {items.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const isImage = item.type === 'image';
          const isTextDoc = item.type === 'code' || item.mimeType?.includes('text');

          return (
            <div
              key={item.id}
              onClick={() => onPreview(item)}
              className={`p-3 flex items-center justify-between gap-3 active:bg-slate-800/80 transition-colors cursor-pointer ${
                isSelected ? 'bg-amber-500/10' : ''
              }`}
            >
              {/* Left thumbnail / icon + select box */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(item.id);
                  }}
                  className="p-1 text-slate-400 hover:text-amber-400 flex-shrink-0"
                >
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>

                {/* Media thumbnail or type icon */}
                <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {isImage ? (
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    renderIcon(item)
                  )}
                </div>

                {/* Metadata */}
                <div className="min-w-0">
                  <h4 className="text-sm font-bold truncate leading-snug" title={item.name} dir="auto">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>{FileCompressionService.formatBytes(item.sizeBytes)}</span>
                    <span>•</span>
                    <span>{new Date(item.createdAt).toLocaleDateString('he-IL')}</span>
                    {item.extension && (
                      <>
                        <span>•</span>
                        <span className="uppercase font-mono font-semibold">{item.extension}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick action buttons */}
              <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                {isImage && onEditImage && (
                  <button
                    type="button"
                    onClick={() => onEditImage(item)}
                    className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                    title="ערוך תמונה"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                {isTextDoc && onEditDoc && (
                  <button
                    type="button"
                    onClick={() => onEditDoc(item)}
                    className="p-2 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-slate-800"
                    title="ערוך מסמך"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                {onDocToLandingPage && (
                  <button
                    type="button"
                    onClick={() => onDocToLandingPage(item)}
                    className="p-2 rounded-xl text-slate-400 hover:text-purple-400 hover:bg-slate-800"
                    title="צור דף נחיתה"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // 2. Mobile Grid View
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
      {items.map((item) => {
        const isSelected = selectedIds.includes(item.id);
        const isImage = item.type === 'image';
        const isVideo = item.type === 'video';

        return (
          <div
            key={item.id}
            onClick={() => onPreview(item)}
            className={`group relative rounded-2xl border overflow-hidden flex flex-col transition-all cursor-pointer ${
              isSelected
                ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                : isLight
                ? 'bg-white border-slate-200 hover:border-slate-300'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Media thumbnail box */}
            <div className="aspect-square bg-slate-950/40 relative flex items-center justify-center overflow-hidden">
              {isImage ? (
                <img
                  src={item.thumbnailUrl || item.url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : isVideo ? (
                <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                  <FileVideo className="w-10 h-10 text-indigo-400" />
                  <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-mono text-white">
                    וידאו
                  </span>
                </div>
              ) : (
                <div className="p-4 flex flex-col items-center justify-center gap-2">
                  {renderIcon(item)}
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                    {item.extension || item.type}
                  </span>
                </div>
              )}

              {/* Selection Checkbox */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect(item.id);
                }}
                className="absolute top-2 right-2 p-1 rounded-lg bg-black/60 backdrop-blur text-white hover:text-amber-400 transition-colors"
              >
                {isSelected ? (
                  <CheckSquare className="w-4 h-4 text-amber-500" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Footer details */}
            <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between">
              <h4 className="text-xs font-bold truncate leading-snug" title={item.name} dir="auto">
                {item.name}
              </h4>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                <span>{FileCompressionService.formatBytes(item.sizeBytes)}</span>
                <span className="uppercase font-mono">{item.extension}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
