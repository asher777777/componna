import fs from 'fs';

let file = fs.readFileSync('src/modules/page-builder/registry/sectionRegistry.tsx', 'utf8');

const replacement = `  flowPlayer: {
    type: 'flowPlayer',
    name: 'נגן זרימה אינטראקטיבי (Flow Player)',
    category: 'marketing',
    description: 'הטמעת נציג מכירות / מצגת אינטראקטיבית עם וידאו, שכבות ממשק וזיהוי קולי ב-AI',
    icon: Video,
    viewComponent: FlowPlayerSection as any,
    editorComponent: FlowPlayerEditor as any,
    defaultConfig: {
      type: 'flowPlayer',
      visible: true,
      anchorId: 'interactivePlayer',
      campaignId: 'sales_rep_interactive_01',
      campaignSlug: 'sales_rep_interactive_01',
      showSectionHeader: false,
      title: 'הנציג הדיגיטלי שלנו',
      subtitle: 'שוחחו עם נציג ה-AI שלנו בלייב',
    },
  },

  customHtml: {
    type: 'customHtml',
    name: 'קוד AI מותאם אישית',
    category: 'advanced',
    description: 'אזור שנבנה אוטומטית על ידי ה-AI באמצעות HTML/Tailwind',
    icon: LayoutTemplate,
    viewComponent: ({ config }: any) => (
      <div 
        dangerouslySetInnerHTML={{ __html: config.rawHtmlTemplate || '<div class="p-8 text-center text-slate-500">No custom code provided</div>' }} 
        className={config.customClasses}
        style={{ backgroundColor: config.backgroundColor }}
      />
    ),
    editorComponent: () => <div className="p-4 text-center text-slate-500 text-sm">אזור זה נוצר על ידי ה-AI ומכיל קוד HTML דינמי.</div>,
    defaultConfig: {
      type: 'customHtml',
      visible: true,
      rawHtmlTemplate: '',
    },
  },
};`;

file = file.replace(/flowPlayer: \{[\s\S]*?\},[\s\n]*\};/, replacement);
fs.writeFileSync('src/modules/page-builder/registry/sectionRegistry.tsx', file);
