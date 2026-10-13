import { Contact, AIInteraction } from '../types';

export interface AIJsonCredentialsResult {
  sdkType: 'admin_sdk' | 'client_sdk' | 'unknown';
  projectId: string;
  apiKey?: string;
  authDomain?: string;
  storageBucket?: string;
  appId?: string;
  clientEmail?: string;
  hostingUrl?: string;
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
  const apiKey = geminiApiKey || (import.meta.env.VITE_GEMINI_API_KEY as string);
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
          title: 'אימות משתמשים (Firebase Auth)',
          url: `https://console.firebase.google.com/project/${projId}/authentication/users`,
          description: 'ניהול שיטות התחברות ומשתמשים רשומים'
        },
        {
          title: 'חוקי אבטחה (Firestore Rules)',
          url: `https://console.firebase.google.com/project/${projId}/firestore/rules`,
          description: 'אימות הרשאות קריאה וכתיבה ללקוחות'
        }
      ],
      explanation: 'זוהה קובץ הגדרות לקוח (Web Client SDK). משמש לחיבור ישיר ומאובטח מה-Frontend.'
    };
  }

  // If unrecognized structure, return structured unknown result without client-side API violation
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
