import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Contact } from '../../types';

interface Props {
  formData: Contact;
  onChange: (field: keyof Contact, value: any) => void;
}

export const ContactTagsTab: React.FC<Props> = ({ formData, onChange }) => {
  const [newTagInput, setNewTagInput] = useState('');

  const handleAddTag = () => {
    if (newTagInput.trim()) {
      const currentTags = Array.isArray(formData.tags) ? [...formData.tags] : [];
      if (!currentTags.includes(newTagInput.trim())) {
        onChange('tags', [...currentTags, newTagInput.trim()]);
      }
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = Array.isArray(formData.tags) ? formData.tags : [];
    onChange('tags', currentTags.filter(t => t !== tagToRemove));
  };

  return (
    <div className="space-y-4 text-xs">
      <div>
        <label className="block font-semibold text-gray-800 dark:text-gray-200 mb-2">
          תגיות משויכות
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {(formData.tags || []).map(t => (
            <span
              key={t}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium"
            >
              <span>{t}</span>
              <button onClick={() => handleRemoveTag(t)} className="hover:text-rose-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {(!formData.tags || formData.tags.length === 0) && (
            <span className="text-gray-400">אין תגיות משויכות</span>
          )}
        </div>

        <div className="flex items-center gap-2 max-w-sm">
          <input
            type="text"
            placeholder="הוסף תגית חדשה..."
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
            className="flex-1 p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <button
            onClick={handleAddTag}
            className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            הוסף
          </button>
        </div>
      </div>

      <div className="pt-4 border-t space-y-3">
        <label className="block font-semibold text-gray-800 dark:text-gray-200">
          קהילה / קבוצה משויכת
        </label>
        <input
          type="text"
          value={formData.community || ''}
          onChange={(e) => onChange('community', e.target.value)}
          placeholder="שם הקבוצה או הקהילה..."
          className="w-full max-w-sm p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>
    </div>
  );
};
