import fs from 'fs';

let bento = fs.readFileSync('src/modules/control-center-hub/components/layouts/BentoGridLayout.tsx', 'utf8');
if (!bento.includes('Bot,')) {
  bento = bento.replace(/Play\n\} from 'lucide-react';/, "Play,\n  Bot\n} from 'lucide-react';");
  bento = bento.replace(/case 'Smartphone': return Smartphone;/, "case 'Smartphone': return Smartphone;\n      case 'Bot': return Bot;");
  fs.writeFileSync('src/modules/control-center-hub/components/layouts/BentoGridLayout.tsx', bento);
}

let marketplace = fs.readFileSync('src/modules/saas-storefront-composer/components/MarketplaceCatalogView.tsx', 'utf8');
if (!marketplace.includes('Bot,')) {
  marketplace = marketplace.replace(/Play\n\} from 'lucide-react';/, "Play,\n  Bot\n} from 'lucide-react';");
  marketplace = marketplace.replace(/case 'Smartphone': return Smartphone;/, "case 'Smartphone': return Smartphone;\n      case 'Bot': return Bot;");
  fs.writeFileSync('src/modules/saas-storefront-composer/components/MarketplaceCatalogView.tsx', marketplace);
}
