import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { KosCognitivePortal } from './components/action-portal/cognitive-portal/KosCognitivePortal';

interface KosTestSiteProps {
  onBackToApp?: () => void;
}

/**
 * 👑 KOSTEST - סביבת קושאן הטהורה והנקייה (Production-Grade KOSUN 2026)
 * ללא בוררי טסטים, ללא רקעים חיצוניים מיותרים, 100% נאמן לשלד 9:16 הטהור של KOSUN
 */
export const KosTestSite: React.FC<KosTestSiteProps> = ({ onBackToApp }) => {
  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-hidden"
      dir="rtl"
    >
      {/* 🌌 הילת ניאון עמוקה של קושאן */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[140px] pointer-events-none opacity-20 -z-10 bg-cyan-500"
      />
      <div 
        className="fixed bottom-0 right-10 w-[450px] h-[250px] rounded-full blur-[150px] pointer-events-none opacity-15 -z-10 bg-blue-600"
      />

      {/* 📱 שלד 9:16 מושלם של קושאן ללא עזרי בדיקה */}
      <div className="w-full max-w-[430px] h-[92vh] max-h-[880px] my-auto flex flex-col relative">
        <KosCognitivePortal 
          tenantId="kosun" 
          targetProject="comona" 
          defaultAudience="guest" 
        />
      </div>

    </div>
  );
};
