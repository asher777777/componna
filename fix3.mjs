import fs from 'fs';

let generator = fs.readFileSync('src/modules/page-builder/services/aiPageGenerator.ts', 'utf8');

if (generator.includes('comona_brand_dna_settings')) {
  generator = generator.replace(
    /export function resolveLiveBrandDna\(provided\?: BrandDna \| null\): BrandDna \| null \{[\s\S]*?return provided \|\| null;\n\}/m,
    `export function resolveLiveBrandDna(provided?: BrandDna | null): BrandDna | null {
  if (provided) {
    return provided;
  }
  try {
    const raw = localStorage.getItem('comona_brand_dna_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed) return parsed;
    }
  } catch {}
  return null;
}`
  );
}

if (generator.includes('generatedSectionsData = this.getFullSkeletonFallback')) {
  generator = generator.replace(
    /if \(apiKey\) \{\s*try \{\s*const fullPrompt = GENERATE_MULTI_SECTION_PAGE_PROMPT\(\{[\s\S]*?if \(!generatedSectionsData \|\| generatedSectionsData\.length < 4\) \{\s*generatedSectionsData = this\.getFullSkeletonFallback\(userPrompt, companyName, slogan, brandDna\);\s*\}/m,
    `    if (!apiKey) {
      throw new Error('חסר מפתח API למערכת ה-AI. אנא הגדר מפתח ב-DB Connector Hub תחת Tenant זה.');
    }

    try {
      const fullPrompt = GENERATE_MULTI_SECTION_PAGE_PROMPT({
        companyName,
        slogan,
        targetAudience: brandDna?.audience?.targetAudiences?.join(', '),
        uvp: brandDna?.audience?.mainUvp,
        voiceTone: (brandDna?.identity as any)?.brandPersonality || 'מקצועי, מוביל ומשכנע',
        primaryColor,
        backgroundColor: pageConfig.globalSettings.backgroundColor,
        userPrompt,
        generateImages: options?.generateImages ?? true,
      });

      const apiResult = await callGeminiApi<any>({
        prompt: fullPrompt,
        providedApiKey: apiKey,
        temperature: 0.75,
      });

      if (!apiResult.success) {
        throw new Error(apiResult.error === 'NO_API_KEY_FOUND'
          ? 'לא הוגדר מפתח API תקין. נא להגדיר ב-Connector Hub.'
          : \`ה-AI נכשל ביצירת התוכן. שגיאה טכנית מהשרת: \${apiResult.error || 'שגיאת רשת'}\`);
      }

      if (apiResult.success && apiResult.data) {
        const aiData = apiResult.data;
        if (aiData.slug) pageConfig.slug = aiData.slug;
        if (aiData.pageTitle) pageConfig.pageTitle = aiData.pageTitle;
        if (aiData.backgroundColor) pageConfig.globalSettings.backgroundColor = aiData.backgroundColor;
        if (aiData.textColor) pageConfig.globalSettings.textColor = aiData.textColor;

        if (Array.isArray(aiData.sections) && aiData.sections.length >= 3) {
          generatedSectionsData = aiData.sections;
        } else {
          throw new Error('ה-AI החזיר תוצאה קצרה מדי או חסרת נתונים מספיקים כדי להרכיב עמוד שלם.');
        }
      }
    } catch (err: any) {
      throw new Error(err.message || 'שגיאה כללית התרחשה במהלך העבודה מול בינת ה-AI.');
    }

    if (!generatedSectionsData || generatedSectionsData.length < 4) {
      throw new Error('שגיאה בתבנית שחזרה מה-AI - התקבלו פחות מ-4 אזורים במבנה העמוד.');
    }`
  );
}

fs.writeFileSync('src/modules/page-builder/services/aiPageGenerator.ts', generator, 'utf8');

// 3. AiLivePageBuilderModal.tsx
let liveModal = fs.readFileSync('src/modules/page-builder/components/AiLivePageBuilderModal.tsx', 'utf8');

if (!liveModal.includes('errorMsg')) {
  liveModal = liveModal.replace(
    `import { pageBuilderFirestore } from '../services/pageBuilderFirestore';`,
    `import { pageBuilderFirestore } from '../services/pageBuilderFirestore';\nimport { GreenApiService } from '../../whatsapp-green-api-hub/services/greenApiService';`
  );

  liveModal = liveModal.replace(
    `const [loadingIdeas, setLoadingIdeas] = useState(false);`,
    `const [loadingIdeas, setLoadingIdeas] = useState(false);\n  const [errorMsg, setErrorMsg] = useState<string | null>(null);`
  );

  liveModal = liveModal.replace(
    `setSelectedIdeaId(null);\n        loadIdeas();`,
    `setSelectedIdeaId(null);\n        setErrorMsg(null);\n        loadIdeas();`
  );
  
  const reportErrorFn = `
  const reportError = async (errText: string) => {
    try {
      const keys = getApiKeysForModule('whatsapp-hub');
      const waService = new GreenApiService({
        idInstance: keys.greenApiInstanceId || '',
        apiTokenInstance: keys.greenApiToken || ''
      });
      const phone = brandDna?.trust?.whatsappSupportNumber || brandDna?.trust?.contactPhone || '';
      const cleanPhone = phone.replace(/\\D/g, '');
      if (!cleanPhone || !keys.greenApiInstanceId) {
        alert('לא הוגדר מספר טלפון ב-Brand DNA או שחסרים פרטי Green API ב-Connector Hub.');
        return;
      }
      await waService.sendMessage({
        chatId: \`\${cleanPhone}@c.us\`,
        message: \`*דו"ח תקלה ממערכת בניית העמודים ב-AI:* \\n\\n\${errText}\`
      });
      alert('הדיווח נשלח בהצלחה לווצאפ.');
    } catch (e) {
      alert('שגיאה בשליחת הדיווח לווצאפ.');
    }
  };

  const handleStartGeneration = async () => {`;

  liveModal = liveModal.replace(
    `const handleStartGeneration = async () => {`,
    reportErrorFn
  );

  liveModal = liveModal.replace(
    `setIsGenerating(true);\n      setCurrentStep({`,
    `setErrorMsg(null);\n      setIsGenerating(true);\n      setCurrentStep({`
  );

  liveModal = liveModal.replace(
    `console.error('AI Generation error:', err);\n        setIsGenerating(false);`,
    `console.error('AI Generation error:', err);\n        setErrorMsg(err?.message || 'שגיאה כללית התרחשה מול ה-AI.');\n        setIsGenerating(false);`
  );
  
  // also need to pass api key in live modal
  liveModal = liveModal.replace(
    `const result = await aiPageGenerator.generatePageLive(
          enrichedPrompt,
          brandDna,
          (step, partialConfig) => {
            setCurrentStep(step);
            setStreamedConfig(partialConfig);
          },
          { generateImages }
        );`,
    `const result = await aiPageGenerator.generatePageLive(
          enrichedPrompt,
          brandDna,
          (step, partialConfig) => {
            setCurrentStep(step);
            setStreamedConfig(partialConfig);
          },
          { generateImages, apiKey }
        );`
  );
  
  // and in generatePageIdeas
  liveModal = liveModal.replace(
    `const generatedIdeas = await aiPageGenerator.generatePageIdeas(brandDna, undefined, existingPages);`,
    `const generatedIdeas = await aiPageGenerator.generatePageIdeas(brandDna, apiKey, existingPages);`
  );

  const errorUI = `
        </div>

        {errorMsg && !isGenerating && (
          <div className="mx-6 sm:mx-8 mb-6 p-5 rounded-2xl bg-red-500/10 border border-red-500/30 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-400 font-bold text-sm mb-1">שגיאה ביצירת העמוד</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{errorMsg}</p>
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <button 
                onClick={() => reportError(errorMsg)}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-xs font-bold transition-colors"
              >
                דווח למערכת (WhatsApp)
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}`;

  liveModal = liveModal.replace(
    /\s+<\/div>\s+\{\/\* Footer Actions \*\/\}/,
    errorUI
  );

  fs.writeFileSync('src/modules/page-builder/components/AiLivePageBuilderModal.tsx', liveModal, 'utf8');
}
