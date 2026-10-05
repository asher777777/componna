import React, { useState } from 'react';
import { PageBuilderModal } from '../ui/PageBuilderModal';
import { PageBuilderButton } from '../ui/PageBuilderButton';
import { Sparkles, Loader2 } from 'lucide-react';
import { SectionType } from '../types/pageBuilder.types';
import { aiPageGenerator } from '../services/aiPageGenerator';

interface AiSectionDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: string;
  sectionType: SectionType;
  currentConfig: any;
  onApplyDesign: (newConfig: any) => void;
}

export const AiSectionDesignerModal: React.FC<AiSectionDesignerModalProps> = ({
  isOpen,
  onClose,
  sectionId,
  sectionType,
  currentConfig,
  onApplyDesign,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const newConfig = await aiPageGenerator.generateSectionLive(sectionType, prompt, null, currentConfig);
      onApplyDesign(newConfig);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <PageBuilderModal isOpen={isOpen} onClose={onClose} title={`עיצוב אזור באמצעות AI`}>
      <div className="flex flex-col gap-4 text-right" dir="rtl">
        <p className="text-sm text-slate-300">
          תאר כיצד תרצה לעצב מחדש את האזור. המערכת תתאים את סגנון הפריסה, הצבעים והתוכן הכתוב לפי הבקשה שלך.
        </p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="לדוגמה: 'הפוך את האזור לעיצוב Bento עתידני, עם טקסט שמתמקד בלקוחות פרימיום...'"
          className="w-full h-32 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
        />
        <div className="flex justify-end gap-3 mt-4">
          <PageBuilderButton variant="outline" onClick={onClose} disabled={isGenerating}>
            ביטול
          </PageBuilderButton>
          <PageBuilderButton variant="gradient" onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                מעצב אזור...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                עצב מחדש
              </span>
            )}
          </PageBuilderButton>
        </div>
      </div>
    </PageBuilderModal>
  );
};
