---
title: Sprint 2 Session — 홈 화면 구현 + 파이프라인 v2 설계
tags:
  - journal
  - sprint-2
---

# 2026-03-23 Sprint 2 세션

## 완료한 것

### Sprint 2 프론트엔드 구현 (완료)

- API 클라이언트 (lib/api.ts + types/api.ts)
- 홈 화면 전체 — 미니 카드 3개, 확장 카드, 상태바, 리롤, 로딩 연출, 닉네임 모달, 소진 배너
- 원석 결과 화면 — 10개 세로 스크롤, 가방/광차 선택, Vault 반입
- Vault 백엔드 API — 가방 용량 서버 검증
- 코드 리뷰 수정 4건 (PixelButton API, JSON.parse 가드, 로딩/빈 상태, user_id 방어)

### 발견 + 수정한 버그들

1. **rate_limiter maybe_single()** — Supabase SDK v2에서 `maybe_single().execute()`가 None 반환. `.execute()` 후 길이 체크로 변경.
2. **keyword_combo 빈 배열** — 프롬프트에 slug를 안 보여줘서 LLM이 추측한 slug가 DB와 불일치. slug 명시 + 퍼지 매칭 + fallback 추가.
3. **희귀도 값 불일치** — 백엔드 `"shiny"` vs 프론트 `"uncommon"`. 통일.
4. **광맥 키워드 항상 5개** — 카테고리 전부에서 1개씩 뽑아서 항상 5개 고정. 랜덤 선택으로 변경.

### 아이디어 생성 파이프라인 v2 설계 (확정)

**문제:** LLM이 키워드 선택 + 아이디어 생성을 동시에 해서 다양성 부족, slug 매칭 실패, 비슷한 결과.

**해결:**
- Python이 4군별 키워드 조합 10세트를 미리 선택 (랜덤)
- LLM에게 조합별 아이디어 1개씩 생성만 요청 (1회 호출)
- 프롬프트는 영어로 작성 (LLM 성능 최적화)
- 출력은 한/영 동시 생성 → DB에 title_ko/en, summary_ko/en 저장
- 유저가 언어 전환 시 재생성 비용 0

## 의사결정

- 파이프라인 v2: Python 키워드 선택 + LLM 생성 분리 확정
- 프롬프트 언어: 영어 확정
- 아이디어 한/영 동시 생성 확정
- ideas 테이블: title/summary → title_ko/en + summary_ko/en 변경 확정

## 다음 할 것

- 파이프라인 v2 구현 (idea_service.py + mining.py 재작성)
- ideas 테이블 DB 마이그레이션 (title_ko/en, summary_ko/en)
- 프론트엔드 Idea 타입 + IdeaCard 업데이트
