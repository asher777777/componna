const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/components/FlagshipProductsEditor.tsx', 'utf8');

c = c.replace(/import \{ Box, Sparkles, Trash2, Image as ImageIcon, ExternalLink, X, Plus \} from 'lucide-react';/, 'import { Box, Sparkles, Trash2, Image as ImageIcon, ExternalLink, X, Plus, LayoutTemplate } from \'lucide-react\';');

fs.writeFileSync('src/modules/brand-dna-hub/components/FlagshipProductsEditor.tsx', c);
