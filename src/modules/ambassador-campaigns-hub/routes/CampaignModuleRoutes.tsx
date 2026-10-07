/**
 * Sub-router for Ambassador Campaigns Hub
 */

import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { CampaignDashboard } from '../components/CampaignDashboard';
import { AmbassadorPublicPageView } from '../components/AmbassadorPublicPageView';
import { useCampaignModule } from '../context/CampaignModuleContext';

const DynamicAmbassadorRoute: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { ambassadors } = useCampaignModule();

  const found = ambassadors.find((a) => a.slug === slug || a.id === slug);

  if (found) {
    return <AmbassadorPublicPageView ambassador={found} />;
  }

  return <CampaignDashboard />;
};

export const CampaignModuleRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="" element={<CampaignDashboard />} />
      <Route path=":slug" element={<DynamicAmbassadorRoute />} />
      <Route path="*" element={<CampaignDashboard />} />
    </Routes>
  );
};
