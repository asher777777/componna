import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { TenantAppResolver } from './core/tenant/TenantAppResolver';
import { TenantScopeProvider } from './core/tenant';
import { HostCapabilitiesProvider } from './core/bridge/HostCapabilitiesContext';
import { SystemConnectionProvider } from './core/connection/SystemConnectionContext';
import { MediaPickerHostBridge } from './modules/media-gallery-hub';
import { BrandDnaProvider } from './modules/KosBranding/context/BrandDnaContext';
import { KosWebAiHostBridge } from './modules/KosWebAi';
import { KosaiProvider, FloatingKosaiButton, KosaiChatDrawer } from './modules/kosai-engine';
import { SmartFormProvider } from './modules/KSF';
import { KesherPaymentsProvider } from './modules/kesher-payments-hub';
import { WhatsAppProvider } from './modules/KosWhatsUp';

export const App: React.FC = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <TenantScopeProvider>
        <SystemConnectionProvider>
          <HostCapabilitiesProvider>
            <KesherPaymentsProvider>
              <WhatsAppProvider>
                <SmartFormProvider>
                  <BrandDnaProvider>
                    <KosaiProvider>
                      <TenantAppResolver />
                      <MediaPickerHostBridge />
                      <KosWebAiHostBridge />
                      <FloatingKosaiButton />
                      <KosaiChatDrawer />
                    </KosaiProvider>
                  </BrandDnaProvider>
                </SmartFormProvider>
              </WhatsAppProvider>
            </KesherPaymentsProvider>
          </HostCapabilitiesProvider>
        </SystemConnectionProvider>
      </TenantScopeProvider>
    </BrowserRouter>
  );
};

export default App;
