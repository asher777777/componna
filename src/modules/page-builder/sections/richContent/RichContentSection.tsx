import React from 'react';
import { RichContentSectionConfig } from '../../types/sectionConfigs';
import { clsx } from 'clsx';

export const RichContentSection: React.FC<{ config: RichContentSectionConfig }> = ({ config }) => {
  const {
    anchorId,
    heading = 'אודות הפרויקט והחזון שלנו',
    body = '<p>אנו פועלים מתוך תחושת שליחות עמוקה לחבר, להנגיש ולהעצים את הקהילה בכל מקום בעולם.</p><p>הפלטפורמה שלנו פותחה במיוחד כדי לתת מענה שלם, טכנולוגי ואיכותי לכל יוזמה וקהילה.</p>',
    layout = 'standard',
    backgroundColor = 'transparent',
  } = config;

  return (
    <section
      id={anchorId || 'richContent'}
      className="w-full py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div
        className={clsx(
          'max-w-4xl mx-auto text-right flex flex-col gap-6',
          layout === 'highlight-box' && 'bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-xl'
        )}
      >
        {heading && (
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {heading}
          </h2>
        )}

        <div
          className={clsx(
            'text-base sm:text-lg text-slate-300 leading-relaxed space-y-4 font-normal',
            layout === 'two-columns' && 'sm:columns-2 sm:gap-8'
          )}
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </div>
    </section>
  );
};
