import React from 'react';
import { KosaiSettingsBackoffice } from './components/KosaiSettingsBackoffice';

export const KosaiStandaloneView: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      <KosaiSettingsBackoffice />
    </div>
  );
};
