import fs from 'fs';

let pbe = fs.readFileSync('src/modules/kosai-engine/components/KosaiSettingsBackoffice.tsx', 'utf8');
pbe = pbe.replace(/const r = await kosaiRulesService\.getRules\(db, tenantId\);/, 'if (!db) return;\n    const r = await kosaiRulesService.getRules(db, tenantId);');
pbe = pbe.replace(/await kosaiRulesService\.saveRule\(db, tenantId, newRule\);/, 'if (!db) return;\n    await kosaiRulesService.saveRule(db, tenantId, newRule);');
pbe = pbe.replace(/await kosaiRulesService\.saveRule\(db, tenantId, rule\);/, 'if (!db) return;\n    await kosaiRulesService.saveRule(db, tenantId, rule);');
pbe = pbe.replace(/await kosaiRulesService\.deleteRule\(db, tenantId, id\);/, 'if (!db) return;\n      await kosaiRulesService.deleteRule(db, tenantId, id);');
fs.writeFileSync('src/modules/kosai-engine/components/KosaiSettingsBackoffice.tsx', pbe);
