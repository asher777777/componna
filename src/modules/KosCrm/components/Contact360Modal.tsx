import React, { useState, useEffect, useMemo } from 'react';
import * as Icons from 'lucide-react';
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
import { 
  getAreaCollectionSchema, 
  KOSUN_STYLE_PRESETS, 
  StylePresetDefinition, 
  KosunDiscoveryLayoutMode, 
  resolveDiscoveryLayoutMode 
} from '../../../KOSDESYN/01-core-engine/areaCollectionManager';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  onSave?: (updatedContact: Contact) => Promise<boolean>;
  customFields?: CustomField[];
  firebaseApp?: any;
}

const HEBREW_LETTERS = ['א', 'ב', 'ג', 'ד'];

type BabushkaLevel = 'root' | 'personal' | 'business' | 'communication' | 'subscriptions';

export const Contact360Modal: React.FC<Props> = ({
  isOpen,
  onClose,
  contact,
  onSave,
  customFields = [],
  firebaseApp,
}) => {
  if (!isOpen || !contact) return null;

  const { tenantId: activeTenantId, isRootTenant } = useTenantScope();
  const currentTenant = activeTenantId || '_master';

  const [formData, setFormData] = useState<Contact>({ ...contact });
  const [initialContactData, setInitialContactData] = useState<Contact>({ ...contact });
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);

  // בבושקה: רמת העומק הנוכחית (רמה 0: שורש 4 כרטיסים, רמה 1: 4 כרטיסים פנימיים לפי נושא)
  const [babushkaLevel, setBabushkaLevel] = useState<BabushkaLevel>('root');
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);

  // הגדרות עיצוב ומיתוג מבוססות קולקציה דינמית (crm_contact_360)
  const [collectionConfig, setCollectionConfig] = useState({
    atmosphereTheme: 'cyber_neon',
    colorMode: 'night',
    layoutBudget: 'accordion_morph' as KosunDiscoveryLayoutMode,
    root_1_title: 'פרופיל אישי וקשר',
    root_1_badge: 'ליבה',
    root_1_icon: 'User',
    root_1_summary: 'פרטים כלליים, טלפון, מייל ותגיות שיוך',
    root_2_title: 'פעילות עסקית וכספית',
    root_2_badge: 'עסקאות',
    root_2_icon: 'CreditCard',
    root_2_summary: 'פרטי חברה, תשלומים, עסקאות ותקבולים',
    root_3_title: 'תקשורת ומעורבות',
    root_3_badge: 'אינטראקציה',
    root_3_icon: 'MessageCircle',
    root_3_summary: 'WhatsApp, אימייל, טפסים ותהליכי גיוס',
    root_4_title: 'מנויים וניהול מערכת',
    root_4_badge: 'הרשאות',
    root_4_icon: 'ShieldCheck',
    root_4_summary: 'חבילות מנוי פעילות, הרשאות תוכן וסאב-דומיין',
  });

  // שליפת הגדרות קולקציית crm_contact_360 בזמן אמת
  useEffect(() => {
    let mounted = true;
    getAreaCollectionSchema('crm_contact_360', currentTenant, 'saas').then((schema) => {
      if (!mounted) return;
      const map: Record<string, any> = {};
      schema.parameters.forEach((p) => {
        map[p.key] = p.currentValue;
      });
      setCollectionConfig((prev) => ({
        atmosphereTheme: map.atmosphereTheme || prev.atmosphereTheme,
        colorMode: map.colorMode || prev.colorMode,
        layoutBudget: resolveDiscoveryLayoutMode(map.layoutBudget, prev.layoutBudget),
        root_1_title: map.root_1_title || prev.root_1_title,
        root_1_badge: map.root_1_badge || prev.root_1_badge,
        root_1_icon: map.root_1_icon || prev.root_1_icon,
        root_1_summary: map.root_1_summary || prev.root_1_summary,
        root_2_title: map.root_2_title || prev.root_2_title,
        root_2_badge: map.root_2_badge || prev.root_2_badge,
        root_2_icon: map.root_2_icon || prev.root_2_icon,
        root_2_summary: map.root_2_summary || prev.root_2_summary,
        root_3_title: map.root_3_title || prev.root_3_title,
        root_3_badge: map.root_3_badge || prev.root_3_badge,
        root_3_icon: map.root_3_icon || prev.root_3_icon,
        root_3_summary: map.root_3_summary || prev.root_3_summary,
        root_4_title: map.root_4_title || prev.root_4_title,
        root_4_badge: map.root_4_badge || prev.root_4_badge,
        root_4_icon: map.root_4_icon || prev.root_4_icon,
        root_4_summary: map.root_4_summary || prev.root_4_summary,
      }));
    });
    return () => {
      mounted = false;
    };
  }, [currentTenant]);

  const isDarkMode = collectionConfig.colorMode === 'night';
  const styleDef: StylePresetDefinition =
    KOSUN_STYLE_PRESETS[collectionConfig.atmosphereTheme] || KOSUN_STYLE_PRESETS.cyber_neon;
  const modeColors = isDarkMode ? styleDef.night : styleDef.day;
  const brandPrimary = modeColors.primaryColor || '#00F0FF';
  const cardRadius = styleDef.geometry.cardRadius || '1rem';

  useEffect(() => {
    setFormData({ ...contact });
    setInitialContactData({ ...contact });
    setShowUnsavedConfirm(false);
    setBabushkaLevel('root');
    setActiveCardIndex(0);
  }, [contact]);

  // בדיקת שינויים שלא נשמרו
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialContactData);
  }, [formData, initialContactData]);

  // גישה ליכולות וחוזים
  const { getCapability } = useHostCapabilities();
  const sysConn = useOptionalSystemConnection();
  const whatsappContract = getCapability<WhatsAppContract>('whatsapp');
  const kesherContract = getCapability<KesherPaymentContract>('kesher-payment');

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

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFieldChange = (field: keyof Contact, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  const handleRequestClose = () => {
    if (isDirty) {
      setShowUnsavedConfirm(true);
    } else {
      onClose();
    }
  };

  // פרטי זיהוי לקוח
  const contactName = formData.kosun_crm_name || formData.conta_name || 'איש קשר ללא שם';
  const contactPhone = formData.kosun_crm_phone || formData.conta_phone || '';
  const contactEmail = formData.kosun_crm_email || formData.email || '';
  const contactCity = formData.kosun_crm_city || formData.mh_crm_city || '';
  const contactCompany = formData.kosun_crm_company || formData.company_name || '';
  const contactRole = formData.kosun_crm_role || formData.job_title || '';

  // אייקון שתי אותיות מחוברות
  const initials = useMemo(() => {
    const parts = contactName.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return contactName.slice(0, 2).toUpperCase() || 'לק';
  }, [contactName]);

  const waUrl =
    whatsappContract?.buildWaMeUrl(contactPhone, `שלום ${contactName}`) ||
    (contactPhone ? `https://wa.me/${contactPhone.replace(/\D/g, '')}` : '#');
  const telUrl = contactPhone ? `tel:${contactPhone.replace(/\D/g, '')}` : '#';

  // =========================================================================
  // בבושקה רמה 0: 4 כרטיסי ליבה דינמיים מונחי-קולקציה
  // =========================================================================
  const rootFourCards = useMemo(() => {
    return [
      {
        id: 'card_root_personal',
        hebrewIndex: 'א',
        title: collectionConfig.root_1_title,
        badge: collectionConfig.root_1_badge,
        icon: collectionConfig.root_1_icon,
        summaryLine: `${contactPhone || 'ללא נייד'} • ${contactEmail || 'ללא מייל'} • ${(formData.tags || []).length} תגיות`,
        ctaText: 'פתח פרופיל ◀',
        onAction: () => {
          setBabushkaLevel('personal');
          setActiveCardIndex(0);
        },
      },
      {
        id: 'card_root_business',
        hebrewIndex: 'ב',
        title: collectionConfig.root_2_title,
        badge: collectionConfig.root_2_badge,
        icon: collectionConfig.root_2_icon,
        summaryLine: `סה״כ: ₪${(formData.total_spent || formData.kosun_crm_total_spent || 0).toLocaleString('he-IL')} • ${formData.order_count || 0} עסקאות • ${contactCompany || 'עצמאי'}`,
        ctaText: 'פתח כספים ◀',
        onAction: () => {
          setBabushkaLevel('business');
          setActiveCardIndex(0);
        },
      },
      {
        id: 'card_root_communication',
        hebrewIndex: 'ג',
        title: collectionConfig.root_3_title,
        badge: collectionConfig.root_3_badge,
        icon: collectionConfig.root_3_icon,
        summaryLine: `שיחת וואטסאפ ישירה • דיוור מייל • ${formData.form_submissions?.length || 0} הגשות טפסים`,
        ctaText: 'פתח תקשורת ◀',
        onAction: () => {
          setBabushkaLevel('communication');
          setActiveCardIndex(0);
        },
      },
      {
        id: 'card_root_subscriptions',
        hebrewIndex: 'ד',
        title: collectionConfig.root_4_title,
        badge: collectionConfig.root_4_badge,
        icon: collectionConfig.root_4_icon,
        summaryLine: `${(formData.kosun_crm_content_subscriptions || formData.content_subscriptions || []).length} מנויים • סאב-דומיין: ${formData.subdomain || 'ללא'}`,
        ctaText: 'פתח מנויים ◀',
        onAction: () => {
          setBabushkaLevel('subscriptions');
          setActiveCardIndex(0);
        },
      },
    ];
  }, [collectionConfig, contactPhone, contactEmail, contactCompany, formData]);

  // כותרת עומק נוכחית בבבושקה
  const babushkaNavTitle = useMemo(() => {
    switch (babushkaLevel) {
      case 'personal':
        return `${collectionConfig.root_1_title} (פרטי התקשרות ותגיות)`;
      case 'business':
        return `${collectionConfig.root_2_title} (עסקאות, חברה ותשלומים)`;
      case 'communication':
        return `${collectionConfig.root_3_title} (WhatsApp, אימייל וטפסים)`;
      case 'subscriptions':
        return `${collectionConfig.root_4_title} (מנויים וסאב-דומיינים)`;
      default:
        return '4 רצועות בבושקה ממוקדות • בחר כרטיס לפירוט מעמיק';
    }
  }, [babushkaLevel, collectionConfig]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 transition-all duration-300 font-sans"
      dir="rtl"
    >
      <div
        className="w-full max-w-[500px] h-[90vh] max-h-[820px] rounded-3xl p-3.5 sm:p-5 relative shadow-2xl flex flex-col border transition-all overflow-hidden"
        style={{
          fontFamily: styleDef.fontFamily || "'Heebo', sans-serif",
          backgroundColor: modeColors.pageBg,
          borderColor: modeColors.borderColor,
          boxShadow: `0 20px 50px -10px ${modeColors.glowColor || 'rgba(0,0,0,0.5)'}`,
          borderRadius: cardRadius,
        }}
      >
        {/* 1. Header: קומפקטי, מותאם בבושקה עם אווטאר 2 אותיות וכפתורי שיחה/וואטסאפ/שמירה */}
        <div
          className="flex items-center justify-between pb-2.5 mb-2 border-b shrink-0"
          style={{ borderColor: modeColors.borderColor }}
        >
          <div className="flex items-center gap-2 max-w-[65%]">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 shadow-sm border select-none"
              style={{
                backgroundColor: `${brandPrimary}25`,
                color: brandPrimary,
                borderColor: `${brandPrimary}50`,
              }}
              title={contactName}
            >
              {initials}
            </div>

            <div className="truncate text-right">
              <div
                className="text-xs sm:text-sm font-black truncate leading-tight"
                style={{ color: modeColors.textColor }}
              >
                {contactName}
              </div>
              <div
                className="text-[10px] truncate leading-none mt-0.5 font-medium"
                style={{ color: modeColors.secondaryText }}
              >
                {contactCity ? `${contactCity} • ` : ''}
                {contactRole || contactCompany || 'כרטיס לקוח 360'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {contactPhone && (
              <a
                href={telUrl}
                className="p-1.5 rounded-full border transition hover:opacity-80"
                style={{
                  borderColor: modeColors.borderColor,
                  color: brandPrimary,
                  backgroundColor: `${brandPrimary}15`,
                }}
                title="חייג"
              >
                <Icons.Phone className="w-3.5 h-3.5" />
              </a>
            )}

            {contactPhone && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-full border transition hover:opacity-80"
                style={{
                  borderColor: 'rgba(16,185,129,0.3)',
                  color: '#10B981',
                  backgroundColor: 'rgba(16,185,129,0.15)',
                }}
                title="WhatsApp"
              >
                <Icons.MessageCircle className="w-3.5 h-3.5" />
              </a>
            )}

            {/* כפתור שמירה אייקוני */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="p-1.5 rounded-full transition shadow-sm cursor-pointer disabled:opacity-50"
              style={{
                backgroundColor: isDirty ? brandPrimary : `${brandPrimary}20`,
                color: isDirty ? '#000000' : brandPrimary,
              }}
              title={isDirty ? 'שמור שינויים' : 'שמור'}
            >
              <Icons.Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            </button>

            {/* כפתור סגירה */}
            <button
              type="button"
              onClick={handleRequestClose}
              className="p-1.5 rounded-full transition cursor-pointer hover:opacity-75"
              style={{ color: modeColors.secondaryText }}
              title="סגור"
            >
              <Icons.X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. ניווט בבושקה (שורת עומק + כפתור חזרה לשורש) */}
        <div
          className="flex items-center justify-between px-2.5 py-1.5 rounded-xl border mb-2 text-right shrink-0"
          style={{
            backgroundColor: `${brandPrimary}10`,
            borderColor: `${brandPrimary}30`,
          }}
        >
          <div className="flex items-center gap-1.5 truncate">
            {babushkaLevel !== 'root' && (
              <button
                type="button"
                onClick={() => setBabushkaLevel('root')}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black shrink-0 transition"
                style={{
                  backgroundColor: brandPrimary,
                  color: '#000000',
                }}
              >
                <Icons.ArrowRight size={11} />
                <span>חזרה ל-4 הכרטיסים</span>
              </button>
            )}
            <span
              className="text-[10px] sm:text-[11px] font-black truncate"
              style={{ color: modeColors.textColor }}
            >
              {babushkaNavTitle}
            </span>
          </div>

          <span
            className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0"
            style={{
              backgroundColor: `${brandPrimary}25`,
              color: brandPrimary,
            }}
          >
            {babushkaLevel === 'root' ? 'רמה 0 • שורש' : 'רמה 1 • פירוט'}
          </span>
        </div>

        {/* הודעות ואזהרות */}
        {showUnsavedConfirm && (
          <div className="mb-2 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-xs space-y-1.5 animate-fadeIn shrink-0">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <Icons.AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>שים לב: קיימים שינויים שלא נשמרו.</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-2.5 py-1 bg-amber-500 text-black font-black rounded-lg text-[10.5px]"
              >
                שמור וצא
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedConfirm(false);
                  onClose();
                }}
                className="px-2.5 py-1 rounded-lg text-[10.5px] font-semibold border border-white/20 text-white"
              >
                צא ללא שמירה
              </button>
            </div>
          </div>
        )}

        {toastMessage && (
          <div className="mb-2 p-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs text-center font-bold animate-fadeIn shrink-0">
            {toastMessage}
          </div>
        )}

        {/* 3. תוכן הבבושקה הדינמי */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-0.5 space-y-2">
          {/* ================================================================= */}
          {/* רמה 0: 4 רצועות בבושקה עיקריות (א, ב, ג, ד) עם שורת סיכום תמציתית */}
          {/* ================================================================= */}
          {babushkaLevel === 'root' && (
            <div className="h-full flex flex-col justify-between gap-2">
              {rootFourCards.map((card, idx) => {
                const IconComp = (Icons as any)[card.icon] || Icons.Sparkles;
                const isSelected = activeCardIndex === idx;

                return (
                  <div
                    key={card.id}
                    onClick={() => {
                      setActiveCardIndex(idx);
                      card.onAction();
                    }}
                    className="relative w-full overflow-hidden border transition-all duration-300 cursor-pointer group shadow-lg flex flex-col justify-between p-3 flex-1 rounded-2xl"
                    style={{
                      minHeight: '85px',
                      borderRadius: cardRadius,
                      borderColor: isSelected ? brandPrimary : modeColors.borderColor,
                      background: modeColors.cardBg,
                      boxShadow: isSelected
                        ? `0 6px 20px -6px ${modeColors.glowColor}`
                        : undefined,
                    }}
                  >
                    <div className="relative z-10 flex items-center justify-between gap-2 my-auto">
                      <div className="flex items-center gap-2.5 flex-1 overflow-hidden">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-md transition-transform group-hover:scale-110"
                          style={{
                            backgroundColor: isSelected ? brandPrimary : `${brandPrimary}20`,
                            borderColor: brandPrimary,
                            color: isSelected ? '#000000' : brandPrimary,
                          }}
                        >
                          <span className="font-black text-xs">{card.hebrewIndex}</span>
                        </div>

                        <div className="flex flex-col text-right overflow-hidden">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span
                              className="font-black text-xs sm:text-[13px] truncate"
                              style={{ color: modeColors.textColor }}
                            >
                              {card.title}
                            </span>
                            <span
                              className="px-1.5 py-0.5 rounded text-[8px] font-bold border shrink-0"
                              style={{
                                backgroundColor: `${brandPrimary}20`,
                                borderColor: `${brandPrimary}40`,
                                color: brandPrimary,
                              }}
                            >
                              {card.badge}
                            </span>
                          </div>

                          <p
                            className="text-[10px] line-clamp-1 font-medium leading-tight"
                            style={{ color: modeColors.secondaryText }}
                          >
                            {card.summaryLine}
                          </p>
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-1 shrink-0 px-2.5 py-1.5 rounded-xl font-black text-[9.5px] transition-transform group-hover:-translate-x-1"
                        style={{
                          backgroundColor: isSelected ? brandPrimary : `${brandPrimary}18`,
                          color: isSelected ? '#000000' : brandPrimary,
                        }}
                      >
                        <IconComp size={12} className="hidden sm:inline" />
                        <span>{card.ctaText}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ================================================================= */}
          {/* רמה 1: בבושקה פנימית – פרופיל אישי וקשר */}
          {/* ================================================================= */}
          {babushkaLevel === 'personal' && (
            <div className="space-y-2 animate-fadeIn">
              {/* א. פרטים כלליים */}
              <div
                className="w-full flex flex-col rounded-2xl border overflow-hidden transition-all"
                style={{
                  backgroundColor: modeColors.cardBg,
                  borderColor: modeColors.borderColor,
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleSection('details')}
                  className="w-full h-11 px-3 flex items-center justify-between font-bold text-xs cursor-pointer"
                  style={{ color: modeColors.textColor }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${brandPrimary}20`, color: brandPrimary }}
                    >
                      <Icons.User className="w-3.5 h-3.5" />
                    </div>
                    <span>פרטים אישיים וטלפונים</span>
                  </div>
                  <Icons.ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      openSections['details'] ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openSections['details'] && (
                  <div
                    className="p-3 border-t space-y-2 text-xs"
                    style={{ borderColor: modeColors.borderColor }}
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold block" style={{ color: brandPrimary }}>
                        שם מלא
                      </label>
                      <input
                        type="text"
                        value={formData.kosun_crm_name || formData.conta_name || ''}
                        onChange={(e) => {
                          handleFieldChange('kosun_crm_name', e.target.value);
                          handleFieldChange('conta_name', e.target.value);
                        }}
                        className="w-full border rounded-xl p-2 font-semibold bg-transparent focus:outline-none"
                        style={{
                          borderColor: modeColors.borderColor,
                          color: modeColors.textColor,
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold block" style={{ color: brandPrimary }}>
                          טלפון נייד
                        </label>
                        <input
                          type="text"
                          value={formData.kosun_crm_phone || formData.conta_phone || ''}
                          onChange={(e) => {
                            handleFieldChange('kosun_crm_phone', e.target.value);
                            handleFieldChange('conta_phone', e.target.value);
                          }}
                          className="w-full border rounded-xl p-2 font-mono bg-transparent focus:outline-none"
                          style={{
                            borderColor: modeColors.borderColor,
                            color: modeColors.textColor,
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold block" style={{ color: brandPrimary }}>
                          אימייל
                        </label>
                        <input
                          type="email"
                          value={formData.kosun_crm_email || formData.email || ''}
                          onChange={(e) => {
                            handleFieldChange('kosun_crm_email', e.target.value);
                            handleFieldChange('email', e.target.value);
                          }}
                          className="w-full border rounded-xl p-2 font-mono bg-transparent focus:outline-none"
                          style={{
                            borderColor: modeColors.borderColor,
                            color: modeColors.textColor,
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold block" style={{ color: brandPrimary }}>
                          עיר
                        </label>
                        <input
                          type="text"
                          value={formData.kosun_crm_city || formData.mh_crm_city || ''}
                          onChange={(e) => {
                            handleFieldChange('kosun_crm_city', e.target.value);
                            handleFieldChange('mh_crm_city', e.target.value);
                          }}
                          className="w-full border rounded-xl p-2 bg-transparent focus:outline-none"
                          style={{
                            borderColor: modeColors.borderColor,
                            color: modeColors.textColor,
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold block" style={{ color: brandPrimary }}>
                          ת.ז / ח.פ
                        </label>
                        <input
                          type="text"
                          value={formData.kosun_crm_gov_id || formData.tg1 || formData.tz || ''}
                          onChange={(e) => {
                            handleFieldChange('kosun_crm_gov_id', e.target.value);
                            handleFieldChange('tg1', e.target.value);
                          }}
                          className="w-full border rounded-xl p-2 font-mono bg-transparent focus:outline-none"
                          style={{
                            borderColor: modeColors.borderColor,
                            color: modeColors.textColor,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ב. תיוגים וקהילות */}
              <div
                className="w-full flex flex-col rounded-2xl border overflow-hidden transition-all"
                style={{
                  backgroundColor: modeColors.cardBg,
                  borderColor: modeColors.borderColor,
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleSection('tags')}
                  className="w-full h-11 px-3 flex items-center justify-between font-bold text-xs cursor-pointer"
                  style={{ color: modeColors.textColor }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${brandPrimary}20`, color: brandPrimary }}
                    >
                      <Icons.Tag className="w-3.5 h-3.5" />
                    </div>
                    <span>תיוגים וקהילות</span>
                  </div>
                  <Icons.ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      openSections['tags'] ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openSections['tags'] && (
                  <div
                    className="p-3 border-t space-y-2 text-xs"
                    style={{ borderColor: modeColors.borderColor }}
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold block" style={{ color: brandPrimary }}>
                        תגיות
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {(formData.tags || formData.kosun_crm_tags || []).map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-lg border text-[11px] font-bold"
                            style={{
                              backgroundColor: `${brandPrimary}15`,
                              borderColor: `${brandPrimary}40`,
                              color: brandPrimary,
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold block" style={{ color: brandPrimary }}>
                        קהילה משויכת
                      </label>
                      <input
                        type="text"
                        value={formData.community || formData.kosun_crm_community || ''}
                        onChange={(e) => {
                          handleFieldChange('community', e.target.value);
                          handleFieldChange('kosun_crm_community', e.target.value);
                        }}
                        className="w-full border rounded-xl p-2 bg-transparent focus:outline-none"
                        style={{
                          borderColor: modeColors.borderColor,
                          color: modeColors.textColor,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* רמה 1: בבושקה פנימית – פעילות עסקית וכספית */}
          {/* ================================================================= */}
          {babushkaLevel === 'business' && (
            <div className="space-y-2 animate-fadeIn">
              {/* א. חברה ותפקיד */}
              <div
                className="w-full flex flex-col rounded-2xl border overflow-hidden transition-all"
                style={{
                  backgroundColor: modeColors.cardBg,
                  borderColor: modeColors.borderColor,
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleSection('company')}
                  className="w-full h-11 px-3 flex items-center justify-between font-bold text-xs cursor-pointer"
                  style={{ color: modeColors.textColor }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${brandPrimary}20`, color: brandPrimary }}
                    >
                      <Icons.Building className="w-3.5 h-3.5" />
                    </div>
                    <span>פרטי ארגון ותפקיד</span>
                  </div>
                  <Icons.ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      openSections['company'] ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openSections['company'] && (
                  <div
                    className="p-3 border-t space-y-2 text-xs"
                    style={{ borderColor: modeColors.borderColor }}
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold block" style={{ color: brandPrimary }}>
                        שם חברה
                      </label>
                      <input
                        type="text"
                        value={formData.company_name || formData.kosun_crm_company || ''}
                        onChange={(e) => {
                          handleFieldChange('company_name', e.target.value);
                          handleFieldChange('kosun_crm_company', e.target.value);
                        }}
                        className="w-full border rounded-xl p-2 bg-transparent focus:outline-none"
                        style={{
                          borderColor: modeColors.borderColor,
                          color: modeColors.textColor,
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold block" style={{ color: brandPrimary }}>
                          תפקיד
                        </label>
                        <input
                          type="text"
                          value={formData.job_title || formData.kosun_crm_role || ''}
                          onChange={(e) => {
                            handleFieldChange('job_title', e.target.value);
                            handleFieldChange('kosun_crm_role', e.target.value);
                          }}
                          className="w-full border rounded-xl p-2 bg-transparent focus:outline-none"
                          style={{
                            borderColor: modeColors.borderColor,
                            color: modeColors.textColor,
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold block" style={{ color: brandPrimary }}>
                          מקור הגעה
                        </label>
                        <input
                          type="text"
                          value={formData.lead_source || formData.kosun_crm_source || ''}
                          onChange={(e) => {
                            handleFieldChange('lead_source', e.target.value);
                            handleFieldChange('kosun_crm_source', e.target.value);
                          }}
                          className="w-full border rounded-xl p-2 bg-transparent focus:outline-none"
                          style={{
                            borderColor: modeColors.borderColor,
                            color: modeColors.textColor,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ב. תשלומים ועסקאות */}
              <div
                className="w-full flex flex-col rounded-2xl border overflow-hidden transition-all"
                style={{
                  backgroundColor: modeColors.cardBg,
                  borderColor: modeColors.borderColor,
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleSection('payments')}
                  className="w-full h-11 px-3 flex items-center justify-between font-bold text-xs cursor-pointer"
                  style={{ color: modeColors.textColor }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${brandPrimary}20`, color: brandPrimary }}
                    >
                      <Icons.CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <span>תשלומים ועסקאות (קשר)</span>
                  </div>
                  <Icons.ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      openSections['payments'] ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openSections['payments'] && (
                  <div
                    className="p-3 border-t space-y-2 text-xs"
                    style={{ borderColor: modeColors.borderColor }}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div
                        className="p-2.5 rounded-xl border text-center"
                        style={{
                          backgroundColor: `${brandPrimary}10`,
                          borderColor: `${brandPrimary}30`,
                        }}
                      >
                        <span className="text-[10px] block font-bold" style={{ color: brandPrimary }}>
                          סה״כ רכישות
                        </span>
                        <span
                          className="text-base font-black mt-0.5 block font-mono"
                          style={{ color: modeColors.textColor }}
                        >
                          ₪{(formData.total_spent || formData.kosun_crm_total_spent || 0).toLocaleString('he-IL')}
                        </span>
                      </div>
                      <div
                        className="p-2.5 rounded-xl border text-center"
                        style={{
                          backgroundColor: `${brandPrimary}10`,
                          borderColor: `${brandPrimary}30`,
                        }}
                      >
                        <span className="text-[10px] block font-bold" style={{ color: brandPrimary }}>
                          עסקאות
                        </span>
                        <span
                          className="text-base font-black mt-0.5 block font-mono"
                          style={{ color: modeColors.textColor }}
                        >
                          {formData.order_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* רמה 1: בבושקה פנימית – תקשורת ומעורבות */}
          {/* ================================================================= */}
          {babushkaLevel === 'communication' && (
            <div className="space-y-2 animate-fadeIn">
              <div
                className="w-full flex flex-col rounded-2xl border overflow-hidden transition-all"
                style={{
                  backgroundColor: modeColors.cardBg,
                  borderColor: modeColors.borderColor,
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleSection('whatsapp')}
                  className="w-full h-11 px-3 flex items-center justify-between font-bold text-xs cursor-pointer"
                  style={{ color: modeColors.textColor }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-emerald-400 bg-emerald-500/20"
                    >
                      <Icons.MessageCircle className="w-3.5 h-3.5" />
                    </div>
                    <span>שיחות ו-WhatsApp ישיר</span>
                  </div>
                  <Icons.ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      openSections['whatsapp'] ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openSections['whatsapp'] && (
                  <div
                    className="p-3 border-t space-y-2 text-xs"
                    style={{ borderColor: modeColors.borderColor }}
                  >
                    <ContactWhatsAppTab formData={formData} />
                  </div>
                )}
              </div>

              {/* הגשות טפסים */}
              <div
                className="w-full flex flex-col rounded-2xl border overflow-hidden transition-all"
                style={{
                  backgroundColor: modeColors.cardBg,
                  borderColor: modeColors.borderColor,
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleSection('forms')}
                  className="w-full h-11 px-3 flex items-center justify-between font-bold text-xs cursor-pointer"
                  style={{ color: modeColors.textColor }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${brandPrimary}20`, color: brandPrimary }}
                    >
                      <Icons.FileText className="w-3.5 h-3.5" />
                    </div>
                    <span>הגשות טפסים חכמים</span>
                  </div>
                  <Icons.ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      openSections['forms'] ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openSections['forms'] && (
                  <div
                    className="p-3 border-t space-y-2 text-xs"
                    style={{ borderColor: modeColors.borderColor }}
                  >
                    {formData.last_form_name ? (
                      <div className="p-2 rounded-xl border border-white/10">
                        <span className="font-bold block">{formData.last_form_name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {formData.last_form_submission_date}
                        </span>
                      </div>
                    ) : (
                      <span className="text-zinc-500 text-xs">אין הגשות טפסים מתועדות</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* רמה 1: בבושקה פנימית – מנויים וניהול מערכת */}
          {/* ================================================================= */}
          {babushkaLevel === 'subscriptions' && (
            <div className="space-y-2 animate-fadeIn">
              {/* מנויי תוכן */}
              {isKosSubscribedActive && (
                <div
                  className="w-full flex flex-col rounded-2xl border overflow-hidden transition-all"
                  style={{
                    backgroundColor: modeColors.cardBg,
                    borderColor: modeColors.borderColor,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleSection('content_subscriptions')}
                    className="w-full h-11 px-3 flex items-center justify-between font-bold text-xs cursor-pointer"
                    style={{ color: modeColors.textColor }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${brandPrimary}20`, color: brandPrimary }}
                      >
                        <Icons.Package className="w-3.5 h-3.5" />
                      </div>
                      <span>מנויי תוכן וחבילות (KosSubscribed)</span>
                    </div>
                    <Icons.ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        openSections['content_subscriptions'] ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {openSections['content_subscriptions'] && (
                    <div
                      className="p-3 border-t space-y-2 text-xs"
                      style={{ borderColor: modeColors.borderColor }}
                    >
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

              {/* סאב-דומיין וטננט */}
              <div
                className="w-full flex flex-col rounded-2xl border overflow-hidden transition-all"
                style={{
                  backgroundColor: modeColors.cardBg,
                  borderColor: modeColors.borderColor,
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleSection('subdomain')}
                  className="w-full h-11 px-3 flex items-center justify-between font-bold text-xs cursor-pointer"
                  style={{ color: modeColors.textColor }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-amber-400 bg-amber-500/20"
                    >
                      <Icons.Globe className="w-3.5 h-3.5" />
                    </div>
                    <span>ניהול סאב-דומיין ומודולים</span>
                  </div>
                  <Icons.ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      openSections['subdomain'] ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openSections['subdomain'] && (
                  <div
                    className="p-3 border-t space-y-2 text-xs"
                    style={{ borderColor: modeColors.borderColor }}
                  >
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
          )}
        </div>
      </div>
    </div>
  );
};
