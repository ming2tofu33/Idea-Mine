---
title: Phase 1 MVP
tags:
  - implementation
  - v2
---

# Phase 1 MVP

> v2 Lean MVP. 웹에서 핵심 루프 `Mine -> Vault -> Lab`를 검증한다. Gate를 통과하기 전까지는 범위를 넓히지 않는다.
> 전체 순서와 Gate 기준은 [[V2-Roadmap]]을 따른다.

---

## 검증 목표

**단 하나의 질문:** 사람들이 이 조합형 아이디어 탐사와 정제 흐름을 유용하다고 느끼는가?

---

## 이미 준비된 기반

Phase 1에서 새로 만드는 건 주로 **웹 프론트엔드와 사용자 경험**이다.

- FastAPI 백엔드 라우터/서비스
- Supabase v2 DB 마이그레이션 체인 (`00001~00010`)
- RLS / 인덱스 / `ai_usage_logs`
- LLM 프롬프트와 생성 파이프라인
- 기본 Auth / 프로필 구조

> [!important]
> Phase 1에서 디자인은 나중 폴리시가 아니다. Mine / Vault / Lab의 분위기와 상호작용 톤은 기능과 동등한 작업 범위다.

---

## 포함 범위

### 화면

- **The Mine** — 오늘의 광맥 3개, 리롤, 채굴 진입
- **Mine Result** — 아이디어 10개 확인, 선택, 금고 반입
- **The Vault** — 저장된 아이디어 목록/상세
- **The Lab** — Overview, Appraisal, Full Overview
- **Basecamp** — 프로필/설정 허브

### 기능

- 로그인/세션 유지
- 오늘의 광맥 3개 조회 + 리롤
- 아이디어 10개 생성
- 금고 반입 + 저장 목록/상세
- Overview 생성
- Appraisal 생성
- Full Overview 생성
- 기본 Analytics 이벤트 트래킹

### 디자인 트랙

- Mine / Vault / Lab / Basecamp 공간별 분위기 언어
- 컬러 토큰 (v2 Premium Space 팔레트)
- 기본 컴포넌트 (Button, Card, Panel)
- 타이포그래피 계층 (Display / Body)
- CTA 계층 (Signal Accent 패턴)
- 화면별 정보 위계와 상태 전환

---

## Phase 1에서 의도적으로 빼는 것

| 뺀 것 | 이유 | 복원 시점 |
|-------|------|----------|
| Vault 비교/분기 | 파워 유저 기능 | Phase 2 |
| Vault 핀/컬렉션/정리 고도화 | 저장 자산이 쌓인 뒤 의미 있음 | Phase 1.5~2 |
| 방향 정리 | Lab 확장 단계 | Phase 2 |
| MVP 청사진 | 더 깊은 실행 문서 | Phase 2 |
| Phase 로드맵 생성 | 전략 문서 레이어 | Phase 3+ |
| 커스텀 키워드 입력 / 수동 조합 | 핵심 루프 검증 후 | Phase 1.5 |
| 저장 광맥 / 시즌 광맥 운영 | 품질/운영 레이어 | Phase 2 |
| 결제 / 3티어 업그레이드 UX | 핵심 루프 검증 후 | Phase 1.5 |
| 게임 경제 전면 도입 | 핵심 가치보다 뒤 | Phase 2+ |
| Showcase / Exchange / Observatory | 확장 공간 | Phase 3+ |
| 모바일 앱 | 웹 검증 후 판단 | 별도 트랙 |

---

## 메뉴 구조

1. **The Mine:** 광맥 선택, 채굴, 첫 선별
2. **The Vault:** 저장, 재방문, 정리
3. **The Lab:** 문서화, 평가, 확장
4. **Basecamp:** 프로필, 설정, 계정 상태

---

## Gate 1 기준

| 항목 | 목표 |
|------|------|
| 핵심 루프 완주율 | 채굴 -> 금고 반입 -> 개요 생성 완주율 60%+ |
| 재사용 의향 | 테스터 5명 중 3명+가 "다시 써보고 싶다" |
| 결과물 유용성 | 생성된 개요/평가가 유용하다 3/5+ |
| 공간 경험 선명도 | Mine / Vault / Lab이 각기 다른 공간으로 기억된다 |

Gate 1 통과 후:

- 프리미엄 경험 고도화
- 리텐션 장치
- 티어/결제 검증

Gate 1 실패 시:

- Mine 결과 품질
- Vault/Lab 흐름의 직관성
- Overview/Appraisal/Full Overview의 체감 가치
- 공간감과 상호작용 톤의 설득력

를 우선 개선한다.

---

## Related

- [[Implementation-Plan]] — 실행 계약과 hard gate
- [[Phase-Flow]] — Phase 0~3 흐름
- [[Tech-Stack]] — 기술 스택과 아키텍처 원칙
- [[The-Lab]] — 현재 Lab 역할 정의

## See Also

- [[V2-Roadmap]] — Gate-Based 로드맵 (01-Core)
- [[Screen-Map]] — 웹 라우팅 구조 (08-Design)
- [[Security-Policy]] — 보안 정책 전체 (04-Features)
