import React from 'react';
import {
  Users,
  CreditCard,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Award,
  Tag,
  ExternalLink,
  Trash2,
  TrendingUp,
  FileCheck2,
  UserPlus,
  ShieldCheck,
  LayoutDashboard,
} from 'lucide-react';
import { useKosSubscribed } from '../hooks/useKosSubscribed';
import { ContentSubscriptionStatus } from '../types';

export const SubscribersTrackingTab: React.FC = () => {
  const {
    filteredContacts,
    packages,
    analytics,
    filter,
    setFilter,
    setSelectedContact,
    setModalMode,
    updateSubscriptionStatus,
    removeSubscription,
    processLivePayment,
    quizzes,
    setActiveQuizForAttempt,
  } = useKosSubscribed();

  const renderStatusBadge = (status: ContentSubscriptionStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> פעיל
          </span>
        );
      case 'trial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400">
            <Clock className="w-3.5 h-3.5" /> ניסיון
          </span>
        );
      case 'past_due':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-3.5 h-3.5" /> בפיגור תשלום
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/15 text-slate-600 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5" /> מושהה
          </span>
        );
      case 'canceled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <XCircle className="w-3.5 h-3.5" /> מבוטל
          </span>
        );
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">מנויים פעילים</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {analytics.activeSubscribers}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              מתוך {analytics.totalSubscribers} מנויים רשומים ב-CRM
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">הכנסה חודשית קבועה (MRR)</p>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              ₪{analytics.mrr.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              קצב שנתי (ARR): ₪{analytics.arr.toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">ממתינים לגבייה / בפיגור</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {analytics.pastDueSubscribers}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              סה״כ נגבה: ₪{analytics.totalCollectedRevenue.toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">אחוז מעבר מבחני תוכן</p>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
              {analytics.quizPassRate}%
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              ממוצע ללקוח: ₪{analytics.averageRevenuePerUser.toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filter.search}
            onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
            placeholder="חיפוש איש קשר לפי שם, טלפון, אימייל או שם חבילה..."
            className="w-full h-10 pr-10 pl-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filter.status}
            onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value as any }))}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold outline-none"
          >
            <option value="all">כל אנשי הקשר והמנויים</option>
            <option value="active">מנויים פעילים בלבד</option>
            <option value="trial">בתקופת ניסיון</option>
            <option value="past_due">בפיגור תשלום</option>
            <option value="paused">מושהים</option>
            <option value="canceled">מבוטלים</option>
            <option value="unsubscribed">ללא מנוי פעיל (פוטנציאל שידוך)</option>
          </select>

          <select
            value={filter.packageId}
            onChange={(e) => setFilter((prev) => ({ ...prev, packageId: e.target.value }))}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold outline-none"
          >
            <option value="all">כל החבילות</option>
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (₪{p.price})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setSelectedContact(filteredContacts[0] || null);
              setModalMode('assign-package');
            }}
            className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>שדך חבילה לאיש קשר</span>
          </button>
        </div>
      </div>

      {/* Contacts & Subscriptions Master Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              אנשי קשר ומעקב מנויים (מסונכרן בזמן אמת מול מונופול ה-CRM)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              כל שינוי או שידוך חבילה מתעדכן ישירות בכרטיס איש הקשר בקולקציית ה-CRM של הסאב-דומיין
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
            {filteredContacts.length} אנשי קשר
          </span>
        </div>

        <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
          {filteredContacts.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              לא נמצאו אנשי קשר התואמים לסינון הנוכחי.
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const subs = contact.contentSubscriptions || [];
              const contactQuizzes = contact.quizResults || [];

              return (
                <div
                  key={contact.id}
                  className="p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                >
                  {/* Contact Info */}
                  <div className="space-y-1 min-w-[230px]">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-black text-xs flex items-center justify-center shrink-0">
                        {contact.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900 dark:text-white">
                          {contact.name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {contact.phone} {contact.email ? `• ${contact.email}` : ''}
                        </div>
                      </div>
                    </div>
                    {contact.company && (
                      <div className="text-[11px] text-slate-500 pr-11">{contact.company}</div>
                    )}
                  </div>

                  {/* Active Subscriptions for Contact */}
                  <div className="flex-1 w-full space-y-2">
                    {subs.length === 0 ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-500">
                        <span>אין חבילת תוכן משודכת לאיש קשר זה</span>
                      </div>
                    ) : (
                      subs.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-black text-slate-900 dark:text-white">
                                {sub.packageName}
                              </span>
                              {renderStatusBadge(sub.status)}
                              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                ₪{sub.finalAmount} (
                                {sub.billingCycle === 'monthly'
                                  ? 'חודשי'
                                  : sub.billingCycle === 'annual'
                                  ? 'שנתי'
                                  : 'חד פעמי'}
                                )
                              </span>
                              {sub.discountCode && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold">
                                  <Tag className="w-3 h-3" /> {sub.discountCode} (-₪{sub.discountAmount})
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-[11px] text-slate-500 flex-wrap">
                              <span>התחלה: {sub.startDate}</span>
                              {sub.nextBillingDate && <span>חיוב הבא: {sub.nextBillingDate}</span>}
                              {sub.paymentMethod && <span>אמצעי: {sub.paymentMethod}</span>}
                              {sub.lastTransactionId && (
                                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                                  אסמכתא: {sub.lastTransactionId}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {sub.status !== 'active' && (
                              <button
                                type="button"
                                onClick={() =>
                                  processLivePayment({
                                    contactId: contact.id,
                                    contactName: contact.name,
                                    contactPhone: contact.phone,
                                    contactEmail: contact.email,
                                    subscriptionId: sub.id,
                                    packageId: sub.packageId,
                                    packageName: sub.packageName,
                                    amount: sub.finalAmount,
                                  })
                                }
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                              >
                                <CreditCard className="w-3 h-3" />
                                <span>גבה תשלום כעת</span>
                              </button>
                            )}

                            <select
                              value={sub.status}
                              onChange={(e) =>
                                updateSubscriptionStatus(contact.id, sub.id, {
                                  status: e.target.value as ContentSubscriptionStatus,
                                })
                              }
                              className="h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold outline-none"
                            >
                              <option value="active">פעיל</option>
                              <option value="trial">ניסיון</option>
                              <option value="past_due">בפיגור</option>
                              <option value="paused">מושהה</option>
                              <option value="canceled">מבוטל</option>
                            </select>

                            {sub.paymentPageUrl && (
                              <a
                                href={sub.paymentPageUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800"
                                title="פתח עמוד תשלום"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() => removeSubscription(contact.id, sub.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition cursor-pointer"
                              title="הסר מנוי"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}

                    {/* Quiz Scores Strip */}
                    {contactQuizzes.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        {contactQuizzes.map((qr) => (
                          <span
                            key={qr.id}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                              qr.passed
                                ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300'
                                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            <Award className="w-3 h-3" />
                            {qr.quizTitle}: {qr.score}% ({qr.passed ? 'עבר' : 'נכשל'})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Actions for Contact */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end lg:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedContact(contact);
                        setModalMode('edit-permissions');
                      }}
                      className="px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 hover:bg-purple-100 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      title="קבע הרשאות משתמש ומנוי תוכן (חסימת עריכה ו-AI)"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                      <span>הרשאות</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedContact(contact);
                        setModalMode('subscriber-portal');
                      }}
                      className="px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      title="צפה בלוח הבקרה האישי של המנוי (תוכן, תוכנית, קבלות)"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>לוח מנוי</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedContact(contact);
                        setModalMode('assign-package');
                      }}
                      className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>שדך חבילה</span>
                    </button>

                    {quizzes.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedContact(contact);
                          setActiveQuizForAttempt(quizzes[0]);
                          setModalMode('take-quiz');
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <FileCheck2 className="w-3.5 h-3.5 text-purple-500" />
                        <span>מבחן</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
