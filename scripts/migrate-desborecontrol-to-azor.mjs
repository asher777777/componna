import { createRequire } from 'module';
import crypto from 'crypto';

const require = createRequire(import.meta.url);
const admin = require('../functions/node_modules/firebase-admin/lib/index.js');
const { getFirestore } = require('../functions/node_modules/firebase-admin/lib/firestore/index.js');

const EXECUTE = process.argv.includes('--execute');
const SOURCE_PROJECT_ID = 'desborecontrol';
const SOURCE_DATABASE_ID = 'default';
const SOURCE_BUCKET = 'desborecontrol.firebasestorage.app';

const TARGET_PROJECT_ID = 'glowmanage';
const TARGET_TENANT_ID = 'azor';
const TARGET_BUCKET = 'glowmanage.firebasestorage.app';

const sourceApp = admin.initializeApp(
  {
    credential: admin.credential.applicationDefault(),
    projectId: SOURCE_PROJECT_ID,
    storageBucket: SOURCE_BUCKET,
  },
  'source-desborecontrol'
);
const targetApp = admin.initializeApp(
  {
    credential: admin.credential.applicationDefault(),
    projectId: TARGET_PROJECT_ID,
    storageBucket: TARGET_BUCKET,
  },
  'target-glowmanage-azor'
);

const sourceDb = getFirestore(sourceApp, SOURCE_DATABASE_ID);
const targetDb = targetApp.firestore();
const sourceBucket = sourceApp.storage().bucket(SOURCE_BUCKET);
const targetBucket = targetApp.storage().bucket(TARGET_BUCKET);

const NON_SECTION_KEYS = new Set([
  'id', 'pageId', 'slug', 'pageTitle', 'title', 'ownerId', 'views', 'viewsCount',
  'leadsCount', 'seo', 'seoSettings', 'sectionOrder', 'mobileHiddenSections',
  'sections', 'globalSettings', 'published', 'isHomePage', 'createdAt', 'updatedAt',
  'lastModified', 'migratedFrom', 'migratedAt',
]);

function buildDownloadUrl(bucketName, filePath, token) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;
}

function replaceUrlsDeep(obj, urlMap) {
  if (typeof obj === 'string') {
    let out = obj;
    for (const [oldPrefix, newUrl] of urlMap.entries()) {
      if (out.includes(oldPrefix)) {
        const escaped = oldPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`${escaped}[^"'\\s<>]*`, 'g');
        out = out.replace(re, newUrl);
      }
    }
    return out;
  }
  if (Array.isArray(obj)) return obj.map((item) => replaceUrlsDeep(item, urlMap));
  if (obj && typeof obj === 'object') {
    const res = {};
    for (const [k, v] of Object.entries(obj)) res[k] = replaceUrlsDeep(v, urlMap);
    return res;
  }
  return obj;
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

async function commitBatchOps(ops, merge = true) {
  if (!EXECUTE || ops.length === 0) return;
  for (let i = 0; i < ops.length; i += 400) {
    const batch = targetDb.batch();
    for (const op of ops.slice(i, i + 400)) {
      if (merge && !op.replace) batch.set(op.ref, op.data, { merge: true });
      else batch.set(op.ref, op.data);
    }
    await batch.commit();
  }
}

async function copyStorageFiles() {
  const [files] = await sourceBucket.getFiles();
  const urlMap = new Map();
  let copiedCount = 0;

  for (const file of files) {
    const srcPath = file.name;
    if (srcPath.endsWith('/')) continue;

    const cleanName = srcPath.replace(/^uploads\//, '');
    const destPath = `tenants/${TARGET_TENANT_ID}/media/${cleanName}`;
    const token = crypto.randomUUID();

    if (EXECUTE) {
      const [buffer] = await file.download();
      const [meta] = await file.getMetadata();
      await targetBucket.file(destPath).save(buffer, {
        metadata: {
          contentType: meta.contentType || 'application/octet-stream',
          metadata: { firebaseStorageDownloadTokens: token },
        },
      });
    }

    const newUrl = buildDownloadUrl(TARGET_BUCKET, destPath, token);
    urlMap.set(`https://firebasestorage.googleapis.com/v0/b/${SOURCE_BUCKET}/o/${encodeURIComponent(srcPath)}`, newUrl);
    urlMap.set(`https://firebasestorage.googleapis.com/v0/b/${SOURCE_BUCKET}/o/${srcPath}`, newUrl);
    urlMap.set(`https://storage.googleapis.com/${SOURCE_BUCKET}/${srcPath}`, newUrl);
    urlMap.set(`https://storage.googleapis.com/${SOURCE_BUCKET}/${encodeURIComponent(srcPath)}`, newUrl);
    copiedCount++;
  }

  return { totalFiles: files.length, copiedCount, urlMap };
}

async function provisionAzorTenant(urlMap) {
  const globalSnap = await sourceDb.collection('settings').doc('global').get();
  const g = globalSnap.exists ? globalSnap.data() || {} : {};
  const nedarimSnap = await sourceDb.collection('configs').doc('nedarim_settings').get();
  const nedarim = nedarimSnap.exists ? nedarimSnap.data() || {} : {};

  const logoUrl = replaceUrlsDeep(g.siteLogoUrl || '', urlMap);
  const nowIso = new Date().toISOString();

  const tenantDoc = {
    id: TARGET_TENANT_ID,
    subdomain: TARGET_TENANT_ID,
    fullDomain: `${TARGET_TENANT_ID}.kosun.pro`,
    clientName: 'חב״ד אזור',
    ownerEmail: g.contactEmail || 'azor@kosun.pro',
    ownerPhone: g.contactPhone || '050-0000000',
    collectionPrefix: `tenant_${TARGET_TENANT_ID}_mod_`,
    status: 'active',
    billingPlan: 'monthly',
    activeModules: [
      'KosWebAi',
      'KosBranding',
      'KosWhatsUp',
      'KosAccess',
      'KosForms',
      'KosCrm',
      'KosCloudStore',
      'KosNedarim',
    ],
    migratedFrom: SOURCE_PROJECT_ID,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const brandingDoc = {
    identity: {
      companyName: 'חב״ד אזור',
      logoUrl,
      slogan: 'בית חב״ד אזור',
      organizationType: 'עמותה / מוסד',
    },
    contact: {
      phone: g.contactPhone || '',
      email: g.contactEmail || '',
      address: g.contactAddress || '',
      facebook: g.contactFacebook || '',
    },
    designTokens: {
      primaryColor: '#1e3a8a',
    },
    updatedAt: nowIso,
  };

  const apiKeysDoc = {
    paymentProvider: 'nedarim',
    nedarimMosadId: nedarim.mosadid || '',
    nedarimApiValid: nedarim.apivalid || '',
    nedarimApiPassword: nedarim.apipassword || '',
    nedarimGroup: nedarim.group || '',
  };

  if (EXECUTE) {
    await targetDb.collection('tenants').doc(TARGET_TENANT_ID).set(tenantDoc, { merge: true });
    await targetDb.collection('tenants').doc(TARGET_TENANT_ID).collection('settings').doc('kos_branding_dna').set(brandingDoc, { merge: true });
    await targetDb.collection('tenants').doc(TARGET_TENANT_ID).collection('settings').doc('api_keys').set(apiKeysDoc, { merge: true });
  }

  return { logoUrl, hasNedarimKeys: Boolean(apiKeysDoc.nedarimMosadId), globalSettings: g };
}

async function migrateContacts() {
  const targetCol = targetDb.collection('tenants').doc(TARGET_TENANT_ID).collection('contacts');
  const snap = await sourceDb.collection('contacts').get();
  const ops = [];

  snap.forEach((docSnap) => {
    const src = docSnap.data();
    const tags = [src.tg1, src.tg2, src.tg3, ...(Array.isArray(src.tags) ? src.tags : [])]
      .filter((t) => typeof t === 'string' && t.trim() !== '');
    const fullName = [src.conta_name, src.f_m].filter(Boolean).join(' ').trim() || 'ללא שם';
    const newId = `desb_${docSnap.id}`;

    ops.push({
      ref: targetCol.doc(newId),
      data: {
        id: newId,
        kosun_crm_name: fullName,
        kosun_crm_family: src.f_m || '',
        kosun_crm_phone: src.conta_phone || src.phone || '',
        kosun_crm_work_phone: src.work_phone || '',
        kosun_crm_email: src.email || '',
        kosun_crm_gender: src.gender || '',
        kosun_crm_birth_date: src.birth_date && src.birth_date !== '0000-00-00' ? src.birth_date : '',
        kosun_crm_city: src.mh_crm_city || '',
        kosun_crm_street: src.mh_crm_street || '',
        kosun_crm_tags: Array.from(new Set([...tags, 'מיובא מ-desborecontrol'])),
        kosun_crm_source: src.lead_source || 'desborecontrol import',
        kosun_crm_status: src.status || 'active',
        kosun_crm_type: 'contact',
        kosun_crm_notes: src.notes || '',
        kosun_crm_created_at: src.createdAt || new Date().toISOString(),
        kosun_crm_updated_at: src.updatedAt || new Date().toISOString(),
        events: Array.isArray(src.events) ? src.events : [],
        total_spent: src.total_spent || 0,
        order_count: src.order_count || 0,
        is_lead: false,
        migratedFrom: SOURCE_PROJECT_ID,
      },
    });
  });

  await commitBatchOps(ops);
  return { contactsCount: snap.size };
}

async function migratePages(urlMap, globalSettingsData) {
  const targetCol = targetDb.collection('tenants').doc(TARGET_TENANT_ID).collection('kos_web_ai_documents');
  const ops = [];
  const counts = {};
  const slugLookup = new Map();

  const defaultGlobalSettings = {
    siteTitle: 'חב״ד אזור',
    slogan: 'בית חב״ד אזור',
    primaryColor: '#1e3a8a',
    buttonBgColor: '#1e3a8a',
    contactPhone: globalSettingsData.contactPhone || '',
    contactEmail: globalSettingsData.contactEmail || '',
    logoUrl: replaceUrlsDeep(globalSettingsData.siteLogoUrl || '', urlMap),
  };

  // First pass: load pages, landing, lea_pages, services, posts into slugLookup
  const sourceDocs = [];
  for (const colName of ['pages', 'landing', 'lea_pages', 'services', 'posts']) {
    const snap = await sourceDb.collection(colName).get();
    counts[colName] = snap.size;
    snap.forEach((docSnap) => {
      const raw = replaceUrlsDeep(docSnap.data(), urlMap);
      const slug = (raw.slug || docSnap.id).replace(/^\/+/, '');
      const title =
        raw.pageTitle ||
        raw.title ||
        raw.seo?.title ||
        raw.hero?.title ||
        raw.mainContent?.title ||
        slug;
      const excerpt =
        raw.summary ||
        raw.seo?.description ||
        raw.hero?.subtitle ||
        raw.mainContent?.description ||
        raw.description ||
        '';
      const imageUrl =
        raw.imageUrl ||
        raw.seo?.image ||
        raw.hero?.backgroundImage ||
        raw.mainContent?.imageSrc ||
        '';
      const itemMeta = {
        id: docSnap.id,
        title: String(title).trim(),
        excerpt: String(excerpt).trim().slice(0, 180),
        imageUrl,
        tag: raw.category || (colName === 'services' ? 'שירותים' : colName === 'landing' ? 'פעילות' : 'עדכון'),
        date: raw.createdAt ? new Date(raw.createdAt).toLocaleDateString('he-IL') : '',
        linkUrl: `/${slug}`,
      };
      slugLookup.set(slug.toLowerCase(), itemMeta);
      slugLookup.set(docSnap.id.toLowerCase(), itemMeta);
      sourceDocs.push({ colName, docSnap, raw, slug, title });
    });
  }

  for (const { colName, docSnap, raw, slug, title } of sourceDocs) {
    const newId = `desb_${colName}_${docSnap.id}`;
    const isHome = colName === 'pages' && docSnap.id === 'home';

    const sections = raw.sections && typeof raw.sections === 'object' ? { ...raw.sections } : {};
    for (const [k, v] of Object.entries(raw)) {
      if (!NON_SECTION_KEYS.has(k) && v && typeof v === 'object' && !Array.isArray(v)) {
        sections[k] = { ...v, id: v.id || k, type: v.type || k };
      }
    }

    // If this is a post without sections, wrap it into a richContent section
    if (colName === 'posts' && Object.keys(sections).length === 0) {
      sections.richContent = {
        id: 'richContent',
        type: 'richContent',
        visible: true,
        title,
        content: raw.content || raw.summary || '',
        imageUrl: raw.imageUrl || '',
      };
    }

    // Transform livePosts.customPages string URLs (e.g. "/landing/katyna") into LivePostItem objects
    if (sections.livePosts && Array.isArray(sections.livePosts.customPages)) {
      sections.livePosts.customPages = sections.livePosts.customPages.map((entry, idx) => {
        if (entry && typeof entry === 'object' && entry.title) return entry;
        const pathStr = String(entry || '');
        const cleanSlug = pathStr.split('/').filter(Boolean).pop() || pathStr;
        const found = slugLookup.get(cleanSlug.toLowerCase());
        if (found) {
          return {
            id: found.id || `post_${idx}`,
            title: found.title,
            excerpt: found.excerpt,
            date: found.date,
            tag: found.tag,
            imageUrl: found.imageUrl,
            linkUrl: found.linkUrl,
          };
        }
        return {
          id: `post_${idx}`,
          title: cleanSlug,
          excerpt: '',
          tag: 'עדכון',
          linkUrl: `/${cleanSlug}`,
        };
      });
    }

    const nowIso = new Date().toISOString();
    ops.push({
      ref: targetCol.doc(newId),
      replace: true,
      data: {
        id: newId,
        pageId: newId,
        slug,
        pageTitle: String(title).trim(),
        isHomePage: isHome,
        published: true,
        sectionOrder: Array.isArray(raw.sectionOrder) ? raw.sectionOrder : Object.keys(sections),
        mobileHiddenSections: Array.isArray(raw.mobileHiddenSections) ? raw.mobileHiddenSections : [],
        sections,
        seoSettings: raw.seoSettings || (raw.seo ? {
          title: raw.seo.title || title,
          description: raw.seo.description || '',
          ogImage: raw.seo.image || '',
        } : { title, description: raw.summary || '', ogImage: raw.imageUrl || '' }),
        globalSettings: raw.globalSettings || defaultGlobalSettings,
        viewsCount: raw.viewsCount ?? raw.views ?? 0,
        leadsCount: raw.leadsCount ?? 0,
        createdAt: raw.createdAt || nowIso,
        updatedAt: raw.updatedAt || nowIso,
        lastModified: Date.now(),
        migratedFrom: `${SOURCE_PROJECT_ID}/${colName}`,
        migratedAt: nowIso,
      },
    });
  }

  await commitBatchOps(ops, false);
  return counts;
}

async function migrateForms() {
  const targetCol = targetDb.collection('tenants').doc(TARGET_TENANT_ID).collection('mod_forms');
  const snap = await sourceDb.collection('form_templates').get();
  const ops = [];

  snap.forEach((docSnap) => {
    const d = docSnap.data();
    const config = d.config ? { ...d.config } : {};
    if (Array.isArray(config.fields)) {
      config.fields = config.fields.map((f) => ({ ...f, map_to: mapLegacyFieldKey(f.map_to) }));
    }
    ops.push({
      ref: targetCol.doc(`desb_${docSnap.id}`),
      data: { ...d, id: `desb_${docSnap.id}`, config, migratedFrom: SOURCE_PROJECT_ID, migratedAt: new Date().toISOString() },
    });
  });

  await commitBatchOps(ops);
  return { formsCount: snap.size };
}

async function migrateMedia(urlMap) {
  const targetCol = targetDb.collection('tenants').doc(TARGET_TENANT_ID).collection('sdo_media_items');
  const ops = [];
  let total = 0;

  for (const colName of ['media', 'lea_media']) {
    const snap = await sourceDb.collection(colName).get();
    total += snap.size;
    snap.forEach((docSnap) => {
      const d = replaceUrlsDeep(docSnap.data(), urlMap);
      ops.push({
        ref: targetCol.doc(`desb_${colName}_${docSnap.id}`),
        data: { ...d, id: `desb_${colName}_${docSnap.id}`, migratedFrom: `${SOURCE_PROJECT_ID}/${colName}` },
      });
    });
  }

  await commitBatchOps(ops);
  return { mediaCount: total };
}

async function main() {
  console.log(`\n=== Migration: ${SOURCE_PROJECT_ID} (db: ${SOURCE_DATABASE_ID}) -> ${TARGET_PROJECT_ID}/tenants/${TARGET_TENANT_ID} ===`);
  console.log(`Mode: ${EXECUTE ? 'EXECUTE (LIVE WRITE)' : 'DRY-RUN (READ ONLY)'}\n`);

  const storageRes = await copyStorageFiles();
  console.log('Storage:', { totalFiles: storageRes.totalFiles, copiedCount: storageRes.copiedCount });

  const tenantRes = await provisionAzorTenant(storageRes.urlMap);
  console.log('Tenant & Branding & Nedarim Keys:', { logoUrl: tenantRes.logoUrl, hasNedarimKeys: tenantRes.hasNedarimKeys });

  const contactsRes = await migrateContacts();
  console.log('Contacts:', contactsRes);

  const pagesRes = await migratePages(storageRes.urlMap, tenantRes.globalSettings);
  console.log('Pages:', pagesRes);

  const formsRes = await migrateForms();
  console.log('Forms:', formsRes);

  const mediaRes = await migrateMedia(storageRes.urlMap);
  console.log('Media:', mediaRes);

  console.log('\nDone!');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
