import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePersistentState } from './usePersistentState';

beforeEach(() => {
  localStorage.clear();
});

describe('usePersistentState', () => {
  it('저장된 값이 없으면 초기값을 사용한다', () => {
    const { result } = renderHook(() => usePersistentState('k', 'init'));
    expect(result.current[0]).toBe('init');
  });

  it('저장된 값이 있으면 초기값 대신 복원한다', () => {
    localStorage.setItem('k', JSON.stringify('saved'));
    const { result } = renderHook(() => usePersistentState('k', 'init'));
    expect(result.current[0]).toBe('saved');
  });

  it('상태가 바뀌면 localStorage에 저장한다', () => {
    const { result } = renderHook(() => usePersistentState('k', 'init'));
    act(() => result.current[1]('next'));
    expect(localStorage.getItem('k')).toBe('"next"');
  });

  it('parse가 있으면 복원 시 변환한다', () => {
    localStorage.setItem('k', JSON.stringify(['x']));
    const { result } = renderHook(() =>
      usePersistentState<string[]>('k', [], (raw) => (raw as string[]).map((s) => s.toUpperCase())),
    );
    expect(result.current[0]).toEqual(['X']);
  });
});
