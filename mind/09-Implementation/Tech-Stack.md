---
title: Tech Stack
tags:
  - implementation
  - v2
---

# Tech Stack

> v2: Next.js 웹 우선 + Supabase + Python 백엔드 아키텍처.

---

## 스택 구성 (v2)

| 영역 | 선택 | 역할 |
|------|------|------|
| Frontend (Web) | React + Next.js | 웹 우선 제품. 컴포넌트 구조, 라우팅, SSR |
| Language | TypeScript | 타입 기반 상태, API 응답, 도메인 구조 |
| Motion | Framer Motion | 프리미엄 모션 계층 |
| Graphics | CSS + Canvas | 기본. 선택적으로 React Three Fiber |
| Backend | Supabase | Auth, PostgreSQL DB, Storage |
| Backend 로직 | Python (FastAPI) | 비즈니스 로직, AI 파이프라인 |
| AI Engine | OpenAI API (GPT-5 계열) | gpt-5-nano(채굴/컨셉), gpt-5-mini(개요/감정), gpt-5(풀 개요) |
| 웹 결제 | Polar.sh | MoR(Merchant of Record), 세금/VAT 대행 |
| Domain | ideamineai.com | 웹 배포 + 랜딩 |

### 나중에 확장 (웹 검증 후)

| 영역 | 선택 | 시점 |
|------|------|------|
| Mobile | Expo (React Native) | 웹 핵심 루프 검증 후 |
| 모바일 결제 | RevenueCat | 모바일 앱 출시 시 |
| Push | Web Push API / Expo Notifications | 리텐션 단계 |

---

## 아키텍처 원칙

- **재사용 로직과 채널별 UI를 분리한다.** 데이터 모델, API 계약, 도메인 동작은 이식 가능해야 한다. 인터페이스 레이어는 웹/앱 각각의 맥락에 맞게 달라질 수 있다.
- **API 응답은 DB 구조를 그대로 노출하지 않는다.** API contract는 제품 개념 중심. DB는 저장 구조, API는 사용 구조.
- **단순 조회는 direct read, 상태 변화/생성은 backend API를 통과시킨다.**

상세: `docs/Idea-Mine-V2-V3-Safety-Rails.ko.md`

---

## 개발 환경

- OS: Windows 11
- 테스트: 웹 브라우저 (Chrome DevTools)
- 개발 도구: Claude Code
- 개발자 배경: Python + Supabase 경험 있음, React/프론트엔드는 처음

---

## Related

- [[Implementation-Plan]] — 실행 계약과 문서 운영 규칙
- [[Phase-Flow]] — Phase/Sprint 흐름
- [[Phase-1-MVP]] — MVP 범위
- [[Security-Policy]] — API 키 보호, RLS 등 아키텍처 보안 (04-Features)

## See Also

- [[Project-Vision]] — 기술 선택 이유 (01-Core)
- `2026-03-22-abuse-prevention-design` — rate limiting 미들웨어 + ai_usage_logs 테이블 설계 (09-Implementation/plans)
