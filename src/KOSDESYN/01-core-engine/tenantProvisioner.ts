import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { MARKET_BLUEPRINTS, MarketBlueprint } from './marketBlueprints';
import comonaConfig from '../../comona-firebase-config.json';

const app = !getApps().some(a => a.name === 'comona-provisioner')
  ? initializeApp(comonaConfig, 'comona-provisioner')
  : getApp('comona-provisioner');

const db = getFirestore(app);

export interface ProvisionTenantInput {
  tenantId: string;
  businessName: string;
  marketId: 'real_estate' | 'legal_firm' | 'beauty_clinic' | string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  customTagline?: string;
}

/**
 * 🚀 מחולל לקוחות אוטומטי (Auto Tenant Provisioner)
 * מקים טננט שלם ומושלם ב-Firestore בתוך 2 שניות!
 */
export async function provisionNewTenant(input: ProvisionTenantInput) {
  const { tenantId, businessName, marketId, phone, whatsapp, address, city, customTagline } = input;
  const blueprint = MARKET_BLUEPRINTS[marketId] || MARKET_BLUEPRINTS.real_estate;

  console.log(`[Tenant Provisioner] Initializing tenant "${tenantId}" for market "${blueprint.marketName}"...`);

  // 1. הרכבת מסמך ה-Tenant
  const tenantDocData = {
    ...blueprint.tenantTemplate,
    id: tenantId,
    name: businessName,
    tagline: customTagline || blueprint.tenantTemplate.tagline || 'שירות ומצוינות ללא פשרות',
    phone: phone || blueprint.tenantTemplate.phone || '03-5551234',
    whatsapp: whatsapp || phone || '0501234567',
    address: address ? (city ? `${address}, ${city}` : address) : (blueprint.tenantTemplate.address || 'תל אביב'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active'
  };

  // שמירת מסמך ראשי ב-tenants/{tenantId}
  await setDoc(doc(db, 'tenants', tenantId), tenantDocData, { merge: true });
  console.log(`✓ Created tenants/${tenantId}`);

  // 2. הזנת קולקציית ה-Cognitive Nodes
  for (const node of blueprint.cognitiveNodesTemplate) {
    const nodeData = {
      ...node,
      tenantId
    };
    await setDoc(doc(db, 'tenants', tenantId, 'cognitive_nodes', node.id), nodeData, { merge: true });
  }
  console.log(`✓ Seeded ${blueprint.cognitiveNodesTemplate.length} cognitive nodes`);

  // 3. הזנת מוצרים / שירותים לדוגמה (Products)
  for (const prod of blueprint.productsTemplate) {
    await setDoc(doc(db, 'tenants', tenantId, 'products', prod.id), prod, { merge: true });
  }
  console.log(`✓ Seeded ${blueprint.productsTemplate.length} products`);

  return {
    success: true,
    tenantId,
    marketName: blueprint.marketName,
    viewUrl: `http://localhost:3000/kos26?tenant=${tenantId}`
  };
}
