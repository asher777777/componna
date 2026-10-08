import fs from 'fs';
let brand = fs.readFileSync('src/modules/brand-dna-hub/components/BrandEcosystemSection.tsx', 'utf8');
brand = brand.replace(/const \[products, setProducts\] = useState<string\[\]>\(eco\.products \|\| \[\]\);/, 'const [products, setProducts] = useState<any[]>(eco.products || []);');
fs.writeFileSync('src/modules/brand-dna-hub/components/BrandEcosystemSection.tsx', brand);
