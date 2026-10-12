# שורת החוקים: רכיב הוואטסאפ (WhatsApp Green API Standards)

חוק זה מגדיר את סטנדרט הפיתוח והשילוב של רכיב הוואטסאפ (`whatsapp-green-api-hub`) במערכת Comona, בהתאם לתיעוד הרשמי של [Green API Documentation](https://green-api.com/en/docs/).

למסמך המלא של שכבת הרכיב עיין ב: `src/modules/whatsapp-green-api-hub/.gemini/rules.md`.

## עקרונות ברזל מחייבים:

1. **בידוד מודולרי ואפס ייבוא צולב**:
   - אין לייבא קוד ישירות בין מודולים.
   - שירותי AI נצרכים אך ורק דרך `useHostCapabilities().getCapability<AiTextAssistantContract>('ai-assistant')`. רכיב הוואטסאפ אינו יוצר קשר ישיר עם Gemini.
   - עדכונים רוחביים מבוצעים דרך `eventBus` (`whatsapp:message_sent`, `whatsapp:incoming_lead`).

2. **ניתוב אשכול ישיר (Cluster Host Direct Routing)**:
   - כל מופע Green API שייך לאשכול אזורי לפי 4 הספרות של ה-`idInstance` (`https://{cluster}.api.greenapi.com`).
   - יש לפנות תמיד ישירות לשרת האשכול הרלוונטי כדי למנוע הפניות 301 שגורמות לשגיאות CORS ו-Fetch failure בדפדפן.

3. **תקן מזהי שיחה (Chat ID Formatting)**:
   - הודעות פרטיות: `[קידומת מדינה][מספר]@c.us` (ללא סימני +, רווחים, מקפים או אפס מוביל, למשל `972501234567@c.us`).
   - קבוצות: `[קוד קבוצה]@g.us`.
   - ניוזלטרים / ערוצים: `[קוד]@newsletter`.

4. **אסטרטגיית Webhooks ואישור מיידי**:
   - ווב-הוקס בענן הם ברירת המחדל לייצור.
   - נקודת הקצה חייבת להחזיר HTTP 200 OK באופן מיידי (תוך פחות מ-2 שניות) לפני תחילת עיבוד כבד.

5. **בקרת עומסים ומניעת חסימות (Anti-Ban & Throttling)**:
   - חובה להפעיל השהיה מדורגת (5–15 שניות) עם Random Jitter בין הודעות בשליחה המונית.
   - מעקב תורים באמצעות `getMessagesCount` ויכולת ביטול תור מיידית `clearMessagesQueue`.

6. **בידוד רב-דיירי (Multi-Tenancy)**:
   - כל המידע נשמר תחת `tenants/{tenantId}/` בלבד.
   - מפתחות LocalStorage מתחילים ב-`kosun_{tenantId}_whatsapp_*`.
