---
title: Admin Persona
tags:
  - features
  - admin
---

# Admin Persona

> Admin 계정의 티어 페르소나 전환 기능. Free/Lite/Pro 모드를 실시간 전환해 각 티어의 UX를 검증.

---

## 목적

1인 개발 환경에서 3개 티어(Free/Lite/Pro)의 기능 경계와 UX를 실제 앱 내에서 직접 체험하고 검증하기 위한 admin 전용 기능.

---

## 핵심 개념

### 페르소나 전환이란

- Admin 계정은 실제 tier가 아닌 **가상 tier(페르소나)**로 앱을 사용할 수 있음
- 전환 시 UI 제한 + 백엔드 API 응답 깊이가 모두 해당 티어 기준으로 동작
- "보는 것"만이 아니라 "실제 경험"을 재현해야 의미 있음

### Admin 계정 구조

| 필드 | 설명 |
|------|------|
| `role` | `enum('user', 'admin')` -- 기본값 `user` |
| `tier` | 실제 구독 상태 (RevenueCat 관리) |
| `persona_tier` | admin 전용. `NULL`이면 실제 tier 사용 |

Admin 계정은 Supabase 대시보드에서 직접 `role = 'admin'`으로 설정. API로는 변경 불가.

---

## 전환 UI

Camp 탭 > Admin 섹션 (role이 admin일 때만 노출)

```
[ Admin 페르소나 ]
---------------------------------
현재 모드: Pro (광산주 Pro)

[ Free 기본 광부 ] [ Lite 광산주 ] [ Pro 광산주 ]
         ↑ 탭 전환 즉시 반영
---------------------------------
```

- 전환 즉시 모든 화면에 반영 (새로고침 불필요)
- 현재 페르소나 모드를 상단 배지 등으로 상시 표시 (혼동 방지)
- "해제" 버튼으로 실제 tier로 복귀

---

## 구현 설계

### DB 스키마

`profiles` 테이블 확장:

```sql
ALTER TABLE profiles
ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
ADD COLUMN persona_tier TEXT CHECK (persona_tier IN ('free', 'lite', 'pro'));
```

### RLS 보호

```sql
-- role 컬럼은 유저 본인도 API로 수정 불가
CREATE POLICY "users can update own profile except role"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (role = OLD.role AND persona_tier = OLD.persona_tier);
```

`persona_tier` 변경은 admin 전용 백엔드 엔드포인트를 통해서만 가능.

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

모든 기존 tier 체크 함수가 `get_effective_tier()` 하나만 호출 -- admin 분기가 코드 전체에 퍼지지 않음.

### 프론트엔드

- `useAuth()` 훅에서 `effectiveTier` 제공
- admin이면 Camp 탭에 Admin 섹션 조건부 렌더링
- 페르소나 전환 시 `effectiveTier` 갱신 -> 앱 전체 리렌더

---

## 보안

- **UI 노출은 보안이 아님** -- 앱 디컴파일로 admin 화면을 발견해도, 서버가 `role = 'admin'`을 확인하므로 데이터 유출 없음
- `profiles.role`은 Supabase 대시보드에서만 설정 (API 수정 차단)
- `persona_tier` 변경 엔드포인트도 `role == 'admin'` 미들웨어로 보호
- 상세 보안 정책은 [[Security-Policy]] 참조

---

## 적용 시점

- Phase 1.5 (3티어 + 결제 도입 시점)
- 단, `profiles.role` 컬럼과 `get_effective_tier()` 함수는 Phase 1에서 미리 설계

---

## Related

- [[Admin-Dashboard]] -- admin 모니터링 대시보드 전체 스펙
- [[Security-Policy]] -- 구독 상태 검증, RLS 정책

## See Also

- [[Tier-Structure]] -- Free/Lite/Pro 티어 상세 정의 (06-Business)
- [[Phase-1-MVP]] -- 적용 시점 기준 (09-Implementation)
