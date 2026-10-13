import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  writeBatch,
  doc,
  deleteField,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyC011dhtJddDjLmTQ2HCvgVA0DPN8rKFwQ',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'glowmanage.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'glowmanage',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'glowmanage.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '174552708887',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:174552708887:web:70b91e3994c66db0336952',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Full exhaustive mapping of legacy keys -> canonical kosun_crm_* keys
const MIGRATION_MAP = [
  // 1. פרטי שם וזיהוי
  { legacyKey: 'conta_name', targetKey: 'kosun_crm_name' },
  { legacyKey: 'name', targetKey: 'kosun_crm_name' },
  { legacyKey: 'fullName', targetKey: 'kosun_crm_name' },
  { legacyKey: 'f_m', targetKey: 'kosun_crm_family' },
  { legacyKey: 'gender', targetKey: 'kosun_crm_gender' },
  { legacyKey: 'birth_date', targetKey: 'kosun_crm_birth_date' },
  { legacyKey: 'website', targetKey: 'kosun_crm_website' },

  // 2. מספרי טלפון
  { legacyKey: 'conta_phone', targetKey: 'kosun_crm_phone' },
  { legacyKey: 'phone', targetKey: 'kosun_crm_phone' },
  { legacyKey: 'mobile', targetKey: 'kosun_crm_phone' },
  { legacyKey: 'normalizedPhone', targetKey: 'kosun_crm_phone' },
  { legacyKey: 'tel', targetKey: 'kosun_crm_phone' },
  { legacyKey: 'phoneNumber', targetKey: 'kosun_crm_phone' },
  { legacyKey: 'work_phone', targetKey: 'kosun_crm_work_phone' },

  // 3. דואר אלקטרוני
  { legacyKey: 'email', targetKey: 'kosun_crm_email' },
  { legacyKey: 'mail', targetKey: 'kosun_crm_email' },

  // 4. מזהה ממשלתי / מס
  { legacyKey: 'tg1', targetKey: 'kosun_crm_gov_id' },
  { legacyKey: 'tz', targetKey: 'kosun_crm_gov_id' },
  { legacyKey: 'idNumber', targetKey: 'kosun_crm_gov_id' },
  { legacyKey: 'id_num', targetKey: 'kosun_crm_gov_id' },
  { legacyKey: 'customer_tz', targetKey: 'kosun_crm_gov_id' },
  { legacyKey: 'vat', targetKey: 'kosun_crm_gov_id' },
  { legacyKey: 'vat_id', targetKey: 'kosun_crm_gov_id' },

  // 5. עיר ורחוב
  { legacyKey: 'mh_crm_city', targetKey: 'kosun_crm_city' },
  { legacyKey: 'city', targetKey: 'kosun_crm_city' },
  { legacyKey: 'mh_crm_street', targetKey: 'kosun_crm_street' },
  { legacyKey: 'street', targetKey: 'kosun_crm_street' },
  { legacyKey: 'address', targetKey: 'kosun_crm_street' },

  // 6. חברה ותפקיד
  { legacyKey: 'company_name', targetKey: 'kosun_crm_company' },
  { legacyKey: 'company', targetKey: 'kosun_crm_company' },
  { legacyKey: 'organization', targetKey: 'kosun_crm_company' },
  { legacyKey: 'job_title', targetKey: 'kosun_crm_role' },
  { legacyKey: 'role', targetKey: 'kosun_crm_role' },
  { legacyKey: 'position', targetKey: 'kosun_crm_role' },

  // 7. תגיות, קהילה ומקור
  { legacyKey: 'tags', targetKey: 'kosun_crm_tags' },
  { legacyKey: 'community', targetKey: 'kosun_crm_community' },
  { legacyKey: 'mh_crm_community', targetKey: 'kosun_crm_community' },
  { legacyKey: 'segment', targetKey: 'kosun_crm_segment' },
  { legacyKey: 'lead_source', targetKey: 'kosun_crm_source' },
  { legacyKey: 'source', targetKey: 'kosun_crm_source' },
  { legacyKey: 'contact_type', targetKey: 'kosun_crm_type' },
  { legacyKey: 'status', targetKey: 'kosun_crm_status' },

  // 8. הערות
  { legacyKey: 'notes', targetKey: 'kosun_crm_notes' },

  // 9. בנק, צ'קים ותשלומים (Kesher Financials)
  { legacyKey: 'bank_name', targetKey: 'kosun_crm_bank_name' },
  { legacyKey: 'branch_number', targetKey: 'kosun_crm_bank_branch' },
  { legacyKey: 'account_number', targetKey: 'kosun_crm_bank_account' },
  { legacyKey: 'bank_account_owner', targetKey: 'kosun_crm_bank_owner' },
  { legacyKey: 'bank_auth_number', targetKey: 'kosun_crm_bank_auth' },
  { legacyKey: 'check_number', targetKey: 'kosun_crm_check_number' },
  { legacyKey: 'check_bank_name', targetKey: 'kosun_crm_check_bank' },
  { legacyKey: 'check_bank', targetKey: 'kosun_crm_check_bank' },
  { legacyKey: 'check_branch', targetKey: 'kosun_crm_check_branch' },
  { legacyKey: 'check_account', targetKey: 'kosun_crm_check_account' },
  { legacyKey: 'check_payee', targetKey: 'kosun_crm_check_payee' },
  { legacyKey: 'total_spent', targetKey: 'kosun_crm_total_spent' },
  { legacyKey: 'order_count', targetKey: 'kosun_crm_order_count' },
  { legacyKey: 'last_order_date', targetKey: 'kosun_crm_last_order_date' },
  { legacyKey: 'payments', targetKey: 'kosun_crm_payments' },

  // 10. קמפיינים ושגרירים
  { legacyKey: 'campaign_id', targetKey: 'kosun_crm_campaign_id' },
  { legacyKey: 'campaign_title', targetKey: 'kosun_crm_campaign_title' },
  { legacyKey: 'campaign_amount', targetKey: 'kosun_crm_campaign_amount' },
  { legacyKey: 'campaign_role', targetKey: 'kosun_crm_campaign_role' },
  { legacyKey: 'campaign_target_goal', targetKey: 'kosun_crm_campaign_goal' },
  { legacyKey: 'campaign_total_raised', targetKey: 'kosun_crm_campaign_raised' },
  { legacyKey: 'ambassador_page_url', targetKey: 'kosun_crm_ambassador_url' },

  // 11. טפסים והגשות
  { legacyKey: 'last_form_name', targetKey: 'kosun_crm_last_form_name' },
  { legacyKey: 'last_form_page', targetKey: 'kosun_crm_last_form_page' },
  { legacyKey: 'last_form_submission_date', targetKey: 'kosun_crm_last_form_date' },
  { legacyKey: 'form_submissions', targetKey: 'kosun_crm_form_submissions' },

  // 12. AI ותובנות
  { legacyKey: 'ai_sentiment_score', targetKey: 'kosun_crm_ai_sentiment' },
  { legacyKey: 'ai_lead_temperature', targetKey: 'kosun_crm_ai_temperature' },
  { legacyKey: 'ai_summary', targetKey: 'kosun_crm_ai_summary' },
  { legacyKey: 'ai_next_best_action', targetKey: 'kosun_crm_ai_next_action' },
  { legacyKey: 'ai_interactions', targetKey: 'kosun_crm_ai_interactions' },

  // 13. מנויי SaaS
  { legacyKey: 'subscriptions', targetKey: 'kosun_crm_subscriptions' },
  { legacyKey: 'billingCustomerId', targetKey: 'kosun_crm_billing_customer_id' },

  // 14. זמני מערכת
  { legacyKey: 'createdAt', targetKey: 'kosun_crm_created_at' },
  { legacyKey: 'updatedAt', targetKey: 'kosun_crm_updated_at' },
];

async function run() {
  const isExecute = process.argv.includes('--execute');
  const collectionName = 'contacts';

  console.log(`\n======================================================`);
  console.log(`KOSUN CRM COLLECTION MIGRATION TOOL`);
  console.log(`Target Collection: "${collectionName}"`);
  console.log(`Mode: ${isExecute ? '⚡ LIVE EXECUTION (DELETING LEGACY KEYS)' : '🔍 DRY RUN PREVIEW (NO WRITES)'}`);
  console.log(`======================================================\n`);

  try {
    const contactsRef = collection(db, collectionName);
    const snapshot = await getDocs(contactsRef);

    console.log(`Total documents found in "${collectionName}": ${snapshot.size}`);

    let docsNeedingMigration = 0;
    let totalFieldsToMigrate = 0;
    const samples = [];

    let batch = writeBatch(db);
    let batchOpsCount = 0;
    let committedBatches = 0;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const updates = {};
      let docHasChanges = false;

      for (const mapItem of MIGRATION_MAP) {
        const val = data[mapItem.legacyKey];
        if (val !== undefined) {
          // If canonical target doesn't exist, set it
          if (data[mapItem.targetKey] === undefined && updates[mapItem.targetKey] === undefined) {
            updates[mapItem.targetKey] = val;
            docHasChanges = true;
            totalFieldsToMigrate++;
          }

          // If executing, mark legacy key for deletion
          if (isExecute) {
            updates[mapItem.legacyKey] = deleteField();
            docHasChanges = true;
          }
        }
      }

      if (docHasChanges) {
        docsNeedingMigration++;
        if (samples.length < 3) {
          samples.push({
            id: docSnap.id,
            updatesKeys: Object.keys(updates),
          });
        }

        if (isExecute) {
          batch.update(doc(db, collectionName, docSnap.id), updates);
          batchOpsCount++;

          if (batchOpsCount >= 200) {
            await batch.commit();
            committedBatches++;
            console.log(`Batch #${committedBatches} committed (${batchOpsCount} ops)`);
            batch = writeBatch(db);
            batchOpsCount = 0;
          }
        }
      }
    }

    if (isExecute && batchOpsCount > 0) {
      await batch.commit();
      committedBatches++;
      console.log(`Final batch #${committedBatches} committed (${batchOpsCount} ops)`);
    }

    console.log(`\n----------------- SUMMARY -----------------`);
    console.log(`Total Documents Scanned: ${snapshot.size}`);
    console.log(`Documents with Legacy Fields: ${docsNeedingMigration}`);
    console.log(`Total Field Migrations: ${totalFieldsToMigrate}`);

    if (samples.length > 0) {
      console.log(`\nSample Documents:`);
      samples.forEach((s) => {
        console.log(` - Doc ID [${s.id}]: Updates = ${s.updatesKeys.join(', ')}`);
      });
    }

    if (!isExecute) {
      console.log(`\n👉 This was a DRY RUN. No database writes were performed.`);
      console.log(`👉 To execute the migration and delete old keys, run: node scripts/runCrmMigration.js --execute`);
    } else {
      console.log(`\n✅ MIGRATION COMPLETED SUCCESSFULLY! Legacy keys deleted.`);
    }
  } catch (err) {
    console.error('Error during migration:', err);
    process.exit(1);
  }
}

run();
