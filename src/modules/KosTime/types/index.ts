export interface Task {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  estimatedMinutes?: number;
  priorityIndex: number; // 1, 2, 3
  originInboxId?: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface InboxItem {
  id: string;
  title: string;
  note?: string;
  createdAt: string;
  decomposed: boolean;
  microTasks?: {
    id: string;
    title: string;
    estimatedMinutes: number;
  }[];
}

export interface MicroTask {
  id: string;
  inboxItemId?: string;
  inboxItemTitle?: string;
  title: string;
  estimatedMinutes: number;
  scheduledFor?: 'today' | 'tomorrow' | 'pool';
  createdAt: string;
}

export interface BrainstormMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  extractedTasks?: string[];
}

export interface BrainstormSession {
  id: string;
  userId: string;
  title: string;
  messages: BrainstormMessage[];
  createdAt: string;
  updatedAt?: string;
}

export type ActiveScreen = 'home' | 'today' | 'inbox' | 'decompose' | 'brainstorm' | 'ritual';

export interface AppState {
  todayTasks: Task[];
  tomorrowTasks: Task[];
  inbox: InboxItem[];
  availableMicroTasks: MicroTask[];
  completedCountToday: number;
  soundEnabled: boolean;
  lastRitualDate?: string;
}
