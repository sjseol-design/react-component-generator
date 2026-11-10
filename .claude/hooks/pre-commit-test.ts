// PreToolUse(Bash) 훅: `git commit` 실행 전에 전체 테스트를 돌려 실패 시 커밋을 차단한다.
const input = JSON.parse(await Bun.stdin.text())
const command: string = input?.tool_input?.command ?? ''

if (!/\bgit\s+(?:-\S+\s+)*commit\b/.test(command)) process.exit(0)

const proc = Bun.spawn(['bun', 'run', 'test'], {
  cwd: input.cwd ?? process.cwd(),
  stdout: 'pipe',
  stderr: 'pipe',
})
const [out, err, code] = await Promise.all([
  new Response(proc.stdout).text(),
  new Response(proc.stderr).text(),
  proc.exited,
])

if (code !== 0) {
  console.error('테스트가 실패하여 커밋을 차단했습니다. 테스트를 고친 뒤 다시 커밋하세요.\n')
  console.error((out + err).split('\n').slice(-40).join('\n'))
  process.exit(2)
}
