import React from 'react';
import { VideoGallerySectionConfig } from '../../types/sectionConfigs';
import { Video, Play } from 'lucide-react';
import { clsx } from 'clsx';

export const VideoGallerySection: React.FC<{ config: VideoGallerySectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title,
    subtitle,
    videoUrl,
    images = [],
    desktopHeight = '480px',
    backgroundColor = 'transparent',
  } = config;

  const getEmbedUrl = (url?: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('vimeo.com/')) {
      const id = url.split('vimeo.com/')[1];
      return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <section
      id={anchorId || 'videoGallery'}
      className="w-full py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {(title || subtitle) && (
          <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-2">
            {subtitle && (
              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                {subtitle}
              </span>
            )}
            {title && (
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {title}
              </h2>
            )}
          </div>
        )}

        {/* Video Player Box */}
        <div
          className="w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative"
          style={{ height: desktopHeight }}
        >
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={title || 'Video Player'}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-500">
              <div className="w-16 h-16 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <Play className="w-8 h-8 ml-1" />
              </div>
              <span className="text-sm font-medium">לא הוגדר קישור וידאו</span>
            </div>
          )}
        </div>

        {/* Thumbnails if available */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
            {images.map((imgUrl, idx) => (
              <div key={idx} className="rounded-2xl overflow-hidden border border-slate-800 aspect-video group relative">
                <img src={imgUrl} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
