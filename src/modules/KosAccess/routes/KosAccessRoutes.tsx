import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { KosAccessAdminView } from '../views/KosAccessAdminView';

export const KosAccessRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<KosAccessAdminView />} />
      <Route path="/admin" element={<KosAccessAdminView />} />
      <Route path="*" element={<KosAccessAdminView />} />
    </Routes>
  );
};

export default KosAccessRoutes;
