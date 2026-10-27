import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Search, 
  Tag, 
  Sparkles,
  DollarSign
} from 'lucide-react';
import { GlossaryItem } from '../types';
import { receiptGlossaryService } from '../services/receiptGlossaryService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem?: (item: GlossaryItem) => void;
}

export const ReceiptGlossaryManagerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectItem,
}) => {
  const [items, setItems] = useState<GlossaryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // New item form
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newPrice, setNewPrice] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('כללי');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    const unsub = receiptGlossaryService.subscribe((list) => {
      setItems(list);
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const filteredItems = searchQuery.trim()
    ? receiptGlossaryService.search(searchQuery)
    : items;

  const handleAddNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await receiptGlossaryService.saveOrUpdateItem({
        name: newName.trim(),
        defaultPrice: parseFloat(newPrice) || 0,
        category: newCategory.trim() || 'כללי',
      });
      setNewName('');
      setNewPrice('');
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('האם אתה בטוח שברצונך למחוק פריט זה מהגלוסרי?')) {
      await receiptGlossaryService.deleteItem(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm" dir="rtl">
      <div className="bg-[#101522] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden text-right">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">גלוסרי פריטי קבלה ומחירון מובנה</h3>
              <p className="text-xs text-slate-400">ניהול שמות פריטים, מטרות תקבול וסכומים אוטומטיים</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-slate-800/80 bg-[#141824] flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חפש בגלוסרי לפי שם פריט או קטגוריה..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 pl-9 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>הוסף פריט חדש</span>
          </button>
        </div>

        {/* Add New Item Inline Form */}
        {showAddForm && (
          <form onSubmit={handleAddNew} className="p-4 bg-indigo-950/20 border-b border-indigo-500/30 space-y-3 animate-in fade-in">
            <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>הוספת פריט חדש לגלוסרי</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">שם הפריט / מטרה *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="לדוגמה: תרומה לפרויקט פשוט מושלם"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">סכום ברירת מחדל (₪)</label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="1500"
                  min="0"
                  step="0.01"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">קטגוריה</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="פרויקטים / תרומות / חסד"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg"
              >
                ביטול
              </button>
              <button
                type="submit"
                disabled={saving || !newName.trim()}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>שמור בגלוסרי</span>
              </button>
            </div>
          </form>
        )}

        {/* List of items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              לא נמצאו פריטים בגלוסרי.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (onSelectItem) {
                      onSelectItem(item);
                      onClose();
                    }
                  }}
                  className={`p-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 hover:border-indigo-500/50 transition-all flex items-center justify-between gap-2.5 group ${
                    onSelectItem ? 'cursor-pointer' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {item.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {item.category && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                          {item.category}
                        </span>
                      )}
                      {item.usageCount !== undefined && item.usageCount > 0 && (
                        <span className="text-[10px] text-slate-500">
                          {item.usageCount} שימושים
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.defaultPrice > 0 && (
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-mono">
                        ₪{Number(item.defaultPrice).toLocaleString('he-IL')}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, e)}
                      title="מחק מהגלוסרי"
                      className="p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>סה"כ {items.length} פריטים שמורים בגלוסרי</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
          >
            סגור
          </button>
        </div>

      </div>
    </div>
  );
};
