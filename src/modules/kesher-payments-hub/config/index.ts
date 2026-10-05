export const KESHER_PAYMENTS_MODULE_CONFIG = {
  id: 'kesher-payments-hub',
  name: 'קשר & EasyCount Hub',
  version: '2.0.0',
  storagePrefix: 'comona_kesher_',
  collections: {
    transactions: 'kesher_transactions',
    glossary: 'kesher_receipt_glossary',
    standingOrders: 'kesher_standing_orders',
  },
  defaultSettings: {
    baseUrl: 'https://kesherhk.info',
    defaultReceiptType: 400 as const, // 400 = קבלה, 405 = תרומה (סעיף 46), 320 = חשבונית מס קבלה
    autoSyncToCrm: true,
  }
};
