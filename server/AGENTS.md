# server/AGENTS.md

## Module Context

Bun 런타임에서 동작하는 AI 프록시 서버. 프론트엔드는 Vite proxy(`/api` -> `localhost:3002`)로 접근한다.

## Tech Stack & Constraints

- 런타임은 Bun (`Bun.serve`, `process.env`). Node 전용 API에 의존하지 마라.
- 외부 SDK 없이 `fetch`로 직접 호출한다 (`server/index.ts:69,101`). 공식 SDK를 추가하려면 먼저 합의한다.
- 모든 응답에 `CORS_HEADERS`를 붙인다 (`server/index.ts:51-55`). 새 응답 경로에서도 누락하지 마라.

## Implementation Patterns

- 새 프로바이더: `call<Provider>` 함수 추가 -> `Provider` 타입(`server/index.ts:57`) 확장 -> `ENV_KEYS`(`:59`) 확장 -> `/api/generate` 분기 추가.
- 후처리 로직은 `generator.ts`, 재시도/폴백 로직은 `fallback.ts`에 순수 함수로 둔다. `index.ts`에는 부수효과만 남긴다.
- 파일 옆에 `<name>.test.ts`를 둔다.

## Testing Strategy

- `bunx vitest run server/` 로 서버 테스트만 실행한다.
- 테스트는 jsdom 환경에서 돌지만 서버 순수 함수만 대상이다. `server/index.ts`를 import하면 포트 3002에 서버가 뜨므로 테스트에서 import하지 마라 (모듈 최상단에서 `Bun.serve` 실행, `:138`).

## Local Golden Rules

- Do: 모델 목록은 `GOOGLE_MODELS` 배열 순서가 곧 우선순위다 (`server/index.ts:4-5`). 폴백 순서를 바꾸려면 배열만 수정한다.
- Do: `withModelFallback`은 모든 모델 실패 시 마지막 에러만 던진다 (`server/fallback.ts:11-19`). 에러 원인 집계가 필요하면 이 함수를 확장하고 테스트(`fallback.test.ts`)를 갱신한다.
- Don't: 클라이언트가 보낸 `apiKey`보다 env 키를 우선하게 바꾸지 마라. 우선순위는 클라이언트 키 -> env 키다 (`server/index.ts:64-66`).
- Don't: `stripCodeFences`/`ensureRenderCall`의 정규식을 바꿀 때 기존 테스트(`generator.test.ts`)를 수정해 통과시키지 마라. 테스트가 정의한 동작을 먼저 검토한다.
