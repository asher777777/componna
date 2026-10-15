/**
 * KOSAI AI Bridge - KosTogether / Communities & Groups Hub Copilot Service
 * Connects community and group operations to KOSAI modelsAiService central monopoly.
 * Guarantees zero direct external calls, model governance (Gemini 3.8 variations),
 * and immediate zero-token offline fallbacks.
 */

import {
  dispatchSmartRulesToKosai,
  dispatchCommunityVisionToKosai,
  dispatchCommunityBroadcastToKosai,
  dispatchCommunityGrowthToKosai,
  KosaiTogetherDispatchOptions,
} from '../kosai/promptToKosai';
import {
  TogetherSmartRulesResult,
  TogetherCommunityVisionResult,
  TogetherBroadcastDraftResult,
  TogetherGrowthInsightResult,
  TogetherAiMode,
} from '../../kosai-engine/modelsAiService/togetherAiContract';
import { GroupRule } from '../types';

export interface GenerateSmartGroupRulesRequest {
  naturalLanguageQuery: string;
  availableCities?: string[];
}

export interface GenerateSmartGroupRulesResponse {
  rules: GroupRule[];
  matchType: 'all' | 'any';
  suggestedName: string;
  suggestedColor: string;
  description?: string;
}

export interface GenerateCommunityVisionRequest {
  communityName: string;
  theme?: string;
  targetGoal?: number;
  currentRaised?: number;
  brandVision?: string;
  mode?: TogetherAiMode;
}

export interface GenerateCommunityVisionResponse {
  vision: string;
  purpose: string;
  tagline: string;
  suggestedTiers: Array<{
    name: string;
    amount: number;
    description: string;
  }>;
}

export interface DraftCommunityBroadcastRequest {
  groupName: string;
  topic: string;
  tone?: string;
  isPoll?: boolean;
}

export interface SuggestCommunityGrowthRequest {
  groupName: string;
  memberCount: number;
  currentRaised?: number;
  targetGoal?: number;
}

/**
 * Heuristic zero-token fallback for parsing Hebrew queries into group rules
 */
export function offlineSmartRulesHeuristic(
  query: string,
  availableCities?: string[]
): GenerateSmartGroupRulesResponse {
  const q = query.toLowerCase();
  const rules: GroupRule[] = [];
  let matchType: 'all' | 'any' = 'all';
  const suggestedName = query.trim() || 'קבוצה חכמה';

  // Amount match (e.g. מעל 500 שח, תרמו 1000)
  const amountMatch = q.match(/(\d+)/);
  if (amountMatch && (q.includes('מעל') || q.includes('גדול') || q.includes('תרומ') || q.includes('שח') || q.includes('₪'))) {
    rules.push({
      field: 'total_spent',
      operator: 'gte',
      value: Number(amountMatch[1]),
    });
  }

  // City match
  if (availableCities && availableCities.length > 0) {
    for (const city of availableCities) {
      if (q.includes(city.toLowerCase())) {
        rules.push({
          field: 'mh_crm_city',
          operator: 'eq',
          value: city,
        });
        break;
      }
    }
  }

  // Phone / WhatsApp match
  if (q.includes('טלפון') || q.includes('וואטסאפ') || q.includes('נייד')) {
    rules.push({
      field: 'has_phone',
      operator: 'exists',
      value: 'true',
    });
  }

  // Email match
  if (q.includes('אימייל') || q.includes('מייל')) {
    rules.push({
      field: 'has_email',
      operator: 'exists',
      value: 'true',
    });
  }

  // Any operator
  if (q.includes('או ') || q.includes('אחד מהם')) {
    matchType = 'any';
  }

  return {
    rules: rules.length > 0 ? rules : [{ field: 'total_spent', operator: 'gte', value: 500 }],
    matchType,
    suggestedName,
    suggestedColor: '#4f46e5',
    description: `חוקי סינון חכמים שנוצרו עבור: ${suggestedName}`,
  };
}

/**
 * Generates smart community filter rules from natural language via KOSAI
 */
export async function generateSmartGroupRules(
  payload: GenerateSmartGroupRulesRequest,
  options?: KosaiTogetherDispatchOptions
): Promise<GenerateSmartGroupRulesResponse> {
  try {
    const result: TogetherSmartRulesResult = await dispatchSmartRulesToKosai(
      {
        naturalLanguageQuery: payload.naturalLanguageQuery,
        availableCities: payload.availableCities,
      },
      options
    );

    if (result && Array.isArray(result.rules) && result.rules.length > 0) {
      return {
        rules: result.rules as GroupRule[],
        matchType: result.matchType || 'all',
        suggestedName: result.suggestedName || payload.naturalLanguageQuery,
        suggestedColor: result.suggestedColor || '#4f46e5',
        description: result.description,
      };
    }
  } catch (err) {
    console.warn('[togetherCopilotService] AI dispatch failed, falling back to heuristic:', err);
  }

  // Guaranteed zero-token fallback
  return offlineSmartRulesHeuristic(payload.naturalLanguageQuery, payload.availableCities);
}

/**
 * Generates community vision, purpose and contribution tiers via KOSAI
 */
export async function generateCommunityVision(
  payload: GenerateCommunityVisionRequest,
  options?: KosaiTogetherDispatchOptions
): Promise<GenerateCommunityVisionResponse> {
  try {
    const result: TogetherCommunityVisionResult = await dispatchCommunityVisionToKosai(
      {
        communityName: payload.communityName,
        theme: payload.theme,
        targetGoal: payload.targetGoal,
        currentRaised: payload.currentRaised,
        brandVision: payload.brandVision,
      },
      {
        ...options,
        mode: payload.mode || 'eco',
      }
    );

    if (result && result.vision) {
      return {
        vision: result.vision,
        purpose: result.purpose || `חיבור ושיתוף פעולה בקהילת ${payload.communityName}`,
        tagline: result.tagline || 'יחד יוצרים השפעה אמיתית',
        suggestedTiers: result.suggestedTiers || [
          { name: 'תומך קהילה', amount: 180, description: 'שותפות בסיסית בפעילות' },
          { name: 'שגריר מוביל', amount: 500, description: 'מעורבות והשפעה קהילתית' },
          { name: 'עמית כבוד', amount: 1800, description: 'שותפות אסטרטגית בהובלה' },
        ],
      };
    }
  } catch (err) {
    console.warn('[togetherCopilotService] Community vision AI dispatch failed, using fallback:', err);
  }

  return {
    vision: `קהילת ${payload.communityName} מהווה בית חם ומקור של עוצמה, שיתוף פעולה וצמיחה הדדית עבור כל חבריה. יחד נפעל להשגת יעדינו המשותפים.`,
    purpose: `חיבור שותפים ושגרירים להשגת יעדים משותפים תחת קהילת ${payload.communityName}.`,
    tagline: 'יחד צומחים, יחד משפיעים',
    suggestedTiers: [
      { name: 'תומך קהילה', amount: 180, description: 'שותפות בסיסית בפעילות' },
      { name: 'שגריר מוביל', amount: 500, description: 'מעורבות והשפעה קהילתית' },
      { name: 'עמית כבוד', amount: 1800, description: 'שותפות אסטרטגית בהובלה' },
    ],
  };
}

/**
 * Drafts community WhatsApp broadcast messages or polls via KOSAI
 */
export async function draftCommunityBroadcastMessage(
  payload: DraftCommunityBroadcastRequest,
  options?: KosaiTogetherDispatchOptions
): Promise<TogetherBroadcastDraftResult> {
  try {
    const result: TogetherBroadcastDraftResult = await dispatchCommunityBroadcastToKosai(
      {
        groupName: payload.groupName,
        topic: payload.topic,
        tone: payload.tone,
        isPoll: payload.isPoll,
      },
      options
    );

    if (result && result.messageText) {
      return result;
    }
  } catch (err) {
    console.warn('[togetherCopilotService] Broadcast AI dispatch failed, using fallback:', err);
  }

  return {
    messageText: `שלום {{שם}},\nשמחים לעדכן אותך בפעילות קהילת {{קהילה}} בנושא: ${payload.topic}.\nלפרטים נוספים והצטרפות היכנסו: {{קישור_אישי}}`,
    isPoll: Boolean(payload.isPoll),
    pollQuestion: payload.isPoll ? `מה דעתכם בנושא ${payload.topic}?` : undefined,
    pollOptions: payload.isPoll ? ['תומך מאוד', 'מעוניין בפרטים נוספים', 'אשמח להצטרף'] : undefined,
    callToAction: 'השיבו ישירות להודעה זו',
  };
}

/**
 * Suggests community growth and engagement action items via KOSAI
 */
export async function suggestCommunityGrowth(
  payload: SuggestCommunityGrowthRequest,
  options?: KosaiTogetherDispatchOptions
): Promise<TogetherGrowthInsightResult> {
  try {
    const result: TogetherGrowthInsightResult = await dispatchCommunityGrowthToKosai(
      {
        groupName: payload.groupName,
        memberCount: payload.memberCount,
        currentRaised: payload.currentRaised,
        targetGoal: payload.targetGoal,
      },
      options
    );

    if (result && result.summary) {
      return result;
    }
  } catch (err) {
    console.warn('[togetherCopilotService] Growth AI dispatch failed, using fallback:', err);
  }

  return {
    summary: `בקהילת ${payload.groupName} יש כעת ${payload.memberCount} חברים פעילים. קיים פוטנציאל להרחבת המעורבות.`,
    score: 80,
    actionItems: [
      'שלח הודעת תודה אישית לחברים שהצטרפו לאחרונה',
      'צור סקר קצר בוואטסאפ לבירור תחומי העניין המובילים',
      'הגדר מפגש מקוון או שיחת עדכון חודשית עם השגרירים',
    ],
    recommendedRules: ['הוסף חברים נוספים על בסיס תרומות עבר מעל 500 ₪'],
  };
}
