import fs from 'fs';

let bo = fs.readFileSync('src/modules/kosai-engine/components/KosaiSettingsBackoffice.tsx', 'utf8');

// Replace the standard map with a filtered one
bo = bo.replace(
  /\{KOSAI_TEMPLATES\.map\(t => \(\n\s*<option key=\{t\.id\} value=\{t\.id\}>\{t\.name\}<\/option>\n\s*\)\)\}/g,
  `{KOSAI_TEMPLATES.filter(t => t.targetModules.includes('all') || t.targetModules.includes(rule.moduleId || '')).map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}`
);

fs.writeFileSync('src/modules/kosai-engine/components/KosaiSettingsBackoffice.tsx', bo);
