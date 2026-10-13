import React, { useState, useRef, useEffect } from 'react';
import { Columns, Check, RotateCcw } from 'lucide-react';
import { ALL_GROUP_COLUMNS } from '../config';

interface ColumnPickerDropdownProps {
  selectedColumns: string[];
  onToggleColumn: (colId: string) => void;
  onResetColumns: () => void;
}

export const ColumnPickerDropdown: React.FC<ColumnPickerDropdownProps> = ({
  selectedColumns,
  onToggleColumn,
  onResetColumns,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer"
        title="התאם עמודות מוצגות"
      >
        <Columns className="w-4 h-4 text-slate-500" />
        <span className="hidden sm:inline">עמודות</span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
          {selectedColumns.length}
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 space-y-2 text-right">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800">בחירת עמודות בטבלה</span>
            <button
              type="button"
              onClick={onResetColumns}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              איפוס
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 pr-1 text-xs">
            {ALL_GROUP_COLUMNS.map((col) => {
              const isChecked = selectedColumns.includes(col.id);
              return (
                <label
                  key={col.id}
                  onClick={() => onToggleColumn(col.id)}
                  className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                    isChecked ? 'bg-indigo-50/60 text-indigo-900 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span>{col.label}</span>
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                      isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3" />}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
