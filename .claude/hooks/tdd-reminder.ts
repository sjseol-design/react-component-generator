// PreToolUse(Edit|Write|MultiEdit) 훅: 프로덕션 코드를 쓰기 전에 TDD 규칙(.claude/rules/tdd.md)을 상기시킨다.
const input = JSON.parse(await Bun.stdin.text())
const filePath: string = (input?.tool_input?.file_path ?? '').replaceAll('\\', '/')

const isSourceCode = /\.(ts|tsx|js|jsx)$/.test(filePath) && /\/(src|server)\//.test(filePath)
const isTestFile = /\.test\.(ts|tsx|js|jsx)$/.test(filePath) || /\/src\/test\//.test(filePath)

if (!isSourceCode || isTestFile) process.exit(0)

const reminder = `[TDD 리마인더] 프로덕션 코드(${filePath})를 수정하려 합니다. .claude/rules/tdd.md는 Rigid 규칙입니다.
1. 이 변경이 비즈니스 로직/API/유틸/버그 수정이면, 먼저 실패하는 테스트를 작성하고 실제로 실행해 "기능 미구현" 이유로 실패하는 것을 확인했는지 점검하세요 (RED).
2. 테스트 없이 코드를 먼저 작성했다면 그 코드를 삭제하고 RED부터 다시 시작하세요. 주석 처리/보관도 금지입니다.
3. GREEN은 테스트가 요구하는 최소한의 코드만 작성하고(YAGNI), 신규·기존 테스트 통과를 실행해 확인하세요.
4. REFACTOR에서는 새 동작을 추가하지 마세요. 새 동작이 필요하면 RED로 돌아갑니다.
순수 UI·타입·설정 변경이라면 TDD 대상이 아니므로 그대로 진행해도 됩니다.`

console.log(
  JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: reminder },
  }),
)
