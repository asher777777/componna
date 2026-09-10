import React, { useState } from 'react';
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
} from 'lucide-react';
import { useMediaGallery, KNOWN_MODULE_SOURCES } from '../context/MediaGalleryContext';
import { FileCompressionService } from '../services/fileCompressionService';
import { MediaItem, MediaType, MediaFolder } from '../types';

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
    selectionMode,
    onSelectMedia,
    setIsFolderModalOpen,
    setEditingFolder,
    deleteFolder,
    setIsMoveModalOpen,
    setItemsToMove,
    isUploaderOpen,
    setIsUploaderOpen,
    isInspectorOpen,
    setIsInspectorOpen,
    focusedItem,
    setFocusedItem,
  } = useMediaGallery();

  const [viewMode, setViewMode] = useState<'grid' | 'dense' | 'list'>('grid');

  const activeFolder = folders.find((f) => f.id === activeFolderId);

  // Focus item and open in inspector on click; double click to open full preview modal
  const handleItemClick = (item: MediaItem) => {
    setFocusedItem(item);
    if (!isInspectorOpen) {
      setIsInspectorOpen(true);
    }
  };

  const handleItemDoubleClick = (item: MediaItem) => {
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
        return <FileVideo className={`${className} text-indigo-400`} />;
      case 'image':
        return <ImageIcon className={`${className} text-emerald-400`} />;
      case 'audio':
        return <Music className={`${className} text-amber-400`} />;
      case 'document':
        return <FileText className={`${className} text-blue-400`} />;
      case 'archive':
        return <Archive className={`${className} text-purple-400`} />;
      case 'code':
        return <Code2 className={`${className} text-pink-400`} />;
      default:
        return <HardDrive className={`${className} text-slate-400`} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 space-y-4" dir="rtl">
      {/* 1. Ultra-Compact Modern Action Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3">
        {/* Breadcrumb Path */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse min-w-0">
          <button
            type="button"
            onClick={() => setActiveFolderId(null)}
            className={`flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeFolderId === null
                ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>מאגר ראשי</span>
          </button>

          {activeFolder && (
            <>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-600 rtl:rotate-180 flex-shrink-0" />
              <div
                className="flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1.5 rounded-xl border text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: `${activeFolder.color || '#eab308'}15`, borderColor: activeFolder.color || '#eab308' }}
              >
                <Folder className="w-3.5 h-3.5" style={{ color: activeFolder.color || '#eab308' }} />
                <span className="truncate max-w-[150px]">{activeFolder.name}</span>
                <span className="text-[10px] text-slate-400 font-mono font-normal">
                  ({activeFolder.itemCount || 0})
                </span>
              </div>
            </>
          )}

          <span className="text-[11px] text-slate-500 hidden sm:inline-block font-mono">
            • {filteredItems.length} פריטים
          </span>
        </div>

        {/* Center Search */}
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="חיפוש מהיר בקבצים ותגיות..."
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pr-9 pl-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
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
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500 cursor-pointer"
          >
            <option value="date_desc">📅 החדשים</option>
            <option value="date_asc">📅 הישנים</option>
            <option value="size_desc">💾 הגדולים</option>
            <option value="name_asc">🔤 לפי שם</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-950 p-0.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-yellow-500 text-black shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="תצוגת רשת רגילה"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('dense')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'dense' ? 'bg-yellow-500 text-black shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="תצוגת רשת צפופה"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-yellow-500 text-black shadow' : 'text-slate-400 hover:text-white'
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
                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
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
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-bold text-xs flex items-center space-x-1.5 rtl:space-x-reverse shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">העלאת קבצים</span>
          </button>
        </div>
      </div>

      {/* 2. Folders Bar (Pills shelf inside current location) */}
      {!activeFolderId && folders.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
            <span>תיקיות במאגר ({folders.length})</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {folders.map((folder) => {
              const folderColor = folder.color || '#eab308';

              return (
                <div
                  key={folder.id}
                  onClick={() => setActiveFolderId(folder.id)}
                  className="group flex-shrink-0 bg-slate-900/90 border border-slate-800 hover:border-yellow-500/60 p-2.5 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-md flex items-center space-x-2.5 rtl:space-x-reverse"
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: `${folderColor}20`, borderColor: folderColor, borderWidth: 1 }}
                  >
                    <Folder className="w-4 h-4" style={{ color: folderColor }} />
                  </div>

                  <div className="min-w-0 pr-1">
                    <div className="font-bold text-xs text-white truncate max-w-[130px] group-hover:text-yellow-300 transition-colors">
                      {folder.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {folder.itemCount || 0} קבצים
                    </div>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 rtl:space-x-reverse transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => handleEditFolder(e, folder)}
                      className="p-1 hover:text-yellow-400 text-slate-400 rounded"
                      title="ערוך"
                    >
                      <FolderEdit className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteFolder(e, folder)}
                      className="p-1 hover:text-red-400 text-slate-400 rounded"
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
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-2xl mx-auto">
            📂
          </div>
          <h4 className="text-sm font-bold text-white">לא נמצאו קבצים במיקום זה</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            גרור קבצים לכל מקום בחלון או לחץ על כפתור "העלאת קבצים" למעלה.
          </p>
        </div>
      ) : viewMode === 'list' ? (
        /* LIST VIEW */
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg divide-y divide-slate-800/80 text-xs">
          <div className="p-2.5 bg-slate-950/80 text-[11px] font-bold text-slate-400 grid grid-cols-12 gap-2">
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

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                onDoubleClick={() => handleItemDoubleClick(item)}
                className={`p-2.5 grid grid-cols-12 gap-2 items-center hover:bg-slate-800/60 transition-colors cursor-pointer ${
                  isFocused ? 'bg-yellow-500/15 border-r-4 border-yellow-500' : isSelected ? 'bg-yellow-500/10' : ''
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
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-3.5 h-3.5 text-yellow-400" />
                    ) : (
                      <Square className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <div className="w-7 h-7 rounded-lg bg-black overflow-hidden flex items-center justify-center flex-shrink-0 border border-slate-800">
                    {item.type === 'image' ? (
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      renderFileTypeIcon(item.type, 'w-4 h-4')
                    )}
                  </div>

                  <div className="truncate font-bold text-slate-100 group-hover:text-yellow-300">
                    {item.name}
                  </div>
                </div>

                {/* Component */}
                <div className="col-span-2 hidden sm:block truncate text-slate-400 text-[11px]">
                  {item.sourceModuleLabel || '-'}
                </div>

                {/* Size */}
                <div className="col-span-2 font-mono text-slate-400 text-[11px]">
                  {FileCompressionService.formatBytes(item.sizeBytes)}
                </div>

                {/* Date */}
                <div className="col-span-2 hidden md:block text-slate-500 text-[11px]">
                  {new Date(item.createdAt).toLocaleDateString('he-IL')}
                </div>

                {/* Actions */}
                <div className="col-span-4 sm:col-span-3 md:col-span-1 flex items-center space-x-1 rtl:space-x-reverse justify-end">
                  <button
                    type="button"
                    onClick={(e) => handleDownloadSingle(e, item)}
                    className="p-1 rounded-lg hover:bg-slate-700 text-slate-300"
                    title="הורד"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteSingle(e, item)}
                    className="p-1 rounded-lg hover:bg-red-950 text-slate-400 hover:text-red-400"
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

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                onDoubleClick={() => handleItemDoubleClick(item)}
                className={`group relative bg-slate-900/90 rounded-2xl border overflow-hidden shadow transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isFocused
                    ? 'border-yellow-500 ring-2 ring-yellow-500/50 bg-yellow-500/5 shadow-lg'
                    : isSelected
                    ? 'border-yellow-500 bg-yellow-500/5'
                    : 'border-slate-800 hover:border-yellow-500/50 hover:shadow-md'
                }`}
              >
                {/* Media Thumbnail Box */}
                <div
                  className={`relative w-full bg-black/80 flex items-center justify-center overflow-hidden ${
                    viewMode === 'dense' ? 'h-28' : 'h-36'
                  }`}
                >
                  {item.type === 'video' && (
                    <>
                      <video src={item.url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/90 text-black flex items-center justify-center shadow">
                          <Play className="w-3.5 h-3.5 mr-0.5 fill-black" />
                        </div>
                      </div>
                    </>
                  )}

                  {item.type === 'image' && (
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  )}

                  {item.type === 'audio' && (
                    <div className="flex flex-col items-center justify-center text-yellow-400 space-y-1">
                      <Music className="w-7 h-7 animate-pulse" />
                    </div>
                  )}

                  {item.type === 'document' && (
                    <div className="flex flex-col items-center justify-center text-blue-400 space-y-1">
                      <FileText className="w-7 h-7" />
                    </div>
                  )}

                  {item.type === 'archive' && (
                    <div className="flex flex-col items-center justify-center text-purple-400 space-y-1">
                      <Archive className="w-7 h-7" />
                    </div>
                  )}

                  {item.type === 'code' && (
                    <div className="flex flex-col items-center justify-center text-pink-400 space-y-1">
                      <Code2 className="w-7 h-7" />
                    </div>
                  )}

                  {item.type === 'other' && (
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-1">
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
                        ? 'bg-yellow-500 text-black'
                        : 'bg-black/60 text-slate-400 hover:text-white border border-slate-700'
                    }`}
                  >
                    {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  </button>

                  {/* Top Left Component Badge */}
                  {item.sourceModuleLabel && (
                    <span className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-[9px] text-yellow-300 font-bold px-2 py-0.5 rounded-md border border-slate-800 truncate max-w-[100px]">
                      {item.sourceModuleLabel}
                    </span>
                  )}
                </div>

                {/* Card Bottom Details */}
                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-white truncate group-hover:text-yellow-300 transition-colors" title={item.name}>
                      {item.name}
                    </h5>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                      <span>{FileCompressionService.formatBytes(item.sizeBytes)}</span>
                      <span>{new Date(item.createdAt).toLocaleDateString('he-IL')}</span>
                    </div>
                  </div>

                  {/* Quick Action Buttons on Card */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      {(item.type === 'image' || item.type === 'code' || item.type === 'document') && (
                        <button
                          type="button"
                          onClick={(e) => handleConvertSingle(e, item)}
                          className="p-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 text-xs"
                          title="המרה ודחיסה"
                        >
                          <Sparkles className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleMoveSingle(e, item)}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs"
                        title="העבר לתיקייה"
                      >
                        <FolderInput className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDownloadSingle(e, item)}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
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
                      className="text-[10px] font-bold text-yellow-400 hover:text-yellow-300 flex items-center space-x-1 rtl:space-x-reverse"
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