import React, { useState, useEffect, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  Briefcase,
  Sparkles,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
  X,
  LayoutTemplate,
  CheckCircle2,
  Plus,
  Search,
  Globe,
  HelpCircle,
  Upload,
  FolderOpen,
  RefreshCw,
} from 'lucide-react';
import { useBrandDna } from '../hooks/useBrandDna';
import { generateAiCoreService } from '../services/geminiBrandPrompt';
import {
  CoreService,
  FlagshipProduct,
  FlagshipRepeaterItem,
  FlagshipFaqItem,
  FlagshipSeoData,
} from '../types/brandDna';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { PageBuilderContract, MediaPickerContract } from '../../../core/contracts';

const BRAND_ICON_LIBRARY = [
  'Sparkles', 'Heart', 'HeartHandshake', 'Shield', 'ShieldCheck', 'Star', 'Award', 'Crown', 'Gem', 'Zap',
  'CheckCircle2', 'Target', 'Compass', 'Globe', 'Users', 'UserPlus', 'Clock', 'Calendar', 'BookOpen',
  'GraduationCap', 'Lightbulb', 'Smile', 'Sun', 'Feather', 'Home', 'Phone', 'MessageCircle', 'Gift',
  'TrendingUp', 'Lock', 'HelpCircle', 'AlertCircle', 'Info', 'Briefcase', 'Layers', 'Flame', 'Key',
  'Anchor', 'Coffee', 'Music', 'Video', 'MapPin',
];

const DynamicBrandIcon: React.FC<{ name?: string; className?: string }> = ({
  name = 'Sparkles',
  className = 'w-4 h-4',
}) => {
  const IconComp = (LucideIcons as any)[name] || LucideIcons.Sparkles;
  return <IconComp className={className} />;
};

/**
 * בורר אייקונים מתוך ספריית האייקונים של המערכת עבור כל שדה חוזר בשירות
 */
const IconPickerPopover: React.FC<{
  value?: string;
  onChange: (iconName: string) => void;
}> = ({ value = 'Sparkles', onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = BRAND_ICON_LIBRARY.filter((ic) =>
    ic.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative inline-block" dir="rtl">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title={`בחר אייקון (${value})`}
        className="w-10 h-10 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-all shrink-0"
      >
        <DynamicBrandIcon name={value} className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-[140] w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">ספריית אייקונים</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חפש אייקון..."
              dir="ltr"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pr-8 pl-2.5 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="grid grid-cols-6 gap-1.5 max-h-44 overflow-y-auto p-1">
            {filtered.map((iconName) => (
              <button
                key={iconName}
                type="button"
                onClick={() => {
                  onChange(iconName);
                  setOpen(false);
                }}
                title={iconName}
                className={`p-2 rounded-xl flex items-center justify-center border transition-all ${
                  value === iconName
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 border-transparent hover:border-indigo-400'
                }`}
              >
                <DynamicBrandIcon name={iconName} className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const EntitlementNoticeModal: React.FC<{ isOpen: boolean; onClose: () => void; message?: string }> = ({
  isOpen,
  onClose,
  message,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col items-center text-center relative animate-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center mb-4 text-amber-500 shadow-inner">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
          הודעת מערכת
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-medium">
          {message || 'אין לכם את האפשרות הזו בסל. לשדרוג החבילה והפעלת יכולות AI ובונה האתרים, פנו למנהל המערכת.'}
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          הבנתי, תודה
        </button>
      </div>
    </div>
  );
};

/**
 * רכיב שדות חוזרים מורחבים עבור 6 נקודות כאב / 3 קהלי יעד / 6 יתרונות
 */
const RepeaterSection: React.FC<{
  title: string;
  countBadge: string;
  items: FlagshipRepeaterItem[];
  defaultIcon: string;
  onAdd: () => void;
  onUpdate: (index: number, patch: Partial<FlagshipRepeaterItem>) => void;
  onRemove: (index: number) => void;
  titlePlaceholder: string;
  textPlaceholder: string;
}> = ({
  title,
  countBadge,
  items,
  defaultIcon,
  onAdd,
  onUpdate,
  onRemove,
  titlePlaceholder,
  textPlaceholder,
}) => {
  return (
    <div className="space-y-3 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-900 dark:text-white">{title}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
            {countBadge}
          </span>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>הוסף פריט</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            className="flex items-start gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 group shadow-sm"
          >
            <div className="pt-0.5">
              <IconPickerPopover
                value={item.icon || defaultIcon}
                onChange={(ic) => onUpdate(idx, { icon: ic })}
              />
            </div>
            <div className="flex-1 space-y-1.5 min-w-0">
              <input
                type="text"
                value={item.title || ''}
                onChange={(e) => onUpdate(idx, { title: e.target.value })}
                placeholder={titlePlaceholder}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
              <textarea
                value={item.text || ''}
                onChange={(e) => onUpdate(idx, { text: e.target.value })}
                rows={2}
                placeholder={textPlaceholder}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors group-hover:opacity-100 opacity-60"
              title="מחק פריט"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * עורך שירות מרכזי (CoreService) - תואם במדויק ליכולות מוצרי הדגל
 */
export const CoreServicesEditor: React.FC = () => {
  const { brandDna, setFullBrandDna } = useBrandDna();
  const { getCapability } = useHostCapabilities();
  const pageBuilder = getCapability<PageBuilderContract>('page-builder');

  const rawServices: (string | CoreService)[] = brandDna.ecosystem?.services || [];

  // נרמול שירותים קיימים (תמיכה גם במחרוזות ישנות וגם באובייקטים מובנים)
  const normalizedServices: CoreService[] = rawServices.map((srv, idx) => {
    if (typeof srv === 'string') {
      return {
        id: `srv_${idx + 1}`,
        nameAndSlogan: srv,
        shortDescription: `שירות מרכזי: ${srv}`,
        longDescription: `שירות ${srv} מבית ${brandDna.identity?.companyName || 'הארגון'}. מענה מקצועי, שלם ואיכותי.`,
        imageUrl: '',
        painPointSolved: '',
        targetAudience: '',
        competitiveAdvantage: '',
        painPoints: [] as FlagshipRepeaterItem[],
        targetAudiences: [] as FlagshipRepeaterItem[],
        competitiveAdvantages: [] as FlagshipRepeaterItem[],
        faqs: [] as FlagshipFaqItem[],
      };
    }
    return srv;
  });

  const [servicesList, setServicesList] = useState<CoreService[]>(normalizedServices);
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);
  const [newServiceName, setNewServiceName] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [entitlementNotice, setEntitlementNotice] = useState<string | null>(null);

  useEffect(() => {
    const list: CoreService[] = (brandDna.ecosystem?.services || []).map((srv, idx) => {
      if (typeof srv === 'string') {
        return {
          id: `srv_${idx + 1}`,
          nameAndSlogan: srv,
          shortDescription: `שירות מרכזי: ${srv}`,
          longDescription: `שירות ${srv} מבית ${brandDna.identity?.companyName || 'הארגון'}. מענה מקצועי, שלם ואיכותי.`,
          imageUrl: '',
          painPointSolved: '',
          targetAudience: '',
          competitiveAdvantage: '',
          painPoints: [] as FlagshipRepeaterItem[],
          targetAudiences: [] as FlagshipRepeaterItem[],
          competitiveAdvantages: [] as FlagshipRepeaterItem[],
          faqs: [] as FlagshipFaqItem[],
        };
      }
      return srv;
    });
    setServicesList(list);
  }, [brandDna.ecosystem?.services]);

  const saveListToDna = (nextList: CoreService[]) => {
    setServicesList(nextList);
    setFullBrandDna({
      ...brandDna,
      ecosystem: {
        services: nextList,
        products: brandDna.ecosystem?.products || [],
        annualEvents: brandDna.ecosystem?.annualEvents || [],
        communities: brandDna.ecosystem?.communities || [],
        businessPackages: brandDna.ecosystem?.businessPackages || [],
      },
    });
  };

  const handleAddNewManual = () => {
    if (!newServiceName.trim()) return;
    const newService: CoreService = {
      id: `srv_${Date.now()}`,
      nameAndSlogan: newServiceName.trim(),
      shortDescription: `שירות מרכזי מבית ${brandDna.identity?.companyName || 'הארגון'}`,
      longDescription: `שירות ${newServiceName.trim()} מעניק מעטפת מקצועית שלמה ואיכותית עבור קהל היעד שלנו.`,
      imageUrl: '',
      painPointSolved: '',
      targetAudience: '',
      competitiveAdvantage: '',
      painPoints: [] as FlagshipRepeaterItem[],
      targetAudiences: [] as FlagshipRepeaterItem[],
      competitiveAdvantages: [] as FlagshipRepeaterItem[],
      faqs: [] as FlagshipFaqItem[],
    };
    const nextList = [...servicesList, newService];
    saveListToDna(nextList);
    setNewServiceName('');
    setEditingServiceIndex(nextList.length - 1);
  };

  const handleGenerateAiService = async () => {
    setIsGeneratingAi(true);
    try {
      const generated = await generateAiCoreService(
        newServiceName.trim() || brandDna.identity?.organizationPurpose || 'שירות מוביל',
        brandDna
      );

      if (generated) {
        const fullService: CoreService = {
          id: `srv_${Date.now()}`,
          nameAndSlogan: generated.nameAndSlogan,
          shortDescription: generated.shortDescription,
          longDescription: generated.longDescription,
          imageUrl: '',
          painPointSolved: generated.painPointSolved,
          targetAudience: generated.targetAudience,
          competitiveAdvantage: generated.competitiveAdvantage,
          painPoints: generated.painPoints,
          targetAudiences: generated.targetAudiences,
          competitiveAdvantages: generated.competitiveAdvantages,
          faqs: generated.faqs,
          seo: generated.seo,
        };

        const nextList = [...servicesList, fullService];
        saveListToDna(nextList);
        setNewServiceName('');
        setEditingServiceIndex(nextList.length - 1);
      } else {
        setEntitlementNotice('לא התקבלו נתונים מה-AI. אנא בדקו את מפתח ה-Gemini שלכם או הזינו ידנית.');
      }
    } catch (err: any) {
      console.error('[CoreServicesEditor] AI generation error:', err);
      setEntitlementNotice(err?.message || 'שגיאה ביצירת שירות באמצעות AI.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleDeleteService = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = [...servicesList];
    next.splice(idx, 1);
    saveListToDna(next);
    if (editingServiceIndex === idx) {
      setEditingServiceIndex(null);
    } else if (editingServiceIndex !== null && editingServiceIndex > idx) {
      setEditingServiceIndex(editingServiceIndex - 1);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-indigo-500" />
          <span>שירותים מרכזיים (Core Services)</span>
        </h3>
        <button
          type="button"
          onClick={handleGenerateAiService}
          disabled={isGeneratingAi}
          className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition-colors font-bold disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {isGeneratingAi ? 'מייצר שירות...' : 'הפק שירות מרכזי עם AI'}
        </button>
      </div>

      {/* Services List */}
      <div className="space-y-2 mb-4">
        {servicesList.map((srv, idx) => (
          <div
            key={srv.id || idx}
            onClick={() => setEditingServiceIndex(idx)}
            className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
              editingServiceIndex === idx
                ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 font-black text-xs">
                {idx + 1}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {srv.nameAndSlogan || 'שירות ללא שם'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {srv.shortDescription || 'לחץ להגדרת 6 נקודות כאב, 3 קהלים, 6 יתרונות ו-10 שאלות'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {srv.linkedPageSlug && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  עמוד קיים (/{srv.linkedPageSlug})
                </span>
              )}
              <button
                type="button"
                onClick={(e) => handleDeleteService(idx, e)}
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                title="מחק שירות"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {servicesList.length === 0 && (
          <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Briefcase className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              טרם הוגדרו שירותים מרכזיים. הזינו רעיון לשירות או לחצו על ה-AI!
            </p>
          </div>
        )}
      </div>

      {/* Input to add new service */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newServiceName}
          onChange={(e) => setNewServiceName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddNewManual()}
          placeholder="שם שירות חדש (לדוגמה: קורס מדריכי כלבים, ליווי אסטרטגי...)"
          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
        />
        <button
          type="button"
          onClick={handleAddNewManual}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>הוסף שירות</span>
        </button>
      </div>

      {/* Full Modal Drawer for editing the selected service */}
      {editingServiceIndex !== null && servicesList[editingServiceIndex] && (
        <CoreServiceDetailModal
          service={servicesList[editingServiceIndex]}
          onClose={() => setEditingServiceIndex(null)}
          onSave={(updated) => {
            const next = [...servicesList];
            next[editingServiceIndex] = updated;
            saveListToDna(next);
          }}
        />
      )}

      <EntitlementNoticeModal
        isOpen={Boolean(entitlementNotice)}
        onClose={() => setEntitlementNotice(null)}
        message={entitlementNotice || ''}
      />
    </div>
  );
};

/**
 * מודאל עריכה מעמיק לשירות מרכזי: 6 נקודות כאב, 3 קהלים, 6 יתרונות, 10 שאלות, גלריה, SEO/AIO, ויצירת עמוד דטרמיניסטית ללא /p/
 */
const CoreServiceDetailModal: React.FC<{
  service: CoreService;
  onClose: () => void;
  onSave: (service: CoreService) => void;
}> = ({ service, onClose, onSave }) => {
  const { brandDna } = useBrandDna();
  const { getCapability } = useHostCapabilities();
  const pageBuilder = getCapability<PageBuilderContract>('page-builder');
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');

  const [draft, setDraft] = useState<CoreService>(() => ({
    ...service,
    painPoints: service.painPoints || [],
    targetAudiences: service.targetAudiences || [],
    competitiveAdvantages: service.competitiveAdvantages || [],
    faqs: service.faqs || [],
    galleryImages: service.galleryImages || (service.imageUrl ? [service.imageUrl] : []),
    seo: {
      slug: service.seo?.slug || service.linkedPageSlug || '',
      metaTitle: service.seo?.metaTitle || service.nameAndSlogan || '',
      metaDescription: service.seo?.metaDescription || service.shortDescription || '',
      keywords: service.seo?.keywords || '',
      ogImage: service.seo?.ogImage || service.imageUrl || '',
      aiKnowledgeSummary: service.seo?.aiKnowledgeSummary || '',
      aiTargetQuestions: service.seo?.aiTargetQuestions || [],
      aiEntitySchemaType: service.seo?.aiEntitySchemaType || 'Service',
      aiBotIndexingEnabled: service.seo?.aiBotIndexingEnabled !== false,
    },
  }));

  const [isAiRephrasing, setIsAiRephrasing] = useState(false);
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [pageSuccessMsg, setPageSuccessMsg] = useState<string | null>(null);
  const [entitlementNotice, setEntitlementNotice] = useState<string | null>(null);
  const [ogError, setOgError] = useState<string | null>(null);
  const ogFileInputRef = useRef<HTMLInputElement>(null);

  const updateField = <K extends keyof CoreService>(field: K, value: CoreService[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const updateSeoField = <K extends keyof FlagshipSeoData>(field: K, value: FlagshipSeoData[K]) => {
    setDraft((prev) => ({
      ...prev,
      seo: {
        ...(prev.seo || {}),
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  // מילוי אוטומטי של שדות חוזרים באמצעות AI
  const handleRegenerateWithAi = async () => {
    setIsAiRephrasing(true);
    try {
      const generated = await generateAiCoreService(
        draft.nameAndSlogan || brandDna.identity?.organizationPurpose || 'שירות מוביל',
        brandDna
      );
      if (generated) {
        setDraft((prev) => ({
          ...prev,
          nameAndSlogan: generated.nameAndSlogan,
          shortDescription: generated.shortDescription,
          longDescription: generated.longDescription,
          painPointSolved: generated.painPointSolved,
          targetAudience: generated.targetAudience,
          competitiveAdvantage: generated.competitiveAdvantage,
          painPoints: generated.painPoints,
          targetAudiences: generated.targetAudiences,
          competitiveAdvantages: generated.competitiveAdvantages,
          faqs: generated.faqs,
          seo: {
            ...(prev.seo || {}),
            ...generated.seo,
            slug: prev.seo?.slug || generated.seo.slug,
          },
        }));
      }
    } catch (err: any) {
      console.error('[CoreServiceDetailModal] Error regenerating AI:', err);
      setEntitlementNotice(err?.message || 'שגיאה ברענון השירות עם AI.');
    } finally {
      setIsAiRephrasing(false);
    }
  };

  // יצירת עמוד שירות ב-KosWebAi ללא קריאת AI ובלי /p/ בסלאג
  const handleCreatePage = async () => {
    if (!pageBuilder?.createPageFromService) {
      setEntitlementNotice('אין לכם את האפשרות הזו בסל. לשדרוג החבילה והפעלת בונה האתרים, פנו למנהל המערכת.');
      return;
    }

    setIsCreatingPage(true);
    setPageSuccessMsg(null);
    try {
      const res = await pageBuilder.createPageFromService({
        service: draft,
        brandDna,
      });

      if (res.success) {
        const updatedDraft: CoreService = {
          ...draft,
          linkedPageId: res.pageId,
          linkedPageSlug: res.slug,
          seo: {
            ...(draft.seo || {}),
            slug: res.slug,
          },
        };
        setDraft(updatedDraft);
        onSave(updatedDraft);
        setPageSuccessMsg(`העמוד נפרס בהצלחה מתוך נתוני השירות (/${res.slug}) ללא קריאת AI!`);
      } else {
        setEntitlementNotice(res.error || 'שגיאה ביצירת עמוד השירות בבונה העמודים.');
      }
    } catch (err: any) {
      console.error('Failed to create page from service:', err);
      setEntitlementNotice(err?.message || 'שגיאה ביצירת עמוד השירות בבונה העמודים.');
    } finally {
      setIsCreatingPage(false);
    }
  };

  // בדיקה והגבלת תמונת שיתוף ברשתות לקובץ JPG בלבד עד 100KB
  const handleOgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOgError(null);
    const isJpg = file.type === 'image/jpeg' || /\.jpe?g$/i.test(file.name);
    if (!isJpg) {
      setOgError('שגיאה: חובה להעלות קובץ תמונה בפורמט JPG בלבד (.jpg / .jpeg).');
      return;
    }

    if (file.size > 100 * 1024) {
      const kb = Math.round(file.size / 1024);
      setOgError(`שגיאה: משקל הקובץ (${kb}KB) חורג מהמותר! חובה להעלות קובץ JPG במשקל פחות מ-100KB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateSeoField('ogImage', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePickOgFromGallery = async () => {
    setOgError(null);
    if (mediaPicker?.openPicker) {
      try {
        const selected = await mediaPicker.openPicker({
          accept: 'image/jpeg',
          multiple: false,
          allowedMimeTypes: ['image/jpeg', 'image/jpg'],
          maxSizeBytes: 100 * 1024,
        });
        if (selected) {
          const raw = Array.isArray(selected) ? selected[0] : selected;
          const url = typeof raw === 'string' ? raw : (raw as any)?.url;
          if (url && typeof url === 'string') {
            if (!/\.(jpg|jpeg)(\?.*)?$/i.test(url) && !url.startsWith('data:image/jpeg') && !url.startsWith('blob:')) {
              setOgError('שגיאה: הקובץ שנבחר חייב להיות בפורמט JPG בלבד (.jpg / .jpeg) ובמשקל עד 100KB.');
              return;
            }
            updateSeoField('ogImage', url.trim());
          }
        }
      } catch (err) {
        ogFileInputRef.current?.click();
      }
    } else {
      ogFileInputRef.current?.click();
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
        
        {/* Modal Top Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                עורך שירות מרכזי: {draft.nameAndSlogan || 'שירות חדש'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                הגדרת תוכן, 6 נקודות כאב, 3 קהלים, 6 יתרונות, 10 שאלות ותשובות ו-SEO/AIO
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRegenerateWithAi}
              disabled={isAiRephrasing}
              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 text-indigo-600 dark:text-indigo-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAiRephrasing ? 'מרענן שדות...' : 'רענן עם AI'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* 1. שם השירות וסלוגן */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 dark:text-slate-300">
              שם השירות והסלוגן (Name & Slogan)
            </label>
            <input
              type="text"
              value={draft.nameAndSlogan || ''}
              onChange={(e) => updateField('nameAndSlogan', e.target.value)}
              placeholder="לדוגמה: אילוף כלבים מקצועי – שקט נפשי וחיבור אמיתי"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* 2. תיאור קצר ותיאור ארוך */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                תיאור קצר (עבור ה-Hero ותקציר העמוד)
              </label>
              <textarea
                value={draft.shortDescription || ''}
                onChange={(e) => updateField('shortDescription', e.target.value)}
                rows={3}
                placeholder="1-2 משפטים חדים על מהות השירות והתועלת המיידית"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>אודות ותוכן השירות (עבור אזור תוכן/אודות בבונה)</span>
                <span className="text-[10px] text-indigo-500 font-bold">אזור אודות / תוכן (sec-about)</span>
              </label>
              <textarea
                value={draft.longDescription || ''}
                onChange={(e) => updateField('longDescription', e.target.value)}
                rows={3}
                placeholder="תיאור מורחב של 4-6 משפטים המספר על השירות, החוויה והליווי האישי"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* 3. שדות חוזרים: 6 נקודות כאב, 3 קהלי יעד, 6 יתרונות תחרותיים */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RepeaterSection
              title="נקודות כאב שהשירות פותר"
              countBadge={`${(draft.painPoints || []).length} / 6`}
              items={draft.painPoints || []}
              defaultIcon="AlertCircle"
              onAdd={() => {
                const next = [
                  ...(draft.painPoints || []),
                  { id: `pain_${Date.now()}`, title: '', text: '', icon: 'AlertCircle' },
                ];
                updateField('painPoints', next);
              }}
              onUpdate={(idx, patch) => {
                const next = (draft.painPoints || []).map((p, i) => (i === idx ? { ...p, ...patch } : p));
                updateField('painPoints', next);
              }}
              onRemove={(idx) => {
                const next = (draft.painPoints || []).filter((_, i) => i !== idx);
                updateField('painPoints', next);
              }}
              titlePlaceholder="כותרת נקודת כאב"
              textPlaceholder="כיצד השירות פותר את הכאב הזה?"
            />

            <RepeaterSection
              title="קהלי יעד ממוקדים"
              countBadge={`${(draft.targetAudiences || []).length} / 3`}
              items={draft.targetAudiences || []}
              defaultIcon="Users"
              onAdd={() => {
                const next = [
                  ...(draft.targetAudiences || []),
                  { id: `aud_${Date.now()}`, title: '', text: '', icon: 'Users' },
                ];
                updateField('targetAudiences', next);
              }}
              onUpdate={(idx, patch) => {
                const next = (draft.targetAudiences || []).map((a, i) => (i === idx ? { ...a, ...patch } : a));
                updateField('targetAudiences', next);
              }}
              onRemove={(idx) => {
                const next = (draft.targetAudiences || []).filter((_, i) => i !== idx);
                updateField('targetAudiences', next);
              }}
              titlePlaceholder="שם קהל היעד"
              textPlaceholder="מדוע השירות מותאם בול עבורו?"
            />

            <RepeaterSection
              title="יתרונות תחרותיים"
              countBadge={`${(draft.competitiveAdvantages || []).length} / 6`}
              items={draft.competitiveAdvantages || []}
              defaultIcon="Award"
              onAdd={() => {
                const next = [
                  ...(draft.competitiveAdvantages || []),
                  { id: `adv_${Date.now()}`, title: '', text: '', icon: 'Award' },
                ];
                updateField('competitiveAdvantages', next);
              }}
              onUpdate={(idx, patch) => {
                const next = (draft.competitiveAdvantages || []).map((c, i) => (i === idx ? { ...c, ...patch } : c));
                updateField('competitiveAdvantages', next);
              }}
              onRemove={(idx) => {
                const next = (draft.competitiveAdvantages || []).filter((_, i) => i !== idx);
                updateField('competitiveAdvantages', next);
              }}
              titlePlaceholder="יתרון תחרותי ייחודי"
              textPlaceholder="המעלה על פני כל חלופה אחרת"
            />
          </div>

          {/* 4. שאלות ותשובות נפוצות (10 שאלות) */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  שאלות ותשובות נפוצות עבור אזור השו&quot;ת
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                  {(draft.faqs || []).length} / 10 שאלות
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  updateField('faqs', [
                    ...(draft.faqs || []),
                    { id: `faq_${Date.now()}`, question: '', answer: '', icon: 'HelpCircle' },
                  ]);
                }}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>הוסף שאלה</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(draft.faqs || []).map((faq, idx) => (
                <div
                  key={faq.id || idx}
                  className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 group space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                      שאלה {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        updateField('faqs', (draft.faqs || []).filter((_, i) => i !== idx));
                      }}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={faq.question || ''}
                    onChange={(e) => {
                      const next = (draft.faqs || []).map((f, i) => (i === idx ? { ...f, question: e.target.value } : f));
                      updateField('faqs', next);
                    }}
                    placeholder="נוסח השאלה הנפוצה?"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                  <textarea
                    value={faq.answer || ''}
                    onChange={(e) => {
                      const next = (draft.faqs || []).map((f, i) => (i === idx ? { ...f, answer: e.target.value } : f));
                      updateField('faqs', next);
                    }}
                    rows={2}
                    placeholder="התשובה המפורטת והמרגיעה"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 5. גלריית תמונות השירות */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  גלריית תמונות השירות
                </span>
                <span className="text-[10px] text-slate-500">
                  ({(draft.galleryImages || []).length} תמונות)
                </span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (mediaPicker?.openPicker) {
                    try {
                      const selected = await mediaPicker.openPicker({ accept: 'image/*', multiple: true, maxFiles: 12 });
                      if (selected) {
                        const rawList = Array.isArray(selected) ? selected : [selected];
                        const urls = rawList
                          .map((item) => (typeof item === 'string' ? item : (item as any)?.url))
                          .filter((u): u is string => typeof u === 'string' && u.trim().length > 0);
                        if (urls.length > 0) {
                          const current = draft.galleryImages || [];
                          const nextGallery = [...current, ...urls];
                          updateField('galleryImages', nextGallery);
                          if (!draft.imageUrl) updateField('imageUrl', nextGallery[0] || '');
                        }
                      }
                    } catch (err) {
                      const url = prompt('הזן כתובת תמונה URL:');
                      if (url?.trim()) {
                        const current = draft.galleryImages || [];
                        const nextGallery = [...current, url.trim()];
                        updateField('galleryImages', nextGallery);
                        if (!draft.imageUrl) updateField('imageUrl', nextGallery[0] || '');
                      }
                    }
                  } else {
                    const url = prompt('הזן כתובת תמונה URL:');
                    if (url?.trim()) {
                      const current = draft.galleryImages || [];
                      const nextGallery = [...current, url.trim()];
                      updateField('galleryImages', nextGallery);
                      if (!draft.imageUrl) updateField('imageUrl', nextGallery[0] || '');
                    }
                  }
                }}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>הוסף תמונה לגלריה</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {(draft.galleryImages || []).map((imgUrl, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden aspect-video bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-sm">
                  <img src={imgUrl} alt={`gallery_${idx}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateField('imageUrl', imgUrl)}
                      title="הגדר כתמונה ראשית"
                      className={`p-1.5 rounded-lg text-xs font-bold ${
                        draft.imageUrl === imgUrl
                          ? 'bg-amber-500 text-white'
                          : 'bg-white/80 hover:bg-white text-slate-800'
                      }`}
                    >
                      ★
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const next = (draft.galleryImages || []).filter((_, i) => i !== idx);
                        updateField('galleryImages', next);
                        if (draft.imageUrl === imgUrl) {
                          updateField('imageUrl', next[0] || '');
                        }
                      }}
                      className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white"
                      title="מחק מהגלריה"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. הגדרות SEO + קידום AI (AIO/GEO) + תמונת שיתוף JPG < 100KB */}
          <div className="space-y-4 p-4 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-black text-slate-900 dark:text-white">
                הגדרות SEO וקידום בינה מלאכותית (AIO / GEO)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>סלאג עמוד השירות (נפתח ישירות ללא קידומת /p/)</span>
                  <span className="text-[10px] text-emerald-600 font-bold">/{draft.seo?.slug || 'service-slug'}</span>
                </label>
                <input
                  type="text"
                  value={draft.seo?.slug || ''}
                  onChange={(e) => updateSeoField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="dog-training-course"
                  dir="ltr"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  כותרת מטא לגוגל (Meta Title)
                </label>
                <input
                  type="text"
                  value={draft.seo?.metaTitle || ''}
                  onChange={(e) => updateSeoField('metaTitle', e.target.value)}
                  placeholder="כותרת העמוד במנועי חיפוש"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  תיאור מטא לגוגל (Meta Description)
                </label>
                <input
                  type="text"
                  value={draft.seo?.metaDescription || ''}
                  onChange={(e) => updateSeoField('metaDescription', e.target.value)}
                  placeholder="עד 160 תווים של תיאור מזמין"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  מילות מפתח (Keywords)
                </label>
                <input
                  type="text"
                  value={draft.seo?.keywords || ''}
                  onChange={(e) => updateSeoField('keywords', e.target.value)}
                  placeholder="מילה 1, מילה 2, מילה 3"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* תמונת שיתוף ברשתות - JPG בלבד ופחות מ-100KB */}
            <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[11px] font-black text-slate-800 dark:text-slate-200 block">
                    תמונת שיתוף לרשתות החברתיות (Social OG Image)
                  </label>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                    מוגבל לקובץ JPG בלבד (.jpg / .jpeg) במשקל פחות מ-100KB לטעינה מיידית בוואטסאפ וברשתות
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={ogFileInputRef}
                    type="file"
                    accept="image/jpeg"
                    className="hidden"
                    onChange={handleOgFileUpload}
                  />
                  <button
                    type="button"
                    onClick={handlePickOgFromGallery}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-indigo-500" />
                    <span>בחר מהגלריה (JPG &lt; 100KB)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => ogFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>העלה JPG מהמחשב</span>
                  </button>
                </div>
              </div>

              {ogError && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                  <X className="w-4 h-4 shrink-0" />
                  <span>{ogError}</span>
                </div>
              )}

              {draft.seo?.ogImage && (
                <div className="flex items-center gap-3 p-2 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <img
                    src={draft.seo.ogImage}
                    alt="OG Preview"
                    className="w-16 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate block">
                      תמונת שיתוף ברשתות פעילה (JPG &lt; 100KB)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono truncate block">
                      {draft.seo.ogImage.slice(0, 60)}...
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSeoField('ogImage', '')}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                    title="הסר תמונה"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* AI Knowledge Summary */}
            <div className="space-y-1 pt-2">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                תמצית ידע למנועי AI (ChatGPT, Gemini, Perplexity)
              </label>
              <textarea
                value={draft.seo?.aiKnowledgeSummary || ''}
                onChange={(e) => updateSeoField('aiKnowledgeSummary', e.target.value)}
                rows={2}
                placeholder="תמצית עובדתית מדויקת שמנועי בינה מלאכותית יצטטו ישירות לגבי השירות"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>
          </div>

          {pageSuccessMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{pageSuccessMsg}</span>
              </div>
              {draft.linkedPageSlug && (
                <a
                  href={`/${draft.linkedPageSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline flex items-center gap-1"
                >
                  <span>פתח עמוד (/{draft.linkedPageSlug})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex flex-col md:flex-row items-center justify-between mt-auto gap-3 sticky bottom-0 z-20 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={handleCreatePage}
              disabled={isCreatingPage}
              className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-4 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {isCreatingPage ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <LayoutTemplate className="w-4 h-4" />
              )}
              <span>
                {draft.linkedPageId
                  ? 'עדכן עמוד שירות ב-KosWebAi (ללא AI)'
                  : 'פרוס עמוד שירות ב-KosWebAi (ללא AI)'}
              </span>
            </button>

            {draft.linkedPageId && (
              <a
                href={`/${draft.linkedPageSlug || draft.linkedPageId}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline px-2 py-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>צפה בעמוד חי (/{draft.linkedPageSlug || draft.linkedPageId})</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 md:flex-none px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              ביטול
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 md:flex-none px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
            >
              שמור שינויים בשירות
            </button>
          </div>
        </div>

      </div>

      <EntitlementNoticeModal
        isOpen={Boolean(entitlementNotice)}
        onClose={() => setEntitlementNotice(null)}
        message={entitlementNotice || ''}
      />
    </div>
  );
};
