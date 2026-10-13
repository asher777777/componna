import React from 'react';
import { SmartFormSubmission, SmartFormDefinition } from '../../types';
import { LuxuryIconRenderer } from '../shared/LuxuryIconRenderer';
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  Smartphone,
  Monitor,
  Globe,
  Flame,
  Zap,
  ShieldCheck,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Link,
  HelpCircle,
  FileText,
  UserCheck,
  CheckCircle,
  Send,
  RefreshCw,
} from 'lucide-react';
import { getGreenApiService } from '../../services/formWhatsAppService';

export interface SubmissionDetailModalProps {
  isOpen: boolean;
  submission: SmartFormSubmission | null;
  form: SmartFormDefinition;
  onClose: () => void;
}

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  isOpen,
  submission,
  form,
  onClose,
}) => {
  if (!isOpen || !submission) return null;

  const leadName =
    submission.answers['conta_name'] ||
    submission.answers['name'] ||
    submission.answers['fullName'] ||
    'פנייה מטופס דיגיטלי';

  const leadPhone =
    submission.answers['conta_phone'] ||
    submission.answers['phone'] ||
    submission.answers['tel'] ||
    '';

  const leadEmail =
    submission.answers['email'] ||
    submission.answers['mail'] ||
    '';

  const meta = submission.metadata;
  const cleanPhone = String(leadPhone).replace(/[^\d+]/g, '');
  const waPhone = cleanPhone.startsWith('0') ? `972${cleanPhone.slice(1)}` : cleanPhone;

  const [quickMsg, setQuickMsg] = React.useState('');
  const [isSendingQuickMsg, setIsSendingQuickMsg] = React.useState(false);
  const [quickMsgStatus, setQuickMsgStatus] = React.useState<string | null>(null);
  const [deliveries, setDeliveries] = React.useState(submission.whatsappDeliveries || []);

  const handleSendDirectWhatsApp = async () => {
    if (!quickMsg.trim() || !cleanPhone) return;
    const green = getGreenApiService();
    if (!green || !green.isConfigured()) {
      setQuickMsgStatus('שירות Green-API לא מוגדר');
      return;
    }

    setIsSendingQuickMsg(true);
    setQuickMsgStatus(null);
    try {
      const res = await green.sendMessage({
        chatId: cleanPhone,
        message: quickMsg.trim(),
      });

      if (res?.idMessage) {
        setQuickMsgStatus('נשלח בהצלחה!');
        const newDelivery = {
          ruleId: 'direct_send',
          ruleName: 'שליחה ידנית מכרטיס הליד',
          recipientPhone: cleanPhone,
          recipientType: 'submitter' as const,
          status: 'sent' as const,
          messageId: res.idMessage,
          sentAt: new Date().toISOString(),
          renderedMessage: quickMsg.trim(),
        };
        setDeliveries((prev) => [newDelivery, ...prev]);
        setQuickMsg('');
      } else {
        setQuickMsgStatus(res?.error || 'שגיאה במשלוח');
      }
    } catch (e: any) {
      setQuickMsgStatus(e?.message || 'שגיאה במשלוח');
    } finally {
      setIsSendingQuickMsg(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        dir="rtl"
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Top Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 rounded-2xl shadow-md">
              <LuxuryIconRenderer iconName="User" className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-xl">
                  {leadName}
                </h3>
                {meta?.leadTemperature === 'hot' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    ליד חם ({meta.leadScore || 90}/100)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    ליד פעיל ({meta?.leadScore || 75}/100)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                טופס: <span className="font-semibold text-slate-700 dark:text-slate-300">{form.title}</span> • מזהה: <span className="font-mono text-[11px]">{submission.id}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Quick Contact & Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            {/* Phone */}
            <div className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block font-bold">מספר טלפון</span>
                <span dir="ltr" className="text-xs font-mono font-bold text-slate-800 dark:text-white block text-right">
                  {leadPhone || 'לא צוין'}
                </span>
              </div>
              {cleanPhone && (
                <div className="flex items-center gap-1">
                  <a
                    href={`https://wa.me/${waPhone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                    title="שלח וואטסאפ"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`tel:${cleanPhone}`}
                    className="p-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors shadow-sm"
                    title="חייג למספר"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block font-bold">דואר אלקטרוני</span>
                <span dir="ltr" className="text-xs font-mono text-slate-800 dark:text-white block truncate text-right">
                  {leadEmail || 'לא צוין'}
                </span>
              </div>
              {leadEmail && (
                <a
                  href={`mailto:${leadEmail}`}
                  className="p-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
                  title="שלח מייל"
                >
                  <Mail className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-2.5 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
              <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">תאריך הגשה</span>
                <span dir="ltr" className="text-xs font-mono text-slate-700 dark:text-slate-300 block">
                  {new Date(submission.submittedAt).toLocaleString('he-IL')}
                </span>
              </div>
            </div>
          </div>

          {/* All Questions & Answers Breakdown */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-800 dark:text-white text-sm flex items-center gap-2">
              <LuxuryIconRenderer iconName="ClipboardList" className="w-4 h-4 text-amber-500" />
              <span>תשובות ונתוני הטופס שנענו:</span>
            </h4>

            <div className="space-y-2.5">
              {form.steps.map((step, idx) => {
                const answerValue = submission.answers[step.mappingKey || step.id];
                let displayVal = '-';
                if (answerValue !== undefined && answerValue !== null && answerValue !== '') {
                  if (Array.isArray(answerValue)) displayVal = answerValue.join(', ');
                  else if (typeof answerValue === 'object') displayVal = JSON.stringify(answerValue);
                  else displayVal = String(answerValue);
                }

                const isNumberOrPhone = step.fieldType === 'phone' || step.fieldType === 'number';

                return (
                  <div
                    key={step.id || idx}
                    className="p-3.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex items-start justify-between gap-4 transition-colors hover:border-amber-400/40"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/70 text-amber-500 shrink-0 mt-0.5">
                        <LuxuryIconRenderer iconName={step.iconName} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {step.title}
                        </div>
                        {step.subtitle && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {step.subtitle}
                          </div>
                        )}
                        <span className="inline-block mt-1 text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                          מפתח: {step.mappingKey || step.id} ({step.fieldType})
                        </span>
                      </div>
                    </div>

                    <div
                      dir={isNumberOrPhone ? 'ltr' : 'rtl'}
                      className={`text-sm font-bold px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white max-w-xs break-words ${
                        isNumberOrPhone ? 'font-mono text-left' : 'text-right'
                      }`}
                    >
                      {displayVal}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Automatic Client Telemetry & Intelligence */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-800 dark:text-white text-sm flex items-center gap-2">
              <LuxuryIconRenderer iconName="Sliders" className="w-4 h-4 text-amber-500" />
              <span>נתונים טכנולוגיים שנדלו אוטומטית (Automated Telemetry):</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Device */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">סוג מכשיר ומערכת</span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  {meta?.deviceType === 'mobile' ? (
                    <Smartphone className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <Monitor className="w-3.5 h-3.5 text-indigo-500" />
                  )}
                  <span>{meta?.os || 'דסקטופ'} ({meta?.browser || 'Chrome'})</span>
                </div>
              </div>

              {/* Resolution */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">רזולוציית מסך</span>
                <span dir="ltr" className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 block text-right">
                  {meta?.screenResolution || '1920x1080'}
                </span>
              </div>

              {/* Timezone */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">אזור זמן ושפה</span>
                <span dir="ltr" className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 block text-right truncate">
                  {meta?.timezone || 'Asia/Jerusalem'} ({meta?.language || 'he-IL'})
                </span>
              </div>

              {/* Duration */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">זמן שהייה ומילוי</span>
                <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{submission.completionTimeSeconds ? `${submission.completionTimeSeconds} שניות` : '-'}</span>
                </div>
              </div>
            </div>

            {/* Referrer & UTM */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold">מקור תנועה / עמוד הגעה:</span>
                <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-md">
                  {meta?.referrer || meta?.pageUrl || 'ישיר (Direct)'}
                </span>
              </div>

              {/* Page Title & Author Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="text-[10px] text-slate-400 font-bold">כותרת העמוד:</span>
                  <span className="font-semibold truncate">{meta?.pageTitle || 'ללא כותרת'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="text-[10px] text-slate-400 font-bold">מחבר העמוד:</span>
                  <span className="font-semibold truncate">{meta?.pageAuthor || form.createdBy || 'מנהל המערכת'}</span>
                </div>
              </div>

              {(meta?.utmSource || meta?.utmCampaign) && (
                <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-amber-600 dark:text-amber-400 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span>קמפיין: {meta.utmCampaign || 'כללי'}</span>
                  <span>• מקור: {meta.utmSource || 'ישיר'}</span>
                </div>
              )}
            </div>
          </div>

          {/* WhatsApp Automations & Direct Dispatch */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-800 dark:text-white text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <span>הודעות ואוטומציות וואטסאפ (GREEN-API Delivery):</span>
            </h4>

            {/* Delivery Logs */}
            {deliveries && deliveries.length > 0 ? (
              <div className="space-y-2">
                {deliveries.map((del, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col gap-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            del.status === 'sent'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {del.status === 'sent' ? 'נשלח בהצלחה' : 'נכשל / בוטל'}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-white">
                          {del.ruleName}
                        </span>
                      </div>

                      <span dir="ltr" className="font-mono text-[11px] text-slate-400">
                        {del.recipientPhone} • {new Date(del.sentAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {del.renderedMessage && (
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 font-sans text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {del.renderedMessage}
                      </div>
                    )}

                    {del.error && (
                      <span className="text-[11px] text-rose-500 font-medium">
                        שגיאה: {del.error}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                לא הופעלו אוטומציות וואטסאפ בעת הגשת טופס זה.
              </div>
            )}

            {/* Direct Quick WhatsApp Reply */}
            {cleanPhone && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    שליחת הודעת WhatsApp ישירה לליד ({cleanPhone}):
                  </span>
                  {quickMsgStatus && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {quickMsgStatus}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={quickMsg}
                    onChange={(e) => setQuickMsg(e.target.value)}
                    placeholder={`הזן הודעה אישית ל-${leadName}...`}
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendDirectWhatsApp();
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSendDirectWhatsApp}
                    disabled={isSendingQuickMsg || !quickMsg.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
                  >
                    {isSendingQuickMsg ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>שלח עכשיו</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>סונכרן למסד הנתונים ול-CRM</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 font-bold"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
