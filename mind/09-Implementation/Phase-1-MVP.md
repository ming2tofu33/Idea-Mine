---
title: Phase 1 MVP
tags:
  - implementation
---

# Phase 1 MVP

> Lean MVP. 3 Sprint로 핵심 루프만 검증. Gate 통과 후 확장.

---

## 검증 목표

**단 하나의 질문:** 사람들이 이 조합형 아이디어 생성을 유용하다고 느끼는가?

---

## 포함 (3 Sprint)

### 화면

- 홈 / 광산 (The Mine) — 광맥 3개 + 리롤
- 원석 결과 화면 — 아이디어 5개
- 금고 (The Vault) — 저장/관리
- 실험실 (The Lab) — 개요서 + 감정
- My Mine — 프로필/설정 (최소)

### 기능

- 오늘의 광맥 3개 + 리롤 2회
- 아이디어 **5개** 생성 (OpenAI)
- 금고 반입 + 관리
- 프로젝트 개요 생성 + 기본 감정
- API rate limiting
- Haptic 피드백 (리롤, 채굴, 반입)
- 기본 Analytics 이벤트 트래킹

### 픽셀 아트 (최소만)

- 픽셀 폰트 (Press Start 2P + 한글)
- 컬러 테마 토큰 (Midnight + Cave Pink)
- 기본 카드 프레임 (3종)
- 키워드 칩 스타일
- 감정 스코어 UI

---

## 의도적으로 빼는 것

| 뺀 것 | 이유 | 복원 시점 |
|-------|------|----------|
| 온보딩 플로우 | 체험이 설명보다 나음 | Phase 2 |
| 배지/퀘스트/레벨 | 핵심 루프와 무관 | Phase 2 |
| 게임 경제 (3통화) | 검증 후 | Phase 1.5 (핑크결정만), Phase 3 (나머지) |
| i18n UI | 한국어만 먼저 | Phase 2 |
| 사운드 이펙트 | 선택사항 | Phase 2 |
| 배경 일러스트 | Gate 후 투자 | Phase 2 |
| 캐릭터 아바타 | Gate 후 투자 | Phase 2 |
| 광고 연동 | 유저 없이 의미 없음 | Phase 2 |
| 3티어/결제 | 핵심 루프 먼저 | Phase 1.5 |
| 공사 중 배너 | 불필요 | Phase 2 |
| Clean Mine Protocol | 공개 콘텐츠 없음 | Phase 2 |

---

## 메뉴 구조 (4탭)

1. **The Mine:** 광맥 + 리롤 + 아이디어 생성
2. **The Lab:** 개요서 + 감정
3. **The Vault:** 저장/관리
4. **My Mine:** 프로필/설정

---

## 기술 스택

- Expo (React Native) + Expo Router
- Supabase (Auth + DB) — us-east-1
- Python + FastAPI (백엔드)
- OpenAI API (아이디어 + 개요서 생성)
- EAS Build (development build)

---

## Gate 1 기준

| 지표 | 목표 |
|------|------|
| 첫 채굴 완료율 | 측정 |
| 금고 반입률 | 측정 |
| 개요서 생성률 | 측정 |
| **D1 리텐션** | **> 20%** |

Gate 통과 -> Phase 1.5 (리텐션 + 3티어 + 웹)
Gate 실패 -> 핵심 루프 개선 후 재도전

---

## Related

- [[Tech-Stack]] — 기술 스택 상세

## See Also

- [[Phases-Roadmap]] — 전체 Gate-Based 로드맵 (01-Core)
- [[KPI-Success-Metrics]] — 성공 지표 (06-Business)
- [[Improvement-Roadmap]] — 이 lean 접근의 근거 (06-Business)
