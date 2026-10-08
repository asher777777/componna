const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/components/BrandEcosystemSection.tsx', 'utf8');
c = c.replace(/import \{ Plus, Trash2, Box, Users, Calendar, Layers, Sparkles \} from 'lucide-react';/, 'import { Plus, Trash2, Box, Users, Calendar, Layers, Sparkles, Briefcase } from \'lucide-react\';');
fs.writeFileSync('src/modules/brand-dna-hub/components/BrandEcosystemSection.tsx', c);
