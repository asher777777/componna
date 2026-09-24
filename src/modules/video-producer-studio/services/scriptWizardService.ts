import { 
  VideoScene, 
  VideoProject, 
  ProjectOverview, 
  ChatMessageContext, 
  OutputDeliverablePreference,
  ClarificationQuestionItem,
  ClarificationResult,
  InteractiveActionItem,
  InteractiveCardItem
} from '../types';
import { calculateGeminiCost, TokenUsageReport } from '../../../core/ai';
import { VISUAL_STYLES_CATALOG, PRODUCTION_TYPES_CATALOG, TTS_LANGUAGES } from '../config/catalogs';
import { BrandDna } from '../../brand-dna-hub/types/brandDna';
import { ExtractedPageSummary } from './pageContentExtractor';
import { cleanSubtitleText } from './subtitleService';

export interface ScriptGenerationParams {
  topic: string;
  targetAudience: string;
  marketingHook: string;
  sceneCount?: number;
  productionType?: string;
  visualStyle?: string;
  ttsLanguage?: string;
  outputPreference?: OutputDeliverablePreference;
  referenceImageBase64?: string; // Multimodal image data (data:image/... or base64)
  referencePdfBase64?: string;   // Multimodal PDF data (data:application/pdf;base64,... or base64)
  referencePdfName?: string;
  documentUrl?: string;          // Link to Google Sheets / Docs / Notion / URL
  clarificationAnswers?: { question: string; answer: string }[];
  tone?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  conversationId?: string;
  conversationHistory?: ChatMessageContext[];

  // Brand DNA & Page Builder Integration
  brandDna?: BrandDna | null;
  sourcePageId?: string;
  sourcePageTitle?: string;
  sourcePageSummary?: ExtractedPageSummary | null;
}

export interface ScriptGenerationResult {
  project: Partial<VideoProject>;
  scenes: VideoScene[];
  costReport: TokenUsageReport;
  conversationId: string;
  conversationHistory: ChatMessageContext[];
}

export interface ClarificationServiceResult {
  result: ClarificationResult;
  costReport: TokenUsageReport;
}

/**
 * Resolves any custom / UI model alias into a valid, live Google AI Studio API model
 */
export function getValidGeminiModel(requestedModel?: string): string {
  if (!requestedModel) return 'gemini-3.6-flash';
  const clean = requestedModel.toLowerCase().trim();

  if (clean.includes('3.8-flash') || clean === 'gemini-3.8-flash') return 'gemini-3.8-flash';
  if (clean.includes('3.7-flash') || clean === 'gemini-3.7-flash') return 'gemini-3.7-flash';
  if (clean.includes('3.6-flash') || clean === 'gemini-3.6-flash') return 'gemini-3.6-flash';
  if (clean.includes('3.5-flash-lite')) return 'gemini-3.5-flash-lite';
  if (clean.includes('3.5-flash')) return 'gemini-3.5-flash';
  if (clean.includes('pro')) return 'gemini-3.1-pro-preview';
  if (clean.includes('lite')) return 'gemini-3.5-flash-lite';

  return 'gemini-3.6-flash';
}

/**
 * Helper to construct Brand DNA Guidelines text block
 */
function buildBrandDnaPromptBlock(brandDna?: BrandDna | null): string {
  if (!brandDna) return '';

  const { identity, voice, audience, trust } = brandDna;
  const formalityNames = ['מאוד קליל וחברי', 'קליל', 'מאוזן ומקצועי', 'רשמי', 'רשמי ומוקפד מאוד'];
  const formalityText = formalityNames[(voice.personality?.formality || 3) - 1] || 'מאוזן';

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
- Gender / Audience Addressing: ${voice?.genderAddressing || 'plural'} (למשל: פנייה בלשון רבים / ניטרלית בהתאם למותג)
- Sector Compliance: ${voice?.sectorCompliance || 'general'}
- MANDATORY POWER WORDS (יש לשלב באופן טבעי בסקריפט): ${(voice?.powerWords || []).join(', ') || 'איכות, מקצועיות, תוצאות'}
- FORBIDDEN WORDS (אסור בתכלית האיסור להשתמש במילים אלו!): ${(voice?.forbiddenWords || []).join(', ') || 'זול, חלטורה'}
- Target Personas:
${personasText || '  קהל עסקי ופרטי ממוקד'}
- Common Objections & Key Rebuttals (לשימוש בשאלות ותשובות ובאינטראקציה):
${objectionsText || '  מענה מהיר ומקצועי לכל שאלה'}
- Trust & Contact: טלפון/וואטסאפ: ${trust?.whatsappSupportNumber || trust?.contactPhone || ''}, ביטחון: ${trust?.securityBadgeText || ''}
========================================
`;
}

/**
 * Helper to construct Page Builder content text block
 */
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
- Detailed Page Sections & Features:
${sourcePageSummary.sectionsSummaryText}
========================================
`;
}

/**
 * Step 1: Generate 2-3 sharp guiding questions from Gemini to refine project scope
 */
export async function generateClarificationQuestionsWithAI(
  apiKey: string,
  modelName: string = 'gemini-3.6-flash',
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
The user wants to create an ultra-high-converting, interactive video production campaign that can replace or augment a landing page.

Analyze their initial inputs, attached materials, Brand DNA, and Source Landing Page content (if provided), and return 2 to 3 sharp, focused clarification questions in Hebrew to guide and refine:
1. The primary audience persona & emotional pain point.
2. The core Q&A interactive branching choice (what key question should the avatar ask the viewer to qualify them?).
3. The ultimate call to action and conversion trigger.

INITIAL BRIEF:
- Topic / Concept: ${params.topic}
- Target Audience: ${params.targetAudience}
- Marketing Goal / Hook: ${params.marketingHook}
- Production Type: ${prodType.name}
- Visual Style: ${visualStyle.name}
- Desired Language: ${langObj.name}
${params.documentUrl ? `- Reference Document / Google Sheet / Web URL: ${params.documentUrl}` : ''}
${params.referencePdfBase64 ? `- Attached PDF document is provided for context.` : ''}
${params.referenceImageBase64 ? `- Attached reference image is provided for visual context.` : ''}

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

  const parts: any[] = [{ text: promptText }];

  // Attach reference image if provided
  if (params.referenceImageBase64) {
    const cleanImg = params.referenceImageBase64.includes(',') 
      ? params.referenceImageBase64.split(',')[1] 
      : params.referenceImageBase64;
    const mimeMatch = params.referenceImageBase64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: cleanImg
      }
    });
  }

  // Attach PDF document if provided
  if (params.referencePdfBase64) {
    const cleanPdf = params.referencePdfBase64.includes(',') 
      ? params.referencePdfBase64.split(',')[1] 
      : params.referencePdfBase64;
    parts.push({
      inlineData: {
        mimeType: 'application/pdf',
        data: cleanPdf
      }
    });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${liveModel}:generateContent?key=${apiKey.trim()}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7
        }
      })
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini API Error (${res.status}): ${res.statusText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No clarification questions returned from Gemini.');
  }

  const parsed = JSON.parse(text);

  const promptTokens = data.usageMetadata?.promptTokenCount || 550;
  const candidatesTokens = data.usageMetadata?.candidatesTokenCount || 400;

  const costReport = calculateGeminiCost({
    model: modelName,
    promptTokens,
    candidatesTokens
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

/**
 * Step 2: Main AI Studio Storyboard & Interactive Branching Tree Architect
 */
export async function generateStoryboardWithAI(
  apiKey: string,
  modelName: string = 'gemini-3.6-flash',
  params: ScriptGenerationParams
): Promise<ScriptGenerationResult> {
  const sceneCount = Math.min(Math.max(params.sceneCount || 4, 1), 20);
  const prodType = PRODUCTION_TYPES_CATALOG.find(p => p.id === params.productionType) || PRODUCTION_TYPES_CATALOG[0];
  const visualStyle = VISUAL_STYLES_CATALOG.find(v => v.id === params.visualStyle) || VISUAL_STYLES_CATALOG[0];
  const langObj = TTS_LANGUAGES.find(l => l.code === params.ttsLanguage) || TTS_LANGUAGES[0];

  const conversationId = params.conversationId || `conv_studio_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const liveModel = getValidGeminiModel(modelName);

  const clarificationBlock = params.clarificationAnswers && params.clarificationAnswers.length > 0
    ? `CLARIFIED USER ANSWERS & GUIDANCE (CRITICAL CONTEXT):
${params.clarificationAnswers.map((a, i) => `  ${i + 1}. שאלה: ${a.question}
     תשובה: ${a.answer}`).join('\n')}`
    : '';

  const brandDnaBlock = buildBrandDnaPromptBlock(params.brandDna);
  const pageContentBlock = buildPageContentPromptBlock(params.sourcePageSummary);

  const promptText = `You are an elite Hollywood Video Director, AI Media Architect, and CRO Conversion Specialist.
You must construct a cohesive, ultra-high-converting, multi-scene interactive video tree that can completely replace or empower a static landing page.

PROJECT SPECIFICATIONS:
- Production Type: ${prodType.name} (${prodType.description})
- Visual & Cinematic Style: ${visualStyle.name} (${visualStyle.description})
- Visual Prompt Style Prefix: "${visualStyle.visualPromptPrefix}"
- Topic / Product: ${params.topic}
- Target Audience: ${params.targetAudience}
- Marketing Hook / Value Proposition: ${params.marketingHook}
- Exact Scene Count: ${sceneCount} scenes
- TTS / Narration Language: ${langObj.name} (Code: ${langObj.code})
- Aspect Ratio: ${params.aspectRatio || '16:9'}
- Output Deliverables Focus: ${params.outputPreference || 'full_production'}
${params.documentUrl ? `- Reference Document / Google Sheet / Web URL: ${params.documentUrl}` : ''}
${params.referenceImageBase64 ? '- An attached reference image is provided. Analyze its branding, character, or product visually and strictly maintain consistency across all scenes.' : ''}
${params.referencePdfBase64 ? '- An attached PDF document is provided. Extract and integrate its key value points into the script.' : ''}

${clarificationBlock}

${brandDnaBlock}

${pageContentBlock}

INTERACTIVE Q&A & TREE ARCHITECTURE MANDATE:
1. Scene 1 (welcome_hook): Avatar greets the audience with high energy and UVP, presenting an immediate interactive question (Quick Replies / Buttons) to qualify the viewer (e.g., "איזה פתרון אתם מחפשים?").
2. Scene 2 (feature_explainer / personalized branch): Presents the value proposition matching the viewer's choice, incorporating key services and proof points.
3. Scene 3 (objection_handler / interactive FAQ): Avatar addresses the top FAQ / objection from the brand/page with interactive cards.
4. Scene 4+ (lead_closing): Compelling closing offer, direct CTA button (WhatsApp / Lead Capture / Checkout) with trust badges.
5. Interactive Actions & Cards: Every scene MUST include realistic, engaging Hebrew interactive actions (e.g. choice buttons) and interactive cards (e.g. highlight badge, service point, testimonial quote).

GOOGLE SPEECH & AUDIO DIRECTION MANDATE:
Every scene's "dialogueScript" MUST incorporate speech direction tags like [excited], [warm], [pause], [emphasis], [dramatic], [cheerful] to instruct TTS voice cadence.

NANO BANANA PRO CONSISTENCY MANDATE:
Define a unified "[BANANA_PRO_CONSISTENCY_SEED]" in the character bible.
Every scene's "visualPrompt" MUST begin with "${visualStyle.visualPromptPrefix}, [BANANA_PRO_CONSISTENCY_SEED], ..." for 100% visual consistency.

Return ONLY a valid JSON object matching this exact schema:
{
  "title": "כותרת קליטה, מקצועית וממוקדת בעברית לפרויקט",
  "description": "Engaging project summary in Hebrew",
  "projectOverview": {
    "concept": "Concise concept vision in Hebrew",
    "characterBible": "Detailed character description, wardrobe, hair, expression and token tag [CHAR_ID] in English for Banana Pro consistency",
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
      "dialogueScript": "[warm] שלום וברוכים הבאים! [pause] האם אתם מחפשים לשדרג את העסק שלכם? [excited] בחרו את האפשרות המתאימה לכם למטה!",
      "visualPrompt": "${visualStyle.visualPromptPrefix}, [BANANA_PRO_CONSISTENCY_SEED], modern cinematic studio background, friendly presenter smiling at camera",
      "characterDescription": "Avatar expression, posture, and action",
      "durationSeconds": 6,
      "interactiveActions": [
        { "label": "אני רוצה להגדיל מכירות", "variant": "primary" },
        { "label": "אני רוצה לחסוך זמן ומשאבים", "variant": "gold" }
      ],
      "interactiveCards": [
        { "title": "פתרון מותאם אישית", "description": "גלו את המסלול המתאים לכם", "badge": "⭐ מומלץ" }
      ],
      "voicePromptExamples": ["רוצה להגדיל מכירות", "מעוניין בהסבר נוסף"]
    }
  ]
}`;

  const parts: any[] = [{ text: promptText }];

  // If user uploaded a reference image, attach it as inlineData
  if (params.referenceImageBase64) {
    const cleanImg = params.referenceImageBase64.includes(',') 
      ? params.referenceImageBase64.split(',')[1] 
      : params.referenceImageBase64;
    const mimeMatch = params.referenceImageBase64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: cleanImg
      }
    });
  }

  // If user uploaded a PDF document, attach it as inlineData
  if (params.referencePdfBase64) {
    const cleanPdf = params.referencePdfBase64.includes(',') 
      ? params.referencePdfBase64.split(',')[1] 
      : params.referencePdfBase64;
    parts.push({
      inlineData: {
        mimeType: 'application/pdf',
        data: cleanPdf
      }
    });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${liveModel}:generateContent?key=${apiKey.trim()}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7
        }
      })
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini API Error (${res.status}): ${res.statusText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No storyboard content generated by Gemini.');
  }

  const parsed = JSON.parse(text);

  const promptTokens = data.usageMetadata?.promptTokenCount || 750;
  const candidatesTokens = data.usageMetadata?.candidatesTokenCount || 1400;

  const costReport = calculateGeminiCost({
    model: modelName,
    promptTokens,
    candidatesTokens
  });

  const rawScenes = parsed.scenes || [];
  const defaultAvatar = 'Wayne_20240711';
  const defaultVoice = '1bd001e7e50f421d891986aad5158bc8';

  const scenes: VideoScene[] = rawScenes.map((s: any, idx: number) => {
    const sceneId = `scene_${Date.now()}_${idx + 1}`;
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
      voiceId: defaultVoice,
      transition: 'fade',
      heygenStatus: 'pending',
      subtitleText: cleanSubtitleText(s.dialogueScript),
      subtitleStyle: 'boxed',
      subtitleAnimation: 'word',
      subtitleFontSize: 18,
      subtitlePosition: 'bottom',
      interactiveActions: (s.interactiveActions || []).map((act: any, aIdx: number) => ({
        id: `act_${sceneId}_${aIdx}`,
        label: act.label || 'המשך',
        targetSceneId: sceneId,
        variant: act.variant || 'primary'
      })),
      interactiveCards: (s.interactiveCards || []).map((card: any, cIdx: number) => ({
        id: `card_${sceneId}_${cIdx}`,
        title: card.title || '',
        description: card.description || '',
        badge: card.badge
      })),
      voicePromptExamples: s.voicePromptExamples || [],
      autoTransitionOnEnd: true,
      whatsappNumber: params.brandDna?.trust?.whatsappSupportNumber || params.sourcePageSummary?.contact?.whatsapp,
      whatsappMessage: `שלום, הגעתי מסרטון האינטראקטיבי של ${params.brandDna?.identity?.companyName || params.sourcePageSummary?.pageTitle || 'העמוד'}`
    };
  });

  // Link actions sequentially / branching
  scenes.forEach((scn, idx) => {
    const nextScn = scenes[idx + 1] || scenes[0];
    if (scn.interactiveActions && scn.interactiveActions.length > 0) {
      scn.interactiveActions.forEach((act, actIdx) => {
        // If there are multiple actions in scene 1, branch to scene 2 or scene 3
        if (idx === 0 && scenes.length >= 3 && actIdx > 0) {
          act.targetSceneId = scenes[2]?.id || nextScn.id;
        } else {
          act.targetSceneId = nextScn.id;
        }
      });
    }
  });

  const defaultTitle = params.sourcePageSummary?.pageTitle 
    ? `עץ וידאו אינטראקטיבי: ${params.sourcePageSummary.pageTitle}`
    : (params.topic ? `${params.topic} - ${params.marketingHook || 'הפקת וידאו'}` : `פרויקט וידאו חדש - ${new Date().toLocaleDateString('he-IL')}`);

  const finalProjectTitle = parsed.title?.trim()
    ? parsed.title.trim().replace(/^["']|["']$/g, '')
    : defaultTitle;

  const conversationHistory: ChatMessageContext[] = [
    {
      role: 'user',
      content: `Generate Storyboard Brief: Topic="${params.topic}", Page="${params.sourcePageSummary?.pageTitle || 'None'}", Audience="${params.targetAudience}", Hook="${params.marketingHook}", Style="${visualStyle.name}", Scenes=${sceneCount}`,
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
      aspectRatio: params.aspectRatio || '16:9',
      projectOverview: parsed.projectOverview
    },
    scenes,
    costReport,
    conversationId,
    conversationHistory
  };
}

/**
 * Generate Scene N+1 for established project continuing the conversation
 */
export async function generateNextSceneWithAI(
  apiKey: string,
  modelName: string = 'gemini-3.6-flash',
  project: VideoProject,
  customSceneInstruction?: string
): Promise<{ scene: VideoScene; costReport: TokenUsageReport; updatedHistory: ChatMessageContext[] }> {
  const nextSceneNumber = project.scenes.length + 1;
  const overview = project.projectOverview;
  const visualStyle = VISUAL_STYLES_CATALOG.find(v => v.id === project.visualStyle) || VISUAL_STYLES_CATALOG[0];
  const liveModel = getValidGeminiModel(modelName);

  const prompt = `You are continuing an established video production.
PROJECT OVERVIEW & BIBLE:
- Title: ${project.title}
- Concept: ${overview?.concept || project.description}
- Character Bible (Maintain Strict Consistency): ${overview?.characterBible || 'Consistent avatar'}
- Visual Guide: ${overview?.visualGuide || visualStyle.visualPromptPrefix}
- Consistency Seed: ${overview?.bananaConsistencySeed || visualStyle.visualPromptPrefix}
- Current Scenes Count: ${project.scenes.length}
- Target Language: ${project.ttsLanguage || 'he-IL'}

USER INSTRUCTION FOR NEXT SCENE ${nextSceneNumber}:
${customSceneInstruction || 'Create the next natural progression scene in the storyboard / interactive funnel.'}

Return ONLY a JSON object with this exact schema:
{
  "sceneNumber": ${nextSceneNumber},
  "sceneRole": "feature_explainer",
  "title": "Hebrew scene title",
  "dialogueScript": "Spoken script in ${project.ttsLanguage || 'he-IL'}",
  "visualPrompt": "${overview?.bananaConsistencySeed || visualStyle.visualPromptPrefix}, specific action for scene ${nextSceneNumber}",
  "characterDescription": "${overview?.characterBible || 'Consistent character'}",
  "durationSeconds": 6,
  "interactiveActions": [
    { "label": "המשך לשלב הבא", "variant": "primary" }
  ],
  "interactiveCards": [
    { "title": "כרטיס הסבר", "description": "פירוט התכונה", "badge": "⭐ נקודה חשובה" }
  ]
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${liveModel}:generateContent?key=${apiKey.trim()}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7
        }
      })
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini Next Scene error (${res.status})`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No scene generated by Gemini.');
  }

  const parsed = JSON.parse(text);

  const promptTokens = data.usageMetadata?.promptTokenCount || 450;
  const candidatesTokens = data.usageMetadata?.candidatesTokenCount || 550;

  const costReport = calculateGeminiCost({
    model: modelName,
    promptTokens,
    candidatesTokens
  });

  const newSceneId = `scene_${Date.now()}_${nextSceneNumber}`;

  const scene: VideoScene = {
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
    voiceId: project.scenes[0]?.voiceId || '1bd001e7e50f421d891986aad5158bc8',
    transition: 'fade',
    heygenStatus: 'pending',
    subtitleText: cleanSubtitleText(parsed.dialogueScript),
    subtitleStyle: 'boxed',
    subtitleAnimation: 'word',
    subtitleFontSize: 18,
    subtitlePosition: 'bottom',
    interactiveActions: (parsed.interactiveActions || []).map((act: any, aIdx: number) => ({
      id: `act_${newSceneId}_${aIdx}`,
      label: act.label || 'המשך',
      targetSceneId: newSceneId,
      variant: act.variant || 'primary'
    })),
    interactiveCards: (parsed.interactiveCards || []).map((card: any, cIdx: number) => ({
      id: `card_${newSceneId}_${cIdx}`,
      title: card.title || '',
      description: card.description || '',
      badge: card.badge
    })),
    autoTransitionOnEnd: true
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
