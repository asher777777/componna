import React, { useState, useRef } from 'react';
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
  Sparkles,
} from 'lucide-react';
import { useMediaGallery, KNOWN_MODULE_SOURCES } from '../context/MediaGalleryContext';
import { FileCompressionService } from '../services/fileCompressionService';
import { MediaItem, MediaType, MediaUploadProgress } from '../types';

export const MediaUploader: React.FC = () => {
  const { addMediaItems, folders, activeFolderId, setActiveFolderId } = useMediaGallery();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadQueue, setUploadQueue] = useState<MediaUploadProgress[]>([]);
  const [tagsInput, setTagsInput] = useState<string>('');
  const [targetFolderId, setTargetFolderId] = useState<string>(activeFolderId || '');
  const [selectedSourceModule, setSelectedSourceModule] = useState<string>('media-gallery-hub');

  // Keep targetFolderId in sync with activeFolderId if activeFolderId changes
  React.useEffect(() => {
    if (activeFolderId) {
      setTargetFolderId(activeFolderId);
    }
  }, [activeFolderId]);

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

    const targetFolder = targetFolderId ? folders.find((f) => f.id === targetFolderId) : null;
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
        folderId: targetFolderId ? targetFolderId : null,
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="w-full space-y-4" dir="rtl">
      {/* Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center ${
          isDragging
            ? 'border-yellow-400 bg-yellow-500/15 scale-[1.01] shadow-[0_0_30px_rgba(234,179,8,0.25)]'
            : 'border-slate-700 hover:border-yellow-500/60 bg-slate-900/60 hover:bg-slate-900/90'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="*/*"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-500/20 via-amber-500/20 to-yellow-500/10 border border-yellow-500/40 flex items-center justify-center text-yellow-400 mb-4 shadow-inner">
          <UploadCloud className="w-8 h-8 animate-bounce" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-white mb-1">
          גרור ושחרר קבצים מכל סוג ובכל גודל לכאן
        </h3>
        <p className="text-xs text-slate-400 max-w-lg mb-4">
          וידאו, תמונות, שמע, מסמכי PDF ו-Office, ארכיוני ZIP, קבצי קוד ונתונים ללא הגבלת משקל
        </p>

        {/* All Supported Formats Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-300">
          <span className="flex items-center space-x-1 rtl:space-x-reverse bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
            <FileVideo className="w-3.5 h-3.5 text-indigo-400" />
            <span>וידאו (MP4, WebM, MOV)</span>
          </span>
          <span className="flex items-center space-x-1 rtl:space-x-reverse bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>תמונות (PNG, JPG, WEBP, SVG)</span>
          </span>
          <span className="flex items-center space-x-1 rtl:space-x-reverse bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
            <Music className="w-3.5 h-3.5 text-amber-400" />
            <span>שמע (MP3, WAV, AAC)</span>
          </span>
          <span className="flex items-center space-x-1 rtl:space-x-reverse bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>מסמכים (PDF, DOCX, XLSX)</span>
          </span>
          <span className="flex items-center space-x-1 rtl:space-x-reverse bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
            <Archive className="w-3.5 h-3.5 text-purple-400" />
            <span>ארכיונים (ZIP, RAR, TAR)</span>
          </span>
          <span className="flex items-center space-x-1 rtl:space-x-reverse bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
            <Code2 className="w-3.5 h-3.5 text-pink-400" />
            <span>קוד ונתונים (JSON, CSV, JS)</span>
          </span>
        </div>
      </div>

      {/* Upload Settings Bar (Folder selection, Source Component, Tags) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-xs">
        {/* Destination Folder */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse min-w-0">
          <Folder className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <span className="text-slate-400 whitespace-nowrap">תיקיית יעד:</span>
          <select
            value={targetFolderId}
            onChange={(e) => setTargetFolderId(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-yellow-500 truncate cursor-pointer"
          >
            <option value="">📁 תיקייה ראשית (Root)</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                📂 {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Source Component */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse min-w-0">
          <Layers className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span className="text-slate-400 whitespace-nowrap">רכיב מקור:</span>
          <select
            value={selectedSourceModule}
            onChange={(e) => setSelectedSourceModule(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-yellow-500 truncate cursor-pointer"
          >
            {Object.values(KNOWN_MODULE_SOURCES)
              .filter((s) => s.id !== 'all')
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>
        </div>

        {/* Optional Tagging Input */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse min-w-0">
          <span className="text-slate-400 whitespace-nowrap">תגיות:</span>
          <input
            type="text"
            placeholder="תגיות מופרדות בפסיק..."
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500"
          />
        </div>
      </div>

      {/* Upload Progress Queue */}
      {uploadQueue.length > 0 && (
        <div className="space-y-3 bg-slate-950/90 border border-slate-800 rounded-2xl p-4 animate-fade-in shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200">
            <span>מעלה קבצים במקביל ({uploadQueue.length})</span>
            <span className="text-[11px] text-yellow-400">אחסון מאובטח ב-Cloud Storage</span>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto">
            {uploadQueue.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse truncate max-w-[70%]">
                    {item.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : item.status === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    ) : (
                      <span className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    )}
                    <span className="text-slate-200 font-medium truncate">{item.fileName}</span>
                  </div>

                  <span className="text-[11px] font-bold">
                    {item.status === 'completed' ? (
                      <span className="text-emerald-400">הועלה בהצלחה 100%</span>
                    ) : (
                      <span className="text-yellow-400">{item.progressPercent}%</span>
                    )}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
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
    </div>
  );
};