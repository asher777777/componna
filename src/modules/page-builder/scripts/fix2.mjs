import fs from 'fs';

// 1. Fix AiSectionDesignerModal.tsx
let sectionModal = fs.readFileSync('src/modules/page-builder/components/AiSectionDesignerModal.tsx', 'utf8');

// Add getApiKeysForModule and getCapability to the destructuring
sectionModal = sectionModal.replace(
  "const { getApiKeysForModule } = useSystemConnection();\n  const { getCapability } = useHostCapabilities();",
  ""
); // Clean up if it was added weirdly

sectionModal = sectionModal.replace(
  "const [isGenerating, setIsGenerating] = useState(false);",
  "const [isGenerating, setIsGenerating] = useState(false);\n  const { getApiKeysForModule } = useSystemConnection();\n  const { getCapability } = useHostCapabilities();"
);

fs.writeFileSync('src/modules/page-builder/components/AiSectionDesignerModal.tsx', sectionModal, 'utf8');

// 2. Fix AiLivePageBuilderModal.tsx
let liveModal = fs.readFileSync('src/modules/page-builder/components/AiLivePageBuilderModal.tsx', 'utf8');

liveModal = liveModal.replace(
  "const { openConnectorModal } = useSystemConnection();",
  "const { openConnectorModal, getApiKeysForModule } = useSystemConnection();"
);

liveModal = liveModal.replace(
  "const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);",
  "const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);\n\n  const moduleKeys = getApiKeysForModule('page-builder');\n  const apiKey = moduleKeys.googleAiApiKey || '';"
);

fs.writeFileSync('src/modules/page-builder/components/AiLivePageBuilderModal.tsx', liveModal, 'utf8');

console.log("Fixed missing variables.");
