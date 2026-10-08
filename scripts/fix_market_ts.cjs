const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/components/MarketResearchAgentSection.tsx', 'utf8');

const fixEcosystem = `          ecosystem: {
            services: [],
            products: [],
            annualEvents: [],
            communities: [],
            ...(updatedBrand.ecosystem || {}),
            services: [...currentServices, newService]
          }`;

c = c.replace(/ecosystem: \{[\s\S]*?services: \[\.\.\.currentServices, newService\]\s*\}/, fixEcosystem);
fs.writeFileSync('src/modules/brand-dna-hub/components/MarketResearchAgentSection.tsx', c);
