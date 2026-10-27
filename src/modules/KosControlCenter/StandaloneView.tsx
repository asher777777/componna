import React from 'react';
import { ControlCenterProvider } from './context/ControlCenterContext';
import { ModuleRoutes } from './routes/ModuleRoutes';

export const ControlCenterStandaloneView: React.FC = () => {
  return (
    <ControlCenterProvider>
      <ModuleRoutes />
    </ControlCenterProvider>
  );
};

export default ControlCenterStandaloneView;
