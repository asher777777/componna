export type UserRole = 'admin' | 'editor' | 'viewer';

export interface ClientUserSession {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  clientId: string;
  isAuthenticated: boolean;
}

export interface ClientModuleSetting {
  moduleId: string;
  isEnabled: boolean;
  customSlug: string; // e.g. "/analytics", "/clients", "/landing-pages"
  customTitle: string; // e.g. "ניהול לקוחות ואנליטיקה"
  requiredRole: UserRole;
  thirdPartyKeys: Record<string, string>; // e.g. { geminiApiKey: "...", stripeKey: "..." }
  collectionPrefix?: string;
}

export interface ClientPlatformSettings {
  clientId: string;
  clientName: string;
  logoUrl?: string;
  primaryColor?: string;
  modules: Record<string, ClientModuleSetting>;
  updatedAt: string;
}
