import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { WorkbenchApp } from './workbench/WorkbenchApp';
import { HostCapabilitiesProvider } from './core/bridge/HostCapabilitiesContext';
import { MediaPickerHostBridge } from './modules/media-gallery-hub';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <HostCapabilitiesProvider>
        <WorkbenchApp />
        <MediaPickerHostBridge />
      </HostCapabilitiesProvider>
    </BrowserRouter>
  );
};

export default App;
