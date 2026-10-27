import fs from 'node:fs';
import path from 'node:path';

console.log('================================================================');
console.log('   EMPIRICAL CHALLENGER: MILESTONE 1 DEEP VERIFICATION');
console.log('================================================================');

const MODULE_ROOT = path.resolve('c:/comona/src/modules/KosMail');
let failures = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`[FAIL]: ${message}`);
    failures++;
  } else {
    console.log(`[PASS]: ${message}`);
  }
}

// -------------------------------------------------------------
// Check 1: 12 Layers File Existence & Non-Emptiness
// -------------------------------------------------------------
console.log('\n--- 1. Testing 12 Layers Completeness & Non-Emptiness ---');
const EXPECTED_FILES = [
  'types/index.ts',
  'config/index.ts',
  'context/ModuleContext.tsx',
  'hooks/useKosunAmData.ts',
  'hooks/useKosunAmActions.ts',
  'services/emailFirestoreService.ts',
  'services/emailDispatchService.ts',
  'services/kosaiEmailAiService.ts',
  'api/functionsApi.ts',
  'prompts/index.ts',
  'routes/ModuleRoutes.tsx',
  'components/KosunAmMainView.tsx',
  'components/EmailEditorModal.tsx',
  'components/AutomationBuilderView.tsx',
  'components/CampaignListCard.tsx',
  'components/DeliveryLogsDrawer.tsx',
  'StandaloneView.tsx',
  'index.ts',
  'README.md',
  '.gemini/rules.md',
  '.gemini/skills.md',
  'scripts/.gitkeep',
];

for (const relPath of EXPECTED_FILES) {
  const fullPath = path.join(MODULE_ROOT, relPath);
  const exists = fs.existsSync(fullPath);
  assert(exists, `File exists: ${relPath}`);
  if (exists) {
    const stats = fs.statSync(fullPath);
    if (relPath !== 'scripts/.gitkeep') {
      assert(stats.size > 50, `File is non-empty (${stats.size} bytes): ${relPath}`);
    }
  }
}

// -------------------------------------------------------------
// Check 2: Parse Imports & Circular Dependency Detection
// -------------------------------------------------------------
console.log('\n--- 2. Testing Circular Dependencies & Module Boundaries ---');

function getAllSourceFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        files.push(...getAllSourceFiles(full));
      }
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      files.push(full);
    }
  }
  return files;
}

const sourceFiles = getAllSourceFiles(MODULE_ROOT);
console.log(`Found ${sourceFiles.length} TypeScript source files in ${MODULE_ROOT}`);

const importRegex = /(?:import|export)\s+(?:(?:(?:\* as \w+)|(?:[\w\s{},*]+))\s+from\s+)?['"]([^'"]+)['"]/g;
const graph = new Map();
let crossModuleImportViolations = 0;
let localStorageViolations = 0;

for (const file of sourceFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const fileDir = path.dirname(file);
  const deps = [];

  // Check Cross-Module imports: from sibling modules
  // Matches e.g. from '../crm-groups-hub', from '@/modules/...', from '../../modules/...'
  const lines = content.split('\n');
  lines.forEach((line, lineIdx) => {
    if (line.includes('from ') && (line.includes('/modules/') || line.includes('../modules/'))) {
      if (!line.includes('kosun-am')) {
        console.error(`[FAIL] Sibling module import detected at ${path.relative(MODULE_ROOT, file)}:${lineIdx + 1}: ${line.trim()}`);
        crossModuleImportViolations++;
        failures++;
      }
    }
    if (line.includes('localStorage') && !line.includes('//')) {
      console.error(`[FAIL] Direct localStorage access detected at ${path.relative(MODULE_ROOT, file)}:${lineIdx + 1}: ${line.trim()}`);
      localStorageViolations++;
      failures++;
    }
  });

  // Extract relative imports to build dependency graph
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importTarget = match[1];
    if (importTarget.startsWith('.')) {
      let resolved = path.resolve(fileDir, importTarget);
      if (fs.existsSync(resolved + '.ts')) resolved += '.ts';
      else if (fs.existsSync(resolved + '.tsx')) resolved += '.tsx';
      else if (fs.existsSync(path.join(resolved, 'index.ts'))) resolved = path.join(resolved, 'index.ts');
      else if (fs.existsSync(path.join(resolved, 'index.tsx'))) resolved = path.join(resolved, 'index.tsx');

      if (fs.existsSync(resolved)) {
        deps.push(resolved);
      }
    }
  }
  graph.set(file, deps);
}

assert(crossModuleImportViolations === 0, `Zero direct cross-module imports (found ${crossModuleImportViolations})`);
assert(localStorageViolations === 0, `Zero localStorage violations (found ${localStorageViolations})`);

// Graph Cycle Detection via DFS
const visited = new Map(); // 0: unvisited, 1: visiting, 2: visited
const cycles = [];

function dfs(node, pathStack) {
  visited.set(node, 1);
  pathStack.push(node);
  const neighbors = graph.get(node) || [];
  for (const neighbor of neighbors) {
    if (!graph.has(neighbor)) continue; // outside module root
    if (visited.get(neighbor) === 1) {
      const cycleStart = pathStack.indexOf(neighbor);
      cycles.push([...pathStack.slice(cycleStart), neighbor]);
    } else if (!visited.get(neighbor)) {
      dfs(neighbor, pathStack);
    }
  }
  pathStack.pop();
  visited.set(node, 2);
}

for (const file of sourceFiles) {
  if (!visited.get(file)) {
    dfs(file, []);
  }
}

if (cycles.length === 0) {
  console.log('[PASS]: Zero circular dependencies detected in src/modules/KosMail');
} else {
  console.error(`[FAIL]: Found ${cycles.length} circular dependencies:`);
  for (const c of cycles) {
    console.error('   Cycle:', c.map(f => path.relative(MODULE_ROOT, f)).join(' -> '));
  }
  failures += cycles.length;
}

// -------------------------------------------------------------
// Check 3: Textual Unicode Emojis Audit
// -------------------------------------------------------------
console.log('\n--- 3. Testing Zero Textual Emojis Compliance ---');
const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/u;
let emojiCount = 0;

for (const file of sourceFiles) {
  const content = fs.readFileSync(file, 'utf8');
  if (emojiRegex.test(content)) {
    console.error(`[FAIL] Textual emoji found in ${path.relative(MODULE_ROOT, file)}`);
    emojiCount++;
  }
}
assert(emojiCount === 0, `Zero textual emojis in source files (found ${emojiCount})`);

// -------------------------------------------------------------
// Check 4: Kosun Persona & Branding Checks
// -------------------------------------------------------------
console.log('\n--- 4. Testing Kosun Branding & Persona ---');
const mainViewPath = path.join(MODULE_ROOT, 'components/KosunAmMainView.tsx');
const mainViewContent = fs.readFileSync(mainViewPath, 'utf8');

assert(mainViewContent.includes('font-heebo'), 'MainView enforces Heebo font family');
assert(mainViewContent.includes('dir="rtl"') || mainViewContent.includes("dir='rtl'"), 'MainView includes RTL wrapper');
assert(mainViewContent.includes('קושאן'), 'MainView includes Hebrew persona: "קושאן"');
assert(mainViewContent.includes('KOSUN AM'), 'MainView includes English brand: "KOSUN AM"');

// Check that no sidebar navigation is inside the module
assert(!mainViewContent.includes('<Sidebar') && !mainViewContent.includes('sidebar-open'), 'MainView contains zero sidebar components (Top Nav only)');

// -------------------------------------------------------------
// Final Verdict
// -------------------------------------------------------------
console.log('\n================================================================');
if (failures === 0) {
  console.log('[PASS] ALL EMPIRICAL CHECKS PASSED PERFECTLY (0 FAILURES)');
  console.log('VERDICT: APPROVE');
  process.exit(0);
} else {
  console.error(`[FAIL] EMPIRICAL CHECKS FAILED WITH ${failures} FAILURES`);
  console.error('VERDICT: REQUEST_CHANGES');
  process.exit(1);
}
