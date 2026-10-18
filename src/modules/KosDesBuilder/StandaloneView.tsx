import React from 'react';
import { useTenantScope } from '../../core/tenant/TenantScopeContext';
import { KosDesBuilderProvider } from './context/KosDesBuilderContext';
import { KosDesBuilderRoutes } from './routes/KosDesBuilderRoutes';

export interface KosDesBuilderStandaloneViewProps {
  tenantId?: string;
  tenantName?: string;
}

export const KosDesBuilderStandaloneView: React.FC<KosDesBuilderStandaloneViewProps> = (props) => {
  let activeTenantId = props.tenantId;

  try {
    const scope = useTenantScope();
    if (scope && scope.tenantId) {
      activeTenantId = scope.tenantId;
    }
  } catch {
    // If rendered outside TenantScopeProvider, fallback gracefully
  }

  return (
    <KosDesBuilderProvider tenantId={activeTenantId || '_master'}>
      <KosDesBuilderRoutes />
    </KosDesBuilderProvider>
  );
};

export const StandaloneView = KosDesBuilderStandaloneView;
export default KosDesBuilderStandaloneView;
