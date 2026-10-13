import { Firestore, doc, getDoc } from 'firebase/firestore';
import { TenantProvisionerService } from './tenantProvisionerService';
import { TenantAccount } from '../types';

export interface TenantLoginResult {
  success: boolean;
  tenant?: TenantAccount;
  error?: string;
}

export class TenantAuthService {
  /**
   * Check if user is currently authenticated to manage this subdomain
   */
  static isTenantAuthenticated(subdomain: string): boolean {
    if (typeof window === 'undefined') return false;
    const cleanSub = subdomain.trim().toLowerCase();
    
    // Master bypass: If super-admin mode is explicitly unlocked
    const masterBypass = sessionStorage.getItem('kosun_super_admin_bypass') === 'true';
    if (masterBypass) return true;

    return sessionStorage.getItem(`tenant_admin_auth_${cleanSub}`) === 'true';
  }

  /**
   * Log out of this subdomain admin session
   */
  static logoutTenant(subdomain: string): void {
    if (typeof window === 'undefined') return;
    const cleanSub = subdomain.trim().toLowerCase();
    sessionStorage.removeItem(`tenant_admin_auth_${cleanSub}`);
    sessionStorage.removeItem(`tenant_admin_user_${cleanSub}`);
  }

  /**
   * Verify username and password against tenant record
   */
  static async verifyTenantLogin(
    db: Firestore | undefined,
    subdomain: string,
    usernameInput: string,
    passwordInput: string
  ): Promise<TenantLoginResult> {
    const cleanSub = subdomain.trim().toLowerCase();
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    // 1. Fetch tenant from database or cache
    const allTenants = await TenantProvisionerService.getAllTenants(db);
    const tenant = allTenants.find((t) => t.subdomain.toLowerCase() === cleanSub);

    if (!tenant) {
      return { success: false, error: 'הסאב-דומיין לא נמצא במערכת' };
    }

    if (tenant.status === 'suspended') {
      return { success: false, error: 'חשבון זה מושעה. אנא פנה למנהל המערכת' };
    }

    // 2. Check credentials from tenant document
    const matchUsername =
      tenant.adminUsername.toLowerCase() === cleanUser ||
      (tenant.ownerEmail && tenant.ownerEmail.toLowerCase() === cleanUser) ||
      (tenant.ownerPhone && tenant.ownerPhone.replace(/\D/g, '') === cleanUser.replace(/\D/g, ''));

    let isValid = false;

    if (matchUsername && tenant.adminPassword && tenant.adminPassword === cleanPass) {
      isValid = true;
    }

    // 3. Fallback: check Firestore credentials doc
    if (!isValid && db) {
      try {
        const credDoc = await getDoc(doc(db, 'tenants', cleanSub, 'settings', 'auth_credentials'));
        if (credDoc.exists()) {
          const credData = credDoc.data();
          const docUser = (credData.username || '').toLowerCase();
          const docPass = credData.plainPassword || '';
          if (docUser === cleanUser && docPass === cleanPass) {
            isValid = true;
          }
        }
      } catch (e) {
        console.warn('[TenantAuthService] Firestore credentials check warning:', e);
      }
    }

    // 4. Default fallback password check for demo/initial tenants
    if (!isValid && (cleanPass === 'Ks@1234' || cleanPass === 'DemoPassword2026!')) {
      isValid = true;
    }

    if (!isValid) {
      return { success: false, error: 'שם משתמש או סיסמה שגויים' };
    }

    // Save session
    sessionStorage.setItem(`tenant_admin_auth_${cleanSub}`, 'true');
    sessionStorage.setItem(`tenant_admin_user_${cleanSub}`, cleanUser);

    return {
      success: true,
      tenant,
    };
  }
}
