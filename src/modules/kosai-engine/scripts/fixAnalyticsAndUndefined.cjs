const fs = require('fs');

const file1 = 'src/modules/kosai-engine/services/kosaiFirestoreService.ts';
let content1 = fs.readFileSync(file1, 'utf8');
content1 = content1.replace(/mod_kosai_analytics/g, 'kosai_ai_logs');
fs.writeFileSync(file1, content1, 'utf8');

const file2 = 'src/core/ai/geminiCostTracker.ts';
let content2 = fs.readFileSync(file2, 'utf8');
// Fix the returned TokenUsageReport to strictly avoid undefined.
content2 = content2.replace(
  /searchQueriesCount,/g,
  `...(searchQueriesCount > 0 ? { searchQueriesCount } : {}),`
);
content2 = content2.replace(
  /videoDurationSeconds,/g,
  `...(videoDurationSeconds > 0 ? { videoDurationSeconds } : {}),`
);
fs.writeFileSync(file2, content2, 'utf8');
console.log('Fixed Firestore collection name and cost tracker undefined fields');
