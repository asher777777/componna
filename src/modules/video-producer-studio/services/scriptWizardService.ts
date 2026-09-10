import { 
  VideoScene, 
  VideoProject, 
  ProjectOverview, 
  ChatMessageContext, 
  OutputDeliverablePreference,
  ClarificationQuestionItem,
  ClarificationResult
} from '../types';
import { calculateGeminiCost, TokenUsageReport } from '../../../core/ai';
import { VISUAL_STYLES_CATALOG, PRODUCTION_TYPES_CATALOG, TTS_LANGUAGES } from '../config/catalogs';

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
function getValidGeminiModel(requestedModel?: string): string {
  if (!requestedModel) return 'gemini-1.5-flash';
  const clean = requestedModel.toLowerCase();
  if (clean.includes('1.5-pro') || clean.includes('pro-preview') || clean.includes('3.1-pro') || clean.includes('2.5-pro')) {
    return 'gemini-1.5-pro';
  }
  if (clean.includes('2.0-flash-lite')) {
    return 'gemini-2.0-flash-lite';
  }
  if (clean.includes('2.0-flash') && !clean.includes('exp')) {
    return 'gemini-2.0-flash';
  }
  return 'gemini-1.5-flash';
}

/**
 * Step 1: Generate 2-3 sharp guiding questions from Gemini to refine project scope
 */
export async function generateClarificationQuestionsWithAI(
  apiKey: string,
  modelName: string = 'gemini-1.5-flash',
  params: ScriptGenerationParams
): Promise<ClarificationServiceResult> {
  const prodType = PRODUCTION_TYPES_CATALOG.find(p => p.id === params.productionType) || PRODUCTION_TYPES_CATALOG[0];
  const visualStyle = VISUAL_STYLES_CATALOG.find(s => s.id === params.visualStyle) || VISUAL_STYLES_CATALOG[0];
  const langObj = TTS_LANGUAGES.find(l => l.code === params.ttsLanguage) || TTS_LANGUAGES[0];

  const conversationId = params.conversationId || `conv_clarify_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const liveModel = getValidGeminiModel(modelName);

  const promptText = `You are an elite Hollywood Video Director and Strategic CRO Marketing Consultant.
The user wants to create a video production project.
Analyze their initial inputs and materials, and return 2 to 3 sharp, focused clarification questions in Hebrew to guide and refine the script quality, unique selling proposition, primary customer objection, and call to action.

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

Return ONLY a valid JSON object matching this exact schema:
{
  "analysisSummary": "משפט אחד קצר בעברית המסכם את ניתוח הבריף והפוטנציאל השיווקי",
  "questions": [
    {
      "id": "q1",
      "question": "שאלה מנחה חדה וממוקדת בעברית",
      "hint": "רמז קצר או דוגמה לתשובה",
      "suggestedAnswer": "הצעת תשובה ראשונית שהמשתמש יכול לאמץ בלחיצה"
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

  const promptTokens = data.usageMetadata?.promptTokenCount || 450;
  const candidatesTokens = data.usageMetadata?.candidatesTokenCount || 350;

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
 * Step 2: Main AI Studio Storyboard & Project Architect Engine
 */
export async function generateStoryboardWithAI(
  apiKey: string,
  modelName: string = 'gemini-1.5-flash',
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

  const promptText = `You are an elite Hollywood Video Director, AI Media Architect, and CRO Conversion Specialist.
You must construct a cohesive, ultra-high-converting, multi-scene video production project.

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

PROJECT TITLE MANDATE:
Generate a compelling, descriptive, and high-converting Hebrew project title for the "title" field that accurately captures the campaign (e.g. "המהפכה השיווקית של [שם הנושא] - סרטון תדמית ומכירה").

GOOGLE SPEECH & AUDIO DIRECTION MANDATE:
According to Google AI Studio Speech Generation standards, every scene's "dialogueScript" MUST naturally incorporate speech direction and timing tags like [excited], [warm], [pause], [emphasis], [dramatic], [whispering], [cheerful] to instruct the TTS voice model on cadence, emotion, and dramatic pauses.

NANO BANANA PRO CONSISTENCY MANDATE:
You must define a unified "[BANANA_PRO_CONSISTENCY_SEED]" in the character bible and visual guide.
Every single scene's "visualPrompt" MUST begin with the exact visual style prefix followed by the consistent character/scene tags so that Imagen 3 / Nano Banana Pro renders 100% consistent visuals across all ${sceneCount} scenes.

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
      "dialogueScript": "[warm] טקסט הקריינות של הפרזנטור [pause] כולל תגיות הדרכה קוליות [emphasis] להגשה מקצועית.",
      "visualPrompt": "${visualStyle.visualPromptPrefix}, [BANANA_PRO_CONSISTENCY_SEED], detailed scene specific action, shot angle, lighting",
      "characterDescription": "Avatar expression, posture, and action",
      "durationSeconds": 6,
      "interactiveActions": [
        { "label": "Action button text in Hebrew", "variant": "primary" }
      ],
      "interactiveCards": [
        { "title": "Card title in Hebrew", "description": "Card explanation in Hebrew", "badge": "⭐ תגית" }
      ],
      "voicePromptExamples": ["דוגמה לפקודה קולית"]
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

  const promptTokens = data.usageMetadata?.promptTokenCount || 600;
  const candidatesTokens = data.usageMetadata?.candidatesTokenCount || 1200;

  const costReport = calculateGeminiCost({
    model: modelName,
    promptTokens,
    candidatesTokens
  });

  const rawScenes = parsed.scenes || [];
  const defaultAvatar = 'Wayne_20240711';
  const defaultVoice = '077ab11b14f04ce0b49b5f67b5f59629';

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
      avatarId: defaultAvatar,
      avatarPose: 'half_body',
      voiceId: defaultVoice,
      transition: 'fade',
      heygenStatus: 'pending',
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
      autoTransitionOnEnd: true
    };
  });

  // Link actions sequentially
  scenes.forEach((scn, idx) => {
    const nextScn = scenes[idx + 1] || scenes[0];
    if (scn.interactiveActions && scn.interactiveActions.length > 0) {
      scn.interactiveActions[0].targetSceneId = nextScn.id;
    }
  });

  const finalProjectTitle = parsed.title?.trim()
    ? parsed.title.trim().replace(/^["']|["']$/g, '')
    : (params.topic ? `${params.topic} - ${params.marketingHook || 'הפקת וידאו'}` : `פרויקט וידאו חדש - ${new Date().toLocaleDateString('he-IL')}`);

  const conversationHistory: ChatMessageContext[] = [
    {
      role: 'user',
      content: `Generate Storyboard Brief: Topic="${params.topic}", Audience="${params.targetAudience}", Hook="${params.marketingHook}", Style="${visualStyle.name}", Scenes=${sceneCount}`,
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
  modelName: string = 'gemini-1.5-flash',
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
${customSceneInstruction || 'Create the next natural progression scene in the storyboard / funnel.'}

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
    { "label": "המשך", "variant": "primary" }
  ],
  "interactiveCards": [
    { "title": "כרטיס הסבר", "description": "פירוט" }
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

  const promptTokens = data.usageMetadata?.promptTokenCount || 400;
  const candidatesTokens = data.usageMetadata?.candidatesTokenCount || 500;

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
    avatarId: project.scenes[0]?.avatarId || 'Wayne_20240711',
    avatarPose: 'half_body',
    voiceId: project.scenes[0]?.voiceId || '077ab11b14f04ce0b49b5f67b5f59629',
    transition: 'fade',
    heygenStatus: 'pending',
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
