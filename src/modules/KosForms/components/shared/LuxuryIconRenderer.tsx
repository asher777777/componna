import React from 'react';
import { getLuxuryIcon, LUXURY_ICONS_REGISTRY } from '../../config/luxuryIcons';
import { DynamicBrandIcon } from '../../../../core/ui/BrandIconPicker';

export interface LuxuryIconRendererProps {
  iconName?: string;
  className?: string;
  size?: number;
  color?: string;
  withContainer?: boolean;
  containerBg?: string;
  containerBorder?: string;
  containerClassName?: string;
}

const isUrlIcon = (name?: string): boolean => {
  if (!name) return false;
  return (
    name.startsWith('data:image/') ||
    name.startsWith('http://') ||
    name.startsWith('https://') ||
    name.startsWith('/')
  );
};

export const LuxuryIconRenderer: React.FC<LuxuryIconRendererProps> = ({
  iconName,
  className = 'w-5 h-5',
  size,
  color,
  withContainer = false,
  containerBg = 'bg-amber-500/10 dark:bg-amber-500/20',
  containerBorder = 'border-amber-500/30',
  containerClassName,
}) => {
  const renderIcon = () => {
    if (isUrlIcon(iconName)) {
      return (
        <img
          src={iconName}
          alt=""
          aria-hidden="true"
          className={`${className} object-contain inline-block`}
          style={size ? { width: size, height: size } : undefined}
        />
      );
    }

    if (iconName && LUXURY_ICONS_REGISTRY[iconName]) {
      const IconComponent = getLuxuryIcon(iconName);
      return (
        <IconComponent
          className={className}
          size={size}
          style={color ? { color } : undefined}
        />
      );
    }

    if (iconName) {
      return (
        <span style={color ? { color } : undefined} className="inline-flex items-center justify-center">
          <DynamicBrandIcon name={iconName} className={className} />
        </span>
      );
    }

    const Fallback = getLuxuryIcon(undefined);
    return (
      <Fallback
        className={className}
        size={size}
        style={color ? { color } : undefined}
      />
    );
  };

  if (withContainer) {
    const wrapperClass = containerClassName
      ? `inline-flex items-center justify-center p-2.5 transition-all duration-300 ${containerClassName}`
      : `inline-flex items-center justify-center p-2.5 rounded-xl border ${containerBg} ${containerBorder} shadow-sm backdrop-blur-sm transition-all duration-300`;
    return <div className={wrapperClass}>{renderIcon()}</div>;
  }

  return renderIcon();
};
