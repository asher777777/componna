import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { REGISTERED_MODULES } from '../moduleRegistry';
import { Settings } from 'lucide-react';
import { DatabaseConnectorModal } from '../../modules/db-connector-hub';
import { SystemSettingsModal } from './SystemSettingsModal';

export const Header: React.FC = () => {
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const currentModule = REGISTERED_MODULES.find((m) =>
    location.pathname.startsWith(m.route)
  );

  return (
    <header className="h-16 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between px-6 backdrop-blur" dir="rtl">
      <div>
        {currentModule ? (
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-base">{currentModule.name}</span>
            <span className="text-slate-400 text-xs font-mono">({currentModule.route}/*)</span>
          </div>
        ) : (
          <span className="text-slate-400 text-sm">לוח בקרה ראשי</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Unified System Settings Trigger */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-slate-700/80 transition cursor-pointer shadow-sm"
          title="ניהול והגדרות מערכת (מסד נתונים, סנכרון ענן, משתמש)"
        >
          <Settings className="w-4 h-4 text-indigo-400" />
          <span>הגדרות וניהול</span>
        </button>
      </div>

      {/* Modals */}
      <SystemSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <DatabaseConnectorModal />
    </header>
  );
};
