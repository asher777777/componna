import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Sparkles,
  Plus,
  Trash2,
  Package,
  Tag,
  FileCheck2,
  UserPlus,
  Award,
  CheckCircle2,
  ShieldCheck,
  Lock,
  XCircle,
  LayoutDashboard,
} from 'lucide-react';
import { useKosSubscribed } from '../hooks/useKosSubscribed';
import {
  SubscriptionBillingCycle,
  ContentSubscriptionStatus,
  SubscriptionContentItem,
  SubscriptionQuizQuestion,
  SubscriberUserRole,
} from '../types';
import { SubscriberPortalView } from './SubscriberPortalView';

export const KosSubscribedModals: React.FC = () => {
  const {
    tenantId,
    modalMode,
    setModalMode,
    contacts,
    packages,
    selectedContact,
    editingPackage,
    editingCoupon,
    editingQuiz,
    activeQuizForAttempt,
    assignPackageToContact,
    updateSubscriberPermissions,
    savePackage,
    generateAiCopyForPackage,
    saveCoupon,
    saveQuiz,
    submitQuizAttempt,
    isBusy,
  } = useKosSubscribed();

  // 1. Assign Package to Contact State
  const [assignContactId, setAssignContactId] = useState('');
  const [assignPkgId, setAssignPkgId] = useState('');
  const [assignCouponCode, setAssignCouponCode] = useState('');
  const [assignStatus, setAssignStatus] = useState<ContentSubscriptionStatus>('active');
  const [assignPaymentMethod, setAssignPaymentMethod] = useState('אשראי / הוראת קבע');
  const [assignNotes, setAssignNotes] = useState('');

  // 2. Edit / Create Package State
  const [pkgName, setPkgName] = useState('');
  const [pkgDesc, setPkgDesc] = useState('');
  const [pkgPrice, setPkgPrice] = useState(0);
  const [pkgOrigPrice, setPkgOrigPrice] = useState(0);
  const [pkgDiscountPct, setPkgDiscountPct] = useState(0);
  const [pkgCycle, setPkgCycle] = useState<SubscriptionBillingCycle>('monthly');
  const [pkgTrialDays, setPkgTrialDays] = useState(0);
  const [pkgPassingScore, setPkgPassingScore] = useState(75);
  const [pkgBadge, setPkgBadge] = useState('');
  const [pkgPopular, setPkgPopular] = useState(false);
  const [pkgFeaturesText, setPkgFeaturesText] = useState('');
  const [pkgContentItems, setPkgContentItems] = useState<SubscriptionContentItem[]>([]);
  const [isAiWriting, setIsAiWriting] = useState(false);

  // 3. Edit / Create Coupon State
  const [cpnCode, setCpnCode] = useState('');
  const [cpnDesc, setCpnDesc] = useState('');
  const [cpnType, setCpnType] = useState<'percentage' | 'fixed'>('percentage');
  const [cpnValue, setCpnValue] = useState(0);
  const [cpnMaxUses, setCpnMaxUses] = useState(0);

  // 4. Create / Edit Quiz Form State
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDesc, setQuizDesc] = useState('');
  const [quizPkgId, setQuizPkgId] = useState('');
  const [quizPassingScore, setQuizPassingScore] = useState(75);
  const [quizQuestions, setQuizQuestions] = useState<SubscriptionQuizQuestion[]>([]);

  // 5. Take Quiz Attempt State
  const [attemptContactId, setAttemptContactId] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  // 6. Subscriber Permissions State
  const [permContactId, setPermContactId] = useState('');
  const [permRole, setPermRole] = useState<SubscriberUserRole>('content_subscriber');
  const [canAccessLocked, setCanAccessLocked] = useState(true);
  const [canTakeQuizzes, setCanTakeQuizzes] = useState(true);
  const [canViewReceipts, setCanViewReceipts] = useState(true);

  useEffect(() => {
    if (modalMode === 'assign-package') {
      setAssignContactId(selectedContact?.id || contacts[0]?.id || '');
      setAssignPkgId(packages[0]?.id || '');
      setAssignCouponCode('');
      setAssignStatus('active');
      setAssignPaymentMethod('');
      setAssignNotes('');
    } else if (modalMode === 'edit-permissions') {
      const c = selectedContact || contacts[0];
      setPermContactId(c?.id || '');
      setPermRole(c?.subscriberRole || 'content_subscriber');
      setCanAccessLocked(c?.permissions?.canAccessLockedContent ?? true);
      setCanTakeQuizzes(c?.permissions?.canTakeQuizzes ?? true);
      setCanViewReceipts(c?.permissions?.canViewReceipts ?? true);
    } else if (modalMode === 'edit-package') {
      if (editingPackage) {
        setPkgName(editingPackage.name);
        setPkgDesc(editingPackage.description);
        setPkgPrice(editingPackage.price);
        setPkgOrigPrice(editingPackage.originalPrice || editingPackage.price);
        setPkgDiscountPct(editingPackage.discountPercent || 0);
        setPkgCycle(editingPackage.billingCycle);
        setPkgTrialDays(editingPackage.trialDays || 0);
        setPkgPassingScore(editingPackage.passingScorePercent || 75);
        setPkgBadge(editingPackage.badgeText || '');
        setPkgPopular(Boolean(editingPackage.isPopular));
        setPkgFeaturesText((editingPackage.features || []).join('\n'));
        setPkgContentItems(editingPackage.contentItems || []);
      } else {
        setPkgName('');
        setPkgDesc('');
        setPkgPrice(0);
        setPkgOrigPrice(0);
        setPkgDiscountPct(0);
        setPkgCycle('monthly');
        setPkgTrialDays(0);
        setPkgPassingScore(75);
        setPkgBadge('');
        setPkgPopular(false);
        setPkgFeaturesText('');
        setPkgContentItems([]);
      }
    } else if (modalMode === 'edit-coupon') {
      if (editingCoupon) {
        setCpnCode(editingCoupon.code);
        setCpnDesc(editingCoupon.description);
        setCpnType(editingCoupon.discountType);
        setCpnValue(editingCoupon.discountValue);
        setCpnMaxUses(editingCoupon.maxUses || 0);
      } else {
        setCpnCode('');
        setCpnDesc('');
        setCpnType('percentage');
        setCpnValue(0);
        setCpnMaxUses(0);
      }
    } else if (modalMode === 'create-quiz') {
      if (editingQuiz) {
        setQuizTitle(editingQuiz.title);
        setQuizDesc(editingQuiz.description);
        setQuizPkgId(editingQuiz.packageId || packages[0]?.id || '');
        setQuizPassingScore(editingQuiz.passingScore);
        setQuizQuestions(editingQuiz.questions);
      } else {
        setQuizTitle('');
        setQuizDesc('');
        setQuizPkgId(packages[0]?.id || '');
        setQuizPassingScore(75);
        setQuizQuestions([]);
      }
    } else if (modalMode === 'take-quiz') {
      setAttemptContactId(selectedContact?.id || contacts[0]?.id || '');
      setSelectedAnswers({});
    }
  }, [modalMode, selectedContact, editingPackage, editingCoupon, editingQuiz, contacts, packages]);

  if (modalMode === 'none') return null;

  const closeModal = () => setModalMode('none');

  const handleAiGenerateCopy = async () => {
    if (!pkgName.trim()) return;
    setIsAiWriting(true);
    try {
      const res = await generateAiCopyForPackage({
        packageName: pkgName,
        price: pkgPrice,
        billingCycle: pkgCycle,
      });
      setPkgDesc(res.description);
      if (res.features.length > 0) {
        setPkgFeaturesText(res.features.join('\n'));
      }
    } finally {
      setIsAiWriting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 w-screen h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-y-auto font-sans"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Top Fullscreen Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              {modalMode === 'assign-package' && <UserPlus className="w-5 h-5" />}
              {modalMode === 'edit-package' && <Package className="w-5 h-5" />}
              {modalMode === 'edit-coupon' && <Tag className="w-5 h-5" />}
              {(modalMode === 'create-quiz' || modalMode === 'take-quiz') && (
                <FileCheck2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-black">
                {modalMode === 'assign-package' && 'שידוך חבילת מנוי לאיש קשר ב-CRM'}
                {modalMode === 'edit-package' &&
                  (editingPackage ? 'עריכת חבילת מנוי ותוכן' : 'יצירת חבילת מנוי חדשה')}
                {modalMode === 'edit-coupon' && 'הגדרת קופון הנחה למנויים'}
                {modalMode === 'create-quiz' &&
                  (editingQuiz ? 'עריכת טופס מבחן' : 'יצירת טופס מבחן והסמכה')}
                {modalMode === 'take-quiz' && `הפעלת מבחן: ${activeQuizForAttempt?.title || ''}`}
              </h2>
              <p className="text-xs text-slate-500">
                כל הנתונים נשמרים ישירות תחת מונופול ה-CRM בסקופ הטננט של הסאב-דומיין
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer"
            aria-label="סגור חלון"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL 1: ASSIGN PACKAGE TO CONTACT */}
        {modalMode === 'assign-package' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  בחירת איש קשר מקולקציית ה-CRM
                </label>
                <select
                  value={assignContactId}
                  onChange={(e) => setAssignContactId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold outline-none"
                >
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.phone} {c.email ? `(${c.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  בחירת חבילת תוכן לשידוך
                </label>
                <select
                  value={assignPkgId}
                  onChange={(e) => setAssignPkgId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold outline-none"
                >
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₪{p.price} (
                      {p.billingCycle === 'monthly'
                        ? 'חודשי'
                        : p.billingCycle === 'annual'
                        ? 'שנתי'
                        : 'חד פעמי'}
                      )
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  קוד קופון / הנחה (אופציונלי)
                </label>
                <input
                  type="text"
                  value={assignCouponCode}
                  onChange={(e) => setAssignCouponCode(e.target.value)}
                  placeholder="לדוגמה: WELCOME20 או VIP50"
                  dir="ltr"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  סטטוס המנוי
                </label>
                <select
                  value={assignStatus}
                  onChange={(e) => setAssignStatus(e.target.value as ContentSubscriptionStatus)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold outline-none"
                >
                  <option value="active">פעיל (גישה מידית לתוכן)</option>
                  <option value="trial">תקופת ניסיון</option>
                  <option value="past_due">ממתין להשלמת תשלום</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  אמצעי תשלום מתועד
                </label>
                <input
                  type="text"
                  value={assignPaymentMethod}
                  onChange={(e) => setAssignPaymentMethod(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  הערות לכרטיס איש הקשר
                </label>
                <input
                  type="text"
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="הערה פנימית על המנוי..."
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold"
              >
                ביטול
              </button>
              <button
                type="button"
                disabled={isBusy || !assignContactId || !assignPkgId}
                onClick={async () => {
                  await assignPackageToContact({
                    contactId: assignContactId,
                    packageId: assignPkgId,
                    discountCode: assignCouponCode.trim() || undefined,
                    status: assignStatus,
                    paymentMethod: assignPaymentMethod,
                    notes: assignNotes.trim() || undefined,
                  });
                  closeModal();
                }}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>שמור ושדך לכרטיס איש הקשר</span>
              </button>
            </div>
          </div>
        )}

        {/* MODAL 2: CREATE / EDIT PACKAGE */}
        {modalMode === 'edit-package' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                    שם חבילת המנוי
                  </label>
                  <input
                    type="text"
                    value={pkgName}
                    onChange={(e) => setPkgName(e.target.value)}
                    placeholder="למשל: מסלול VIP - גישה מלאה לתוכן"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold outline-none"
                  />
                </div>
                <button
                  type="button"
                  disabled={isAiWriting || !pkgName.trim()}
                  onClick={handleAiGenerateCopy}
                  className="h-11 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isAiWriting ? 'מייצר ניסוח...' : 'נסח תיאור ויתרונות עם KosAi'}</span>
                </button>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  תיאור החבילה
                </label>
                <textarea
                  rows={2}
                  value={pkgDesc}
                  onChange={(e) => setPkgDesc(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  מחיר מנוי לאחר הנחה (₪)
                </label>
                <input
                  type="number"
                  value={pkgPrice}
                  onChange={(e) => setPkgPrice(Number(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  מחיר מקורי לפני הנחה (₪)
                </label>
                <input
                  type="number"
                  value={pkgOrigPrice}
                  onChange={(e) => setPkgOrigPrice(Number(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  מחזור חיוב
                </label>
                <select
                  value={pkgCycle}
                  onChange={(e) => setPkgCycle(e.target.value as SubscriptionBillingCycle)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold outline-none"
                >
                  <option value="monthly">חודשי מתחדש</option>
                  <option value="annual">שנתי</option>
                  <option value="one_time">חד פעמי</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  ציון מעבר מינימלי במבחן החבילה (%)
                </label>
                <input
                  type="number"
                  value={pkgPassingScore}
                  onChange={(e) => setPkgPassingScore(Number(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  יתרונות החבילה (כל יתרון בשורה נפרדת)
                </label>
                <textarea
                  rows={3}
                  value={pkgFeaturesText}
                  onChange={(e) => setPkgFeaturesText(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold"
              >
                ביטול
              </button>
              <button
                type="button"
                disabled={isBusy || !pkgName.trim()}
                onClick={async () => {
                  const computedDiscount =
                    pkgOrigPrice > pkgPrice
                      ? Math.round(((pkgOrigPrice - pkgPrice) / pkgOrigPrice) * 100)
                      : pkgDiscountPct;

                  await savePackage({
                    id: editingPackage?.id,
                    name: pkgName.trim(),
                    description: pkgDesc.trim(),
                    price: pkgPrice,
                    originalPrice: pkgOrigPrice,
                    discountPercent: computedDiscount,
                    billingCycle: pkgCycle,
                    trialDays: pkgTrialDays,
                    passingScorePercent: pkgPassingScore,
                    badgeText: pkgBadge.trim() || undefined,
                    isPopular: pkgPopular,
                    features: pkgFeaturesText
                      .split('\n')
                      .map((s) => s.trim())
                      .filter(Boolean),
                    contentItems: pkgContentItems,
                  });
                  closeModal();
                }}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>שמור חבילת מנוי</span>
              </button>
            </div>
          </div>
        )}

        {/* MODAL 3: CREATE / EDIT COUPON */}
        {modalMode === 'edit-coupon' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  קוד קופון (באנגלית/מספרים)
                </label>
                <input
                  type="text"
                  value={cpnCode}
                  onChange={(e) => setCpnCode(e.target.value.toUpperCase())}
                  placeholder="VIP2026"
                  dir="ltr"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  סוג הנחה
                </label>
                <select
                  value={cpnType}
                  onChange={(e) => setCpnType(e.target.value as 'percentage' | 'fixed')}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold outline-none"
                >
                  <option value="percentage">אחוז הנחה (%)</option>
                  <option value="fixed">סכום קבוע בשקלים (₪)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  גובה ההנחה ({cpnType === 'percentage' ? '%' : '₪'})
                </label>
                <input
                  type="number"
                  value={cpnValue}
                  onChange={(e) => setCpnValue(Number(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  מכסת שימושים מקסימלית
                </label>
                <input
                  type="number"
                  value={cpnMaxUses}
                  onChange={(e) => setCpnMaxUses(Number(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  תיאור ההטבה
                </label>
                <input
                  type="text"
                  value={cpnDesc}
                  onChange={(e) => setCpnDesc(e.target.value)}
                  placeholder="הנחה מיוחדת לנרשמים החודש..."
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold"
              >
                ביטול
              </button>
              <button
                type="button"
                disabled={isBusy || !cpnCode.trim()}
                onClick={async () => {
                  await saveCoupon({
                    id: editingCoupon?.id,
                    code: cpnCode.trim(),
                    description: cpnDesc.trim() || `קופון הנחה ${cpnCode}`,
                    discountType: cpnType,
                    discountValue: cpnValue,
                    maxUses: cpnMaxUses,
                  });
                  closeModal();
                }}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>שמור קופון</span>
              </button>
            </div>
          </div>
        )}

        {/* MODAL 4: CREATE / EDIT QUIZ FORM */}
        {modalMode === 'create-quiz' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  כותרת טופס המבחן
                </label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="למשל: מבחן הסמכה ליחידת הפרימיום"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  ציון מעבר נדרש (%)
                </label>
                <input
                  type="number"
                  value={quizPassingScore}
                  onChange={(e) => setQuizPassingScore(Number(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  תיאור והנחיות לנבחן
                </label>
                <input
                  type="text"
                  value={quizDesc}
                  onChange={(e) => setQuizDesc(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  שיוך לחבילת מנוי
                </label>
                <select
                  value={quizPkgId}
                  onChange={(e) => setQuizPkgId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold outline-none"
                >
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Questions Editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black">שאלות המבחן ({quizQuestions.length})</h3>
                <button
                  type="button"
                  onClick={() =>
                    setQuizQuestions((prev) => [
                      ...prev,
                      {
                        id: `q_${Date.now()}`,
                        questionText: '',
                        options: ['', '', '', ''],
                        correctOptionIndex: 0,
                        points: 25,
                      },
                    ])
                  }
                  className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>הוסף שאלה</span>
                </button>
              </div>

              {quizQuestions.map((q, qIdx) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={q.questionText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setQuizQuestions((prev) =>
                          prev.map((item, i) => (i === qIdx ? { ...item, questionText: val } : item))
                        );
                      }}
                      className="flex-1 h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setQuizQuestions((prev) => prev.filter((_, i) => i !== qIdx))
                      }
                      className="p-2 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct_${q.id}`}
                          checked={q.correctOptionIndex === oIdx}
                          onChange={() =>
                            setQuizQuestions((prev) =>
                              prev.map((item, i) =>
                                i === qIdx ? { ...item, correctOptionIndex: oIdx } : item
                              )
                            )
                          }
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuizQuestions((prev) =>
                              prev.map((item, i) => {
                                if (i !== qIdx) return item;
                                const nextOpts = [...item.options];
                                nextOpts[oIdx] = val;
                                return { ...item, options: nextOpts };
                              })
                            );
                          }}
                          className="flex-1 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold"
              >
                ביטול
              </button>
              <button
                type="button"
                disabled={isBusy || !quizTitle.trim()}
                onClick={async () => {
                  const matchedPkg = packages.find((p) => p.id === quizPkgId);
                  await saveQuiz({
                    id: editingQuiz?.id,
                    title: quizTitle.trim(),
                    description: quizDesc.trim(),
                    packageId: quizPkgId || undefined,
                    packageName: matchedPkg?.name,
                    passingScore: quizPassingScore,
                    questions: quizQuestions,
                  });
                  closeModal();
                }}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>שמור וסנכרן עם KSF</span>
              </button>
            </div>
          </div>
        )}

        {/* MODAL 5: TAKE / GRADE QUIZ FOR CONTACT */}
        {modalMode === 'take-quiz' && activeQuizForAttempt && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                בחירת איש קשר נבחן (הציון יישמר בכרטיס איש הקשר ב-CRM)
              </label>
              <select
                value={attemptContactId}
                onChange={(e) => setAttemptContactId(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold outline-none"
              >
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              {activeQuizForAttempt.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 space-y-3"
                >
                  <div className="text-sm font-black">
                    {idx + 1}. {q.questionText}
                  </div>
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => (
                      <label
                        key={oIdx}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                          selectedAnswers[q.id] === oIdx
                            ? 'border-purple-600 bg-purple-500/10 text-purple-700 dark:text-purple-300'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`attempt_${q.id}`}
                          checked={selectedAnswers[q.id] === oIdx}
                          onChange={() =>
                            setSelectedAnswers((prev) => ({ ...prev, [q.id]: oIdx }))
                          }
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold"
              >
                ביטול
              </button>
              <button
                type="button"
                disabled={isBusy || !attemptContactId}
                onClick={async () => {
                  await submitQuizAttempt({
                    contactId: attemptContactId,
                    quiz: activeQuizForAttempt,
                    selectedAnswers,
                  });
                  closeModal();
                }}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>חשב ציון ושמור בכרטיס איש הקשר</span>
              </button>
            </div>
          </div>
        )}

        {/* 6. EDIT SUBSCRIBER PERMISSIONS MODAL */}
        {modalMode === 'edit-permissions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    קביעת הרשאות מנוי תוכן
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    הגדרת זכויות גישה, תפקיד משתמש ואכיפת חסימות לעריכת עמודים וכלי AI
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  איש קשר / מנוי:
                </label>
                <select
                  value={permContactId}
                  onChange={(e) => setPermContactId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold outline-none"
                >
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone} - {c.email || 'ללא אימייל'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  רמת מנוי (Subscriber Role):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPermRole('content_subscriber')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                      permRole === 'content_subscriber'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="text-sm font-bold">מנוי רגיל</span>
                    <span className="text-[10px] text-slate-400">תוכן חבילה בסיסית</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPermRole('vip_subscriber')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                      permRole === 'vip_subscriber'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="text-sm font-bold">מנוי VIP</span>
                    <span className="text-[10px] text-slate-400">גישה מורחבת לתכנים</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPermRole('trial_subscriber')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                      permRole === 'trial_subscriber'
                        ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="text-sm font-bold">מנוי ניסיון</span>
                    <span className="text-[10px] text-slate-400">תקופת התנסות מוגבלת</span>
                  </button>
                </div>
              </div>

              {/* Granted Permissions Toggles */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  הרשאות גישה מופעלות:
                </span>

                <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>צפייה בתוכן נעול של החבילה</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={canAccessLocked}
                    onChange={(e) => setCanAccessLocked(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>השתתפות במבחנים ושאלונים</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={canTakeQuizzes}
                    onChange={(e) => setCanTakeQuizzes(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>צפייה בפירוט תשלומים והורדת קבלות</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={canViewReceipts}
                    onChange={(e) => setCanViewReceipts(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </label>
              </div>

              {/* Strict Security Constraints (Exclusions) */}
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2 text-xs">
                <span className="font-bold text-rose-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  מגבלות אבטחה מובנות למנוי תוכן (אינן ניתנות לשינוי):
                </span>
                <div className="space-y-1 text-slate-600 dark:text-slate-300 pr-5">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span><strong>חסימת עריכת עמודים:</strong> אין למנוי תוכן גישה לעריכת דפי נחיתה או בלוקים.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span><strong>חסימת יצירת תוכן ב-AI:</strong> אין למנוי תוכן גישה לכלי יצירה או סוכני AI.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span><strong>החרגה מלוח הניהול הראשי:</strong> מנוי תוכן מנותב אך ורק לפורטל המנוי האישי שלו.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold"
              >
                ביטול
              </button>
              <button
                type="button"
                disabled={isBusy || !permContactId}
                onClick={async () => {
                  await updateSubscriberPermissions(
                    permContactId,
                    {
                      canAccessLockedContent: canAccessLocked,
                      canTakeQuizzes: canTakeQuizzes,
                      canViewReceipts: canViewReceipts,
                      canEditPages: false,
                      canUseAiGenerators: false,
                      canAccessAdminPanel: false,
                    },
                    permRole
                  );
                  closeModal();
                }}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>שמור הרשאות מנוי</span>
              </button>
            </div>
          </div>
        )}

        {/* 7. SUBSCRIBER PORTAL PREVIEW MODAL */}
        {modalMode === 'subscriber-portal' && (
          <div className="w-full">
            <SubscriberPortalView
              contact={selectedContact || contacts[0]}
              packages={packages}
              tenantSubdomain={tenantId}
              isModal
              onClose={closeModal}
            />
          </div>
        )}
      </div>
    </div>
  );
};
