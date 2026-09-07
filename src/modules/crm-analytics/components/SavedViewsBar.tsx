import React, { useState } from 'react';
import { Bookmark, Plus, Trash2, Check } from 'lucide-react';
import { SavedAnalyticsView } from '../types';

interface Props {
  views: SavedAnalyticsView[];
  activeViewId: string | null;
  onSelectView: (view: SavedAnalyticsView) => void;
  onSaveView: (name: string) => void;
  onDeleteView: (id: string) => void;
}

export const SavedViewsBar: React.FC<Props> = ({
  views,
  activeViewId,
  onSelectView,
  onSaveView,
  onDeleteView,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newViewName, setNewViewName] = useState('');

  const handleSave = () => {
    if (newViewName.trim()) {
      onSaveView(newViewName.trim());
      setNewViewName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1">
      <div className="flex items-center gap-1 text-xs text-gray-500 shrink-0 font-medium">
        <Bookmark className="w-3.5 h-3.5 text-amber-500" />
        <span>תצוגות שמורות:</span>
      </div>

      {views.map(view => {
        const isActive = activeViewId === view.id;
        return (
          <div
            key={view.id}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition shrink-0 cursor-pointer ${
              isActive
                ? 'bg-indigo-600 text-white font-medium shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span onClick={() => onSelectView(view)}>{view.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteView(view.id);
              }}
              className="opacity-60 hover:opacity-100"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        );
      })}

      {isAdding ? (
        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border rounded-full px-2 py-0.5 text-xs shrink-0">
          <input
            type="text"
            placeholder="שם התצוגה..."
            value={newViewName}
            onChange={(e) => setNewViewName(e.target.value)}
            className="w-24 bg-transparent outline-none text-xs"
            autoFocus
          />
          <button onClick={handleSave} className="text-emerald-600">
            <Check className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition shrink-0"
        >
          <Plus className="w-3 h-3" />
          <span>שמור תצוגה</span>
        </button>
      )}
    </div>
  );
};
