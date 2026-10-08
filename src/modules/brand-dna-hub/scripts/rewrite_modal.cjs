const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/components/FlagshipProductsEditor.tsx', 'utf8');

const newModal = `const FlagshipProductModal: React.FC<{ product: FlagshipProduct, onClose: () => void, onSave: (p: FlagshipProduct) => void }> = ({ product, onClose, onSave }) => {
  const [draft, setDraft] = useState<FlagshipProduct>(product);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  
  const updateField = (field: keyof FlagshipProduct, value: string) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  };

  const save = () => {
    onSave(draft);
  };

  const handleCreatePage = async () => {
    setIsCreatingPage(true);
    try {
      const pageId = \`page_\${Date.now()}\`;
      const newPage: any = {
        pageId,
        pageTitle: draft.nameAndSlogan || 'מוצר חדש',
        slug: \`product-\${Date.now()}\`,
        globalSettings: { theme: 'light', fontStyle: 'modern', enableFloatingWhatsApp: true },
        seoSettings: { title: draft.nameAndSlogan, description: draft.shortDescription, keywords: [] },
        sectionOrder: ['hero-1'],
        sections: {
          'hero-1': {
            id: 'hero-1',
            type: 'hero',
            data: {
              title: draft.nameAndSlogan,
              subtitle: draft.shortDescription,
              description: draft.longDescription,
              mediaUrl: draft.imageUrl,
              primaryCtaText: 'לפרטים נוספים'
            }
          }
        }
      };
      await pageBuilderFirestore.savePage(newPage, db, tenantId);
      
      const updatedDraft = { ...draft, linkedPageId: pageId };
      setDraft(updatedDraft);
      onSave(updatedDraft);
    } catch (err) {
      console.error('Failed to create page:', err);
      alert('אירעה שגיאה ביצירת עמוד הנחיתה.');
    } finally {
      setIsCreatingPage(false);
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
               <button type="button" onClick={() => setIsMediaOpen(true)} className="shrink-0 w-16 h-16 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-600 transition-colors overflow-hidden">
                 {draft.imageUrl ? (
                   <img src={draft.imageUrl} alt="Product" className="w-full h-full object-cover" />
                 ) : (
                   <ImageIcon className="w-6 h-6 text-slate-400" />
                 )}
               </button>
               <div className="flex-1">
                 <input type="text" value={draft.imageUrl} onChange={e => updateField('imageUrl', e.target.value)} placeholder="הכנס כתובת תמונה או העלה מהמדיה..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white" />
                 <p className="text-[10px] text-slate-400 mt-1">לחץ על הריבוע כדי לפתוח את ספריית המדיה.</p>
               </div>
             </div>
          </div>

        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex flex-col md:flex-row items-center justify-between mt-auto gap-3">
           {draft.linkedPageId ? (
             <a href={\`/page-builder?page=\${draft.linkedPageId}\`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
               <ExternalLink className="w-4 h-4" />
               צפה בעמוד הנחיתה של המוצר
             </a>
           ) : (
             <button onClick={handleCreatePage} disabled={isCreatingPage} className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-50">
               {isCreatingPage ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : <LayoutTemplate className="w-4 h-4" />}
               צור עמוד נחיתה למוצר
             </button>
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
      <MediaPickerModal 
        isOpen={isMediaOpen} 
        onClose={() => setIsMediaOpen(false)} 
        onSelect={(url) => {
          updateField('imageUrl', url);
          setIsMediaOpen(false);
        }}
      />
    </div>
  );
};`;

c = c.replace(/const FlagshipProductModal: React\.FC<\{ product: FlagshipProduct, onClose: \(\) => void, onSave: \(p: FlagshipProduct\) => void \}> = \(\{ product, onClose, onSave \}\) => \{[\s\S]*\}\;\s*\}\;/, newModal);

fs.writeFileSync('src/modules/brand-dna-hub/components/FlagshipProductsEditor.tsx', c);
