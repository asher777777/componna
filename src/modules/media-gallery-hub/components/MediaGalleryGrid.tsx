import React, { useState } from 'react';
import {
  Search,
  Filter,
  FileVideo,
  Image as ImageIcon,
  Music,
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
  Plus,
} from 'lucide-react';
import { useMediaGallery } from '../context/MediaGalleryContext';
import { ImageConverterService } from '../services/imageConverterService';
import { MediaItem, MediaType } from '../types';

export const MediaGalleryGrid: React.FC = () => {
  const {
    filteredItems,
    filters,
    setFilters,
    selectedIds,
    toggleSelect,
    setPreviewItem,
    setConverterItem,
    deleteMediaItems,
    selectionMode,
    onSelectMedia,
    maxSelectCount,
  } = useMediaGallery();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleQuickPick = (item: MediaItem) => {
    if (selectionMode && onSelectMedia) {
      onSelectMedia([item]);
    } else {
      setPreviewItem(item);
    }
  };

  const handleDownloadSingle = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    ImageConverterService.downloadMedia(item.url, item.name);
  };

  const handleDeleteSingle = async (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    if (confirm(`האם למחוק את "${item.name}"?`)) {
      await deleteMediaItems([item.id]);
    }
  };

  const handleConvertSingle = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    setConverterItem(item);
  };

  return (
    <div className="space-y-5" dir="rtl">
      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg space-y-4">
        {/* Top row: Search input + View mode toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="חפש לפי שם קובץ, תגית או סוג..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            {/* Sort Dropdown */}
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
              className="bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 cursor-pointer"
            >
              <option value="date_desc">📅 החדשים ביותר</option>
              <option value="date_asc">📅 הישנים ביותר</option>
              <option value="size_desc">💾 הקבצים הגדולים</option>
              <option value="name_asc">🔤 לפי שם (א-ת)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-yellow-500 text-black shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="תצוגת רשת"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-yellow-500 text-black shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="תצוגת רשימה"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom row: Type Tabs */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'הכל', icon: null, count: null },
            { id: 'video', label: 'סרטונים', icon: FileVideo, count: null },
            { id: 'image', label: 'תמונות', icon: ImageIcon, count: null },
            { id: 'audio', label: 'שמע וקול', icon: Music, count: null },
          ].map((tab) => {
            const isSelected = filters.typeFilter === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, typeFilter: tab.id as any }))}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center space-x-1.5 rtl:space-x-reverse transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.35)]'
                    : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Media Items Container */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-3xl mx-auto">
            📂
          </div>
          <h4 className="text-base font-bold text-white">לא נמצאו קבצי מדיה</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            גרור קבצים לתיבת ההעלאה למעלה או נסה לשנות את הסינון או מילות החיפוש.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => handleQuickPick(item)}
                className={`group relative bg-slate-900/90 rounded-3xl border overflow-hidden shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-yellow-500 ring-2 ring-yellow-500/50 bg-yellow-500/5'
                    : 'border-slate-800 hover:border-yellow-500/50'
                }`}
              >
                {/* Media Preview Box */}
                <div className="relative w-full h-44 bg-black/80 flex items-center justify-center overflow-hidden">
                  {item.type === 'video' && (
                    <>
                      <video
                        src={item.url}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/90 text-black flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                          <Play className="w-4 h-4 mr-0.5 fill-black" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md text-[10px] text-yellow-300 font-bold px-2 py-0.5 rounded-full border border-yellow-500/30">
                        🎬 וידאו
                      </span>
                    </>
                  )}

                  {item.type === 'image' && (
                    <>
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md text-[10px] text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                        🖼️ תמונה
                      </span>
                    </>
                  )}

                  {item.type === 'audio' && (
                    <div className="flex flex-col items-center justify-center text-yellow-400 p-4 space-y-2">
                      <div className="w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center animate-pulse">
                        <Music className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] text-slate-300 font-medium">קובץ שמע</span>
                    </div>
                  )}

                  {/* Multi-Select Checkbox overlay */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(item.id);
                    }}
                    className={`absolute top-3 right-3 w-7 h-7 rounded-xl flex items-center justify-center transition-all shadow-md cursor-pointer ${
                      isSelected
                        ? 'bg-yellow-500 text-black'
                        : 'bg-black/70 text-slate-400 hover:text-white border border-slate-700'
                    }`}
                  >
                    {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>
                </div>

                {/* Card Content & Details */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-yellow-300 transition-colors" title={item.name}>
                      {item.name}
                    </h4>

                    <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                      <span className="flex items-center space-x-1 rtl:space-x-reverse">
                        <HardDrive className="w-3 h-3 text-slate-500" />
                        <span>{ImageConverterService.formatBytes(item.sizeBytes)}</span>
                      </span>
                      <span>{new Date(item.createdAt).toLocaleDateString('he-IL')}</span>
                    </div>

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="bg-slate-950 text-slate-300 text-[9px] px-2 py-0.5 rounded-md border border-slate-800"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      {item.type === 'image' && (
                        <button
                          type="button"
                          onClick={(e) => handleConvertSingle(e, item)}
                          className="p-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/40 text-xs transition-colors cursor-pointer"
                          title="המר תמונה"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleDownloadSingle(e, item)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition-colors cursor-pointer"
                        title="הורד קובץ"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteSingle(e, item)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 text-xs transition-colors cursor-pointer"
                        title="מחק קובץ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuickPick(item)}
                      className="text-[11px] font-bold text-yellow-400 hover:text-yellow-300 flex items-center space-x-1 rtl:space-x-reverse"
                    >
                      <Eye className="w-3 h-3" />
                      <span>{selectionMode ? 'בחר קובץ' : 'צפה'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-lg divide-y divide-slate-800/80">
          {filteredItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => handleQuickPick(item)}
                className={`p-3 sm:p-4 flex items-center justify-between gap-4 hover:bg-slate-800/50 transition-colors cursor-pointer ${
                  isSelected ? 'bg-yellow-500/10' : ''
                }`}
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(item.id);
                    }}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  <div className="w-10 h-10 rounded-xl bg-black overflow-hidden flex items-center justify-center flex-shrink-0 border border-slate-800">
                    {item.type === 'video' ? (
                      <FileVideo className="w-5 h-5 text-indigo-400" />
                    ) : item.type === 'image' ? (
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Music className="w-5 h-5 text-amber-400" />
                    )}
                  </div>

                  <div className="truncate">
                    <div className="font-bold text-xs text-white truncate">{item.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {ImageConverterService.formatBytes(item.sizeBytes)} •{' '}
                      {new Date(item.createdAt).toLocaleDateString('he-IL')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 rtl:space-x-reverse flex-shrink-0">
                  {item.type === 'image' && (
                    <button
                      type="button"
                      onClick={(e) => handleConvertSingle(e, item)}
                      className="p-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 text-xs cursor-pointer"
                      title="המר תמונה"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => handleDownloadSingle(e, item)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                    title="הורד קובץ"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteSingle(e, item)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/40 text-xs cursor-pointer"
                    title="מחק"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};