import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Tag, Plus, Check, Search, BookOpen, Layers } from 'lucide-react';
import { GlossaryItem } from '../types';
import { receiptGlossaryService } from '../services/receiptGlossaryService';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSelectItem: (item: GlossaryItem) => void;
  placeholder?: string;
  unitPrice?: number;
}

export const ReceiptItemGlossaryAutocomplete: React.FC<Props> = ({
  value,
  onChange,
  onSelectItem,
  placeholder = 'הקלד תיאור פריט / מטרה (לדוגמה: תרומה לפרויקט פשוט מושלם)...',
  unitPrice,
}) => {
  const [items, setItems] = useState<GlossaryItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = receiptGlossaryService.subscribe((list) => {
      setItems(list);
    });
    return unsub;
  }, []);

  const filteredItems = value.trim()
    ? receiptGlossaryService.search(value)
    : items.slice(0, 8);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: GlossaryItem) => {
    onSelectItem(item);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev =>
        prev < filteredItems.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
        e.preventDefault();
        handleSelect(filteredItems[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef} dir="rtl">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-all pl-8"
          placeholder={placeholder}
          required
        />
        <div className="absolute left-2.5 flex items-center pointer-events-none text-slate-500">
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
        </div>
      </div>

      {/* Glossary Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 max-h-64 overflow-y-auto bg-[#0f1422] border border-slate-700 rounded-2xl shadow-2xl z-50 p-1.5 divide-y divide-slate-800/80 backdrop-blur-xl text-right">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 flex items-center justify-between bg-slate-900/60 rounded-xl mb-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              {value.trim() ? `הצעות מגלוסרי הפריטים (${filteredItems.length})` : 'פריטים נפוצים מהגלוסרי'}
            </span>
            <span className="text-[10px] text-slate-500">בחירה ממלאת אוטומטית שם וסכום</span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-400">
              אין פריט תואם בגלוסרי.
              <div className="text-[10px] text-slate-500 mt-0.5">
                הפריט יישמר אוטומטית בגלוסרי בעת הפקת הקבלה.
              </div>
            </div>
          ) : (
            <div className="space-y-1 pt-1">
              {filteredItems.map((item, index) => {
                const isHighlighted = highlightedIndex === index;
                const isSelected = value.trim().toLowerCase() === item.name.trim().toLowerCase();

                return (
                  <div
                    key={item.id || index}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => handleSelect(item)}
                    className={`p-2 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-2 text-right ${
                      isSelected
                        ? 'bg-indigo-600/30 border border-indigo-500/50 text-white'
                        : isHighlighted
                        ? 'bg-slate-800/90 text-white'
                        : 'hover:bg-slate-800/60 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400 text-[10px]">
                        <Tag className="w-3 h-3" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {item.name}
                        </div>
                        {item.category && (
                          <div className="text-[10px] text-slate-400">
                            קטגוריה: {item.category}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.defaultPrice > 0 && (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg font-mono">
                          ₪{Number(item.defaultPrice).toLocaleString('he-IL')}
                        </span>
                      )}
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
