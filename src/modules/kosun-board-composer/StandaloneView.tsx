/**
 * KOSUN Board Composer (קושאן מחולל מערכות ולוחות בקרה AI)
 * Layer 9: Standalone Runner / View
 */

import React from 'react';
import { KosunBoardProvider } from './context/ModuleContext';
import { ModuleRoutes } from './routes/ModuleRoutes';

export const KosunBoardComposerStandaloneView: React.FC = () => {
  return (
    <KosunBoardProvider>
      <ModuleRoutes />
    </KosunBoardProvider>
  );
};

export default KosunBoardComposerStandaloneView;
