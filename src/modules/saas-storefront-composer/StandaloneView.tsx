import React from 'react';
import { StorefrontProvider } from './context/StorefrontContext';
import { StorefrontRoutes } from './routes/StorefrontRoutes';

export const SaasStorefrontComposerStandaloneView: React.FC = () => {
  return (
    <StorefrontProvider>
      <div className="min-h-full p-4 md:p-6 bg-gray-50/50 dark:bg-gray-950 text-right font-sans" dir="rtl">
        <StorefrontRoutes />
      </div>
    </StorefrontProvider>
  );
};
