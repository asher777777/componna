import { FirebaseApp, getApps, getApp, initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface AuthState {
  user: User | null;
  uid: string | null;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  loading: boolean;
  error: string | null;
}

export const RolePermissions = {
  canCreateProject: (role: UserRole) => role === 'admin' || role === 'editor',
  canEditProject: (role: UserRole) => role === 'admin' || role === 'editor',
  canPublishProject: (role: UserRole) => role === 'admin' || role === 'editor',
  canDeleteProject: (role: UserRole) => role === 'admin',
  canManageCredentials: (role: UserRole) => role === 'admin',
  canManageUsers: (role: UserRole) => role === 'admin',
  canUploadMedia: (role: UserRole) => role === 'admin' || role === 'editor',
};

export function getCachedUserRole(uid?: string | null): UserRole {
  if (!uid) return 'viewer';
  try {
    const saved = localStorage.getItem(`sdo_user_role_${uid}`);
    if (saved === 'admin' || saved === 'editor' || saved === 'viewer') {
      return saved;
    }
  } catch {}
  return 'admin'; // Default to admin for smooth management
}

export function setCachedUserRole(uid: string, role: UserRole): void {
  try {
    localStorage.setItem(`sdo_user_role_${uid}`, role);
  } catch {}
}

export async function fetchUserRole(uid: string, app?: FirebaseApp): Promise<UserRole> {
  const cached = getCachedUserRole(uid);
  try {
    const targetApp = app || ensureDefaultFirebaseApp();
    const db = getFirestore(targetApp);
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data?.role && (data.role === 'admin' || data.role === 'editor' || data.role === 'viewer')) {
        setCachedUserRole(uid, data.role);
        return data.role;
      }
    } else {
      await setDoc(userDocRef, {
        uid,
        role: cached || 'admin',
        updatedAt: Date.now(),
      }, { merge: true });
    }
  } catch (err) {
    console.warn('[FirebaseAuth] fetchUserRole notice:', err);
  }
  return cached || 'admin';
}

export async function updateUserRole(uid: string, role: UserRole, app?: FirebaseApp): Promise<void> {
  setCachedUserRole(uid, role);
  try {
    const targetApp = app || ensureDefaultFirebaseApp();
    const db = getFirestore(targetApp);
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      uid,
      role,
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (err) {
    console.warn('[FirebaseAuth] updateUserRole notice:', err);
  }
}

const authInstances = new WeakMap<FirebaseApp, Auth>();

export function ensureDefaultFirebaseApp(): FirebaseApp {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || '';
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || '';

  if (apiKey && projectId) {
    try {
      return initializeApp({
        apiKey,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
        projectId,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
      });
    } catch {
      const fallback = getApps();
      if (fallback.length > 0) return fallback[0];
    }
  }

  return getApp();
}

export function getOrCreateAuth(app?: FirebaseApp): Auth {
  const targetApp = app || ensureDefaultFirebaseApp();
  let auth = authInstances.get(targetApp);
  if (!auth) {
    auth = getAuth(targetApp);
    authInstances.set(targetApp, auth);
  }
  return auth;
}

/**
 * Translate Firebase Auth error codes to helpful Hebrew messages
 */
export function formatAuthError(error: any): string {
  if (!error) return 'שגיאה לא ידועה';
  const code = error.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'כתובת האימייל אינה תקינה';
    case 'auth/user-disabled':
      return 'חשבון זה הושבת על ידי מנהל המערכת';
    case 'auth/user-not-found':
      return 'לא נמצא משתמש עם כתובת אימייל זו';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'אימייל או סיסמה שגויים';
    case 'auth/email-already-in-use':
      return 'כתובת האימייל כבר רשומה במערכת';
    case 'auth/weak-password':
      return 'הסיסמה חלשה מדי (נדרשים לפחות 6 תווים)';
    case 'auth/operation-not-allowed':
      return 'שיטת התחברות זו אינה מופעלת ב-Firebase Console (יש להפעילה תחת Authentication -> Sign-in method)';
    case 'auth/popup-closed-by-user':
      return 'חלון ההתחברות של גוגל נסגר לפני השלמת הכניסה';
    case 'auth/popup-blocked':
      return 'הדפדפן חסם את החלון הקופץ של גוגל. אפשר חלונות קופצים ונסה שוב';
    case 'auth/network-request-failed':
      return 'שגיאת רשת. ודא שאתה מחובר לאינטרנט';
    default:
      return error.message || 'שגיאה בתהליך האימות';
  }
}

/**
 * Automatically sign in anonymously if not authenticated
 */
export async function ensureAnonymousAuth(app?: FirebaseApp): Promise<User | null> {
  try {
    const auth = getOrCreateAuth(app);
    if (auth.currentUser) {
      return auth.currentUser;
    }
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err: any) {
    console.warn('[FirebaseAuth] Anonymous sign-in notice:', err?.message || err);
    return null;
  }
}

/**
 * Email & Password Sign In
 */
export async function loginWithEmail(email: string, pass: string, app?: FirebaseApp): Promise<User> {
  const auth = getOrCreateAuth(app);
  const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return cred.user;
}

/**
 * Email & Password Registration
 */
export async function registerWithEmail(email: string, pass: string, displayName?: string, app?: FirebaseApp): Promise<User> {
  const auth = getOrCreateAuth(app);
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (displayName && displayName.trim()) {
    try {
      await updateProfile(cred.user, { displayName: displayName.trim() });
    } catch (e) {
      console.warn('[FirebaseAuth] updateProfile notice:', e);
    }
  }
  return cred.user;
}

/**
 * Google Sign In via Popup
 */
export async function loginWithGoogle(app?: FirebaseApp): Promise<User> {
  const auth = getOrCreateAuth(app);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

/**
 * Anonymous Direct Sign In
 */
export async function loginAnonymously(app?: FirebaseApp): Promise<User> {
  const auth = getOrCreateAuth(app);
  const cred = await signInAnonymously(auth);
  return cred.user;
}

/**
 * Sign Out
 */
export async function logoutUser(app?: FirebaseApp): Promise<void> {
  const auth = getOrCreateAuth(app);
  await signOut(auth);
}

/**
 * Password Reset
 */
export async function resetUserPassword(email: string, app?: FirebaseApp): Promise<void> {
  const auth = getOrCreateAuth(app);
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Subscribe to Auth State changes
 */
export function subscribeToAuth(
  app?: FirebaseApp,
  onState?: (state: AuthState) => void
): () => void {
  try {
    const auth = getOrCreateAuth(app);

    // Immediately notify with current user if already initialized
    if (onState && auth.currentUser) {
      const initialRole = getCachedUserRole(auth.currentUser.uid);
      onState({
        user: auth.currentUser,
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        photoURL: auth.currentUser.photoURL,
        role: initialRole,
        isAuthenticated: true,
        isAnonymous: auth.currentUser.isAnonymous,
        loading: false,
        error: null,
      });

      // Async sync from Firestore
      fetchUserRole(auth.currentUser.uid, app).then((syncedRole) => {
        if (onState && auth.currentUser && syncedRole !== initialRole) {
          onState({
            user: auth.currentUser,
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            displayName: auth.currentUser.displayName,
            photoURL: auth.currentUser.photoURL,
            role: syncedRole,
            isAuthenticated: true,
            isAnonymous: auth.currentUser.isAnonymous,
            loading: false,
            error: null,
          });
        }
      });
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (onState) {
          const userRole = getCachedUserRole(user ? user.uid : null);
          onState({
            user,
            uid: user ? user.uid : null,
            email: user ? user.email : null,
            displayName: user ? user.displayName : null,
            photoURL: user ? user.photoURL : null,
            role: userRole,
            isAuthenticated: Boolean(user),
            isAnonymous: user ? user.isAnonymous : false,
            loading: false,
            error: null,
          });

          if (user) {
            fetchUserRole(user.uid, app).then((syncedRole) => {
              if (onState && syncedRole !== userRole) {
                onState({
                  user,
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName,
                  photoURL: user.photoURL,
                  role: syncedRole,
                  isAuthenticated: true,
                  isAnonymous: user.isAnonymous,
                  loading: false,
                  error: null,
                });
              }
            });
          }
        }
      },
      (error) => {
        if (onState) {
          onState({
            user: null,
            uid: null,
            email: null,
            displayName: null,
            photoURL: null,
            role: 'viewer',
            isAuthenticated: false,
            isAnonymous: false,
            loading: false,
            error: formatAuthError(error),
          });
        }
      }
    );

    return unsubscribe;
  } catch (err: any) {
    if (onState) {
      onState({
        user: null,
        uid: null,
        email: null,
        displayName: null,
        photoURL: null,
        role: 'viewer',
        isAuthenticated: false,
        isAnonymous: false,
        loading: false,
        error: formatAuthError(err),
      });
    }
    return () => {};
  }
}
