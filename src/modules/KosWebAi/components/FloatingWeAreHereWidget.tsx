import React, { useState } from 'react';
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Share2,
  Copy,
  Check,
  X,
  ExternalLink,
  Navigation,
  Send,
  Sparkles,
  Edit3
} from 'lucide-react';
import { clsx } from 'clsx';
import { useBrandDna } from '../../KosBranding/hooks/useBrandDna';

export interface FloatingWeAreHereWidgetProps {
  pageConfigSettings?: any;
  isEditing?: boolean;
  onEditWidgetSettings?: () => void;
}

export const FloatingWeAreHereWidget: React.FC<FloatingWeAreHereWidgetProps> = ({
  pageConfigSettings,
  isEditing = false,
  onEditWidgetSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const brandContext = useBrandDna();
  const brandDna = brandContext?.brandDna;

  const widgetSettings = pageConfigSettings?.floatingContactWidget || {};

  // Check if widget is enabled (default to true per user spec)
  const isEnabled = widgetSettings.enabled !== false;
  if (!isEnabled && !isEditing) return null;

  // Resolved contact data (cascade: local page settings -> Brand DNA -> default fallback)
  const companyName = pageConfigSettings?.companyName || brandDna?.identity?.companyName || 'קושאן';
  const resolvedPhone = widgetSettings.phone || pageConfigSettings?.contactPhone || brandDna?.trust?.contactPhone || '052-6968008';
  const resolvedWhatsapp = widgetSettings.whatsapp || pageConfigSettings?.contactWhatsApp || brandDna?.trust?.whatsappSupportNumber || '0526968008';
  const resolvedEmail = widgetSettings.email || pageConfigSettings?.contactEmail || brandDna?.trust?.contactEmail || 'ovt5771@gmail.com';
  const resolvedAddress = widgetSettings.address || pageConfigSettings?.address || brandDna?.trust?.officeAddress || 'דרך מנחם בגין 144, תל אביב';

  const buttonText = widgetSettings.buttonText || 'אנחנו כאן';
  const shareTitle = widgetSettings.shareTitle || pageConfigSettings?.siteTitle || companyName;
  const shareText = widgetSettings.shareText || pageConfigSettings?.slogan || 'הזמנה להצטרף ולבקר בעמוד שלנו';

  const cleanPhone = resolvedPhone.replace(/[^0-9]/g, '');
  const cleanWhatsapp = resolvedWhatsapp.replace(/[^0-9]/g, '');

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: shareTitle,
          text: shareText,
          url: currentUrl,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch (err) {
        // User dismissed share dialog
      }
    } else {
      handleCopyLink();
    }
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`${shareTitle}\n${shareText}\n${currentUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  const shareViaTelegram = () => {
    const text = encodeURIComponent(`${shareTitle}\n${shareText}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${text}`, '_blank');
  };

  const openWaze = () => {
    window.open(`https://waze.com/ul?q=${encodeURIComponent(resolvedAddress)}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" dir="rtl">
      {/* Expanded Bento Modal / Popover */}
      {isOpen && (
        <div className="mb-3 w-[330px] sm:w-[360px] rounded-3xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200 text-right">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-900/40 via-slate-900/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">{buttonText}</h3>
                <span className="text-[11px] text-slate-400">דרכי יצירת קשר ושיתוף מהיר</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="סגור"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-3.5 max-h-[75vh] overflow-y-auto custom-scrollbar">
            {/* Quick Contact Buttons Grid */}
            <div className="grid grid-cols-2 gap-2">
              {/* WhatsApp */}
              {cleanWhatsapp && (
                <a
                  href={`https://wa.me/${cleanWhatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 flex items-center gap-2.5 transition shadow-sm group"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold block text-white">וואטסאפ</span>
                    <span className="text-[10px] text-emerald-300 truncate block">שיחה מיידית</span>
                  </div>
                </a>
              )}

              {/* Phone */}
              {resolvedPhone && (
                <a
                  href={`tel:${cleanPhone}`}
                  className="p-3 rounded-2xl bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 flex items-center gap-2.5 transition shadow-sm group"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold block text-white">חיוג ישיר</span>
                    <span className="text-[10px] text-indigo-300 truncate block" dir="ltr">{resolvedPhone}</span>
                  </div>
                </a>
              )}
            </div>

            {/* Email & Address Details */}
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
              {resolvedEmail && (
                <a
                  href={`mailto:${resolvedEmail}`}
                  className="flex items-center gap-2.5 text-slate-300 hover:text-white transition group py-1"
                >
                  <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="truncate" dir="ltr">{resolvedEmail}</span>
                </a>
              )}

              {resolvedAddress && (
                <div className="flex items-center justify-between gap-2 text-slate-300 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="truncate">{resolvedAddress}</span>
                  </div>
                  <button
                    type="button"
                    onClick={openWaze}
                    className="text-[10px] px-2 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 font-bold shrink-0 flex items-center gap-1 transition cursor-pointer"
                    title="ניווט ב-Waze"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Waze</span>
                  </button>
                </div>
              )}
            </div>

            {/* Sharing Options Section */}
            {widgetSettings.enableShare !== false && (
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>שתפו עמוד זה</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="text-[10px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition cursor-pointer"
                    title="העתק קישור"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'הועתק!' : 'העתק קישור'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={shareViaWhatsApp}
                    className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 flex flex-col items-center gap-1 text-[10px] font-bold transition cursor-pointer"
                    title="שיתוף בוואטסאפ"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>וואטסאפ</span>
                  </button>

                  <button
                    type="button"
                    onClick={shareViaFacebook}
                    className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 flex flex-col items-center gap-1 text-[10px] font-bold transition cursor-pointer"
                    title="שיתוף בפייסבוק"
                  >
                    <Share2 className="w-4 h-4 text-blue-400" />
                    <span>פייסבוק</span>
                  </button>

                  <button
                    type="button"
                    onClick={shareViaTelegram}
                    className="p-2 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/30 text-sky-300 flex flex-col items-center gap-1 text-[10px] font-bold transition cursor-pointer"
                    title="שיתוף בטלגרם"
                  >
                    <Send className="w-4 h-4 text-sky-400" />
                    <span>טלגרם</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 flex flex-col items-center gap-1 text-[10px] font-bold transition cursor-pointer"
                    title="עוד אפשרויות"
                  >
                    <Share2 className="w-4 h-4 text-indigo-400" />
                    <span>עוד</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <div className="flex items-center gap-2">
        {/* Edit Button in On-Page Edit Mode */}
        {isEditing && onEditWidgetSettings && (
          <button
            type="button"
            onClick={onEditWidgetSettings}
            className="p-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg transition-all hover:scale-110 cursor-pointer"
            title="עריכת הגדרות כפתור 'אנחנו כאן' והשיתופים"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            "flex items-center gap-2.5 px-4 py-3 rounded-full font-bold text-xs sm:text-sm text-white shadow-2xl transition-all duration-300 cursor-pointer border hover:scale-105 active:scale-95",
            isOpen
              ? "bg-slate-800 border-slate-600 shadow-slate-900/50"
              : "bg-emerald-600 hover:bg-emerald-500 border-emerald-400/40 shadow-emerald-600/40"
          )}
          title="יצירת קשר ושיתוף"
          aria-label="כפתור אנחנו כאן"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300"></span>
            </span>
          </div>
          <span>{buttonText}</span>
        </button>
      </div>
    </div>
  );
};
