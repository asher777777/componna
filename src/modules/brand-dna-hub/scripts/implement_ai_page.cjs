const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/components/FlagshipProductsEditor.tsx', 'utf8');

if (!c.includes('aiPageGenerator')) {
  c = c.replace(/import \{ MediaPickerModal \} from '\.\.\/\.\.\/media-gallery-hub\/components\/MediaPickerModal';/, 
    'import { MediaPickerModal } from \'../../media-gallery-hub/components/MediaPickerModal\';\nimport { aiPageGenerator } from \'../../page-builder/services/aiPageGenerator\';');
}

const handleCreatePageRegex = /const handleCreatePage = async \(\) => \{[\s\S]*?finally \{\s*setIsCreatingPage\(false\);\s*\}\s*\};/;
const newHandleCreatePage = `const [generationStep, setGenerationStep] = useState<string>('');

  const handleCreatePage = async () => {
    setIsCreatingPage(true);
    setGenerationStep('מתחבר ל-AI ויוצר מבנה עמוד נחיתה אופטימלי למוצר...');
    try {
      const prompt = \`צור עמוד נחיתה מלא וממיר עבור מוצר הדגל הבא:
שם המוצר: \${draft.nameAndSlogan}
תיאור קצר: \${draft.shortDescription}
תיאור נרחב (SEO): \${draft.longDescription}
נקודות כאב שהוא פותר: \${draft.painPointSolved}
יתרון תחרותי: \${draft.competitiveAdvantage}
קהל יעד: \${draft.targetAudience}

חובה לייצר slug באנגלית על בסיס SEO לשם המוצר. עמוד הנחיתה צריך לכלול Hero מרשים (אם יש תמונה \${draft.imageUrl} השתמש בה), פירוט היתרונות, התייחסות לנקודות הכאב כ-Features, וקריאה לפעולה מרכזית.\`;

      const generatedConfig = await aiPageGenerator.generatePageLive(
        prompt, 
        brandDna,
        (step, partial) => {
          if (step === 'planning') setGenerationStep('מתכנן אסטרטגיה עסקית לעמוד...');
          if (step === 'content') setGenerationStep('כותב קופירייטינג ממיר ותוכן SEO...');
          if (step === 'designing') setGenerationStep('מעצב ומסדר בלוקים ותמונות...');
          if (step === 'finalizing') setGenerationStep('מסיים והופך את העמוד לזמין...');
        },
        { generateImages: false } // We don't want to override the product image necessarily
      );

      // Save to Firestore
      await pageBuilderFirestore.savePage(generatedConfig, db, tenantId);
      
      const updatedDraft = { ...draft, linkedPageId: generatedConfig.pageId };
      setDraft(updatedDraft);
      onSave(updatedDraft);
    } catch (err) {
      console.error('Failed to create page via AI:', err);
      alert('אירעה שגיאה ביצירת עמוד הנחיתה עם AI.');
    } finally {
      setIsCreatingPage(false);
      setGenerationStep('');
    }
  };`;

c = c.replace(handleCreatePageRegex, newHandleCreatePage);

// Also update the loading spinner to show the beautiful branded animation
const loaderRegex = /\{isCreatingPage \? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" \/> : <LayoutTemplate className="w-4 h-4" \/>\}/;
const newLoader = `{isCreatingPage ? <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" /> : <LayoutTemplate className="w-4 h-4" />}`;
c = c.replace(loaderRegex, newLoader);

const createBtnContainerRegex = /<button onClick=\{handleCreatePage\} disabled=\{isCreatingPage\} className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-50">[\s\S]*?<\/button>/;

const newCreateBtnContainer = `{isCreatingPage && (
              <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 flex flex-col items-center justify-center rounded-3xl z-50 backdrop-blur-sm animate-in fade-in zoom-in">
                <div className="w-16 h-16 relative mb-6">
                  <div className="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-900 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-600 dark:border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                  <LayoutTemplate className="w-6 h-6 text-indigo-600 dark:text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">
                  {brandDna.identity?.companyName ? \`בונה עמוד נחיתה עבור \${brandDna.identity.companyName}\` : 'בונה עמוד נחיתה מותאם...'}
                </h4>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                  {generationStep || 'מנתח נתוני מוצר...'}
                </p>
              </div>
            )}
            <button onClick={handleCreatePage} disabled={isCreatingPage} className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-50">
               {isCreatingPage ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : <LayoutTemplate className="w-4 h-4" />}
               צור עמוד נחיתה אוטומטי למוצר (AI)
            </button>`;

c = c.replace(createBtnContainerRegex, newCreateBtnContainer);

fs.writeFileSync('src/modules/brand-dna-hub/components/FlagshipProductsEditor.tsx', c);
