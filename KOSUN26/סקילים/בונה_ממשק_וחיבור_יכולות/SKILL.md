---
name: kosun26-ui-slot-composer
description: "בניית ממשקי משתמש מבודדים וחיבור פונקציונליות ו-UI בין רכיבים באמצעות Capability Slots, ללא ייבוא הדדי (Zero Cross-Import UI Composition)."
---

<div dir="rtl" style="text-align: right;">

# 🎨 KOSUN26 - בונה ממשק משתמש וחיבור יכולות (UI Slot Composer)

מדריך זה מנחה את פיתוח ממשקי המשתמש (UI) במערכת KOSUN26, תוך דגש על חיבור פונקציונליות בין רכיבים עצמאיים באמצעות **Capability Slots** בלבד וללא אף שורת ייבוא הדדית בין מודולים.

---

## 🧩 עקרון ה-Capability Slot ב-UI

כאשר מודול צריך להציג ממשק השייך לאחריותו של מודול אחר (לדוגמה: עמוד נחיתה שצריך להטמיע טופס, או מסך מוצרים שצריך לפתוח בוחר מדיה):
1. **המודול הצרכן אינו מייבא את קומפוננטת המקור!**
2. **המודול הצרכן מניח שקע ייעודי (`<CapabilitySlot />`)**.
3. **המודול הספק רושם את הקומפוננטה שלו במרשם הגלובלי (`registerCapabilityUI`)**.

---

## 🛠️ מימוש מעשי בקוד

### 1. צריכת UI (רכיב צרכן)
```tsx
import React from 'react';
import { CapabilitySlot } from '@/core/bridge/CapabilitySlot';

interface BlockRendererProps {
  type: string;
  formId?: string;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ type, formId }) => {
  if (type === 'form') {
    return (
      <div className="w-full my-4">
        <CapabilitySlot
          name="form-renderer"
          props={{
            formId,
            onSubmitted: (data: unknown) => console.log('טופס נשלח בהצלחה', data)
          }}
          fallback={
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl text-center text-gray-500">
              תצוגה מקדימה של טופס ({formId || 'לא נבחר טופס'})
            </div>
          }
        />
      </div>
    );
  }
  return null;
};
```

### 2. אספקת UI (רכיב ספק)
בתוך `src/modules/[ספק-היכולת]/index.ts`:
```typescript
import { registerCapabilityUI } from '@/core/bridge/capabilityRegistry';
import { SmartFormRenderer } from './components/SmartFormRenderer';

// רישום רשמי ל-Slot
registerCapabilityUI('form-renderer', SmartFormRenderer);

export { FormBuilderView } from './views/FormBuilderView';
```

---

## 💎 חוקי העיצוב של קושאן (Cashwan Branding & UI Rules)

1. **RTL בלבד (Full Right-To-Left):**
   * שימוש במחלקות כיווניות של Tailwind (`text-right`, `space-x-reverse`, `rtl:`).
   * עברית נקייה ומדויקת בכל כפתור, תווית והודעת שגיאה.
2. **ללא Header עליון מסורתי (Headerless Experience):**
   * כל הניווט והפעולות מתבצעים דרך **Floating Dock** (מעגן צף תחתון/צדדי).
3. **מודאלים במסך מלא (100% Fullscreen Modals):**
   * אין דיאלוגים קטנים שצפים באמצע המסך. כל חלון עריכה, בוחר מדיה או הגדרות נפתח ב-100% גובה ורוחב מסך עם כפתור סגירה נקי בפינה.
4. **איפוק ויזואלי ומקצועיות:**
   * ללא אימוג'י בטקסטים, כפתורים, תפריטים או כותרות.
   * שימוש באייקוני Lucide React אלגנטיים.

---

## 🛡️ מניעת שגיאות שכיחות

* ❌ **לעולם אל תכתוב:** `import { MediaPicker } from '../../media-gallery-hub/...'`
* ✅ **תמיד השתמש ב:** `<CapabilitySlot name="media-picker" props={{ onSelect }} />`
* ❌ **לעולם אל תניח שרכיב חיצוני קיים ומותקן:** תמיד ספק `fallback` נקי בעברית.

</div>
