import React from 'react';
import { TenantProvisionerProvider } from './context/TenantProvisionerContext';
import { TenantProvisionerRoutes } from './routes/TenantProvisionerRoutes';

export interface KosTenantProvisionerProps {}

export const KosTenantProvisionerStandaloneView: React.FC<KosTenantProvisionerProps> = () => {
  return (
    <TenantProvisionerProvider>
      <TenantProvisionerRoutes />
    </TenantProvisionerProvider>
  );
};

export default KosTenantProvisionerStandaloneView;
