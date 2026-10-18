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
import { resolveCurrentTenantId } from '../core/tenant/tenantResolver';

export type UserRole = 'admin' | 'editor' | 'viewer' | 'subscriber';

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
  canEditPages: (role: UserRole) => role === 'admin' || role === 'editor',
  canUseAiGenerators: (role: UserRole) => role === 'admin' || role === 'editor',
  canAccessAdminPanel: (role: UserRole) => role === 'admin',
  isContentSubscriber: (role: UserRole) => role === 'subscriber',
};

export function getCachedUserRole(uid?: string | null): UserRole {
  if (!uid) return 'viewer';
  try {
    const saved = localStorage.getItem(`sdo_user_role_${uid}`);
    if (saved === 'admin' || saved === 'editor' || saved === 'viewer' || saved === 'subscriber') {
      return saved as UserRole;
    }
  } catch {}
  return 'viewer'; // Default to viewer for safe least-privilege security
}

export function isPlatformAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  if (clean.includes('admin') || clean.startsWith('admin@')) return true;
  if (clean.endsWith('@kosun.pro') || clean.endsWith('@kosun.pro')) return true;
  if (clean === 'contact@kosun.pro' || clean === 'support@kosun.pro' || clean === 'contact@kosun.pro') return true;
  return false;
}

export function setCachedUserRole(uid: string, role: UserRole): void {
  try {
    localStorage.setItem(`sdo_user_role_${uid}`, role);
  } catch {}
}

export async function fetchUserRole(uid: string, app?: FirebaseApp, tenantId?: string): Promise<UserRole> {
  const cached = getCachedUserRole(uid);
  try {
    const targetApp = app || ensureDefaultFirebaseApp();
    const auth = getOrCreateAuth(targetApp);
    const currentUser = auth.currentUser;
    const isEmailAdmin = isPlatformAdminEmail(currentUser?.email);

    if (isEmailAdmin) {
      setCachedUserRole(uid, 'admin');
    }

    const db = getFirestore(targetApp);
    const effectiveTenant = (tenantId && tenantId !== '_master') ? tenantId.trim().toLowerCase() : null;

    // 1. If in a specific tenant scope, check tenant-specific user doc first
    if (effectiveTenant) {
      try {
        const tenantUserRef = doc(db, 'tenants', effectiveTenant, 'users', uid);
        const tenantSnap = await getDoc(tenantUserRef);
        if (tenantSnap.exists()) {
          const tRole = tenantSnap.data()?.role;
          if (tRole && (tRole === 'admin' || tRole === 'editor' || tRole === 'viewer' || tRole === 'subscriber')) {
            setCachedUserRole(uid, tRole);
            return tRole;
          }
        }

        // Also check if user is a content subscriber in tenant's contacts
        const contactRef = doc(db, 'tenants', effectiveTenant, 'contacts', uid);
        const contactSnap = await getDoc(contactRef);
        if (contactSnap.exists() && contactSnap.data()?.isContentSubscriber) {
          setCachedUserRole(uid, 'subscriber');
          return 'subscriber';
        }
      } catch {}
    }

    // 2. Global Users collection check
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      if (isEmailAdmin && data?.role !== 'admin') {
        await setDoc(userDocRef, { role: 'admin', updatedAt: Date.now() }, { merge: true });
        setCachedUserRole(uid, 'admin');
        return 'admin';
      }
      if (data?.role && (data.role === 'admin' || data.role === 'editor' || data.role === 'viewer' || data.role === 'subscriber')) {
        setCachedUserRole(uid, data.role);
        return data.role;
      }
    } else {
      // New user doc creation
      const initialRole: UserRole = isEmailAdmin || cached === 'admin' ? 'admin' : (cached === 'editor' ? 'editor' : (cached === 'subscriber' ? 'subscriber' : 'viewer'));
      const userData = {
        uid,
        email: currentUser?.email || '',
        displayName: currentUser?.displayName || '',
        role: initialRole,
        tenantId: effectiveTenant || '_master',
        updatedAt: Date.now(),
      };

      await setDoc(userDocRef, userData, { merge: true });

      // If tenant scoped, mirror under the tenant's users subcollection
      if (effectiveTenant) {
        await setDoc(doc(db, 'tenants', effectiveTenant, 'users', uid), userData, { merge: true });
      }

      setCachedUserRole(uid, initialRole);
      return initialRole;
    }
  } catch (err) {
    console.warn('[FirebaseAuth] fetchUserRole notice:', err);
  }
  return cached || 'viewer';
}

export async function updateUserRole(uid: string, role: UserRole, app?: FirebaseApp, tenantId?: string): Promise<void> {
  setCachedUserRole(uid, role);
  try {
    const targetApp = app || ensureDefaultFirebaseApp();
    const db = getFirestore(targetApp);
    const effectiveTenant = (tenantId && tenantId !== '_master') ? tenantId.trim().toLowerCase() : null;

    await setDoc(doc(db, 'users', uid), {
      uid,
      role,
      tenantId: effectiveTenant || '_master',
      updatedAt: Date.now(),
    }, { merge: true });

    if (effectiveTenant) {
      await setDoc(doc(db, 'tenants', effectiveTenant, 'users', uid), {
        uid,
        role,
        tenantId: effectiveTenant,
        updatedAt: Date.now(),
      }, { merge: true });
    }
  } catch (err) {
    console.warn('[FirebaseAuth] updateUserRole notice:', err);
  }
}

/**
 * Automatically creates or updates a contact in the Admin CRM when a user logs in.
 * Guarantees that every active user is reflected in the Admin's CRM contacts list.
 * Supports scoping directly to a subdomain tenant (tenants/{subdomain}/contacts/{uid}).
 */
export async function syncUserToAdminCrm(
  user: User,
  app?: FirebaseApp,
  tenantId?: string,
  isSubscriber?: boolean,
  subscriptionDetails?: Record<string, any>
): Promise<void> {
  if (!user || user.isAnonymous) return;
  try {
    const targetApp = app || ensureDefaultFirebaseApp();
    const db = getFirestore(targetApp);
    const effectiveTenant = (tenantId && tenantId !== '_master') ? tenantId.trim().toLowerCase() : null;

    const displayName = user.displayName || user.email?.split('@')[0] || 'משתמש רשום';
    const email = user.email || '';
    const phone = user.phoneNumber || '';
    const nowIso = new Date().toISOString();

    const contactPayload = {
      id: user.uid,
      conta_name: displayName,
      email: email,
      conta_phone: phone,
      status: 'active',
      is_lead: false,
      contact_type: isSubscriber ? 'subscriber' : 'contact',
      isContentSubscriber: Boolean(isSubscriber),
      subscriberRole: isSubscriber ? 'content_subscriber' : undefined,
      tenantId: effectiveTenant || '_master',
      registeredSubdomain: effectiveTenant || '_master',
      lead_source: isSubscriber ? 'הרשמה למנוי תוכן (KosSubscribed)' : (effectiveTenant ? `סאב-דומיין (${effectiveTenant})` : 'התחברות למערכת (Auth)'),
      last_login: nowIso,
      updatedAt: nowIso,
      createdAt: nowIso,
      tags: isSubscriber
        ? ['מנוי תוכן', effectiveTenant || 'Master', 'KosSubscribed']
        : ['משתמש רשום', effectiveTenant || 'Kosun Platform'],
      ...(subscriptionDetails || {}),
    };

    // 1. Write to tenant-scoped contacts collection if inside a subdomain tenant!
    if (effectiveTenant) {
      const tenantContactRef = doc(db, 'tenants', effectiveTenant, 'contacts', user.uid);
      await setDoc(tenantContactRef, contactPayload, { merge: true });

      // Also ensure tenant-scoped user doc has role
      await setDoc(doc(db, 'tenants', effectiveTenant, 'users', user.uid), {
        uid: user.uid,
        email,
        displayName,
        role: isSubscriber ? 'subscriber' : 'viewer',
        tenantId: effectiveTenant,
        updatedAt: Date.now(),
      }, { merge: true });
    }

    // 2. Global / Master mirror (so master platform has audit pointer with tenant tag)
    const contactDocRef = doc(db, 'contacts', user.uid);
    await setDoc(contactDocRef, contactPayload, { merge: true });

    // Also notify central eventBus if loaded in browser
    try {
      const { eventBus } = await import('../core/bridge/EventBus');
      eventBus.emit('crm:contact:updated' as any, {
        id: user.uid,
        conta_name: displayName,
        email,
        conta_phone: phone,
        last_login: nowIso,
        tenantId: effectiveTenant,
        isContentSubscriber: Boolean(isSubscriber),
      });
    } catch {
      // EventBus optional
    }
  } catch (err) {
    console.warn('[FirebaseAuth] syncUserToAdminCrm notice:', err);
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
    case 'auth/unauthorized-domain':
      return 'הדומיין הנוכחי אינו מורשה ב-Firebase. יש להוסיף את הדומיין/כתובת תחת Firebase Console -> Authentication -> Settings -> Authorized domains';
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
    const errorCode = err?.code || '';
    // If anonymous sign-in is disabled or restricted in Firebase Console, degrade gracefully
    if (
      errorCode === 'auth/admin-restricted-operation' ||
      errorCode === 'auth/operation-not-allowed' ||
      errorCode === 'auth/configuration-not-found'
    ) {
      return null;
    }
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
export async function registerWithEmail(
  email: string,
  pass: string,
  displayName?: string,
  app?: FirebaseApp,
  tenantId?: string,
  role?: UserRole
): Promise<User> {
  const auth = getOrCreateAuth(app);
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (displayName && displayName.trim()) {
    try {
      await updateProfile(cred.user, { displayName: displayName.trim() });
    } catch (e) {
      console.warn('[FirebaseAuth] updateProfile notice:', e);
    }
  }

  // Automatic tenant scoping for the newly registered user
  const effectiveTenant = tenantId || resolveCurrentTenantId();
  if (cred.user) {
    await syncUserToAdminCrm(
      cred.user,
      app,
      effectiveTenant,
      role === 'subscriber'
    );
    if (role) {
      await updateUserRole(cred.user.uid, role, app, effectiveTenant);
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
    const activeTenant = resolveCurrentTenantId();

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

      // Async sync from Firestore scoped to tenant
      fetchUserRole(auth.currentUser.uid, app, activeTenant).then((syncedRole) => {
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
            // Synchronize authenticated user to Admin CRM contacts directly under current tenant
            if (!user.isAnonymous) {
              syncUserToAdminCrm(user, app, activeTenant).catch(err => {
                console.warn('[FirebaseAuth] syncUserToAdminCrm background notice:', err);
              });
            }

            fetchUserRole(user.uid, app, activeTenant).then((syncedRole) => {
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
