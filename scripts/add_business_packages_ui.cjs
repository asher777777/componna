const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/components/BrandEcosystemSection.tsx', 'utf8');

if (!c.includes('generateAiBusinessPackages')) {
  c = c.replace(/import \{ generateAiEcosystemItems \} from '\.\.\/services\/geminiBrandPrompt';/, 
    'import { generateAiEcosystemItems, generateAiBusinessPackages } from \'../services/geminiBrandPrompt\';');
}

const businessPackagesEditor = `
      {/* Business Packages Section */}
      <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-500" />
              חבילות שירות לעסקים (Business Packages)
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">חבילות פתרונות מותאמות אישית לקהלי היעד, המשלבות את היכולות שלנו ללקוחות עסקיים.</p>
          </div>
          <button
            onClick={async () => {
              const res = await generateAiBusinessPackages(brandDna);
              if (res && res.length > 0) {
                const current = brandDna.ecosystem?.businessPackages || [];
                setFullBrandDna({
                  ...brandDna,
                  ecosystem: {
                    ...brandDna.ecosystem,
                    services: brandDna.ecosystem?.services || [],
                    products: brandDna.ecosystem?.products || [],
                    annualEvents: brandDna.ecosystem?.annualEvents || [],
                    communities: brandDna.ecosystem?.communities || [],
                    businessPackages: [...current, ...res.map(pkg => ({ id: \`pkg-\${Date.now()}-\${Math.random()}\`, ...pkg }))]
                  }
                });
              }
            }}
            className="flex items-center gap-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-colors font-bold shadow-md shadow-indigo-500/20"
          >
            <Sparkles className="w-4 h-4" />
            הרכב חבילות באמצעות AI
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {(eco.businessPackages || []).length === 0 ? (
            <div className="text-center p-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
              <p className="text-slate-500 dark:text-slate-400 text-sm">אין עדיין חבילות שירות לעסקים. לחץ על כפתור ה-AI כדי להרכיב חבילות מומלצות לפי ה-DNA של המותג!</p>
            </div>
          ) : (
            (eco.businessPackages || []).map((pkg) => (
              <div key={pkg.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 relative overflow-hidden group">
                <button 
                  onClick={() => {
                    const newPkgs = (eco.businessPackages || []).filter(p => p.id !== pkg.id);
                    setFullBrandDna({
                      ...brandDna,
                      ecosystem: { ...eco, businessPackages: newPkgs }
                    });
                  }}
                  className="absolute top-4 left-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 pr-2 border-r-4 border-indigo-500">{pkg.name}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">תיאור המוצר/החבילה</span>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{pkg.description}</p>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">נקודת הכאב (Pain Point)</span>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{pkg.painPointsAddressed}</p>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">מעלות על פני מתחרים</span>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{pkg.competitiveAdvantage}</p>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">קהל יעד</span>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{pkg.targetAudience}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="block text-[10px] text-indigo-500 dark:text-indigo-400 font-bold mb-1">הצעה עסקית וקריאה לפעולה (CTA)</span>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{pkg.callToAction}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
`;

c = c.replace(/    <\/div>\s*<\/div>\s*\);\s*\};\s*$/, businessPackagesEditor);
if (!c.includes('Briefcase')) {
  c = c.replace(/import \{ Plus, Trash2, Box, Users, Calendar, Layers, Sparkles \} from 'lucide-react';/, 
    'import { Plus, Trash2, Box, Users, Calendar, Layers, Sparkles, Briefcase } from \'lucide-react\';');
}

fs.writeFileSync('src/modules/brand-dna-hub/components/BrandEcosystemSection.tsx', c);
