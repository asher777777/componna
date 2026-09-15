import React from 'react';
import { CrmGroupsProvider } from './context/CrmGroupsContext';
import { CrmGroupsMainView } from './components/CrmGroupsMainView';
import { getApps, initializeApp } from 'firebase/app';
import { useSystemConnection } from '../../core/connection/SystemConnectionContext';

let standaloneApp = getApps().length > 0 ? getApps()[0] : undefined;
try {
  if (!standaloneApp && import.meta.env.VITE_FIREBASE_API_KEY) {
    standaloneApp = initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    });
  }
} catch (e) {
  console.warn('Could not initialize standalone Firebase App in CrmGroupsHub:', e);
}

export const CrmGroupsHubStandaloneView: React.FC = () => {
  let systemFirebaseApp = standaloneApp;
  let greenApiConfig = undefined;

  try {
    const sys = useSystemConnection();
    if (sys?.firebaseApp) {
      systemFirebaseApp = sys.firebaseApp;
    }
    if (sys?.apiKeys) {
      greenApiConfig = {
        idInstance: sys.apiKeys.greenApiInstanceId || (sys.apiKeys as any).greenApiIdInstance || '',
        apiTokenInstance: sys.apiKeys.greenApiToken || (sys.apiKeys as any).greenApiTokenInstance || '',
        apiUrl: (sys.apiKeys as any).greenApiUrl || 'https://api.green-api.com',
      };
    }
  } catch (e) {}

  return (
    <CrmGroupsProvider
      firebaseApp={systemFirebaseApp}
      greenApiCredentials={greenApiConfig}
      ownerId="default_user"
    >
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <CrmGroupsMainView />
      </div>
    </CrmGroupsProvider>
  );
};
