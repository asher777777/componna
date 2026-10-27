import fs from 'fs';

let file = fs.readFileSync('src/modules/KosWebAi/routes/PageBuilderRoutes.tsx', 'utf8');

const imports = `import { KosaiProvider } from '../../kosai-engine';\n`;
file = file.replace(/import \{ PageBuilderProvider, usePageBuilderContext \} from '\.\.\/context\/PageBuilderContext';/, match => imports + match);

file = file.replace(/<PageBuilderProvider>/, `<PageBuilderProvider>\n      <KosaiProvider>`);
file = file.replace(/<\/PageBuilderProvider>/, `      </KosaiProvider>\n    </PageBuilderProvider>`);

fs.writeFileSync('src/modules/KosWebAi/routes/PageBuilderRoutes.tsx', file);
