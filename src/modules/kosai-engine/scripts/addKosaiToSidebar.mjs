import fs from 'fs';

let sidebar = fs.readFileSync('src/workbench/components/Sidebar.tsx', 'utf8');
if (!sidebar.includes("'kosai-engine'")) {
  sidebar = sidebar.replace(/} from 'lucide-react';/, "  Bot\n} from 'lucide-react';");
  sidebar = sidebar.replace(/const MODULE_ICONS: Record<string, \{ icon: React\.ComponentType<\{ className\?: string \}>; color: string \}> = \{/, "const MODULE_ICONS: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {\n  'kosai-engine': { icon: Bot, color: 'text-purple-400 group-hover:text-purple-300' },");
  fs.writeFileSync('src/workbench/components/Sidebar.tsx', sidebar);
}
