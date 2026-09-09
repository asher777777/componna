import React, { useState } from 'react';
import { X, Check, Key, Globe, Shield } from 'lucide-react';
import { MasterModuleMetadata } from '../config';
import { useClientPlatform } from '../context/ClientPlatformContext';
import { UserRole } from '../types';

interface Props {
  module: MasterModuleMetadata;
  onClose: () => void;
}

export const ModuleConfigModal: React.FC<Props> = ({ module, onClose }) => {
  const { settings, updateModuleConfig } = useClientPlatform();
  const currentConfig = settings.modules[module.id] || {
    moduleId: module.id,
    isEnabled: true,
    customSlug: module.defaultSlug,
    customTitle: module.defaultTitle,
    requiredRole: 'viewer' as UserRole,
    thirdPartyKeys: {},
  };

  const [slug, setSlug] = useState(currentConfig.customSlug || module.defaultSlug);
  const [title, setTitle] = useState(currentConfig.customTitle || module.defaultTitle);
  const [role, setRole] = useState<UserRole>(currentConfig.requiredRole || 'viewer');
  const [keys, setKeys] = useState<Record<string, string>>({ ...(currentConfig.thirdPartyKeys || {}) });

  const handleKeyChange = (keyName: string, val: string) => {
    setKeys(prev => ({ ...prev, [keyName]: val }));
  };

  const handleSave = () => {
    updateModuleConfig(module.id, {
      customSlug: slug,
      customTitle: title,
      requiredRole: role,
      thirdPartyKeys: keys,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm" dir="rtl">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden text-right">
        
        {/* Header */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/60 border-b flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
              הגדרות רכיב: {module.defaultTitle}
            </h3>
            <p className="text-[11px] text-gray-500">{module.description}</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 text-xs">
          <div>
            <label className="block text-gray-500 mb-1">כותרת מותאמת בלוח הבקרה (Display Title)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-gray-500 mb-1">נתיב גישה (Custom URL Slug)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="/my-slug"
              className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-gray-500 mb-1">הרשאת גישה מינימלית</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="viewer">Viewer (צפייה בלבד)</option>
              <option value="editor">Editor (עריכה ויצירה)</option>
              <option value="admin">Admin (מנהל מערכת בלבד)</option>
            </select>
          </div>

          {/* Required Third Party Keys */}
          {module.requiredKeys.length > 0 && (
            <div className="pt-2 border-t space-y-3">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                מפתחות גישה ואינטגרציות צד-שלישי:
              </h4>
              {module.requiredKeys.map(k => (
                <div key={k.key}>
                  <label className="block text-gray-500 mb-0.5">{k.label}</label>
                  <input
                    type={k.isSecret ? "password" : "text"}
                    value={keys[k.key] || ''}
                    onChange={(e) => handleKeyChange(k.key, e.target.value)}
                    placeholder={`הזן ${k.label}...`}
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
                    dir="ltr"
                  />
                  <span className="text-[10px] text-gray-400">{k.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-gray-50 dark:bg-gray-900 flex justify-between">
          <button onClick={onClose} className="px-3 py-1.5 border rounded-lg text-xs">
            ביטול
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>שמור הגדרות</span>
          </button>
        </div>

      </div>
    </div>
  );
};
