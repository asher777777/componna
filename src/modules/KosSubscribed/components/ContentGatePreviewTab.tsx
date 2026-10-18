import React, { useState, useMemo } from 'react';
import {
  Lock,
  Unlock,
  Award,
  CheckCircle2,
  BookOpen,
  Video,
  Download,
  FileText,
  CreditCard,
  FileCheck2,
} from 'lucide-react';
import { useKosSubscribed } from '../hooks/useKosSubscribed';
import { SubscriptionContentItem } from '../types';

export interface KosSubscribedContentGateProps {
  packageId?: string;
  contactId?: string;
}

export const ContentGatePreviewTab: React.FC<KosSubscribedContentGateProps> = ({
  packageId: initialPackageId,
  contactId: initialContactId,
}) => {
  const {
    contacts,
    packages,
    quizzes,
    setSelectedContact,
    setActiveQuizForAttempt,
    setModalMode,
  } = useKosSubscribed();

  const [selectedContactId, setSelectedContactId] = useState<string>(
    initialContactId || contacts[0]?.id || ''
  );
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    initialPackageId || packages[0]?.id || ''
  );

  const activeContact = useMemo(
    () => contacts.find((c) => c.id === selectedContactId) || contacts[0] || null,
    [contacts, selectedContactId]
  );

  const activePackage = useMemo(
    () => packages.find((p) => p.id === selectedPackageId) || packages[0] || null,
    [packages, selectedPackageId]
  );

  const contactSubscription = useMemo(() => {
    if (!activeContact || !activePackage) return null;
    return (
      (activeContact.contentSubscriptions || []).find(
        (s) =>
          s.packageId === activePackage.id &&
          (s.status === 'active' || s.status === 'trial')
      ) || null
    );
  }, [activeContact, activePackage]);

  const bestQuizScore = useMemo(() => {
    if (!activeContact || !activePackage) return 0;
    const scores = (activeContact.quizResults || [])
      .filter((q) => !q.packageId || q.packageId === activePackage.id)
      .map((q) => q.score);
    return Math.max(contactSubscription?.quizScore || 0, ...scores, 0);
  }, [activeContact, activePackage, contactSubscription]);

  const renderContentIcon = (type: SubscriptionContentItem['type']) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-indigo-500" />;
      case 'course':
        return <BookOpen className="w-4 h-4 text-emerald-500" />;
      case 'download':
        return <Download className="w-4 h-4 text-sky-500" />;
      default:
        return <FileText className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Simulator Controls */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-500" />
              בקרת חשיפת תוכן למנויים (Content Paywall & Quiz Gate)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              בחר איש קשר וחבילה כדי לבדוק בזמן אמת אילו תכנים פתוחים או נעולים עבורו בהתאם לסטטוס המנוי וציון המבחן ב-CRM
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">
                צפייה בתור איש קשר (מה-CRM):
              </label>
              <select
                value={activeContact?.id || ''}
                onChange={(e) => setSelectedContactId(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold outline-none"
              >
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.contentSubscriptions.length > 0 ? 'בעל מנוי' : 'ללא מנוי'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">
                בדיקת חבילת תוכן:
              </label>
              <select
                value={activePackage?.id || ''}
                onChange={(e) => setSelectedPackageId(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold outline-none"
              >
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₪{p.price})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Access Status Banner */}
        {activeContact && activePackage && (
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              contactSubscription
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {contactSubscription ? (
                <Unlock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              <div>
                <div className="text-xs font-black">
                  {contactSubscription
                    ? `לאיש הקשר "${activeContact.name}" יש מנוי פעיל לחבילה "${activePackage.name}"`
                    : `לאיש הקשר "${activeContact.name}" אין מנוי פעיל לחבילה "${activePackage.name}"`}
                </div>
                <div className="text-[11px] opacity-80">
                  ציון מבחן מיטבי עבור חבילה זו: {bestQuizScore > 0 ? `${bestQuizScore}%` : 'טרם נבחן'}
                </div>
              </div>
            </div>

            {!contactSubscription && (
              <button
                type="button"
                onClick={() => {
                  setSelectedContact(activeContact);
                  setModalMode('assign-package');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>שדך ופתח גישה לחבילה</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content Items Grid with Live Gating */}
      {activePackage && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(activePackage.contentItems || []).map((item) => {
            const hasSub = Boolean(contactSubscription);
            const meetsQuizReq =
              !item.requiredMinQuizScore || bestQuizScore >= item.requiredMinQuizScore;
            const isUnlocked = hasSub && meetsQuizReq;

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border shadow-sm space-y-4 transition ${
                  isUnlocked
                    ? 'bg-white dark:bg-slate-900 border-emerald-500/40'
                    : 'bg-white/80 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {renderContentIcon(item.type)}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                  </div>

                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> פתוח לצפייה
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 shrink-0">
                      <Lock className="w-3 h-3" /> תוכן נעול
                    </span>
                  )}
                </div>

                {/* Teaser / Preview */}
                {item.previewText && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-bold block text-[10px] text-slate-400 mb-1">
                      תקציר פתוח למבקרים:
                    </span>
                    {item.previewText}
                  </div>
                )}

                {/* Unlocked Body vs Paywall / Quiz Gate */}
                {isUnlocked ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-800 dark:text-slate-100 space-y-2">
                    <div className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                      <Unlock className="w-3.5 h-3.5" />
                      התוכן המלא למנויים:
                    </div>
                    <p className="leading-relaxed">{item.lockedBodyText}</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-100/90 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
                    <Lock className="w-6 h-6 text-slate-400 mx-auto" />
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {!hasSub
                        ? `תוכן זה שמור למנויי "${activePackage.name}" בלבד (₪${activePackage.price})`
                        : `תוכן זה דורש ציון מינימלי של ${item.requiredMinQuizScore}% במבחן ההסמכה (ציון נוכחי: ${bestQuizScore}%)`}
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      {!hasSub && activeContact && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedContact(activeContact);
                            setModalMode('assign-package');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>רכוש / שדך מנוי כעת</span>
                        </button>
                      )}

                      {hasSub && !meetsQuizReq && activeContact && quizzes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedContact(activeContact);
                            setActiveQuizForAttempt(quizzes[0]);
                            setModalMode('take-quiz');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>גש למבחן פתיחת התוכן</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {item.requiredMinQuizScore && (
                  <div className="flex items-center gap-1.5 text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                    <Award className="w-3.5 h-3.5" />
                    <span>תנאי מבחן משולב: ציון מעבר {item.requiredMinQuizScore}% ומעלה</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
