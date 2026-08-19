/**
 * Generic AsyncStorage-backed list — the local persistence behind every
 * planning tool (matches the web's localStorage model).
 *
 * ── The seed raced the language ───────────────────────────────────────────
 *
 * `useState(seed)` captures the seed on the FIRST render and never looks at it
 * again. `useLocaleStore.hydrate()` is async, so on that first render the
 * locale is still the default `'en'` no matter what the customer chose —
 * meaning an Urdu customer's budget, checklist, guest list and timeline were
 * all seeded in English microseconds before their language arrived, and stayed
 * that way. The chrome around them then rendered in Urdu, which is how you get
 * an Urdu screen wrapped around an English spreadsheet.
 *
 * `seedVersion` fixes it: while nothing has come back from storage and the
 * customer has not touched the list, a change of version re-seeds. Once either
 * of those is false the seed is ignored forever — a customer's own rows are
 * never rewritten by a language change.
 *
 * It is a render-phase reset, deliberately, not an effect. An effect keyed on
 * the seed ARRAY would re-fire on every render for any caller who forgot to
 * memoise, and "Maximum update depth exceeded" is the single most common crash
 * in this repo's history. A primitive version string cannot do that.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export interface WithId {
  id: string;
}

export function newId(): string {
  return `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

export function useLocalList<T extends WithId>(
  storageKey: string,
  seed: T[],
  /**
   * Changes when the SEED's content should change — in practice the interface
   * language. Keep it a primitive; see the note above on why this is not the
   * seed array itself.
   */
  seedVersion = '',
) {
  const [items, setItems] = useState<T[]>(seed);
  const [loaded, setLoaded] = useState(false);
  /** True once storage supplied the list, or the customer edited it. Either
   *  way the seed has been superseded and must never be applied again. */
  const [owned, setOwned] = useState(false);
  const [version, setVersion] = useState(seedVersion);

  // Render-phase reset. Only reachable while the list is still the untouched
  // seed, so it cannot discard anyone's work.
  if (seedVersion !== version) {
    setVersion(seedVersion);
    if (!owned) setItems(seed);
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (alive && raw) {
          setItems(JSON.parse(raw) as T[]);
          setOwned(true);
        }
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
      // The first write is what makes this list the customer's rather than the
      // seed's, so a later language change leaves it alone.
      setOwned(true);
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
