import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { KosLiveStudioView } from '../views/KosLiveStudioView';
import { LivingPagePublicView } from '../views/LivingPagePublicView';

export const KosLiveRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<KosLiveStudioView />} />
      <Route path="/live/:campaignId" element={<LivingPagePublicView />} />
      <Route path="/preview/:campaignId" element={<LivingPagePublicView />} />
    </Routes>
  );
};
