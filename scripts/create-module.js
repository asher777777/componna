const fs = require('fs');
const path = require('path');

const moduleName = process.argv[2];
const displayName = process.argv[3] || moduleName;

if (!moduleName) {
  console.error('Usage: npm run new-module <module-name-kebab-case> [DisplayNameInHebrew]');
  process.exit(1);
}

const root = path.resolve(__dirname, '..');
const templateDir = path.join(root, 'src', 'modules', '_template');
const targetDir = path.join(root, 'src', 'modules', moduleName);

if (fs.existsSync(targetDir)) {
  console.error(`Module "${moduleName}" already exists at ${targetDir}`);
  process.exit(1);
}

// Helper to copy and replace
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    let content = fs.readFileSync(src, 'utf8');
    const PascalCase = moduleName
      .split('-')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join('');
    
    // Replace identifiers
    content = content.replace(/Template/g, PascalCase);
    content = content.replace(/template/g, moduleName);
    content = content.replace(/mod_template_/g, `mod_${moduleName}_`);
    content = content.replace(/מודול תבנית/g, displayName);
    
    fs.writeFileSync(dest, content, 'utf8');
  }
}

console.log(`Scaffolding new module "${moduleName}" from _template...`);
copyRecursiveSync(templateDir, targetDir);

// Update moduleRegistry.ts
const registryPath = path.join(root, 'src', 'workbench', 'moduleRegistry.ts');
if (fs.existsSync(registryPath)) {
  let registryContent = fs.readFileSync(registryPath, 'utf8');
  const PascalCase = moduleName
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');

  const importStatement = `import { ${PascalCase}StandaloneView } from '../modules/${moduleName}';\n`;
  const moduleEntry = `  {
    id: '${moduleName}',
    name: '${displayName}',
    description: 'מודול עצמאי ${displayName}',
    component: ${PascalCase}StandaloneView,
    route: '/${moduleName}',
    collectionPrefix: 'mod_${moduleName}_',
  },\n`;

  registryContent = importStatement + registryContent;
  registryContent = registryContent.replace(
    'export const REGISTERED_MODULES: ModuleDefinition[] = [',
    'export const REGISTERED_MODULES: ModuleDefinition[] = [\n' + moduleEntry
  );

  fs.writeFileSync(registryPath, registryContent, 'utf8');
  console.log(`Registered "${moduleName}" in src/workbench/moduleRegistry.ts`);
}

console.log(`SUCCESS: Module "${moduleName}" created successfully at src/modules/${moduleName}/`);
