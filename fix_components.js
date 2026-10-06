const fs = require('fs');
const pickerCode = import React, { useRef } from 'react';

interface MediaItemStub {
  id: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  name: string;
}

interface WhatsAppMediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (items: MediaItemStub[]) => void;
  onSelectMedia?: (items: MediaItemStub[]) => void;
  selectionMode?: 'single' | 'multiple';
  isDark?: boolean;
  title?: string;
  allowedTypes?: string[];
  maxSelectCount?: number;
  db?: any;
}

export const WhatsAppMediaPicker: React.FC<WhatsAppMediaPickerProps> = ({ 
  isOpen, onClose, onSelect, onSelectMedia, selectionMode = 'single', isDark, title, allowedTypes, maxSelectCount, db 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={\p-6 rounded-xl shadow-xl max-w-md w-full \\}>
        <h3 className="text-xl font-bold mb-4">{title || 'בחר קובץ'}</h3>
        <p className="mb-4 text-sm opacity-80">אנא בחר קובץ מהמכשיר:</p>
        <input 
          type="file" 
          multiple={selectionMode === 'multiple' || maxSelectCount !== 1}
          accept={allowedTypes ? allowedTypes.join(',') : "image/*,video/*,.pdf,.doc,.docx"}
          ref={fileInputRef}
          className="mb-4 block w-full"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              const files = Array.from(e.target.files);
              Promise.all(files.map(file => {
                return new Promise<MediaItemStub>((resolve) => {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    resolve({
                      id: file.name + Date.now(),
                      url: ev.target?.result as string,
                      type: file.type.startsWith('video') ? 'video' : file.type.startsWith('image') ? 'image' : 'document',
                      name: file.name
                    });
                  };
                  reader.readAsDataURL(file);
                });
              })).then(items => {
                if (onSelect) onSelect(items);
                if (onSelectMedia) onSelectMedia(items);
                onClose();
              });
            }
          }}
        />
        <div className="flex justify-end gap-2">
          <button 
            className="px-4 py-2 rounded-lg bg-gray-500 text-white"
            onClick={onClose}
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
};;
fs.writeFileSync('C:/comona/src/modules/whatsapp-green-api-hub/components/WhatsAppMediaPicker.tsx', pickerCode);

const studioCode = import React from 'react';

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
      <div className={\p-6 rounded-xl shadow-xl max-w-md w-full \\}>
        <h3 className="text-xl font-bold mb-4">{title || 'סטודיו AI - לא זמין'}</h3>
        <p className="mb-4 text-sm opacity-80">
          יכולת יצירת התמונות אינה זמינה בתצורה הנוכחית ללא Media Gallery Hub.
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
};;
fs.writeFileSync('C:/comona/src/modules/whatsapp-green-api-hub/components/WhatsAppImageStudio.tsx', studioCode);
