import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const admin = require('../functions/node_modules/firebase-admin/lib/index.js');
const { getFirestore } = require('../functions/node_modules/firebase-admin/lib/firestore/index.js');

const srcApp = admin.initializeApp(
  { credential: admin.credential.applicationDefault(), projectId: 'desborecontrol' },
  'src-forms'
);
const tgtApp = admin.initializeApp(
  { credential: admin.credential.applicationDefault(), projectId: 'glowmanage' },
  'tgt-forms'
);

const srcDb = getFirestore(srcApp, 'default');
const tgtDb = tgtApp.firestore();

function mapToKosunCrmKey(rawKey, fieldLabel = '', fieldType = '') {
  const k = String(rawKey || '').trim().toLowerCase();
  const lbl = String(fieldLabel || '').trim();

  const directMap = {
    name: 'kosun_crm_name',
    conta_name: 'kosun_crm_name',
    full_name: 'kosun_crm_name',
    kosun_crm_name: 'kosun_crm_name',
    phone: 'kosun_crm_phone',
    conta_phone: 'kosun_crm_phone',
    tel: 'kosun_crm_phone',
    kosun_crm_phone: 'kosun_crm_phone',
    work_phone: 'kosun_crm_work_phone',
    email: 'kosun_crm_email',
    conta_email: 'kosun_crm_email',
    mail: 'kosun_crm_email',
    kosun_crm_email: 'kosun_crm_email',
    f_m: 'kosun_crm_family',
    family: 'kosun_crm_family',
    gender: 'kosun_crm_gender',
    birth_date: 'kosun_crm_birth_date',
    city: 'kosun_crm_city',
    mh_crm_city: 'kosun_crm_city',
    street: 'kosun_crm_street',
    mh_crm_street: 'kosun_crm_street',
    address: 'kosun_crm_street',
    notes: 'kosun_crm_notes',
    details: 'kosun_crm_notes',
    payment_amount: 'kosun_crm_total_spent',
    total_spent: 'kosun_crm_total_spent',
    amount: 'kosun_crm_total_spent',
    tg1: 'kosun_crm_gov_id',
    zeout: 'kosun_crm_gov_id',
    tz: 'kosun_crm_gov_id',
  };

  if (directMap[k]) return directMap[k];
  if (k.startsWith('kosun_crm_')) return k;

  // Smart fallback by label/type
  if (fieldType === 'tel' || lbl.includes('טלפון') || lbl.includes('נייד')) return 'kosun_crm_phone';
  if (fieldType === 'email' || lbl.includes('מייל') || lbl.includes('אימייל')) return 'kosun_crm_email';
  if (lbl.includes('עיר') || lbl.includes('יישוב')) return 'kosun_crm_city';
  if (lbl.includes('רחוב') || lbl.includes('כתובת')) return 'kosun_crm_street';
  if (lbl.includes('הערות') || lbl.includes('פירוט')) return 'kosun_crm_notes';
  if (lbl.includes('סכום')) return 'kosun_crm_total_spent';
  return rawKey || 'kosun_crm_notes';
}

function mapFieldType(oldType, mapTo) {
  if (mapTo === 'kosun_crm_total_spent' || oldType === 'payment') return 'payment';
  const t = String(oldType || 'text').toLowerCase();
  if (t === 'tel') return 'phone';
  if (t === 'select' || t === 'radio') return 'single_choice';
  if (t === 'checkbox') return 'multi_choice';
  if (['text', 'textarea', 'email', 'phone', 'number', 'date', 'time', 'file_upload'].includes(t)) return t;
  return 'text';
}

async function main() {
  const snap = await srcDb.collection('form_templates').get();
  const targetCol = tgtDb.collection('tenants').doc('azor').collection('mod_forms');
  const batch = tgtDb.batch();
  const nowIso = new Date().toISOString();
  let count = 0;

  snap.forEach((docSnap) => {
    const src = docSnap.data();
    const cfg = src.config || {};
    const title = String(src.name || src.title || docSnap.id).trim();
    const docId = `desb_${docSnap.id}`;
    const rawFields = Array.isArray(cfg.fields) ? cfg.fields : [];

    const steps = rawFields.map((f, idx) => {
      const mappingKey = mapToKosunCrmKey(f.map_to, f.label, f.type);
      const fieldType = mapFieldType(f.type, mappingKey);
      const options =
        typeof f.options === 'string' && f.options.trim()
          ? f.options.split(',').map((opt, oIdx) => ({
              id: `opt_${oIdx}`,
              label: opt.trim(),
              value: opt.trim(),
            }))
          : Array.isArray(f.options)
            ? f.options
            : undefined;

      return {
        id: `step_${idx + 1}`,
        order: idx,
        title: f.label || `שדה ${idx + 1}`,
        fieldType,
        iconName: fieldType === 'phone' ? 'Phone' : fieldType === 'email' ? 'Mail' : fieldType === 'payment' ? 'CreditCard' : 'FileText',
        placeholder: f.placeholder || f.label || '',
        required: Boolean(f.required),
        ...(f.default_value !== undefined ? { defaultValue: f.default_value } : {}),
        mappingKey,
        ...(options ? { options } : {}),
      };
    });

    const primaryColor = cfg.submit_button_bg_color && cfg.submit_button_bg_color !== 'primary'
      ? cfg.submit_button_bg_color
      : '#1e3a8a';

    const smartFormDoc = {
      id: docId,
      title,
      slug: docSnap.id.toLowerCase(),
      description: cfg.standard_success_message || cfg.payment_pending_message || `טופס ${title} - חב״ד אזור`,
      category: cfg.form_type === 'payment' ? 'תשלום והרשמה' : 'יצירת קשר',
      tone: 'warm_consulting',
      steps,
      theme: {
        primaryColor,
        accentColor: primaryColor,
        backgroundColor: '#ffffff',
        textColor: '#0f172a',
        cardBackground: '#f8fafc',
        borderRadius: 'xl',
        showProgressBar: true,
        showStepNumbers: true,
        luxuryBorder: false,
        buttonStyle: 'solid',
        displayMode: 'standard_card',
      },
      completion: {
        title: 'תודה רבה! הפרטים התקבלו בהצלחה',
        subtitle: cfg.standard_success_message || 'צוות בית חב״ד אזור ייצור איתך קשר בהקדם.',
        iconName: 'CheckCircle2',
        showRedirectButton: true,
        redirectButtonText: 'חזרה לעמוד הבית',
        redirectUrl: '/',
      },
      createdAt: src.createdAt || nowIso,
      updatedAt: src.updatedAt || nowIso,
      status: 'published',
      viewsCount: 0,
      startsCount: 0,
      submissionsCount: 0,
      isCrmSyncEnabled: cfg.save_to_crm !== false,
      crmDefaultTags: [title, 'חב״ד אזור'],
      crmDefaultCommunity: 'חב״ד אזור',
      // Keep legacy config reference just in case
      legacyConfig: cfg,
      migratedFrom: 'desborecontrol/form_templates',
    };

    batch.set(targetCol.doc(docId), smartFormDoc);
    count++;
    console.log(`Converted form "${title}" (${docId}) with ${steps.length} steps -> mappingKeys:`, steps.map(s => s.mappingKey));
  });

  await batch.commit();
  console.log(`\nSuccessfully migrated ${count} SmartForms to tenants/azor/mod_forms!`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
