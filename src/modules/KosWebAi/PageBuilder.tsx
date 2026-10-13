import React, { useState } from 'react';
import { PageBuilderConfig } from './types/pageBuilder.types';
import { PageBuilderEditor } from './PageBuilderEditor';
import { PageBuilderRenderer } from './PageBuilderRenderer';
import { Edit3, Eye } from 'lucide-react';

export interface PageBuilderProps {
  initialConfig: PageBuilderConfig;
  editable?: boolean;
  onSaveConfig?: (config: PageBuilderConfig) => Promise<void> | void;
}

export const PageBuilder: React.FC<PageBuilderProps> = ({
  initialConfig,
  editable = true,
  onSaveConfig,
}) => {
  const [isEditing, setIsEditing] = useState(editable);
  const [config, setConfig] = useState<PageBuilderConfig>(initialConfig);

  const handleSave = async (savedConfig: PageBuilderConfig) => {
    setConfig(savedConfig);
    if (onSaveConfig) {
      await onSaveConfig(savedConfig);
    }
  };

  return (
    <div className="relative min-h-screen">
      {isEditing ? (
        <PageBuilderEditor
          initialConfig={config}
          onSaveConfig={handleSave}
          onClose={() => setIsEditing(false)}
        />
      ) : (
        <div className="relative">
          <PageBuilderRenderer config={config} />
          {editable && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="fixed bottom-6 left-6 z-50 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-2xl shadow-indigo-600/50 flex items-center gap-2 border border-indigo-400/30 cursor-pointer transition-all hover:scale-105"
            >
              <Edit3 className="w-4 h-4" />
              <span>ערוך עמוד זה</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PageBuilder;
