import React from 'react';
import { useTenantScope } from '../../core/tenant/TenantScopeContext';
import { KosTimeProvider } from './context/KosTimeContext';
import { KosTimeRoutes } from './routes/KosTimeRoutes';

export interface KosTimeStandaloneViewProps {
  tenantId?: string;
  tenantName?: string;
}

export const KosTimeStandaloneView: React.FC<KosTimeStandaloneViewProps> = (props) => {
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
    <KosTimeProvider>
      <div className="relative min-h-screen bg-[#070913] text-[#F0F4FF]" dir="rtl">
        <KosTimeRoutes />
      </div>
    </KosTimeProvider>
  );
};

export const StandaloneView = KosTimeStandaloneView;
export default KosTimeStandaloneView;
