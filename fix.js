const fs = require('fs');

let sectionModal = fs.readFileSync('src/modules/page-builder/components/AiSectionDesignerModal.tsx', 'utf8');

if (!sectionModal.includes('useHostCapabilities')) {
  sectionModal = sectionModal.replace(
    "import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';",
    "import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';\nimport { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';\nimport { BrandDnaContract } from '../../../core/contracts';"
  );
  
  sectionModal = sectionModal.replace(
    "const { getApiKeysForModule } = useSystemConnection();",
    "const { getApiKeysForModule } = useSystemConnection();\n  const { getCapability } = useHostCapabilities();"
  );
  
  sectionModal = sectionModal.replace(
    "const newConfig = await aiPageGenerator.generateSectionLive(sectionType, prompt, null, currentConfig);",
    "const apiKey = getApiKeysForModule('page-builder').googleAiApiKey || undefined;\n      const brandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;\n      const newConfig = await aiPageGenerator.generateSectionLive(sectionType, prompt, brandDna, currentConfig, apiKey);"
  );

  fs.writeFileSync('src/modules/page-builder/components/AiSectionDesignerModal.tsx', sectionModal, 'utf8');
}


let generator = fs.readFileSync('src/modules/page-builder/services/aiPageGenerator.ts', 'utf8');

generator = generator.replace(
  /export function resolveLiveBrandDna\(provided\?: BrandDna \| null\): BrandDna \| null \{[\s\S]*?return provided \|\| null;\n\}/m,
  export function resolveLiveBrandDna(provided?: BrandDna | null): BrandDna | null {
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
}
);

generator = generator.replace(
  /if \(apiKey\) \{\s*try \{\s*const fullPrompt = GENERATE_MULTI_SECTION_PAGE_PROMPT\(\{[\s\S]*?if \(!generatedSectionsData \|\| generatedSectionsData\.length < 4\) \{\s*generatedSectionsData = this\.getFullSkeletonFallback\(userPrompt, companyName, slogan, brandDna\);\s*\}/m,
      if (!apiKey) {
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
          : \ה-AI נכשל ביצירת התוכן. שגיאה טכנית מהשרת: \\);
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
    }
);

fs.writeFileSync('src/modules/page-builder/services/aiPageGenerator.ts', generator, 'utf8');

console.log("Fixed!");
