/** Generic AsyncStorage-backed list — the local persistence behind every
 * planning tool (matches the web's localStorage model). */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export interface WithId {
  id: string;
}

export function newId(): string {
  return `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

export function useLocalList<T extends WithId>(storageKey: string, seed: T[]) {
  const [items, setItems] = useState<T[]>(seed);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (alive && raw) setItems(JSON.parse(raw) as T[]);
      } catch {
        // keep seed
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [storageKey]);

  const write = useCallback(
    (next: T[]) => {
      AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch(() => {});
    },
    [storageKey],
  );

  // Functional updates persist the freshly-computed list — no ref, no stale closure.
  const add = useCallback(
    (item: T) => setItems((prev) => { const next = [item, ...prev]; write(next); return next; }),
    [write],
  );
  const update = useCallback(
    (id: string, patch: Partial<T>) =>
      setItems((prev) => { const next = prev.map((i) => (i.id === id ? { ...i, ...patch } : i)); write(next); return next; }),
    [write],
  );
  const remove = useCallback(
    (id: string) => setItems((prev) => { const next = prev.filter((i) => i.id !== id); write(next); return next; }),
    [write],
  );
  const setAll = useCallback(
    (next: T[]) => { setItems(next); write(next); },
    [write],
  );

  return { items, loaded, add, update, remove, setAll };
}
