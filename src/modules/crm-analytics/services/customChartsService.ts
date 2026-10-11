import { FirebaseApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, getDocs, deleteDoc, query, orderBy 
} from 'firebase/firestore';
import { CustomCrmChart, Contact } from '../types';

export const OFFICIAL_GEMINI_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.8-flash-lite',
  'gemini-3.5-flash-lite',
] as const;

/**
 * Intelligent local NLP heuristic fallback when external Gemini API is unreachable,
 * returns HTTP 404/402 (quota/billing), or when no key is configured.
 */
export function parseChartFromPromptHeuristically(prompt: string): Omit<CustomCrmChart, 'id' | 'createdAt'> {
  const p = (prompt || '').toLowerCase().trim();

  // 1. Detect Chart Type
  let type: 'bar' | 'pie' | 'line' | 'area' = 'bar';
  if (p.includes('עוגה') || p.includes('פאי') || p.includes('pie') || p.includes('אחוזים')) {
    type = 'pie';
  } else if (p.includes('קו') || p.includes('מגמה') || p.includes('line') || p.includes('זמן')) {
    type = 'line';
  } else if (p.includes('שטח') || p.includes('אזור') || p.includes('area')) {
    type = 'area';
  }

  // 2. Detect Metric (Count vs Sum)
  let metric: 'count' | 'sum' = 'count';
  let metricField: string | undefined = undefined;
  if (
    p.includes('הכנסה') || p.includes('הכנסות') || p.includes('סכום') || 
    p.includes('כסף') || p.includes('רכישות') || p.includes('שקל') || 
    p.includes('ש"ח') || p.includes('תשלום') || p.includes('תקבולים') ||
    p.includes('sum') || p.includes('שווי')
  ) {
    metric = 'sum';
    metricField = 'total_spent';
  }

  // 3. Detect Group By Field
  let groupByField = 'tags';
  let groupLabel = 'תגיות';

  if (p.includes('עיר') || p.includes('ערים') || p.includes('מגורים') || p.includes('מיקום') || p.includes('ישוב') || p.includes('city')) {
    groupByField = 'city';
    groupLabel = 'ערים';
  } else if (p.includes('קהיל') || p.includes('קבוצ') || p.includes('community') || p.includes('group')) {
    groupByField = 'community';
    groupLabel = 'קהילות וקבוצות';
  } else if (p.includes('מקור') || p.includes('קמפיין') || p.includes('ליד') || p.includes('הגעה') || p.includes('source')) {
    groupByField = 'lead_source';
    groupLabel = 'מקורות הגעה';
  } else if (p.includes('סטטוס') || p.includes('מצב') || p.includes('פעיל') || p.includes('status')) {
    groupByField = 'status';
    groupLabel = 'סטטוס לקוח';
  } else if (p.includes('מגדר') || p.includes('מין') || p.includes('נשים') || p.includes('גברים') || p.includes('gender')) {
    groupByField = 'gender';
    groupLabel = 'מגדר';
  } else if (p.includes('סוג') || p.includes('טיפוס') || p.includes('contact_type')) {
    groupByField = 'contact_type';
    groupLabel = 'סוג איש קשר';
  } else if (p.includes('רכישות') || p.includes('הוצאות') || p.includes('total_spent')) {
    groupByField = 'total_spent';
    groupLabel = 'היקף רכישות';
  }

  // 4. Generate Title
  const title = metric === 'sum' 
    ? `סך הכנסות לפי ${groupLabel}`
    : `פילוח אנשי קשר לפי ${groupLabel}`;

  return {
    title,
    type,
    groupByField,
    metric,
    metricField,
    description: prompt,
    createdBy: 'ai',
  };
}

export async function fetchCustomCharts(
  firebaseApp?: FirebaseApp,
  tenantId: string = '_master'
): Promise<CustomCrmChart[]> {
  const localKey = `kosun_${tenantId}_custom_charts`;
  let localCharts: CustomCrmChart[] = [];
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) localCharts = JSON.parse(raw);
  } catch {}

  if (!firebaseApp) return localCharts;

  try {
    const db = getFirestore(firebaseApp);
    const colRef = collection(db, `tenants/${tenantId}/crm_custom_charts`);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const charts: CustomCrmChart[] = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      } as CustomCrmChart));
      try {
        localStorage.setItem(localKey, JSON.stringify(charts));
      } catch {}
      return charts;
    }
  } catch (err) {
    console.warn('[CustomChartsService] Firestore fetch notice:', err);
  }

  return localCharts;
}

export async function saveCustomChart(
  chart: CustomCrmChart,
  firebaseApp?: FirebaseApp,
  tenantId: string = '_master'
): Promise<void> {
  const localKey = `kosun_${tenantId}_custom_charts`;
  try {
    const existing = await fetchCustomCharts(firebaseApp, tenantId);
    const updated = [chart, ...existing.filter(c => c.id !== chart.id)];
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch {}

  if (firebaseApp) {
    try {
      const db = getFirestore(firebaseApp);
      const docRef = doc(db, `tenants/${tenantId}/crm_custom_charts`, chart.id);
      await setDoc(docRef, chart, { merge: true });
    } catch (err) {
      console.warn('[CustomChartsService] Firestore save error:', err);
    }
  }
}

export async function deleteCustomChart(
  chartId: string,
  firebaseApp?: FirebaseApp,
  tenantId: string = '_master'
): Promise<void> {
  const localKey = `kosun_${tenantId}_custom_charts`;
  try {
    const existing = await fetchCustomCharts(firebaseApp, tenantId);
    const updated = existing.filter(c => c.id !== chartId);
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch {}

  if (firebaseApp) {
    try {
      const db = getFirestore(firebaseApp);
      const docRef = doc(db, `tenants/${tenantId}/crm_custom_charts`, chartId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('[CustomChartsService] Firestore delete error:', err);
    }
  }
}

export async function generateChartWithGeminiAI(
  prompt: string,
  apiKey: string
): Promise<Omit<CustomCrmChart, 'id' | 'createdAt'>> {
  const cleanKey = (apiKey || '').trim();
  if (!cleanKey || cleanKey.length < 5) {
    console.info('[CustomChartsService] No Gemini API key provided, falling back to local NLP heuristic parser.');
    return parseChartFromPromptHeuristically(prompt);
  }

  const systemInstruction = `
אתה סוכן אנליטיקה ו-BI בכיר במערכת קושאן CRM (שנת 2026).
תפקידך: להמיר בקשות משתמש בעברית להגדרות גרף Recharts מדויקות.

השדות הזמינים לפילוח (groupByField):
- "city": עיר מגורים
- "tags": תגיות אנשי קשר
- "community": קהילה / קבוצה
- "lead_source": מקור הגעה / קמפיין
- "status": סטטוס (active, lead, new)
- "contact_type": סוג (איש קשר / ליד)
- "gender": מגדר (זכר / נקבה)
- "total_spent": סכום רכישות

סוגי גרפים נתמכים (type): "bar" (עמודות), "pie" (עוגה), "line" (קו), "area" (שטח).
סוגי מדדים נתמכים (metric): "count" (כמות רשומות), "sum" (סכום כספי).

עליך להחזיר JSON תקין בלבד בפורמט:
{
  "title": "כותרת הגרף בעברית",
  "type": "bar" | "pie" | "line" | "area",
  "groupByField": "city" | "tags" | "community" | "lead_source" | "status" | "contact_type" | "total_spent",
  "metric": "count" | "sum",
  "metricField": "total_spent" או "count",
  "description": "הסבר תמציתי על הגרף"
}
`;

  let lastError: any = null;

  for (const model of OFFICIAL_GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [{ role: 'user', parts: [{ text: `הגדר גרף עבור הבקשה הבאה: "${prompt}"` }] }],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('תשובה ריקה מהמודל');

      const parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());
      return {
        title: parsed.title || 'גרף אנליטי מותאם אישית',
        type: ['bar', 'pie', 'line', 'area'].includes(parsed.type) ? parsed.type : 'bar',
        groupByField: parsed.groupByField || 'tags',
        metric: parsed.metric === 'sum' ? 'sum' : 'count',
        metricField: parsed.metricField || (parsed.metric === 'sum' ? 'total_spent' : undefined),
        description: parsed.description || prompt,
        createdBy: 'ai',
      };
    } catch (err: any) {
      lastError = err;
      console.warn(`[CustomChartsService] Fallback: Model ${model} failed (${err?.message || err}), trying next model...`);
    }
  }

  console.warn('[CustomChartsService] All Gemini models failed or quota exceeded. Falling back to local NLP heuristic parser:', lastError);
  return parseChartFromPromptHeuristically(prompt);
}

export function computeChartSeries(chart: CustomCrmChart, contacts: Contact[]) {
  const map: Record<string, number> = {};

  contacts.forEach(c => {
    let keyVal = (c as any)[chart.groupByField];
    if (chart.groupByField === 'tags') {
      const tags = Array.isArray(c.tags) ? c.tags : (c.tags ? [String(c.tags)] : ['ללא תגית']);
      tags.forEach(t => {
        const val = chart.metric === 'sum' ? (Number(c.total_spent) || 0) : 1;
        map[t] = (map[t] || 0) + val;
      });
      return;
    }

    if (!keyVal) {
      keyVal = 'לא צוין';
    }

    const inc = chart.metric === 'sum' ? (Number(c.total_spent) || 0) : 1;
    map[String(keyVal)] = (map[String(keyVal)] || 0) + inc;
  });

  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}
