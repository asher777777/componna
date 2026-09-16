import { HeyGenAvatar, HeyGenVoice, HeyGenGenerateJobResult } from '../types';

/**
 * Route API requests through Vite dev proxy on localhost to avoid browser CORS preflight errors
 */
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

export async function resolveValidVoiceId(apiKey: string, requestedVoiceId?: string): Promise<string> {
  const invalidDefault = '077ab11b14f04ce0b49b5f67b5f59629';
  if (apiKey && apiKey.trim()) {
    try {
      const liveVoices = await fetchHeyGenVoices(apiKey);
      if (liveVoices && liveVoices.length > 0) {
        // If requested voice ID is valid and exists in live voices, use it
        if (requestedVoiceId && requestedVoiceId !== invalidDefault) {
          const match = liveVoices.find(v => v.voice_id === requestedVoiceId);
          if (match) return match.voice_id;
        }
        // Look for a Hebrew voice first
        const hebrewVoice = liveVoices.find(v => 
          v.language?.toLowerCase().includes('hebrew') || 
          v.name?.toLowerCase().includes('hebrew') ||
          v.language?.toLowerCase().includes('he-il')
        );
        if (hebrewVoice) return hebrewVoice.voice_id;

        // Otherwise return the first active voice available on this HeyGen account
        return liveVoices[0].voice_id;
      }
    } catch (err) {
      console.warn('[HeyGen] Could not query live voices for fallback:', err);
    }
  }

  // Fallback to recognized standard voice if API call failed
  if (requestedVoiceId && requestedVoiceId !== invalidDefault) {
    return requestedVoiceId;
  }
  return '1bd001e7e50f421d891986aad5158bc8';
}

export async function fetchHeyGenAvatars(apiKey: string): Promise<HeyGenAvatar[]> {
  if (!apiKey || !apiKey.trim()) return DEFAULT_AVATARS;
  try {
    let res = await fetch(getHeyGenApiUrl('/v2/avatars'), {
      headers: {
        'X-Api-Key': apiKey.trim(),
        'Accept': 'application/json'
      }
    });

    if (!res.ok && getHeyGenApiUrl('/v2/avatars') !== 'https://api.heygen.com/v2/avatars') {
      res = await fetch('https://api.heygen.com/v2/avatars', {
        headers: {
          'X-Api-Key': apiKey.trim(),
          'Accept': 'application/json'
        }
      });
    }

    if (!res.ok) throw new Error(`HeyGen error ${res.status}`);
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
  } catch (err) {
    console.warn('[HeyGen] Failed to fetch live avatars, using defaults:', err);
    return DEFAULT_AVATARS;
  }
}

export async function fetchHeyGenVoices(apiKey: string): Promise<HeyGenVoice[]> {
  if (!apiKey || !apiKey.trim()) return DEFAULT_VOICES;
  try {
    let res = await fetch(getHeyGenApiUrl('/v2/voices'), {
      headers: {
        'X-Api-Key': apiKey.trim(),
        'Accept': 'application/json'
      }
    });

    if (!res.ok && getHeyGenApiUrl('/v2/voices') !== 'https://api.heygen.com/v2/voices') {
      res = await fetch('https://api.heygen.com/v2/voices', {
        headers: {
          'X-Api-Key': apiKey.trim(),
          'Accept': 'application/json'
        }
      });
    }

    if (!res.ok) throw new Error(`HeyGen error ${res.status}`);
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
  if (!errData) return `שגיאת שרת HeyGen (${status})`;
  if (typeof errData === 'string') return errData;
  if (errData.message && typeof errData.message === 'string') return errData.message;
  if (errData.error?.message && typeof errData.error?.message === 'string') return errData.error.message;
  if (errData.error && typeof errData.error === 'string') return errData.error;
  if (errData.data?.message && typeof errData.data?.message === 'string') return errData.data.message;
  if (errData.data && typeof errData.data === 'string') return errData.data;
  if (errData.code) return `קוד שגיאה: ${errData.code} - ${errData.message || JSON.stringify(errData)}`;
  try {
    return JSON.stringify(errData);
  } catch {
    return `שגיאת שרת HeyGen (${status})`;
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

  let res = await fetch(getHeyGenUploadUrl('/v1/asset'), {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey.trim(),
      'Content-Type': mimeType
    },
    body: blob
  });

  if (!res.ok && res.status === 404 && getHeyGenUploadUrl('/v1/asset') !== 'https://upload.heygen.com/v1/asset') {
    res = await fetch('https://upload.heygen.com/v1/asset', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey.trim(),
        'Content-Type': mimeType
      },
      body: blob
    });
  }

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
    const res = await fetch(getHeyGenApiUrl('/v2/talking_photos'), {
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
  // 1. Try Asset upload first - HeyGen accepts the uploaded asset_id as talking_photo_id
  try {
    const assetRes = await uploadAssetToHeyGen(apiKey, imageData, 'image/jpeg');
    if (assetRes.asset_id) {
      console.info('[HeyGen] Obtained asset_id for talking photo:', assetRes.asset_id);
      return assetRes.asset_id;
    }
  } catch (assetErr) {
    console.warn('[HeyGen] Asset upload notice:', assetErr);
  }

  // 2. Try dedicated talking_photo upload endpoint
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

  if (blob) {
    try {
      let res = await fetch(getHeyGenUploadUrl('/v1/talking_photo'), {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey.trim(),
          'Content-Type': mimeType
        },
        body: blob
      });

      if (!res.ok && res.status === 404 && getHeyGenUploadUrl('/v1/talking_photo') !== 'https://upload.heygen.com/v1/talking_photo') {
        res = await fetch('https://upload.heygen.com/v1/talking_photo', {
          method: 'POST',
          headers: {
            'X-Api-Key': apiKey.trim(),
            'Content-Type': mimeType
          },
          body: blob
        });
      }

      if (res.ok) {
        const data = await res.json();
        const photoId = data?.data?.talking_photo_id || data?.data?.id || data?.id;
        if (photoId) return photoId;
      }
    } catch (err) {
      console.warn('[HeyGen] talking_photo upload notice:', err);
    }
  }

  // 3. Fallback: Fetch existing talking photos from HeyGen account
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
 * Generate HeyGen Video with full Avatar, Photo Avatar, Background, and Audio integration.
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
  if (!apiKey || !apiKey.trim()) {
    throw new Error('נא להזין מפתח HeyGen API Key ברכיב ה-DB Connector.');
  }

  const rawPhoto = params.customAvatarImageUrl || params.imageUrl || params.backgroundMediaUrl;

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

  // 2. Prepare Image / Background Asset
  let imageAssetId: string | undefined;
  let publicImageUrl: string | undefined;

  if (rawPhoto) {
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

  // Resolve valid voice ID dynamically if script text is provided
  let resolvedVoiceId: string = '1bd001e7e50f421d891986aad5158bc8';
  if (params.scriptText?.trim()) {
    resolvedVoiceId = await resolveValidVoiceId(apiKey, params.voiceId);
  }

  // 3. Resolve Character (Photo Avatar or Studio Avatar)
  let character: any;

  const wantsPhotoAvatar = params.isPhotoAvatar || !!params.customAvatarImageUrl || (!!rawPhoto && !params.avatarId);

  if (wantsPhotoAvatar && rawPhoto) {
    let photoId: string | null | undefined = imageAssetId;
    if (!photoId) {
      photoId = await getOrCreateTalkingPhotoId(apiKey, rawPhoto);
    }
    if (photoId) {
      character = {
        type: 'talking_photo',
        talking_photo_id: photoId
      };
      console.info('[HeyGen] Using talking_photo character with ID:', photoId);
    } else {
      throw new Error('לא ניתן היה לעבד את תמונת הפרזנטור מול HeyGen. נא לוודא שהתמונה בפורמט תקין ולנסות שוב.');
    }
  }

  // If studio avatar requested or chosen
  if (!character) {
    const liveAvatars = await fetchHeyGenAvatars(apiKey);
    let chosenAvatarId = params.avatarId;

    // Check if the requested avatar ID exists in live account avatars
    const matchedAvatar = liveAvatars.find(a => a.avatar_id === chosenAvatarId);
    if (matchedAvatar) {
      chosenAvatarId = matchedAvatar.avatar_id;
    } else if (liveAvatars.length > 0) {
      // Use the first valid avatar from this HeyGen account
      chosenAvatarId = liveAvatars[0].avatar_id;
    } else {
      chosenAvatarId = 'Wayne_20240711';
    }

    character = {
      type: 'avatar',
      avatar_id: chosenAvatarId,
      avatar_style: 'normal'
    };
  }

  // 4. Construct Voice payload
  let voice: any;
  if (publicAudioUrl) {
    voice = {
      type: 'audio',
      audio_url: publicAudioUrl
    };
  } else {
    voice = {
      type: 'text',
      input_text: params.scriptText?.trim() || 'שלום וברוכים הבאים',
      voice_id: resolvedVoiceId
    };
  }

  // 5. Construct Dimension
  const dimension = aspectRatio === '9:16'
    ? { width: 720, height: 1280 }
    : (aspectRatio === '1:1' ? { width: 720, height: 720 } : { width: 1280, height: 720 });

  // 6. Construct Scene Input
  const sceneInput: any = {
    character,
    voice
  };

  // Background: only apply if not a talking photo (or if a separate background exists)
  if (character?.type !== 'talking_photo' && publicImageUrl) {
    sceneInput.background = {
      type: 'image',
      url: publicImageUrl
    };
  }

  const v2Payload = {
    video_inputs: [sceneInput],
    dimension,
    test: false
  };

  console.log('[HeyGen] Sending POST /v2/video/generate payload:', JSON.stringify(v2Payload, null, 2));

  // Try proxy first, fallback to direct URL if proxy returns 404 or fails
  const primaryUrl = getHeyGenApiUrl('/v2/video/generate');
  const directUrl = 'https://api.heygen.com/v2/video/generate';

  let response: Response;
  let resData: any;

  try {
    response = await fetch(primaryUrl, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey.trim(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(v2Payload)
    });
    resData = await response.json().catch(() => ({}));

    // If proxy returned 404 (e.g. Vite dev server hasn't reloaded proxy config), try direct URL
    if (!response.ok && primaryUrl !== directUrl && response.status === 404) {
      console.warn('[HeyGen] Proxy returned 404, attempting direct HeyGen URL...');
      response = await fetch(directUrl, {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey.trim(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(v2Payload)
      });
      resData = await response.json().catch(() => ({}));
    }
  } catch (netErr: any) {
    console.warn('[HeyGen] Primary request failed, attempting direct URL:', netErr);
    response = await fetch(directUrl, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey.trim(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(v2Payload)
    });
    resData = await response.json().catch(() => ({}));
  }

  if (!response.ok) {
    const errMsg = extractHeyGenErrorMessage(resData, response.status);
    console.error('[HeyGen] Full Error response:', { status: response.status, statusText: response.statusText, data: resData });
    throw new Error(`שגיאת HeyGen (${response.status}): ${errMsg}`);
  }

  const videoId = resData?.data?.video_id || resData?.data?.id || resData?.video_id || resData?.id;
  if (!videoId) {
    throw new Error('לא התקבל מזהה סרטון מ-HeyGen.');
  }

  console.info('[HeyGen] Video creation job started successfully:', videoId);
  return videoId;
}

export async function pollHeyGenVideoStatus(
  apiKey: string,
  videoId: string
): Promise<HeyGenGenerateJobResult> {
  // 1. Try v1 video_status.get endpoint
  try {
    const res = await fetch(getHeyGenApiUrl(`/v1/video_status.get?video_id=${videoId}`), {
      headers: {
        'X-Api-Key': apiKey.trim(),
        'Accept': 'application/json'
      }
    });

    if (res.ok) {
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
  } catch (err) {
    console.warn('[HeyGen] video_status.get error:', err);
  }

  // 2. Fallback to v3 status endpoint
  const v3Res = await fetch(getHeyGenApiUrl(`/v3/videos/${videoId}`), {
    headers: {
      'X-Api-Key': apiKey.trim(),
      'Accept': 'application/json'
    }
  });

  if (!v3Res.ok) {
    throw new Error(`Failed to check video status (${v3Res.status})`);
  }

  const itemData = await v3Res.json();
  const item = itemData?.data || itemData;
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
