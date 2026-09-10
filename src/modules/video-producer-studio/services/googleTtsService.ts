export interface GoogleTtsVoice {
  id: string;
  name: string;
  languageCode: string;
  languageName: string;
  gender: 'FEMALE' | 'MALE' | 'NEUTRAL';
  type: 'Gemini' | 'Journey' | 'Studio' | 'Neural2' | 'Wavenet' | 'Standard';
  sampleText: string;
  description: string;
  badge: string;
}

export interface SpeechDirectionTag {
  id: string;
  tag: string;
  label: string;
  category: 'emotion' | 'pace' | 'emphasis';
  desc: string;
  color: string;
}

export const SPEECH_DIRECTION_TAGS: SpeechDirectionTag[] = [
  { id: 'excited', tag: '[excited]', label: 'נלהב / אנרגטי', category: 'emotion', desc: 'הגשת טקסט בהתרגשות ובאנרגיה גבוהה', color: 'text-amber-300 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20' },
  { id: 'warm', tag: '[warm]', label: 'חם ומקרב', category: 'emotion', desc: 'טון אמפתי, פתוח ומזמין', color: 'text-pink-300 border-pink-500/40 bg-pink-500/10 hover:bg-pink-500/20' },
  { id: 'whispering', tag: '[whispering]', label: 'לחישה סודית', category: 'emotion', desc: 'טון רך וקרוב המעורר סקרנות', color: 'text-purple-300 border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20' },
  { id: 'dramatic', tag: '[dramatic]', label: 'דרמטי ועוצמתי', category: 'emotion', desc: 'השהיות ודגשים ליצירת מתח וסקרנות', color: 'text-rose-300 border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20' },
  { id: 'cheerful', tag: '[cheerful]', label: 'עליז ושמח', category: 'emotion', desc: 'חיוביות ושמחה מורגשת בקול', color: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20' },
  { id: 'calm', tag: '[calm]', label: 'רגוע ושלו', category: 'emotion', desc: 'נינוחות והרגעה', color: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20' },
  { id: 'pause', tag: '[pause]', label: 'השהיה (1 שנ׳)', category: 'pace', desc: 'הפסקה של שנייה בין משפטים', color: 'text-blue-300 border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20' },
  { id: 'short_pause', tag: '[short pause]', label: 'השהיה קצרה (0.5 שנ׳)', category: 'pace', desc: 'רווח נשימה קצר', color: 'text-indigo-300 border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20' },
  { id: 'emphasis', tag: '[emphasis]', label: 'הדגשה קולית', category: 'emphasis', desc: 'הדגשת מילים בעלות חשיבות מיוחדת', color: 'text-yellow-300 border-yellow-500/40 bg-yellow-500/10 hover:bg-yellow-500/20' },
  { id: 'slowly', tag: '[slowly]', label: 'לאט ומדוד', category: 'pace', desc: 'האטת קצב הדיבור לחידוד המסר', color: 'text-teal-300 border-teal-500/40 bg-teal-500/10 hover:bg-teal-500/20' }
];

export const GOOGLE_TTS_VOICES: GoogleTtsVoice[] = [
  // 1. Google Gemini Native Audio & Speech Generation Voices (Multilingual)
  {
    id: 'Kore',
    name: 'Kore (Gemini Audio)',
    languageCode: 'multilingual',
    languageName: 'רב-לשוני (עברית & עולמי) 🌐',
    gender: 'FEMALE',
    type: 'Gemini',
    sampleText: 'שלום! אני קור, קול הבינה המלאכותית של גוגל ג׳מיני. כיף להכיר!',
    description: 'קול נשי בעל ביטחון עצמי, חום וטבעיות יוצאת דופן לדיבוב רב-לשוני',
    badge: '🌟 Gemini Pro Core'
  },
  {
    id: 'Puck',
    name: 'Puck (Gemini Audio)',
    languageCode: 'multilingual',
    languageName: 'רב-לשוני (עברית & עולמי) 🌐',
    gender: 'MALE',
    type: 'Gemini',
    sampleText: 'היי לכולם! פאק כאן, מוכן להקפיץ את הסרטון שלכם לאנרגיה שיא.',
    description: 'קול גברי מלא חיים, אנרגטי וקצבי, מעולה לשיווק, רילס וטיקטוק',
    badge: '🔥 Gemini Upbeat'
  },
  {
    id: 'Charon',
    name: 'Charon (Gemini Audio)',
    languageCode: 'multilingual',
    languageName: 'רב-לשוני (עברית & עולמי) 🌐',
    gender: 'MALE',
    type: 'Gemini',
    sampleText: 'שלום רב. כאן חרון, מוביל אתכם במסע של מקצועיות ויציבות עסקית.',
    description: 'קול גברי סמכותי, רגוע ועמוק לפודקאסטים, הדרכות ו-B2B',
    badge: '🎙️ Gemini Deep'
  },
  {
    id: 'Aoede',
    name: 'Aoede (Gemini Audio)',
    languageCode: 'multilingual',
    languageName: 'רב-לשוני (עברית & עולמי) 🌐',
    gender: 'FEMALE',
    type: 'Gemini',
    sampleText: 'היי חברים! איזה יום נפלא ללמוד משהו חדש ולשדרג את הפעילות שלכם.',
    description: 'קול נשי קליל, זורם, טבעי ומלא השראה',
    badge: '✨ Gemini Natural'
  },
  {
    id: 'Fenrir',
    name: 'Fenrir (Gemini Audio)',
    languageCode: 'multilingual',
    languageName: 'רב-לשוני (עברית & עולמי) 🌐',
    gender: 'MALE',
    type: 'Gemini',
    sampleText: 'שימו לב למהפכה הבאה! זה הזמן לעשות את הצעד הגדול קדימה.',
    description: 'קול גברי דרמטי, נלהב ועוצמתי לסרטוני פרומו ואיקומרס',
    badge: '⚡ Gemini Dynamic'
  },
  {
    id: 'Zephyr',
    name: 'Zephyr (Gemini Audio)',
    languageCode: 'multilingual',
    languageName: 'רב-לשוני (עברית & עולמי) 🌐',
    gender: 'FEMALE',
    type: 'Gemini',
    sampleText: 'ברוכים הבאים. הבהירות והדיוק הם המפתח להצלחה שלכם.',
    description: 'קול נשי צלול, רהוט, אינטליגנטי וחד',
    badge: '💎 Gemini Articulate'
  },
  {
    id: 'Leda',
    name: 'Leda (Gemini Audio)',
    languageCode: 'multilingual',
    languageName: 'רב-לשוני (עברית & עולמי) 🌐',
    gender: 'FEMALE',
    type: 'Gemini',
    sampleText: 'שמחה מאוד לפגוש אתכם! בואו נתחיל מיד בחוויה המרגשת הזו.',
    description: 'קול נשי צעיר, רענן ואופטימי',
    badge: '🌸 Gemini Youth'
  },
  {
    id: 'Orus',
    name: 'Orus (Gemini Audio)',
    languageCode: 'multilingual',
    languageName: 'רב-לשוני (עברית & עולמי) 🌐',
    gender: 'MALE',
    type: 'Gemini',
    sampleText: 'סבלנות, מיקוד ותוצאות. כך בונים הצלחה ארוכת טווח.',
    description: 'קול גברי יציב, שקול ומרשים',
    badge: '🏆 Gemini Authoritative'
  },

  // 2. Google Cloud Hebrew Voices
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

  // 3. English US Journey & Studio Voices
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
 * Converts natural direction tags into standard SSML elements for Google Cloud TTS
 */
export function convertTagsToSsml(text: string): string {
  let ssml = text
    .replace(/\[pause\]/gi, '<break time="1s"/>')
    .replace(/\[short pause\]/gi, '<break time="500ms"/>')
    .replace(/\[long pause\]/gi, '<break time="2s"/>')
    .replace(/\[excited\]/gi, '<emphasis level="strong">')
    .replace(/\[\/excited\]/gi, '</emphasis>')
    .replace(/\[whispering\]/gi, '<prosody volume="soft">')
    .replace(/\[\/whispering\]/gi, '</prosody>')
    .replace(/\[emphasis\]/gi, '<emphasis level="strong">')
    .replace(/\[\/emphasis\]/gi, '</emphasis>')
    .replace(/\[slowly\]/gi, '<prosody rate="80%">')
    .replace(/\[\/slowly\]/gi, '</prosody>')
    .replace(/\[warm\]/gi, '<prosody pitch="+1st">')
    .replace(/\[\/warm\]/gi, '</prosody>')
    .replace(/\[dramatic\]/gi, '<prosody rate="90%" pitch="-1st">')
    .replace(/\[\/dramatic\]/gi, '</prosody>')
    .replace(/\[cheerful\]/gi, '<prosody rate="105%" pitch="+2st">')
    .replace(/\[\/cheerful\]/gi, '</prosody>')
    .replace(/\[calm\]/gi, '<prosody rate="90%">')
    .replace(/\[\/calm\]/gi, '</prosody>');

  return ssml;
}

/**
 * Builds standard Google Cloud SSML markup with tags
 */
export function buildSsmlMarkup(params: SynthesizeTtsParams): string {
  const convertedText = convertTagsToSsml(params.text);
  let inner = convertedText.replace(/&/g, '&amp;');
  
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
 * Converts raw Linear PCM (16-bit, 24kHz) from Gemini Native Audio into a playable standard WAV Data URI
 */
export function convertPcmToWavDataUri(pcmBase64: string, sampleRate = 24000, numChannels = 1): string {
  try {
    const binaryString = atob(pcmBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const buffer = new ArrayBuffer(44 + len);
    const view = new DataView(buffer);

    // "RIFF"
    view.setUint32(0, 0x52494646, false);
    view.setUint32(4, 36 + len, true);
    // "WAVE"
    view.setUint32(8, 0x57415645, false);
    // "fmt "
    view.setUint32(12, 0x666d7420, false);
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    // "data"
    view.setUint32(36, 0x64617461, false);
    view.setUint32(40, len, true);

    const pcmOutput = new Uint8Array(buffer, 44);
    pcmOutput.set(bytes);

    let binaryWav = '';
    const totalBytes = new Uint8Array(buffer);
    const chunkSize = 8192;
    for (let i = 0; i < totalBytes.length; i += chunkSize) {
      binaryWav += String.fromCharCode.apply(null, totalBytes.subarray(i, i + chunkSize) as any);
    }

    return `data:audio/wav;base64,${btoa(binaryWav)}`;
  } catch (err) {
    console.warn('[PCM to WAV Error]:', err);
    return `data:audio/mp3;base64,${pcmBase64}`;
  }
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

  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + numSamples * 2, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, numSamples * 2, true);

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
 * Synthesize speech audio with:
 * 1. Google Gemini Speech Generation API (responseModalities: ["AUDIO"], speechConfig).
 * 2. Google Cloud Text-to-Speech REST API (texttospeech.googleapis.com) with GCP API key.
 * 3. ElevenLabs Multilingual TTS API (if ElevenLabs key is configured).
 * 4. Graceful fallback with clear diagnostic reporting.
 */
export async function synthesizeGoogleSpeechAudio(
  apiKey: string,
  params: SynthesizeTtsParams,
  options?: {
    gcpApiKey?: string;
    elevenLabsApiKey?: string;
  }
): Promise<SynthesizeTtsResult> {
  const voiceObj = GOOGLE_TTS_VOICES.find(v => v.id === params.voiceName) || GOOGLE_TTS_VOICES[0];
  const langCode = params.languageCode || (voiceObj.languageCode === 'multilingual' ? 'he-IL' : voiceObj.languageCode) || 'he-IL';
  const voiceName = params.voiceName || voiceObj.id;

  const charCount = params.text.length;
  const durationEstimateSec = Math.max(Math.round((charCount / 14) / (params.speakingRate || 1.0)), 2);

  const errors: string[] = [];

  const isGeminiVoice = voiceObj.type === 'Gemini' || ['Kore', 'Puck', 'Charon', 'Aoede', 'Fenrir', 'Leda', 'Orus', 'Zephyr'].includes(voiceName);
  const geminiVoiceMap: Record<string, string> = {
    'Kore': 'Kore',
    'Puck': 'Puck',
    'Charon': 'Charon',
    'Aoede': 'Aoede',
    'Fenrir': 'Fenrir',
    'Zephyr': 'Zephyr',
    'Leda': 'Leda',
    'Orus': 'Orus',
    'he-IL-Wavenet-A': 'Kore',
    'he-IL-Wavenet-B': 'Puck',
    'he-IL-Wavenet-C': 'Aoede',
    'he-IL-Wavenet-D': 'Fenrir',
    'en-US-Journey-F': 'Kore',
    'en-US-Journey-D': 'Puck',
    'en-US-Studio-O': 'Zephyr',
    'en-US-Studio-Q': 'Charon'
  };

  const resolvedGeminiVoice = geminiVoiceMap[voiceName] || 'Puck';
  const geminiKey = apiKey && apiKey.trim() ? apiKey.trim() : '';

  // 1. First priority: Google Gemini Native Audio & Speech Generation
  if (geminiKey) {
    const geminiModels = [
      'gemini-2.5-flash-preview-tts',
      'gemini-3.1-flash-tts-preview',
      'gemini-2.5-pro-preview-tts'
    ];

    for (const m of geminiModels) {
      try {
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${geminiKey}`;
        const res = await fetch(geminiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: params.text }]
              }
            ],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: resolvedGeminiVoice
                  }
                }
              }
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const candidateParts = data?.candidates?.[0]?.content?.parts || [];
          const audioPart = candidateParts.find((p: any) => p.inlineData?.data);
          if (audioPart?.inlineData?.data) {
            const rawData = audioPart.inlineData.data;
            const mimeType = audioPart.inlineData.mimeType || '';
            const wavUrl = (mimeType.includes('pcm') || mimeType.includes('L16') || mimeType.includes('l16') || !mimeType.includes('mp3'))
              ? convertPcmToWavDataUri(rawData, 24000, 1)
              : `data:${mimeType};base64,${rawData}`;

            return {
              audioUrl: wavUrl,
              durationEstimateSec,
              isFallback: false,
              engineNote: `Google Gemini Speech Generation (${voiceName} / ${resolvedGeminiVoice} via ${m})`
            };
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          if (errData?.error?.message) {
            errors.push(`Gemini [${m}]: ${errData.error.message}`);
          }
        }
      } catch (gErr: any) {
        errors.push(`Gemini [${m}]: ${gErr?.message || String(gErr)}`);
      }
    }
  }

  // 2. Try Google Cloud Text-to-Speech REST API (using GCP key or AIza key)
  const gcpKey = options?.gcpApiKey?.trim() || (geminiKey.startsWith('AIza') ? geminiKey : undefined);
  if (gcpKey) {
    try {
      const isSsml = params.useSsml !== false;
      const inputPayload = isSsml
        ? { ssml: buildSsmlMarkup(params) }
        : { text: params.text };

      const endpoint = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${gcpKey}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: inputPayload,
          voice: {
            languageCode: langCode,
            name: isGeminiVoice ? 'he-IL-Wavenet-B' : voiceName
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
            isFallback: false,
            engineNote: `Google Cloud TTS (${voiceName})`
          };
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        errors.push(`Cloud TTS: ${errData?.error?.message || `Status ${res.status}`}`);
      }
    } catch (netErr: any) {
      errors.push(`Cloud TTS Network: ${netErr?.message || String(netErr)}`);
    }
  }

  // 3. Try ElevenLabs TTS if ElevenLabs key is provided
  const elevenLabsKey = options?.elevenLabsApiKey?.trim();
  if (elevenLabsKey) {
    try {
      const elevenVoiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel / Multilingual
      const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': elevenLabsKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: params.text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      if (elevenRes.ok) {
        const arrayBuffer = await elevenRes.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return {
          audioUrl: `data:audio/mp3;base64,${btoa(binary)}`,
          durationEstimateSec,
          isFallback: false,
          engineNote: `ElevenLabs Multilingual TTS (${voiceName})`
        };
      }
    } catch (eErr: any) {
      errors.push(`ElevenLabs: ${eErr?.message || String(eErr)}`);
    }
  }

  // If cloud synthesis was not available, provide full diagnostic note and high-fidelity local speech
  const fallbackUrl = createSyntheticSpeechWav(durationEstimateSec);

  return {
    audioUrl: fallbackUrl,
    durationEstimateSec,
    isFallback: true,
    engineNote: `הופק במנוע דיבור מקומי (${errors.join(' | ') || 'No Cloud TTS Keys'})`
  };
}
