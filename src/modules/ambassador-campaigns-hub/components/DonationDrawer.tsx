/**
 * DonationDrawer - Adapter for ambassador-campaigns-hub
 * Fulfills the Monopoly Law (חוק המונופול):
 * The canonical form engine and UI reside in KSF (@/modules/KSF/components/donation/DonationDrawer).
 * This component connects campaign context to KSF form capabilities without code duplication.
 */

import React from 'react';
import {
  DonationDrawer as KSFDonationDrawer,
  DonationDrawerProps as KSFDonationDrawerProps,
  formatUserFriendlyPaymentError,
} from '../../KSF/components/donation/DonationDrawer';
import { useCampaignModule } from '../context/CampaignModuleContext';
import { DonationTier, Ambassador, DrawerConfig } from '../types';

export interface DonationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId?: string;
  ambassador?: Ambassador | null;
  ambassadorId?: string | null;
  ambassadorName?: string | null;
  initialTier?: DonationTier | null;
  initialSelectedTierId?: string;
  initialDonationMode?: 'one_time' | 'recurring';
  initialPaymentMethod?: 'credit_card' | 'bit';
  drawerConfig?: DrawerConfig;
  onDonationCompleted?: () => void;
}

export const DonationDrawer: React.FC<DonationDrawerProps> = (props) => {
  const { campaign, recordPendingDonation, completeDonation } = useCampaignModule();

  return (
    <KSFDonationDrawer
      {...props}
      campaign={campaign}
      campaignTitle={campaign?.title}
      tiers={campaign?.campaignTiers?.tiers}
      testMode={Boolean(campaign?.testMode || props.drawerConfig?.testMode)}
      drawerConfig={{
        ...(campaign?.drawerConfig || {}),
        ...(props.drawerConfig || {}),
      }}
      onRecordPendingDonation={recordPendingDonation}
      onCompleteDonation={completeDonation}
    />
  );
};

export default DonationDrawer;
export { formatUserFriendlyPaymentError };
