import fs from 'fs';

let sidebar = fs.readFileSync('src/workbench/components/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(/  Key\n  Bot/, '  Key,\n  Bot');
fs.writeFileSync('src/workbench/components/Sidebar.tsx', sidebar);
