export interface FirebaseCredentialsConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  databaseId?: string;
}

export type CollectionCategory =
  | 'video_studio'
  | 'flow_player'
  | 'media'
  | 'page_builder'
  | 'crm'
  | 'client_platform'
  | 'auth'
  | 'system'
  | 'custom';

export interface CollectionMetadata {
  id: string;
  name: string;
  description: string;
  category: CollectionCategory;
  docCount?: number;
  icon?: string;
}

export interface FirestoreDocumentRecord {
  id: string;
  data: Record<string, any>;
  createdAtFormatted?: string;
  updatedAtFormatted?: string;
  hasTimestamp?: boolean;
}

export type ViewMode = 'table' | 'json' | 'cards';

export interface DbModuleConfig {
  defaultCredentials?: FirebaseCredentialsConfig;
}
