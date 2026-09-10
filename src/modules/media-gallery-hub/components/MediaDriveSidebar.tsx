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
  Database,
  CheckCircle2,
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
    db,
  } = useMediaGallery();

  const [isFoldersCollapsed, setIsFoldersCollapsed] = useState(false);
  const [isComponentsCollapsed, setIsComponentsCollapsed] = useState(false);
  const [isTypesCollapsed, setIsTypesCollapsed] = useState(false);

  const handleSelectRoot = () => {
    setActiveFolderId(null);
    if (onCloseMobile) onCloseMobile();
  };

  const handleSelectFolder = (folderId: string) => {
    setActiveFolderId(folderId);
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
      ? `התיקייה "${folder.name}" מכילה ${count} קבצים. למחוק את התיקייה בלבד (הקבצים יישמרו)?`
      : `האם למחוק את התיקייה "${folder.name}"?`;
    if (confirm(msg)) {
      await deleteFolder(folder.id, false);
    }
  };

  const fileTypeOptions: { id: MediaType | 'all'; label: string; icon: any; count: number }[] = [
    { id: 'all', label: 'הכל', icon: HardDrive, count: mediaItems.length },
    { id: 'video', label: 'סרטוני וידאו', icon: FileVideo, count: mediaItems.filter((i) => i.type === 'video').length },
    { id: 'image', label: 'תמונות', icon: ImageIcon, count: mediaItems.filter((i) => i.type === 'image').length },
    { id: 'audio', label: 'שמע וקול', icon: Music, count: mediaItems.filter((i) => i.type === 'audio').length },
    { id: 'document', label: 'מסמכי PDF ו-Office', icon: FileText, count: mediaItems.filter((i) => i.type === 'document').length },
    { id: 'archive', label: 'ארכיוני ZIP', icon: Archive, count: mediaItems.filter((i) => i.type === 'archive').length },
    { id: 'code', label: 'קוד ונתונים', icon: Code2, count: mediaItems.filter((i) => i.type === 'code').length },
  ];

  return (
    <aside
      className={`w-64 lg:w-72 flex-shrink-0 bg-slate-900/95 border-l border-slate-800 flex flex-col justify-between overflow-hidden transition-all duration-300 z-30 ${
        isOpenMobile ? 'fixed inset-y-0 right-0 shadow-2xl z-50' : 'hidden md:flex'
      }`}
      dir="rtl"
    >
      {/* Sidebar Header / Root navigation */}
      <div className="p-4 border-b border-slate-800/80 space-y-2">
        <button
          type="button"
          onClick={handleSelectRoot}
          className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
            activeFolderId === null && (!filters.sourceModuleFilter || filters.sourceModuleFilter === 'all') && filters.typeFilter === 'all'
              ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.35)]'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse min-w-0">
            <Home className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">כל הקבצים (מאגר ראשי)</span>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
              activeFolderId === null ? 'bg-black/25 text-black' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {mediaItems.length}
          </span>
        </button>
      </div>

      {/* Sidebar Scrollable Section */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5 custom-scrollbar">
        {/* 1. Folders Tree */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5 text-xs font-bold text-slate-400">
            <button
              type="button"
              onClick={() => setIsFoldersCollapsed(!isFoldersCollapsed)}
              className="flex items-center space-x-1.5 rtl:space-x-reverse hover:text-white transition-colors cursor-pointer"
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
              className="p-1 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-colors cursor-pointer"
              title="צור תיקייה חדשה"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>

          {!isFoldersCollapsed && (
            <div className="space-y-1">
              {folders.length === 0 ? (
                <div className="text-[11px] text-slate-500 p-2 text-center bg-slate-950/40 rounded-xl">
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
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow'
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
                            isSelected ? 'bg-yellow-500/30 text-yellow-200' : 'bg-slate-950 text-slate-500'
                          }`}
                        >
                          {folder.itemCount || 0}
                        </span>

                        <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 rtl:space-x-reverse transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => handleEditFolder(e, folder)}
                            className="p-1 hover:text-yellow-400 text-slate-400"
                            title="ערוך"
                          >
                            <FolderEdit className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteFolder(e, folder)}
                            className="p-1 hover:text-red-400 text-slate-400"
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

        {/* 2. Component Sources (מיון לפי רכיב יוצר) */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5 text-xs font-bold text-slate-400">
            <button
              type="button"
              onClick={() => setIsComponentsCollapsed(!isComponentsCollapsed)}
              className="flex items-center space-x-1.5 rtl:space-x-reverse hover:text-white transition-colors cursor-pointer"
            >
              {isComponentsCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span className="flex items-center space-x-1 rtl:space-x-reverse">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>לפי רכיב יוצר</span>
              </span>
            </button>
          </div>

          {!isComponentsCollapsed && (
            <div className="space-y-1">
              {Object.values(KNOWN_MODULE_SOURCES).map((src) => {
                const isSelected = (filters.sourceModuleFilter || 'all') === src.id;
                const count = src.id === 'all'
                  ? mediaItems.length
                  : mediaItems.filter((i) => i.sourceModule === src.id).length;

                return (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, sourceModuleFilter: src.id }));
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full p-2 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 text-white font-bold border-r-4 border-yellow-500 shadow-sm'
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
                    <span className="text-[10px] text-slate-500 font-mono">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. File Categories (סוגי קבצים) */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5 text-xs font-bold text-slate-400">
            <button
              type="button"
              onClick={() => setIsTypesCollapsed(!isTypesCollapsed)}
              className="flex items-center space-x-1.5 rtl:space-x-reverse hover:text-white transition-colors cursor-pointer"
            >
              {isTypesCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>סוגי מדיה וקבצים</span>
            </button>
          </div>

          {!isTypesCollapsed && (
            <div className="space-y-1">
              {fileTypeOptions.map((opt) => {
                const isSelected = (filters.typeFilter || 'all') === opt.id;
                const Icon = opt.icon;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, typeFilter: opt.id as any }));
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full p-2 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 text-white font-bold border-r-4 border-yellow-500 shadow-sm'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 rtl:space-x-reverse min-w-0">
                      <Icon className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                      <span className="truncate">{opt.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{opt.count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Footer: Storage & Cloud status */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center space-x-1.5 rtl:space-x-reverse">
            <HardDrive className="w-3.5 h-3.5 text-yellow-400" />
            <span>נפח מאגר:</span>
          </span>
          <span className="font-mono font-bold text-white">
            {FileCompressionService.formatBytes(totalStorageBytes)}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-900">
          <span className="flex items-center space-x-1.5 rtl:space-x-reverse">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{db ? 'Cloud Firestore Sync' : 'מצב מקומי'}</span>
          </span>
          <span>{mediaItems.length} פריטים</span>
        </div>
      </div>
    </aside>
  );
};
