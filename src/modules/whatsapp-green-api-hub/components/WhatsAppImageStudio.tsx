import React from 'react';

interface WhatsAppImageStudioProps {
  isOpen: boolean;
  onClose: () => void;
  onImageGenerated?: (url: string) => void;
  onUseImage?: (url: string, meta: any) => void;
  initialPrompt?: string;
  isDark?: boolean;
  title?: string;
  subtitle?: string;
  useButtonLabel?: string;
  defaultAspectRatio?: string;
}

export const WhatsAppImageStudio: React.FC<WhatsAppImageStudioProps> = ({ isOpen, onClose, onImageGenerated, onUseImage, initialPrompt, isDark, title, subtitle, useButtonLabel, defaultAspectRatio }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`p-6 rounded-xl shadow-xl max-w-md w-full ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        <h3 className="text-xl font-bold mb-4">{title || 'סטודיו AI - לא זמין'}</h3>
        <p className="mb-4 text-sm opacity-80">
          יכולת יצירת התמונות אינה זמינה בתצורה הנוכחית.
        </p>
        <div className="flex justify-end gap-2">
          <button 
            className="px-4 py-2 rounded-lg bg-gray-500 text-white"
            onClick={onClose}
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};