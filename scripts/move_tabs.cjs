const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/StandaloneView.tsx', 'utf8');

// 1. Remove from FAB
c = c.replace(/<button[^>]+onClick=\{\(\) => \{ setViewMode\('tabs'\); setIsFabOpen\(false\); \}\}[\s\S]*?<\/button>/, '');

// 2. Extract tabs navigation and place it above dashboard
const tabsNavMatch = c.match(/\{\/\* Category Tabs \*\/\}([\s\S]*?)<\/div>\s*\{\/\* Tabbed Content \*\/\}/);
if (tabsNavMatch) {
  let tabsNav = tabsNavMatch[0].replace('setActiveTab(tab.id)', '{ setActiveTab(tab.id); setViewMode(\\\'tabs\\\'); }');
  
  // Remove it from the original location
  c = c.replace(tabsNavMatch[0], '{/* Tabbed Content */}');
  
  // Insert it above dashboard
  c = c.replace(/\{\/\* 3\. Dashboard Mode View \*\/\}/, '{/* Permanent Category Tabs */}\n          ' + tabsNav + '\n\n          {/* 3. Dashboard Mode View */}');
  
  fs.writeFileSync('src/modules/brand-dna-hub/StandaloneView.tsx', c);
  console.log('Done');
} else {
  console.log('Could not find tabs nav');
}
