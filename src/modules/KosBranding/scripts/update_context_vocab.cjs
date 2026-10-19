const fs = require('fs');
const path = require('path');

const contextPath = path.resolve('src/modules/KosBranding/context/BrandDnaContext.tsx');
let code = fs.readFileSync(contextPath, 'utf8');

if (!code.includes('updateUiVocabulary')) {
  // 1. Import
  code = code.replace(
    "BrandTrustAndCheckout } from '../types/brandDna';",
    "BrandTrustAndCheckout, BrandUiVocabulary } from '../types/brandDna';"
  );

  // 2. Interface
  code = code.replace(
    "updateTrust: (partial: Partial<BrandTrustAndCheckout>) => void;",
    "updateTrust: (partial: Partial<BrandTrustAndCheckout>) => void;\n  updateUiVocabulary: (partial: Partial<BrandUiVocabulary>) => void;"
  );

  // 3. Callback
  const updateUiVocabFn = `  const updateUiVocabulary = useCallback((partial: Partial<BrandUiVocabulary>) => {
    markLocalEdit();
    setBrandDna((prev) => ({
      ...prev,
      uiVocabulary: {
        ...(prev.uiVocabulary || {}),
        ...partial,
        sectionHeadings: {
          ...(prev.uiVocabulary?.sectionHeadings || {}),
          ...(partial.sectionHeadings || {}),
        },
      },
    }));
  }, [markLocalEdit]);\n\n`;

  code = code.replace(
    '  const updateTrust = useCallback((partial: Partial<BrandTrustAndCheckout>) => {',
    updateUiVocabFn + '  const updateTrust = useCallback((partial: Partial<BrandTrustAndCheckout>) => {'
  );

  // 4. Value
  code = code.replace(
    'updateTrust,\n        setFullBrandDna,',
    'updateTrust,\n        updateUiVocabulary,\n        setFullBrandDna,'
  );

  // 5. Fallback
  code = code.replace(
    "updateTrust: () => {},\n  setFullBrandDna:",
    "updateTrust: () => {},\n  updateUiVocabulary: () => {},\n  setFullBrandDna:"
  );

  fs.writeFileSync(contextPath, code, 'utf8');
  console.log('BrandDnaContext updated successfully');
} else {
  console.log('Already updated');
}
