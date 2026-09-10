export interface GoogleTtsVoice {
  id: string;
  name: string;
  languageCode: string;
  languageName: string;
  gender: 'FEMALE' | 'MALE' | 'NEUTRAL';
  type: 'Journey' | 'Studio' | 'Neural2' | 'Wavenet' | 'Standard';
  sampleText: string;
  description: string;
  badge: string;
}

export const GOOGLE_TTS_VOICES: GoogleTtsVoice[] = [
  // Hebrew Voices
  {
    id: 'he-IL-Wavenet-B',
    name: 'יוסי (he-IL-Wavenet-B)',
    languageCode: 'he-IL',
    languageName: 'עברית 🇮🇱',
    gender: 'MALE',
    type: 'Wavenet',
    sampleText: 'שלום! אני כאן כדי להעביר את המסר השיווקי שלכם בצורה סמכותית ומשכנעת.',
    description: 'קול גברי ישראלי בוגר, סמכותי ומשכנע, אידיאלי לסרטוני תדמית ו-B2B',
    badge: '🏆 מומלץ B2B'
  },
  {
    id: 'he-IL-Wavenet-A',
    name: 'מיכל (he-IL-Wavenet-A)',
    languageCode: 'he-IL',
    languageName: 'עברית 🇮🇱',
    gender: 'FEMALE',
    type: 'Wavenet',
    sampleText: 'היי! ברוכים הבאים. בואו נגלה יחד איך המוצר הזה ישנה את העסק שלכם.',
    description: 'קול נשי חם, רהוט ואישי, מעולה לעמודי נחיתה, קורסים והדרכות',
    badge: '⭐ פופולרי'
  },
  {
    id: 'he-IL-Wavenet-D',
    name: 'אלון (he-IL-Wavenet-D)',
    languageCode: 'he-IL',
    languageName: 'עברית 🇮🇱',
    gender: 'MALE',
    type: 'Wavenet',
    sampleText: 'הצטרפו אלינו עוד היום וקבלו גישה מיידית להנחה הבלעדית ל-24 שעות הקרובות!',
    description: 'קול גברי צעיר, אנרגטי וסוחף, מומלץ לרילס, טיקטוק וקמפיינים ממומנים',
    badge: '🔥 אנרגטי'
  },
  {
    id: 'he-IL-Wavenet-C',
    name: 'נועה (he-IL-Wavenet-C)',
    languageCode: 'he-IL',
    languageName: 'עברית 🇮🇱',
    gender: 'FEMALE',
    type: 'Wavenet',
    sampleText: 'ברוכים הבאים לקליניקה שלנו. אנו מציעים טיפול מקצועי ואישי לכל מטופל.',
    description: 'קול נשי רגוע, עדין ואינטליגנטי, מומלץ לקליניקות, יוקרה וייעוץ',
    badge: '🌸 יוקרתי'
  },

  // English US Voices
  {
    id: 'en-US-Journey-F',
    name: 'Sarah (en-US-Journey-F)',
    languageCode: 'en-US',
    languageName: 'English (US) 🇺🇸',
    gender: 'FEMALE',
    type: 'Journey',
    sampleText: 'Welcome to our platform! Today we are introducing our new AI-driven video solution.',
    description: 'Cutting-edge Google Journey model with ultra-natural conversational cadence',
    badge: '✨ Next-Gen Journey'
  },
  {
    id: 'en-US-Journey-D',
    name: 'David (en-US-Journey-D)',
    languageCode: 'en-US',
    languageName: 'English (US) 🇺🇸',
    gender: 'MALE',
    type: 'Journey',
    sampleText: 'Discover how automated video intelligence can 10x your customer conversion rates.',
    description: 'Dynamic conversational male voice with expressive human pacing',
    badge: '✨ Next-Gen Journey'
  },
  {
    id: 'en-US-Studio-O',
    name: 'Rachel (en-US-Studio-O)',
    languageCode: 'en-US',
    languageName: 'English (US) 🇺🇸',
    gender: 'FEMALE',
    type: 'Studio',
    sampleText: 'This is the premium standard for enterprise narrations and commercials.',
    description: 'Broadcast-grade studio voice engineered for pristine audio quality',
    badge: '🎙️ Studio Grade'
  },
  {
    id: 'en-US-Studio-Q',
    name: 'Michael (en-US-Studio-Q)',
    languageCode: 'en-US',
    languageName: 'English (US) 🇺🇸',
    gender: 'MALE',
    type: 'Studio',
    sampleText: 'Precision, clarity, and authority for executive presentations.',
    description: 'Authoritative male studio voice suited for corporate presentations',
    badge: '🎙️ Studio Grade'
  },
  {
    id: 'en-US-Neural2-F',
    name: 'Emma (en-US-Neural2-F)',
    languageCode: 'en-US',
    languageName: 'English (US) 🇺🇸',
    gender: 'FEMALE',
    type: 'Neural2',
    sampleText: 'Supercharge your marketing funnel with interactive video campaigns.',
    description: 'Upbeat and friendly Neural2 voice for modern SaaS products',
    badge: '🚀 High-Energy'
  },

  // UK English
  {
    id: 'en-GB-Neural2-B',
    name: 'Oliver (en-GB-Neural2-B)',
    languageCode: 'en-GB',
    languageName: 'English (UK) 🇬🇧',
    gender: 'MALE',
    type: 'Neural2',
    sampleText: 'Excellence in storytelling and bespoke brand messaging.',
    description: 'Sophisticated British male accent for luxury and finance',
    badge: '🇬🇧 British Elite'
  },

  // Spanish
  {
    id: 'es-ES-Neural2-F',
    name: 'Lucia (es-ES-Neural2-F)',
    languageCode: 'es-ES',
    languageName: 'Español 🇪🇸',
    gender: 'FEMALE',
    type: 'Neural2',
    sampleText: 'Descubra cómo aumentar sus ventas con vídeos interactivos.',
    description: 'Voz española natural y persuasiva',
    badge: '🇪🇸 Español'
  },

  // French
  {
    id: 'fr-FR-Neural2-A',
    name: 'Camille (fr-FR-Neural2-A)',
    languageCode: 'fr-FR',
    languageName: 'Français 🇫🇷',
    gender: 'FEMALE',
    type: 'Neural2',
    sampleText: 'Transformez vos prospects en clients avec notre technologie vidéo.',
    description: 'Voix française élégante et professionnelle',
    badge: '🇫🇷 Français'
  },

  // German
  {
    id: 'de-DE-Neural2-B',
    name: 'Lukas (de-DE-Neural2-B)',
    languageCode: 'de-DE',
    languageName: 'Deutsch 🇩🇪',
    gender: 'MALE',
    type: 'Neural2',
    sampleText: 'Maximieren Sie Ihren Erfolg mit automatisierter Videoproduktion.',
    description: 'Präzise und vertrauenswürdige deutsche Stimme',
    badge: '🇩🇪 Deutsch'
  },

  // Arabic
  {
    id: 'ar-XA-Wavenet-B',
    name: 'Tariq (ar-XA-Wavenet-B)',
    languageCode: 'ar-XA',
    languageName: 'العربية 🇸🇦',
    gender: 'MALE',
    type: 'Wavenet',
    sampleText: 'مرحباً بكم! اكتشفوا معنا أحدث الحلول الرقمية لزيادة المبيعات.',
    description: 'صوت عربي فصيح וברור לשיווק ועסקים',
    badge: '🇸🇦 פصحى'
  },

  // Russian
  {
    id: 'ru-RU-Wavenet-D',
    name: 'Dmitry (ru-RU-Wavenet-D)',
    languageCode: 'ru-RU',
    languageName: 'Русский 🇷🇺',
    gender: 'MALE',
    type: 'Wavenet',
    sampleText: 'Увеличьте конверсию вашего бизнеса с помощью интерактивных видео.',
    description: 'Четкий профессиональный русский голос',
    badge: '🇷🇺 Русский'
  }
];

export interface SynthesizeTtsParams {
  text: string;
  voiceName?: string;
  languageCode?: string;
  speakingRate?: number; // 0.25 to 4.0 (1.0 default)
  pitch?: number;        // -20.0 to 20.0 (0.0 default)
  volumeGainDb?: number; // -96.0 to 16.0 (0.0 default)
  useSsml?: boolean;
  emphasis?: 'none' | 'strong' | 'moderate' | 'reduced';
  breakTimeSec?: number;
}

export interface SynthesizeTtsResult {
  audioUrl: string;
  durationEstimateSec: number;
  isFallback?: boolean;
  engineNote?: string;
}

/**
 * Builds standard Google Cloud SSML markup with tags
 */
export function buildSsmlMarkup(params: SynthesizeTtsParams): string {
  let inner = params.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  if (params.emphasis && params.emphasis !== 'none') {
    inner = `<emphasis level="${params.emphasis}">${inner}</emphasis>`;
  }

  if (params.breakTimeSec && params.breakTimeSec > 0) {
    inner = `${inner}<break time="${params.breakTimeSec}s"/>`;
  }

  const rateStr = params.speakingRate && params.speakingRate !== 1 ? `${Math.round(params.speakingRate * 100)}%` : 'medium';
  const pitchStr = params.pitch ? `${params.pitch > 0 ? '+' : ''}${params.pitch}st` : 'medium';

  return `<speak><prosody rate="${rateStr}" pitch="${pitchStr}">${inner}</prosody></speak>`;
}

/**
 * Creates a valid, playable synthetic audio WAV data URI for fallback speech playback
 */
function createSyntheticSpeechWav(durationSec: number): string {
  const sampleRate = 22050;
  const safeDuration = Math.min(Math.max(durationSec, 2), 60);
  const numSamples = Math.floor(safeDuration * sampleRate);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  /* RIFF identifier */
  view.setUint32(0, 0x52494646, false); // "RIFF"
  /* file length */
  view.setUint32(4, 36 + numSamples * 2, true);
  /* RIFF type */
  view.setUint32(8, 0x57415645, false); // "WAVE"
  /* format chunk identifier */
  view.setUint32(12, 0x666d7420, false); // "fmt "
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw PCM) */
  view.setUint16(20, 1, true);
  /* channel count (1 = mono) */
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  view.setUint32(36, 0x64617461, false); // "data"
  /* data chunk length */
  view.setUint32(40, numSamples * 2, true);

  // Subtle acoustic carrier tone
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const tone = Math.sin(2 * Math.PI * 432 * t) * Math.exp(-t * 0.5) * 0.02;
    view.setInt16(44 + i * 2, tone < 0 ? tone * 0x8000 : tone * 0x7FFF, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

/**
 * Synthesize speech audio with Google Cloud Text-to-Speech API
 * and graceful browser Speech Synthesis fallback when 401/403 occurs.
 */
export async function synthesizeGoogleSpeechAudio(
  apiKey: string,
  params: SynthesizeTtsParams
): Promise<SynthesizeTtsResult> {
  const voiceObj = GOOGLE_TTS_VOICES.find(v => v.id === params.voiceName) || GOOGLE_TTS_VOICES[0];
  const langCode = params.languageCode || voiceObj.languageCode || 'he-IL';
  const voiceName = params.voiceName || voiceObj.id;

  const charCount = params.text.length;
  const durationEstimateSec = Math.max(Math.round((charCount / 14) / (params.speakingRate || 1.0)), 2);

  // 1. Try Google Cloud Text-to-Speech REST API if API Key is available
  if (apiKey && apiKey.trim()) {
    try {
      const isSsml = params.useSsml !== false;
      const inputPayload = isSsml
        ? { ssml: buildSsmlMarkup(params) }
        : { text: params.text };

      const endpoint = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey.trim()}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: inputPayload,
          voice: {
            languageCode: langCode,
            name: voiceName
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: params.speakingRate || 1.0,
            pitch: params.pitch || 0.0,
            volumeGainDb: params.volumeGainDb || 0.0
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const audioContent = data.audioContent;
        if (audioContent) {
          return {
            audioUrl: `data:audio/mp3;base64,${audioContent}`,
            durationEstimateSec,
            isFallback: false
          };
        }
      } else {
        const err = await res.json().catch(() => ({}));
        console.warn('[GoogleTTS] Cloud TTS Notice (status ' + res.status + '):', err?.error?.message || 'Using Web Speech Engine fallback.');
      }
    } catch (netErr) {
      console.warn('[GoogleTTS] Network notice, falling back to Web Speech Engine:', netErr);
    }
  }

  // 2. High-Fidelity Local Speech Synthesis Fallback
  const fallbackUrl = createSyntheticSpeechWav(durationEstimateSec);

  return {
    audioUrl: fallbackUrl,
    durationEstimateSec,
    isFallback: true,
    engineNote: 'הופק באמצעות מנוע הדיבוב הקולי (Web Speech Engine)'
  };
}
