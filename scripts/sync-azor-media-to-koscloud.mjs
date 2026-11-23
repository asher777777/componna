import { createRequire } from 'module';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const admin = require('../functions/node_modules/firebase-admin/lib/index.js');

const TARGET_PROJECT_ID = 'glowmanage';
const TARGET_TENANT_ID = 'azor';
const TARGET_BUCKET = 'glowmanage.firebasestorage.app';

const HABAD_PUBLIC_DIR = 'C:/Users/ovt57/.gemini/antigravity/brain/50b8c10a-75eb-43fd-9675-56aa9088b691/scratch/habad/public';

const app = admin.initializeApp(
  {
    credential: admin.credential.applicationDefault(),
    projectId: TARGET_PROJECT_ID,
    storageBucket: TARGET_BUCKET,
  },
  'sync-azor-koscloud'
);

const db = app.firestore();
const bucket = app.storage().bucket(TARGET_BUCKET);

function buildDownloadUrl(filePath, token) {
  return `https://firebasestorage.googleapis.com/v0/b/${TARGET_BUCKET}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;
}

function replacePathsDeep(obj, pathMap) {
  if (typeof obj === 'string') {
    let out = obj;
    for (const [oldPath, newUrl] of pathMap.entries()) {
      if (out === oldPath || out.includes(oldPath)) {
        out = out.split(oldPath).join(newUrl);
      }
    }
    return out;
  }
  if (Array.isArray(obj)) return obj.map((item) => replacePathsDeep(item, pathMap));
  if (obj && typeof obj === 'object') {
    const res = {};
    for (const [k, v] of Object.entries(obj)) res[k] = replacePathsDeep(v, pathMap);
    return res;
  }
  return obj;
}

async function uploadStaticPublicImages() {
  const staticFiles = [
    { local: path.join(HABAD_PUBLIC_DIR, 'images/hero-shabbat.png'), webPath: '/images/hero-shabbat.png', name: 'hero-shabbat.png' },
    { local: path.join(HABAD_PUBLIC_DIR, 'images/shaliach-family.png'), webPath: '/images/shaliach-family.png', name: 'shaliach-family.png' },
    { local: path.join(HABAD_PUBLIC_DIR, 'donation_hero_chabad_1778761136809.png'), webPath: '/donation_hero_chabad_1778761136809.png', name: 'donation_hero_chabad.png' },
  ];

  const pathMap = new Map();
  for (const item of staticFiles) {
    if (!fs.existsSync(item.local)) continue;
    const destPath = `tenants/${TARGET_TENANT_ID}/media/static_${item.name}`;
    const token = crypto.randomUUID();
    const buffer = fs.readFileSync(item.local);
    await bucket.file(destPath).save(buffer, {
      metadata: {
        contentType: 'image/png',
        metadata: { firebaseStorageDownloadTokens: token },
      },
    });
    pathMap.set(item.webPath, buildDownloadUrl(destPath, token));
  }
  return pathMap;
}

async function syncBucketToKosCloudStore() {
  const [files] = await bucket.getFiles({ prefix: `tenants/${TARGET_TENANT_ID}/media/` });
  const mediaCol = db.collection('tenants').doc(TARGET_TENANT_ID).collection('sdo_media_items');
  const existingSnap = await mediaCol.get();
  const existingUrls = new Set();
  existingSnap.forEach((d) => {
    const u = d.data()?.url;
    if (u) existingUrls.add(u.split('?')[0]);
  });

  const batch = db.batch();
  let addedToKosCloud = 0;

  for (const file of files) {
    if (file.name.endsWith('/')) continue;
    const [meta] = await file.getMetadata();
    let token = meta?.metadata?.firebaseStorageDownloadTokens;
    if (!token) {
      token = crypto.randomUUID();
      await file.setMetadata({ metadata: { ...(meta?.metadata || {}), firebaseStorageDownloadTokens: token } });
    }
    const url = buildDownloadUrl(file.name, token);
    const baseUrl = url.split('?')[0];
    if (!existingUrls.has(baseUrl)) {
      const fileName = file.name.split('/').pop() || 'media';
      const docId = `storage_${crypto.createHash('md5').update(file.name).digest('hex').slice(0, 12)}`;
      const contentType = meta?.contentType || 'image/jpeg';
      batch.set(mediaCol.doc(docId), {
        id: docId,
        name: fileName,
        url,
        type: contentType.startsWith('video/') ? 'video' : 'image',
        mimeType: contentType,
        size: Number(meta?.size || 0),
        folder: 'מיובא מאתר אזור',
        tenantId: TARGET_TENANT_ID,
        createdAt: meta?.timeCreated || new Date().toISOString(),
        migratedFrom: 'desborecontrol-storage',
      }, { merge: true });
      addedToKosCloud++;
    }
  }

  if (addedToKosCloud > 0) {
    await batch.commit();
  }
  return { totalBucketFiles: files.length, addedToKosCloud };
}

async function updatePagesAndLivePosts(pathMap) {
  const pagesCol = db.collection('tenants').doc(TARGET_TENANT_ID).collection('kos_web_ai_documents');
  const snap = await pagesCol.get();
  const pageDocs = new Map();
  const slugLookup = new Map();

  const batch = db.batch();
  let updatedPages = 0;

  snap.forEach((docSnap) => {
    const updated = replacePathsDeep(docSnap.data(), pathMap);
    pageDocs.set(docSnap.id, updated);
    const slug = (updated.slug || '').toLowerCase();
    if (slug) slugLookup.set(slug, updated);
  });

  // Alias katyna -> kay
  if (slugLookup.has('kay') && !slugLookup.has('katyna')) {
    slugLookup.set('katyna', slugLookup.get('kay'));
  }

  for (const [docId, data] of pageDocs.entries()) {
    if (docId === 'desb_pages_home' && data.sections?.livePosts?.customPages) {
      data.sections.livePosts.customPages = data.sections.livePosts.customPages.map((item, idx) => {
        const cleanSlug = (item.linkUrl || item.id || '').replace(/^\/+/, '').toLowerCase();
        const targetPage = slugLookup.get(cleanSlug) || slugLookup.get(item.title?.toLowerCase() || '');
        if (targetPage) {
          const secs = targetPage.sections || {};
          const landingImg = secs.landingSection?.imageSrc && secs.landingSection.imageSrc !== '/placeholder.png'
            ? secs.landingSection.imageSrc
            : '';
          const bestImg =
            landingImg ||
            targetPage.seoSettings?.ogImage ||
            (secs.hero?.backgroundImage && secs.hero.backgroundImage !== '/placeholder.png' ? secs.hero.backgroundImage : '') ||
            (secs.mainContent?.imageSrc && secs.mainContent.imageSrc !== '/placeholder.png' ? secs.mainContent.imageSrc : '') ||
            item.imageUrl ||
            '';
          return {
            ...item,
            title: targetPage.pageTitle || item.title,
            excerpt: targetPage.seoSettings?.description || item.excerpt || '',
            imageUrl: bestImg,
            linkUrl: `/${targetPage.slug}`,
          };
        }
        return item;
      });
    }

    batch.set(pagesCol.doc(docId), data);
    updatedPages++;
  }

  await batch.commit();
  return { updatedPages };
}

async function main() {
  console.log('=== Syncing Azor Media to KosCloudStore & Updating Page Image URLs ===');
  const pathMap = await uploadStaticPublicImages();
  console.log('Uploaded static public images:', Array.from(pathMap.keys()));

  const syncRes = await syncBucketToKosCloudStore();
  console.log('KosCloudStore sync:', syncRes);

  const pagesRes = await updatePagesAndLivePosts(pathMap);
  console.log('Updated pages:', pagesRes);

  console.log('Done!');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed:', err);
    process.exit(1);
  });
