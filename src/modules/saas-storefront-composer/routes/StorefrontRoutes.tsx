import React from 'react';
import { useStorefront } from '../context/StorefrontContext';
import { MarketplaceCatalogView } from '../components/MarketplaceCatalogView';
import { InteractiveTrialSandbox } from '../components/InteractiveTrialSandbox';
import { CheckoutAndPaymentStep } from '../components/CheckoutAndPaymentStep';
import { SubdomainSelectorStep } from '../components/SubdomainSelectorStep';
import { LaunchSuccessScreen } from '../components/LaunchSuccessScreen';
import { AdminStorefrontManager } from '../components/AdminStorefrontManager';

export const StorefrontRoutes: React.FC = () => {
  const { viewMode } = useStorefront();

  switch (viewMode) {
    case 'catalog':
      return <MarketplaceCatalogView />;
    case 'sandbox_trial':
      return <InteractiveTrialSandbox />;
    case 'checkout':
      return <CheckoutAndPaymentStep />;
    case 'subdomain_picker':
      return <SubdomainSelectorStep />;
    case 'success_provisioned':
      return <LaunchSuccessScreen />;
    case 'admin_pricing':
      return <AdminStorefrontManager />;
    default:
      return <MarketplaceCatalogView />;
  }
};
