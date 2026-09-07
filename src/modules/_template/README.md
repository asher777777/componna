<div dir="rtl" style="text-align: right;">

# מודול תבנית (Template Module)

קומפוננטה מודולרית עצמאית הכוללת ממשק Tailwind, שכבת Firestore, ניתובים פנימיים ושירותי AI.

## הוראות הטמעה בפרויקט מארח:

1. העתק את התיקייה `src/modules/_template` לפרויקט היעד שלך.
2. עטוף את המודול ב-Provider של המודול והעבר את ה-Firebase App שלך:
```tsx
import { TemplateModuleProvider, TemplateModuleRoutes } from './modules/_template';

<TemplateModuleProvider config={{ firebaseApp: myApp }}>
  <Route path="/template-feature/*" element={<TemplateModuleRoutes />} />
</TemplateModuleProvider>
```

3. חוקי אבטחה ב-Firestore:
```javascript
match /mod_template_items/{itemId} {
  allow read, write: if request.auth != null;
}
```

</div>
