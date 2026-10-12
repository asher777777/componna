import { Firestore, collection, getDocs, query, limit, where } from 'firebase/firestore';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts/collections';

interface CacheEntry {
  timestamp: number;
  data: string;
}

const groundingCache: Map<string, CacheEntry> = new Map();
const CACHE_TTL_MS = 25000; // 25 seconds cache to balance freshness with speed

export interface GroundingOptions {
  allowedDataSources: string[];
  userQuery?: string;
  maxContactsToInclude?: number;
}

export const kosaiDataGroundingService = {
  /**
   * Fetches real live data from the connected data sources under the tenant scope
   * and builds a detailed, structured, anti-hallucination context block in Hebrew.
   */
  async fetchGroundingContext(
    db: Firestore | undefined,
    tenantId: string | undefined,
    options: GroundingOptions
  ): Promise<string> {
    if (!db || !tenantId || !options.allowedDataSources || options.allowedDataSources.length === 0) {
      return '';
    }

    const cacheKey = `${tenantId}_${options.allowedDataSources.sort().join(',')}_${(options.userQuery || '').trim().toLowerCase()}`;
    const cached = groundingCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    const sections: string[] = [];

    // Helper: query tenant-scoped collection with fallback to root collection
    const queryCollectionSafe = async (collectionName: string, maxDocs = 100) => {
      try {
        const tenantColRef = collection(db, `tenants/${tenantId}/${collectionName}`);
        const snap = await getDocs(query(tenantColRef, limit(maxDocs)));
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
      } catch (err) {
        // Continue to fallback
      }

      try {
        const rootColRef = collection(db, collectionName);
        const rootSnap = await getDocs(query(rootColRef, limit(maxDocs)));
        if (!rootSnap.empty) {
          return rootSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
      } catch (err) {
        // Ignore fallback errors
      }

      return [];
    };

    // 1. CONTACTS & LEADS GROUNDING
    if (options.allowedDataSources.includes(SYSTEM_COLLECTIONS.CONTACTS) || options.allowedDataSources.includes('contacts')) {
      try {
        let contactsRaw = await queryCollectionSafe(SYSTEM_COLLECTIONS.CONTACTS, 150);
        const leadsRaw = await queryCollectionSafe('mod_crm_leads', 100);
        
        // Merge leads that aren't already present
        leadsRaw.forEach((ld: any) => {
          const lData = ld.data || ld;
          if (!contactsRaw.some((c: any) => c.id === ld.id)) {
            contactsRaw.push({
              id: ld.id,
              is_lead: true,
              contact_type: 'lead',
              ...lData
            });
          }
        });
        
        if (contactsRaw.length === 0) {
          sections.push(`
[מאגר לקוחות ולידים (contacts)]:
- סה"כ אנשי קשר במערכת: 0 (המאגר ריק כרגע או שטרם הוזנו לקוחות).
- הנחיה: אם המשתמש שואל לגבי לקוחות, ציין במפורש שבמאגר אין כרגע לקוחות רשומים.
`);
        } else {
          let totalSpent = 0;
          let leadsCount = 0;
          let payingCount = 0;
          const cityMap: Record<string, number> = {};
          const tagMap: Record<string, number> = {};
          const sourceMap: Record<string, number> = {};
          const statusMap: Record<string, number> = {};

          const normalizedContacts = contactsRaw.map((d: any) => {
            const name = d.conta_name || d.fullName || d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'איש קשר';
            const phone = d.conta_phone || d.phone || d.normalizedPhone || d.mobile || '';
            const email = d.email || '';
            const city = d.mh_crm_city || d.city || '';
            const company = d.company_name || d.company || '';
            const isLead = d.is_lead === true || d.contact_type === 'lead';
            const spent = Number(d.total_spent || 0);
            const orders = Number(d.order_count || 0);
            const source = d.lead_source || d.source || 'לא צוין';
            const status = d.status || 'active';
            const tags: string[] = Array.isArray(d.tags) 
              ? d.tags.filter((t: any) => typeof t === 'string' && t.trim()) 
              : [d.tg1, d.tg2, d.tg3].filter((t: any) => typeof t === 'string' && t.trim());

            totalSpent += spent;
            if (isLead) leadsCount++;
            if (spent > 0 || orders > 0) payingCount++;

            if (city) cityMap[city] = (cityMap[city] || 0) + 1;
            if (source) sourceMap[source] = (sourceMap[source] || 0) + 1;
            if (status) statusMap[status] = (statusMap[status] || 0) + 1;
            tags.forEach(t => { tagMap[t] = (tagMap[t] || 0) + 1; });

            return {
              id: d.id,
              name,
              phone,
              email,
              city,
              company,
              isLead,
              spent,
              orders,
              source,
              status,
              tags: tags.join(', '),
              createdAt: d.createdAt || d.created_at || ''
            };
          });

          // Top cities, tags, sources strings
          const topCities = Object.entries(cityMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([c, count]) => `${c} (${count})`)
            .join(', ') || 'אין נתוני ערים';

          const topTags = Object.entries(tagMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([t, count]) => `${t} (${count})`)
            .join(', ') || 'אין תגיות';

          const topSources = Object.entries(sourceMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([s, count]) => `${s} (${count})`)
            .join(', ') || 'אין מקורות הגעה';

          // Relevant contacts matching user search or recent list
          let relevantContacts = normalizedContacts;
          if (options.userQuery && options.userQuery.trim().length > 1) {
            const queryWords = options.userQuery.toLowerCase().split(/\s+/).filter(w => w.length > 1);
            const matches = normalizedContacts.filter(c => {
              const text = `${c.name} ${c.phone} ${c.email} ${c.city} ${c.company} ${c.tags} ${c.source}`.toLowerCase();
              return queryWords.some(w => text.includes(w));
            });
            if (matches.length > 0) {
              relevantContacts = matches;
            }
          }

          const contactsSample = relevantContacts.slice(0, options.maxContactsToInclude || 20).map(c => 
            `- ${c.name} | ${c.isLead ? 'ליד' : 'לקוח'} | טלפון: ${c.phone || '-'} | עיר: ${c.city || '-'} | רכישות: ₪${c.spent.toLocaleString()} | מקור: ${c.source} | תגיות: [${c.tags || 'ללא'}]`
          ).join('\n');

          sections.push(`
[מאגר לקוחות ולידים אמיתי (contacts)]:
- סך הכל אנשי קשר במאגר: ${normalizedContacts.length}
- סך הכל לידים: ${leadsCount}
- סך הכל לקוחות קונים/משלמים: ${payingCount}
- סך הכנסות מצטבר מאנשי קשר: ₪${totalSpent.toLocaleString()}
- התפלגות ערים עיקריות: ${topCities}
- תגיות וסגמנטים מובילים: ${topTags}
- מקורות הגעה נפוצים: ${topSources}

רשימת אנשי קשר מהמאגר (דגימה מייצגת/תוצאות חיפוש מתוך סה"כ ${normalizedContacts.length}):
${contactsSample}
`);
        }
      } catch (err) {
        console.warn('[KosaiGrounding] Contacts grounding error:', err);
      }
    }

    // 2. CRM GROUPS & COMMUNITIES GROUNDING
    if (options.allowedDataSources.includes('crm_groups') || options.allowedDataSources.includes(SYSTEM_COLLECTIONS.GROUPS)) {
      try {
        const groupsRaw = await queryCollectionSafe('crm_groups', 50);
        if (groupsRaw.length === 0) {
          sections.push(`
[מאגר קהילות וקבוצות (crm_groups)]:
- לא קיימות קבוצות במאגר כרגע (0 קבוצות).
`);
        } else {
          const groupsList = groupsRaw.map((g: any) => 
            `- קבוצה: "${g.name || 'ללא שם'}" | חברים: ${g.membersCount || (g.contactIds?.length || 0)} | תיאור: ${g.description || '-'} | קטגוריה: ${g.category || '-'}`
          ).join('\n');

          sections.push(`
[מאגר קהילות וקבוצות אמיתי (crm_groups)]:
- סה"כ קבוצות רשומות: ${groupsRaw.length}
פירוט הקבוצות:
${groupsList}
`);
        }
      } catch (err) {
        console.warn('[KosaiGrounding] Groups grounding error:', err);
      }
    }

    // 3. KESHER TRANSACTIONS & REVENUE GROUNDING
    if (options.allowedDataSources.includes(SYSTEM_COLLECTIONS.KESHER_TRANSACTIONS) || options.allowedDataSources.includes('kesher_transactions')) {
      try {
        const transactionsRaw = await queryCollectionSafe(SYSTEM_COLLECTIONS.KESHER_TRANSACTIONS, 60);
        if (transactionsRaw.length === 0) {
          sections.push(`
[עסקאות ותשלומים (kesher_transactions)]:
- לא נמצאו עסקאות או תשלומים רשומים במאגר כרגע (0 עסקאות).
`);
        } else {
          let totalTxSum = 0;
          transactionsRaw.forEach((t: any) => {
            totalTxSum += Number(t.amount || t.total || 0);
          });

          const sampleTx = transactionsRaw.slice(0, 10).map((t: any) => 
            `- לקוח: ${t.clientName || t.customerName || 'אנונימי'} | סכום: ₪${Number(t.amount || 0).toLocaleString()} | אמצעי תשלום: ${t.paymentMethod || 'אשראי'} | סטטוס: ${t.status || 'הושלם'} | תאריך: ${t.timestamp || t.createdAt || '-'}`
          ).join('\n');

          sections.push(`
[עסקאות ותשלומים אמיתיים (kesher_transactions)]:
- סך הכל עסקאות: ${transactionsRaw.length}
- מחזור עסקאות כולל: ₪${totalTxSum.toLocaleString()}
עסקאות אחרונות מהמאגר:
${sampleTx}
`);
        }
      } catch (err) {
        console.warn('[KosaiGrounding] Transactions grounding error:', err);
      }
    }

    // 4. SMART FORMS & SUBMISSIONS GROUNDING
    if (options.allowedDataSources.includes(SYSTEM_COLLECTIONS.SMART_FORMS) || options.allowedDataSources.includes('mod_forms')) {
      try {
        const formsRaw = await queryCollectionSafe(SYSTEM_COLLECTIONS.SMART_FORMS, 20);
        if (formsRaw.length > 0) {
          const formsList = formsRaw.map((f: any) => 
            `- טופס: "${f.title || f.name || 'ללא כותרת'}" | לידים/שליחות: ${f.submissionsCount || 0} | סטטוס: ${f.status || 'פעיל'}`
          ).join('\n');

          sections.push(`
[טפסים חכמים ושאלונים (smart_forms)]:
- סה"כ טפסים קיימים: ${formsRaw.length}
פירוט הטפסים:
${formsList}
`);
        }
      } catch (err) {
        console.warn('[KosaiGrounding] Smart forms grounding error:', err);
      }
    }

    // 5. PAGES & SITES GROUNDING
    if (options.allowedDataSources.includes(SYSTEM_COLLECTIONS.PAGES) || options.allowedDataSources.includes('mod_pages_documents')) {
      try {
        const pagesRaw = await queryCollectionSafe(SYSTEM_COLLECTIONS.PAGES, 20);
        if (pagesRaw.length > 0) {
          const pagesList = pagesRaw.map((p: any) => 
            `- עמוד: "${p.title || 'ללא כותרת'}" (כתובת /${p.slug || ''}) | ${p.isHomePage ? 'עמוד בית ראשי' : 'עמוד פנימי'} | סטטוס: ${p.isPublished ? 'פורסם' : 'טיוטה'}`
          ).join('\n');

          sections.push(`
[דפי נחיתה ואתרים (pages)]:
- סה"כ עמודים: ${pagesRaw.length}
פירוט העמודים:
${pagesList}
`);
        }
      } catch (err) {
        console.warn('[KosaiGrounding] Pages grounding error:', err);
      }
    }

    if (sections.length === 0) {
      return '';
    }

    const fullGroundingText = `
================================================================================
[נתוני אמת חיים ממאגרי המידע של העסק (LIVE DATABASE GROUNDING - STRICT REALITY)]
הנתונים הבאים נשלפו הרגע ישירות ממסד הנתונים (Firestore) של העסק עבור הטננט: "${tenantId}".
כל תשובה שלך חייבת להיות מבוססת באופן מדויק על נתונים אלו בלבד!
חל איסור מוחלט להמציא לקוחות, שמות, ערים, מספרים, סכומים או קבוצות שלא מופיעים כאן!

${sections.join('\n')}
================================================================================
`;

    groundingCache.set(cacheKey, {
      timestamp: Date.now(),
      data: fullGroundingText
    });

    return fullGroundingText;
  }
};
