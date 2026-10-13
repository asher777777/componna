import {
  collection,
  getDocs,
  writeBatch,
  doc,
  deleteField,
  Firestore,
} from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { SYSTEM_COLLECTIONS, KOSUN_CRM_FIELD_KEYS } from '../../../core/contracts/collections';

export interface MigrationFieldMapping {
  legacyKey: string;
  targetKey: string;
  description: string;
}

export const KOSUN_CRM_MIGRATION_MAP: MigrationFieldMapping[] = [
  // 1. פרטי שם וזיהוי
  { legacyKey: 'conta_name', targetKey: KOSUN_CRM_FIELD_KEYS.NAME, description: 'שם מלא' },
  { legacyKey: 'name', targetKey: KOSUN_CRM_FIELD_KEYS.NAME, description: 'שם מלא' },
  { legacyKey: 'fullName', targetKey: KOSUN_CRM_FIELD_KEYS.NAME, description: 'שם מלא' },
  { legacyKey: 'f_m', targetKey: KOSUN_CRM_FIELD_KEYS.FAMILY, description: 'משפחה / קרבה' },
  { legacyKey: 'gender', targetKey: KOSUN_CRM_FIELD_KEYS.GENDER, description: 'מגדר' },
  { legacyKey: 'birth_date', targetKey: KOSUN_CRM_FIELD_KEYS.BIRTH_DATE, description: 'תאריך לידה' },
  { legacyKey: 'website', targetKey: KOSUN_CRM_FIELD_KEYS.WEBSITE, description: 'אתר אינטרנט' },

  // 2. מספרי טלפון
  { legacyKey: 'conta_phone', targetKey: KOSUN_CRM_FIELD_KEYS.PHONE, description: 'טלפון נייד' },
  { legacyKey: 'phone', targetKey: KOSUN_CRM_FIELD_KEYS.PHONE, description: 'טלפון' },
  { legacyKey: 'mobile', targetKey: KOSUN_CRM_FIELD_KEYS.PHONE, description: 'סלולרי' },
  { legacyKey: 'normalizedPhone', targetKey: KOSUN_CRM_FIELD_KEYS.PHONE, description: 'טלפון מנורמל' },
  { legacyKey: 'tel', targetKey: KOSUN_CRM_FIELD_KEYS.PHONE, description: 'טלפון' },
  { legacyKey: 'phoneNumber', targetKey: KOSUN_CRM_FIELD_KEYS.PHONE, description: 'טלפון' },
  { legacyKey: 'work_phone', targetKey: KOSUN_CRM_FIELD_KEYS.WORK_PHONE, description: 'טלפון עבודה' },

  // 3. דואר אלקטרוני
  { legacyKey: 'email', targetKey: KOSUN_CRM_FIELD_KEYS.EMAIL, description: 'דוא"ל' },
  { legacyKey: 'mail', targetKey: KOSUN_CRM_FIELD_KEYS.EMAIL, description: 'דוא"ל' },

  // 4. מזהה ממשלתי / מס
  { legacyKey: 'tg1', targetKey: KOSUN_CRM_FIELD_KEYS.GOV_ID, description: 'ת.ז. / ח.פ. / עוסק מורשה' },
  { legacyKey: 'tz', targetKey: KOSUN_CRM_FIELD_KEYS.GOV_ID, description: 'תעודת זהות' },
  { legacyKey: 'idNumber', targetKey: KOSUN_CRM_FIELD_KEYS.GOV_ID, description: 'מספר מזהה' },
  { legacyKey: 'id_num', targetKey: KOSUN_CRM_FIELD_KEYS.GOV_ID, description: 'מספר מזהה' },
  { legacyKey: 'customer_tz', targetKey: KOSUN_CRM_FIELD_KEYS.GOV_ID, description: 'ת.ז לקוח' },
  { legacyKey: 'vat', targetKey: KOSUN_CRM_FIELD_KEYS.GOV_ID, description: 'ח.פ / מע"מ' },
  { legacyKey: 'vat_id', targetKey: KOSUN_CRM_FIELD_KEYS.GOV_ID, description: 'מספר עוסק' },

  // 5. עיר ורחוב
  { legacyKey: 'mh_crm_city', targetKey: KOSUN_CRM_FIELD_KEYS.CITY, description: 'עיר / יישוב' },
  { legacyKey: 'city', targetKey: KOSUN_CRM_FIELD_KEYS.CITY, description: 'עיר' },
  { legacyKey: 'mh_crm_street', targetKey: KOSUN_CRM_FIELD_KEYS.STREET, description: 'רחוב / כתובת' },
  { legacyKey: 'street', targetKey: KOSUN_CRM_FIELD_KEYS.STREET, description: 'רחוב' },
  { legacyKey: 'address', targetKey: KOSUN_CRM_FIELD_KEYS.STREET, description: 'כתובת' },

  // 6. חברה ותפקיד
  { legacyKey: 'company_name', targetKey: KOSUN_CRM_FIELD_KEYS.COMPANY, description: 'שם חברה' },
  { legacyKey: 'company', targetKey: KOSUN_CRM_FIELD_KEYS.COMPANY, description: 'חברה' },
  { legacyKey: 'organization', targetKey: KOSUN_CRM_FIELD_KEYS.COMPANY, description: 'ארגון' },
  { legacyKey: 'job_title', targetKey: KOSUN_CRM_FIELD_KEYS.ROLE, description: 'תפקיד' },
  { legacyKey: 'role', targetKey: KOSUN_CRM_FIELD_KEYS.ROLE, description: 'תפקיד' },
  { legacyKey: 'position', targetKey: KOSUN_CRM_FIELD_KEYS.ROLE, description: 'תפקיד' },

  // 7. תגיות, קהילה ומקור
  { legacyKey: 'tags', targetKey: KOSUN_CRM_FIELD_KEYS.TAGS, description: 'תגיות' },
  { legacyKey: 'community', targetKey: KOSUN_CRM_FIELD_KEYS.COMMUNITY, description: 'קהילה / קבוצה' },
  { legacyKey: 'mh_crm_community', targetKey: KOSUN_CRM_FIELD_KEYS.COMMUNITY, description: 'קהילה' },
  { legacyKey: 'segment', targetKey: KOSUN_CRM_FIELD_KEYS.SEGMENT, description: 'סגמנט' },
  { legacyKey: 'lead_source', targetKey: KOSUN_CRM_FIELD_KEYS.SOURCE, description: 'מקור הגעה' },
  { legacyKey: 'source', targetKey: KOSUN_CRM_FIELD_KEYS.SOURCE, description: 'מקור' },
  { legacyKey: 'contact_type', targetKey: KOSUN_CRM_FIELD_KEYS.TYPE, description: 'סוג רשומה' },
  { legacyKey: 'status', targetKey: KOSUN_CRM_FIELD_KEYS.STATUS, description: 'סטטוס' },

  // 8. הערות
  { legacyKey: 'notes', targetKey: KOSUN_CRM_FIELD_KEYS.NOTES, description: 'הערות ודגשים' },

  // 9. בנק, צ'קים ותשלומים (Kesher Financials)
  { legacyKey: 'bank_name', targetKey: KOSUN_CRM_FIELD_KEYS.BANK_NAME, description: 'שם בנק' },
  { legacyKey: 'branch_number', targetKey: KOSUN_CRM_FIELD_KEYS.BANK_BRANCH, description: 'מספר סניף' },
  { legacyKey: 'account_number', targetKey: KOSUN_CRM_FIELD_KEYS.BANK_ACCOUNT, description: 'מספר חשבון' },
  { legacyKey: 'bank_account_owner', targetKey: KOSUN_CRM_FIELD_KEYS.BANK_OWNER, description: 'בעל החשבון' },
  { legacyKey: 'bank_auth_number', targetKey: KOSUN_CRM_FIELD_KEYS.BANK_AUTH, description: 'הרשאה לחיוב' },
  { legacyKey: 'check_number', targetKey: KOSUN_CRM_FIELD_KEYS.CHECK_NUMBER, description: 'מספר צ\'ק' },
  { legacyKey: 'check_bank_name', targetKey: KOSUN_CRM_FIELD_KEYS.CHECK_BANK, description: 'בנק צ\'ק' },
  { legacyKey: 'check_bank', targetKey: KOSUN_CRM_FIELD_KEYS.CHECK_BANK, description: 'בנק צ\'ק' },
  { legacyKey: 'check_branch', targetKey: KOSUN_CRM_FIELD_KEYS.CHECK_BRANCH, description: 'סניף צ\'ק' },
  { legacyKey: 'check_account', targetKey: KOSUN_CRM_FIELD_KEYS.CHECK_ACCOUNT, description: 'חשבון צ\'ק' },
  { legacyKey: 'check_payee', targetKey: KOSUN_CRM_FIELD_KEYS.CHECK_PAYEE, description: 'לפקודת' },
  { legacyKey: 'total_spent', targetKey: KOSUN_CRM_FIELD_KEYS.TOTAL_SPENT, description: 'סך רכישות' },
  { legacyKey: 'order_count', targetKey: KOSUN_CRM_FIELD_KEYS.ORDER_COUNT, description: 'כמות הזמנות' },
  { legacyKey: 'last_order_date', targetKey: KOSUN_CRM_FIELD_KEYS.LAST_ORDER_DATE, description: 'תאריך הזמנה אחרונה' },
  { legacyKey: 'payments', targetKey: KOSUN_CRM_FIELD_KEYS.PAYMENTS, description: 'תשלומים' },

  // 10. קמפיינים ושגרירים
  { legacyKey: 'campaign_id', targetKey: KOSUN_CRM_FIELD_KEYS.CAMPAIGN_ID, description: 'מזהה קמפיין' },
  { legacyKey: 'campaign_title', targetKey: KOSUN_CRM_FIELD_KEYS.CAMPAIGN_TITLE, description: 'שם קמפיין' },
  { legacyKey: 'campaign_amount', targetKey: KOSUN_CRM_FIELD_KEYS.CAMPAIGN_AMOUNT, description: 'סכום קמפיין' },
  { legacyKey: 'campaign_role', targetKey: KOSUN_CRM_FIELD_KEYS.CAMPAIGN_ROLE, description: 'תפקיד בקמפיין' },
  { legacyKey: 'campaign_target_goal', targetKey: KOSUN_CRM_FIELD_KEYS.CAMPAIGN_GOAL, description: 'יעד קמפיין' },
  { legacyKey: 'campaign_total_raised', targetKey: KOSUN_CRM_FIELD_KEYS.CAMPAIGN_RAISED, description: 'סך גויס' },
  { legacyKey: 'ambassador_page_url', targetKey: KOSUN_CRM_FIELD_KEYS.AMBASSADOR_URL, description: 'עמוד שגריר' },

  // 11. טפסים והגשות
  { legacyKey: 'last_form_name', targetKey: KOSUN_CRM_FIELD_KEYS.LAST_FORM_NAME, description: 'שם טופס אחרון' },
  { legacyKey: 'last_form_page', targetKey: KOSUN_CRM_FIELD_KEYS.LAST_FORM_PAGE, description: 'עמוד טופס' },
  { legacyKey: 'last_form_submission_date', targetKey: KOSUN_CRM_FIELD_KEYS.LAST_FORM_DATE, description: 'תאריך טופס' },
  { legacyKey: 'form_submissions', targetKey: KOSUN_CRM_FIELD_KEYS.FORM_SUBMISSIONS, description: 'הגשות טפסים' },

  // 12. AI ותובנות
  { legacyKey: 'ai_sentiment_score', targetKey: KOSUN_CRM_FIELD_KEYS.AI_SENTIMENT, description: 'ציון סנטימנט' },
  { legacyKey: 'ai_lead_temperature', targetKey: KOSUN_CRM_FIELD_KEYS.AI_TEMPERATURE, description: 'חום ליד' },
  { legacyKey: 'ai_summary', targetKey: KOSUN_CRM_FIELD_KEYS.AI_SUMMARY, description: 'סיכום AI' },
  { legacyKey: 'ai_next_best_action', targetKey: KOSUN_CRM_FIELD_KEYS.AI_NEXT_ACTION, description: 'פעולה מומלצת' },
  { legacyKey: 'ai_interactions', targetKey: KOSUN_CRM_FIELD_KEYS.AI_INTERACTIONS, description: 'אינטראקציות AI' },

  // 13. מנויי SaaS
  { legacyKey: 'subscriptions', targetKey: KOSUN_CRM_FIELD_KEYS.SUBSCRIPTIONS, description: 'מנויים' },
  { legacyKey: 'billingCustomerId', targetKey: KOSUN_CRM_FIELD_KEYS.BILLING_CUSTOMER_ID, description: 'לקוח סליקה' },

  // 14. זמני מערכת
  { legacyKey: 'createdAt', targetKey: KOSUN_CRM_FIELD_KEYS.CREATED_AT, description: 'נוצר בתאריך' },
  { legacyKey: 'updatedAt', targetKey: KOSUN_CRM_FIELD_KEYS.UPDATED_AT, description: 'עודכן בתאריך' },
];

export interface MigrationAnalysisReport {
  totalContacts: number;
  contactsNeedingMigration: number;
  alreadyMigratedCount: number;
  sampleTransformations: Array<{
    id: string;
    before: Record<string, any>;
    after: Record<string, any>;
  }>;
}

export interface MigrationExecutionResult {
  success: boolean;
  totalProcessed: number;
  migratedCount: number;
  deletedLegacyFieldsCount: number;
  errors: string[];
}

/**
 * מנתח את מצב המסמכים בקולקציית ה-CRM ללא ביצוע שינויים (Dry Run Preview)
 */
export async function analyzeCrmCollectionMigration(
  customFirestore?: Firestore,
  contactsCollectionName: string = SYSTEM_COLLECTIONS.CONTACTS
): Promise<MigrationAnalysisReport> {
  const targetDb = customFirestore || db;
  if (!targetDb) throw new Error('Firestore is not initialized');

  const contactsRef = collection(targetDb, contactsCollectionName);
  const snapshot = await getDocs(contactsRef);

  let totalContacts = 0;
  let contactsNeedingMigration = 0;
  let alreadyMigratedCount = 0;
  const sampleTransformations: MigrationAnalysisReport['sampleTransformations'] = [];

  snapshot.forEach((docSnap) => {
    totalContacts++;
    const data = docSnap.data();

    // Check if any legacy key exists and kosun_crm_* is missing or needs update
    let needsMigration = false;
    const previewBefore: Record<string, any> = {};
    const previewAfter: Record<string, any> = {};

    for (const mapping of KOSUN_CRM_MIGRATION_MAP) {
      if (data[mapping.legacyKey] !== undefined) {
        needsMigration = true;
        previewBefore[mapping.legacyKey] = data[mapping.legacyKey];
        if (!data[mapping.targetKey]) {
          previewAfter[mapping.targetKey] = data[mapping.legacyKey];
        }
      }
    }

    if (needsMigration) {
      contactsNeedingMigration++;
      if (sampleTransformations.length < 5) {
        sampleTransformations.push({
          id: docSnap.id,
          before: previewBefore,
          after: previewAfter,
        });
      }
    } else if (data[KOSUN_CRM_FIELD_KEYS.NAME] || data[KOSUN_CRM_FIELD_KEYS.PHONE]) {
      alreadyMigratedCount++;
    }
  });

  return {
    totalContacts,
    contactsNeedingMigration,
    alreadyMigratedCount,
    sampleTransformations,
  };
}

/**
 * ביצוע המיגרציה בפועל עם אפשרות מחיקה מאובטחת של השדות הישנים
 */
export async function executeCrmCollectionMigration(
  options: {
    deleteLegacyFields?: boolean;
    batchSize?: number;
  } = {},
  customFirestore?: Firestore,
  contactsCollectionName: string = SYSTEM_COLLECTIONS.CONTACTS
): Promise<MigrationExecutionResult> {
  const targetDb = customFirestore || db;
  if (!targetDb) throw new Error('Firestore is not initialized');

  const { deleteLegacyFields = true, batchSize = 100 } = options;
  const contactsRef = collection(targetDb, contactsCollectionName);
  const snapshot = await getDocs(contactsRef);

  let totalProcessed = 0;
  let migratedCount = 0;
  let deletedLegacyFieldsCount = 0;
  const errors: string[] = [];

  let batch = writeBatch(targetDb);
  let batchOpsCount = 0;

  for (const docSnap of snapshot.docs) {
    totalProcessed++;
    const data = docSnap.data();
    const updates: Record<string, any> = {};
    let docChanged = false;

    // 1. Copy legacy fields to kosun_crm_* if not already set
    for (const mapping of KOSUN_CRM_MIGRATION_MAP) {
      const legacyValue = data[mapping.legacyKey];
      if (legacyValue !== undefined) {
        // If target kosun_crm_* doesn't exist, set it
        if (data[mapping.targetKey] === undefined) {
          updates[mapping.targetKey] = legacyValue;
          docChanged = true;
        }

        // 2. If deleteLegacyFields is enabled, mark legacy key for deletion
        if (deleteLegacyFields) {
          updates[mapping.legacyKey] = deleteField();
          deletedLegacyFieldsCount++;
          docChanged = true;
        }
      }
    }

    if (docChanged) {
      migratedCount++;
      batch.update(doc(targetDb, contactsCollectionName, docSnap.id), updates);
      batchOpsCount++;

      // Commit batch if limit reached
      if (batchOpsCount >= batchSize) {
        try {
          await batch.commit();
          batch = writeBatch(targetDb);
          batchOpsCount = 0;
        } catch (bErr: any) {
          errors.push(`Batch commit error: ${bErr.message}`);
        }
      }
    }
  }

  // Commit remaining batch
  if (batchOpsCount > 0) {
    try {
      await batch.commit();
    } catch (bErr: any) {
      errors.push(`Final batch commit error: ${bErr.message}`);
    }
  }

  return {
    success: errors.length === 0,
    totalProcessed,
    migratedCount,
    deletedLegacyFieldsCount,
    errors,
  };
}
