import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where, DocumentData } from 'firebase/firestore';
import { db } from '../../../src/lib/firebase';
import { ActionPortalItem } from '../types';

export interface ActionPortalFieldMapping {
  titleField?: string;
  subtitleField?: string;
  iconField?: string;
  secondaryIconField?: string;
  orderField?: string;
  actionTypeField?: string;
  badgeTextField?: string;
  statusField?: string;
}

export interface UseActionPortalFirestoreOptions {
  collectionPath: string;
  fieldMapping?: ActionPortalFieldMapping;
  whereCondition?: { field: string; operator: any; value: any };
  autoIndexNumbers?: boolean; // האם לייצר אוטומטית '01', '02', '03'
}

export const useActionPortalFirestore = ({
  collectionPath,
  fieldMapping = {},
  whereCondition,
  autoIndexNumbers = true
}: UseActionPortalFirestoreOptions) => {
  const [items, setItems] = useState<ActionPortalItem[]>([]);
  const [rawDocs, setRawDocs] = useState<DocumentData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!collectionPath) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const colRef = collection(db, collectionPath);
      let q = query(colRef);

      // סינון לפי תנאי אם מוגדר
      if (whereCondition) {
        q = query(q, where(whereCondition.field, whereCondition.operator, whereCondition.value));
      }

      // מיון לפי שדה סדר אם קיים
      const orderKey = fieldMapping.orderField || 'order';
      try {
        q = query(q, orderBy(orderKey, 'asc'));
      } catch (e) {
        // אם אין אינדקס מוגדר, ימשיך ללא מיון קשיח
      }

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs: DocumentData[] = [];
          const mappedItems: ActionPortalItem[] = [];

          snapshot.docs.forEach((docSnap, index) => {
            const data = docSnap.data();
            docs.push({ _id: docSnap.id, ...data });

            // חילוץ שדות לפי המיפוי הדינמי עם ברירות מחדל חכמות
            const title = data[fieldMapping.titleField || 'title'] || data.name || data.label || 'פריט ללא שם';
            const subtitle = data[fieldMapping.subtitleField || 'subtitle'] || data.description || '';
            const primaryIconName = data[fieldMapping.iconField || 'icon'] || data.iconName || 'Sparkles';
            const secondaryIconName = data[fieldMapping.secondaryIconField || 'secondaryIcon'] || primaryIconName;
            const actionType = data[fieldMapping.actionTypeField || 'actionType'] || 'NAVIGATE';
            const badgeText = data[fieldMapping.badgeTextField || 'badgeText'] || data.badge || '';
            const status = data[fieldMapping.statusField || 'status'] || 'active';

            // חישוב מספר סידורי ממוזער '01', '02'
            const indexBadge = autoIndexNumbers
              ? (index + 1).toString().padStart(2, '0')
              : data.indexBadge || (index + 1).toString().padStart(2, '0');

            mappedItems.push({
              id: docSnap.id,
              indexBadge,
              title,
              subtitle,
              primaryIconName,
              secondaryIconName,
              actionType,
              payload: { ...data, _docId: docSnap.id },
              badgeText,
              disabled: status === 'disabled' || status === 'locked'
            });
          });

          setRawDocs(docs);
          setItems(mappedItems);
          setIsLoading(false);
          setError(null);
        },
        (err) => {
          console.error('[ActionPortalFirestore] Listener error:', err);
          setError(err.message);
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (e: any) {
      console.error('[ActionPortalFirestore] Init error:', e);
      setError(e.message);
      setIsLoading(false);
    }
  }, [collectionPath, JSON.stringify(fieldMapping), JSON.stringify(whereCondition), autoIndexNumbers]);

  return { items, rawDocs, isLoading, error };
};
