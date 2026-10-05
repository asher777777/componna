import React from 'react';
import { useLocation } from 'react-router-dom';
import { REGISTERED_MODULES } from '../moduleRegistry';
import { DatabaseConnectorModal } from '../../modules/db-connector-hub';

export const Header: React.FC = () => {
  const location = useLocation();

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
          <span className="text-slate-400 text-sm">בחרו אזור עבודה</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Placeholder for future header items */}
      </div>

      <DatabaseConnectorModal />
    </header>
  );
};
