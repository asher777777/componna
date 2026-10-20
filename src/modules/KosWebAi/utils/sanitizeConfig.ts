/**
 * Sanitize Configuration Utilities for KosWebAi Page Builder
 * 
 * Prevents React Invariant 31 (Objects are not valid as a React child)
 * caused by SyntheticEvent / DOM Event objects mistakenly saved into
 * string or primitive properties (e.g., title, subtitle, descriptions).
 */

export const isSyntheticOrDomEvent = (val: any): boolean => {
  if (!val || typeof val !== 'object') return false;
  // Direct check for DOM Elements (e.g. HTMLInputElement)
  if (typeof Element !== 'undefined' && val instanceof Element) {
    return true;
  }
  // Check for nodeType or circular DOM properties
  if ('nodeType' in val && typeof val.nodeType === 'number') {
    return true;
  }
  return (
    '_reactName' in val ||
    ('nativeEvent' in val && 'target' in val) ||
    ('defaultPrevented' in val && 'isTrusted' in val && 'timeStamp' in val)
  );
};

export const safeJsonStringify = (obj: any): string => {
  const seen = new WeakSet();
  try {
    return JSON.stringify(obj, (key, value) => {
      if (typeof Element !== 'undefined' && value instanceof Element) {
        return (value as any).value ?? '';
      }
      if (isSyntheticOrDomEvent(value)) {
        return (value as any)?.target?.value ?? '';
      }
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return undefined;
        }
        seen.add(value);
      }
      return value;
    });
  } catch (err) {
    console.warn('[safeJsonStringify] Fallback due to serialization issue:', err);
    return '';
  }
};

export const resolveInputValue = (eOrVal: any): string => {
  if (typeof eOrVal === 'string') return eOrVal;
  if (typeof eOrVal === 'number' || typeof eOrVal === 'boolean') return String(eOrVal);
  if (eOrVal && typeof eOrVal === 'object') {
    if ('target' in eOrVal && eOrVal.target) {
      return (eOrVal.target as any).value ?? '';
    }
  }
  return '';
};

export const sanitizeSectionConfig = <T = any>(data: T): T => {
  if (!data || typeof data !== 'object') return data;

  if (isSyntheticOrDomEvent(data)) {
    return ((data as any)?.target?.value ?? '') as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeSectionConfig(item)) as unknown as T;
  }

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (isSyntheticOrDomEvent(value)) {
      result[key] = (value as any)?.target?.value ?? '';
    } else if (value && typeof value === 'object') {
      result[key] = sanitizeSectionConfig(value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
};
