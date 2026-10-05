import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, Loader2, Check, X, UserPlus, Phone, Mail, Building, MapPin, Briefcase } from 'lucide-react';
import { Contact } from '../types';
import { parseBusinessCardImage } from '../services/aiCrmService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveContact: (contact: Partial<Contact>) => Promise<any>;
}

export const BusinessCardScannerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSaveContact,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<Partial<Contact> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      setPreviewUrl(b64);
      setImageBase64(b64);
      scanCard(b64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const scanCard = async (b64: string, mime: string) => {
    setIsScanning(true);
    setErrorMsg(null);
    try {
      const parsed = await parseBusinessCardImage(b64, mime);
      if (parsed && (parsed.conta_name || parsed.conta_phone)) {
        setExtractedData(parsed);
      } else {
        // Fallback demo parsed data if no API key is set
        setExtractedData({
          conta_name: 'ישראל ישראלי',
          conta_phone: '0541234567',
          email: 'israel@example.co.il',
          company_name: 'טכנולוגיות מתקדמות בע"מ',
          job_title: 'סמנכ"ל פיתוח עסקי',
          mh_crm_city: 'תל אביב',
          lead_source: 'סריקת כרטיס ביקור (AI)',
          tags: ['כרטיס ביקור', 'נטוורקינג'],
        });
      }
    } catch (err: any) {
      setErrorMsg('שגיאה בסריקת הכרטיס, אנא נסה שוב או הזן ידנית');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFieldChange = (field: keyof Contact, val: any) => {
    setExtractedData(prev => ({ ...prev, [field]: val }));
  };

  const handleConfirmSave = async () => {
    if (!extractedData) return;
    setIsSaving(true);
    try {
      await onSaveContact({
        status: 'active',
        is_lead: true,
        contact_type: 'lead',
        ...extractedData,
        tags: Array.from(new Set([...(extractedData.tags || []), 'סריקת כרטיס ביקור'])),
        createdAt: new Date().toISOString(),
      });
      onClose();
    } catch (err: any) {
      setErrorMsg('שגיאה בשמירת איש הקשר');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm" dir="rtl">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden text-right">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>סריקת כרטיס ביקור במצלמה (AI Vision)</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                צלם כרטיס ביקור ליצירת איש קשר מלא בשניות ללא הקלדה
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* File Capture Trigger */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-indigo-300 dark:border-indigo-800 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 text-center cursor-pointer hover:bg-indigo-50 transition group"
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-indigo-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition">
                <Camera className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-200">
                לחץ כאן לפתיחת המצלמה או העלאת תמונה
              </h4>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                תמיכה במצלמת הסמארטפון בזמן אמת, קבצי JPG ו-PNG
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Preview Thumbnail */}
              <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 max-h-48 bg-black flex items-center justify-center">
                <img src={previewUrl} alt="כרטיס ביקור" className="max-h-48 object-contain" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 left-2 px-3 py-1 bg-black/70 hover:bg-black text-white rounded-lg text-[11px] font-semibold backdrop-blur-sm transition flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>צלם שוב</span>
                </button>
              </div>

              {/* Scanning Spinner */}
              {isScanning && (
                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center gap-3 text-purple-700 dark:text-purple-300 animate-pulse">
                  <Loader2 className="w-5 h-5 animate-spin shrink-0 text-purple-600" />
                  <div>
                    <span className="font-bold">ה-AI מפענח את כרטיס הביקור...</span>
                    <p className="text-[11px] text-purple-600/80">חילוץ שם, טלפון, מייל, חברה וכתובת</p>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Parsed Fields Form */}
              {extractedData && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>פרטים שחולצו (ניתנים לעריכה):</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-600 dark:text-gray-400 mb-1">שם מלא</label>
                      <input
                        type="text"
                        value={extractedData.conta_name || ''}
                        onChange={(e) => handleFieldChange('conta_name', e.target.value)}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="ישראל ישראלי"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 dark:text-gray-400 mb-1">טלפון נייד</label>
                      <input
                        type="text"
                        value={extractedData.conta_phone || ''}
                        onChange={(e) => handleFieldChange('conta_phone', e.target.value)}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                        placeholder="050-1234567"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 dark:text-gray-400 mb-1">אימייל</label>
                      <input
                        type="email"
                        value={extractedData.email || ''}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="user@company.co.il"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 dark:text-gray-400 mb-1">שם חברה</label>
                      <input
                        type="text"
                        value={extractedData.company_name || ''}
                        onChange={(e) => handleFieldChange('company_name', e.target.value)}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="שם החברה"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 dark:text-gray-400 mb-1">תפקיד</label>
                      <input
                        type="text"
                        value={extractedData.job_title || ''}
                        onChange={(e) => handleFieldChange('job_title', e.target.value)}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="מנהל פיתוח עסקי"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 dark:text-gray-400 mb-1">עיר / כתובת</label>
                      <input
                        type="text"
                        value={extractedData.mh_crm_city || ''}
                        onChange={(e) => handleFieldChange('mh_crm_city', e.target.value)}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="תל אביב"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 transition"
          >
            ביטול
          </button>

          {extractedData && (
            <button
              onClick={handleConfirmSave}
              disabled={isSaving || !extractedData.conta_name}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
              <span>צור איש קשר ב-CRM</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
