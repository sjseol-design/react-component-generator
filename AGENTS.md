# AGENTS.md

## Operational Commands

- 패키지 매니저는 `bun` 고정. npm/yarn/pnpm 사용 금지 (`bun.lock` 사용).
- 개발 서버(API + Vite 동시): `bun run dev`
- 테스트 전체: `bun run test` (vitest, `src/**`와 `server/**` 테스트 포함 — `vite.config.ts` test.include)
- 단일 테스트: `bunx vitest run server/generator.test.ts`
- 린트: `bun run lint`
- 빌드(타입체크 포함): `bun run build`
- 변경 후 완료 보고 전에 `bun run test`, `bun run lint`, `bun run build`를 실행한다.

## Golden Rules

### Immutable

- API 키(`ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`)를 클라이언트로 내려보내지 마라. `/api/config`는 키 존재 여부(boolean)만 반환한다 (`server/index.ts:147-157`).
- `.env`는 커밋하지 마라 (`.gitignore`, `.worktreeinclude`에 명시).
- 생성 코드는 react-live `noInline` 모드로 실행된다 (`src/components/LivePreview.tsx:71`). 이 모드는 `render(<Component />)` 호출이 없으면 아무것도 그리지 않는다.

### Do's & Don'ts

- Do: AI 응답 후처리는 `server/generator.ts`의 순수 함수로 추가하고 테스트를 함께 작성한다.
- Do: Anthropic/Google 호출 경로를 수정할 때 두 경로의 에러 처리 차이를 확인한다 (아래 비대칭 참고).
- Do: 서버 포트(3002)를 바꾸면 `server/index.ts:139`와 `vite.config.ts` proxy target을 함께 바꾼다.
- Don't: 시스템 프롬프트(`server/index.ts:7-49`)의 "import 금지 / TypeScript 문법 금지 / render() 호출" 규칙을 완화하지 마라. react-live는 import와 TS 문법을 처리하지 못한다.
- Don't: `ensureRenderCall` 호출(`server/index.ts:188`)을 시스템 프롬프트에 render 규칙이 있다는 이유로 제거하지 마라.

### 코드에서 확인한 팀 고유 규칙

- Asymmetry: Google 경로에만 `MAX_TOKENS` 잘림 검사(`server/index.ts:123`)와 모델 폴백(`server/index.ts:134-136`, `GOOGLE_MODELS` `:5`)이 있고, Anthropic 경로(`:68-96`)에는 없다. 한쪽 경로의 장애 대응을 고칠 때 다른 쪽에도 필요한지 검토한다.
- Double Defense: `render()` 호출은 시스템 프롬프트(`server/index.ts:12`)와 `ensureRenderCall`(`server/generator.ts:16-23`) 두 곳에서 보장한다. 하나를 제거하면 미리보기가 빈 화면이 되는 문제가 재발한다.
- Test Boundary: 테스트 대상은 순수 함수(`server/generator.ts`, `server/fallback.ts`)와 `PromptInput`뿐이다. `Bun.serve`를 띄우는 `server/index.ts`와 `useComponentGenerator`는 테스트가 없으므로, 로직을 추가할 때는 순수 함수로 분리해 테스트 가능하게 만든다.
- Security Boundary: Google 호출은 API 키를 URL 쿼리에 넣는다 (`server/index.ts:99`). 이 URL이나 에러 메시지를 로그/응답에 노출하지 마라. 에러 메시지는 상태 코드만 담는다 (`:85`, `:112`).
- Hard Constraint: 에러 분기는 메시지 문자열의 `'503'`/`'429'` 포함 여부로 상태를 판별한다 (`server/index.ts:194,201`). 에러 메시지 형식(`API error: ${status}`)을 바꾸면 이 분기가 깨진다.

## Project Context

프롬프트로 React 컴포넌트를 생성하고 실시간 미리보기와 코드를 제공하는 웹 앱.

Tech Stack: React 19, TypeScript, Vite, Bun(API 서버), react-live, vitest, Anthropic/Gemini API.

## Standards & References

- 설치/실행/기능 설명은 `README.md` 참조 (중복 작성 금지).
- 커밋: `<type>: <한국어 요약>` (type: feat/fix/refactor/chore). 기본 브랜치에 직접 커밋하지 않는다.
- 사용자 대상 에러 메시지와 코드 주석은 한국어로 작성한다 (`server/fallback.ts`, `server/generator.ts` 참고).
- Maintenance Policy: 이 문서의 규칙과 코드가 어긋나면 수정을 제안하라. 인용한 라인 번호가 틀어졌으면 갱신한다.

## Context Map

- **[API 서버 수정 (Bun)](./server/AGENTS.md)** — 프로바이더 호출, 프롬프트, 응답 후처리 수정 시.
- **[프론트엔드 수정 (React)](./src/AGENTS.md)** — 컴포넌트, 훅, 미리보기, 테스트 작성 시.
