import fs from 'fs';

// 1. Fix EventMap in src/core/contracts/index.ts
let contracts = fs.readFileSync('src/core/contracts/index.ts', 'utf8');
if (!contracts.includes("'kosai:action'")) {
  contracts = contracts.replace(/export interface CoreEventMap \{/, `export interface CoreEventMap {\n  'kosai:action': any;\n  'media:request_picker': any;`);
  fs.writeFileSync('src/core/contracts/index.ts', contracts);
}

// 2. Fix KosaiContext API call again
let kosaiCtx = fs.readFileSync('src/modules/kosai-engine/context/KosaiContext.tsx', 'utf8');
// We need to pass `imageBase64` but `GeminiApiOptions` doesn't have it (it has `imageParts`).
// BUT `kosaiApi.ts` DOES have it! So `callGeminiApi` must be imported from `kosaiApi` correctly.
kosaiCtx = kosaiCtx.replace(/import \{ callGeminiApi \} from '\.\.\/api\/functionsApi';/, "import { callGeminiApi } from '../api/kosaiApi';");
kosaiCtx = kosaiCtx.replace(/import \{ callGeminiApi \} from '\.\.\/\.\.\/page-builder\/api\/functionsApi';/, "import { callGeminiApi } from '../api/kosaiApi';");
fs.writeFileSync('src/modules/kosai-engine/context/KosaiContext.tsx', kosaiCtx);

// 3. Fix PageBuilderConfig seoInfo in types.ts
let pbTypes = fs.readFileSync('src/modules/page-builder/types/pageBuilder.types.ts', 'utf8');
if (!pbTypes.includes('seoInfo?:')) {
  pbTypes = pbTypes.replace(/globalSettings\?: \{/, `seoInfo?: {\n    metaTitle?: string;\n    metaDescription?: string;\n    geoTags?: string;\n  };\n  globalSettings?: {`);
  fs.writeFileSync('src/modules/page-builder/types/pageBuilder.types.ts', pbTypes);
}

// 4. Fix BrandEcosystemSection.tsx
let brandSec = fs.readFileSync('src/modules/brand-dna-hub/components/BrandEcosystemSection.tsx', 'utf8');
brandSec = brandSec.replace(/const \[flagships, setFlagships\] = useState<string\[\]>\(identity\.flagshipProducts \|\| \[\]\);/, 'const [flagships, setFlagships] = useState<string[]>((identity.flagshipProducts as any) || []);');
fs.writeFileSync('src/modules/brand-dna-hub/components/BrandEcosystemSection.tsx', brandSec);
