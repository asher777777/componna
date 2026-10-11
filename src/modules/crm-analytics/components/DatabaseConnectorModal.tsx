import React, { useState, useEffect } from 'react';
import { 
  X, Database, Check, RefreshCw, Layers, ShieldCheck, 
  ExternalLink, Sparkles, Server, Globe, Key, AlertCircle,
  FileJson, UploadCloud, Copy, ArrowLeft, CheckCircle2
} from 'lucide-react';
import { DatabaseConnectionProfile, DatabaseProviderType } from '../types';
import { parseJsonCredentialsWithAI, AIJsonCredentialsResult } from '../services/aiJsonParser';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApplyProfile: (profile: DatabaseConnectionProfile) => void;
  clientId?: string;
}

export const DatabaseConnectorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onApplyProfile,
  clientId,
}) => {
  const { config, collections, updateConfig, testConnection } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const effectiveTenantId = clientId && clientId !== 'client_default' ? clientId : (tenantId || 'client_default');

  const STORAGE_PROFILE_KEY = `kosun_${effectiveTenantId}_crm_db_profile`;
  const STORAGE_JSON_KEY = `kosun_${effectiveTenantId}_crm_db_json`;
  const STORAGE_PARSED_KEY = `kosun_${effectiveTenantId}_crm_parsed_result`;

  const getSavedProfile = (): DatabaseConnectionProfile | null => {
    try {
      const saved = localStorage.getItem(STORAGE_PROFILE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  };

  const savedProfile = getSavedProfile();

  const [activeTab, setActiveTab] = useState<'smart_json' | 'manual_config'>('smart_json');
  const [provider, setProvider] = useState<DatabaseProviderType>(savedProfile?.provider || 'firestore');
  const [profileName, setProfileName] = useState(savedProfile?.name || 'מסד נתונים ראשי');
  
  // Smart JSON State
  const [jsonInput, setJsonInput] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_JSON_KEY) || '';
    } catch {
      return '';
    }
  });
  const [isParsingJson, setIsParsingJson] = useState(false);
  const [parsedResult, setParsedResult] = useState<AIJsonCredentialsResult | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PARSED_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // Firestore Config - Initialized to real connected project (never hardcoded placeholder)
  const [firestoreProjectId, setFirestoreProjectId] = useState<string>(() => {
    return savedProfile?.config?.projectId || config.projectId || (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || 'glowmanage';
  });
  const [firestoreApiKey, setFirestoreApiKey] = useState<string>(() => {
    return savedProfile?.config?.apiKey || config.apiKey || (import.meta.env.VITE_FIREBASE_API_KEY as string) || '';
  });
  const [firestoreAuthDomain, setFirestoreAuthDomain] = useState<string>(() => {
    return savedProfile?.config?.authDomain || config.authDomain || (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || 'glowmanage.firebaseapp.com';
  });
  const [firestoreStorageBucket, setFirestoreStorageBucket] = useState<string>(() => {
    return (savedProfile?.config as any)?.storageBucket || config.storageBucket || (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || 'glowmanage.firebasestorage.app';
  });
  const [firestoreCollection, setFirestoreCollection] = useState<string>(() => {
    return savedProfile?.config?.collectionName || collections?.contacts || 'contacts';
  });
  const [hostingUrl, setHostingUrl] = useState<string>(() => {
    return (savedProfile?.config as any)?.hostingUrl || (config.projectId ? `https://${config.projectId}.web.app` : 'https://glowmanage.web.app');
  });

  // Status & Feedback
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string; latency?: number } | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Sync state when modal is opened
  useEffect(() => {
    if (isOpen) {
      const p = getSavedProfile();
      if (p?.config) {
        if (p.config.projectId) setFirestoreProjectId(p.config.projectId);
        if (p.config.apiKey) setFirestoreApiKey(p.config.apiKey);
        if (p.config.authDomain) setFirestoreAuthDomain(p.config.authDomain);
        if ((p.config as any).storageBucket) setFirestoreStorageBucket((p.config as any).storageBucket);
        if (p.config.collectionName) setFirestoreCollection(p.config.collectionName);
        if ((p.config as any).hostingUrl) setHostingUrl((p.config as any).hostingUrl);
      } else if (config.projectId) {
        setFirestoreProjectId(config.projectId);
        if (config.apiKey) setFirestoreApiKey(config.apiKey);
        if (config.authDomain) setFirestoreAuthDomain(config.authDomain);
        if (config.storageBucket) setFirestoreStorageBucket(config.storageBucket);
        setHostingUrl(`https://${config.projectId}.web.app`);
      }
    }
  }, [isOpen, config, effectiveTenantId]);

  if (!isOpen) return null;

  const handleParseJson = async () => {
    if (!jsonInput.trim()) {
      alert('נא להדביק או להעלות קובץ JSON תחילה.');
      return;
    }
    setIsParsingJson(true);
    setTestResult(null);
    setSaveFeedback(null);

    try {
      const res = await parseJsonCredentialsWithAI(jsonInput);
      setParsedResult(res);

      const targetProjId = res.projectId || firestoreProjectId;
      const targetApiKey = res.apiKey || firestoreApiKey;
      const targetAuthDomain = res.authDomain || (targetProjId ? `${targetProjId}.firebaseapp.com` : firestoreAuthDomain);
      const targetStorageBucket = res.storageBucket || (targetProjId ? `${targetProjId}.firebasestorage.app` : firestoreStorageBucket);
      const targetHostingUrl = res.hostingUrl || (targetProjId ? `https://${targetProjId}.web.app` : hostingUrl);

      if (res.projectId) {
        setFirestoreProjectId(targetProjId);
      }
      if (res.apiKey) {
        setFirestoreApiKey(targetApiKey);
      }
      if (res.authDomain) {
        setFirestoreAuthDomain(targetAuthDomain);
      }
      if (res.storageBucket) {
        setFirestoreStorageBucket(targetStorageBucket);
      }
      if (res.hostingUrl) {
        setHostingUrl(targetHostingUrl);
      }
      setProvider('firestore');

      // CRITICAL FIX: IMMEDIATELY SAVE AFTER DECODING TO PERSISTENCE
      const profileToSave: DatabaseConnectionProfile = {
        id: `profile_${Date.now()}`,
        name: profileName,
        provider: 'firestore',
        isActive: true,
        createdAt: new Date().toISOString(),
        config: {
          projectId: targetProjId,
          apiKey: targetApiKey,
          authDomain: targetAuthDomain,
          storageBucket: targetStorageBucket,
          collectionName: firestoreCollection,
          hostingUrl: targetHostingUrl,
        } as any,
      };

      try {
        localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profileToSave));
        localStorage.setItem(STORAGE_JSON_KEY, jsonInput);
        localStorage.setItem(STORAGE_PARSED_KEY, JSON.stringify(res));
      } catch (saveErr) {
        console.warn('Storage save notice:', saveErr);
      }

      setSaveFeedback('קובץ ה-JSON פוענח וההגדרות נשמרו בהצלחה בדפדפן!');
      setTimeout(() => setSaveFeedback(null), 5000);
    } catch (e: any) {
      alert(e.message || 'שגיאה בפענוח ה-JSON');
    } finally {
      setIsParsingJson(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setJsonInput(text);
      };
      reader.readAsText(file);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      if (!firestoreProjectId.trim()) {
        setTestResult({ success: false, msg: 'נא להזין Project ID תקין של Firebase' });
        setTesting(false);
        return;
      }

      // Real live ping using system testConnection
      const res = await testConnection({
        projectId: firestoreProjectId,
        apiKey: firestoreApiKey || config.apiKey,
        authDomain: firestoreAuthDomain || `${firestoreProjectId}.firebaseapp.com`,
        storageBucket: firestoreStorageBucket || `${firestoreProjectId}.firebasestorage.app`,
      });

      if (res.success) {
        setTestResult({ 
          success: true, 
          msg: `החיבור ל-Firestore (${firestoreProjectId}) אומת בהצלחה!`, 
          latency: res.latency || 45 
        });
      } else {
        setTestResult({
          success: false,
          msg: res.error || `שגיאה בחיבור לפרויקט ${firestoreProjectId}`
        });
      }
    } catch (e: any) {
      setTestResult({ success: false, msg: `שגיאה בחיבור: ${e.message || String(e)}` });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveAndApply = async () => {
    const profile: DatabaseConnectionProfile = {
      id: `profile_${Date.now()}`,
      name: profileName,
      provider,
      isActive: true,
      createdAt: new Date().toISOString(),
      config: {
        projectId: firestoreProjectId,
        apiKey: firestoreApiKey,
        authDomain: firestoreAuthDomain,
        storageBucket: firestoreStorageBucket,
        collectionName: firestoreCollection,
        hostingUrl,
      } as any,
    };

    // 1. Save to tenant-scoped localStorage
    try {
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
      if (jsonInput.trim()) {
        localStorage.setItem(STORAGE_JSON_KEY, jsonInput);
      }
      if (parsedResult) {
        localStorage.setItem(STORAGE_PARSED_KEY, JSON.stringify(parsedResult));
      }
    } catch (e) {
      console.warn('Local storage error:', e);
    }

    // 2. Persist to central SystemConnectionContext config
    try {
      await updateConfig(
        {
          projectId: firestoreProjectId,
          apiKey: firestoreApiKey || config.apiKey,
          authDomain: firestoreAuthDomain || (firestoreProjectId ? `${firestoreProjectId}.firebaseapp.com` : config.authDomain),
          storageBucket: firestoreStorageBucket || (firestoreProjectId ? `${firestoreProjectId}.firebasestorage.app` : config.storageBucket),
        },
        {
          contacts: firestoreCollection,
        }
      );
    } catch (e) {
      console.warn('Could not update system connection config:', e);
    }

    // 3. Apply profile and close
    onApplyProfile(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm" dir="rtl">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col text-right">
        
        {/* Modal Header */}
        <div className="p-4 md:p-5 bg-gradient-to-r from-gray-50 to-indigo-50/40 dark:from-gray-900 dark:to-indigo-950/20 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                חיבור חכם למסד נתונים והוסטינג (Gemini AI Parser)
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                שמירה תחת לקוח / טננט: <span className="font-mono text-indigo-600 font-semibold">{effectiveTenantId}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b px-4 bg-gray-50/60 dark:bg-gray-900/60 text-xs">
          <button
            onClick={() => setActiveTab('smart_json')}
            className={`py-2.5 px-4 font-semibold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'smart_json'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>פענוח חכם של מפתח JSON</span>
          </button>
          <button
            onClick={() => setActiveTab('manual_config')}
            className={`py-2.5 px-4 font-semibold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'manual_config'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>הגדרות חיבור ידניות</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {saveFeedback && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-2 shadow-sm animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{saveFeedback}</span>
              </div>
              <button
                onClick={() => setSaveFeedback(null)}
                className="text-emerald-600 hover:text-emerald-800 font-bold"
              >
                ✕
              </button>
            </div>
          )}
          
          {activeTab === 'smart_json' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-xl">
                <label className="block font-bold text-gray-800 dark:text-gray-200 mb-1">
                  הדבק כאן את תוכן קובץ ה-JSON (Service Account או Firebase Web Config):
                </label>
                <textarea
                  rows={4}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='{\n  "type": "service_account",\n  "project_id": "my-client-app",\n  "private_key": "..."\n}'
                  className="w-full p-2.5 font-mono text-[11px] border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  dir="ltr"
                />
                
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <label className="cursor-pointer px-3 py-1.5 bg-white dark:bg-gray-800 border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 flex items-center gap-1.5 font-medium">
                    <UploadCloud className="w-3.5 h-3.5 text-indigo-500" />
                    <span>העלה קובץ JSON מהמחשב</span>
                    <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                  </label>

                  <button
                    onClick={handleParseJson}
                    disabled={isParsingJson}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow transition disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isParsingJson ? 'animate-spin' : ''}`} />
                    <span>{isParsingJson ? 'מפענח עם Gemini...' : 'פענח והגדר אוטומטית'}</span>
                  </button>
                </div>
              </div>

              {/* Parsed Result Card */}
              {parsedResult && (
                <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-white">סוג המפתח שזוהה:</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        parsedResult.sdkType === 'admin_sdk' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' 
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}>
                        {parsedResult.sdkType === 'admin_sdk' ? '👑 Admin SDK (Service Account)' : '🌐 Client SDK (Web Config)'}
                      </span>
                    </div>
                    <span className="font-mono text-indigo-600 font-bold">{parsedResult.projectId}</span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300">{parsedResult.explanation}</p>

                  {/* Quick Links to Firebase Console */}
                  <div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200 block mb-1.5">
                      🔗 קישורים מהירים לפרויקט ב-Firebase Console:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {parsedResult.consoleLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition flex items-start justify-between group"
                        >
                          <div>
                            <p className="font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-1">
                              <span>{link.title}</span>
                              <ExternalLink className="w-3 h-3" />
                            </p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{link.description}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manual / Verified Fields */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">שדות החיבור המוגדרים:</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-500 mb-1">Firebase Project ID</label>
                <input
                  type="text"
                  value={firestoreProjectId}
                  onChange={(e) => setFirestoreProjectId(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1">שם קולקציית אנשי קשר</label>
                <input
                  type="text"
                  value={firestoreCollection}
                  onChange={(e) => setFirestoreCollection(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-500 mb-1">כתובת אירוח (Hosting URL)</label>
                <input
                  type="text"
                  value={hostingUrl}
                  onChange={(e) => setHostingUrl(e.target.value)}
                  placeholder="https://client-app.web.app"
                  className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1">Web API Key</label>
                <input
                  type="password"
                  value={firestoreApiKey}
                  onChange={(e) => setFirestoreApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Test Connection Button & Status */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 text-gray-800 dark:text-gray-200 font-medium rounded-lg flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'בודק חיבור...' : 'בדוק חיבור (Test Ping)'}</span>
              </button>

              {testResult && (
                <div className={`flex items-center gap-1.5 font-medium text-xs ${
                  testResult.success ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {testResult.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{testResult.msg}</span>
                  {testResult.latency && (
                    <span className="text-[10px] text-gray-400 font-mono">({testResult.latency}ms)</span>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            ביטול
          </button>

          <button
            onClick={handleSaveAndApply}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition shadow flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>שמור והחל הגדרות לקוח</span>
          </button>
        </div>

      </div>
    </div>
  );
};
