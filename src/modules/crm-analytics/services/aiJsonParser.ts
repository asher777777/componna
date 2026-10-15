/**
 * Compatibility Re-export Layer
 * Delegates to credentialsParserService
 */

export * from './credentialsParserService';

export {
  parseJsonCredentials as parseJsonCredentialsWithAI,
} from './credentialsParserService';

export type {
  JsonCredentialsResult as AIJsonCredentialsResult,
} from './credentialsParserService';
