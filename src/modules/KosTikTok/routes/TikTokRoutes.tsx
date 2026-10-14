import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { StandaloneView } from '../StandaloneView';

export const TikTokRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<StandaloneView />} />
      <Route path="/overview" element={<StandaloneView />} />
      <Route path="/videos" element={<StandaloneView />} />
      <Route path="/leads" element={<StandaloneView />} />
      <Route path="/events" element={<StandaloneView />} />
      <Route path="/settings" element={<StandaloneView />} />
    </Routes>
  );
};
