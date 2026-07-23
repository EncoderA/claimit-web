import { useEffect, useRef } from 'react';

/**
 * Persist draft data in localStorage and restore it on load.
 *
 * @template T
 * @param {string} key
 * @param {T} value
 * @param {object} [options]
 * @param {Function} [options.serialize]
 * @param {Function} [options.deserialize]
 * @param {number} [options.debounceMs]
 * @returns {{ clearDraft: Function }}
 */
const useLocalStorageDraft = (key, value, options = {}) => {
  const {
    serialize = (v) => v,
    deserialize = (v) => v,
    debounceMs = 400,
  } = options;

  const isFirstRender = useRef(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      try {
        const serialized = serialize(value);
        localStorage.setItem(key, JSON.stringify(serialized));
      } catch (err) {
        console.warn(`[useLocalStorageDraft] Failed to write draft for key "${key}":`, err);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [key, value, serialize, debounceMs]);

  /** Remove the draft from localStorage (call after successful submission). */
  const clearDraft = () => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn(`[useLocalStorageDraft] Failed to clear draft for key "${key}":`, err);
    }
  };

  return { clearDraft };
};

/**
 * Read a draft from localStorage.
 *
 * @template T
 * @param {string} key
 * @param {Function} [deserialize]
 * @returns {T|null}
 */
export const readDraft = (key, deserialize = (v) => v) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return deserialize(JSON.parse(raw));
  } catch (err) {
    console.warn(`[readDraft] Failed to read draft for key "${key}":`, err);
    return null;
  }
};

export default useLocalStorageDraft;
