import React from 'react';
import { useLocation } from 'react-router-dom';
import { REGISTERED_MODULES } from '../moduleRegistry';
import { Terminal, Copy } from 'lucide-react';
import { UserMenuButton } from '../../components/Auth';
import { DatabaseConnectionBadge, DatabaseConnectorModal } from '../../modules/db-connector-hub';

export const Header: React.FC = () => {
  const location = useLocation();
  const currentModule = REGISTERED_MODULES.find((m) =>
    location.pathname.startsWith(m.route)
  );

  const copyScaffoldCommand = () => {
    navigator.clipboard.writeText('npm run new-module my-new-module "שם המודול"');
    alert('הפקודה הועתקה ללוח: npm run new-module <name> [displayName]');
  };

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
        {/* Global Database Connection Badge & Modal */}
        <DatabaseConnectionBadge />

        {/* User Login & Profile Button */}
        <UserMenuButton />

        <button
          onClick={copyScaffoldCommand}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700/60 transition"
          title="העתק פקודת יצירת מודול חדש"
        >
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>יצירת מודול ב-CLI</span>
          <Copy className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      <DatabaseConnectorModal />
    </header>
  );
};

