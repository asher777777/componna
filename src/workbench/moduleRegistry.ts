import React from 'react';
import { AuthPortalStandaloneView } from '../modules/auth-portal';
import { DbCollectionsHubStandaloneView } from '../modules/db-collections-hub';
import { MediaGalleryHubStandaloneView } from '../modules/media-gallery-hub';
import { FlowPlayerEngineStandaloneView } from '../modules/flow-player-engine';
import { TemplateStandaloneView } from '../modules/_template';
import { PageBuilderStandaloneView } from '../modules/page-builder';
import { CrmAnalyticsStandaloneView } from '../modules/crm-analytics';
import { ClientReceiverPlatformStandaloneView } from '../modules/client-receiver-platform';
import { DbConnectorHubStandaloneView } from '../modules/db-connector-hub';

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType;
  route: string;
  collectionPrefix: string;
}

export const REGISTERED_MODULES: ModuleDefinition[] = [
  {
    id: 'db-connector-hub',
    name: 'מרכז חיבור וסנכרון DB (Universal Connector)',
    description: 'סנכרון מרכזי של כלל המודולים למסד נתונים Firebase ו-Storage יחיד, פענוח חכם של מפתח JSON ב-Gemini',
    component: DbConnectorHubStandaloneView,
    route: '/db-connector',
    collectionPrefix: '',
  },
  {
    id: 'client-platform',
    name: 'פלטפורמת מקלט לקוח (Client Platform Shell)',
    description: 'שלד לקוח מלא עם אימות, טבלת סימון והפעלה של רכיבים, סלאגים מותאמים וניווט דינמי',
    component: ClientReceiverPlatformStandaloneView,
    route: '/client-platform',
    collectionPrefix: 'client_',
  },
  {
    id: 'crm-analytics',
    name: 'אנליטיקה ודוחות CRM (Analytics)',
    description: 'לוח בקרה מתקדם, גרפים אינטראקטיביים, פילוח קהילות ותגיות, וטבלה דינמית עם ייצוא לאקסל',
    component: CrmAnalyticsStandaloneView,
    route: '/crm-analytics',
    collectionPrefix: 'mod_crm_',
  },
  {
    id: 'page-builder',
    name: 'יוצר העמודים והאתרים (Page Builder)',
    description: 'מערכת ויזואלית מלאה לבנייה, עריכה, עיצוב וסידור דפים עם אזורי עריכה ותצוגה דואליים',
    component: PageBuilderStandaloneView,
    route: '/page-builder',
    collectionPrefix: 'mod_pagebuilder_',
  },
  {
    id: 'auth-portal',
    name: 'פורטל אימות וכניסה למערכת',
    description: 'מערכת התחברות ורישום משתמשים, אימות Google, אימות אנונימי וניהול פרופילים ב-Firestore',
    component: AuthPortalStandaloneView,
    route: '/auth-portal',
    collectionPrefix: 'mod_auth_',
  },
  {
    id: 'flow-player-engine',
    name: 'מנוע נגן זרימה אינטראקטיבי',
    description: 'נגן וידאו אינטראקטיבי עם סנכרון שכבות UI, זיהוי כוונות קוליות ורישום טלמטריה',
    component: FlowPlayerEngineStandaloneView,
    route: '/flow-player-engine',
    collectionPrefix: 'sdo_player_',
  },
  {
    id: 'media-gallery-hub',
    name: 'מנהל מדיה וגלריה אוניברסלי',
    description: 'העלאה מרובה, גלריית סרטונים/תמונות/שמע, המרת פורמט תמונות והורדה מרובה',
    component: MediaGalleryHubStandaloneView,
    route: '/media-gallery-hub',
    collectionPrefix: 'sdo_media_',
  },
  {
    id: 'db-collections-hub',
    name: 'מנהל קולקציות ומאגר נתונים (Firestore)',
    description: 'סייר קולקציות מלא, עריכת מסמכים, ניהול מפתחות פיירבייס ושמירה ישירה בזמן אמת',
    component: DbCollectionsHubStandaloneView,
    route: '/db-collections',
    collectionPrefix: '',
  },
  {
    id: 'template',
    name: 'מודול תבנית בסיסי',
    description: 'תבנית שלד מלאה עם 10 שכבות להעתקה ובדיקה',
    component: TemplateStandaloneView,
    route: '/template',
    collectionPrefix: 'mod_template_',
  },
];


