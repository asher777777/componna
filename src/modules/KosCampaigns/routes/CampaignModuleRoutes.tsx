/**
 * Sub-router for Ambassador Campaigns Hub
 * Handles:
 * - Root path / -> CampaignDashboard (Admin Hub & Builder)
 * - Dynamic /:slug ->
 *     1. Checks if slug matches an ambassador -> AmbassadorPublicPageView
 *     2. Checks if slug matches a campaign or 'public' -> CampaignPublicLandingView (like https://kampin.web.app/)
 *     3. Otherwise renders CampaignDashboard
 */

import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { CampaignDashboard } from '../components/CampaignDashboard';
import { AmbassadorPublicPageView } from '../components/AmbassadorPublicPageView';
import { CampaignPublicLandingView } from '../components/CampaignPublicLandingView';
import { useCampaignModule } from '../context/CampaignModuleContext';

const DynamicSlugRoute: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { ambassadors, campaign, campaignsList, setActiveCampaignId } = useCampaignModule();

  // 1. Match Ambassador
  const matchedAmbassador = ambassadors.find(
    (a) => a.slug === slug || a.id === slug
  );
  if (matchedAmbassador) {
    return <AmbassadorPublicPageView ambassador={matchedAmbassador} />;
  }

  // 2. Match Campaign Slug or dedicated public page
  const matchedCampaign = campaignsList.find(
    (c) => c.slug === slug || c.id === slug
  );
  if (matchedCampaign) {
    if (campaign?.id !== matchedCampaign.id) {
      setActiveCampaignId(matchedCampaign.id);
    }
    return <CampaignPublicLandingView campaignSlug={slug} canEdit={true} />;
  }

  if (slug === 'public' || slug === 'p' || slug === 'page') {
    return <CampaignPublicLandingView campaignSlug={campaign?.slug} canEdit={true} />;
  }

  return <CampaignDashboard />;
};

export const CampaignModuleRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="" element={<CampaignDashboard />} />
      <Route path="p/:slug" element={<DynamicSlugRoute />} />
      <Route path=":slug" element={<DynamicSlugRoute />} />
      <Route path="*" element={<CampaignDashboard />} />
    </Routes>
  );
};
