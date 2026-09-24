import React, { useState } from 'react';
import { 
  Sparkles, Globe, LogIn, Shield, Layers, HelpCircle, 
  ChevronLeft, LayoutDashboard, ShoppingCart
} from 'lucide-react';
import { useStorefront } from '../context/StorefrontContext';
import { CustomerLoginModal } from './CustomerLoginModal';

interface PublicStorefrontHeaderProps {
  onEnterDevWorkbench?: () => void;
}

export const PublicStorefrontHeader: React.FC<PublicStorefrontHeaderProps> = ({
  onEnterDevWorkbench
}) => {
  const { settings, cart, setViewMode, viewMode } = useStorefront();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 px-4 md:px-8 py-3.5 flex items-center justify-between" dir="rtl">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 font-black text-base">
            K
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-gray-900 dark:text-white">
                {settings.platformName || 'Kosun Platform'}
              </span>
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                {settings.baseDomain}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 hidden sm:block">
              פלטפורמת SaaS להרכבת מערכות וסאב-דומיינים
            </p>
          </div>
        </div>

        {/* Navigation & Action buttons */}
        <div className="flex items-center gap-3">
          
          {/* Marketplace Button */}
          <button
            onClick={() => setViewMode('catalog')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition hidden sm:inline-flex items-center gap-1.5 ${
              viewMode === 'catalog'
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>חנות רכיבים</span>
          </button>

          {/* Cart Counter */}
          {cart.length > 0 && (
            <button
              onClick={() => setViewMode('sales_proposal')}
              className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 hover:bg-indigo-500 transition"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{cart.length} בסל</span>
            </button>
          )}

          {/* Login / Connect to Subdomain Button */}
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-500/20 transition transform active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>כניסה לסאב-דומיין שלך</span>
          </button>

          {/* Developer Workbench Mode Button */}
          {onEnterDevWorkbench && (
            <button
              onClick={onEnterDevWorkbench}
              title="כניסה למצב פיתוח ומודולים פנימיים (Dev Workbench)"
              className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition text-xs"
            >
              <Shield className="w-4 h-4" />
            </button>
          )}
        </div>

      </header>

      {/* Customer Login & Subdomain Modal */}
      <CustomerLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onEnterDevWorkbench={onEnterDevWorkbench || (() => {})}
      />
    </>
  );
};
