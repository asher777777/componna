import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { TenantAppResolver } from './core/tenant/TenantAppResolver';
import { TenantScopeProvider } from './core/tenant';
import { HostCapabilitiesProvider } from './core/bridge/HostCapabilitiesContext';
import { SystemConnectionProvider } from './core/connection/SystemConnectionContext';
import { MediaPickerHostBridge } from './modules/KosCloudStore';
import { BrandDnaProvider } from './modules/KosBranding/context/BrandDnaContext';
import { KosWebAiHostBridge } from './modules/KosWebAi';
import { CrmAnalyticsHostBridge } from './modules/KosCrm';
import { KosaiProvider, FloatingKosaiButton, KosaiChatDrawer } from './modules/KosAi';
import { SmartFormProvider } from './modules/KosForms';
import { KesherPaymentsProvider } from './modules/KosPay';
import { WhatsAppProvider } from './modules/KosWhatsUp';
import { KosAccessWidget } from './modules/KosAccess';
import { FloatingConciergeWidget } from './modules/KosLive';

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
                      <CrmAnalyticsHostBridge />
                      <FloatingKosaiButton />
                      <KosaiChatDrawer />
                      <KosAccessWidget position="center-left" />
                      <FloatingConciergeWidget position="bottom-left" />
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
