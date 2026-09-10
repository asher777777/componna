import React, { useState, useEffect } from 'react';
import { X, FolderPlus, FolderEdit, Check, Folder } from 'lucide-react';
import { useMediaGallery } from '../context/MediaGalleryContext';

const FOLDER_COLORS = [
  { label: 'צהוב זהב', color: '#eab308' },
  { label: 'סגול רויאל', color: '#8b5cf6' },
  { label: 'כחול ספיר', color: '#3b82f6' },
  { label: 'ירוק אמרלד', color: '#10b981' },
  { label: 'כתום שקיעה', color: '#f97316' },
  { label: 'ורוד פוקסיה', color: '#ec4899' },
  { label: 'טורקיז', color: '#06b6d4' },
  { label: 'אפור מתכתי', color: '#64748b' },
];

export const FolderManagerModal: React.FC = () => {
  const {
    isFolderModalOpen,
    setIsFolderModalOpen,
    editingFolder,
    setEditingFolder,
    createFolder,
    updateFolder,
    setActiveFolderId,
  } = useMediaGallery();

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#eab308');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (editingFolder) {
      setName(editingFolder.name);
      setSelectedColor(editingFolder.color || '#eab308');
    } else {
      setName('');
      setSelectedColor('#eab308');
    }
    setErrorMessage('');
  }, [editingFolder, isFolderModalOpen]);

  if (!isFolderModalOpen) return null;

  const handleClose = () => {
    setIsFolderModalOpen(false);
    setEditingFolder(null);
    setName('');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('נא להזין שם לתיקייה');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (editingFolder) {
        await updateFolder(editingFolder.id, {
          name: name.trim(),
          color: selectedColor,
        });
      } else {
        const created = await createFolder(name.trim(), selectedColor);
        setActiveFolderId(created.id);
      }
      handleClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'שגיאה בשמירת התיקייה');
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
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md"
              style={{ backgroundColor: `${selectedColor}25`, borderColor: selectedColor, borderWidth: 1 }}
            >
              {editingFolder ? (
                <FolderEdit className="w-5 h-5" style={{ color: selectedColor }} />
              ) : (
                <FolderPlus className="w-5 h-5" style={{ color: selectedColor }} />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingFolder ? 'עריכת תיקייה' : 'יצירת תיקייה חדשה'}
              </h2>
              <p className="text-xs text-slate-400">ארגון וסדר של קבצים ומדיה במערכת</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 text-red-200 text-xs rounded-xl">
              {errorMessage}
            </div>
          )}

          {/* Folder Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              שם התיקייה <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="למשל: סרטוני מוצר 2026, מסמכים משפטיים..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>

          {/* Folder Color Palette */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">צבע התיקייה:</label>
            <div className="grid grid-cols-4 gap-2.5">
              {FOLDER_COLORS.map((c) => {
                const isSelected = selectedColor === c.color;
                return (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => setSelectedColor(c.color)}
                    className={`p-2 rounded-xl flex items-center justify-center space-x-1.5 rtl:space-x-reverse border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-white ring-2 ring-white/40 bg-slate-800 scale-105 shadow-md'
                        : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-sm flex-shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="text-[10px] text-slate-300 truncate">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center space-x-3 rtl:space-x-reverse">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-inner"
              style={{ backgroundColor: `${selectedColor}20`, borderColor: selectedColor, borderWidth: 1 }}
            >
              <Folder className="w-5 h-5" style={{ color: selectedColor }} />
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-white block truncate">
                {name.trim() || 'שם התיקייה לתצוגה'}
              </span>
              <span className="text-[10px] text-slate-400">תיקיית אחסון</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-end space-x-2 rtl:space-x-reverse">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              ביטול
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold text-xs flex items-center space-x-1.5 rtl:space-x-reverse shadow-lg hover:from-yellow-400 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{editingFolder ? 'שמור שינויים' : 'צור תיקייה'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
