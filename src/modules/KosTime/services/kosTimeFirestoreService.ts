import {
  Firestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { Task, InboxItem, MicroTask } from '../types';

export class KosTimeFirestoreService {
  /**
   * Helper to get tenant-scoped collection path:
   * tenants/{tenantId}/modules/KosTime/{subCollection}
   * or master fallback:
   * tenants/_master/modules/KosTime/{subCollection}
   */
  private static getCollectionRef(db: Firestore, tenantId: string, subCollection: string) {
    const safeTenant = tenantId || '_master';
    return collection(db, 'tenants', safeTenant, 'modules', 'KosTime', subCollection);
  }

  private static getDocRef(db: Firestore, tenantId: string, subCollection: string, docId: string) {
    const safeTenant = tenantId || '_master';
    return doc(db, 'tenants', safeTenant, 'modules', 'KosTime', subCollection, docId);
  }

  // 1. Subscribe to Today Tasks
  static subscribeTodayTasks(
    db: Firestore,
    tenantId: string,
    userId: string,
    todayDate: string,
    onData: (tasks: Task[]) => void,
    onError?: (err: any) => void
  ) {
    const colRef = this.getCollectionRef(db, tenantId, 'todayTasks');
    const q = query(colRef, where('userId', '==', userId));

    return onSnapshot(
      q,
      (snapshot) => {
        const tasks: Task[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          if (data.date === todayDate) {
            tasks.push({
              id: d.id,
              title: data.title,
              completed: Boolean(data.completed),
              completedAt: data.completedAt,
              estimatedMinutes: data.estimatedMinutes,
              priorityIndex: data.priorityIndex || 1,
              originInboxId: data.originInboxId,
              date: data.date,
              createdAt: data.createdAt,
            });
          }
        });
        tasks.sort((a, b) => a.priorityIndex - b.priorityIndex);
        onData(tasks);
      },
      (error) => {
        console.error('[KosTimeFirestore] todayTasks subscription error:', error);
        onError?.(error);
      }
    );
  }

  // 2. Subscribe to Inbox
  static subscribeInbox(
    db: Firestore,
    tenantId: string,
    userId: string,
    onData: (items: InboxItem[]) => void,
    onError?: (err: any) => void
  ) {
    const colRef = this.getCollectionRef(db, tenantId, 'inbox');
    const q = query(colRef, where('userId', '==', userId));

    return onSnapshot(
      q,
      (snapshot) => {
        const items: InboxItem[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          items.push({
            id: d.id,
            title: data.title,
            note: data.note,
            createdAt: data.createdAt,
            decomposed: Boolean(data.decomposed),
            microTasks: data.microTasks,
          });
        });
        items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onData(items);
      },
      (error) => {
        console.error('[KosTimeFirestore] inbox subscription error:', error);
        onError?.(error);
      }
    );
  }

  // 3. Subscribe to MicroTasks
  static subscribeMicroTasks(
    db: Firestore,
    tenantId: string,
    userId: string,
    onData: (items: MicroTask[]) => void,
    onError?: (err: any) => void
  ) {
    const colRef = this.getCollectionRef(db, tenantId, 'microTasks');
    const q = query(colRef, where('userId', '==', userId));

    return onSnapshot(
      q,
      (snapshot) => {
        const items: MicroTask[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          items.push({
            id: d.id,
            inboxItemId: data.inboxItemId,
            inboxItemTitle: data.inboxItemTitle,
            title: data.title,
            estimatedMinutes: data.estimatedMinutes || 25,
            scheduledFor: data.scheduledFor || 'pool',
            createdAt: data.createdAt,
          });
        });
        onData(items);
      },
      (error) => {
        console.error('[KosTimeFirestore] microTasks subscription error:', error);
        onError?.(error);
      }
    );
  }

  // Create or Update Today Task
  static async saveTodayTask(
    db: Firestore,
    tenantId: string,
    userId: string,
    task: Partial<Task> & { id: string }
  ) {
    const docRef = this.getDocRef(db, tenantId, 'todayTasks', task.id);
    await setDoc(docRef, { ...task, userId }, { merge: true });
  }

  // Delete Today Task
  static async deleteTodayTask(db: Firestore, tenantId: string, taskId: string) {
    const docRef = this.getDocRef(db, tenantId, 'todayTasks', taskId);
    await deleteDoc(docRef);
  }

  // Save Inbox Item
  static async saveInboxItem(
    db: Firestore,
    tenantId: string,
    userId: string,
    item: Partial<InboxItem> & { id: string }
  ) {
    const docRef = this.getDocRef(db, tenantId, 'inbox', item.id);
    await setDoc(docRef, { ...item, userId }, { merge: true });
  }

  // Delete Inbox Item
  static async deleteInboxItem(db: Firestore, tenantId: string, inboxId: string) {
    const docRef = this.getDocRef(db, tenantId, 'inbox', inboxId);
    await deleteDoc(docRef);
  }

  // Save MicroTask
  static async saveMicroTask(
    db: Firestore,
    tenantId: string,
    userId: string,
    micro: Partial<MicroTask> & { id: string }
  ) {
    const docRef = this.getDocRef(db, tenantId, 'microTasks', micro.id);
    await setDoc(docRef, { ...micro, userId }, { merge: true });
  }

  // Delete MicroTask
  static async deleteMicroTask(db: Firestore, tenantId: string, microTaskId: string) {
    const docRef = this.getDocRef(db, tenantId, 'microTasks', microTaskId);
    await deleteDoc(docRef);
  }
}
