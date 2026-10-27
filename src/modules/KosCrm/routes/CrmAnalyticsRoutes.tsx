import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CrmAnalyticsMainView } from '../components/CrmAnalyticsMainView';

export const CrmAnalyticsRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="" element={<CrmAnalyticsMainView />} />
      <Route path="*" element={<CrmAnalyticsMainView />} />
    </Routes>
  );
};
