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
} from 'lucide-react';
import { useMediaGallery, KNOWN_MODULE_SOURCES } from '../context/MediaGalleryContext';
import { FileCompressionService } from '../services/fileCompressionService';
import { MediaItem, MediaType, MediaFolder } from '../types';

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
  } = useMediaGallery();

  const isLight = theme === 'light';
  const [viewMode, setViewMode] = useState<'grid' | 'dense' | 'list'>('grid');

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

  const renderFileTypeIcon = (type: MediaType, className: string = 'w-4 h-4') => {
    switch (type) {
      case 'video':
        return <FileVideo className={`${className} text-indigo-500`} />;
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
                  {filters.typeFilter === 'video'
                    ? 'סרטוני וידאו'
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

          {/* Quick Upload Button */}
          <button
            type="button"
            onClick={() => setIsUploaderOpen(!isUploaderOpen)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs flex items-center space-x-1.5 rtl:space-x-reverse shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">העלאת קבצים</span>
          </button>
        </div>
      </div>

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
      {filteredItems.length === 0 ? (
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

          {filteredItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const isFocused = focusedItem?.id === item.id;
            const isEditing = editingItemId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                onDoubleClick={() => handleItemDoubleClick(item)}
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
                      toggleSelect(item.id);
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
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
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
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => handleKeyDownRename(e, item.id)}
                        className={`w-full text-xs px-2 py-1 rounded-lg border focus:outline-none ${
                          isLight
                            ? 'bg-white border-amber-500 text-slate-900'
                            : 'bg-slate-950 border-yellow-500 text-white'
                        }`}
                        dir="auto"
                      />
                      <button
                        type="button"
                        onClick={(e) => saveRename(item.id, e)}
                        className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                        title="שמור שם"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={cancelRename}
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
                        onClick={(e) => startRename(item, e)}
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
                    onClick={(e) => handleDownloadSingle(e, item)}
                    className={`p-1 rounded-lg transition-colors ${
                      isLight ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-slate-700 text-slate-300'
                    }`}
                    title="הורד"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteSingle(e, item)}
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
          {filteredItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const isFocused = focusedItem?.id === item.id;
            const isEditing = editingItemId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                onDoubleClick={() => handleItemDoubleClick(item)}
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
                    isLight ? 'bg-slate-100' : 'bg-black/80'
                  } ${viewMode === 'dense' ? 'h-28' : 'h-36'}`}
                >
                  {item.type === 'video' && (
                    <>
                      <video src={item.url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center shadow">
                          <Play className="w-3.5 h-3.5 mr-0.5 fill-black" />
                        </div>
                      </div>
                    </>
                  )}

                  {item.type === 'image' && (
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  )}

                  {item.type === 'audio' && (
                    <div className="flex flex-col items-center justify-center text-amber-500 space-y-1">
                      <Music className="w-7 h-7 animate-pulse" />
                    </div>
                  )}

                  {item.type === 'document' && (
                    <div className="flex flex-col items-center justify-center text-blue-500 space-y-1">
                      <FileText className="w-7 h-7" />
                    </div>
                  )}

                  {item.type === 'archive' && (
                    <div className="flex flex-col items-center justify-center text-purple-500 space-y-1">
                      <Archive className="w-7 h-7" />
                    </div>
                  )}

                  {item.type === 'code' && (
                    <div className="flex flex-col items-center justify-center text-pink-500 space-y-1">
                      <Code2 className="w-7 h-7" />
                    </div>
                  )}

                  {item.type === 'other' && (
                    <div className="flex flex-col items-center justify-center text-slate-500 space-y-1">
                      <HardDrive className="w-7 h-7" />
                    </div>
                  )}

                  {/* Top Right Checkbox */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(item.id);
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
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => handleKeyDownRename(e, item.id)}
                          className={`w-full text-xs px-2 py-1 rounded-lg border focus:outline-none ${
                            isLight
                              ? 'bg-white border-amber-500 text-slate-900'
                              : 'bg-slate-950 border-yellow-500 text-white'
                          }`}
                          dir="auto"
                        />
                        <button
                          type="button"
                          onClick={(e) => saveRename(item.id, e)}
                          className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex-shrink-0"
                          title="שמור"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelRename}
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
                          onClick={(e) => startRename(item, e)}
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
                          onClick={(e) => handleConvertSingle(e, item)}
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
                        onClick={(e) => handleMoveSingle(e, item)}
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
                        onClick={(e) => handleDownloadSingle(e, item)}
                        className={`p-1 rounded-lg text-xs ${
                          isLight
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                        title="הורד קובץ"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemDoubleClick(item);
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
          })}
        </div>
      )}
    </div>
  );
};