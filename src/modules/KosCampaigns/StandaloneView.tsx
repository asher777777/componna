/**
 * StandaloneView: Independent development runner for Ambassador Campaigns Hub
 */

import React from 'react';
import { CampaignModuleProvider } from './context/CampaignModuleContext';
import { CampaignModuleRoutes } from './routes/CampaignModuleRoutes';
import { FirebaseApp } from 'firebase/app';

export interface AmbassadorCampaignsStandaloneViewProps {
  firebaseApp?: FirebaseApp | null;
}

export const AmbassadorCampaignsStandaloneView: React.FC<AmbassadorCampaignsStandaloneViewProps> = ({
  firebaseApp,
}) => {
  return (
    <CampaignModuleProvider firebaseApp={firebaseApp}>
      <CampaignModuleRoutes />
    </CampaignModuleProvider>
  );
};

export default AmbassadorCampaignsStandaloneView;
