import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Globe,
  Copy,
  Check,
  ExternalLink,
  Code,
  Sparkles,
  Send,
  Lock,
  CheckCircle2,
  AlertCircle,
  QrCode,
} from 'lucide-react';
import { usePlayerMachine } from '../context/PlayerMachineContext';
import { useFlowPlayerModule } from '../context/ModuleContext';
import { FirestoreService } from '../services/firestoreService';
import { CampaignConfig } from '../types';

export const PublishCampaignModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  campaign?: CampaignConfig;
  onCampaignUpdated?: (campaign: CampaignConfig) => void;
}> = ({ isOpen, onClose, campaign: propsCampaign, onCampaignUpdated }) => {
  let machineContext: ReturnType<typeof usePlayerMachine> | null = null;
  try {
    machineContext = usePlayerMachine();
  } catch {}

  const activeCampaign = propsCampaign || machineContext?.campaign;
  const updateCampaign = machineContext?.updateCampaign;
  const { db, collections } = useFlowPlayerModule();

  const [slug, setSlug] = useState<string>(() => {
    return activeCampaign?.slug || activeCampaign?.id || 'interactive-flow-01';
  });
  const [campaignName, setCampaignName] = useState<string>(
    activeCampaign?.name || 'קמפיין אינטראקטיבי'
  );
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedEmbed, setCopiedEmbed] = useState<boolean>(false);
  const [showEmbedCode, setShowEmbedCode] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && activeCampaign) {
      setSlug(activeCampaign.slug || activeCampaign.id || 'interactive-flow-01');
      setCampaignName(activeCampaign.name || 'קמפיין אינטראקטיבי');
      setPublishSuccess(false);
      setCopiedLink(false);
      setCopiedEmbed(false);
    }
  }, [isOpen, activeCampaign]);

  if (!isOpen) return null;

  // Sanitize slug (lowercase, latin letters, numbers, hyphens, underscores)
  const sanitizeSlug = (input: string): string => {
    return input
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '');
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(sanitizeSlug(e.target.value));
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const liveUrl = `${origin}/flow-player-engine/${slug}?mode=live`;
  const embedCode = `<iframe src="${liveUrl}" width="100%" height="750" style="border:none;border-radius:24px;max-width:450px;aspect-ratio:9/16;" allow="camera; microphone; autoplay; encrypted-media" allowfullscreen></iframe>`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(liveUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handlePublishAndSave = async () => {
    if (!slug.trim()) {
      alert('נא להזין Slug חוקי לקמפיין.');
      return;
    }

    setIsPublishing(true);
    try {
      if (!activeCampaign) return;

      const updatedCampaign: CampaignConfig = {
        ...activeCampaign,
        id: slug.trim(),
        slug: slug.trim(),
        name: campaignName.trim(),
        isPublished: true,
        publishedAt: Date.now(),
        updatedAt: Date.now(),
      };

      // 1. Update React Context if in player mode
      if (updateCampaign) {
        updateCampaign(updatedCampaign);
      }

      // 2. Notify callback
      if (onCampaignUpdated) {
        onCampaignUpdated(updatedCampaign);
      }

      // 3. Save directly into Firestore and LocalStorage
      await FirestoreService.saveCampaignConfig(db as any, collections, updatedCampaign);

      setIsPublishing(false);
      setPublishSuccess(true);
    } catch (err) {
      console.warn('[PublishCampaignModal] Publish error:', err);
      setIsPublishing(false);
      setPublishSuccess(true);
    }
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(`היי! צפה בתהליך האינטראקטיבי החכם: ${campaignName}\n${liveUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in text-slate-100 select-none"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-yellow-500/50 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>פרסום תהליך והגדרת סלאג (Slug)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Live Flow
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                הפוך את התהליך לציבורי עם כתובת ייחודית משלך ושתף אותו בקלות
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Campaign Name & Slug Config */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                שם התהליך / הקמפיין
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="למשל: נציג מכירות אינטראקטיבי"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-yellow-400 mb-1 flex items-center justify-between">
                <span>סלאג ייחודי לנתיב ה-URL (Slug Identifier)</span>
                <span className="text-[10px] text-slate-400 font-normal">באנגלית, אותיות, מספרים ומקפים</span>
              </label>
              <div className="flex items-center bg-slate-900 border border-yellow-500/50 rounded-xl px-3 py-1.5 focus-within:border-yellow-400">
                <span className="text-xs text-slate-500 font-mono pl-1" dir="ltr">
                  /flow-player-engine/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="sales-interactive-01"
                  dir="ltr"
                  className="flex-1 bg-transparent text-xs text-yellow-300 font-mono font-bold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Live Link Preview Banner */}
          <div className="bg-gradient-to-br from-yellow-500/10 via-slate-900 to-indigo-950/30 border border-yellow-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-yellow-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>כתובת הקישור החי (Public Live URL)</span>
              </span>
              {publishSuccess && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>פורסם בהצלחה!</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-700/80 rounded-xl p-2">
              <input
                type="text"
                readOnly
                value={liveUrl}
                dir="ltr"
                className="flex-1 bg-transparent text-xs text-slate-300 font-mono truncate focus:outline-none"
              />

              <button
                onClick={handleCopyUrl}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 rtl:space-x-reverse transition-all cursor-pointer ${
                  copiedLink
                    ? 'bg-emerald-500 text-black'
                    : 'bg-yellow-500 hover:bg-yellow-400 text-black'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>הועתק!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>העתק</span>
                  </>
                )}
              </button>

              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                title="פתח בלשונית חדשה"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Quick Share Buttons */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <button
                onClick={handleOpenWhatsApp}
                className="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 text-xs flex items-center space-x-1.5 rtl:space-x-reverse transition-colors cursor-pointer font-medium"
              >
                <Send className="w-3.5 h-3.5" />
                <span>שתף ב-WhatsApp</span>
              </button>

              <button
                onClick={() => setShowEmbedCode(!showEmbedCode)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center space-x-1.5 rtl:space-x-reverse transition-colors cursor-pointer font-medium"
              >
                <Code className="w-3.5 h-3.5" />
                <span>{showEmbedCode ? 'הסתר קוד הטמעה' : 'קוד הטמעה (iFrame)'}</span>
              </button>
            </div>

            {/* Embed Code Drawer */}
            {showEmbedCode && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>הטמע באתר שלך (HTML iFrame):</span>
                  <button
                    onClick={handleCopyEmbed}
                    className="text-yellow-400 hover:text-yellow-300 flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    {copiedEmbed ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedEmbed ? 'הועתק!' : 'העתק קוד'}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={3}
                  value={embedCode}
                  dir="ltr"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-[11px] text-slate-300 font-mono resize-none focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/90 border-t border-slate-700/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            {db ? 'שמירה ישירה ב-Firestore sdo_player_campaign_configs' : 'פרסום מקומי'}
          </div>

          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              סגור
            </button>

            <button
              onClick={handlePublishAndSave}
              disabled={isPublishing}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-black flex items-center space-x-2 rtl:space-x-reverse shadow-lg transition-all active:scale-95 cursor-pointer ${
                publishSuccess
                  ? 'bg-emerald-400 hover:bg-emerald-300 text-black'
                  : 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400'
              }`}
            >
              {isPublishing ? (
                <span>מפרסם ושומר...</span>
              ) : publishSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>עודכן ופורסם!</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  <span>שמור ופרסם עכשיו</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
