import React from 'react';
import { X, ShieldCheck, Mail, Phone, Calendar, Printer, AlertCircle } from 'lucide-react';
import { useKosAccess } from '../hooks/useKosAccess';

export const KosAccessStatementModal: React.FC = () => {
  const { isStatementOpen, closeStatement, openFeedback, declaration } = useKosAccess();

  if (!isStatementOpen) return null;

  const orgName = declaration?.organizationName || 'אתר זה ומערכת KOSUN';
  const coordName = declaration?.coordinatorName || 'רכז נגישות מוסמך';
  const coordEmail = declaration?.coordinatorEmail || 'accessibility@domain.com';
  const coordPhone = declaration?.coordinatorPhone || '03-0000000';
  const coordHours = declaration?.coordinatorHours || 'ימים א\'-ה\' בין השעות 09:00 - 17:00';
  const auditDate = declaration?.lastAuditDate || new Date().toISOString().split('T')[0];
  const statementDate = declaration?.statementDate || '2026-01-01';
  const receptionInfo = declaration?.receptionAccessibility || 'המשרדים הראשיים נגישים לכיסאות גלגלים, קיימת מעלית מונגשת וחניית נכים מסומנת.';

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div
      id="kos-access-portal"
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-statement-title"
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-white text-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h2 id="accessibility-statement-title" className="text-xl font-bold">
                הצהרת נגישות
              </h2>
              <p className="text-xs text-blue-100">
                לפי חוק שוויון זכויות לאנשים עם מוגבלות, תקנות הנגישות ותקן ת"י 5568
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="הדפסת הצהרת נגישות"
              aria-label="הדפסת הצהרת נגישות"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={closeStatement}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="סגירת חלון (Esc)"
              aria-label="סגירת הצהרת נגישות"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-gray-700 leading-relaxed">
          {/* General Commitment */}
          <section className="bg-blue-50/70 p-4 rounded-xl border border-blue-100">
            <h3 className="font-bold text-blue-900 text-base mb-1">מחויבות הארגון לנגישות דיגיטלית</h3>
            <p>
              ב-<strong>{orgName}</strong> אנו רואים חשיבות עליונה במתן שירות שוויוני, מכבד, נגיש ומקצועי לכלל
              האזרחים והלקוחות, לרבות אנשים עם מוגבלות. אנו משקיעים משאבים רבים על מנת להנגיש את אתר האינטרנט
              ודפיו כך שיהיו זמינים, נוחים וידידותיים לכלל האוכלוסייה.
            </p>
          </section>

          {/* Legal Standards */}
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">סטטוס עמידה בתקנים (תקן ת"י 5568 ו-WCAG 2.2 AA)</h3>
            <p>
              אתר זה נבנה ומתוחזק בהתאם להוראות הנגישות לפי <strong>תקנה 35 לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), תשע"ג-2013</strong>,
              וכן בהתאם ל<strong>תקן ישראלי ת"י 5568</strong> ("קווים מנחים לנגישות תכנים באינטרנט"), המאמץ את מסמך ההנחיות הבינלאומי של ארגון W3C:
              <strong> Web Content Accessibility Guidelines (WCAG) 2.1 ו-2.2 ברמת נגישות AA</strong>.
            </p>
          </section>

          {/* Accommodations List */}
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">התאמות הנגישות העיקריות שבוצעו באתר</h3>
            <ul className="list-disc list-inside space-y-1.5 text-gray-700 pr-2">
              <li>
                <strong>ניווט מקלדת מלא:</strong> תמיכה מלאה בהפעלת כל מרכיבי הממשק, התפריטים והטפסים באמצעות מקלדת בלבד (Tab, Shift+Tab, Enter, Space ומקשי חיצים).
              </li>
              <li>
                <strong>עקיפת בלוקים:</strong> שילוב קישור "דלג לתוכן מרכזי" בראש כל עמוד המאפשר למשתמשי מקלדת וקוראי מסך לדלג ישירות לתוכן העיקרי.
              </li>
              <li>
                <strong>התאמות ראייה וצבע:</strong> אפשרויות ניגודיות כהה (Dark), ניגודיות בהירה (Light), היפוך צבעים וגווני אפור (Monochrome), יחס ניגודיות מעל 4.5:1.
              </li>
              <li>
                <strong>שינוי גודל טקסט:</strong> אפשרות להגדלת גופנים עד 200% במחשב ובמכשירים ניידים מבלי לפגוע בפריסת העמוד (Reflow).
              </li>
              <li>
                <strong>תמיכה בדיסלקציה וקריאות:</strong> גופן קריא מותאם, ריווח אותיות ושורות מוגדל (Text Spacing לפי WCAG 1.4.12).
              </li>
              <li>
                <strong>הגנה מפני אפילפסיה ורגישות תנועתית:</strong> אפשרות לעצירת אנימציות, מעברים והבהובים באתר.
              </li>
              <li>
                <strong>עזרי מיקוד וקריאה:</strong> סרגל קריאה צף ומיסוך קריאה ממוקד (Reading Mask) לסיוע לגולשים עם הפרעות קשב וריכוז (ADHD).
              </li>
              <li>
                <strong>תאימות לקוראי מסך:</strong> התאמה לתוכנות קורא מסך מובילות (NVDA, JAWS, VoiceOver, TalkBack) באמצעות תגיות WAI-ARIA סמנטיות ומבנה כותרות תקין.
              </li>
              <li>
                <strong>סמן עכבר מוגדל:</strong> אפשרות לבחירת סמן מוגדל שחור או לבן לניווט קל.
              </li>
              <li>
                <strong>רספונסיביות מלאה:</strong> התאמה לכל סוגי המסכים ומסכי מגע עם שטחי מגע מינימליים של לפחות 44x44 פיקסלים.
              </li>
            </ul>
          </section>

          {/* Physical Accessibility */}
          <section className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h3 className="font-bold text-gray-900 text-base mb-1">הסדרי נגישות פיזיים</h3>
            <p>{receptionInfo}</p>
          </section>

          {/* Coordinator Details */}
          <section className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100">
            <h3 className="font-bold text-indigo-950 text-base mb-2">פרטי רכז/ת הנגישות בארגון</h3>
            <p className="mb-2">
              בכל שאלה, הבהרה, בקשה לסיוע או מידע בנושא נגישות, ניתן לפנות לרכז/ת הנגישות:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">שם הרכז/ת:</span>
                <span>{coordName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-600" />
                <a href={`mailto:${coordEmail}`} className="text-blue-600 hover:underline">
                  {coordEmail}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-600" />
                <a href={`tel:${coordPhone}`} className="text-blue-600 hover:underline">
                  {coordPhone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>{coordHours}</span>
              </div>
            </div>
          </section>

          {/* Dates & Feedback */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-gray-200 text-xs text-gray-500">
            <div>
              <span>תאריך עדכון ההצהרה: {statementDate}</span>
              <span className="mx-2">|</span>
              <span>בדיקת תאימות אחרונה: {auditDate}</span>
            </div>
            <button
              onClick={() => {
                closeStatement();
                openFeedback();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-xs"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              דיווח על תקלת נגישות
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KosAccessStatementModal;
