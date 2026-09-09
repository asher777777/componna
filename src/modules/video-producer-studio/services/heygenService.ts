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

export async function generateHeyGenSceneVideo(
  apiKey: string,
  params: {
    avatarId: string;
    scriptText: string;
    voiceId?: string;
    aspectRatio?: '16:9' | '9:16' | '1:1';
    backgroundMediaUrl?: string;
  }
): Promise<string> {
  if (!apiKey) {
    throw new Error('נא להזין מפתח HeyGen API Key ברכיב ה-DB Connector.');
  }

  const dimensionMap = {
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '1:1': { width: 1080, height: 1080 }
  };
  const dimension = dimensionMap[params.aspectRatio || '16:9'];

  const payload = {
    video_inputs: [
      {
        character: {
          type: 'avatar',
          avatar_id: params.avatarId,
          avatar_style: 'normal'
        },
        voice: {
          type: 'text',
          input_text: params.scriptText,
          voice_id: params.voiceId || '077ab11b14f04ce0b49b5f67b5f59629'
        },
        ...(params.backgroundMediaUrl && {
          background: {
            type: 'image',
            url: params.backgroundMediaUrl
          }
        })
      }
    ],
    dimension
  };

  const res = await fetch('https://api.heygen.com/v2/video/generate', {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey.trim(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error || errData?.message || `HeyGen Video Creation failed (${res.status})`);
  }

  const data = await res.json();
  const videoId = data?.data?.video_id;
  if (!videoId) {
    throw new Error('לא התקבל מזהה סרטון מ-HeyGen.');
  }

  return videoId;
}

export async function pollHeyGenVideoStatus(
  apiKey: string,
  videoId: string
): Promise<HeyGenGenerateJobResult> {
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
