---
title: Current Sprint
tags:
  - root
  - v2
---

# Current Sprint

> Gate-Based Development. 전체 로드맵: [[V2-Roadmap]]

---

## 완료된 Sprint

| Sprint | 내용 | 상태 |
|--------|------|------|
| S0 | Auth + App Shell + 3공간 배경 + API 클라이언트 + React Query | DONE |
| S1 | Mine 화면 (광맥/리롤/채굴/금고반입) | DONE |
| S2 | Vault + Lab (개요/감정/풀개요) + Admin FAB + UI/UX 개선 | DONE |
| - | GPT-5 모델 전환 + 프롬프트 리팩터 (CTCO + Structured Outputs) | DONE |
| - | Pipeline v2 (3축 분류 + 섹션 가중치 + Self-Critique) | DONE |
| - | 보안 (CORS + 소유권 + L1/L2/L4 Rate Limit) | DONE |
| - | 배포 (Vercel + Railway + Cloudflare DNS) | DONE |
| - | 개요/풀개요 버전 관리 (재생성 + 이전 버전 + 삭제) | DONE |

---

## 현재: 프로젝트 컬렉션 파이프라인 (Phase 1 완성)

> 풀 개요서 1개(15섹션) → 5개 문서 컬렉션으로 분리.
> B+C 하이브리드: 컬렉션 해금(Free/Lite) + 패키지 터짐(Pro)
> 상세 계획: `2026-04-08-collection-pipeline-impl`

### 백엔드 (Task 1~6)

- [ ] Task 1: Pydantic 스키마 분리 (ProductDesign/Blueprint/Roadmap)
- [ ] Task 2: DB 마이그레이션 (3 테이블 + RLS + 인덱스)
- [ ] Task 3: 프롬프트 3개 (product_design / blueprint / roadmap)
- [ ] Task 4: 서비스 3개 (연쇄 호출 로직)
- [ ] Task 5: 라우터 4개 (/design, /blueprint, /roadmap, /generate-all)
- [ ] Task 6: Self-Critique 교차 검증 수정

### 프론트엔드 (Task 7~10)

- [ ] Task 7: 타입 + API 확장
- [ ] Task 8: 컬렉션 뷰 페이지 (5개 문서 아코디언 + 완성도 표시)
- [ ] Task 9: 잠금 미리보기 카드 (블러 + 업셀 CTA)
- [ ] Task 10: "나머지 전부 생성" 연쇄 로딩 UX

### 완료 기준

- [ ] 5개 문서가 연쇄적으로 생성됨 (의존성 자동 해결)
- [ ] Free: 2/5 (개요+감정) + 잠금 미리보기
- [ ] Lite: 3/5 (개요+감정+제품설계 3/월) + 잠금 미리보기
- [ ] Pro: 5/5 + "나머지 전부 생성" + "전체 복사"
- [ ] 바이브 코딩 테스트: 전체 복사 → Claude Code에 넣으면 프로젝트 시작 가능

---

## Upcoming

| Phase | Sprint | 목표 | Gate |
|-------|--------|------|------|
| Phase 1 | 현재 | 컬렉션 파이프라인 완성 | 완주율 60%+, "다시 쓰고 싶다" 3/5+ |
| Phase 1.5 | S3~4 | 프리미엄 모션 + 리텐션 + 랜딩 + 어드민 | D1 재방문율 > 20% |
| Phase 2 | S5~6 | 티어 + 결제 + Pro 가치 + 어드민 수익 | Free→Pro 전환율 > 2% |
| Phase 3 | S7+ | Gate 3 후 범위 결정 | - |

상세: `2026-04-06-v2-gate-based-roadmap`
