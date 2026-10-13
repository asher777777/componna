const fs = require('fs');
let c = fs.readFileSync('src/modules/KosBranding/components/FlagshipProductsEditor.tsx', 'utf8');

const imports = `import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import { pageBuilderFirestore } from '../../KosWebAi/services/pageBuilderFirestore';
import { PageBuilderConfig } from '../../KosWebAi/types';
import { MediaPickerModal } from '../../media-gallery-hub/components/MediaPickerModal';`;

c = c.replace(/import \{ FlagshipProduct \} from '\.\.\/types\/brandDna';/, 
  'import { FlagshipProduct } from \'../types/brandDna\';\n' + imports);

fs.writeFileSync('src/modules/KosBranding/components/FlagshipProductsEditor.tsx', c);
