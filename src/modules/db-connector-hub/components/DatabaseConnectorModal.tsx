import React, { useState, useEffect } from 'react';
import { 
  X, Database, Check, RefreshCw, ShieldCheck, 
  ExternalLink, Sparkles, Server, Globe, Key, AlertCircle,
  FileJson, UploadCloud, Copy, RotateCcw, FolderSync, Bot,
  MessageSquare, Send, Cpu, KeyRound
} from 'lucide-react';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { parseJsonCredentialsWithAI, AIJsonCredentialsResult } from '../../../core/connection/aiJsonParser';

export const DatabaseConnectorModal: React.FC = () => {
  const { 
    config, 
    collections, 
    apiKeys,
    updateConfig, 
    updateApiKeys,
    testGoogleAiKey,
    testConnection, 
    resetToDefaults, 
    isConnectorModalOpen, 
    closeConnectorModal,
    isTesting,
    lastPingLatency,
    lastPingError
  } = useSystemConnection();

  if (!isConnectorModalOpen) return null;

  const [activeTab, setActiveTab] = useState<'smart_json' | 'manual_config' | 'collections' | 'api_keys'>('smart_json');
  
  // Smart JSON State
  const [jsonInput, setJsonInput] = useState('');
  const [isParsingJson, setIsParsingJson] = useState(false);
  const [parsedResult, setParsedResult] = useState<AIJsonCredentialsResult | null>(null);

  // Form State
  const [projectId, setProjectId] = useState(config.projectId || '');
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [authDomain, setAuthDomain] = useState(config.authDomain || '');
  const [storageBucket, setStorageBucket] = useState(config.storageBucket || '');
  const [databaseId, setDatabaseId] = useState(config.databaseId || '(default)');
  const [messagingSenderId, setMessagingSenderId] = useState(config.messagingSenderId || '');
  const [appId, setAppId] = useState(config.appId || '');
  const [hostingUrl, setHostingUrl] = useState(config.projectId ? `https://${config.projectId}.web.app` : '');

  // Collections state
  const [mediaItemsCol, setMediaItemsCol] = useState(collections.mediaItems || 'sdo_media_items');
  const [mediaFoldersCol, setMediaFoldersCol] = useState(collections.mediaFolders || 'sdo_media_folders');
  const [playerCampaignsCol, setPlayerCampaignsCol] = useState(collections.playerCampaigns || 'sdo_player_campaign_configs');
  const [contactsCol, setContactsCol] = useState(collections.contacts || 'contacts');

  // API Keys state
  const [googleAiApiKey, setGoogleAiApiKey] = useState(apiKeys.googleAiApiKey || '');
  const [geminiModel, setGeminiModel] = useState(apiKeys.geminiModel || 'gemini-1.5-flash');
  const [openaiApiKey, setOpenaiApiKey] = useState(apiKeys.openaiApiKey || '');
  const [greenApiInstanceId, setGreenApiInstanceId] = useState(apiKeys.greenApiInstanceId || '');
  const [greenApiToken, setGreenApiToken] = useState(apiKeys.greenApiToken || '');
  const [customWebhookUrl, setCustomWebhookUrl] = useState(apiKeys.customWebhookUrl || '');

  // Test state
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string; latency?: number } | null>(null);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  // Sync state with active config
  useEffect(() => {
    setProjectId(config.projectId || '');
    setApiKey(config.apiKey || '');
    setAuthDomain(config.authDomain || '');
    setStorageBucket(config.storageBucket || '');
    setDatabaseId(config.databaseId || '(default)');
    setMessagingSenderId(config.messagingSenderId || '');
    setAppId(config.appId || '');
    setHostingUrl(config.projectId ? `https://${config.projectId}.web.app` : '');
  }, [config]);

  useEffect(() => {
    setGoogleAiApiKey(apiKeys.googleAiApiKey || '');
    setGeminiModel(apiKeys.geminiModel || 'gemini-1.5-flash');
    setOpenaiApiKey(apiKeys.openaiApiKey || '');
    setGreenApiInstanceId(apiKeys.greenApiInstanceId || '');
    setGreenApiToken(apiKeys.greenApiToken || '');
    setCustomWebhookUrl(apiKeys.customWebhookUrl || '');
  }, [apiKeys]);

  const handleParseJson = async () => {
    if (!jsonInput.trim()) {
      alert('נא להדביק או להעלות קובץ JSON תחילה.');
      return;
    }
    setIsParsingJson(true);
    setTestResult(null);

    try {
      const res = await parseJsonCredentialsWithAI(jsonInput);
      setParsedResult(res);

      if (res.projectId) setProjectId(res.projectId);
      if (res.apiKey) setApiKey(res.apiKey);
      if (res.authDomain) setAuthDomain(res.authDomain);
      if (res.storageBucket) setStorageBucket(res.storageBucket);
      if (res.hostingUrl) setHostingUrl(res.hostingUrl);
      if (res.appId) setAppId(res.appId);
      if (res.databaseId) setDatabaseId(res.databaseId);
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

  const handleTestPing = async () => {
    setTestResult(null);
    const testCfg = {
      projectId,
      apiKey,
      authDomain: authDomain || `${projectId}.firebaseapp.com`,
      storageBucket: storageBucket || `${projectId}.firebasestorage.app`,
      databaseId,
      messagingSenderId,
      appId,
    };

    const res = await testConnection(testCfg);
    if (res.success) {
      setTestResult({
        success: true,
        msg: `החיבור ל-Firestore (${projectId}) פעיל ומסונכרן בהצלחה!`,
        latency: res.latency,
      });
    } else {
      setTestResult({
        success: false,
        msg: `שגיאת אימות חיבור: ${res.error}`,
      });
    }
  };

  const handleTestGoogleAi = async () => {
    setIsTestingAi(true);
    setAiTestResult(null);
    const res = await testGoogleAiKey(googleAiApiKey);
    setIsTestingAi(false);
    if (res.success) {
      setAiTestResult({
        success: true,
        msg: 'מפתח Google Gemini API אומת בהצלחה ומוכן לשימוש בכל המודולים!',
      });
    } else {
      setAiTestResult({
        success: false,
        msg: res.error || 'אימות מפתח Google AI נכשל',
      });
    }
  };

  const handleSaveAndSyncAll = async () => {
    await updateConfig(
      {
        projectId: projectId.trim(),
        apiKey: apiKey.trim(),
        authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
        storageBucket: storageBucket.trim() || `${projectId.trim()}.firebasestorage.app`,
        databaseId: databaseId.trim() || '(default)',
        messagingSenderId: messagingSenderId.trim(),
        appId: appId.trim(),
      },
      {
        mediaItems: mediaItemsCol.trim(),
        mediaFolders: mediaFoldersCol.trim(),
        playerCampaigns: playerCampaignsCol.trim(),
        contacts: contactsCol.trim(),
      }
    );

    await updateApiKeys({
      googleAiApiKey: googleAiApiKey.trim(),
      geminiModel: geminiModel.trim(),
      openaiApiKey: openaiApiKey.trim(),
      greenApiInstanceId: greenApiInstanceId.trim(),
      greenApiToken: greenApiToken.trim(),
      customWebhookUrl: customWebhookUrl.trim(),
    });

    // Run verification ping
    await handleTestPing();
    setTimeout(() => {
      closeConnectorModal();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-md" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col text-right text-slate-100">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>מרכז סנכרון וחיבור מסדי נתונים (Universal DB Connector)</span>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-indigo-500/30">
                  Core Mandatory
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                מסנכרן את כלל המודולים (גלריית מדיה, נגן, CRM, בונה דפים) למסד נתונים ו-Storage יחיד
              </p>
            </div>
          </div>
          <button 
            onClick={closeConnectorModal} 
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 px-4 bg-slate-950/40 text-xs gap-1">
          <button
            onClick={() => setActiveTab('smart_json')}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'smart_json'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileJson className="w-4 h-4" />
            <span>פענוח חכם של מפתח JSON (Gemini AI)</span>
          </button>
          <button
            onClick={() => setActiveTab('manual_config')}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'manual_config'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>הגדרות חיבור ושרת ידניות</span>
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'collections'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderSync className="w-4 h-4" />
            <span>מיפוי קולקציות גלובלי</span>
          </button>
          <button
            onClick={() => setActiveTab('api_keys')}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'api_keys'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>מפתחות API והרשאות שירות (AI & Integrations)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* TAB 1: Smart JSON Parser */}
          {activeTab === 'smart_json' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/90 border border-indigo-500/30 rounded-2xl space-y-3">
                <label className="block font-bold text-indigo-300">
                  הדבק כאן את תוכן קובץ ה-JSON (Service Account או Firebase Web Config):
                </label>
                <textarea
                  rows={4}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='{\n  "apiKey": "AIzaSy...",\n  "projectId": "my-client-app",\n  "storageBucket": "my-client-app.appspot.com"\n}'
                  className="w-full p-3 font-mono text-[11px] border border-slate-700 rounded-xl bg-slate-900 text-slate-100 outline-none focus:border-indigo-500"
                  dir="ltr"
                />
                
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <label className="cursor-pointer px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 hover:bg-slate-700 flex items-center gap-2 font-medium transition">
                    <UploadCloud className="w-4 h-4 text-indigo-400" />
                    <span>העלה קובץ JSON מהמחשב</span>
                    <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                  </label>

                  <button
                    onClick={handleParseJson}
                    disabled={isParsingJson}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`w-4 h-4 ${isParsingJson ? 'animate-spin' : ''}`} />
                    <span>{isParsingJson ? 'מפענח עם Gemini...' : 'פענח והחל אוטומטית'}</span>
                  </button>
                </div>
              </div>

              {/* Parsed Result Card */}
              {parsedResult && (
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">סוג המפתח שזוהה:</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        parsedResult.sdkType === 'admin_sdk' 
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' 
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {parsedResult.sdkType === 'admin_sdk' ? '👑 Admin SDK (Service Account)' : '🌐 Client SDK (Web Config)'}
                      </span>
                    </div>
                    <span className="font-mono text-indigo-400 font-bold">{parsedResult.projectId}</span>
                  </div>

                  <p className="text-slate-300">{parsedResult.explanation}</p>

                  {/* Quick Links to Firebase Console */}
                  <div>
                    <span className="font-semibold text-slate-200 block mb-2">
                      🔗 קישורים מהירים לפרויקט ב-Firebase Console:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {parsedResult.consoleLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 transition flex items-start justify-between group"
                        >
                          <div>
                            <p className="font-bold text-indigo-400 group-hover:underline flex items-center gap-1.5">
                              <span>{link.title}</span>
                              <ExternalLink className="w-3 h-3" />
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{link.description}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Manual Config */}
          {activeTab === 'manual_config' && (
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Firebase Project ID *</label>
                  <input
                    type="text"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="glowmanage"
                    className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white font-mono focus:border-indigo-500"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Web API Key *</label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white font-mono focus:border-indigo-500"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Storage Bucket (גלריית וידאו ותמונות) *</label>
                  <input
                    type="text"
                    value={storageBucket}
                    onChange={(e) => setStorageBucket(e.target.value)}
                    placeholder="glowmanage.firebasestorage.app"
                    className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white font-mono focus:border-indigo-500"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Auth Domain</label>
                  <input
                    type="text"
                    value={authDomain}
                    onChange={(e) => setAuthDomain(e.target.value)}
                    placeholder="glowmanage.firebaseapp.com"
                    className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white font-mono focus:border-indigo-500"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Firestore Database ID</label>
                  <input
                    type="text"
                    value={databaseId}
                    onChange={(e) => setDatabaseId(e.target.value)}
                    placeholder="(default)"
                    className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white font-mono focus:border-indigo-500"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">App ID (Web App)</label>
                  <input
                    type="text"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    placeholder="1:174552708887:web:..."
                    className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white font-mono focus:border-indigo-500"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Collections */}
          {activeTab === 'collections' && (
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4">
              <p className="text-slate-400">
                הגדר את שמות הקולקציות שכלל הרכיבים במערכת ישתמשו בהן לקריאה ולכתיבה:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">קולקציית פריטי מדיה (Media Items)</label>
                  <input
                    type="text"
                    value={mediaItemsCol}
                    onChange={(e) => setMediaItemsCol(e.target.value)}
                    className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white font-mono focus:border-indigo-500"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">קולקציית תיקיות מדיה (Media Folders)</label>
                  <input
                    type="text"
                    value={mediaFoldersCol}
                    onChange={(e) => setMediaFoldersCol(e.target.value)}
                    className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white font-mono focus:border-indigo-500"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">קולקציית קמפיינים ונגן (Player Campaigns)</label>
                  <input
                    type="text"
                    value={playerCampaignsCol}
                    onChange={(e) => setPlayerCampaignsCol(e.target.value)}
                    className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white font-mono focus:border-indigo-500"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">קולקציית אנשי קשר ולידים (CRM Contacts)</label>
                  <input
                    type="text"
                    value={contactsCol}
                    onChange={(e) => setContactsCol(e.target.value)}
                    className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white font-mono focus:border-indigo-500"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: API Keys & Integrations */}
          {activeTab === 'api_keys' && (
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>שירותי בינה מלאכותית (Google AI & Gemini)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    מוגדרים באופן גלובלי ומועברים לכל המודולים (זיהוי קבצים, יצירת תסריטים, אנליטיקה ו-CRM)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-medium">Google Gemini API Key *</label>
                  <input
                    type="password"
                    value={googleAiApiKey}
                    onChange={(e) => setGoogleAiApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white font-mono focus:border-indigo-500 text-xs"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">מודל AI פעיל (Default Model)</label>
                  <select
                    value={geminiModel}
                    onChange={(e) => setGeminiModel(e.target.value)}
                    className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white text-xs focus:border-indigo-500"
                    dir="ltr"
                  >
                    <option value="gemini-1.5-flash">gemini-1.5-flash (מומלץ ומהיר)</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro (חזק ומעמיק)</option>
                    <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                    <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                  </select>
                </div>
              </div>

              {/* AI Key Live Verification */}
              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleTestGoogleAi}
                  disabled={isTestingAi}
                  className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-medium rounded-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isTestingAi ? 'animate-spin text-amber-400' : 'text-indigo-400'}`} />
                  <span>{isTestingAi ? 'מאמת מפתח Google AI...' : 'בדוק תקינות מפתח Google AI'}</span>
                </button>

                {aiTestResult && (
                  <div className={`flex items-center gap-1.5 text-[11px] font-medium ${
                    aiTestResult.success ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {aiTestResult.success ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    <span>{aiTestResult.msg}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-800/80 pt-3">
                <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-400" />
                  <span>אינטגרציות נוספות (OpenAI, WhatsApp, Webhooks)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">OpenAI API Key</label>
                    <input
                      type="password"
                      value={openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white font-mono focus:border-indigo-500 text-xs"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Custom Webhook Endpoint</label>
                    <input
                      type="url"
                      value={customWebhookUrl}
                      onChange={(e) => setCustomWebhookUrl(e.target.value)}
                      placeholder="https://hook.eu2.make.com/..."
                      className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white font-mono focus:border-indigo-500 text-xs"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Green API (WhatsApp) Instance ID</label>
                    <input
                      type="text"
                      value={greenApiInstanceId}
                      onChange={(e) => setGreenApiInstanceId(e.target.value)}
                      placeholder="110182..."
                      className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white font-mono focus:border-indigo-500 text-xs"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Green API (WhatsApp) Token</label>
                    <input
                      type="password"
                      value={greenApiToken}
                      onChange={(e) => setGreenApiToken(e.target.value)}
                      placeholder="d7a1..."
                      className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white font-mono focus:border-indigo-500 text-xs"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Test Status Bar */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleTestPing}
              disabled={isTesting}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'בודק פינג חי...' : 'בדוק חיבור עכשיו (Live Ping)'}</span>
            </button>

            {testResult && (
              <div className={`flex items-center gap-2 font-medium text-xs ${
                testResult.success ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {testResult.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{testResult.msg}</span>
                {testResult.latency !== undefined && (
                  <span className="text-[11px] text-slate-400 font-mono">({testResult.latency}ms)</span>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={resetToDefaults}
            type="button"
            className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>איפוס לברירות מחדל</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={closeConnectorModal}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              ביטול
            </button>

            <button
              onClick={handleSaveAndSyncAll}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>שמור וסנכרן את כל המערכת</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
