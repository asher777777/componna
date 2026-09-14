import React from 'react';
import { BaseSectionConfig } from '../../types/pageBuilder.types';
import { SmartFormRunner } from '../../../smart-form-builder/components/runner/SmartFormRunner';

export interface SmartFormSectionConfig extends BaseSectionConfig {
  type: 'smartForm';
  formId?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  containerWidth?: 'sm' | 'md' | 'lg' | 'full';
  backgroundColor?: string;
}

export const SmartFormSection: React.FC<{ config: SmartFormSectionConfig }> = ({ config }) => {
  const widthClasses = {
    sm: 'max-w-xl',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    full: 'w-full',
  }[config.containerWidth || 'md'];

  return (
    <section
      id={`section-${config.id}`}
      className={`py-12 px-4 transition-all ${config.mobileHidden ? 'hidden md:block' : ''}`}
      style={{ backgroundColor: config.backgroundColor || 'transparent' }}
    >
      <div className={`mx-auto ${widthClasses} space-y-6`}>
        {(config.sectionTitle || config.sectionSubtitle) && (
          <div className="text-center space-y-2">
            {config.sectionTitle && (
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {config.sectionTitle}
              </h2>
            )}
            {config.sectionSubtitle && (
              <p className="text-base text-slate-500 max-w-xl mx-auto">
                {config.sectionSubtitle}
              </p>
            )}
          </div>
        )}

        {config.formId ? (
          <SmartFormRunner formId={config.formId} />
        ) : (
          <div dir="rtl" className="p-8 text-center bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-3xl text-amber-700 dark:text-amber-300 text-sm">
            נא לבחור טופס להטמעה בהגדרות הסקשן בעורך.
          </div>
        )}
      </div>
    </section>
  );
};
