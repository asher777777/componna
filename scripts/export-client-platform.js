#!/usr/bin/env node

/**
 * Client Platform Exporter CLI
 * Usage:
 *   node scripts/export-client-platform.js --client="client-acme" --modules="crm-analytics,page-builder" --out="./dist-clients/client-acme"
 */

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
function getArg(name, fallback = '') {
  const match = args.find(a => a.startsWith(`--${name}=`));
  if (match) return match.split('=')[1].replace(/["']/g, '');
  return fallback;
}

const clientSlug = getArg('client', `client-${Date.now()}`);
const modulesArg = getArg('modules', 'crm-analytics,page-builder');
const selectedModules = modulesArg.split(',').map(m => m.trim()).filter(Boolean);
const outDir = getArg('out', path.join(process.cwd(), 'dist-clients', clientSlug));

console.log('🚀 מתחיל בייצוא פלטפורמת לקוח חדשה...');
console.log(`👤 מזהה לקוח: ${clientSlug}`);
console.log(`📦 רכיבים נבחרים: ${selectedModules.join(', ')}`);
console.log(`📂 תיקיית יעד: ${outDir}\n`);

// Ensure directory exists
fs.mkdirSync(outDir, { recursive: true });

// 1. Generate client.config.json
const clientConfig = {
  clientId: clientSlug,
  clientName: `פרויקט לקוח ${clientSlug}`,
  createdAt: new Date().toISOString(),
  activeModules: selectedModules.map(m => ({
    id: m,
    slug: `/${m}`,
    isEnabled: true
  }))
};

fs.writeFileSync(
  path.join(outDir, 'client.config.json'),
  JSON.stringify(clientConfig, null, 2),
  'utf8'
);
console.log('✓ נוצר קובץ client.config.json בהצלחה');

// 2. Generate client package.json
const clientPackageJson = {
  name: `client-${clientSlug}-app`,
  private: true,
  version: '1.0.0',
  type: 'module',
  scripts: {
    dev: 'vite',
    build: 'tsc && vite build',
    preview: 'vite preview'
  },
  dependencies: {
    react: '^18.3.1',
    'react-dom': '^18.3.1',
    'react-router-dom': '^6.26.1',
    firebase: '^10.13.1',
    'lucide-react': '^0.439.0',
    clsx: '^2.1.1',
    'tailwind-merge': '^2.5.2',
    recharts: '^2.12.7',
    xlsx: '^0.18.5'
  }
};

fs.writeFileSync(
  path.join(outDir, 'package.json'),
  JSON.stringify(clientPackageJson, null, 2),
  'utf8'
);
console.log('✓ נוצר קובץ package.json עצמאי עבור הלקוח');

// 3. Generate README & Deploy Guide
const clientReadme = `# פלטפורמת לקוח: ${clientSlug}

פרויקט לקוח עצמאי ומבודד המכיל את הרכיבים: ${selectedModules.join(', ')}.

## הפעלה מקומית:
\`\`\`bash
npm install
npm run dev
\`\`\`

## פריסה לענן (Firebase Hosting):
\`\`\`bash
npm run build
firebase deploy
\`\`\`
`;

fs.writeFileSync(path.join(outDir, 'README.md'), clientReadme, 'utf8');
console.log('✓ נוצר מדריך פריסה והפעלה (README.md)');

console.log('\n🎉 ייצוא פלטפורמת הלקוח הושלם בהצלחה!');
