import React from 'react';
import { TenantStylePreset } from '../../../../core/contracts';
import { resolveKoswebFormStyle } from '../../config/koswebStylePresets';

export interface ProgressBarProps {
  currentStepIndex: number;
  totalSteps: number;
  progressPercent: number;
  accentColor?: string;
  showStepNumbers?: boolean;
  stylePreset?: TenantStylePreset;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStepIndex,
  totalSteps,
  progressPercent,
  accentColor,
  showStepNumbers = true,
  stylePreset,
}) => {
  const styleTokens = resolveKoswebFormStyle(stylePreset);
  const effectiveAccent = accentColor || styleTokens.themeDefaults.accentColor || '#D97706';

  return (
    <div className="w-full space-y-2">
      <div className={`flex items-center justify-between text-xs font-semibold px-1 ${styleTokens.progressTextClass}`}>
        {showStepNumbers && (
          <span>
            שלב {currentStepIndex + 1} מתוך {totalSteps}
          </span>
        )}
        <span>{progressPercent}% הושלמו</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`w-full h-2 overflow-hidden ${styleTokens.progressTrackClass}`}
      >
        <div
          className="h-full transition-all duration-500 ease-out rounded-inherit shadow-sm"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: effectiveAccent,
          }}
        />
      </div>
    </div>
  );
};
