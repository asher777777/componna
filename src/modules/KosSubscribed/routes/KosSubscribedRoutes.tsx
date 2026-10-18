import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { KosSubscribedMainView } from '../views/KosSubscribedMainView';

export const KosSubscribedRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<KosSubscribedMainView />} />
      <Route path="/*" element={<Navigate to="." replace />} />
    </Routes>
  );
};
