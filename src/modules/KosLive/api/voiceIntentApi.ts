import { executeCloudAi } from '../../../core/ai';

export interface IntentMatchResult {
  matchedIntent?: string;
  targetSceneId?: string;
  confidence: number;
  transcription: string;
}

/**
 * Matches user spoken or typed query to available scene branching intents using Gemini AI
 */
export async function matchUserIntent(
  userText: string,
  allowedIntents: Record<string, string>,
  sceneContext: {
    sceneTitle: string;
    sceneScript: string;
  }
): Promise<IntentMatchResult> {
  const intentKeys = Object.keys(allowedIntents);
  if (intentKeys.length === 0) {
    return { confidence: 0, transcription: userText };
  }

  const prompt = `
אתה סוכן AI לניתוב שיחה של נגן וידאו אינטראקטיבי.
הגולש אמר/כתב: "${userText}"
הקשר הסצנה הנוכחית: ${sceneContext.sceneTitle} (${sceneContext.sceneScript}).

הכוונות המותרות למעבר לסצנות הבאות:
${intentKeys.map(k => `- ${k} -> יעד: ${allowedIntents[k]}`).join('\n')}

זהה את הכוונה המתאימה ביותר מהרשימה לעיל.
אם הגולש שואל על מחיר/עלות/חבילות -> התאם לכוונות מחיר/pricing אם קיימות.
אם הגולש שואל מה השירות/יתרונות -> התאם ל-services/features.
אם הגולש רוצה לדבר/ליצור קשר/להשאיר פרטים -> התאם ל-contact/lead.

החזר תשובת JSON בלבד במבנה:
{
  "matchedIntent": "שם הכוונה או null אם אין התאמה",
  "confidence": 0.0 עד 1.0
}
`;

  try {
    const response = await executeCloudAi({
      prompt,
      model: 'gemini-3.8-flash-lite',
      temperature: 0.2,
      responseMimeType: 'application/json',
      category: 'video'
    });

    const parsed = JSON.parse(response.text || '{}');
    const matchedIntent = parsed.matchedIntent;
    const targetSceneId = matchedIntent && allowedIntents[matchedIntent] ? allowedIntents[matchedIntent] : undefined;

    return {
      matchedIntent,
      targetSceneId,
      confidence: parsed.confidence || 0.8,
      transcription: userText
    };
  } catch (err) {
    console.warn('[voiceIntentApi] Cloud AI intent routing fallback:', err);
    
    // Local heuristic fallback
    const lower = userText.toLowerCase();
    for (const key of intentKeys) {
      if (lower.includes(key.toLowerCase()) || 
          (key.includes('price') && (lower.includes('מחיר') || lower.includes('עולה') || lower.includes('כמה'))) ||
          (key.includes('contact') && (lower.includes('קשר') || lower.includes('פרטים') || lower.includes('טלפון'))) ||
          (key.includes('feat') && (lower.includes('מה זה') || lower.includes('יתרון') || lower.includes('כולל')))) {
        return {
          matchedIntent: key,
          targetSceneId: allowedIntents[key],
          confidence: 0.7,
          transcription: userText
        };
      }
    }

    return { confidence: 0, transcription: userText };
  }
}
