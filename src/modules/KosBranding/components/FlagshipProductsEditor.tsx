import React, { useState, useEffect, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  Box,
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
  ChevronDown,
  Save,
  FileText,
  AlertCircle,
  Users,
  Award,
} from 'lucide-react';
import { useBrandDna } from '../hooks/useBrandDna';
import { generateAiFlagshipProduct } from '../services/geminiBrandPrompt';
import {
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
 * בורר אייקונים מתוך ספריית האייקונים של המערכת עבור כל שדה חוזר
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

/**
 * מודאל חביב ואלגנטי להודעות חבילה / זכאות בסל ללא שימוש ב-alert מכוער
 */
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

function ensureRepeaterItems(
  items: FlagshipRepeaterItem[] | undefined,
  legacyString: string | undefined,
  targetCount: number,
  prefix: string,
  defaultIcon: string,
  defaultTitlePrefix: string
): FlagshipRepeaterItem[] {
  const existing = Array.isArray(items) ? items : [];
  if (existing.length > 0) {
    const result: FlagshipRepeaterItem[] = [];
    for (let idx = 0; idx < Math.max(targetCount, existing.length); idx++) {
      const item = existing[idx];
      result.push({
        id: item?.id || `${prefix}_${idx + 1}`,
        title: item?.title || `${defaultTitlePrefix} ${idx + 1}`,
        text: item?.text || '',
        icon: item?.icon || defaultIcon,
      });
    }
    return result;
  }
  if (legacyString && legacyString.trim()) {
    const parts = legacyString
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean);
    return Array.from({ length: Math.max(targetCount, parts.length) }, (_, idx) => {
      const raw = parts[idx] || '';
      const [first, ...rest] = raw.split(':');
      return {
        id: `${prefix}_${idx + 1}`,
        title: rest.length > 0 ? first.trim() : `${defaultTitlePrefix} ${idx + 1}`,
        text: rest.length > 0 ? rest.join(':').trim() : first.trim(),
        icon: defaultIcon,
      };
    });
  }
  return Array.from({ length: targetCount }, (_, idx) => ({
    id: `${prefix}_${idx + 1}`,
    title: `${defaultTitlePrefix} ${idx + 1}`,
    text: '',
    icon: defaultIcon,
  }));
}

function ensureFaqItems(faqs: FlagshipFaqItem[] | undefined, targetCount = 10): FlagshipFaqItem[] {
  const existing = Array.isArray(faqs) ? faqs : [];
  if (existing.length > 0) {
    const result: FlagshipFaqItem[] = [];
    for (let idx = 0; idx < Math.max(targetCount, existing.length); idx++) {
      const f = existing[idx];
      result.push({
        id: f?.id || `faq_${idx + 1}`,
        question: f?.question || '',
        answer: f?.answer || '',
        icon: f?.icon || 'HelpCircle',
      });
    }
    return result;
  }
  return Array.from({ length: targetCount }, (_, idx) => ({
    id: `faq_${idx + 1}`,
    question: '',
    answer: '',
    icon: 'HelpCircle',
  }));
}

export const FlagshipProductsEditor: React.FC = () => {
  const { brandDna, setFullBrandDna } = useBrandDna();
  const rawProducts = brandDna.ecosystem?.products || [];

  // Normalize products (some might be strings from legacy)
  const products: FlagshipProduct[] = rawProducts.map((p) => {
    if (typeof p === 'string') {
      return {
        id: `prod-${Date.now()}-${Math.random()}`,
        nameAndSlogan: p,
        shortDescription: '',
        longDescription: '',
        imageUrl: '',
        galleryImages: [],
        painPointSolved: '',
        targetAudience: '',
        competitiveAdvantage: '',
        painPoints: [],
        targetAudiences: [],
        competitiveAdvantages: [],
        faqs: [],
      };
    }
    return p as FlagshipProduct;
  });

  const [newIdea, setNewIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeProduct, setActiveProduct] = useState<FlagshipProduct | null>(null);
  const [entitlementNotice, setEntitlementNotice] = useState<string | null>(null);

  const handleSaveProduct = (updated: FlagshipProduct) => {
    const isNew = !products.find((p) => p.id === updated.id);
    const newProducts = isNew
      ? [...products, updated]
      : products.map((p) => (p.id === updated.id ? updated : p));

    // Auto-add target audiences to Brand DNA audience collection if not already present
    const existingTags = brandDna.audience?.targetAudiences || [];
    const candidateAudiences = [
      ...(updated.targetAudiences || []).map((a) => a.title?.trim()).filter(Boolean),
    ];
    const nextAudiences = [...existingTags];
    candidateAudiences.forEach((aud) => {
      if (aud && !nextAudiences.includes(aud)) {
        nextAudiences.push(aud);
      }
    });

    setFullBrandDna({
      ...brandDna,
      audience: {
        ...brandDna.audience,
        targetAudiences: nextAudiences,
      },
      ecosystem: {
        ...(brandDna.ecosystem || { services: [], products: [], annualEvents: [], communities: [] }),
        products: newProducts,
      },
    });

    if (activeProduct && activeProduct.id === updated.id) {
      setActiveProduct(updated);
    }
  };

  const handleGenerateIdea = async () => {
    if (!newIdea.trim()) return;
    setIsGenerating(true);
    const result = await generateAiFlagshipProduct(newIdea, brandDna);
    setIsGenerating(false);

    if (result) {
      const newProduct: FlagshipProduct = {
        id: `prod-${Date.now()}`,
        nameAndSlogan: result.nameAndSlogan || newIdea,
        shortDescription: result.shortDescription || '',
        longDescription: result.longDescription || '',
        painPointSolved: result.painPointSolved || '',
        targetAudience: result.targetAudience || '',
        competitiveAdvantage: result.competitiveAdvantage || '',
        painPoints: result.painPoints || [],
        targetAudiences: result.targetAudiences || [],
        competitiveAdvantages: result.competitiveAdvantages || [],
        faqs: result.faqs || [],
        seo: result.seo || {},
        imageUrl: '',
        galleryImages: [],
      };
      handleSaveProduct(newProduct);
      setNewIdea('');
      setActiveProduct(newProduct);
    } else {
      setEntitlementNotice('אין לכם את האפשרות הזו בסל. לשדרוג החבילה והפעלת יכולות AI, פנו למנהל המערכת.');
    }
  };

  const removeProduct = (id: string) => {
    const newProducts = products.filter((p) => p.id !== id);
    setFullBrandDna({
      ...brandDna,
      ecosystem: {
        ...(brandDna.ecosystem || { services: [], products: [], annualEvents: [], communities: [] }),
        products: newProducts,
      },
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-full flex flex-col relative overflow-hidden">
      {isGenerating && (
        <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 flex flex-col items-center justify-center z-50 backdrop-blur-sm animate-in fade-in zoom-in rounded-3xl">
          <div className="w-16 h-16 relative mb-6">
            <div className="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-900 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 dark:border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
            <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent text-center px-4">
            {brandDna.identity?.companyName ? `מייצר מוצר דגל עבור ${brandDna.identity.companyName}` : 'מייצר מוצר דגל מותאם...'}
          </h4>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2 text-center">
            <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
            בונה 6 נקודות כאב, 3 קהלים, 6 יתרונות, 10 שאלות ותשובות ונתוני SEO + AI...
          </p>
        </div>
      )}
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Box className="w-4 h-4 text-indigo-500" />
        מוצרי דגל
      </h3>

      <div className="space-y-3 mb-4 flex-1">
        {products.map((prod) => (
          <div
            key={prod.id}
            className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            onClick={() => setActiveProduct(prod)}
          >
            <div className="flex-1 flex flex-col">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-1">{prod.nameAndSlogan}</span>
              {prod.shortDescription && <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{prod.shortDescription}</span>}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeProduct(prod.id);
              }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-all shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-auto">
        <input
          type="text"
          value={newIdea}
          onChange={(e) => setNewIdea(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerateIdea()}
          placeholder="לדוגמה: קורס דיגיטלי לניהול זמן..."
          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
        <button
          onClick={handleGenerateIdea}
          disabled={isGenerating || !newIdea.trim()}
          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {isGenerating ? (
            <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          שליחה ל-AI
        </button>
      </div>

      {activeProduct && (
        <FlagshipProductModal
          product={activeProduct}
          onClose={() => setActiveProduct(null)}
          onSave={handleSaveProduct}
        />
      )}

      <EntitlementNoticeModal
        isOpen={!!entitlementNotice}
        onClose={() => setEntitlementNotice(null)}
        message={entitlementNotice || undefined}
      />
    </div>
  );
};

const RepeaterBlockEditor: React.FC<{
  title: string;
  subtitle: string;
  badgeText: string;
  items: FlagshipRepeaterItem[];
  onChange: (next: FlagshipRepeaterItem[]) => void;
  defaultIcon: string;
}> = ({ title, subtitle, badgeText, items, onChange, defaultIcon }) => {
  const updateItem = (idx: number, patch: Partial<FlagshipRepeaterItem>) => {
    const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    onChange(next);
  };

  const addItem = () => {
    onChange([
      ...items,
      {
        id: `item_${Date.now()}_${items.length + 1}`,
        title: '',
        text: '',
        icon: defaultIcon,
      },
    ]);
  };

  const removeItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{title}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
              {badgeText} ({items.length})
            </span>
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-bold flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          הוסף שדה
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <IconPickerPopover
                value={item.icon || defaultIcon}
                onChange={(icon) => updateItem(idx, { icon })}
              />
              <input
                type="text"
                value={item.title || ''}
                onChange={(e) => updateItem(idx, { title: e.target.value })}
                placeholder={`כותרת #${idx + 1}...`}
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                title="מחק פריט"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              rows={2}
              value={item.text || ''}
              onChange={(e) => updateItem(idx, { text: e.target.value })}
              placeholder="טקסט מורחב..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-y"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const FlagshipProductModal: React.FC<{
  product: FlagshipProduct;
  onClose: () => void;
  onSave: (p: FlagshipProduct) => void;
}> = ({ product, onClose, onSave }) => {
  const { brandDna } = useBrandDna();
  const ogFileInputRef = useRef<HTMLInputElement>(null);

  const normalizeProductDraft = (p: FlagshipProduct): FlagshipProduct => {
    const gallery =
      Array.isArray(p.galleryImages) && p.galleryImages.length > 0
        ? p.galleryImages
        : p.imageUrl
          ? [p.imageUrl]
          : [];

    return {
      ...p,
      galleryImages: gallery,
      imageUrl: gallery[0] || p.imageUrl || '',
      painPoints: ensureRepeaterItems(p.painPoints, p.painPointSolved, 6, 'pain', 'AlertCircle', 'נקודת כאב'),
      targetAudiences: ensureRepeaterItems(p.targetAudiences, p.targetAudience, 3, 'aud', 'Users', 'קהל יעד'),
      competitiveAdvantages: ensureRepeaterItems(
        p.competitiveAdvantages,
        p.competitiveAdvantage,
        6,
        'adv',
        'Award',
        'יתרון'
      ),
      faqs: ensureFaqItems(p.faqs, 10),
      seo: {
        slug: p.seo?.slug || p.linkedPageSlug || '',
        metaTitle: p.seo?.metaTitle || `${p.nameAndSlogan || ''} | ${brandDna.identity?.companyName || ''}`.trim(),
        metaDescription: p.seo?.metaDescription || p.shortDescription || '',
        keywords: p.seo?.keywords || '',
        ogImage: p.seo?.ogImage || '',
        aiKnowledgeSummary: p.seo?.aiKnowledgeSummary || '',
        aiTargetQuestions: p.seo?.aiTargetQuestions || [],
        aiEntitySchemaType: p.seo?.aiEntitySchemaType || 'Service',
        aiBotIndexingEnabled: p.seo?.aiBotIndexingEnabled !== false,
      },
    };
  };

  const [draft, setDraft] = useState<FlagshipProduct>(() => normalizeProductDraft(product));
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [isFillingAi, setIsFillingAi] = useState(false);
  const [ogError, setOgError] = useState<string | null>(null);
  const [pageSuccessMsg, setPageSuccessMsg] = useState<string | null>(null);
  const [entitlementNotice, setEntitlementNotice] = useState<string | null>(null);

  useEffect(() => {
    setDraft(normalizeProductDraft(product));
  }, [product]);

  const { getCapability } = useHostCapabilities();
  const pageBuilder = getCapability<PageBuilderContract>('page-builder');
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');

  const syncLegacyStrings = (d: FlagshipProduct): FlagshipProduct => {
    const painStr = (d.painPoints || [])
      .filter((x) => x.title || x.text)
      .map((x) => `${x.title}: ${x.text}`)
      .join(' | ');
    const audStr = (d.targetAudiences || [])
      .filter((x) => x.title || x.text)
      .map((x) => `${x.title}: ${x.text}`)
      .join(' | ');
    const advStr = (d.competitiveAdvantages || [])
      .filter((x) => x.title || x.text)
      .map((x) => `${x.title}: ${x.text}`)
      .join(' | ');
    const gallery = d.galleryImages || [];
    return {
      ...d,
      imageUrl: gallery[0] || d.imageUrl || '',
      painPointSolved: painStr || d.painPointSolved,
      targetAudience: audStr || d.targetAudience,
      competitiveAdvantage: advStr || d.competitiveAdvantage,
    };
  };

  const handleAutoFillWithAi = async () => {
    if (!draft.nameAndSlogan?.trim()) return;
    setIsFillingAi(true);
    try {
      const result = await generateAiFlagshipProduct(draft.nameAndSlogan, brandDna);
      if (result) {
        const enriched: FlagshipProduct = syncLegacyStrings({
          ...draft,
          nameAndSlogan: result.nameAndSlogan || draft.nameAndSlogan,
          shortDescription: result.shortDescription || draft.shortDescription,
          longDescription: result.longDescription || draft.longDescription,
          painPoints: result.painPoints || draft.painPoints,
          targetAudiences: result.targetAudiences || draft.targetAudiences,
          competitiveAdvantages: result.competitiveAdvantages || draft.competitiveAdvantages,
          faqs: result.faqs || draft.faqs,
          seo: {
            ...draft.seo,
            ...result.seo,
            ogImage: draft.seo?.ogImage || result.seo?.ogImage || '',
          },
        });
        setDraft(enriched);
        onSave(enriched);
      } else {
        setEntitlementNotice('אין לכם את האפשרות הזו בסל. לשדרוג החבילה והפעלת יכולות AI, פנו למנהל המערכת.');
      }
    } finally {
      setIsFillingAi(false);
    }
  };

  const updateField = <K extends keyof FlagshipProduct>(field: K, value: FlagshipProduct[K]) => {
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

  const save = () => {
    const synced = syncLegacyStrings(draft);
    setDraft(synced);
    onSave(synced);
    return synced;
  };

  // הוספת תמונות לגלריית המוצר מספריית המדיה
  const handleAddGalleryImages = async () => {
    if (mediaPicker?.openPicker) {
      const selected = await mediaPicker.openPicker({ accept: 'image/*', multiple: true, maxFiles: 12 });
      if (selected) {
        const rawList = Array.isArray(selected) ? selected : [selected];
        const urls = rawList
          .map((item) => (typeof item === 'string' ? item : (item as any)?.url))
          .filter((u): u is string => typeof u === 'string' && u.trim().length > 0);
        if (urls.length > 0) {
          const nextGallery = [...(draft.galleryImages || []), ...urls];
          setDraft((prev) => ({
            ...prev,
            galleryImages: nextGallery,
            imageUrl: nextGallery[0] || '',
          }));
        }
      }
    } else {
      const inputUrl = prompt('הזן כתובת תמונה להוספה לגלריה:');
      if (inputUrl && inputUrl.trim()) {
        const nextGallery = [...(draft.galleryImages || []), inputUrl.trim()];
        setDraft((prev) => ({
          ...prev,
          galleryImages: nextGallery,
          imageUrl: nextGallery[0] || '',
        }));
      }
    }
  };

  const handleRemoveGalleryImage = (idx: number) => {
    const nextGallery = (draft.galleryImages || []).filter((_, i) => i !== idx);
    setDraft((prev) => ({
      ...prev,
      galleryImages: nextGallery,
      imageUrl: nextGallery[0] || '',
    }));
  };

  // בחירת קישור תמונת שיתוף ברשתות מהגלריה - מוגבל ל-JPG בלבד ופחות מ-100KB
  const handlePickOgImageFromGallery = async () => {
    setOgError(null);
    if (mediaPicker?.openPicker) {
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
    } else {
      ogFileInputRef.current?.click();
    }
  };

  // העלאת קובץ JPG עד 100KB מהמחשב עבור קישור שיתוף ברשתות
  const handleOgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOgError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const isMimeJpg = file.type === 'image/jpeg' || file.type === 'image/jpg';
    const isExtJpg = /\.(jpg|jpeg)$/i.test(file.name);
    if (!isMimeJpg && !isExtJpg) {
      setOgError('שגיאה: מותר להעלות קובץ JPG בלבד (.jpg / .jpeg) עבור הקישור שנשלח ברשתות.');
      e.target.value = '';
      return;
    }

    if (file.size > 100 * 1024) {
      const kb = Math.round(file.size / 1024);
      setOgError(`שגיאה: משקל הקובץ (${kb}KB) חורג מהמותר! חובה להעלות קובץ JPG במשקל פחות מ-100KB.`);
      e.target.value = '';
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

  const handleCreatePage = async () => {
    if (!pageBuilder) {
      setEntitlementNotice('אין לכם את האפשרות הזו בסל. לשדרוג החבילה והפעלת בונה האתרים, פנו למנהל המערכת.');
      return;
    }

    const syncedDraft = save();
    setIsCreatingPage(true);
    setPageSuccessMsg(null);
    try {
      const res = await pageBuilder.createPageFromProduct({
        product: syncedDraft,
        brandDna,
      });

      if (res.success) {
        const updatedDraft: FlagshipProduct = {
          ...syncedDraft,
          linkedPageId: res.pageId,
          linkedPageSlug: res.slug,
          seo: {
            ...(syncedDraft.seo || {}),
            slug: res.slug,
          },
        };
        setDraft(updatedDraft);
        onSave(updatedDraft);
        setPageSuccessMsg(`העמוד נפרס בהצלחה מתוך נתוני המוצר (/p/${res.slug}) ללא קריאת AI!`);
      } else {
        setEntitlementNotice(res.error || 'שגיאה ביצירת העמוד בבונה העמודים.');
      }
    } catch (err: any) {
      console.error('Failed to create page from product:', err);
      setEntitlementNotice(err?.message || 'שגיאה ביצירת העמוד בבונה העמודים.');
    } finally {
      setIsCreatingPage(false);
    }
  };

  const updateFaqItem = (idx: number, patch: Partial<FlagshipFaqItem>) => {
    const next = (draft.faqs || []).map((f, i) => (i === idx ? { ...f, ...patch } : f));
    updateField('faqs', next);
  };

  const addFaqItem = () => {
    updateField('faqs', [
      ...(draft.faqs || []),
      {
        id: `faq_${Date.now()}`,
        question: '',
        answer: '',
        icon: 'HelpCircle',
      },
    ]);
  };

  const removeFaqItem = (idx: number) => {
    updateField(
      'faqs',
      (draft.faqs || []).filter((_, i) => i !== idx)
    );
  };

  // בקרת לשוניות נפתחות (אקורדיון) – ברירת מחדל: ללא אף לשונית פתוחה, ופתיחה של רק אחת בכל פעם
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setOpenSection((prev) => (prev === sectionId ? null : sectionId));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in font-sans" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
        
        {/* Modal Top Header - קומפקטי ומותאם מובייל ודסקטופ */}
        <div className="p-3.5 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/30 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm">
              <Box className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {draft.nameAndSlogan || 'מוצר דגל חדש'}
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                7 אזורי תוכן בלשוניות נפתחות (אקורדיון מודולרי)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleAutoFillWithAi}
              disabled={isFillingAi || !draft.nameAndSlogan?.trim()}
              className="px-2.5 sm:px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 text-indigo-600 dark:text-indigo-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="מלא שדות עם AI"
            >
              {isFillingAi ? (
                <div className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-500 rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{isFillingAi ? 'ממלא...' : 'מלא שדות עם AI'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                save();
                onClose();
              }}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black flex items-center gap-1.5 transition-colors shadow-sm"
              title="שמור שינויים"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">שמור</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="סגור חלון"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body - לשוניות אקורדיון נפתחות בלבד */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2.5 custom-scrollbar">

          {/* הודעת פריסת עמוד הצלחה */}
          {pageSuccessMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between shrink-0 animate-fadeIn">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate">{pageSuccessMsg}</span>
              </div>
              {draft.linkedPageSlug && (
                <a
                  href={`/p/${draft.linkedPageSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline flex items-center gap-1 shrink-0 text-emerald-600 dark:text-emerald-400 mr-2"
                >
                  <span>פתח עמוד (/p/{draft.linkedPageSlug})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {/* 1. פרטי המוצר והסלוגן */}
          <div className="w-full flex flex-col rounded-2xl border overflow-hidden transition-all border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <button
              type="button"
              onClick={() => toggleSection('general')}
              className={`w-full min-h-[50px] px-3.5 sm:px-4 py-3 flex items-center justify-between font-bold text-xs sm:text-sm cursor-pointer transition-all ${
                openSection === 'general'
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                  openSection === 'general'
                    ? 'bg-indigo-500 text-white border-indigo-600 shadow-sm'
                    : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-800/50'
                }`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-right truncate">
                  <span className="font-black text-xs sm:text-sm block sm:inline">פרטי המוצר והסלוגן</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block sm:inline sm:mr-2 truncate">
                    שם המוצר, סלוגן, תיאור קצר (Hero) ותיאור מורחב
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  draft.nameAndSlogan
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                }`}>
                  {draft.nameAndSlogan ? 'מוגדר' : 'נדרש'}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openSection === 'general' ? 'rotate-180 text-indigo-500' : ''
                }`} />
              </div>
            </button>

            {openSection === 'general' && (
              <div className="p-3.5 sm:p-5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/40 space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                      שם המוצר + סלוגן
                    </label>
                    <input
                      type="text"
                      value={draft.nameAndSlogan}
                      onChange={(e) => updateField('nameAndSlogan', e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                      תיאור קצר (Hero Subtitle)
                    </label>
                    <input
                      type="text"
                      value={draft.shortDescription}
                      onChange={(e) => updateField('shortDescription', e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                    תיאור ארוך ומעמיק עבור העמוד, SEO וקידום AI
                  </label>
                  <textarea
                    value={draft.longDescription}
                    onChange={(e) => updateField('longDescription', e.target.value)}
                    rows={3}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none leading-relaxed shadow-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. 6 נקודות כאב */}
          <div className="w-full flex flex-col rounded-2xl border overflow-hidden transition-all border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <button
              type="button"
              onClick={() => toggleSection('painPoints')}
              className={`w-full min-h-[50px] px-3.5 sm:px-4 py-3 flex items-center justify-between font-bold text-xs sm:text-sm cursor-pointer transition-all ${
                openSection === 'painPoints'
                  ? 'bg-rose-50/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                  openSection === 'painPoints'
                    ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                    : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50'
                }`}>
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="text-right truncate">
                  <span className="font-black text-xs sm:text-sm block sm:inline">נקודות הכאב שהמוצר פותר</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block sm:inline sm:mr-2 truncate">
                    עד 6 נקודות כאב עם אייקונים מספריית האייקונים
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                  {(draft.painPoints || []).length} / 6 פריטים
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openSection === 'painPoints' ? 'rotate-180 text-rose-500' : ''
                }`} />
              </div>
            </button>

            {openSection === 'painPoints' && (
              <div className="p-3.5 sm:p-5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/40 space-y-4 animate-in fade-in duration-150">
                <RepeaterBlockEditor
                  title="נקודות הכאב שהמוצר פותר"
                  subtitle="שדות טקסט מורחבים וחוזרים עם אייקונים (מומלץ: 6 נקודות כאב)"
                  badgeText="יעד: 6 נקודות כאב"
                  items={draft.painPoints || []}
                  onChange={(next) => updateField('painPoints', next)}
                  defaultIcon="AlertCircle"
                />
              </div>
            )}
          </div>

          {/* 3. 3 קהלי יעד */}
          <div className="w-full flex flex-col rounded-2xl border overflow-hidden transition-all border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <button
              type="button"
              onClick={() => toggleSection('targetAudiences')}
              className={`w-full min-h-[50px] px-3.5 sm:px-4 py-3 flex items-center justify-between font-bold text-xs sm:text-sm cursor-pointer transition-all ${
                openSection === 'targetAudiences'
                  ? 'bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                  openSection === 'targetAudiences'
                    ? 'bg-blue-500 text-white border-blue-600 shadow-sm'
                    : 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50'
                }`}>
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-right truncate">
                  <span className="font-black text-xs sm:text-sm block sm:inline">קהלי היעד של המוצר</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block sm:inline sm:mr-2 truncate">
                    עד 3 קהלי יעד ממוקדים עם אייקונים
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                  {(draft.targetAudiences || []).length} / 3 קהלים
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openSection === 'targetAudiences' ? 'rotate-180 text-blue-500' : ''
                }`} />
              </div>
            </button>

            {openSection === 'targetAudiences' && (
              <div className="p-3.5 sm:p-5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/40 space-y-4 animate-in fade-in duration-150">
                <RepeaterBlockEditor
                  title="קהלי היעד של המוצר"
                  subtitle="שדות טקסט מורחבים וחוזרים עם אייקונים (מומלץ: 3 קהלי יעד מובחנים)"
                  badgeText="יעד: 3 קהלים"
                  items={draft.targetAudiences || []}
                  onChange={(next) => updateField('targetAudiences', next)}
                  defaultIcon="Users"
                />
              </div>
            )}
          </div>

          {/* 4. 6 יתרונות תחרותיים */}
          <div className="w-full flex flex-col rounded-2xl border overflow-hidden transition-all border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <button
              type="button"
              onClick={() => toggleSection('competitiveAdvantages')}
              className={`w-full min-h-[50px] px-3.5 sm:px-4 py-3 flex items-center justify-between font-bold text-xs sm:text-sm cursor-pointer transition-all ${
                openSection === 'competitiveAdvantages'
                  ? 'bg-amber-50/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                  openSection === 'competitiveAdvantages'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50'
                }`}>
                  <Award className="w-4 h-4" />
                </div>
                <div className="text-right truncate">
                  <span className="font-black text-xs sm:text-sm block sm:inline">יתרונות תחרותיים</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block sm:inline sm:mr-2 truncate">
                    עד 6 יתרונות ומעלות על פני המתחרים
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                  {(draft.competitiveAdvantages || []).length} / 6 יתרונות
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openSection === 'competitiveAdvantages' ? 'rotate-180 text-amber-500' : ''
                }`} />
              </div>
            </button>

            {openSection === 'competitiveAdvantages' && (
              <div className="p-3.5 sm:p-5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/40 space-y-4 animate-in fade-in duration-150">
                <RepeaterBlockEditor
                  title="היתרונות והמעלות על פני המתחרים"
                  subtitle="שדות טקסט מורחבים וחוזרים עם אייקונים (מומלץ: 6 יתרונות בולטים)"
                  badgeText="יעד: 6 יתרונות"
                  items={draft.competitiveAdvantages || []}
                  onChange={(next) => updateField('competitiveAdvantages', next)}
                  defaultIcon="Award"
                />
              </div>
            )}
          </div>

          {/* 5. 10 שאלות ותשובות (FAQ) */}
          <div className="w-full flex flex-col rounded-2xl border overflow-hidden transition-all border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <button
              type="button"
              onClick={() => toggleSection('faqs')}
              className={`w-full min-h-[50px] px-3.5 sm:px-4 py-3 flex items-center justify-between font-bold text-xs sm:text-sm cursor-pointer transition-all ${
                openSection === 'faqs'
                  ? 'bg-violet-50/70 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300'
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                  openSection === 'faqs'
                    ? 'bg-violet-500 text-white border-violet-600 shadow-sm'
                    : 'bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 border-violet-200/50 dark:border-violet-800/50'
                }`}>
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="text-right truncate">
                  <span className="font-black text-xs sm:text-sm block sm:inline">שאלות ותשובות נפוצות (FAQ)</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block sm:inline sm:mr-2 truncate">
                    עד 10 שאלות ותשובות עבור אזור השו״ת בעמוד המוצר ולסכמת ה-AI
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                  {(draft.faqs || []).length} / 10 שאלות
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openSection === 'faqs' ? 'rotate-180 text-violet-500' : ''
                }`} />
              </div>
            </button>

            {openSection === 'faqs' && (
              <div className="p-3.5 sm:p-5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/40 space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    שאלות ותשובות מפורטות
                  </span>
                  <button
                    type="button"
                    onClick={addFaqItem}
                    className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>הוסף שאלה</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(draft.faqs || []).map((faq, idx) => (
                    <div
                      key={faq.id || idx}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <IconPickerPopover
                          value={faq.icon || 'HelpCircle'}
                          onChange={(icon) => updateFaqItem(idx, { icon })}
                        />
                        <input
                          type="text"
                          value={faq.question || ''}
                          onChange={(e) => updateFaqItem(idx, { question: e.target.value })}
                          placeholder={`שאלה #${idx + 1}...`}
                          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                        />
                        <button
                          type="button"
                          onClick={() => removeFaqItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                          title="מחק שאלה"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={faq.answer || ''}
                        onChange={(e) => updateFaqItem(idx, { answer: e.target.value })}
                        placeholder="תשובה מפורטת ומדויקת..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-y"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 6. גלריית תמונות מוצר (מרובת תמונות) */}
          <div className="w-full flex flex-col rounded-2xl border overflow-hidden transition-all border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <button
              type="button"
              onClick={() => toggleSection('gallery')}
              className={`w-full min-h-[50px] px-3.5 sm:px-4 py-3 flex items-center justify-between font-bold text-xs sm:text-sm cursor-pointer transition-all ${
                openSection === 'gallery'
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                  openSection === 'gallery'
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50'
                }`}>
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div className="text-right truncate">
                  <span className="font-black text-xs sm:text-sm block sm:inline">גלריית תמונות המוצר ומדיה</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block sm:inline sm:mr-2 truncate">
                    תמונה ראשית וגלריית תמונות מתוך KosCloudStore
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                  {(draft.galleryImages || []).length} תמונות
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openSection === 'gallery' ? 'rotate-180 text-emerald-500' : ''
                }`} />
              </div>
            </button>

            {openSection === 'gallery' && (
              <div className="p-3.5 sm:p-5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/40 space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    תמונות הגלריה והתמונה הראשית
                  </span>
                  <button
                    type="button"
                    onClick={handleAddGalleryImages}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>הוסף תמונות מ-KosCloudStore</span>
                  </button>
                </div>

                {(draft.galleryImages || []).length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {(draft.galleryImages || []).map((imgUrl, idx) => (
                      <div
                        key={`${imgUrl}_${idx}`}
                        className="relative group aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900"
                      >
                        <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-indigo-600/90 text-white text-[10px] font-bold">
                            תמונה ראשית
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="absolute top-1.5 left-1.5 p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-all"
                          title="הסר תמונה מהגלריה"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddGalleryImages}
                    className="w-full h-28 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 transition-colors gap-1.5"
                  >
                    <ImageIcon className="w-6 h-6 text-indigo-400" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      בחר תמונות מספריית המדיה להוספה לגלריית המוצר
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 7. הגדרות SEO + קידום בינה מלאכותית (AIO/GEO) + תמונת שיתוף JPG < 100KB */}
          <div className="w-full flex flex-col rounded-2xl border overflow-hidden transition-all border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <button
              type="button"
              onClick={() => toggleSection('seo')}
              className={`w-full min-h-[50px] px-3.5 sm:px-4 py-3 flex items-center justify-between font-bold text-xs sm:text-sm cursor-pointer transition-all ${
                openSection === 'seo'
                  ? 'bg-teal-50/70 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300'
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                  openSection === 'seo'
                    ? 'bg-teal-500 text-white border-teal-600 shadow-sm'
                    : 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border-teal-200/50 dark:border-teal-800/50'
                }`}>
                  <Globe className="w-4 h-4" />
                </div>
                <div className="text-right truncate">
                  <span className="font-black text-xs sm:text-sm block sm:inline">הגדרות SEO וקידום AI (AIO / GEO)</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block sm:inline sm:mr-2 truncate">
                    סלאג, Meta, תמונת שיתוף JPG &lt; 100KB ושאלות יעד ל-AI
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-mono">
                  {draft.seo?.slug ? `/p/${draft.seo.slug}` : 'SEO'}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openSection === 'seo' ? 'rotate-180 text-teal-500' : ''
                }`} />
              </div>
            </button>

            {openSection === 'seo' && (
              <div className="p-3.5 sm:p-5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/40 space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                      סלאג URL (אותיות באנגלית ומקפים בלבד)
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={draft.seo?.slug || ''}
                      onChange={(e) =>
                        updateSeoField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
                      }
                      placeholder="master-package"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                      סוג ישות סכמה עבור מנועי חיפוש ו-AI
                    </label>
                    <select
                      value={draft.seo?.aiEntitySchemaType || 'Product'}
                      onChange={(e) => updateSeoField('aiEntitySchemaType', e.target.value as any)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="Product">Product (מוצר פיזי או דיגיטלי)</option>
                      <option value="Service">Service (שירות / תוכנית)</option>
                      <option value="Course">Course (קורס / הכשרה)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                      כותרת מטא לגוגל (Meta Title)
                    </label>
                    <input
                      type="text"
                      value={draft.seo?.metaTitle || ''}
                      onChange={(e) => updateSeoField('metaTitle', e.target.value)}
                      placeholder="כותרת מפתה למנועי חיפוש..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                      מילות מפתח (Keywords)
                    </label>
                    <input
                      type="text"
                      value={
                        Array.isArray(draft.seo?.keywords)
                          ? draft.seo.keywords.join(', ')
                          : draft.seo?.keywords || ''
                      }
                      onChange={(e) => updateSeoField('keywords', e.target.value)}
                      placeholder="מילות מפתח מופרדות בפסיקים..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    תיאור מטא לגוגל (Meta Description)
                  </label>
                  <textarea
                    rows={2}
                    value={draft.seo?.metaDescription || ''}
                    onChange={(e) => updateSeoField('metaDescription', e.target.value)}
                    placeholder="תיאור תמציתי וממיר של עד 160 תווים..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white resize-y"
                  />
                </div>

                {/* תמונת שיתוף לרשתות חברתיות - JPG בלבד ופחות מ-100KB */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                        תמונת שיתוף לרשתות החברתיות (Social OG Image)
                      </label>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                        מוגבל לקובץ JPG בלבד (.jpg / .jpeg) במשקל פחות מ-100KB לטעינה מהירה
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        ref={ogFileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,image/jpeg"
                        className="hidden"
                        onChange={handleOgFileUpload}
                      />
                      <button
                        type="button"
                        onClick={handlePickOgImageFromGallery}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-indigo-500" />
                        <span>בחר מהגלריה</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => ogFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>העלה JPG</span>
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
                    <div className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <img
                        src={draft.seo.ogImage}
                        alt="OG Preview"
                        className="w-16 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate block">
                          תמונת שיתוף פעילה (JPG &lt; 100KB)
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

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                      תקציר ידע בלעדי לסוכני AI (AIO Knowledge Grounding)
                    </label>
                    <textarea
                      rows={2}
                      value={draft.seo?.aiKnowledgeSummary || ''}
                      onChange={(e) => updateSeoField('aiKnowledgeSummary', e.target.value)}
                      placeholder="פסקה עובדתית עשירה שמנועי AI יצטטו ישירות..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white resize-y"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                      שאלות מפתח לקידום ב-AI (שאלה בכל שורה)
                    </label>
                    <textarea
                      rows={3}
                      value={(draft.seo?.aiTargetQuestions || []).join('\n')}
                      onChange={(e) =>
                        updateSeoField(
                          'aiTargetQuestions',
                          e.target.value
                            .split('\n')
                            .map((q) => q.trim())
                            .filter(Boolean)
                        )
                      }
                      placeholder="איך מצטרפים לתוכנית?&#10;למי המוצר מתאים?"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white resize-y"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer Controls - רספונסיבי למובייל ודסקטופ */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 sticky bottom-0 z-20 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCreatePage}
              disabled={isCreatingPage}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-3.5 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {isCreatingPage ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <LayoutTemplate className="w-4 h-4" />
              )}
              <span>
                {draft.linkedPageId
                  ? 'עדכן עמוד נחיתה מנתוני המוצר (ללא AI)'
                  : 'צור עמוד נחיתה מנתוני המוצר (ללא AI)'}
              </span>
            </button>

            {draft.linkedPageId && (
              <a
                href={`/p/${draft.linkedPageSlug || draft.linkedPageId}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline px-2 py-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>צפה בעמוד המוצר</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              ביטול
            </button>
            <button
              type="button"
              onClick={() => {
                save();
                onClose();
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
            >
              שמור מוצר
            </button>
          </div>
        </div>
      </div>

      <EntitlementNoticeModal
        isOpen={!!entitlementNotice}
        onClose={() => setEntitlementNotice(null)}
        message={entitlementNotice || undefined}
      />
    </div>
  );
};
