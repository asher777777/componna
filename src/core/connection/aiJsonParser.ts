import { getModuleGeminiKey } from './tenantApiKeys';
import { TenantTokenTracker } from '../ai/tenantTokenTracker';
import { ROOT_TENANT_ID } from '../tenant/tenantResolver';

export interface AIJsonCredentialsResult {
  sdkType: 'admin_sdk' | 'client_sdk' | 'unknown';
  projectId: string;
  apiKey?: string;
  authDomain?: string;
  storageBucket?: string;
  appId?: string;
  clientEmail?: string;
  hostingUrl?: string;
  databaseId?: string;
  consoleLinks: {
    title: string;
    url: string;
    description: string;
  }[];
  explanation: string;
}

/**
 * Smartly parse JSON credentials (Service Account or Web Client Config) using Gemini / heuristic engine
 */
export async function parseJsonCredentialsWithAI(
  rawJsonString: string,
  geminiApiKey?: string
): Promise<AIJsonCredentialsResult> {
  const apiKey = geminiApiKey || getModuleGeminiKey();
  let parsedObj: any = null;

  try {
    parsedObj = JSON.parse(rawJsonString.trim());
  } catch (e) {
    throw new Error('הטקסט שהוזן אינו JSON תקין. נא לוודא את תקינות הפורמט.');
  }

  // Check if it is a Google Cloud / Firebase Service Account (Admin SDK)
  if (parsedObj.type === 'service_account' || parsedObj.private_key || parsedObj.client_email) {
    const projId = parsedObj.project_id || '';
    return {
      sdkType: 'admin_sdk',
      projectId: projId,
      clientEmail: parsedObj.client_email,
      hostingUrl: projId ? `https://${projId}.web.app` : undefined,
      authDomain: projId ? `${projId}.firebaseapp.com` : undefined,
      storageBucket: projId ? `${projId}.firebasestorage.app` : undefined,
      consoleLinks: [
        {
          title: 'מפתחות שירות והרשאות (Service Accounts)',
          url: `https://console.firebase.google.com/project/${projId}/settings/serviceaccounts/adminsdk`,
          description: 'יצירת מפתחות חדשים והגדרת הרשאות Cloud Functions'
        },
        {
          title: 'מסד נתונים Firestore Database',
          url: `https://console.firebase.google.com/project/${projId}/firestore`,
          description: 'צפייה בקולקציות ובמסמכים'
        },
        {
          title: 'אחסון קבצים (Firebase Storage)',
          url: `https://console.firebase.google.com/project/${projId}/storage`,
          description: 'ניהול Bucket של סרטונים ותמונות'
        },
        {
          title: 'הגדרות אירוח (Firebase Hosting)',
          url: `https://console.firebase.google.com/project/${projId}/hosting`,
          description: 'ניהול דומיינים וכתובות האפליקציה'
        }
      ],
      explanation: 'זוהה קובץ מפתח שירות (Admin SDK / Service Account). מעניק הרשאות מלאות בצד השרת ל-Firestore ו-Hosting.'
    };
  }

  // Check if it is a Firebase Web Client SDK config
  if (parsedObj.apiKey || parsedObj.authDomain || (parsedObj.projectId && parsedObj.appId)) {
    const projId = parsedObj.projectId || '';
    return {
      sdkType: 'client_sdk',
      projectId: projId,
      apiKey: parsedObj.apiKey,
      authDomain: parsedObj.authDomain || (projId ? `${projId}.firebaseapp.com` : undefined),
      storageBucket: parsedObj.storageBucket || (projId ? `${projId}.firebasestorage.app` : undefined),
      appId: parsedObj.appId,
      hostingUrl: projId ? `https://${projId}.web.app` : undefined,
      consoleLinks: [
        {
          title: 'הגדרות אפליקציית Web (Client SDK)',
          url: `https://console.firebase.google.com/project/${projId}/settings/general`,
          description: 'מפתחות Web API ופרטי חיבור Frontend'
        },
        {
          title: 'מסד נתונים Firestore Database',
          url: `https://console.firebase.google.com/project/${projId}/firestore`,
          description: 'צפייה בקולקציות ומסמכים'
        },
        {
          title: 'אחסון קבצים (Firebase Storage)',
          url: `https://console.firebase.google.com/project/${projId}/storage`,
          description: 'ניהול קבצי מדיה, סרטונים ותמונות'
        },
        {
          title: 'אימות משתמשים (Firebase Auth)',
          url: `https://console.firebase.google.com/project/${projId}/authentication/users`,
          description: 'ניהול שיטות התחברות ומשתמשים רשומים'
        }
      ],
      explanation: 'זוהה קובץ הגדרות לקוח (Web Client SDK). משמש לחיבור ישיר ומאובטח מה-Frontend.'
    };
  }

  // If unrecognized structure, invoke KOSAI AI Monopoly gateway to analyze custom JSON
  if (apiKey && apiKey.length > 10) {
    try {
      const prompt = `נתח את ה-JSON הבא וחלץ מתוכו מפתחות DB ו-Hosting:
${rawJsonString}
החזר JSON בלבד:
{"sdkType":"admin_sdk|client_sdk|unknown","projectId":"string","apiKey":"string","authDomain":"string","storageBucket":"string","appId":"string","clientEmail":"string","hostingUrl":"string","explanation":"הסבר תמציתי"}`;

      const { executeKosaiAi } = await import('../../modules/KosAi/modelsAiService/executeKosaiAi');
      const kosaiRes = await executeKosaiAi<any>('db-connector-hub', prompt, {
        model: 'gemini-3.8-flash-lite',
        responseMimeType: 'application/json',
        temperature: 0.2,
        maxOutputTokens: 400,
        customApiKey: apiKey,
      });

      if (kosaiRes?.data && typeof kosaiRes.data === 'object') {
        const geminiResult = kosaiRes.data;
        const projId = geminiResult.projectId || '';
        return {
          ...geminiResult,
          consoleLinks: [
            {
              title: 'הגדרות פרויקט ב-Firebase Console',
              url: projId ? `https://console.firebase.google.com/project/${projId}/settings/general` : 'https://console.firebase.google.com',
              description: 'מעבר מהיר לפרויקט'
            }
          ]
        };
      }
    } catch (e) {
      console.warn('[CredentialsParser] KOSAI custom json parser fallback failed:', e);
    }
  }

  return {
    sdkType: 'unknown',
    projectId: '',
    consoleLinks: [
      {
        title: 'Firebase Console',
        url: 'https://console.firebase.google.com',
        description: 'לוח הבקרה הראשי של Firebase'
      }
    ],
    explanation: 'לא זוהה מבנה תקני של Firebase. אנא ודא שהעתקת את מפתח ה-JSON המלא.'
  };
}
