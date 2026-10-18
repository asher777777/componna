/**
 * KoSeoPowerEngin - Routes
 * KOSUN26 Modular Layer: Routes
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { KoSeoPowerView } from '../views/KoSeoPowerView';

export const KoSeoPowerRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<KoSeoPowerView />} />
      <Route path="/keys" element={<KoSeoPowerView />} />
      <Route path="/telemetry" element={<KoSeoPowerView />} />
      <Route path="/subdomains" element={<KoSeoPowerView />} />
    </Routes>
  );
};

export default KoSeoPowerRoutes;
