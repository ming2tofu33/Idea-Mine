---
title: Current Sprint
tags:
  - root
---

# Current Sprint

> Gate-Based Development. 전체 로드맵: [[Phases-Roadmap]]

---

## Sprint 0 — 프로젝트 기반 구축 (완료)

**기간:** 2026-03-21 ~ 2026-03-22
**상태:** DONE

- [x] Mind 노트 레이어 구조 설계
- [x] 기술 스택 확정 (Expo + Supabase + Python + OpenAI)
- [x] Expo 프로젝트 초기화 + 4탭 네비게이션
- [x] Python 백엔드 초기화 (FastAPI + venv)
- [x] Supabase 프로젝트 생성 (us-east-1) + CLI 연결
- [x] Git 세팅 + GitHub push (SSH, ming2tofu33)
- [x] .env 설정 (프론트 + 백엔드 + Supabase CLI)
- [x] 컬러 테마 확정 (Midnight + Cave Pink)
- [x] 컬러 테마 토큰 (constants/theme.ts)
- [x] 이미지 렌더링 설정 (PixelImage 컴포넌트)
- [x] 공통 UI 컴포넌트 (PixelText, PixelButton, PixelCard, PixelImage)
- [x] 키워드 인벤토리 확정 (6카테고리 118개 + subtype 매핑)
- [x] 비즈니스 문서 체계화 (Audit, GTM, 경쟁분석, 반격전략, 티어구조)
- [x] Phase 로드맵 Gate-Based 전면 개편

---

## Sprint 1 — DB + Auth + 디자인 토큰 (완료)

**기간:** 2026-03-22
**상태:** DONE

- [x] DB 스키마 생성 (Supabase — 7개 테이블 + RLS)
- [x] 키워드 시드 데이터 118개 삽입 (6카테고리, 한/영, subtype)
- [x] profiles role 컬럼 + 트리거 보호 (admin 계정)
- [x] Supabase Auth 연동 (Google + GitHub OAuth)
- [x] 이메일 로그인 제거 → OAuth 전용
- [x] EAS Build 세팅 (Android package: com.ideamineai.app)
- [x] 픽셀 폰트 (Galmuri11 + Mona12 + Mona12ColorEmoji)

---

## Sprint 2 — The Mine + 아이디어 생성 (진행 중)

**기간:** 2026-03-22 ~
**Phase:** 1 (Lean MVP)

### 백엔드 (완료)

- [x] Supabase 클라이언트 + JWT 인증 미들웨어
- [x] 광맥 생성/리롤 서비스 (vein_service)
- [x] OpenAI 아이디어 생성 프롬프트 (한/영, 4군 구조, AI 고정)
- [x] 아이디어 생성 서비스 (idea_service + 비용 로깅)
- [x] Rate limiter (L1 속도 제한 + L2 일일 상한)
- [x] API 엔드포인트 3개:
  - GET /mining/veins/today
  - POST /mining/veins/reroll
  - POST /mining/veins/{vein_id}/mine

### 프론트엔드 (완료)

- [x] 백엔드 API 연결 (lib/api.ts + types/api.ts)
- [x] 홈 화면 UI (하이브리드: 미니 카드 3개 + 확장)
- [x] 광맥 카드 디자인 (키워드 칩 + 도트 인디케이터)
- [x] 상단 상태바 (2줄: 프로필 + 자원)
- [x] 리롤 버튼
- [x] 원석 결과 화면 (10개 세로 스크롤, 4군 순서)
- [x] 원석 선택 → 가방에 담기 / 광차에 싣기 인터랙션
- [x] user_daily_state 표시
- [x] 세계관 로딩 연출 (MiningLoader)
- [x] 채굴 소진 배너 + 광고 자리 (ExhaustedBanner)
- [x] 닉네임 모달 (NicknameModal)
- [x] Vault 반입 API (가방 용량 서버 검증)
- [x] 코드 리뷰 수정 (PixelButton API, JSON.parse 가드, 로딩/빈 상태, user_id 방어)
- [x] Pipeline v2 (Python 키워드 선택 + LLM 한/영 생성 분리)
- [x] combo_builder (4군별 랜덤 조합)
- [x] 프롬프트 영어 재작성 (조합별 지시 + 한/영 출력)
- [x] idea_service 전면 재작성 (text-only 파싱)
- [x] DB 마이그레이션 (title/summary → ko/en 분리)
- [x] 픽셀 로딩 애니메이션 (LanternScan, RerollBlast, MiningLoader)
- [x] Admin 기능 (PersonaSwitching, FAB, rate bypass)
- [x] 보안 수정 (노출된 Supabase 토큰 제거 + revoke)

**상태:** DONE

---

## Sprint 3 — The Vault + The Lab (진행 중)

**기간:** 2026-03-23 ~
**Phase:** 1 (Lean MVP)

### The Vault (금고)

- [ ] 금고 화면 UI (저장된 원석 목록)
- [ ] 원석 상세 보기
- [ ] 원석 삭제
- [ ] 실험실로 보내기 버튼

### The Lab (실험실) — 개요서 품질이 최우선

**목표:** AI 코딩 도구에 복붙하면 바로 프로젝트 시작할 수 있는 수준의 개요서

#### 개요서 파이프라인 (2단계)
- [x] Step 1 Concept 프롬프트 (`concept.py`, gpt-4o-mini)
- [x] Step 2 Overview 프롬프트 (`overview.py` v4, gpt-4o)
- [x] 2단계 파이프라인 서비스 (`overview_service.py`)
- [ ] 라이트 개요서 품질 테스트 + 프롬프트 튜닝
- [ ] 풀 개요서 프롬프트 설계 (Pro 전용, 4블록 13섹션)
- [ ] 풀 개요서 서비스 구현 (`full_overview_service.py`)

#### 풀 개요서 품질 강화 기술
- [ ] Web Search 강화 — 경쟁사 구조화 검색 (이름, 가격, 기능)
- [ ] Template DB — 프레임워크별 파일 구조 템플릿 (Expo Router, Next.js 등)
- [ ] Schema Validation — 데이터 모델 ↔ API 엔드포인트 교차 검증

#### 감정 (개요서와 분리)
- [x] 감정 프롬프트 (`appraisal.py`, depth 3단계)
- [x] 감정 서비스 (`appraisal_service.py`)
- [ ] 감정 API 라우터 연결 (인증/티어/rate limiting)
- [ ] 감정 UI — 6축 코멘트 카드 (점수 없음)

#### 개요서 결과 화면
- [ ] 라이트 개요서 UI (6섹션)
- [ ] 풀 개요서 내보내기 UI (Pro 전용, 4블록 13섹션 + 신뢰도 라벨)

---

## Upcoming

| Phase | 목표 | Gate |
|-------|------|------|
| Phase 1 S3 | The Vault + The Lab | D1 리텐션 > 20% |
| Phase 1.5 (S4~5) | 리텐션 + 3티어 + 웹 | Pro 전환율 > 2% |
| Phase 2 (S6~8) | 풀 픽셀 + 게임 경제 + 앱스토어 | - |
| Phase 3 (S9~11) | 실험실 고도화 + Pro 가치 | - |
