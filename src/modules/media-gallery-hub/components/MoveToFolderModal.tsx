import React, { useState } from 'react';
import { X, FolderInput, Folder, Check, Home, Plus } from 'lucide-react';
import { useMediaGallery } from '../context/MediaGalleryContext';

export const MoveToFolderModal: React.FC = () => {
  const {
    isMoveModalOpen,
    setIsMoveModalOpen,
    itemsToMove,
    setItemsToMove,
    folders,
    moveItemsToFolder,
    setIsFolderModalOpen,
    clearSelection,
  } = useMediaGallery();

  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isMoveModalOpen) return null;

  const handleClose = () => {
    setIsMoveModalOpen(false);
    setItemsToMove([]);
    setSelectedTargetId(null);
  };

  const handleConfirmMove = async () => {
    if (itemsToMove.length === 0) return;
    setIsSubmitting(true);
    try {
      await moveItemsToFolder(itemsToMove, selectedTargetId);
      clearSelection();
      handleClose();
    } catch (e) {
      console.warn('[MoveToFolderModal] Error moving items:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in text-slate-100"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400">
              <FolderInput className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">העברת קבצים לתיקייה</h2>
              <p className="text-xs text-slate-400">
                נבחרו {itemsToMove.length} קבצים להעברה
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body - Folder List */}
        <div className="p-5 space-y-3 max-h-80 overflow-y-auto">
          <div className="text-xs font-bold text-slate-300 mb-2">בחר תיקיית יעד:</div>

          {/* Root Directory Option */}
          <button
            type="button"
            onClick={() => setSelectedTargetId(null)}
            className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
              selectedTargetId === null
                ? 'border-yellow-500 bg-yellow-500/15 text-white shadow-md'
                : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-yellow-400">
                <Home className="w-4 h-4" />
              </div>
              <div className="text-right">
                <div className="text-xs font-bold">תיקייה ראשית (Root)</div>
                <div className="text-[10px] text-slate-400">העברה מחוץ לכל תיקייה</div>
              </div>
            </div>

            {selectedTargetId === null && <Check className="w-4 h-4 text-yellow-400" />}
          </button>

          {/* Folder Options */}
          {folders.map((folder) => {
            const isSelected = selectedTargetId === folder.id;
            const folderColor = folder.color || '#eab308';

            return (
              <button
                key={folder.id}
                type="button"
                onClick={() => setSelectedTargetId(folder.id)}
                className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'border-yellow-500 bg-yellow-500/15 text-white shadow-md'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: `${folderColor}20`, borderColor: folderColor, borderWidth: 1 }}
                  >
                    <Folder className="w-4 h-4" style={{ color: folderColor }} />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold truncate max-w-[200px]">{folder.name}</div>
                    <div className="text-[10px] text-slate-400">{folder.itemCount || 0} קבצים</div>
                  </div>
                </div>

                {isSelected && <Check className="w-4 h-4 text-yellow-400" />}
              </button>
            );
          })}

          {/* Add New Folder Quick Action */}
          <button
            type="button"
            onClick={() => {
              handleClose();
              setIsFolderModalOpen(true);
            }}
            className="w-full p-2.5 rounded-2xl border border-dashed border-slate-700 text-slate-400 hover:text-yellow-400 hover:border-yellow-500/50 flex items-center justify-center space-x-2 rtl:space-x-reverse text-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>צור תיקייה חדשה...</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/80 border-t border-slate-700/80 flex items-center justify-end space-x-2 rtl:space-x-reverse">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            ביטול
          </button>

          <button
            type="button"
            onClick={handleConfirmMove}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold text-xs flex items-center space-x-1.5 rtl:space-x-reverse shadow-lg hover:from-yellow-400 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>העבר עכשיו</span>
          </button>
        </div>
      </div>
    </div>
  );
};
