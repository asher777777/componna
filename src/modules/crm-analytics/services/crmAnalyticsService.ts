import { FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc,
  setDoc,
  addDoc,
  updateDoc, 
  deleteDoc,
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
import { SYSTEM_COLLECTIONS } from '../../../core/contracts';

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

// Generate realistic mock data for standalone workbench demo (Contacts and Leads)
export function generateMockCrmData(): Contact[] {
  return [
    {
      id: 'c1',
      status: 'active',
      is_lead: false,
      contact_type: 'contact',
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
      is_lead: false,
      contact_type: 'contact',
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
      is_lead: false,
      contact_type: 'contact',
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
      is_lead: false,
      contact_type: 'contact',
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
      is_lead: false,
      contact_type: 'contact',
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
    },
    // Realistic Integrated Leads
    {
      id: 'lead_01',
      status: 'active',
      is_lead: true,
      contact_type: 'lead',
      conta_name: 'יוסי כהן',
      conta_phone: '050-1234567',
      email: 'yossi@techsolutions.demo',
      company_name: 'טק סולושנס בע״מ',
      job_title: 'מנהל טכנולוגיות',
      lead_source: 'קמפיין פייסבוק ממומן',
      tags: ['ליד חדש', 'מתעניין מוביל'],
      community: 'קהילת יזמים',
      total_spent: 0,
      order_count: 0,
      campaign_amount: 0,
      last_form_name: 'טופס יצירת קשר ראשי',
      last_form_submission_date: '2026-09-12',
      createdAt: '2026-09-12',
    },
    {
      id: 'lead_02',
      status: 'active',
      is_lead: true,
      contact_type: 'lead',
      conta_name: 'רונית שפירא',
      conta_phone: '054-3322110',
      email: 'ronit.s@finance-hub.co.il',
      company_name: 'שפירא פיננסים',
      job_title: 'יועצת השקעות',
      lead_source: 'דף נחיתה ראשי',
      tags: ['ליד חם', 'פגישת ייעוץ'],
      community: 'קהילת אקדמיה',
      total_spent: 0,
      order_count: 0,
      campaign_amount: 0,
      last_form_name: 'שאלון התאמה עסקית',
      last_form_submission_date: '2026-09-14',
      createdAt: '2026-09-14',
    },
    {
      id: 'lead_03',
      status: 'active',
      is_lead: true,
      contact_type: 'lead',
      conta_name: 'אביגדור מזרחי',
      conta_phone: '052-9988776',
      email: 'avigdor@mizrahi-group.il',
      company_name: 'מזרחי יזמות',
      job_title: 'סמנכ"ל שיווק',
      lead_source: 'גוגל חיפוש ממומן',
      tags: ['ליד חדש', 'פרויקט CRM'],
      community: 'קהילת מפתחים',
      total_spent: 0,
      order_count: 0,
      campaign_amount: 0,
      last_form_name: 'טופס יצירת קשר ראשי',
      last_form_submission_date: '2026-09-10',
      createdAt: '2026-09-10',
    },
    {
      id: 'lead_04',
      status: 'active',
      is_lead: true,
      contact_type: 'lead',
      conta_name: 'דנה אלון',
      conta_phone: '053-4455221',
      email: 'dana@alonmedia.com',
      company_name: 'אלון מדיה',
      job_title: 'מנהלת קמפיינים',
      lead_source: 'אינסטגרם ממומן',
      tags: ['ליד חם', 'וובינר'],
      community: 'קהילת מעצבים',
      total_spent: 0,
      order_count: 0,
      campaign_amount: 0,
      last_form_name: 'הרשמה לקורס מתקדם',
      last_form_submission_date: '2026-09-13',
      createdAt: '2026-09-13',
    }
  ];
}

export function computeAnalyticsMetrics(
  contacts: Contact[], 
  customFields: CustomField[] = [], 
  filter?: CRMAnalyticsFilter,
  extraGroups: string[] = []
): CRMAnalyticsData {
  let filteredContacts = [...contacts];

  // Filter by status
  if (filter?.status && filter.status !== 'all') {
    filteredContacts = filteredContacts.filter(c => c.status === filter.status);
  }

  // Filter by type: all / contacts / leads
  if (filter?.typeFilter === 'contacts') {
    filteredContacts = filteredContacts.filter(c => !c.is_lead && c.contact_type !== 'lead');
  } else if (filter?.typeFilter === 'leads') {
    filteredContacts = filteredContacts.filter(c => c.is_lead || c.contact_type === 'lead');
  }

  // Filter by metric click (Interactive Metric Cards)
  if (filter?.metricFilter) {
    switch (filter.metricFilter) {
      case 'revenue':
        filteredContacts = filteredContacts.filter(c => Number(c.total_spent || 0) > 0);
        break;
      case 'campaigns':
        filteredContacts = filteredContacts.filter(c => Number(c.campaign_amount || 0) > 0 || Boolean(c.campaign_title));
        break;
      case 'communities':
        filteredContacts = filteredContacts.filter(c => Boolean(c.community || c.mh_crm_community));
        break;
      case 'forms':
        filteredContacts = filteredContacts.filter(c => Boolean(c.last_form_name || (Array.isArray(c.form_submissions) && c.form_submissions.length > 0)));
        break;
      case 'contacts':
      default:
        // Shows all
        break;
    }
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
      (c.mh_crm_city && c.mh_crm_city.toLowerCase().includes(term)) ||
      (c.lead_source && c.lead_source.toLowerCase().includes(term))
    );
  }

  let totalSpent = 0;
  let totalCampaignAmount = 0;
  let totalLeads = 0;
  let totalContactsOnly = 0;
  const tagsCount: Record<string, number> = {};
  const leadSourcesCount: Record<string, number> = {};
  const communitiesCount: Record<string, number> = {};
  const formsCount: Record<string, number> = {};
  const numericFieldsAgg: Record<string, any> = {};
  const textFieldsAgg: Record<string, Record<string, number>> = {};

  filteredContacts.forEach(c => {
    // Check if lead or contact
    if (c.is_lead || c.contact_type === 'lead') {
      totalLeads += 1;
    } else {
      totalContactsOnly += 1;
    }

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

  // Ensure any defined groups from crm_groups are registered in communitiesCount
  extraGroups.forEach(g => {
    if (g && communitiesCount[g] === undefined) {
      communitiesCount[g] = 0;
    }
  });

  return {
    totalContacts: filteredContacts.length,
    totalLeads,
    totalContactsOnly,
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
    return computeAnalyticsMetrics([], [], filter);
  }

  try {
    const db = getFirestore(firebaseApp);
    const contactsRef = collection(db, collections.contacts);
    
    let q = query(contactsRef);
    if (ownerId) {
      q = query(contactsRef, where('ownerId', '==', ownerId));
    }

    let snapshot = await getDocs(q);
    
    // If empty and ownerId was specified, attempt without ownerId filter
    if (snapshot.empty && ownerId) {
      snapshot = await getDocs(query(contactsRef));
    }

    // Fallback: If scoped collection is empty, search root or master contacts
    if (snapshot.empty) {
      try {
        const rootTargetCol = SYSTEM_COLLECTIONS.CONTACTS;
        const rootRef = collection(db, rootTargetCol);

        // Check if we are in a subdomain context (e.g., 'tenants/<subdomain>/contacts')
        const subMatch = collections.contacts.match(/^tenants\/([^/]+)\/contacts$/);
        const currentSub = subMatch && subMatch[1] !== '_master' ? subMatch[1].toLowerCase() : null;

        let fallbackDocs: any[] = [];

        if (currentSub) {
          // 1. In subdomain: try finding contacts tagged with or matching this subdomain in root contacts
          try {
            const rootSubSnap = await getDocs(query(rootRef, where('subdomain', '==', currentSub)));
            if (!rootSubSnap.empty) {
              fallbackDocs.push(...rootSubSnap.docs);
            }
          } catch {}

          // 2. Also check master contacts for this subdomain
          if (fallbackDocs.length === 0) {
            try {
              const masterCol = collection(db, 'tenants', '_master', 'contacts');
              const masterSubSnap = await getDocs(query(masterCol, where('subdomain', '==', currentSub)));
              if (!masterSubSnap.empty) {
                fallbackDocs.push(...masterSubSnap.docs);
              }
            } catch {}
          }

          // 3. Check for specific tenant admin doc tenant_admin_<subdomain> in master
          if (fallbackDocs.length === 0) {
            try {
              const adminDoc = await getDoc(doc(db, 'tenants', '_master', 'contacts', `tenant_admin_${currentSub}`));
              if (adminDoc.exists()) {
                fallbackDocs.push(adminDoc);
              }
            } catch {}
          }
        } else if (collections.contacts.includes('/_master/')) {
          // In master context: query root contacts
          const rootQ = ownerId ? query(rootRef, where('ownerId', '==', ownerId)) : query(rootRef);
          let rootSnap = await getDocs(rootQ);
          if (rootSnap.empty && ownerId) {
            rootSnap = await getDocs(query(rootRef));
          }
          if (!rootSnap.empty) {
            fallbackDocs.push(...rootSnap.docs);
          }
        }

        if (fallbackDocs.length > 0) {
          snapshot = { docs: fallbackDocs, empty: false } as any;
          // Background auto-migration / mirroring into tenant-scoped collection
          try {
            let mirrorBatch = writeBatch(db);
            let count = 0;
            for (const docItem of fallbackDocs) {
              mirrorBatch.set(doc(db, collections.contacts, docItem.id), docItem.data(), { merge: true });
              count++;
              if (count >= 400) {
                await mirrorBatch.commit();
                mirrorBatch = writeBatch(db);
                count = 0;
              }
            }
            if (count > 0) {
              await mirrorBatch.commit();
            }
          } catch (mErr) {
            console.warn('[CRM Analytics] Background contacts mirror notice:', mErr);
          }
        }
      } catch (e) {
        console.warn('[CRM Analytics] Contacts fallback query notice:', e);
      }
    }

    const contacts: Contact[] = snapshot.docs.map(d => {
      const data = d.data();
      const rawEvents = Array.isArray(data.events) ? data.events : [];
      const eventsSpent = rawEvents.reduce((acc: number, ev: any) => acc + (Number(ev.amount) || 0), 0);
      const totalSpentVal = data.total_spent !== undefined && data.total_spent !== null
        ? Number(data.total_spent)
        : eventsSpent;

      const contactName = (
        data.kosun_crm_name ||
        data.conta_name || 
        data.fullName || 
        data.name || 
        (data.firstName ? `${data.firstName} ${data.lastName || ''}`.trim() : '') || 
        data.f_m ||
        'איש קשר'
      );
      const contactPhone = (
        data.kosun_crm_phone ||
        data.conta_phone || 
        data.phone || 
        data.normalizedPhone || 
        data.mobile || 
        ''
      );
      const contactEmail = data.kosun_crm_email || data.email || '';
      const contactCompany = data.kosun_crm_company || data.company_name || data.company || '';
      const contactCity = data.kosun_crm_city || data.mh_crm_city || data.city || '';
      const contactStreet = data.kosun_crm_street || data.mh_crm_street || data.street || '';
      const contactGovId = data.kosun_crm_gov_id || data.tg1 || data.tz || '';
      const contactNotes = data.kosun_crm_notes || data.notes || '';
      const contactSource = data.kosun_crm_source || data.lead_source || data.source || '';

      const contactTags = Array.isArray(data.kosun_crm_tags)
        ? data.kosun_crm_tags
        : Array.isArray(data.tags)
        ? data.tags.filter((t: any) => typeof t === 'string' && t.trim() !== '')
        : [data.tg1, data.tg2, data.tg3].filter((t: any) => typeof t === 'string' && t.trim() !== '');

      return {
        id: d.id,
        status: data.kosun_crm_status || data.status || 'active',
        is_lead: data.is_lead ?? (data.kosun_crm_type === 'lead'),
        contact_type: data.kosun_crm_type || data.contact_type || (data.is_lead ? 'lead' : 'contact'),
        // Canonical KOSUN CRM Fields
        kosun_crm_name: contactName,
        kosun_crm_phone: contactPhone,
        kosun_crm_email: contactEmail,
        kosun_crm_company: contactCompany,
        kosun_crm_city: contactCity,
        kosun_crm_street: contactStreet,
        kosun_crm_gov_id: contactGovId,
        kosun_crm_notes: contactNotes,
        kosun_crm_tags: contactTags,
        kosun_crm_source: contactSource,
        // Legacy aliases
        conta_name: contactName,
        conta_phone: contactPhone,
        email: contactEmail,
        company_name: contactCompany,
        mh_crm_city: contactCity,
        mh_crm_street: contactStreet,
        tg1: contactGovId,
        notes: contactNotes,
        lead_source: contactSource,
        tags: contactTags,
        total_spent: totalSpentVal,
        order_count: Number(data.kosun_crm_order_count || data.order_count || (rawEvents.length > 0 ? rawEvents.length : 0)),
        ...data,
      } as Contact;
    });

    // Merge any locally or remote provisioned tenants that might not be in master contacts yet
    if (collections.contacts.includes('/_master/') && typeof window !== 'undefined') {
      try {
        const storageKeys = [
          'kosun_provisioned_tenants_registry_v1',
          'kosun_tenant_accounts',
          'saas_provisioned_tenants_registry',
        ];
        for (const key of storageKeys) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list: any[] = JSON.parse(raw);
            for (const item of list) {
              const sub = (item.subdomain || '').toLowerCase().trim();
              if (sub && sub !== '_master' && sub !== 'www') {
                const alreadyInList = contacts.some((c) => (c.subdomain || '').toLowerCase() === sub);
                if (!alreadyInList) {
                  const targetId = `tenant_admin_${sub}`;
                  const tContact: Contact = {
                    id: targetId,
                    status: 'active',
                    contact_type: 'contact',
                    isUser: true,
                    isSubdomainAdmin: true,
                    subdomain: sub,
                    fullDomain: item.fullDomain || `${sub}.kosun.pro`,
                    adminUsername: item.adminUsername || item.ownerEmail || `${sub}@kosun.pro`,
                    adminPassword: item.adminPassword || 'Ks@1234',
                    activeModules: item.activeModules || ['KosBranding', 'KosWebAi', 'KSF'],
                    tenantStatus: item.status || 'active',
                    billingPlan: item.billingPlan || 'monthly',
                    monthlyTotal: item.monthlyTotal || 0,
                    subdomainNotes: item.notes || '',
                    company_name: item.clientName || `עסק ${sub}`,
                    job_title: 'מנהל סאב-דומיין (טננט)',
                    conta_name: item.clientName || `טננט ${sub}`,
                    kosun_crm_name: item.clientName || `טננט ${sub}`,
                    email: item.ownerEmail || item.adminUsername || `${sub}@kosun.pro`,
                    kosun_crm_email: item.ownerEmail || item.adminUsername || `${sub}@kosun.pro`,
                    conta_phone: item.ownerPhone || '',
                    kosun_crm_phone: item.ownerPhone || '',
                    lead_source: 'סאב-דומיין KOSUN26',
                    tags: ['סאב דומיין', 'משתמש מערכת', 'טננט', sub],
                    createdAt: item.createdAt || new Date().toISOString(),
                    updatedAt: item.updatedAt || new Date().toISOString(),
                  };
                  contacts.push(tContact);
                }
              }
            }
          }
        }
      } catch (tErr) {
        console.warn('[CRM Analytics] Tenant merge notice:', tErr);
      }
    }

    // Also fetch leads from Firestore leads collection if available
    try {
      const leadsColName = (collections as any).leads || 'mod_crm_leads';
      const leadsRef = collection(db, leadsColName);
      let leadsQuery = ownerId 
        ? query(leadsRef, where('ownerId', '==', ownerId)) 
        : query(leadsRef);
      let leadsSnap = await getDocs(leadsQuery);
      if (leadsSnap.empty && ownerId) {
        leadsSnap = await getDocs(query(leadsRef));
      }
      if (leadsSnap.empty && leadsColName !== 'mod_crm_leads') {
        const rootLeadsSnap = await getDocs(query(collection(db, 'mod_crm_leads')));
        if (!rootLeadsSnap.empty) {
          leadsSnap = rootLeadsSnap;
        }
      }

      leadsSnap.docs.forEach(d => {
        const raw = d.data();
        const inner = raw.data || raw;
        // Avoid duplicate id
        if (!contacts.some(c => c.id === d.id)) {
          const leadContact: Contact = {
            id: d.id,
            status: inner.status === 'trashed' ? 'trashed' : 'active',
            is_lead: true,
            contact_type: 'lead',
            conta_name: inner.fullName || inner.name || inner.conta_name || 'ליד ללא שם',
            conta_phone: inner.phone || inner.conta_phone || '',
            email: inner.email || '',
            company_name: inner.company || inner.company_name || '',
            job_title: inner.job_title || inner.role || '',
            lead_source: inner.source || inner.lead_source || 'ליד ממערכת (Leads DB)',
            tags: Array.isArray(inner.tags) ? inner.tags : ['ליד חדש'],
            community: inner.community || '',
            total_spent: Number(inner.total_spent || 0),
            order_count: Number(inner.order_count || 0),
            createdAt: inner.createdAt || new Date().toISOString(),
            ...inner,
          };
          contacts.push(leadContact);
        }
      });
    } catch (leadsErr) {
      console.warn('Leads collection fetch error:', leadsErr);
    }

    // Custom fields
    let customFields: CustomField[] = [];
    try {
      const customFieldsRef = collection(db, collections.customFields);
      let cfQuery = ownerId 
        ? query(customFieldsRef, where('ownerId', '==', ownerId)) 
        : query(customFieldsRef);
      let cfSnap = await getDocs(cfQuery);
      if (cfSnap.empty && ownerId) {
        cfSnap = await getDocs(query(customFieldsRef));
      }
      customFields = cfSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      } as CustomField));
    } catch {}

    // Fetch groups from Firestore groups collection if available
    let definedGroupNames: string[] = [];
    try {
      const groupsColName = (collections as any).groups || 'crm_groups';
      const groupsRef = collection(db, groupsColName);
      let groupsQuery = ownerId 
        ? query(groupsRef, where('ownerId', '==', ownerId)) 
        : query(groupsRef);
      let groupsSnap = await getDocs(groupsQuery);
      if (groupsSnap.empty && ownerId) {
        groupsSnap = await getDocs(query(groupsRef));
      }
      // Fallback: ONLY for _master root tenant migration, if scoped collection is empty
      if (groupsSnap.empty && groupsColName.includes('/_master/')) {
        try {
          const rootGroupsCol = SYSTEM_COLLECTIONS.GROUPS;
          const rootGRef = collection(db, rootGroupsCol);
          let rootGSnap = await getDocs(query(rootGRef));
          if (!rootGSnap.empty) {
            groupsSnap = rootGSnap;
            // Background mirror to scoped collection
            try {
              let gBatch = writeBatch(db);
              for (const gd of rootGSnap.docs) {
                gBatch.set(doc(db, groupsColName, gd.id), gd.data(), { merge: true });
              }
              await gBatch.commit();
            } catch {}
          }
        } catch {}
      }

      groupsSnap.docs.forEach(d => {
        const gData = d.data();
        const gName = gData.name || gData.title;
        if (gName && typeof gName === 'string') {
          definedGroupNames.push(gName.trim());
        }
      });
    } catch (groupsErr) {
      console.warn('Groups collection fetch notice:', groupsErr);
    }

    // In-memory intelligent deduplication to eliminate duplicates in the CRM table
    const dedupedMap = new Map<string, Contact>();
    
    contacts.forEach(c => {
      const normPhone = (c.conta_phone || '').replace(/\D/g, '');
      const hasValidPhone = normPhone.length >= 7 && normPhone !== '0000000';
      const cleanEmail = (c.email || '').toLowerCase().trim();
      const cleanName = (c.conta_name || '').trim();
      const isMeaningfulName = cleanName && cleanName !== 'NONAME' && cleanName !== 'איש קשר' && cleanName !== 'ליד ללא שם';

      let key = '';
      if (hasValidPhone) {
        key = `phone:${normPhone}`;
      } else if (cleanEmail && cleanEmail.includes('@')) {
        key = `email:${cleanEmail}`;
      } else if (isMeaningfulName) {
        key = `name:${cleanName}`;
      } else {
        key = `id:${c.id}`;
      }

      if (!dedupedMap.has(key)) {
        dedupedMap.set(key, { ...c });
      } else {
        const existing = dedupedMap.get(key)!;
        const mergedTags = Array.from(new Set([...(existing.tags || []), ...(c.tags || [])])).filter(Boolean);
        const mergedSpent = Math.max(Number(existing.total_spent || 0), Number(c.total_spent || 0));
        const mergedOrders = Math.max(Number(existing.order_count || 0), Number(c.order_count || 0));
        
        dedupedMap.set(key, {
          ...existing,
          ...c,
          id: existing.id,
          conta_name: existing.conta_name && existing.conta_name !== 'NONAME' && existing.conta_name !== 'איש קשר' ? existing.conta_name : c.conta_name,
          conta_phone: existing.conta_phone || c.conta_phone,
          email: existing.email || c.email,
          company_name: existing.company_name || c.company_name,
          tags: mergedTags,
          total_spent: mergedSpent,
          order_count: mergedOrders,
        });
      }
    });

    // Exclude empty ghost entries with no name/phone and 0 spent
    const cleanUniqueContacts = Array.from(dedupedMap.values()).filter(c => {
      const isGhost = (!c.conta_name || c.conta_name === 'NONAME') && !c.conta_phone && (!c.total_spent || c.total_spent === 0);
      return !isGhost;
    });

    if (cleanUniqueContacts.length === 0) {
      return computeAnalyticsMetrics([], customFields, filter, definedGroupNames);
    }

    return computeAnalyticsMetrics(cleanUniqueContacts, customFields, filter, definedGroupNames);
  } catch (error) {
    console.warn('Firestore fetch failed, returning clean data:', error);
    return computeAnalyticsMetrics([], [], filter);
  }
}

export async function createContact(
  firebaseApp: FirebaseApp | undefined,
  contactData: Partial<Contact>,
  ownerId?: string,
  collections = DEFAULT_COLLECTIONS
): Promise<Contact> {
  const newContact: Contact = {
    id: `contact_${Date.now()}`,
    status: 'active',
    is_lead: contactData.is_lead ?? false,
    contact_type: contactData.contact_type || (contactData.is_lead ? 'lead' : 'contact'),
    conta_name: contactData.conta_name || '',
    conta_phone: contactData.conta_phone || '',
    email: contactData.email || '',
    createdAt: new Date().toISOString(),
    ownerId: ownerId,
    ...contactData,
  };

  if (firebaseApp) {
    try {
      const db = getFirestore(firebaseApp);
      const contactsRef = collection(db, collections.contacts);
      const docRef = await addDoc(contactsRef, {
        ...newContact,
        ownerId: ownerId || null,
        createdAt: new Date().toISOString(),
      });
      newContact.id = docRef.id;

      // Dual compatibility: mirror to root contacts if scoped collection is different
      if (collections.contacts !== 'contacts') {
        try {
          await setDoc(doc(db, 'contacts', newContact.id), {
            ...newContact,
            ownerId: ownerId || null,
          }, { merge: true });
        } catch {}
      }
    } catch (e) {
      console.warn('Failed to save contact to Firestore, kept locally:', e);
    }
  }

  return newContact;
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

    // Dual compatibility: mirror to root contacts only if scoped collection is _master
    if (collections.contacts !== 'contacts' && collections.contacts.includes('/_master/')) {
      try {
        const rootRef = doc(db, 'contacts', contactId);
        await updateDoc(rootRef, {
          [field]: value,
          updatedAt: new Date().toISOString(),
        });
      } catch {}
    }
    return true;
  } catch (e) {
    console.error('Failed to update contact field:', e);
    return false;
  }
}

/**
 * Bulk Delete Contacts from Firestore (marks status as 'trashed')
 */
export async function bulkDeleteContacts(
  firebaseApp: FirebaseApp | undefined,
  contactIds: string[],
  collections = DEFAULT_COLLECTIONS
): Promise<boolean> {
  if (!firebaseApp || contactIds.length === 0) return true;
  try {
    const db = getFirestore(firebaseApp);
    let batch = writeBatch(db);
    let opCount = 0;

    for (const cid of contactIds) {
      const contactRef = doc(db, collections.contacts, cid);
      batch.update(contactRef, { status: 'trashed', updatedAt: new Date().toISOString() });
      if (collections.contacts !== 'contacts') {
        try {
          batch.update(doc(db, 'contacts', cid), { status: 'trashed', updatedAt: new Date().toISOString() });
        } catch {}
      }
      opCount++;

      if (opCount >= 400) {
        await batch.commit();
        batch = writeBatch(db);
        opCount = 0;
      }
    }

    if (opCount > 0) {
      await batch.commit();
    }
    return true;
  } catch (err) {
    console.error('bulkDeleteContacts error:', err);
    return false;
  }
}

/**
 * Bulk Add Tag to Contacts in Firestore
 */
export async function bulkAddTagToContacts(
  firebaseApp: FirebaseApp | undefined,
  contactIds: string[],
  tag: string,
  collections = DEFAULT_COLLECTIONS
): Promise<boolean> {
  if (!firebaseApp || contactIds.length === 0 || !tag.trim()) return true;
  const cleanTag = tag.trim();
  try {
    const db = getFirestore(firebaseApp);
    let batch = writeBatch(db);
    let opCount = 0;

    for (const cid of contactIds) {
      const contactRef = doc(db, collections.contacts, cid);
      const snap = await getDoc(contactRef);
      if (snap.exists()) {
        const currentTags: string[] = snap.data().tags || [];
        if (!currentTags.includes(cleanTag)) {
          const nextTags = [...currentTags, cleanTag];
          batch.update(contactRef, { tags: nextTags, updatedAt: new Date().toISOString() });
          if (collections.contacts !== 'contacts') {
            try {
              batch.update(doc(db, 'contacts', cid), { tags: nextTags, updatedAt: new Date().toISOString() });
            } catch {}
          }
          opCount++;
        }
      }

      if (opCount >= 400) {
        await batch.commit();
        batch = writeBatch(db);
        opCount = 0;
      }
    }

    if (opCount > 0) {
      await batch.commit();
    }
    return true;
  } catch (err) {
    console.error('bulkAddTagToContacts error:', err);
    return false;
  }
}

/**
 * Bulk Assign Contacts to Group or Community
 */
export async function bulkAssignGroupToContacts(
  firebaseApp: FirebaseApp | undefined,
  contactIds: string[],
  groupName: string,
  collections = DEFAULT_COLLECTIONS
): Promise<boolean> {
  return bulkAddTagToContacts(firebaseApp, contactIds, groupName, collections);
}

/**
 * Permanent One-time Database Migration & De-duplication:
 * Consolidates duplicate records into canonical contacts, merges tags and events,
 * and removes redundant duplicates from Firestore.
 */
export async function mergeDuplicateContactsInDb(
  firebaseApp: FirebaseApp | undefined,
  collections = DEFAULT_COLLECTIONS
): Promise<{ mergedCount: number; removedCount: number }> {
  if (!firebaseApp) return { mergedCount: 0, removedCount: 0 };
  const db = getFirestore(firebaseApp);
  
  const snap = await getDocs(collection(db, collections.contacts));
  if (snap.empty) return { mergedCount: 0, removedCount: 0 };

  const byKey: Record<string, { id: string; ref: any; data: any }[]> = {};
  const ghostDocIds: string[] = [];

  snap.docs.forEach(d => {
    const data = d.data();
    const id = d.id;
    const normPhone = (data.conta_phone || data.phone || data.normalizedPhone || '').replace(/\D/g, '');
    const cleanEmail = (data.email || '').toLowerCase().trim();
    const cleanName = (data.conta_name || data.fullName || data.name || (data.firstName ? `${data.firstName} ${data.lastName || ''}`.trim() : '') || '').trim();
    const rawEvents = Array.isArray(data.events) ? data.events : [];

    // Identify ghost noname docs
    if ((!cleanName || cleanName === 'NONAME') && !normPhone && rawEvents.length === 0 && (!data.total_spent || Number(data.total_spent) === 0)) {
      ghostDocIds.push(id);
      return;
    }

    let key = '';
    if (normPhone && normPhone.length >= 7 && normPhone !== '0000000') {
      key = `phone:${normPhone}`;
    } else if (cleanEmail && cleanEmail.includes('@')) {
      key = `email:${cleanEmail}`;
    } else if (cleanName && cleanName !== 'NONAME' && cleanName !== 'איש קשר' && cleanName.length > 2) {
      key = `name:${cleanName}`;
    } else {
      key = `id:${id}`;
    }

    if (!byKey[key]) byKey[key] = [];
    byKey[key].push({ id, ref: d.ref, data });
  });

  let mergedCount = 0;
  let removedCount = 0;

  for (const [key, group] of Object.entries(byKey)) {
    if (group.length <= 1) continue;

    // Pick canonical document (prefer doc with highest event count or most complete data)
    group.sort((a, b) => {
      const aEvents = Array.isArray(a.data.events) ? a.data.events.length : 0;
      const bEvents = Array.isArray(b.data.events) ? b.data.events.length : 0;
      if (bEvents !== aEvents) return bEvents - aEvents;
      const aSpent = Number(a.data.total_spent || 0);
      const bSpent = Number(b.data.total_spent || 0);
      return bSpent - aSpent;
    });

    const canonical = group[0];
    const duplicates = group.slice(1);

    // Combine tags, events, and fields
    let allTags = Array.isArray(canonical.data.tags) ? [...canonical.data.tags] : [];
    let allEvents = Array.isArray(canonical.data.events) ? [...canonical.data.events] : [];
    let bestPhone = canonical.data.conta_phone || canonical.data.phone || '';
    let bestEmail = canonical.data.email || '';
    let bestName = canonical.data.conta_name || canonical.data.fullName || canonical.data.name || '';
    let bestCompany = canonical.data.company_name || canonical.data.company || '';

    duplicates.forEach(dup => {
      const dTags = Array.isArray(dup.data.tags) ? dup.data.tags : [];
      allTags.push(...dTags);
      const dEvents = Array.isArray(dup.data.events) ? dup.data.events : [];
      allEvents.push(...dEvents);
      if (!bestPhone) bestPhone = dup.data.conta_phone || dup.data.phone || '';
      if (!bestEmail) bestEmail = dup.data.email || '';
      if (!bestCompany) bestCompany = dup.data.company_name || dup.data.company || '';
      if ((!bestName || bestName === 'NONAME') && dup.data.conta_name) bestName = dup.data.conta_name;
    });

    const uniqueTags = Array.from(new Set(allTags.map(t => typeof t === 'string' ? t.trim() : '').filter(Boolean)));
    const eventsSpent = allEvents.reduce((acc, ev) => acc + (Number(ev.amount) || 0), 0);
    const finalSpent = Math.max(Number(canonical.data.total_spent || 0), eventsSpent);

    // Update canonical doc
    await updateDoc(canonical.ref, {
      conta_name: bestName || canonical.data.conta_name,
      conta_phone: bestPhone,
      email: bestEmail,
      company_name: bestCompany,
      tags: uniqueTags,
      events: allEvents,
      total_spent: finalSpent,
      order_count: Math.max(allEvents.length, Number(canonical.data.order_count || 0)),
      updatedAt: new Date().toISOString(),
    });

    // If scoped path is _master, mirror canonical update to root
    if (collections.contacts !== 'contacts' && collections.contacts.includes('/_master/')) {
      try {
        await updateDoc(doc(db, 'contacts', canonical.id), {
          conta_name: bestName || canonical.data.conta_name,
          conta_phone: bestPhone,
          email: bestEmail,
          tags: uniqueTags,
          events: allEvents,
          total_spent: finalSpent,
          updatedAt: new Date().toISOString(),
        });
      } catch {}
    }

    // Delete redundant duplicates
    for (const dup of duplicates) {
      await deleteDoc(dup.ref).catch(() => {});
      if (collections.contacts !== 'contacts') {
        await deleteDoc(doc(db, 'contacts', dup.id)).catch(() => {});
      }
      removedCount++;
    }

    mergedCount++;
  }

  // Also clean ghost noname docs
  for (const ghostId of ghostDocIds) {
    await deleteDoc(doc(db, collections.contacts, ghostId)).catch(() => {});
    if (collections.contacts !== 'contacts') {
      await deleteDoc(doc(db, 'contacts', ghostId)).catch(() => {});
    }
    removedCount++;
  }

  return { mergedCount, removedCount };
}

/**
 * Bulk updates contacts in Firestore based on filter criteria
 */
export async function batchUpdateContactsInDb(
  firebaseApp: FirebaseApp | undefined,
  params: {
    filterCriteria: {
      city?: string;
      source?: string;
      tag?: string;
      status?: string;
      isLead?: boolean;
      contactIds?: string[];
    };
    updates: {
      addTags?: string[];
      removeTags?: string[];
      status?: string;
      city?: string;
      notes?: string;
      leadSource?: string;
    };
  },
  collections = DEFAULT_COLLECTIONS
): Promise<number> {
  if (!firebaseApp) return 0;
  try {
    const db = getFirestore(firebaseApp);
    const colRef = collection(db, collections.contacts);
    const snap = await getDocs(colRef);
    if (snap.empty) return 0;

    const { filterCriteria, updates } = params;
    let batch = writeBatch(db);
    let updatedCount = 0;
    let opCount = 0;

    for (const d of snap.docs) {
      const data = d.data();
      
      // Match filter criteria
      if (filterCriteria.contactIds && filterCriteria.contactIds.length > 0) {
        if (!filterCriteria.contactIds.includes(d.id)) continue;
      }
      if (filterCriteria.city && (data.mh_crm_city || data.city) !== filterCriteria.city) continue;
      if (filterCriteria.source && (data.lead_source || data.source) !== filterCriteria.source) continue;
      if (filterCriteria.status && (data.status || 'active') !== filterCriteria.status) continue;
      if (filterCriteria.isLead !== undefined && Boolean(data.is_lead) !== filterCriteria.isLead) continue;
      if (filterCriteria.tag) {
        const currentTags: string[] = Array.isArray(data.tags) ? data.tags : [];
        if (!currentTags.includes(filterCriteria.tag)) continue;
      }

      // Build update payload
      const docUpdates: Record<string, any> = {
        updatedAt: new Date().toISOString()
      };

      if (updates.status) docUpdates.status = updates.status;
      if (updates.city) {
        docUpdates.mh_crm_city = updates.city;
        docUpdates.city = updates.city;
      }
      if (updates.notes) docUpdates.notes = updates.notes;
      if (updates.leadSource) {
        docUpdates.lead_source = updates.leadSource;
        docUpdates.source = updates.leadSource;
      }

      // Tag updates
      if (updates.addTags || updates.removeTags) {
        let currentTags: string[] = Array.isArray(data.tags) ? [...data.tags] : [];
        if (updates.addTags) {
          updates.addTags.forEach(t => {
            if (t && !currentTags.includes(t)) currentTags.push(t);
          });
        }
        if (updates.removeTags) {
          currentTags = currentTags.filter(t => !updates.removeTags!.includes(t));
        }
        docUpdates.tags = currentTags;
      }

      batch.update(d.ref, docUpdates);
      opCount++;
      updatedCount++;

      if (opCount >= 400) {
        await batch.commit();
        batch = writeBatch(db);
        opCount = 0;
      }
    }

    if (opCount > 0) {
      await batch.commit();
    }

    return updatedCount;
  } catch (err) {
    console.error('batchUpdateContactsInDb error:', err);
    return 0;
  }
}

/**
 * Sanitizes contact names and extracts memory tags from brackets/numbers
 */
export async function sanitizeContactNamesInDb(
  firebaseApp: FirebaseApp | undefined,
  scope: 'all' | 'leads' | 'whatsapp' | 'selected' = 'all',
  collections = DEFAULT_COLLECTIONS
): Promise<{ sanitizedCount: number; extractedTagsCount: number }> {
  if (!firebaseApp) return { sanitizedCount: 0, extractedTagsCount: 0 };
  try {
    const db = getFirestore(firebaseApp);
    const colRef = collection(db, collections.contacts);
    const snap = await getDocs(colRef);
    if (snap.empty) return { sanitizedCount: 0, extractedTagsCount: 0 };

    let batch = writeBatch(db);
    let sanitizedCount = 0;
    let extractedTagsCount = 0;
    let opCount = 0;

    for (const d of snap.docs) {
      const data = d.data();
      const rawName = data.conta_name || data.fullName || data.name || '';
      if (!rawName || typeof rawName !== 'string') continue;

      let name = rawName.trim();
      const extractedTags: string[] = [];

      // 1. Emojis
      const cleanNameNoEmoji = name.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ' ').trim();

      // 2. Bracketed notes into tags
      let finalName = cleanNameNoEmoji;
      const bracketMatches = finalName.match(/[\(\[\{]([^\)\]\}]+)[\)\]\}]/g);
      if (bracketMatches) {
        bracketMatches.forEach((m) => {
          const tagContent = m.slice(1, -1).trim();
          if (tagContent && !/^\+?[\d\-\.\s]+$/.test(tagContent)) {
            extractedTags.push(tagContent);
          }
          finalName = finalName.replace(m, ' ').trim();
        });
      }

      // 3. Trailing phone numbers in name
      finalName = finalName.replace(/\s*[\(\[]?05\d[\d\-\.\s]{6,}[\)\]]?$/g, '').trim();

      if (finalName !== rawName || extractedTags.length > 0) {
        const currentTags: string[] = Array.isArray(data.tags) ? [...data.tags] : [];
        const mergedTags = Array.from(new Set([...currentTags, ...extractedTags]));

        batch.update(d.ref, {
          conta_name: finalName || rawName,
          fullName: finalName || rawName,
          name: finalName || rawName,
          tags: mergedTags,
          updatedAt: new Date().toISOString()
        });

        sanitizedCount++;
        extractedTagsCount += extractedTags.length;
        opCount++;

        if (opCount >= 400) {
          await batch.commit();
          batch = writeBatch(db);
          opCount = 0;
        }
      }
    }

    if (opCount > 0) {
      await batch.commit();
    }

    return { sanitizedCount, extractedTagsCount };
  } catch (err) {
    console.error('sanitizeContactNamesInDb error:', err);
    return { sanitizedCount: 0, extractedTagsCount: 0 };
  }
}

