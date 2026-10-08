const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/components/FlagshipProductsEditor.tsx', 'utf8');

const imports = `import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import { pageBuilderFirestore } from '../../page-builder/services/pageBuilderFirestore';
import { PageBuilderConfig } from '../../page-builder/types';
import { MediaPickerModal } from '../../media-gallery-hub/components/MediaPickerModal';`;

c = c.replace(/import \{ FlagshipProduct \} from '\.\.\/types\/brandDna';/, 
  'import { FlagshipProduct } from \'../types/brandDna\';\n' + imports);

fs.writeFileSync('src/modules/brand-dna-hub/components/FlagshipProductsEditor.tsx', c);
