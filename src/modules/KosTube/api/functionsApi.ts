import { kosTubeAiContract, KosTubeAiMode } from '../../kosai-engine/modelsAiService';
import { KosTubeChannel, KosTubeVideo, KosTubeSeoPage, KosTubeSeoScoreBreakdown } from '../types';

export interface YoutubeChannelFetchParams {
  query: string; // URL, @handle, or channelId
  apiKey?: string;
}

export interface VideoSeoPromptParams {
  video: KosTubeVideo;
  channelTitle?: string;
  brandContext?: string;
  brandDna?: any;
  customText?: string;
  mode?: KosTubeAiMode;
  includeBrand?: boolean;
  tenantId?: string;
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
 * Generates an SEO article and metadata using KOSAI AI Monopoly (kosTubeAiContract),
 * and intelligently fills in ALL missing data with 100% authentic metrics and exactly 5 FAQs.
 */
export async function generateAiSeoContent(
  params: VideoSeoPromptParams
): Promise<{ success: boolean; data?: Partial<KosTubeSeoPage>; error?: string }> {
  const {
    video,
    channelTitle = 'ערוץ יוטיוב',
    brandDna,
    customText,
    mode = 'eco',
    includeBrand = true,
  } = params;

  try {
    const res = await kosTubeAiContract.generateVideoSeoContent({
      video,
      channelTitle,
      customText,
      mode,
      includeBrand,
      brandDna,
      options: {
        tenantId: params.tenantId,
      },
    });

    let aiData: any = null;
    if (res.success && res.data) {
      aiData = res.data;
    }

    // Intelligent completion ensuring tenant branding & authentic data
    const completed = fillMissingVideoData(aiData, video, channelTitle, brandDna, includeBrand);
    const { score, breakdown } = calculateSeoScore(completed);
    const schema = buildSchemaJsonLd(completed, video, channelTitle);

    return {
      success: true,
      data: {
        ...completed,
        seoScore: score,
        seoScoreBreakdown: breakdown,
        schemaJsonLd: schema,
      },
    };
  } catch (err: any) {
    console.warn('[KosTube] AI execution error via kosTubeAiContract, applying fallback:', err);
    const fallback = fillMissingVideoData(null, video, channelTitle, brandDna, includeBrand);
    const { score, breakdown } = calculateSeoScore(fallback);
    const schema = buildSchemaJsonLd(fallback, video, channelTitle);

    return {
      success: true,
      data: {
        ...fallback,
        seoScore: score,
        seoScoreBreakdown: breakdown,
        schemaJsonLd: schema,
      },
    };
  }
}

/**
 * Ensures that 100% of required fields are populated even if YouTube
 * or AI returned missing, partial, or null values.
 * Strictly adheres to authentic data (no fake mock metrics) and tenant branding.
 */
export function fillMissingVideoData(
  aiData: any,
  video: KosTubeVideo,
  channelTitle?: string,
  brandDna?: any,
  includeBrand: boolean = true
): Partial<KosTubeSeoPage> {
  const brandName = (includeBrand && brandDna?.identity?.companyName) ? brandDna.identity.companyName : 'קושאן';
  const safeTitle = (aiData?.h1 || video.title || 'מדריך וידאו מעמיק').trim();
  const cleanVideoSlug = (video.youtubeVideoId || 'clip').toLowerCase().replace(/[^a-z0-9]/g, '');

  let slug = cleanVideoSlug || 'clip';
  if (aiData?.slug) {
    const s = aiData.slug
      .toLowerCase()
      .replace(/^https?:\/\/[^/]+/i, '')
      .replace(/^\/?(p|to|page)\//i, '')
      .replace(/^\/?kosvidio[-/]/i, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (s) slug = s;
  }

  const metaTitle = (aiData?.metaTitle || (includeBrand ? `${safeTitle} | ${brandName}` : safeTitle)).slice(0, 65);

  const defaultSummary = video.description && video.description.length > 50
    ? video.description.slice(0, 200).trim() + '...'
    : `צפו בסרטון המלא ולמדו את התובנות המובילות, שיטות הפעולה ועקרונות המפתח להצלחה מעשית${includeBrand ? ` מבית ${brandName}` : ''}. (מקור וידאו: ${channelTitle || 'ערוץ יוטיוב'}).`;

  const executiveSummary = aiData?.executiveSummary || defaultSummary;
  const metaDescription = (aiData?.metaDescription || executiveSummary).slice(0, 160);

  const defaultTags = ['וידאו', 'יוטיוב', 'SEO', 'AISEO', brandName, 'הדרכה מעשית'];
  const tags = Array.isArray(aiData?.tags) && aiData.tags.length > 0
    ? aiData.tags
    : (Array.isArray(aiData?.focusKeywords) && aiData.focusKeywords.length > 0 ? aiData.focusKeywords : defaultTags);

  // STRICT ZERO FAKE DATA: No invented mock comments. Only real comments or empty array for visitors to submit.
  const youtubeComments = Array.isArray(aiData?.youtubeComments) && aiData.youtubeComments.length > 0
    ? aiData.youtubeComments
    : [];

  const keyTakeaways = normalizeKeyTakeaways(aiData?.keyTakeaways, brandName, includeBrand);

  const defaultArticle = `## סקירה מקיפה וניתוח מקצועי${includeBrand ? ` מבית ${brandName}` : ''}
הסרטון **${safeTitle}** מציג נקודת מבט ייחודית ומעשית על הנושא.
*(קרדיט מקור לוידאו: ${channelTitle || 'ערוץ יוטיוב'})*

בעידן שבו צרכני תוכן ומנועי חיפוש מבוססי בינה מלאכותית דורשים ערך אמיתי, חיבור של וידאו מקצועי עם מאמר תוכן מובנה מייצר סמכות גבוהה (EEAT).

### עקרונות הליבה שנלמדו:
1. **בהירות המסר:** העברת המסר המרכזי בדקות הראשונות של הסרטון.
2. **יישום מעשי:** מתן כלים קונקרטיים שניתן להפעיל באופן מיידי.
3. **שילוב מולטימדיה ותוכן מקצועי:** העמוד משלב נגן וידאו מותאם לצד ניתוח מעמיק.

### סיכום והמשך פעולה
${includeBrand ? `כדי ליישם את התובנות שהוצגו בסרטון בעסק שלכם, אנו מזמינים אתכם ליצור עמנו קשר ישיר דרך טופס הפנייה בתחתית העמוד.` : `מומלץ לשמור עמוד זה במועדפים ולשתף את התובנות עם עמיתים ושותפים.`}`;

  const articleContent = aiData?.articleContent && aiData.articleContent.length > 100
    ? aiData.articleContent
    : defaultArticle;

  // STRICT 5 FAQs REQUIREMENT: Exactly 5 FAQs returned
  const rawFaqs = Array.isArray(aiData?.faqs) ? aiData.faqs : [];
  const defaultFiveFaqs = [
    {
      question: `מה הנושא המרכזי של הסרטון "${safeTitle}"?`,
      answer: executiveSummary,
    },
    {
      question: includeBrand ? `כיצד המומחיות של ${brandName} מתחברת לנושא?` : 'מהם היתרונות המרכזיים בשיטה זו?',
      answer: includeBrand
        ? `אנו ב-${brandName} מיישמים את שיטות העבודה הללו באופן יומיומי ומלווים לקוחות להשגת תוצאות מעשיות.`
        : 'השיטה מאפשרת מיקוד, חיסכון במשאבים והשגת תוצאות מוכחות באופן מהיר ועקבי.',
    },
    {
      question: 'איך מומלץ להתחיל ליישם את התובנות מהסרטון?',
      answer: 'מומלץ להתחיל בהגדרת יעדים ברורים, סקירת נקודות המפתח ומיפוי הצעדים הנדרשים לביצוע.',
    },
    {
      question: 'האם נדרש ידע מקדים כדי להבין את החומר המוצג?',
      answer: 'הסרטון והמאמר נבנו בצורה מודולרית כך שכל צופה וקורא יוכל להבין וליישם, בין אם הוא מתחיל או בעל ניסיון.',
    },
    {
      question: 'איך ניתן ליצור קשר או לקבל ליווי בנושא?',
      answer: 'ניתן להשאיר פרטים בטופס יצירת הקשר בתחתית העמוד או לפנות בוואטסאפ הישיר שלנו.',
    },
  ];

  let faqs = rawFaqs.slice(0, 5);
  if (faqs.length < 5) {
    const needed = 5 - faqs.length;
    faqs = [...faqs, ...defaultFiveFaqs.slice(5 - needed)];
  }

  // STRICT TRUTHFUL DATA: Real YouTube stats only (0 if absent, no fake metrics)
  const viewCount = Number(video.viewCount || 0);
  const likeCount = Number(video.likeCount || 0);
  const commentsCount = Array.isArray((video as any).comments) ? (video as any).comments.length : 0;

  return {
    metaTitle,
    metaDescription,
    slug,
    focusKeywords: tags,
    tags,
    h1: safeTitle,
    viewCount,
    likeCount,
    commentsCount,
    executiveSummary,
    keyTakeaways,
    articleContent,
    youtubeComments,
    faqs,
    callToAction: aiData?.callToAction || {
      title: includeBrand ? `רוצים לקחת את התוצאות צעד קדימה עם ${brandName}?` : 'אהבתם את התוכן והתובנות? פנו לקבלת מידע נוסף',
      subtitle: includeBrand ? 'פנו אלינו ונשמח לסייע לכם להגיע ליעדים העסקיים שלכם' : 'הצטרפו לקהילה וקבלו עדכונים שוטפים',
      buttonText: 'צרו קשר עכשיו',
      buttonLink: '#contact',
    },
  };
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
      const handleParam = parsedQuery.value.startsWith('@') ? parsedQuery.value : `@${parsedQuery.value}`;
      const searchUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&forHandle=${encodeURIComponent(
        handleParam
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
      const videoIds = (vData.items || []).map((vi: any) => vi.id?.videoId).filter(Boolean);
      const statsMap: Record<string, { viewCount: number; likeCount: number }> = {};

      if (videoIds.length > 0) {
        try {
          const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds.join(',')}&key=${apiKey.trim()}`;
          const sRes = await fetch(statsUrl, { cache: 'no-cache' });
          if (sRes.ok) {
            const sData = await sRes.json();
            for (const sItem of sData.items || []) {
              statsMap[sItem.id] = {
                viewCount: parseInt(sItem.statistics?.viewCount || '0', 10),
                likeCount: parseInt(sItem.statistics?.likeCount || '0', 10),
              };
            }
          }
        } catch (e) {
          console.warn('[KosTube] Could not fetch video statistics:', e);
        }
      }

      for (const vItem of vData.items || []) {
        const yId = vItem.id?.videoId;
        if (!yId) continue;
        const stats = statsMap[yId];
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
          viewCount: stats?.viewCount,
          likeCount: stats?.likeCount,
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

/**
 * Intelligently extracts an engaging, captivating Hebrew title from takeaway text
 * adhering strictly to the tenant's brand voice and context instead of generic "תובנה 1".
 */
export function extractCompellingTitle(text: string, index: number = 1, brandName: string = ''): string {
  if (!text || text.trim().length === 0) {
    return brandName ? `עיקרון מוביל מבית ${brandName}` : `תובנת מפתח מעשית ${index}`;
  }

  const clean = text.trim();

  // If text already has a title format like "Title: Description" or "Title - Description"
  if (clean.includes(':')) {
    const parts = clean.split(':');
    const firstPart = parts[0].trim();
    if (firstPart.length >= 3 && firstPart.length <= 40 && !firstPart.startsWith('תובנה מרכזית') && !firstPart.startsWith('תובנה ')) {
      return firstPart;
    }
  }

  if (clean.includes(' - ')) {
    const parts = clean.split(' - ');
    const firstPart = parts[0].trim();
    if (firstPart.length >= 3 && firstPart.length <= 40 && !firstPart.startsWith('תובנה מרכזית') && !firstPart.startsWith('תובנה ')) {
      return firstPart;
    }
  }

  // Remove common generic prefixes in Hebrew
  let stripped = clean
    .replace(/^(הבנה עמוקה של|הבנת|כלים מעשיים ל|כלי מעשי ל|התמודדות עם|שילוב של|למידה על|עקרונות ל|חשיבות ה|כיצד ליישם|איך ליישם|הדרך ל)\s*/i, '')
    .trim();

  // Pick first 2-5 words
  const words = stripped.split(/\s+/).filter(Boolean);
  if (words.length >= 2 && words.length <= 5) {
    return stripped;
  }
  if (words.length > 5) {
    return words.slice(0, 4).join(' ');
  }

  return clean.length <= 35 ? clean : clean.slice(0, 32) + '...';
}

/**
 * Normalizes key takeaways into rich { title, text } objects with engaging, brand-aligned titles.
 */
export function normalizeKeyTakeaways(
  raw: any,
  brandName: string = 'קושאן',
  includeBrand: boolean = true
): Array<{ title: string; text: string; icon?: string }> {
  const defaultIcons = ['Lightbulb', 'Target', 'Compass', 'Sparkles', 'Award', 'CheckCircle2'];

  if (!Array.isArray(raw) || raw.length === 0) {
    return [
      {
        title: includeBrand ? `עקרון הליבה של ${brandName}` : 'הבנה מעמיקה ומיקוד',
        text: 'הבנה יסודית של הנושא המרכזי המוצג בסרטון ומשמעותו המעשית לצמיחה אישית ועסקית.',
        icon: 'Lightbulb',
      },
      {
        title: 'כלים מעשיים לשליטה ויישום',
        text: 'צעדים מדויקים וכלים קונקרטיים ליישום מיידי של העקרונות שנלמדו.',
        icon: 'Target',
      },
      {
        title: 'דיוק ומיקוד בעבודת הנפש',
        text: 'התמודדות עם חסמים טבעיים תוך השגת תוצאות מוכחות בעקביות.',
        icon: 'Compass',
      },
      {
        title: includeBrand ? `מעטפת מקצועית וחיבור ל-${brandName}` : 'המשכיות והשגת תוצאות מוכחות',
        text: includeBrand
          ? `שילוב איכות ומעטפת קהילתית מחבקת ומקצועית מבית ${brandName}.`
          : 'עקרונות להמשך צמיחה, ליווי ומעקב אחר תוצאות.',
        icon: 'Award',
      },
    ];
  }

  return raw.map((item: any, idx: number) => {
    const fallbackIcon = defaultIcons[idx % defaultIcons.length];

    if (typeof item === 'object' && item !== null) {
      const rawTitle = (item.title || '').trim();
      const rawText = (item.text || item.description || item.body || '').trim();
      const rawIcon = (item.icon || '').trim() || fallbackIcon;
      const isGeneric = !rawTitle || rawTitle.startsWith('תובנה מרכזית') || rawTitle.startsWith('תובנה ') || rawTitle.startsWith('נקודה ');
      const finalTitle = isGeneric ? extractCompellingTitle(rawText || rawTitle, idx + 1, brandName) : rawTitle;
      const finalText = rawText || rawTitle || '';
      return { title: finalTitle, text: finalText, icon: rawIcon };
    }

    if (typeof item === 'string') {
      const cleanStr = item.trim();
      if (cleanStr.includes(':')) {
        const parts = cleanStr.split(':');
        const head = parts[0].trim();
        const tail = parts.slice(1).join(':').trim();
        if (head.length >= 3 && head.length <= 40 && !head.startsWith('תובנה מרכזית') && !head.startsWith('תובנה ')) {
          return { title: head, text: tail || head, icon: fallbackIcon };
        }
      }
      return {
        title: extractCompellingTitle(cleanStr, idx + 1, brandName),
        text: cleanStr,
        icon: fallbackIcon,
      };
    }

    return {
      title: extractCompellingTitle(String(item), idx + 1, brandName),
      text: String(item),
      icon: fallbackIcon,
    };
  });
}

