import React, { useState } from 'react';
import { 
  Check, Settings, Key, Globe, Shield, ExternalLink, 
  Layers, Sparkles, Sliders 
} from 'lucide-react';
import { MASTER_AVAILABLE_MODULES, MasterModuleMetadata } from '../config';
import { useClientPlatform } from '../context/ClientPlatformContext';
import { ModuleConfigModal } from './ModuleConfigModal';

export const ComponentRegistryTable: React.FC = () => {
  const { settings, toggleModule, updateModuleConfig, setActiveRoute } = useClientPlatform();
  const [editingModule, setEditingModule] = useState<MasterModuleMetadata | null>(null);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 md:p-6 shadow-sm space-y-4 text-right" dir="rtl">
      
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <span>טבלת ניהול והפעלת רכיבי לקוח (Component Control Table)</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            סמן ב-V את הרכיבים שברצונך להעניק ללקוח, קבע סלאג מותאם והגדר מפתחות צד שלישי
          </p>
        </div>

        <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold">
          {Object.values(settings.modules).filter(m => m.isEnabled).length} רכיבים פעילים
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead className="bg-gray-50 dark:bg-gray-800/60 border-b text-gray-500 font-semibold">
            <tr>
              <th className="p-3 w-16 text-center">הפעל</th>
              <th className="p-3">שם הרכיב והסבר</th>
              <th className="p-3">נתיב גישה (Slug)</th>
              <th className="p-3">הרשאת גישה</th>
              <th className="p-3">מפתחות צד שלישי</th>
              <th className="p-3 text-center">הגדרות</th>
              <th className="p-3 text-center">תצוגה מקדימה</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {MASTER_AVAILABLE_MODULES.map(module => {
              const modConfig = settings.modules[module.id];
              const isEnabled = !!modConfig?.isEnabled;
              const slug = modConfig?.customSlug || module.defaultSlug;
              const title = modConfig?.customTitle || module.defaultTitle;
              const hasKeys = module.requiredKeys.length > 0;
              const keysSetCount = Object.keys(modConfig?.thirdPartyKeys || {}).length;

              return (
                <tr key={module.id} className={`hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition ${
                  isEnabled ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                }`}>
                  {/* Toggle Checkbox */}
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => toggleModule(module.id, e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>

                  {/* Module Info */}
                  <td className="p-3">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{title}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{module.description}</p>
                  </td>

                  {/* Slug */}
                  <td className="p-3">
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                      {slug}
                    </span>
                  </td>

                  {/* Role */}
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {modConfig?.requiredRole || 'viewer'}
                    </span>
                  </td>

                  {/* Third Party Keys */}
                  <td className="p-3">
                    {hasKeys ? (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        keysSetCount > 0 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' 
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                      }`}>
                        {keysSetCount > 0 ? `${keysSetCount} מפתחות מוגדרים` : 'דורש הגדרת מפתחות'}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[10px]">ללא מפתחות</span>
                    )}
                  </td>

                  {/* Configure Button */}
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setEditingModule(module)}
                      className="p-1.5 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition"
                      title="הגדר רכיב"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </td>

                  {/* Open Preview */}
                  <td className="p-3 text-center">
                    {isEnabled ? (
                      <button
                        onClick={() => setActiveRoute(module.id)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium flex items-center gap-1 mx-auto transition"
                      >
                        <span>פתח</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600 text-xs">כבוי</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Config Drawer */}
      {editingModule && (
        <ModuleConfigModal
          module={editingModule}
          onClose={() => setEditingModule(null)}
        />
      )}

    </div>
  );
};
