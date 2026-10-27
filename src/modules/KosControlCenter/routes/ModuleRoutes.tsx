import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ControlCenterMainView } from '../components/ControlCenterMainView';

export const ModuleRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="" element={<ControlCenterMainView />} />
      <Route path=":tab" element={<ControlCenterMainView />} />
      <Route path="*" element={<ControlCenterMainView />} />
    </Routes>
  );
};
