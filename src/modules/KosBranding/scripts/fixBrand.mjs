import fs from 'fs';

let brand = fs.readFileSync('src/modules/KosBranding/components/BrandEcosystemSection.tsx', 'utf8');
brand = brand.replace(/const \[flagships, setFlagships\] = useState<string\[\]>\([\s\S]*?\);/, 'const [flagships, setFlagships] = useState<string[]>(identity.flagshipProducts as any);');
fs.writeFileSync('src/modules/KosBranding/components/BrandEcosystemSection.tsx', brand);
