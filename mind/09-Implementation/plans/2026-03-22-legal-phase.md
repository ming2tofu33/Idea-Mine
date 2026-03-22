---
title: Legal Phase 계획
tags:
  - implementation
  - legal
---

# Legal Phase 계획

> 앱스토어 제출 및 서비스 운영에 필요한 법적 요소 구현 계획.

---

## Phase 1 — 앱스토어 제출 전 (필수)

### 1.1 Privacy Policy (개인정보 처리방침)

- [ ] 한국어 + 영어 버전 작성
- [ ] 포함 항목: 수집 항목, 목적, 보관 기간, 제3자 제공 (Supabase, Google, GitHub), 삭제 방법
- [ ] 외부 URL 호스팅 (GitHub Pages 또는 랜딩 페이지)
- [ ] `app.json`에 Privacy Policy URL 추가

### 1.2 Terms of Service (이용약관)

- [ ] 한국어 + 영어 버전 작성
- [ ] 포함 항목: 서비스 이용 조건, 금지 행위, 면책 조항, 계정 정지/삭제, 지적재산권
- [ ] AI 생성 콘텐츠 소유권 명시 (사용자가 생성한 아이디어의 권리)
- [ ] 외부 URL 호스팅

### 1.3 Sign-in 화면 링크 연결

- [ ] `sign-in.tsx` 하단 텍스트를 터치 가능한 링크로 변경
- [ ] Privacy Policy + Terms of Service 링크 모두 포함
- [ ] "By continuing, you agree to our [Terms of Service] and [Privacy Policy]" 형식

### 1.4 계정 삭제 기능

- [ ] 설정 화면에 "계정 삭제" 버튼 추가
- [ ] Supabase `auth.admin.deleteUser()` 연동
- [ ] 사용자 데이터 (아이디어, 설정 등) 함께 삭제 로직
- [ ] 삭제 전 확인 다이얼로그
- [ ] 삭제 완료 후 로그아웃 + 안내

### 1.5 Sign in with Apple 추가

- [ ] Apple Developer 설정
- [ ] Supabase Apple OAuth 설정
- [ ] sign-in 화면에 Apple 로그인 버튼 추가
- [ ] Apple 가이드라인 준수 (버튼 스타일, 위치)

### 1.6 App Store 데이터 선언

- [ ] Apple Privacy Nutrition Labels 작성 (App Store Connect)
- [ ] Google Play 데이터 안전 섹션 작성

---

## Phase 2 — AI 기능 구현 시

### 2.1 AI 콘텐츠 고지

- [ ] 아이디어 생성 결과에 "AI가 생성한 콘텐츠" 표시
- [ ] OpenAI 사용 정책 준수 확인

### 2.2 Privacy Policy 업데이트

- [ ] AI 프롬프트/응답 데이터 처리 항목 추가
- [ ] OpenAI로의 데이터 전송 고지
- [ ] 데이터 보관/삭제 정책 명시

---

## Phase 3 — 결제 구현 시

### 3.1 구독 고지

- [ ] iOS: 자동 갱신 주기, 가격, 해지 방법 표시
- [ ] Android: 구독 정보 페이지 링크
- [ ] 무료 체험 조건 명시 (있을 경우)

### 3.2 환불 정책

- [ ] 환불 정책 페이지 작성
- [ ] 앱스토어별 환불 절차 안내

### 3.3 Privacy Policy 업데이트

- [ ] 결제 데이터 처리 항목 추가
- [ ] RevenueCat / Polar.sh 제3자 제공 명시

---

## Phase 4 — 글로벌 확장 시

### 4.1 GDPR 대응

- [ ] 동의 관리 시스템 (Consent Management)
- [ ] 데이터 이동권 (Data Portability) 기능
- [ ] 삭제권 (Right to Erasure) 강화
- [ ] DPO 지정 검토

### 4.2 쿠키/추적 동의

- [ ] 웹 버전 쿠키 배너 (분석 도구 추가 시)
- [ ] ATT 팝업 (IDFA 추적 사용 시)

---

## 참고 문서

- `mind/06-Business/legal/Legal-Compliance.md` — 법적 요구사항 총정리
- `mind/06-Business/Monetization-Strategy.md` — 수익화 전략
- `mind/06-Business/Tier-Structure.md` — 티어 구조

## Related Plans

- [[plans/2026-03-22-supabase-auth|Supabase Auth]] — OAuth 인증 구현 (Apple 로그인 추가 필요)
