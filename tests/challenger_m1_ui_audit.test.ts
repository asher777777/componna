import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const MODULE_DIR = join(process.cwd(), 'src/modules/kosun-am');
const TEMPLATE_PATH = join(process.cwd(), '.gemini/templates/component_spec_template.md');
const README_PATH = join(MODULE_DIR, 'README.md');

// Helper to recursively get all files in a directory
function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    if (statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

test('Challenger M1 Audit - 1: README.md Spec Completeness (All 8 Chapters)', () => {
  const readmeContent = readFileSync(README_PATH, 'utf-8');
  const templateContent = readFileSync(TEMPLATE_PATH, 'utf-8');

  // Verify RTL container
  assert.match(readmeContent, /<div dir="rtl" style="text-align: right;">/, 'README must have full RTL container');

  // Verify all 8 chapters
  const requiredChapters = [
    '1. פרטים כלליים',
    '2. מבנה נתוני Firestore',
    '3. ממשק משתמש ומסכים',
    '4. ניתובים פנימיים',
    '5. שכבת API ופונקציות ענן',
    '6. פרומפטים והגדרות AI',
    '7. חוקי אבטחה של פיירבייס',
    '8. משתני סביבה',
  ];

  for (const chapter of requiredChapters) {
    const regex = new RegExp(`##\\s*${chapter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
    assert.match(readmeContent, regex, `README must contain chapter: ${chapter}`);
  }

  // Verify collections mentioned in chapter 2
  assert.ok(readmeContent.includes('mod_kosun_am_campaigns'), 'Must specify mod_kosun_am_campaigns');
  assert.ok(readmeContent.includes('mod_kosun_am_templates'), 'Must specify mod_kosun_am_templates');
  assert.ok(readmeContent.includes('mod_kosun_am_automations'), 'Must specify mod_kosun_am_automations');
  assert.ok(readmeContent.includes('mod_kosun_am_logs'), 'Must specify mod_kosun_am_logs');

  // Verify AI models mentioned in chapter 6
  assert.ok(readmeContent.includes('gemini-3.8-flash'), 'Must specify gemini-3.8-flash');
  assert.ok(readmeContent.includes('gemini-3.5-flash'), 'Must specify gemini-3.5-flash');
  assert.ok(readmeContent.includes('gemini-3.8-flash-lite'), 'Must specify gemini-3.8-flash-lite');
});

test('Challenger M1 Audit - 2: Zero Textual Emojis in All kosun-am Module Files', () => {
  const allFiles = getAllFiles(MODULE_DIR).filter(f => !f.endsWith('.gitkeep'));
  const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/u;

  const filesWithEmojis: { file: string; match: string }[] = [];

  for (const file of allFiles) {
    const content = readFileSync(file, 'utf-8');
    const match = content.match(emojiRegex);
    if (match) {
      filesWithEmojis.push({ file, match: match[0] });
    }
  }

  assert.deepEqual(filesWithEmojis, [], `Found textual emojis in kosun-am module files: ${JSON.stringify(filesWithEmojis)}`);
});

test('Challenger M1 Audit - 3: Strict RTL Alignment in Views and UI Containers', () => {
  const mainView = readFileSync(join(MODULE_DIR, 'components/KosunAmMainView.tsx'), 'utf-8');
  const standaloneView = readFileSync(join(MODULE_DIR, 'StandaloneView.tsx'), 'utf-8');

  assert.ok(
    mainView.includes('dir="rtl"') || mainView.includes("dir='rtl'"),
    'KosunAmMainView must have dir="rtl"'
  );
  assert.ok(
    standaloneView.includes('dir="rtl"') || standaloneView.includes("dir='rtl'"),
    'StandaloneView must have dir="rtl"'
  );
});

test('Challenger M1 Audit - 4: Exclusive Heebo Typography across Components', () => {
  const componentFiles = getAllFiles(join(MODULE_DIR, 'components')).filter(f => f.endsWith('.tsx'));
  let hasHeebo = false;

  for (const file of componentFiles) {
    const content = readFileSync(file, 'utf-8');
    if (content.includes('font-heebo') || content.includes('Heebo')) {
      hasHeebo = true;
    }
    // Ensure no forbidden alternate non-system fonts like roboto / inter are explicitly hardcoded as primary
    assert.doesNotMatch(content, /font-inter/i, `${file} should not hardcode font-inter`);
  }

  assert.ok(hasHeebo, 'At least components must use font-heebo typography class');
});

test('Challenger M1 Audit - 5: Top Nav Architecture with Zero Sidebar / Slider', () => {
  const componentFiles = getAllFiles(join(MODULE_DIR, 'components')).filter(f => f.endsWith('.tsx'));

  for (const file of componentFiles) {
    const content = readFileSync(file, 'utf-8');
    // Ensure no Sidebar components or side nav drawers used as primary navigation
    assert.doesNotMatch(content, /<Sidebar/i, `${file} contains forbidden Sidebar component`);
    assert.doesNotMatch(content, /sidebar-nav/i, `${file} contains forbidden sidebar-nav class`);
  }

  const mainView = readFileSync(join(MODULE_DIR, 'components/KosunAmMainView.tsx'), 'utf-8');
  assert.match(mainView, /Top Nav/i, 'KosunAmMainView must feature Top Nav bar');
});

test('Challenger M1 Audit - 6: Collapsible Stats Hidden by Default', () => {
  const mainView = readFileSync(join(MODULE_DIR, 'components/KosunAmMainView.tsx'), 'utf-8');

  // Stats state must be initialized to false (collapsed by default)
  const statsStateMatch = mainView.match(/useState(?:<boolean>)?\((false)\)/);
  assert.ok(statsStateMatch, 'KosunAmMainView must have boolean state initialized to false for collapsible stats');
  assert.match(mainView, /isStatsOpen|showStats/i, 'Must have isStatsOpen or showStats state');
});


test('Challenger M1 Audit - 7: Living Persona Naming Standards (KOSUN / קושאן in UI & Variables)', () => {
  const allFiles = getAllFiles(MODULE_DIR).filter(f => !f.endsWith('.gitkeep'));

  const uiViolations: { file: string; line: string }[] = [];

  for (const file of allFiles) {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((l, idx) => {
        // Exclude comments that cite the skill name `cashwan-branding`
        const isSkillComment = l.includes('//') && l.includes('cashwan-branding');
        if (!isSkillComment && /\bCashwan\b/i.test(l)) {
          uiViolations.push({ file, line: `${idx + 1}: ${l.trim()}` });
        }
      });
    }
  }

  assert.deepEqual(uiViolations, [], `Forbidden 'Cashwan' naming found in user-facing code/UI: ${JSON.stringify(uiViolations)}`);
});


test('Challenger M1 Audit - 8: Zero Direct Cross-Module Imports', () => {
  const allFiles = getAllFiles(MODULE_DIR).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
  const forbiddenImportRegex = /from\s+['"][^'"]*\/modules\/(?!kosun-am)/;

  const violations: string[] = [];
  for (const file of allFiles) {
    const content = readFileSync(file, 'utf-8');
    if (forbiddenImportRegex.test(content)) {
      violations.push(file);
    }
  }

  assert.deepEqual(violations, [], `Forbidden cross-module imports found: ${violations.join(', ')}`);
});

test('Challenger M1 Audit - 9: Zero localStorage API Key Usage', () => {
  const allFiles = getAllFiles(MODULE_DIR).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
  const violations: string[] = [];

  for (const file of allFiles) {
    const content = readFileSync(file, 'utf-8');
    if (/localStorage\.(?:getItem|setItem)\([^)]*key/i.test(content)) {
      violations.push(file);
    }
  }

  assert.deepEqual(violations, [], `localStorage API key usage found: ${violations.join(', ')}`);
});
