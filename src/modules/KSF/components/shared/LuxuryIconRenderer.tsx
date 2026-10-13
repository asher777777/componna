import React from 'react';
import { getLuxuryIcon } from '../../config/luxuryIcons';

export interface LuxuryIconRendererProps {
  iconName?: string;
  className?: string;
  size?: number;
  color?: string;
  withContainer?: boolean;
  containerBg?: string;
  containerBorder?: string;
}

export const LuxuryIconRenderer: React.FC<LuxuryIconRendererProps> = ({
  iconName,
  className = 'w-5 h-5',
  size,
  color,
  withContainer = false,
  containerBg = 'bg-amber-500/10 dark:bg-amber-500/20',
  containerBorder = 'border-amber-500/30',
}) => {
  const IconComponent = getLuxuryIcon(iconName);

  if (withContainer) {
    return (
      <div
        className={`inline-flex items-center justify-center p-2.5 rounded-xl border ${containerBg} ${containerBorder} shadow-sm backdrop-blur-sm transition-all duration-300`}
      >
        <IconComponent
          className={className}
          size={size}
          style={color ? { color } : undefined}
        />
      </div>
    );
  }

  return (
    <IconComponent
      className={className}
      size={size}
      style={color ? { color } : undefined}
    />
  );
};
