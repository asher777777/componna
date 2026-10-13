/**
 * KosTenantProvisioner Cloud Functions / Server API
 * Secure provisioning hooks (DNS, Email, Subdomains).
 */

export interface ProvisionResponse {
  success: boolean;
  message: string;
  subdomain?: string;
}

export async function pingProvisionService(): Promise<boolean> {
  return true;
}
