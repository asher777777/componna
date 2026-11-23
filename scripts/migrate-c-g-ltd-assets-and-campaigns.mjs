import { createRequire } from 'module';
import crypto from 'crypto';

const require = createRequire(import.meta.url);
const admin = require('../functions/node_modules/firebase-admin/lib/index.js');

const EXECUTE = process.argv.includes('--execute');
const SOURCE_PROJECT_ID = 'c-g-ltd';
const TARGET_PROJECT_ID = 'glowmanage';
const TARGET_TENANT_ID = 'lea';
const SOURCE_BUCKET = 'c-g-ltd.firebasestorage.app';
const TARGET_BUCKET = 'glowmanage.firebasestorage.app';

const sourceApp = admin.initializeApp(
  {
    credential: admin.credential.applicationDefault(),
    projectId: SOURCE_PROJECT_ID,
    storageBucket: SOURCE_BUCKET,
  },
  'source-assets'
);
const targetApp = admin.initializeApp(
  {
    credential: admin.credential.applicationDefault(),
    projectId: TARGET_PROJECT_ID,
    storageBucket: TARGET_BUCKET,
  },
  'target-assets'
);

const sourceDb = sourceApp.firestore();
const targetDb = targetApp.firestore();
const sourceBucket = sourceApp.storage().bucket(SOURCE_BUCKET);
const targetBucket = targetApp.storage().bucket(TARGET_BUCKET);

function buildDownloadUrl(bucketName, filePath, token) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;
}

function replaceUrlsDeep(obj, urlMap) {
  if (typeof obj === 'string') {
    let out = obj;
    for (const [oldPrefix, newUrl] of urlMap.entries()) {
      if (out.includes(oldPrefix)) {
        // Match full firebase storage URL up to quote/whitespace
        const escaped = oldPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`${escaped}[^"'\\s<>]*`, 'g');
        out = out.replace(re, newUrl);
      }
    }
    return out;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => replaceUrlsDeep(item, urlMap));
  }
  if (obj && typeof obj === 'object') {
    const res = {};
    for (const [k, v] of Object.entries(obj)) {
      res[k] = replaceUrlsDeep(v, urlMap);
    }
    return res;
  }
  return obj;
}

async function copyStorageFiles() {
  const [files] = await sourceBucket.getFiles();
  const urlMap = new Map();
  let copiedCount = 0;
  let logoUrl = '';

  for (const file of files) {
    const srcPath = file.name;
    if (srcPath.endsWith('/')) continue;

    const cleanName = srcPath.replace(/^uploads\//, '');
    const destPath = `tenants/${TARGET_TENANT_ID}/media/${cleanName}`;
    const token = crypto.randomUUID();

    if (EXECUTE) {
      const [buffer] = await file.download();
      const [meta] = await file.getMetadata();
      const destFile = targetBucket.file(destPath);
      await destFile.save(buffer, {
        metadata: {
          contentType: meta.contentType || 'application/octet-stream',
          metadata: {
            firebaseStorageDownloadTokens: token,
          },
        },
      });
    }

    const newUrl = buildDownloadUrl(TARGET_BUCKET, destPath, token);
    const oldBase = `https://firebasestorage.googleapis.com/v0/b/${SOURCE_BUCKET}/o/${encodeURIComponent(srcPath)}`;
    urlMap.set(oldBase, newUrl);
    // Also map unencoded slash variant just in case
    urlMap.set(`https://firebasestorage.googleapis.com/v0/b/${SOURCE_BUCKET}/o/${srcPath}`, newUrl);

    if (cleanName.toLowerCase().includes('logo') && !logoUrl) {
      logoUrl = newUrl;
    }
    copiedCount++;
  }

  return { totalFiles: files.length, copiedCount, urlMap, logoUrl };
}

async function updateMediaAndPagesUrls(urlMap) {
  let mediaUpdated = 0;
  let pagesUpdated = 0;

  const mediaCol = targetDb.collection('tenants').doc(TARGET_TENANT_ID).collection('sdo_media_items');
  const mediaSnap = await mediaCol.get();
  const ops = [];

  mediaSnap.forEach((docSnap) => {
    const data = docSnap.data();
    const updated = replaceUrlsDeep(data, urlMap);
    if (JSON.stringify(updated) !== JSON.stringify(data)) {
      mediaUpdated++;
      ops.push({ ref: docSnap.ref, data: updated });
    }
  });

  const pagesCol = targetDb.collection('tenants').doc(TARGET_TENANT_ID).collection('kos_web_ai_documents');
  const pagesSnap = await pagesCol.get();
  pagesSnap.forEach((docSnap) => {
    const data = docSnap.data();
    const updated = replaceUrlsDeep(data, urlMap);
    if (JSON.stringify(updated) !== JSON.stringify(data)) {
      pagesUpdated++;
      ops.push({ ref: docSnap.ref, data: updated });
    }
  });

  if (EXECUTE && ops.length > 0) {
    for (let i = 0; i < ops.length; i += 400) {
      const batch = targetDb.batch();
      for (const op of ops.slice(i, i + 400)) {
        batch.set(op.ref, op.data);
      }
      await batch.commit();
    }
  }

  return { mediaUpdated, pagesUpdated };
}

async function updateBranding(logoUrl) {
  if (!logoUrl) return { updated: false };
  const brandingRef = targetDb
    .collection('tenants')
    .doc(TARGET_TENANT_ID)
    .collection('settings')
    .doc('kos_branding_dna');

  const snap = await brandingRef.get();
  const existing = snap.exists ? snap.data() || {} : {};
  const existingIdentity = existing.identity || {};

  const updatedIdentity = {
    ...existingIdentity,
    logoUrl,
    companyName: existingIdentity.companyName || 'מרכז לאה',
  };

  if (EXECUTE) {
    await brandingRef.set(
      {
        identity: updatedIdentity,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  }

  return { updated: true, logoUrl };
}

async function copyKesherKeys() {
  const srcSnap = await sourceDb.collection('configs').doc('global').get();
  if (!srcSnap.exists) return { copied: false };
  const src = srcSnap.data() || {};

  const kesherData = {};
  if (src.kesherUserName) kesherData.kesherUserName = src.kesherUserName;
  if (src.kesherApiKey) kesherData.kesherApiKey = src.kesherApiKey;
  if (src.kesherPaymentPageId) kesherData.kesherPaymentPageId = src.kesherPaymentPageId;
  if (src.kesherEzCountToken) kesherData.kesherEzCountToken = src.kesherEzCountToken;

  if (EXECUTE && Object.keys(kesherData).length > 0) {
    await targetDb
      .collection('tenants')
      .doc(TARGET_TENANT_ID)
      .collection('settings')
      .doc('api_keys')
      .set(kesherData, { merge: true });
  }

  return { copied: true, keys: Object.keys(kesherData) };
}

async function copyCampaignSubcollections() {
  const srcCampaignsSnap = await sourceDb.collection('campaigns').get();
  let donationsCopied = 0;
  let ambassadorsCopied = 0;
  const ops = [];

  for (const campDoc of srcCampaignsSnap.docs) {
    const campId = campDoc.id;
    const targetCampRef = targetDb
      .collection('tenants')
      .doc(TARGET_TENANT_ID)
      .collection('mod_campaigns')
      .doc(campId);

    const donationsSnap = await campDoc.ref.collection('donations').get();
    donationsSnap.forEach((dDoc) => {
      donationsCopied++;
      ops.push({
        ref: targetCampRef.collection('donations').doc(dDoc.id),
        data: { ...dDoc.data(), id: dDoc.id, migratedFrom: 'c-g-ltd' },
      });
    });

    const ambassadorsSnap = await campDoc.ref.collection('ambassadors').get();
    ambassadorsSnap.forEach((aDoc) => {
      ambassadorsCopied++;
      ops.push({
        ref: targetCampRef.collection('ambassadors').doc(aDoc.id),
        data: { ...aDoc.data(), id: aDoc.id, migratedFrom: 'c-g-ltd' },
      });
    });
  }

  if (EXECUTE && ops.length > 0) {
    for (let i = 0; i < ops.length; i += 400) {
      const batch = targetDb.batch();
      for (const op of ops.slice(i, i + 400)) {
        batch.set(op.ref, op.data, { merge: true });
      }
      await batch.commit();
    }
  }

  return { donationsCopied, ambassadorsCopied };
}

async function main() {
  console.log(`\n=== Assets, Branding, Kesher & Campaign Subcollections Migration ===`);
  console.log(`Mode: ${EXECUTE ? 'EXECUTE (LIVE WRITE)' : 'DRY-RUN'}\n`);

  const storageRes = await copyStorageFiles();
  console.log('Storage:', {
    totalFiles: storageRes.totalFiles,
    copiedCount: storageRes.copiedCount,
    logoUrl: storageRes.logoUrl,
  });

  const urlUpdateRes = await updateMediaAndPagesUrls(storageRes.urlMap);
  console.log('Updated URLs in Firestore:', urlUpdateRes);

  const brandingRes = await updateBranding(storageRes.logoUrl);
  console.log('Branding:', brandingRes);

  const kesherRes = await copyKesherKeys();
  console.log('Kesher Keys:', kesherRes);

  const campSubRes = await copyCampaignSubcollections();
  console.log('Campaign Subcollections:', campSubRes);

  console.log('\nDone!');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
