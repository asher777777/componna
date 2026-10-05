import React from 'react';
import { StorefrontProvider, useStorefront } from '../context/StorefrontContext';
import { PublicStorefrontHeader } from './PublicStorefrontHeader';
import { StorefrontRoutes } from '../routes/StorefrontRoutes';
import { AuthModal } from '../../../components/Auth/AuthModal';

interface PublicStorefrontAppProps {
  onEnterDevWorkbench?: () => void;
}

const PublicStorefrontInner: React.FC<PublicStorefrontAppProps> = ({ onEnterDevWorkbench }) => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    pendingTrialModule, 
    handleAuthSuccess 
  } = useStorefront();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans select-none text-right" dir="rtl">
      {/* Public Header */}
      <PublicStorefrontHeader onEnterDevWorkbench={onEnterDevWorkbench} />

      {/* Storefront Main Area */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <StorefrontRoutes />
      </main>

      {/* Trial Gate / Guest Login Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        title={pendingTrialModule ? `התחברות להתנסות ברכיב: ${pendingTrialModule.name}` : 'כניסה למערכת'}
        subtitle={
          pendingTrialModule 
            ? 'התחבר או הירשם כדי לפתוח סביבת התנסות אישית ונקייה משלך' 
            : 'גישה מאובטחת לרכיבים ולסאב-דומיינים'
        }
      />
    </div>
  );
};

export const PublicStorefrontApp: React.FC<PublicStorefrontAppProps> = ({
  onEnterDevWorkbench
}) => {
  return (
    <StorefrontProvider>
      <PublicStorefrontInner onEnterDevWorkbench={onEnterDevWorkbench} />
    </StorefrontProvider>
  );
};
