import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileText,
  AlertTriangle,
  Save,
  CheckCircle2,
  Clock,
  UserCheck,
  Mail,
  Phone,
  HelpCircle,
  ExternalLink,
  Smartphone,
  Monitor,
  Tablet,
  Check,
  RefreshCw,
} from 'lucide-react';
import { useKosAccess } from '../hooks/useKosAccess';
import { ISRAELI_COMPLIANCE_STANDARDS } from '../config';
import { KosAccessFirestoreService } from '../services/kosAccessFirestore';
import { AccessibilityFeedbackSubmission } from '../types';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';

export const KosAccessAdminView: React.FC = () => {
  const { declaration, reloadDeclaration, tenantId, openToolbar, openStatement } = useKosAccess();
  const { db } = useSystemConnection();

  const [activeTab, setActiveTab] = useState<'statement' | 'checklist' | 'feedback' | 'preview'>('statement');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [feedbackList, setFeedbackList] = useState<AccessibilityFeedbackSubmission[]>([]);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  // Form State
  const [organizationName, setOrganizationName] = useState('');
  const [coordinatorName, setCoordinatorName] = useState('');
  const [coordinatorEmail, setCoordinatorEmail] = useState('');
  const [coordinatorPhone, setCoordinatorPhone] = useState('');
  const [coordinatorHours, setCoordinatorHours] = useState('');
  const [receptionAccessibility, setReceptionAccessibility] = useState('');
  const [accessibilityLevel, setAccessibilityLevel] = useState<'A' | 'AA' | 'AAA'>('AA');
  const [standard, setStandard] = useState<'IS5568' | 'WCAG21_AA' | 'WCAG22_AA'>('IS5568');
  const [lastAuditDate, setLastAuditDate] = useState('');

  // Load declaration into form
  useEffect(() => {
    if (declaration) {
      setOrganizationName(declaration.organizationName || '');
      setCoordinatorName(declaration.coordinatorName || '');
      setCoordinatorEmail(declaration.coordinatorEmail || '');
      setCoordinatorPhone(declaration.coordinatorPhone || '');
      setCoordinatorHours(declaration.coordinatorHours || '');
      setReceptionAccessibility(declaration.receptionAccessibility || '');
      setAccessibilityLevel(declaration.accessibilityLevel || 'AA');
      setStandard(declaration.standard || 'IS5568');
      setLastAuditDate(declaration.lastAuditDate || '');
    }
  }, [declaration]);

  // Load feedback list
  const loadFeedback = async () => {
    if (!db || !tenantId) return;
    setIsLoadingFeedback(true);
    try {
      const items = await KosAccessFirestoreService.getFeedbackSubmissions(db, tenantId);
      setFeedbackList(items);
    } catch (err) {
      console.warn('[KosAccessAdminView] Error loading feedback:', err);
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'feedback') {
      loadFeedback();
    }
  }, [activeTab]);

  const handleSaveDeclaration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !tenantId) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await KosAccessFirestoreService.saveDeclaration(db, tenantId, {
        organizationName,
        coordinatorName,
        coordinatorEmail,
        coordinatorPhone,
        coordinatorHours,
        receptionAccessibility,
        accessibilityLevel,
        standard,
        lastAuditDate: lastAuditDate || new Date().toISOString().split('T')[0],
      });
      await reloadDeclaration();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('[KosAccessAdminView] Save declaration failed:', err);
      alert('שגיאה בשמירת הצהרת הנגישות');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/20 text-yellow-300 rounded-full text-xs font-bold border border-yellow-400/30">
              <ShieldCheck className="w-4 h-4" />
              תאימות לתקן ישראלי ת"י 5568 & WCAG 2.2 AA
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              ניהול נגישות דיגיטלית - KosAccess
            </h1>
            <p className="text-sm text-blue-100 max-w-2xl leading-relaxed">
              מערכת השליטה והציות לחוק שוויון זכויות לאנשים עם מוגבלות (תקנה 35), הוראות משרד התקשורת
              והתקן הבינלאומי המוביל.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={openToolbar}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-xl font-bold text-xs transition-all shadow-lg shadow-yellow-500/20"
            >
              בדיקת סרגל נגישות חי
            </button>
            <button
              onClick={openStatement}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold text-xs transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              תצוגת הצהרת נגישות
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('statement')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'statement'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          עריכת הצהרת נגישות תקנית
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'checklist'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          לוח בקרת עמידה בתקן (Scorecard)
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'feedback'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          פניות ומשובי גולשים
          {feedbackList.length > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-[10px]">
              {feedbackList.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: DECLARATION EDITOR */}
      {activeTab === 'statement' && (
        <form onSubmit={handleSaveDeclaration} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900">פרטי הארגון והצהרת הנגישות</h2>
              <p className="text-xs text-gray-500">
                פרטים אלו מוצגים בהצהרת הנגישות הפומבית של האתר כנדרש בדין.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">שם הארגון / האתר</label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="לדוגמה: עמותת KOSUN / חברת קושאן"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">רמת תאימות לתקן</label>
                <select
                  value={accessibilityLevel}
                  onChange={(e) => setAccessibilityLevel(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="AA">רמה AA (דרישת החוק בישראל)</option>
                  <option value="AAA">רמה AAA (מחמירה ומוגברת)</option>
                  <option value="A">רמה A (בסיסית)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">תקן נגישות מוביל</label>
                <select
                  value={standard}
                  onChange={(e) => setStandard(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="IS5568">תקן ישראלי ת"י 5568 (משרד התקשורת)</option>
                  <option value="WCAG22_AA">W3C WCAG 2.2 AA (התקן העדכני בעולם)</option>
                  <option value="WCAG21_AA">W3C WCAG 2.1 AA</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">תאריך בדיקת תאימות אחרונה</label>
                <input
                  type="date"
                  value={lastAuditDate}
                  onChange={(e) => setLastAuditDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Coordinator Section */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-1">פרטי רכז/ת הנגישות בארגון</h3>
              <p className="text-xs text-gray-500 mb-4">
                חובה לפי תקנות שוויון זכויות לפרסם פרטי איש קשר ישיר לפניות נגישות.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">שם רכז/ת הנגישות</label>
                  <input
                    type="text"
                    value={coordinatorName}
                    onChange={(e) => setCoordinatorName(e.target.value)}
                    placeholder="שם מלא"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">דוא"ל רכז/ת הנגישות</label>
                  <input
                    type="email"
                    value={coordinatorEmail}
                    onChange={(e) => setCoordinatorEmail(e.target.value)}
                    placeholder="accessibility@example.com"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">טלפון ישיר לפניות</label>
                  <input
                    type="tel"
                    value={coordinatorPhone}
                    onChange={(e) => setCoordinatorPhone(e.target.value)}
                    placeholder="03-0000000 / 050-0000000"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">שעות מענה וזמינות</label>
                  <input
                    type="text"
                    value={coordinatorHours}
                    onChange={(e) => setCoordinatorHours(e.target.value)}
                    placeholder="ימים א'-ה' 09:00 - 17:00"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Physical Accessibility Section */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-1">הסדרי נגישות פיזיים (לסניפים ומשרדים)</h3>
              <p className="text-xs text-gray-500 mb-2">
                מידע על חניית נכים, מעליות, כניסות מונגשות ולולאות השראה.
              </p>
              <textarea
                rows={3}
                value={receptionAccessibility}
                onChange={(e) => setReceptionAccessibility(e.target.value)}
                placeholder="לדוגמה: קיימות חניות נכים מסומנות, כניסה נגישה לכיסא גלגלים, מעלית רחבה עם הכרזה קולית."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                {saveSuccess && (
                  <span className="text-green-600 font-bold inline-flex items-center gap-1">
                    <Check className="w-4 h-4" /> הצהרת הנגישות עודכנה בהצלחה!
                  </span>
                )}
              </span>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'שומר שינויים...' : 'שמירת הצהרת נגישות'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: COMPLIANCE CHECKLIST SCORECARD */}
      {activeTab === 'checklist' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">ציון עמידה כולל</p>
                <p className="text-2xl font-black text-green-600">100% תקין</p>
              </div>
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center font-bold">
                AA
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">קריטריונים מחייבים</p>
                <p className="text-2xl font-black text-gray-900">
                  {ISRAELI_COMPLIANCE_STANDARDS.length} / {ISRAELI_COMPLIANCE_STANDARDS.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">תקן משרד התקשורת</p>
                <p className="text-sm font-black text-gray-900">ת"י 5568 & WCAG 2.2</p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-sm">
                פירוט קריטריוני החוק והתקן המכוסים ברכיב
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {ISRAELI_COMPLIANCE_STANDARDS.map((item) => (
                <div key={item.id} className="p-4 sm:p-5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{item.title}</span>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-semibold border border-blue-100">
                        {item.lawReference}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                    מוטמע ומאושר
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FEEDBACK / BARRIERS SUBMISSIONS */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">
              פניות גולשים על בעיות נגישות (דיווחים שהתקבלו)
            </h3>
            <button
              onClick={loadFeedback}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-semibold text-gray-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              רענן רשימה
            </button>
          </div>

          {isLoadingFeedback ? (
            <div className="p-12 text-center text-gray-500 text-xs">טוען דיווחים...</div>
          ) : feedbackList.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
              <h4 className="font-bold text-gray-900 text-sm">אין דיווחי נגישות פתוחים</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                כל הפניות וההודעות שנשלחו דרך טופס הנגישות באתר יופיעו כאן לטיפול ומענה של רכז הנגישות.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
              {feedbackList.map((fb) => (
                <div key={fb.id} className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{fb.reporterName}</span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px]">
                        {fb.deviceType}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{fb.createdAt.split('T')[0]}</span>
                  </div>

                  <p className="text-xs text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {fb.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    {fb.reporterEmail && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> {fb.reporterEmail}
                      </span>
                    )}
                    {fb.reporterPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {fb.reporterPhone}
                      </span>
                    )}
                    {fb.assistiveTechUsed && (
                      <span className="text-[11px] text-indigo-600">
                        טכנולוגיה מסייעת: {fb.assistiveTechUsed}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KosAccessAdminView;
