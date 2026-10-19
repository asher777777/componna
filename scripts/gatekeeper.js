#!/usr/bin/env node

/**
 * Gatekeeper Verification Script (שומר הסף של המערכת)
 * Runs automated checks to ensure system rules, module monopoly, root hygiene,
 * and tenant DB scoping are 100% compliant before task completion.
 *
 * Usage:
 *   node scripts/gatekeeper.js                   # Full system audit
 *   node scripts/gatekeeper.js <module-name>     # Targeted module audit
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Parse target module if provided
const args = process.argv.slice(2);
const targetModuleArg = args.find(a => !a.startsWith('--'));
const TARGET_MODULE = targetModuleArg ? targetModuleArg.replace(/^--module=/, '').trim() : null;

// 1. Allowed files in Root directory
const ALLOWED_ROOT_FILES = new Set([
  '.env',
  '.env.example',
  '.firebaserc',
  '.gitignore',
  'cors.json',
  'firebase.json',
  'firestore.rules',
  'index.html',
  'package.json',
  'package-lock.json',
  'postcss.config.js',
  'storage.rules',
  'tailwind.config.js',
  'tsconfig.json',
  'tsconfig.node.json',
  'vite.config.ts',
  'IMPLEMENTATION_PLAN.md',
  'TEST_INFRA.md',
  'TEST_READY.md'
]);

// Modules authorized as the single authority for AI
const AI_AUTHORITY_MODULES = ['kosai-engine'];

const auditResults = [];

console.log('\n=============================================================');
if (TARGET_MODULE) {
  console.log(`🛡️  KOSUN GATEKEEPER - בדיקת שומר סף ממוקדת לרכיב: ${TARGET_MODULE}`);
} else {
  console.log('🛡️  KOSUN SYSTEM GATEKEEPER - בדיקת שומר סף מקיפה למערכת');
}
console.log('=============================================================\n');

// Helper: recursively find files
function getAllFiles(dirPath, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let files = [];
  if (!fs.existsSync(dirPath)) return files;
  
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        files = files.concat(getAllFiles(fullPath, extensions));
      }
    } else if (entry.isFile()) {
      if (extensions.some(ext => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

// -----------------------------------------------------------------------------
// CHECK 1: Root Directory Hygiene
// -----------------------------------------------------------------------------
function checkRootHygiene() {
  const result = {
    category: '1. ניקיון תיקיית השורש (Root Directory Hygiene)',
    passed: true,
    messages: []
  };

  try {
    const rootEntries = fs.readdirSync(ROOT_DIR, { withFileTypes: true });
    const rogueFiles = [];

    for (const entry of rootEntries) {
      if (entry.isFile()) {
        if (!ALLOWED_ROOT_FILES.has(entry.name)) {
          if (entry.name.startsWith('.git')) continue;
          rogueFiles.push(entry.name);
        }
      }
    }

    if (rogueFiles.length > 0) {
      result.passed = false;
      result.messages.push(
        `נמצאו ${rogueFiles.length} קבצים לא מורשים בתיקיית השורש: ${rogueFiles.join(', ')}`
      );
      result.messages.push(
        `הנחיה: יש להעביר סקריפטים של רכיב ל-src/modules/[module]/scripts/ או ל-scratch/ ולמחוק אותם מהשורש.`
      );
    } else {
      result.messages.push('תיקיית השורש נקייה מקבצי סקריפטים או בדיקות לא מורשים.');
    }
  } catch (err) {
    result.passed = false;
    result.messages.push(`שגיאה בסריקת תיקיית השורש: ${err.message}`);
  }

  return result;
}

// -----------------------------------------------------------------------------
// CHECK 2: Module 11-Layer Anatomy (If targeted module)
// -----------------------------------------------------------------------------
function checkModuleAnatomy(modName) {
  const result = {
    category: `2. אנטומיית 11 השכבות לרכיב (${modName})`,
    passed: true,
    messages: []
  };

  const modPath = path.join(ROOT_DIR, 'src', 'modules', modName);
  if (!fs.existsSync(modPath)) {
    result.passed = false;
    result.messages.push(`הרכיב src/modules/${modName} אינו קיים במערכת!`);
    return result;
  }

  const requiredLayers = [
    { name: 'types/', check: () => fs.existsSync(path.join(modPath, 'types')) },
    { name: 'config/', check: () => fs.existsSync(path.join(modPath, 'config')) },
    { name: 'context/', check: () => fs.existsSync(path.join(modPath, 'context')) },
    { name: 'hooks/', check: () => fs.existsSync(path.join(modPath, 'hooks')) },
    { name: 'services/', check: () => fs.existsSync(path.join(modPath, 'services')) },
    { name: 'api/', check: () => fs.existsSync(path.join(modPath, 'api')) },
    { name: 'routes/', check: () => fs.existsSync(path.join(modPath, 'routes')) },
    { name: 'components/', check: () => fs.existsSync(path.join(modPath, 'components')) },
    { name: 'StandaloneView.tsx', check: () => fs.existsSync(path.join(modPath, 'StandaloneView.tsx')) },
    { name: '.gemini/ (Layer 10)', check: () => fs.existsSync(path.join(modPath, '.gemini')) },
  ];

  // prompts/ is ONLY required for the official AI Authority
  if (modName === 'kosai-engine') {
    requiredLayers.push({ name: 'prompts/', check: () => fs.existsSync(path.join(modPath, 'prompts')) });
  }

  const missing = [];
  for (const layer of requiredLayers) {
    if (!layer.check()) {
      missing.push(layer.name);
    }
  }

  if (missing.length > 0) {
    result.passed = false;
    result.messages.push(`שכבות חסרות ברכיב: ${missing.join(', ')}`);
  } else {
    result.messages.push('כל 11 השכבות קיימות ומסודרות לפי התקן.');
  }

  return result;
}

// -----------------------------------------------------------------------------
// CHECK 3: Module Monopoly & AI Direct Client Calls
// -----------------------------------------------------------------------------
function checkModuleMonopoly(filterMod = null) {
  const result = {
    category: '3. עקרון המונופול ומניעת קריאות AI ישירות מהלקוח (Module Monopoly)',
    passed: true,
    messages: []
  };

  const modulesDir = path.join(ROOT_DIR, 'src', 'modules');
  if (!fs.existsSync(modulesDir)) {
    result.messages.push('תיקיית src/modules לא נמצאה.');
    return result;
  }

  let moduleFolders = fs.readdirSync(modulesDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  if (filterMod) {
    moduleFolders = moduleFolders.filter(m => m === filterMod);
  }

  const directAiViolations = [];
  const fallbackLoopViolations = [];

  for (const modName of moduleFolders) {
    if (AI_AUTHORITY_MODULES.includes(modName)) continue;

    const modFiles = getAllFiles(path.join(modulesDir, modName));
    for (const filePath of modFiles) {
      if (filePath.endsWith('.md')) continue;

      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for direct Gemini REST call in client module
      const normalizedPath = filePath.replace(/\\/g, '/');
      if (
        content.includes('https://generativelanguage.googleapis.com') ||
        (content.includes('GoogleGenerativeAI') && !normalizedPath.includes('api/functionsApi'))
      ) {
        const relPath = path.relative(ROOT_DIR, filePath);
        directAiViolations.push(relPath);
      }

      // Check for fallback cascade loop (modelsToTry / GEMINI_FALLBACK_MODELS)
      if (content.includes('modelsToTry') || content.includes('GEMINI_FALLBACK_MODELS')) {
        const relPath = path.relative(ROOT_DIR, filePath);
        fallbackLoopViolations.push(relPath);
      }
    }
  }

  if (directAiViolations.length > 0) {
    result.passed = false;
    result.messages.push(
      `נמצאו ${directAiViolations.length} קבצים שמבצעים קריאות AI ישירות ללא שימוש באוטוריטה או Cloud Functions:`
    );
    directAiViolations.forEach(v => result.messages.push(`  - ${v}`));
    result.messages.push(
      `הנחיה: יש לחבר את הרכיב דרך useHostCapabilities() או דרך Cloud Functions, ולא לבצע fetch ישיר ל-Gemini מהדפדפן.`
    );
  }

  if (fallbackLoopViolations.length > 0) {
    result.passed = false;
    result.messages.push(
      `נמצאו לולאות פולבאק (Fallback Cascades) המפרות את חוק מספר 2 (הצגת שגיאה ברורה ללא פולבאק):`
    );
    fallbackLoopViolations.forEach(v => result.messages.push(`  - ${v}`));
    result.messages.push(
      `הנחיה: יש לבטל שרשראות פולבאק ולהציג תמיד הודעה ברורה, נעימה ושירותית בעברית למשתמש הקצה בעת תקלה.`
    );
  }

  if (directAiViolations.length === 0 && fallbackLoopViolations.length === 0) {
    result.messages.push('הרכיב מציית לעקרון המונופול: אין קריאות Gemini ישירות ואין שרשראות פולבאק.');
  }

  return result;
}

// -----------------------------------------------------------------------------
// CHECK 4: Multi-Tenant Database Scope & Inter-Module Ingestion
// -----------------------------------------------------------------------------
function checkTenantDatabaseScope(filterMod = null) {
  const result = {
    category: '4. סקופ טננט רב-דיירי ושאיבת נתונים בין רכיבים (Tenant DB Scope)',
    passed: true,
    messages: []
  };

  const modulesDir = path.join(ROOT_DIR, 'src', 'modules');
  let targetPath = modulesDir;
  if (filterMod) {
    targetPath = path.join(modulesDir, filterMod);
  }

  const servicesFiles = getAllFiles(targetPath).filter(f => f.includes('services') || f.includes('context'));

  const forbiddenPatterns = [
    { regex: /collection\(\s*db\s*,\s*['"]contacts['"]\s*\)/g, name: "קולקציה שטוחה: 'contacts'" },
    { regex: /collection\(\s*db\s*,\s*['"]leads['"]\s*\)/g, name: "קולקציה שטוחה: 'leads'" },
    { regex: /collection\(\s*db\s*,\s*['"]crm_groups['"]\s*\)/g, name: "קולקציה שטוחה: 'crm_groups'" },
    { regex: /collection\(\s*db\s*,\s*['"]users['"]\s*\)/g, name: "קולקציה שטוחה: 'users'" }
  ];

  const violations = [];

  for (const file of servicesFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    for (const pat of forbiddenPatterns) {
      if (pat.regex.test(content)) {
        violations.push({ file: path.relative(ROOT_DIR, file), violation: pat.name });
      }
    }
  }

  if (violations.length > 0) {
    result.passed = false;
    result.messages.push(
      `נמצא שימוש בקולקציות גלובליות שטוחות (בניגוד ל-Multi-Tenant Scope) בקבצים הבאים:`
    );
    violations.forEach(v => result.messages.push(`  - ${v.file} (${v.violation})`));
    result.messages.push(
      `הנחיה: יש להשתמש ב-useTenantScope() ו-SYSTEM_COLLECTIONS מ-src/core/contracts.`
    );
  } else {
    result.messages.push('כל פניות ה-DB מבודדות כהלכה תחת סקופ טננט.');
  }

  return result;
}

// -----------------------------------------------------------------------------
// CHECK 5: API Keys, Tokens & LocalStorage Security (Gate 5)
// -----------------------------------------------------------------------------
function checkLocalStorageSecurity(filterMod = null) {
  const result = {
    category: '5. שער האבטחה ומניעת דליפות LocalStorage (Security & Storage Gate)',
    passed: true,
    messages: []
  };

  const targetPath = filterMod ? path.join(ROOT_DIR, 'src', 'modules', filterMod) : path.join(ROOT_DIR, 'src');
  const srcFiles = getAllFiles(targetPath);
  const violations = [];

  // Strictly prohibited in localStorage:
  // 1. Direct API Keys or secrets (Gemini, Google AI, OpenAI, GreenAPI, Kesher, etc.)
  // 2. Auth tokens, admin flags, passwords, or user roles (tenant_admin_*, sdo_user_role_*, auth_*)
  const forbiddenPatterns = [
    { regex: /localStorage\.(getItem|setItem)\(['"`](gemini|googleAi|openai|apiKey|api_key|secret)/i, name: 'שמירת מפתחות API ב-localStorage' },
    { regex: /localStorage\.(getItem|setItem)\(['"`](tenant_admin|tenant_auth|admin_auth|sdo_user_role|user_token|auth_token|auth_credentials)/i, name: 'שמירת טוקני אימות או הרשאות ניהול ב-localStorage' },
    { regex: /localStorage\.(getItem|setItem)\(['"`][^'"`]*(password|plainPassword|secretKey)[^'"`]*['"`]\)/i, name: 'שמירת סיסמאות או מפתחות סודיים ב-localStorage' }
  ];

  for (const file of srcFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    for (const pat of forbiddenPatterns) {
      if (pat.regex.test(content)) {
        violations.push({
          file: path.relative(ROOT_DIR, file),
          issue: pat.name
        });
      }
    }
  }

  if (violations.length > 0) {
    result.passed = false;
    result.messages.push(`נמצאו הפרות אבטחה חמורות של שער 5 (דליפת אימות/מפתחות ל-localStorage):`);
    violations.forEach(v => result.messages.push(`  - ${v.file}: ${v.issue}`));
    result.messages.push(`הנחיה: אסור לשמור טוקנים, הרשאות ניהול, סודות או מפתחות ב-localStorage! יש להשתמש ב-Firebase Auth SDK, בזיכרון (In-Memory), או ב-tenantApiKeys.ts.`);
  } else {
    result.messages.push('עבר בהצלחה: אין שמירה או שליפה של מפתחות API, טוקני אימות או הרשאות ניהול ב-localStorage.');
  }

  return result;
}

// -----------------------------------------------------------------------------
// CHECK 6: Build & Type-Check Verification
// -----------------------------------------------------------------------------
function checkBuildCompilation() {
  const result = {
    category: '6. קומפילציה ובדיקת טיפוסים (Build Verification)',
    passed: true,
    messages: []
  };

  try {
    console.log('מריץ בדיקת קומפילציה (tsc --noEmit)...');
    execSync('node ./node_modules/typescript/bin/tsc --noEmit', { cwd: ROOT_DIR, stdio: 'pipe' });
    result.messages.push('קומפילציית TypeScript עברה בהצלחה ללא שגיאות.');
  } catch (err) {
    result.passed = false;
    const stderr = err.stderr ? err.stderr.toString() : '';
    const stdout = err.stdout ? err.stdout.toString() : '';
    const summary = (stderr || stdout || err.message).slice(0, 500);
    result.messages.push(`שגיאת קומפילציה ב-TypeScript:`);
    result.messages.push(summary);
  }

  return result;
}

const skipBuild = args.includes('--skip-build') || args.includes('--no-build');

// -----------------------------------------------------------------------------
// RUN ALL AUDITS & PRINT LIVE
// -----------------------------------------------------------------------------
function runAndPrint(fn, ...params) {
  const res = fn(...params);
  auditResults.push(res);
  const statusIcon = res.passed ? '✅ תקין' : '❌ נכשל';
  console.log(`${statusIcon} - ${res.category}`);
  for (const msg of res.messages) {
    console.log(`   ${msg}`);
  }
  console.log('');
  return res;
}

runAndPrint(checkRootHygiene);
if (TARGET_MODULE) {
  runAndPrint(checkModuleAnatomy, TARGET_MODULE);
}
runAndPrint(checkModuleMonopoly, TARGET_MODULE);
runAndPrint(checkTenantDatabaseScope, TARGET_MODULE);
runAndPrint(checkLocalStorageSecurity, TARGET_MODULE);

if (!skipBuild) {
  runAndPrint(checkBuildCompilation);
} else {
  console.log('⏭️  דלג על בדיקת קומפילציה (עקב דגל --skip-build)\n');
}

// -----------------------------------------------------------------------------
// PRINT SUMMARY
// -----------------------------------------------------------------------------
let allPassed = auditResults.every(r => r.passed);

console.log('=============================================================');
if (allPassed) {
  console.log('🎉 שומר הסף אישר את המערכת! כל החוקים והבדיקות עברו בהצלחה.');
  console.log('=============================================================\n');
  process.exit(0);
} else {
  console.log('⚠️  שומר הסף מצא ליקויים שיש לתקן ברכיב לפני אישור הגשה.');
  console.log('=============================================================\n');
  process.exit(1);
}
