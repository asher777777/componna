import React, { useState } from 'react';
import { Download, Trash2, X, CheckSquare, Sparkles, FolderInput, Archive } from 'lucide-react';
import { useMediaGallery } from '../context/MediaGalleryContext';
import { FileCompressionService } from '../services/fileCompressionService';

export const BulkActionBar: React.FC = () => {
  const {
    selectedIds,
    clearSelection,
    selectAll,
    filteredItems,
    mediaItems,
    deleteMediaItems,
    selectionMode,
    onSelectMedia,
    setIsMoveModalOpen,
    setItemsToMove,
  } = useMediaGallery();

  const [isZipping, setIsZipping] = useState(false);

  if (selectedIds.length === 0) return null;

  const selectedItems = mediaItems.filter((item) => selectedIds.includes(item.id));

  const handleBulkDownloadIndividual = () => {
    selectedItems.forEach((item, index) => {
      setTimeout(() => {
        FileCompressionService.downloadMedia(item.url, item.name);
      }, index * 300);
    });
  };

  const handleBulkZipDownload = async () => {
    setIsZipping(true);
    try {
      const filesToZip: { name: string; data: Uint8Array | Blob }[] = [];

      for (const item of selectedItems) {
        try {
          const res = await fetch(item.url);
          const blob = await res.blob();
          filesToZip.push({
            name: item.name,
            data: blob,
          });
        } catch (e) {
          console.warn(`[BulkActionBar] Failed to fetch file ${item.name} for zip:`, e);
        }
      }

      if (filesToZip.length > 0) {
        const zipBlob = await FileCompressionService.createZipArchive(filesToZip);
        FileCompressionService.downloadMedia(zipBlob, `media_vault_bundle_${Date.now()}.zip`);
      }
    } catch (err) {
      console.warn('[BulkActionBar] Error zipping files:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleBulkMove = () => {
    setItemsToMove(selectedIds);
    setIsMoveModalOpen(true);
  };

  const handleBulkDelete = async () => {
    if (confirm(`האם אתה בטוח שברצונך למחוק ${selectedIds.length} פריטים נבחרים?`)) {
      await deleteMediaItems(selectedIds);
    }
  };

  const handleConfirmSelection = () => {
    if (onSelectMedia) {
      onSelectMedia(selectedItems);
    }
  };

  return (
    <div
      className="fixed bottom-6 inset-x-0 z-40 max-w-3xl mx-auto px-4 animate-fade-in-up"
      dir="rtl"
    >
      <div className="bg-slate-900/95 backdrop-blur-2xl border-2 border-yellow-500/80 rounded-3xl p-3 sm:p-4 shadow-[0_0_35px_rgba(234,179,8,0.4)] flex flex-wrap items-center justify-between gap-3 text-white">
        {/* Count and Selection stats */}
        <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
          <div className="w-9 h-9 rounded-2xl bg-yellow-500 text-black flex items-center justify-center font-black text-xs shadow-md">
            {selectedIds.length}
          </div>
          <div>
            <div className="text-xs font-bold text-white">קבצים נבחרו</div>
            <button
              onClick={selectAll}
              className="text-[11px] text-yellow-400 hover:text-yellow-300 underline font-semibold cursor-pointer"
            >
              בחר את כל {filteredItems.length} הקבצים
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center space-x-2 rtl:space-x-reverse gap-y-2">
          {selectionMode && onSelectMedia && (
            <button
              onClick={handleConfirmSelection}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold text-xs flex items-center space-x-1.5 rtl:space-x-reverse shadow-lg hover:from-yellow-400 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>השתמש בנבחרים ({selectedIds.length})</span>
            </button>
          )}

          {/* Bulk Move to Folder */}
          <button
            onClick={handleBulkMove}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-yellow-400 font-semibold text-xs flex items-center space-x-1.5 rtl:space-x-reverse border border-slate-700 transition-all cursor-pointer"
            title="העבר קבצים נבחרים לתיקייה"
          >
            <FolderInput className="w-4 h-4" />
            <span>העבר לתיקייה</span>
          </button>

          {/* Bulk Download as ZIP */}
          <button
            onClick={handleBulkZipDownload}
            disabled={isZipping}
            className="px-3 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 font-semibold text-xs flex items-center space-x-1.5 rtl:space-x-reverse border border-purple-800/60 transition-all cursor-pointer"
            title="הורד את כל הנבחרים כקובץ ZIP דחוס אחד"
          >
            <Archive className="w-4 h-4 text-purple-400" />
            <span>{isZipping ? 'דוחס ל-ZIP...' : 'הורד כ-ZIP'}</span>
          </button>

          {/* Bulk Download individual */}
          <button
            onClick={handleBulkDownloadIndividual}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs flex items-center space-x-1.5 rtl:space-x-reverse border border-slate-700 transition-all cursor-pointer"
            title="הורד קבצים בודדים"
          >
            <Download className="w-4 h-4 text-yellow-400" />
            <span>הורד בודדים</span>
          </button>

          {/* Bulk Delete */}
          <button
            onClick={handleBulkDelete}
            className="px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/40 text-xs font-semibold flex items-center space-x-1 rtl:space-x-reverse transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>מחק</span>
          </button>

          <button
            onClick={clearSelection}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="בטל בחירה"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};