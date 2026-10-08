const fs = require('fs');
let c = fs.readFileSync('src/core/contracts/index.ts', 'utf8');

const flagshipInterface = `export interface FlagshipProduct {
  id: string;
  nameAndSlogan: string;
  shortDescription: string;
  longDescription: string;
  imageUrl: string;
  painPointSolved: string;
  targetAudience: string;
  competitiveAdvantage: string;
  linkedPageId?: string;
}

export interface BusinessPackage`;

c = c.replace(/export interface BusinessPackage/, flagshipInterface);
c = c.replace(/products: string\[\];/, 'products: (string | FlagshipProduct)[];');

fs.writeFileSync('src/core/contracts/index.ts', c);
