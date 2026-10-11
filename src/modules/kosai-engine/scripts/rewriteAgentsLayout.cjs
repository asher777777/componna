const fs = require('fs');

let content = fs.readFileSync('src/modules/kosai-engine/components/KosaiSettingsBackoffice.tsx', 'utf8');

// 1. Inject state
content = content.replace(
    'const [rules, setRules] = useState<KosaiRule[]>([]);',
    'const [rules, setRules] = useState<KosaiRule[]>([]);\n  const [openRuleId, setOpenRuleId] = useState<string | null>(null);'
);

// 2. Update handleCreateRule to open the new rule
content = content.replace(
    'setRules(prev => [newRule, ...prev]);\n  };',
    'setRules(prev => [newRule, ...prev]);\n    setOpenRuleId(newRule.id);\n  };'
);

// 3. Change agents mapping to use accordion style
const agentsStart = content.indexOf('{/* Agents List (Bento Layout) */}');
const agentsEnd = content.indexOf('{rules.length === 0 && (');

const newAgentsBlock = `{/* Agents List (Accordion Layout) */}
          <div className="space-y-4 mb-8">
            {rules.map(rule => (
              <div key={rule.id} className="bg-white rounded-[1.5rem] shadow-sm border border-slate-200 relative group transition-all overflow-hidden">
                
                {/* Accordion Summary */}
                <div 
                  className="flex items-center justify-between p-5 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
                  onClick={() => setOpenRuleId(openRuleId === rule.id ? null : rule.id)}
                >
                  <div className="flex items-center gap-4">
                    <span className={clsx("transition-transform duration-300", openRuleId === rule.id ? "rotate-180" : "")}>
                      <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="20" className="text-slate-400"><path d="M6 9l6 6 6-6"></path></svg>
                    </span>
                    <h3 className="text-xl font-black text-slate-900">{rule.name || 'סוכן ללא שם'}</h3>
                    {!rule.isActive && <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-md">לא פעיל</span>}
                  </div>
                  
                  <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => handleDeleteRule(rule.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors shrink-0"
                      title="מחק סוכן"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Accordion Body */}
                {openRuleId === rule.id && (
                  <div className="p-6 sm:p-8 border-t border-slate-200 bg-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <input 
                            type="text" 
                            value={rule.name} 
                            placeholder="שם הסוכן..."
                            onChange={e => handleUpdateRule({ ...rule, name: e.target.value })}
                            className="text-2xl font-black text-slate-900 bg-transparent border-b-2 border-transparent focus:border-slate-400 focus:outline-none transition-colors w-full sm:w-auto"
                          />
                          <button 
                            onClick={() => handleUpdateRule({ ...rule, isActive: !rule.isActive })}
                            className={clsx("relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none", rule.isActive ? "bg-purple-600" : "bg-slate-300")}
                          >
                            <span className={clsx("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", rule.isActive ? "-translate-x-6" : "-translate-x-1")} />
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <span className="text-sm font-medium text-slate-500">
                            סוכן המשויך למערכת:
                          </span>
                          <select
                            value={rule.moduleId || ''}
                            onChange={e => {
                              const mId = e.target.value;
                              const m = KOSAI_SUPPORTED_MODULES.find(x => x.id === mId);
                              handleUpdateRule({ ...rule, moduleId: mId, slugPattern: m?.route || '' });
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-sm font-bold text-slate-800 focus:ring-0 focus:border-slate-400 outline-none cursor-pointer"
                          >
                            <option value="">-- בחר רכיב מערכת --</option>
                            {KOSAI_SUPPORTED_MODULES.map(m => (
                              <option key={m.id} value={m.id}>
                                {purchasedModules.includes(m.id) ? '✅ ' : '🔒 '}{m.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
      
                    {/* Grid 2 Columns for Agent Configuration */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                      
                      {/* Left Side: Capabilities & DB */}
                      <div className="space-y-6">
                        
                        {/* Capabilities */}
                        <div>
                          <label className="text-sm font-bold text-slate-800 flex items-center mb-3 mt-4">
                            מה הסוכן מסוגל לעשות?
                            <InfoTooltip text="סמן את היכולות המורשות שיעמדו לרשות הסוכן שלך בעת ביצוע משימות אוטומטיות במערכת." />
                          </label>
                          <div className="flex flex-col gap-2">
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
                          <div className="flex flex-col gap-2">
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
  
                      {/* Right Side: Brain & Tone */}
                      <div className="space-y-6">
                        
                        {/* Persona Configuration */}
                        <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                          <label className="text-sm font-bold text-slate-800 flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              אופי ומומחיות הסוכן
                              <InfoTooltip text="בחר תבנית אישיותית מוכנה מראש שתנחה את Kosun כיצד להתנהג ולהגיב, או כתוב פרומפט משלך." />
                            </div>
                            <select
                              value={rule.templateId || ''}
                              onChange={e => applyTemplate(rule, e.target.value)}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-sm outline-none cursor-pointer"
                            >
                              <option value="">תבניות AI לבחירה...</option>
                              {KOSAI_TEMPLATES.filter(t => t.targetModules.includes('all') || t.targetModules.includes(rule.moduleId || '')).map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                          </label>
      
                          <div className="relative">
                            <textarea 
                              value={rule.systemPromptAddon || ''} 
                              onChange={e => handleUpdateRule({ ...rule, systemPromptAddon: e.target.value })}
                              placeholder="הסבר במילים פשוטות ל-Kosun איזה סוג סוכן אתה צריך שיהיה, או בחר תבנית..."
                              className="w-full h-32 p-4 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none resize-none shadow-inner"
                            />
                            <button 
                              onClick={() => handleGeneratePrompt(rule)}
                              disabled={!rule.moduleId}
                              className="absolute bottom-3 left-3 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-purple-500/20"
                            >
                              <Sparkles className="w-3 h-3" />
                              נסח לי פרומפט
                            </button>
                          </div>
                        </div>
      
                        {/* Tone of Voice */}
                        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200">
                          <label className="text-sm font-bold text-slate-800 flex items-center mb-6">
                            סגנון שיחה
                            <InfoTooltip text="כוונן את האופי והטון שבו הסוכן מתנסח במערכת ומול הלקוחות." />
                          </label>
                          <div className="space-y-6">
                            
                            <div className="relative">
                              <div className="flex justify-between text-[11px] font-bold text-slate-400 absolute -top-5 w-full">
                                <span>זורם וקליל</span>
                                <span>רשמי ומקצועי</span>
                              </div>
                              <input 
                                type="range" min="0" max="100" 
                                value={rule.toneOfVoice?.professionalism ?? 50}
                                onChange={e => handleUpdateRule({ ...rule, toneOfVoice: { ...rule.toneOfVoice!, professionalism: Number(e.target.value) } })}
                                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                              />
                            </div>
      
                            <div className="relative">
                              <div className="flex justify-between text-[11px] font-bold text-slate-400 absolute -top-5 w-full">
                                <span>קצר ולעניין</span>
                                <span>מפורט ומעמיק</span>
                              </div>
                              <input 
                                type="range" min="0" max="100" 
                                value={rule.toneOfVoice?.detail ?? 50}
                                onChange={e => handleUpdateRule({ ...rule, toneOfVoice: { ...rule.toneOfVoice!, detail: Number(e.target.value) } })}
                                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                              />
                            </div>
      
                            <div className="relative">
                              <div className="flex justify-between text-[11px] font-bold text-slate-400 absolute -top-5 w-full">
                                <span>שמרני ומדויק</span>
                                <span>נועז ויצירתי</span>
                              </div>
                              <input 
                                type="range" min="0" max="100" 
                                value={rule.toneOfVoice?.creativity ?? 50}
                                onChange={e => handleUpdateRule({ ...rule, toneOfVoice: { ...rule.toneOfVoice!, creativity: Number(e.target.value) } })}
                                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                              />
                            </div>
      
                          </div>
                        </div>
      
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>\n`;

content = content.substring(0, agentsStart) + newAgentsBlock + content.substring(agentsEnd);

fs.writeFileSync('src/modules/kosai-engine/components/KosaiSettingsBackoffice.tsx', content, 'utf8');
console.log('Fixed requested layout');
