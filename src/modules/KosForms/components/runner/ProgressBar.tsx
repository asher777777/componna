import React from 'react';

export interface ProgressBarProps {
  currentStepIndex: number;
  totalSteps: number;
  progressPercent: number;
  accentColor?: string;
  showStepNumbers?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStepIndex,
  totalSteps,
  progressPercent,
  accentColor = '#D97706',
  showStepNumbers = true,
}) => {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
        {showStepNumbers && (
          <span>
            שלב {currentStepIndex + 1} מתוך {totalSteps}
          </span>
        )}
        <span>{progressPercent}% הושלמו</span>
      </div>
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500 ease-out rounded-full shadow-sm"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: accentColor,
          }}
        />
      </div>
    </div>
  );
};
