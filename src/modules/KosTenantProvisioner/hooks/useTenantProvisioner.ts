import { useTenantProvisionerContext } from '../context/TenantProvisionerContext';

export function useTenantProvisioner() {
  return useTenantProvisionerContext();
}
