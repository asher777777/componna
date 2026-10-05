import React, { useState } from 'react';
import { 
  Plus, Users, Sparkles, Filter, MessageSquare, Camera, ChevronUp, ChevronDown, CheckSquare, X 
} from 'lucide-react';

interface Props {
  onNewContact: () => void;
  onOpenBulkWhatsApp: () => void;
  onOpenCardScanner: () => void;
  onToggleFilters: () => void;
  selectedCount: number;
}

export const MobileQuickActionsFab: React.FC<Props> = ({
  onNewContact,
  onOpenBulkWhatsApp,
  onOpenCardScanner,
  onToggleFilters,
  selectedCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 left-4 z-40 md:hidden flex flex-col items-start gap-2" dir="rtl">
      {/* Expanded Speed Dial Menu */}
      {isOpen && (
        <div className="flex flex-col items-start gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-2.5 rounded-2xl shadow-2xl animate-fadeIn">
          {/* Scan Card Button */}
          <button
            onClick={() => { setIsOpen(false); onOpenCardScanner(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-100 hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-xl transition"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <Camera className="w-4 h-4" />
            </div>
            <span>סריקת כרטיס ביקור (AI)</span>
          </button>

          {/* New Contact Button */}
          <button
            onClick={() => { setIsOpen(false); onNewContact(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-100 hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-xl transition"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Plus className="w-4 h-4" />
            </div>
            <span>הוספת איש קשר מהיר</span>
          </button>

          {/* WhatsApp to list */}
          <button
            onClick={() => { setIsOpen(false); onOpenBulkWhatsApp(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-100 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-xl transition"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span>שליחת WhatsApp {selectedCount > 0 ? `(${selectedCount})` : 'מרוכז'}</span>
          </button>

          {/* Quick Filters */}
          <button
            onClick={() => { setIsOpen(false); onToggleFilters(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
          >
            <div className="w-7 h-7 rounded-lg bg-gray-600 text-white flex items-center justify-center shadow-sm">
              <Filter className="w-4 h-4" />
            </div>
            <span>סינון ופילוח מתקדם</span>
          </button>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all transform active:scale-95 ${
          isOpen 
            ? 'bg-gray-800 dark:bg-gray-700 rotate-45' 
            : 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 hover:scale-105 ring-4 ring-indigo-500/20'
        }`}
        title="פעולות מהירות למובייל"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </div>
  );
};
