import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../src/lib/firebase'; // משיכה מהאינסטנס הקיים בפרויקט
import { ArchetypePreset, ArchetypeId } from './types';
import { DEFAULT_ARCHETYPES } from './defaultArchetypes';

interface ArchetypeContextValue {
  activeArchetype: ArchetypePreset;
  activeId: ArchetypeId;
  allPresets: Record<string, ArchetypePreset>;
  isLoading: boolean;
  setArchetypeById: (id: ArchetypeId) => void;
  // פונקציית עזר להלבשת דריסת עיצוב מקומית
  resolveTheme: (componentOverrides?: Partial<ArchetypePreset['style']>) => ArchetypePreset['style'];
}

const ArchetypeContext = createContext<ArchetypeContextValue | undefined>(undefined);

interface ArchetypeProviderProps {
  children: React.ReactNode;
  initialArchetypeId?: ArchetypeId;
  tenantId?: string; // אם מועבר טננט ספציפי (למשל מ-URL או סאב-דומיין)
}

export const ArchetypeProvider: React.FC<ArchetypeProviderProps> = ({
  children,
  initialArchetypeId = 'wellness',
  tenantId
}) => {
  const [allPresets, setAllPresets] = useState<Record<string, ArchetypePreset>>(DEFAULT_ARCHETYPES);
  const [activeId, setActiveId] = useState<ArchetypeId>(initialArchetypeId);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. האזנה חיה (Realtime) לכל הסגנונות בענן מקולקציית archetype_presets
  useEffect(() => {
    try {
      const presetsCol = collection(db, 'archetype_presets');
      const unsubscribe = onSnapshot(
        presetsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const cloudPresets: Record<string, ArchetypePreset> = {};
            snapshot.forEach((docSnap) => {
              cloudPresets[docSnap.id] = { id: docSnap.id, ...(docSnap.data() as any) };
            });
            // מיזוג: הענן מנצח ודורס את ברירות המחדל המקומיות, אך שומר על fallback
            setAllPresets((prev) => ({ ...prev, ...cloudPresets }));
          }
          setIsLoading(false);
        },
        (error) => {
          console.warn('[ArchetypeEngine] Firestore sync warning (using defaults):', error);
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn('[ArchetypeEngine] Could not initialize Firestore listener:', e);
      setIsLoading(false);
    }
  }, []);

  // 2. אם הועבר tenantId, מאזינים להגדרת הסגנון של הטננט הספציפי
  useEffect(() => {
    if (!tenantId) return;

    try {
      const tenantDocRef = doc(db, 'tenants', tenantId);
      const unsubscribe = onSnapshot(tenantDocRef, (snap) => {
        if (snap.exists()) {
          const tenantData = snap.data();
          if (tenantData.archetypeId && allPresets[tenantData.archetypeId]) {
            setActiveId(tenantData.archetypeId);
          }
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('[ArchetypeEngine] Tenant listener failed:', e);
    }
  }, [tenantId, allPresets]);

  // הסגנון הפעיל כרגע
  const activeArchetype = useMemo(() => {
    return allPresets[activeId] || allPresets['wellness'] || DEFAULT_ARCHETYPES.wellness;
  }, [allPresets, activeId]);

  // פונקציית מיזוג שדואגת שכל קומפוננטה תוכל לדרוס ערכים ב-Editor
  const resolveTheme = (componentOverrides?: Partial<ArchetypePreset['style']>) => {
    if (!componentOverrides) return activeArchetype.style;
    return {
      ...activeArchetype.style,
      ...componentOverrides
    };
  };

  const value: ArchetypeContextValue = {
    activeArchetype,
    activeId,
    allPresets,
    isLoading,
    setArchetypeById: setActiveId,
    resolveTheme
  };

  return <ArchetypeContext.Provider value={value}>{children}</ArchetypeContext.Provider>;
};

// Hook פשוט לשימוש בכל קומפוננטת View או Editor!
export const useArchetype = () => {
  const context = useContext(ArchetypeContext);
  if (!context) {
    // אם קומפוננטה מורצת מחוץ ל-Provider - היא מקבלת fallback בטוח!
    return {
      activeArchetype: DEFAULT_ARCHETYPES.wellness,
      activeId: 'wellness',
      allPresets: DEFAULT_ARCHETYPES,
      isLoading: false,
      setArchetypeById: () => {},
      resolveTheme: (overrides?: any) => ({ ...DEFAULT_ARCHETYPES.wellness.style, ...overrides })
    };
  }
  return context;
};
