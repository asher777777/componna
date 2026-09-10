import { MediaItem } from '../types';

export interface HeyGenApiVideoItem {
  id?: string;
  video_id?: string;
  title?: string;
  video_title?: string;
  status?: string;
  video_url?: string;
  url?: string;
  thumbnail_url?: string;
  preview_url?: string;
  gif_url?: string;
  duration?: number;
  created_at?: number | string;
  completed_at?: number | string;
  video_page_url?: string;
  failure_code?: string;
  failure_message?: string;
}

export class HeyGenSyncService {
  /**
   * Fetch all generated videos from HeyGen account using GET API
   */
  public static async fetchVideosFromHeyGen(apiKey: string): Promise<MediaItem[]> {
    const cleanKey = (apiKey || '').trim();
    if (!cleanKey) {
      throw new Error('לא הוגדר מפתח HeyGen API בהגדרות המערכת.');
    }

    let rawVideos: HeyGenApiVideoItem[] = [];
    let fetchError: string | null = null;

    // 1. Try modern HeyGen v3 videos list endpoint
    try {
      const resV3 = await fetch('https://api.heygen.com/v3/videos?limit=100', {
        method: 'GET',
        headers: {
          'x-api-key': cleanKey,
          'Accept': 'application/json',
        },
      });

      if (resV3.ok) {
        const json = await resV3.json();
        const data = json?.data?.videos || json?.data || json?.videos;
        if (Array.isArray(data)) {
          rawVideos = data;
        }
      } else {
        const errJson = await resV3.json().catch(() => ({}));
        fetchError = errJson?.message || errJson?.error || `HTTP ${resV3.status}`;
      }
    } catch (e: any) {
      fetchError = e.message;
    }

    // 2. Fallback to v1 / v2 endpoints if v3 returned no videos or failed
    if (rawVideos.length === 0) {
      try {
        const resV1 = await fetch('https://api.heygen.com/v1/video_list', {
          method: 'GET',
          headers: {
            'X-Api-Key': cleanKey,
            'Accept': 'application/json',
          },
        });

        if (resV1.ok) {
          const json = await resV1.json();
          const list = json?.data?.video_list || json?.data?.videos || json?.data;
          if (Array.isArray(list)) {
            rawVideos = list;
          }
        }
      } catch {}
    }

    if (rawVideos.length === 0 && fetchError) {
      throw new Error(`שגיאה במשיכת סרטונים מ-HeyGen: ${fetchError}`);
    }

    // Transform HeyGen video objects to standardized MediaItem objects
    const mediaItems: MediaItem[] = rawVideos
      .filter((v) => v.video_url || v.url || v.status === 'completed' || v.thumbnail_url)
      .map((v, index) => {
        const videoId = v.id || v.video_id || `heygen_${index}_${Date.now()}`;
        const videoUrl = v.video_url || v.url || '';
        const thumbUrl = v.thumbnail_url || v.preview_url || v.gif_url || '';
        
        let title = (v.title || v.video_title || '').trim();
        if (!title) {
          title = `סרטון HeyGen (${videoId.slice(-6)})`;
        }
        if (!title.toLowerCase().endsWith('.mp4')) {
          title = `${title}.mp4`;
        }

        let createdAt = Date.now();
        if (v.created_at) {
          if (typeof v.created_at === 'number') {
            createdAt = v.created_at < 10000000000 ? v.created_at * 1000 : v.created_at;
          } else {
            const parsed = new Date(v.created_at).getTime();
            if (!isNaN(parsed)) createdAt = parsed;
          }
        }

        const item: MediaItem = {
          id: `heygen_${videoId}`,
          name: title,
          url: videoUrl,
          thumbnailUrl: thumbUrl,
          type: 'video',
          mimeType: 'video/mp4',
          sizeBytes: 0,
          sourceModule: 'video-producer-studio',
          sourceModuleLabel: 'סטודיו וידאו ואווטאר (HeyGen & Veo)',
          tags: ['heygen', 'avatar_video', 'cloud_sync', v.status || 'completed'],
          createdAt,
          updatedAt: Date.now(),
          metadata: {
            source: 'heygen_cloud_api',
            heygenId: videoId,
            status: v.status || 'completed',
            duration: v.duration,
            videoPageUrl: v.video_page_url,
            isHeyGenSync: true,
          },
        };

        return item;
      });

    return mediaItems;
  }
}
