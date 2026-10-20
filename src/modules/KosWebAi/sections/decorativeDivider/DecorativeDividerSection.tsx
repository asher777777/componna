import React, { useRef, useState, useEffect } from 'react';
import {
  DecorativeDividerSectionConfig,
  DecorativeDividerDistribution,
  DecorativeDividerIconStretch,
} from '../../types/sectionConfigs';
import { TenantStylePreset, BrandDnaContract } from '../../../../core/contracts';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { resolveLiveBrandDna } from '../../generators/pageGenerator';
import * as LucideIcons from 'lucide-react';
import { clsx } from 'clsx';
import {
  SHAPES_AND_SYMBOLS_COLLECTION,
  StyleShapeSymbolItem,
} from './shapesAndSymbolsData';

export interface DecorativeDividerSectionProps {
  config: DecorativeDividerSectionConfig;
  onHeightChange?: (newHeight: number) => void;
  isEditorActive?: boolean;
}

export const DecorativeDividerSection: React.FC<DecorativeDividerSectionProps> = ({
  config,
  onHeightChange,
  isEditorActive = false,
}) => {
  const { getCapability } = useHostCapabilities();
  const rawBrandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;
  const brandDna = resolveLiveBrandDna(rawBrandDna);

  const {
    anchorId = 'decorativeDivider',
    height = 120,
    minHeight = 32,
    maxHeight = 600,
    bgType = 'transparent',
    solidColor,
    gradientAngle = 135,
    gradientFrom,
    gradientVia,
    gradientTo,
    bgImageUrl,
    bgVideoUrl,
    bgOverlayOpacity = 0,
    bgOverlayColor = '#000000',
    iconName,
    customSvgDataUrl,
    iconColor,
    iconSecondaryColor,
    iconSize = 36,
    iconStretch = 'contain',
    distribution = 'single',
    itemsGap = 24,
    fullWidth = true,
    containerPaddingX = 24,
    stylePreset = (brandDna?.designTokens?.defaultStylePreset as TenantStylePreset) || 'standard',
    effectType = 'none',
    animationSpeed = 'normal',
    decorativeText,
    textColor,
    textFontSize = 'sm',
    textFontWeight = 'bold',
    textPosition = 'center-overlay',
  } = config;

  // Primary brand color fallback
  const brandPrimary = brandDna?.designTokens?.primaryColor || '#4f46e5';
  const effectiveIconColor = iconColor || brandPrimary;

  // Drag-to-resize states
  const [currentHeight, setCurrentHeight] = useState<number>(height);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartYRef = useRef<number>(0);
  const dragStartHeightRef = useRef<number>(height);

  useEffect(() => {
    setCurrentHeight(height);
  }, [height]);

  // Handle Drag Height Resize
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartYRef.current = e.clientY;
    dragStartHeightRef.current = currentHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - dragStartYRef.current;
      const calculated = Math.min(
        maxHeight,
        Math.max(minHeight, Math.round(dragStartHeightRef.current + deltaY))
      );
      setCurrentHeight(calculated);
      if (onHeightChange) {
        onHeightChange(calculated);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Find shape or Lucide icon
  const matchedShape = SHAPES_AND_SYMBOLS_COLLECTION.find((s) => s.id === iconName);
  const LucideComp = iconName && (LucideIcons as any)[iconName] ? (LucideIcons as any)[iconName] : null;

  // Effect / Animation class helper
  const getEffectClass = () => {
    if (effectType === 'none') return '';

    const speedClass =
      animationSpeed === 'slow'
        ? 'duration-1000'
        : animationSpeed === 'fast'
        ? 'duration-300'
        : 'duration-700';

    switch (effectType) {
      case 'pulse-glow':
        // Feminine & soft breathing glow
        return clsx('animate-pulse drop-shadow-[0_0_12px_rgba(244,63,94,0.45)] transition-all', speedClass);
      case 'float-bob':
        // Standard balanced floating
        return clsx('animate-bounce drop-shadow-md transition-all', speedClass);
      case 'shimmer-beam':
        // Masculine powerful shimmer
        return clsx('drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all hover:scale-110', speedClass);
      case 'wave-drift':
        // Spiritual oceanic/zen wave drift
        return clsx('transition-transform duration-1000 hover:rotate-6 drop-shadow-[0_0_14px_rgba(16,185,129,0.4)]', speedClass);
      case 'cyber-scan':
        // Sharp cyber neon flick and glow
        return clsx('drop-shadow-[0_0_18px_rgba(6,182,212,0.8)] filter contrast-125 transition-all', speedClass);
      case 'rotate-slow':
        // Analytical spinning radar/core
        return clsx('animate-spin transition-all drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]', speedClass);
      default:
        return '';
    }
  };

  // Stretch & Sizing class
  const getIconStretchClass = () => {
    switch (iconStretch) {
      case 'cover':
        return 'w-full h-full object-cover';
      case 'stretch':
        return 'w-full h-full';
      case 'original':
        return 'shrink-0';
      case 'contain':
      default:
        return 'h-full max-h-full max-w-full object-contain';
    }
  };

  // Render Single Icon / Shape Element
  const renderSingleIconElement = (keyIndex: number | string = 0) => {
    // 1. Custom SVG Data URL
    if (customSvgDataUrl) {
      return (
        <div
          key={keyIndex}
          className={clsx(
            'flex items-center justify-center transition-transform select-none',
            getEffectClass()
          )}
          style={{
            width: iconStretch === 'stretch' || iconStretch === 'cover' ? '100%' : `${iconSize}px`,
            height: iconStretch === 'stretch' || iconStretch === 'cover' ? '100%' : `${iconSize}px`,
            color: effectiveIconColor,
          }}
        >
          <img
            src={customSvgDataUrl}
            alt="decorative shape"
            className={getIconStretchClass()}
            style={{ filter: `drop-shadow(0 2px 8px ${effectiveIconColor}33)` }}
          />
        </div>
      );
    }

    // 2. Predefined Curated Shapes & Symbols (Shapes & Symbols Catalog)
    if (matchedShape) {
      return (
        <div
          key={keyIndex}
          className={clsx(
            'flex items-center justify-center transition-transform select-none',
            getEffectClass()
          )}
          style={{
            width: iconStretch === 'stretch' || iconStretch === 'cover' ? '100%' : `${iconSize}px`,
            height: iconStretch === 'stretch' || iconStretch === 'cover' ? '100%' : `${iconSize}px`,
            color: effectiveIconColor,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className={getIconStretchClass()}
            style={{ width: '100%', height: '100%' }}
            dangerouslySetInnerHTML={{ __html: matchedShape.svgContent }}
          />
        </div>
      );
    }

    // 3. Lucide Icon fallback
    if (LucideComp) {
      return (
        <div
          key={keyIndex}
          className={clsx(
            'flex items-center justify-center transition-transform select-none',
            getEffectClass()
          )}
          style={{
            width: `${iconSize}px`,
            height: `${iconSize}px`,
            color: effectiveIconColor,
          }}
        >
          <LucideComp
            className="w-full h-full"
            strokeWidth={1.75}
            style={{ color: effectiveIconColor }}
          />
        </div>
      );
    }

    // 4. Default subtle divider line if no icon selected
    return (
      <div
        key={keyIndex}
        className={clsx('w-full flex items-center justify-center', getEffectClass())}
      >
        <div
          className="h-[1.5px] w-24 sm:w-48 rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${effectiveIconColor}, transparent)`,
          }}
        />
      </div>
    );
  };

  // Render Distribution of Icons
  const renderDistributedIcons = () => {
    switch (distribution) {
      case 'repeat':
        return (
          <div
            className="flex items-center justify-center flex-wrap w-full overflow-hidden"
            style={{ gap: `${itemsGap}px` }}
          >
            {Array.from({ length: 9 }).map((_, idx) => renderSingleIconElement(idx))}
          </div>
        );
      case 'spaced-3':
        return (
          <div
            className="flex items-center justify-center w-full"
            style={{ gap: `${itemsGap * 1.5}px` }}
          >
            {Array.from({ length: 3 }).map((_, idx) => renderSingleIconElement(idx))}
          </div>
        );
      case 'spaced-5':
        return (
          <div
            className="flex items-center justify-center w-full"
            style={{ gap: `${itemsGap}px` }}
          >
            {Array.from({ length: 5 }).map((_, idx) => renderSingleIconElement(idx))}
          </div>
        );
      case 'flow-marquee':
        return (
          <div className="flex items-center w-full overflow-hidden select-none whitespace-nowrap">
            <div
              className="flex items-center shrink-0 animate-marquee"
              style={{ gap: `${itemsGap}px` }}
            >
              {Array.from({ length: 14 }).map((_, idx) => renderSingleIconElement(`mq1_${idx}`))}
            </div>
            <div
              className="flex items-center shrink-0 animate-marquee ml-6"
              style={{ gap: `${itemsGap}px` }}
              aria-hidden="true"
            >
              {Array.from({ length: 14 }).map((_, idx) => renderSingleIconElement(`mq2_${idx}`))}
            </div>
          </div>
        );
      case 'single':
      default:
        return (
          <div className="flex items-center justify-center w-full">
            {renderSingleIconElement(0)}
          </div>
        );
    }
  };

  // Background styling computation
  const getBackgroundStyle = (): React.CSSProperties => {
    switch (bgType) {
      case 'solid':
        return { backgroundColor: solidColor || 'transparent' };
      case 'gradient': {
        const from = gradientFrom || brandPrimary;
        const to = gradientTo || '#000000';
        const via = gradientVia ? `, ${gradientVia}` : '';
        return {
          background: `linear-gradient(${gradientAngle}deg, ${from}${via}, ${to})`,
        };
      }
      case 'image':
        return bgImageUrl
          ? {
              backgroundImage: `url(${bgImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {};
      case 'transparent':
      default:
        return { backgroundColor: 'transparent' };
    }
  };

  return (
    <section
      id={anchorId || 'decorativeDivider'}
      className={clsx(
        'relative w-full overflow-hidden select-none transition-all duration-150 group/section',
        fullWidth ? 'px-0' : 'max-w-7xl mx-auto px-4'
      )}
      style={{
        height: `${currentHeight}px`,
        ...getBackgroundStyle(),
      }}
      dir="rtl"
    >
      {/* Background Video Layer */}
      {bgType === 'video' && bgVideoUrl && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        >
          <source src={bgVideoUrl} type="video/mp4" />
        </video>
      )}

      {/* Background Overlay Color / Opacity */}
      {(bgType === 'image' || bgType === 'video') && bgOverlayOpacity > 0 && (
        <div
          className="absolute inset-0 pointer-events-none z-0 transition-opacity"
          style={{
            backgroundColor: bgOverlayColor || '#000000',
            opacity: bgOverlayOpacity / 100,
          }}
        />
      )}

      {/* Main Content Area */}
      <div
        className="relative z-10 w-full h-full flex items-center justify-center"
        style={{
          paddingLeft: `${containerPaddingX}px`,
          paddingRight: `${containerPaddingX}px`,
        }}
      >
        <div className="w-full flex flex-col items-center justify-center gap-2">
          {/* Decorative Optional Text: Before */}
          {decorativeText && textPosition === 'before' && (
            <span
              className={clsx(
                'tracking-widest uppercase text-center select-none',
                textFontSize === 'xs' ? 'text-[11px]' : textFontSize === 'lg' ? 'text-lg' : 'text-sm',
                textFontWeight === 'extrabold' ? 'font-black' : textFontWeight === 'bold' ? 'font-bold' : 'font-normal'
              )}
              style={{ color: textColor || effectiveIconColor }}
            >
              {decorativeText}
            </span>
          )}

          {/* Central Distributed Icons / SVG Shapes */}
          <div className="relative flex items-center justify-center w-full">
            {renderDistributedIcons()}

            {/* Decorative Optional Text: Center Overlay */}
            {decorativeText && textPosition === 'center-overlay' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span
                  className={clsx(
                    'px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-lg tracking-wider text-center select-none',
                    textFontSize === 'xs' ? 'text-[10px]' : textFontSize === 'lg' ? 'text-base font-bold' : 'text-xs font-semibold'
                  )}
                  style={{ color: textColor || '#ffffff' }}
                >
                  {decorativeText}
                </span>
              </div>
            )}
          </div>

          {/* Decorative Optional Text: After */}
          {decorativeText && textPosition === 'after' && (
            <span
              className={clsx(
                'tracking-widest uppercase text-center select-none',
                textFontSize === 'xs' ? 'text-[11px]' : textFontSize === 'lg' ? 'text-lg' : 'text-sm',
                textFontWeight === 'extrabold' ? 'font-black' : textFontWeight === 'bold' ? 'font-bold' : 'font-normal'
              )}
              style={{ color: textColor || effectiveIconColor }}
            >
              {decorativeText}
            </span>
          )}
        </div>
      </div>

      {/* Drag Handle for Height Adjustment (Visible on hover in editor mode) */}
      <div
        onMouseDown={handleMouseDown}
        className={clsx(
          'absolute bottom-0 left-0 right-0 h-4 cursor-row-resize flex items-center justify-center transition-all z-30 select-none group/handle',
          isDragging
            ? 'bg-amber-500/40 opacity-100 ring-2 ring-amber-400'
            : 'opacity-0 hover:opacity-100 bg-indigo-500/20 hover:bg-indigo-500/40'
        )}
        title={`גרור לקביעת גובה האזור (${currentHeight}px)`}
      >
        <div className="w-12 h-1 bg-white/70 rounded-full group-hover/handle:w-20 transition-all shadow-sm" />
        {isDragging && (
          <span className="absolute -top-7 px-2 py-0.5 rounded-md bg-black/90 text-[10px] text-amber-300 font-mono font-bold shadow-md border border-amber-500/40">
            {currentHeight}px
          </span>
        )}
      </div>
    </section>
  );
};
