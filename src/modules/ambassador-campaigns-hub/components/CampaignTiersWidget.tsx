/**
 * CampaignTiersWidget: Tier selector section on campaign page
 * Houses the CampaignTiersList and triggers the DonationDrawer
 */

import React from 'react';
import { useCampaignModule } from '../context/CampaignModuleContext';
import { DonationTier, Ambassador } from '../types';
import { CampaignTiersList, DEFAULT_CAMPAIGN_TIERS } from './CampaignTiersList';

interface CampaignTiersWidgetProps {
  ambassador?: Ambassador | null;
  onSelectTier?: (tierId?: string) => void;
}

export const CampaignTiersWidget: React.FC<CampaignTiersWidgetProps> = ({
  ambassador,
  onSelectTier,
}) => {
  const { campaign, setIsDonationDrawerOpen, setSelectedTierForDonation } = useCampaignModule();

  const tiers = campaign?.campaignTiers?.tiers || DEFAULT_CAMPAIGN_TIERS;
  const donationType = campaign?.campaignTiers?.donationType || 'both';

  const handleTierClick = (tier: DonationTier) => {
    setSelectedTierForDonation(tier);
    if (onSelectTier) onSelectTier(tier.id);
    else setIsDonationDrawerOpen(true);
  };

  const handleCustomClick = () => {
    setSelectedTierForDonation(null);
    if (onSelectTier) onSelectTier('custom');
    else setIsDonationDrawerOpen(true);
  };

  return (
    <section className="w-full py-6 px-4 flex flex-col items-center justify-center dir-rtl">
      <div className="max-w-4xl w-full flex flex-col items-center gap-5">
        <CampaignTiersList
          tiers={tiers}
          donationMode={donationType === 'one_time' ? 'one_time' : 'recurring'}
          theme={campaign?.drawerConfig?.theme || 'light'}
          drawerConfig={campaign?.drawerConfig}
          onSelectTier={handleTierClick}
          onSelectCustomTier={handleCustomClick}
        />
      </div>
    </section>
  );
};
