import masterCopyJson from './data/kosun_copy_master.json';

/**
 * המרת קוד צבע הקסדצימלי לשם צבע אנושי ויוקרתי בעברית למשתמש
 */
export function getHumanColorName(hex: string): string {
  if (!hex) return 'ציאן ניאון עתידני';
  const clean = hex.toUpperCase().replace('#', '');
  
  if (clean === '00F0FF' || clean === '00FFFF' || clean.includes('00F')) return 'ציאן ניאון עתידני';
  if (clean === 'EAB308' || clean === 'CA8A04' || clean === 'F59E0B' || clean.includes('EAB') || clean.includes('GOLD')) return 'זהב וענבר יוקרתי';
  if (clean === '38BDF8' || clean === '0284C7' || clean === '0EA5E9' || clean.includes('SKY')) return 'כחול נייבי מנהלתי';
  if (clean === '10B981' || clean === '059669' || clean.includes('EMERALD')) return 'אמרלד ושלווה טבעית';
  if (clean === 'EC4899' || clean === 'F43F5E' || clean.includes('PINK') || clean.includes('ROSE')) return 'ורוד פנינה וזוהר';
  if (clean === '8B5CF6' || clean === 'A855F7' || clean.includes('PURPLE')) return 'סגול עמוק ומלכותי';
  
  return 'ציאן ניאון עתידני';
}

/**
 * המרת מזהה ארכיטיפ לשם שוק בעברית רהוטה
 */
export function getHumanArchetypeName(archetypeId: string): string {
  const norm = (archetypeId || 'saas').toLowerCase();
  switch (norm) {
    case 'saas':
    case 'saas_productivity':
      return 'פרודוקטיביות וטכנולוגיה';
    case 'automotive':
      return 'רכבי יוקרה ומוטוריקה';
    case 'beauty':
    case 'beauty_clinic':
      return 'קוסמטיקה ואסתטיקה קלינית';
    case 'real_estate':
      return 'נדל״ן והשקעות פרימיום';
    case 'legal':
      return 'משפטים וייעוץ מומחים';
    case 'community':
      return 'קהילה וחינוך';
    default:
      return 'עסקים וחדשנות';
  }
}

/**
 * היררכיית מילון מונחים תלת-שכבתית:
 * 1. מערכת (System Default) - ברירת מחדל אוניברסלית
 * 2. סגנון / שיווק (Market Archetype) - מותאם לתחום השוק (רכב, נדל״ן, קוסמטיקה, פרודוקטיביות וכו')
 * 3. מיתוג טננט (Tenant Brand) - דריסת הטננט האינדיבידואלי
 */

export interface PageTerminologyItem {
  id: string;                      // מזהה המונח (למשל: 'capsule_prompt_hint')
  areaId: string;                  // מזהה האזור בעמוד (למשל: 'top_ai_capsule')
  pageId: 'home' | 'exploration' | 'catalog' | 'branches' | 'owner' | 'global';
  systemDefault: string;           // ברירת מחדל של המערכת
  archetypeOverrides?: Record<string, string>; // סגנון לפי שוק/ארכיטיפ (automotive, saas, beauty, real_estate, etc.)
  tenantOverride?: string;         // דריסה פרטנית של הטננט
}

export interface PageDictionaryCollection {
  pageId: string;
  terms: Record<string, PageTerminologyItem>;
}

/**
 * 📚 מילון המונחים המלא של KOSUN 2026
 * נשאב ישירות מקובץ המאסטר kosun_copy_master.json (Single Source of Truth)
 */
export const KOSUN_PAGE_DICTIONARY: Record<string, PageTerminologyItem> = masterCopyJson.terms as any;

/**
 * שליפת מטא-דאטה של קולקציית הקופי
 */
export function getCopyMasterMetadata() {
  return masterCopyJson._metadata;
}

/**
 * מנוע שליפת מונח דינמי לפי היררכיה:
 * 1. בדיקת דריסת טננט (אם קיימת ב-tenantProfile.customDictionary)
 * 2. בדיקת דריסת סגנון שוק / ארכיטיפ (automotive, saas, beauty וכו')
 * 3. ברירת מחדל של המערכת מתוך קובץ ה-JSON המרכזי
 */
export function getTerminology(
  termId: string,
  archetypeId: string = 'saas',
  tenantCustomDict?: Record<string, string>
): string {
  // 1. דריסת טננט אינדיבידואלי (Firestore: tenants/{tenantId}.customDictionary)
  if (tenantCustomDict && tenantCustomDict[termId]) {
    return tenantCustomDict[termId];
  }

  const term = KOSUN_PAGE_DICTIONARY[termId];
  if (!term) return termId;

  // 2. דריסת סגנון שוק / ארכיטיפ (automotive, saas, beauty, real_estate, etc.)
  const normalizedArch = (archetypeId || 'saas').toLowerCase();
  if (term.archetypeOverrides && term.archetypeOverrides[normalizedArch]) {
    return term.archetypeOverrides[normalizedArch];
  }

  // 3. ברירת מחדל של המערכת מתוך ה-JSON
  return term.systemDefault;
}
