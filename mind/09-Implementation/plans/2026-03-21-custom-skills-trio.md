# Custom Skills Trio Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Idea Mine 프로젝트 전용 커스텀 스킬 3개 생성 — mind-architect, decision-logger, world-consistency-guard

**Architecture:** 각 스킬은 `.claude/skills/<name>/SKILL.md` + 필요 시 `references/` 레퍼런스 파일로 구성. mind-architect는 0to1log 버전을 Idea Mine의 MIND_RULES.md에 맞게 커스터마이징. decision-logger와 world-consistency-guard는 신규 생성.

**Tech Stack:** Claude Code Skills (Markdown SKILL.md), Obsidian mind conventions

---

## Task 1: mind-architect SKILL.md

**Files:**
- Create: `.claude/skills/mind-architect/SKILL.md`
- Create: `.claude/skills/mind-architect/references/LAYER_CATALOG.md`
- Create: `.claude/skills/mind-architect/references/TERMS.md`

**Scope:**
0to1log mind-architect를 기반으로 하되, Idea Mine 고유 사항 반영:

- 12개 레이어 (00-Root ~ 99-Reference) — `mind/MIND_RULES.md` 기준
- MOC 대신 기존 구조 유지 (00-INDEX.md가 허브, 각 레이어에 _MOC 없음)
- Related/See Also 링크 규칙 (같은 레이어 2~3개, 다른 레이어 최대 2개)
- 양방향 링크 필수
- Plan 파일 링크 규칙 (wikilink 금지, backtick 참조)
- Inbox 규칙 (YYYY-MM-DD-slug.md, 승격/아카이브 흐름)
- 네이밍: Title-Case-Hyphens.md, Plan/Inbox는 날짜 prefix

**SKILL.md 구조:**
```
- Safety Rules (삭제 금지, 벌크 승인 필수, .obsidian 터치 금지)
- Mode: Audit (구조 스캔, 네이밍 이슈, 고아 노트, 깨진 링크)
- Mode: Add Note (체크리스트 기반 노트 추가, 양방향 링크 자동 검증)
- Mode: Move/Rename (마이그레이션 테이블, 링크 수정)
- Mode: Inbox Triage (승격/병합/아카이브 플로우)
- Link Validation (Related/See Also 규칙 검증)
- Graph Color Reference
```

**references/LAYER_CATALOG.md:**
Idea Mine 전용 12개 레이어 카탈로그 (MIND_RULES.md 기반, 각 레이어별 용도/권장 노트 수)

**references/TERMS.md:**
세계관 용어 사전 (world-consistency-guard에서도 참조)

**Step 1:** `references/` 디렉토리 생성
**Step 2:** `references/TERMS.md` 작성 (세계관 용어 매핑 테이블)
**Step 3:** `references/LAYER_CATALOG.md` 작성 (12개 레이어 정의)
**Step 4:** `SKILL.md` 작성
**Step 5:** 스킬 동작 검증 — Audit 모드로 현재 mind 스캔

---

## Task 2: decision-logger SKILL.md

**Files:**
- Create: `.claude/skills/decision-logger/SKILL.md`

**Scope:**
세션 중 내려진 기술/기획/디자인 결정을 `mind/99-Reference/QUICK-DECISIONS.md`에 정해진 포맷으로 자동 추가하는 스킬.

**트리거:**
- `/log-decision` 명시적 호출
- 세션 중 "~로 결정", "~로 가자", "~로 확정" 등 결정 언어 감지 시 제안

**포맷:**
```markdown
### {결정 제목}

- **결정:** {what}
- **이유:** {why}
- **대안 기각:** {alternatives considered} (있는 경우)
```

**규칙:**
- 날짜 헤더(`## YYYY-MM-DD`)가 이미 있으면 그 아래에 추가, 없으면 새로 생성
- 기존 내용 절대 수정/삭제 안 함 (append-only)
- 작성 전 사용자에게 내용 확인 요청

**Step 1:** `SKILL.md` 작성
**Step 2:** 현재 QUICK-DECISIONS.md에 테스트 결정 추가해보며 검증

---

## Task 3: world-consistency-guard SKILL.md

**Files:**
- Create: `.claude/skills/world-consistency-guard/SKILL.md`
- Shared: `.claude/skills/mind-architect/references/TERMS.md` (Task 1에서 생성)

**Scope:**
노트 작성/수정 시 세계관 용어가 일관되게 사용되는지 검증하는 스킬.

**핵심 용어 매핑 (TERMS.md에서 참조):**

| 세계관 용어 | 의미 | 잘못된 표현 예시 |
|------------|------|-----------------|
| 광산 / The Mine | 아이디어 생성 공간 | "생성기", "메인 화면" |
| 원석 | 개별 아이디어 | "아이디어 카드", "결과물" |
| 광맥 | 키워드 조합 (Tech+Who+Domain+Value+Money) | "카테고리", "조합" |
| 금고 / The Vault | 아이디어 저장소 | "보관함", "라이브러리" |
| 실험실 / The Lab | 아이디어 발전/개요서 생성 | "에디터", "작업실" |
| 채굴 | 아이디어 생성 행위 | "생성", "만들기" |
| 광부 | 사용자 | "유저", "사용자" (문맥에 따라) |
| 반입 | 원석을 금고에 저장 | "저장", "보관" |
| 감정 | AI 분석/평가 | "분석", "리뷰" |

**모드:**

1. **Check mode**: 지정된 노트(들)의 용어 일관성 스캔, 불일치 리포트
2. **Suggest mode**: 불일치 발견 시 교체 제안 (자동 수정 안 함)
3. **Passive mode**: 노트 작성 중 Claude가 자연스럽게 세계관 용어를 사용하도록 가이드

**Step 1:** `SKILL.md` 작성
**Step 2:** 기존 볼트 노트에 Check mode 실행하여 검증

---

## Execution Order

1. Task 1 Step 1~3 (references 먼저 — Task 3에서도 공유)
2. Task 1 Step 4 (mind-architect SKILL.md)
3. Task 2 (decision-logger)
4. Task 3 (world-consistency-guard)
5. Task 1 Step 5 + Task 2 Step 2 + Task 3 Step 2 (통합 검증)
