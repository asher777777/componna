const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/components/BrandEcosystemSection.tsx', 'utf8');

if (!c.includes('generateAiEcosystemItems')) {
  c = c.replace(/import \{ Plus, Trash2, Box, Users, Calendar, Layers, Sparkles \} from 'lucide-react';/, 
    'import { Plus, Trash2, Box, Users, Calendar, Layers, Sparkles } from \'lucide-react\';\nimport { generateAiEcosystemItems } from \'../services/geminiBrandPrompt\';');
}

const aiLogic = `    const [isGenerating, setIsGenerating] = useState(false);

    const handleAiGenerate = async () => {
      setIsGenerating(true);
      const generated = await generateAiEcosystemItems(brandDna, title, items);
      if (generated && generated.length > 0) {
        const arr = [...items, ...generated];
        setItems(arr);
        handleSave(fieldKey, arr);
      }
      setIsGenerating(false);
    };

    const add = () => {`;

c = c.replace(/const add = \(\) => \{/, aiLogic);

const aiButton = `          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Icon className="w-4 h-4 text-indigo-500" />
              {title}
            </h3>
            <button
              onClick={handleAiGenerate}
              disabled={isGenerating}
              className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isGenerating ? 'מייצר...' : 'הצע רעיונות עם AI'}
            </button>
          </div>`;

c = c.replace(/<h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">[\s\S]*?<\/h3>/, aiButton);

fs.writeFileSync('src/modules/brand-dna-hub/components/BrandEcosystemSection.tsx', c);
