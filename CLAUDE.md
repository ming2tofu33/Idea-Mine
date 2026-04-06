# IDEA MINE

AI 기술 조합 기반 아이디어 탐사 플랫폼. 웹 우선 + 프리미엄 스페이스 UI (Cinematic Observatory).

## 프로젝트 구조

- `apps/web/` — Next.js 웹 프론트엔드 (v2 주력)
- `apps/mobile/` — Expo 모바일 앱 (v1 코드, 웹 검증 후 확장 예정)
- `backend/` — Python 백엔드 (FastAPI + OpenAI)
- `supabase/` — Supabase 마이그레이션, 시드
- `mind/` — Obsidian mind (기획 문서 전체)
  - `mind/09-Implementation/plans/` — 설계 문서, 구현 계획, 스펙 파일
  - `mind/10-Journal/` — 세션 저널, 의사결정 로그
- `docs/` — 외부 공유용 문서 (v2 방향 문서 포함)
- `CLAUDE.md` — 이 파일

- 새 설계/계획 문서는 `mind/09-Implementation/plans/YYYY-MM-DD-<topic>.md`에 작성.
- 설계/계획 문서는 `mind/09-Implementation/plans/`에 작성. `docs/plans/`에 저장하지 않는다.
- writing-plans 스킬 사용 시에도 반드시 `mind/09-Implementation/plans/`에 저장할 것.

## v2 방향 문서

- `docs/Project-Overview-v2.md` — 제품 방향, 전략, 원칙, MVP 범위
- `docs/Premium-Space-UI-Style-Guide.md` — 디자인 시스템, 컬러, CTA, 모션 규칙
- `docs/Idea-Mine-V2-V3-Safety-Rails.ko.md` — DB/API/확장 안전장치

## 기술 스택 (v2)

- **Frontend (Web):** React + Next.js + TypeScript
- **Motion:** Framer Motion
- **Graphics:** CSS + Canvas (선택적으로 React Three Fiber)
- **Backend:** Supabase (Auth + DB + Storage) + Python (FastAPI)
- **AI:** OpenAI API — gpt-5-nano(채굴/컨셉), gpt-5-mini(개요/감정), gpt-5(풀 개요)
- **결제:** Polar.sh (웹), RevenueCat (모바일, 나중에)
- **개발 환경:** Windows 11, Claude Code

## Mind 규칙

`mind/MIND_RULES.md`를 반드시 따를 것. 핵심:

- **레이어 구조:** 00-Root ~ 99-Reference (새 레이어 추가 금지)
- **링크:** Related = 같은 레이어 2~3개, See Also = 다른 레이어 최대 2개
- **네이밍:** 지식 노트 `Title-Case-Hyphens.md`, Plan `YYYY-MM-DD-slug.md`, Inbox `YYYY-MM-DD-slug.md`
- **템플릿:** frontmatter(title, tags) + 한 줄 요약 + 본문 + Related + See Also
- **Plan 파일:** 지식 노트에 wikilink 금지, backtick으로 참조
- **양방향 링크:** Related 대상 노트에서도 역링크 필수
- **삭제 금지:** mind/ 내 파일은 절대 삭제하지 않는다. 불필요한 파일은 `mind/90-Archive/`로 이동.

## Git 규칙

### 커밋 컨벤션

Conventional Commits 사용:

- `feat:` 새 기능/노트 추가
- `fix:` 버그 수정, 오류 정정
- `chore:` 설정, 정리, 리팩터
- `docs:` 문서 수정 (mind/ 노트 보강 등)
- `style:` 포맷, 디자인 에셋
- `refactor:` 코드 구조 변경 (기능 변화 없음)

### 브랜치 전략

- `main` — 기본 작업 브랜치 (1인 개발)
- `feature/*` — 큰 기능 단위 (예: `feature/mine-screen`, `feature/supabase-auth`)
- 작은 변경은 main에 직접 커밋

### 커밋 단위

- mind/ 노트 변경: 관련 변경을 묶어서 1커밋 (예: "docs: 용어 체계 vault→mind 전환")
- 코드 변경: 기능 단위로 작게 나눠서 커밋
- mind/ 변경과 코드 변경을 같은 커밋에 섞지 않기

## 소통 규칙

- 한국어 사용
- 세계관 용어 준수: 광산(The Mine), 실험실(The Lab), 금고(The Vault), 쇼케이스(The Showcase), 거래소(The Exchange), 전망대(The Observatory)
- 원석 = 아이디어, 광맥 = 키워드 조합, 광부 = 사용자, 채굴 = 아이디어 생성
