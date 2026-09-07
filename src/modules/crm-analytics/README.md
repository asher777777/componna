# CRM Analytics & Insights Module (`crm-analytics`)

A fully isolated, self-contained full-stack feature module for advanced CRM analytics, community/tag insights, financial aggregations, interactive charts, and dynamic table management with Excel export.

## Features
- **KPI Summary Cards**: Live counts for total contacts, revenue, campaign funds, communities, and forms.
- **Interactive Visualizations**: Recharts Bar and Pie charts for tag distributions, community breakdown, and marketing lead sources.
- **Dynamic Table**: Live search, multi-column sorting, column visibility toggler, inline Firestore cell updates, and Excel export via `xlsx`.
- **Advanced Filtering**: Date range filtering, status toggling, tag and community filters.
- **Saved Views**: Create, switch, and delete custom analytics view presets.
- **RTL & Dark Mode**: Full Right-to-Left Hebrew layout and responsive dark mode support.

## Integration Example

```tsx
import { CrmAnalyticsProvider, CrmAnalyticsMainView } from './modules/crm-analytics';

export function ClientApp({ firebaseApp, currentUserId }) {
  return (
    <CrmAnalyticsProvider 
      firebaseApp={firebaseApp} 
      ownerId={currentUserId}
      customCollections={{
        contacts: 'client_contacts',
        groups: 'client_crm_groups',
        customFields: 'client_custom_fields',
        savedViews: 'client_analytics_views'
      }}
    >
      <CrmAnalyticsMainView />
    </CrmAnalyticsProvider>
  );
}
```

## Firestore Security Rules
```javascript
match /contacts/{contactId} {
  allow read, write: if request.auth != null;
}
match /crm_analytics_saved_views/{viewId} {
  allow read, write: if request.auth != null;
}
```
