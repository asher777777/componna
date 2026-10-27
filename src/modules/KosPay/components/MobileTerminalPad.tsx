import React from 'react';
import { Delete, ArrowRight, Check } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSubmit?: () => void;
  currency?: string;
  maxAmount?: number;
}

export const MobileTerminalPad: React.FC<Props> = ({
  value,
  onChange,
  onSubmit,
  currency = '₪',
  maxAmount = 1000000
}) => {
  const handleDigit = (digit: string) => {
    if (value === '0' && digit !== '.') {
      onChange(digit);
      return;
    }
    if (digit === '.' && value.includes('.')) return;
    const newVal = value + digit;
    if (Number(newVal) <= maxAmount) {
      onChange(newVal);
    }
  };

  const handleBackspace = () => {
    if (value.length <= 1) {
      onChange('');
    } else {
      onChange(value.slice(0, -1));
    }
  };

  const handleClear = () => {
    onChange('');
  };

  const handleQuickAdd = (add: number) => {
    const current = Number(value) || 0;
    const next = current + add;
    if (next <= maxAmount) {
      onChange(String(next));
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-2xl backdrop-blur-md" dir="rtl">
      {/* תצוגת סכום ראשית */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 mb-4 text-center">
        <span className="text-xs text-slate-400 font-medium block mb-1">סכום לתשלום בקופה</span>
        <div className="flex items-center justify-center gap-1.5 overflow-hidden">
          <span className="text-2xl font-bold text-indigo-400">{currency}</span>
          <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            {value || '0'}
          </span>
        </div>
      </div>

      {/* כפתורי סכום מהיר */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[50, 100, 200, 500].map(amt => (
          <button
            key={amt}
            type="button"
            onClick={() => handleQuickAdd(amt)}
            className="py-2 bg-slate-800/60 hover:bg-indigo-600/20 active:scale-95 border border-slate-700/50 rounded-xl text-xs font-bold text-slate-300 hover:text-indigo-300 transition"
          >
            +{amt}
          </button>
        ))}
      </div>

      {/* מקלדת Numpad */}
      <div className="grid grid-cols-3 gap-2.5">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
          <button
            key={d}
            type="button"
            onClick={() => handleDigit(d)}
            className="h-14 sm:h-16 bg-slate-800 hover:bg-slate-750 active:bg-indigo-600/30 active:scale-95 border border-slate-700/60 rounded-2xl text-2xl font-black text-white transition flex items-center justify-center shadow-sm select-none"
          >
            {d}
          </button>
        ))}

        <button
          type="button"
          onClick={() => handleDigit('.')}
          className="h-14 sm:h-16 bg-slate-850 hover:bg-slate-800 active:scale-95 border border-slate-700/60 rounded-2xl text-2xl font-bold text-slate-300 transition flex items-center justify-center select-none"
        >
          .
        </button>

        <button
          type="button"
          onClick={() => handleDigit('0')}
          className="h-14 sm:h-16 bg-slate-800 hover:bg-slate-750 active:scale-95 border border-slate-700/60 rounded-2xl text-2xl font-black text-white transition flex items-center justify-center select-none"
        >
          0
        </button>

        <button
          type="button"
          onClick={handleBackspace}
          className="h-14 sm:h-16 bg-slate-850 hover:bg-rose-500/20 active:scale-95 border border-slate-700/60 rounded-2xl text-slate-400 hover:text-rose-400 transition flex items-center justify-center select-none"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>

      {/* כפתור אישור / פעולה מהירה */}
      {onSubmit && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-3 bg-slate-800/80 hover:bg-slate-800 text-slate-400 rounded-xl text-xs font-bold transition"
          >
            איפוס
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!value || Number(value) <= 0}
            className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>המשך לתשלום ({currency}{value || '0'})</span>
          </button>
        </div>
      )}
    </div>
  );
};
