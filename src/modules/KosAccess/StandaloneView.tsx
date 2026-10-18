import React from 'react';
import { useTenantScope } from '../../core/tenant/TenantScopeContext';
import { KosAccessProvider } from './context/KosAccessContext';
import { KosAccessRoutes } from './routes/KosAccessRoutes';
import { KosAccessWidget } from './components/KosAccessWidget';

export interface KosAccessStandaloneViewProps {
  tenantId?: string;
  tenantName?: string;
}

export const KosAccessStandaloneView: React.FC<KosAccessStandaloneViewProps> = (props) => {
  let activeTenantId = props.tenantId;

  try {
    const scope = useTenantScope();
    if (scope && scope.tenantId) {
      activeTenantId = scope.tenantId;
    }
  } catch {
    // Fallback if rendered outside TenantScopeContext
  }

  return (
    <KosAccessProvider tenantId={activeTenantId || '_master'}>
      <div className="relative min-h-screen bg-slate-50">
        <KosAccessRoutes />
        {/* Mount active floating widget for live interactive testing */}
        <KosAccessWidget position="center-left" />
      </div>
    </KosAccessProvider>
  );
};

export const StandaloneView = KosAccessStandaloneView;
export default KosAccessStandaloneView;
