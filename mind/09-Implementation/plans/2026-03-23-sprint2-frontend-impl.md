---
title: Sprint 2 Frontend Implementation Plan
tags:
  - implementation
  - plan
  - sprint-2
  - the-mine
---

# Sprint 2 Frontend — The Mine 홈 화면 구현 계획

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The Mine 홈 화면에서 광맥 3개를 보고, 선택하고, 아이디어 10개를 생성하고, 가방에 담아 Vault로 반입하는 전체 흐름을 구현한다.

**Architecture:** Expo Router 탭의 `index.tsx`를 홈 화면으로, 별도 `mining-result.tsx`를 원석 결과 화면으로 구성. 프로필은 Supabase 직접 조회, 광맥/아이디어 생성은 백엔드 API, Vault 반입은 새 백엔드 API(가방 용량 서버 검증). 상태 관리는 React 로컬 상태. 세계관 로딩 연출 포함.

**Tech Stack:** Expo Router, React Native, TypeScript, Supabase JS Client, FastAPI, Pydantic

---

## 파일 구조

### 새로 생성

| 파일 | 역할 |
|------|------|
| `apps/mobile/components/mine/MineStatusBar.tsx` | 2줄 상태바 (프로필 + 자원) |
| `apps/mobile/components/mine/MiniVeinCard.tsx` | 미니 광맥 카드 (3개 가로) |
| `apps/mobile/components/mine/ExpandedVeinCard.tsx` | 선택된 광맥 확장 카드 |
| `apps/mobile/components/mine/RerollButton.tsx` | 다시 파기 버튼 |
| `apps/mobile/components/mine/MiningLoader.tsx` | 세계관 로딩 연출 |
| `apps/mobile/components/mine/ExhaustedBanner.tsx` | 채굴 소진 안내 + 광고 자리 |
| `apps/mobile/components/mine/NicknameModal.tsx` | 첫 진입 닉네임 입력 모달 |
| `apps/mobile/components/shared/KeywordChip.tsx` | 카테고리별 컬러 도트 칩 |
| `apps/mobile/components/vault/IdeaCard.tsx` | 원석 카드 |
| `apps/mobile/components/vault/VaultButton.tsx` | 하단 고정 반입 버튼 |
| `apps/mobile/app/mining-result.tsx` | 원석 결과 화면 |
| `apps/mobile/hooks/useProfile.ts` | Supabase 프로필 조회 훅 |
| `apps/mobile/hooks/useMining.ts` | 광맥/채굴 상태 관리 훅 |
| `apps/mobile/constants/mining.ts` | 채굴 관련 상수 (카테고리 컬러, 가방 용량 등) |
| `backend/app/routers/ideas.py` | Vault 반입 API |

### 수정

| 파일 | 변경 |
|------|------|
| `apps/mobile/app/(tabs)/index.tsx` | placeholder → 홈 화면 전체 구현 |
| `apps/mobile/lib/api.ts` | vault API 경로 수정 (새 라우터에 맞춰) |
| `apps/mobile/types/api.ts` | VaultRequest 타입 추가 |
| `backend/app/main.py` | ideas 라우터 등록 |

---

## Chunk 1: 기반 — 상수, 훅, 백엔드 API

### Task 1: 채굴 상수 파일

**Files:**
- Create: `apps/mobile/constants/mining.ts`

- [ ] **Step 1: 상수 파일 생성**

```typescript
// apps/mobile/constants/mining.ts
import { midnight } from "./theme";

export const CATEGORY_COLORS: Record<string, string> = {
  ai: "#8B5CF6",
  who: "#EC4899",
  domain: "#4E9A6B",
  tech: "#6496FF",
  value: "#C9A044",
  money: "#B85450",
};

export const CATEGORY_LABELS: Record<string, { ko: string; en: string }> = {
  ai: { ko: "AI", en: "AI" },
  who: { ko: "누구", en: "Who" },
  domain: { ko: "분야", en: "Domain" },
  tech: { ko: "기술", en: "Tech" },
  value: { ko: "가치", en: "Value" },
  money: { ko: "수익", en: "Money" },
};

export const RARITY_CONFIG = {
  common: {
    label: { ko: "일반", en: "Common" },
    color: midnight.text.muted,
    borderColor: midnight.border.default,
  },
  uncommon: {
    label: { ko: "반짝", en: "Uncommon" },
    icon: "✦",
    color: midnight.accent.gold,
    borderColor: midnight.accent.gold,
  },
  rare: {
    label: { ko: "희귀", en: "Rare" },
    icon: "★",
    color: midnight.purple.default,
    borderColor: midnight.purple.default,
  },
};

export const BAG_CAPACITY_BY_LEVEL: Record<number, number> = {
  1: 2,
  2: 2,
  3: 3,
  4: 3,
  5: 4,
  6: 4,
  7: 5,
  8: 5,
  9: 5,
  10: 5,
};

export function getBagCapacity(level: number): number {
  if (level <= 0) return 2;
  if (level > 10) return 5;
  return BAG_CAPACITY_BY_LEVEL[level] ?? 2;
}

export const MINING_LOADER_MESSAGES = [
  { ko: "광맥을 스캔하는 중...", en: "Scanning the vein..." },
  { ko: "결정 구조를 분석하는 중...", en: "Analyzing crystal structure..." },
  { ko: "아이디어 결정을 추출하는 중...", en: "Extracting idea crystals..." },
];
```

- [ ] **Step 2: 커밋**

```bash
git add apps/mobile/constants/mining.ts
git commit -m "feat: add mining constants (category colors, rarity, bag capacity, loader messages)"
```

---

### Task 2: useProfile 훅

**Files:**
- Create: `apps/mobile/hooks/useProfile.ts`

- [ ] **Step 1: 프로필 조회 훅 생성**

```typescript
// apps/mobile/hooks/useProfile.ts
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { UserProfile } from "../types/api";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, nickname, language, tier, miner_level, consecutive_days, role")
      .eq("id", session.user.id)
      .single();

    if (data && !error) {
      setProfile(data as UserProfile);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateNickname = async (nickname: string) => {
    if (!profile) return;

    const { error } = await supabase
      .from("profiles")
      .update({ nickname })
      .eq("id", profile.id);

    if (!error) {
      setProfile({ ...profile, nickname });
    }
    return error;
  };

  return { profile, loading, refetch: fetchProfile, updateNickname };
}
```

- [ ] **Step 2: 커밋**

```bash
git add apps/mobile/hooks/useProfile.ts
git commit -m "feat: add useProfile hook (Supabase direct profile query)"
```

---

### Task 3: useMining 훅

**Files:**
- Create: `apps/mobile/hooks/useMining.ts`

- [ ] **Step 1: 채굴 상태 관리 훅 생성**

```typescript
// apps/mobile/hooks/useMining.ts
import { useState, useCallback } from "react";
import { miningApi, ApiClientError } from "../lib/api";
import type { Vein, DailyState } from "../types/api";

interface MiningState {
  veins: Vein[];
  dailyState: DailyState;
  selectedVeinId: string | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
}

const INITIAL_DAILY_STATE: DailyState = {
  rerolls_used: 0,
  rerolls_max: 2,
  generations_used: 0,
  generations_max: 1,
};

export function useMining() {
  const [state, setState] = useState<MiningState>({
    veins: [],
    dailyState: INITIAL_DAILY_STATE,
    selectedVeinId: null,
    isLoading: true,
    isGenerating: false,
    error: null,
  });

  const loadTodayVeins = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const res = await miningApi.getTodayVeins();
      setState((s) => ({
        ...s,
        veins: res.veins,
        dailyState: {
          rerolls_used: res.rerolls_used,
          rerolls_max: res.rerolls_max,
          generations_used: res.generations_used,
          generations_max: res.generations_max,
        },
        isLoading: false,
        selectedVeinId: res.veins[0]?.id ?? null,
      }));
    } catch (e) {
      const msg = e instanceof ApiClientError ? e.message : "광맥을 불러오지 못했습니다";
      setState((s) => ({ ...s, isLoading: false, error: msg }));
    }
  }, []);

  const selectVein = (veinId: string) => {
    setState((s) => ({ ...s, selectedVeinId: veinId }));
  };

  const reroll = useCallback(async () => {
    setState((s) => ({ ...s, error: null }));
    try {
      const res = await miningApi.reroll();
      setState((s) => ({
        ...s,
        veins: res.veins,
        dailyState: {
          ...s.dailyState,
          rerolls_used: res.rerolls_used,
          rerolls_max: res.rerolls_max,
        },
        selectedVeinId: res.veins[0]?.id ?? null,
      }));
    } catch (e) {
      const msg = e instanceof ApiClientError ? e.message : "리롤에 실패했습니다";
      setState((s) => ({ ...s, error: msg }));
    }
  }, []);

  const mine = useCallback(async (veinId: string) => {
    setState((s) => ({ ...s, isGenerating: true, error: null }));
    try {
      const res = await miningApi.mine(veinId);
      setState((s) => ({
        ...s,
        isGenerating: false,
        dailyState: {
          ...s.dailyState,
          generations_used: s.dailyState.generations_used + 1,
        },
      }));
      return res;
    } catch (e) {
      const msg = e instanceof ApiClientError ? e.message : "채굴에 실패했습니다";
      setState((s) => ({ ...s, isGenerating: false, error: msg }));
      return null;
    }
  }, []);

  const isExhausted = state.dailyState.generations_used >= state.dailyState.generations_max;
  const rerollsLeft = state.dailyState.rerolls_max - state.dailyState.rerolls_used;
  const selectedVein = state.veins.find((v) => v.id === state.selectedVeinId) ?? null;

  return {
    ...state,
    isExhausted,
    rerollsLeft,
    selectedVein,
    loadTodayVeins,
    selectVein,
    reroll,
    mine,
  };
}
```

- [ ] **Step 2: 커밋**

```bash
git add apps/mobile/hooks/useMining.ts
git commit -m "feat: add useMining hook (veins, reroll, mine state management)"
```

---

### Task 4: Vault 반입 백엔드 API

**Files:**
- Create: `backend/app/routers/ideas.py`
- Modify: `backend/app/main.py`
- Modify: `apps/mobile/types/api.ts`
- Modify: `apps/mobile/lib/api.ts`

- [ ] **Step 1: 백엔드 라우터 생성**

```python
# backend/app/routers/ideas.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import Client
from app.dependencies import get_supabase, get_current_user

router = APIRouter(prefix="/ideas", tags=["ideas"])

BAG_CAPACITY_BY_LEVEL = {
    1: 2, 2: 2, 3: 3, 4: 3, 5: 4, 6: 4, 7: 5, 8: 5, 9: 5, 10: 5,
}


class VaultRequest(BaseModel):
    idea_ids: list[str]
    vein_id: str


class VaultResponse(BaseModel):
    vaulted_count: int
    idea_ids: list[str]


def _get_bag_capacity(level: int) -> int:
    if level <= 0:
        return 2
    if level > 10:
        return 5
    return BAG_CAPACITY_BY_LEVEL.get(level, 2)


@router.patch("/vault", response_model=VaultResponse)
async def vault_ideas(
    req: VaultRequest,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """선택된 아이디어를 Vault에 반입. 가방 용량 서버 검증."""
    tier = user.get("tier", "free")
    level = user.get("miner_level", 1)

    # 유료 유저는 광차 (전부 가능)
    if tier in ("lite", "pro"):
        max_items = 10
    else:
        max_items = _get_bag_capacity(level)

    if len(req.idea_ids) > max_items:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "bag_capacity_exceeded",
                "message": f"가방에는 {max_items}개까지 담을 수 있어요",
            },
        )

    # 아이디어가 해당 유저의 것인지 + 해당 vein의 것인지 확인
    ideas = (
        supabase.table("ideas")
        .select("id")
        .eq("user_id", user["id"])
        .eq("vein_id", req.vein_id)
        .in_("id", req.idea_ids)
        .execute()
    )

    found_ids = [i["id"] for i in ideas.data]
    if len(found_ids) != len(req.idea_ids):
        raise HTTPException(
            status_code=404,
            detail={
                "error": "ideas_not_found",
                "message": "일부 원석을 찾을 수 없습니다",
            },
        )

    # is_vaulted 업데이트
    supabase.table("ideas").update(
        {"is_vaulted": True}
    ).in_("id", found_ids).execute()

    return VaultResponse(vaulted_count=len(found_ids), idea_ids=found_ids)
```

- [ ] **Step 2: main.py에 라우터 등록**

`backend/app/main.py`에서 `from app.routers import ideas` 추가 후 `app.include_router(ideas.router)` 추가.

- [ ] **Step 3: 프론트 타입 추가**

`apps/mobile/types/api.ts`에 추가:

```typescript
export interface VaultRequest {
  idea_ids: string[];
  vein_id: string;
}

export interface VaultResponse {
  vaulted_count: number;
  idea_ids: string[];
}
```

- [ ] **Step 4: API 클라이언트 수정**

`apps/mobile/lib/api.ts`의 `ideasApi` 수정:

```typescript
export const ideasApi = {
  vaultIdeas(ideaIds: string[], veinId: string): Promise<VaultResponse> {
    return apiFetch("/ideas/vault", {
      method: "PATCH",
      body: JSON.stringify({ idea_ids: ideaIds, vein_id: veinId }),
    });
  },
};
```

- [ ] **Step 5: 커밋**

```bash
git add backend/app/routers/ideas.py backend/app/main.py apps/mobile/types/api.ts apps/mobile/lib/api.ts
git commit -m "feat: add vault API with bag capacity server validation"
```

---

## Chunk 2: 공유 컴포넌트

### Task 5: KeywordChip

**Files:**
- Create: `apps/mobile/components/shared/KeywordChip.tsx`

- [ ] **Step 1: 컴포넌트 생성**

```tsx
// apps/mobile/components/shared/KeywordChip.tsx
import { View, StyleSheet } from "react-native";
import { PixelText } from "../PixelText";
import { CATEGORY_COLORS } from "../../constants/mining";
import { midnight } from "../../constants/theme";

interface KeywordChipProps {
  category: string;
  label: string;
  size?: "small" | "default";
}

export function KeywordChip({ category, label, size = "default" }: KeywordChipProps) {
  const dotColor = CATEGORY_COLORS[category] ?? midnight.text.muted;
  const isSmall = size === "small";

  return (
    <View style={[styles.chip, isSmall && styles.chipSmall]}>
      <View style={[styles.dot, { backgroundColor: dotColor }, isSmall && styles.dotSmall]} />
      <PixelText variant={isSmall ? "caption" : "body"} style={styles.label}>
        {label}
      </PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: midnight.bg.elevated,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  chipSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  label: {
    color: midnight.text.primary,
  },
});
```

- [ ] **Step 2: 커밋**

```bash
git add apps/mobile/components/shared/KeywordChip.tsx
git commit -m "feat: add KeywordChip component with category color dots"
```

---

## Chunk 3: Mine 홈 화면 컴포넌트

### Task 6: MineStatusBar

**Files:**
- Create: `apps/mobile/components/mine/MineStatusBar.tsx`

- [ ] **Step 1: 상태바 컴포넌트 생성**

2줄 상태바: 프로필 줄 (닉네임 + Lv + 연속접속) + 자원 줄 (채굴/리롤/가방/재화).

```tsx
// apps/mobile/components/mine/MineStatusBar.tsx
import { View, StyleSheet } from "react-native";
import { PixelText } from "../PixelText";
import { midnight } from "../../constants/theme";
import type { UserProfile, DailyState } from "../../types/api";

interface MineStatusBarProps {
  profile: UserProfile | null;
  dailyState: DailyState;
  bagCount: number;
  bagMax: number;
}

export function MineStatusBar({ profile, dailyState, bagCount, bagMax }: MineStatusBarProps) {
  const generationsLeft = dailyState.generations_max - dailyState.generations_used;
  const rerollsLeft = dailyState.rerolls_max - dailyState.rerolls_used;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <PixelText variant="body" emoji>
          {"⛏ "}
          {profile?.nickname ?? "광부"}님
        </PixelText>
        <PixelText variant="caption" style={styles.levelText}>
          Lv.{profile?.miner_level ?? 1}
        </PixelText>
        <PixelText variant="caption" emoji style={styles.streakText}>
          {"🔥 "}연속 {profile?.consecutive_days ?? 0}일
        </PixelText>
      </View>
      <View style={styles.row}>
        <PixelText variant="caption" style={styles.stat}>
          채굴 {generationsLeft}/{dailyState.generations_max}
        </PixelText>
        <PixelText variant="caption" emoji style={styles.stat}>
          {"🔄 "}{rerollsLeft}/{dailyState.rerolls_max}
        </PixelText>
        <PixelText variant="caption" emoji style={styles.stat}>
          {"🎒 "}{bagCount}/{bagMax}
        </PixelText>
        <PixelText variant="caption" emoji style={styles.stat}>
          {"💎 "}0
        </PixelText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: midnight.bg.elevated,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: midnight.border.subtle,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  levelText: {
    color: midnight.accent.gold,
    marginLeft: 8,
  },
  streakText: {
    marginLeft: "auto",
  },
  stat: {
    color: midnight.text.secondary,
    marginRight: 12,
  },
});
```

- [ ] **Step 2: 커밋**

```bash
git add apps/mobile/components/mine/MineStatusBar.tsx
git commit -m "feat: add MineStatusBar (2-line: profile + resources)"
```

---

### Task 7: MiniVeinCard

**Files:**
- Create: `apps/mobile/components/mine/MiniVeinCard.tsx`

- [ ] **Step 1: 미니 광맥 카드 생성**

3개가 가로로 나란히 배치. 탭하면 선택 상태 (골드 보더).

```tsx
// apps/mobile/components/mine/MiniVeinCard.tsx
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { PixelText } from "../PixelText";
import { midnight } from "../../constants/theme";
import { RARITY_CONFIG } from "../../constants/mining";
import type { Vein } from "../../types/api";

interface MiniVeinCardProps {
  vein: Vein;
  isSelected: boolean;
  language: "ko" | "en";
  onPress: () => void;
}

export function MiniVeinCard({ vein, isSelected, language, onPress }: MiniVeinCardProps) {
  // rarity: "common" | "golden" | "legend"
  const rarity = RARITY_CONFIG[vein.rarity] ?? RARITY_CONFIG.common;
  const rarityLabel = rarity.label[language];
  const preview = vein.keywords.slice(0, 2).map((k) => k[language]).join(", ");

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && { borderColor: midnight.accent.gold, borderWidth: 2 },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <PixelText variant="caption" style={{ color: rarity.color }}>
        {"icon" in rarity ? `${rarity.icon} ` : ""}{rarityLabel}
      </PixelText>
      <PixelText variant="caption" style={styles.preview} numberOfLines={2}>
        {preview}
      </PixelText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: midnight.bg.elevated,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: midnight.border.default,
    padding: 10,
    marginHorizontal: 4,
    minHeight: 72,
    justifyContent: "space-between",
  },
  preview: {
    color: midnight.text.secondary,
    marginTop: 4,
  },
});
```

- [ ] **Step 2: 커밋**

```bash
git add apps/mobile/components/mine/MiniVeinCard.tsx
git commit -m "feat: add MiniVeinCard (3-up horizontal, gold border on select)"
```

---

### Task 8: ExpandedVeinCard

**Files:**
- Create: `apps/mobile/components/mine/ExpandedVeinCard.tsx`

- [ ] **Step 1: 확장 광맥 카드 생성**

선택된 광맥의 키워드 전체를 칩으로 표시 + 채굴 CTA.

```tsx
// apps/mobile/components/mine/ExpandedVeinCard.tsx
import { View, StyleSheet } from "react-native";
import { PixelText } from "../PixelText";
import { PixelButton } from "../PixelButton";
import { KeywordChip } from "../shared/KeywordChip";
import { midnight } from "../../constants/theme";
import { RARITY_CONFIG } from "../../constants/mining";
import type { Vein } from "../../types/api";

interface ExpandedVeinCardProps {
  vein: Vein;
  language: "ko" | "en";
  isExhausted: boolean;
  onMine: () => void;
}

export function ExpandedVeinCard({ vein, language, isExhausted, onMine }: ExpandedVeinCardProps) {
  // rarity: "common" | "golden" | "legend"
  const rarity = RARITY_CONFIG[vein.rarity] ?? RARITY_CONFIG.common;

  return (
    <View style={[styles.card, { borderColor: rarity.borderColor }]}>
      <View style={styles.header}>
        <PixelText variant="subtitle" style={{ color: rarity.color }}>
          {"icon" in rarity ? `${rarity.icon} ` : ""}{rarity.label[language]}
        </PixelText>
      </View>

      <View style={styles.chips}>
        {vein.keywords.map((kw) => (
          <KeywordChip key={kw.id} category={kw.category} label={kw[language]} />
        ))}
      </View>

      <PixelButton
        title={isExhausted ? "오늘의 채굴을 모두 사용했어요" : "채굴하기"}
        variant={isExhausted ? "secondary" : "primary"}
        disabled={isExhausted}
        onPress={onMine}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: midnight.bg.elevated,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    marginTop: 12,
  },
  header: {
    marginBottom: 12,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
});
```

- [ ] **Step 2: 커밋**

```bash
git add apps/mobile/components/mine/ExpandedVeinCard.tsx
git commit -m "feat: add ExpandedVeinCard (keywords + mine CTA)"
```

---

### Task 9: RerollButton

**Files:**
- Create: `apps/mobile/components/mine/RerollButton.tsx`

- [ ] **Step 1: 리롤 버튼 생성**

```tsx
// apps/mobile/components/mine/RerollButton.tsx
import { StyleSheet } from "react-native";
import { PixelButton } from "../PixelButton";

interface RerollButtonProps {
  rerollsLeft: number;
  rerollsMax: number;
  onPress: () => void;
}

export function RerollButton({ rerollsLeft, rerollsMax, onPress }: RerollButtonProps) {
  const isDisabled = rerollsLeft <= 0;

  return (
    <PixelButton
      title={isDisabled
        ? "리롤 소진"
        : `다시 파기 (${rerollsLeft}/${rerollsMax})`}
      variant="secondary"
      disabled={isDisabled}
      onPress={onPress}
      style={styles.button}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 12,
  },
});
```

- [ ] **Step 2: 커밋**

```bash
git add apps/mobile/components/mine/RerollButton.tsx
git commit -m "feat: add RerollButton with remaining count display"
```

---

### Task 10: MiningLoader

**Files:**
- Create: `apps/mobile/components/mine/MiningLoader.tsx`

- [ ] **Step 1: 세계관 로딩 연출 생성**

2~3초 간격으로 메시지가 바뀌는 로딩 화면.

```tsx
// apps/mobile/components/mine/MiningLoader.tsx
import { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { PixelText } from "../PixelText";
import { midnight } from "../../constants/theme";
import { MINING_LOADER_MESSAGES } from "../../constants/mining";

interface MiningLoaderProps {
  language: "ko" | "en";
}

export function MiningLoader({ language }: MiningLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) =>
        i < MINING_LOADER_MESSAGES.length - 1 ? i + 1 : i
      );
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const message = MINING_LOADER_MESSAGES[messageIndex][language];

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={midnight.accent.gold} />
      <PixelText variant="subtitle" style={styles.text}>
        {message}
      </PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: midnight.bg.deep,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  text: {
    color: midnight.accent.gold,
    marginTop: 24,
    textAlign: "center",
  },
});
```

- [ ] **Step 2: 커밋**

```bash
git add apps/mobile/components/mine/MiningLoader.tsx
git commit -m "feat: add MiningLoader with worldview-themed stage messages"
```

---

### Task 11: ExhaustedBanner

**Files:**
- Create: `apps/mobile/components/mine/ExhaustedBanner.tsx`

- [ ] **Step 1: 채굴 소진 배너 생성**

```tsx
// apps/mobile/components/mine/ExhaustedBanner.tsx
import { View, StyleSheet } from "react-native";
import { PixelText } from "../PixelText";
import { PixelButton } from "../PixelButton";
import { midnight } from "../../constants/theme";

export function ExhaustedBanner() {
  return (
    <View style={styles.container}>
      <PixelText variant="body" style={styles.text}>
        오늘의 채굴을 모두 사용했어요
      </PixelText>
      <PixelText variant="caption" style={styles.subtext}>
        내일 새로운 광맥이 기다리고 있어요
      </PixelText>
      <PixelButton
        title="광고로 1회 추가 (준비 중)"
        variant="secondary"
        disabled
        onPress={() => {}}
        style={styles.adButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: midnight.bg.surface,
    borderRadius: 8,
    padding: 20,
    marginTop: 16,
    alignItems: "center",
  },
  text: {
    color: midnight.text.primary,
    marginBottom: 4,
  },
  subtext: {
    color: midnight.text.muted,
    marginBottom: 16,
  },
  adButton: {
    opacity: 0.5,
  },
});
```

- [ ] **Step 2: 커밋**

```bash
git add apps/mobile/components/mine/ExhaustedBanner.tsx
git commit -m "feat: add ExhaustedBanner with placeholder ad button"
```

---

### Task 12: NicknameModal

**Files:**
- Create: `apps/mobile/components/mine/NicknameModal.tsx`

- [ ] **Step 1: 닉네임 모달 생성**

```tsx
// apps/mobile/components/mine/NicknameModal.tsx
import { useState } from "react";
import { View, Modal, TextInput, StyleSheet } from "react-native";
import { PixelText } from "../PixelText";
import { PixelButton } from "../PixelButton";
import { midnight } from "../../constants/theme";

interface NicknameModalProps {
  visible: boolean;
  onSubmit: (nickname: string) => void;
}

export function NicknameModal({ visible, onSubmit }: NicknameModalProps) {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed.length >= 2 && trimmed.length <= 20) {
      onSubmit(trimmed);
    }
  };

  const isValid = name.trim().length >= 2 && name.trim().length <= 20;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <PixelText variant="title" style={styles.title}>
            광부 이름을 정해주세요
          </PixelText>
          <PixelText variant="caption" style={styles.subtitle}>
            2~20자, 나중에 변경할 수 있어요
          </PixelText>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="닉네임 입력"
            placeholderTextColor={midnight.text.muted}
            maxLength={20}
            autoFocus
          />

          <PixelButton
            title="시작하기"
            variant="primary"
            disabled={!isValid}
            onPress={handleSubmit}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modal: {
    backgroundColor: midnight.bg.elevated,
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    borderWidth: 1,
    borderColor: midnight.border.default,
  },
  title: {
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    textAlign: "center",
    color: midnight.text.muted,
    marginBottom: 20,
  },
  input: {
    backgroundColor: midnight.bg.surface,
    color: midnight.text.primary,
    fontFamily: "Galmuri11",
    fontSize: 16,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: midnight.border.default,
    marginBottom: 16,
  },
});
```

- [ ] **Step 2: 커밋**

```bash
git add apps/mobile/components/mine/NicknameModal.tsx
git commit -m "feat: add NicknameModal for first-time user nickname input"
```

---

## Chunk 4: 원석 결과 화면 컴포넌트

### Task 13: IdeaCard

**Files:**
- Create: `apps/mobile/components/vault/IdeaCard.tsx`

- [ ] **Step 1: 원석 카드 생성**

```tsx
// apps/mobile/components/vault/IdeaCard.tsx
import { View, StyleSheet } from "react-native";
import { PixelText } from "../PixelText";
import { PixelButton } from "../PixelButton";
import { KeywordChip } from "../shared/KeywordChip";
import { midnight } from "../../constants/theme";
import type { Idea } from "../../types/api";

interface IdeaCardProps {
  idea: Idea;
  language: "ko" | "en";
  isInBag: boolean;
  bagFull: boolean;
  transportLabel: string;  // "가방에 담기" or "광차에 싣기"
  onToggle: () => void;
}

export function IdeaCard({ idea, language, isInBag, bagFull, transportLabel, onToggle }: IdeaCardProps) {
  return (
    <View style={[styles.card, isInBag && styles.cardSelected]}>
      <PixelText variant="subtitle">{idea.title}</PixelText>
      <PixelText variant="body" style={styles.summary}>
        {idea.summary}
      </PixelText>

      <View style={styles.chips}>
        {idea.keyword_combo.map((kc, i) => (
          <KeywordChip key={i} category={kc.category} label={kc[language]} size="small" />
        ))}
      </View>

      <PixelButton
        title={isInBag ? "빼기" : transportLabel}
        variant={isInBag ? "danger" : "secondary"}
        disabled={!isInBag && bagFull}
        onPress={onToggle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: midnight.bg.elevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: midnight.border.default,
    padding: 16,
    marginBottom: 12,
  },
  cardSelected: {
    borderColor: midnight.accent.gold,
    backgroundColor: midnight.bg.surface,
  },
  summary: {
    color: midnight.text.secondary,
    marginTop: 6,
    marginBottom: 12,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
});
```

- [ ] **Step 2: 커밋**

```bash
git add apps/mobile/components/vault/IdeaCard.tsx
git commit -m "feat: add IdeaCard (title, summary, keywords, bag toggle)"
```

---

### Task 14: VaultButton

**Files:**
- Create: `apps/mobile/components/vault/VaultButton.tsx`

- [ ] **Step 1: 하단 반입 버튼 생성**

```tsx
// apps/mobile/components/vault/VaultButton.tsx
import { View, StyleSheet } from "react-native";
import { PixelButton } from "../PixelButton";
import { midnight } from "../../constants/theme";

interface VaultButtonProps {
  count: number;
  isLoading: boolean;
  onPress: () => void;
}

export function VaultButton({ count, isLoading, onPress }: VaultButtonProps) {
  return (
    <View style={styles.container}>
      <PixelButton
        title={isLoading ? "반입 중..." : `Vault로 반입하기 (${count})`}
        variant="pink"
        disabled={count === 0 || isLoading}
        onPress={onPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: midnight.bg.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: midnight.border.subtle,
  },
});
```

- [ ] **Step 2: 커밋**

```bash
git add apps/mobile/components/vault/VaultButton.tsx
git commit -m "feat: add VaultButton (sticky bottom, pink CTA)"
```

---

## Chunk 5: 화면 조립

### Task 15: The Mine 홈 화면

**Files:**
- Modify: `apps/mobile/app/(tabs)/index.tsx`

- [ ] **Step 1: 홈 화면 전체 구현**

```tsx
// apps/mobile/app/(tabs)/index.tsx
import { useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight } from "../../constants/theme";
import { getBagCapacity } from "../../constants/mining";
import { useProfile } from "../../hooks/useProfile";
import { useMining } from "../../hooks/useMining";
import { MineStatusBar } from "../../components/mine/MineStatusBar";
import { MiniVeinCard } from "../../components/mine/MiniVeinCard";
import { ExpandedVeinCard } from "../../components/mine/ExpandedVeinCard";
import { RerollButton } from "../../components/mine/RerollButton";
import { ExhaustedBanner } from "../../components/mine/ExhaustedBanner";
import { MiningLoader } from "../../components/mine/MiningLoader";
import { NicknameModal } from "../../components/mine/NicknameModal";
import { PixelText } from "../../components/PixelText";

export default function MineScreen() {
  const router = useRouter();
  const { profile, loading: profileLoading, updateNickname } = useProfile();
  const {
    veins, dailyState, selectedVein, selectedVeinId,
    isLoading, isGenerating, isExhausted, rerollsLeft, error,
    loadTodayVeins, selectVein, reroll, mine,
  } = useMining();

  const language = profile?.language ?? "ko";
  const bagMax = getBagCapacity(profile?.miner_level ?? 1);
  const showNicknameModal = !profileLoading && profile && !profile.nickname;

  useEffect(() => {
    loadTodayVeins();
  }, [loadTodayVeins]);

  const handleMine = async () => {
    if (!selectedVeinId) return;
    const result = await mine(selectedVeinId);
    if (result) {
      router.push({
        pathname: "/mining-result",
        params: {
          ideas: JSON.stringify(result.ideas),
          veinId: result.vein_id,
          bagMax: String(bagMax),
          tier: profile?.tier ?? "free",
          language,
        },
      });
    }
  };

  const handleNicknameSubmit = async (nickname: string) => {
    await updateNickname(nickname);
  };

  if (isGenerating) {
    return <MiningLoader language={language} />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <MineStatusBar
        profile={profile}
        dailyState={dailyState}
        bagCount={0}
        bagMax={bagMax}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <PixelText variant="title" style={styles.heading}>
          The Mine
        </PixelText>
        <PixelText variant="body" style={styles.subheading}>
          {isExhausted
            ? "오늘의 채굴이 끝났어요"
            : "오늘은 어떤 광맥을 캐볼까요?"}
        </PixelText>

        {error && (
          <PixelText variant="caption" style={styles.error}>{error}</PixelText>
        )}

        {!isLoading && veins.length > 0 && (
          <>
            <View style={styles.miniCards}>
              {veins.map((v) => (
                <MiniVeinCard
                  key={v.id}
                  vein={v}
                  isSelected={v.id === selectedVeinId}
                  language={language}
                  onPress={() => selectVein(v.id)}
                />
              ))}
            </View>

            {selectedVein && (
              <ExpandedVeinCard
                vein={selectedVein}
                language={language}
                isExhausted={isExhausted}
                onMine={handleMine}
              />
            )}

            <RerollButton
              rerollsLeft={rerollsLeft}
              rerollsMax={dailyState.rerolls_max}
              onPress={reroll}
            />

            {isExhausted && <ExhaustedBanner />}
          </>
        )}
      </ScrollView>

      <NicknameModal
        visible={!!showNicknameModal}
        onSubmit={handleNicknameSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: midnight.bg.primary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  heading: {
    marginBottom: 4,
  },
  subheading: {
    color: midnight.text.secondary,
    marginBottom: 20,
  },
  error: {
    color: midnight.status.error,
    marginBottom: 12,
  },
  miniCards: {
    flexDirection: "row",
    marginBottom: 4,
  },
});
```

- [ ] **Step 2: 커밋**

```bash
git add apps/mobile/app/(tabs)/index.tsx
git commit -m "feat: implement The Mine home screen (veins, reroll, status bar, nickname modal)"
```

---

### Task 16: 원석 결과 화면

**Files:**
- Create: `apps/mobile/app/mining-result.tsx`

- [ ] **Step 1: 원석 결과 화면 생성**

```tsx
// apps/mobile/app/mining-result.tsx
import { useState } from "react";
import { View, StyleSheet, FlatList, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight } from "../constants/theme";
import { ideasApi, ApiClientError } from "../lib/api";
import { IdeaCard } from "../components/vault/IdeaCard";
import { VaultButton } from "../components/vault/VaultButton";
import { PixelText } from "../components/PixelText";
import type { Idea } from "../types/api";

export default function MiningResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    ideas: string;
    veinId: string;
    bagMax: string;
    tier: string;
    language: string;
  }>();

  const ideas: Idea[] = JSON.parse(params.ideas ?? "[]");
  const veinId = params.veinId ?? "";
  const bagMax = parseInt(params.bagMax ?? "2", 10);
  const tier = params.tier ?? "free";
  const language = (params.language ?? "ko") as "ko" | "en";
  const isCart = tier === "lite" || tier === "pro";
  const transportLabel = isCart ? "광차에 싣기" : "가방에 담기";

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isVaulting, setIsVaulting] = useState(false);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!isCart && next.size >= bagMax) return prev;
        next.add(id);
      }
      return next;
    });
  };

  const handleVault = async () => {
    if (selectedIds.size === 0) return;
    setIsVaulting(true);
    try {
      await ideasApi.vaultIdeas(Array.from(selectedIds), veinId);
      router.back();
    } catch (e) {
      const msg = e instanceof ApiClientError ? e.message : "반입에 실패했습니다";
      Alert.alert("반입 실패", msg);
    } finally {
      setIsVaulting(false);
    }
  };

  const sortedIdeas = [...ideas].sort((a, b) => a.sort_order - b.sort_order);
  const effectiveBagMax = isCart ? 10 : bagMax;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <PixelText
          variant="body"
          style={styles.back}
          onPress={() => router.back()}
        >
          {"← "}광산으로
        </PixelText>
        <PixelText variant="body" emoji>
          {isCart ? "🛒 " : "🎒 "}
          {selectedIds.size}/{effectiveBagMax}
        </PixelText>
      </View>

      <FlatList
        data={sortedIdeas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <IdeaCard
            idea={item}
            language={language}
            isInBag={selectedIds.has(item.id)}
            bagFull={!isCart && selectedIds.size >= bagMax}
            transportLabel={transportLabel}
            onToggle={() => toggle(item.id)}
          />
        )}
      />

      <VaultButton
        count={selectedIds.size}
        isLoading={isVaulting}
        onPress={handleVault}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: midnight.bg.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: midnight.border.subtle,
  },
  back: {
    color: midnight.accent.gold,
  },
  list: {
    padding: 16,
  },
});
```

- [ ] **Step 2: 커밋**

```bash
git add apps/mobile/app/mining-result.tsx
git commit -m "feat: implement mining result screen (10 ideas, bag select, vault)"
```

---

### Task 17: 최종 통합 + 커밋

- [ ] **Step 1: 전체 빌드 확인**

```bash
cd apps/mobile && npx expo start --web
```

홈 화면, 광맥 선택, 채굴, 원석 결과, 가방 담기, Vault 반입 흐름 확인.

- [ ] **Step 2: 최종 커밋 + 푸시**

```bash
cd "c:/Users/amy/Desktop/Idea Mine"
git add -A
git commit -m "feat: Sprint 2 frontend — The Mine home screen + mining result

- MineStatusBar (2-line profile + resources)
- MiniVeinCard (3-up with gold select border)
- ExpandedVeinCard (keyword chips + mine CTA)
- RerollButton, MiningLoader, ExhaustedBanner
- NicknameModal (first-time user)
- IdeaCard (title, summary, bag toggle)
- VaultButton (sticky bottom)
- mining-result screen (10 ideas, FlatList)
- Vault backend API with bag capacity validation
- useProfile, useMining hooks
- Mining constants (colors, rarity, capacity)

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
git push
```
