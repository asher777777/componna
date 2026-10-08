import React, { useState } from 'react';
import { BaseSectionConfig } from '../../types/pageBuilder.types';
import { Code, Save, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface CustomHtmlEditorProps {
  config: BaseSectionConfig & { rawHtmlTemplate?: string };
  onChange: (updated: Partial<BaseSectionConfig & { rawHtmlTemplate?: string }>) => void;
}

export const CustomHtmlEditor: React.FC<CustomHtmlEditorProps> = ({ config, onChange }) => {
  const [code, setCode] = useState(config.rawHtmlTemplate || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onChange({ rawHtmlTemplate: code });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSaveToLibrary = () => {
    // In the future, this will save to Firestore tenant section library
    alert('האזור נשמר בספריית התבניות האישית שלך! (הדגמה)');
  };

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
          <Code className="w-4 h-4 text-indigo-400" />
          עריכת קוד מתקדם (Tailwind / HTML)
        </h4>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveToLibrary}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            שמור לספרייה
          </button>
          <button
            onClick={handleSave}
            className={clsx(
              "text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors",
              isSaved 
                ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            )}
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {isSaved ? "נשמר בהצלחה" : "החל שינויים"}
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        כאן תוכל לערוך ידנית את הקוד שה-AI ייצר עבורך. ניתן להשתמש בכל מחלקות ה-Tailwind של הפרויקט.
        הקוד מוזרק ישירות לעמוד, לכן ודא שהוא תקין.
      </p>

      <div className="relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-64 bg-[#0A0A0B] border border-slate-700 rounded-xl p-4 text-sm font-mono text-indigo-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-y"
          placeholder="<div>...</div>"
          dir="ltr"
        />
      </div>
    </div>
  );
};
