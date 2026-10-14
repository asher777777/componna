import { executeCloudAi, PLEASANT_AI_ERROR_HEBREW } from '../../../core/ai';
import { KosTubeChannel, KosTubeVideo, KosTubeSeoPage, KosTubeSeoScoreBreakdown } from '../types';

export interface YoutubeChannelFetchParams {
  query: string; // URL, @handle, or channelId
  apiKey?: string;
}

export interface VideoSeoPromptParams {
  video: KosTubeVideo;
  channelTitle?: string;
  brandContext?: string;
}

/**
 * Extracts YouTube video ID from various URL formats
 */
export function extractYoutubeVideoId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const clean = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = clean.match(regex);
  return match ? match[1] : null;
}

/**
 * Extracts YouTube channel identifier or handle
 */
export function parseYoutubeChannelQuery(query: string): { type: 'handle' | 'id' | 'url'; value: string } {
  const clean = query.trim();
  if (clean.startsWith('@')) {
    return { type: 'handle', value: clean.substring(1) };
  }
  if (clean.includes('youtube.com/@')) {
    const handle = clean.split('youtube.com/@')[1].split('/')[0].split('?')[0];
    return { type: 'handle', value: handle };
  }
  if (clean.includes('youtube.com/channel/')) {
    const channelId = clean.split('youtube.com/channel/')[1].split('/')[0].split('?')[0];
    return { type: 'id', value: channelId };
  }
  if (clean.startsWith('UC') && clean.length >= 20) {
    return { type: 'id', value: clean };
  }
  return { type: 'url', value: clean };
}

/**
 * Evaluates SEO metrics and returns score breakdown
 */
export function calculateSeoScore(page: Partial<KosTubeSeoPage>): { score: number; breakdown: KosTubeSeoScoreBreakdown } {
  let titleLengthScore = 15;
  const titleLen = page.metaTitle?.length || 0;
  if (titleLen >= 30 && titleLen <= 65) titleLengthScore = 20;
  else if (titleLen >= 20) titleLengthScore = 16;
  else titleLengthScore = 8;

  let descriptionLengthScore = 15;
  const descLen = page.metaDescription?.length || 0;
  if (descLen >= 120 && descLen <= 165) descriptionLengthScore = 20;
  else if (descLen >= 80) descriptionLengthScore = 15;
  else descriptionLengthScore = 7;

  let keywordsDensityScore = 15;
  const kwCount = page.focusKeywords?.length || 0;
  if (kwCount >= 3) keywordsDensityScore = 15;
  else if (kwCount >= 1) keywordsDensityScore = 10;
  else keywordsDensityScore = 5;

  let headingsStructureScore = 15;
  const content = page.articleContent || '';
  if (content.includes('##') && content.includes('###')) headingsStructureScore = 15;
  else if (content.includes('##')) headingsStructureScore = 12;
  else headingsStructureScore = 6;

  let schemaScore = 15;
  if (page.schemaJsonLd && page.schemaJsonLd['@context']) schemaScore = 15;
  else schemaScore = 5;

  let readabilityScore = 15;
  if (content.length > 800) readabilityScore = 15;
  else if (content.length > 400) readabilityScore = 10;
  else readabilityScore = 5;

  const totalScore = Math.min(
    100,
    titleLengthScore + descriptionLengthScore + keywordsDensityScore + headingsStructureScore + schemaScore + readabilityScore
  );

  return {
    score: totalScore,
    breakdown: {
      titleLengthScore,
      descriptionLengthScore,
      keywordsDensityScore,
      headingsStructureScore,
      schemaScore,
      readabilityScore,
    },
  };
}

/**
 * Builds Google-compliant Schema.org JSON-LD
 */
export function buildSchemaJsonLd(
  page: Partial<KosTubeSeoPage>,
  video: KosTubeVideo,
  channelTitle?: string
): Record<string, any> {
  const publishedDate = video.publishedAt || new Date().toISOString();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'VideoObject',
        name: page.metaTitle || video.title,
        description: page.metaDescription || video.description,
        thumbnailUrl: [video.thumbnailUrl],
        uploadDate: publishedDate,
        embedUrl: `https://www.youtube-nocookie.com/embed/${video.youtubeVideoId}`,
        contentUrl: video.youtubeUrl,
        publisher: {
          '@type': 'Organization',
          name: channelTitle || 'קושאן',
        },
      },
      {
        '@type': 'Article',
        headline: page.h1 || page.metaTitle || video.title,
        description: page.metaDescription,
        datePublished: publishedDate,
        dateModified: new Date().toISOString(),
        author: {
          '@type': 'Organization',
          name: channelTitle || 'קושאן',
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': page.publicUrl || `https://kosun.co.il/v/${page.slug || video.youtubeVideoId}`,
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: (page.faqs || []).map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };
}

/**
 * Generates an SEO article and metadata from real video data using AI
 */
export async function generateAiSeoContent(
  params: VideoSeoPromptParams
): Promise<{ success: boolean; data?: Partial<KosTubeSeoPage>; error?: string }> {
  const { video, channelTitle = 'ערוץ יוטיוב', brandContext = '' } = params;

  const prompt = `
אתה מומחה בכיר לקידום אתרים (SEO Copywriter & Technical SEO Specialist).
המשימה שלך היא לקחת סרטון אמיתי מיוטיוב, להפוך אותו למאמר תוכן מעמיק, עשיר ומקודם במנועי חיפוש בגוגל, ולייצר מטא-דאטה מושלמת.

פרטי הסרטון:
כותרת מקורית: "${video.title}"
תיאור מקורי: "${video.description || 'ללא תיאור'}"
ערוץ: "${channelTitle}"
מזהה יוטיוב: "${video.youtubeVideoId}"
הקשר מותג: "${brandContext}"

אנא החזר JSON תקין בלבד (ללא markdown backticks מסביב) במבנה הבא:
{
  "metaTitle": "כותרת מטא מושכת בין 50 ל-60 תווים כולל מילת מפתח עיקרית",
  "metaDescription": "תיאור מטא מנצח באורך 140-160 תווים שגורם לגולש להקליק",
  "slug": "slug-in-english-or-hebrew-separated-by-hyphens",
  "focusKeywords": ["מילת מפתח 1", "מילת מפתח 2", "מילת מפתח 3", "מילת מפתח 4"],
  "h1": "כותרת ראשית מרשימה וממוקדת למאמר",
  "executiveSummary": "תקציר מנהלים מהיר של 2-3 משפטים על התובנות המרכזיות בוידאו",
  "keyTakeaways": [
    "נקודת מפתח ראשונה וחשובה",
    "נקודת מפתח שנייה",
    "נקודת מפתח שלישית",
    "נקודת מפתח רביעית"
  ],
  "articleContent": "מאמר עומק מקיף ומקצועי בעברית (לפחות 400-600 מילים), בפורמט Markdown הכולל כותרות H2 (##), תת-כותרות H3 (###), פסקאות מנומקות, דוגמאות מעשיות, וציטוטים רלוונטיים מתוך הוידאו.",
  "faqs": [
    {"question": "שאלה נפוצה רלוונטית ראשונה?", "answer": "תשובה מקיפה וממוקדת"},
    {"question": "שאלה נפוצה שנייה?", "answer": "תשובה מקיפה וממוקדת"},
    {"question": "שאלה נפוצה שלישית?", "answer": "תשובה מקיפה וממוקדת"}
  ],
  "callToAction": {
    "title": "רוצים לקחת את הידע הזה צעד קדימה?",
    "subtitle": "השאירו פרטים ונחזור אליכם עם ייעוץ מותאם אישית",
    "buttonText": "לייעוץ והתאמה אישית",
    "buttonLink": "#contact"
  }
}
`;

  try {
    const res = await executeCloudAi<{
      metaTitle: string;
      metaDescription: string;
      slug: string;
      focusKeywords: string[];
      h1: string;
      executiveSummary: string;
      keyTakeaways: string[];
      articleContent: string;
      faqs: Array<{ question: string; answer: string }>;
      callToAction: { title: string; subtitle?: string; buttonText: string; buttonLink?: string };
    }>({
      prompt,
      responseMimeType: 'application/json',
      systemInstruction: 'אתה מומחה SEO ויוצר תוכן ברמה הגבוהה ביותר בישראל. החזר אך ורק תשובת JSON תקינה ומדויקת.',
    });

    if (!res.success || !res.text) {
      return {
        success: false,
        error: res.error || PLEASANT_AI_ERROR_HEBREW,
      };
    }

    let parsed: any;
    try {
      const cleaned = res.text.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return {
        success: false,
        error: 'שגיאה בפענוח נתוני הבינה המלאכותית.',
      };
    }

    const { score, breakdown } = calculateSeoScore(parsed);
    const schema = buildSchemaJsonLd(parsed, video, channelTitle);

    return {
      success: true,
      data: {
        ...parsed,
        seoScore: score,
        seoScoreBreakdown: breakdown,
        schemaJsonLd: schema,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || PLEASANT_AI_ERROR_HEBREW,
    };
  }
}

/**
 * Fetches REAL video metadata directly via URL using standard CORS oEmbed (no API key required, no QUIC errors)
 */
export async function fetchSingleYoutubeVideo(
  urlOrId: string,
  channelId: string = 'custom_channel'
): Promise<KosTubeVideo> {
  const videoId = extractYoutubeVideoId(urlOrId);
  if (!videoId) {
    throw new Error('כתובת הסרטון אינה תקינה. אנא הזן קישור יוטיוב מלא או מזהה סרטון בן 11 תווים.');
  }

  const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const oembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(cleanUrl)}`;

  try {
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && data.title) {
        return {
          id: `vid_${videoId}`,
          channelId: channelId || 'custom_channel',
          youtubeVideoId: videoId,
          youtubeUrl: cleanUrl,
          title: data.title,
          description: data.author_name ? `סרטון מאת ${data.author_name}` : '',
          publishedAt: new Date().toISOString(),
          thumbnailUrl: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
    }
  } catch (err) {
    console.warn('[KosTube] oEmbed fetch failed, using direct metadata fallback:', err);
  }

  // Fallback to direct YouTube video representation with actual thumbnail and ID
  return {
    id: `vid_${videoId}`,
    channelId: channelId || 'custom_channel',
    youtubeVideoId: videoId,
    youtubeUrl: cleanUrl,
    title: `סרטון יוטיוב (${videoId})`,
    description: '',
    publishedAt: new Date().toISOString(),
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Fetches REAL YouTube channel and videos using official YouTube Data API v3
 */
export async function fetchYoutubeChannelData(
  params: YoutubeChannelFetchParams
): Promise<{ channel: KosTubeChannel; videos: KosTubeVideo[] }> {
  const { query, apiKey } = params;
  const parsedQuery = parseYoutubeChannelQuery(query);

  if (!apiKey || apiKey.trim().length < 10) {
    throw new Error(
      'לסנכרון ערוץ מלא נדרש מפתח YouTube Data API v3 תקין. אנא הזן את המפתח בטאב הגדרות, או הוסף סרטונים ישירות באמצעות קישור יוטיוב.'
    );
  }

  try {
    let channelId = parsedQuery.value;

    // Resolve handle to channelId
    if (parsedQuery.type === 'handle') {
      const searchUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&forHandle=${encodeURIComponent(
        parsedQuery.value
      )}&key=${apiKey.trim()}`;

      const sRes = await fetch(searchUrl, { cache: 'no-cache' });
      if (!sRes.ok) {
        const errorData = await sRes.json().catch(() => ({}));
        const msg = errorData?.error?.message || 'שגיאה באיתור הערוץ מול YouTube API.';
        throw new Error(msg);
      }
      const sData = await sRes.json();
      if (sData.items && sData.items.length > 0) {
        channelId = sData.items[0].id;
      } else {
        throw new Error(`לא נמצא ערוץ יוטיוב עבור ה-Handle: @${parsedQuery.value}`);
      }
    }

    // Fetch Channel details
    const chanUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${encodeURIComponent(
      channelId
    )}&key=${apiKey.trim()}`;

    const cRes = await fetch(chanUrl, { cache: 'no-cache' });
    if (!cRes.ok) {
      const errorData = await cRes.json().catch(() => ({}));
      const msg = errorData?.error?.message || 'שגיאה בשליפת פרטי הערוץ מול YouTube API.';
      throw new Error(msg);
    }

    const cData = await cRes.json();
    const item = cData.items?.[0];
    if (!item) {
      throw new Error(`לא נמצאו נתונים עבור ערוץ יוטיוב זה (${channelId}).`);
    }

    const channel: KosTubeChannel = {
      id: item.id,
      channelId: item.id,
      customUrl: item.snippet.customUrl || (parsedQuery.type === 'handle' ? `@${parsedQuery.value}` : `@${item.snippet.title}`),
      title: item.snippet.title,
      description: item.snippet.description || '',
      thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || '',
      bannerUrl: item.brandingSettings?.image?.bannerExternalUrl || '',
      subscriberCount: parseInt(item.statistics?.subscriberCount || '0', 10),
      videoCount: parseInt(item.statistics?.videoCount || '0', 10),
      connectedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
      apiKey: apiKey.trim(),
      autoGeneratePages: true,
    };

    // Fetch recent REAL videos from the channel
    const vidUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${item.id}&maxResults=25&order=date&type=video&key=${apiKey.trim()}`;
    const vRes = await fetch(vidUrl, { cache: 'no-cache' });
    const videos: KosTubeVideo[] = [];

    if (vRes.ok) {
      const vData = await vRes.json();
      for (const vItem of vData.items || []) {
        const yId = vItem.id?.videoId;
        if (!yId) continue;
        videos.push({
          id: `vid_${yId}`,
          channelId: item.id,
          youtubeVideoId: yId,
          youtubeUrl: `https://www.youtube.com/watch?v=${yId}`,
          title: vItem.snippet.title,
          description: vItem.snippet.description || '',
          publishedAt: vItem.snippet.publishedAt || new Date().toISOString(),
          thumbnailUrl:
            vItem.snippet.thumbnails?.high?.url ||
            vItem.snippet.thumbnails?.default?.url ||
            `https://i.ytimg.com/vi/${yId}/hqdefault.jpg`,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } else {
      const errorData = await vRes.json().catch(() => ({}));
      console.warn('[KosTube] Could not fetch videos list:', errorData);
    }

    return { channel, videos };
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message?.includes('Failed to fetch')) {
      throw new Error(
        'שגיאת תקשורת מול שרתי Google (QUIC / Network Error). ודא שחיבור האינטרנט פעיל או הוסף סרטונים ישירות באמצעות קישור יוטיוב.'
      );
    }
    throw err;
  }
}
