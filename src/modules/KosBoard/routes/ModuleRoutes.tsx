/**
 * KOSUN Board Composer (קושאן מחולל מערכות ולוחות בקרה AI)
 * Layer 7: Module Sub-Routing
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { KosunBoardForgeView } from '../components/KosunBoardForgeView';

export const ModuleRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="" element={<KosunBoardForgeView />} />
      <Route path=":dashboardId" element={<KosunBoardForgeView />} />
      <Route path="*" element={<KosunBoardForgeView />} />
    </Routes>
  );
};
