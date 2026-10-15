import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileVideo,
  Image as ImageIcon,
  Music,
  FileText,
  Archive,
  Code2,
  CheckCircle2,
  AlertCircle,
  Folder,
  Layers,
  X,
  Plus,
} from 'lucide-react';
import { useMediaGallery, KNOWN_MODULE_SOURCES } from '../context/MediaGalleryContext';
import { FileCompressionService } from '../services/fileCompressionService';
import { MediaItem, MediaUploadProgress } from '../types';

export const MediaUploader: React.FC = () => {
  const {
    addMediaItems,
    folders,
    activeFolderId,
    isUploaderOpen,
    setIsUploaderOpen,
  } = useMediaGallery();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isWindowDragging, setIsWindowDragging] = useState<boolean>(false);
  const [uploadQueue, setUploadQueue] = useState<MediaUploadProgress[]>([]);
  const [tagsInput, setTagsInput] = useState<string>('');
  const [targetFolderId, setTargetFolderId] = useState<string>(activeFolderId || '');
  const [selectedSourceModule, setSelectedSourceModule] = useState<string>('media-gallery-hub');

  // Sync target folder with active folder
  useEffect(() => {
    setTargetFolderId(activeFolderId || '');
  }, [activeFolderId]);

  // Global window drag & drop listener
  useEffect(() => {
    let dragCounter = 0;

    const handleWindowDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
        setIsWindowDragging(true);
      }
    };

    const handleWindowDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        setIsWindowDragging(false);
        dragCounter = 0;
      }
    };

    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsWindowDragging(false);
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    };

    window.addEventListener('dragenter', handleWindowDragEnter);
    window.addEventListener('dragleave', handleWindowDragLeave);
    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('drop', handleWindowDrop);

    return () => {
      window.removeEventListener('dragenter', handleWindowDragEnter);
      window.removeEventListener('dragleave', handleWindowDragLeave);
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, [targetFolderId, selectedSourceModule, tagsInput, folders, activeFolderId]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const initialQueue: MediaUploadProgress[] = fileArray.map((f, idx) => ({
      id: `queue_${Date.now()}_${idx}`,
      fileName: f.name,
      type: FileCompressionService.detectFileType(f.name, f.type).type,
      progressPercent: 5,
      status: 'uploading',
    }));

    setUploadQueue((prev) => [...initialQueue, ...prev]);

    const effectiveFolderId = targetFolderId || activeFolderId || null;
    const targetFolder = effectiveFolderId ? folders.find((f) => f.id === effectiveFolderId) : null;
    const createdItems: MediaItem[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const { type, mimeType } = FileCompressionService.detectFileType(file.name, file.type);
      const objectUrl = URL.createObjectURL(file);

      const sourceInfo = KNOWN_MODULE_SOURCES[selectedSourceModule] || KNOWN_MODULE_SOURCES['media-gallery-hub'];

      const newItem: MediaItem = {
        id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        name: file.name,
        type,
        mimeType: file.type || mimeType,
        url: objectUrl,
        sizeBytes: file.size,
        createdAt: Date.now() - i,
        tags: tags.length > 0 ? tags : [type, selectedSourceModule],
        folderId: effectiveFolderId,
        folderName: targetFolder ? targetFolder.name : undefined,
        sourceModule: selectedSourceModule,
        sourceModuleLabel: sourceInfo.name,
      };

      createdItems.push(newItem);
    }

    // Parallel concurrent upload
    await addMediaItems(createdItems, fileArray, (fileIdx, pct) => {
      setUploadQueue((prev) =>
        prev.map((q, idx) =>
          idx === fileIdx
            ? { ...q, progressPercent: pct, status: pct >= 100 ? 'completed' : 'uploading' }
            : q
        )
      );
    });

    setUploadQueue((prev) =>
      prev.map((q) => ({ ...q, progressPercent: 100, status: 'completed' }))
    );

    // Auto-clear successful queue after 4s
    setTimeout(() => {
      setUploadQueue((prev) => prev.filter((q) => q.status !== 'completed'));
    }, 4000);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="*/*"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* 1. Global Full-Screen Drag & Drop Overlay */}
      {isWindowDragging && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md border-4 border-dashed border-yellow-400 flex flex-col items-center justify-center animate-fade-in text-white p-6"
          dir="rtl"
        >
          <div className="w-24 h-24 rounded-3xl bg-yellow-500/20 border-2 border-yellow-400 flex items-center justify-center text-yellow-400 mb-6 animate-bounce shadow-[0_0_50px_rgba(234,179,8,0.4)]">
            <UploadCloud className="w-12 h-12" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mb-2 text-white text-center">
            שחרר קבצים כאן להעלאה מיידית!
          </h2>
          <p className="text-sm text-slate-300 text-center max-w-md">
            הקבצים יועלו אוטומטית לענן ויישמרו{' '}
            {targetFolderId ? `בתיקייה "${folders.find((f) => f.id === targetFolderId)?.name}"` : 'במאגר הראשי'}
          </p>
        </div>
      )}

      {/* 2. Compact Collapsible Upload Tray */}
      {isUploaderOpen && (
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-up" dir="rtl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
              <div className="w-8 h-8 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">העלאת קבצים חדשים למאגר</h3>
                <p className="text-[11px] text-slate-400">כל סוגי הקבצים והמשקלים ללא הגבלה</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsUploaderOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Compact Drop Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-yellow-500/80 bg-slate-950/60 hover:bg-slate-950 p-6 rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2"
          >
            <UploadCloud className="w-8 h-8 text-yellow-400" />
            <div className="text-xs font-bold text-white">
              לחץ כאן לבחירת קבצים מהמחשב או גרור קבצים לכל מקום בחלון
            </div>
            <div className="text-[10px] text-slate-400">
              וידאו, תמונות, שמע, מסמכים, ארכיונים, קוד ונתונים
            </div>
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Target folder */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse bg-slate-950 p-2 rounded-xl border border-slate-800">
              <Folder className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <span className="text-slate-400 whitespace-nowrap text-[11px]">תיקייה:</span>
              <select
                value={targetFolderId}
                onChange={(e) => setTargetFolderId(e.target.value)}
                className="flex-1 bg-transparent text-white font-medium focus:outline-none truncate cursor-pointer text-xs"
              >
                <option value="" className="bg-slate-900">📁 מאגר ראשי (Root)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id} className="bg-slate-900">
                    📂 {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Source module */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse bg-slate-950 p-2 rounded-xl border border-slate-800">
              <Layers className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span className="text-slate-400 whitespace-nowrap text-[11px]">רכיב:</span>
              <select
                value={selectedSourceModule}
                onChange={(e) => setSelectedSourceModule(e.target.value)}
                className="flex-1 bg-transparent text-white font-medium focus:outline-none truncate cursor-pointer text-xs"
              >
                {Object.values(KNOWN_MODULE_SOURCES)
                  .filter((s) => s.id !== 'all')
                  .map((s) => (
                    <option key={s.id} value={s.id} className="bg-slate-900">
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Tags input */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 whitespace-nowrap text-[11px]">תגיות:</span>
              <input
                type="text"
                placeholder="תגיות בפסיק..."
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Live Upload Progress Queue Floating Overlay */}
      {uploadQueue.length > 0 && (
        <div className="space-y-2 bg-slate-950/95 border border-slate-800 rounded-2xl p-3 animate-fade-in shadow-2xl" dir="rtl">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200">
            <span>מעלה קבצים לענן ({uploadQueue.length})</span>
            <span className="text-[11px] text-yellow-400">העלאה מהירה</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {uploadQueue.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse truncate max-w-[70%]">
                    {item.status === 'completed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    ) : item.status === 'error' ? (
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    )}
                    <span className="text-slate-200 font-medium truncate text-xs">{item.fileName}</span>
                  </div>

                  <span className="text-[10px] font-bold">
                    {item.status === 'completed' ? (
                      <span className="text-emerald-400">100%</span>
                    ) : (
                      <span className="text-yellow-400">{item.progressPercent}%</span>
                    )}
                  </span>
                </div>

                <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      item.status === 'completed'
                        ? 'bg-emerald-400'
                        : 'bg-gradient-to-r from-yellow-500 to-amber-400'
                    }`}
                    style={{ width: `${Math.max(5, item.progressPercent)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};