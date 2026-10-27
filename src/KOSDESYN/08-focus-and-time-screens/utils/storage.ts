import { AppState, Task, InboxItem, MicroTask } from '../types';

const STORAGE_KEY = 'the_big_3_app_state_v1';

export const INITIAL_MOCK_STATE: AppState = {
  todayTasks: [
    {
      id: 'task-1',
      title: 'שליחת טיוטת הצעת מחיר ללקוח החדש',
      completed: true,
      completedAt: new Date().toISOString(),
      estimatedMinutes: 25,
      priorityIndex: 1,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    },
    {
      id: 'task-2',
      title: 'סיכום תובנות והחלטות מפגישת הצוות השבועית',
      completed: false,
      estimatedMinutes: 30,
      priorityIndex: 2,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    },
    {
      id: 'task-3',
      title: 'בדיקת חשבוניות ואישור תשלומים לספקים',
      completed: false,
      estimatedMinutes: 20,
      priorityIndex: 3,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    },
  ],
  tomorrowTasks: [
    {
      id: 'task-tomorrow-1',
      title: 'ראיון מקצועי למועמד לתפקיד פיתוח',
      completed: false,
      estimatedMinutes: 30,
      priorityIndex: 1,
      date: new Date(Date.now() + 86400 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    }
  ],
  inbox: [
    {
      id: 'inbox-1',
      title: 'הכנת מצגת אסטרטגיה רבעונית להנהלה',
      note: 'להתמקד במדדי צמיחה וביעדים לחציון הבא',
      createdAt: 'היום, 09:30',
      decomposed: false,
    },
    {
      id: 'inbox-2',
      title: 'חידוש ביטוח הרכב והשוואת פוליסות',
      note: 'לבדוק כיסוי גרירה ושמשות',
      createdAt: 'היום, 11:15',
      decomposed: false,
    },
    {
      id: 'inbox-3',
      title: 'שדרוג סביבת העבודה הביתית ומסך ארגונומי',
      note: 'נמאס מכאבי צוואר בסוף יום',
      createdAt: 'אתמול, 16:45',
      decomposed: true,
      microTasks: [
        { id: 'm-1', title: 'השוואת 3 דגמי מסך 27 אינץ׳ 4K', estimatedMinutes: 20 },
        { id: 'm-2', title: 'מדידת עומק השולחן לבחירת זרוע מתכווננת', estimatedMinutes: 15 },
        { id: 'm-3', title: 'הזמנת ציוד וארגון כבלים', estimatedMinutes: 25 },
      ]
    },
    {
      id: 'inbox-4',
      title: 'תכנון נופש משפחתי לפסח',
      note: 'לבדוק תאריכי טיסות ומלון מותאם לילדים',
      createdAt: 'לפני יומיים',
      decomposed: false,
    },
  ],
  availableMicroTasks: [
    {
      id: 'm-1',
      inboxItemId: 'inbox-3',
      inboxItemTitle: 'שדרוג סביבת העבודה הביתית',
      title: 'השוואת 3 דגמי מסך 27 אינץ׳ 4K',
      estimatedMinutes: 20,
      scheduledFor: 'pool',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'm-2',
      inboxItemId: 'inbox-3',
      inboxItemTitle: 'שדרוג סביבת העבודה הביתית',
      title: 'מדידת עומק השולחן לבחירת זרוע מתכווננת',
      estimatedMinutes: 15,
      scheduledFor: 'pool',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'm-3',
      inboxItemId: 'inbox-3',
      inboxItemTitle: 'שדרוג סביבת העבודה הביתית',
      title: 'הזמנת ציוד וארגון כבלים',
      estimatedMinutes: 25,
      scheduledFor: 'pool',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'm-demo-4',
      title: 'ניסוח תבנית אימייל שבועית למעקב משימות',
      estimatedMinutes: 20,
      scheduledFor: 'pool',
      createdAt: new Date().toISOString(),
    }
  ],
  completedCountToday: 1,
  soundEnabled: true,
};

export function loadAppState(): AppState {
  if (typeof window === 'undefined') return INITIAL_MOCK_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAppState(INITIAL_MOCK_STATE);
      return INITIAL_MOCK_STATE;
    }
    const parsed = JSON.parse(raw);
    // Ensure data integrity
    return {
      ...INITIAL_MOCK_STATE,
      ...parsed,
      todayTasks: Array.isArray(parsed.todayTasks) ? parsed.todayTasks : INITIAL_MOCK_STATE.todayTasks,
      tomorrowTasks: Array.isArray(parsed.tomorrowTasks) ? parsed.tomorrowTasks : [],
      inbox: Array.isArray(parsed.inbox) ? parsed.inbox : INITIAL_MOCK_STATE.inbox,
      availableMicroTasks: Array.isArray(parsed.availableMicroTasks) ? parsed.availableMicroTasks : INITIAL_MOCK_STATE.availableMicroTasks,
    };
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
    return INITIAL_MOCK_STATE;
  }
}

export function saveAppState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function resetAppState(): AppState {
  saveAppState(INITIAL_MOCK_STATE);
  return INITIAL_MOCK_STATE;
}
