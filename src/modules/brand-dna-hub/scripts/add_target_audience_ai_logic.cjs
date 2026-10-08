const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/components/TargetAudienceSection.tsx', 'utf8');

c = c.replace(/import \{ PersonaItem, ObjectionItem \} from '\.\.\/types\/brandDna';/, 
  'import { PersonaItem, ObjectionItem } from \'../types/brandDna\';\nimport { generateAiPersona, generateAiObjection } from \'../services/geminiBrandPrompt\';');

c = c.replace(/const \[showPersonaForm, setShowPersonaForm\] = useState\(false\);/, 
  'const [showPersonaForm, setShowPersonaForm] = useState(false);\n  const [isGeneratingPersona, setIsGeneratingPersona] = useState(false);');

c = c.replace(/const \[showObjectionForm, setShowObjectionForm\] = useState\(false\);/, 
  'const [showObjectionForm, setShowObjectionForm] = useState(false);\n  const [isGeneratingObjection, setIsGeneratingObjection] = useState(false);');

const personaAiFn = `  const handleGeneratePersonaAi = async () => {
    setIsGeneratingPersona(true);
    const result = await generateAiPersona(brandDna);
    setIsGeneratingPersona(false);
    if (result) {
      setNewPersonaName(result.name || '');
      setNewPersonaRole(result.role || '');
      setNewPersonaPain(result.pain || '');
      setNewPersonaDream(result.dream || '');
    }
  };`;
c = c.replace(/const handleAddAudienceTag =/, personaAiFn + '\n\n  const handleAddAudienceTag =');

const objectionAiFn = `  const handleGenerateObjectionAi = async () => {
    setIsGeneratingObjection(true);
    const result = await generateAiObjection(brandDna);
    setIsGeneratingObjection(false);
    if (result) {
      setNewObjection(result.objection || '');
      setNewRebuttal(result.rebuttal || '');
    }
  };`;
c = c.replace(/const handleDeleteObjection =/, objectionAiFn + '\n\n  const handleDeleteObjection =');

fs.writeFileSync('src/modules/brand-dna-hub/components/TargetAudienceSection.tsx', c);
