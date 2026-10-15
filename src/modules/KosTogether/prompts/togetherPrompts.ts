/**
 * KOSAI AI Prompts - KosTogether / Communities & Groups Hub
 * Ultra-lean, token-efficient prompt templates (< 70 words each).
 * Returns strict, validated JSON without conversational filler.
 */

export interface SmartRulesPromptInput {
  naturalLanguageQuery: string;
  availableCities?: string[];
}

export interface CommunityVisionPromptInput {
  communityName: string;
  theme?: string;
  targetGoal?: number;
  currentRaised?: number;
  brandVision?: string;
}

export interface CommunityBroadcastPromptInput {
  groupName: string;
  topic: string;
  tone?: string;
  isPoll?: boolean;
}

export interface CommunityGrowthPromptInput {
  groupName: string;
  memberCount: number;
  currentRaised?: number;
  targetGoal?: number;
}

/**
 * Builds lean prompt to convert natural language into smart community filter rules.
 * Word count: ~45 words.
 */
export const BUILD_SMART_RULES_PROMPT = (input: SmartRulesPromptInput): string => `
תרגם שאילתת סינון בעברית לחוקי פילוח קבוצה: "${input.naturalLanguageQuery.trim()}".
ערים קיימות: ${input.availableCities?.slice(0, 10).join(', ') || 'ללא'}.
שדות מותרים: total_spent, campaign_amount, order_count, lead_source, gender, mh_crm_city, company_name, job_title, tags, status, has_phone, has_email.
אופרטורים: gte, lte, eq, contains, exists, not_exists.
החזר אך ורק JSON:
{
  "rules": [{"field": "...", "operator": "...", "value": "..."}],
  "matchType": "all",
  "suggestedName": "שם קצר לקבוצה",
  "suggestedColor": "#4f46e5",
  "description": "תיאור של משפט אחד"
}
`.trim();

/**
 * Builds lean prompt to generate community vision, purpose, and contribution tiers.
 * Word count: ~40 words.
 */
export const BUILD_COMMUNITY_VISION_PROMPT = (input: CommunityVisionPromptInput): string => `
נסח חזון ומטרות עבור קהילת "${input.communityName}".
נושא: ${input.theme || 'קהילת שגרירים ופעילות'}.
${input.brandVision ? `חזון מותג מנחה: "${input.brandVision}".` : ''}
${input.targetGoal ? `יעד גיוס: ₪${input.targetGoal.toLocaleString()}.` : ''}
החזר אך ורק JSON:
{
  "vision": "חזון ממוקד עד 3 פסקאות קצרות",
  "purpose": "מטרת הקהילה ב-2 משפטים",
  "tagline": "סלוגן קצר ומעורר השראה",
  "suggestedTiers": [
    {"name": "רמת כניסה", "amount": 180, "description": "תמיכה בסיסית"},
    {"name": "שותף פעיל", "amount": 500, "description": "שותפות והשפעה"},
    {"name": "שגריר זהב", "amount": 1800, "description": "הובלה והכרה"}
  ]
}
`.trim();

/**
 * Builds lean prompt to draft community WhatsApp broadcast message or poll.
 * Word count: ~40 words.
 */
export const BUILD_COMMUNITY_BROADCAST_PROMPT = (input: CommunityBroadcastPromptInput): string => `
נסח הודעת וואטסאפ לקהילת "${input.groupName}".
נושא: ${input.topic}.
טון: ${input.tone || 'חם, סוחף ומכבד'}.
שלב תגיות דינמיות: {{שם}}, {{קהילה}}, {{קישור_אישי}}.
${input.isPoll ? 'כלול שאלת סקר עם 3-4 אפשרויות בחירה.' : ''}
החזר אך ורק JSON:
{
  "messageText": "טקסט ההודעה הקצר והקולע",
  "isPoll": ${Boolean(input.isPoll)},
  "pollQuestion": "שאלת הסקר (אם נדרש)",
  "pollOptions": ["אפשרות 1", "אפשרות 2", "אפשרות 3"],
  "callToAction": "הנעה קצרה לפעולה"
}
`.trim();

/**
 * Builds lean prompt for community growth and engagement action items.
 * Word count: ~35 words.
 */
export const BUILD_COMMUNITY_GROWTH_PROMPT = (input: CommunityGrowthPromptInput): string => `
נתח מדדי צמיחה לקהילת "${input.groupName}":
חברים: ${input.memberCount}.
${input.targetGoal ? `יעד: ₪${input.targetGoal}, נאסף: ₪${input.currentRaised || 0}.` : ''}
החזר אך ורק JSON:
{
  "summary": "ניתוח מצב של 2 משפטים",
  "score": 85,
  "actionItems": ["פעולת צמיחה 1", "פעולת צמיחה 2", "פעולת צמיחה 3"],
  "recommendedRules": ["תנאי סינון מומלץ להגדלת הקהילה"]
}
`.trim();
