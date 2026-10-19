const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

async function inspect() {
  console.log('--- Inspecting master and settings api_keys ---');
  try {
    const masterSnap = await db.collection('tenants').doc('_master').collection('settings').doc('api_keys').get();
    if (masterSnap.exists) {
      const d = masterSnap.data();
      console.log('_master settings/api_keys:', {
        greenApiInstanceId: d.greenApiInstanceId,
        hasToken: Boolean(d.greenApiToken),
        hasGoogleAiKey: Boolean(d.googleAiApiKey || d.geminiApiKey),
      });
    } else {
      console.log('_master settings/api_keys does not exist');
    }
  } catch (e) {
    console.error('Error reading _master keys:', e.message);
  }

  try {
    const rootSnap = await db.collection('settings').doc('api_keys').get();
    if (rootSnap.exists) {
      const d = rootSnap.data();
      console.log('root settings/api_keys:', {
        greenApiInstanceId: d.greenApiInstanceId,
        hasToken: Boolean(d.greenApiToken),
        hasGoogleAiKey: Boolean(d.googleAiApiKey || d.geminiApiKey),
      });
    } else {
      console.log('root settings/api_keys does not exist');
    }
  } catch (e) {
    console.error('Error reading root keys:', e.message);
  }

  // Check tenants
  try {
    const tenants = await db.collection('tenants').get();
    console.log('Total tenants:', tenants.size);
    for (const t of tenants.docs) {
      const keysSnap = await db.collection('tenants').doc(t.id).collection('settings').doc('api_keys').get();
      if (keysSnap.exists) {
        const d = keysSnap.data();
        if (d.greenApiInstanceId || d.greenApiToken) {
          console.log('Tenant ' + t.id + ' has greenApiInstanceId: ' + d.greenApiInstanceId);
        }
      }
    }
  } catch (e) {
    console.error('Error querying tenants:', e.message);
  }

  // Check recent wa_bot_chats
  try {
    const chatsSnap = await db.collection('wa_bot_chats').orderBy('lastUpdatedAt', 'desc').limit(5).get();
    if (!chatsSnap.empty) {
      console.log('Recent wa_bot_chats count:', chatsSnap.size);
      chatsSnap.docs.forEach(doc => {
        const d = doc.data();
        console.log('Chat:', doc.id, 'lastUpdatedAt:', d.lastUpdatedAt, 'messagesCount:', d.messages ? d.messages.length : 0);
      });
    } else {
      console.log('wa_bot_chats is empty');
    }
  } catch (e) {
    console.log('Error reading wa_bot_chats:', e.message);
  }

  // Check processed_webhook_messages
  try {
    const procSnap = await db.collection('processed_webhook_messages').limit(5).get();
    console.log('processed_webhook_messages count:', procSnap.size);
  } catch (e) {
    console.log('Error reading processed_webhook_messages:', e.message);
  }
}

inspect().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
