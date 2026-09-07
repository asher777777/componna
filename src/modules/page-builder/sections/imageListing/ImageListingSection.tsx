import React from 'react';
import { ImageListingSectionConfig } from '../../types/sectionConfigs';
import { clsx } from 'clsx';

export const ImageListingSection: React.FC<{ config: ImageListingSectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title,
    imagesPerRow = 3,
    backgroundColor = 'transparent',
    images = [
      { id: '1', imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80', title: 'אירוע פתיחה מרכזי', subtitle: 'תשרי תשפ״ו' },
      { id: '2', imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', title: 'צוות ההדרכה והפיתוח', subtitle: 'כנס שנתי' },
      { id: '3', imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80', title: 'מרכז הלמידה הדיגיטלי', subtitle: 'חדר מחשבים' },
    ],
  } = config;

  const colClasses: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  };

  return (
    <section
      id={anchorId || 'imageListing'}
      className="w-full py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {title && (
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{title}</h2>
          </div>
        )}

        <div className={clsx('grid gap-6', colClasses[imagesPerRow] || colClasses[3])}>
          {images.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl aspect-square flex flex-col justify-end"
            >
              <img
                src={item.imageUrl}
                alt={item.title || 'Image'}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

              {(item.title || item.subtitle) && (
                <div className="relative z-10 p-5 text-right">
                  {item.subtitle && <span className="text-[11px] text-indigo-400 font-bold block mb-1">{item.subtitle}</span>}
                  {item.title && <h3 className="text-base font-bold text-white leading-tight">{item.title}</h3>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
