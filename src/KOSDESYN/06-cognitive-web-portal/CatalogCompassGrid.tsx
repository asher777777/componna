import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { EntityProduct, TenantProfile, TenantThemeColors } from './types';
import { KOSUN_STYLE_PRESETS, StylePresetDefinition } from '../../../factory/areaCollectionManager';

interface CatalogCompassGridProps {
  products: EntityProduct[];
  displayedProducts: EntityProduct[];
  catalogSortDirection: 'default' | 'newest' | 'oldest' | 'cheapest' | 'priciest';
  currentCatalogPage: number;
  totalPages: number;
  activeCompassTooltip: string | null;
  tenantProfile: TenantProfile | null;
  tenantTheme?: TenantThemeColors;
  stylePresetId?: string;
  onSortChange: (direction: 'newest' | 'oldest' | 'cheapest' | 'priciest', tooltipText: string) => void;
  onSetTooltip: (text: string | null) => void;
  onSelectProduct: (product: EntityProduct) => void;
  onBackHome: () => void;
}

export const CatalogCompassGrid: React.FC<CatalogCompassGridProps> = ({
  products,
  displayedProducts,
  catalogSortDirection,
  currentCatalogPage,
  totalPages,
  activeCompassTooltip,
  tenantProfile,
  tenantTheme,
  stylePresetId,
  onSortChange,
  onSetTooltip,
  onSelectProduct,
  onBackHome,
}) => {
  const [flippedProdId, setFlippedProdId] = useState<string | null>(null);
  const compass = tenantProfile?.compassConfig;

  const isDay = tenantTheme?.colorMode === 'day';
  const activePresetKey = stylePresetId || tenantTheme?.stylePresetId || 'cyber_neon';
  const styleContract: StylePresetDefinition =
    KOSUN_STYLE_PRESETS[activePresetKey] || KOSUN_STYLE_PRESETS.cyber_neon;
  const modeColors = isDay ? styleContract.day : styleContract.night;
  const brandPrimary = tenantTheme?.primary || modeColors.primaryColor || '#00F0FF';
  const cardRadius = styleContract.geometry.cardRadius;
  const isGlassFlip = styleContract.discovery.mode === 'glass_flip_overlay';

  const renderProductCard = (item: EntityProduct) => {
    const isFlipped = flippedProdId === item.id;
    return (
      <div
        key={item.id}
        onClick={() => {
          if (isGlassFlip && !isFlipped) {
            setFlippedProdId(item.id);
          } else {
            onSelectProduct(item);
          }
        }}
        className="p-2 border transition-all cursor-pointer flex flex-col justify-between group shadow-lg hover:scale-[1.02] relative overflow-hidden"
        style={{
          borderRadius: cardRadius,
          background: modeColors.cardBg,
          borderColor: modeColors.borderColor,
          boxShadow: `0 4px 16px -6px ${modeColors.glowColor}`
        }}
      >
        <div className="relative overflow-hidden rounded-xl">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-18 sm:h-20 rounded-xl object-cover border border-white/10 group-hover:scale-105 transition-transform duration-300"
          />
          {item.badgeText && (
            <span
              className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md text-[8px] font-black text-black"
              style={{ backgroundColor: brandPrimary }}
            >
              {item.badgeText}
            </span>
          )}
        </div>
        <h3
          className="font-bold text-xs truncate transition-colors mt-1.5 text-right"
          style={{ color: modeColors.textColor }}
        >
          {item.title}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[11px] font-black" style={{ color: brandPrimary }}>
            ₪{item.price?.toLocaleString()}
          </span>
          <Icons.ChevronLeft size={14} style={{ color: modeColors.secondaryText }} />
        </div>

        {isGlassFlip && isFlipped && (
          <div
            className="absolute inset-0 z-20 p-2.5 flex flex-col justify-between backdrop-blur-xl animate-fadeIn"
            style={{ backgroundColor: isDay ? 'rgba(255,255,255,0.95)' : 'rgba(11,17,32,0.95)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black" style={{ color: brandPrimary }}>
                ₪{item.price?.toLocaleString()}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFlippedProdId(null);
                }}
                className="p-0.5 rounded-md"
                style={{ color: modeColors.secondaryText }}
              >
                <Icons.X size={12} />
              </button>
            </div>
            <p className="text-[10px] line-clamp-2 my-auto text-right" style={{ color: modeColors.textColor }}>
              {item.subtitle || item.title}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectProduct(item);
              }}
              className="w-full py-1 rounded-lg text-[10px] font-black text-black"
              style={{ backgroundColor: brandPrimary }}
            >
              פתח מפרט מלא ◀
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`w-full h-full flex flex-col justify-between py-1 animate-fadeIn relative ${styleContract.fontFamily}`}>
      {/* חץ עליון ממורכז: חדשים יותר */}
      <div className="w-full flex justify-center py-0.5 relative z-20">
        <button
          type="button"
          onMouseEnter={() => onSetTooltip(compass?.up?.tooltip || 'פריטים חדשים יותר במלאי')}
          onMouseLeave={() => onSetTooltip(null)}
          onClick={() => {
            const tip = compass?.up?.tooltip || 'פריטים חדשים יותר במלאי';
            onSortChange('newest', tip);
          }}
          className="flex flex-col items-center justify-center p-1 rounded-xl transition-all active:scale-90 group relative"
          style={{ color: brandPrimary }}
        >
          <div className="animate-[bounce_1.5s_infinite] flex flex-col items-center -space-y-2">
            <Icons.ChevronsUp size={26} />
          </div>
        </button>
      </div>

      {/* שורה ראשונה של 2 פריטים */}
      <div className="grid grid-cols-2 gap-2 w-full">
        {displayedProducts.slice(0, 2).map(renderProductCard)}
      </div>

      {/* מרווח אמצעי שבין השורות: חיצים שמאלה וימינה */}
      <div className="w-full flex items-center justify-between px-6 py-1 relative z-20">
        <button
          type="button"
          onMouseEnter={() => onSetTooltip(compass?.left?.tooltip || 'נגישים ומשתלמים יותר')}
          onMouseLeave={() => onSetTooltip(null)}
          onClick={() => {
            const tip = compass?.left?.tooltip || 'נגישים ומשתלמים יותר';
            onSortChange('cheapest', tip);
          }}
          className="p-1 rounded-xl transition-all active:scale-90 group relative"
          style={{ color: brandPrimary }}
        >
          <div className="animate-[pulse_1.2s_infinite] group-hover:-translate-x-1 transition-transform">
            <Icons.ChevronsLeft size={26} />
          </div>
        </button>

        <span
          className="text-[10px] font-mono tracking-wider px-2.5 py-0.5 rounded-full border"
          style={{
            color: modeColors.textColor,
            borderColor: modeColors.borderColor,
            backgroundColor: isDay ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.05)'
          }}
        >
          {styleContract.shortLabel} • עמוד {currentCatalogPage + 1}/{totalPages}
        </span>

        <button
          type="button"
          onMouseEnter={() => onSetTooltip(compass?.right?.tooltip || 'דגמי קצה ופרימיום')}
          onMouseLeave={() => onSetTooltip(null)}
          onClick={() => {
            const tip = compass?.right?.tooltip || 'דגמי קצה ופרימיום';
            onSortChange('priciest', tip);
          }}
          className="p-1 rounded-xl transition-all active:scale-90 group relative"
          style={{ color: brandPrimary }}
        >
          <div className="animate-[pulse_1.2s_infinite] group-hover:translate-x-1 transition-transform">
            <Icons.ChevronsRight size={26} />
          </div>
        </button>
      </div>

      {/* שורה שנייה של 2 פריטים */}
      <div className="grid grid-cols-2 gap-2 w-full">
        {displayedProducts.slice(2, 4).map(renderProductCard)}
      </div>

      {/* חץ תחתון ממורכז */}
      <div className="w-full flex justify-center py-0.5 relative z-20">
        <button
          type="button"
          onMouseEnter={() => onSetTooltip(compass?.down?.tooltip || 'הזדמנויות מיוחדות')}
          onMouseLeave={() => onSetTooltip(null)}
          onClick={() => {
            const tip = compass?.down?.tooltip || 'הזדמנויות מיוחדות';
            onSortChange('oldest', tip);
          }}
          className="flex flex-col items-center justify-center p-1 rounded-xl transition-all active:scale-90 group relative"
          style={{ color: brandPrimary }}
        >
          <div className="animate-[bounce_1.5s_infinite] flex flex-col items-center -space-y-2">
            <Icons.ChevronsDown size={26} />
          </div>
        </button>
      </div>

      {/* בועת טולטיפ צפה דינמית */}
      {activeCompassTooltip && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 px-3.5 py-1.5 rounded-xl border-2 text-xs font-black shadow-xl backdrop-blur-md animate-fadeIn pointer-events-none whitespace-nowrap text-center"
          style={{
            backgroundColor: isDay ? '#FFFFFF' : '#090D16',
            borderColor: brandPrimary,
            color: modeColors.textColor
          }}
        >
          {activeCompassTooltip}
        </div>
      )}

      {/* כפתור חזרה הביתה בתחתית המסך */}
      <div className="w-full flex justify-center pt-1">
        <button
          type="button"
          onClick={onBackHome}
          className="w-full max-w-[180px] py-1.5 rounded-2xl text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
          style={{ backgroundColor: brandPrimary }}
        >
          <span>חזרה הביתה</span>
        </button>
      </div>
    </div>
  );
};
