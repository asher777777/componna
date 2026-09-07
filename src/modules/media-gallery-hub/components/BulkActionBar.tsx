import React from 'react';
import { Download, Trash2, X, CheckSquare, Sparkles } from 'lucide-react';
import { useMediaGallery } from '../context/MediaGalleryContext';
import { ImageConverterService } from '../services/imageConverterService';

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
  } = useMediaGallery();

  if (selectedIds.length === 0) return null;

  const selectedItems = mediaItems.filter((item) => selectedIds.includes(item.id));

  const handleBulkDownload = () => {
    selectedItems.forEach((item, index) => {
      setTimeout(() => {
        ImageConverterService.downloadMedia(item.url, item.name);
      }, index * 300);
    });
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
      className="fixed bottom-6 inset-x-0 z-40 max-w-2xl mx-auto px-4 animate-fade-in-up"
      dir="rtl"
    >
      <div className="bg-slate-900/95 backdrop-blur-2xl border-2 border-yellow-500/80 rounded-2xl p-3 sm:p-4 shadow-[0_0_35px_rgba(234,179,8,0.4)] flex flex-wrap items-center justify-between gap-3 text-white">
        {/* Count and Selection stats */}
        <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-xl bg-yellow-500 text-black flex items-center justify-center font-black text-xs shadow">
            {selectedIds.length}
          </div>
          <div>
            <div className="text-xs font-bold text-white">פריטים נבחרו</div>
            <button
              onClick={selectAll}
              className="text-[11px] text-yellow-400 hover:text-yellow-300 underline font-semibold cursor-pointer"
            >
              בחר את כל {filteredItems.length} הקבצים
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {selectionMode && onSelectMedia && (
            <button
              onClick={handleConfirmSelection}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold text-xs flex items-center space-x-1.5 rtl:space-x-reverse shadow-lg hover:from-yellow-400 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>השתמש בנבחרים ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={handleBulkDownload}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs flex items-center space-x-1.5 rtl:space-x-reverse border border-slate-700 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-yellow-400" />
            <span>הורד הכל</span>
          </button>

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