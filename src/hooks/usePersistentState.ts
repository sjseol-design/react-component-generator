import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { readStorage, writeStorage } from '../utils/storage';

/** useState와 같지만 값을 localStorage에 저장하고, 첫 렌더에서 복원한다. */
export function usePersistentState<T>(
  key: string,
  initial: T,
  parse?: (raw: unknown) => T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const stored = readStorage<unknown>(key, undefined);
    if (stored === undefined) return initial;
    return parse ? parse(stored) : (stored as T);
  });

  useEffect(() => {
    writeStorage(key, value);
  }, [key, value]);

  return [value, setValue];
}
