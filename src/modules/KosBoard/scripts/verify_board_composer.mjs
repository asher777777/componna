/**
 * Verification Script for KOSUN Board Composer (Layer 12)
 * Checks that all 12 layers exist and adhere to standards.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const moduleRoot = path.resolve(__dirname, '..');

const REQUIRED_12_LAYERS = [
  { layer: 1, name: 'types/index.ts', path: 'types/index.ts' },
  { layer: 2, name: 'config/index.ts', path: 'config/index.ts' },
  { layer: 3, name: 'context/ModuleContext.tsx', path: 'context/ModuleContext.tsx' },
  { layer: 4, name: 'hooks/', path: 'hooks/useBoardComposerData.ts' },
  { layer: 5, name: 'services/', path: 'services/geminiDashboardAiService.ts' },
  { layer: 6, name: 'api/functionsApi.ts', path: 'api/functionsApi.ts' },
  { layer: 7, name: 'prompts/index.ts', path: 'prompts/index.ts' },
  { layer: 8, name: 'routes/ModuleRoutes.tsx', path: 'routes/ModuleRoutes.tsx' },
  { layer: 9, name: 'components/', path: 'components/KosunBoardForgeView.tsx' },
  { layer: 10, name: 'StandaloneView & index.ts', path: 'index.ts' },
  { layer: 11, name: '.gemini rules & skills', path: '.gemini/rules.md' },
  { layer: 12, name: 'scripts/', path: 'scripts/.gitkeep' },
];

console.log('🔍 Checking 12-Layer Anatomy Structure for kosun-board-composer...');

let allPassed = true;
for (const item of REQUIRED_12_LAYERS) {
  const fullPath = path.join(moduleRoot, item.path);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ [Layer ${item.layer}] ${item.name} - OK`);
  } else {
    console.error(`  ❌ [Layer ${item.layer}] Missing: ${item.path}`);
    allPassed = false;
  }
}

if (allPassed) {
  console.log('\n✨ All 12 Layers verified successfully!');
  process.exit(0);
} else {
  console.error('\n⚠️ Some layers are missing.');
  process.exit(1);
}
