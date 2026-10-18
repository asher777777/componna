import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { LivingPlayerContainer } from '../components/LivingPlayerContainer';

export const LivingPagePublicView: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [searchParams] = useSearchParams();
  const targetId = campaignId || searchParams.get('id') || 'demo-living-page';

  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center p-0 sm:p-4 select-none font-sans" dir="rtl">
      <LivingPlayerContainer
        campaignId={targetId}
        aspectRatio="9:16"
        className="w-full h-full max-h-screen"
      />
    </div>
  );
};
