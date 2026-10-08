import fs from 'fs';

// 1. Fix EventMap in EventBus.ts
let eventBus = fs.readFileSync('src/core/bridge/EventBus.ts', 'utf8');
if (!eventBus.includes("'kosai:action'")) {
  eventBus = eventBus.replace(/export interface CoreEventMap \{/, `export interface CoreEventMap {\n  'kosai:action': any;\n  'media:request_picker': any;`);
  fs.writeFileSync('src/core/bridge/EventBus.ts', eventBus);
}

// 2. Fix KosaiContext API call
let kosaiCtx = fs.readFileSync('src/modules/kosai-engine/context/KosaiContext.tsx', 'utf8');
// wait, let me check the import
// import { callGeminiApi } from '../api/kosaiApi';
// But the parameter name is `imageBase64` and I passed `imageBase64`. 
// Let's check kosaiApi.ts: 
// export interface KosaiApiOptions { prompt, systemInstruction, imageBase64 }
// export const callGeminiApi = async ({ ... }: KosaiApiOptions)
// Oh! Did I import from functionsApi in KosaiContext?
kosaiCtx = kosaiCtx.replace(/import \{ callGeminiApi \} from '\.\.\/\.\.\/api\/functionsApi';/, "import { callGeminiApi } from '../api/kosaiApi';");
// Let me just force replace it
kosaiCtx = kosaiCtx.replace(/import \{ callGeminiApi \} from '\.\.\/\.\.\/page-builder\/api\/functionsApi';/, "import { callGeminiApi } from '../api/kosaiApi';");
fs.writeFileSync('src/modules/kosai-engine/context/KosaiContext.tsx', kosaiCtx);

// 3. Fix PageBuilderConfig seoInfo
let pbTypes = fs.readFileSync('src/modules/page-builder/types/pageBuilder.types.ts', 'utf8');
if (!pbTypes.includes('seoInfo?:')) {
  pbTypes = pbTypes.replace(/globalSettings\?: \{/, `seoInfo?: {\n    metaTitle?: string;\n    metaDescription?: string;\n    geoTags?: string;\n  };\n  globalSettings?: {`);
  fs.writeFileSync('src/modules/page-builder/types/pageBuilder.types.ts', pbTypes);
}

// 4. Fix BrandEcosystemSection.tsx
let brandSec = fs.readFileSync('src/modules/brand-dna-hub/components/BrandEcosystemSection.tsx', 'utf8');
brandSec = brandSec.replace(/const \[flagships, setFlagships\] = useState<string\[\]>\(identity\.flagshipProducts \|\| \[\]\);/, 'const [flagships, setFlagships] = useState<string[]>((identity.flagshipProducts as any) || []);');
fs.writeFileSync('src/modules/brand-dna-hub/components/BrandEcosystemSection.tsx', brandSec);
