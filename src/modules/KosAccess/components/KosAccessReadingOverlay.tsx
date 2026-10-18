import React, { useState, useEffect } from 'react';
import { useKosAccess } from '../hooks/useKosAccess';

export const KosAccessReadingOverlay: React.FC = () => {
  const { preferences } = useKosAccess();
  const [mouseY, setMouseY] = useState(250);

  useEffect(() => {
    if (!preferences.readingRuler && !preferences.readingMask) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientY = e.touches[0].clientY;
      } else if ('clientY' in e) {
        clientY = (e as MouseEvent).clientY;
      }
      setMouseY(clientY);
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
    };
  }, [preferences.readingRuler, preferences.readingMask]);

  if (!preferences.readingRuler && !preferences.readingMask) return null;

  return (
    <div
      id="kos-access-reading-overlay"
      className="fixed inset-0 pointer-events-none z-[99990] overflow-hidden"
      aria-hidden="true"
    >
      {/* 1. Horizontal Reading Ruler Guide */}
      {preferences.readingRuler && (
        <div
          className="absolute left-0 right-0 h-9 bg-yellow-300/35 border-y-2 border-yellow-500 shadow-lg pointer-events-none transition-transform duration-75"
          style={{
            top: `${mouseY - 18}px`,
          }}
        />
      )}

      {/* 2. Reading Mask / Focus Spotlight Curtain */}
      {preferences.readingMask && (
        <>
          {/* Top Mask Curtain */}
          <div
            className="absolute top-0 left-0 right-0 bg-black/60 pointer-events-none transition-all duration-75"
            style={{
              height: `${Math.max(0, mouseY - 55)}px`,
            }}
          />
          {/* Spotlight Active Window */}
          <div
            className="absolute left-0 right-0 h-28 border-y border-white/40 pointer-events-none transition-transform duration-75"
            style={{
              top: `${mouseY - 55}px`,
            }}
          />
          {/* Bottom Mask Curtain */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-black/60 pointer-events-none transition-all duration-75"
            style={{
              top: `${mouseY + 55}px`,
            }}
          />
        </>
      )}
    </div>
  );
};

export default KosAccessReadingOverlay;
