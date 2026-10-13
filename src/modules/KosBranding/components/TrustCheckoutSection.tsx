import React from 'react';
import { useBrandDna } from '../hooks/useBrandDna';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { MediaPickerContract } from '../../../core/contracts';
import {
  ShieldCheck,
  CreditCard,
  FileCheck,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Lock,
  FolderOpen,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';

export const TrustCheckoutSection: React.FC = () => {
  const { brandDna, updateTrust } = useBrandDna();
  const trust = brandDna.trust;
  const { getCapability } = useHostCapabilities();
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');

  const handlePickBadgeImage = async () => {
    if (mediaPicker) {
      const selected = await mediaPicker.openPicker({
        accept: 'image/*',
      });
      if (selected) {
        const finalUrl = Array.isArray(selected) ? selected[0] : selected;
        if (finalUrl) {
          updateTrust({ securityBadgeImageUrl: finalUrl });
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Legal Entity & Contact */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">זהות משפטית ופרטי התקשרות</h3>
            <p className="text-xs text-slate-400">פרטים אלו מוצגים אוטומטית בדפי הסליקה, בחשבוניות ובתחתית העמודים</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Legal Entity ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              מספר ח.פ / ע.מ / מספר עמותה
            </label>
            <input
              type="text"
              value={trust.legalEntityId}
              onChange={(e) => updateTrust({ legalEntityId: e.target.value })}
              placeholder="516000000"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">טלפון ראשי / משרד</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
              <input
                type="text"
                value={trust.contactPhone}
                onChange={(e) => updateTrust({ contactPhone: e.target.value })}
                placeholder="03-1234567"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">דוא״ל רשמי לפניות וקבלות</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
              <input
                type="email"
                value={trust.contactEmail}
                onChange={(e) => updateTrust({ contactEmail: e.target.value })}
                placeholder="contact@mybrand.co.il"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* WhatsApp Support Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">מספר וואטסאפ לתמיכה מהירה</label>
            <div className="relative">
              <MessageCircle className="w-4 h-4 text-emerald-500 absolute right-3 top-3" />
              <input
                type="text"
                value={trust.whatsappSupportNumber || ''}
                onChange={(e) => updateTrust({ whatsappSupportNumber: e.target.value })}
                placeholder="0501234567"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Office Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">כתובת משרד / עסק</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
            <input
              type="text"
              value={trust.officeAddress}
              onChange={(e) => updateTrust({ officeAddress: e.target.value })}
              placeholder="לדוגמה: דרך מנחם בגין 144, תל אביב"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Checkout Guarantees & Security Badges */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">מיתוג דפי סליקה, אבטחה ואחריות</h3>
            <p className="text-xs text-slate-400">הבטחות שמוצגות ליד כפתור התשלום להגברת האמון ושיעורי ההמרה</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Refund Policy Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              מדיניות ביטולים ואחריות (Refund & Guarantee Promise)
            </label>
            <input
              type="text"
              value={trust.refundPolicySummary}
              onChange={(e) => updateTrust({ refundPolicySummary: e.target.value })}
              placeholder="לדוגמה: 100% אחריות והחזר כספי מלא תוך 14 יום ללא שאלות"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Security Badge Text & Custom Badge Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                נוסח הצהרת אבטחה בדף סליקה
              </label>
              <input
                type="text"
                value={trust.securityBadgeText}
                onChange={(e) => updateTrust({ securityBadgeText: e.target.value })}
                placeholder="סליקה מאובטחת בתקן PCI-DSS ובהצפנת SSL 256-bit"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Custom Badge/Seal Image Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                סמל אבטחה / תו אישור (מגלריית המדיה)
              </label>
              <div className="flex items-center gap-2">
                {trust.securityBadgeImageUrl ? (
                  <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-700 rounded-xl flex-1">
                    <img
                      src={trust.securityBadgeImageUrl}
                      alt="Security Badge"
                      className="w-8 h-8 rounded-lg object-contain bg-black/40"
                    />
                    <span className="text-[11px] text-slate-300 truncate flex-1 font-mono">
                      תג אבטחה מותאם
                    </span>
                    <button
                      type="button"
                      onClick={() => updateTrust({ securityBadgeImageUrl: '' })}
                      className="text-slate-400 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handlePickBadgeImage}
                    className="flex-1 py-2 px-3 bg-slate-900/70 hover:bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <FolderOpen className="w-4 h-4 text-blue-400" />
                    <span>בחר תג/סמל מהגלריה</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Live Trust Preview Banner */}
          <div className="p-4 bg-slate-950/70 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {trust.securityBadgeImageUrl ? (
                <img
                  src={trust.securityBadgeImageUrl}
                  alt="Security Seal"
                  className="w-8 h-8 rounded-full object-contain shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
              )}
              <div className="text-xs">
                <p className="font-bold text-emerald-300">{trust.securityBadgeText || 'סליקה מאובטחת'}</p>
                <p className="text-[11px] text-slate-400">{trust.refundPolicySummary || 'מדיניות החזר מובטחת'}</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase px-2 py-1 bg-slate-900 rounded border border-slate-800">
              תצוגת באדג' אבטחה
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
