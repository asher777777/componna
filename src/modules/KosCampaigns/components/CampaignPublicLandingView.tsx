/**
 * CampaignPublicLandingView: Standalone digital landing page for a campaign
 * Identical to https://kampin.web.app/ and LEA's CampaignClientView:
 * 1. Video / Media gallery at top
 * 2. If ambassador view: Ambassador Community Header Card
 * 3. Circular Donation Tiers Section (180, 360, 550, 770, 1500, Custom)
 * 4. Campaign Progress Section with Charidy SVG Trend Arrow & KPI Pills
 * 5. Tabbed Donors Wall & Community Leaders Grid (159 תורמים, 12 שגרירים, אודות)
 * 6. Sticky Bottom Action Bar with Quick Bit & Donate Button
 * 7. Live Real-time Floating Donation Alert
 * 8. Blue Floating Pencil Edit Button (opens HomeEditor Studio)
 */

import React, { useState } from 'react';
import { Edit3, Sparkles, Heart } from 'lucide-react';
import { useCampaignModule } from '../context/CampaignModuleContext';
import { Ambassador } from '../types';
import { CampaignHeaderWidget } from './CampaignHeaderWidget';
import { CampaignTiersWidget } from './CampaignTiersWidget';
import { CampaignDonorsWidget } from './CampaignDonorsWidget';
import { CampaignStickyBar } from './CampaignStickyBar';
import { DonationDrawer } from './DonationDrawer';
import { AmbassadorModal } from './AmbassadorModal';
import { LiveDonationAlert } from './LiveDonationAlert';
import { CampaignStudioEditor } from './CampaignStudioEditor';

interface CampaignPublicLandingViewProps {
  campaignSlug?: string;
  ambassador?: Ambassador | null;
  onBackToDashboard?: () => void;
  canEdit?: boolean;
}

export const CampaignPublicLandingView: React.FC<CampaignPublicLandingViewProps> = ({
  campaignSlug,
  ambassador,
  onBackToDashboard,
  canEdit = true,
}) => {
  const {
    campaign,
    isStudioEditorOpen,
    setIsStudioEditorOpen,
  } = useCampaignModule();

  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isAmbassadorModalOpen, setIsAmbassadorModalOpen] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState<string | undefined>();
  const [drawerMode, setDrawerMode] = useState<'one_time' | 'recurring' | undefined>();
  const [drawerPaymentMethod, setDrawerPaymentMethod] = useState<'credit_card' | 'bit' | undefined>();

  const isAmbassadorView = Boolean(ambassador);

  const handleOpenDonate = (
    mode?: 'one_time' | 'recurring',
    paymentMethod?: 'credit_card' | 'bit'
  ) => {
    setDrawerMode(mode);
    setDrawerPaymentMethod(paymentMethod);
    setIsDonateOpen(true);
  };

  const handleSelectTier = (tierId?: string) => {
    setSelectedTierId(tierId);
    setDrawerMode(undefined);
    setDrawerPaymentMethod(undefined);
    setIsDonateOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 dir-rtl relative select-none">
      {/* 1. Video / Photo Gallery at TOP */}
      {campaign?.videoGallery?.images && campaign.videoGallery.images.length > 0 && (
        <section className="w-full bg-slate-900 border-b border-slate-800">
          <div className="max-w-5xl mx-auto h-52 sm:h-72 lg:h-96 overflow-hidden relative">
            <img
              src={campaign.videoGallery.images[0]}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
              <div className="text-white">
                <h1 className="text-2xl sm:text-4xl font-black drop-shadow-md">
                  {campaign.title}
                </h1>
                {campaign.subtitle && (
                  <p className="text-xs sm:text-sm text-slate-200 mt-1 drop-shadow">
                    {campaign.subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Ambassador Community Card (If viewing via ambassador slug) */}
      {isAmbassadorView && ambassador && (
        <section className="w-full max-w-4xl mx-auto px-4 pt-6 pb-2">
          <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/60 text-slate-900 shadow-xl border border-emerald-200/90 overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-right">
              <div className="flex items-center gap-4 sm:gap-5 w-full md:w-auto">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 p-0.5 shadow-lg shrink-0">
                  <div className="w-full h-full bg-emerald-900 rounded-[14px] flex items-center justify-center text-white font-black text-2xl md:text-3xl">
                    {ambassador.name ? ambassador.name.slice(0, 2) : <Sparkles className="w-8 h-8" />}
                  </div>
                </div>

                <div className="space-y-1 text-right flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    <span>עמוד מוביל קהילה</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                    {ambassador.name}
                  </h1>
                </div>
              </div>

              {/* Personal Target Goal */}
              <div className="flex items-center gap-3 bg-white border border-emerald-200 px-6 py-3 rounded-2xl shadow-xs shrink-0 w-full md:w-auto justify-between md:justify-start">
                <div className="text-right">
                  <div className="text-xs text-slate-500 font-bold">יעד מוביל הקהילה:</div>
                  <div className="text-2xl md:text-3xl font-black text-emerald-800 dir-rtl">
                    ₪{ambassador.targetGoal.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {ambassador.message && (
              <div className="mt-4 pt-4 border-t border-emerald-200/70 text-right">
                <p className="text-sm text-slate-800 italic">
                  "{ambassador.message}"
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. Tiers & Quick Track Selection */}
      <div className="max-w-4xl mx-auto px-4">
        <CampaignTiersWidget
          ambassador={ambassador}
          onSelectTier={handleSelectTier}
        />
      </div>

      {/* 4. Campaign Progress Bar & Trend Curves */}
      <div className="max-w-4xl mx-auto px-4">
        <CampaignHeaderWidget
          ambassador={ambassador}
          onOpenDonate={() => handleOpenDonate('recurring')}
          onOpenAmbassadorModal={() => setIsAmbassadorModalOpen(true)}
        />
      </div>

      {/* 5. Main Donors Wall & Tabs */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <CampaignDonorsWidget
          ambassador={ambassador}
          onOpenAmbassadorModal={() => setIsAmbassadorModalOpen(true)}
          onOpenDonate={() => handleOpenDonate('recurring')}
        />
      </div>

      {/* 6. Sticky Bottom Action Bar with Bit and Donate Button */}
      <CampaignStickyBar
        onOpenDonate={handleOpenDonate}
        isAmbassadorView={isAmbassadorView}
        mainCampaignUrl={isAmbassadorView ? '/campaigns-hub' : undefined}
      />

      {/* 7. Floating Live Donation Notification */}
      <LiveDonationAlert />

      {/* 8. Blue Floating Pencil Edit Button (Opens Studio/HomeEditor) */}
      {canEdit && (
        <div className="fixed bottom-24 right-6 z-40">
          <button
            type="button"
            onClick={() => setIsStudioEditorOpen(true)}
            title="ערוך ועצב קמפיין זה (HomeEditor Studio)"
            className="rounded-full shadow-2xl bg-indigo-600 hover:bg-indigo-700 text-white h-14 w-14 p-0 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ring-4 ring-indigo-500/20"
          >
            <Edit3 className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Modals */}
      <DonationDrawer
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
        ambassador={ambassador}
        initialSelectedTierId={selectedTierId}
        initialDonationMode={drawerMode}
        initialPaymentMethod={drawerPaymentMethod}
      />

      <AmbassadorModal
        isOpen={isAmbassadorModalOpen}
        onClose={() => setIsAmbassadorModalOpen(false)}
      />

      <CampaignStudioEditor
        isOpen={isStudioEditorOpen}
        onClose={() => setIsStudioEditorOpen(false)}
      />
    </div>
  );
};
