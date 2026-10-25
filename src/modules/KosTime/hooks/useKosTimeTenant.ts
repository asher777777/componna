import { useTenantScope } from '../../../core/tenant/TenantScopeContext';

export function useKosTimeTenant() {
  const { tenantId } = useTenantScope();
  return {
    tenantId: tenantId || '_master',
    isMaster: !tenantId || tenantId === '_master',
  };
}
