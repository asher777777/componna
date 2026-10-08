const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/components/TargetAudienceSection.tsx', 'utf8');

const newPersonaHeader = `            <div className="p-4 bg-slate-900/90 border border-cyan-500/30 rounded-xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-cyan-300">הגדרת פרסונה חדשה</h4>
                <button
                  type="button"
                  onClick={handleGeneratePersonaAi}
                  disabled={isGeneratingPersona}
                  className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isGeneratingPersona ? 'מייצר עם AI...' : 'מלא אוטומטית עם AI'}
                </button>
              </div>`;

c = c.replace(/<div className="p-4 bg-slate-900\/90 border border-cyan-500\/30 rounded-xl space-y-3 animate-in fade-in">\s*<h4 className="text-xs font-bold text-cyan-300">.*?<\/h4>/, newPersonaHeader);

const newObjectionHeader = `            <div className="p-4 bg-slate-900/90 border border-orange-500/30 rounded-xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-orange-300">הגדרת התנגדות חדשה</h4>
                <button
                  type="button"
                  onClick={handleGenerateObjectionAi}
                  disabled={isGeneratingObjection}
                  className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isGeneratingObjection ? 'מייצר עם AI...' : 'מלא אוטומטית עם AI'}
                </button>
              </div>
              <div>`;

c = c.replace(/<div className="p-4 bg-slate-900\/90 border border-orange-500\/30 rounded-xl space-y-3 animate-in fade-in">\s*<div>/, newObjectionHeader);

fs.writeFileSync('src/modules/brand-dna-hub/components/TargetAudienceSection.tsx', c);
