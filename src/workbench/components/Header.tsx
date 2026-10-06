import React from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { REGISTERED_MODULES } from '../moduleRegistry';
import { DatabaseConnectorModal } from '../../modules/db-connector-hub';

export const Header: React.FC = () => {
  const location = useLocation();

  const currentModule = REGISTERED_MODULES.find((m) =>
    location.pathname.startsWith(m.route)
  );

  // במידה ונמצאים במסוף התשלומים, אין צורך בבר העליון הכפול
  if (location.pathname.startsWith('/kesher-payments')) {
    return null;
  }

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
        <NavLink
          to="/control-center"
          className="flex items-center gap-1.5 text-xs bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 transition shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>מרכז השליטה</span>
        </NavLink>
      </div>

      <DatabaseConnectorModal />
    </header>
  );
};
