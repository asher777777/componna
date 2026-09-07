import { AuthPortalCollectionsConfig } from '../types';

export const DEFAULT_COLLECTION_PREFIX = 'mod_auth_';

export function resolveAuthCollections(
  prefix: string = DEFAULT_COLLECTION_PREFIX,
  custom?: AuthPortalCollectionsConfig
): Required<AuthPortalCollectionsConfig> {
  return {
    users: custom?.users || 'users',
    auditLogs: custom?.auditLogs || `${prefix}audit_logs`,
  };
}
