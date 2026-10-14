import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { KosTubeStandaloneView } from '../StandaloneView';
import { PublicVideoSeoPageView } from '../components/PublicVideoSeoPageView';

export const KosTubeRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<KosTubeStandaloneView />} />
      <Route path="/:slug" element={<PublicVideoSeoPageView />} />
    </Routes>
  );
};
