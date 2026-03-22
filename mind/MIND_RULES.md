---
title: Mind 운영 규칙
tags:
  - meta
---

# Mind 운영 규칙

> 이 문서는 IDEA MINE mind에 노트를 추가하거나 수정할 때 따라야 할 규칙을 정의한다.
> 그래프 품질 유지와 일관성 있는 노트 구조가 목적.

---

## 1. 레이어 구조

| 번호 | 레이어 | 용도 |
|------|--------|------|
| 00-Root | 대시보드, 메타 문서 | INDEX, 스프린트 현황 |
| 01-Core | 비전, 네이밍, 오디언스, 로드맵 | 프로젝트의 "왜"와 "누구를 위해" |
| 02-World-Building | 세계관, 메타포, 공간 체계 | 광산 세계관의 규칙과 구조 |
| 03-Spaces | 6개 공간별 기능 | The Mine, The Lab, The Vault, The Showcase, The Exchange, The Observatory |
| 04-Features | 공간 횡단 시스템 | 배지, 퀘스트, 레벨, 온보딩, Clean Mine Protocol |
| 05-UX-Writing | 톤앤매너, 인앱 카피 | 세계관 문구, 알림, 안내 텍스트 |
| 06-Business | 비즈니스 전략, KPI | 수익화, 티어, 그로스 |
| 07-Game-Economy | 게임 경제, 꾸미기 | 재화, 메타 루프, 장식, 밸런스 |
| 08-Design | UI/UX, 비주얼 | 픽셀 아트 스타일, 브랜드, 컴포넌트 |
| 09-Implementation | 스프린트, 계획, 체크리스트 | 실행 문서 + `plans/` 하위 폴더 |
| 10-Journal | 저널, 의사결정 로그 | 세션 기록, QUICK-DECISIONS, 회고 |
| 11-Inbox | 아이디어 수집함 | 날것의 아이디어, 영감 메모 |
| 90-Archive | 아카이브 | 폐기/교체된 노트 보관 |
| 99-Reference | 참고 자료 | 외부 레퍼런스, API 문서 링크 |

> [!warning] 새 레이어 추가 금지
> 기존 레이어에 맞지 않는 노트는 가장 가까운 레이어에 배치하거나, 이 문서를 먼저 업데이트한다.

---

## 2. 노트 구조 템플릿

```markdown
---
title: 노트 제목
tags:
  - 레이어명 (예: spaces, features, game-economy)
---

# 노트 제목

> 한 줄 요약 또는 메타데이터 (상태, 날짜 등)

---

## 본문 섹션들

(내용)

## Related

- [[Same-Layer-Note-A]] — 간단 설명
- [[Same-Layer-Note-B]] — 간단 설명

## See Also

- [[Cross-Layer-Note]] — 간단 설명 (레이어명)
```

---

## 3. 링크 규칙 (그래프 클러스터 유지)

> [!important] 핵심 원칙
> **같은 레이어 우선, 다른 레이어 최소화.** 이것이 그래프 클러스터를 만든다.

### `## Related` — 같은 레이어 내 링크

- **같은 폴더**에 있는 노트만 링크
- 2~3개 권장, 최대 4개
- 클러스터 형성의 핵심

### `## See Also` — 다른 레이어 링크

- **다른 폴더**에 있는 노트 링크
- **최대 2개** (가장 중요한 의존성만)
- 레이어명을 괄호로 표기: `(02-World-Building)`

### 본문 내 링크

- 본문에서 다른 노트를 참조할 때는 wikilink 사용 가능
- 단, 본문 내 링크는 **설명 맥락**에서만 (목록으로 나열하지 않음)
- 본문 내 cross-layer 링크는 그래프에 반영되므로 필요한 경우만 사용

### 금지 사항

- Related에 다른 레이어 노트 넣지 않기
- See Also에 3개 이상 넣지 않기
- 00-INDEX에서 직접 노트를 추가하지 않기 (Navigation 테이블만 유지)

---

## 4. Plan 파일 규칙

### 위치

`09-Implementation/plans/YYYY-MM-DD-<slug>.md`

### 링크 규칙

- `## Related Plans` — **다른 plan 파일만** wikilink
  - 형식: `[[plans/YYYY-MM-DD-slug|표시명]]`
  - 같은 기능의 design<->impl, 진화 관계(v1->redesign) 연결
- 지식 노트 참조 -> **backtick** 사용 (그래프에 안 보임)
  - 예: `mind/03-Spaces/The-Mine.md`
- **지식 노트에 wikilink 금지** -> plan 클러스터 독립 유지

---

## 5. Inbox 규칙

### 위치

`11-Inbox/YYYY-MM-DD-<slug>.md`

### 운영 원칙

- 아이디어는 일단 Inbox에 던져둔다
- 정리가 되면 해당 레이어의 노트로 승격하거나, 기존 노트에 병합한다
- 승격된 아이디어는 Inbox에서 90-Archive로 이동한다 (삭제 금지)
- Inbox 노트에는 frontmatter만 최소로 붙인다 (title, tags: inbox)

---

## 6. 네이밍 규칙

| 유형 | 형식 | 예시 |
|------|------|------|
| 지식 노트 | `Title-Case-Hyphens.md` | `The-Mine.md` |
| Plan 파일 | `YYYY-MM-DD-slug.md` | `2026-03-21-mvp-core-loop.md` |
| Inbox 메모 | `YYYY-MM-DD-slug.md` | `2026-03-21-night-mining-idea.md` |
| Journal 세션 | `YYYY-MM-DD-slug.md` | `2026-03-22-session.md` |
| 의사결정 로그 | `QUICK-DECISIONS.md` | 단일 파일, append-only |
| 스프린트 | `CURRENT-SPRINT.md` | `CURRENT-SPRINT.md` |
| 메타 문서 | `UPPER_CASE.md` | `MIND_RULES.md` |

---

## 7. 새 노트 추가 체크리스트

> [!todo] 노트 추가 시 확인 사항
> - [ ] 올바른 레이어 폴더에 배치했는가?
> - [ ] frontmatter에 `title`과 `tags`가 있는가?
> - [ ] `## Related`에 같은 레이어 노트 2~3개를 링크했는가?
> - [ ] `## See Also`에 다른 레이어 노트가 **2개 이하**인가?
> - [ ] Related에 넣은 대상 노트에서도 이 노트를 역으로 링크했는가? (양방향)
> - [ ] Plan 파일이면 `## Related Plans`만 사용하고 지식 노트 wikilink는 없는가?
> - [ ] Inbox 메모면 날짜 prefix가 붙어 있는가?

---

## 8. 그래프 색상

| 레이어 | 색상 |
|--------|------|
| 00-Root | 흰색 |
| 01-Core | 빨강 |
| 02-World-Building | 보라 |
| 03-Spaces | 초록 |
| 04-Features | 파랑 |
| 05-UX-Writing | 주황 |
| 06-Business | 노랑 |
| 07-Game-Economy | 핑크 |
| 08-Design | 청록 |
| 09-Implementation/plans | 회색 |
| 09-Implementation | 연보라 |
| 10-Journal | 연갈색 |
| 11-Inbox | 연노랑 |
