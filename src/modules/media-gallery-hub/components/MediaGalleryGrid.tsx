import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  FileVideo,
  Image as ImageIcon,
  Music,
  FileText,
  Archive,
  Code2,
  Download,
  Play,
  Sparkles,
  Trash2,
  CheckSquare,
  Square,
  HardDrive,
  Eye,
  Grid,
  List as ListIcon,
  LayoutGrid,
  Folder,
  FolderPlus,
  ChevronLeft,
  Home,
  FolderInput,
  FolderEdit,
  Layers,
  UploadCloud,
  SlidersHorizontal,
  X,
  Info,
  Pencil,
  Check,
  RefreshCw,
  Loader2,
  Video,
} from 'lucide-react';
import { useMediaGallery, KNOWN_MODULE_SOURCES } from '../context/MediaGalleryContext';
import { FileCompressionService } from '../services/fileCompressionService';
import { MediaIndexedDbService } from '../services/mediaIndexedDbService';
import { MediaItem, MediaType, MediaFolder, MediaCategoryFilter } from '../types';

/**
 * Helper to render filenames cleanly in Hebrew RTL without bidi punctuation flips
 * e.g. "בסי מטיילת במשרד.mp4" -> Base name in RTL + Extension in LTR badge
 */
const BidiFileName: React.FC<{
  name: string;
  className?: string;
  isLight?: boolean;
}> = ({ name, className = '', isLight = false }) => {
  const lastDotIndex = name.lastIndexOf('.');
  if (lastDotIndex <= 0 || lastDotIndex === name.length - 1) {
    return (
      <span className={`truncate ${className}`} dir="auto" title={name}>
        {name}
      </span>
    );
  }

  const baseName = name.slice(0, lastDotIndex);
  const ext = name.slice(lastDotIndex + 1);

  return (
    <span className={`inline-flex items-baseline min-w-0 max-w-full gap-1 ${className}`} dir="rtl" title={name}>
      <bdi className="truncate text-right">{baseName}</bdi>
      <span
        dir="ltr"
        className={`font-mono text-[10px] px-1 py-0.2 rounded font-semibold flex-shrink-0 ${
          isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400'
        }`}
      >
        .{ext}
      </span>
    </span>
  );
};

// Helper for file icons
const renderFileTypeIcon = (type: MediaCategoryFilter | MediaType | string, className: string = 'w-4 h-4') => {
  switch (type) {
    case 'video':
      return <FileVideo className={`${className} text-indigo-500`} />;
    case 'heygen':
      return <Sparkles className={`${className} text-purple-500`} />;
    case 'image':
      return <ImageIcon className={`${className} text-emerald-500`} />;
    case 'audio':
      return <Music className={`${className} text-amber-500`} />;
    case 'document':
      return <FileText className={`${className} text-blue-500`} />;
    case 'archive':
      return <Archive className={`${className} text-purple-500`} />;
    case 'code':
      return <Code2 className={`${className} text-pink-500`} />;
    default:
      return <HardDrive className={`${className} text-slate-500`} />;
  }
};

// Optimized thumbnail component with skeleton shimmer and smooth lazy loading
const OptimizedMediaThumbnail: React.FC<{
  item: MediaItem;
  viewMode: 'grid' | 'dense' | 'list';
  isLight: boolean;
}> = React.memo(({ item, viewMode, isLight }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>(item.thumbnailUrl || item.url);

  useEffect(() => {
    setCurrentSrc(item.thumbnailUrl || item.url);
    setHasError(false);
    setIsLoaded(false);
  }, [item.url, item.thumbnailUrl]);

  const handleImageError = async () => {
    // 1. Try to recover from local IndexedDB binary blob
    try {
      const blob = (await MediaIndexedDbService.getBlob(item.id)) || (await MediaIndexedDbService.getBlob(item.name));
      if (blob) {
        const objectUrl = URL.createObjectURL(blob);
        setCurrentSrc(objectUrl);
        setHasError(false);
        return;
      }
    } catch {}

    // 2. Try to recover from metadata dataUrl or prompt
    if (item.metadata?.dataUrl && item.metadata.dataUrl !== currentSrc) {
      setCurrentSrc(item.metadata.dataUrl);
      setHasError(false);
      return;
    }

    setHasError(true);
  };

  if (item.type === 'image') {
    return (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {!isLoaded && !hasError && (
          <div
            className={`absolute inset-0 animate-pulse ${
              isLight ? 'bg-slate-200' : 'bg-slate-800'
            }`}
          />
        )}
        {hasError ? (
          <div className="flex flex-col items-center justify-center text-slate-400 space-y-1">
            <ImageIcon className="w-8 h-8 opacity-40" />
            <span className="text-[9px] font-mono">תמונה</span>
          </div>
        ) : (
          <img
            src={currentSrc}
            alt={item.name}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={handleImageError}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
      </div>
    );
  }

  if (item.type === 'video') {
    return (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {item.thumbnailUrl && !hasError ? (
          <>
            {!isLoaded && (
              <div
                className={`absolute inset-0 animate-pulse ${
                  isLight ? 'bg-slate-200' : 'bg-slate-800'
                }`}
              />
            )}
            <img
              src={item.thumbnailUrl}
              alt={item.name}
              loading="lazy"
              decoding="async"
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
              className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/45 transition-colors">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                <Play className="w-3.5 h-3.5 mr-0.5 fill-black" />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col items-center justify-center p-3 text-center relative overflow-hidden group-hover:from-slate-850 group-hover:to-purple-950 transition-colors">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-1 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-black transition-all shadow-md">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
            <span className="text-[10px] font-mono text-amber-300/80 font-semibold truncate max-w-[90%]">
              {item.durationSec
                ? `${Math.floor(item.durationSec / 60)}:${(item.durationSec % 60).toString().padStart(2, '0')}`
                : 'סרטון וידאו'}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (item.type === 'audio') {
    return (
      <div className="flex flex-col items-center justify-center text-amber-500 space-y-1">
        <Music className="w-8 h-8 animate-pulse" />
        <span className="text-[10px] font-mono opacity-75">Audio Track</span>
      </div>
    );
  }

  if (item.type === 'document') {
    return (
      <div className="flex flex-col items-center justify-center text-blue-500 space-y-1">
        <FileText className="w-7 h-7" />
      </div>
    );
  }

  if (item.type === 'archive') {
    return (
      <div className="flex flex-col items-center justify-center text-purple-500 space-y-1">
        <Archive className="w-7 h-7" />
      </div>
    );
  }

  if (item.type === 'code') {
    return (
      <div className="flex flex-col items-center justify-center text-pink-500 space-y-1">
        <Code2 className="w-7 h-7" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-slate-500 space-y-1">
      <HardDrive className="w-7 h-7" />
    </div>
  );
});

// Memoized Grid Card for buttery-smooth rendering
const MediaGridCard: React.FC<{
  item: MediaItem;
  isSelected: boolean;
  isFocused: boolean;
  isEditing: boolean;
  viewMode: 'grid' | 'dense' | 'list';
  isLight: boolean;
  selectionMode?: boolean;
  editingName: string;
  renameInputRef: React.RefObject<HTMLInputElement>;
  onItemClick: (item: MediaItem) => void;
  onItemDoubleClick: (item: MediaItem) => void;
  onToggleSelect: (id: string) => void;
  onStartRename: (item: MediaItem, e?: React.MouseEvent) => void;
  onSaveRename: (id: string, e?: React.MouseEvent | React.KeyboardEvent) => void;
  onCancelRename: (e?: React.MouseEvent | React.KeyboardEvent) => void;
  onKeyDownRename: (e: React.KeyboardEvent, id: string) => void;
  onEditingNameChange: (val: string) => void;
  onConvertSingle: (e: React.MouseEvent, item: MediaItem) => void;
  onMoveSingle: (e: React.MouseEvent, item: MediaItem) => void;
  onDownloadSingle: (e: React.MouseEvent, item: MediaItem) => void;
}> = React.memo((props) => {
  const {
    item,
    isSelected,
    isFocused,
    isEditing,
    viewMode,
    isLight,
    selectionMode,
    editingName,
    renameInputRef,
    onItemClick,
    onItemDoubleClick,
    onToggleSelect,
    onStartRename,
    onSaveRename,
    onCancelRename,
    onKeyDownRename,
    onEditingNameChange,
    onConvertSingle,
    onMoveSingle,
    onDownloadSingle,
  } = props;

  return (
    <div
      onClick={() => onItemClick(item)}
      onDoubleClick={() => onItemDoubleClick(item)}
      className={`group relative rounded-2xl border overflow-hidden shadow transition-all duration-200 cursor-pointer flex flex-col justify-between ${
        isFocused
          ? isLight
            ? 'border-amber-500 ring-2 ring-amber-500/40 bg-amber-50/50 shadow-md'
            : 'border-yellow-500 ring-2 ring-yellow-500/50 bg-yellow-500/5 shadow-lg'
          : isSelected
          ? isLight
            ? 'border-amber-500 bg-amber-50/50'
            : 'border-yellow-500 bg-yellow-500/5'
          : isLight
          ? 'bg-white border-slate-200 hover:border-amber-500/50 hover:shadow-md'
          : 'bg-slate-900/90 border-slate-800 hover:border-yellow-500/50 hover:shadow-md'
      }`}
    >
      {/* Media Thumbnail Box */}
      <div
        className={`relative w-full flex items-center justify-center overflow-hidden ${
          isLight ? 'bg-slate-100' : 'bg-slate-950'
        } ${viewMode === 'dense' ? 'h-28' : 'h-36'}`}
      >
        <OptimizedMediaThumbnail item={item} viewMode={viewMode} isLight={isLight} />

        {/* Top Right Checkbox */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(item.id);
          }}
          className={`absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center transition-all shadow cursor-pointer ${
            isSelected
              ? 'bg-amber-500 text-black'
              : isLight
              ? 'bg-white/80 text-slate-400 hover:text-slate-800 border border-slate-300'
              : 'bg-black/60 text-slate-400 hover:text-white border border-slate-700'
          }`}
        >
          {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
        </button>

        {/* Top Left Component Badge */}
        {item.sourceModuleLabel && (
          <span
            className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-md border truncate max-w-[100px] backdrop-blur-md ${
              isLight
                ? 'bg-white/90 text-amber-800 border-amber-300'
                : 'bg-black/80 text-yellow-300 border-slate-800'
            }`}
          >
            {item.sourceModuleLabel}
          </span>
        )}
      </div>

      {/* Card Bottom Details */}
      <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
        <div>
          {isEditing ? (
            <div
              className="flex items-center space-x-1 rtl:space-x-reverse"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                ref={renameInputRef}
                type="text"
                value={editingName}
                onChange={(e) => onEditingNameChange(e.target.value)}
                onKeyDown={(e) => onKeyDownRename(e, item.id)}
                className={`w-full text-xs px-2 py-1 rounded-lg border focus:outline-none ${
                  isLight
                    ? 'bg-white border-amber-500 text-slate-900'
                    : 'bg-slate-950 border-yellow-500 text-white'
                }`}
                dir="auto"
              />
              <button
                type="button"
                onClick={(e) => onSaveRename(item.id, e)}
                className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex-shrink-0"
                title="שמור"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onCancelRename}
                className="p-1 rounded-lg bg-slate-600 hover:bg-slate-500 text-white flex-shrink-0"
                title="בטל"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between group/title">
              <BidiFileName
                name={item.name}
                className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}
                isLight={isLight}
              />
              <button
                type="button"
                onClick={(e) => onStartRename(item, e)}
                className="opacity-0 group-hover/title:opacity-100 p-0.5 text-slate-400 hover:text-amber-500 transition-opacity"
                title="שנה שם קובץ"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          )}

          <div
            className={`flex items-center justify-between text-[10px] mt-1 font-mono ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            <span>{FileCompressionService.formatBytes(item.sizeBytes)}</span>
            <span>{new Date(item.createdAt).toLocaleDateString('he-IL')}</span>
          </div>
        </div>

        {/* Quick Action Buttons on Card */}
        <div
          className={`pt-2 border-t flex items-center justify-between ${
            isLight ? 'border-slate-100' : 'border-slate-800/80'
          }`}
        >
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            {(item.type === 'image' || item.type === 'code' || item.type === 'document') && (
              <button
                type="button"
                onClick={(e) => onConvertSingle(e, item)}
                className={`p-1 rounded-lg text-xs ${
                  isLight
                    ? 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                    : 'bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300'
                }`}
                title="המרה ודחיסה"
              >
                <Sparkles className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => onMoveSingle(e, item)}
              className={`p-1 rounded-lg text-xs ${
                isLight
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
              }`}
              title="העבר לתיקייה"
            >
              <FolderInput className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={(e) => onDownloadSingle(e, item)}
              className={`p-1 rounded-lg text-xs ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
              title="הורד קובץ"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onItemDoubleClick(item);
            }}
            className={`text-[10px] font-bold flex items-center space-x-1 rtl:space-x-reverse ${
              isLight ? 'text-amber-700 hover:text-amber-900' : 'text-yellow-400 hover:text-yellow-300'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>{selectionMode ? 'בחר' : 'צפה'}</span>
          </button>
        </div>
      </div>
    </div>
  );
});

// Memoized List Row for buttery-smooth list view
const MediaListRow: React.FC<{
  item: MediaItem;
  isSelected: boolean;
  isFocused: boolean;
  isEditing: boolean;
  isLight: boolean;
  editingName: string;
  renameInputRef: React.RefObject<HTMLInputElement>;
  onItemClick: (item: MediaItem) => void;
  onItemDoubleClick: (item: MediaItem) => void;
  onToggleSelect: (id: string) => void;
  onStartRename: (item: MediaItem, e?: React.MouseEvent) => void;
  onSaveRename: (id: string, e?: React.MouseEvent | React.KeyboardEvent) => void;
  onCancelRename: (e?: React.MouseEvent | React.KeyboardEvent) => void;
  onKeyDownRename: (e: React.KeyboardEvent, id: string) => void;
  onEditingNameChange: (val: string) => void;
  onDownloadSingle: (e: React.MouseEvent, item: MediaItem) => void;
  onDeleteSingle: (e: React.MouseEvent, item: MediaItem) => void;
}> = React.memo((props) => {
  const {
    item,
    isSelected,
    isFocused,
    isEditing,
    isLight,
    editingName,
    renameInputRef,
    onItemClick,
    onItemDoubleClick,
    onToggleSelect,
    onStartRename,
    onSaveRename,
    onCancelRename,
    onKeyDownRename,
    onEditingNameChange,
    onDownloadSingle,
    onDeleteSingle,
  } = props;

  return (
    <div
      onClick={() => onItemClick(item)}
      onDoubleClick={() => onItemDoubleClick(item)}
      className={`p-2.5 grid grid-cols-12 gap-2 items-center transition-colors cursor-pointer group ${
        isFocused
          ? isLight
            ? 'bg-amber-100/70 border-r-4 border-amber-500'
            : 'bg-yellow-500/15 border-r-4 border-yellow-500'
          : isSelected
          ? isLight
            ? 'bg-amber-50'
            : 'bg-yellow-500/10'
          : isLight
          ? 'hover:bg-slate-50'
          : 'hover:bg-slate-800/60'
      }`}
    >
      {/* Name & Icon */}
      <div className="col-span-6 sm:col-span-5 flex items-center space-x-2.5 rtl:space-x-reverse min-w-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(item.id);
          }}
          className={`cursor-pointer ${isLight ? 'text-slate-400 hover:text-slate-800' : 'text-slate-400 hover:text-white'}`}
        >
          {isSelected ? (
            <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <Square className="w-3.5 h-3.5" />
          )}
        </button>

        <div
          className={`w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-black border-slate-800'
          }`}
        >
          {item.type === 'image' ? (
            <img src={item.thumbnailUrl || item.url} alt={item.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
          ) : (
            renderFileTypeIcon(item.type, 'w-4 h-4')
          )}
        </div>

        {isEditing ? (
          <div
            className="flex items-center space-x-1 rtl:space-x-reverse min-w-0 flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={renameInputRef}
              type="text"
              value={editingName}
              onChange={(e) => onEditingNameChange(e.target.value)}
              onKeyDown={(e) => onKeyDownRename(e, item.id)}
              className={`w-full text-xs px-2 py-1 rounded-lg border focus:outline-none ${
                isLight
                  ? 'bg-white border-amber-500 text-slate-900'
                  : 'bg-slate-950 border-yellow-500 text-white'
              }`}
              dir="auto"
            />
            <button
              type="button"
              onClick={(e) => onSaveRename(item.id, e)}
              className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
              title="שמור שם"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onCancelRename}
              className="p-1 rounded-lg bg-slate-600 hover:bg-slate-500 text-white"
              title="בטל"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 rtl:space-x-reverse min-w-0 flex-1">
            <BidiFileName
              name={item.name}
              className="font-bold flex-1"
              isLight={isLight}
            />
            <button
              type="button"
              onClick={(e) => onStartRename(item, e)}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-amber-500 transition-opacity"
              title="שנה שם קובץ"
            >
              <Pencil className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Component */}
      <div className={`col-span-2 hidden sm:block truncate text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
        {item.sourceModuleLabel || '-'}
      </div>

      {/* Size */}
      <div className={`col-span-2 font-mono text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
        {FileCompressionService.formatBytes(item.sizeBytes)}
      </div>

      {/* Date */}
      <div className={`col-span-2 hidden md:block text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
        {new Date(item.createdAt).toLocaleDateString('he-IL')}
      </div>

      {/* Actions */}
      <div className="col-span-4 sm:col-span-3 md:col-span-1 flex items-center space-x-1 rtl:space-x-reverse justify-end">
        <button
          type="button"
          onClick={(e) => onDownloadSingle(e, item)}
          className={`p-1 rounded-lg transition-colors ${
            isLight ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-slate-700 text-slate-300'
          }`}
          title="הורד"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => onDeleteSingle(e, item)}
          className={`p-1 rounded-lg transition-colors ${
            isLight ? 'hover:bg-red-100 text-slate-400 hover:text-red-600' : 'hover:bg-red-950 text-slate-400 hover:text-red-400'
          }`}
          title="מחק"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
});

export const MediaGalleryGrid: React.FC = () => {
  const {
    filteredItems,
    mediaItems,
    folders,
    activeFolderId,
    setActiveFolderId,
    filters,
    setFilters,
    selectedIds,
    toggleSelect,
    setPreviewItem,
    setConverterItem,
    deleteMediaItems,
    renameMediaItem,
    theme,
    selectionMode,
    onSelectMedia,
    setIsFolderModalOpen,
    setEditingFolder,
    deleteFolder,
    setIsMoveModalOpen,
    setItemsToMove,
    isUploaderOpen,
    setIsUploaderOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    isInspectorOpen,
    setIsInspectorOpen,
    focusedItem,
    setFocusedItem,
    isSyncingHeyGen,
    syncHeyGenVideos,
    isHeyGenRevealed,
    setIsHeyGenRevealed,
    openAiImageGenerator,
  } = useMediaGallery();

  const isLight = theme === 'light';
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'dense' | 'list'>('grid');

  // Pagination / Chunking to keep DOM lightweight and instantaneous
  const [visibleCount, setVisibleCount] = useState<number>(24);

  useEffect(() => {
    setVisibleCount(24);
  }, [filters, activeFolderId]);

  const displayedItems = filteredItems.slice(0, visibleCount);
  const hasMore = filteredItems.length > visibleCount;

  // Inline rename state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingItemId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [editingItemId]);

  const activeFolder = folders.find((f) => f.id === activeFolderId);

  const startRename = (item: MediaItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingItemId(item.id);
    setEditingName(item.name);
  };

  const saveRename = async (id: string, e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.stopPropagation();
    if (editingName.trim()) {
      await renameMediaItem(id, editingName.trim());
    }
    setEditingItemId(null);
  };

  const cancelRename = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.stopPropagation();
    setEditingItemId(null);
  };

  const handleKeyDownRename = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveRename(id, e);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelRename(e);
    }
  };

  const handleSyncHeyGen = async () => {
    const res = await syncHeyGenVideos();
    if (res.error) {
      setSyncStatusMsg({ text: res.error, type: 'error' });
    } else if (res.count > 0) {
      setSyncStatusMsg({ text: `סונכרנו בהצלחה ${res.count} סרטונים מחשבון HeyGen!`, type: 'success' });
    } else {
      setSyncStatusMsg({ text: 'לא נמצאו סרטונים חדשים ב-HeyGen.', type: 'success' });
    }
    setTimeout(() => setSyncStatusMsg(null), 5000);
  };

  // Focus item and open in inspector on click; double click to open full preview modal
  const handleItemClick = (item: MediaItem) => {
    if (editingItemId === item.id) return;
    setFocusedItem(item);
    if (!isInspectorOpen) {
      setIsInspectorOpen(true);
    }
  };

  const handleItemDoubleClick = (item: MediaItem) => {
    if (editingItemId === item.id) return;
    if (selectionMode && onSelectMedia) {
      onSelectMedia([item]);
    } else {
      setPreviewItem(item);
    }
  };

  const handleDownloadSingle = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    FileCompressionService.downloadMedia(item.url, item.name);
  };

  const handleDeleteSingle = async (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    if (confirm(`האם למחוק את "${item.name}"?`)) {
      await deleteMediaItems([item.id]);
      if (focusedItem?.id === item.id) {
        setFocusedItem(null);
      }
    }
  };

  const handleConvertSingle = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    setConverterItem(item);
  };

  const handleMoveSingle = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    setItemsToMove([item.id]);
    setIsMoveModalOpen(true);
  };

  const handleEditFolder = (e: React.MouseEvent, folder: MediaFolder) => {
    e.stopPropagation();
    setEditingFolder(folder);
    setIsFolderModalOpen(true);
  };

  const handleDeleteFolder = async (e: React.MouseEvent, folder: MediaFolder) => {
    e.stopPropagation();
    const count = folder.itemCount || 0;
    const msg = count > 0
      ? `התיקייה "${folder.name}" מכילה ${count} קבצים. למחוק את התיקייה בלבד (הקבצים יישמרו)?`
      : `האם למחוק את התיקייה "${folder.name}"?`;
    if (confirm(msg)) {
      await deleteFolder(folder.id, false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 space-y-4" dir="rtl">
      {/* 1. Ultra-Compact Modern Action Bar */}
      <div
        className={`p-3 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-3 transition-colors ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-800'
            : 'bg-slate-900/90 border-slate-800 text-slate-100'
        }`}
      >
        {/* Breadcrumb Path & Active Filters */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse min-w-0 flex-wrap gap-y-1">
          {/* Re-open Sidebar Button when hidden */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 rtl:space-x-reverse ${
              isSidebarOpen
                ? isLight
                  ? 'bg-slate-100 text-slate-600 border-slate-300 hover:text-slate-900'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                : isLight
                ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-sm'
                : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow'
            }`}
            title={isSidebarOpen ? 'הסתר סרגל ניווט' : 'הצג סרגל ניווט'}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">{isSidebarOpen ? 'סרגל' : 'סרגל ניווט'}</span>
          </button>

          {/* Root button */}
          <button
            type="button"
            onClick={() => {
              setActiveFolderId(null);
              setFilters((prev) => ({
                ...prev,
                typeFilter: 'all',
                sourceModuleFilter: 'all',
                searchQuery: '',
              }));
            }}
            className={`flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeFolderId === null &&
              filters.typeFilter === 'all' &&
              (!filters.sourceModuleFilter || filters.sourceModuleFilter === 'all')
                ? isLight
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                  : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 font-bold'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>מאגר ראשי</span>
          </button>

          {/* Active Folder Chip */}
          {activeFolder && (
            <>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400 rtl:rotate-180 flex-shrink-0" />
              <div
                className={`flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1 rounded-xl border text-xs font-bold shadow-sm ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
                style={{
                  backgroundColor: `${activeFolder.color || '#eab308'}18`,
                  borderColor: activeFolder.color || '#eab308',
                }}
              >
                <Folder className="w-3.5 h-3.5" style={{ color: activeFolder.color || '#eab308' }} />
                <span className="truncate max-w-[140px]">{activeFolder.name}</span>
                <span className={`text-[10px] font-mono font-normal ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  ({activeFolder.itemCount || 0})
                </span>
                <button
                  type="button"
                  onClick={() => setActiveFolderId(null)}
                  className="p-0.5 hover:text-red-500 text-slate-400 rounded-full"
                  title="צא מתיקייה"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </>
          )}

          {/* Active File Type Chip */}
          {filters.typeFilter !== 'all' && (
            <>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400 rtl:rotate-180 flex-shrink-0" />
              <div className="flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1 rounded-xl border border-indigo-500/40 bg-indigo-500/15 text-indigo-700 dark:text-indigo-200 text-xs font-bold">
                {renderFileTypeIcon(filters.typeFilter, 'w-3.5 h-3.5')}
                <span>
                  {filters.typeFilter === 'heygen'
                    ? 'סרטוני HeyGen AI'
                    : filters.typeFilter === 'video'
                    ? 'סרטוני מערכת'
                    : filters.typeFilter === 'image'
                    ? 'תמונות'
                    : filters.typeFilter === 'audio'
                    ? 'שמע וקול'
                    : filters.typeFilter === 'document'
                    ? 'מסמכים'
                    : filters.typeFilter === 'archive'
                    ? 'ארכיוני ZIP'
                    : 'קוד ונתונים'}
                </span>
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, typeFilter: 'all' }))}
                  className="p-0.5 hover:text-red-500 text-indigo-400 rounded-full"
                  title="בטל סינון סוג"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </>
          )}

          {/* Active Component Source Chip */}
          {filters.sourceModuleFilter && filters.sourceModuleFilter !== 'all' && (
            <>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400 rtl:rotate-180 flex-shrink-0" />
              <div className="flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1 rounded-xl border border-amber-500/40 bg-amber-500/15 text-amber-900 dark:text-yellow-300 text-xs font-bold">
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                <span className="truncate max-w-[140px]">
                  {KNOWN_MODULE_SOURCES[filters.sourceModuleFilter]?.name || filters.sourceModuleFilter}
                </span>
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, sourceModuleFilter: 'all' }))}
                  className="p-0.5 hover:text-red-500 text-amber-400 rounded-full"
                  title="בטל סינון רכיב"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </>
          )}

          <span className={`text-[11px] hidden sm:inline-block font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
            • {filteredItems.length} פריטים
          </span>
        </div>

        {/* Center Search */}
        <div className="relative flex-1 min-w-[160px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="חיפוש מהיר בקבצים ותגיות..."
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            className={`w-full rounded-xl pr-9 pl-7 py-1.5 text-xs transition-colors focus:outline-none ${
              isLight
                ? 'bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:bg-white'
                : 'bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 focus:border-yellow-500'
            }`}
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Right Controls: Sort, Density, Inspector, +Upload */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {/* Sort Dropdown */}
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
            className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold cursor-pointer focus:outline-none ${
              isLight
                ? 'bg-slate-100 border border-slate-300 text-slate-800 focus:border-amber-500'
                : 'bg-slate-950 border border-slate-700/80 text-white focus:border-yellow-500'
            }`}
          >
            <option value="date_desc">📅 החדשים</option>
            <option value="date_asc">📅 הישנים</option>
            <option value="size_desc">💾 הגדולים</option>
            <option value="name_asc">🔤 לפי שם</option>
          </select>

          {/* View Mode Toggle */}
          <div
            className={`flex p-0.5 rounded-xl border ${
              isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'
            }`}
          >
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-black shadow font-bold'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="תצוגת רשת רגילה"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('dense')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'dense'
                  ? 'bg-amber-500 text-black shadow font-bold'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="תצוגת רשת צפופה"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-amber-500 text-black shadow font-bold'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="תצוגת רשימה"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Inspector Toggle Button */}
          <button
            type="button"
            onClick={() => setIsInspectorOpen(!isInspectorOpen)}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              isInspectorOpen
                ? isLight
                  ? 'bg-amber-100 text-amber-900 border-amber-400'
                  : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                : isLight
                ? 'bg-slate-100 text-slate-600 border-slate-300 hover:text-slate-900'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title={isInspectorOpen ? 'הסתר פאנל פרטים' : 'הצג פאנל פרטים'}
          >
            <Info className="w-4 h-4" />
          </button>

          {/* HeyGen Cloud Sync Button */}
          <button
            type="button"
            onClick={handleSyncHeyGen}
            disabled={isSyncingHeyGen}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 rtl:space-x-reverse ${
              isSyncingHeyGen
                ? 'opacity-70 cursor-not-allowed bg-purple-500/20 border-purple-500/40 text-purple-300'
                : isLight
                ? 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-300 shadow-sm hover:shadow'
                : 'bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border-purple-800/60 shadow'
            }`}
            title="משוך וסנכרן סרטונים מחשבון HeyGen באמצעות API"
          >
            {isSyncingHeyGen ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-500" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-purple-500" />
            )}
            <span className="hidden sm:inline">
              {isSyncingHeyGen ? 'מסנכרן HeyGen...' : 'סנכרון HeyGen'}
            </span>
          </button>

          {/* Gemini AI Image Generator Button */}
          <button
            type="button"
            onClick={() => openAiImageGenerator()}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs flex items-center space-x-1.5 rtl:space-x-reverse shadow-md hover:shadow-amber-500/25 transition-all active:scale-95 cursor-pointer"
            title="יצירת תמונות מרהיבות עם Google Gemini וקידוד אוטומטי"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">יצירת תמונה ב-AI</span>
          </button>

          {/* Quick Upload Button */}
          <button
            type="button"
            onClick={() => setIsUploaderOpen(!isUploaderOpen)}
            className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center space-x-1.5 rtl:space-x-reverse transition-all active:scale-95 cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">העלאת קבצים</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatusMsg && (
        <div
          className={`p-2.5 px-4 rounded-xl border text-xs flex items-center justify-between shadow-sm animate-fade-in ${
            syncStatusMsg.type === 'error'
              ? isLight
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-red-950/60 border-red-800 text-red-300'
              : isLight
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
          }`}
        >
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {syncStatusMsg.type === 'error' ? (
              <X className="w-4 h-4 text-red-500 flex-shrink-0" />
            ) : (
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            )}
            <span>{syncStatusMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncStatusMsg(null)}
            className="p-1 hover:opacity-75 rounded-md text-inherit"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Folders Bar (Pills shelf inside current location) */}
      {!activeFolderId && folders.length > 0 && (
        <div className="space-y-1.5">
          <div className={`flex items-center justify-between text-[11px] font-bold px-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            <span>תיקיות במאגר ({folders.length})</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {folders.map((folder) => {
              const folderColor = folder.color || '#eab308';

              return (
                <div
                  key={folder.id}
                  onClick={() => setActiveFolderId(folder.id)}
                  className={`group flex-shrink-0 border p-2.5 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-md flex items-center space-x-2.5 rtl:space-x-reverse ${
                    isLight
                      ? 'bg-white border-slate-200 hover:border-amber-500/70 text-slate-900'
                      : 'bg-slate-900/90 border-slate-800 hover:border-yellow-500/60 text-white'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: `${folderColor}20`, borderColor: folderColor, borderWidth: 1 }}
                  >
                    <Folder className="w-4 h-4" style={{ color: folderColor }} />
                  </div>

                  <div className="min-w-0 pr-1">
                    <div className="font-bold text-xs truncate max-w-[130px] group-hover:text-amber-600 dark:group-hover:text-yellow-300 transition-colors">
                      {folder.name}
                    </div>
                    <div className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {folder.itemCount || 0} קבצים
                    </div>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 rtl:space-x-reverse transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => handleEditFolder(e, folder)}
                      className={`p-1 rounded ${isLight ? 'text-slate-500 hover:text-amber-700' : 'text-slate-400 hover:text-yellow-400'}`}
                      title="ערוך"
                    >
                      <FolderEdit className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteFolder(e, folder)}
                      className={`p-1 rounded ${isLight ? 'text-slate-500 hover:text-red-600' : 'text-slate-400 hover:text-red-400'}`}
                      title="מחק"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Files Container */}
      {filters.typeFilter === 'heygen' && !isHeyGenRevealed ? (
        <div
          className={`p-8 md:p-12 rounded-3xl border text-center max-w-2xl mx-auto my-6 space-y-6 ${
            isLight
              ? 'bg-gradient-to-b from-purple-50 via-white to-indigo-50 border-purple-200 shadow-xl shadow-purple-500/5'
              : 'bg-gradient-to-b from-purple-950/40 via-slate-900 to-indigo-950/40 border-purple-900/50 shadow-2xl'
          }`}
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-purple-500/30 transform hover:scale-105 transition-transform">
            <Sparkles className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className={`text-xl md:text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              סרטוני HeyGen AI & אולפן וידאו
            </h3>
            <p className={`text-xs md:text-sm max-w-lg mx-auto ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              בטאב זה מרוכזים כל סרטוני האווטאר וה-AI של HeyGen. כדי לשמור על מהירות וביצועים קלילים של הגלריה,
              לחץ על הכפתור למטה כדי להציג את הסרטונים.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsHeyGenRevealed(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 flex items-center justify-center space-x-2 rtl:space-x-reverse cursor-pointer transform active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-white ml-1" />
              <span>הצג סרטוני HEYGEN ({filteredItems.length})</span>
            </button>

            <button
              type="button"
              onClick={handleSyncHeyGen}
              disabled={isSyncingHeyGen}
              className={`w-full sm:w-auto px-5 py-3.5 rounded-2xl border font-bold text-sm flex items-center justify-center space-x-2 rtl:space-x-reverse cursor-pointer transition-all ${
                isLight
                  ? 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50 shadow-sm'
                  : 'bg-slate-800 border-purple-800/80 text-purple-300 hover:bg-purple-900/30'
              }`}
            >
              {isSyncingHeyGen ? (
                <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
              ) : (
                <RefreshCw className="w-4 h-4 text-purple-500" />
              )}
              <span>סנכרן מ-HeyGen API</span>
            </button>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div
          className={`p-12 text-center border rounded-3xl space-y-3 ${
            isLight
              ? 'bg-white/80 border-slate-200 text-slate-800'
              : 'bg-slate-900/40 border-slate-800 text-slate-100'
          }`}
        >
          <div
            className={`w-14 h-14 rounded-full border flex items-center justify-center text-2xl mx-auto ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800/80 border-slate-700'
            }`}
          >
            📂
          </div>
          <h4 className="text-sm font-bold">לא נמצאו קבצים במיקום זה</h4>
          <p className={`text-xs max-w-sm mx-auto ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            גרור קבצים לכל מקום בחלון או לחץ על כפתור "העלאת קבצים" למעלה.
          </p>
        </div>
      ) : viewMode === 'list' ? (
        /* LIST VIEW */
        <div
          className={`border rounded-2xl overflow-hidden shadow-sm divide-y text-xs ${
            isLight
              ? 'bg-white border-slate-200 divide-slate-100 text-slate-800'
              : 'bg-slate-900/90 border-slate-800 divide-slate-800/80 text-slate-100'
          }`}
        >
          <div
            className={`p-2.5 text-[11px] font-bold grid grid-cols-12 gap-2 ${
              isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-950/80 text-slate-400'
            }`}
          >
            <span className="col-span-6 sm:col-span-5 flex items-center space-x-2 rtl:space-x-reverse">
              <span>שם קובץ</span>
            </span>
            <span className="col-span-2 hidden sm:block">רכיב יוצר</span>
            <span className="col-span-2">נפח</span>
            <span className="col-span-2 hidden md:block">תאריך</span>
            <span className="col-span-4 sm:col-span-3 md:col-span-1 text-left">פעולות</span>
          </div>

          {displayedItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const isFocused = focusedItem?.id === item.id;
            const isEditing = editingItemId === item.id;

            return (
              <MediaListRow
              key={item.id}
              item={item}
              isSelected={isSelected}
              isFocused={isFocused}
              isEditing={isEditing}
              isLight={isLight}
              editingName={editingName}
              renameInputRef={renameInputRef}
              onItemClick={handleItemClick}
              onItemDoubleClick={handleItemDoubleClick}
              onToggleSelect={toggleSelect}
              onStartRename={startRename}
              onSaveRename={saveRename}
              onCancelRename={cancelRename}
              onKeyDownRename={handleKeyDownRename}
              onEditingNameChange={setEditingName}
              onDownloadSingle={handleDownloadSingle}
              onDeleteSingle={handleDeleteSingle}
            />
          );
        })}
      </div>
    ) : (
      /* GRID & DENSE VIEW */
      <div
        className={`grid gap-3 ${
          viewMode === 'dense'
            ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
            : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4'
        }`}
      >
        {displayedItems.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const isFocused = focusedItem?.id === item.id;
          const isEditing = editingItemId === item.id;

          return (
            <MediaGridCard
              key={item.id}
              item={item}
              isSelected={isSelected}
              isFocused={isFocused}
              isEditing={isEditing}
              viewMode={viewMode}
              isLight={isLight}
              selectionMode={selectionMode}
              editingName={editingName}
              renameInputRef={renameInputRef}
              onItemClick={handleItemClick}
              onItemDoubleClick={handleItemDoubleClick}
              onToggleSelect={toggleSelect}
              onStartRename={startRename}
              onSaveRename={saveRename}
              onCancelRename={cancelRename}
              onKeyDownRename={handleKeyDownRename}
              onEditingNameChange={setEditingName}
              onConvertSingle={handleConvertSingle}
              onMoveSingle={handleMoveSingle}
              onDownloadSingle={handleDownloadSingle}
            />
          );
        })}
      </div>
    )}

      {/* Pagination Load More Bar */}
      {hasMore && (
        <div className="flex flex-col items-center justify-center py-6">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 24)}
            className={`px-6 py-2.5 rounded-2xl font-bold text-xs flex items-center space-x-2 rtl:space-x-reverse shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95 ${
              isLight
                ? 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <span>טען עוד 24 קבצים</span>
            <span className="text-[11px] font-mono text-amber-500">
              ({displayedItems.length} מתוך {filteredItems.length})
            </span>
          </button>
        </div>
      )}
    </div>
  );
};