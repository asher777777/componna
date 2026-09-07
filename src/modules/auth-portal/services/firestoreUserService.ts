import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { UserProfileRecord, AuthPortalCollectionsConfig } from '../types';
import { resolveAuthCollections } from '../config';

export class FirestoreUserService {
  /**
   * Sync Firebase Auth user into Firestore users collection
   */
  public static async syncUserProfile(
    db: Firestore,
    collections: AuthPortalCollectionsConfig | undefined,
    user: User,
    role: 'admin' | 'editor' | 'viewer' | 'guest' = 'editor'
  ): Promise<UserProfileRecord> {
    const collNames = resolveAuthCollections(undefined, collections);
    const userDocRef = doc(db, collNames.users, user.uid);
    const now = Date.now();

    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const existing = snap.data() as UserProfileRecord;
        const updated: Partial<UserProfileRecord> = {
          email: user.email,
          displayName: user.displayName || existing.displayName,
          photoURL: user.photoURL || existing.photoURL,
          isAnonymous: user.isAnonymous,
          lastLoginAt: now,
        };
        await updateDoc(userDocRef, updated);
        return { ...existing, ...updated };
      } else {
        const newProfile: UserProfileRecord = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || (user.isAnonymous ? 'אורח אנונימי' : (user.email ? user.email.split('@')[0] : 'משתמש חדש')),
          photoURL: user.photoURL,
          phoneNumber: user.phoneNumber,
          role: user.isAnonymous ? 'guest' : role,
          isAnonymous: user.isAnonymous,
          createdAt: now,
          lastLoginAt: now,
        };
        await setDoc(userDocRef, newProfile);
        return newProfile;
      }
    } catch (err) {
      console.warn('[FirestoreUserService] Notice syncing user profile:', err);
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || (user.isAnonymous ? 'אורח אנונימי' : 'משתמש מחובר'),
        photoURL: user.photoURL,
        role: user.isAnonymous ? 'guest' : role,
        isAnonymous: user.isAnonymous,
        createdAt: now,
        lastLoginAt: now,
      };
    }
  }

  /**
   * Record audit log of authentication events
   */
  public static async logAuthEvent(
    db: Firestore,
    collections: AuthPortalCollectionsConfig | undefined,
    uid: string,
    action: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      const collNames = resolveAuthCollections(undefined, collections);
      const auditColl = collection(db, collNames.auditLogs);
      await addDoc(auditColl, {
        uid,
        action,
        timestamp: Date.now(),
        details: details || {},
      });
    } catch (e) {
      console.warn('[FirestoreUserService] Audit log notice:', e);
    }
  }
}
