---
title: Implementation Plan
tags:
  - implementation
  - planning
  - v2
---

# Implementation Plan

> v2 구현 속도는 유지하면서, 스키마/라우팅/UX 드리프트를 막는 실행 계약 문서.

---

## 문서 목적

이 문서는 "무엇을 만들까"보다 **"어떻게 일할까"**를 정한다.

- Gate를 통과하기 전까지 범위를 함부로 넓히지 않는다
- DB/API/타입/UI 계약이 어긋나지 않게 묶어서 움직인다
- 공간의 분위기와 인터랙션 품질을 기능과 동등한 작업으로 다룬다
- 완료 판정은 느낌이 아니라 검증과 증거로 남긴다
- `CURRENT-SPRINT`, `Phase-Flow`, `plans/`가 서로 따로 놀지 않게 한다

> [!important]
> 이 문서는 살아있는 운영 문서다. 현재 Phase나 Sprint의 기준이 바뀌면 관련 문서와 함께 갱신한다.

---

## 문서 역할 분리

| 문서 | 역할 | 갱신 시점 |
|------|------|----------|
| [[V2-Roadmap]] | 상위 방향, Gate, 큰 순서 | 방향 변경 시 |
| [[Implementation-Plan]] | 실행 계약, hard gate, 운영 규칙 | 운영 규칙 변경 시 |
| [[Phase-Flow]] | Phase/Sprint 흐름, 대표 Task ID, 진입/완료 기준 | Phase 진입/완료 시 |
| [[CURRENT-SPRINT]] | 지금 실제로 진행 중인 작업 현황 | 작업 시작/상태 변경 시 |
| `mind/09-Implementation/plans/` | 개별 작업의 상세 계획, 세부 체크리스트 | 새 작업 계획 수립 시 |

---

## Hard Gates

> [!important]
> 아래 규칙은 모든 Phase에서 강제한다.

1. **DB/API/타입 계약은 함께 바꾼다.**
   스키마, 백엔드 응답, 프론트 타입 중 하나가 바뀌면 같은 작업 묶음에서 함께 반영한다.

2. **상태 변화/생성은 backend API를 통과시킨다.**
   direct read는 허용하더라도, 쓰기/생성/권한 판정/비용 발생 흐름은 백엔드가 단일 진입점이어야 한다.

3. **권한과 과금 경계는 클라이언트만으로 믿지 않는다.**
   RLS, admin role, tier gating, Pro 전용 출력은 서버나 DB 정책으로 다시 막는다.

4. **`done`에는 검증 명령과 통과 조건이 있어야 한다.**
   "확인함"만으로 끝내지 않는다. 실행한 명령 또는 확인 방법이 있어야 한다.

5. **각 Sprint는 기능 트랙과 디자인 트랙을 함께 완료한다.**
   화면이 동작해도 공간감, 위계, 상호작용 톤이 아직 비어 있으면 완료로 보지 않는다.

6. **화면 구조나 Phase 범위가 바뀌면 관련 문서를 같이 갱신한다.**
   최소한 `CURRENT-SPRINT`, `Phase-Flow`, 관련 space/feature note 중 하나는 같이 맞춘다.

7. **Gate 실패 시 다음 Phase로 가지 않는다.**
   다음을 더하는 대신, 현재 루프의 품질/직관성/가치를 먼저 개선한다.

---

## Task ID 규칙

대표 Task ID는 Sprint 단위로 끊어 관리한다.

형식:

```text
S{Sprint}-{Area}-{Seq}
```

예시:

- `S0-DS-01` — 디자인 시스템 기초
- `S0-DIR-01` — 공간 디자인 방향 고정
- `S0-AUTH-01` — Supabase Auth 연결
- `S1-MINE-02` — Mine 결과 화면과 선택 흐름
- `S1-MINEUI-01` — The Mine 공간감과 시각 위계
- `S2-LAB-01` — Overview/Appraisal/Full Overview 연결

원칙:

- `Phase-Flow`에는 **대표 Task ID만** 둔다
- 세부 태스크와 체크리스트는 `CURRENT-SPRINT`나 `plans/`에서 관리한다
- 기존 ID 의미를 바꾸지 않는다. 범위가 크게 달라지면 새 ID를 발급한다

---

## 상태 규칙

대표 상태값은 아래 다섯 개만 쓴다.

| 상태 | 의미 |
|------|------|
| `todo` | 아직 시작 전 |
| `doing` | 현재 진행 중 |
| `review` | 동작은 했지만 검증/정리 대기 |
| `blocked` | 의존성/결정 부족으로 멈춤 |
| `done` | 검증과 증거까지 완료 |

`done` 최소 규칙:

- 체크 표시 완료
- 검증 명령 또는 확인 방법 기재
- 통과 조건 충족
- 증거 1개 이상 남김

증거 예시:

- 실행 로그 요약
- 테스트 결과
- 브라우저 확인 메모
- 스크린샷 경로
- 관련 note 링크

---

## 검증과 증거

작업 종류에 따라 검증 방식은 달라도 된다. 다만 **없으면 안 된다.**

예시:

- 웹 UI 작업
  - `npm run dev`
  - 브라우저에서 해당 경로 확인
  - 공간별 위계/분위기/상호작용 톤 확인
  - 필요 시 Playwright 스모크 체크
- 백엔드/API 작업
  - `python -m pytest ...`
  - 라우트 호출 결과 확인
- DB 작업
  - `npx supabase db reset --linked --no-seed --yes`
  - contract test 통과
- 문서 작업
  - 관련 문서 간 링크/용어 일치 확인
  - active docs 검색으로 잔여 표현 점검

---

## Phase 운영 원칙

### Phase 0~1

- 제품의 가치와 루프 직관성을 먼저 본다
- 디자인은 장식이 아니라 가치 전달 장치다
- "멋있어 보이는 확장"보다 로그인, 광맥, 금고, 실험실 루프 완주가 우선이다

### Phase 1.5

- Gate 1 통과 후에만 프리미엄 모션, 리텐션 장치, 업그레이드 맥락을 강화한다

### Phase 2

- 유료화는 **가치가 확인된 뒤** 붙인다
- Pink Diamond 같은 경제 레이어는 core utility를 가리지 않게 뒤에 둔다

### Phase 3+

- Showcase / Exchange / Observatory 같은 확장 공간은 Gate 3 이후에만 연다
- 모바일 전환도 웹 검증 뒤에 판단한다

---

## Current Sprint 운영

현재 실행 기준은 [[CURRENT-SPRINT]]다.

운영 방식:

1. 새 작업 묶음을 시작할 때 `CURRENT-SPRINT`에 대표 Task ID를 반영한다
2. 범위가 커지면 `plans/`에 상세 계획 문서를 만든다
3. Sprint가 끝나면 `Phase-Flow`의 상태를 갱신한다
4. Gate를 통과하거나 실패하면 `V2-Roadmap`과 관련 note를 다시 맞춘다

---

## 현재 상태

> [!info]
> 현재 기준: **Phase 0 / Sprint 0 진행 중**

활성 대표 Task ID:

- `S0-DIR-01` — Mine / Vault / Lab / Basecamp 디자인 방향 고정
- `S0-DS-01` — 디자인 시스템 기초
- `S0-AUTH-01` — Supabase Auth 연결
- `S0-API-01` — 백엔드 API 클라이언트 계층
- `S0-SHELL-01` — Mine / Vault / Lab / Basecamp App Shell

---

## Related

- [[Phase-Flow]] — Phase/Sprint 운영 지도
- [[Phase-1-MVP]] — v2 MVP 범위
- [[Tech-Stack]] — 아키텍처 원칙

## See Also

- [[V2-Roadmap]] — Gate 기준과 상위 순서
- [[CURRENT-SPRINT]] — 현재 진행 현황
