import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  limit,
  orderBy,
  onSnapshot,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../../src/lib/firebase';
import { ComonaAdapterConfig } from './types';
import { KosActionItem } from '../components/action-menu';

export function useComonaDynamicAdapter(config: ComonaAdapterConfig) {
  const [items, setItems] = useState<KosActionItem[]>([]);
  const [rawDocs, setRawDocs] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config.collectionPath) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const colRef = collection(db, config.collectionPath);
      const constraints: QueryConstraint[] = [];

      // 1. תנאי סינון (Where conditions)
      if (config.conditions && config.conditions.length > 0) {
        config.conditions.forEach((c) => {
          if (c.field && c.operator && c.value !== undefined && c.value !== '') {
            constraints.push(where(c.field, c.operator as any, c.value));
          }
        });
      }

      // 2. מיון (Order By)
      if (config.orderByField) {
        constraints.push(orderBy(config.orderByField, config.orderDirection || 'asc'));
      }

      // 3. הגבלת כמות (Limit)
      if (config.limitCount && config.limitCount > 0) {
        constraints.push(limit(config.limitCount));
      }

      const q = query(colRef, ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const raw: DocumentData[] = [];
          const mappedItems: KosActionItem[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            raw.push({ _docId: docSnap.id, ...data });

            const m = config.fieldMapping;

            return {
              id: (m.idField && data[m.idField]) || docSnap.id,
              title: data[m.titleField] || docSnap.id,
              subtitle: m.subtitleField ? data[m.subtitleField] : undefined,
              icon: m.iconField ? data[m.iconField] : 'Sparkles',
              badgeText: m.badgeTextField ? String(data[m.badgeTextField]) : undefined,
              description: m.descriptionField ? data[m.descriptionField] : undefined,
              variant: (m.variantField && data[m.variantField]) || 'default',
              payload: {
                ...data,
                _sourceCollection: config.collectionPath,
                _docId: docSnap.id,
                _actionType: m.actionTypeField ? data[m.actionTypeField] : undefined,
              },
            };
          });

          setRawDocs(raw);
          setItems(mappedItems);
          setLoading(false);
        },
        (err) => {
          console.warn('[ComonaAdapter] Listener notice:', err);
          setError(err.message || 'שגיאה במשיכת נתונים מהקולקציה');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      console.warn('[ComonaAdapter] Setup error:', err);
      setError(err?.message || 'שגיאת הגדרת קולקציה');
      setLoading(false);
    }
  }, [
    config.collectionPath,
    JSON.stringify(config.conditions),
    JSON.stringify(config.fieldMapping),
    config.limitCount,
    config.orderByField,
    config.orderDirection,
  ]);

  return { items, rawDocs, loading, error };
}
