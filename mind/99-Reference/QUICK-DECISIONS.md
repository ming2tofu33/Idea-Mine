---
title: Quick Decisions
tags:
  - reference
---

# Quick Decisions

> 프로젝트 진행 중 내린 주요 의사결정 빠른 참조.

---

## 2026-03-21

### 기술 스택 확정

- **결정:** Expo + Supabase + Python + OpenAI API
- **이유:** 웹 먼저 만들고 앱으로 변환하면 결제/광고/푸시 등 두 번 만드는 고통. Expo는 웹도 지원하므로 단일 코드베이스로 양쪽 커버.
- **대안 기각:** Next.js -> Capacitor (네이티브 느낌 부족), Next.js -> React Native 재작성 (이중 작업)

### AI: OpenAI API 선택

- **결정:** Claude API 대신 OpenAI API 사용
- **이유:** Amy의 기존 경험과 선호

### 결제: RevenueCat + Polar.sh 이중 구조

- **결정:** 모바일은 RevenueCat, 웹은 Polar.sh
- **이유:** iOS/Android 앱스토어 정책상 디지털 상품은 반드시 Apple IAP / Google Play Billing 사용 필수. Polar.sh/Stripe는 모바일 앱 내 디지털 상품 결제에 사용 불가. RevenueCat은 양쪽 IAP를 래핑해주는 도구. Polar.sh는 웹에서 MoR(세금/VAT 대행)으로 활용.

### Mind 구조: 공간 중심 + Features 분리

- **결정:** 03-Spaces에 6개 공간별 노트, 04-Features에 공간 횡단 시스템 분리
- **이유:** IDEA MINE은 세계관 = 제품 구조이므로 공간이 곧 기능 단위. 횡단 시스템(배지, 퀘스트 등)은 별도 관리.

### Inbox 레이어 추가

- **결정:** 11-Inbox 추가하여 날것의 아이디어 수집
- **이유:** 아이디어 자체가 제품인 프로젝트이므로, 정리 전 아이디어 임시 저장 공간 필요.

### AI 카테고리 유료 전용

- **결정:** 키워드 택소노미를 5개 -> 6개로 확장. AI 카테고리는 유료 유저 전용.
- **이유:** 무료 5원석(Who/Domain/Tech/Value/Money)으로도 아이디어 생성 가능하지만, AI 키워드가 들어가면 퀄리티가 확연히 달라짐. 이 차이가 자연스러운 업셀 동기.

### Supabase 리전: us-east-1

- **결정:** US East (North Virginia)
- **이유:** 글로벌 미국 유저 우선. 한국 유저 ~180ms도 체감 문제 없음. OpenAI 호출(1~3초)이 병목이지 DB 레이턴시 아님.

### ~~Phase 1 재구성: 1A/1B/1C 3분할~~ (대체됨)

아래 "Gate-Based 전면 개편"으로 대체.

## 2026-03-22

### 로드맵 Gate-Based 전면 개편

- **결정:** 기존 일직선 Sprint 계획(S1~S18)을 Improvement-Roadmap의 Gate-Based 접근과 머지. Phase 0(검증) -> Phase 1(3 Sprint Lean MVP) -> Gate 1 -> Phase 1.5(리텐션+과금) -> Gate 2 -> Phase 2(풀 픽셀+출시) 구조.
- **이유:** (1) Business-Audit에서 GTM 부재, 과잉 게임 경제, 검증 없는 개발 위험 지적 (2) Improvement-Roadmap이 Gate-Based 진행 제안 (3) 기존 계획은 Phase 1에 7 Sprint — 검증 없이 너무 많이 만듦 (4) 픽셀 아트 풀 투자는 Gate 통과 후로 미뤄야 낭비 방지
- **핵심 변경:** 아이디어 10개 -> 5개, i18n 후순위(한국어 먼저), 픽셀 아트 최소 -> Gate 후 풀, Phase 0(2주 검증) 추가, GTM 병행, 48시간 throwaway 대신 실제 앱으로 프로토타입

### 티어 구조: Free/Lite/Pro 3단계 + AI 슬롯 차별화

- **결정:** Free Miner / Mine Owner Lite / Mine Owner Pro 3티어. AI 키워드는 Free=잠금, Lite=랜덤 배정, Pro=자유 선택.
- **이유:** 체험(Free) → 반복(Lite) → 실행(Pro) 경계가 선명. Lite도 6원석 품질을 경험하되, AI 기술 "선택권"은 Pro 전용으로 전환 동기 유지.
- **대안 기각:** Free/Pro 2티어(Lite 없음 — 반복 사용자 놓침), Lite도 AI 자유선택(Pro와 차이 약해짐)

### 커스텀 키워드 입력: Lite부터 개방

- **결정:** Lite부터 사용자가 카테고리 슬롯 내에서 키워드를 직접 입력 가능. AI 보정(임베딩 우선 + GPT-4o-mini 폴백)으로 품질 관리.
- **이유:** 반복 사용하는 Lite 유저가 자기 관심 분야에 맞는 키워드를 쓸 수 있어야 실속형 플랜의 가치가 체감됨. AI 보정 비용은 월 $3-24 수준으로 무시 가능.
- **대안 기각:** 완전 자유 입력(6슬롯 구조 흔들림), 보너스 슬롯 추가(구조 복잡), Pro 전용(Lite 가치 약해짐)
- **Lite/Pro 차이:** 입력 카테고리(5개/6개), 저장 수(10개/무제한), AI 보정 수준(기본/동의어+조합 추천)
