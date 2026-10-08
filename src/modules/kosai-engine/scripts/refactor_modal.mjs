import fs from 'fs';

let content = fs.readFileSync('src/modules/page-builder/components/AiLivePageBuilderModal.tsx', 'utf8');

// 1. Add new state variables
content = content.replace(
  /const \[generateImages, setGenerateImages\] = useState\(true\);/,
  `const [useBrandDna, setUseBrandDna] = useState(true);
  const [imageMode, setImageMode] = useState<'ai' | 'gallery' | 'none'>('ai');
  const [draftConfig, setDraftConfig] = useState<any>(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [approvedSectionIds, setApprovedSectionIds] = useState<string[]>([]);`
);

// 2. Modify wizardStep state
content = content.replace(
  /const \[wizardStep, setWizardStep\] = useState<1 \| 2>\(1\);/,
  `const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);`
);

// 3. Reset states on mount
content = content.replace(
  /setIsGenerating\(false\);\n\s*setWizardStep\(1\);\n\s*setSelectedIdeaId\(null\);\n\s*setErrorMsg\(null\);/,
  `setIsGenerating(false);
      setWizardStep(1);
      setSelectedIdeaId(null);
      setErrorMsg(null);
      setUseBrandDna(true);
      setImageMode('ai');
      setDraftConfig(null);
      setReviewIndex(0);
      setApprovedSectionIds([]);`
);

// 4. Update handleStartGeneration
content = content.replace(
  /const result = await aiPageGenerator\.generatePageLive\([\s\S]*?\}, 500\);/m,
  `const result = await aiPageGenerator.generatePageLive(
        enrichedPrompt,
        useBrandDna ? brandDna : null,
        (step, partialConfig) => {
          setCurrentStep(step);
          setStreamedConfig(partialConfig);
        },
        { generateImages: imageMode === 'ai', apiKey }
      );

      setDraftConfig(result);
      setReviewIndex(0);
      setApprovedSectionIds([]);
      setIsGenerating(false);
      setWizardStep(3);`
);

// 5. Add finalizeConfig function before handleStartGeneration
const finalizeConfigFn = `
  const finalizeConfig = (approvedIds: string[]) => {
    if (!draftConfig) return;
    
    if (approvedIds.length === 0) {
      alert('לא נבחרו אזורים כלל.');
      setWizardStep(2);
      return;
    }

    const finalConfig = { ...draftConfig };
    finalConfig.sectionOrder = approvedIds;
    const newSections: Record<string, any> = {};
    approvedIds.forEach((id: string) => {
      newSections[id] = finalConfig.sections[id];
      if (imageMode === 'gallery' || imageMode === 'none') {
         newSections[id].imageUrl = '';
         newSections[id].imageSrc = '';
      }
    });
    finalConfig.sections = newSections;

    onComplete(finalConfig);
    onClose();
  };
`;
content = content.replace(
  /const handleStartGeneration = async \(\) => \{/,
  finalizeConfigFn + '\n  const handleStartGeneration = async () => {'
);

// 6. Update step 2 UI controls
content = content.replace(
  /\{\/\* Image Generation Toggle \*\/\}([\s\S]*?)<\/label>/m,
  `{/* Brand DNA & Image Settings */}
                <div className="flex flex-col gap-4 mt-6">
                  <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-600 transition-all">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-600 bg-slate-800"
                      checked={useBrandDna}
                      onChange={(e) => setUseBrandDna(e.target.checked)}
                    />
                    <span className="text-sm font-bold text-slate-300">השתמש במיתוג העסק (Brand DNA) בעמוד זה</span>
                  </label>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
                    <span className="text-sm font-bold text-slate-300 mb-1">העדפת תמונות באזורים:</span>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="imageMode" value="ai" checked={imageMode === 'ai'} onChange={() => setImageMode('ai')} className="text-indigo-600 bg-slate-800 border-slate-700" />
                      <span className="text-sm text-slate-400">יצירת תמונות על ידי AI</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="imageMode" value="gallery" checked={imageMode === 'gallery'} onChange={() => setImageMode('gallery')} className="text-indigo-600 bg-slate-800 border-slate-700" />
                      <span className="text-sm text-slate-400">בחירה מתוך הגלריה (יושארו ריקות לבחירתך)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="imageMode" value="none" checked={imageMode === 'none'} onChange={() => setImageMode('none')} className="text-indigo-600 bg-slate-800 border-slate-700" />
                      <span className="text-sm text-slate-400">ללא תמונות כלל</span>
                    </label>
                  </div>
                </div>`
);

// 7. Render Step 3 (Review Sections) in the UI
// Replace `wizardStep === 1 ? (...) : ( // STEP 2 ... )` structure
content = content.replace(
  /wizardStep === 1 \? \(([\s\S]*?)\) : \(\s*\/\/ STEP 2: Architectural Template & Style([\s\S]*?)<\/div>\s*\)\s*\) : \(/m,
  `wizardStep === 1 ? ($1) : wizardStep === 2 ? (
              // STEP 2: Architectural Template & Style
              $2</div>
            ) : (
              // STEP 3: Review Sections
              draftConfig && (
                <div className="flex flex-col gap-6 max-w-2xl mx-auto items-center">
                  <h3 className="text-xl font-bold text-white text-center">אישור אזורים ({reviewIndex + 1} מתוך {draftConfig.sectionOrder.length})</h3>
                  
                  {(() => {
                    const currentSecId = draftConfig.sectionOrder[reviewIndex];
                    const sec = draftConfig.sections[currentSecId];
                    if (!sec) return null;
                    return (
                      <div className="w-full p-6 bg-slate-900 border border-slate-700 rounded-2xl flex flex-col gap-4 text-right">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 font-bold rounded text-sm">{sec.type}</span>
                          </div>
                          <div>
                            {sec.title && <h4 className="text-white font-bold text-lg">{sec.title}</h4>}
                            {sec.subtitle && <p className="text-slate-400 text-sm mt-1">{sec.subtitle}</p>}
                            {sec.description && <p className="text-slate-500 text-xs mt-2 line-clamp-3">{sec.description}</p>}
                            {sec.features && sec.features.length > 0 && (
                              <ul className="mt-3 flex flex-col gap-1 text-xs text-slate-400">
                                {sec.features.map((f: any) => <li key={f.title}>• {f.title}</li>)}
                              </ul>
                            )}
                          </div>
                      </div>
                    );
                  })()}

                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full mt-4">
                      <button 
                        onClick={() => {
                          const currentSecId = draftConfig.sectionOrder[reviewIndex];
                          const nextIds = [...approvedSectionIds, currentSecId];
                          if (reviewIndex + 1 < draftConfig.sectionOrder.length) {
                            setApprovedSectionIds(nextIds);
                            setReviewIndex(r => r + 1);
                          } else {
                            finalizeConfig(nextIds);
                          }
                        }}
                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl w-full"
                      >
                        הוסף אזור זה
                      </button>
                      <button 
                        onClick={() => {
                          if (reviewIndex + 1 < draftConfig.sectionOrder.length) {
                            setReviewIndex(r => r + 1);
                          } else {
                            finalizeConfig(approvedSectionIds);
                          }
                        }}
                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl w-full"
                      >
                        דלג (לא רלוונטי)
                      </button>
                  </div>
                </div>
              )
            )
          ) : (`
);

// 8. Update Footer Actions
content = content.replace(
  /\{wizardStep === 1 \? \([\s\S]*?\) : \([\s\S]*?<span>׳—׳–׳¨׳” ׳œ׳¡׳™׳¢׳•׳¨ ׳ž׳•׳—׳•׳×<\/span>[\s\S]*?<\/button>\s*\)\}/m,
  `{wizardStep === 1 ? (
              <button
                type="button"
                onClick={onClose}
                className="text-sm font-bold text-slate-400 hover:text-white transition-colors"
              >
                ביטול
              </button>
            ) : wizardStep === 2 ? (
              <button
                type="button"
                onClick={() => setWizardStep(1)}
                className="text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4 rotate-180" />
                <span>חזרה לסיעור מוחות</span>
              </button>
            ) : null}`
);

content = content.replace(
  /\{wizardStep === 1 \? \([\s\S]*?\) : \([\s\S]*?<\/button>\s*\)\}/m,
  `{wizardStep === 1 ? (
              <button
                type="button"
                onClick={() => setWizardStep(2)}
                disabled={!promptText.trim()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-xl shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>המשך לבחירת שלד וסגנון</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : wizardStep === 2 ? (
              <button
                type="button"
                onClick={handleStartGeneration}
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-sm shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>צור עמוד מלא ב-AI</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : null}`
);


fs.writeFileSync('src/modules/page-builder/components/AiLivePageBuilderModal.tsx', content, 'utf8');

console.log("Refactored modal");
