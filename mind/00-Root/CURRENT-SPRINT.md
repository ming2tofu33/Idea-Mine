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

### 프론트엔드 (다음 작업)

- [ ] 홈 화면 UI (광맥 카드 캐러셀)
- [ ] 광맥 카드 디자인 (키워드 칩, 희귀도, 분위기 태그)
- [ ] 리롤 버튼 + Haptic 피드백
- [ ] 상단 상태바 (닉네임, 리롤 잔여)
- [ ] 백엔드 API 연결 (lib/api.ts)
- [ ] 원석 결과 화면 (10개 카드 리스트)
- [ ] 원석 선택 → 금고 반입 인터랙션
- [ ] user_daily_state 표시

---

## Upcoming

| Phase | 목표 | Gate |
|-------|------|------|
| Phase 1 S3 | The Vault + The Lab | D1 리텐션 > 20% |
| Phase 1.5 (S4~5) | 리텐션 + 3티어 + 웹 | Pro 전환율 > 2% |
| Phase 2 (S6~8) | 풀 픽셀 + 게임 경제 + 앱스토어 | - |
| Phase 3 (S9~11) | 실험실 고도화 + Pro 가치 | - |
