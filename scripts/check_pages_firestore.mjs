import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function check() {
  console.log('--- Checking Firestore collections for pages ---');
  const pathsToCheck = [
    'tenants/_master/kos_web_ai_documents',
    'tenants/_master/mod_pages_documents',
    'mod_pages_documents',
    'kos_web_ai_documents',
    'tenants/default/kos_web_ai_documents',
    'tenants/kushan/kos_web_ai_documents',
    'tenants/comona/kos_web_ai_documents',
    'content_strategies',
    'tenants/_master/settings',
    'tenants',
  ];

  for (const p of pathsToCheck) {
    try {
      const snap = await getDocs(collection(db, p));
      console.log(`Path: "${p}" -> ${snap.size} documents`);
      snap.forEach((d) => {
        const data = d.data();
        console.log(`  - docId: ${d.id}, slug: ${data.slug || 'no-slug'}, title: ${data.pageTitle || data.name || data.title || 'no-title'}, isArchive: ${data.isArchivePage || false}`);
      });
    } catch (err) {
      console.log(`Path: "${p}" -> error: ${err.message}`);
    }
  }
}

check().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
