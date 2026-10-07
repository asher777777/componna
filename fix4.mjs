import fs from 'fs';

// Fix 1: brandDnaFirestore.ts
let firestoreFile = fs.readFileSync('src/modules/brand-dna-hub/services/brandDnaFirestore.ts', 'utf8');

firestoreFile = firestoreFile.replace(
  /localStorage\.setItem\(localStorageKey, JSON\.stringify\(payload\)\);\s*\} catch \(err: any\) \{\s*console\.warn\(\`\[BrandDNA\] Failed saving brand_dna for tenant \"\$\{tenantId\}\" to local storage:\`, err\);\s*\}/,
  `localStorage.setItem(localStorageKey, JSON.stringify(payload));
    } catch (err: any) {
      if (err.name === 'QuotaExceededError') {
        // Silently ignore quota errors (e.g. large base64 logos)
        // Optionally, we could clear local storage or strip the large fields here.
      } else {
        console.warn(\`[BrandDNA] Failed saving brand_dna for tenant "\${tenantId}" to local storage:\`, err);
      }
    }`
);

fs.writeFileSync('src/modules/brand-dna-hub/services/brandDnaFirestore.ts', firestoreFile, 'utf8');


// Fix 2: aiPageGenerator.ts
let aiGeneratorFile = fs.readFileSync('src/modules/page-builder/services/aiPageGenerator.ts', 'utf8');

// A. generatePageIdeas
aiGeneratorFile = aiGeneratorFile.replace(
  /const response = await callGeminiApi<MarketingIdea\[\]>\(\{\s*prompt,\s*providedApiKey: apiKey,\s*temperature: 0\.85,\s*\}\);/,
  `const response = await callGeminiApi<MarketingIdea[]>({
      prompt,
      providedApiKey: apiKey,
      temperature: 0.85,
      timeoutMs: 45000,
    });`
);

// B. generatePageLive
aiGeneratorFile = aiGeneratorFile.replace(
  /const apiResult = await callGeminiApi<any>\(\{\s*prompt: fullPrompt,\s*providedApiKey: apiKey,\s*temperature: 0\.75,\s*\}\);/,
  `const apiResult = await callGeminiApi<any>({
        prompt: fullPrompt,
        providedApiKey: apiKey,
        temperature: 0.75,
        timeoutMs: 90000, // 90 seconds for large full-page generation
      });`
);

// C. generateSectionLive
aiGeneratorFile = aiGeneratorFile.replace(
  /const response = await callGeminiApi<any>\(\{\s*prompt,\s*providedApiKey: apiKey,\s*temperature: 0\.7,\s*\}\);/,
  `const response = await callGeminiApi<any>({
      prompt,
      providedApiKey: apiKey,
      temperature: 0.7,
      timeoutMs: 45000, // 45 seconds for a single section
    });`
);

fs.writeFileSync('src/modules/page-builder/services/aiPageGenerator.ts', aiGeneratorFile, 'utf8');

console.log('Fixed QuotaExceededError warning and Timeout issues.');
