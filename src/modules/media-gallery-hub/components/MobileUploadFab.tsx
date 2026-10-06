import React, { useState, useRef } from 'react';
import {
  Plus,
  Camera,
  FileText,
  Upload,
  Sparkles,
  FilePlus,
  X,
} from 'lucide-react';

interface MobileUploadFabProps {
  onCaptureCamera: () => void;
  onScanReceipt: () => void;
  onUploadFile: () => void;
  onOpenAiStudio: () => void;
  onCreateNewNote?: () => void;
  theme?: 'dark' | 'light';
}

export const MobileUploadFab: React.FC<MobileUploadFabProps> = ({
  onCaptureCamera,
  onScanReceipt,
  onUploadFile,
  onOpenAiStudio,
  onCreateNewNote,
  theme = 'dark',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isLight = theme === 'light';

  const menuItems = [
    {
      label: 'צלם תמונה במצלמה',
      icon: Camera,
      color: 'bg-emerald-500 text-white',
      action: onCaptureCamera,
    },
    {
      label: 'סרוק מסמך / קבלה',
      icon: FileText,
      color: 'bg-blue-500 text-white',
      action: onScanReceipt,
    },
    {
      label: 'העלה קובץ / מסמך מהמכשיר',
      icon: Upload,
      color: 'bg-amber-500 text-black',
      action: onUploadFile,
    },
    {
      label: 'צור תמונה ב-AI',
      icon: Sparkles,
      color: 'bg-purple-600 text-white',
      action: onOpenAiStudio,
    },
    ...(onCreateNewNote
      ? [
          {
            label: 'פתק / מסמך טקסט חדש',
            icon: FilePlus,
            color: 'bg-indigo-500 text-white',
            action: onCreateNewNote,
          },
        ]
      : []),
  ];

  return (
    <div className="fixed bottom-20 left-4 z-40 md:hidden flex flex-col items-start" dir="rtl">
      {/* Pop-up menu items */}
      {isOpen && (
        <div className="mb-3 space-y-2 flex flex-col items-start animate-fade-in">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  item.action();
                }}
                className={`flex items-center space-x-3 rtl:space-x-reverse px-4 py-2.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${
                  isLight
                    ? 'bg-white/95 border-slate-200 text-slate-800'
                    : 'bg-slate-900/95 border-slate-700 text-white'
                }`}
              >
                <div className={`p-2 rounded-xl ${item.color} shadow-md`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all transform active:scale-90 cursor-pointer ${
          isOpen
            ? 'bg-red-500 text-white rotate-45'
            : 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-500 text-black shadow-amber-500/40 hover:scale-105'
        }`}
        aria-label="פעולות העלאה מהירה"
      >
        <Plus className="w-7 h-7 font-black transition-transform duration-200" />
      </button>
    </div>
  );
};
