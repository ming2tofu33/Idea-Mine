---
title: Legal Compliance
tags:
  - business
  - legal
---

# Legal Compliance

> IDEA MINE 서비스 운영에 필요한 법적 요구사항 총정리.

---

## 1. 수집하는 사용자 데이터

### 현재 수집 중

| 데이터 | 출처 | 용도 |
|--------|------|------|
| 이메일, 이름, 프로필 사진 | Google/GitHub OAuth | 계정 식별 |
| OAuth 토큰 (access/refresh) | Supabase Auth | 세션 유지 |
| 기기 정보 (OS, 버전) | expo-constants | 기본 수집 |

### 향후 수집 예정

| 데이터 | 출처 | 용도 |
|--------|------|------|
| 사용자 생성 아이디어 (원석) | 앱 핵심 기능 | 서비스 제공 |
| AI 프롬프트/응답 내역 | OpenAI API | 아이디어 생성 |
| 결제 정보 | RevenueCat / Polar.sh | 구독 관리 |
| 사용 패턴 (선택적) | 분석 도구 (미정) | 서비스 개선 |

---

## 2. 적용 법률

### 필수 (한국 서비스 기준)

- **개인정보보호법 (PIPA)** — 개인정보 처리방침 게시 의무
- **정보통신망법** — 이용약관 게시 의무, 개인정보 수집/이용 동의
- **Apple App Store 가이드라인** — Privacy Policy URL 필수, 계정 삭제 기능 필수
- **Google Play 정책** — Privacy Policy 필수, 데이터 안전 섹션 작성

### 글로벌 확장 시 추가

- **GDPR (EU)** — 동의 관리, 데이터 이동권, 삭제권, DPO 지정 검토
- **CCPA (캘리포니아)** — 판매 거부권, 수집 목적 공개
- **COPPA (미국 아동)** — 13세 미만 사용자 차단 또는 부모 동의

---

## 3. 필요한 법적 페이지

### 필수 (앱스토어 제출 전)

| 페이지 | 내용 | 호스팅 |
|--------|------|--------|
| **Privacy Policy (개인정보 처리방침)** | 수집 항목, 목적, 보관 기간, 제3자 제공, 삭제 방법 | 외부 URL (GitHub Pages 등) |
| **Terms of Service (이용약관)** | 서비스 이용 조건, 면책, 금지 행위, 계정 정지/삭제 | 외부 URL |
| **계정 삭제 안내** | 삭제 경로, 삭제되는 데이터 범위, 보유 기간 | 앱 내 설정 |

### 나중에 필요

| 페이지 | 시점 |
|--------|------|
| 오픈소스 라이선스 고지 | 배포 전 |
| AI 생성 콘텐츠 고지 | AI 기능 구현 시 |
| 환불 정책 | 결제 구현 시 |
| 구독 조건 안내 | 결제 구현 시 |

---

## 4. Cookie / 로컬 저장소

| 플랫폼 | 현재 사용 | 동의 배너 필요 |
|--------|----------|---------------|
| 모바일 (네이티브) | SecureStore (세션 토큰) | 불필요 |
| 웹 | localStorage (세션 토큰) | 필수 기능이므로 불필요 |
| 웹 + 분석 도구 추가 시 | 쿠키/localStorage | GDPR 대상 시 필요 |

> 현재는 인증 세션 유지만 하므로 쿠키 동의 배너 불필요. 분석 도구(GA 등) 추가 시 재검토.

---

## 5. 제3자 서비스 고지

| 서비스 | 고지 사항 | 시점 |
|--------|----------|------|
| Google OAuth | 브랜드 가이드라인 준수 (아이콘 사용 시 공식 에셋) | 지금 |
| GitHub OAuth | 로고 사용 가이드라인 | 지금 |
| Supabase | Privacy Policy에 데이터 처리 위탁 명시 | 지금 |
| OpenAI API | AI 생성 콘텐츠 표시, 데이터 처리 고지 | AI 기능 구현 시 |
| RevenueCat | 결제 데이터 처리 위탁 명시 | 결제 구현 시 |

---

## 6. 수익화 관련 고지

| 항목 | 요구사항 | 시점 |
|------|---------|------|
| 인앱 구매 | 구매 전 가격/조건 명시 | 결제 구현 시 |
| 자동 갱신 구독 (iOS) | 갱신 주기, 가격, 해지 방법 표시 필수 | 결제 구현 시 |
| 자동 갱신 구독 (Android) | 구독 정보 페이지 링크 | 결제 구현 시 |
| Affiliate 고지 | 해당 없음 (계획 없음) | — |
| 광고 고지 | 해당 없음 (계획 없음) | — |

---

## 7. Apple 특이 요구사항

- **계정 삭제 기능 필수** (2022~) — 로그인 있으면 삭제도 있어야 함
- **App Tracking Transparency (ATT)** — IDFA 추적 시 팝업 필수. 현재 미사용이면 불필요
- **Privacy Nutrition Labels** — App Store Connect에서 데이터 수집 항목 선언 필수
- **Sign in with Apple** — 제3자 로그인 제공 시 Apple 로그인도 제공 필수

> [!warning] Apple Sign In
> Google/GitHub OAuth를 제공하므로 **Sign in with Apple도 필수**. 아직 미구현.

---

## 8. 확률 고지 (Probability Disclosure)

### IDEA MINE의 확률 요소

광맥 희귀도가 확률 기반으로 결정됨:

| 조건 | 일반 광맥 | 금빛 광맥 | 전설 광맥 |
|------|----------|----------|----------|
| 비시즌 평일 | 97% | 3% | 0% |
| 비시즌 주말 | 94% | 6% | 0% |
| 시즌 평일 | 90% | 8% | 2% |
| 시즌 주말 | 82% | 13% | 5% |

*광맥 3개 각각에 독립 적용. 상세: `mind/10-Journal/QUICK-DECISIONS.md` "광맥 희귀도" 섹션.*

### 법적 적용 여부 분석

#### 한국 게임산업진흥법 (2024.3.22 시행)

- **대상:** "게임물"에서 "직접적/간접적으로 유상으로 구매하는 확률형 아이템"
- **IDEA MINE 해당 여부:** 낮음
  - IDEA MINE은 아이디어 생성 도구이지 "게임물"이 아님
  - 광맥은 Free 포함 전 유저에게 무상 제공
  - 온전히 무상 아이템은 고지 대상에서 제외
- **리스크:** 게이미피케이션 요소(레벨, 배지, 퀘스트 등 Phase 2)가 추가되면 "게임물" 해석 여지 확대
- **"간접적 유상" 해석 주의:** Lite/Pro 구독자가 확률 기반 광맥에서 시즌 한정 키워드를 얻는 구조 — 무상 재화가 유료 구매 가능한 재화와 교환 가능하면 "간접적 유상"으로 본다는 해설서 기준에 비추어, 구독 경험의 일부로 확률이 작동하면 해석 논란 가능

#### Apple App Store (Guidelines 3.1.1)

- **원문:** "Apps offering 'loot boxes' or other mechanisms that provide randomized virtual items **for purchase** must disclose the odds"
- **IDEA MINE 해당 여부:** 경계선
  - 광맥 자체는 무상이지만, 구독(Lite/Pro)이 확률 결과의 품질에 영향 (AI 키워드 포함 여부)
  - 심사 과정에서 게이미피케이션 UI + 확률 요소를 보면 고지 요구 가능성 있음

#### Google Play (Developer Program Policy)

- **원문:** "Apps and games offering mechanisms to receive randomized virtual items **from a purchase** must clearly disclose the odds"
- **IDEA MINE 해당 여부:** Apple과 동일한 경계선 분석 적용

### 결론: 자발적 준수 (권장)

법적 의무가 확실하지 않더라도 **자발적 고지를 채택** (QUICK-DECISIONS 2026-03-23 결정):

1. **법적 안전 마진** — 간접적 유상 해석, 게임물 분류 논란 사전 차단
2. **앱스토어 심사 리스크 제거** — 확률 고지가 있으면 리젝 사유 제거
3. **사용자 신뢰** — 투명한 확률 공개는 리텐션에 긍정적
4. **구현 비용 낮음** — 정보 표시 UI만 추가하면 됨

### 고지 방법 (계획)

| 위치 | 방식 |
|------|------|
| 광산 화면 (The Mine) | 광맥 옆 물음표(?) 아이콘 → 확률표 바텀시트 |
| 설정 (Basecamp) | "확률 정보" 메뉴 → 전체 확률표 페이지 |
| 앱스토어 설명 | 앱 설명란에 확률 정보 명시 |
| Privacy Policy / ToS | 확률 기반 콘텐츠 제공 사실 언급 |

### 참고 법령 및 정책

- [게임산업진흥법 확률정보공개 해설서 (법무법인)](https://www.draju.com/ko/sub/newsletters.html?type=view&bsNo=3840)
- [3월부터 확률형 아이템 정보 공개 의무화 (정책브리핑)](https://www.korea.kr/news/policyNewsView.do?newsId=148926013)
- [직/간접적 유상 구매 아이템 모두 대상 (한국경제)](https://www.hankyung.com/article/202402192237Y)
- [Apple Loot Box Odds Disclosure (Fenwick)](https://www.fenwick.com/insights/publications/apple-now-requires-disclosure-of-loot-box-odds)
- [Google Play Loot Box Odds Disclosure (Fenwick)](https://www.fenwick.com/insights/publications/google-play-now-requires-disclosure-of-loot-box-odds)

---

## Related

- [[Monetization-Strategy]] — 수익화 전략과 법적 요구사항 연동
- [[Tier-Structure]] — 티어별 결제 관련 고지 필요

## See Also

- [[In-App-Copy-Guide]] — 법적 고지 문구 톤앤매너 (05-UX-Writing)
