const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/modules/KosBranding/components/BrandVoiceSection.tsx');
let code = fs.readFileSync(filePath, 'utf8');

if (!code.includes('BrandUiVocabularyEditor')) {
  code = code.replace(
    "import { GenderAddressing, SectorCompliance } from '../types/brandDna';",
    "import { GenderAddressing, SectorCompliance } from '../types/brandDna';\nimport { BrandUiVocabularyEditor } from './BrandUiVocabularyEditor';"
  );

  code = code.replace(
    '      </div>\n    </div>\n  );\n};',
    '      </div>\n\n      {/* 4. Brand UI Vocabulary & Microcopy */}\n      <BrandUiVocabularyEditor />\n    </div>\n  );\n};'
  );

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('BrandVoiceSection.tsx updated successfully');
} else {
  console.log('Already updated');
}
