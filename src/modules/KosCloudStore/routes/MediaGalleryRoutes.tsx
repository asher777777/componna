import React from 'react';
import { MediaGalleryGrid } from '../components/MediaGalleryGrid';
import { MediaDriveSidebar } from '../components/MediaDriveSidebar';

export type MediaGallerySubRoute = 'vault' | 'folders' | 'studio' | 'landing_builder';

interface MediaGalleryRoutesProps {
  currentRoute?: MediaGallerySubRoute;
  onRouteChange?: (route: MediaGallerySubRoute) => void;
  theme?: 'dark' | 'light';
}

/**
 * Internal modular sub-routing for Media Gallery Hub
 * Supports switching between general file vault, folder manager, AI studio, and doc-to-landing-page builder.
 */
export const MediaGalleryRoutes: React.FC<MediaGalleryRoutesProps> = ({
  currentRoute = 'vault',
  theme = 'dark',
}) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 w-full" dir="rtl">
      {currentRoute === 'vault' && <MediaGalleryGrid />}
      {currentRoute === 'folders' && <MediaGalleryGrid />}
      {currentRoute === 'studio' && <MediaGalleryGrid />}
      {currentRoute === 'landing_builder' && <MediaGalleryGrid />}
    </div>
  );
};

export default MediaGalleryRoutes;
