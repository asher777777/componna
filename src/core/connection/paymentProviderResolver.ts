import { SystemApiKeysConfig } from './tenantApiKeys';

export type ActivePaymentProvider = 'kesher' | 'nedarim';

/**
 * Strictly resolves the active payment clearing provider for the current tenant.
 * Uses public `purchasedModules` (tenants/{tenantId}.activeModules) so anonymous
 * visitors on public pages route to Nedarim without needing private api_keys read access.
 */
export function resolveActivePaymentProvider(
  apiKeys?: SystemApiKeysConfig | null,
  purchasedModules: string[] = []
): ActivePaymentProvider {
  if (apiKeys?.paymentProvider === 'nedarim') return 'nedarim';
  if (apiKeys?.paymentProvider === 'kesher') return 'kesher';

  const hasNedarimModule = purchasedModules.includes('KosNedarim');
  const hasKesherModule =
    purchasedModules.includes('KosPay') || purchasedModules.includes('kesher-payments-hub');

  if (hasNedarimModule && !hasKesherModule) return 'nedarim';
  if (Boolean(apiKeys?.nedarimMosadId) && !apiKeys?.kesherUserName) return 'nedarim';

  return 'kesher';
}
