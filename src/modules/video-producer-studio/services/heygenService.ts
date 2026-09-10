import { HeyGenAvatar, HeyGenVoice, HeyGenGenerateJobResult } from '../types';

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
  { voice_id: '077ab11b14f04ce0b49b5f67b5f59629', name: 'Alon (Hebrew Natural)', language: 'Hebrew', gender: 'male' },
  { voice_id: '131a436e60e24f1191a3538b6ec051e7', name: 'Hila (Hebrew Female)', language: 'Hebrew', gender: 'female' },
  { voice_id: '2d5b0e6cf36f460aa7fc47e3eee4ba54', name: 'Sarah (English US)', language: 'English', gender: 'female' },
  { voice_id: '3b09282df5844888be6a89c491b359f4', name: 'Adam (English US)', language: 'English', gender: 'male' },
];

export async function fetchHeyGenAvatars(apiKey: string): Promise<HeyGenAvatar[]> {
  if (!apiKey) return DEFAULT_AVATARS;
  try {
    const res = await fetch('https://api.heygen.com/v2/avatars', {
      headers: {
        'X-Api-Key': apiKey.trim(),
        'Accept': 'application/json'
      }
    });
    if (!res.ok) throw new Error(`HeyGen error ${res.status}`);
    const data = await res.json();
    if (data?.data?.avatars && Array.isArray(data.data.avatars)) {
      return data.data.avatars.map((a: any) => ({
        avatar_id: a.avatar_id,
        avatar_name: a.avatar_name || a.avatar_id,
        gender: a.gender || 'neutral',
        preview_image_url: a.preview_image_url || a.preview_url || '',
        preview_video_url: a.preview_video_url
      }));
    }
    return DEFAULT_AVATARS;
  } catch (err) {
    console.warn('[HeyGen] Failed to fetch live avatars, using defaults:', err);
    return DEFAULT_AVATARS;
  }
}

export async function fetchHeyGenVoices(apiKey: string): Promise<HeyGenVoice[]> {
  if (!apiKey) return DEFAULT_VOICES;
  try {
    const res = await fetch('https://api.heygen.com/v2/voices', {
      headers: {
        'X-Api-Key': apiKey.trim(),
        'Accept': 'application/json'
      }
    });
    if (!res.ok) throw new Error(`HeyGen error ${res.status}`);
    const data = await res.json();
    if (data?.data?.voices && Array.isArray(data.data.voices)) {
      return data.data.voices.map((v: any) => ({
        voice_id: v.voice_id,
        name: v.name || v.voice_id,
        language: v.language || 'Hebrew',
        gender: v.gender || 'neutral',
        preview_audio: v.preview_audio
      }));
    }
    return DEFAULT_VOICES;
  } catch (err) {
    console.warn('[HeyGen] Failed to fetch live voices, using defaults:', err);
    return DEFAULT_VOICES;
  }
}

/**
 * Convert a base64 Data URI to a Blob and extracted MIME type
 */
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

function extractHeyGenErrorMessage(errData: any, status: number): string {
  if (!errData) return `HeyGen API error (${status})`;
  if (typeof errData === 'string') return errData;
  if (typeof errData.error === 'string') return errData.error;
  if (errData.error?.message) return String(errData.error.message);
  if (errData.message) return String(errData.message);
  if (errData.data && typeof errData.data === 'string') return errData.data;
  if (errData.data?.message) return String(errData.data.message);
  if (errData.failure_message) return String(errData.failure_message);
  try {
    return JSON.stringify(errData);
  } catch {
    return `HeyGen API error (${status})`;
  }
}

/**
 * Upload an asset (image or audio) file/blob/DataURI/URL to HeyGen Asset API (/v1/asset)
 * This does NOT register a Photo Avatar and is NOT subject to the 3-avatar limit.
 */
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
    } else if (mediaData.startsWith('http://') || mediaData.startsWith('https://')) {
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

  const res = await fetch('https://upload.heygen.com/v1/asset', {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey.trim(),
      'Content-Type': mimeType
    },
    body: blob
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(extractHeyGenErrorMessage(errData, res.status));
  }

  const data = await res.json();
  const assetId = data?.data?.id || data?.data?.asset_id;
  const assetUrl = data?.data?.url || data?.data?.file_url;
  return { asset_id: assetId, asset_url: assetUrl };
}

/**
 * Upload audio to HeyGen asset storage
 */
export async function uploadAudioToHeyGen(
  apiKey: string,
  audioData: string | Blob
): Promise<{ audio_asset_id?: string; audio_url?: string }> {
  const res = await uploadAssetToHeyGen(apiKey, audioData, 'audio/wav');
  return { audio_asset_id: res.asset_id, audio_url: res.asset_url };
}

/**
 * Upload talking photo image to HeyGen asset storage
 */
export async function uploadTalkingPhotoToHeyGen(
  apiKey: string,
  imageData: string | Blob
): Promise<{ talking_photo_id?: string; talking_photo_url?: string }> {
  const res = await uploadAssetToHeyGen(apiKey, imageData, 'image/jpeg');
  return { talking_photo_id: res.asset_id, talking_photo_url: res.asset_url };
}

export async function fetchHeyGenTalkingPhotos(
  apiKey: string
): Promise<{ talking_photo_id: string; talking_photo_name?: string; preview_image_url?: string }[]> {
  if (!apiKey) return [];
  try {
    const res = await fetch('https://api.heygen.com/v2/talking_photos', {
      headers: {
        'X-Api-Key': apiKey.trim(),
        'Accept': 'application/json'
      }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data?.talking_photos || [];
  } catch (err) {
    console.warn('[HeyGen] Failed to fetch talking photos:', err);
    return [];
  }
}

/**
 * Helper to obtain a valid talking_photo_id if v2 talking_photo character mode is required
 */
export async function getOrCreateTalkingPhotoId(
  apiKey: string,
  imageData: string | Blob
): Promise<string | null> {
  let blob: Blob | null = null;
  let mimeType = 'image/jpeg';

  if (typeof imageData === 'string') {
    if (imageData.startsWith('data:')) {
      const parsed = dataUriToBlob(imageData);
      blob = parsed.blob;
      mimeType = parsed.mimeType;
    } else if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
      try {
        const res = await fetch(imageData);
        blob = await res.blob();
        mimeType = blob.type || 'image/jpeg';
      } catch {
        // cannot fetch blob
      }
    }
  } else {
    blob = imageData;
    mimeType = imageData.type || 'image/jpeg';
  }

  // 1. Try dedicated talking_photo upload endpoint
  if (blob) {
    try {
      const res = await fetch('https://upload.heygen.com/v1/talking_photo', {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey.trim(),
          'Content-Type': mimeType
        },
        body: blob
      });
      if (res.ok) {
        const data = await res.json();
        const photoId = data?.data?.talking_photo_id || data?.data?.id;
        if (photoId) return photoId;
      }
    } catch (err) {
      console.warn('[HeyGen] talking_photo upload notice:', err);
    }
  }

  // 2. Fallback: Fetch existing talking photos from HeyGen account
  try {
    const existing = await fetchHeyGenTalkingPhotos(apiKey);
    if (existing && existing.length > 0 && existing[0].talking_photo_id) {
      return existing[0].talking_photo_id;
    }
  } catch (err) {
    console.warn('[HeyGen] fetch existing talking photos notice:', err);
  }

  return null;
}

/**
 * Generate HeyGen Video using the dedicated Image-to-Video model (POST /v3/videos with type="image")
 * or Studio Avatar model (type="avatar") with full Google TTS audio integration.
 * Refer to https://developers.heygen.com/image-to-video
 */
export async function generateHeyGenSceneVideo(
  apiKey: string,
  params: {
    avatarId?: string;
    scriptText: string;
    voiceId?: string;
    aspectRatio?: '16:9' | '9:16' | '1:1';
    backgroundMediaUrl?: string;
    customAvatarImageUrl?: string;
    imageUrl?: string;
    audioUrl?: string;
    isPhotoAvatar?: boolean;
  }
): Promise<string> {
  if (!apiKey) {
    throw new Error('נא להזין מפתח HeyGen API Key ברכיב ה-DB Connector.');
  }

  const rawPhoto = params.customAvatarImageUrl || params.imageUrl || params.backgroundMediaUrl;
  const isImageToVideo = Boolean(rawPhoto && rawPhoto.trim());

  // 1. Prepare Audio Asset (Google TTS or uploaded voice track)
  let audioAssetId: string | undefined;
  let publicAudioUrl: string | undefined;

  if (params.audioUrl && params.audioUrl.trim()) {
    try {
      const audioResult = await uploadAudioToHeyGen(apiKey, params.audioUrl);
      audioAssetId = audioResult.audio_asset_id;
      publicAudioUrl = audioResult.audio_url;
    } catch (audioErr) {
      console.warn('[HeyGen] Audio asset upload fallback:', audioErr);
      if (params.audioUrl.startsWith('http')) {
        publicAudioUrl = params.audioUrl;
      }
    }
  }

  // 2. Prepare Image Asset if Image-to-Video
  let imageAssetId: string | undefined;
  let publicImageUrl: string | undefined;

  if (isImageToVideo && rawPhoto) {
    try {
      const imageResult = await uploadAssetToHeyGen(apiKey, rawPhoto, 'image/jpeg');
      imageAssetId = imageResult.asset_id;
      publicImageUrl = imageResult.asset_url;
    } catch (imgErr) {
      console.warn('[HeyGen] Image asset upload fallback:', imgErr);
      if (rawPhoto.startsWith('http')) {
        publicImageUrl = rawPhoto;
      }
    }
  }

  const aspectRatio = params.aspectRatio === '9:16' ? '9:16' : (params.aspectRatio === '1:1' ? '1:1' : '16:9');

  // 3. Try HeyGen Image-to-Video API (POST /v3/videos)
  try {
    let v3Payload: any;

    if (isImageToVideo) {
      // Image to Video Model (https://developers.heygen.com/image-to-video)
      v3Payload = {
        type: 'image',
        image: imageAssetId
          ? { type: 'asset_id', asset_id: imageAssetId }
          : { type: 'url', url: publicImageUrl || rawPhoto },
        aspect_ratio: aspectRatio,
        title: 'Comona Image-to-Video Scene'
      };

      if (audioAssetId) {
        v3Payload.audio_asset_id = audioAssetId;
      } else if (publicAudioUrl) {
        v3Payload.audio_url = publicAudioUrl;
      } else if (params.scriptText?.trim()) {
        v3Payload.script = params.scriptText;
        v3Payload.voice_id = params.voiceId || '077ab11b14f04ce0b49b5f67b5f59629';
      }
    } else {
      // Studio Avatar Model
      v3Payload = {
        type: 'avatar',
        avatar_id: params.avatarId || 'Wayne_20240711',
        avatar_style: 'normal',
        aspect_ratio: aspectRatio,
        title: 'Comona Avatar Scene'
      };

      if (audioAssetId) {
        v3Payload.audio_asset_id = audioAssetId;
      } else if (publicAudioUrl) {
        v3Payload.audio_url = publicAudioUrl;
      } else if (params.scriptText?.trim()) {
        v3Payload.script = params.scriptText;
        v3Payload.voice_id = params.voiceId || '077ab11b14f04ce0b49b5f67b5f59629';
      }
    }

    console.log('[HeyGen] Sending POST /v3/videos payload:', JSON.stringify(v3Payload, null, 2));

    const v3Res = await fetch('https://api.heygen.com/v3/videos', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey.trim(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(v3Payload)
    });

    if (v3Res.ok) {
      const data = await v3Res.json();
      const videoId = data?.data?.video_id || data?.data?.id || data?.video_id || data?.id;
      if (videoId) {
        console.info('[HeyGen] Successfully started v3 video job:', videoId);
        return videoId;
      }
    } else {
      const errJson = await v3Res.json().catch(() => ({}));
      console.warn('[HeyGen] /v3/videos returned error:', errJson);
    }
  } catch (v3Err) {
    console.warn('[HeyGen] /v3/videos call failed, falling back to /v2/video/generate:', v3Err);
  }

  // 4. Fallback to /v2/video/generate
  const dimensionMap = {
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '1:1': { width: 1080, height: 1080 }
  };
  const dimension = dimensionMap[params.aspectRatio || '16:9'];

  let characterConfig: any;
  let backgroundConfig: any = undefined;

  // If image is provided, try getting a valid talking photo ID, otherwise use image as background with avatar
  let talkingPhotoId: string | null = null;
  if (isImageToVideo && rawPhoto) {
    talkingPhotoId = await getOrCreateTalkingPhotoId(apiKey, rawPhoto);
  }

  if (talkingPhotoId) {
    characterConfig = {
      type: 'talking_photo',
      talking_photo_id: talkingPhotoId
    };
  } else {
    characterConfig = {
      type: 'avatar',
      avatar_id: params.avatarId || 'Wayne_20240711',
      avatar_style: 'normal'
    };
    if (publicImageUrl || (rawPhoto && rawPhoto.startsWith('http'))) {
      backgroundConfig = {
        type: 'image',
        url: publicImageUrl || rawPhoto
      };
    }
  }

  let voiceConfig: any;
  if (publicAudioUrl) {
    voiceConfig = {
      type: 'audio',
      audio_url: publicAudioUrl
    };
  } else if (audioAssetId) {
    voiceConfig = {
      type: 'audio',
      audio_asset_id: audioAssetId
    };
  } else {
    voiceConfig = {
      type: 'text',
      input_text: params.scriptText,
      voice_id: params.voiceId || '077ab11b14f04ce0b49b5f67b5f59629'
    };
  }

  const v2Payload: any = {
    video_inputs: [
      {
        character: characterConfig,
        voice: voiceConfig,
        ...(backgroundConfig && { background: backgroundConfig })
      }
    ],
    dimension
  };

  console.log('[HeyGen] Sending fallback POST /v2/video/generate payload:', JSON.stringify(v2Payload, null, 2));

  const v2Res = await fetch('https://api.heygen.com/v2/video/generate', {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey.trim(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(v2Payload)
  });

  if (!v2Res.ok) {
    const errData = await v2Res.json().catch(() => ({}));
    console.error('[HeyGen] Generate video fallback error response:', errData);
    throw new Error(extractHeyGenErrorMessage(errData, v2Res.status));
  }

  const v2Data = await v2Res.json();
  const videoId = v2Data?.data?.video_id;
  if (!videoId) {
    throw new Error('לא התקבל מזהה סרטון מ-HeyGen.');
  }

  return videoId;
}

export async function pollHeyGenVideoStatus(
  apiKey: string,
  videoId: string
): Promise<HeyGenGenerateJobResult> {
  // 1. Try v3 status endpoint
  try {
    const v3Res = await fetch(`https://api.heygen.com/v3/videos/${videoId}`, {
      headers: {
        'X-Api-Key': apiKey.trim(),
        'Accept': 'application/json'
      }
    });

    if (v3Res.ok) {
      const data = await v3Res.json();
      const item = data?.data || data;
      const statusRaw = String(item?.status || '').toLowerCase();
      const status = statusRaw === 'completed' ? 'completed' : (statusRaw === 'failed' ? 'failed' : 'processing');
      const videoUrl = item?.video_url;
      const error = item?.failure_message || item?.error?.message || item?.error;

      return {
        video_id: videoId,
        status,
        video_url: videoUrl,
        error
      };
    }
  } catch (v3Err) {
    console.warn('[HeyGen] v3 status check fallback:', v3Err);
  }

  // 2. Fallback to v1 video_status.get endpoint
  const res = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
    headers: {
      'X-Api-Key': apiKey.trim(),
      'Accept': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to check video status (${res.status})`);
  }

  const data = await res.json();
  const status = data?.data?.status;
  const videoUrl = data?.data?.video_url;
  const error = data?.data?.error;

  return {
    video_id: videoId,
    status: status === 'completed' ? 'completed' : (status === 'failed' ? 'failed' : 'processing'),
    video_url: videoUrl,
    error: error?.message || error
  };
}
