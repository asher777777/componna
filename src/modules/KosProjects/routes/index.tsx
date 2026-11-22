import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { KosProjectsView } from '../views/KosProjectsView';

export const KosProjectsRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<KosProjectsView />} />
      <Route path=":projectId/*" element={<KosProjectsView />} />
      <Route path="*" element={<KosProjectsView />} />
    </Routes>
  );
};
