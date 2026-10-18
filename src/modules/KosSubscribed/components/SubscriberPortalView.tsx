import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Package,
  CreditCard,
  FileText,
  PlayCircle,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  LogOut,
  User,
  BookOpen,
  Receipt,
  FileCheck2,
  ChevronLeft,
  X,
  AlertCircle,
} from 'lucide-react';
import {
  CrmSubscriberContactRecord,
  ContactContentSubscription,
  SubscriptionPackageItem,
  SubscriptionContentItem,
} from '../types';

export interface SubscriberPortalViewProps {
  contact: CrmSubscriberContactRecord;
  packages: SubscriptionPackageItem[];
  tenantSubdomain: string;
  onLogout?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const SubscriberPortalView: React.FC<SubscriberPortalViewProps> = ({
  contact,
  packages,
  tenantSubdomain,
  onLogout,
  onClose,
  isModal = false,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'plan' | 'payments' | 'quizzes'>('content');
  const [activeContentItem, setActiveContentItem] = useState<SubscriptionContentItem | null>(null);

  // Active subscription (primary)
  const activeSub: ContactContentSubscription | undefined = useMemo(() => {
    const subs = contact.contentSubscriptions || [];
    return subs.find((s) => s.status === 'active') || subs[0];
  }, [contact.contentSubscriptions]);

  // Matching package details
  const currentPackage: SubscriptionPackageItem | undefined = useMemo(() => {
    if (!activeSub) return packages[0];
    return packages.find((p) => p.id === activeSub.packageId) || packages[0];
  }, [activeSub, packages]);

  // Unlocked content items for this subscriber
  const contentItems: SubscriptionContentItem[] = useMemo(() => {
    if (currentPackage && Array.isArray(currentPackage.contentItems)) {
      return currentPackage.contentItems;
    }
    return [
      {
        id: 'cnt-1',
        title: 'מדריך פתיחה בלעדי למנויים',
        contentType: 'article',
        previewText: 'חומרי הדרכה והיכרות עם השירותים והתוכן הבלעדי.',
        lockedBodyText: 'ברוכים הבאים לפורטל המנויים הבלעדי! כאן תוכלו לצפות בכל התכנים, השיעורים וההנחיות שנפתחו עבור החבילה שלכם.',
      },
      {
        id: 'cnt-2',
        title: 'סדנת וידאו מלאה למנויים',
        contentType: 'video',
        previewText: 'הקלטת סדנת העומק המלאה באיכות HD.',
        videoEmbedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      },
    ];
  }, [currentPackage]);

  // Payments / Receipts list
  const paymentsList = useMemo(() => {
    const subs = contact.contentSubscriptions || [];
    return subs.filter((s) => s.lastTransactionId || s.finalAmount > 0).map((s, idx) => ({
      id: s.lastTransactionId || `TXN-${idx + 1001}`,
      subscriptionName: s.packageName,
      amount: s.finalAmount,
      date: s.startDate || new Date().toLocaleDateString('he-IL'),
      paymentMethod: s.paymentMethod || 'כרטיס אשראי',
      receiptUrl: s.receiptUrl || '#',
      status: s.status,
    }));
  }, [contact.contentSubscriptions]);

  const quizzes = contact.quizResults || [];

  return (
    <div
      className={`font-sans ${
        isModal
          ? 'bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col'
          : 'min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col'
      }`}
      dir="rtl"
    >
      {/* Top Banner - Subscriber Welcome & Isolation Badge */}
      <div className="p-6 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 border-b border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-600/30 shrink-0">
            {contact.name ? contact.name.slice(0, 2) : <User className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                שלום, {contact.name || 'מנוי יקר'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold">
                ✓ מנוי תוכן פעיל
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-mono">
              <span>{contact.email || contact.phone}</span>
              <span>•</span>
              <span className="text-indigo-400">{tenantSubdomain}.kosun.pro</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300 flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>פורטל מנוי אישי ומבודד</span>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="התנתק מהחשבון"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">התנתק</span>
            </button>
          )}

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="סגור"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Exclusivity Notice for Subscriber */}
      <div className="bg-indigo-950/40 border-b border-indigo-900/40 px-6 py-2.5 flex items-center justify-between text-xs text-indigo-300">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            גישה מורשית בלעדית לתכני החבילה <strong>{activeSub?.packageName || currentPackage?.name}</strong>.
            סביבה זו מבודדת מלוח הבקרה הראשי ומיועדת לצפייה ולמידה בלבד.
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex bg-slate-900/90 border-b border-slate-800 px-6 pt-3 gap-2 overflow-x-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'content'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>התוכן הנעול שלי ({contentItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('plan')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'plan'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>התוכנית והחבילה שלי</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'payments'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>תשלומים וקבלות ({paymentsList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quizzes')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'quizzes'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>מבחנים והישגים ({quizzes.length})</span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* TAB 1: MY UNLOCKED CONTENT */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white">תכנים בלעדיים פתוחים עבורך</h2>
                <p className="text-xs text-slate-400">
                  כל הסרטונים, המאמרים והמסמכים הכלולים בחבילת המנוי שלך
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contentItems.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 text-[10px] font-bold font-mono">
                        {item.contentType === 'video' ? '🎬 שיעור וידאו' : '📄 מאמר / קובץ'}
                      </span>
                      <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> פתוח לצפייה
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    {item.previewText && (
                      <p className="text-xs text-slate-400 line-clamp-2">{item.previewText}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveContentItem(item)}
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>פתח וצפה בתוכן המלא</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: MY PLAN & PACKAGE DETAILS */}
        {activeTab === 'plan' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs text-indigo-400 font-bold">חבילת תוכן נוכחית</span>
                  <h2 className="text-2xl font-black text-white mt-0.5">
                    {activeSub?.packageName || currentPackage?.name}
                  </h2>
                </div>
                <div className="text-left font-mono">
                  <div className="text-3xl font-black text-emerald-400">
                    ₪{activeSub?.finalAmount ?? currentPackage?.price ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    מחזור חיוב: {activeSub?.billingCycle === 'annual' ? 'שנתי' : 'חודשי'}
                  </div>
                </div>
              </div>

              {/* Package Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">סטטוס מנוי:</span>
                  <span className="font-bold text-emerald-400 mt-1 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> פעיל ותקין
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">תאריך התחלה:</span>
                  <span className="font-bold text-white mt-1 block">
                    {activeSub?.startDate || 'היום'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">מועד חיוב הבא:</span>
                  <span className="font-bold text-indigo-300 mt-1 block">
                    {activeSub?.nextBillingDate || 'בעוד 30 יום'}
                  </span>
                </div>
              </div>

              {/* Package Features List */}
              {currentPackage?.features && currentPackage.features.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-300 block">זכויות והטבות כלולות בחבילה:</span>
                  <div className="space-y-1.5">
                    {currentPackage.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENTS & RECEIPTS */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-black text-white">היסטוריית תשלומים וקבלות</h2>
              <p className="text-xs text-slate-400">
                מעקב שקוף של כל העסקאות, החשבוניות והקבלות שהופקו עבורך
              </p>
            </div>

            {paymentsList.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-xs bg-slate-900 rounded-2xl border border-slate-800">
                לא נמצאו תשלומים קודמים מתועדים עבור מנוי זה.
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden divide-y divide-slate-800">
                {paymentsList.map((p) => (
                  <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{p.subscriptionName}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          אסמכתא: {p.id} • תאריך: {p.date}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className="text-left font-mono">
                        <span className="text-base font-black text-emerald-400">₪{p.amount}</span>
                        <span className="block text-[10px] text-slate-400">{p.paymentMethod}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (p.receiptUrl && p.receiptUrl !== '#') {
                            window.open(p.receiptUrl, '_blank');
                          } else {
                            alert(`קבלה רשמית עבור עסקה ${p.id}\nסכום: ₪${p.amount}\nשולמה בהצלחה.`);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        title="צפה או הורד קבלה"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>קבלה</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: QUIZZES & ACHIEVEMENTS */}
        {activeTab === 'quizzes' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-black text-white">מבחני הסמכה ושאלונים</h2>
              <p className="text-xs text-slate-400">
                ציונים והישגים שהושגו במסגרת חבילת המנוי
              </p>
            </div>

            {quizzes.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-xs bg-slate-900 rounded-2xl border border-slate-800">
                טרם בוצעו שאלונים עבור מנוי זה.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quizzes.map((q) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">{q.quizTitle}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        q.passed ? 'bg-purple-500/20 text-purple-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {q.passed ? 'עבר בהצלחה ✓' : 'לא עבר'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center justify-between font-mono">
                      <span>ציון: {q.score}%</span>
                      <span>סף מעבר: {q.passingScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Content Viewer Modal */}
      {activeContentItem && (
        <div
          className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          dir="rtl"
          onClick={() => setActiveContentItem(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  {activeContentItem.contentType === 'video' ? '🎬' : '📄'}
                </span>
                <h3 className="text-base font-black text-white">{activeContentItem.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveContentItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeContentItem.contentType === 'video' && activeContentItem.videoEmbedUrl && (
              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 bg-black">
                <iframe
                  src={activeContentItem.videoEmbedUrl}
                  title={activeContentItem.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-4 rounded-2xl border border-slate-800 whitespace-pre-wrap">
              {activeContentItem.lockedBodyText || activeContentItem.previewText || 'תוכן בלעדי זה זמין כעת לצפייה מלאה עבור המנוי.'}
            </div>

            <button
              type="button"
              onClick={() => setActiveContentItem(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
            >
              סגור תצוגת תוכן
            </button>
          </div>
        </div>
      )}

      {/* Footer Disclaimer */}
      <div className="p-3 bg-slate-950 border-t border-slate-900 text-center text-[11px] text-slate-600">
        🔒 פורטל מנוי תוכן אישי ומאובטח • ללא גישה לעריכת אתר וללא גישה לכלי יצירה ב-AI • KOSUN26 Multi-Tenant
      </div>
    </div>
  );
};
