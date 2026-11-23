import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const admin = require('../functions/node_modules/firebase-admin/lib/index.js');

const EXECUTE = process.argv.includes('--execute');
const PAGES_ONLY = process.argv.includes('--pages-only');
const SOURCE_PROJECT_ID = 'c-g-ltd';
const TARGET_PROJECT_ID = 'glowmanage';
const TARGET_TENANT_ID = 'lea';

const sourceApp = admin.initializeApp(
  { credential: admin.credential.applicationDefault(), projectId: SOURCE_PROJECT_ID },
  'source-c-g-ltd'
);
const targetApp = admin.initializeApp(
  { credential: admin.credential.applicationDefault(), projectId: TARGET_PROJECT_ID },
  'target-glowmanage'
);

const sourceDb = sourceApp.firestore();
const targetDb = targetApp.firestore();

function normalizePhone(raw) {
  if (!raw || typeof raw !== 'string') return '';
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('972') && digits.length >= 11) return digits.slice(3);
  if (digits.startsWith('0') && digits.length >= 9) return digits.slice(1);
  return digits;
}

function mapLegacyFieldKey(key) {
  const map = {
    conta_name: 'kosun_crm_name',
    conta_phone: 'kosun_crm_phone',
    conta_email: 'kosun_crm_email',
    notes: 'kosun_crm_notes',
  };
  return map[key] || key;
}

async function commitBatchOps(ops) {
  if (!EXECUTE || ops.length === 0) return;
  const CHUNK_SIZE = 400;
  for (let i = 0; i < ops.length; i += CHUNK_SIZE) {
    const batch = targetDb.batch();
    const slice = ops.slice(i, i + CHUNK_SIZE);
    for (const op of slice) {
      batch.set(op.ref, op.data, { merge: true });
    }
    await batch.commit();
  }
}

async function migrateContacts() {
  const targetCol = targetDb.collection('tenants').doc(TARGET_TENANT_ID).collection('contacts');
  const existingSnap = await targetCol.get();
  const phoneToExistingDoc = new Map();

  existingSnap.forEach((docSnap) => {
    const d = docSnap.data();
    const norm = normalizePhone(d.kosun_crm_phone || d.conta_phone || d.phone);
    if (norm) {
      phoneToExistingDoc.set(norm, { id: docSnap.id, data: d });
    }
  });

  const sourceSnap = await sourceDb.collection('contacts').get();
  const ops = [];
  let createdCount = 0;
  let mergedCount = 0;

  sourceSnap.forEach((docSnap) => {
    const src = docSnap.data();
    const normPhone = normalizePhone(src.conta_phone || src.phone || src.kosun_crm_phone);
    const existing = normPhone ? phoneToExistingDoc.get(normPhone) : null;

    const srcTags = Array.isArray(src.tags) ? src.tags : [];
    const mergedSourceTag = 'מיובא מ-c-g-ltd';

    if (existing) {
      mergedCount++;
      const existingTags = Array.isArray(existing.data.kosun_crm_tags) ? existing.data.kosun_crm_tags : [];
      const combinedTags = Array.from(new Set([...existingTags, ...srcTags, mergedSourceTag]));
      const existingEvents = Array.isArray(existing.data.events) ? existing.data.events : [];
      const srcEvents = Array.isArray(src.events) ? src.events : [];

      ops.push({
        ref: targetCol.doc(existing.id),
        data: {
          kosun_crm_tags: combinedTags,
          events: [...existingEvents, ...srcEvents],
          campaign_amount: (existing.data.campaign_amount || 0) + (src.campaign_amount || 0),
          total_spent: (existing.data.total_spent || 0) + (src.total_spent || 0),
          order_count: (existing.data.order_count || 0) + (src.order_count || 0),
          kosun_crm_updated_at: new Date().toISOString(),
          migratedFrom: 'c-g-ltd',
        },
      });
    } else {
      createdCount++;
      const newId = `cgltd_${docSnap.id}`;
      const tags = Array.from(new Set([...srcTags, mergedSourceTag]));
      ops.push({
        ref: targetCol.doc(newId),
        data: {
          id: newId,
          kosun_crm_name: src.kosun_crm_name || src.conta_name || 'ללא שם',
          kosun_crm_phone: src.kosun_crm_phone || src.conta_phone || '',
          kosun_crm_email: src.kosun_crm_email || src.email || '',
          kosun_crm_tags: tags,
          kosun_crm_source: src.lead_source || 'c-g-ltd import',
          kosun_crm_status: src.status || 'active',
          kosun_crm_type: 'contact',
          kosun_crm_notes: src.notes || '',
          kosun_crm_created_at: src.createdAt || new Date().toISOString(),
          kosun_crm_updated_at: src.updatedAt || new Date().toISOString(),
          events: Array.isArray(src.events) ? src.events : [],
          total_spent: src.total_spent || 0,
          campaign_amount: src.campaign_amount || 0,
          order_count: src.order_count || 0,
          is_lead: false,
          migratedFrom: 'c-g-ltd',
        },
      });
    }
  });

  await commitBatchOps(ops);
  return { sourceTotal: sourceSnap.size, existingInLea: existingSnap.size, createdCount, mergedCount };
}

const NON_SECTION_KEYS = new Set([
  'id', 'pageId', 'slug', 'pageTitle', 'title', 'ownerId', 'views', 'viewsCount',
  'leadsCount', 'seo', 'seoSettings', 'sectionOrder', 'mobileHiddenSections',
  'sections', 'globalSettings', 'published', 'isHomePage', 'createdAt', 'updatedAt',
  'lastModified', 'migratedFrom', 'migratedAt',
]);

function transformLegacyPageDoc(docSnap, sourceCollection, defaultGlobalSettings) {
  const d = docSnap.data();
  const prefix = sourceCollection === 'pages' ? 'cgltd_page_' : 'cgltd_landing_';
  const newId = `${prefix}${docSnap.id}`;
  const isHome = sourceCollection === 'pages' && docSnap.id === 'home';

  // Extract sections: if already in d.sections use that, otherwise collect root-level section objects
  const sections = d.sections && typeof d.sections === 'object' ? { ...d.sections } : {};
  for (const [k, v] of Object.entries(d)) {
    if (!NON_SECTION_KEYS.has(k) && v && typeof v === 'object' && !Array.isArray(v)) {
      sections[k] = {
        ...v,
        id: v.id || k,
        type: v.type || k,
      };
    }
  }
  // Ensure existing sections also have id and type
  for (const [k, v] of Object.entries(sections)) {
    if (v && typeof v === 'object') {
      sections[k] = {
        ...v,
        id: v.id || k,
        type: v.type || k,
      };
    }
  }

  // Normalize campaignTiers.tiers -> ensure numeric `amount`
  if (sections.campaignTiers && Array.isArray(sections.campaignTiers.tiers)) {
    sections.campaignTiers.tiers = sections.campaignTiers.tiers.map((t) => ({
      ...t,
      amount: Number(t?.amount ?? t?.monthlyAmount ?? t?.price ?? t?.sum ?? 0) || 0,
    }));
  }

  // Normalize campaignDonors.donors -> ensure numeric `amount`
  if (sections.campaignDonors && Array.isArray(sections.campaignDonors.donors)) {
    sections.campaignDonors.donors = sections.campaignDonors.donors.map((donor) => ({
      ...donor,
      amount: Number(donor?.amount ?? donor?.sum ?? donor?.total ?? 0) || 0,
    }));
  }

  const pageTitle =
    d.pageTitle ||
    d.title ||
    d.seo?.title ||
    d.campaignHeader?.ambassadorName ||
    d.hero?.title ||
    d.mainContent?.title ||
    d.slug ||
    docSnap.id;

  const seoSettings = d.seoSettings || (d.seo ? {
    title: d.seo.title || pageTitle,
    description: d.seo.description || '',
    ogImage: d.seo.image || '',
  } : { title: pageTitle, description: '', ogImage: '' });

  const nowIso = new Date().toISOString();

  return {
    id: newId,
    pageId: newId,
    slug: d.slug || docSnap.id,
    pageTitle: String(pageTitle).trim(),
    isHomePage: isHome,
    published: true,
    sectionOrder: Array.isArray(d.sectionOrder) ? d.sectionOrder : Object.keys(sections),
    mobileHiddenSections: Array.isArray(d.mobileHiddenSections) ? d.mobileHiddenSections : [],
    sections,
    seoSettings,
    globalSettings: d.globalSettings || defaultGlobalSettings || {},
    viewsCount: d.viewsCount ?? d.views ?? 0,
    leadsCount: d.leadsCount ?? 0,
    createdAt: d.createdAt || nowIso,
    updatedAt: d.updatedAt || nowIso,
    lastModified: Date.now(),
    migratedFrom: `c-g-ltd/${sourceCollection}`,
    migratedAt: nowIso,
  };
}

async function migratePagesAndLanding() {
  const targetCol = targetDb.collection('tenants').doc(TARGET_TENANT_ID).collection('kos_web_ai_documents');
  const ops = [];

  // Read existing home_lea to inherit globalSettings & unset its isHomePage
  const existingDocsSnap = await targetCol.get();
  let defaultGlobalSettings = {};
  existingDocsSnap.forEach((docSnap) => {
    const d = docSnap.data();
    if (docSnap.id === 'home_lea' && d.globalSettings) {
      defaultGlobalSettings = d.globalSettings;
    }
    if ((d.isHomePage === true || d.slug === 'home') && docSnap.id !== 'cgltd_page_home') {
      const updateData = { isHomePage: false, updatedAt: new Date().toISOString() };
      if (d.slug === 'home') {
        updateData.slug = `${docSnap.id}_backup`;
      }
      ops.push({
        ref: targetCol.doc(docSnap.id),
        data: updateData,
      });
    }
  });

  const pagesSnap = await sourceDb.collection('pages').get();
  pagesSnap.forEach((docSnap) => {
    const transformed = transformLegacyPageDoc(docSnap, 'pages', defaultGlobalSettings);
    ops.push({
      ref: targetCol.doc(transformed.id),
      data: transformed,
      replace: true,
    });
  });

  const landingSnap = await sourceDb.collection('landing').get();
  landingSnap.forEach((docSnap) => {
    const transformed = transformLegacyPageDoc(docSnap, 'landing', defaultGlobalSettings);
    ops.push({
      ref: targetCol.doc(transformed.id),
      data: transformed,
      replace: true,
    });
  });

  if (EXECUTE && ops.length > 0) {
    const CHUNK_SIZE = 400;
    for (let i = 0; i < ops.length; i += CHUNK_SIZE) {
      const batch = targetDb.batch();
      for (const op of ops.slice(i, i + CHUNK_SIZE)) {
        if (op.replace) {
          batch.set(op.ref, op.data);
        } else {
          batch.set(op.ref, op.data, { merge: true });
        }
      }
      await batch.commit();
    }
  }

  return { pagesCount: pagesSnap.size, landingCount: landingSnap.size };
}

async function migrateCampaigns() {
  const targetCol = targetDb.collection('tenants').doc(TARGET_TENANT_ID).collection('mod_campaigns');
  const snap = await sourceDb.collection('campaigns').get();
  const ops = [];
  snap.forEach((docSnap) => {
    const d = docSnap.data();
    ops.push({
      ref: targetCol.doc(docSnap.id),
      data: {
        ...d,
        id: docSnap.id,
        migratedFrom: 'c-g-ltd',
        migratedAt: new Date().toISOString(),
      },
    });
  });
  await commitBatchOps(ops);
  return { campaignsCount: snap.size };
}

async function migrateForms() {
  const targetCol = targetDb.collection('tenants').doc(TARGET_TENANT_ID).collection('mod_forms');
  const snap = await sourceDb.collection('form_templates').get();
  const ops = [];
  snap.forEach((docSnap) => {
    const d = docSnap.data();
    const config = d.config ? { ...d.config } : {};
    if (Array.isArray(config.fields)) {
      config.fields = config.fields.map((f) => ({
        ...f,
        map_to: mapLegacyFieldKey(f.map_to),
      }));
    }
    ops.push({
      ref: targetCol.doc(`cgltd_${docSnap.id}`),
      data: {
        ...d,
        id: `cgltd_${docSnap.id}`,
        config,
        migratedFrom: 'c-g-ltd',
        migratedAt: new Date().toISOString(),
      },
    });
  });
  await commitBatchOps(ops);
  return { formsCount: snap.size };
}

async function migrateMedia() {
  const targetCol = targetDb.collection('tenants').doc(TARGET_TENANT_ID).collection('sdo_media_items');
  const snap = await sourceDb.collection('media').get();
  const ops = [];
  snap.forEach((docSnap) => {
    const d = docSnap.data();
    ops.push({
      ref: targetCol.doc(`cgltd_${docSnap.id}`),
      data: {
        ...d,
        id: `cgltd_${docSnap.id}`,
        migratedFrom: 'c-g-ltd',
        migratedAt: new Date().toISOString(),
      },
    });
  });
  await commitBatchOps(ops);
  return { mediaCount: snap.size };
}

async function migrateApiKeysIfMissing() {
  const srcConfigSnap = await sourceDb.collection('configs').doc('global').get();
  if (!srcConfigSnap.exists) return { updatedKeys: [] };
  const src = srcConfigSnap.data() || {};

  const targetRef = targetDb.collection('tenants').doc(TARGET_TENANT_ID).collection('settings').doc('api_keys');
  const targetSnap = await targetRef.get();
  const existing = targetSnap.exists ? targetSnap.data() || {} : {};

  const candidate = {
    greenApiInstanceId: src.greenApiInstanceId,
    greenApiToken: src.greenApiToken,
    kesherUserName: src.kesherUserName,
    kesherApiKey: src.kesherApiKey,
    kesherPaymentPageId: src.kesherPaymentPageId,
    kesherEzCountToken: src.kesherEzCountToken,
  };

  const toWrite = {};
  for (const [k, v] of Object.entries(candidate)) {
    if (v && !existing[k]) {
      toWrite[k] = v;
    }
  }

  if (EXECUTE && Object.keys(toWrite).length > 0) {
    await targetRef.set(toWrite, { merge: true });
  }
  return { updatedKeys: Object.keys(toWrite) };
}

async function main() {
  console.log(`\n=== Migration: ${SOURCE_PROJECT_ID} -> ${TARGET_PROJECT_ID}/tenants/${TARGET_TENANT_ID} ===`);
  console.log(`Mode: ${EXECUTE ? 'EXECUTE (LIVE WRITE)' : 'DRY-RUN (READ ONLY)'}${PAGES_ONLY ? ' [PAGES ONLY]' : ''}\n`);

  if (!PAGES_ONLY) {
    const contactsRes = await migrateContacts();
    console.log('Contacts:', contactsRes);
  }

  const pagesRes = await migratePagesAndLanding();
  console.log('Pages & Landing:', pagesRes);

  if (!PAGES_ONLY) {
    const campaignsRes = await migrateCampaigns();
    console.log('Campaigns:', campaignsRes);

    const formsRes = await migrateForms();
    console.log('Forms:', formsRes);

    const mediaRes = await migrateMedia();
    console.log('Media:', mediaRes);

    const keysRes = await migrateApiKeysIfMissing();
    console.log('API Keys (missing only):', keysRes);
  }

  console.log('\nDone!');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
