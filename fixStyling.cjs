const fs = require('fs');

let content = fs.readFileSync('src/modules/kosai-engine/components/KosaiSettingsBackoffice.tsx', 'utf8');

// Shrink InfoTooltip
content = content.replace(
  'w-5 h-5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200',
  'w-4 h-4 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200'
);
content = content.replace('text-[10px] font-bold font-serif italic', 'text-[10px] font-black font-serif italic');

// Replace top navigation buttons
content = content.replace(
  'w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md',
  'w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20'
);

content = content.replace(
  'px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm flex items-center gap-2 text-sm font-bold transition-all',
  'px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg shadow-lg shadow-purple-500/20 flex items-center gap-2 text-sm font-bold transition-all hover:scale-105'
);

// Stats cards
content = content.replace(
  /{ label: 'סוכנים פעילים בעסק', value: rules\.filter\(r => r\.isActive\)\.length, icon: Bot, color: 'text-slate-700', bg: 'bg-slate-100' }/,
  "{ label: 'סוכנים פעילים בעסק', value: rules.filter(r => r.isActive).length, icon: Bot, color: 'text-purple-600', bg: 'bg-purple-100' }"
);
content = content.replace(
  /{ label: 'מודולים שנרכשו \(Tenant\)', value: purchasedModules\.length, icon: Layout, color: 'text-slate-700', bg: 'bg-slate-100' }/,
  "{ label: 'מודולים שנרכשו (Tenant)', value: purchasedModules.length, icon: Layout, color: 'text-indigo-600', bg: 'bg-indigo-100' }"
);
content = content.replace(
  /{ label: 'צריכת טוקנים החודש', value: totalTokens\.toLocaleString\(\), icon: LineChart, color: 'text-slate-700', bg: 'bg-slate-100' }/,
  "{ label: 'צריכת טוקנים החודש', value: totalTokens.toLocaleString(), icon: LineChart, color: 'text-sky-600', bg: 'bg-sky-100' }"
);
content = content.replace(
  /{ label: 'עלות AI משוערת \(₪\)', value: `₪\$\{totalCostIls\.toFixed\(4\)\}`, icon: Zap, color: 'text-slate-700', bg: 'bg-slate-100' }/,
  "{ label: 'עלות AI משוערת (₪)', value: `₪${totalCostIls.toFixed(4)}`, icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-100' }"
);

// Toggle active switch
content = content.replace(
  'rule.isActive ? "bg-slate-900" : "bg-slate-300"',
  'rule.isActive ? "bg-purple-600" : "bg-slate-300"'
);

// Capabilities active checkboxes
content = content.replace(
  'hasCap ? "bg-slate-900 border-slate-900 text-white shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"',
  'hasCap ? "bg-purple-50 border-purple-300 text-purple-700 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"'
);
content = content.replace(
  'className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300 bg-white"',
  'className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 bg-white"'
);

// DB active checkboxes
content = content.replace(
  'hasAccess ? "bg-slate-100 border-slate-300 text-slate-900" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"',
  'hasAccess ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"'
);
content = content.replace(
  'className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"',
  'className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"'
);

// Generate Prompt Button
content = content.replace(
  'className="absolute bottom-3 left-3 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"',
  'className="absolute bottom-3 left-3 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-purple-500/20"'
);

// Sliders Accent
content = content.replace(
  'value={rule.toneOfVoice?.professionalism ?? 50}\n                          onChange={e => handleUpdateRule({ ...rule, toneOfVoice: { ...rule.toneOfVoice!, professionalism: Number(e.target.value) } })}\n                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"',
  'value={rule.toneOfVoice?.professionalism ?? 50}\n                          onChange={e => handleUpdateRule({ ...rule, toneOfVoice: { ...rule.toneOfVoice!, professionalism: Number(e.target.value) } })}\n                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500"'
);
content = content.replace(
  'value={rule.toneOfVoice?.detail ?? 50}\n                          onChange={e => handleUpdateRule({ ...rule, toneOfVoice: { ...rule.toneOfVoice!, detail: Number(e.target.value) } })}\n                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"',
  'value={rule.toneOfVoice?.detail ?? 50}\n                          onChange={e => handleUpdateRule({ ...rule, toneOfVoice: { ...rule.toneOfVoice!, detail: Number(e.target.value) } })}\n                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"'
);
content = content.replace(
  'value={rule.toneOfVoice?.creativity ?? 50}\n                          onChange={e => handleUpdateRule({ ...rule, toneOfVoice: { ...rule.toneOfVoice!, creativity: Number(e.target.value) } })}\n                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"',
  'value={rule.toneOfVoice?.creativity ?? 50}\n                          onChange={e => handleUpdateRule({ ...rule, toneOfVoice: { ...rule.toneOfVoice!, creativity: Number(e.target.value) } })}\n                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-500"'
);

// Empty State button
content = content.replace(
  'px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-transform hover:scale-105',
  'px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/20 text-white rounded-xl font-bold transition-transform hover:scale-105'
);

fs.writeFileSync('src/modules/kosai-engine/components/KosaiSettingsBackoffice.tsx', content, 'utf8');
console.log('Fixed styling');
