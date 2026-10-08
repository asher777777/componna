import React from 'react';
import { KosaiSettingsBackoffice } from './components/KosaiSettingsBackoffice';

export const KosaiStandaloneView: React.FC = () => {
  return (
    <div className="w-full">
      <KosaiSettingsBackoffice />
    </div>
  );
};
