# IDEA MINE

AI 기술 조합 기반 아이디어 제너레이션 플랫폼. 픽셀 아트 광산 세계관.

## 프로젝트 구조

- `mind/` — Obsidian mind (기획 문서 전체)
  - `mind/09-Implementation/plans/` — 구현 계획서 (`YYYY-MM-DD-slug.md`)
- `docs/` — 외부 공유용 문서
- `CLAUDE.md` — 이 파일

> **Plan 저장 위치:** `docs/plans/`가 아니라 `mind/09-Implementation/plans/`에 저장할 것. writing-plans 스킬 사용 시에도 이 경로를 따른다.

## 기술 스택 (확정)

- **Frontend:** Expo (React Native) + Expo Router
- **Backend:** Supabase (Auth + DB + Storage) + Python
- **AI:** OpenAI API
- **결제:** RevenueCat (모바일) + Polar.sh (웹)
- **빌드:** EAS Build (클라우드)
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

## 소통 규칙

- 한국어 사용
- 세계관 용어 준수: 광산(The Mine), 실험실(The Lab), 금고(The Vault), 쇼케이스(The Showcase), 거래소(The Exchange), 전망대(The Observatory)
- 원석 = 아이디어, 광맥 = 키워드 조합, 광부 = 사용자, 채굴 = 아이디어 생성
