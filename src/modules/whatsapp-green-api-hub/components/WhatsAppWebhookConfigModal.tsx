import React, { useState, useEffect } from 'react';
import { Globe, Save, RefreshCw, CheckCircle, AlertCircle, X, Shield, Copy, Check, Sparkles, Send } from 'lucide-react';
import { GreenApiService } from '../services/greenApiService';
import { GreenApiInstanceSettings } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  service: GreenApiService;
  currentWebhookUrl?: string;
  onSaved?: (newSettings: GreenApiInstanceSettings) => void;
}

export const WhatsAppWebhookConfigModal: React.FC<Props> = ({
  isOpen,
  onClose,
  service,
  currentWebhookUrl,
  onSaved,
}) => {
  const [webhookUrl, setWebhookUrl] = useState(currentWebhookUrl || '');
  const [webhookUrlToken, setWebhookUrlToken] = useState('');
  const [delayMs, setDelayMs] = useState(1000);
  const [incomingWebhook, setIncomingWebhook] = useState(true);
  const [outgoingWebhook, setOutgoingWebhook] = useState(true);
  const [outgoingMessageWebhook, setOutgoingMessageWebhook] = useState(true);
  const [stateWebhook, setStateWebhook] = useState(true);
  const [deviceWebhook, setDeviceWebhook] = useState(true);
  const [pollMessageWebhook, setPollMessageWebhook] = useState(true);
  const [incomingCallWebhook, setIncomingCallWebhook] = useState(true);
  const [markIncomingReaded, setMarkIncomingReaded] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [copiedSample, setCopiedSample] = useState(false);

  useEffect(() => {
    if (isOpen && service.isConfigured()) {
      setIsLoading(true);
      service.getSettings().then((settings) => {
        setIsLoading(false);
        if (settings) {
          if (settings.webhookUrl) setWebhookUrl(settings.webhookUrl);
          if (settings.webhookUrlToken) setWebhookUrlToken(settings.webhookUrlToken);
          if (settings.delaySendMessagesMilliseconds) setDelayMs(settings.delaySendMessagesMilliseconds);
          setIncomingWebhook(settings.incomingWebhook !== 'no');
          setOutgoingWebhook(settings.outgoingWebhook !== 'no');
          setOutgoingMessageWebhook(settings.outgoingMessageWebhook !== 'no');
          setStateWebhook(settings.stateWebhook !== 'no');
          setDeviceWebhook(settings.deviceWebhook !== 'no');
          setPollMessageWebhook(settings.pollMessageWebhook !== 'no');
          setIncomingCallWebhook(settings.incomingCallWebhook !== 'no');
          setMarkIncomingReaded(settings.markIncomingMessagesReaded === 'yes');
        }
      });
    }
  }, [isOpen]);

  const handleSaveSettings = async () => {
    if (!webhookUrl.trim()) {
      alert('נא להזין כתובת Webhook URL חוקית');
      return;
    }

    setIsLoading(true);
    setStatusMsg(null);
    setTestResult(null);

    const payload: GreenApiInstanceSettings = {
      webhookUrl: webhookUrl.trim(),
      webhookUrlToken: webhookUrlToken.trim(),
      delaySendMessagesMilliseconds: Number(delayMs) || 1000,
      incomingWebhook: incomingWebhook ? 'yes' : 'no',
      outgoingWebhook: outgoingWebhook ? 'yes' : 'no',
      outgoingMessageWebhook: outgoingMessageWebhook ? 'yes' : 'no',
      stateWebhook: stateWebhook ? 'yes' : 'no',
      deviceWebhook: deviceWebhook ? 'yes' : 'no',
      pollMessageWebhook: pollMessageWebhook ? 'yes' : 'no',
      incomingCallWebhook: incomingCallWebhook ? 'yes' : 'no',
      markIncomingMessagesReaded: markIncomingReaded ? 'yes' : 'no',
    };

    const res = await service.setSettings(payload);
    setIsLoading(false);

    if (res.saveStatus || !res.error) {
      setStatusMsg('הגדרות ה-Webhook נשמרו וסונכרנו בהצלחה ב-Green-API!');
      if (onSaved) onSaved(payload);
      setTimeout(onClose, 1200);
    } else {
      alert(res.error || 'שגיאה בשמירת הגדרות ה-Webhook');
    }
  };

  const handleTestWebhookPing = async () => {
    if (!webhookUrl.trim()) {
      alert('נא להזין כתובת Webhook לבדיקה');
      return;
    }
    setIsTestingWebhook(true);
    setTestResult(null);

    try {
      const testPayload = {
        typeWebhook: 'testNotification',
        instanceData: { idInstance: service.baseUrl.split('waInstance')[1] || '' },
        timestamp: Math.floor(Date.now() / 1000),
        message: 'בדיקת חיבור Webhook מ-Comona Green-API Hub',
      };

      const res = await fetch(webhookUrl.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(webhookUrlToken.trim() ? { 'Authorization': `Bearer ${webhookUrlToken.trim()}` } : {}),
        },
        body: JSON.stringify(testPayload),
      });

      if (res.ok) {
        setTestResult({
          success: true,
          msg: `שרת ה-Webhook הגיב בהצלחה (${res.status} ${res.statusText})`,
        });
      } else {
        setTestResult({
          success: false,
          msg: `שרת ה-Webhook החזיר סטטוס שגיאה (${res.status} ${res.statusText})`,
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        msg: e.message || 'שגיאת רשת בשליחת בדיקה ל-Webhook URL',
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const sampleJson = JSON.stringify(
    {
      typeWebhook: 'incomingMessageReceived',
      instanceData: { idInstance: 110182, wid: '972501234567@c.us', typeInstance: 'whatsapp' },
      timestamp: 1690000000,
      idMessage: 'BAE5F...',
      senderData: { chatId: '972509876543@c.us', sender: '972509876543@c.us', senderName: 'ישראל ישראלי' },
      messageData: {
        typeMessage: 'textMessage',
        textMessageData: { textMessage: 'שלום, רציתי לקבל מידע נוסף' },
      },
    },
    null,
    2
  );

  const handleCopySample = () => {
    navigator.clipboard.writeText(sampleJson);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col text-right text-slate-100 animate-fade-in">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">הגדרת וסנכרון Webhook ב-Green-API</h3>
              <p className="text-[11px] text-slate-400">קבלת אירועים והודעות בזמן אמת לשרת המערכת (Comona Webhook Server)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* Webhook URLs */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <label className="block text-slate-300 font-semibold">
                  Webhook URL (כתובת יעד לקבלת אירועים בזמן אמת) *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://app.comona.io';
                    setWebhookUrl(`${origin}/api/webhook/whatsapp`);
                  }}
                  className="text-[11px] text-purple-300 hover:text-purple-200 px-2 py-0.5 bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>⚡ צור כתובת Webhook של השרת</span>
                </button>
              </div>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://yourserver.com/api/webhook/whatsapp"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-purple-500 outline-none"
                dir="ltr"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Webhook Secret Token (אופציונלי לאבטחה)</label>
                <input
                  type="text"
                  value={webhookUrlToken}
                  onChange={(e) => setWebhookUrlToken(e.target.value)}
                  placeholder="Bearer token או מפתח סודי"
                  className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-purple-500 outline-none"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">השהיית שליחה בין הודעות (מילישניות)</label>
                <input
                  type="number"
                  value={delayMs}
                  onChange={(e) => setDelayMs(Number(e.target.value))}
                  placeholder="1000"
                  className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-purple-500 outline-none"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Test Ping */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleTestWebhookPing}
                disabled={isTestingWebhook}
                className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 font-medium rounded-lg flex items-center gap-1.5 transition cursor-pointer"
              >
                <Send className={`w-3.5 h-3.5 ${isTestingWebhook ? 'animate-spin' : ''}`} />
                <span>{isTestingWebhook ? 'בודק שרת Webhook...' : 'שלח בדיקת פינג חיה (Test Webhook)'}</span>
              </button>

              {testResult && (
                <div className={`text-[11px] font-medium flex items-center gap-1.5 ${
                  testResult.success ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {testResult.success ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  <span>{testResult.msg}</span>
                </div>
              )}
            </div>
          </div>

          {/* Event Toggles */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>בחירת אירועים לשידור לוואבהוק (Event Subscriptions):</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={incomingWebhook}
                  onChange={(e) => setIncomingWebhook(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-slate-200">הודעות נכנסות (incomingMessageReceived)</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={outgoingMessageWebhook}
                  onChange={(e) => setOutgoingMessageWebhook(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-slate-200">סטטוסי מסירה וקריאה (outgoingMessageStatus)</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stateWebhook}
                  onChange={(e) => setStateWebhook(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-slate-200">שינויי מצב מופע (stateInstanceChanged)</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deviceWebhook}
                  onChange={(e) => setDeviceWebhook(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-slate-200">מידע על סוללה ומכשיר (deviceInfo)</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pollMessageWebhook}
                  onChange={(e) => setPollMessageWebhook(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-slate-200">תשובות לסקרים (pollMessageWebhook)</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={incomingCallWebhook}
                  onChange={(e) => setIncomingCallWebhook(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-slate-200">שיחות נכנסות (incomingCallWebhook)</span>
              </label>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 p-2 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400">
                <input
                  type="checkbox"
                  checked={markIncomingReaded}
                  onChange={(e) => setMarkIncomingReaded(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>סמן אוטומטית הודעות נכנסות כ"נקרא" (V כחול אוטומטי)</span>
              </label>
            </div>
          </div>

          {/* Sample Webhook Payload */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-mono text-[11px]">דוגמת מבנה Payload הנשלח ל-Webhook:</span>
              <button
                type="button"
                onClick={handleCopySample}
                className="text-[11px] text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedSample ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSample ? 'הועתק!' : 'העתק JSON'}</span>
              </button>
            </div>
            <pre className="p-2.5 bg-slate-900 rounded-xl text-[10px] font-mono text-slate-300 max-h-32 overflow-y-auto" dir="ltr">
              {sampleJson}
            </pre>
          </div>

          {statusMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition cursor-pointer"
          >
            ביטול
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'שומר ומסנכרן...' : 'שמור וסנכרן ל-Green-API'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
