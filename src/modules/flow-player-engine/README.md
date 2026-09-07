# Flow Player Engine (מנוע נגן זרימה אינטראקטיבי)

קומפוננטת קצה עצמאית (SPA) המבוססת על מכונת מצבים (State Machine) מונחית JSON, לסנכרון וידאו, הזרקת שכבות ממשק (Overlays) בזמן אמת, אינטראקציות קוליות מונעות Gemini AI, ואיסוף טלמטריה ל-Firestore.

## מבנה 10 השכבות
1. types/: הגדרות TypeScript מלאות למצבי זרימה, קמפיינים, טלמטריה וכוונות קוליות.
2. config/: ניהול קידומת אוספים sdo_player_ והגדרות ברירת מחדל.
3. context/: ספק הקונטקסט של הפיירבייס (ModuleContext) ומכונת המצבים (PlayerMachineContext).
4. services/: שירות Firestore לטעינת קמפיינים ורישום אירועי טלמטריה ב-session_events.
5. api/: חיבור ישיר ל-Google Gemini API לזיהוי כוונות (Intent Routing) ו-Cloud Functions.
6. prompts/: פרומפט מערכת מותאם עבור סוכן מכירות אינטראקטיבי.
7. routes/: ניתובים פנימיים (/ ו-/:campaignId).
8. components/: VideoLayer, UiOverlayManager, VoiceRecorderInteraction, TelemetryDebugger, PlayerContainer.
9. StandaloneView.tsx: סביבת הרצה עצמאית עבור Workbench.
10. index.ts: ייצוא ציבורי מלא.

## חוקי אבטחה של Firestore (Security Rules)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sdo_player_campaign_configs/{campaignId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /sdo_player_session_events/{sessionId} {
      allow read, write: if true;
    }
  }
}
```