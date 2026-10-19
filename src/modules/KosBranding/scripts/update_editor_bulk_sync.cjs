const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/modules/KosBranding/components/BrandUiVocabularyEditor.tsx');
let code = fs.readFileSync(filePath, 'utf8');

if (!code.includes('syncAllTenantPagesWithBrandDna')) {
  // Add imports
  code = code.replace(
    "import { BrandUiVocabulary } from '../types/brandDna';",
    `import { BrandUiVocabulary } from '../types/brandDna';
import { syncAllTenantPagesWithBrandDna } from '../../KosWebAi/services/pageBrandSyncService';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';`
  );

  code = code.replace(
    '  RotateCcw,\n',
    '  RotateCcw,\n  Globe,\n'
  );

  // Add db & tenantId & state
  code = code.replace(
    '  const { brandDna, updateUiVocabulary } = useBrandDna();\n  const [isGenerating, setIsGenerating] = useState(false);',
    `  const { brandDna, updateUiVocabulary } = useBrandDna();
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);`
  );

  // Add handler
  const handlerCode = `
  const handleBulkSyncAllPages = async () => {
    if (!window.confirm('האם לעדכן ולסנכרן את שפת הממשק, הכפתורים והכותרות לכל העמודים הקיימים באתר? (גרסת שחזור נשמרת אוטומטית לכל עמוד)')) {
      return;
    }
    setIsBulkSyncing(true);
    try {
      const res = await syncAllTenantPagesWithBrandDna(db, tenantId, brandDna);
      if (res.success) {
        if (res.totalPages === 0) {
          showNotice('לא נמצאו עמודים קיימים לטננט זה.');
        } else {
          showNotice(\`✓ \${res.updatedCount} עמודים עודכנו וסונכרנו בהצלחה עם שפת הממשק!\`);
        }
      } else {
        showNotice(res.error || 'שגיאה בסנכרון העמודים.');
      }
    } catch (err: any) {
      console.error('[BrandUiVocabularyEditor] Bulk sync failed:', err);
      showNotice('שגיאה בסנכרון העמודים.');
    } finally {
      setIsBulkSyncing(false);
    }
  };
`;

  code = code.replace('  const handleResetToDefault = () => {', handlerCode + '\n  const handleResetToDefault = () => {');

  // Add button to header
  const buttonCode = `          <button
            type="button"
            onClick={handleBulkSyncAllPages}
            disabled={isBulkSyncing}
            title="עדכן את שפת הממשק, הכפתורים והכותרות בכל העמודים שכבר נוצרו באתר"
            className="px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-indigo-500/30 hover:border-indigo-500/60 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {isBulkSyncing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>{isBulkSyncing ? 'מסנכרן עמודים...' : 'סנכרן לכל עמודי האתר'}</span>
          </button>
`;

  code = code.replace(
    '          <button\n            type="button"\n            onClick={handleResetToDefault}',
    buttonCode + '          <button\n            type="button"\n            onClick={handleResetToDefault}'
  );

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('BrandUiVocabularyEditor updated with bulk sync');
} else {
  console.log('Already updated');
}
