---
title: Admin Persona
tags:
  - features
  - admin
---

# Admin Persona

> Admin 계정의 Camp 내 전용 설정. 페르소나 전환, 제한 해제, 시뮬레이션, 디버그 도구를 통해 1인 개발 환경에서 모든 티어/상황을 검증.

---

## Admin Camp 전체 구조

Camp 탭 > Admin 섹션 (role이 admin일 때만 노출)

```
Camp > Admin
├── A. 제한 해제         -- 테스트 블로커 제거
├── B. 페르소나 전환      -- 티어별 UX 검증
├── C. 프로필 조작        -- 레벨/슬롯/스트릭 테스트
├── D. 시뮬레이션         -- 외부 서비스 없이 상황 재현
├── E. 디버그 도구        -- 실시간 상태/비용/프롬프트 확인
├── F. 테스트 데이터 관리  -- 클린 테스트 환경 구성
└── G. 환경 정보          -- 앱/백엔드/DB 연결 상태
```

---

## A. 제한 해제

Admin이 일반 유저와 같은 일일 제한을 받으면 개발/테스트가 불가능. 모든 제한을 on/off로 제어.

### 무제한 모드 토글

| 대상 | 일반 유저 제한 (Free) | Admin 무제한 모드 |
|------|---------------------|------------------|
| 채굴 (generation) | 1회/일 | 무제한 |
| 리롤 (reroll) | 2회/일 | 무제한 |
| 개요서 (overview) | 1회/일 | 무제한 |
| 감정 (appraisal) | 1회/일 | 무제한 |
| 운반 슬롯 (carry) | 2개 | 항상 10개 |
| 금고 저장 용량 | 소용량 | 무제한 |

### 속도 제한 (L1) 해제

- 분당 3회, 시간당 20회 제한 해제
- 빠른 반복 테스트용 (예: 프롬프트 수정 후 즉시 재생성)

### 일일 상태 리셋

- `user_daily_state` 오늘자 레코드 초기화 (rerolls_used=0, generations_used=0, overviews_used=0)
- 무제한 모드 없이 특정 티어의 제한 흐름을 처음부터 다시 테스트할 때 사용

---

## B. 페르소나 전환

3개 티어(Free/Lite/Pro)의 기능 경계와 UX를 실제 앱 내에서 직접 체험.

### 전환 UI

```
[ Admin 페르소나 ]
---------------------------------
현재 모드: Pro (광산주 Pro)

[ Free 기본 광부 ] [ Lite 광산주 ] [ Pro 광산주 ]
         ↑ 탭 전환 즉시 반영
---------------------------------
[ ] 제한 적용  ← 체크 시 해당 티어의 일일 제한도 적용
```

### 핵심 설계: 두 축의 독립

| 조합 | 사용 목적 |
|------|----------|
| Free 페르소나 + 무제한 | Free UI를 보면서 반복 테스트 |
| Free 페르소나 + 제한 적용 | Free 유저 경험 그대로 재현 |
| Pro 페르소나 + 무제한 | Pro 기능을 빠르게 검증 |
| Pro 페르소나 + 제한 적용 | Pro 유저 경험 그대로 재현 |

- 전환 즉시 모든 화면에 반영 (새로고침 불필요)
- 현재 페르소나 모드를 상단 배지로 상시 표시 (혼동 방지)
- "해제" 버튼으로 실제 tier로 복귀

### DB 스키마

`profiles` 테이블 확장:

```sql
ALTER TABLE profiles
ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
ADD COLUMN persona_tier TEXT CHECK (persona_tier IN ('free', 'lite', 'pro'));
```

### 백엔드 로직

```python
def get_effective_tier(profile) -> str:
    """모든 tier 체크의 단일 진입점."""
    if profile.role == 'admin' and profile.persona_tier:
        return profile.persona_tier
    return profile.tier

def set_persona_tier(profile, target_tier: str | None):
    """admin 전용. target_tier=None이면 페르소나 해제."""
    if profile.role != 'admin':
        raise HTTPException(403, "Forbidden")
    profile.persona_tier = target_tier
```

---

## C. 프로필 조작

`profiles` 테이블의 게임 진행 필드를 직접 변경. 레벨업, 스트릭, 슬롯 증가 등의 흐름을 빠르게 테스트.

| 필드 | 용도 | 예시 |
|------|------|------|
| `miner_level` | 광부 레벨 변경 | 레벨 1→5 설정 후 레벨 5 UI/보상 확인 |
| `carry_slots` | 운반 슬롯 수 변경 | 2개→5개 설정 후 금고 반입 UI 변화 확인 |
| `streak_days` | 연속 접속일 변경 | 30일로 설정 후 스트릭 보상 UI 확인 (Phase 2) |
| `language` | 언어 전환 | ko→en 전환 후 i18n 확인 (Phase 2) |

### UI

```
[ 프로필 조작 ]
---------------------------------
광부 레벨:  [ 1 ] [-] [+]
운반 슬롯:  [ 2 ] [-] [+]
연속 접속:  [ 0 ] [직접 입력]
언어:      [ ko ▼ ]
---------------------------------
[ 초기값으로 복원 ]
```

---

## D. 시뮬레이션

실제 외부 서비스(광고, 결제, 푸시) 없이 특정 상황을 재현하는 도구.

### 보상형 광고 완료 시뮬레이션

- "광고 시청 완료" 버튼 → 채굴 +1회 / 개요 +1회 보너스 발동
- 개발 중 AdMob 없이 광고 보상 흐름 전체를 테스트
- `ad_bonus_used` 플래그도 함께 테스트

### 구독 만료/갱신 시뮬레이션

| 시나리오 | 조작 | 검증 포인트 |
|---------|------|-----------|
| Pro → Free 다운그레이드 | `subscription_expires_at`을 과거로 설정 | 금고 초과 데이터 처리, UI 전환, 기능 잠금 |
| Free → Pro 업그레이드 | `tier`를 pro로, `subscription_expires_at`을 미래로 설정 | 기능 해금, 환영 메시지, UI 전환 |
| 구독 갱신 실패 | `subscription_expires_at`을 오늘로 설정 | 만료 경고, 갱신 유도 UI |

Phase 1.5에서 RevenueCat 연동 시 구현. Phase 1에서는 `tier` 직접 변경으로 대체.

### 날짜 점프

- "내일로 이동" 버튼 → `user_daily_state`의 date를 어제로 만들어 일일 리셋 발동
- 시스템 시간을 건드리지 않고 daily 로직만 테스트
- 검증: 새 광맥 등장, 일일 카운터 초기화, streak_days 증가

### 키워드 조합 직접 지정

- 카테고리별 키워드를 수동 선택 → 강제 광맥 생성
- 엣지 케이스 테스트: AI 키워드만 6개, 같은 카테고리 중복, 희귀 키워드 조합 등
- 프롬프트 품질 검증에 필수

### 온보딩 리플레이 (Phase 2+)

- 온보딩 완료 플래그 초기화 → 처음부터 다시 체험
- 온보딩 플로우 수정 후 반복 테스트

### 푸시 알림 테스트 (Phase 2+)

- admin 디바이스로 테스트 푸시 전송
- 알림 타입별 선택: 일반 공지, 새 광맥 알림, 구독 만료 경고 등

---

## E. 디버그 도구

실시간 상태 확인 + AI 출력 디버깅.

| 도구 | 내용 | Phase |
|------|------|-------|
| Daily State 뷰어 | `rerolls_used`, `generations_used`, `overviews_used` 현재 값 | 1 |
| AI 비용 뷰어 | 이번 세션에서 발생한 API 비용 (토큰 수, 금액) | 1 |
| API Raw Response 토글 | 아이디어/개요서 생성 시 AI 응답 JSON 원본 표시 | 1 |
| 프롬프트 뷰어 | 현재 활성 프롬프트 원문 확인 (채굴/개요서/감정) | 1 |
| 에러 로그 | 최근 API 에러 목록 (시간, 엔드포인트, 에러 메시지) | 1 |

### 프롬프트 뷰어 상세

- 채굴 프롬프트, 개요서 프롬프트, 감정 프롬프트 각각 현재 버전 열람
- 실제 변수가 치환된 최종 프롬프트도 확인 가능 (예: 키워드가 삽입된 상태)
- 프롬프트 수정은 여기서 하지 않음 → Admin Dashboard의 프롬프트 관리 패널에서 처리

---

## F. 테스트 데이터 관리

클린 상태에서 처음부터 다시 테스트할 수 있는 초기화 도구.

| 도구 | 동작 | 주의 |
|------|------|------|
| 금고 초기화 | `vault_items`, `project_outlines`, `appraisals` 내 데이터 삭제 | 확인 다이얼로그 필수 |
| 오늘 광맥 재생성 | 오늘자 `veins` 삭제 + 새 광맥 3개 강제 생성 | - |
| 일일 상태 리셋 | `user_daily_state` 오늘자 초기화 (A 섹션과 동일) | - |
| 전체 리셋 | 금고 + 광맥 + daily state + 프로필(레벨/슬롯) 일괄 초기화 | 이중 확인 필수 |

---

## G. 환경 정보

현재 연결된 서비스와 앱 상태를 한눈에 확인.

| 항목 | 내용 |
|------|------|
| 앱 버전 | Expo 앱 빌드 버전 |
| 백엔드 버전 | Python API 배포 버전 |
| Supabase 프로젝트 | 프로젝트 ID + 리전 |
| Feature Flags | 활성 플래그 목록 + 상태 |
| OpenAI 모델 | 현재 사용 중인 모델명 + 버전 |

---

## 보안

- **UI 노출은 보안이 아님** -- 앱 디컴파일로 admin 화면을 발견해도, 서버가 `role = 'admin'`을 확인하므로 데이터 유출 없음
- `profiles.role`은 Supabase 대시보드에서만 설정 (트리거로 API 수정 차단)
- 모든 admin 엔드포인트에 `role == 'admin'` 미들웨어 적용
- 상세 보안 정책은 [[Security-Policy]] 참조

### RLS 보호

```sql
-- role, persona_tier 컬럼은 유저 본인도 API로 수정 불가
CREATE OR REPLACE FUNCTION protect_role_column()
RETURNS TRIGGER AS $$
begin
  if new.role is distinct from old.role then
    new.role := old.role;
  end if;
  return new;
end;
$$ LANGUAGE plpgsql;
```

`persona_tier` 변경은 admin 전용 백엔드 엔드포인트를 통해서만 가능.

---

## 프론트엔드 구현

- `useAuth()` 훅에서 `effectiveTier` 제공
- admin이면 Camp 탭에 Admin 섹션 조건부 렌더링
- 페르소나 전환 시 `effectiveTier` 갱신 → 앱 전체 리렌더
- 무제한 모드 상태도 전역 context로 관리

---

## Phase별 구현 범위

| Phase | 항목 |
|-------|------|
| Phase 1 | A. 제한 해제 (전부), E. 디버그 도구 (전부), F. 테스트 데이터 관리 (전부), G. 환경 정보 |
| Phase 1.5 | B. 페르소나 전환, C. 프로필 조작, D. 구독 시뮬레이션 + 광고 시뮬레이션 + 키워드 직접 지정 + 날짜 점프 |
| Phase 2 | D. 온보딩 리플레이 + 푸시 알림 테스트, C. 언어 전환 |

---

## Mock 모드 규칙

### 원칙

**모든 새 기능은 Mock 모드에서도 작동해야 한다.**

- 새 API 엔드포인트를 추가하면, 동시에 `mock-data.ts`에 Mock 구현도 추가할 것
- 새 화면이 API를 호출하면, 반드시 `api.ts`의 Proxy를 거쳐야 함 (Supabase 직접 호출 금지)
- Mock 모드는 AdminFab에서 런타임 토글 가능. 앱 재시작 불필요

### 아키텍처

```
모든 API 호출
├── api.ts의 Proxy 함수를 거침
│   ├── _mockMode === false → realApi (Backend / Supabase)
│   └── _mockMode === true  → mockApi (mock-data.ts)
└── Supabase 직접 호출 금지 (화면에서 supabase import 하지 않음)
```

### 체크리스트 (새 기능 추가 시)

- [ ] `types/` 에 타입 정의
- [ ] `api.ts`에 realApi 함수 추가
- [ ] `mock-data.ts`에 mockApi 함수 추가 (가짜 데이터 + 적절한 딜레이)
- [ ] `api.ts`에서 `proxy(real, mock)` 적용
- [ ] Mock 모드 ON 상태에서 해당 화면 동작 확인

### 이유

- API 없이 UI/UX 검증 가능 (애니메이션, 레이아웃, 플로우)
- 백엔드 장애 시에도 프론트엔드 개발 가능
- 데모/스크린샷 촬영 시 안정적인 가짜 데이터 사용

---

## Related

- [[Admin-Dashboard]] -- admin 모니터링 대시보드 전체 스펙
- [[Security-Policy]] -- 구독 상태 검증, RLS 정책

## See Also

- [[Tier-Structure]] -- Free/Lite/Pro 티어 상세 정의 (06-Business)
- [[Phase-1-MVP]] -- 적용 시점 기준 (09-Implementation)
