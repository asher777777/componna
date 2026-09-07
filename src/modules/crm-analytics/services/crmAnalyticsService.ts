import { FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc, 
  writeBatch 
} from 'firebase/firestore';
import { 
  Contact, 
  CRMAnalyticsFilter, 
  CRMAnalyticsData, 
  CustomField, 
  SavedAnalyticsView 
} from '../types';
import { DEFAULT_COLLECTIONS } from '../config';

// Robust date parser for dates in diverse formats (dd/mm/yyyy, ISO, Timestamp)
export function parseDateToTime(val: any): number | null {
  if (!val) return null;
  if (val instanceof Date) return val.getTime();
  if (typeof val === 'object' && typeof val.seconds === 'number') {
    return val.seconds * 1000;
  }
  if (typeof val === 'object' && typeof val._seconds === 'number') {
    return val._seconds * 1000;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return null;
    if (/^\d{2}\/\d{2}\/\d{4}/.test(trimmed)) {
      const parts = trimmed.split(/[\/\-]/);
      if (parts.length >= 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parseInt(parts[2], 10);
        const dateObj = new Date(y, m, d);
        if (!isNaN(dateObj.getTime())) return dateObj.getTime();
      }
    }
    const parsed = Date.parse(trimmed);
    if (!isNaN(parsed)) return parsed;
  }
  return null;
}

// Generate realistic mock data for standalone workbench demo
export function generateMockCrmData(): Contact[] {
  return [
    {
      id: 'c1',
      status: 'active',
      conta_name: 'ישראל ישראלי',
      conta_phone: '050-1234567',
      email: 'israel@example.com',
      gender: 'זכר',
      mh_crm_city: 'תל אביב',
      mh_crm_street: 'רוטשילד 10',
      company_name: 'טכנולוגיות בע"מ',
      job_title: 'סמנכ"ל טכנולוגיות',
      lead_source: 'פייסבוק / רשתות',
      tags: ['לקוח VIP', 'וובינר 2026'],
      community: 'קהילת מפתחים',
      total_spent: 4500,
      order_count: 3,
      campaign_title: 'קמפיין אביב 2026',
      campaign_amount: 1200,
      last_form_name: 'טופס יצירת קשר ראשי',
      last_form_submission_date: '2026-08-15',
      createdAt: '2026-01-10',
    },
    {
      id: 'c2',
      status: 'active',
      conta_name: 'שרה כהן',
      conta_phone: '052-7654321',
      email: 'sara.cohen@example.com',
      gender: 'נקבה',
      mh_crm_city: 'ירושלים',
      mh_crm_street: 'יפו 45',
      company_name: 'סטודיו לעיצוב',
      job_title: 'מנהלת קריאייטיב',
      lead_source: 'המלצה / שגריר',
      tags: ['מתעניין מוביל', 'שגריר'],
      community: 'קהילת מעצבים',
      total_spent: 8900,
      order_count: 7,
      campaign_title: 'קמפיין שנתי',
      campaign_amount: 3500,
      last_form_name: 'הרשמה לקורס מתקדם',
      last_form_submission_date: '2026-08-28',
      createdAt: '2026-02-14',
    },
    {
      id: 'c3',
      status: 'active',
      conta_name: 'דוד לוי',
      conta_phone: '054-9876543',
      email: 'david.levi@example.com',
      gender: 'זכר',
      mh_crm_city: 'חיפה',
      mh_crm_street: 'הנשיא 12',
      company_name: 'לוי ושותפין',
      job_title: 'מנכ"ל',
      lead_source: 'גוגל אורגני',
      tags: ['לקוח VIP', 'בוגר קורס'],
      community: 'קהילת יזמים',
      total_spent: 12400,
      order_count: 5,
      campaign_title: 'קמפיין אביב 2026',
      campaign_amount: 5000,
      last_form_name: 'שאלון התאמה עסקית',
      last_form_submission_date: '2026-09-01',
      createdAt: '2025-11-20',
    },
    {
      id: 'c4',
      status: 'active',
      conta_name: 'מיכל אברהם',
      conta_phone: '053-1122334',
      email: 'michal.a@example.com',
      gender: 'נקבה',
      mh_crm_city: 'באר שבע',
      mh_crm_street: 'רגר 88',
      company_name: 'אקדמיה',
      job_title: 'חוקרת',
      lead_source: 'לינקדאין',
      tags: ['מתעניין מוביל'],
      community: 'קהילת אקדמיה',
      total_spent: 650,
      order_count: 1,
      campaign_amount: 0,
      last_form_name: 'הורדת מדריך דיגיטלי',
      last_form_submission_date: '2026-09-05',
      createdAt: '2026-07-01',
    },
    {
      id: 'c5',
      status: 'active',
      conta_name: 'יוסי פרידמן',
      conta_phone: '058-4455667',
      email: 'yossi.f@example.com',
      gender: 'זכר',
      mh_crm_city: 'רעננה',
      mh_crm_street: 'אחוזה 120',
      company_name: 'פרידמן פתרונות',
      job_title: 'מנהל תפעול',
      lead_source: 'פייסבוק / רשתות',
      tags: ['וובינר 2026'],
      community: 'קהילת מפתחים',
      total_spent: 2100,
      order_count: 2,
      campaign_amount: 500,
      last_form_name: 'טופס יצירת קשר ראשי',
      last_form_submission_date: '2026-08-20',
      createdAt: '2026-05-18',
    }
  ];
}

export function computeAnalyticsMetrics(
  contacts: Contact[], 
  customFields: CustomField[] = [], 
  filter?: CRMAnalyticsFilter
): CRMAnalyticsData {
  let filteredContacts = [...contacts];

  // Filter by status
  if (filter?.status && filter.status !== 'all') {
    filteredContacts = filteredContacts.filter(c => c.status === filter.status);
  }

  // Filter by Date Range
  if (filter?.startDate || filter?.endDate) {
    const start = filter.startDate ? parseDateToTime(filter.startDate) ?? 0 : 0;
    const end = filter.endDate ? (parseDateToTime(filter.endDate + 'T23:59:59.999Z') ?? Infinity) : Infinity;

    filteredContacts = filteredContacts.filter(c => {
      const dateVal = c.createdAt || c.updatedAt || c.last_form_submission_date || c.last_order_date;
      const time = parseDateToTime(dateVal);
      if (time === null) return true;
      return time >= start && time <= end;
    });
  }

  // Filter by Source
  if (filter?.source) {
    filteredContacts = filteredContacts.filter(c => c.lead_source === filter.source);
  }

  // Filter by Tag
  if (filter?.tag) {
    filteredContacts = filteredContacts.filter(c => {
      const allTags = [...(Array.isArray(c.tags) ? c.tags : []), c.tg1, c.tg2, c.tg3].filter(Boolean);
      return allTags.includes(filter.tag!);
    });
  }

  // Filter by Community
  if (filter?.community) {
    filteredContacts = filteredContacts.filter(c => 
      c.community === filter.community || 
      c.mh_crm_community === filter.community ||
      (Array.isArray(c.tags) && c.tags.includes(filter.community!))
    );
  }

  // Filter by Form
  if (filter?.form) {
    filteredContacts = filteredContacts.filter(c => 
      c.last_form_name === filter.form ||
      (Array.isArray(c.form_submissions) && c.form_submissions.some(fs => fs.name === filter.form))
    );
  }

  // Filter by Search Term
  if (filter?.searchTerm) {
    const term = filter.searchTerm.toLowerCase().trim();
    filteredContacts = filteredContacts.filter(c => 
      (c.conta_name && c.conta_name.toLowerCase().includes(term)) ||
      (c.conta_phone && c.conta_phone.includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.company_name && c.company_name.toLowerCase().includes(term)) ||
      (c.mh_crm_city && c.mh_crm_city.toLowerCase().includes(term))
    );
  }

  let totalSpent = 0;
  let totalCampaignAmount = 0;
  const tagsCount: Record<string, number> = {};
  const leadSourcesCount: Record<string, number> = {};
  const communitiesCount: Record<string, number> = {};
  const formsCount: Record<string, number> = {};
  const numericFieldsAgg: Record<string, any> = {};
  const textFieldsAgg: Record<string, Record<string, number>> = {};

  filteredContacts.forEach(c => {
    // Total Spent
    const spent = Number(c.total_spent || 0);
    if (!isNaN(spent)) totalSpent += spent;

    // Campaign Amount
    const camp = Number(c.campaign_amount || 0);
    if (!isNaN(camp)) totalCampaignAmount += camp;

    // Tags
    const allTags = [...(Array.isArray(c.tags) ? c.tags : []), c.tg1, c.tg2, c.tg3];
    allTags.forEach(t => {
      if (t && typeof t === 'string' && t.trim()) {
        const tr = t.trim();
        tagsCount[tr] = (tagsCount[tr] || 0) + 1;
      }
    });

    // Communities
    const comm = c.community || c.mh_crm_community;
    if (comm && typeof comm === 'string' && comm.trim()) {
      const trimmedComm = comm.trim();
      communitiesCount[trimmedComm] = (communitiesCount[trimmedComm] || 0) + 1;
    }

    // Lead Sources & City
    if (c.lead_source && typeof c.lead_source === 'string' && c.lead_source.trim()) {
      const src = c.lead_source.trim();
      leadSourcesCount[src] = (leadSourcesCount[src] || 0) + 1;
    } else if (c.mh_crm_city && typeof c.mh_crm_city === 'string' && c.mh_crm_city.trim()) {
      const city = `עיר: ${c.mh_crm_city.trim()}`;
      leadSourcesCount[city] = (leadSourcesCount[city] || 0) + 1;
    }

    // Forms
    if (c.last_form_name && typeof c.last_form_name === 'string' && c.last_form_name.trim()) {
      const fn = c.last_form_name.trim();
      formsCount[fn] = (formsCount[fn] || 0) + 1;
    }
    if (Array.isArray(c.form_submissions)) {
      c.form_submissions.forEach(fs => {
        if (fs?.name && typeof fs.name === 'string' && fs.name.trim()) {
          const fn = fs.name.trim();
          formsCount[fn] = (formsCount[fn] || 0) + 1;
        }
      });
    }

    // Custom Fields aggregation
    customFields.forEach(cf => {
      const val = c[cf.id];
      if (val !== undefined && val !== null && val !== '') {
        if (cf.type === 'number' || typeof val === 'number') {
          const num = Number(val);
          if (!numericFieldsAgg[cf.label || cf.id]) {
            numericFieldsAgg[cf.label || cf.id] = { sum: 0, count: 0, entries: [] };
          }
          numericFieldsAgg[cf.label || cf.id].sum += num;
          numericFieldsAgg[cf.label || cf.id].count += 1;
          numericFieldsAgg[cf.label || cf.id].entries.push({
            contactId: c.id || '',
            parentName: c.conta_name || '',
            phone: c.conta_phone || '',
            totalSpent: Number(c.total_spent || 0),
            hasPaid: Number(c.total_spent || 0) > 0,
            value: num,
          });
        } else if (typeof val === 'string' && val.length < 50) {
          if (!textFieldsAgg[cf.label || cf.id]) {
            textFieldsAgg[cf.label || cf.id] = {};
          }
          textFieldsAgg[cf.label || cf.id][val] = (textFieldsAgg[cf.label || cf.id][val] || 0) + 1;
        }
      }
    });
  });

  return {
    totalContacts: filteredContacts.length,
    totalSpent,
    totalCampaignAmount,
    tagsCount,
    leadSourcesCount,
    communitiesCount,
    formsCount,
    numericFieldsAgg,
    textFieldsAgg,
    contacts: filteredContacts,
    customFields,
  };
}

export async function fetchLiveCrmAnalytics(
  firebaseApp?: FirebaseApp,
  ownerId?: string,
  filter?: CRMAnalyticsFilter,
  collections = DEFAULT_COLLECTIONS
): Promise<CRMAnalyticsData> {
  if (!firebaseApp) {
    // Fallback to rich mock data
    return computeAnalyticsMetrics(generateMockCrmData(), [], filter);
  }

  try {
    const db = getFirestore(firebaseApp);
    const contactsRef = collection(db, collections.contacts);
    
    let q = query(contactsRef);
    if (ownerId) {
      q = query(contactsRef, where('ownerId', '==', ownerId));
    }

    const snapshot = await getDocs(q);
    const contacts: Contact[] = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
    } as Contact));

    // Custom fields
    let customFields: CustomField[] = [];
    try {
      const customFieldsRef = collection(db, collections.customFields);
      const cfSnap = await getDocs(customFieldsRef);
      customFields = cfSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      } as CustomField));
    } catch {}

    if (contacts.length === 0) {
      return computeAnalyticsMetrics(generateMockCrmData(), customFields, filter);
    }

    return computeAnalyticsMetrics(contacts, customFields, filter);
  } catch (error) {
    console.warn('Firestore fetch failed, falling back to mock dataset:', error);
    return computeAnalyticsMetrics(generateMockCrmData(), [], filter);
  }
}

export async function updateContactField(
  firebaseApp: FirebaseApp | undefined,
  contactId: string,
  field: string,
  value: any,
  collections = DEFAULT_COLLECTIONS
): Promise<boolean> {
  if (!firebaseApp) {
    console.log(`[Mock Update] Contact ${contactId} -> ${field}:`, value);
    return true;
  }
  try {
    const db = getFirestore(firebaseApp);
    const contactRef = doc(db, collections.contacts, contactId);
    await updateDoc(contactRef, {
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (e) {
    console.error('Failed to update contact field:', e);
    return false;
  }
}
