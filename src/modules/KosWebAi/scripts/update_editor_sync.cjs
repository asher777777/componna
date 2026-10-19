const fs = require('fs');
const path = require('path');

// 1. Update PageBuilderFloatingNav.tsx
const navPath = path.resolve('src/modules/KosWebAi/components/PageBuilderFloatingNav.tsx');
let navCode = fs.readFileSync(navPath, 'utf8');

if (!navCode.includes('onSyncBrandDna')) {
  navCode = navCode.replace(
    '  CheckCircle2,\n',
    '  CheckCircle2,\n  Wand2,\n'
  );

  navCode = navCode.replace(
    '  onConvertToVideo?: () => void;\n',
    '  onConvertToVideo?: () => void;\n  onSyncBrandDna?: () => void;\n'
  );

  navCode = navCode.replace(
    '  onConvertToVideo,\n',
    '  onConvertToVideo,\n  onSyncBrandDna,\n'
  );

  const syncButton = `
                {onSyncBrandDna && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsNavModalOpen(false);
                      onSyncBrandDna();
                    }}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800 text-right flex flex-col gap-2 transition-all cursor-pointer"
                  >
                    <Wand2 className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-bold text-white">רענן לפי מיתוג</span>
                    <span className="text-[11px] text-slate-400">סנכרון שפת ממשק וכותרות</span>
                  </button>
                )}
`;

  navCode = navCode.replace(
    '                {onOpenBlueprints && (',
    syncButton + '                {onOpenBlueprints && ('
  );

  fs.writeFileSync(navPath, navCode, 'utf8');
  console.log('PageBuilderFloatingNav.tsx updated');
} else {
  console.log('PageBuilderFloatingNav.tsx already updated');
}

// 2. Update PageBuilderEditor.tsx
const editorPath = path.resolve('src/modules/KosWebAi/PageBuilderEditor.tsx');
let editorCode = fs.readFileSync(editorPath, 'utf8');

if (!editorCode.includes('handleSyncBrandDna')) {
  editorCode = editorCode.replace(
    "import { hydrateSectionWithBrandDna, resolveLiveBrandDna } from './services/brandSectionHydrator';",
    "import { hydrateSectionWithBrandDna, resolveLiveBrandDna } from './services/brandSectionHydrator';\nimport { syncSinglePageWithBrandDna } from './services/pageBrandSyncService';"
  );

  const syncFn = `
  // Sync page with live Brand DNA & UI Vocabulary
  const handleSyncBrandDna = async () => {
    const liveDna = resolveLiveBrandDna(loadedBrandDna, tenantId);
    if (!liveDna) return;
    if (!window.confirm('האם לרענן את כל כותרות האזורים, הכפתורים והפלייסהולדרים בעמוד זה לפי שפת הממשק של המותג? (גרסת שחזור תישמר אוטומטית)')) {
      return;
    }
    const { updatedPage, changesCount } = syncSinglePageWithBrandDna(config, liveDna);
    setConfig(updatedPage);
    if (onSaveConfig) {
      await onSaveConfig(updatedPage);
    }
    alert(\`✓ בוצע סנכרון שפת ממשק! עודכנו \${changesCount} פריטים בעמוד.\`);
  };
`;

  editorCode = editorCode.replace('  // Save handler\n  const handleSave', syncFn + '\n  // Save handler\n  const handleSave');

  editorCode = editorCode.replace(
    '        onConvertToVideo={onConvertToVideo}\n',
    '        onConvertToVideo={onConvertToVideo}\n        onSyncBrandDna={handleSyncBrandDna}\n'
  );

  fs.writeFileSync(editorPath, editorCode, 'utf8');
  console.log('PageBuilderEditor.tsx updated');
} else {
  console.log('PageBuilderEditor.tsx already updated');
}
