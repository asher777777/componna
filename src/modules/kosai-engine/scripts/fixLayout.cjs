const fs = require('fs');

let content = fs.readFileSync('src/modules/kosai-engine/components/KosaiSettingsBackoffice.tsx', 'utf8');

// 1. Put stats cards inside an accordion and rename it to 'כפתורי מידע'/'נתונים סטטיסטיים'
const statsOld = `{/* Dashboard Stats (Bento Grid) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">`;

const statsNew = `{/* Dashboard Stats - Hidden by Default */}
        <details className="group mb-8 bg-white border border-slate-200 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex items-center justify-between p-4 cursor-pointer select-none">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              הצג נתונים סטטיסטיים (טוקנים ועלויות)
            </div>
            <span className="transition group-open:rotate-180">
              <svg fill="none" height="20" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="20" className="text-slate-400"><path d="M6 9l6 6 6-6"></path></svg>
            </span>
          </summary>
          <div className="p-4 pt-0 border-t border-slate-100 mt-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">`;

content = content.replace(statsOld, statsNew);

// We need to close the div and details for stats
const statsEndOld = `              <div className={clsx("text-3xl font-black relative z-10", stat.color)}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Agents List (Bento Layout) */}`;

const statsEndNew = `              <div className={clsx("text-3xl font-black relative z-10", stat.color)}>{stat.value}</div>
            </div>
          ))}
            </div>
          </div>
        </details>

        {/* Agents List (Bento Layout) */}`;

content = content.replace(statsEndOld, statsEndNew);


// 2. Change agents list to grid
const agentsOld = `<div className="space-y-6">
          {rules.map(rule => (
            <div key={rule.id} className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-200 relative group transition-all">`;

const agentsNew = `<div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {rules.map(rule => (
            <div key={rule.id} className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-200 relative group transition-all flex flex-col">`;

content = content.replace(agentsOld, agentsNew);


// 3. Remove capabilities from the accordion so they are visible
// Looking for the capabilities accordion I created in the previous step
const capsOld = `<details className="group bg-white border border-slate-200 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex items-center justify-between p-5 cursor-pointer select-none">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        הגדרות מתקדמות - יכולות וגישה לנתונים
                      </div>
                      <span className="transition group-open:rotate-180">
                        <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24" className="w-5 h-5 text-slate-400"><path d="M6 9l6 6 6-6"></path></svg>
                      </span>
                    </summary>
                    <div className="p-5 pt-0 border-t border-slate-100 mt-2 space-y-8">
                      {/* Capabilities */}`;

const capsNew = `{/* Capabilities */}`;

content = content.replace(capsOld, capsNew);

// We need to remove the closing details for caps
const capsEndOld = `                        </div>
                      </div>
                    </div>
                  </details>
                </div>

                {/* Right Side: Brain & Tone */}`;

const capsEndNew = `                        </div>
                      </div>
                </div>

                {/* Right Side: Brain & Tone */}`;

content = content.replace(capsEndOld, capsEndNew);

// Write changes
fs.writeFileSync('src/modules/kosai-engine/components/KosaiSettingsBackoffice.tsx', content, 'utf8');
console.log('Fixed requested layout');
