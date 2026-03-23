# Admin Persona Switching Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Admin 계정이 Free/Lite/Pro 페르소나와 Admin(무제한) 모드를 전환하며, 페르소나 모드에서는 해당 티어의 제한을 실제로 받도록 한다.

**Architecture:** DB에 `persona_tier` 컬럼 추가. 백엔드에 `get_effective_tier()`/`get_effective_role()` 헬퍼를 만들어 모든 tier/role 참조를 통일. 프론트엔드에서 admin일 때 페르소나 전환 UI 노출. 핵심 공식: admin + persona_tier 설정됨 → 해당 티어 유저로 동작(제한 적용), admin + persona_tier NULL → 무제한.

**Tech Stack:** Python/FastAPI, Supabase (PostgreSQL), React Native/Expo (TypeScript)

---

## Task 1: DB 마이그레이션 — persona_tier 컬럼 + 트리거 보호

**Files:**
- Create: `supabase/migrations/20260323000001_add_persona_tier.sql`

**Step 1: 마이그레이션 SQL 작성**

```sql
-- persona_tier: admin 전용 페르소나 모드. NULL이면 admin 무제한, 값이 있으면 해당 티어로 동작.
alter table public.profiles
  add column persona_tier text default null
  check (persona_tier is null or persona_tier in ('free', 'lite', 'pro'));

-- protect_role_column 트리거를 확장해 persona_tier도 보호
create or replace function public.protect_role_column()
returns trigger as $$
begin
  if new.role is distinct from old.role then
    new.role := old.role;
  end if;
  if new.persona_tier is distinct from old.persona_tier then
    new.persona_tier := old.persona_tier;
  end if;
  return new;
end;
$$ language plpgsql security definer;
```

**Step 2: Supabase에 마이그레이션 적용**

Run: `cd "c:\Users\amy\Desktop\Idea Mine" && npx supabase db push`

만약 로컬 CLI가 안 되면 Supabase Management API로 직접 실행:

```bash
curl -s -X POST "https://api.supabase.com/v1/projects/fgetveyfzejrokjxrjkz/database/query" \
  -H "Authorization: Bearer <SUPABASE_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"query": "<SQL here>"}'
```

**Step 3: 컬럼 추가 확인**

Management API로 확인:
```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'persona_tier';
```

**Step 4: 트리거 보호 확인**

```sql
UPDATE profiles SET persona_tier = 'free' WHERE role = 'admin' LIMIT 1;
SELECT persona_tier FROM profiles WHERE role = 'admin';
-- 결과: NULL (트리거가 막아야 함)
```

**Step 5: Commit**

```bash
git add supabase/migrations/20260323000001_add_persona_tier.sql
git commit -m "feat: add persona_tier column with trigger protection"
```

---

## Task 2: 백엔드 — get_effective_tier/role 헬퍼

**Files:**
- Modify: `backend/app/dependencies.py`
- Test: `backend/tests/test_dependencies.py`

**Step 1: 테스트 작성**

Create `backend/tests/test_dependencies.py`:

```python
from app.dependencies import get_effective_tier, get_effective_role


def test_regular_user_tier():
    user = {"role": "user", "tier": "free", "persona_tier": None}
    assert get_effective_tier(user) == "free"


def test_regular_user_role():
    user = {"role": "user", "tier": "free", "persona_tier": None}
    assert get_effective_role(user) == "user"


def test_admin_no_persona_tier():
    """admin + persona_tier=NULL → 실제 tier, admin 역할 (무제한)."""
    user = {"role": "admin", "tier": "free", "persona_tier": None}
    assert get_effective_tier(user) == "free"
    assert get_effective_role(user) == "admin"


def test_admin_with_persona_free():
    """admin + persona_tier=free → free 티어, user 역할 (제한 적용)."""
    user = {"role": "admin", "tier": "free", "persona_tier": "free"}
    assert get_effective_tier(user) == "free"
    assert get_effective_role(user) == "user"


def test_admin_with_persona_pro():
    """admin + persona_tier=pro → pro 티어, user 역할 (pro 제한 적용)."""
    user = {"role": "admin", "tier": "free", "persona_tier": "pro"}
    assert get_effective_tier(user) == "pro"
    assert get_effective_role(user) == "user"


def test_admin_with_persona_lite():
    """admin + persona_tier=lite → lite 티어, user 역할."""
    user = {"role": "admin", "tier": "free", "persona_tier": "lite"}
    assert get_effective_tier(user) == "lite"
    assert get_effective_role(user) == "user"
```

**Step 2: 테스트 실패 확인**

Run: `cd "c:\Users\amy\Desktop\Idea Mine\backend" && ./venv/Scripts/python.exe -m pytest tests/test_dependencies.py -v`
Expected: FAIL — `cannot import name 'get_effective_tier'`

**Step 3: 헬퍼 구현**

`backend/app/dependencies.py` 맨 아래에 추가:

```python
def get_effective_tier(user: dict) -> str:
    """admin이 페르소나를 설정했으면 페르소나 티어, 아니면 실제 티어."""
    if user.get("role") == "admin" and user.get("persona_tier"):
        return user["persona_tier"]
    return user.get("tier", "free")


def get_effective_role(user: dict) -> str:
    """admin이 페르소나를 설정했으면 'user'(제한 적용), 아니면 실제 role."""
    if user.get("role") == "admin" and not user.get("persona_tier"):
        return "admin"
    return "user"
```

**Step 4: 테스트 통과 확인**

Run: `cd "c:\Users\amy\Desktop\Idea Mine\backend" && ./venv/Scripts/python.exe -m pytest tests/test_dependencies.py -v`
Expected: 6 PASS

**Step 5: Commit**

```bash
git add backend/app/dependencies.py backend/tests/test_dependencies.py
git commit -m "feat: add get_effective_tier/role helpers for persona mode"
```

---

## Task 3: 백엔드 — mining.py에서 effective tier/role 사용

**Files:**
- Modify: `backend/app/routers/mining.py`

**Step 1: import 추가 + 모든 tier/role 참조를 헬퍼로 교체**

`backend/app/routers/mining.py` 변경:

import에 추가:
```python
from app.dependencies import get_supabase, get_current_user, get_effective_tier, get_effective_role
```

**get_today_veins:**
```python
@router.get("/veins/today", response_model=TodayVeinsResponse)
async def get_today_veins(
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """오늘의 광맥 3개 조회 (없으면 생성)."""
    tier = get_effective_tier(user)
    role = get_effective_role(user)

    veins = await vein_service.get_or_create_today_veins(supabase, user["id"], tier)
    veins = await vein_service.resolve_vein_keywords(supabase, veins)

    state = await rate_limiter.check_daily_limit_l2(
        supabase, user["id"], tier, action="none", role=role
    )
    limits = rate_limiter.TIER_LIMITS.get(tier, rate_limiter.TIER_LIMITS["free"])

    return TodayVeinsResponse(
        veins=veins,
        rerolls_used=state["rerolls_used"],
        rerolls_max=limits["rerolls"],
        generations_used=state["generations_used"],
        generations_max=limits["generations"],
    )
```

**reroll:**
```python
@router.post("/veins/reroll", response_model=RerollResponse)
async def reroll(
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """광맥 3개를 새로 뽑기 (리롤 횟수 차감)."""
    tier = get_effective_tier(user)
    role = get_effective_role(user)

    rate_limiter.check_rate_limit_l1(user["id"], role=role)
    await rate_limiter.check_daily_limit_l2(supabase, user["id"], tier, action="reroll", role=role)

    veins = await vein_service.reroll_veins(supabase, user["id"], tier)
    veins = await vein_service.resolve_vein_keywords(supabase, veins)

    await rate_limiter.increment_daily_count(supabase, user["id"], "reroll")

    limits = rate_limiter.TIER_LIMITS.get(tier, rate_limiter.TIER_LIMITS["free"])
    state = await rate_limiter.check_daily_limit_l2(
        supabase, user["id"], tier, action="none", role=role
    )

    return RerollResponse(
        veins=veins,
        rerolls_used=state["rerolls_used"],
        rerolls_max=limits["rerolls"],
    )
```

**mine_vein:**
```python
@router.post("/veins/{vein_id}/mine", response_model=MineResponse)
async def mine_vein(
    vein_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """광맥 선택 -> 아이디어 10개 생성."""
    tier = get_effective_tier(user)
    role = get_effective_role(user)

    rate_limiter.check_rate_limit_l1(user["id"], role=role)
    await rate_limiter.check_daily_limit_l2(supabase, user["id"], tier, action="generation", role=role)

    vein = (
        supabase.table("veins")
        .select("*")
        .eq("id", vein_id)
        .eq("user_id", user["id"])
        .single()
        .execute()
    )

    if not vein.data:
        raise HTTPException(status_code=404, detail="Vein not found")

    keywords = (
        supabase.table("keywords")
        .select("id, slug, category, ko, en, is_premium")
        .in_("id", vein.data["keyword_ids"])
        .execute()
    ).data

    ideas = await idea_service.generate_ideas(
        supabase=supabase,
        user_id=user["id"],
        tier=tier,
        vein_id=vein_id,
        keywords=keywords,
        language=user.get("language", "ko"),
    )

    await rate_limiter.increment_daily_count(supabase, user["id"], "generation")
    return MineResponse(ideas=ideas, vein_id=vein_id)
```

**Step 2: 전체 테스트 실행**

Run: `cd "c:\Users\amy\Desktop\Idea Mine\backend" && ./venv/Scripts/python.exe -m pytest tests/ -v`
Expected: ALL PASS

**Step 3: Commit**

```bash
git add backend/app/routers/mining.py
git commit -m "refactor: mining endpoints use get_effective_tier/role for persona support"
```

---

## Task 4: 백엔드 — 페르소나 전환 엔드포인트

**Files:**
- Modify: `backend/app/routers/admin.py`
- Modify: `backend/tests/test_admin.py`

**Step 1: 테스트 추가**

`backend/tests/test_admin.py`에 추가:

```python
from pydantic import BaseModel


def test_persona_request_valid_tiers():
    """유효한 persona_tier 값 확인."""
    valid = [None, "free", "lite", "pro"]
    for tier in valid:
        assert tier is None or tier in ("free", "lite", "pro")
```

**Step 2: admin.py에 페르소나 엔드포인트 추가**

`backend/app/routers/admin.py`에 추가:

```python
from pydantic import BaseModel
from typing import Optional


class PersonaRequest(BaseModel):
    persona_tier: Optional[str] = None  # None = admin 모드 복귀


@router.post("/persona")
async def set_persona(
    body: PersonaRequest,
    user: dict = Depends(require_admin),
    supabase: Client = Depends(get_supabase),
):
    """페르소나 전환. persona_tier=null이면 admin 무제한 모드 복귀."""
    if body.persona_tier and body.persona_tier not in ("free", "lite", "pro"):
        raise HTTPException(status_code=400, detail="Invalid tier. Use: free, lite, pro, or null")

    # 트리거가 persona_tier 변경을 막으므로 잠시 비활성화
    supabase.postgrest.rpc(
        "exec_admin_persona",
        {"target_user_id": user["id"], "target_tier": body.persona_tier},
    ).execute()

    return {
        "status": "ok",
        "persona_tier": body.persona_tier,
        "message": f"페르소나가 {'해제' if body.persona_tier is None else body.persona_tier + ' 모드로 전환'}되었습니다",
    }
```

**Step 3: DB에 admin persona 변경 RPC 함수 생성**

트리거가 persona_tier 변경을 막으므로, `security definer` RPC로 우회:

마이그레이션 `supabase/migrations/20260323000002_admin_persona_rpc.sql`:

```sql
-- admin 전용 페르소나 변경 RPC. security definer로 트리거를 우회.
create or replace function public.exec_admin_persona(
  target_user_id uuid,
  target_tier text default null
)
returns void as $$
begin
  -- 호출자가 admin인지 확인
  if not exists (
    select 1 from profiles where id = target_user_id and role = 'admin'
  ) then
    raise exception 'Not an admin user';
  end if;

  -- 트리거를 일시 비활성화하고 persona_tier 변경
  alter table profiles disable trigger on_profile_update_protect_role;

  update profiles
  set persona_tier = target_tier
  where id = target_user_id;

  alter table profiles enable trigger on_profile_update_protect_role;
end;
$$ language plpgsql security definer;
```

Supabase에 이 마이그레이션을 적용.

**Step 4: 테스트 실행**

Run: `cd "c:\Users\amy\Desktop\Idea Mine\backend" && ./venv/Scripts/python.exe -m pytest tests/ -v`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add backend/app/routers/admin.py backend/tests/test_admin.py supabase/migrations/20260323000002_admin_persona_rpc.sql
git commit -m "feat: add admin persona switching endpoint with DB RPC"
```

---

## Task 5: 프론트엔드 — 타입 + useProfile 업데이트

**Files:**
- Modify: `apps/mobile/types/api.ts`
- Modify: `apps/mobile/hooks/useProfile.ts`
- Modify: `apps/mobile/lib/api.ts`

**Step 1: UserProfile 타입에 persona_tier 추가**

`apps/mobile/types/api.ts`의 `UserProfile` 인터페이스:

```typescript
export interface UserProfile {
  id: string;
  nickname: string;
  language: "ko" | "en";
  tier: UserTier;
  miner_level: number;
  consecutive_days: number;
  role: "user" | "admin";
  persona_tier: UserTier | null;
}
```

**Step 2: useProfile에 persona_tier select + setPersona 함수 추가**

`apps/mobile/hooks/useProfile.ts` 수정:

select에 `persona_tier` 추가:
```typescript
.select("id, nickname, language, tier, miner_level, consecutive_days, role, persona_tier")
```

`setPersona` 함수 추가 (return 전):
```typescript
  const setPersona = async (personaTier: "free" | "lite" | "pro" | null) => {
    if (!profile || profile.role !== "admin") return;
    try {
      await adminApi.setPersona(personaTier);
      setProfile({ ...profile, persona_tier: personaTier });
    } catch (e) {
      console.error("Failed to set persona:", e);
    }
  };

  return { profile, loading, refetch: fetchProfile, updateNickname, updateLanguage, setPersona };
```

**Step 3: api.ts에 adminApi 추가**

`apps/mobile/lib/api.ts` 맨 아래에 추가:

```typescript
// --- Admin API ---

export const adminApi = {
  setPersona(personaTier: string | null): Promise<{ status: string; persona_tier: string | null }> {
    return apiFetch("/admin/persona", {
      method: "POST",
      body: JSON.stringify({ persona_tier: personaTier }),
    });
  },

  resetDailyState(): Promise<{ status: string }> {
    return apiFetch("/admin/reset-daily-state", { method: "POST" });
  },

  regenerateVeins(): Promise<TodayVeinsResponse> {
    return apiFetch("/admin/regenerate-veins", { method: "POST" });
  },
};
```

**Step 4: Commit**

```bash
git add apps/mobile/types/api.ts apps/mobile/hooks/useProfile.ts apps/mobile/lib/api.ts
git commit -m "feat: add persona_tier to profile + admin API client"
```

---

## Task 6: 프론트엔드 — useMining에 페르소나 로직 반영

**Files:**
- Modify: `apps/mobile/hooks/useMining.ts`
- Modify: `apps/mobile/app/(tabs)/index.tsx`

**Step 1: useMining에 effectiveTier/effectiveRole 개념 적용**

`apps/mobile/hooks/useMining.ts` 수정:

시그니처를 변경:
```typescript
interface MiningOptions {
  role: "user" | "admin";
  personaTier: "free" | "lite" | "pro" | null;
}

export function useMining({ role, personaTier }: MiningOptions) {
```

isExhausted/rerollsLeft 계산 변경:
```typescript
  // admin + persona 없음 = 무제한, 그 외 = 제한 적용
  const isUnlimited = role === "admin" && !personaTier;
  const isExhausted = isUnlimited ? false : state.dailyState.generations_used >= state.dailyState.generations_max;
  const rerollsLeft = isUnlimited ? 999 : state.dailyState.rerolls_max - state.dailyState.rerolls_used;
```

return에 isUnlimited 추가:
```typescript
  return {
    ...state,
    isExhausted,
    isUnlimited,
    rerollsLeft,
    selectedVein,
    loadTodayVeins,
    selectVein,
    reroll,
    mine,
  };
```

**Step 2: index.tsx에서 useMining 호출 수정**

`apps/mobile/app/(tabs)/index.tsx`:

```typescript
  } = useMining({
    role: profile?.role ?? "user",
    personaTier: profile?.persona_tier ?? null,
  });
```

**Step 3: Commit**

```bash
git add apps/mobile/hooks/useMining.ts apps/mobile/app/\(tabs\)/index.tsx
git commit -m "feat: useMining supports persona mode (unlimited vs tier-limited)"
```

---

## Task 7: 프론트엔드 — 페르소나 전환 UI

**Files:**
- Create: `apps/mobile/components/admin/PersonaPicker.tsx`
- Modify: `apps/mobile/app/(tabs)/index.tsx`

**Step 1: PersonaPicker 컴포넌트 생성**

`apps/mobile/components/admin/PersonaPicker.tsx`:

```tsx
import { View, StyleSheet, Pressable } from "react-native";
import { PixelText } from "../PixelText";
import { midnight } from "../../constants/theme";

type PersonaMode = "admin" | "free" | "lite" | "pro";

interface PersonaPickerProps {
  currentPersona: PersonaMode;
  onSelect: (mode: PersonaMode) => void;
}

const MODES: { key: PersonaMode; label: string }[] = [
  { key: "admin", label: "Admin" },
  { key: "free", label: "Free" },
  { key: "lite", label: "Lite" },
  { key: "pro", label: "Pro" },
];

export function PersonaPicker({ currentPersona, onSelect }: PersonaPickerProps) {
  return (
    <View style={styles.container}>
      <PixelText variant="caption" style={styles.label}>
        Persona
      </PixelText>
      <View style={styles.row}>
        {MODES.map((m) => (
          <Pressable
            key={m.key}
            style={[styles.chip, currentPersona === m.key && styles.chipActive]}
            onPress={() => onSelect(m.key)}
          >
            <PixelText
              variant="caption"
              style={[styles.chipText, currentPersona === m.key && styles.chipTextActive]}
            >
              {m.label}
            </PixelText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: midnight.bg.surface,
    borderBottomWidth: 1,
    borderBottomColor: midnight.border.subtle,
  },
  label: {
    color: midnight.accent.pink,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: midnight.border.subtle,
  },
  chipActive: {
    backgroundColor: midnight.accent.pink,
    borderColor: midnight.accent.pink,
  },
  chipText: {
    color: midnight.text.secondary,
  },
  chipTextActive: {
    color: midnight.bg.primary,
  },
});
```

**Step 2: index.tsx에 PersonaPicker 추가**

`apps/mobile/app/(tabs)/index.tsx`에 import 추가:
```typescript
import { PersonaPicker } from "../../components/admin/PersonaPicker";
```

`handleMine` 함수 아래에 persona 핸들러 추가:
```typescript
  const currentPersona = profile?.persona_tier ?? "admin";

  const handlePersonaChange = async (mode: "admin" | "free" | "lite" | "pro") => {
    const personaTier = mode === "admin" ? null : mode;
    await setPersona(personaTier);
    loadTodayVeins();
  };
```

useProfile destructuring에 `setPersona` 추가:
```typescript
  const { profile, loading: profileLoading, updateNickname, setPersona } = useProfile();
```

JSX에서 `<MineStatusBar>` 바로 위에 (admin일 때만):
```tsx
      {profile?.role === "admin" && (
        <PersonaPicker
          currentPersona={currentPersona}
          onSelect={handlePersonaChange}
        />
      )}
```

**Step 3: Commit**

```bash
git add apps/mobile/components/admin/PersonaPicker.tsx apps/mobile/app/\(tabs\)/index.tsx
git commit -m "feat: add PersonaPicker UI for admin persona switching"
```

---

## Task 8: 통합 테스트

**Step 1: 백엔드 전체 테스트**

Run: `cd "c:\Users\amy\Desktop\Idea Mine\backend" && ./venv/Scripts/python.exe -m pytest tests/ -v`
Expected: ALL PASS

**Step 2: 수동 E2E 확인**

1. 앱에서 admin 계정으로 로그인
2. 상단에 PersonaPicker가 보이는지 확인 (Admin/Free/Lite/Pro 버튼)
3. "Admin" 선택 → 무제한 채굴 가능
4. "Free" 선택 → 채굴 1회, 리롤 2회 제한 적용
5. "Pro" 선택 → 채굴 50회, 리롤 20회 제한 적용
6. 다시 "Admin" 선택 → 무제한 복귀

---

## 구현 결과 요약

| 모드 | persona_tier | effective_tier | effective_role | 제한 |
|------|-------------|---------------|----------------|------|
| Admin (기본) | NULL | 실제 tier | admin | 무제한 |
| Free 페르소나 | free | free | user | 채굴 1회, 리롤 2회 |
| Lite 페르소나 | lite | lite | user | 채굴 5회, 리롤 10회 |
| Pro 페르소나 | pro | pro | user | 채굴 50회, 리롤 20회 |
