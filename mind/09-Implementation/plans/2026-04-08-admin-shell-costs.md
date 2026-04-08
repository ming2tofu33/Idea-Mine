# 어드민 셸 + 비용 대시보드 설계

> 작성일: 2026-04-08
> 상태: 승인됨

## 목적

테스트 중 AI 비용을 실시간 확인할 수 있는 어드민 페이지. S2 어드민 MVP의 기반이 되는 셸 레이아웃도 함께 구축.

## 결정 사항

| 항목 | 결정 | 이유 |
|------|------|------|
| 범위 | 어드민 셸 + 비용 페이지 | 셸을 지금 만들면 S2에서 페이지만 추가 |
| 데이터 | 백엔드 API 엔드포인트 | 기존 `require_admin` + service_role DB 접근 활용 |
| 차트 | Recharts | S2 이후 퍼널/DAU 차트 확장에도 재사용 |
| 네비게이션 | `(admin)` 분리 라우트 그룹 | 앱(Mine/Vault/Lab)과 성격이 다름, 기존 레이아웃 미접촉 |

## 라우트 구조

```
apps/web/src/app/
├── (admin)/
│   ├── layout.tsx              ← 어드민 레이아웃 (사이드바 + role 체크)
│   └── admin/
│       ├── page.tsx            ← /admin (costs로 리다이렉트)
│       └── costs/
│           └── page.tsx        ← /admin/costs
```

## 백엔드 API

`GET /admin/costs/summary?days=7` — `require_admin` 보호

응답: `{ total_cost_usd, total_calls, by_feature[], by_date[], recent_logs[] }`

## 비용 페이지 구성

1. **요약 카드 3개:** 오늘 총 비용, 총 호출 수, 평균 호출당 비용
2. **일별 비용 추이 (Recharts BarChart):** 기능별 색상 스택, 7/14/30일 선택
3. **최근 호출 로그 테이블:** 시간, 기능, 모델, 토큰, 비용, 상태 (50건)

## 스타일

기존 프리미엄 스페이스 UI 토큰 재사용 (`bg-deep`, `surface-1`, `cold-cyan`, `signal-pink`)
