
const fs = require('fs');
let c = fs.readFileSync('src/modules/page-builder/PageBuilderStandaloneView.tsx', 'utf8');
if (!c.includes('useTenantScope')) {
  c = c.replace(/import \{ useSystemConnection \} from '\.\.\/\.\.\/core\/connection\/SystemConnectionContext';/, 'import { useSystemConnection } from \'../../core/connection/SystemConnectionContext\';\nimport { useTenantScope } from \'../../core/tenant\';');
}
c = c.replace(/const \{ db \} = useSystemConnection\(\);/, 'const { db } = useSystemConnection();\n  const { tenantId } = useTenantScope();');
c = c.replace(/pageBuilderFirestore\.([a-zA-Z0-9_]+)\(([^,]+),\s*db\)/g, 'pageBuilderFirestore.(, db, tenantId)');
c = c.replace(/pageBuilderFirestore\.getAllPages\(db\)/g, 'pageBuilderFirestore.getAllPages(db, tenantId)');
c = c.replace(/\[db, brandDna\]/g, '[db, tenantId, brandDna]');
fs.writeFileSync('src/modules/page-builder/PageBuilderStandaloneView.tsx', c);

