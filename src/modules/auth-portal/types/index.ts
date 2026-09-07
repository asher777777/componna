import { User } from 'firebase/auth';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';

export interface UserProfileRecord {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber?: string | null;
  role: 'admin' | 'editor' | 'viewer' | 'guest';
  isAnonymous: boolean;
  createdAt: number;
  lastLoginAt: number;
  metadata?: Record<string, any>;
}

export interface AuthPortalCollectionsConfig {
  users?: string;
  auditLogs?: string;
}

export interface AuthPortalModuleConfig {
  firebaseApp?: FirebaseApp;
  db?: Firestore;
  databaseId?: string;
  collectionPrefix?: string;
  customCollections?: AuthPortalCollectionsConfig;
  onLoginSuccess?: (user: User) => void;
  onLogout?: () => void;
}

export type AuthViewMode = 'login' | 'register' | 'forgot' | 'profile';
