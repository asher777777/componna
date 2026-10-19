import React, { useState } from 'react';
import { PageBuilderModal } from '../ui/PageBuilderModal';
import { PageBuilderInput, resolveInputValue } from '../ui/PageBuilderInput';
import { useBrandDna } from '../../KosBranding/hooks/useBrandDna';
import { MessageCircle, Phone, Mail, MapPin, Share2, Sparkles, Check } from 'lucide-react';
import { clsx } from 'clsx';

export interface FloatingWidgetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  globalSettings: any;
  onSave: (updatedGlobalSettings: any) => void;
}

export const FloatingWidgetSettingsModal: React.FC<FloatingWidgetSettingsModalProps> = ({
  isOpen,
  onClose,
  globalSettings,
  onSave,
}) => {
  const brandContext = useBrandDna();
  const brandDna = brandContext?.brandDna;

  const currentWidget = globalSettings?.floatingContactWidget || {};

  const [enabled, setEnabled] = useState<boolean>(currentWidget.enabled !== false);
  const [buttonText, setButtonText] = useState<string>(currentWidget.buttonText || 'אנחנו כאן');
  const [phone, setPhone] = useState<string>(currentWidget.phone || globalSettings?.contactPhone || '');
  const [whatsapp, setWhatsapp] = useState<string>(currentWidget.whatsapp || globalSettings?.contactWhatsApp || '');
  const [email, setEmail] = useState<string>(currentWidget.email || globalSettings?.contactEmail || '');
  const [address, setAddress] = useState<string>(currentWidget.address || globalSettings?.address || '');
  const [enableShare, setEnableShare] = useState<boolean>(currentWidget.enableShare !== false);
  const [shareTitle, setShareTitle] = useState<string>(currentWidget.shareTitle || '');
  const [shareText, setShareText] = useState<string>(currentWidget.shareText || '');

  const handleApply = () => {
    const updated = {
      ...globalSettings,
      floatingContactWidget: {
        ...currentWidget,
        enabled,
        buttonText,
        phone,
        whatsapp,
        email,
        address,
        enableShare,
        shareTitle,
        shareText,
      },
    };
    onSave(updated);
    onClose();
  };

  const handleResetToBrandDna = () => {
    setPhone(brandDna?.trust?.contactPhone || '052-6968008');
    setWhatsapp(brandDna?.trust?.whatsappSupportNumber || '0526968008');
    setEmail(brandDna?.trust?.contactEmail || 'ovt5771@gmail.com');
    setAddress(brandDna?.trust?.officeAddress || 'דרך מנחם בגין 144, תל אביב');
  };

  return (
    <PageBuilderModal
      isOpen={isOpen}
      onClose={onClose}
      title="הגדרות כפתור 'אנחנו כאן' ושיתופים"
      subtitle="התאמת פרטי ההתקשרות, אפשרויות השיתוף והצגת הכפתור בעמוד הנוכחי"
      maxWidth="2xl"
    >
      <div className="flex flex-col gap-5 text-right font-sans" dir="rtl">
        {/* Toggle Display */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white block">הצגת כפתור 'אנחנו כאן' בעמוד</span>
            <span className="text-[11px] text-slate-400">כפתור צף בפינה השמאלית/ימנית המאפשר יצירת קשר ושיתוף</span>
          </div>
          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={clsx(
              'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
              enabled ? 'bg-emerald-600' : 'bg-slate-800'
            )}
          >
            <span
              className={clsx(
                'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                enabled ? 'left-1' : 'right-1'
              )}
            />
          </button>
        </div>

        {/* Button Label */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <PageBuilderInput
            label="טקסט הכפתור הצף"
            value={buttonText}
            placeholder="אנחנו כאן"
            onChange={(e) => setButtonText(resolveInputValue(e))}
          />
        </div>

        {/* Contact Details Override */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">פרטי התקשרות מקומיים לעמוד</h4>
              <span className="text-[11px] text-slate-400">ניתן לשנות עבור עמוד זה מבלי להשפיע על רכיב המיתוג</span>
            </div>
            <button
              type="button"
              onClick={handleResetToBrandDna}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>שחזר מרכיב המיתוג</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PageBuilderInput
              label="טלפון"
              value={phone}
              placeholder={brandDna?.trust?.contactPhone || '052-6968008'}
              onChange={(e) => setPhone(resolveInputValue(e))}
              dir="ltr"
            />
            <PageBuilderInput
              label="וואטסאפ (ללא מקפים)"
              value={whatsapp}
              placeholder={brandDna?.trust?.whatsappSupportNumber || '0526968008'}
              onChange={(e) => setWhatsapp(resolveInputValue(e))}
              dir="ltr"
            />
            <PageBuilderInput
              label="אימייל לפניות"
              value={email}
              placeholder={brandDna?.trust?.contactEmail || 'contact@example.com'}
              onChange={(e) => setEmail(resolveInputValue(e))}
              dir="ltr"
            />
            <PageBuilderInput
              label="כתובת פיזית ל-Waze"
              value={address}
              placeholder={brandDna?.trust?.officeAddress || 'תל אביב'}
              onChange={(e) => setAddress(resolveInputValue(e))}
            />
          </div>
        </div>

        {/* Share Options */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">אפשרויות שיתוף עמוד</span>
              <span className="text-[11px] text-slate-400">כולל שיתוף בוואטסאפ, פייסבוק, טלגרם והעתקת קישור</span>
            </div>
            <button
              type="button"
              onClick={() => setEnableShare(!enableShare)}
              className={clsx(
                'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
                enableShare ? 'bg-indigo-600' : 'bg-slate-800'
              )}
            >
              <span
                className={clsx(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  enableShare ? 'left-1' : 'right-1'
                )}
              />
            </button>
          </div>

          {enableShare && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <PageBuilderInput
                label="כותרת שיתוף"
                value={shareTitle}
                placeholder={globalSettings?.siteTitle || 'כותרת העמוד לשיתוף'}
                onChange={(e) => setShareTitle(resolveInputValue(e))}
              />
              <PageBuilderInput
                label="טקסט / תיאור שיתוף"
                value={shareText}
                placeholder={globalSettings?.slogan || 'הזמנה להצטרף ולבקר בעמוד שלנו'}
                onChange={(e) => setShareText(resolveInputValue(e))}
              />
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
          >
            ביטול
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>החל שמירה לעמוד</span>
          </button>
        </div>
      </div>
    </PageBuilderModal>
  );
};
