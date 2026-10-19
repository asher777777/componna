import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyC011dhtJddDjLmTQ2HCvgVA0DPN8rKFwQ',
  authDomain: 'glowmanage.firebaseapp.com',
  projectId: 'glowmanage',
  storageBucket: 'glowmanage.firebasestorage.app',
  messagingSenderId: '174552708887',
  appId: '1:174552708887:web:70b91e3994c66db0336952',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SYSTEM_COLLECTIONS = {
  PAGES: 'kos_web_ai_documents',
};
const ROOT_TENANT_ID = '_master';

function resolveEffectiveTenant(tenantId) {
  if (!tenantId || tenantId === ROOT_TENANT_ID || tenantId === '_master') {
    return ROOT_TENANT_ID;
  }
  return tenantId;
}

function getCollectionName(tenantId) {
  const eff = resolveEffectiveTenant(tenantId);
  return eff === ROOT_TENANT_ID ? `tenants/_master/${SYSTEM_COLLECTIONS.PAGES}` : `tenants/${eff}/${SYSTEM_COLLECTIONS.PAGES}`;
}

async function test(tenantId) {
  const eff = resolveEffectiveTenant(tenantId);
  const collPath = getCollectionName(eff);
  console.log(`Testing tenant: "${tenantId}" -> effective: "${eff}", collPath: "${collPath}"`);
  const colRef = collection(db, collPath);
  const snap = await getDocs(colRef);
  console.log(`Found ${snap.size} pages:`);
  snap.forEach(d => {
    const data = d.data();
    console.log(`  - [${d.id}] slug: "${data.slug}" title: "${data.pageTitle}" category: "${data.pageCategory}" isArchive: ${data.isArchivePage}`);
  });
}

async function main() {
  await test('_master');
  await test('mlea');
  await test('lea');
  await test(undefined);
  await test('default');
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
