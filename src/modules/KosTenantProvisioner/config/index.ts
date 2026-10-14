export const DEFAULT_COLLECTION_PREFIX = 'sys_tenants_';

export const TENANT_PROVISIONER_CONFIG = {
  defaultSubdomainPrefix: 'tenant_',
  systemMasterId: '_master',
  defaultModules: ['KosWebAi', 'KSF'],
  collections: {
    tenants: 'tenants',
    masterContacts: 'contacts',
    settings: 'settings',
  },
};
