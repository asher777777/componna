import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { KosTimeMainView } from '../views/KosTimeMainView';

export const KosTimeRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<KosTimeMainView />} />
      <Route path="/kosintime" element={<KosTimeMainView />} />
      <Route path="/kosintime/*" element={<KosTimeMainView />} />
      <Route path="*" element={<Navigate to="/kosintime" replace />} />
    </Routes>
  );
};
