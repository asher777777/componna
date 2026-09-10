import React, { useState } from 'react';
import {
  Folder,
  FolderPlus,
  Home,
  Layers,
  FileVideo,
  Image as ImageIcon,
  Music,
  FileText,
  Archive,
  Code2,
  HardDrive,
  FolderEdit,
  Trash2,
  ChevronDown,
  ChevronRight,
  X,
  ChevronLeft,
  SlidersHorizontal,
} from 'lucide-react';
import { useMediaGallery, KNOWN_MODULE_SOURCES } from '../context/MediaGalleryContext';
import { FileCompressionService } from '../services/fileCompressionService';
import { MediaFolder, MediaType } from '../types';

export const MediaDriveSidebar: React.FC<{
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}> = ({ isOpenMobile = false, onCloseMobile }) => {
  const {
    folders,
    activeFolderId,
    setActiveFolderId,
    filters,
    setFilters,
    mediaItems,
    totalStorageBytes,
    setIsFolderModalOpen,
    setEditingFolder,
    deleteFolder,
    isSidebarOpen,
    setIsSidebarOpen,
    theme,
    db,
  } = useMediaGallery();

  const isLight = theme === 'light';

  const [isFoldersCollapsed, setIsFoldersCollapsed] = useState(false);
  const [isComponentsCollapsed, setIsComponentsCollapsed] = useState(false);
  const [isTypesCollapsed, setIsTypesCollapsed] = useState(false);

  // If sidebar is closed on desktop and not in mobile drawer mode, don't render or collapse to 0
  if (!isSidebarOpen && !isOpenMobile) {
    return null;
  }

  const handleSelectRoot = () => {
    setActiveFolderId(null);
    setFilters((prev) => ({
      ...prev,
      typeFilter: 'all',
      sourceModuleFilter: 'all',
      searchQuery: '',
    }));
    if (onCloseMobile) onCloseMobile();
  };

  const handleSelectFolder = (folderId: string) => {
    setActiveFolderId(folderId);
    setFilters((prev) => ({
      ...prev,
      typeFilter: 'all',
      sourceModuleFilter: 'all',
    }));
    if (onCloseMobile) onCloseMobile();
  };

  const handleSelectType = (typeId: MediaType | 'all') => {
    setActiveFolderId(null);
    setFilters((prev) => ({
      ...prev,
      typeFilter: typeId,
      sourceModuleFilter: 'all',
    }));
    if (onCloseMobile) onCloseMobile();
  };

  const handleSelectComponent = (sourceId: string) => {
    setActiveFolderId(null);
    setFilters((prev) => ({
      ...prev,
      sourceModuleFilter: sourceId,
      typeFilter: 'all',
    }));
    if (onCloseMobile) onCloseMobile();
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
      ? `התיקייה "${folder.name}" מכילה ${count} קבצים. למחוק את התיקייה בלבד (הקבצים יישמרו במאגר)?`
      : `האם למחוק את התיקייה "${folder.name}"?`;
    if (confirm(msg)) {
      await deleteFolder(folder.id, false);
    }
  };

  const fileTypeOptions: { id: MediaType | 'all'; label: string; icon: any; count: number }[] = [
    { id: 'all', label: 'כל הקבצים', icon: HardDrive, count: mediaItems.length },
    { id: 'video', label: 'סרטוני וידאו', icon: FileVideo, count: mediaItems.filter((i) => i.type === 'video').length },
    { id: 'image', label: 'תמונות', icon: ImageIcon, count: mediaItems.filter((i) => i.type === 'image').length },
    { id: 'audio', label: 'שמע וקול', icon: Music, count: mediaItems.filter((i) => i.type === 'audio').length },
    { id: 'document', label: 'מסמכי PDF ו-Office', icon: FileText, count: mediaItems.filter((i) => i.type === 'document').length },
    { id: 'archive', label: 'ארכיוני ZIP', icon: Archive, count: mediaItems.filter((i) => i.type === 'archive').length },
    { id: 'code', label: 'קוד ונתונים', icon: Code2, count: mediaItems.filter((i) => i.type === 'code').length },
  ];

  const isRootActive =
    activeFolderId === null &&
    (!filters.sourceModuleFilter || filters.sourceModuleFilter === 'all') &&
    filters.typeFilter === 'all';

  return (
    <aside
      className={`w-64 lg:w-72 flex-shrink-0 border-l flex flex-col justify-between overflow-hidden transition-all duration-300 z-30 ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800 shadow-sm'
          : 'bg-slate-900/95 border-slate-800 text-slate-100'
      } ${isOpenMobile ? 'fixed inset-y-0 right-0 shadow-2xl z-50' : 'flex'}`}
      dir="rtl"
    >
      {/* Sidebar Header / Root Navigation & Hide Button */}
      <div className={`p-3 border-b space-y-2 ${isLight ? 'border-slate-200 bg-slate-50/70' : 'border-slate-800/80'}`}>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleSelectRoot}
            className={`flex-1 p-2 rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
              isRootActive
                ? isLight
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.35)]'
                : isLight
                ? 'text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2 rtl:space-x-reverse min-w-0">
              <Home className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">כל הקבצים (מאגר ראשי)</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                isRootActive
                  ? 'bg-black/20 text-black'
                  : isLight
                  ? 'bg-slate-200 text-slate-700'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {mediaItems.length}
            </span>
          </button>

          {/* Desktop Hide Sidebar button */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className={`hidden md:flex p-1.5 mr-1 rounded-lg transition-colors cursor-pointer ${
              isLight
                ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="הסתר סרגל ניווט"
          >
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* Sidebar Scrollable Section */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5 custom-scrollbar">
        {/* 1. Folders Tree */}
        <div>
          <div className={`flex items-center justify-between px-2 mb-1.5 text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            <button
              type="button"
              onClick={() => setIsFoldersCollapsed(!isFoldersCollapsed)}
              className={`flex items-center space-x-1.5 rtl:space-x-reverse transition-colors cursor-pointer ${
                isLight ? 'hover:text-slate-900' : 'hover:text-white'
              }`}
            >
              {isFoldersCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>תיקיות אחסון ({folders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingFolder(null);
                setIsFolderModalOpen(true);
              }}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                isLight
                  ? 'text-amber-700 hover:text-amber-900 hover:bg-amber-100'
                  : 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10'
              }`}
              title="צור תיקייה חדשה"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>

          {!isFoldersCollapsed && (
            <div className="space-y-1">
              {folders.length === 0 ? (
                <div className={`text-[11px] p-2 text-center rounded-xl ${isLight ? 'text-slate-400 bg-slate-100' : 'text-slate-500 bg-slate-950/40'}`}>
                  אין תיקיות עדיין. לחץ על + ליצירה
                </div>
              ) : (
                folders.map((folder) => {
                  const isSelected = activeFolderId === folder.id;
                  const folderColor = folder.color || '#eab308';

                  return (
                    <div
                      key={folder.id}
                      onClick={() => handleSelectFolder(folder.id)}
                      className={`group w-full p-2 rounded-xl flex items-center justify-between text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? isLight
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-sm font-bold'
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow'
                          : isLight
                          ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2 rtl:space-x-reverse min-w-0">
                        <Folder
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: folderColor }}
                        />
                        <span className="truncate max-w-[120px]">{folder.name}</span>
                      </div>

                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                            isSelected
                              ? isLight
                                ? 'bg-amber-200 text-amber-950 font-bold'
                                : 'bg-yellow-500/30 text-yellow-200'
                              : isLight
                              ? 'bg-slate-200 text-slate-600'
                              : 'bg-slate-950 text-slate-500'
                          }`}
                        >
                          {folder.itemCount || 0}
                        </span>

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
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* 2. File Categories (סוגי קבצים ומדיה) */}
        <div>
          <div className={`flex items-center justify-between px-2 mb-1.5 text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            <button
              type="button"
              onClick={() => setIsTypesCollapsed(!isTypesCollapsed)}
              className={`flex items-center space-x-1.5 rtl:space-x-reverse transition-colors cursor-pointer ${
                isLight ? 'hover:text-slate-900' : 'hover:text-white'
              }`}
            >
              {isTypesCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>סוגי מדיה וקבצים</span>
            </button>
          </div>

          {!isTypesCollapsed && (
            <div className="space-y-1">
              {fileTypeOptions.map((opt) => {
                const isSelected = activeFolderId === null && filters.typeFilter === opt.id;
                const Icon = opt.icon;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectType(opt.id)}
                    className={`w-full p-2 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'bg-slate-200 text-slate-900 font-bold border-r-4 border-amber-500 shadow-sm'
                          : 'bg-slate-800 text-white font-bold border-r-4 border-yellow-500 shadow-sm'
                        : isLight
                        ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 rtl:space-x-reverse min-w-0">
                      <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isLight ? 'text-slate-600' : 'text-slate-400'}`} />
                      <span className="truncate">{opt.label}</span>
                    </div>
                    <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>{opt.count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Component Sources (מיון לפי רכיב יוצר) */}
        <div>
          <div className={`flex items-center justify-between px-2 mb-1.5 text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            <button
              type="button"
              onClick={() => setIsComponentsCollapsed(!isComponentsCollapsed)}
              className={`flex items-center space-x-1.5 rtl:space-x-reverse transition-colors cursor-pointer ${
                isLight ? 'hover:text-slate-900' : 'hover:text-white'
              }`}
            >
              {isComponentsCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span className="flex items-center space-x-1 rtl:space-x-reverse">
                <Layers className={`w-3.5 h-3.5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
                <span>לפי רכיב יוצר</span>
              </span>
            </button>
          </div>

          {!isComponentsCollapsed && (
            <div className="space-y-1">
              {Object.values(KNOWN_MODULE_SOURCES).map((src) => {
                const isSelected =
                  activeFolderId === null &&
                  filters.sourceModuleFilter === src.id;

                const count = src.id === 'all'
                  ? mediaItems.length
                  : mediaItems.filter((i) => i.sourceModule === src.id).length;

                return (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => handleSelectComponent(src.id)}
                    className={`w-full p-2 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'bg-slate-200 text-slate-900 font-bold border-r-4 border-amber-500 shadow-sm'
                          : 'bg-slate-800 text-white font-bold border-r-4 border-yellow-500 shadow-sm'
                        : isLight
                        ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 rtl:space-x-reverse min-w-0">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: src.color }}
                      />
                      <span className="truncate">{src.name}</span>
                    </div>
                    <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Footer: Storage & Cloud status */}
      <div className={`p-3 border-t space-y-2 text-xs ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950/80 border-slate-800 text-slate-400'}`}>
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1.5 rtl:space-x-reverse">
            <HardDrive className={`w-3.5 h-3.5 ${isLight ? 'text-amber-600' : 'text-yellow-400'}`} />
            <span>נפח מאגר:</span>
          </span>
          <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {FileCompressionService.formatBytes(totalStorageBytes)}
          </span>
        </div>

        <div className={`flex items-center justify-between text-[11px] pt-1 border-t ${isLight ? 'border-slate-200 text-slate-500' : 'border-slate-900 text-slate-500'}`}>
          <span className="flex items-center space-x-1.5 rtl:space-x-reverse">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{db ? 'Cloud Firestore Sync' : 'מצב מקומי'}</span>
          </span>
          <span>{mediaItems.length} פריטים</span>
        </div>
      </div>
    </aside>
  );
};
