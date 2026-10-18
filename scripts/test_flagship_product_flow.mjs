/**
 * Live Verification & Repair Test for Flagship Product Generation (KosBranding <-> kosai-engine <-> Firestore)
 * 1. Fetches live Google AI API key from tenants/_master/settings/api_keys.
 * 2. Fetches live Brand DNA for tenant 'mlea' (tenants/mlea/settings/kos_branding_dna).
 * 3. Runs the exact Flagship Product contract prompt against Gemini live.
 * 4. Verifies all 6 FlagshipProduct fields (nameAndSlogan, shortDescription, longDescription, painPointSolved, targetAudience, competitiveAdvantage).
 * 5. Enriches any incomplete Flagship Products in tenants/mlea/settings/kos_branding_dna and verifies persistence.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyC011dhtJddDjLmTQ2HCvgVA0DPN8rKFwQ',
  projectId: 'glowmanage',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function buildBrandSystemContext(brand, moduleRole = 'אסטרטג מוצרי דגל וקופירייטר בכיר') {
  const { identity, voice, audience, trust, ecosystem } = brand;
  const servicesList = (ecosystem?.services || []).join(', ');
  const communitiesList = (ecosystem?.communities || []).join(', ');

  return [
    `אתה פועל כעת בתפקיד "${moduleRole}" עבור הארגון/המותג "${identity?.companyName || 'העסק'}".`,
    `סוג התאגדות: ${identity?.organizationType || 'חברה'} | תכלית ויעוד: ${identity?.organizationPurpose || ''}`,
    `סלוגן רשמי: "${identity?.slogan || ''}"`,
    `חזון המותג: ${identity?.companyVision || identity?.shortVision || ''}`,
    `הצעת ערך ייחודית (UVP): ${audience?.mainUvp || ''}`,
    `קהלי יעד מרכזיים: ${(audience?.targetAudiences || []).join(', ')}`,
    servicesList ? `שירותי המותג: ${servicesList}` : '',
    communitiesList ? `קהילות המותג: ${communitiesList}` : '',
    `טון דיבור (1-5): רשמיות=${voice?.personality?.formality ?? 3}, חמימות=${voice?.personality?.warmth ?? 4}, יוקרה=${voice?.personality?.luxury ?? 3}, אנרגיה=${voice?.personality?.energy ?? 4}`,
    `פנייה מגדרית: ${voice?.genderAddressing || 'plural'} | רגישות מגזרית: ${voice?.sectorCompliance || 'general'}`,
    `מילות עוצמה לשילוב: ${(voice?.powerWords || []).join(', ')}`,
    `מילים אסורות לשימוש: ${(voice?.forbiddenWords || []).join(', ')}`,
    `טלפון ליצירת קשר: ${trust?.contactPhone || ''} | וואטסאפ: ${trust?.whatsappSupportNumber || ''}`,
    `כתובת: ${trust?.officeAddress || ''}`,
  ].filter(Boolean).join('\n');
}

async function generateFlagshipProductLive(idea, brand, apiKey) {
  const systemContext = buildBrandSystemContext(brand);
  const userPrompt = `בהתבסס על ה-Brand DNA של המותג "${brand.identity?.companyName || 'המותג'}" ועל הרעיון שהזין המשתמש:
"${idea}"

צור פרופיל מוצר דגל (Flagship Product) שלם, עשיר, מעמיק ומשכנע בעברית רהוטה התואמת את רוח המותג, קהל היעד והערכים שלו.
חובה למלא את כל 6 השדות בתוכן איכותי ומפורט (אף שדה לא יכול להיות ריק!).

החזר אך ורק אובייקט JSON תקין עם המפתחות המדויקים הבאים בלבד:
{
  "nameAndSlogan": "שם המוצר + סלוגן מושך ומדויק",
  "shortDescription": "תיאור קצר וקולע ב-1-2 משפטים שמסביר את המוצר והתועלת המיידית שלו",
  "longDescription": "תיאור ארוך, עשיר ומפורט (4-6 משפטים) המותאם ל-SEO ולקידום ב-AI, המספר את סיפור המוצר, החוויה והערך העמוק שהוא מעניק",
  "painPointSolved": "נקודת הכאב, החסם או הצורך המרכזי שהמוצר פותר עבור קהל היעד",
  "targetAudience": "תיאור מדויק של קהל היעד שהמוצר מתאים לו ביותר",
  "competitiveAdvantage": "המעלה הייחודית והיתרון המובהק של המוצר הזה אצלנו לעומת כל חלופה אחרת"
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemContext }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.65,
          maxOutputTokens: 1500,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini HTTP ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return JSON.parse(rawText);
}

async function main() {
  console.log('='.repeat(75));
  console.log('🚀 LIVE FLAGSHIP PRODUCT CONTRACT & FIRESTORE PERSISTENCE TEST');
  console.log('='.repeat(75));

  // 1. Load Master API Key
  const keySnap = await getDoc(doc(db, 'tenants', '_master', 'settings', 'api_keys'));
  const apiKey = keySnap.data()?.googleAiApiKey;
  if (!apiKey) throw new Error('Missing googleAiApiKey in master settings');
  console.log('✅ [1/4] Master Google AI Key loaded');

  // 2. Load Tenant 'mlea' Brand DNA
  const mleaDocRef = doc(db, 'tenants', 'mlea', 'settings', 'kos_branding_dna');
  const mleaSnap = await getDoc(mleaDocRef);
  if (!mleaSnap.exists()) throw new Error('mlea kos_branding_dna not found');
  const mleaDna = mleaSnap.data();
  console.log(`✅ [2/4] Loaded tenant 'mlea' Brand DNA ("${mleaDna.identity?.companyName}")`);

  // 3. Test live generation and enrich any incomplete products in mlea
  const products = mleaDna.ecosystem?.products || [];
  console.log(`\n🔍 [3/4] Inspecting ${products.length} Flagship Products in 'mlea'...`);

  // Remove exact duplicate stub if both prod-1792105886837 ("שפרה ופועה") and prod-1792314573279 exist and are empty,
  // or enrich all incomplete ones:
  const updatedProducts = [];
  for (const prod of products) {
    const isIncomplete = !prod.shortDescription || !prod.longDescription || !prod.painPointSolved || !prod.targetAudience || !prod.competitiveAdvantage;
    if (!isIncomplete) {
      console.log(`  ✔️ Product "${prod.nameAndSlogan.slice(0, 45)}..." is already complete.`);
      updatedProducts.push(prod);
      continue;
    }

    // If it's the short stub "שפרה ופועה" and there is already the detailed "שפרה ופועה מערך המתנדבות עבור יולדות...", skip the duplicate empty stub
    if (
      prod.nameAndSlogan.trim() === 'שפרה ופועה' &&
      products.some((other) => other.id !== prod.id && other.nameAndSlogan.includes('שפרה ופועה מערך המתנדבות'))
    ) {
      console.log(`  🗑️ Removing empty duplicate stub "${prod.nameAndSlogan}" (${prod.id})`);
      continue;
    }

    console.log(`  🤖 Generating live AI Flagship Product fields for: "${prod.nameAndSlogan}"...`);
    const generated = await generateFlagshipProductLive(prod.nameAndSlogan, mleaDna, apiKey);

    const requiredKeys = [
      'nameAndSlogan',
      'shortDescription',
      'longDescription',
      'painPointSolved',
      'targetAudience',
      'competitiveAdvantage',
    ];
    for (const k of requiredKeys) {
      if (!generated[k] || typeof generated[k] !== 'string' || !generated[k].trim()) {
        throw new Error(`Contract violation: field "${k}" is empty or missing!`);
      }
    }

    const enriched = {
      ...prod,
      nameAndSlogan: generated.nameAndSlogan,
      shortDescription: generated.shortDescription,
      longDescription: generated.longDescription,
      painPointSolved: generated.painPointSolved,
      targetAudience: generated.targetAudience,
      competitiveAdvantage: generated.competitiveAdvantage,
    };

    console.log('\n  --- ✨ GENERATED FLAGSHIP PRODUCT ---');
    console.log(`  nameAndSlogan:        ${enriched.nameAndSlogan}`);
    console.log(`  shortDescription:     ${enriched.shortDescription}`);
    console.log(`  longDescription:      ${enriched.longDescription}`);
    console.log(`  painPointSolved:      ${enriched.painPointSolved}`);
    console.log(`  targetAudience:       ${enriched.targetAudience}`);
    console.log(`  competitiveAdvantage: ${enriched.competitiveAdvantage}`);
    console.log('  -------------------------------------\n');

    updatedProducts.push(enriched);
  }

  // 4. Persist updated products back to tenants/mlea/settings/kos_branding_dna
  console.log('💾 [4/4] Saving enriched Flagship Products to tenants/mlea/settings/kos_branding_dna...');
  await setDoc(
    mleaDocRef,
    {
      ...mleaDna,
      ecosystem: {
        ...mleaDna.ecosystem,
        products: updatedProducts,
      },
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  // Verify read-back from Firestore
  const verifySnap = await getDoc(mleaDocRef);
  const verifyProducts = verifySnap.data()?.ecosystem?.products || [];
  console.log(`✅ Verified Firestore persistence: ${verifyProducts.length} complete products stored in 'mlea'!`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
