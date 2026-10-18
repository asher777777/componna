import { HeyGenAvatar, HeyGenVoice, HeyGenGenerateJobResult } from '../types';

export function getHeyGenApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return `/api/heygen${cleanPath}`;
  }
  return `https://api.heygen.com${cleanPath}`;
}

export function getHeyGenUploadUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return `/upload/heygen${cleanPath}`;
  }
  return `https://upload.heygen.com${cleanPath}`;
}

export const DEFAULT_AVATARS: HeyGenAvatar[] = [
  {
    avatar_id: 'Wayne_20240711',
    avatar_name: 'Wayne (Business Pro)',
    gender: 'male',
    preview_image_url: 'https://files2.heygen.ai/avatar/v3/9b867c2957b4458bb64058b8d0034ea3/full/preview_target.webp',
  },
  {
    avatar_id: 'Daisy_20240711',
    avatar_name: 'Daisy (Creative Host)',
    gender: 'female',
    preview_image_url: 'https://files2.heygen.ai/avatar/v3/7cf55aa07c424683a45c613045618f0c/full/preview_target.webp',
  },
  {
    avatar_id: 'Silas_20240711',
    avatar_name: 'Silas (Tech Presenter)',
    gender: 'male',
    preview_image_url: 'https://files2.heygen.ai/avatar/v3/b0c16388486940e599cfdfae726c0ae7/full/preview_target.webp',
  },
  {
    avatar_id: 'Tyler_20240711',
    avatar_name: 'Tyler (Casual Host)',
    gender: 'male',
    preview_image_url: 'https://files2.heygen.ai/avatar/v3/37d048ea6ca140e785507be49755b410/full/preview_target.webp',
  },
  {
    avatar_id: 'Grace_20240711',
    avatar_name: 'Grace (Executive)',
    gender: 'female',
    preview_image_url: 'https://files2.heygen.ai/avatar/v3/3a9a13b6cb4a4804bc126ce2189d53f8/full/preview_target.webp',
  }
];

export const DEFAULT_VOICES: HeyGenVoice[] = [
  { voice_id: '1bd001e7e50f421d891986aad5158bc8', name: 'Sara (Natural Voice)', language: 'Hebrew/English', gender: 'female' },
  { voice_id: '26b200a0884541ddb94154942d96c9c6', name: 'Tony (Dynamic Host)', language: 'Hebrew/English', gender: 'male' },
  { voice_id: '131a436e60e24f1191a3538b6ec051e7', name: 'Hila (Hebrew Female)', language: 'Hebrew', gender: 'female' },
  { voice_id: '2d5b0e6cf36f460aa7fc47e3eee4ba54', name: 'Sarah (English US)', language: 'English', gender: 'female' },
  { voice_id: '3b09282df5844888be6a89c491b359f4', name: 'Adam (English US)', language: 'English', gender: 'male' },
];

export async function fetchHeyGenAvatars(apiKey: string): Promise<HeyGenAvatar[]> {
  if (!apiKey || !apiKey.trim()) return DEFAULT_AVATARS;
  try {
    const res = await fetch(getHeyGenApiUrl('/v2/avatars'), {
      headers: { 'X-Api-Key': apiKey.trim(), 'Accept': 'application/json' }
    });
    if (!res.ok) return DEFAULT_AVATARS;
    const data = await res.json();
    if (data?.data?.avatars && Array.isArray(data.data.avatars) && data.data.avatars.length > 0) {
      return data.data.avatars.map((a: any) => ({
        avatar_id: a.avatar_id,
        avatar_name: a.avatar_name || a.avatar_id,
        gender: a.gender || 'neutral',
        preview_image_url: a.preview_image_url || a.preview_url || '',
        preview_video_url: a.preview_video_url
      }));
    }
    return DEFAULT_AVATARS;
  } catch {
    return DEFAULT_AVATARS;
  }
}

export async function fetchHeyGenVoices(apiKey: string): Promise<HeyGenVoice[]> {
  if (!apiKey || !apiKey.trim()) return DEFAULT_VOICES;
  try {
    const res = await fetch(getHeyGenApiUrl('/v2/voices'), {
      headers: { 'X-Api-Key': apiKey.trim(), 'Accept': 'application/json' }
    });
    if (!res.ok) return DEFAULT_VOICES;
    const data = await res.json();
    if (data?.data?.voices && Array.isArray(data.data.voices) && data.data.voices.length > 0) {
      return data.data.voices.map((v: any) => ({
        voice_id: v.voice_id,
        name: v.name || v.voice_id,
        language: v.language || 'Hebrew',
        gender: v.gender || 'neutral',
        preview_audio: v.preview_audio
      }));
    }
    return DEFAULT_VOICES;
  } catch {
    return DEFAULT_VOICES;
  }
}

function dataUriToBlob(dataUri: string): { blob: Blob; mimeType: string } {
  const parts = dataUri.split(',');
  const header = parts[0] || '';
  const base64Data = parts[1] || '';
  const mimeMatch = header.match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const binaryStr = atob(base64Data);
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return { blob: new Blob([bytes], { type: mimeType }), mimeType };
}

export async function uploadAssetToHeyGen(
  apiKey: string,
  mediaData: string | Blob,
  defaultMime: string = 'image/jpeg'
): Promise<{ asset_id?: string; asset_url?: string }> {
  let blob: Blob;
  let mimeType = defaultMime;

  if (typeof mediaData === 'string') {
    if (mediaData.startsWith('data:')) {
      const parsed = dataUriToBlob(mediaData);
      blob = parsed.blob;
      mimeType = parsed.mimeType;
    } else if (mediaData.startsWith('http')) {
      try {
        const res = await fetch(mediaData);
        blob = await res.blob();
        mimeType = blob.type || defaultMime;
      } catch {
        return { asset_url: mediaData };
      }
    } else {
      return { asset_url: mediaData };
    }
  } else {
    blob = mediaData;
    mimeType = mediaData.type || defaultMime;
  }

  const res = await fetch(getHeyGenUploadUrl('/v1/asset'), {
    method: 'POST',
    headers: { 'X-Api-Key': apiKey.trim(), 'Content-Type': mimeType },
    body: blob
  });

  if (!res.ok) {
    throw new Error(`HeyGen upload error (${res.status})`);
  }

  const data = await res.json();
  return {
    asset_id: data?.data?.id || data?.data?.asset_id,
    asset_url: data?.data?.url || data?.data?.file_url
  };
}

export async function generateHeyGenSceneVideo(
  apiKey: string,
  params: {
    scriptText: string;
    voiceId?: string;
    aspectRatio?: '16:9' | '9:16' | '1:1' | 'auto';
    backgroundMediaUrl?: string;
    customAvatarImageUrl?: string;
    imageUrl?: string;
    audioUrl?: string;
    isPhotoAvatar?: boolean;
    avatarId?: string;
  }
): Promise<string> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('נא להזין מפתח HeyGen API Key במרכז הסנכרון.');
  }

  const rawPhoto = params.customAvatarImageUrl || params.imageUrl || params.backgroundMediaUrl;
  let photoId: string | undefined;

  if (rawPhoto) {
    try {
      const imgRes = await uploadAssetToHeyGen(apiKey, rawPhoto, 'image/jpeg');
      photoId = imgRes.asset_id;
    } catch (e) {
      console.warn('[HeyGen] Photo asset upload notice:', e);
    }
  }

  let publicAudioUrl: string | undefined;
  if (params.audioUrl && params.audioUrl.trim()) {
    try {
      const audioRes = await uploadAssetToHeyGen(apiKey, params.audioUrl, 'audio/wav');
      publicAudioUrl = audioRes.asset_url || (params.audioUrl.startsWith('http') ? params.audioUrl : undefined);
    } catch {
      if (params.audioUrl.startsWith('http')) publicAudioUrl = params.audioUrl;
    }
  }

  const character = photoId
    ? { type: 'talking_photo', talking_photo_id: photoId }
    : { type: 'avatar', avatar_id: params.avatarId || 'Wayne_20240711', avatar_style: 'normal' };

  const voice = publicAudioUrl
    ? { type: 'audio', audio_url: publicAudioUrl }
    : {
        type: 'text',
        input_text: params.scriptText?.trim() || 'שלום וברוכים הבאים',
        voice_id: params.voiceId && !params.voiceId.startsWith('he-IL') ? params.voiceId : '1bd001e7e50f421d891986aad5158bc8'
      };

  const dimension = params.aspectRatio === '9:16'
    ? { width: 720, height: 1280 }
    : params.aspectRatio === '1:1'
    ? { width: 720, height: 720 }
    : { width: 1280, height: 720 };

  const payload = {
    video_inputs: [{ character, voice }],
    dimension,
    test: false
  };

  const res = await fetch(getHeyGenApiUrl('/v2/video/generate'), {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey.trim(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const resData = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(resData?.error?.message || resData?.message || `HeyGen error (${res.status})`);
  }

  const videoId = resData?.data?.video_id || resData?.video_id;
  if (!videoId) throw new Error('לא התקבל מזהה סרטון מ-HeyGen.');
  return videoId;
}

export async function pollHeyGenVideoStatus(
  apiKey: string,
  videoId: string
): Promise<HeyGenGenerateJobResult> {
  const res = await fetch(getHeyGenApiUrl(`/v1/video_status.get?video_id=${videoId}`), {
    headers: { 'X-Api-Key': apiKey.trim(), 'Accept': 'application/json' }
  });
  if (!res.ok) {
    throw new Error(`Failed to check HeyGen video status (${res.status})`);
  }
  const data = await res.json();
  const status = data?.data?.status;
  return {
    video_id: videoId,
    status: status === 'completed' ? 'completed' : status === 'failed' ? 'failed' : 'processing',
    video_url: data?.data?.video_url,
    error: data?.data?.error?.message || data?.data?.error
  };
}
