import React, { useState } from 'react';
import { X, AlertCircle, Send, CheckCircle2, Monitor, Smartphone, Tablet } from 'lucide-react';
import { useKosAccess } from '../hooks/useKosAccess';
import { KosAccessFirestoreService } from '../services/kosAccessFirestore';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';

export const KosAccessFeedbackModal: React.FC = () => {
  const { isFeedbackOpen, closeFeedback, tenantId } = useKosAccess();
  const { db } = useSystemConnection();

  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [deviceType, setDeviceType] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');
  const [assistiveTechUsed, setAssistiveTechUsed] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isFeedbackOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage('נא לתאר את הבעיה או הקושי בו נתקלת');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (db) {
        await KosAccessFirestoreService.submitFeedback(db, tenantId, {
          reporterName: reporterName || 'פונה אנונימי',
          reporterEmail,
          reporterPhone,
          deviceType,
          assistiveTechUsed: assistiveTechUsed || 'לא צוין',
          description,
          pageUrl: typeof window !== 'undefined' ? window.location.href : '',
        });
      }
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage('אירעה שגיאה בשליחת הפנייה. נסו שוב או פנו ישירות לרכז הנגישות.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setDescription('');
    setReporterName('');
    setReporterEmail('');
    setReporterPhone('');
    setAssistiveTechUsed('');
    setErrorMessage(null);
    closeFeedback();
  };

  return (
    <div
      id="kos-access-portal"
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-dialog-title"
    >
      <div
        className="relative w-full max-w-xl bg-white text-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h2 id="feedback-dialog-title" className="text-lg font-bold">
                דיווח על תקלה או בקשת התאמת נגישות
              </h2>
              <p className="text-xs text-blue-100">
                נתקלתם בקושי בגלישה? הודיעו לנו ונטפל בכך בהקדם
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="סגירה"
            aria-label="סגירת טופס דיווח"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {isSubmitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">הפנייה התקבלה בהצלחה!</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                תודה רבה על תשומת הלב והדיווח. רכז הנגישות בארגון יבדוק את הפנייה בהקדם ויפעל לתיקון ההתאמה הנדרשת.
              </p>
              <button
                onClick={handleResetAndClose}
                className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md"
              >
                סגור חלון
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  תיאור התקלה או בקשת ההתאמה <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="אנא פרטו באיזה עמוד גלשתם, מה ניסיתם לבצע, ואיזה קושי התעורר..."
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">שם מלא (רשות)</label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="שם הפונה"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">טלפון לחזרה (רשות)</label>
                  <input
                    type="tel"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    placeholder="050-0000000"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">דוא"ל למענה</label>
                <input
                  type="email"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Device & Assistive Tech */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">סוג המכשיר בו גלשתם</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeviceType('desktop')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                      deviceType === 'desktop'
                        ? 'bg-blue-50 border-blue-600 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Monitor className="w-4 h-4" /> מחשב
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceType('mobile')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                      deviceType === 'mobile'
                        ? 'bg-blue-50 border-blue-600 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" /> טלפון נייד
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceType('tablet')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                      deviceType === 'tablet'
                        ? 'bg-blue-50 border-blue-600 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Tablet className="w-4 h-4" /> טאבלט
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  טכנולוגיה מסייעת בשימוש (למשל: NVDA, JAWS, הגדלת מסך, מקלדת בלבד)
                </label>
                <input
                  type="text"
                  value={assistiveTechUsed}
                  onChange={(e) => setAssistiveTechUsed(e.target.value)}
                  placeholder="ציינו טכנולוגיה מסייעת (אם נעשה שימוש)"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Submit */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-xl text-gray-700 text-xs font-semibold transition-colors"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'שולח...' : 'שליחת דיווח'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default KosAccessFeedbackModal;
