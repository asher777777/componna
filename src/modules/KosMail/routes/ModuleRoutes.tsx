/**
 * KOSUN AM (קושאן מייל אוטומטי) - Internal Sub-routes
 * 12-Layer Scaffolding Layer 8: Internal modular sub-routes
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { KosunAmMainView } from '../components/KosunAmMainView';
import { AutomationBuilderView } from '../components/AutomationBuilderView';

export const KosunAmRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="" element={<KosunAmMainView />} />
      <Route path="new" element={<KosunAmMainView />} />
      <Route path=":id" element={<KosunAmMainView />} />
      <Route path="automations" element={<AutomationBuilderView />} />
    </Routes>
  );
};

export default KosunAmRoutes;
