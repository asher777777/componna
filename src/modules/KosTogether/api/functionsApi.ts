/**
 * API layer for calling secure backend endpoints and Cloud Functions
 */

export interface GenerateSmartGroupRulesRequest {
  naturalLanguageQuery: string;
  availableCities?: string[];
}

export interface GenerateSmartGroupRulesResponse {
  rules: Array<{
    field: string;
    operator: string;
    value: string | number;
  }>;
  matchType: 'all' | 'any';
  suggestedName: string;
  suggestedColor: string;
}

export interface GenerateCommunityVisionRequest {
  communityName: string;
  theme: string;
  targetGoal?: number;
}

export interface GenerateCommunityVisionResponse {
  vision: string;
  purpose: string;
  suggestedTiers: Array<{
    name: string;
    amount: number;
    description: string;
  }>;
}

export async function callSmartRulesAiHelper(
  payload: GenerateSmartGroupRulesRequest
): Promise<GenerateSmartGroupRulesResponse> {
  // Client-side fallback heuristic parser if no Cloud Function backend is configured
  const q = payload.naturalLanguageQuery.toLowerCase();
  const rules: any[] = [];
  let matchType: 'all' | 'any' = 'all';
  let suggestedName = payload.naturalLanguageQuery.trim();

  // Match numbers (e.g., מעל 500 שח, תרמו 1000)
  const amountMatch = q.match(/(\d+)/);
  if (amountMatch && (q.includes('מעל') || q.includes('גדול') || q.includes('תרומ') || q.includes('שח') || q.includes('₪'))) {
    rules.push({
      field: 'total_spent',
      operator: 'gte',
      value: Number(amountMatch[1]),
    });
  }

  // Match city
  if (payload.availableCities) {
    for (const city of payload.availableCities) {
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

  if (q.includes('טלפון') || q.includes('וואטסאפ')) {
    rules.push({
      field: 'has_phone',
      operator: 'exists',
      value: 'true',
    });
  }

  if (q.includes('או ')) {
    matchType = 'any';
  }

  return {
    rules: rules.length > 0 ? rules : [{ field: 'total_spent', operator: 'gte', value: 500 }],
    matchType,
    suggestedName: suggestedName || 'קבוצה חכמה',
    suggestedColor: '#4f46e5',
  };
}
