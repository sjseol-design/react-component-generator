import type { GeneratedComponent } from '../types';

/** localStorage에서 JSON 값을 읽는다. 값이 없거나 깨졌으면 기본값을 반환한다. */
export function readStorage<T>(key: string, fallback: T, storage: Storage = localStorage): T {
  try {
    const raw = storage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

/** localStorage에 JSON으로 저장한다. 용량 초과 등 실패는 무시한다. */
export function writeStorage(key: string, value: unknown, storage: Storage = localStorage): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 실패 시 메모리 상태만 유지한다.
  }
}

/** 저장된 컴포넌트 목록을 검증하고 createdAt을 Date로 복원한다. */
export function parseComponents(raw: unknown): GeneratedComponent[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof item.id !== 'string' ||
      typeof item.prompt !== 'string' ||
      typeof item.code !== 'string'
    ) {
      return [];
    }
    const createdAt = new Date(item.createdAt);
    if (Number.isNaN(createdAt.getTime())) return [];
    return [{ id: item.id, prompt: item.prompt, code: item.code, createdAt }];
  });
}

/** 프롬프트를 히스토리 맨 앞에 추가한다. 중복은 제거하고 최대 개수를 유지한다. */
export function addHistory(history: string[], prompt: string, max = 20): string[] {
  return [prompt, ...history.filter((p) => p !== prompt)].slice(0, max);
}
