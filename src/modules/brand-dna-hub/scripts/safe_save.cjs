const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/services/brandDnaFirestore.ts', 'utf8');

const safeSaveCode = `  // 1. Save to LocalStorage immediately (tenant scoped)
  try {
    const jsonPayload = JSON.stringify(payload);
    // If payload is suspiciously large (e.g. > 1MB), strip the logo to avoid Firestore/LocalStorage crashing
    if (jsonPayload.length > 1024 * 1024) {
       console.warn('[BrandDNA] Payload too large! Stripping logo to prevent quota errors.');
       payload.identity.logoUrl = '';
       localStorage.setItem(localStorageKey, JSON.stringify(payload));
    } else {
       localStorage.setItem(localStorageKey, jsonPayload);
    }
  } catch (err: any) {
    console.warn(\`[BrandDNA] Failed saving brand_dna for tenant "\${tenantId}" to local storage:\`, err);
    // If QuotaExceededError, try without logo
    if (err.name === 'QuotaExceededError') {
       payload.identity.logoUrl = '';
       try { localStorage.setItem(localStorageKey, JSON.stringify(payload)); } catch(e) {}
    }
  }`;

c = c.replace(/\/\/ 1\. Save to LocalStorage immediately \(tenant scoped\)[\s\S]*?console\.warn\(\`\[BrandDNA\] Failed saving brand_dna for tenant "\$\{tenantId\}" to local storage:\`, err\);\s*\}/, safeSaveCode);
fs.writeFileSync('src/modules/brand-dna-hub/services/brandDnaFirestore.ts', c);
