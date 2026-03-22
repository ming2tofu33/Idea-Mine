---
title: Screen Map
tags:
  - design
---

# Screen Map

> 전체 화면 목록, 탭 구조, 화면 간 이동 흐름. Expo Router 파일 구조의 기준 문서.

---

## 탭 구조 (4탭)

```
(tabs)/
  ├── mine/        -- The Mine (광산/홈)
  ├── lab/         -- The Lab (실험실)
  ├── vault/       -- The Vault (금고)
  └── camp/     -- Camp (캠프)
```

---

## 화면 목록

### The Mine (광산)

| 화면 | 경로 | 핵심 요소 | Phase |
|------|------|----------|-------|
| 홈 | `(tabs)/mine/index` | 오늘의 광맥 3개 캐러셀, 리롤 버튼, 데일리 퀘스트 카드, 상단 상태바 | 1 |
| 원석 결과 | `mine/results/[vein_id]` | 아이디어 10개 리스트 (4군 배치), 금고 반입 버튼, 개요 만들기 버튼 | 1 |

### The Lab (실험실)

| 화면 | 경로 | 핵심 요소 | Phase |
|------|------|----------|-------|
| 실험실 홈 | `(tabs)/lab/index` | 개요 생성 입구, 감정 목록, 최근 문서 | 1 |
| 개요 생성 | `lab/brief/[gem_id]` | 프로젝트 개요 생성 화면 (문제/타겟/기능/BM) | 1 |
| 감정 결과 | `lab/appraisal/[brief_id]` | 기본 감정 스코어 + 해석 | 1 |
| 정밀 감정 | `lab/deep-appraisal/[brief_id]` | 심화 분석 리포트 (유료) | 3 |
| 실행 설계 | `lab/execution/[brief_id]` | 실행 방향 정리 (유료) | 3 |
| MVP 청사진 | `lab/blueprint/[brief_id]` | MVP 구체화 설계 (유료) | 3 |
| 슬롯머신 | `lab/slot-machine` | 자유 조합 UI (유료) | 3 |

### The Vault (금고)

| 화면 | 경로 | 핵심 요소 | Phase |
|------|------|----------|-------|
| 금고 목록 | `(tabs)/vault/index` | 저장된 원석/개요서 리스트, 상태 배지 (draft/개요/감정) | 1 |
| 원석 상세 | `vault/gem/[gem_id]` | 아이디어 상세 + 실험실로 보내기 버튼 | 1 |
| 개요서 상세 | `vault/brief/[brief_id]` | 개요서 열람 + 복사/내보내기 | 1 |

### Camp (캠프)

| 화면 | 경로 | 핵심 요소 | Phase |
|------|------|----------|-------|
| 프로필 | `(tabs)/camp/index` | 광부 이름, 레벨, 배지, 연속 채굴, 재화 | 1 (최소) |
| 설정 | `camp/settings` | 계정, 알림, 언어, 로그아웃 | 1 |
| 구독 관리 | `camp/subscription` | 현재 티어, 업그레이드/다운그레이드 | 1.5 |
| 배지 전체 | `camp/badges` | 획득/미획득 배지 목록 | 2 |

### 공통 / 모달

| 화면 | 경로 | 핵심 요소 | Phase |
|------|------|----------|-------|
| 로그인/회원가입 | `auth/` | 이메일 + 소셜 (Supabase Auth) | 1 |
| 업셀 모달 | 모달 | 5원석 vs 6원석 비교, Pro 체험 CTA | 1.5 |
| 첫 채굴 팝업 | 모달 | 축하 + 보상 + 원석 고르기 CTA | 1 |
| 쿨다운 모달 | 모달 | Clean Mine Protocol 제한 안내 | 2 |

### Phase 4 (미정)

| 화면 | 핵심 요소 |
|------|----------|
| 쇼케이스 | 공개 전시 피드, 신뢰 배지 표시 |
| 거래소 | 투자자-아이디어 매칭 |
| 전망대 | 트렌드 대시보드, 인기 광맥 |

---

## 화면 이동 흐름

### 핵심 루프 (Phase 1)

```
[홈/광산]
  광맥 선택
    |
    v
[원석 결과] -- 10개 리스트
  |              |
  | 금고에 반입    | 실험실로 보내기
  v              v
[금고 목록]    [개요 생성]
  |              |
  | 원석 상세      | 감정 결과
  v              v
[원석 상세]    [감정 결과]
  |
  | 실험실로 보내기
  v
[개요 생성]
```

### 온보딩 흐름 (Phase 2)

```
[스플래시] -> [세계관 소개 2~3장] -> [홈/광산] -> 핵심 루프 진입
```

### 업셀 흐름 (Phase 1.5)

```
[AI 잠금 슬롯 터치] -> [업셀 모달] -> [구독 관리]
[정밀 감정 터치] -> [업셀 모달] -> [구독 관리]
```

---

## Expo Router 파일 구조 (Phase 1)

```
app/
├── _layout.tsx            -- 루트 레이아웃
├── auth/
│   └── index.tsx          -- 로그인/회원가입
├── (tabs)/
│   ├── _layout.tsx        -- 탭바 레이아웃 (4탭)
│   ├── mine/
│   │   └── index.tsx      -- 광산 홈
│   ├── lab/
│   │   └── index.tsx      -- 실험실 홈
│   ├── vault/
│   │   └── index.tsx      -- 금고 목록
│   └── camp/
│       └── index.tsx      -- 프로필
├── mine/
│   └── results/
│       └── [vein_id].tsx  -- 원석 결과
├── lab/
│   └── brief/
│       └── [gem_id].tsx   -- 개요 생성
│   └── appraisal/
│       └── [brief_id].tsx -- 감정 결과
├── vault/
│   ├── gem/
│   │   └── [gem_id].tsx   -- 원석 상세
│   └── brief/
│       └── [brief_id].tsx -- 개요서 상세
└── camp/
    └── settings.tsx       -- 설정
```

---

## Phase별 화면 추가

| Phase | 추가 화면 |
|-------|----------|
| 1 | 광산 홈, 원석 결과, 금고 목록/상세, 실험실 홈/개요/감정, Camp 기본, 로그인 |
| 1.5 | 구독 관리, 업셀 모달, 웹 반응형 |
| 2 | 온보딩, 배지 전체, 퀘스트 카드, 쿨다운 모달 |
| 3 | 정밀 감정, 실행 설계, MVP 청사진, 슬롯머신 |
| 4 | 쇼케이스, 거래소, 전망대 |

---

## Related

- [[Brand-Identity]] -- 비주얼 정체성
- [[Pixel-Art-Style-Guide]] -- 픽셀 아트 가이드
- [[Color-Theme]] -- 컬러 토큰

## See Also

- [[Phase-1-MVP]] -- Phase 1 범위 (09-Implementation)
- [[Onboarding]] -- 온보딩 흐름 (04-Features)
