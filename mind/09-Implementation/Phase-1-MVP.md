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
- 원석 결과 화면 — 아이디어 10개 (4군 구조)
- 금고 (The Vault) — 저장/관리
- 실험실 (The Lab) — 개요서 + 감정
- 캠프 (Camp) — 프로필/설정 (최소)

### 기능

- 오늘의 광맥 3개 + 리롤 2회
- 아이디어 **10개** 생성 (4군: 안정3 + 확장3 + 전환2 + 희귀2, 군 라벨 비노출)
- 금고 반입 + 관리
- 프로젝트 개요 생성 + 기본 감정
- Abuse Prevention L1~L2 (속도 제한 + 일일 상한) + L4 (비용 차단기)
- AI 비용 로깅 시스템 (`ai_usage_logs` 13필드)
- L3 행동 패턴 시그널 로깅 (자동 대응은 Phase 1.5~2)
- Supabase RLS 전 테이블 적용
- API 키 보호 (프론트→백엔드→OpenAI 아키텍처)
- 프롬프트 인젝션 방어 (프롬프트 설계와 동시)
- Haptic 피드백 (리롤, 채굴, 반입)
- 기본 Analytics 이벤트 트래킹

### 픽셀 아트 (최소만)

> Phase 2 풀 픽셀 에셋 계획: `plans/2026-03-23-pixel-asset-plan.md`

- 픽셀 폰트 (Press Start 2P + 한글)
- 컬러 테마 토큰 (Midnight + Cave Pink)
- 기본 카드 프레임 (3종)
- 키워드 칩 스타일
- 감정 스코어 UI

---

## 의도적으로 빼는 것

| 뺀 것 | 이유 | 복원 시점 |
|-------|------|----------|
| **Vault** | | |
| Vault 핀 기능 (아끼는 보물 블록) | 개요서 축적 후 의미 있음 | Phase 1.5 |
| Vault 가로 스크롤 트레이 | 핀 기능과 함께 | Phase 1.5 |
| Vault 개요서 상세 "이어서 발전시키기" | Lab 고도화와 함께 | Phase 2 |
| 개요서 비교/분기 | 파워유저 기능 | Phase 2 |
| **Lab 파이프라인** | | |
| 감정 단계 (6축 코멘트, depth 분기) | 개요서 먼저 검증 | Phase 1.5 (basic), Phase 2 (precise/deep) |
| 방향 정리 단계 (코치 조언) | Lab 고도화 | Phase 2 |
| MVP 청사진 단계 (실무 설계) | Pro 가치 | Phase 2 (Pro 전용) |
| Phase 로드맵 단계 (전략 문서) | Pro 가치 | Phase 3 (Pro 전용) |
| **키워드/광맥** | | |
| 커스텀 키워드 입력 + AI 보정 | Lite 이상 유료 기능 | Phase 1.5 (Lite부터) |
| 풀 조합 모드 (6개 전부 사용) | Pro 전용 | Phase 1.5 (Pro) |
| 광맥 저장하기 (취향 광맥) | 리롤 전 광맥 보존 | Phase 2 |
| 리롤 전 확인 모달 | UX 개선 | Phase 1.5 |
| 시즌/트렌드 광맥 (금빛/전설) | 키워드 운영 인프라 필요 | Phase 2 |
| 당연한 조합 회피 규칙 | 광맥 품질 개선 | Phase 1.5 |
| **티어/결제** | | |
| 3티어 구조 (Free/Lite/Pro) + 결제 | 핵심 루프 먼저 | Phase 1.5 |
| AI 슬롯 차별화 (Free=잠금, Lite=랜덤, Pro=선택) | 티어와 함께 | Phase 1.5 |
| **성장/보상** | | |
| 온보딩 플로우 + 튜토리얼 레벨업 (Lv1→Lv2, 가방 2→3) | 체험이 설명보다 나음 | Phase 1.5 |
| 배지/퀘스트/레벨 | 핵심 루프와 무관 | Phase 2 |
| 게임 경제 (3통화) | 검증 후 | Phase 1.5 (핑크결정만), Phase 3 (나머지) |
| **비주얼** | | |
| 픽셀 광산 씬 (홈 화면) | Gate 후 카드 UI → 씬 업그레이드 | Phase 2 |
| 배경 일러스트 | Gate 후 투자 | Phase 2 |
| 캐릭터 아바타 | Gate 후 투자 | Phase 2 |
| 사운드 이펙트 | 선택사항 | Phase 2 |
| 희귀도 시각/보상 연결 | 게임 경제와 함께 | Phase 2 |
| **기타** | | |
| i18n UI | 한국어만 먼저 | Phase 2 |
| 광고 연동 (AdMob) | 유저 없이 의미 없음 | Phase 1.5 (자리만), Phase 2 (연동) |
| Clean Mine Protocol (콘텐츠 필터링) | 공개 콘텐츠 없음 | Phase 2 |
| MCP 서버 | Sprint 3 후 1~2일 | Phase 1 직후 |
| L3 행동 패턴 자동 대응 | Phase 1에서 로깅 데이터 수집 먼저 | Phase 1.5~2 |

---

## 메뉴 구조 (4탭)

1. **The Mine:** 광맥 + 리롤 + 아이디어 생성
2. **The Lab:** 개요서 + 감정
3. **The Vault:** 저장/관리
4. **Camp:** 프로필/설정

---

## 기술 스택

- Expo (React Native) + Expo Router
- Supabase (Auth + DB) — us-east-1
- Python + FastAPI (백엔드)
- OpenAI API (아이디어 + 개요서 생성)
- EAS Build (development build)
- **Python + FastMCP** (MCP 서버 — Sprint 3 완료 후 1~2일에 배포)

### MCP 서버

Sprint 3에서 백엔드 API가 완성되면, 그 위에 MCP 래퍼를 씌워 배포.
앱과 동일한 Free 티어 경험(광맥 3개, 리롤 2회, 채굴 1회, 개요서 1회)을 MCP로 제공.
결과는 휘발성(저장 불가) → 앱으로 유도.
API `source` 태그로 앱/MCP 비용 분리 추적.
상세 스펙: `plans/2026-03-22-mcp-server-spec.md`

> **구현 시 필수:** `/mcp-builder` 스킬을 반드시 사용할 것.

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
- [[Security-Policy]] — 보안 정책 전체 (04-Features)
