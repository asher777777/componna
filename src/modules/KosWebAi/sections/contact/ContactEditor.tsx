import React, { useState, useEffect, useMemo } from 'react';
import {
  ContactSectionConfig,
  ContactLayoutPreset,
  HeroTextBgEffect,
} from '../../types/sectionConfigs';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { PageBuilderColorPicker } from '../../ui/PageBuilderColorPicker';
import { PageBuilderImageUpload } from '../../ui/PageBuilderImageUpload';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../../core/contracts';
import { ContactFormConfigEditor, DEFAULT_CONTACT_FORM_CONFIG } from './ContactFormConfigEditor';
import {
  Save,
  X,
  ChevronDown,
  Sparkles,
  Palette,
  LayoutTemplate,
  Type,
  CheckCircle2,
  Heart,
  Shield,
  Sun,
  Crosshair,
  Activity,
  Layers,
  Wand2,
  Info,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Sliders,
  FormInput,
  Clock,
  Globe,
} from 'lucide-react';

export type ContactEditorAccordionSection =
  | 'layouts'
  | 'text_bg'
  | 'content'
  | 'form'
  | 'colors';

interface ContactLayoutDefinition {
  id: ContactLayoutPreset;
  letter: string;
  shortLabel: string;
  title: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
  objectSizingDesc: string;
  buttonStyleDesc: string;
  colorPaletteDesc: string;
  cardStyleDesc: string;
  swatches: string[];
}

export const CONTACT_LAYOUT_DEFINITIONS: ContactLayoutDefinition[] = [
  {
    id: 'feminine',
    letter: 'א',
    shortLabel: 'סגנון נשי',
    title: 'א. פריסה בסגנון נשי (רכה, אלגנטית ומזמינה)',
    subtitle: 'קווים עגולים וזורמים, פלטת רוז-גולד ושמנת, כרטיסי קפסולה רכים ושדות מעוגלים',
    icon: Heart,
    objectSizingDesc: 'טיפוגרפיה אוורירית ומעודנת, ריווחים נדיבים וכרטיסי פרטי קשר מעוגלים עמוק (Radius 2.5rem)',
    buttonStyleDesc: 'כפתורי קפסולה עגולים מלאים (Rounded Full) בגרדיאנט ורוד-רוז רך עם ברק עדין',
    colorPaletteDesc: 'ורוד פודרה, שמנת חמה, רוז-גולד, שמפניה ומסגרות פסטל מעודנות',
    cardStyleDesc: 'כרטיסים רכים עם אייקונים עגולים, טקסט בהיר וטופס יצירת קשר מזמין ופסטורלי',
    swatches: ['#f43f5e', '#fb7185', '#fde68a', '#fff1f2'],
  },
  {
    id: 'masculine',
    letter: 'ב',
    shortLabel: 'סגנון גברי',
    title: 'ב. פריסה בסגנון גברי (עוצמתית, דומיננטית וטקטית)',
    subtitle: 'כותרות ענק מודגשות, פחם כהה, זהב מתכתי, כרטיסי פלדה ושדות מסיביים',
    icon: Shield,
    objectSizingDesc: 'כותרות ענק דרמטיות (Font Black), נוכחות חזקה וגבולות פלדה כפולים מודגשים',
    buttonStyleDesc: 'כפתורים רחבים וגדולים מסותתים (Rounded LG) עם גבול כפול מודגש בזהב מתכתי',
    colorPaletteDesc: 'שחור-אוניקס, אפור פחם, זהב-ענבר מתכתי, כחול פלדה ואלמנטים טקטיים',
    cardStyleDesc: 'כרטיסי פלדה כהים עם מסגרות 2px מוארות בזהב, קלט כבד וסמכותי',
    swatches: ['#090a0f', '#f59e0b', '#27272a', '#3b82f6'],
  },
  {
    id: 'standard',
    letter: 'ג',
    shortLabel: 'פריסה עכשווית',
    title: 'ג. הפריסה העכשווית (מה שכרגע נמצא)',
    subtitle: 'סגנון Notion SaaS 2026 נקי ומאוזן של טופס יצירת קשר וכרטיסי פרטים',
    icon: LayoutTemplate,
    objectSizingDesc: 'כותרת ותת-כותרת מאוזנות וממורכזות, שורות קלט נקיות וכרטיסי פרטי התקשרות נפרדים',
    buttonStyleDesc: 'כפתורים מעוגלים מודרניים (Rounded XL) באינדיגו ואמרלד עם צל רך',
    colorPaletteDesc: 'אינדיגו מודרני, אמרלד, לבן, סלייט וניגודיות שקופה אלגנטית',
    cardStyleDesc: 'כרטיסי Notion/SaaS נקיים עם אייקונים ייעודיים לכל אפיק התקשרות וטופס מאובטח',
    swatches: ['#6366f1', '#10b981', '#0f172a', '#f8fafc'],
  },
  {
    id: 'spiritual',
    letter: 'ד',
    shortLabel: 'פריסה רוחנית',
    title: 'ד. פריסה רוחנית (הרמונית, שלווה ומחוברת)',
    subtitle: 'סימטריה מרגיעה, ירוק מרווה, טורקיז עמוק, זהב הילה ומרחב פנייה מזמין',
    icon: Sun,
    objectSizingDesc: 'מרווחי נשימה עמוקים, טיפוגרפיה רגועה ואובייקטים זורמים ללא עומס',
    buttonStyleDesc: 'כפתורי לוטוס הרמוניים עם שקיפות זכוכית ומעברי צבע איטיים ושלווים (duration-700)',
    colorPaletteDesc: 'ירוק מרווה (Sage), טורקיז עמוק, חול מדברי וזהב הילה זוהר בעדינות',
    cardStyleDesc: 'כרטיסי לוטוס הרמוניים עם מסגרת טורקיז מעודנת והילה עוטפת',
    swatches: ['#0f766e', '#10b981', '#fbbf24', '#faf8f5'],
  },
  {
    id: 'sharp',
    letter: 'ה',
    shortLabel: 'פריסה חדה',
    title: 'ה. פריסה חדה (ברוטליסטית, טכנית ומדויקת)',
    subtitle: 'זוויות ישרות 90° ללא עיגול, מסגרות 2px שחור/לבן וצללים קשים מוסטים',
    icon: Crosshair,
    objectSizingDesc: 'אובייקטים גיאומטריים חדים (0px Radius), שדות קלט מלבניים וטיפוגרפיה חותכת',
    buttonStyleDesc: 'כפתורים מלבניים חדים (Rounded None) עם צל קשיח מוסט ואפקט הזזה בלחיצה',
    colorPaletteDesc: 'שחור ולבן בניגודיות מקסימלית עם הדגשות אינדיגו חשמלי וטקסט חותך',
    cardStyleDesc: 'כרטיסים ממוסגרים ב-2px עם צל מוסט קשיח באינדיגו/סלייט ותוויות חדות',
    swatches: ['#050505', '#ffffff', '#6366f1', '#e2e8f0'],
  },
  {
    id: 'analytical',
    letter: 'ו',
    shortLabel: 'פריסה אנליטית',
    title: 'ו. פריסה אנליטית (מבוססת נתונים וזמן תגובה SLA)',
    subtitle: 'מסוף טלמטריה טכנולוגי, חיווי זמינות מענה חי, ציאן-כחול ותגיות דיוק',
    icon: Activity,
    objectSizingDesc: 'קומפוזיציית דשבורד מהודקת, תגיות זמני מענה (SLA), מדדי שירות וגריד נתונים',
    buttonStyleDesc: 'כפתורים טכנולוגיים מהודקים (Rounded XL) בגרדיאנט ציאן-כחול עם חיווי סליקה/פנייה חי',
    colorPaletteDesc: 'כחול-צי עמוק, ציאן טלמטריה, ירוק אמרלד של זמינות ורשת נקודות טכנית',
    cardStyleDesc: 'כרטיסי קשר עם חיווי זמינות חי (Online / HUD), מסגרות ציאן דקות ופילטרים',
    swatches: ['#06b6d4', '#2563eb', '#10b981', '#050b14'],
  },
];

export interface ContactEditorProps {
  config: ContactSectionConfig;
  onChange: (updated: ContactSectionConfig) => void;
  onClose?: () => void;
}

export const ContactEditor: React.FC<ContactEditorProps> = ({
  config,
  onChange,
  onClose,
}) => {
  const { getCapability } = useHostCapabilities();
  const brandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;

  // Local state mirroring CRM Contact360Modal & PageSettingsDrawer
  const [formData, setFormData] = useState<ContactSectionConfig>({ ...config });
  const [initialData, setInitialData] = useState<ContactSectionConfig>({ ...config });

  // Accordion state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [hoveredLayoutId, setHoveredLayoutId] = useState<ContactLayoutPreset | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBrandSynced, setIsBrandSynced] = useState(false);

  // Dynamic Light / Dark mode sync from document element
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  useEffect(() => {
    setFormData({ ...config });
  }, [config]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleSection = (section: ContactEditorAccordionSection) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateField = <K extends keyof ContactSectionConfig>(
    key: K,
    value: ContactSectionConfig[K]
  ) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onChange(updated);
  };

  const updatePatch = (patch: Partial<ContactSectionConfig>) => {
    const updated = { ...formData, ...patch };
    setFormData(updated);
    onChange(updated);
  };

  const handleSelectLayout = (layoutDef: ContactLayoutDefinition) => {
    updatePatch({
      layout: layoutDef.id,
      objectScale: 'auto',
      buttonShape: 'auto',
      buttonSize: 'auto',
    });
    showNotification(`הוחלה ${layoutDef.title}`);
  };

  const handleSave = (closeAfter = false) => {
    setIsSaving(true);
    try {
      onChange(formData);
      setInitialData({ ...formData });
      setShowUnsavedConfirm(false);
      showNotification('הגדרות אזור צור קשר נשמרו בהצלחה');
      if (closeAfter && onClose) {
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestClose = () => {
    if (!onClose) return;
    if (isDirty) {
      setShowUnsavedConfirm(true);
    } else {
      onClose();
    }
  };

  const handleSyncBrandDna = () => {
    if (!brandDna) {
      showNotification('לא נמצאו נתוני מיתוג ב-Brand DNA');
      return;
    }
    const companyName = brandDna.identity?.companyName || '';
    const phone = brandDna.trust?.contactPhone || '';
    const email = brandDna.trust?.contactEmail || '';
    const address = brandDna.trust?.officeAddress || '';
    const whatsapp = brandDna.trust?.whatsappSupportNumber || '';

    const updated: ContactSectionConfig = {
      ...formData,
      title: companyName ? `צרו קשר עם ${companyName}` : formData.title,
      subtitle: companyName
        ? `נשמח לעמוד לשירותכם לכל שאלה, פנייה או התייעצות מקצועית`
        : formData.subtitle,
      phone: phone || formData.phone,
      email: email || formData.email,
      address: address || formData.address,
      whatsapp: whatsapp || formData.whatsapp,
    };
    setFormData(updated);
    onChange(updated);
    setIsBrandSynced(true);
    showNotification('פרטי יצירת הקשר סונכרנו עם נתוני ה-Brand DNA');
    setTimeout(() => setIsBrandSynced(false), 2500);
  };

  const normalizedActiveLayout: ContactLayoutPreset =
    !formData.layout ||
    formData.layout === 'current' ||
    formData.layout === 'standard' ||
    formData.layout === 'split-cards' ||
    formData.layout === 'minimal'
      ? 'standard'
      : formData.layout;

  const activeLayoutDef =
    CONTACT_LAYOUT_DEFINITIONS.find((d) => d.id === normalizedActiveLayout) ||
    CONTACT_LAYOUT_DEFINITIONS[2];

  const tooltipLayoutDef =
    CONTACT_LAYOUT_DEFINITIONS.find((d) => d.id === hoveredLayoutId) || null;

  const isFormEnabled = formData.showForm ?? true;

  return (
    <div
      className={`w-full rounded-3xl sm:rounded-[2.5rem] p-3.5 sm:p-5 relative shadow-2xl flex flex-col no-scrollbar border transition-colors font-sans text-right ${
        isDarkMode
          ? 'bg-[#0a0a0a] border-white/10 text-white'
          : 'bg-white border-slate-200 text-slate-900 shadow-xl'
      }`}
      style={{ fontFamily: "'Heebo', sans-serif" }}
      dir="rtl"
    >
      {/* 1. Header: Compact with Two-Letter Avatar Icon (CT), Title, Brand DNA Sync, Save Icon, and Optional Close */}
      <div
        className={`flex items-center justify-between pb-2.5 mb-2.5 border-b shrink-0 ${
          isDarkMode ? 'border-white/10' : 'border-slate-100'
        }`}
      >
        {/* Right: Connected Two-Letter Avatar Icon (CT) + Title */}
        <div className="flex items-center gap-2 max-w-[70%]">
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black shrink-0 shadow-sm border select-none ${
              isDarkMode
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}
            title="Contact Section Editor"
          >
            CT
          </div>

          <div className="truncate">
            <div
              className={`text-xs sm:text-sm font-black truncate leading-tight ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}
            >
              עיצוב והגדרות אזור צור קשר (Contact)
            </div>
            <div
              className={`text-[10px] truncate leading-none mt-0.5 ${
                isDarkMode ? 'text-zinc-400' : 'text-slate-500'
              }`}
            >
              {activeLayoutDef.title}
            </div>
          </div>
        </div>

        {/* Left: Quick Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleSyncBrandDna}
            className={`p-1.5 rounded-full border transition hover:opacity-80 cursor-pointer ${
              isBrandSynced
                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                : isDarkMode
                  ? 'border-indigo-900 text-indigo-400 bg-indigo-950/30'
                  : 'border-indigo-200 text-indigo-600 bg-indigo-50/50'
            }`}
            title="סנכרן מ-Brand DNA"
          >
            {isBrandSynced ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className={`p-1.5 rounded-full transition shadow-sm cursor-pointer disabled:opacity-50 ${
              isDirty
                ? 'bg-amber-500 hover:bg-amber-400 text-black ring-2 ring-amber-400/50 animate-pulse'
                : isDarkMode
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title={isDirty ? 'שמור שינויים שלא נשמרו' : 'שמור'}
          >
            <Save className="w-3.5 h-3.5" />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={handleRequestClose}
              className={`p-1.5 rounded-full transition cursor-pointer ${
                isDarkMode
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="סגור"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Unsaved Changes Confirmation Banner */}
      {showUnsavedConfirm && (
        <div
          className={`mb-2.5 p-3 rounded-2xl border flex flex-col gap-2 animate-fadeIn ${
            isDarkMode
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}
        >
          <div className="text-xs font-bold">יש שינויים שלא נשמרו. מה ברצונך לעשות?</div>
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition cursor-pointer"
            >
              שמור וסגור
            </button>
            <button
              type="button"
              onClick={() => {
                setShowUnsavedConfirm(false);
                if (onClose) onClose();
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                isDarkMode
                  ? 'bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/50'
                  : 'bg-red-100 hover:bg-red-200 text-red-700'
              }`}
            >
              צא ללא שמירה
            </button>
            <button
              type="button"
              onClick={() => setShowUnsavedConfirm(false)}
              className="px-2.5 py-1 rounded-xl text-xs opacity-70 hover:opacity-100 transition cursor-pointer"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* 2. Icon Menu with Rich Tooltip for the 6 Contact Layouts ("תפריט אייקון עם טולטיפ") */}
      <div
        className={`p-2.5 mb-2.5 rounded-2xl border relative transition-all ${
          isDarkMode ? 'bg-[#141414] border-white/5' : 'bg-slate-50/80 border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
            <Wand2 className="w-3 h-3" />
            <span>תפריט אייקונים לבחירת סגנון פריסה (רחף מעל אייקון לפירוט)</span>
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isDarkMode
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}
          >
            פעיל: {activeLayoutDef.letter}. {activeLayoutDef.shortLabel}
          </span>
        </div>

        {/* 6 Icons Row */}
        <div className="grid grid-cols-6 gap-1.5">
          {CONTACT_LAYOUT_DEFINITIONS.map((def) => {
            const IconComp = def.icon;
            const isSelected = normalizedActiveLayout === def.id;
            return (
              <div
                key={def.id}
                className="relative flex flex-col items-center"
                onMouseEnter={() => setHoveredLayoutId(def.id)}
                onMouseLeave={() => setHoveredLayoutId((prev) => (prev === def.id ? null : prev))}
              >
                <button
                  type="button"
                  onClick={() => handleSelectLayout(def)}
                  onFocus={() => setHoveredLayoutId(def.id)}
                  onBlur={() => setHoveredLayoutId(null)}
                  aria-label={def.title}
                  className={`w-full py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-md ring-1 ring-amber-500/40'
                      : isDarkMode
                        ? 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-black opacity-75">{def.letter}.</span>
                    <IconComp className="w-4 h-4 shrink-0" />
                  </div>
                  <span className="text-[10px] font-bold truncate max-w-full">{def.shortLabel}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Rich Interactive Tooltip Panel on Hover / Focus */}
        {tooltipLayoutDef && (
          <div
            className={`mt-2 p-3 rounded-xl border text-xs space-y-1.5 animate-fadeIn shadow-xl ${
              isDarkMode
                ? 'bg-[#0d0d0d] border-amber-500/40 text-zinc-200'
                : 'bg-white border-amber-400 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-1.5 border-amber-500/20">
              <span className="font-black text-amber-400 text-xs">{tooltipLayoutDef.title}</span>
              <div className="flex items-center gap-1">
                {tooltipLayoutDef.swatches.map((hex, idx) => (
                  <span
                    key={idx}
                    className="w-3 h-3 rounded-full border border-white/20 inline-block"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] leading-snug pt-0.5">
              <div>
                <strong className="text-amber-500">גודל אובייקטים: </strong>
                <span>{tooltipLayoutDef.objectSizingDesc}</span>
              </div>
              <div>
                <strong className="text-amber-500">צורת כפתורים: </strong>
                <span>{tooltipLayoutDef.buttonStyleDesc}</span>
              </div>
              <div>
                <strong className="text-amber-500">פלטת צבעים: </strong>
                <span>{tooltipLayoutDef.colorPaletteDesc}</span>
              </div>
              <div>
                <strong className="text-amber-500">סגנון כרטיסים: </strong>
                <span>{tooltipLayoutDef.cardStyleDesc}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Toast Notification */}
      {toastMessage && (
        <div className="mb-2.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 4. Active Layout Details Card */}
      <div
        className={`p-3 mb-2.5 rounded-2xl border text-xs space-y-2 ${
          isDarkMode ? 'bg-[#121212] border-white/5' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <div className="font-black text-xs text-amber-400 flex items-center gap-1.5">
              <span>{activeLayoutDef.title}</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-tight">{activeLayoutDef.subtitle}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0 pt-0.5">
            {activeLayoutDef.swatches.map((hex, idx) => (
              <span
                key={idx}
                className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5 text-[11px] text-zinc-400">
          <div>
            <span className="text-zinc-500 font-medium">כפתורים: </span>
            <span className="text-zinc-300 font-bold">
              {formData.buttonShape && formData.buttonShape !== 'auto'
                ? formData.buttonShape
                : 'סגנון פריסה אוטומטי'}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 font-medium">קנה מידה: </span>
            <span className="text-zinc-300 font-bold">
              {formData.objectScale && formData.objectScale !== 'auto'
                ? formData.objectScale
                : 'אוטומטי לפי פריסה'}
            </span>
          </div>
        </div>
      </div>

      {/* Accordion Sections Container (PageSettingsDrawer / Contact360Modal Style) */}
      <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar pr-0.5">
        {/* SECTION 1: Layout & Sizing */}
        <div
          className={`rounded-2xl border transition-all overflow-hidden ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('layouts')}
            className={`w-full h-10 px-3 flex items-center justify-between text-xs font-bold transition cursor-pointer ${
              isDarkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-700'
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
              </div>
              <span>1. בחירת פריסה ועיצוב כללי</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openSections.layouts ? 'rotate-180 text-amber-400' : 'opacity-60'
              }`}
            />
          </button>

          {openSections.layouts && (
            <div
              className={`p-3 border-t space-y-3 animate-fadeIn text-xs ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}
            >
              {/* Layout Presets Selection List */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-amber-500 block">
                  סגנון פריסה לאזור צור קשר:
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {CONTACT_LAYOUT_DEFINITIONS.map((def) => {
                    const isSelected = normalizedActiveLayout === def.id;
                    const IconComp = def.icon;
                    return (
                      <button
                        key={def.id}
                        type="button"
                        onClick={() => handleSelectLayout(def)}
                        className={`p-2.5 rounded-xl border text-right transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/80 text-white shadow-sm ring-1 ring-amber-500/30'
                            : isDarkMode
                              ? 'bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-amber-500 text-black font-black'
                                : isDarkMode
                                  ? 'bg-white/10 text-zinc-300'
                                  : 'bg-white text-slate-700'
                            }`}
                          >
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs">{def.title}</div>
                            <div className="text-[10px] text-zinc-400">{def.subtitle}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 mr-2">
                          {def.swatches.map((hex, i) => (
                            <span
                              key={i}
                              className="w-2.5 h-2.5 rounded-full inline-block border border-white/20"
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sizing & Buttons Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/5">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                    גודל אובייקטים וטקסט
                  </label>
                  <select
                    value={formData.objectScale || 'auto'}
                    onChange={(e) =>
                      updateField('objectScale', e.target.value as ContactSectionConfig['objectScale'])
                    }
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode
                        ? 'bg-transparent border-amber-500/60 text-white'
                        : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  >
                    <option value="auto">אוטומטי (לפי הפריסה)</option>
                    <option value="compact">קומפקטי (Compact)</option>
                    <option value="normal">רגיל (Normal)</option>
                    <option value="large">גדול (Large)</option>
                    <option value="massive">מסיבי (Massive)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                    צורת כפתורים
                  </label>
                  <select
                    value={formData.buttonShape || 'auto'}
                    onChange={(e) =>
                      updateField('buttonShape', e.target.value as ContactSectionConfig['buttonShape'])
                    }
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode
                        ? 'bg-transparent border-amber-500/60 text-white'
                        : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  >
                    <option value="auto">אוטומטי (לפי הפריסה)</option>
                    <option value="pill">קפסולה עגולה (Pill)</option>
                    <option value="rounded">מעוגל מודרני (Rounded)</option>
                    <option value="sharp">חד ללא עיגול (Sharp 0px)</option>
                    <option value="chiseled">מסותת (Chiseled LG)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                    גודל כפתורים
                  </label>
                  <select
                    value={formData.buttonSize || 'auto'}
                    onChange={(e) =>
                      updateField('buttonSize', e.target.value as ContactSectionConfig['buttonSize'])
                    }
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode
                        ? 'bg-transparent border-amber-500/60 text-white'
                        : 'bg-white border-amber-500/60 text-slate-900'
                    }`}
                  >
                    <option value="auto">אוטומטי (לפי הפריסה)</option>
                    <option value="sm">קטן (SM)</option>
                    <option value="md">בינוני (MD)</option>
                    <option value="lg">גדול (LG)</option>
                    <option value="xl">ענק (XL)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: Advanced Text Background Image & Passing Hover Effect */}
        <div
          className={`rounded-2xl border transition-all overflow-hidden ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('text_bg')}
            className={`w-full h-10 px-3 flex items-center justify-between text-xs font-bold transition cursor-pointer ${
              isDarkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-indigo-500/15 text-indigo-400' : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
              </div>
              <span>2. רקע תמונה מאחורי הטקסט ואפקט עובר</span>
            </div>
            <div className="flex items-center gap-2">
              {formData.textBgEnabled && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              )}
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  openSections.text_bg ? 'rotate-180 text-amber-400' : 'opacity-60'
                }`}
              />
            </div>
          </button>

          {openSections.text_bg && (
            <div
              className={`p-3 border-t space-y-3 animate-fadeIn text-xs ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <div className="font-bold text-xs">הפעל רקע תמונה מאחורי הטקסט</div>
                  <div className="text-[10px] text-zinc-400">
                    תמונה חיה עם שכבת כיסוי כהה ואפקט אינטראקטיבי במעבר עכבר
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(formData.textBgEnabled)}
                  onChange={(e) => updateField('textBgEnabled', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                />
              </div>

              {formData.textBgEnabled && (
                <div className="space-y-3 pt-1 animate-fadeIn">
                  <PageBuilderImageUpload
                    label="תמונת רקע לטקסט / לאזור"
                    value={formData.textBgImageUrl || ''}
                    onChange={(url) => updateField('textBgImageUrl', url)}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                        היקף פריסת התמונה (Scope)
                      </label>
                      <select
                        value={formData.textBgScope || 'text-card'}
                        onChange={(e) =>
                          updateField(
                            'textBgScope',
                            e.target.value as 'text-card' | 'full-section'
                          )
                        }
                        className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                          isDarkMode
                            ? 'bg-transparent border-amber-500/60 text-white'
                            : 'bg-white border-amber-500/60 text-slate-900'
                        }`}
                      >
                        <option value="text-card">כרטיס הטקסט / הכותרת בלבד</option>
                        <option value="full-section">כל שטח אזור יצירת הקשר</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                        שקיפות שכבת כיסוי (Opacity: {formData.textBgOverlayOpacity ?? 75}%)
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="95"
                        value={formData.textBgOverlayOpacity ?? 75}
                        onChange={(e) =>
                          updateField('textBgOverlayOpacity', Number(e.target.value))
                        }
                        className="w-full accent-amber-500 cursor-pointer mt-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-500 block">
                      אפקט מעבר אינטראקטיבי (Hover Effect):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {[
                        {
                          id: 'zoom-glow',
                          title: 'זום והילה זוהרת (Zoom & Glow)',
                          desc: 'התמונה גדלה בעדינות עם הילת תאורה רכה',
                        },
                        {
                          id: 'shimmer-sweep',
                          title: 'הבזק אור חולף (Shimmer Sweep)',
                          desc: 'קרן אור אלכסונית חולפת על פני התמונה',
                        },
                        {
                          id: 'float-parallax',
                          title: 'ציפה ופרלקס תלת-ממדי (Float Parallax)',
                          desc: 'הזזת תמונה אנכית עם טבעת הילה',
                        },
                        {
                          id: 'blur-reveal',
                          title: 'טשטוש מתחדד (Blur Reveal)',
                          desc: 'התמונה מתחדדת ומקבלת בהירות במעבר עכבר',
                        },
                        {
                          id: 'gradient-shift',
                          title: 'גרדיאנט נושם בתנועה (Gradient Shift)',
                          desc: 'שינוי זווית וצבעי תאורה זוהרים',
                        },
                      ].map((eff) => {
                        const isEffSelected =
                          (formData.textBgEffect || 'zoom-glow') === eff.id;
                        return (
                          <button
                            key={eff.id}
                            type="button"
                            onClick={() =>
                              updateField('textBgEffect', eff.id as HeroTextBgEffect)
                            }
                            className={`p-2 rounded-xl border text-right transition cursor-pointer ${
                              isEffSelected
                                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                                : isDarkMode
                                  ? 'bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <div className="font-bold text-xs">{eff.title}</div>
                            <div className="text-[10px] text-zinc-400">{eff.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <PageBuilderColorPicker
                    label="גוון שכבת הכיסוי של התמונה"
                    value={formData.textBgOverlayColor || '#0a0a0f'}
                    onChange={(c) => updateField('textBgOverlayColor', c)}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 3: Content & Contact Details */}
        <div
          className={`rounded-2xl border transition-all overflow-hidden ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('content')}
            className={`w-full h-10 px-3 flex items-center justify-between text-xs font-bold transition cursor-pointer ${
              isDarkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
              </div>
              <span>3. כותרות ופרטי התקשרות</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openSections.content ? 'rotate-180 text-amber-400' : 'opacity-60'
              }`}
            />
          </button>

          {openSections.content && (
            <div
              className={`p-3 border-t space-y-3 animate-fadeIn text-xs ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}
            >
              <PageBuilderInput
                label="כותרת האזור"
                value={formData.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="למשל: צרו איתנו קשר"
              />
              <PageBuilderInput
                label="תת-כותרת"
                value={formData.subtitle || ''}
                onChange={(e) => updateField('subtitle', e.target.value)}
                placeholder="למשל: נשמח לעמוד לשירותכם לכל שאלה, פנייה או התייעצות"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <PageBuilderInput
                  label="טלפון ישיר"
                  value={formData.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="03-1234567"
                  dir="ltr"
                />
                <PageBuilderInput
                  label="וואטסאפ לבירורים מהירים"
                  value={formData.whatsapp || ''}
                  onChange={(e) => updateField('whatsapp', e.target.value)}
                  placeholder="0526968008"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <PageBuilderInput
                  label="דואר אלקטרוני"
                  value={formData.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="info@example.com"
                  dir="ltr"
                />
                <PageBuilderInput
                  label="כתובת ומיקום פיזי"
                  value={formData.address || ''}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="דרך מנחם בגין 144, תל אביב"
                />
              </div>

              <PageBuilderInput
                label="שעות פעילות / מענה"
                value={formData.openingHours || ''}
                onChange={(e) => updateField('openingHours', e.target.value)}
                placeholder="ימים א'-ה' 09:00 - 18:00"
              />

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block">
                    הצג טופס יצירת קשר
                  </label>
                  <span className="text-[10px] text-zinc-400">
                    מאפשר לגולשים להשאיר פנייה ישירה או לבצע רישום וסליקה
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isFormEnabled}
                  onChange={(e) => updateField('showForm', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block">
                    שיחת וואטסאפ ישירה
                  </label>
                  <span className="text-[10px] text-zinc-400">
                    הצגת כפתור קישור מהיר לצ'אט וואטסאפ מיידי
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(formData.directWhatsappChat)}
                  onChange={(e) => updateField('directWhatsappChat', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: Embedded KFS Form, Clearing & WhatsApp Automation */}
        {isFormEnabled && (
          <div
            className={`rounded-2xl border transition-all overflow-hidden ${
              isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
            }`}
          >
            <button
              type="button"
              onClick={() => toggleSection('form')}
              className={`w-full h-10 px-3 flex items-center justify-between text-xs font-bold transition cursor-pointer ${
                isDarkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-100 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-teal-500/15 text-teal-400' : 'bg-teal-100 text-teal-700'
                  }`}
                >
                  <FormInput className="w-3.5 h-3.5" />
                </div>
                <span>4. עריכת טופס KFS, סליקה והודעות WhatsApp</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  openSections.form ? 'rotate-180 text-amber-400' : 'opacity-60'
                }`}
              />
            </button>

            {openSections.form && (
              <div
                className={`p-3 border-t space-y-3 animate-fadeIn text-xs ${
                  isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
                }`}
              >
                <ContactFormConfigEditor
                  value={formData.form || DEFAULT_CONTACT_FORM_CONFIG}
                  formId={formData.formId}
                  onFormIdChange={(id) => updateField('formId', id)}
                  onChange={(formConfig) => updateField('form', formConfig)}
                />
              </div>
            )}
          </div>
        )}

        {/* SECTION 5: Custom Colors & Anchor */}
        <div
          className={`rounded-2xl border transition-all overflow-hidden ${
            isDarkMode ? 'border-white/5 bg-[#141414]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('colors')}
            className={`w-full h-10 px-3 flex items-center justify-between text-xs font-bold transition cursor-pointer ${
              isDarkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-purple-500/15 text-purple-400' : 'bg-purple-100 text-purple-700'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
              </div>
              <span>5. צבעים מותאמים אישית ומזהה עוגן</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openSections.colors ? 'rotate-180 text-amber-400' : 'opacity-60'
              }`}
            />
          </button>

          {openSections.colors && (
            <div
              className={`p-3 border-t space-y-2.5 animate-fadeIn text-xs ${
                isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-1">
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>השאר ריק לשימוש בפלטת הצבעים המקורית של הפריסה</span>
                </span>
                {(formData.titleColor ||
                  formData.subtitleColor ||
                  formData.cardBackgroundColor ||
                  (formData.backgroundColor && formData.backgroundColor !== 'transparent')) && (
                  <button
                    type="button"
                    onClick={() =>
                      updatePatch({
                        titleColor: undefined,
                        subtitleColor: undefined,
                        cardBackgroundColor: undefined,
                        backgroundColor: 'transparent',
                      })
                    }
                    className="text-amber-400 hover:underline text-[10px] font-bold cursor-pointer"
                  >
                    אפס צבעים לסגנון הפריסה
                  </button>
                )}
              </div>

              <PageBuilderColorPicker
                label="צבע כותרת ראשית"
                value={formData.titleColor || '#ffffff'}
                onChange={(c) => updateField('titleColor', c)}
              />
              <PageBuilderColorPicker
                label="צבע תת-כותרת / תגית"
                value={formData.subtitleColor || '#94a3b8'}
                onChange={(c) => updateField('subtitleColor', c)}
              />
              <PageBuilderColorPicker
                label="צבע רקע כרטיסי פרטים וטופס"
                value={formData.cardBackgroundColor || 'transparent'}
                onChange={(c) => updateField('cardBackgroundColor', c)}
              />
              <PageBuilderColorPicker
                label="צבע רקע כללי לאזור"
                value={formData.backgroundColor || 'transparent'}
                onChange={(c) => updateField('backgroundColor', c)}
              />

              <div className="space-y-0.5 pt-1">
                <label className="text-[10px] font-bold text-amber-500 block">
                  מזהה עוגן (Anchor ID)
                </label>
                <input
                  type="text"
                  value={formData.anchorId || 'contact'}
                  onChange={(e) => updateField('anchorId', e.target.value)}
                  dir="ltr"
                  className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isDarkMode
                      ? 'bg-transparent border-amber-500/60 text-white placeholder-zinc-500'
                      : 'bg-white border-amber-500/60 text-slate-900'
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Footer: Compact Bottom Actions */}
      <div
        className={`flex items-center justify-between pt-2.5 mt-2.5 border-t shrink-0 ${
          isDarkMode ? 'border-white/10' : 'border-slate-100'
        }`}
      >
        <div className="text-[11px] font-medium text-zinc-400">
          {isDirty ? (
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
              שינויים ממתינים לשמירה
            </span>
          ) : (
            <span className="text-zinc-500">כל השינויים מעודכנים</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={handleRequestClose}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                isDarkMode
                  ? 'bg-white/5 hover:bg-white/10 text-zinc-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              סגור
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSave(Boolean(onClose))}
            disabled={isSaving}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50 ${
              isDirty
                ? 'bg-amber-500 hover:bg-amber-400 text-black ring-2 ring-amber-400/50'
                : isDarkMode
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'שומר...' : 'שמור'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
