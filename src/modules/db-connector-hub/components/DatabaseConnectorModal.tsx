import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Database, Check, RefreshCw, ShieldCheck, 
  ExternalLink, Sparkles, Server, Globe, Key, AlertCircle,
  FileJson, UploadCloud, Copy, RotateCcw, FolderSync, Bot,
  MessageSquare, Send, Cpu, KeyRound, Film, QrCode, Smartphone,
  Shield, CheckCircle, Radio, CreditCard, FileCheck2
} from 'lucide-react';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { parseJsonCredentialsWithAI, AIJsonCredentialsResult } from '../../../core/connection/aiJsonParser';
import { GreenApiService, WhatsAppQrAuthModal, WhatsAppPhoneAuthModal } from '../../whatsapp-green-api-hub';
import { kesherService } from '../../kesher-payments-hub/services/kesherService';

export const DatabaseConnectorModal: React.FC = () => {
  const { 
    config, 
    collections, 
    apiKeys,
    updateConfig, 
    updateApiKeys,
    testGoogleAiKey,
    testHeyGenKey,
    testConnection, 
    resetToDefaults, 
    isConnectorModalOpen, 
    closeConnectorModal,
    connectorModalInitialTab,
    isTesting,
    lastPingLatency,
    lastPingError
  } = useSystemConnection();

  if (!isConnectorModalOpen) return null;

  const [activeTab, setActiveTab] = useState<'smart_json' | 'manual_config' | 'collections' | 'api_keys' | 'whatsapp_webhook' | 'kesher_payments'>(() => {
    if (connectorModalInitialTab === 'kesher_payments' || connectorModalInitialTab === 'clearing_settings') {
      return 'kesher_payments';
    }
    if (connectorModalInitialTab && ['smart_json', 'manual_config', 'collections', 'api_keys', 'whatsapp_webhook'].includes(connectorModalInitialTab)) {
      return connectorModalInitialTab as any;
    }
    return 'smart_json';
  });

  useEffect(() => {
    if (connectorModalInitialTab) {
      if (connectorModalInitialTab === 'kesher_payments' || connectorModalInitialTab === 'clearing_settings') {
        setActiveTab('kesher_payments');
      } else if (['smart_json', 'manual_config', 'collections', 'api_keys', 'whatsapp_webhook'].includes(connectorModalInitialTab)) {
        setActiveTab(connectorModalInitialTab as any);
      }
    }
  }, [connectorModalInitialTab]);
  
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
  const [geminiModel, setGeminiModel] = useState(apiKeys.geminiModel || 'gemini-3.8-flash');
  const [geminiImageModel, setGeminiImageModel] = useState(apiKeys.geminiImageModel || 'gemini-3.1-flash-image');
  const [geminiVideoModel, setGeminiVideoModel] = useState(apiKeys.geminiVideoModel || 'veo-3.1-generate-preview');
  const [heygenApiKey, setHeygenApiKey] = useState(apiKeys.heygenApiKey || '');
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState(apiKeys.elevenLabsApiKey || '');
  const [openaiApiKey, setOpenaiApiKey] = useState(apiKeys.openaiApiKey || '');
  const [greenApiInstanceId, setGreenApiInstanceId] = useState(apiKeys.greenApiInstanceId || '');
  const [greenApiToken, setGreenApiToken] = useState(apiKeys.greenApiToken || '');
  const [customWebhookUrl, setCustomWebhookUrl] = useState(apiKeys.customWebhookUrl || '');

  // Kesher & EasyCount State
  const [kesherUserName, setKesherUserName] = useState((apiKeys.kesherUserName as string) || '');
  const [kesherApiKey, setKesherApiKey] = useState((apiKeys.kesherApiKey as string) || '');
  const [kesherPaymentPageId, setKesherPaymentPageId] = useState((apiKeys.kesherPaymentPageId as string) || '');
  const [kesherEzCountToken, setKesherEzCountToken] = useState((apiKeys.kesherEzCountToken as string) || '');
  const [kesherDefaultReceiptType, setKesherDefaultReceiptType] = useState<number>(Number(apiKeys.kesherDefaultReceiptType) || 405);
  const [isTestingKesher, setIsTestingKesher] = useState(false);
  const [kesherTestResult, setKesherTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [isConnectingEz, setIsConnectingEz] = useState(false);
  const [ezConnectResult, setEzConnectResult] = useState<{ success: boolean; msg: string } | null>(null);

  // WhatsApp & Webhooks Tab State
  const [waIncomingWebhook, setWaIncomingWebhook] = useState(true);
  const [waOutgoingStatusWebhook, setWaOutgoingStatusWebhook] = useState(true);
  const [waStateWebhook, setWaStateWebhook] = useState(true);
  const [waDeviceWebhook, setWaDeviceWebhook] = useState(true);
  const [waPollWebhook, setWaPollWebhook] = useState(true);
  const [waCallsWebhook, setWaCallsWebhook] = useState(true);
  const [waAutoRead, setWaAutoRead] = useState(false);
  const [waInstanceStatus, setWaInstanceStatus] = useState<string>('unknown');
  const [isCheckingWaStatus, setIsCheckingWaStatus] = useState(false);
  const [isTestingWaWebhook, setIsTestingWaWebhook] = useState(false);
  const [waWebhookTestResult, setWaWebhookTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  // Auth Modals from settings
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  // Service instance
  const greenApiService = useMemo(() => {
    return new GreenApiService({
      idInstance: greenApiInstanceId,
      apiTokenInstance: greenApiToken,
    });
  }, [greenApiInstanceId, greenApiToken]);

  // Test state
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string; latency?: number } | null>(null);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [isTestingHeygen, setIsTestingHeygen] = useState(false);
  const [heygenTestResult, setHeygenTestResult] = useState<{ success: boolean; msg: string } | null>(null);

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
    setGeminiModel(apiKeys.geminiModel || 'gemini-3.8-flash');
    setGeminiImageModel(apiKeys.geminiImageModel || 'gemini-3.1-flash-image');
    setGeminiVideoModel(apiKeys.geminiVideoModel || 'veo-3.1-generate-preview');
    setHeygenApiKey(apiKeys.heygenApiKey || '');
    setElevenLabsApiKey(apiKeys.elevenLabsApiKey || '');
    setOpenaiApiKey(apiKeys.openaiApiKey || '');
    setGreenApiInstanceId(apiKeys.greenApiInstanceId || '');
    setGreenApiToken(apiKeys.greenApiToken || '');
    setCustomWebhookUrl(apiKeys.customWebhookUrl || '');
    setKesherUserName((apiKeys.kesherUserName as string) || '');
    setKesherApiKey((apiKeys.kesherApiKey as string) || '');
    setKesherPaymentPageId((apiKeys.kesherPaymentPageId as string) || '');
    setKesherEzCountToken((apiKeys.kesherEzCountToken as string) || '');
    setKesherDefaultReceiptType(Number(apiKeys.kesherDefaultReceiptType) || 405);
  }, [apiKeys]);

  const checkWaStatus = async () => {
    if (!greenApiService.isConfigured()) return;
    setIsCheckingWaStatus(true);
    try {
      const res = await greenApiService.getStateInstance();
      setWaInstanceStatus(res.stateInstance);
    } catch {
      setWaInstanceStatus('unknown');
    } finally {
      setIsCheckingWaStatus(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'whatsapp_webhook' && greenApiService.isConfigured()) {
      checkWaStatus();
    }
  }, [activeTab, greenApiService]);

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

  const handleTestHeyGen = async () => {
    setIsTestingHeygen(true);
    setHeygenTestResult(null);
    const res = await testHeyGenKey(heygenApiKey);
    setIsTestingHeygen(false);
    if (res.success) {
      setHeygenTestResult({
        success: true,
        msg: 'מפתח HeyGen API v3 אומת בהצלחה! סטודיו הוידאו והאווטארים מסונכרן ומוכן.',
      });
    } else {
      setHeygenTestResult({
        success: false,
        msg: res.error || 'אימות מפתח HeyGen נכשל',
      });
    }
  };

  const handleTestWaWebhookPing = async () => {
    if (!customWebhookUrl.trim()) {
      alert('נא להזין כתובת Webhook URL תחילה');
      return;
    }
    setIsTestingWaWebhook(true);
    setWaWebhookTestResult(null);

    try {
      const res = await fetch(customWebhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          typeWebhook: 'testPingFromUniversalConnector',
          timestamp: Math.floor(Date.now() / 1000),
          instance: greenApiInstanceId || 'none',
        }),
      });

      if (res.ok) {
        setWaWebhookTestResult({
          success: true,
          msg: `כתובת ה-Webhook הגיבה בהצלחה! (${res.status} ${res.statusText})`,
        });
      } else {
        setWaWebhookTestResult({
          success: false,
          msg: `שרת ה-Webhook החזיר קוד שגיאה (${res.status} ${res.statusText})`,
        });
      }
    } catch (e: any) {
      setWaWebhookTestResult({
        success: false,
        msg: e.message || 'שגיאת רשת בבדיקת כתובת ה-Webhook',
      });
    } finally {
      setIsTestingWaWebhook(false);
    }
  };

  const handleTestKesher = async () => {
    if (!kesherUserName.trim() || !kesherApiKey.trim()) {
      setKesherTestResult({ success: false, msg: 'נא להזין שם משתמש וסיסמה לקשר' });
      return;
    }
    setIsTestingKesher(true);
    setKesherTestResult(null);
    try {
      const res = await kesherService.testConnection({
        userName: kesherUserName.trim(),
        apiKey: kesherApiKey.trim()
      });

      setKesherTestResult({
        success: res.success,
        msg: res.message
      });
    } catch (err: any) {
      setKesherTestResult({
        success: false,
        msg: 'שגיאת תקשורת מול שרת קשר: ' + (err.message || err)
      });
    } finally {
      setIsTestingKesher(false);
    }
  };

  const handleConnectEzCountFromModal = async () => {
    if (!kesherEzCountToken.trim()) {
      setEzConnectResult({ success: false, msg: 'נא להזין טוקן איזי קאונט' });
      return;
    }
    if (!kesherUserName.trim() || !kesherApiKey.trim()) {
      setEzConnectResult({ success: false, msg: 'נא להזין תחילה שם משתמש וסיסמה של קשר' });
      return;
    }

    setIsConnectingEz(true);
    setEzConnectResult(null);

    try {
      const res = await kesherService.connectToEZCount(kesherEzCountToken.trim(), {
        userName: kesherUserName.trim(),
        apiKey: kesherApiKey.trim()
      });

      setEzConnectResult({
        success: res.success,
        msg: res.message
      });
    } catch (err: any) {
      setEzConnectResult({ success: false, msg: 'שגיאה: ' + (err.message || err) });
    } finally {
      setIsConnectingEz(false);
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
      geminiImageModel: geminiImageModel.trim(),
      geminiVideoModel: geminiVideoModel.trim(),
      heygenApiKey: heygenApiKey.trim(),
      elevenLabsApiKey: elevenLabsApiKey.trim(),
      openaiApiKey: openaiApiKey.trim(),
      greenApiInstanceId: greenApiInstanceId.trim(),
      greenApiToken: greenApiToken.trim(),
      customWebhookUrl: customWebhookUrl.trim(),
      kesherUserName: kesherUserName.trim(),
      kesherApiKey: kesherApiKey.trim(),
      kesherPaymentPageId: kesherPaymentPageId.trim(),
      kesherEzCountToken: kesherEzCountToken.trim(),
      kesherDefaultReceiptType: kesherDefaultReceiptType,
    });

    if (greenApiService.isConfigured() && customWebhookUrl.trim()) {
      try {
        await greenApiService.setSettings({
          webhookUrl: customWebhookUrl.trim(),
          incomingWebhook: waIncomingWebhook ? 'yes' : 'no',
          outgoingWebhook: waOutgoingStatusWebhook ? 'yes' : 'no',
          outgoingMessageWebhook: waOutgoingStatusWebhook ? 'yes' : 'no',
          stateWebhook: waStateWebhook ? 'yes' : 'no',
          deviceWebhook: waDeviceWebhook ? 'yes' : 'no',
          pollMessageWebhook: waPollWebhook ? 'yes' : 'no',
          incomingCallWebhook: waCallsWebhook ? 'yes' : 'no',
          markIncomingMessagesReaded: waAutoRead ? 'yes' : 'no',
        });
      } catch (err) {
        console.warn('Notice syncing Green-API settings:', err);
      }
    }

    await handleTestPing();
    setTimeout(() => {
      closeConnectorModal();
    }, 600);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-hidden" dir="rtl">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] max-h-[90vh] flex flex-col text-right text-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10 shrink-0">
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
                מסנכרן את כלל המודולים (סליקה, CRM, וואטסאפ, גלריית מדיה, נגן, בונה דפים)
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
        <div className="flex border-b border-slate-800 px-3 bg-slate-950/70 text-xs gap-1 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('smart_json')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === 'smart_json'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileJson className="w-4 h-4" />
            <span>פענוח חכם של מפתח JSON</span>
          </button>

          <button
            onClick={() => setActiveTab('manual_config')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === 'manual_config'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>הגדרות שרת ידניות</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp_webhook')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === 'whatsapp_webhook'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>אינטגרציית WhatsApp & Webhook</span>
          </button>

          <button
            onClick={() => setActiveTab('collections')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === 'collections'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderSync className="w-4 h-4" />
            <span>מיפוי קולקציות</span>
          </button>

          <button
            onClick={() => setActiveTab('api_keys')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === 'api_keys'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>מפתחות AI & שירותים</span>
          </button>

          <button
            onClick={() => setActiveTab('kesher_payments')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === 'kesher_payments'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4 text-indigo-400" />
            <span>הגדרות סליקה</span>
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
                  placeholder='{
  "apiKey": "AIzaSy...",
  "projectId": "my-client-app",
  "storageBucket": "my-client-app.appspot.com"
}'
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

          {/* TAB 3: WhatsApp & Webhook Hub */}
          {activeTab === 'whatsapp_webhook' && (
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">הגדרות וסנכרון WhatsApp Webhook (Green-API)</h3>
                    <p className="text-[11px] text-slate-400">חיבור מופע WhatsApp, התחברות ב-QR/הודעה וסנכרון כתובת Webhook מרכזית</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    waInstanceStatus === 'authorized'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    {waInstanceStatus === 'authorized' ? '● מחובר ומאושר' : '○ לא מחובר'}
                  </span>

                  <button
                    type="button"
                    onClick={checkWaStatus}
                    disabled={isCheckingWaStatus}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                    title="בדוק סטטוס"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingWaStatus ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Fast Connect Buttons */}
              <div className="p-3.5 bg-slate-900/90 border border-emerald-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-white font-bold block">התחברות ישירה לחשבון WhatsApp:</span>
                  <span className="text-[11px] text-slate-400">בחר שיטת אימות לצימוד המכשיר ל-Green-API</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsQrModalOpen(true)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>סרוק QR קוד</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPhoneModalOpen(true)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>התחבר בהודעת קוד</span>
                  </button>
                </div>
              </div>

              {/* Instance Credentials Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Green API Instance ID *</label>
                  <input
                    type="text"
                    value={greenApiInstanceId}
                    onChange={(e) => setGreenApiInstanceId(e.target.value)}
                    placeholder="110182..."
                    className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white font-mono text-xs focus:border-emerald-500"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Green API Token *</label>
                  <input
                    type="password"
                    value={greenApiToken}
                    onChange={(e) => setGreenApiToken(e.target.value)}
                    placeholder="d7a1..."
                    className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white font-mono text-xs focus:border-emerald-500"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Webhook Configuration */}
              <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-white font-bold flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-purple-400" />
                    <span>כתובת Webhook לקבלת אירועים והודעות בזמן אמת</span>
                  </label>

                  {/* Internal Server Webhook Generator */}
                  <button
                    type="button"
                    onClick={() => {
                      const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://app.comona.io';
                      const instanceParam = greenApiInstanceId ? `?instance=${encodeURIComponent(greenApiInstanceId.trim())}` : '';
                      setCustomWebhookUrl(`${origin}/api/webhook/whatsapp${instanceParam}`);
                    }}
                    className="text-[11px] text-purple-300 hover:text-purple-200 px-2.5 py-1 bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>⚡ צור כתובת Webhook פנימית של השרת</span>
                  </button>
                </div>

                <input
                  type="url"
                  value={customWebhookUrl}
                  onChange={(e) => setCustomWebhookUrl(e.target.value)}
                  placeholder="https://yourserver.com/api/webhook/whatsapp"
                  className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-950 text-white font-mono text-xs focus:border-purple-500 outline-none"
                  dir="ltr"
                />

                {/* Webhook Test Ping */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleTestWaWebhookPing}
                    disabled={isTestingWaWebhook}
                    className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 font-medium rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Send className={`w-3.5 h-3.5 ${isTestingWaWebhook ? 'animate-spin' : ''}`} />
                    <span>{isTestingWaWebhook ? 'בודק שרת Webhook...' : 'בדוק תקינות Webhook (Live Ping)'}</span>
                  </button>

                  {waWebhookTestResult && (
                    <div className={`text-[11px] font-medium flex items-center gap-1.5 ${
                      waWebhookTestResult.success ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {waWebhookTestResult.success ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      <span>{waWebhookTestResult.msg}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Subscriptions Toggles */}
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2.5">
                <span className="text-slate-300 font-semibold block">אירועים מסונכרנים לוואבהוק:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={waIncomingWebhook}
                      onChange={(e) => setWaIncomingWebhook(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>הודעות נכנסות (incomingMessageReceived)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={waOutgoingStatusWebhook}
                      onChange={(e) => setWaOutgoingStatusWebhook(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>סטטוסי מסירה וקריאה (outgoingMessageStatus)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={waStateWebhook}
                      onChange={(e) => setWaStateWebhook(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>שינויי מצב מופע (stateInstanceChanged)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={waDeviceWebhook}
                      onChange={(e) => setWaDeviceWebhook(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>מידע על סוללה ומכשיר (deviceInfo)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={waPollWebhook}
                      onChange={(e) => setWaPollWebhook(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>תשובות לסקרים (pollMessageWebhook)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={waCallsWebhook}
                      onChange={(e) => setWaCallsWebhook(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>שיחות נכנסות (incomingCallWebhook)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Collections */}
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

          {/* TAB 5: API Keys & Integrations */}
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

              <div>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>מודל שפה, תסריטים ו-PDF</span>
                  </label>
                  <select
                    value={geminiModel}
                    onChange={(e) => setGeminiModel(e.target.value)}
                    className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white text-xs focus:border-indigo-500"
                    dir="ltr"
                  >
                    <optgroup label="⚡ Gemini 3.x Flash Models (New Stable)">
                      <option value="gemini-3.8-flash">gemini-3.8-flash (הכי אינטליגנטי ומתקדם לסוכנים)</option>
                      <option value="gemini-3.7-flash">gemini-3.7-flash (קידוד וסוכנים רב-שלביים)</option>
                      <option value="gemini-3.6-flash">gemini-3.6-flash (מאוזן ומהיר)</option>
                      <option value="gemini-3.5-flash">gemini-3.5-flash (מהיר וקלאסי)</option>
                      <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (אולטרה חסכוני ומהיר)</option>
                      <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (קל משקל לתפוקה גבוהה)</option>
                    </optgroup>
                    <optgroup label="🧠 Pro & Reasoning Models">
                      <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (מחשבה עמוקה ופתרון מורכב)</option>
                      <option value="gemini-2.5-pro">gemini-2.5-pro (פרו רב-מודאלי עם 2M טוקנים)</option>
                      <option value="gemini-2.5-flash">gemini-2.5-flash (היברידי עם Thinking Budget)</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium flex items-center gap-1">
                    <span>🍌</span>
                    <span>מודל יצירת תמונות</span>
                  </label>
                  <select
                    value={geminiImageModel}
                    onChange={(e) => setGeminiImageModel(e.target.value)}
                    className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white text-xs focus:border-indigo-500"
                    dir="ltr"
                  >
                    <option value="gemini-3.1-flash-image">gemini-3.1-flash-image (Nano Banana 2 - מהיר)</option>
                    <option value="gemini-3.1-flash-lite-image">gemini-3.1-flash-lite-image (Nano Banana 2 Lite)</option>
                    <option value="gemini-3-pro-image">gemini-3-pro-image (Nano Banana Pro - פוטוריאליסטי)</option>
                    <option value="imagen-3.0-generate-002">imagen-3.0-generate-002 (Imagen 3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium flex items-center gap-1">
                    <Film className="w-3.5 h-3.5 text-pink-400" />
                    <span>מודל יצירת וידאו</span>
                  </label>
                  <select
                    value={geminiVideoModel}
                    onChange={(e) => setGeminiVideoModel(e.target.value)}
                    className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white text-xs focus:border-indigo-500"
                    dir="ltr"
                  >
                    <option value="veo-3.1-generate-preview">veo-3.1-generate-preview (Veo 3.1 - 1080p סינמטי)</option>
                    <option value="veo-3.1-lite-generate-preview">veo-3.1-lite-generate-preview (Veo 3.1 Lite - מהיר)</option>
                    <option value="gemini-omni-1.1-flash">gemini-omni-1.1-flash (Gemini Omni Flash)</option>
                  </select>
                </div>
              </div>

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

              {/* HeyGen & Video Studio Section */}
              <div className="border-t border-slate-800/80 pt-3">
                <div className="flex items-center justify-between pb-2">
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-400" />
                      <span>הפקת וידאו ואווטארים (HeyGen API v3 & Studio)</span>
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">HeyGen API Key *</label>
                    <input
                      type="password"
                      value={heygenApiKey}
                      onChange={(e) => setHeygenApiKey(e.target.value)}
                      placeholder="N2UzMT..."
                      className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white font-mono focus:border-indigo-500 text-xs"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">ElevenLabs API Key</label>
                    <input
                      type="password"
                      value={elevenLabsApiKey}
                      onChange={(e) => setElevenLabsApiKey(e.target.value)}
                      placeholder="sk_..."
                      className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white font-mono focus:border-indigo-500 text-xs"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="p-3 mt-3 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleTestHeyGen}
                    disabled={isTestingHeygen}
                    className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 font-medium rounded-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <Cpu className={`w-3.5 h-3.5 ${isTestingHeygen ? 'animate-spin text-purple-400' : 'text-purple-400'}`} />
                    <span>{isTestingHeygen ? 'מאמת מפתח HeyGen...' : 'בדוק תקינות מפתח HeyGen API'}</span>
                  </button>

                  {heygenTestResult && (
                    <div className={`flex items-center gap-1.5 text-[11px] font-medium ${
                      heygenTestResult.success ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {heygenTestResult.success ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      <span>{heygenTestResult.msg}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Kesher & EasyCount Hub Section */}
          {activeTab === 'kesher_payments' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>הגדרות מסוף סליקה – קשר & איזי קאונט</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      הזן את פרטי הגישה של מסוף קשר וטוקן איזי קאונט. הפרטים נשמרים ומסונכרנים אוטומטית לכלל מודולי הסליקה וה-CRM.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* כרטיס 1: פרטי מסוף קשר */}
                <div className="p-4 sm:p-5 bg-slate-900/95 border border-slate-800 rounded-2xl space-y-3.5 shadow-md flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800">
                      <KeyRound className="w-4 h-4 text-indigo-400" />
                      <h4 className="font-bold text-white text-xs">פרטי מסוף קשר (Kesher HK)</h4>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-medium text-[11px]">
                        שם משתמש בקשר (Username / Email) *
                      </label>
                      <input
                        type="text"
                        value={kesherUserName}
                        onChange={(e) => setKesherUserName(e.target.value)}
                        placeholder="user@institution.org.il"
                        dir="ltr"
                        className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-950 text-white font-mono focus:border-indigo-500 text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-medium text-[11px]">
                        סיסמה / מפתח API (Password / API Key) *
                      </label>
                      <input
                        type="password"
                        value={kesherApiKey}
                        onChange={(e) => setKesherApiKey(e.target.value)}
                        placeholder="••••••••••••"
                        dir="ltr"
                        className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-950 text-white font-mono focus:border-indigo-500 text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-medium text-[11px]">
                        מספר עמוד / מזהה פרויקט (ProjectNumber / Page ID)
                      </label>
                      <input
                        type="text"
                        value={kesherPaymentPageId}
                        onChange={(e) => setKesherPaymentPageId(e.target.value)}
                        placeholder="1024 או מזהה עמוד"
                        dir="ltr"
                        className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-950 text-white font-mono focus:border-indigo-500 text-xs outline-none"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        נשלח לקשר תחת השדה ProjectNumber לזיהוי קמפיין או עמוד סליקה ספציפי
                      </span>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-medium text-[11px]">
                        ברירת מחדל לסוג מסמך (Default Document Type)
                      </label>
                      <select
                        value={kesherDefaultReceiptType}
                        onChange={(e) => setKesherDefaultReceiptType(Number(e.target.value))}
                        className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-950 text-white focus:border-indigo-500 text-xs outline-none"
                      >
                        <option value={405}>405 - קבלה על תרומה (סעיף 46 - מוסדות ועמותות)</option>
                        <option value={400}>400 - קבלה רגילה</option>
                        <option value={320}>320 - חשבונית מס קבלה</option>
                        <option value={305}>305 - חשבונית מס</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between gap-2 mt-2">
                    <button
                      type="button"
                      onClick={handleTestKesher}
                      disabled={isTestingKesher || !kesherUserName.trim() || !kesherApiKey.trim()}
                      className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-medium rounded-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 text-xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTestingKesher ? 'animate-spin text-indigo-400' : 'text-indigo-400'}`} />
                      <span>{isTestingKesher ? 'בודק חיבור...' : 'בדוק חיבור לקשר'}</span>
                    </button>

                    {kesherTestResult && (
                      <div className={`flex items-center gap-1 text-[11px] font-medium ${
                        kesherTestResult.success ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {kesherTestResult.success ? <Check className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                        <span>{kesherTestResult.msg}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* כרטיס 2: חיבור איזי קאונט */}
                <div className="p-4 sm:p-5 bg-slate-900/95 border border-slate-800 rounded-2xl space-y-3.5 shadow-md flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800">
                      <FileCheck2 className="w-4 h-4 text-emerald-400" />
                      <h4 className="font-bold text-white text-xs">חיבור איזי קאונט (EasyCount / Ezcount)</h4>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      שרת קשר מתקשר ישירות עם איזי קאונט כדי להפיק קבלה או חשבונית מס מיד לאחר כל סליקה. הזן את מפתח ה-API של איזי קאונט ובצע צימוד דרך שירות קשר:
                    </p>

                    <div>
                      <label className="block text-slate-400 mb-1 font-medium text-[11px]">
                        טוקן איזי קאונט (EasyCount API Token) *
                      </label>
                      <input
                        type="password"
                        value={kesherEzCountToken}
                        onChange={(e) => setKesherEzCountToken(e.target.value)}
                        placeholder="הדבק כאן את הטוקן מאיזי קאונט"
                        dir="ltr"
                        className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-950 text-white font-mono focus:border-emerald-500 text-xs outline-none"
                      />
                    </div>

                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[10px] text-slate-400 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        איך זה עובד?
                      </div>
                      <p>
                        לחיצה על הכפתור תשלח בקשת צימוד מאובטחת לנתיב קשר:
                        <code className="block bg-slate-900 text-indigo-300 p-1 rounded mt-1 font-mono text-[10px] dir-ltr text-left">
                          GET /KesherAPI/ConnectToEZCountService
                        </code>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={handleConnectEzCountFromModal}
                      disabled={isConnectingEz || !kesherEzCountToken.trim() || !kesherUserName.trim() || !kesherApiKey.trim()}
                      className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                    >
                      <FileCheck2 className={`w-3.5 h-3.5 ${isConnectingEz ? 'animate-spin' : ''}`} />
                      <span>{isConnectingEz ? 'מבצע צימוד מול קשר...' : 'צמד ועדכן איזי קאונט מול קשר'}</span>
                    </button>

                    {ezConnectResult && (
                      <div className={`p-2.5 rounded-xl border text-[11px] flex items-center gap-1.5 ${
                        ezConnectResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}>
                        {ezConnectResult.success ? <Check className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                        <span>{ezConnectResult.msg}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Test Status Bar */}
          <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleTestPing}
              disabled={isTesting}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer disabled:opacity-50 text-xs"
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
        <div className="p-4 border-t border-slate-800 bg-slate-950/95 flex items-center justify-between shrink-0">
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

        {/* Modals for QR & Phone Auth */}
        <WhatsAppQrAuthModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          service={greenApiService}
          onAuthorized={checkWaStatus}
        />

        <WhatsAppPhoneAuthModal
          isOpen={isPhoneModalOpen}
          onClose={() => setIsPhoneModalOpen(false)}
          service={greenApiService}
          onAuthorized={checkWaStatus}
        />

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
