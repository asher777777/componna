import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { KSFStandaloneView } from '../StandaloneView';

export const SmartFormRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<KSFStandaloneView />} />
      <Route path="/:formId" element={<KSFStandaloneView />} />
    </Routes>
  );
};

export default SmartFormRoutes;
