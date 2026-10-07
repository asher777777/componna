/**
 * CreateCampaignModal: Modal for creating a new crowdfunding campaign
 * Synchronized with the user's media gallery component via MediaPickerContract.
 */

import React, { useState } from 'react';
import { X, Trophy, Sparkles, Image as ImageIcon, Target, Calendar, Globe, Plus, Check } from 'lucide-react';
import { useCampaignModule } from '../context/CampaignModuleContext';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract } from '../../../core/contracts';

export const CreateCampaignModal: React.FC = () => {
  const { isCreateCampaignOpen, setIsCreateCampaignOpen, createCampaign } = useCampaignModule();
  const { getCapability } = useHostCapabilities();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetGoal, setTargetGoal] = useState<number | ''>(250000);
  const [slug, setSlug] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [donationType, setDonationType] = useState<'both' | 'one_time' | 'recurring'>('both');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isCreateCampaignOpen) return null;

  // Open Media Gallery picker
  const handleOpenMediaPicker = async () => {
    const mediaPicker = getCapability<MediaPickerContract>('media-picker');
    if (mediaPicker && typeof mediaPicker.openPicker === 'function') {
      try {
        const result = await mediaPicker.openPicker({ accept: 'image/*', multiple: false });
        if (result) {
          const url = Array.isArray(result) ? result[0] : result;
          if (url) setFeaturedImageUrl(url);
        }
      } catch (err) {
        console.warn('MediaPicker error:', err);
      }
    } else {
      // Fallback prompt
      const manualUrl = window.prompt('הזן כתובת תמונה ראשית עבור הקמפיין:');
      if (manualUrl) setFeaturedImageUrl(manualUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetGoal) {
      setError('נא למלא את כותרת הקמפיין וסכום היעד');
      return;
    }

    setLoading(true);
    setError('');

    const cleanSlug = (slug || title)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/^-+|-+$/g, '') || `camp-${Date.now().toString().slice(-4)}`;

    const res = await createCampaign({
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      targetGoal: Number(targetGoal),
      slug: cleanSlug,
      featuredImageUrl,
      donationType,
    });

    setLoading(false);

    if (res.success) {
      handleClose();
    } else {
      setError(res.error || 'שגיאה ביצירת הקמפיין');
    }
  };

  const handleClose = () => {
    setTitle('');
    setSubtitle('');
    setDescription('');
    setTargetGoal(250000);
    setSlug('');
    setFeaturedImageUrl('');
    setError('');
    setIsCreateCampaignOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 dir-rtl">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 left-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 border border-amber-100 shadow-sm">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">הקמת קמפיין גיוס חדש</h3>
          <p className="text-xs sm:text-sm text-slate-500">
            הגדר קמפיין שותפים מרכזי, סכום יעד, ומסלולי תרומה עם סנכרון לגלריה
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
            <label className="block text-xs font-bold text-slate-700 mb-1">כותרת הקמפיין המרכזי *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="למשל: קמפיין בניית מרכז הקהילה 2026"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">סלוגן / כותרת משנה</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="יחד בונים עתיד ומחברים קהילות"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">יעד גיוס ראשי (₪) *</label>
              <input
                type="number"
                required
                min="1000"
                step="500"
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-black text-indigo-950"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">מזהה סלאג באנגלית (URL)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="campaign-2026"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono dir-ltr"
              />
            </div>
          </div>

          {/* Featured Image with Gallery Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">תמונת נושא ראשית לקמפיין</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={featuredImageUrl}
                onChange={(e) => setFeaturedImageUrl(e.target.value)}
                placeholder="https://... או בחר מגלריית המדיה"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-mono dir-ltr"
              />
              <button
                type="button"
                onClick={handleOpenMediaPicker}
                className="px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 flex items-center gap-1.5 transition-all shrink-0"
              >
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                בחר מהגלריה
              </button>
            </div>
            {featuredImageUrl && (
              <div className="mt-2 relative w-full h-24 rounded-xl overflow-hidden border border-slate-200">
                <img src={featuredImageUrl} alt="תצוגה מקדימה" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">תיאור הקמפיין וחזון</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ספרו על מהות הקמפיין, למה הוא חשוב, ומה תעשו עם הכספים שיגויסו..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">סוגי תרומות מותרים</label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setDonationType('both')}
                className={`py-2 rounded-lg transition-all ${
                  donationType === 'both' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                שניהם (הו"ק וחד-פעמי)
              </button>
              <button
                type="button"
                onClick={() => setDonationType('recurring')}
                className={`py-2 rounded-lg transition-all ${
                  donationType === 'recurring' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                הוראת קבע בלבד
              </button>
              <button
                type="button"
                onClick={() => setDonationType('one_time')}
                className={`py-2 rounded-lg transition-all ${
                  donationType === 'one_time' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                חד פעמי בלבד
              </button>
            </div>
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
                הקם קמפיין והמשך לעיצוב מלא
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
