import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { TenantAppResolver } from './core/tenant/TenantAppResolver';
import { TenantScopeProvider } from './core/tenant';
import { HostCapabilitiesProvider } from './core/bridge/HostCapabilitiesContext';
import { SystemConnectionProvider } from './core/connection/SystemConnectionContext';
import { MediaPickerHostBridge } from './modules/media-gallery-hub';
import { BrandDnaProvider } from './modules/brand-dna-hub/context/BrandDnaContext';

export const App: React.FC = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SystemConnectionProvider>
        <TenantScopeProvider>
          <BrandDnaProvider>
            <HostCapabilitiesProvider>
              <TenantAppResolver />
              <MediaPickerHostBridge />
            </HostCapabilitiesProvider>
          </BrandDnaProvider>
        </TenantScopeProvider>
      </SystemConnectionProvider>
    </BrowserRouter>
  );
};

export default App;
