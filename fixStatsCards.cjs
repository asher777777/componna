const fs = require('fs');

let content = fs.readFileSync('src/modules/kosai-engine/components/KosaiSettingsBackoffice.tsx', 'utf8');

// Change the stats cards map
const oldStats = `        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'סוכנים פעילים בעסק', value: rules.filter(r => r.isActive).length, icon: Bot, color: 'text-purple-600', bg: 'bg-purple-100' },
            { label: 'מודולים שנרכשו (Tenant)', value: purchasedModules.length, icon: Layout, color: 'text-indigo-600', bg: 'bg-indigo-100' },
            { label: 'צריכת טוקנים החודש', value: totalTokens.toLocaleString(), icon: LineChart, color: 'text-sky-600', bg: 'bg-sky-100' },
            { label: 'עלות AI משוערת (₪)', value: \`₪\${totalCostIls.toFixed(4)}\`, icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          ].map((stat, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center", stat.bg, stat.color)}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <div className="text-xs font-medium text-slate-500 leading-tight">{stat.label}</div>
              </div>
              <div className="text-2xl font-black text-slate-900">{stat.value}</div>
            </div>
          ))}
        </div>`;

const newStats = `        {/* Dashboard Stats (Bento Grid) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'סוכנים פעילים בעסק', value: rules.filter(r => r.isActive).length, icon: Bot, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-100' },
            { label: 'מודולים שנרכשו (Tenant)', value: purchasedModules.length, icon: Layout, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-100' },
            { label: 'צריכת טוקנים החודש', value: totalTokens.toLocaleString(), icon: LineChart, color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-100' },
            { label: 'עלות AI משוערת', value: \`₪\${totalCostIls.toFixed(4)}\`, icon: Zap, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          ].map((stat, i) => (
            <div key={i} className={clsx("p-5 rounded-[2rem] border shadow-sm flex flex-col justify-center relative overflow-hidden", stat.bg, stat.border)}>
              <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                <stat.icon className={clsx("w-24 h-24", stat.color)} />
              </div>
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <stat.icon className={clsx("w-4 h-4", stat.color)} />
                <div className={clsx("text-xs font-bold leading-tight", stat.color)}>{stat.label}</div>
              </div>
              <div className={clsx("text-3xl font-black relative z-10", stat.color)}>{stat.value}</div>
            </div>
          ))}
        </div>`;

content = content.replace(oldStats, newStats);

fs.writeFileSync('src/modules/kosai-engine/components/KosaiSettingsBackoffice.tsx', content, 'utf8');
console.log('Fixed stats cards');
