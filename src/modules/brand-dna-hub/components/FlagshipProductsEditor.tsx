import React, { useState } from 'react';
import { Box, Sparkles, Trash2, Image as ImageIcon, ExternalLink, X, Plus, LayoutTemplate } from 'lucide-react';
import { useBrandDna } from '../hooks/useBrandDna';
import { generateAiFlagshipProduct } from '../services/geminiBrandPrompt';
import { FlagshipProduct } from '../types/brandDna';

export const FlagshipProductsEditor: React.FC = () => {
  const { brandDna, setFullBrandDna, updateAudience } = useBrandDna();
  const rawProducts = brandDna.ecosystem?.products || [];
  
  // Normalize products (some might be strings from legacy)
  const products: FlagshipProduct[] = rawProducts.map(p => {
    if (typeof p === 'string') {
      return {
        id: `prod-${Date.now()}-${Math.random()}`,
        nameAndSlogan: p,
        shortDescription: '',
        longDescription: '',
        imageUrl: '',
        painPointSolved: '',
        targetAudience: '',
        competitiveAdvantage: ''
      };
    }
    return p as FlagshipProduct;
  });

  const [newIdea, setNewIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeProduct, setActiveProduct] = useState<FlagshipProduct | null>(null);
  
  const handleSaveProduct = (updated: FlagshipProduct) => {
    const isNew = !products.find(p => p.id === updated.id);
    let newProducts = [];
    if (isNew) {
      newProducts = [...products, updated];
    } else {
      newProducts = products.map(p => p.id === updated.id ? updated : p);
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
        products: newProducts
      }
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
        imageUrl: ''
      };
      handleSaveProduct(newProduct);
      setNewIdea('');
      setActiveProduct(newProduct); // Open modal for the new product
    }
  };

  const removeProduct = (id: string) => {
    const newProducts = products.filter(p => p.id !== id);
    setFullBrandDna({
      ...brandDna,
      ecosystem: {
        ...(brandDna.ecosystem || { services: [], products: [], annualEvents: [], communities: [] }),
        products: newProducts
      }
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-full flex flex-col">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Box className="w-4 h-4 text-indigo-500" />
        מוצרי דגל
      </h3>
      
      <div className="space-y-3 mb-4 flex-1">
        {products.map((prod) => (
          <div key={prod.id} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group" onClick={() => setActiveProduct(prod)}>
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
    </div>
  );
};

const FlagshipProductModal: React.FC<{ product: FlagshipProduct, onClose: () => void, onSave: (p: FlagshipProduct) => void }> = ({ product, onClose, onSave }) => {
  const [draft, setDraft] = useState<FlagshipProduct>(product);
  
  const updateField = (field: keyof FlagshipProduct, value: string) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  };

  const save = () => {
    onSave(draft);
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
            <input type="text" value={draft.nameAndSlogan} onChange={e => updateField('nameAndSlogan', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">תיאור קצר</label>
            <input type="text" value={draft.shortDescription} onChange={e => updateField('shortDescription', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">תיאור ארוך (SEO ו-GEO - קידום AI)</label>
            <textarea value={draft.longDescription} onChange={e => updateField('longDescription', e.target.value)} rows={4} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">נקודת הכאב שהמוצר פותר</label>
              <textarea value={draft.painPointSolved} onChange={e => updateField('painPointSolved', e.target.value)} rows={3} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">המעלה על המתחרים</label>
              <textarea value={draft.competitiveAdvantage} onChange={e => updateField('competitiveAdvantage', e.target.value)} rows={3} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white resize-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">קהל היעד שמתאים</label>
            <input type="text" value={draft.targetAudience} onChange={e => updateField('targetAudience', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white" />
            <p className="text-[10px] text-emerald-500 mt-1">יתווסף אוטומטית לקולקציית קהלי היעד אם אינו קיים.</p>
          </div>

          <div>
             <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">תמונת מוצר (ספריית מדיה)</label>
             <div className="flex items-center gap-3">
               {draft.imageUrl ? (
                 <img src={draft.imageUrl} alt="Product" className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
               ) : (
                 <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700">
                    <ImageIcon className="w-6 h-6 text-slate-400" />
                 </div>
               )}
               <div className="flex-1">
                 <input type="text" value={draft.imageUrl} onChange={e => updateField('imageUrl', e.target.value)} placeholder="הכנס כתובת תמונה או העלה מהמדיה..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white" />
                 <p className="text-[10px] text-slate-400 mt-1">ניתן להדביק קישור ישיר מספריית המדיה.</p>
               </div>
             </div>
          </div>

        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between mt-auto">
           {draft.linkedPageId ? (
             <a href={`/page-builder?page=${draft.linkedPageId}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
               <ExternalLink className="w-4 h-4" />
               צפה בעמוד הנחיתה של המוצר
             </a>
           ) : (
             <button onClick={() => alert('חיבור ליוצר העמודים מיושם תחת PageBuilderContext ויעודכן בקרוב!')} className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
               <LayoutTemplate className="w-4 h-4" />
               צור עמוד נחיתה למוצר ביוצר העמודים
             </button>
           )}
           <div className="flex gap-2">
             <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
               ביטול
             </button>
             <button onClick={() => { save(); onClose(); }} className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-lg shadow-indigo-500/20">
               שמור מוצר
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
