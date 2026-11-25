import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const admin = require('../functions/node_modules/firebase-admin/lib/index.js');

const EXECUTE = process.argv.includes('--execute');

const app = admin.initializeApp(
  { credential: admin.credential.applicationDefault(), projectId: 'glowmanage' },
  'migrate-all-forms-keys'
);
const db = app.firestore();

const KEY_MAP = {
  conta_name: 'kosun_crm_name',
  name: 'kosun_crm_name',
  full_name: 'kosun_crm_name',
  fullName: 'kosun_crm_name',
  conta_phone: 'kosun_crm_phone',
  phone: 'kosun_crm_phone',
  tel: 'kosun_crm_phone',
  mobile: 'kosun_crm_phone',
  work_phone: 'kosun_crm_work_phone',
  email: 'kosun_crm_email',
  conta_email: 'kosun_crm_email',
  mail: 'kosun_crm_email',
  company_name: 'kosun_crm_company',
  company: 'kosun_crm_company',
  notes: 'kosun_crm_notes',
  details: 'kosun_crm_notes',
  mh_crm_city: 'kosun_crm_city',
  city: 'kosun_crm_city',
  mh_crm_street: 'kosun_crm_street',
  street: 'kosun_crm_street',
  f_m: 'kosun_crm_family',
  gender: 'kosun_crm_gender',
  birth_date: 'kosun_crm_birth_date',
  payment_amount: 'kosun_crm_total_spent',
  total_spent: 'kosun_crm_total_spent',
};

function mapKey(k) {
  if (!k || typeof k !== 'string') return k;
  const trimmed = k.trim();
  return KEY_MAP[trimmed] || trimmed;
}

async function main() {
  console.log(`\n=== Updating mod_forms CRM mappingKeys across ALL tenants ===`);
  console.log(`Mode: ${EXECUTE ? 'EXECUTE (LIVE WRITE)' : 'DRY-RUN'}\n`);

  const tenantsSnap = await db.collection('tenants').get();
  let totalForms = 0;
  let updatedForms = 0;

  for (const tenantDoc of tenantsSnap.docs) {
    const tenantId = tenantDoc.id;
    const formsSnap = await tenantDoc.ref.collection('mod_forms').get();
    if (formsSnap.empty) continue;

    let tenantUpdated = 0;
    const batch = db.batch();

    formsSnap.forEach((formDoc) => {
      totalForms++;
      const d = formDoc.data();
      let changed = false;
      const patch = {};

      if (Array.isArray(d.steps)) {
        const nextSteps = d.steps.map((step) => {
          if (!step || typeof step !== 'object') return step;
          const mapped = mapKey(step.mappingKey);
          if (mapped !== step.mappingKey) {
            changed = true;
            return { ...step, mappingKey: mapped };
          }
          return step;
        });
        if (changed) patch.steps = nextSteps;
      }

      if (d.config && Array.isArray(d.config.fields)) {
        let cfgChanged = false;
        const nextFields = d.config.fields.map((f) => {
          if (!f || typeof f !== 'object') return f;
          const mapped = mapKey(f.map_to);
          if (mapped !== f.map_to) {
            cfgChanged = true;
            return { ...f, map_to: mapped };
          }
          return f;
        });
        if (cfgChanged) {
          changed = true;
          patch.config = { ...d.config, fields: nextFields };
        }
      }

      if (!d.updatedAt) {
        changed = true;
        patch.updatedAt = d.createdAt || new Date().toISOString();
      }

      if (changed) {
        updatedForms++;
        tenantUpdated++;
        batch.set(formDoc.ref, patch, { merge: true });
      }
    });

    if (EXECUTE && tenantUpdated > 0) {
      await batch.commit();
    }

    console.log(`Tenant "${tenantId}": ${formsSnap.size} forms (${tenantUpdated} to update)`);
  }

  console.log(`\nSummary: ${totalForms} total forms scanned, ${updatedForms} forms ${EXECUTE ? 'updated' : 'need update'}.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed:', err);
    process.exit(1);
  });
