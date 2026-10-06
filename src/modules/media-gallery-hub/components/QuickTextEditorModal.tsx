import React, { useState, useEffect } from 'react';
import { X, FileText, Save, Check, Loader2, Copy } from 'lucide-react';
import { useFileEditor } from '../hooks/useFileEditor';
import { MediaItem } from '../types';

interface QuickTextEditorModalProps {
  item?: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  folderId?: string | null;
  theme?: 'dark' | 'light';
}

export const QuickTextEditorModal: React.FC<QuickTextEditorModalProps> = ({
  item,
  isOpen,
  onClose,
  folderId = null,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const { isProcessing, error, saveTextDocument } = useFileEditor();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setTitle(item.name);
        if (item.extractedText) {
          setContent(item.extractedText);
        } else {
          fetch(item.url)
            .then((r) => r.text())
            .then(setContent)
            .catch(() => setContent(''));
        }
      } else {
        setTitle(`הערה_חדשה_${new Date().toLocaleDateString('he-IL').replace(/\./g, '-')}.txt`);
        setContent('');
      }
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title.trim()) return;
    await saveTextDocument(title, content, folderId, item?.id);
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      dir="rtl"
    >
      <div
        className={`w-full max-w-3xl h-[85vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Header */}
        <div
          className={`h-14 px-4 border-b flex items-center justify-between flex-shrink-0 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}
        >
          <div className="flex items-center space-x-2 rtl:space-x-reverse min-w-0">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base">עורך פתקים ומסמכי טקסט</h3>
              <p className="text-[11px] text-slate-400">עריכה ושמירה ישירה של קבצי TXT ו-Markdown</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              type="button"
              onClick={handleCopy}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isLight ? 'bg-white hover:bg-slate-100 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
              }`}
              title="העתק טקסט"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isProcessing || !title.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-1.5 rtl:space-x-reverse cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>שמור בכספת</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isLight ? 'bg-white hover:bg-red-50 border-slate-200 text-slate-500' : 'bg-slate-800 hover:bg-red-950/40 border-slate-700 text-slate-400'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div className={`p-3 border-b ${isLight ? 'bg-slate-100/50 border-slate-200' : 'bg-slate-950/40 border-slate-800'}`}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">שם הקובץ:</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="שם המסמך (למשל: סיכום פגישה.txt)"
              className={`flex-1 px-3 py-1.5 rounded-lg border text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 ${
                isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-800 border-slate-700 text-white'
              }`}
              dir="auto"
            />
          </div>
        </div>

        {/* Text Area */}
        <div className="flex-1 p-3 min-h-0 flex flex-col">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="הקלד כאן את תוכן הפתק, המסמך או הפרומפט..."
            className={`w-full flex-1 p-4 rounded-xl border outline-none font-mono text-sm resize-none custom-scrollbar leading-relaxed ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500'
                : 'bg-slate-950/80 border-slate-800 text-slate-100 focus:bg-slate-950 focus:ring-2 focus:ring-blue-500'
            }`}
            dir="auto"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border-t border-red-500/50 text-red-200 text-xs">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
