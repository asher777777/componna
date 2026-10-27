export type FirestoreFilterOperator = '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains';

export interface FirestoreQueryCondition {
  field: string;
  operator: FirestoreFilterOperator;
  value: string | number | boolean;
}

export interface FieldMappingConfig {
  /**
   * שם השדה במסמך המקור שישמש כמזהה (id) - ברירת מחדל: doc.id
   */
  idField?: string;
  /**
   * שדה לכותרת הראשית (title)
   */
  titleField: string;
  /**
   * שדה לכותרת המשנה (subtitle)
   */
  subtitleField?: string;
  /**
   * שדה לאייקון (שם אייקון או URL תמונה/SVG)
   */
  iconField?: string;
  /**
   * שדה תגית סטטוס (badgeText)
   */
  badgeTextField?: string;
  /**
   * שדה תיאור מורחב / הערות ללשונית האקורדיון (description)
   */
  descriptionField?: string;
  /**
   * שדה סוג פעולה (variant: 'default' | 'danger')
   */
  variantField?: string;
  /**
   * שדה מזהה פעולה לפונקציה (actionType)
   */
  actionTypeField?: string;
}

export type FirebaseTargetProject = 'comona' | 'kosun';

export interface ComonaAdapterConfig {
  /**
   * מזהה ייחודי של המתאם
   */
  id: string;
  name: string;
  /**
   * פרויקט היעד ב-Firebase (קמונה glowmanage או קושאן מקומי)
   */
  targetProject?: FirebaseTargetProject;
  /**
   * נתיב הקולקציה ב-Firestore (לדוגמה: 'tenants/_master/tasks' או 'todayTasks' או 'brandDna')
   */
  collectionPath: string;
  /**
   * תנאי סינון אופציונליים
   */
  conditions: FirestoreQueryCondition[];
  /**
   * מיפוי שדות מהמסמך ל-UI
   */
  fieldMapping: FieldMappingConfig;
  /**
   * מגבלת מסמכים לשליפה (1-50)
   */
  limitCount?: number;
  /**
   * שדה למיון
   */
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
}
