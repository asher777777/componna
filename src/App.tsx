import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { WorkbenchApp } from './workbench/WorkbenchApp';
import { HostCapabilitiesProvider } from './core/bridge/HostCapabilitiesContext';
import { SystemConnectionProvider } from './core/connection/SystemConnectionContext';
import { MediaPickerHostBridge } from './modules/media-gallery-hub';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <SystemConnectionProvider>
        <HostCapabilitiesProvider>
          <WorkbenchApp />
          <MediaPickerHostBridge />
        </HostCapabilitiesProvider>
      </SystemConnectionProvider>
    </BrowserRouter>
  );
};

export default App;
