import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  MessageCircle, 
  User, 
  Tag, 
  Building, 
  CreditCard, 
  ChevronDown, 
  Save, 
  Target,
  FileText,
  AlertTriangle,
  Globe,
  Package
} from 'lucide-react';
import { Contact, CustomField } from '../types';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { useOptionalSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope, DEFAULT_SUBDOMAIN_MODULES } from '../../../core/tenant';
import { 
  WhatsAppContract, 
  KesherPaymentContract, 
  RecruitmentContract, 
  CrmGroupsContract, 
  EmailContract, 
  FormBuilderContract 
} from '../../../core/contracts';
import { ContactSubdomainTab } from './contact-modal/ContactSubdomainTab';
import { ContactWhatsAppTab } from './contact-modal/ContactWhatsAppTab';
import { ContactContentSubscriptionsTab } from './contact-modal/ContactContentSubscriptionsTab';
import { tenantContactSyncService } from '../services/tenantContactSyncService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  onSave?: (updatedContact: Contact) => Promise<boolean>;
  customFields?: CustomField[];
  firebaseApp?: any;
}

export type HakelAccordionSection = 
  | 'details' 
  | 'tags' 
  | 'company' 
  | 'payments' 
  | 'recruitment' 
  | 'forms' 
  | 'whatsapp' 
  | 'email'
  | 'content_subscriptions'
  | 'subdomain';

export const Contact360Modal: React.FC<Props> = ({
  isOpen,
  onClose,
  contact,
  onSave,
  customFields = [],
  firebaseApp,
}) => {
  if (!isOpen || !contact) return null;

  const [formData, setFormData] = useState<Contact>({ ...contact });
  const [initialContactData, setInitialContactData] = useState<Contact>({ ...contact });
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);

  // Dynamic Light / Dark mode sync from document element (default: light)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    setFormData({ ...contact });
    setInitialContactData({ ...contact });
    setShowUnsavedConfirm(false);
  }, [contact]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Check if user made unsaved changes
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialContactData);
  }, [formData, initialContactData]);

  // Access core contracts & tenant module state
  const { getCapability } = useHostCapabilities();
  const sysConn = useOptionalSystemConnection();
  const { isRootTenant } = useTenantScope();
  const whatsappContract = getCapability<WhatsAppContract>('whatsapp');
  const kesherContract = getCapability<KesherPaymentContract>('kesher-payment');
  const recruitmentContract = getCapability<RecruitmentContract>('recruitment');
  const groupsContract = getCapability<CrmGroupsContract>('crm-groups');
  const emailContract = getCapability<EmailContract>('email');
  const formBuilderContract = getCapability<FormBuilderContract>('form-builder');

  const isKosSubscribedActive = useMemo(() => {
    const purchased = sysConn?.purchasedModules || [];
    const contactMods = formData.activeModules || [];
    const combined = [...purchased, ...contactMods, ...(isRootTenant ? DEFAULT_SUBDOMAIN_MODULES : [])];
    if (combined.length === 0) return DEFAULT_SUBDOMAIN_MODULES.includes('KosSubscribed');
    return combined.some((m) => {
      const lower = (m || '').toLowerCase();
      return lower === 'kossubscribed' || lower === 'kossuncribd';
    });
  }, [sysConn?.purchasedModules, formData.activeModules, isRootTenant]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleSection = (section: HakelAccordionSection) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFieldChange = (field: keyof Contact, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (formData.subdomain && (formData.isSubdomainAdmin || formData.isUser)) {
        try {
          await tenantContactSyncService.updateTenantFromContact(
            formData.subdomain,
            {
              subdomain: formData.subdomain,
              fullDomain: formData.fullDomain || `${formData.subdomain}.kosun.co.il`,
              clientName: formData.kosun_crm_name || formData.conta_name || formData.subdomain,
              adminUsername: formData.adminUsername || `${formData.subdomain}_admin`,
              adminPassword: formData.adminPassword,
              activeModules: formData.activeModules,
              status: formData.tenantStatus || 'active',
              billingPlan: formData.billingPlan || 'monthly',
              notes: formData.subdomainNotes,
              ownerEmail: formData.kosun_crm_email || formData.email,
              ownerPhone: formData.kosun_crm_phone || formData.conta_phone,
            },
            firebaseApp
          );
        } catch (syncErr) {
          console.warn('[Contact360Modal] Tenant sync warning during save:', syncErr);
        }
      }
      if (onSave) {
        await onSave(formData);
      }
      setInitialContactData({ ...formData });
      showNotification('השינויים נשמרו בהצלחה וסונכרנו עם הטננט');
      setTimeout(() => onClose(), 500);
    } catch (e: any) {
      showNotification(e?.message || 'שגיאה בשמירת פרטי איש הקשר');
    } finally {
      setIsSaving(false);
    }
  };

  // Safe Close with dirty check warning
  const handleRequestClose = () => {
    if (isDirty) {
      setShowUnsavedConfirm(true);
    } else {
      onClose();
    }
  };

  // Canonical name and phone resolution
  const contactName = formData.kosun_crm_name || formData.conta_name || 'איש קשר ללא שם';
  const contactPhone = formData.kosun_crm_phone || formData.conta_phone || '';
  const contactEmail = formData.kosun_crm_email || formData.email || '';
  const contactCity = formData.kosun_crm_city || formData.mh_crm_city || '';
  const contactStreet = formData.kosun_crm_street || formData.mh_crm_street || '';
  const contactCompany = formData.kosun_crm_company || formData.company_name || '';
  const contactRole = formData.kosun_crm_role || formData.job_title || '';
  const contactGovId = formData.kosun_crm_gov_id || formData.tg1 || formData.tz || '';

  // Avatar initials icon (2 letters connected)
  const initials = useMemo(() => {
    const parts = contactName.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return contactName.slice(0, 2).toUpperCase() || 'לק';
  }, [contactName]);

  // Direct WhatsApp & Phone links
  const waUrl = whatsappContract?.buildWaMeUrl(contactPhone, `שלום ${contactName}`) || 
    (contactPhone ? `https://wa.me/${contactPhone.replace(/\D/g, '')}` : '#');
  const telUrl = contactPhone ? `tel:${contactPhone.replace(/\D/g, '')}` : '#';

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 transition-all duration-300 font-sans"
      dir="rtl"
    >
      {/* Modal Container: Adapts automatically to Light Mode or Dark Mode */}
      <div 
        className={`w-full max-w-[480px] max-h-[92vh] overflow-y-auto rounded-3xl sm:rounded-[2.5rem] p-3.5 sm:p-5 relative shadow-2xl flex flex-col no-scrollbar border transition-colors ${
          isDarkMode 
            ? 'bg-[#0a0a0a] border-white/10 text-white' 
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
        style={{ fontFamily: "'Heebo', sans-serif" }}
      >

        {/* 1. Header: Compact (reduced height by 80%), with Save Icon, Avatar Icon Badge and Close */}
        <div className={`flex items-center justify-between pb-2.5 mb-2.5 border-b shrink-0 ${
          isDarkMode ? 'border-white/10' : 'border-slate-100'
        }`}>
          {/* Right: Connected Two-Letter Avatar Icon (התווית הוקטנה לאייקון המשלב שתי אותיות) + Name */}
          <div className="flex items-center gap-2 max-w-[65%]">
            <div 
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black shrink-0 shadow-sm border select-none ${
                isDarkMode 
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}
              title={contactName}
            >
              {initials}
            </div>

            <div className="truncate">
              <div className={`text-xs sm:text-sm font-black truncate leading-tight ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {contactName}
              </div>
              {(contactRole || contactCompany) && (
                <div className={`text-[10px] truncate leading-none mt-0.5 ${
                  isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                }`}>
                  {contactRole}{contactRole && contactCompany ? ' • ' : ''}{contactCompany}
                </div>
              )}
            </div>
          </div>

          {/* Left: Quick Actions (Call, WhatsApp, Save Icon in Header, Close) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {contactPhone && (
              <a 
                href={telUrl} 
                className={`p-1.5 rounded-full border transition hover:opacity-80 ${
                  isDarkMode ? 'border-indigo-900 text-indigo-400' : 'border-indigo-200 text-indigo-600 bg-indigo-50/50'
                }`}
                title="חייג"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            )}

            {contactPhone && (
              <a 
                href={waUrl} 
                target="_blank" 
                rel="noreferrer" 
                className={`p-1.5 rounded-full border transition hover:opacity-80 ${
                  isDarkMode ? 'border-emerald-900 text-emerald-400' : 'border-emerald-200 text-emerald-600 bg-emerald-50/50'
                }`}
                title="WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Save Button as Icon in Header without text label (כפתור שמירה עלה להדר כאיקון ללא תווית) */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`p-1.5 rounded-full transition shadow-sm cursor-pointer disabled:opacity-50 ${
                isDirty
                  ? 'bg-amber-500 hover:bg-amber-400 text-black ring-2 ring-amber-400/50 animate-pulse'
                  : isDarkMode
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title={isDirty ? "שמור שינויים שלא נשמרו" : "שמור"}
            >
              <Save className="w-3.5 h-3.5" />
            </button>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={handleRequestClose}
              className={`p-1.5 rounded-full transition cursor-pointer ${
                isDarkMode 
                  ? 'text-zinc-400 hover:text-white hover:bg-white/10' 
                  : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
              }`}
              title="סגור"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Unsaved Changes Warning Banner */}
        {showUnsavedConfirm && (
          <div className="mb-3 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-xs space-y-2 animate-fadeIn shrink-0">
            <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>שים לב: קיימים שינויים שלא נשמרו בכרטיס איש הקשר.</span>
            </div>
            <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`}>
              האם ברצונך לשמור את השינויים לפני היציאה, או לצאת ללא שמירה?
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-lg text-xs transition"
              >
                שמור וצא
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedConfirm(false);
                  onClose();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  isDarkMode 
                    ? 'border-white/10 hover:bg-white/10 text-white' 
                    : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                }`}
              >
                צא ללא שמירה
              </button>
              <button
                type="button"
                onClick={() => setShowUnsavedConfirm(false)}
                className="px-2 py-1 text-xs text-zinc-400 hover:underline mr-auto"
              >
                המשך עריכה
              </button>
            </div>
          </div>
        )}

        {/* 3. Toast Message */}
        {toastMessage && (
          <div className="mb-2 p-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-600 dark:text-amber-300 text-xs text-center font-bold animate-fadeIn shrink-0">
            {toastMessage}
          </div>
        )}

        {/* 4. HAKEL Accordion Sections - Closed by default as per Constitution */}
        <div className="space-y-2 flex-1 overflow-y-auto">

          {/* 1. פרטים כלליים (Details) */}
          <div className={`w-full flex flex-col rounded-2xl border overflow-hidden transition-all ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <button
              type="button"
              onClick={() => toggleSection('details')}
              className={`w-full h-12 px-3.5 flex items-center justify-between font-bold text-xs cursor-pointer transition-all ${
                isDarkMode ? 'text-white hover:bg-[#1a1a1a]' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-white text-indigo-600 shadow-sm'
                }`}>
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold">פרטים כלליים</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openSections['details'] ? 'rotate-180' : ''}`} />
            </button>
            
            {openSections['details'] && (
              <div className={`p-3.5 sm:p-4 border-t space-y-2.5 text-xs animate-fadeIn ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-amber-500 block">שם מלא</label>
                  <input
                    type="text"
                    value={formData.kosun_crm_name || formData.conta_name || ''}
                    onChange={(e) => {
                      handleFieldChange('kosun_crm_name', e.target.value);
                      handleFieldChange('conta_name', e.target.value);
                    }}
                    placeholder="שם מלא"
                    className={`w-full border rounded-xl p-2 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode ? 'bg-transparent border-amber-500/60 text-white' : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-500 block">טלפון נייד</label>
                    <input
                      type="text"
                      value={formData.kosun_crm_phone || formData.conta_phone || ''}
                      onChange={(e) => {
                        handleFieldChange('kosun_crm_phone', e.target.value);
                        handleFieldChange('conta_phone', e.target.value);
                      }}
                      placeholder="050-1234567"
                      className={`w-full border rounded-xl p-2 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                        isDarkMode ? 'bg-transparent border-amber-500/60 text-white' : 'bg-white border-amber-500/60 text-slate-900'
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-500 block">אימייל</label>
                    <input
                      type="email"
                      value={formData.kosun_crm_email || formData.email || ''}
                      onChange={(e) => {
                        handleFieldChange('kosun_crm_email', e.target.value);
                        handleFieldChange('email', e.target.value);
                      }}
                      placeholder="user@example.com"
                      className={`w-full border rounded-xl p-2 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                        isDarkMode ? 'bg-transparent border-amber-500/60 text-white' : 'bg-white border-amber-500/60 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-500 block">עיר</label>
                    <input
                      type="text"
                      value={formData.kosun_crm_city || formData.mh_crm_city || ''}
                      onChange={(e) => {
                        handleFieldChange('kosun_crm_city', e.target.value);
                        handleFieldChange('mh_crm_city', e.target.value);
                      }}
                      placeholder="תל אביב"
                      className={`w-full border rounded-xl p-2 focus:outline-none ${
                        isDarkMode ? 'bg-transparent border-amber-500/60 text-white' : 'bg-white border-amber-500/60 text-slate-900'
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-500 block">רחוב</label>
                    <input
                      type="text"
                      value={formData.kosun_crm_street || formData.mh_crm_street || ''}
                      onChange={(e) => {
                        handleFieldChange('kosun_crm_street', e.target.value);
                        handleFieldChange('mh_crm_street', e.target.value);
                      }}
                      placeholder="רוטשילד 22"
                      className={`w-full border rounded-xl p-2 focus:outline-none ${
                        isDarkMode ? 'bg-transparent border-amber-500/60 text-white' : 'bg-white border-amber-500/60 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-amber-500 block">תעודת זהות / ח.פ</label>
                  <input
                    type="text"
                    value={formData.kosun_crm_gov_id || formData.tg1 || formData.tz || ''}
                    onChange={(e) => {
                      handleFieldChange('kosun_crm_gov_id', e.target.value);
                      handleFieldChange('tg1', e.target.value);
                    }}
                    placeholder="מספר ת.ז או ח.פ"
                    className={`w-full border rounded-xl p-2 font-mono focus:outline-none ${
                      isDarkMode ? 'bg-transparent border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. תיוגים, קבוצות והערות (Tags, Groups & Notes) */}
          <div className={`w-full flex flex-col rounded-2xl border overflow-hidden transition-all ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <button
              type="button"
              onClick={() => toggleSection('tags')}
              className={`w-full h-12 px-3.5 flex items-center justify-between font-bold text-xs cursor-pointer transition-all ${
                isDarkMode ? 'text-white hover:bg-[#1a1a1a]' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5 text-emerald-400' : 'bg-white text-emerald-600 shadow-sm'
                }`}>
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold">תיוגים, קבוצות והערות</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openSections['tags'] ? 'rotate-180' : ''}`} />
            </button>
            
            {openSections['tags'] && (
              <div className={`p-3.5 sm:p-4 border-t space-y-2.5 text-xs animate-fadeIn ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-amber-500 block">תגיות משויכות</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(formData.tags || formData.kosun_crm_tags || []).map((t, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold">
                        {t}
                      </span>
                    ))}
                    {(!formData.tags || formData.tags.length === 0) && (
                      <span className="text-zinc-500 text-[11px]">אין תגיות משויכות</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-amber-500 block">קהילה וקבוצה</label>
                  <input
                    type="text"
                    value={formData.community || formData.kosun_crm_community || ''}
                    onChange={(e) => {
                      handleFieldChange('community', e.target.value);
                      handleFieldChange('kosun_crm_community', e.target.value);
                    }}
                    placeholder="שם הקבוצה או הקהילה..."
                    className={`w-full border rounded-xl p-2 focus:outline-none ${
                      isDarkMode ? 'bg-transparent border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-amber-500 block">הערות ויומן פגישות</label>
                  <textarea
                    rows={3}
                    value={formData.notes || formData.kosun_crm_notes || ''}
                    onChange={(e) => {
                      handleFieldChange('notes', e.target.value);
                      handleFieldChange('kosun_crm_notes', e.target.value);
                    }}
                    placeholder="דגשים חשובים על הלקוח..."
                    className={`w-full border rounded-xl p-2 text-xs focus:outline-none ${
                      isDarkMode ? 'bg-transparent border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. חברה ומקור הגעה (Company & Source) */}
          <div className={`w-full flex flex-col rounded-2xl border overflow-hidden transition-all ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <button
              type="button"
              onClick={() => toggleSection('company')}
              className={`w-full h-12 px-3.5 flex items-center justify-between font-bold text-xs cursor-pointer transition-all ${
                isDarkMode ? 'text-white hover:bg-[#1a1a1a]' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5 text-blue-400' : 'bg-white text-blue-600 shadow-sm'
                }`}>
                  <Building className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold">חברה ומקור הגעה</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openSections['company'] ? 'rotate-180' : ''}`} />
            </button>
            
            {openSections['company'] && (
              <div className={`p-3.5 sm:p-4 border-t space-y-2.5 text-xs animate-fadeIn ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-amber-500 block">שם הארגון / החברה</label>
                  <input
                    type="text"
                    value={formData.company_name || formData.kosun_crm_company || ''}
                    onChange={(e) => {
                      handleFieldChange('company_name', e.target.value);
                      handleFieldChange('kosun_crm_company', e.target.value);
                    }}
                    placeholder="Tech Solutions בע״מ"
                    className={`w-full border rounded-xl p-2 focus:outline-none ${
                      isDarkMode ? 'bg-transparent border-amber-500/60 text-white' : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-500 block">תפקיד</label>
                    <input
                      type="text"
                      value={formData.job_title || formData.kosun_crm_role || ''}
                      onChange={(e) => {
                        handleFieldChange('job_title', e.target.value);
                        handleFieldChange('kosun_crm_role', e.target.value);
                      }}
                      placeholder="סמנכ״ל טכנולוגיות"
                      className={`w-full border rounded-xl p-2 focus:outline-none ${
                        isDarkMode ? 'bg-transparent border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-500 block">מקור הגעה</label>
                    <input
                      type="text"
                      value={formData.lead_source || formData.kosun_crm_source || ''}
                      onChange={(e) => {
                        handleFieldChange('lead_source', e.target.value);
                        handleFieldChange('kosun_crm_source', e.target.value);
                      }}
                      placeholder="קמפיין / וואטסאפ / אורגני"
                      className={`w-full border rounded-xl p-2 focus:outline-none ${
                        isDarkMode ? 'bg-transparent border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. תשלומים ועסקאות (Kesher Financials) */}
          <div className={`w-full flex flex-col rounded-2xl border overflow-hidden transition-all ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <button
              type="button"
              onClick={() => toggleSection('payments')}
              className={`w-full h-12 px-3.5 flex items-center justify-between font-bold text-xs cursor-pointer transition-all ${
                isDarkMode ? 'text-white hover:bg-[#1a1a1a]' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5 text-emerald-400' : 'bg-white text-emerald-600 shadow-sm'
                }`}>
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold">תשלומים ועסקאות (קשר)</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openSections['payments'] ? 'rotate-180' : ''}`} />
            </button>
            
            {openSections['payments'] && (
              <div className={`p-3.5 sm:p-4 border-t space-y-2.5 text-xs animate-fadeIn ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`p-2.5 rounded-xl border ${
                    isDarkMode ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                  }`}>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold">סה״כ רכישות</span>
                    <span className={`text-base font-black mt-0.5 block font-mono ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      ₪{(formData.total_spent || formData.kosun_crm_total_spent || 0).toLocaleString('he-IL')}
                    </span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${
                    isDarkMode ? 'bg-indigo-950/40 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'
                  }`}>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block font-bold">מספר עסקאות</span>
                    <span className={`text-base font-black mt-0.5 block font-mono ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {formData.order_count || formData.kosun_crm_order_count || 0}
                    </span>
                  </div>
                </div>

                {formData.payments && formData.payments.length > 0 && (
                  <div className="space-y-1 pt-1.5">
                    <span className="text-[10px] text-zinc-400 font-bold block">עסקאות אחרונות</span>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {formData.payments.map((p, pIdx) => (
                        <div key={pIdx} className={`p-2 rounded-lg border flex items-center justify-between text-[11px] ${
                          isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <div>
                            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>₪{p.amount}</span>
                            <span className="text-zinc-500 text-[10px] mr-2">({p.paymentType})</span>
                          </div>
                          <span className="text-zinc-500 font-mono text-[10px]">{p.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 5. גיוס ושגרירים (Recruitment & Campaigns) */}
          <div className={`w-full flex flex-col rounded-2xl border overflow-hidden transition-all ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <button
              type="button"
              onClick={() => toggleSection('recruitment')}
              className={`w-full h-12 px-3.5 flex items-center justify-between font-bold text-xs cursor-pointer transition-all ${
                isDarkMode ? 'text-white hover:bg-[#1a1a1a]' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5 text-purple-400' : 'bg-white text-purple-600 shadow-sm'
                }`}>
                  <Target className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold">גיוס ושגרירים</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openSections['recruitment'] ? 'rotate-180' : ''}`} />
            </button>
            
            {openSections['recruitment'] && (
              <div className={`p-3.5 sm:p-4 border-t space-y-2.5 text-xs animate-fadeIn ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`p-2.5 rounded-xl border ${
                    isDarkMode ? 'bg-purple-950/40 border-purple-500/30' : 'bg-purple-50 border-purple-200'
                  }`}>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 block font-bold">סכום שגויס</span>
                    <span className={`text-base font-black mt-0.5 block font-mono ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      ₪{(formData.campaign_total_raised || formData.campaign_amount || 0).toLocaleString('he-IL')}
                    </span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-[10px] text-zinc-500 block font-bold">שם קמפיין</span>
                    <span className={`text-xs font-bold mt-1 block truncate ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {formData.campaign_title || 'ללא קמפיין'}
                    </span>
                  </div>
                </div>

                {formData.ambassador_page_url && (
                  <div className="pt-1">
                    <a
                      href={formData.ambassador_page_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-purple-500 hover:text-purple-400 underline font-medium block"
                    >
                      צפה בעמוד השגריר האישי ↗
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 6. הגשות טפסים חכמים (Smart Forms Submissions) */}
          <div className={`w-full flex flex-col rounded-2xl border overflow-hidden transition-all ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <button
              type="button"
              onClick={() => toggleSection('forms')}
              className={`w-full h-12 px-3.5 flex items-center justify-between font-bold text-xs cursor-pointer transition-all ${
                isDarkMode ? 'text-white hover:bg-[#1a1a1a]' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5 text-cyan-400' : 'bg-white text-cyan-600 shadow-sm'
                }`}>
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold">הגשות טפסים</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openSections['forms'] ? 'rotate-180' : ''}`} />
            </button>
            
            {openSections['forms'] && (
              <div className={`p-3.5 sm:p-4 border-t space-y-2.5 text-xs animate-fadeIn ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}>
                {formData.last_form_name && (
                  <div className={`p-2.5 rounded-xl border space-y-1 ${
                    isDarkMode ? 'bg-cyan-950/30 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'
                  }`}>
                    <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold block">טופס אחרון שהוגש</span>
                    <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{formData.last_form_name}</div>
                    {formData.last_form_submission_date && (
                      <div className="text-[10px] text-zinc-500 font-mono">
                        תאריך: {formData.last_form_submission_date}
                      </div>
                    )}
                  </div>
                )}

                {formData.form_submissions && formData.form_submissions.length > 0 ? (
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 font-bold block">היסטוריית הגשות</span>
                    {formData.form_submissions.map((sub, sIdx) => (
                      <div key={sIdx} className={`p-2 rounded-lg border flex justify-between items-center text-[11px] ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{sub.name}</span>
                        <span className="text-zinc-500 font-mono text-[10px]">{sub.date}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  !formData.last_form_name && (
                    <div className="text-zinc-500 text-center py-2 text-xs">אין הגשות טפסים מתועדות</div>
                  )
                )}
              </div>
            )}
          </div>

          {/* 7. וואטסאפ ותקשורת ישירה (WhatsApp Hub) */}
          <div className={`w-full flex flex-col rounded-2xl border overflow-hidden transition-all ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <button
              type="button"
              onClick={() => toggleSection('whatsapp')}
              className={`w-full h-12 px-3.5 flex items-center justify-between font-bold text-xs cursor-pointer transition-all ${
                isDarkMode ? 'text-white hover:bg-[#1a1a1a]' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5 text-emerald-400' : 'bg-white text-emerald-600 shadow-sm'
                }`}>
                  <MessageCircle className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold">וואטסאפ ותקשורת ישירה</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openSections['whatsapp'] ? 'rotate-180' : ''}`} />
            </button>
            
            {openSections['whatsapp'] && (
              <div className={`p-3.5 sm:p-4 border-t space-y-3 text-xs animate-fadeIn ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}>
                <div className={`flex items-center justify-between p-2.5 rounded-xl border ${
                  isDarkMode ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <div>
                    <span className={`font-bold block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>מספר וואטסאפ</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs">{contactPhone || 'לא הוזן מספר'}</span>
                  </div>
                  {contactPhone && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>פתח ב-WhatsApp Web</span>
                    </a>
                  )}
                </div>

                {/* Full conversation logs, incoming webhook chats, KSF form dispatches & live sender */}
                <ContactWhatsAppTab formData={formData} />
              </div>
            )}
          </div>

          {/* 8. דיוור ואימייל (Email Communications) */}
          <div className={`w-full flex flex-col rounded-2xl border overflow-hidden transition-all ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <button
              type="button"
              onClick={() => toggleSection('email')}
              className={`w-full h-12 px-3.5 flex items-center justify-between font-bold text-xs cursor-pointer transition-all ${
                isDarkMode ? 'text-white hover:bg-[#1a1a1a]' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5 text-sky-400' : 'bg-white text-sky-600 shadow-sm'
                }`}>
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold">דיוור ואימייל</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openSections['email'] ? 'rotate-180' : ''}`} />
            </button>
            
            {openSections['email'] && (
              <div className={`p-3.5 sm:p-4 border-t space-y-2.5 text-xs animate-fadeIn ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}>
                <div className={`flex items-center justify-between p-2.5 rounded-xl border ${
                  isDarkMode ? 'bg-sky-950/30 border-sky-500/30' : 'bg-sky-50 border-sky-200'
                }`}>
                  <div>
                    <span className={`font-bold block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>כתובת אימייל</span>
                    <span className="text-sky-600 dark:text-sky-400 font-mono text-xs">{contactEmail || 'לא הוזן אימייל'}</span>
                  </div>
                  {contactEmail && (
                    <a
                      href={`mailto:${contactEmail}`}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition"
                    >
                      שלח מייל
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 8.5 מנויי תוכן וחבילות (KosSubscribed) - מופיע כאשר הרכיב נמצא ברכיבי הסאב-דומיין */}
          {isKosSubscribedActive && (
            <div className={`w-full flex flex-col rounded-2xl border overflow-hidden transition-all ${
              isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
            }`}>
              <button
                type="button"
                onClick={() => toggleSection('content_subscriptions')}
                className={`w-full h-12 px-3.5 flex items-center justify-between font-bold text-xs cursor-pointer transition-all ${
                  isDarkMode ? 'text-white hover:bg-[#1a1a1a]' : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-indigo-500/15 text-indigo-400' : 'bg-indigo-100 text-indigo-700 shadow-sm'
                  }`}>
                    <Package className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold">מנויי תוכן וחבילות (KosSubscribed)</span>
                  {(formData.kosun_crm_content_subscriptions?.length || formData.content_subscriptions?.length) ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-mono font-bold mr-1">
                      {(formData.kosun_crm_content_subscriptions || formData.content_subscriptions || []).length}
                    </span>
                  ) : null}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openSections['content_subscriptions'] ? 'rotate-180' : ''}`} />
              </button>

              {openSections['content_subscriptions'] && (
                <div className={`p-3.5 sm:p-4 border-t space-y-2.5 text-xs animate-fadeIn ${
                  isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
                }`}>
                  <ContactContentSubscriptionsTab
                    formData={formData}
                    onChange={handleFieldChange}
                    isDarkMode={isDarkMode}
                    onNotify={showNotification}
                  />
                </div>
              )}
            </div>
          )}

          {/* 9. סאב-דומיין ומשתמש מערכת (Subdomain & System User) */}
          <div className={`w-full flex flex-col rounded-2xl border overflow-hidden transition-all ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <button
              type="button"
              onClick={() => toggleSection('subdomain')}
              className={`w-full h-12 px-3.5 flex items-center justify-between font-bold text-xs cursor-pointer transition-all ${
                isDarkMode ? 'text-white hover:bg-[#1a1a1a]' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-800 shadow-sm'
                }`}>
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold">סאב-דומיין ומשתמש מערכת</span>
                {formData.subdomain && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono font-bold mr-1">
                    {formData.subdomain}
                  </span>
                )}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openSections['subdomain'] ? 'rotate-180' : ''}`} />
            </button>
            
            {openSections['subdomain'] && (
              <div className={`p-3.5 sm:p-4 border-t space-y-2.5 text-xs animate-fadeIn ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}>
                <ContactSubdomainTab
                  formData={formData}
                  onChange={handleFieldChange}
                  isDarkMode={isDarkMode}
                  onNotify={showNotification}
                  firebaseApp={firebaseApp}
                />
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
