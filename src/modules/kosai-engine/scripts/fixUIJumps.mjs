import fs from 'fs';

let bo = fs.readFileSync('src/modules/kosai-engine/components/KosaiSettingsBackoffice.tsx', 'utf8');

// Fix jumping screen (Optimistic Update)
bo = bo.replace(
  /const handleUpdateRule = async \(rule: KosaiRule\) => \{\n\s*if \(!db\) return;\n\s*await kosaiRulesService\.saveRule\(db, tenantId, rule\);\n\s*loadData\(\);\n\s*\};/,
  `const handleUpdateRule = async (rule: KosaiRule) => {
    if (!db) return;
    setRules(prev => prev.map(r => r.id === rule.id ? rule : r));
    await kosaiRulesService.saveRule(db, tenantId, rule);
  };`
);

// Fix handleGeneratePrompt arguments to pass allowedDataSources and toneOfVoice
bo = bo.replace(
  /const \{ prompt, usage \} = await generateAgentPromptWithAi\(modName, caps\);/,
  `const { prompt, usage } = await generateAgentPromptWithAi(modName, caps, rule.allowedDataSources || [], rule.toneOfVoice || { professionalism: 50, detail: 50, creativity: 50 });`
);

// Replace template dropdown with searchable datalist
bo = bo.replace(
  /<select\n\s*value=\{rule\.templateId \|\| ''\}\n\s*onChange=\{e => applyTemplate\(rule, e\.target\.value\)\}\n\s*className=\{clsx\("p-2 rounded-lg border text-sm mt-2 sm:mt-0 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer", theme === 'light' \? "bg-purple-50 border-purple-200 text-purple-800" : "bg-purple-900\/30 border-purple-500\/30 text-purple-300"\)\}\n\s*>\n\s*<option value="">-- בחר תבנית מוכנה --<\/option>\n\s*\{KOSAI_TEMPLATES.filter[\\s\\S]*?<\/select>/,
  `
  <div className="relative">
    <input
      type="text"
      list={\`templates-list-\${rule.id}\`}
      value={KOSAI_TEMPLATES.find(t => t.id === rule.templateId)?.name || rule.templateId || ''}
      onChange={e => {
        const val = e.target.value;
        const matched = KOSAI_TEMPLATES.find(t => t.name === val || t.id === val);
        if (matched) {
          applyTemplate(rule, matched.id);
        } else {
          handleUpdateRule({ ...rule, templateId: val });
        }
      }}
      placeholder="חפש או בחר תבנית..."
      className={clsx("p-2 rounded-lg border text-sm mt-2 sm:mt-0 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-text w-64", theme === 'light' ? "bg-purple-50 border-purple-200 text-purple-800" : "bg-purple-900/30 border-purple-500/30 text-purple-300")}
    />
    <datalist id={\`templates-list-\${rule.id}\`}>
      {KOSAI_TEMPLATES.filter(t => t.targetModules.includes('all') || t.targetModules.includes(rule.moduleId || '')).map(t => (
        <option key={t.id} value={t.name}>{t.description}</option>
      ))}
    </datalist>
  </div>
  `
);

fs.writeFileSync('src/modules/kosai-engine/components/KosaiSettingsBackoffice.tsx', bo);
