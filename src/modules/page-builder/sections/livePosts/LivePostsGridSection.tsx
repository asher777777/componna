import React from 'react';
import { LivePostsGridSectionConfig } from '../../types/sectionConfigs';
import { Calendar, ArrowLeft, Tag } from 'lucide-react';
import { clsx } from 'clsx';

export const LivePostsGridSection: React.FC<{ config: LivePostsGridSectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title = 'עדכונים ואירועים אחרונים',
    description = 'כל מה שחדש וקורה בפעילות ובקהילה שלנו',
    backgroundColor = 'transparent',
    customPages = [
      {
        id: '1',
        title: 'סיכום כנס הקיץ השנתי בהשתתפות מאות משפחות',
        excerpt: 'חוויה מעצימה ומרגשת של חיבור ולימוד משותף...',
        date: '15 באוגוסט 2026',
        tag: 'אירועים',
        imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
        linkUrl: '#',
      },
      {
        id: '2',
        title: 'השקת תוכנית המלגות לסטודנטים וחוקרים',
        excerpt: 'פתיחת מסלול חדש להענקת מלגות מחקר וסיוע לימודי...',
        date: '02 באוגוסט 2026',
        tag: 'חדשות',
        imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
        linkUrl: '#',
      },
      {
        id: '3',
        title: 'פרויקט שיפוץ והרחבת מרכז הפעילות הקהילתי',
        excerpt: 'התקדמות העבודות לקראת פתיחת השנה החדשה...',
        date: '28 ביולי 2026',
        tag: 'פיתוח',
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
        linkUrl: '#',
      },
    ],
  } = config;

  return (
    <section
      id={anchorId || 'livePosts'}
      className="w-full py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        {(title || description) && (
          <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-2">
            {title && <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{title}</h2>}
            {description && <p className="text-sm text-slate-400">{description}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {customPages.map((post) => (
            <div
              key={post.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-300 group"
            >
              <div>
                {post.imageUrl && (
                  <div className="aspect-video w-full overflow-hidden relative">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {post.tag && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-950/80 backdrop-blur-md text-white border border-white/10">
                        {post.tag}
                      </span>
                    )}
                  </div>
                )}

                <div className="p-6 flex flex-col gap-3 text-right">
                  {post.date && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{post.date}</span>
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                    {post.title}
                  </h3>
                  {post.excerpt && <p className="text-xs text-slate-400 leading-relaxed">{post.excerpt}</p>}
                </div>
              </div>

              {post.linkUrl && (
                <div className="px-6 pb-6 pt-2">
                  <a
                    href={post.linkUrl}
                    className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors"
                  >
                    <span>קרא את הכתבה המלאה</span>
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
