import { AiTextAssistantContract, BrandDna } from '../../../core/contracts';

/**
 * KosSubscribed Cloud Functions & AI Assistant API Layer
 * Uses only the core AI authority contract (kosai-engine) - zero direct Gemini calls and zero dummy fallbacks.
 */
export async function generatePackageCopyWithAi(
  aiAssistant: AiTextAssistantContract | null,
  params: {
    packageName: string;
    price: number;
    billingCycle: string;
    brandDna?: BrandDna | null;
  }
): Promise<{ description: string; features: string[]; error?: string }> {
  if (!aiAssistant) {
    return {
      description: '',
      features: [],
      error: 'שירות ה-AI (ai-text-assistant) אינו זמין כעת.',
    };
  }

  const cycleHe =
    params.billingCycle === 'monthly'
      ? 'חודשי'
      : params.billingCycle === 'annual'
      ? 'שנתי'
      : 'חד פעמי';

  const res = await aiAssistant.generateReply({
    systemPrompt:
      'אתה קופירייטר מומחה לבניית חבילות מנויים ותוכן דיגיטלי בעברית. החזר פסקה שיווקית קצרה ומשכנעת ו-3 יתרונות מרכזיים מופרדים בשורות.',
    userMessage: `כתוב תיאור קצר ו-3 יתרונות עבור חבילת מנוי בשם "${params.packageName}" במחיר ${params.price} ש"ח (${cycleHe}).`,
    brandDna: params.brandDna,
  });

  if (res.error || !res.text) {
    return {
      description: '',
      features: [],
      error: res.error || 'לא התקבלה תשובה ממנוע ה-AI.',
    };
  }

  const lines = res.text
    .split('\n')
    .map((l) => l.replace(/^[-*•\d.]+\s*/, '').trim())
    .filter(Boolean);

  return {
    description: lines[0] || '',
    features: lines.slice(1, 5),
  };
}
