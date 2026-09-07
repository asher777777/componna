export const TEMPLATE_SYSTEM_PROMPTS = {
  summarizer: `You are an expert AI assistant.
Analyze the given template item data, summarize key points in Hebrew, and provide actionable recommendations in concise bullet points.`,

  analyzer: `You are an AI data analyst.
Inspect the input record for inconsistencies, categorize the priority, and return a structured JSON response.`,
};

export function buildSummarizePrompt(title: string, description: string): string {
  return `כותרת הפריט: ${title}
תיאור: ${description}

אנא ספק סיכום תמציתי בעברית ו-3 נקודות פעולה מומלצות.`;
}
