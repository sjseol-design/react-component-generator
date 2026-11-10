---
name: create-pr
description: |
  현재 브랜치의 변경사항을 분석해 템플릿에 맞춘 Pull Request를 생성한다.
  "PR 생성해줘", "PR 만들어줘", "풀 리퀘스트 올려줘", "create pr", "open a pull request", "/create-pr" 같은 요청에 활성화한다.
  이 프로젝트(react-component-generator)는 한국어 템플릿, 그 외 프로젝트는 영어 템플릿을 사용한다.
context: fork
---

# create-pr: 템플릿 기반 PR 생성

현재 브랜치의 커밋과 diff를 분석해 PR 제목과 본문을 작성하고 `gh`로 PR을 생성한다. 이 스킬은 `context: fork`로 서브 에이전트에서 실행되므로, 필요한 정보는 모두 직접 조회한다.

## 템플릿 선택

| 조건 | 템플릿 |
| --- | --- |
| 현재 프로젝트 (`package.json`의 `name`이 `react-component-generator`이거나 `origin` 원격 저장소 이름이 `react-component-generator`) | `references/pr-template.ko.md` (한국어) |
| 그 외 모든 프로젝트 | `references/pr-template.en.md` (영어) |

판별 명령:

```bash
git remote get-url origin
grep '"name"' package.json
```

- 둘 중 하나라도 일치하면 한국어, 둘 다 불일치하거나 확인할 수 없으면 영어를 쓴다.
- 템플릿 경로는 이 스킬 디렉토리 기준 상대 경로다. 제목과 본문 전체를 선택한 템플릿의 언어로 작성한다.

## 워크플로우

### Step 1: 사전 점검

```bash
git status --short
git branch --show-current
git remote -v
gh auth status
```

- `gh` 인증이 안 되어 있거나 `origin` 원격이 없으면 그 사실만 알리고 종료한다.
- 현재 브랜치가 기본 브랜치(main/master)면 PR을 만들 수 없다. 사실을 알리고 종료한다.
- 커밋하지 않은 변경이 있으면 PR에 포함되지 않는다고 알리고, 커밋은 임의로 만들지 않는다.

### Step 2: 변경사항 분석

```bash
git fetch origin
git log --oneline origin/<base>..HEAD
git diff origin/<base>...HEAD --stat
git diff origin/<base>...HEAD
```

- `<base>`는 `gh repo view --json defaultBranchRef -q .defaultBranchRef.name`로 얻은 기본 브랜치다.
- 기준 브랜치 대비 커밋이 없으면 알리고 종료한다.
- 커밋 메시지와 diff를 읽어 변경의 목적(무엇을, 왜)을 파악한다. 파일 목록을 그대로 나열하지 않는다.

### Step 3: 제목과 본문 작성

- 제목: 70자 이내, 마침표 없음. 프로젝트의 커밋 컨벤션(`feat/fix/refactor/chore: 요약`)을 따른다.
- 본문: 선택한 템플릿의 섹션을 모두 채운다. 해당 없는 섹션은 삭제하지 말고 "없음"(영어는 "None")으로 적는다.
- 테스트 체크리스트는 실제로 실행해 확인한 항목만 체크한다. 실행하지 않았으면 체크하지 않는다.
- 세션 환경이 PR 본문 끝에 붙일 attribution을 지정했다면 마지막에 그대로 추가한다. 지정이 없으면 임의로 붙이지 않는다.

### Step 4: push 및 PR 생성

```bash
git push -u origin <현재 브랜치>
gh pr create --base <base> --title "<제목>" --body-file <본문 파일>
```

- 본문은 임시 파일 또는 heredoc으로 전달한다. 임시 파일은 저장소 밖에 만들고 생성 후 삭제한다.
- 이미 같은 브랜치의 열린 PR이 있으면 새로 만들지 않고 URL을 알린다 (`gh pr view`로 확인).
- 사용자가 draft, 리뷰어, 라벨을 요청했으면 `--draft`, `--reviewer`, `--label`로 반영한다.

### Step 5: 결과 보고

생성된 PR URL, 사용한 템플릿 언어, 기준 브랜치를 알린다.

## 하지 않는 것

- 기본 브랜치로 직접 push
- force push (`--force`)
- 훅 우회 (`--no-verify`)
- 실행하지 않은 테스트를 통과했다고 기재
- 비밀 정보가 담긴 내용을 PR 본문에 포함
