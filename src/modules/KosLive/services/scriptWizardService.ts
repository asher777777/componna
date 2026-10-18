import { 
  LivingScene, 
  LivingProject, 
  ProjectOverview, 
  ChatMessageContext, 
  OutputDeliverablePreference,
  ClarificationResult,
  ExtractedPageSummary,
  LivingCarouselCardItem,
  LivingFormFieldConfig,
  AspectRatioType
} from '../types';
import { calculateGeminiCost, TokenUsageReport, executeCloudAi } from '../../../core/ai';
import { resolveCurrentTenantId } from '../../../core/tenant/tenantResolver';
import { VISUAL_STYLES_CATALOG, PRODUCTION_TYPES_CATALOG, TTS_LANGUAGES } from '../config/catalogs';
import { KOS_LIVE_AVATARS } from '../config';
import { BrandDna } from '../../../core/contracts';
import { cleanSubtitleText } from './subtitleService';
import { buildCardsFromPageSummary, buildFormFieldsFromPageSummary } from './pageToLivingConverter';

export interface ScriptGenerationParams {
  topic: string;
  targetAudience: string;
  marketingHook: string;
  sceneCount?: number;
  cardCountPerScene?: number;
  includeLeadForm?: boolean;
  smartFormId?: string;
  formsApiEndpoint?: string;
  customFormFields?: LivingFormFieldConfig[];
  productionType?: string;
  visualStyle?: string;
  ttsLanguage?: string;
  outputPreference?: OutputDeliverablePreference;
  referenceImageBase64?: string;
  referencePdfBase64?: string;
  referencePdfName?: string;
  documentUrl?: string;
  clarificationAnswers?: { question: string; answer: string }[];
  tone?: string;
  aspectRatio?: AspectRatioType;
  conversationId?: string;
  conversationHistory?: ChatMessageContext[];

  // Brand DNA & Page Builder Integration
  brandDna?: BrandDna | null;
  sourcePageId?: string;
  sourcePageTitle?: string;
  sourcePageSummary?: ExtractedPageSummary | null;
}

export interface ScriptGenerationResult {
  project: Partial<LivingProject>;
  scenes: LivingScene[];
  costReport: TokenUsageReport;
  conversationId: string;
  conversationHistory: ChatMessageContext[];
}

export interface ClarificationServiceResult {
  result: ClarificationResult;
  costReport: TokenUsageReport;
}

export function getValidGeminiModel(requestedModel?: string): string {
  if (!requestedModel) return 'gemini-3.8-flash-lite';
  const clean = requestedModel.toLowerCase().trim();
  if (clean.includes('pro')) return 'gemini-3.1-pro';
  return 'gemini-3.8-flash-lite';
}

function buildBrandDnaPromptBlock(brandDna?: BrandDna | null): string {
  if (!brandDna) return '';

  const { identity, voice, audience, trust } = brandDna;
  const formalityNames = ['מאוד קליל וחברי', 'קליל', 'מאוזן ומקצועי', 'רשמי', 'רשמי ומוקפד מאוד'];
  const formalityText = formalityNames[(voice?.personality?.formality || 3) - 1] || 'מאוזן';

  const objectionsText = (audience?.commonObjections || [])
    .map((o) => `  - התנגדות: "${o.objection}" -> מענה/הפרכה: "${o.rebuttal}"`)
    .join('\n');

  const personasText = (audience?.personas || [])
    .map((p) => `  - פרסונה "${p.name}" (${p.roleOrProfile}): כאב מרכזי: "${p.mainPain}", תוצאה מבוקשת: "${p.dreamOutcome}"`)
    .join('\n');

  return `
========================================
🔥 MANDATORY BRAND DNA & VOICE GUIDELINES (מרכז מיתוג גלובלי):
- Company Name: ${identity?.companyName || 'המותג'}
- Brand Slogan: ${identity?.slogan || ''}
- Company Purpose / Vision: ${identity?.companyVision || identity?.organizationPurpose || ''}
- Unique Value Proposition (UVP): ${audience?.mainUvp || ''}
- Brand Voice Tone: רמת רשמיות ${voice?.personality?.formality || 3}/5 (${formalityText}), חמימות ${voice?.personality?.warmth || 4}/5, אנרגיה ${voice?.personality?.energy || 4}/5.
- Gender / Audience Addressing: ${voice?.genderAddressing || 'plural'}
- MANDATORY POWER WORDS: ${(voice?.powerWords || []).join(', ') || 'איכות, מקצועיות, תוצאות'}
- FORBIDDEN WORDS: ${(voice?.forbiddenWords || []).join(', ') || 'זול, חלטורה'}
- Target Personas:
${personasText || '  קהל עסקי ופרטי ממוקד'}
- Common Objections & Key Rebuttals:
${objectionsText || '  מענה מהיר ומקצועי לכל שאלה'}
- Trust & Contact: טלפון/וואטסאפ: ${trust?.whatsappSupportNumber || trust?.contactPhone || ''}
========================================
`;
}

function buildPageContentPromptBlock(sourcePageSummary?: ExtractedPageSummary | null): string {
  if (!sourcePageSummary) return '';

  return `
========================================
🌐 SOURCE LANDING PAGE CONTENT (תוכן העמוד הנבחר מיוצר העמודים):
- Page Title: ${sourcePageSummary.pageTitle}
- URL Slug: ${sourcePageSummary.slug}
- Hero Headline: ${sourcePageSummary.heroHeadline || ''}
- Hero Subheadline / Promise: ${sourcePageSummary.heroSubheadline || ''}
- Hero CTA: ${sourcePageSummary.heroCtaText || 'קבלו הצעה'}
- Extracted Services Count: ${sourcePageSummary.services.length}
- Extracted Pricing Packages Count: ${sourcePageSummary.pricingPackages.length}
- Extracted FAQs Count: ${sourcePageSummary.faqItems.length}
- Detailed Page Sections & Features:
${sourcePageSummary.sectionsSummaryText}
========================================
`;
}

export async function generateClarificationQuestionsWithAI(
  apiKey: string,
  modelName: string = 'gemini-3.8-flash-lite',
  params: ScriptGenerationParams
): Promise<ClarificationServiceResult> {
  const prodType = PRODUCTION_TYPES_CATALOG.find(p => p.id === params.productionType) || PRODUCTION_TYPES_CATALOG[0];
  const visualStyle = VISUAL_STYLES_CATALOG.find(s => s.id === params.visualStyle) || VISUAL_STYLES_CATALOG[0];
  const langObj = TTS_LANGUAGES.find(l => l.code === params.ttsLanguage) || TTS_LANGUAGES[0];

  const conversationId = params.conversationId || `conv_clarify_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const liveModel = getValidGeminiModel(modelName);

  const brandDnaBlock = buildBrandDnaPromptBlock(params.brandDna);
  const pageContentBlock = buildPageContentPromptBlock(params.sourcePageSummary);

  const promptText = `You are an elite Hollywood Video Director, AI Video Architect, and Strategic CRO Marketing Consultant.
The user wants to create an ultra-high-converting, interactive Living Page video funnel.

Analyze their initial inputs, attached materials, Brand DNA, and Source Landing Page content (if provided), and return 2 to 3 sharp, focused clarification questions in Hebrew to guide and refine:
1. The primary audience persona & emotional pain point.
2. The core Q&A interactive branching choice & carousel cards focus.
3. The ultimate call to action and lead form trigger.

INITIAL BRIEF:
- Topic / Concept: ${params.topic}
- Target Audience: ${params.targetAudience}
- Marketing Goal / Hook: ${params.marketingHook}
- Production Type: ${prodType.name}
- Visual Style: ${visualStyle.name}
- Desired Language: ${langObj.name}
- Scenes Count: ${params.sceneCount || 4}
- Cards per Scene: ${params.cardCountPerScene ?? 3}
${params.documentUrl ? `- Reference Document / URL: ${params.documentUrl}` : ''}

${brandDnaBlock}

${pageContentBlock}

Return ONLY a valid JSON object matching this exact schema:
{
  "analysisSummary": "משפט אחד עד שניים בעברית המסכמים את הפוטנציאל השיווקי והחיבור בין המיתוג, תוכן העמוד והוידאו האינטראקטיבי",
  "questions": [
    {
      "id": "q1",
      "question": "שאלה מנחה חדה וממוקדת בעברית",
      "hint": "רמז קצר או דוגמה לתשובה",
      "suggestedAnswer": "הצעת תשובה ראשונית מותאמת מותג שהמשתמש יכול לאמץ בלחיצה"
    }
  ]
}`;

  const imageParts: Array<{ inlineData: { data: string; mimeType: string } }> = [];
  if (params.referenceImageBase64) {
    const cleanImg = params.referenceImageBase64.includes(',') ? params.referenceImageBase64.split(',')[1] : params.referenceImageBase64;
    const mimeMatch = params.referenceImageBase64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
    imageParts.push({ inlineData: { mimeType: mimeMatch ? mimeMatch[1] : 'image/jpeg', data: cleanImg } });
  }
  if (params.referencePdfBase64) {
    const cleanPdf = params.referencePdfBase64.includes(',') ? params.referencePdfBase64.split(',')[1] : params.referencePdfBase64;
    imageParts.push({ inlineData: { mimeType: 'application/pdf', data: cleanPdf } });
  }

  const activeTenantId = resolveCurrentTenantId();
  const aiRes = await executeCloudAi<ClarificationResult>({
    prompt: promptText,
    model: liveModel,
    responseMimeType: 'application/json',
    temperature: 0.7,
    imageParts: imageParts.length > 0 ? imageParts : undefined,
    apiKey,
    category: 'video',
    tenantId: activeTenantId
  });

  if (!aiRes.success || !aiRes.data) {
    throw new Error(aiRes.error || 'No clarification questions returned from Gemini.');
  }

  const parsed = aiRes.data;
  const costReport = aiRes.costReport || calculateGeminiCost({
    model: modelName,
    promptTokens: 550,
    candidatesTokens: 400
  });

  return {
    result: {
      questions: parsed.questions || [],
      analysisSummary: parsed.analysisSummary || '',
      conversationId
    },
    costReport
  };
}

export async function generateStoryboardWithAI(
  apiKey: string,
  modelName: string = 'gemini-3.8-flash-lite',
  params: ScriptGenerationParams
): Promise<ScriptGenerationResult> {
  const sceneCount = Math.min(Math.max(params.sceneCount || 4, 1), 20);
  const cardCount = Math.min(Math.max(params.cardCountPerScene ?? 3, 0), 10);
  const includeLeadForm = params.includeLeadForm !== false;
  const prodType = PRODUCTION_TYPES_CATALOG.find(p => p.id === params.productionType) || PRODUCTION_TYPES_CATALOG[0];
  const visualStyle = VISUAL_STYLES_CATALOG.find(v => v.id === params.visualStyle) || VISUAL_STYLES_CATALOG[0];
  const langObj = TTS_LANGUAGES.find(l => l.code === params.ttsLanguage) || TTS_LANGUAGES[0];

  const conversationId = params.conversationId || `conv_studio_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const liveModel = getValidGeminiModel(modelName);

  const clarificationBlock = params.clarificationAnswers && params.clarificationAnswers.length > 0
    ? `CLARIFIED USER ANSWERS & GUIDANCE:
${params.clarificationAnswers.map((a, i) => `  ${i + 1}. שאלה: ${a.question}\n     תשובה: ${a.answer}`).join('\n')}`
    : '';

  const brandDnaBlock = buildBrandDnaPromptBlock(params.brandDna);
  const pageContentBlock = buildPageContentPromptBlock(params.sourcePageSummary);

  const promptText = `You are an elite Hollywood Video Director, AI Media Architect, and CRO Conversion Specialist.
You must construct a cohesive, ultra-high-converting, multi-scene interactive Living Page video funnel.

PROJECT SPECIFICATIONS:
- Production Type: ${prodType.name} (${prodType.description})
- Visual & Cinematic Style: ${visualStyle.name} (${visualStyle.description})
- Visual Prompt Style Prefix: "${visualStyle.visualPromptPrefix}"
- Topic / Product: ${params.topic}
- Target Audience: ${params.targetAudience}
- Marketing Hook / Value Proposition: ${params.marketingHook}
- Exact Scene Count: ${sceneCount} scenes
- Exact Interactive Cards per Scene: ${cardCount} cards per scene
- Include Lead Capture Form in Closing Scene: ${includeLeadForm ? 'YES' : 'NO'}
- TTS / Narration Language: ${langObj.name} (Code: ${langObj.code})
- Aspect Ratio: ${params.aspectRatio || '9:16'}
${params.documentUrl ? `- Reference URL: ${params.documentUrl}` : ''}

${clarificationBlock}

${brandDnaBlock}

${pageContentBlock}

INTERACTIVE Q&A, CAROUSEL CARDS & TREE ARCHITECTURE MANDATE:
1. Generate EXACTLY ${sceneCount} scenes.
2. For each scene, generate EXACTLY ${cardCount} rich interactive cards in "interactiveCards" (each with "title", "description", "badge", "price" if relevant, and "icon" such as "sparkles", "crown", "rocket", "award", "shopping_bag", "shield", "help"). Base these directly on the Source Landing Page's real services, products, pricing packages, FAQs, and testimonials!
3. Every scene MUST include 2 to 3 engaging Hebrew interactive branching buttons in "interactiveActions".
4. Every scene's "dialogueScript" MUST incorporate speech direction tags like [excited], [warm], [pause], [emphasis], [dramatic], [cheerful].
5. Define a unified "[BANANA_PRO_CONSISTENCY_SEED]" in "projectOverview.bananaConsistencySeed" and start every scene's "visualPrompt" with "${visualStyle.visualPromptPrefix}".

Return ONLY a valid JSON object matching this exact schema:
{
  "title": "כותרת קליטה, מקצועית וממוקדת בעברית לפרויקט",
  "description": "Engaging project summary in Hebrew",
  "projectOverview": {
    "concept": "Concise concept vision in Hebrew",
    "characterBible": "Detailed character description, wardrobe, hair, expression in English for Banana Pro consistency",
    "visualGuide": "Color palette, camera lenses, lighting style, and environmental setting in English",
    "narrativeArc": "Brief description of the story / funnel progression in Hebrew",
    "toneAndStyle": "Tone, pacing, voice personality in Hebrew",
    "targetKpi": "Primary conversion / audience goal in Hebrew",
    "bananaConsistencySeed": "Standardized prompt anchor text for all scenes"
  },
  "scenes": [
    {
      "sceneNumber": 1,
      "sceneRole": "welcome_hook",
      "title": "Hebrew scene title",
      "dialogueScript": "[warm] שלום וברוכים הבאים! [pause] בחרו בכרטיסיות או בכפתורים למטה!",
      "visualPrompt": "${visualStyle.visualPromptPrefix}, modern cinematic studio background, friendly presenter smiling at camera",
      "characterDescription": "Avatar expression, posture, and action",
      "durationSeconds": 6,
      "interactiveActions": [
        { "label": "אני רוצה להגדיל מכירות 🚀", "variant": "gold" },
        { "label": "אני רוצה לחסוך זמן ומשאבים ⚡", "variant": "primary" }
      ],
      "interactiveCards": [
        { "title": "פתרון מותאם אישית", "description": "גלו את המסלול המתאים לכם", "badge": "⭐ מומלץ", "icon": "sparkles", "price": "" }
      ],
      "voicePromptExamples": ["רוצה להגדיל מכירות", "מעוניין בהסבר נוסף"]
    }
  ]
}`;

  const imageParts: Array<{ inlineData: { data: string; mimeType: string } }> = [];
  if (params.referenceImageBase64) {
    const cleanImg = params.referenceImageBase64.includes(',') ? params.referenceImageBase64.split(',')[1] : params.referenceImageBase64;
    const mimeMatch = params.referenceImageBase64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
    imageParts.push({ inlineData: { mimeType: mimeMatch ? mimeMatch[1] : 'image/jpeg', data: cleanImg } });
  }
  if (params.referencePdfBase64) {
    const cleanPdf = params.referencePdfBase64.includes(',') ? params.referencePdfBase64.split(',')[1] : params.referencePdfBase64;
    imageParts.push({ inlineData: { mimeType: 'application/pdf', data: cleanPdf } });
  }

  const activeTenantId = resolveCurrentTenantId();
  const aiRes = await executeCloudAi<any>({
    prompt: promptText,
    model: liveModel,
    responseMimeType: 'application/json',
    temperature: 0.7,
    imageParts: imageParts.length > 0 ? imageParts : undefined,
    apiKey,
    category: 'video',
    tenantId: activeTenantId
  });

  if (!aiRes.success || !aiRes.data) {
    throw new Error(aiRes.error || 'No storyboard content generated by Gemini.');
  }

  const parsed = aiRes.data;
  const costReport = aiRes.costReport || calculateGeminiCost({
    model: modelName,
    promptTokens: 850,
    candidatesTokens: 1600
  });

  const rawScenes = parsed.scenes || [];
  const pageCardsFallback = buildCardsFromPageSummary(params.sourcePageSummary, Math.max(cardCount, 4));
  const formFields: LivingFormFieldConfig[] = (params.customFormFields && params.customFormFields.length > 0)
    ? params.customFormFields
    : buildFormFieldsFromPageSummary(params.sourcePageSummary);

  const scenes: LivingScene[] = rawScenes.map((s: any, idx: number) => {
    const sceneId = `scene_${Date.now()}_${idx + 1}`;
    const avatarPreset = KOS_LIVE_AVATARS[idx % KOS_LIVE_AVATARS.length];
    return {
      id: sceneId,
      sceneNumber: s.sceneNumber || idx + 1,
      sceneRole: s.sceneRole || (idx === 0 ? 'welcome_hook' : idx === rawScenes.length - 1 ? 'lead_closing' : 'feature_explainer'),
      title: s.title || `סצנה ${idx + 1}`,
      dialogueScript: s.dialogueScript || '',
      visualPrompt: s.visualPrompt || `${visualStyle.visualPromptPrefix}, Scene ${idx + 1}`,
      characterDescription: s.characterDescription || parsed.projectOverview?.characterBible || '',
      durationSeconds: s.durationSeconds || 6,
      avatarPose: 'half_body',
      isPhotoAvatar: true,
      avatarId: avatarPreset.id,
      voiceId: avatarPreset.voiceId,
      renderedVideoUrl: params.sourcePageSummary?.heroVideoUrl && idx === 0
        ? params.sourcePageSummary.heroVideoUrl
        : avatarPreset.previewVideoUrl,
      backgroundMediaUrl: params.sourcePageSummary?.services[idx]?.imageUrl || params.sourcePageSummary?.heroImageUrl || avatarPreset.previewImageUrl,
      transition: 'fade',
      heygenStatus: 'pending',
      autoPlay: true,
      loopUntilTrigger: true,
      soundEnabled: true,
      micPosition: 'bottom',
      micIcon: 'mic',
      micActionType: 'open_text_input',
      enableVoiceTrigger: true,
      subtitleText: cleanSubtitleText(s.dialogueScript),
      subtitleStyle: 'boxed',
      subtitleAnimation: 'word',
      subtitleFontSize: 18,
      subtitlePosition: 'bottom',
      voicePromptExamples: s.voicePromptExamples || [],
      autoTransitionOnEnd: false,
      whatsappNumber: params.brandDna?.trust?.whatsappSupportNumber || params.sourcePageSummary?.contact?.whatsapp || params.sourcePageSummary?.contact?.phone,
      whatsappMessage: `שלום, הגעתי מהעמוד החי של ${params.brandDna?.identity?.companyName || params.sourcePageSummary?.pageTitle || 'המותג'}`,
      overlays: []
    };
  });

  // Populate Overlays (Carousel Cards + Quick Replies + Lead Form on closing scene) and link targetSceneId
  scenes.forEach((scn, idx) => {
    const rawScn = rawScenes[idx] || {};
    const nextScn = scenes[idx + 1] || scenes[0];
    const lastScn = scenes[scenes.length - 1] || nextScn;
    const isLastScene = idx === scenes.length - 1;

    const overlays: any[] = [];

    // 1. Carousel Cards Overlay (if cardCount > 0 and either not last scene with form, or user wants cards everywhere)
    if (cardCount > 0 && (!isLastScene || !includeLeadForm)) {
      const aiCards: LivingCarouselCardItem[] = (rawScn.interactiveCards || []).slice(0, cardCount).map((c: any, cIdx: number) => ({
        id: `card_${scn.id}_${cIdx}`,
        title: c.title || pageCardsFallback[cIdx % pageCardsFallback.length]?.title || `יתרון #${cIdx + 1}`,
        description: c.description || pageCardsFallback[cIdx % pageCardsFallback.length]?.description || '',
        badge: c.badge || pageCardsFallback[cIdx % pageCardsFallback.length]?.badge || '✨ מומלץ',
        price: c.price || pageCardsFallback[cIdx % pageCardsFallback.length]?.price,
        icon: c.icon || pageCardsFallback[cIdx % pageCardsFallback.length]?.icon || 'sparkles',
        imageUrl: params.sourcePageSummary?.services[cIdx]?.imageUrl || params.sourcePageSummary?.heroImageUrl,
        targetSceneId: lastScn.id,
        actionLabel: 'לפרטים והמשך ➔'
      }));

      while (aiCards.length < cardCount) {
        const fb = pageCardsFallback[aiCards.length % pageCardsFallback.length];
        aiCards.push({
          ...fb,
          id: `card_${scn.id}_extra_${aiCards.length}`,
          targetSceneId: lastScn.id
        });
      }

      overlays.push({
        id: `ov_carousel_${scn.id}`,
        type: 'carousel',
        position: 'center',
        title: scn.title,
        subtitle: params.sourcePageSummary?.pageTitle || 'דפדפו בכרטיסיות לפרטים נוספים',
        cards: aiCards
      });
    }

    // 2. Interactive Lead Form on the closing scene (or if sceneRole === 'lead_closing')
    if (includeLeadForm && (isLastScene || scn.sceneRole === 'lead_closing')) {
      overlays.push({
        id: `ov_form_${scn.id}`,
        type: 'form_input',
        position: 'center',
        title: params.sourcePageSummary?.formTitle || `תיאום וקבלת הצעה - ${params.sourcePageSummary?.companyName || params.sourcePageSummary?.pageTitle || 'השאירו פרטים'}`,
        subtitle: params.sourcePageSummary?.formSubtitle || 'מלאו את הפרטים ונחזור אליכם בהקדם',
        formFields,
        smartFormId: params.smartFormId || params.sourcePageSummary?.smartFormId,
        webhookUrl: params.formsApiEndpoint,
        submitButtonText: params.sourcePageSummary?.heroCtaText || 'שליחה וקבלת ההצעה ➔',
        actions: [
          { id: `act_form_done_${scn.id}`, label: 'תודה! חזרה להתחלה', targetSceneId: scenes[0].id, variant: 'primary' }
        ]
      });
    }

    // 3. Quick Replies Branching Buttons at the bottom
    const rawActions = rawScn.interactiveActions || [];
    const mappedActions = rawActions.map((act: any, aIdx: number) => {
      let targetId = nextScn.id;
      if (idx === 0 && scenes.length >= 3 && aIdx === 1) {
        targetId = scenes[2].id;
      } else if (aIdx === rawActions.length - 1 && scenes.length > 2) {
        targetId = lastScn.id;
      }
      return {
        id: `act_${scn.id}_${aIdx}`,
        label: act.label || 'המשך לשלב הבא ➔',
        targetSceneId: targetId,
        variant: act.variant || (aIdx === 0 ? 'gold' : 'primary')
      };
    });

    if (mappedActions.length === 0) {
      mappedActions.push({
        id: `act_${scn.id}_default`,
        label: isLastScene ? '↩ חזרה להתחלה' : 'המשך לשלב הבא ➔',
        targetSceneId: isLastScene ? scenes[0].id : nextScn.id,
        variant: 'gold'
      });
    }

    overlays.push({
      id: `ov_actions_${scn.id}`,
      type: 'quick_replies',
      position: 'bottom',
      title: isLastScene ? 'פעולות נוספות:' : 'בחרו כיצד להמשיך:',
      actions: mappedActions
    });

    scn.overlays = overlays;
    scn.autoTransitionTarget = nextScn.id;
    scn.clickMicTargetSceneId = nextScn.id;
  });

  const defaultTitle = params.sourcePageSummary?.pageTitle 
    ? `עמוד חי: ${params.sourcePageSummary.pageTitle}`
    : (params.topic ? `${params.topic} - עמוד חי` : `פרויקט עמוד חי - ${new Date().toLocaleDateString('he-IL')}`);

  const finalProjectTitle = parsed.title?.trim()
    ? parsed.title.trim().replace(/^["']|["']$/g, '')
    : defaultTitle;

  const conversationHistory: ChatMessageContext[] = [
    {
      role: 'user',
      content: `Generate Living Page Storyboard: Topic="${params.topic}", Page="${params.sourcePageSummary?.pageTitle || 'None'}", Scenes=${sceneCount}, CardsPerScene=${cardCount}`,
      timestamp: new Date().toISOString()
    },
    {
      role: 'model',
      content: JSON.stringify({ title: finalProjectTitle, scenesCount: scenes.length }),
      timestamp: new Date().toISOString()
    }
  ];

  return {
    project: {
      title: finalProjectTitle,
      description: parsed.description || params.topic,
      aspectRatio: params.aspectRatio || '9:16',
      productionType: params.productionType,
      visualStyle: params.visualStyle,
      ttsLanguage: params.ttsLanguage,
      outputPreference: params.outputPreference,
      cardCountPerScene: cardCount,
      includeLeadForm,
      smartFormId: params.smartFormId || params.sourcePageSummary?.smartFormId,
      formsApiEndpoint: params.formsApiEndpoint,
      projectOverview: parsed.projectOverview,
      sourcePageId: params.sourcePageId || params.sourcePageSummary?.pageId,
      sourcePageTitle: params.sourcePageTitle || params.sourcePageSummary?.pageTitle,
    },
    scenes,
    costReport,
    conversationId,
    conversationHistory
  };
}

export async function generateNextSceneWithAI(
  apiKey: string,
  modelName: string = 'gemini-3.8-flash-lite',
  project: LivingProject,
  customSceneInstruction?: string
): Promise<{ scene: LivingScene; costReport: TokenUsageReport; updatedHistory: ChatMessageContext[] }> {
  const nextSceneNumber = project.scenes.length + 1;
  const overview = project.projectOverview;
  const cardCount = project.cardCountPerScene ?? 3;
  const visualStyle = VISUAL_STYLES_CATALOG.find(v => v.id === project.visualStyle) || VISUAL_STYLES_CATALOG[0];
  const liveModel = getValidGeminiModel(modelName);

  const prompt = `You are continuing an established interactive Living Page video production.
PROJECT OVERVIEW & BIBLE:
- Title: ${project.title}
- Concept: ${overview?.concept || project.description}
- Character Bible: ${overview?.characterBible || 'Consistent avatar'}
- Consistency Seed: ${overview?.bananaConsistencySeed || visualStyle.visualPromptPrefix}
- Current Scenes Count: ${project.scenes.length}
- Cards to generate for this scene: ${cardCount}

USER INSTRUCTION FOR NEXT SCENE ${nextSceneNumber}:
${customSceneInstruction || 'Create the next natural progression scene in the interactive funnel.'}

Return ONLY a JSON object with this exact schema:
{
  "sceneNumber": ${nextSceneNumber},
  "sceneRole": "feature_explainer",
  "title": "Hebrew scene title",
  "dialogueScript": "[warm] Spoken script in Hebrew with speech tags",
  "visualPrompt": "${overview?.bananaConsistencySeed || visualStyle.visualPromptPrefix}, specific action for scene ${nextSceneNumber}",
  "characterDescription": "${overview?.characterBible || 'Consistent character'}",
  "durationSeconds": 6,
  "interactiveActions": [
    { "label": "המשך לשלב הבא ➔", "variant": "gold" }
  ],
  "interactiveCards": [
    { "title": "כרטיס הסבר", "description": "פירוט התכונה", "badge": "⭐ נקודה חשובה", "icon": "sparkles" }
  ]
}`;

  const activeTenantId = resolveCurrentTenantId();
  const aiRes = await executeCloudAi<any>({
    prompt,
    model: liveModel,
    responseMimeType: 'application/json',
    temperature: 0.7,
    apiKey,
    category: 'video',
    tenantId: activeTenantId
  });

  if (!aiRes.success || !aiRes.data) {
    throw new Error(aiRes.error || 'No scene generated by Gemini.');
  }

  const parsed = aiRes.data;
  const costReport = aiRes.costReport || calculateGeminiCost({
    model: modelName,
    promptTokens: 450,
    candidatesTokens: 550
  });

  const newSceneId = `scene_${Date.now()}_${nextSceneNumber}`;
  const avatarPreset = KOS_LIVE_AVATARS[nextSceneNumber % KOS_LIVE_AVATARS.length];
  const firstSceneId = project.scenes[0]?.id || newSceneId;

  const cards: LivingCarouselCardItem[] = (parsed.interactiveCards || []).slice(0, Math.max(cardCount, 1)).map((c: any, idx: number) => ({
    id: `card_${newSceneId}_${idx}`,
    title: c.title || `נקודה #${idx + 1}`,
    description: c.description || '',
    badge: c.badge || '✨ חדש',
    icon: c.icon || 'sparkles',
    targetSceneId: firstSceneId,
    actionLabel: 'לפרטים ➔'
  }));

  const scene: LivingScene = {
    id: newSceneId,
    sceneNumber: nextSceneNumber,
    sceneRole: parsed.sceneRole || 'feature_explainer',
    title: parsed.title || `סצנה ${nextSceneNumber}`,
    dialogueScript: parsed.dialogueScript || '',
    visualPrompt: parsed.visualPrompt || '',
    characterDescription: parsed.characterDescription || overview?.characterBible || '',
    durationSeconds: parsed.durationSeconds || 6,
    avatarPose: 'half_body',
    isPhotoAvatar: true,
    avatarId: avatarPreset.id,
    voiceId: project.scenes[0]?.voiceId || avatarPreset.voiceId,
    renderedVideoUrl: avatarPreset.previewVideoUrl,
    backgroundMediaUrl: avatarPreset.previewImageUrl,
    transition: 'fade',
    heygenStatus: 'pending',
    autoPlay: true,
    loopUntilTrigger: true,
    soundEnabled: true,
    micPosition: 'bottom',
    micIcon: 'mic',
    subtitleText: cleanSubtitleText(parsed.dialogueScript),
    subtitleStyle: 'boxed',
    subtitleAnimation: 'word',
    subtitleFontSize: 18,
    subtitlePosition: 'bottom',
    overlays: [
      ...(cards.length > 0 ? [{
        id: `ov_carousel_${newSceneId}`,
        type: 'carousel' as const,
        position: 'center' as const,
        title: parsed.title || `סצנה ${nextSceneNumber}`,
        cards
      }] : []),
      {
        id: `ov_actions_${newSceneId}`,
        type: 'quick_replies',
        position: 'bottom',
        actions: (parsed.interactiveActions || [{ label: 'המשך', variant: 'gold' }]).map((act: any, aIdx: number) => ({
          id: `act_${newSceneId}_${aIdx}`,
          label: act.label || 'המשך',
          targetSceneId: firstSceneId,
          variant: act.variant || 'gold'
        }))
      }
    ],
    autoTransitionOnEnd: false
  };

  const updatedHistory: ChatMessageContext[] = [
    ...(project.conversationHistory || []),
    {
      role: 'user',
      content: `Add Scene ${nextSceneNumber}: ${customSceneInstruction || 'Next scene'}`,
      timestamp: new Date().toISOString()
    },
    {
      role: 'model',
      content: JSON.stringify({ sceneNumber: nextSceneNumber, title: scene.title }),
      timestamp: new Date().toISOString()
    }
  ];

  return { scene, costReport, updatedHistory };
}
