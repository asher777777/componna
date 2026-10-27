import React, { useState } from 'react';
import { KesherTerminalTab } from '../components/KesherTerminalTab';
import { KesherManualReceiptsTab } from '../components/KesherManualReceiptsTab';
import { KesherTransactionsLogTab } from '../components/KesherTransactionsLogTab';
import { KesherUtilitiesTab } from '../components/KesherUtilitiesTab';

export type KesherSubRoute = 'terminal' | 'manual_receipts' | 'reports' | 'utilities';

interface Props {
  initialRoute?: KesherSubRoute;
  refreshTrigger?: number;
}

export const KesherPaymentsRoutes: React.FC<Props> = ({ 
  initialRoute = 'terminal',
  refreshTrigger = 0 
}) => {
  const [currentRoute, setCurrentRoute] = useState<KesherSubRoute>(initialRoute);

  return (
    <div className="w-full">
      {currentRoute === 'terminal' && <KesherTerminalTab />}
      {currentRoute === 'manual_receipts' && <KesherManualReceiptsTab />}
      {currentRoute === 'reports' && <KesherTransactionsLogTab refreshTrigger={refreshTrigger} />}
      {currentRoute === 'utilities' && <KesherUtilitiesTab />}
    </div>
  );
};
