import { useMemo, useState } from 'react';
import { useKosTube } from '../context/KosTubeContext';
import { KosTubeVideo, KosTubeSeoPage, KosTubeFilterOptions } from '../types';

export function useKosTubeData(initialFilter: KosTubeFilterOptions = {}) {
  const { channel, videos, seoPages, isLoading, isSyncing, isGenerating } = useKosTube();
  const [filter, setFilter] = useState<KosTubeFilterOptions>(initialFilter);

  const filteredVideos = useMemo(() => {
    let result = [...videos];

    if (filter.search && filter.search.trim()) {
      const q = filter.search.trim().toLowerCase();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.youtubeVideoId.toLowerCase().includes(q)
      );
    }

    if (filter.status && filter.status !== 'all') {
      result = result.filter((v) => v.status === filter.status);
    }

    if (filter.sortBy === 'views_desc') {
      result.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else if (filter.sortBy === 'date_asc') {
      result.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
    } else {
      // date_desc
      result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    return result;
  }, [videos, filter]);

  const stats = useMemo(() => {
    const totalVideos = videos.length;
    const processedVideos = videos.filter((v) => v.status === 'processed').length;
    const pendingVideos = totalVideos - processedVideos;
    const totalSeoPages = seoPages.length;
    const averageSeoScore =
      totalSeoPages > 0
        ? Math.round(seoPages.reduce((acc, p) => acc + (p.seoScore || 0), 0) / totalSeoPages)
        : 0;

    return {
      totalVideos,
      processedVideos,
      pendingVideos,
      totalSeoPages,
      averageSeoScore,
    };
  }, [videos, seoPages]);

  return {
    channel,
    videos: filteredVideos,
    rawVideos: videos,
    seoPages,
    filter,
    setFilter,
    stats,
    isLoading,
    isSyncing,
    isGenerating,
  };
}
