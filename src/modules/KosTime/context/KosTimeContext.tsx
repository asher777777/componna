import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useKosTimeTenant } from '../hooks/useKosTimeTenant';
import { Task, InboxItem, MicroTask } from '../types';
import { KosTimeFirestoreService } from '../services/kosTimeFirestoreService';
import { KosTimeAiService } from '../services/kosTimeAiService';
import { sound } from '../services/soundService';
import { fireTaskConfetti, fireBigCelebration } from '../services/confettiService';

interface AttemptedTaskPayload {
  title: string;
  estimatedMinutes?: number;
  originInboxId?: string;
  sourceMicroTaskId?: string;
}

interface KosTimeContextType {
  todayTasks: Task[];
  inbox: InboxItem[];
  microTasks: MicroTask[];
  loading: boolean;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  attemptedTask: AttemptedTaskPayload | null;
  clearAttemptedTask: () => void;
  addTodayTask: (title: string, estimatedMinutes?: number, originInboxId?: string) => Promise<boolean>;
  replaceTodayTask: (oldTaskId: string, newTitle: string, estimatedMinutes?: number) => Promise<void>;
  toggleCompleteTodayTask: (task: Task) => Promise<void>;
  deleteTodayTask: (taskId: string) => Promise<void>;
  addInboxItem: (title: string, note?: string) => Promise<string>;
  deleteInboxItem: (inboxId: string) => Promise<void>;
  saveDecomposition: (inboxId: string, subtasks: { title: string; estimatedMinutes: number }[]) => Promise<void>;
  addDirectMicroTask: (title: string, estimatedMinutes: number) => Promise<void>;
  deleteMicroTask: (microTaskId: string) => Promise<void>;
  promoteMicroTaskToToday: (microTask: MicroTask) => Promise<boolean>;
  scheduleMicroTaskForTomorrow: (microTaskId: string) => Promise<void>;
  moveTaskToInbox: (task: Task) => Promise<void>;
  applyTomorrowBig3: (selectedMicroTasks: MicroTask[]) => Promise<void>;
}

const KosTimeContext = createContext<KosTimeContextType | null>(null);

export const KosTimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { db, auth } = useSystemConnection();
  const { tenantId } = useKosTimeTenant();

  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [microTasks, setMicroTasks] = useState<MicroTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [attemptedTask, setAttemptedTask] = useState<AttemptedTaskPayload | null>(null);

  const currentUserId = auth?.currentUser?.uid || 'guest_user';

  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
    sound.setEnabled(val);
  };

  const getTodayDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const todayStr = getTodayDateString();

    const unsubToday = KosTimeFirestoreService.subscribeTodayTasks(
      db,
      tenantId,
      currentUserId,
      todayStr,
      (tasks) => {
        setTodayTasks(tasks);
        setLoading(false);
      },
      () => setLoading(false)
    );

    const unsubInbox = KosTimeFirestoreService.subscribeInbox(
      db,
      tenantId,
      currentUserId,
      (items) => {
        setInbox(items);
      }
    );

    const unsubMicro = KosTimeFirestoreService.subscribeMicroTasks(
      db,
      tenantId,
      currentUserId,
      (items) => {
        setMicroTasks(items);
      }
    );

    return () => {
      unsubToday();
      unsubInbox();
      unsubMicro();
    };
  }, [db, tenantId, currentUserId]);

  const clearAttemptedTask = () => setAttemptedTask(null);

  const addTodayTask = async (
    title: string,
    estimatedMinutes?: number,
    originInboxId?: string
  ): Promise<boolean> => {
    if (!title.trim()) return false;

    // Strict Rule of 3 enforcement: Max 3 active today tasks
    if (todayTasks.length >= 3) {
      sound.playWarning();
      setAttemptedTask({
        title: title.trim(),
        estimatedMinutes,
        originInboxId,
      });
      return false;
    }

    if (!db) return false;

    const taskId = 'task_' + Date.now();
    const newTask: Task = {
      id: taskId,
      title: title.trim(),
      completed: false,
      estimatedMinutes: estimatedMinutes || 25,
      priorityIndex: todayTasks.length + 1,
      originInboxId,
      date: getTodayDateString(),
      createdAt: new Date().toISOString(),
    };

    sound.playPop();
    await KosTimeFirestoreService.saveTodayTask(db, tenantId, currentUserId, newTask);
    return true;
  };

  const replaceTodayTask = async (
    oldTaskId: string,
    newTitle: string,
    estimatedMinutes?: number
  ) => {
    if (!db) return;
    const oldTask = todayTasks.find((t) => t.id === oldTaskId);
    if (!oldTask) return;

    await KosTimeFirestoreService.deleteTodayTask(db, tenantId, oldTaskId);

    const newTask: Task = {
      id: 'task_' + Date.now(),
      title: newTitle.trim(),
      completed: false,
      estimatedMinutes: estimatedMinutes || 25,
      priorityIndex: oldTask.priorityIndex,
      date: getTodayDateString(),
      createdAt: new Date().toISOString(),
    };

    sound.playPop();
    await KosTimeFirestoreService.saveTodayTask(db, tenantId, currentUserId, newTask);
    clearAttemptedTask();
  };

  const toggleCompleteTodayTask = async (task: Task) => {
    if (!db) return;
    const willBeCompleted = !task.completed;

    if (willBeCompleted) {
      sound.playTaskComplete();
      fireTaskConfetti();

      const willBeAllDone = todayTasks.filter((t) => t.completed).length + 1 >= todayTasks.length;
      if (willBeAllDone && todayTasks.length > 0) {
        setTimeout(() => {
          sound.playAllDoneFanfare();
          fireBigCelebration();
        }, 300);
      }
    } else {
      sound.playPop();
    }

    await KosTimeFirestoreService.saveTodayTask(db, tenantId, currentUserId, {
      id: task.id,
      completed: willBeCompleted,
      completedAt: willBeCompleted ? new Date().toISOString() : undefined,
    });
  };

  const deleteTodayTask = async (taskId: string) => {
    if (!db) return;
    sound.playPop();
    await KosTimeFirestoreService.deleteTodayTask(db, tenantId, taskId);
  };

  const addInboxItem = async (title: string, note?: string): Promise<string> => {
    if (!title.trim() || !db) return '';
    const id = 'inbox_' + Date.now();
    const item: InboxItem = {
      id,
      title: title.trim(),
      note: note?.trim(),
      createdAt: new Date().toISOString(),
      decomposed: false,
    };
    sound.playPop();
    await KosTimeFirestoreService.saveInboxItem(db, tenantId, currentUserId, item);
    return id;
  };

  const deleteInboxItem = async (inboxId: string) => {
    if (!db) return;
    sound.playPop();
    await KosTimeFirestoreService.deleteInboxItem(db, tenantId, inboxId);
  };

  const saveDecomposition = async (
    inboxId: string,
    subtasks: { title: string; estimatedMinutes: number }[]
  ) => {
    if (!db) return;
    const target = inbox.find((i) => i.id === inboxId);

    const createdMicroTasks = subtasks.map((st, idx) => ({
      id: `micro_${inboxId}_${Date.now()}_${idx}`,
      title: st.title,
      estimatedMinutes: st.estimatedMinutes,
    }));

    await KosTimeFirestoreService.saveInboxItem(db, tenantId, currentUserId, {
      id: inboxId,
      decomposed: true,
      microTasks: createdMicroTasks,
    });

    for (const st of subtasks) {
      const microId = `micro_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      await KosTimeFirestoreService.saveMicroTask(db, tenantId, currentUserId, {
        id: microId,
        inboxItemId: inboxId,
        inboxItemTitle: target?.title || '',
        title: st.title,
        estimatedMinutes: st.estimatedMinutes,
        scheduledFor: 'pool',
        createdAt: new Date().toISOString(),
      });
    }

    sound.playTaskComplete();
  };

  const addDirectMicroTask = async (title: string, estimatedMinutes: number) => {
    if (!title.trim() || !db) return;
    const microId = `micro_${Date.now()}`;
    await KosTimeFirestoreService.saveMicroTask(db, tenantId, currentUserId, {
      id: microId,
      title: title.trim(),
      estimatedMinutes,
      scheduledFor: 'pool',
      createdAt: new Date().toISOString(),
    });
  };

  const deleteMicroTask = async (microTaskId: string) => {
    if (!db) return;
    sound.playPop();
    await KosTimeFirestoreService.deleteMicroTask(db, tenantId, microTaskId);
  };

  const promoteMicroTaskToToday = async (microTask: MicroTask): Promise<boolean> => {
    const success = await addTodayTask(
      microTask.title,
      microTask.estimatedMinutes,
      microTask.inboxItemId
    );

    if (success && db) {
      await KosTimeFirestoreService.saveMicroTask(db, tenantId, currentUserId, {
        id: microTask.id,
        scheduledFor: 'today',
      });
    }
    return success;
  };

  const scheduleMicroTaskForTomorrow = async (microTaskId: string) => {
    if (!db) return;
    await KosTimeFirestoreService.saveMicroTask(db, tenantId, currentUserId, {
      id: microTaskId,
      scheduledFor: 'tomorrow',
    });
  };

  const moveTaskToInbox = async (task: Task) => {
    if (!db) return;
    await addInboxItem(task.title, `הועבר מהיום (${task.estimatedMinutes || 25} דק')`);
    await deleteTodayTask(task.id);
  };

  const applyTomorrowBig3 = async (selectedMicroTasks: MicroTask[]) => {
    if (!db) return;
    for (const m of selectedMicroTasks) {
      await scheduleMicroTaskForTomorrow(m.id);
    }
    sound.playAllDoneFanfare();
    fireBigCelebration();
  };

  return (
    <KosTimeContext.Provider
      value={{
        todayTasks,
        inbox,
        microTasks,
        loading,
        soundEnabled,
        setSoundEnabled,
        attemptedTask,
        clearAttemptedTask,
        addTodayTask,
        replaceTodayTask,
        toggleCompleteTodayTask,
        deleteTodayTask,
        addInboxItem,
        deleteInboxItem,
        saveDecomposition,
        addDirectMicroTask,
        deleteMicroTask,
        promoteMicroTaskToToday,
        scheduleMicroTaskForTomorrow,
        moveTaskToInbox,
        applyTomorrowBig3,
      }}
    >
      {children}
    </KosTimeContext.Provider>
  );
};

export const useKosTime = () => {
  const context = useContext(KosTimeContext);
  if (!context) {
    throw new Error('useKosTime must be used within a KosTimeProvider');
  }
  return context;
};
