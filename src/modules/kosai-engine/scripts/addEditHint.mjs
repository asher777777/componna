import fs from 'fs';

let bo = fs.readFileSync('src/modules/kosai-engine/components/KosaiSettingsBackoffice.tsx', 'utf8');

bo = bo.replace(
  /<label className=\{clsx\("text-sm font-bold flex items-center gap-2", theme === 'light' \? "text-slate-700" : "text-slate-300"\)\}>\n\s*<Target className="w-4 h-4 text-purple-500" \/>\n\s*הנחיות התנהגות \(Prompt\)\n\s*<\/label>/g,
  `<label className={clsx("text-sm font-bold flex items-center gap-2", theme === 'light' ? "text-slate-700" : "text-slate-300")}>
                      <Target className="w-4 h-4 text-purple-500" />
                      הנחיות התנהגות (Prompt)
                      <span className="text-[10px] font-normal text-slate-400 mr-2 border border-slate-300 dark:border-slate-700 px-2 py-0.5 rounded-full">ניתן לעריכה</span>
                    </label>`
);

fs.writeFileSync('src/modules/kosai-engine/components/KosaiSettingsBackoffice.tsx', bo);
