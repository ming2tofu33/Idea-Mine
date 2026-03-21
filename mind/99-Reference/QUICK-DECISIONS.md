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

### Vault 구조: 공간 중심 + Features 분리

- **결정:** 03-Spaces에 6개 공간별 노트, 04-Features에 공간 횡단 시스템 분리
- **이유:** IDEA MINE은 세계관 = 제품 구조이므로 공간이 곧 기능 단위. 횡단 시스템(배지, 퀘스트 등)은 별도 관리.

### Inbox 레이어 추가

- **결정:** 11-Inbox 추가하여 날것의 아이디어 수집
- **이유:** 아이디어 자체가 제품인 프로젝트이므로, 정리 전 아이디어 임시 저장 공간 필요.
