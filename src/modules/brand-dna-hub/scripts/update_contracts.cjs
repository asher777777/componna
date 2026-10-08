const fs = require('fs');
let c = fs.readFileSync('src/core/contracts/index.ts', 'utf8');

const packageInterface = `export interface BusinessPackage {
  id: string;
  name: string;
  description: string;
  painPointsAddressed: string;
  competitiveAdvantage: string;
  targetAudience: string;
  callToAction: string;
}

export interface BrandEcosystem`;

c = c.replace(/export interface BrandEcosystem/, packageInterface);
c = c.replace(/communities: string\[\];/, 'communities: string[];\n  businessPackages?: BusinessPackage[];');

fs.writeFileSync('src/core/contracts/index.ts', c);
