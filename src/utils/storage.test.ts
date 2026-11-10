import { describe, it, expect, beforeEach } from 'vitest';
import { readStorage, writeStorage, parseComponents, addHistory } from './storage';

beforeEach(() => {
  localStorage.clear();
});

describe('readStorage', () => {
  it('저장된 값이 없으면 기본값을 반환한다', () => {
    expect(readStorage('k', 'fallback')).toBe('fallback');
  });

  it('저장된 JSON 값을 파싱해 반환한다', () => {
    localStorage.setItem('k', JSON.stringify({ a: 1 }));
    expect(readStorage('k', null)).toEqual({ a: 1 });
  });

  it('깨진 JSON이면 기본값을 반환한다', () => {
    localStorage.setItem('k', '{broken');
    expect(readStorage('k', 'fallback')).toBe('fallback');
  });
});

describe('writeStorage', () => {
  it('값을 JSON으로 저장한다', () => {
    writeStorage('k', ['a']);
    expect(localStorage.getItem('k')).toBe('["a"]');
  });

  it('저장소가 예외를 던져도 에러를 전파하지 않는다', () => {
    const full = {
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    } as unknown as Storage;
    expect(() => writeStorage('k', 1, full)).not.toThrow();
  });
});

describe('parseComponents', () => {
  const valid = { id: '1', prompt: 'p', code: 'c', createdAt: '2026-01-02T03:04:05.000Z' };

  it('createdAt 문자열을 Date로 복원한다', () => {
    const [component] = parseComponents([valid]);
    expect(component.createdAt).toBeInstanceOf(Date);
    expect(component.createdAt.toISOString()).toBe(valid.createdAt);
  });

  it('배열이 아니면 빈 배열을 반환한다', () => {
    expect(parseComponents({ foo: 1 })).toEqual([]);
  });

  it('형식이 맞지 않는 항목은 걸러낸다', () => {
    const result = parseComponents([valid, { id: '2' }, null, { ...valid, createdAt: 'not-a-date' }]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });
});

describe('addHistory', () => {
  it('새 프롬프트를 맨 앞에 추가한다', () => {
    expect(addHistory(['a'], 'b')).toEqual(['b', 'a']);
  });

  it('중복 프롬프트는 맨 앞으로 옮기고 중복 저장하지 않는다', () => {
    expect(addHistory(['a', 'b', 'c'], 'b')).toEqual(['b', 'a', 'c']);
  });

  it('최대 개수를 넘으면 오래된 항목을 버린다', () => {
    expect(addHistory(['a', 'b'], 'c', 2)).toEqual(['c', 'a']);
  });
});
