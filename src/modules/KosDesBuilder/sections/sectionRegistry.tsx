import React from 'react';
import {
  Layout,
  TrendingUp,
  Table,
  Zap,
  Navigation,
  Grid,
  Layers,
} from 'lucide-react';
import { DashboardSectionType, DashboardSectionConfig } from '../types';

// Sections (Views)
import { DashboardHeaderSection } from './header/DashboardHeaderSection';
import { DashboardStatsSection } from './stats/DashboardStatsSection';
import { DashboardTableSection } from './table/DashboardTableSection';
import { DashboardQuickActionsSection } from './quickActions/DashboardQuickActionsSection';
import { DashboardFloatingDockSection } from './floatingDock/DashboardFloatingDockSection';
import { CommandMatrixSection } from './commandMatrix/CommandMatrixSection';
import { DashboardSlotWidgetSection } from './slotWidget/DashboardSlotWidgetSection';

// Editors
import { DashboardHeaderEditor } from './header/DashboardHeaderEditor';
import { DashboardStatsEditor } from './stats/DashboardStatsEditor';
import { DashboardTableEditor } from './table/DashboardTableEditor';
import { DashboardQuickActionsEditor } from './quickActions/DashboardQuickActionsEditor';
import { DashboardFloatingDockEditor } from './floatingDock/DashboardFloatingDockEditor';
import { CommandMatrixEditor } from './commandMatrix/CommandMatrixEditor';
import { DashboardSlotWidgetEditor } from './slotWidget/DashboardSlotWidgetEditor';

export interface DashboardSectionDefinition {
  type: DashboardSectionType;
  name: string;
  category: 'header' | 'metrics' | 'data' | 'actions' | 'navigation' | 'matrix' | 'embeds';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  viewComponent: React.ComponentType<{ config: any; [key: string]: any }>;
  editorComponent: React.ComponentType<{ config: any; onChange: (updated: any) => void }>;
  defaultConfig: DashboardSectionConfig;
}

export const DASHBOARD_SECTIONS_REGISTRY: Partial<Record<DashboardSectionType, DashboardSectionDefinition>> & Record<string, DashboardSectionDefinition> = {
  header: {
    type: 'header',
    name: 'הדר וברכת פתיחה',
    category: 'header',
    description: 'ברכה מותאמת אישית, תאריך עברי/לועזי, תג דייר וכפתורי פעולה עליונים.',
    icon: Layout,
    viewComponent: DashboardHeaderSection,
    editorComponent: DashboardHeaderEditor,
    defaultConfig: {
      greetingPrefix: 'שלום וברוך הבא',
      showDateRange: true,
      showTenantBadge: true,
      primaryActionText: 'פעולה חדשה',
      primaryActionUrl: '#',
      subtitle: 'לוח בקרה מעודכן וסנכרון נתונים',
    },
  },
  stats: {
    type: 'stats',
    name: 'כרטיסי מדדים ו-KPI',
    category: 'metrics',
    description: 'מדדי ביצוע, הכנסות, מנויים, פניות ושיחות וואטסאפ עם אחוזי שינוי.',
    icon: TrendingUp,
    viewComponent: DashboardStatsSection,
    editorComponent: DashboardStatsEditor,
    defaultConfig: {
      columns: 4,
      stats: [
        { id: 'st-1', label: 'הכנסות החודש', value: '₪24,000', change: '+12%', isPositive: true, icon: 'TrendingUp', color: 'emerald' },
        { id: 'st-2', label: 'אנשי קשר חדשים', value: '88', change: '+5%', isPositive: true, icon: 'Users', color: 'indigo' },
      ],
    },
  },
  table: {
    type: 'table',
    name: 'טבלת נתונים מסונכרנת',
    category: 'data',
    description: 'טבלת רשומות מחוברת לקולקציית דייר, חיפוש, מיון, ייצוא ופגינציה.',
    icon: Table,
    viewComponent: DashboardTableSection,
    editorComponent: DashboardTableEditor,
    defaultConfig: {
      title: 'רשומות אחרונות',
      subtitle: 'סנכרון ישיר מקולקציית הדייר',
      collectionName: 'contacts',
      columns: [
        { key: 'name', label: 'שם', sortable: true, type: 'text' },
        { key: 'phone', label: 'טלפון', sortable: false, type: 'text' },
        { key: 'date', label: 'תאריך', sortable: true, type: 'date' },
        { key: 'status', label: 'סטטוס', sortable: true, type: 'badge' },
      ],
      showSearch: true,
      showExport: true,
      pageSize: 5,
    },
  },
  quickActions: {
    type: 'quickActions',
    name: 'כפתורי פעולה מהירים',
    category: 'actions',
    description: 'קיצורי דרך מהירים לפעולות נפוצות, סליקה, וואטסאפ, טפסים ועמודים.',
    icon: Zap,
    viewComponent: DashboardQuickActionsSection,
    editorComponent: DashboardQuickActionsEditor,
    defaultConfig: {
      title: 'פעולות מהירות',
      layout: 'row',
      buttons: [
        { id: 'b-1', label: 'איש קשר חדש', icon: 'UserPlus', variant: 'primary', actionType: 'navigate', target: '/contacts' },
        { id: 'b-2', label: 'הפקת חיוב', icon: 'Receipt', variant: 'secondary', actionType: 'navigate', target: '/kesher-payments' },
      ],
    },
  },
  floatingDock: {
    type: 'floatingDock',
    name: 'מעגן צף (Cashwan Floating Dock)',
    category: 'navigation',
    description: 'מעגן ניווט יוקרתי צף תחתון או צדדי עם גישה לכל מודולי הדייר.',
    icon: Navigation,
    viewComponent: DashboardFloatingDockSection,
    editorComponent: DashboardFloatingDockEditor,
    defaultConfig: {
      dockPosition: 'bottom',
      showLabels: true,
      items: [
        { id: 'fd-1', label: 'דשבורד', icon: 'LayoutDashboard', targetUrl: '/dashboard' },
        { id: 'fd-2', label: 'לקוחות', icon: 'Users', targetUrl: '/contacts' },
        { id: 'fd-3', label: 'סליקה', icon: 'CreditCard', targetUrl: '/kesher-payments' },
        { id: 'fd-4', label: 'וואטסאפ', icon: 'MessageCircle', targetUrl: '/whatsapp-hub' },
      ],
    },
  },
  commandMatrix: {
    type: 'commandMatrix',
    name: 'מטריצת פקודות ורכיבים',
    category: 'matrix',
    description: 'גריד אריחי רכיבים מודולריים המפרק את מרכז השליטה למודולים עצמאיים.',
    icon: Grid,
    viewComponent: CommandMatrixSection,
    editorComponent: CommandMatrixEditor,
    defaultConfig: {
      title: 'מרכז שליטה ורכיבי מערכת',
      subtitle: 'גישה ישירה ומודולרית לכל יכולות הדייר',
      columns: 3,
      items: [
        { id: 'cm-1', title: 'אנליטיקה ו-CRM', subtitle: 'ניהול לידים וכרטיסי לקוח', icon: 'Users', moduleId: 'crm-analytics', targetUrl: '/crm-analytics', badge: 'פעיל' },
        { id: 'cm-2', title: 'סליקה וחיובים', subtitle: 'עסקאות אשראי והוראות קבע', icon: 'CreditCard', moduleId: 'kesher-payments-hub', targetUrl: '/kesher-payments', badge: 'פעיל' },
        { id: 'cm-3', title: 'וואטסאפ אוטומציות', subtitle: 'בוטים, שיגור וסטטוסים', icon: 'MessageCircle', moduleId: 'KosWhatsUp', targetUrl: '/whatsapp-hub', badge: 'פעיל' },
      ],
    },
  },
  slotWidget: {
    type: 'slotWidget',
    name: 'ווידג׳ט מוטמע (Capability Slot)',
    category: 'embeds',
    description: 'הטמעת ממשק מוכן מרכיב שכן דרך חוזה הליבה ללא תלות הדדית.',
    icon: Layers,
    viewComponent: DashboardSlotWidgetSection,
    editorComponent: DashboardSlotWidgetEditor,
    defaultConfig: {
      slotName: 'form-renderer',
      title: 'טופס לידים מוטמע',
      props: {},
    },
  },
};
