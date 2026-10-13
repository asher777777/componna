# whatsapp-green-api-hub: חוקי שכבת רכיב הוואטסאפ (Green API Rules & Standards)

מסמך זה מהווה את **שכבת החוקים המחייבת (Rules Layer)** עבור רכיב הוואטסאפ (`whatsapp-green-api-hub`) במערכת Comona / Cashwan. החוקים גובשו על בסיס התיעוד הרשמי של [Green API Documentation](https://green-api.com/en/docs/) ותקני הארכיטקטורה המודולרית של המערכת.

---

## 1. עקרונות יסוד ובידוד ארכיטקטוני (Module Architecture & Isolation)
1. **Zero Direct Cross-Module Imports**:
   - חל איסור מוחלט על ייבוא ישיר מרכיבים שכנים (כגון `crm-groups-hub`, `KosBranding`, `kesher-payments-hub`).
   - כל שיתוף טיפוסים וחוזים מתבצע אך ורק דרך `src/core/contracts/index.ts`.
   - שיתוף מידע רוחבי מתבצע אסינכרונית בלבד באמצעות ה-`EventBus` (`src/core/bridge/EventBus`).
2. **AI Capabilities via Host Bridge Only**:
   - הרכיב **לעולם אינו פונה ישירות ל-Gemini API** ואינו מחזיק מפתחות או קריאות SDK של בינה מלאכותית.
   - כל תכונות ה-AI (בוטים, מענה חכם, ניסוח סטטוסים) נצרכות דרך `useHostCapabilities().getCapability<AiTextAssistantContract>('ai-assistant')`.
   - במידה והשירות אינו זמין, הרכיב מתדרדר בצורה חיננית (Graceful Degradation) ומציג הודעת הסבר ברורה למשתמש.
3. **Multi-Tenant Data Isolation (בידוד טננטים קשיח)**:
   - כל שאילתה ושמירה ב-Firestore חייבת להיות תחומה תחת נתיב הטננט: `tenants/{tenantId}/...`
     - הגדרות מופע וקרדנציאלים: `tenants/{tenantId}/settings/whatsapp`
     - בוטים: `tenants/{tenantId}/whatsapp_ai_bots`
     - שיחות והיסטוריה: `tenants/{tenantId}/wa_bot_chats`
     - סטטוסים: `tenants/{tenantId}/whatsapp_statuses`
     - אוטומציות: `tenants/{tenantId}/whatsapp_status_automations`
     - סנכרון אנשי קשר: `tenants/{tenantId}/contacts`
   - מפתחות LocalStorage חייבים לשאת את קידומת הטננט: `kosun_{tenantId}_whatsapp_*`.

---

## 2. חוקי ניהול מופע Green API והתחברות (Instance & Cluster Lifecycle)
על פי תיעוד Green API Account API:
1. **ניתוב אשכולות ישיר למניעת שגיאות CORS (Cluster Routing Policy)**:
   - מופעי Green API מבוזרים באשכולות שרתים אזוריים לפי 4 הספרות הראשונות של ה-`idInstance` (לדוגמה `7103` -> `https://7103.api.greenapi.com`).
   - **חובה**: בעת ביצוע קריאות מהדפדפן, יש לפנות ישירות לשרת האשכול (`https://{cluster}.api.greenapi.com`) או לשרת מוגדר ידנית, כדי למנוע הפניות 301 (Redirects) הגורמות לשגיאות CORS ו-`Failed to fetch`.
   - גיבוי (Fallback Chain): `[customApiUrl, clusterHost, https://api.green-api.com, https://media.green-api.com]`.
2. **מצבי מופע (State Instance Protocol)**:
   - יש לבדוק סטטוס תקופתי באמצעות `getStateInstance`.
   - המצבים הנתמכים והטיפול בהם:
     - `authorized`: המופע מחובר ותקין לפעילות.
     - `notAuthorized`: דורש צימוד מחודש (QR או קוד טלפון).
     - `blocked`: המופע נחסם בוואטסאפ; יש להציג התרעת אזהרה חמורה ולעצור שליחות אוטומטיות.
     - `sleepMode`: המכשיר במצב שינה / לא מקוון; יש להמתין להתעוררות ולא להציף קריאות.
     - `starting`: המופע מאתחל שירות; יש להמתין.
     - `yellowNetworkException`: בעיית תקשורת זמנית ברשת וואטסאפ.
3. **תהליכי צימוד (Pairing)**:
   - **QR Code**: שימוש ב-`qr` או `scanqrcode` (Websocket). הצגת ה-QR מתעדכנת בזמן אמת.
   - **צימוד טלפוני (Link with phone number)**: הפעלת `getAuthorizationCode` עם מספר הטלפון המלא.
4. **תחזוקה ואבטחה**:
   - אתחול מופע מתבצע באמצעות `reboot`.
   - ניתוק מאובטח מתבצע באמצעות `logout`.
   - מפתחות ה-API לא ייחשפו בלוגים או בהודעות שגיאה גלויות.

---

## 3. חוקי עיצוב מזהי צ'אט ונמענים (Chat ID Formatting Rules)
על פי כללי הפרוטוקול של Green API:
1. **שיחות פרטיות (Direct User Chats)**:
   - פורמט חובה: `[CountryCode][NationalNumber]@c.us` (לדוגמה עבור ישראל: `972501234567@c.us`).
   - **איסור מוחלט**: אסור לכלול סימני `+`, מקפים `-`, רווחים, סוגריים או אפס מוביל בקידומת המקומית.
   - חובה להפעיל סניטיזציה (Sanitization) לפני כל קריאת שליחה:
     ```typescript
     const sanitizeChatId = (phone: string): string => {
       const digits = phone.replace(/\D/g, '');
       const clean = digits.startsWith('0') ? '972' + digits.slice(1) : digits;
       return clean.endsWith('@c.us') ? clean : `${clean}@c.us`;
     };
     ```
2. **קבוצות (Group Chats)**:
   - פורמט חובה: `[GroupId]@g.us` (לדוגמה `120363023456789012@g.us` או בפורמט קלאסי `972501234567-1620000000@g.us`).
3. **ערוצים וניוזלטרים (Newsletters)**:
   - פורמט: `[ChannelId]@newsletter`.

---

## 4. חוקי שליחת הודעות ומדיה (Messaging & Media Standards)
על פי תיעוד Sending API:
1. **שליחת הודעות טקסט (`sendMessage`)**:
   - מקבל פרמטרים: `chatId`, `message`, ואופציונלית `quotedMessageId` לציטוט/תגובה.
   - יש לוודא שהטקסט אינו ריק לפני שליחה.
2. **שליחת קבצים ומדיה**:
   - **שליחה לפי URL (`sendFileByUrl`)**:
     - ה-URL חייב להיות ציבורי, ישיר ונגיש לשרתי Green API (למשל Firebase Storage Download URL תקף).
     - חובה לציין `fileName` הכולל סיומת תקנית (למשל `image.jpg`, `document.pdf`).
     - תמיכה ב-`caption` (כיתוב למדיה) וב-`quotedMessageId`.
   - **העלאת קובץ ישירה (`sendFileByUpload` / `uploadFile`)**:
     - משמש כאשר הקובץ נמצא כ-Blob / File מקומי בדפדפן.
   - **מגבלות גדלים ופורמטים**:
     - תמונות: JPEG, PNG, WEBP עד 16MB.
     - מסמכים: PDF, DOCX, XLSX עד 100MB.
     - וידאו: MP4, 3GP עד 100MB.
     - שמע: MP3, OGG, AAC, או Voice Note (PTT).
3. **שליחת כפתורים וסקרים (Interactive Elements)**:
   - סקרים: `sendPoll` עם `options` ושליטה על ריבוי בחירות (`multipleAnswers`).
   - כפתורים אינטראקטיביים: `sendInteractiveButtons` בהתאם לתקן WhatsApp הנוכחי.

---

## 5. חוקי קבלת הודעות, ווב-הוקס ותורים (Webhooks & Receiving Protocol)
על פי תיעוד Receiving & Queues API:
1. **עדיפות ווב-הוקס (Webhooks First)**:
   - מצב העבודה המרכזי במערכת הוא Webhook Endpoint המוגדר בענן (Cloud Function / Serverless).
   - Polling בשיטת HTTP API (`receiveNotification` / `deleteNotification`) מיועד אך ורק לסביבות פיתוח מקומיות או כגיבוי חירום זמני.
2. **חוק אישור ווב-הוק מהיר (Fast Acknowledgment Rule)**:
   - נקודת הקצה הקולטת ווב-הוק **חייבת להחזיר HTTP 200 OK באופן מיידי** (תוך פחות מ-2 שניות).
   - עיבוד מורכב (סנכרון CRM, הפעלת בוט AI, שמירה כבדה) יבוצע באופן אסינכרוני כדי למנוע חסימת התור של Green API ומשלוח חוזר (Retries storm).
3. **טיפול בסוגי התראות (Notification Handlers)**:
   - `incomingMessageReceived`: פענוח סוג ההודעה (`textMessage`, `extendedTextMessage`, `imageMessage`, `documentMessage`, `buttonsResponseMessage`, `reactionMessage`).
   - `outgoingMessageStatus`: עדכון סטטוס הודעות יוצאות (`sent` -> `delivered` -> `read`).
   - `stateInstanceChanged`: זיהוי שינוי סטטוס המופע ועדכון הממשק אוטומטית.
   - `quotaExceeded`: התרעה על חריגה מחבילת השימוש של Green API.
4. **ניהול תורים וקריאות בטוחות**:
   - בקרת עומק התור דרך `getMessagesCount` ו-`showMessagesQueue`.
   - בלם חירום: שימוש ב-`clearMessagesQueue` לעצירה מיידית במקרה של שגיאת הפצה המונית.

---

## 6. חוקי הפצה המונית ומניעת חסימות (Anti-Spam & Anti-Ban Directives)
1. **השהיה מחייבת בין הודעות (Mandatory Throttle & Jitter)**:
   - בשליחה בתפוצה רחבה (Bulk Sender), **חל איסור מוחלט לשלוח הודעות ברצף מיידי**.
   - יש להפעיל השהיה מדורגת עם רנדומיזציה (Jitter) של 5 עד 15 שניות לפחות בין הודעה להודעה.
2. **פרסונליזציה דינמית**:
   - מומלץ לשלב שדות מותאמים אישית (`{name}`, `{org}`) כדי שכל הודעה תהיה ייחודית בעיני מנועי הספאם של וואטסאפ.
3. **כיבוד בקשות הסרה**:
   - זיהוי מילות מפתח כגון "הסר", "STOP", "לא מעוניין" יעדכן מיידית את כרטיס איש הקשר וימנע שליחות עתידיות.

---

## 7. חוקי סטטוסים וסיפורים בוואטסאפ (Statuses & Stories Rules)
1. **פורמט ומידות**:
   - יחס תצוגה מומלץ לתמונות ווידאו בסטטוס: 9:16 (אנכי, 1080x1920).
   - טקסט בסטטוס מוגבל ל-700 תווים עם צבע רקע וגופן תואמי מיתוג.
2. **תזמון אוטומטי**:
   - רישום אוטומציות תחת `tenants/{tenantId}/whatsapp_status_automations`.
   - אוטומציות ירוצו רק כאשר המופע במצב `authorized`.

---

## 8. חוקי ממשק משתמש ועברית (UI & RTL Standards)
1. **תמיכה מלאה ב-RTL**:
   - כל מודאל, לשונית ורכיב חייבים לכלול `dir="rtl"` ויישור לימין (`text-right`).
   - מספרי טלפון ומזהי צ'אט יוצגו עם `dir="ltr"` פנימי למניעת שיבוש תווים.
2. **הודעות שגיאה ומשוב**:
   - כל הודעות השגיאה (חוסר קרדנציאלים, שגיאות רשת, ניתוק מופע) יוצגו בעברית ברורה ומכבדת.
   - קריסת שירות חיצוני לא תגרום לקריסת האפליקציה המארחת.
