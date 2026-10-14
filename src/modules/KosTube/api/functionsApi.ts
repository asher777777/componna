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
 * Generates an SEO article and metadata from real video data using AI,
 * and intelligently fills in ALL missing data that was not received from YouTube.
 */
export async function generateAiSeoContent(
  params: VideoSeoPromptParams
): Promise<{ success: boolean; data?: Partial<KosTubeSeoPage>; error?: string }> {
  const { video, channelTitle = 'ערוץ יוטיוב', brandContext = '' } = params;

  const prompt = `
אתה מומחה בכיר לקידום אתרים, AI-SEO, וקופירייטינג לוידאו (Google SEO & AI Search Specialist).
המשימה שלך היא לקחת סרטון מיוטיוב ולהפיק עבורו עמוד תוכן ומאמר שלם תחת תבנית "Kosvidio".

פרטי הסרטון שהתקבלו מיוטיוב:
כותרת: "${video.title || 'ללא כותרת'}"
תיאור שהתקבל: "${video.description && video.description.trim().length > 20 ? video.description : 'לא התקבל תיאור מיוטיוב'}"
ערוץ: "${channelTitle}"
מזהה יוטיוב: "${video.youtubeVideoId}"
הקשר מותג: "${brandContext}"

הוראות מפתח להשלמת נתונים חסרים (Missing Data Completion):
1. אם התיאור חסר, קצר מדי או כולל רק קישורים: עליך להסיק מתוך הכותרת והנושא את מהות הסרטון, ולייצר תיאור קצר (תקציר מנהלים) ומאמר עומק מקיף.
2. תגיות (Tags): מכיוון שיוטיוב אינו מספק תגיות, עליך לייצר 6-8 תוויות עדינות, רלוונטיות ומדויקות ב-SEO.
3. תגובות בסגנון יוטיוב (YouTube-Styled Comments): מכיוון שלא התקבלו תגובות מיוטיוב, עליך לייצר 3-4 תגובות קהילה אותנטיות ומעשירות (שמות מגוונים בעברית, זמנים כמו "לפני יומיים", תוכן המצביע על תובנות מהסרטון, וכמות לייקים מציאותית).
4. מבנה AISEO: מאמר העומק חייב לענות על כוונת החיפוש (Search Intent) של גולשים ומנועי חיפוש מבוססי AI (כמו SearchGPT, Perplexity ו-Google SGE).

אנא החזר אך ורק JSON תקין (ללא markdown backticks סביב ה-JSON) במבנה המדויק הבא:
{
  "metaTitle": "כותרת מטא מושכת בין 50 ל-60 תווים כולל מילת מפתח עיקרית",
  "metaDescription": "תיאור מטא מנצח באורך 140-160 תווים שגורם לגולש להקליק",
  "slug": "kosvidio-english-topic-slug",
  "focusKeywords": ["מילת מפתח 1", "מילת מפתח 2", "מילת מפתח 3", "מילת מפתח 4"],
  "tags": ["תגית עדינה 1", "תגית 2", "תגית 3", "תגית 4", "תגית 5", "תגית 6"],
  "h1": "כותרת ראשית מרשימה וממוקדת למאמר",
  "executiveSummary": "תקציר מנהלים מהיר ומדויק של 2-3 משפטים על התובנות המרכזיות בוידאו (תיאור קצר)",
  "keyTakeaways": [
    "נקודת מפתח ראשונה וחשובה מהוידאו",
    "נקודת מפתח שנייה",
    "נקודת מפתח שלישית",
    "נקודת מפתח רביעית"
  ],
  "articleContent": "מאמר עומק מקיף ומקצועי בעברית (לפחות 450-650 מילים), בפורמט Markdown הכולל כותרות H2 (##), תת-כותרות H3 (###), פסקאות מנומקות, דוגמאות מעשיות, והנחיות יישום של הוידאו.",
  "youtubeComments": [
    {
      "id": "c1",
      "authorName": "שם המגיב בעברית",
      "publishedAt": "לפני 3 ימים",
      "content": "תוכן תגובה אותנטי ומפרגן שמתייחס ישירות לתוכן הסרטון",
      "likesCount": 18
    },
    {
      "id": "c2",
      "authorName": "שם מגיבה שנייה",
      "publishedAt": "לפני שבוע",
      "content": "שאלה או הארה חכמה בנוגע ליישום הנאמר בוידאו",
      "likesCount": 9
    },
    {
      "id": "c3",
      "authorName": "שם מגיב שלישי",
      "publishedAt": "לפני יומיים",
      "content": "תגובה קצרה ומעודדת על איכות ההסבר וההפקה",
      "likesCount": 14
    }
  ],
  "faqs": [
    {"question": "שאלה נפוצה רלוונטית ראשונה בנושא הוידאו?", "answer": "תשובה מקיפה וממוקדת"},
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
    const res = await executeCloudAi<any>({
      prompt,
      responseMimeType: 'application/json',
      systemInstruction: 'אתה מומחה ה-SEO והתוכן המוביל בישראל. החזר אך ורק תשובת JSON תקינה ומדויקת הממלאת את כל השדות החסרים במלואם.',
    });

    let parsed: any = null;
    if (res.success && res.text) {
      try {
        const cleaned = res.text.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
        parsed = JSON.parse(cleaned);
      } catch (e) {
        console.warn('[KosTube] JSON parsing failed, using smart fallback completion:', e);
      }
    }

    // Intelligent fallback for any missing YouTube data
    const completed = fillMissingVideoData(parsed, video, channelTitle);
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
    console.warn('[KosTube] AI execution error, applying resilient fallback:', err);
    const fallback = fillMissingVideoData(null, video, channelTitle);
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
 */
export function fillMissingVideoData(
  aiData: any,
  video: KosTubeVideo,
  channelTitle?: string
): Partial<KosTubeSeoPage> {
  const safeTitle = (aiData?.h1 || video.title || 'מדריך וידאו מעמיק').trim();
  const cleanVideoSlug = video.youtubeVideoId.toLowerCase().replace(/[^a-z0-9]/g, '');

  const slug = aiData?.slug
    ? aiData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    : `kosvidio-${cleanVideoSlug}`;

  const metaTitle = (aiData?.metaTitle || `${safeTitle} | ${channelTitle || 'קושאן'}`).slice(0, 65);

  const defaultSummary = video.description && video.description.length > 50
    ? video.description.slice(0, 200).trim() + '...'
    : `צפו בסרטון המלא של ${channelTitle || 'הערוץ'} ולמדו את התובנות המובילות, שיטות הפעולה ועקרונות המפתח להצלחה מעשית.`;

  const executiveSummary = aiData?.executiveSummary || defaultSummary;
  const metaDescription = (aiData?.metaDescription || executiveSummary).slice(0, 160);

  const defaultTags = ['וידאו', 'יוטיוב', 'SEO', 'AISEO', 'שיווק דיגיטלי', 'הדרכה מעשית'];
  const tags = Array.isArray(aiData?.tags) && aiData.tags.length > 0
    ? aiData.tags
    : (Array.isArray(aiData?.focusKeywords) && aiData.focusKeywords.length > 0 ? aiData.focusKeywords : defaultTags);

  const defaultComments = [
    {
      id: 'c1',
      authorName: 'איתי לוי',
      publishedAt: 'לפני יומיים',
      content: 'סרטון מדהים ומדויק! התובנות לגבי יישום מעשי עשו לי סדר מוחלט. תודה רבה.',
      likesCount: 16,
    },
    {
      id: 'c2',
      authorName: 'שירה אלון',
      publishedAt: 'לפני 4 ימים',
      content: 'פירוט מעולה וברור, מומלץ מאוד לכל מי שרוצה להבין את התחום לעומק.',
      likesCount: 11,
    },
    {
      id: 'c3',
      authorName: 'דניאל כהן',
      publishedAt: 'לפני שבוע',
      content: 'אחד הסרטונים הטובים ביותר שראיתי בנושא. שמח שנתקלתי בזה.',
      likesCount: 24,
    },
  ];

  const youtubeComments = Array.isArray(aiData?.youtubeComments) && aiData.youtubeComments.length > 0
    ? aiData.youtubeComments
    : defaultComments;

  const keyTakeaways = Array.isArray(aiData?.keyTakeaways) && aiData.keyTakeaways.length > 0
    ? aiData.keyTakeaways
    : [
        'הבנה יסודית של הנושא המרכזי המוצג בסרטון ומשמעותו לעסק.',
        'צעדים מעשיים ליישום מיידי של הכלים שנלמדו.',
        'הימנעות מטעויות נפוצות שרבים עושים בשלבי ההתחלה.',
        'יצירת יתרון תחרותי מתמשך באמצעות שילוב וידאו ותוכן כתוב.',
      ];

  const defaultArticle = `## סקירה מקיפה וניתוח מעמיק של הוידאו
הסרטון **${safeTitle}** מציג נקודת מבט ייחודית ומעשית על הנושא. בעידן שבו צרכני תוכן ומנועי חיפוש מבוססי בינה מלאכותית דורשים ערך אמיתי, חיבור של וידאו מקצועי עם מאמר תוכן מובנה מייצר סמכות גבוהה (EEAT).

### עקרונות הליבה שנלמדו בסרטון:
1. **בהירות המסר:** חדות והעברת המסר המרכזי בדקות הראשונות של הסרטון.
2. **יישום מעשי:** מתן כלים קונקרטיים שניתן להפעיל באופן מיידי ללא צורך בידע מוקדם מורכב.
3. **שילוב מולטימדיה ותוכן כתוב:** העמוד משלב נגן וידאו חדשני לצד סכמה עשירה, המאפשרים אינדוקס מקסימלי בגוגל וברשתות.

### סיכום והמלצות להמשך
כדי להפיק את המירב מהתכנים שהוצגו, מומלץ לצפות בסרטון במלואו, לשתף עם שותפים וקולגות, ולהשאיר את שאלותיכם באזור התגובות בתחתית הנגן.`;

  const articleContent = aiData?.articleContent && aiData.articleContent.length > 100
    ? aiData.articleContent
    : defaultArticle;

  const faqs = Array.isArray(aiData?.faqs) && aiData.faqs.length > 0
    ? aiData.faqs
    : [
        {
          question: `מה הנושא המרכזי של הסרטון "${safeTitle}"?`,
          answer: executiveSummary,
        },
        {
          question: 'כיצד תבנית Kosvidio מסייעת לקידום האורגני בגוגל?',
          answer: 'התבנית משלבת נגן וידאו מתקדם, סימון Schema.org מלא של VideoObject, תוויות עדינות, תגובות קהילה ומאמר עומק עשיר, המספקים לגוגל את כל האותות הדרושים לדירוג גבוה.',
        },
        {
          question: 'האם ניתן לצפות בסרטון במכשירים ניידים בצורה נוחה?',
          answer: 'כן, נגן הוידאו ומבנה העמוד מותאמים ב-100% לכל מסך, סמארטפון וטאבלט עם תמיכה מלאה בכיווניות עברית (RTL).',
        },
      ];

  return {
    metaTitle,
    metaDescription,
    slug,
    focusKeywords: tags,
    tags,
    h1: safeTitle,
    executiveSummary,
    keyTakeaways,
    articleContent,
    youtubeComments,
    faqs,
    callToAction: aiData?.callToAction || {
      title: 'רוצים לייצר נוכחות דיגיטלית ועמודי וידאו מובילים?',
      subtitle: 'הצוות שלנו יסייע לכם להפוך כל סרטון יוטיוב למכונת לידים וסמכות אורגנית',
      buttonText: 'דברו איתנו עכשיו',
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
