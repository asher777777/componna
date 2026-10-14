import React, { useState, useEffect } from 'react';
import {
  Box,
  Sparkles,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
  X,
  LayoutTemplate,
  CheckCircle2,
} from 'lucide-react';
import { useBrandDna } from '../hooks/useBrandDna';
import { generateAiFlagshipProduct } from '../services/geminiBrandPrompt';
import { FlagshipProduct } from '../types/brandDna';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { PageBuilderContract, MediaPickerContract } from '../../../core/contracts';

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
          יכולת זו אינה פעילה בחבילתכם
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

const CREATION_HEADLINES = [
  {
    title: 'מנתח את קהל היעד והיתרונות התחרותיים...',
    subtitle: 'חוקר את נקודות הכאב והבידול השיווקי של המוצר להמרה מקסימלית',
    tag: 'מחקר שוק וקהל',
  },
  {
    title: 'מנסח כותרת Hero עוצמתית והנעה לפעולה...',
    subtitle: 'מגבש פתיחה מושכת שמניעה את המבקרים לביצוע פעולה מיידית',
    tag: 'קופירייטינג שיווקי',
  },
  {
    title: 'בונה סקציית תועלות ומענה להתנגדויות...',
    subtitle: 'מפרק את חששות הלקוח ומבליט את ערך המוצר על פני המתחרים',
    tag: 'מבנה תועלות ומכירה',
  },
  {
    title: 'משלב הוכחה חברתית ומסגרת אמון...',
    subtitle: 'יוצר עדויות לקוחות, אלמנטים של ביטחון ואימות נתונים',
    tag: 'אמון והוכחה חברתית',
  },
  {
    title: 'מזרים את צבעי המותג והשפה מה-Brand DNA...',
    subtitle: 'מתאים פלטת צבעים, טיפוגרפיה וכפתורים לפי זהות המותג המוגדרת',
    tag: 'התאמת שפה מיתוגית',
  },
  {
    title: 'מבצע אופטימיזציית SEO ומקים את העמוד בשרת...',
    subtitle: 'מגדיר מטא-תגיות, כתובת אתר ידידותית ומבנה מהיר למובייל',
    tag: 'הקמה בשרת ו-SEO',
  },
];

export const FlagshipProductsEditor: React.FC = () => {
  const { brandDna, setFullBrandDna, updateAudience } = useBrandDna();
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
        painPointSolved: '',
        targetAudience: '',
        competitiveAdvantage: '',
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
    let newProducts = [];
    if (isNew) {
      newProducts = [...products, updated];
    } else {
      newProducts = products.map((p) => (p.id === updated.id ? updated : p));
    }
    
    // Auto-add target audience if not exists
    if (updated.targetAudience) {
      const existingTags = brandDna.audience.targetAudiences || [];
      if (!existingTags.includes(updated.targetAudience)) {
        updateAudience({ targetAudiences: [...existingTags, updated.targetAudience] });
      }
    }

    setFullBrandDna({
      ...brandDna,
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
        imageUrl: '',
      };
      handleSaveProduct(newProduct);
      setNewIdea('');
      setActiveProduct(newProduct); // Open modal for the new product
    } else {
      // אין תוצאה (ללא מפתח או ללא זכאות) - לא מייצרים נתוני דמה, פותחים הודעה חביבה
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
            מגבש רעיון עסקי מושלם לקהל היעד...
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
              onClick={(e) => { e.stopPropagation(); removeProduct(prod.id); }}
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

const FlagshipProductModal: React.FC<{
  product: FlagshipProduct;
  onClose: () => void;
  onSave: (p: FlagshipProduct) => void;
}> = ({ product, onClose, onSave }) => {
  const [draft, setDraft] = useState<FlagshipProduct>(product);
  const { brandDna } = useBrandDna();
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [headlineIdx, setHeadlineIdx] = useState(0);
  const [progressPercent, setProgressPercent] = useState(15);
  const [completedSteps, setCompletedSteps] = useState<number[]>([0]);
  const [entitlementNotice, setEntitlementNotice] = useState<string | null>(null);

  const { getCapability } = useHostCapabilities();
  const pageBuilder = getCapability<PageBuilderContract>('page-builder');
  const mediaPicker = getCapability<MediaPickerContract>('media-picker');

  // מחזור כותרות מתחלפות ומעניינות בזמן יצירת העמוד
  useEffect(() => {
    if (!isCreatingPage) {
      setHeadlineIdx(0);
      setProgressPercent(15);
      setCompletedSteps([0]);
      return;
    }

    const interval = setInterval(() => {
      setHeadlineIdx((prev) => {
        const next = (prev + 1) % CREATION_HEADLINES.length;
        setCompletedSteps((cur) => (cur.includes(next) ? cur : [...cur, next]));
        return next;
      });
      setProgressPercent((prev) => {
        if (prev >= 92) return 92;
        return prev + Math.floor(Math.random() * 8 + 6);
      });
    }, 2200);

    return () => clearInterval(interval);
  }, [isCreatingPage]);

  const updateField = (field: keyof FlagshipProduct, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const save = () => {
    onSave(draft);
  };

  const handlePickImage = async () => {
    if (mediaPicker?.openPicker) {
      const selected = await mediaPicker.openPicker({ accept: 'image/*' });
      if (selected) {
        const raw = Array.isArray(selected) ? selected[0] : selected;
        const url = typeof raw === 'string' ? raw : (raw as any)?.url;
        if (url && typeof url === 'string') updateField('imageUrl', url.trim());
      }
    } else {
      const inputUrl = prompt('הזן כתובת תמונה עבור מוצר זה:');
      if (inputUrl && inputUrl.trim()) {
        updateField('imageUrl', inputUrl.trim());
      }
    }
  };

  const handleCreatePage = async () => {
    if (!pageBuilder) {
      setEntitlementNotice('אין לכם את האפשרות הזו בסל. לשדרוג החבילה והפעלת יכולות AI ובונה האתרים, פנו למנהל המערכת.');
      return;
    }

    setIsCreatingPage(true);
    setGenerationStep('מתחבר למנוע ה-AI ומתחיל בניית מבנה עמוד מותאם...');
    setProgressPercent(20);
    try {
      const res = await pageBuilder.createPageFromProduct({
        product: draft,
        brandDna,
        onStep: (step) => {
          setGenerationStep(step.statusText || 'מייצר עמוד...');
          if (step.percent) setProgressPercent(step.percent);
        },
      });

      if (res.success) {
        setProgressPercent(100);
        const updatedDraft = {
          ...draft,
          linkedPageId: res.pageId,
          linkedPageSlug: res.slug,
        };
        setDraft(updatedDraft);
        onSave(updatedDraft);
      } else {
        // אין יצירת נתוני דמה! פתיחת הודעת סל חביבה במודאל
        setEntitlementNotice(
          res.error || 'אין לכם את האפשרות הזו בסל. לשדרוג החבילה והפעלת יכולות AI, פנו למנהל המערכת.'
        );
      }
    } catch (err: any) {
      console.error('Failed to create page via AI:', err);
      setEntitlementNotice(
        err?.message?.includes('סל') || err?.message?.includes('אפשרות')
          ? err.message
          : 'אין לכם את האפשרות הזו בסל. לשדרוג החבילה והפעלת יכולות AI, פנו למנהל המערכת.'
      );
    } finally {
      setIsCreatingPage(false);
      setGenerationStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative">
        <div className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Box className="w-5 h-5 text-indigo-500" />
            עריכת מוצר דגל
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">שם המוצר + סלוגן</label>
            <input type="text" value={draft.nameAndSlogan} onChange={(e) => updateField('nameAndSlogan', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">תיאור קצר</label>
            <input type="text" value={draft.shortDescription} onChange={(e) => updateField('shortDescription', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">תיאור ארוך עבור SEO וקידום AI</label>
            <textarea value={draft.longDescription} onChange={(e) => updateField('longDescription', e.target.value)} rows={3} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">נקודת הכאב שהמוצר פותר</label>
              <textarea value={draft.painPointSolved} onChange={(e) => updateField('painPointSolved', e.target.value)} rows={3} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">המעלה על המתחרים</label>
              <textarea value={draft.competitiveAdvantage} onChange={(e) => updateField('competitiveAdvantage', e.target.value)} rows={3} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white resize-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">קהל היעד שמתאים</label>
            <input type="text" value={draft.targetAudience} onChange={(e) => updateField('targetAudience', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white" />
            <p className="text-[10px] text-emerald-500 mt-1">יתווסף אוטומטית לקולקציית קהלי היעד אם אינו קיים.</p>
          </div>

          <div>
             <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">תמונת מוצר</label>
             {draft.imageUrl ? (
               <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                 <img src={draft.imageUrl} alt="Product" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button type="button" onClick={handlePickImage} className="px-4 py-2 bg-white text-slate-900 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-100 transition-colors">
                     <ImageIcon className="w-4 h-4" />
                     החלף תמונה מספריית המדיה
                   </button>
                 </div>
                 <button type="button" onClick={() => updateField('imageUrl', '')} className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-rose-500 text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
             ) : (
               <button type="button" onClick={handlePickImage} className="w-full h-32 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 transition-colors gap-2">
                  <ImageIcon className="w-8 h-8 text-indigo-400" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">בחר תמונה מספריית המדיה</span>
               </button>
             )}
          </div>

        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex flex-col md:flex-row items-center justify-between mt-auto gap-3">
           {draft.linkedPageId ? (
             <a href={`/page/${draft.linkedPageSlug || draft.linkedPageId}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
               <ExternalLink className="w-4 h-4" />
               צפה בעמוד הנחיתה של המוצר
             </a>
           ) : (
             <>
            {isCreatingPage && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center rounded-3xl z-50 p-6 animate-in fade-in zoom-in text-white text-center select-none" dir="rtl">
                {/* Glowing Futuristic Center */}
                <div className="relative w-28 h-28 mb-5 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 blur-md"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                  <div
                    className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-emerald-400 border-b-transparent border-l-transparent animate-spin"
                    style={{ animationDuration: '1.3s' }}
                  ></div>
                  <div className="flex flex-col items-center justify-center z-10">
                    <LayoutTemplate className="w-8 h-8 text-indigo-400 animate-pulse" />
                    <span className="text-xs font-black text-emerald-400 mt-1">{progressPercent}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-sm bg-slate-800 rounded-full h-2 mb-5 overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                {/* Dynamic rotating headlines */}
                <div className="min-h-[75px] max-w-lg flex flex-col items-center justify-center mb-5">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
                    {CREATION_HEADLINES[headlineIdx].tag}
                  </span>
                  <h4 className="text-lg md:text-xl font-black text-white mb-1 transition-all duration-300">
                    {generationStep || CREATION_HEADLINES[headlineIdx].title}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium max-w-sm">
                    {CREATION_HEADLINES[headlineIdx].subtitle}
                  </p>
                </div>

                {/* Step indicator chips */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-md">
                  {CREATION_HEADLINES.map((item, idx) => {
                    const isDone = completedSteps.includes(idx);
                    const isCurrent = headlineIdx === idx;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isCurrent
                            ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400 animate-pulse'
                            : 'bg-slate-900/60 text-slate-500 border border-slate-800'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                        )}
                        <span>{item.tag}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <button onClick={handleCreatePage} disabled={isCreatingPage} className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-50">
               {isCreatingPage ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : <LayoutTemplate className="w-4 h-4" />}
               צור עמוד נחיתה אוטומטי למוצר (AI)
            </button>
            </>
           )}
           <div className="flex gap-2 w-full md:w-auto">
             <button onClick={onClose} className="flex-1 md:flex-none px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
               ביטול
             </button>
             <button onClick={() => { save(); onClose(); }} className="flex-1 md:flex-none px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-lg shadow-indigo-500/20">
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
