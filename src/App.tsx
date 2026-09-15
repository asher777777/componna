import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { WorkbenchApp } from './workbench/WorkbenchApp';
import { HostCapabilitiesProvider } from './core/bridge/HostCapabilitiesContext';
import { SystemConnectionProvider } from './core/connection/SystemConnectionContext';
import { MediaPickerHostBridge } from './modules/media-gallery-hub';
import { BrandDnaProvider } from './modules/brand-dna-hub/context/BrandDnaContext';

export const App: React.FC = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SystemConnectionProvider>
        <BrandDnaProvider>
          <HostCapabilitiesProvider>
            <WorkbenchApp />
            <MediaPickerHostBridge />
          </HostCapabilitiesProvider>
        </BrandDnaProvider>
      </SystemConnectionProvider>
    </BrowserRouter>
  );
};

export default App;
