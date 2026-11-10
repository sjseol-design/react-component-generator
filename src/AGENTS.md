# src/AGENTS.md

## Module Context

React 19 + Vite 프론트엔드. `/api/generate`, `/api/config`를 호출해 생성된 코드를 react-live로 미리보기한다.

## Tech Stack & Constraints

- 스타일은 `src/App.css`, `src/index.css`. 생성 컴포넌트와 달리 앱 자체는 CSS 파일을 사용한다.
- API 호출은 상대 경로 `/api/...`만 사용한다 (`src/hooks/useComponentGenerator.ts:23`). 서버 URL을 하드코딩하지 마라. Vite proxy가 전달한다.
- 테스트: vitest + Testing Library, jsdom. 각 테스트 후 `cleanup`이 자동 실행된다 (`src/test/setup.ts`).

## Implementation Patterns

- 서버 통신과 상태는 `src/hooks/`의 훅에 둔다. 컴포넌트는 표시와 이벤트에 집중한다.
- 공용 타입은 `src/types/index.ts`에 둔다.
- 컴포넌트 테스트는 `<Component>.test.tsx`를 같은 폴더에 둔다 (`PromptInput.test.tsx` 참고).

## Testing Strategy

- `bunx vitest run src/` 로 프론트엔드 테스트만 실행한다.
- 사용자 상호작용은 `@testing-library/user-event`를 사용한다.

## Local Golden Rules

- Hard Constraint: 미리보기는 `<LiveProvider noInline>`이다 (`src/components/LivePreview.tsx:71`). `noInline`을 제거하면 서버가 생성하는 `render(<X />)` 형식 코드가 동작하지 않는다.
- Don't: `Provider` 타입은 `src/types/index.ts:1`과 `server/index.ts:57`에 각각 정의되어 있다. 값을 추가할 때 두 곳을 함께 수정한다.
- Test Boundary: 현재 `PromptInput`만 테스트가 있다. 훅/미리보기 변경 시 해당 동작 테스트를 추가하는 것을 우선 제안한다.
