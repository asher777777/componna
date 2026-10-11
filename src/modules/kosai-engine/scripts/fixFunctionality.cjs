const fs = require('fs');
const file = 'src/modules/kosai-engine/components/KosaiSettingsBackoffice.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix availableModules to not be filtered out
content = content.replace(
  'const availableModules = KOSAI_SUPPORTED_MODULES.filter(m => purchasedModules.includes(m.id));',
  'const availableModules = KOSAI_SUPPORTED_MODULES;'
);

// 2. Re-introduce handleSeedDefaultAgents
const createRuleBlock = `  const handleCreateRule = async (moduleId?: string) => {
    if (!db) return;
    const defaultModule = moduleId ? availableModules.find(m => m.id === moduleId) : null;
    const newRule: KosaiRule = {
      id: \`rule_\${Date.now()}_\${Math.floor(Math.random()*1000)}\`,
      name: defaultModule ? \`סוכן עבור \${defaultModule.name}\` : 'סוכן חדש',
      slugPattern: defaultModule?.route || '',
      moduleId: defaultModule?.id || '',
      systemPromptAddon: '',
      isActive: true,
      enabledCapabilities: [],
      allowedDataSources: [],
      toneOfVoice: { professionalism: 50, detail: 50, creativity: 50 },
      createdAt: Date.now()
    };
    
    await kosaiRulesService.saveRule(db, tenantId, newRule);
    setRules(prev => [newRule, ...prev]);
  };

  const handleSeedDefaultAgents = async () => {
    if (!db) return;
    setLoading(true);
    for (const mod of availableModules) {
      if (!rules.find(r => r.moduleId === mod.id)) {
        await handleCreateRule(mod.id);
      }
    }
    loadData();
  };`;

// replace old handleCreateRule with the new block
content = content.replace(
  /  const handleCreateRule = async \(\) => {[\s\S]*?setRules\(prev => \[newRule, \.\.\.prev\]\);\n  };/,
  createRuleBlock
);

// 3. Add handleSeedDefaultAgents button to the Top Nav
const topNavButtonsOld = `          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleCreateRule()} 
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg shadow-lg shadow-purple-500/20 flex items-center gap-2 text-sm font-bold transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">הוסף סוכן למערכת</span>
              <span className="sm:hidden">חדש</span>
            </button>
          </div>`;

const topNavButtonsNew = `          <div className="flex items-center gap-3">
            <button 
              onClick={handleSeedDefaultAgents} 
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg shadow-lg shadow-emerald-500/20 flex items-center gap-2 text-sm font-bold transition-all hover:scale-105"
              title="יצירת סוכני ברירת מחדל לכל המודולים"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">חולל סוכני ברירת מחדל</span>
            </button>
            <button 
              onClick={() => handleCreateRule()} 
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg shadow-lg shadow-purple-500/20 flex items-center gap-2 text-sm font-bold transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">הוסף סוכן למערכת</span>
              <span className="sm:hidden">חדש</span>
            </button>
          </div>`;

content = content.replace(topNavButtonsOld, topNavButtonsNew);

// 4. Wrap Capabilities & Data Sources in a <details> accordion
// We need to target the block starting with "Left Side: Capabilities & DB"

const leftSideOld = `                {/* Left Side: Capabilities & DB */}
                <div className="space-y-8">
                  
                  {/* Capabilities */}
                  <div>
                    <label className="text-sm font-bold text-slate-800 flex items-center mb-3">
                      מה הסוכן מסוגל לעשות?
                      <InfoTooltip text="סמן את היכולות המורשות שיעמדו לרשות הסוכן שלך בעת ביצוע משימות אוטומטיות במערכת." />
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(CAPABILITY_LABELS).map(([cap, label]) => {
                        const hasCap = rule.enabledCapabilities.includes(cap as KosaiCapability);
                        return (
                          <label key={cap} className={clsx("flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all", hasCap ? "bg-purple-50 border-purple-300 text-purple-700 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}>
                            <input
                              type="checkbox"
                              checked={hasCap}
                              onChange={() => {
                                const newCaps = hasCap 
                                  ? rule.enabledCapabilities.filter(c => c !== cap)
                                  : [...rule.enabledCapabilities, cap as KosaiCapability];
                                handleUpdateRule({ ...rule, enabledCapabilities: newCaps });
                              }}
                              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 bg-white"
                            />
                            <span className="text-sm font-bold">{label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Data Sources */}
                  <div>
                    <label className="text-sm font-bold text-slate-800 flex items-center mb-3">
                      לאילו נתונים בעסק יש לו גישה?
                      <InfoTooltip text="מאפשר לסוכן גישה בזמן אמת לשלוף ולחקור מידע מתוך מאגרי המידע שבחרת ב-Tenant שלך." />
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(DATA_SOURCES_LABELS).map(([col, label]) => {
                        const hasAccess = (rule.allowedDataSources || []).includes(col);
                        return (
                          <label key={col} className={clsx("flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all", hasAccess ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}>
                            <input
                              type="checkbox"
                              checked={hasAccess}
                              onChange={() => {
                                const curr = rule.allowedDataSources || [];
                                const newSources = hasAccess 
                                  ? curr.filter(c => c !== col)
                                  : [...curr, col];
                                handleUpdateRule({ ...rule, allowedDataSources: newSources });
                              }}
                              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                            />
                            <span className="text-xs font-bold truncate">{label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                </div>`;

const leftSideNew = `                {/* Left Side: Capabilities & DB */}
                <div className="space-y-6">
                  
                  <details className="group bg-white border border-slate-200 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex items-center justify-between p-5 cursor-pointer select-none">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        הגדרות מתקדמות - יכולות וגישה לנתונים
                      </div>
                      <span className="transition group-open:rotate-180">
                        <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24" className="w-5 h-5 text-slate-400"><path d="M6 9l6 6 6-6"></path></svg>
                      </span>
                    </summary>
                    <div className="p-5 pt-0 border-t border-slate-100 mt-2 space-y-8">
                      {/* Capabilities */}
                      <div>
                        <label className="text-sm font-bold text-slate-800 flex items-center mb-3 mt-4">
                          מה הסוכן מסוגל לעשות?
                          <InfoTooltip text="סמן את היכולות המורשות שיעמדו לרשות הסוכן שלך בעת ביצוע משימות אוטומטיות במערכת." />
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(CAPABILITY_LABELS).map(([cap, label]) => {
                            const hasCap = rule.enabledCapabilities.includes(cap as KosaiCapability);
                            return (
                              <label key={cap} className={clsx("flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all", hasCap ? "bg-purple-50 border-purple-300 text-purple-700 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}>
                                <input
                                  type="checkbox"
                                  checked={hasCap}
                                  onChange={() => {
                                    const newCaps = hasCap 
                                      ? rule.enabledCapabilities.filter(c => c !== cap)
                                      : [...rule.enabledCapabilities, cap as KosaiCapability];
                                    handleUpdateRule({ ...rule, enabledCapabilities: newCaps });
                                  }}
                                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 bg-white"
                                />
                                <span className="text-sm font-bold">{label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Data Sources */}
                      <div>
                        <label className="text-sm font-bold text-slate-800 flex items-center mb-3">
                          לאילו נתונים בעסק יש לו גישה?
                          <InfoTooltip text="מאפשר לסוכן גישה בזמן אמת לשלוף ולחקור מידע מתוך מאגרי המידע שבחרת ב-Tenant שלך." />
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {Object.entries(DATA_SOURCES_LABELS).map(([col, label]) => {
                            const hasAccess = (rule.allowedDataSources || []).includes(col);
                            return (
                              <label key={col} className={clsx("flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all", hasAccess ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}>
                                <input
                                  type="checkbox"
                                  checked={hasAccess}
                                  onChange={() => {
                                    const curr = rule.allowedDataSources || [];
                                    const newSources = hasAccess 
                                      ? curr.filter(c => c !== col)
                                      : [...curr, col];
                                    handleUpdateRule({ ...rule, allowedDataSources: newSources });
                                  }}
                                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                />
                                <span className="text-xs font-bold truncate">{label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </details>
                </div>`;

content = content.replace(leftSideOld, leftSideNew);

// Finally check if the Chevron icon is needed from lucide-react if we used raw SVG? I used raw SVG for the arrow so it doesn't need an import.

// To address Point C (dropdown options): Let's ensure the dropdown renders the name.
// Replace the select options map to include purchased or locked icons if needed.
const oldSelect = `<option value="">-- בחר רכיב מערכת --</option>
                      {availableModules.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}`;
const newSelect = `<option value="">-- בחר רכיב מערכת --</option>
                      {availableModules.map(m => (
                        <option key={m.id} value={m.id}>
                          {purchasedModules.includes(m.id) ? '✅ ' : '🔒 '}{m.name}
                        </option>
                      ))}`;

content = content.replace(oldSelect, newSelect);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed functionality issues');
