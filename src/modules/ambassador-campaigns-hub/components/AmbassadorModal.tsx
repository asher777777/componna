/**
 * AmbassadorModal: Modal for establishing a new community leader / ambassador
 * Auto-generates unique English slug, registers community, and provides instant WhatsApp share link.
 */

import React, { useState } from 'react';
import { X, Target, Sparkles, Share2, Copy, Check, User, Phone, Mail, FileText, ExternalLink } from 'lucide-react';
import { useCampaignModule } from '../context/CampaignModuleContext';
import { Ambassador } from '../types';

interface AmbassadorModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId?: string;
  onSuccess?: (ambassador: Ambassador) => void;
}

export const AmbassadorModal: React.FC<AmbassadorModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  onSuccess,
}) => {
  const { campaign, createAmbassador } = useCampaignModule();

  const [name, setName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [targetGoal, setTargetGoal] = useState<number | ''>(10000);
  const [message, setMessage] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdAmbassador, setCreatedAmbassador] = useState<Ambassador | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetGoal) {
      setError('אנא מלא את שם הקהילה ואת סכום היעד');
      return;
    }

    setLoading(true);
    setError('');

    const targetCampaignId = campaignId || campaign?.id || 'campaign-golden-2026';

    const res = await createAmbassador({
      campaignId: targetCampaignId,
      name,
      leaderName: leaderName.trim() || undefined,
      targetGoal: Number(targetGoal),
      message,
      customSlug: customSlug.trim() || undefined,
      phone,
      email,
    });

    setLoading(false);

    if (res.success && res.ambassador) {
      setCreatedAmbassador(res.ambassador);
      if (onSuccess) onSuccess(res.ambassador);
    } else {
      setError(res.error || 'שגיאה ביצירת שגריר');
    }
  };

  const getShareUrl = () => {
    if (!createdAmbassador) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kosun.io';
    return `${origin}/${createdAmbassador.slug}`;
  };

  const handleCopyLink = () => {
    const url = getShareUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = getShareUrl();
    const text = encodeURIComponent(
      `שלום! פתחתי עמוד קהילה ויעד אישי בקמפיין: ${url}\nאשמח מאוד לתמיכה ולשותפות שלך בהגעה אל היעד!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleReset = () => {
    setName('');
    setLeaderName('');
    setTargetGoal(10000);
    setMessage('');
    setCustomSlug('');
    setPhone('');
    setEmail('');
    setCreatedAmbassador(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 dir-rtl">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 left-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!createdAmbassador ? (
          <>
            {/* Header */}
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2 border border-indigo-100 shadow-sm">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">הקמת קהילה ויעד שגריר חדש</h3>
              <p className="text-xs sm:text-sm text-slate-500">
                קבל עמוד קמפיין ייעודי עם קישור אישי להפצה בוואטסאפ ולגיוס שותפים
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-2xl text-xs font-semibold text-center">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-slate-700 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-750 mb-1">שם הקהילה / הצוות *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="למשל: קהילת לב אחד - ירושלים"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-750 mb-1">שם מוביל הקהילה</label>
                  <input
                    type="text"
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    placeholder="שם מלא"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-750 mb-1">יעד אישי לגיוס (₪) *</label>
                  <input
                    type="number"
                    required
                    min="100"
                    step="50"
                    value={targetGoal}
                    onChange={(e) => setTargetGoal(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-bold text-indigo-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-750 mb-1">טלפון נייד לוואטסאפ</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="050-0000000"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-750 mb-1">כתובת אימייל</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-750 mb-1">סלאג מותאם לקישור (אופציונלי - אנגלית בלבד)</label>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 dir-ltr">
                  <span>/</span>
                  <input
                    type="text"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="my-community-goal"
                    className="bg-transparent border-none focus:outline-none w-full text-slate-800 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-750 mb-1">חזון הקהילה ומסר לשותפים</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="ספרו בכמה מילים על המטרה שלכם ועל חשיבות ההגעה ליעד..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    צור עמוד קהילה והפעל יעד
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          /* Success Screen with WhatsApp Share */
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">עמוד הקהילה הוקם בהצלחה!</h3>
              <p className="text-sm text-slate-500">
                קהילת <strong className="text-slate-800">{createdAmbassador.name}</strong> מוכנה לגיוס שותפים ביעד של ₪{createdAmbassador.targetGoal.toLocaleString()}.
              </p>
            </div>

            {/* Share URL Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
              <span className="font-mono text-slate-600 truncate dir-ltr">{getShareUrl()}</span>
              <button
                onClick={handleCopyLink}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition-all shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'הועתק!' : 'העתק'}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={handleWhatsAppShare}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <Share2 className="w-4 h-4" />
                שתף בוואטסאפ עכשיו
              </button>

              <button
                onClick={handleReset}
                className="w-full py-2.5 text-slate-500 hover:text-slate-800 font-semibold text-xs"
              >
                סגור וחזור לקמפיין
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
