import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { KosDesBuilderView } from '../views/KosDesBuilderView';

export const KosDesBuilderRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<KosDesBuilderView />} />
      <Route path="*" element={<KosDesBuilderView />} />
    </Routes>
  );
};
