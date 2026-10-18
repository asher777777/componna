import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Package,
  Plus,
  Tag,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Award,
  ExternalLink,
  Trash2,
  Save,
  X,
} from 'lucide-react';
import { Contact } from '../../types';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import {
  CrmSubscriptionsContract,
  SubscriptionPackageItem,
  SubscriptionDiscountCoupon,
  ContactContentSubscription,
  ContactQuizSubmission,
  ContentSubscriptionStatus,
  KOSUN_CRM_FIELD_KEYS,
} from '../../../../core/contracts';

interface Props {
  formData: Contact;
  onChange: (field: keyof Contact, value: any) => void;
  isDarkMode?: boolean;
  onNotify?: (msg: string) => void;
}

export const ContactContentSubscriptionsTab: React.FC<Props> = ({
  formData,
  onChange,
  isDarkMode = false,
  onNotify,
}) => {
  const { getCapability } = useHostCapabilities();
  const subsContract = getCapability<CrmSubscriptionsContract>('crm-subscriptions');

  const [packages, setPackages] = useState<SubscriptionPackageItem[]>([]);
  const [coupons, setCoupons] = useState<SubscriptionDiscountCoupon[]>([]);
  const [isAddingSub, setIsAddingSub] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [subStatus, setSubStatus] = useState<ContentSubscriptionStatus>('active');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subscriptions: ContactContentSubscription[] =
    formData.kosun_crm_content_subscriptions || formData.content_subscriptions || [];
  const quizResults: ContactQuizSubmission[] =
    formData.kosun_crm_quiz_results || formData.quiz_results || [];

  const loadCatalog = useCallback(async () => {
    if (!subsContract) return;
    try {
      const [pkgs, cpns] = await Promise.all([
        subsContract.getPackages(),
        subsContract.getCoupons(),
      ]);
      setPackages(pkgs);
      setCoupons(cpns);
      if (pkgs.length > 0 && !selectedPackageId) {
        setSelectedPackageId(pkgs[0].id);
      }
    } catch (err) {
      console.warn('[ContactContentSubscriptionsTab] Catalog load notice:', err);
    }
  }, [subsContract, selectedPackageId]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const syncSubscriptionsToForm = (nextSubs: ContactContentSubscription[]) => {
    onChange('content_subscriptions', nextSubs);
    onChange(KOSUN_CRM_FIELD_KEYS.CONTENT_SUBSCRIPTIONS as keyof Contact, nextSubs);
  };

  const handleAssignPackage = async () => {
    if (!selectedPackageId) return;
    setIsSubmitting(true);
    try {
      const selectedPkg = packages.find((p) => p.id === selectedPackageId);
      if (!selectedPkg) return;

      if (subsContract && formData.id) {
        const created = await subsContract.assignPackageToContact({
          contactId: formData.id,
          packageId: selectedPackageId,
          discountCode: couponCode.trim() || undefined,
          status: subStatus,
          paymentMethod,
          notes: notes.trim() || undefined,
        });
        if (created) {
          const nextSubs = [created, ...subscriptions];
          syncSubscriptionsToForm(nextSubs);
          onNotify?.(`החבילה "${selectedPkg.name}" שודכה בהצלחה לאיש הקשר`);
          setIsAddingSub(false);
          setCouponCode('');
          setNotes('');
          return;
        }
      }

      // Direct form fallback if contact is not yet saved with ID
      let discountAmount = 0;
      const cleanCode = couponCode.trim().toUpperCase();
      if (cleanCode) {
        const foundCpn = coupons.find((c) => c.code.toUpperCase() === cleanCode && c.isActive);
        if (foundCpn) {
          discountAmount =
            foundCpn.discountType === 'percentage'
              ? Math.round((selectedPkg.price * foundCpn.discountValue) / 100)
              : foundCpn.discountValue;
        }
      }

      const finalAmount = Math.max(0, selectedPkg.price - discountAmount);
      const nowIso = new Date().toISOString();
      const newSub: ContactContentSubscription = {
        id: `sub_${Date.now()}`,
        contactId: formData.id || 'temp',
        contactName: formData.kosun_crm_name || formData.conta_name || 'איש קשר',
        contactEmail: formData.kosun_crm_email || formData.email,
        contactPhone: formData.kosun_crm_phone || formData.conta_phone,
        packageId: selectedPkg.id,
        packageName: selectedPkg.name,
        billingCycle: selectedPkg.billingCycle,
        basePrice: selectedPkg.price,
        discountCode: cleanCode || undefined,
        discountAmount,
        finalAmount,
        status: subStatus,
        startDate: nowIso.split('T')[0],
        paymentMethod,
        notes: notes.trim() || undefined,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      syncSubscriptionsToForm([newSub, ...subscriptions]);
      onNotify?.(`החבילה "${selectedPkg.name}" שודכה לאיש הקשר`);
      setIsAddingSub(false);
      setCouponCode('');
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (subId: string, nextStatus: ContentSubscriptionStatus) => {
    const nextSubs = subscriptions.map((s) =>
      s.id === subId ? { ...s, status: nextStatus, updatedAt: new Date().toISOString() } : s
    );
    syncSubscriptionsToForm(nextSubs);
    if (subsContract && formData.id) {
      await subsContract.updateContactSubscriptionStatus(formData.id, subId, { status: nextStatus });
    }
    onNotify?.('סטטוס המנוי עודכן');
  };

  const handleDeleteSub = async (subId: string) => {
    const nextSubs = subscriptions.filter((s) => s.id !== subId);
    syncSubscriptionsToForm(nextSubs);
    if (subsContract && formData.id) {
      await subsContract.removeContactSubscription(formData.id, subId);
    }
    onNotify?.('המנוי הוסר מכרטיס איש הקשר');
  };

  const renderStatusBadge = (status: ContentSubscriptionStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> פעיל
          </span>
        );
      case 'trial':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400">
            <Clock className="w-3 h-3" /> תקופת ניסיון
          </span>
        );
      case 'past_due':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-3 h-3" /> חוב / בפיגור
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-600 dark:text-slate-400">
            <Clock className="w-3 h-3" /> מושהה
          </span>
        );
      case 'canceled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <XCircle className="w-3 h-3" /> מבוטל
          </span>
        );
    }
  };

  return (
    <div className="space-y-3 text-xs" dir="rtl">
      {/* Header & Quick Assign Trigger */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
          חבילות תוכן משודכות ({subscriptions.length})
        </span>
        {!isAddingSub && (
          <button
            type="button"
            onClick={() => setIsAddingSub(true)}
            className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>שדך חבילת מנוי</span>
          </button>
        )}
      </div>

      {/* Add / Match Package Form */}
      {isAddingSub && (
        <div
          className={`p-3 rounded-2xl border space-y-2.5 ${
            isDarkMode ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-indigo-50/70 border-indigo-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" />
              שידוך חבילה חדשה לאיש הקשר
            </span>
            <button
              type="button"
              onClick={() => setIsAddingSub(false)}
              className="p-1 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 block mb-1">בחירת חבילה מהסאב-דומיין</label>
              <select
                value={selectedPackageId}
                onChange={(e) => setSelectedPackageId(e.target.value)}
                className={`w-full h-9 px-2.5 rounded-xl border text-xs font-bold outline-none ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ₪{p.price} ({p.billingCycle === 'monthly' ? 'חודשי' : p.billingCycle === 'annual' ? 'שנתי' : 'חד פעמי'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 block mb-1">קוד קופון / הנחה</label>
                <div className="relative">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="למשל WELCOME20"
                    dir="ltr"
                    className={`w-full h-8 px-2.5 rounded-xl border text-xs font-mono outline-none ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 block mb-1">סטטוס התחלתי</label>
                <select
                  value={subStatus}
                  onChange={(e) => setSubStatus(e.target.value as ContentSubscriptionStatus)}
                  className={`w-full h-8 px-2 rounded-xl border text-xs outline-none ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="active">פעיל</option>
                  <option value="trial">תקופת ניסיון</option>
                  <option value="past_due">ממתין לתשלום</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-500 block mb-1">אמצעי תשלום / הערה</label>
              <input
                type="text"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="אשראי / הוראת קבע / ביט"
                className={`w-full h-8 px-2.5 rounded-xl border text-xs outline-none ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingSub(false)}
                className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-[11px] font-bold"
              >
                ביטול
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleAssignPackage}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>שמור ושדך מנוי</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active & Historical Subscriptions List */}
      {subscriptions.length === 0 ? (
        <div
          className={`p-4 rounded-xl border border-dashed text-center text-zinc-500 ${
            isDarkMode ? 'border-zinc-800 bg-zinc-900/40' : 'border-slate-200 bg-slate-50/50'
          }`}
        >
          לא שודכו עדיין חבילות תוכן לאיש קשר זה.
        </div>
      ) : (
        <div className="space-y-2">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className={`p-3 rounded-xl border space-y-2 ${
                isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className={`font-bold text-xs ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {sub.packageName}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {renderStatusBadge(sub.status)}
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      ₪{sub.finalAmount} / {sub.billingCycle === 'monthly' ? 'חודש' : sub.billingCycle === 'annual' ? 'שנה' : 'חד פעמי'}
                    </span>
                    {sub.discountCode && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono">
                        <Tag className="w-2.5 h-2.5" /> {sub.discountCode} (-₪{sub.discountAmount})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <select
                    value={sub.status}
                    onChange={(e) => handleStatusChange(sub.id, e.target.value as ContentSubscriptionStatus)}
                    className={`h-7 px-1.5 rounded-lg border text-[10px] font-bold outline-none ${
                      isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <option value="active">פעיל</option>
                    <option value="trial">ניסיון</option>
                    <option value="past_due">בפיגור</option>
                    <option value="paused">מושהה</option>
                    <option value="canceled">מבוטל</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleDeleteSub(sub.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg transition cursor-pointer"
                    title="הסר מנוי"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-zinc-200/60 dark:border-zinc-800 text-[10px] text-zinc-500">
                <div>התחלה: {sub.startDate}</div>
                {sub.nextBillingDate && <div>חיוב הבא: {sub.nextBillingDate}</div>}
                {sub.paymentMethod && <div>תשלום: {sub.paymentMethod}</div>}
                {sub.quizScore !== undefined && (
                  <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                    <Award className="w-3 h-3" /> ציון מבחן: {sub.quizScore}%
                  </div>
                )}
              </div>

              {sub.paymentPageUrl && (
                <div className="pt-1">
                  <a
                    href={sub.paymentPageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    פתח עמוד תשלום לחבילה
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quiz / Test Results Summary for this Contact */}
      {quizResults.length > 0 && (
        <div className="pt-2 space-y-1.5">
          <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-500" />
            היסטוריית מבחנים וציונים ({quizResults.length})
          </span>
          {quizResults.map((qr) => (
            <div
              key={qr.id}
              className={`p-2 rounded-xl border flex items-center justify-between text-[11px] ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {qr.quizTitle}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  {qr.submittedAt.split('T')[0]}
                </div>
              </div>
              <div
                className={`px-2 py-0.5 rounded-lg font-mono font-bold text-xs ${
                  qr.passed
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                }`}
              >
                {qr.score}% ({qr.passed ? 'עבר' : 'לא עבר'})
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
