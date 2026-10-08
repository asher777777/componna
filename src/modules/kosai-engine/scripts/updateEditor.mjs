import fs from 'fs';

let file = fs.readFileSync('src/modules/page-builder/PageBuilderEditor.tsx', 'utf8');

// Replace imports
file = file.replace(/import \{ BuilderCopilotProvider \} from '\.\/context\/BuilderCopilotContext';\n/, '');
file = file.replace(/import \{ CopilotChatDrawer \} from '\.\/components\/CopilotChatDrawer';\n/, '');
file = file.replace(/import \{ FloatingCopilotButton \} from '\.\/components\/FloatingCopilotButton';\n/, '');

const newImports = `import { eventBus } from '../../core/bridge/EventBus';
import { KosaiChatDrawer, FloatingKosaiButton } from '../kosai-engine';
`;
file = file.replace(/import \{ PageBuilderConfig, ViewportMode, BuilderTab, SectionType \} from '\.\/types\/pageBuilder\.types';/, match => match + '\n' + newImports);

// Inside component, add useEffect for eventBus
const effectHook = `  useEffect(() => {
    const unsubscribe = eventBus.subscribe('kosai:action', (data: any) => {
      const { action, payload } = data;
      if (action === 'ADD_SECTION' && payload) {
        const newSectionId = \`custom_\${Date.now()}\`;
        setConfig(prev => ({
          ...prev,
          sectionOrder: [...prev.sectionOrder, newSectionId],
          sections: {
            ...prev.sections,
            [newSectionId]: { ...payload, id: newSectionId }
          }
        }));
      } else if (action === 'UPDATE_SECTION' && payload && payload.sectionId) {
        setConfig(prev => ({
          ...prev,
          sections: {
            ...prev.sections,
            [payload.sectionId]: { ...prev.sections[payload.sectionId], ...payload.updates }
          }
        }));
      } else if (action === 'UPDATE_GLOBAL_SETTINGS' && payload) {
        setConfig(prev => ({
          ...prev,
          globalSettings: {
            ...prev.globalSettings,
            ...payload
          }
        }));
      } else if (action === 'UPDATE_SEO' && payload) {
        setConfig(prev => ({
          ...prev,
          seoInfo: {
            ...prev.seoInfo,
            ...payload
          }
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {`;

file = file.replace(/  useEffect\(\(\) => \{\n    if \(isDarkMode\) \{/, effectHook);

// Replace render wrappers
file = file.replace(/<BuilderCopilotProvider config=\{config\} setConfig=\{setConfig\}>/, '');
file = file.replace(/<\/BuilderCopilotProvider>/, '');

file = file.replace(/<CopilotChatDrawer \/>/, '<KosaiChatDrawer />');
file = file.replace(/<FloatingCopilotButton \/>/, '<FloatingKosaiButton />');

fs.writeFileSync('src/modules/page-builder/PageBuilderEditor.tsx', file);
