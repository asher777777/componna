import React from 'react';
import { StorefrontProvider } from '../context/StorefrontContext';
import { PublicStorefrontHeader } from './PublicStorefrontHeader';
import { StorefrontRoutes } from '../routes/StorefrontRoutes';

interface PublicStorefrontAppProps {
  onEnterDevWorkbench?: () => void;
}

export const PublicStorefrontApp: React.FC<PublicStorefrontAppProps> = ({
  onEnterDevWorkbench
}) => {
  return (
    <StorefrontProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans select-none text-right" dir="rtl">
        {/* Public Header */}
        <PublicStorefrontHeader onEnterDevWorkbench={onEnterDevWorkbench} />

        {/* Storefront Main Area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <StorefrontRoutes />
        </main>
      </div>
    </StorefrontProvider>
  );
};
