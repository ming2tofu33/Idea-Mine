---
title: Sprint 3 Vault + Lab Implementation Plan
tags:
  - implementation
  - plan
  - sprint-3
  - vault
  - lab
---

# Sprint 3 — Vault + Lab Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 금고에서 저장된 원석을 관리하고, 실험실에서 원석을 프로젝트 개요서로 발전시키는 전체 흐름을 구현한다.

**Architecture:** Vault는 Supabase 직접 조회 (읽기 전용, RLS 보호), Lab 개요서 생성은 백엔드 API (OpenAI, 한/영 동시, 4섹션 + 감정 점수). 프론트는 카드 UI 기능 우선, 비주얼은 placeholder.

**Tech Stack:** Expo Router, TypeScript, Supabase JS Client, FastAPI, OpenAI API (gpt-4o-mini)

---

## 파일 구조

### 새로 생성

| 파일 | 역할 |
|------|------|
| `backend/app/routers/lab.py` | 개요서 생성 API |
| `backend/app/services/overview_service.py` | 개요서 생성 로직 (OpenAI) |
| `backend/app/prompts/overview.py` | 개요서 프롬프트 |
| `apps/mobile/types/overview.ts` | Overview 타입 정의 |
| `apps/mobile/hooks/useVault.ts` | 금고 데이터 조회 훅 |
| `apps/mobile/app/vault-full.tsx` | 전체 보기 (그리드/리스트 탭) |
| `apps/mobile/app/idea-detail.tsx` | 원석 상세 화면 |
| `apps/mobile/app/lab-entry.tsx` | Lab 진입 (원석 확인 + CTA) |
| `apps/mobile/app/overview-result.tsx` | 개요서 결과 화면 |
| `apps/mobile/components/lab/LabLoader.tsx` | 개요서 생성 로딩 연출 |
| `apps/mobile/components/vault/OverviewCard.tsx` | 개요서 카드 (리스트용) |

### 수정

| 파일 | 변경 |
|------|------|
| `apps/mobile/app/(tabs)/vault.tsx` | placeholder → 금고 메인 홈 |
| `apps/mobile/app/(tabs)/lab.tsx` | placeholder 유지 or "금고에서 원석을 보내주세요" 안내 |
| `apps/mobile/types/api.ts` | Overview 타입 import/re-export |
| `apps/mobile/lib/api.ts` | vaultApi + labApi 추가 |
| `backend/app/main.py` | lab 라우터 등록 |
| `backend/app/models/schemas.py` | OverviewOut 스키마 추가 |

### DB (Amy가 Supabase SQL Editor에서 실행)

```sql
CREATE TABLE overviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  idea_id uuid REFERENCES ideas(id) NOT NULL,
  problem_ko text NOT NULL,
  problem_en text NOT NULL,
  target_ko text NOT NULL,
  target_en text NOT NULL,
  features_ko text NOT NULL,
  features_en text NOT NULL,
  revenue_ko text NOT NULL,
  revenue_en text NOT NULL,
  market_score int NOT NULL DEFAULT 0,
  feasibility_score int NOT NULL DEFAULT 0,
  market_comment_ko text NOT NULL DEFAULT '',
  market_comment_en text NOT NULL DEFAULT '',
  feasibility_comment_ko text NOT NULL DEFAULT '',
  feasibility_comment_en text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE overviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own overviews"
  ON overviews FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own overviews"
  ON overviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

---

## Chunk 1: 백엔드 — 개요서 생성 API

### Task 1: 개요서 프롬프트

**Files:**
- Create: `backend/app/prompts/overview.py`

- [ ] **Step 1: 프롬프트 생성**

영어 프롬프트. 원석의 title/summary/keywords를 받아서 4섹션 + 감정 점수를 한/영 동시 생성.

```python
# backend/app/prompts/overview.py
def build_overview_prompt(
    title_ko: str,
    title_en: str,
    summary_ko: str,
    summary_en: str,
    keywords: list[dict],
) -> str:
    """개요서 생성 프롬프트. 영어로 작성, 한/영 동시 출력."""
    kw_list = ", ".join(f"{kw['en']} ({kw['category'].upper()})" for kw in keywords)

    return f"""You are a startup project analyst for IDEA MINE.

A user has selected this idea from their mining session:

Title: {title_en}
Summary: {summary_en}
Keywords used: {kw_list}

Generate a PROJECT OVERVIEW with 4 sections + appraisal scores.

=== SECTIONS ===

1. PROBLEM: What real problem does this solve? Who feels this pain? (2-3 sentences)
2. TARGET: Who is the primary user? Be specific about demographics, behavior, context. (2-3 sentences)
3. FEATURES: What are the 3-4 core features of the MVP? (bullet points)
4. REVENUE: How does this make money? What's the pricing model? (2-3 sentences)

=== APPRAISAL ===

Rate the idea on two dimensions (1-10 scale):

- MARKET_SCORE: How large and accessible is the market? Is there demand?
- FEASIBILITY_SCORE: How realistic is it to build an MVP in 2-3 months with a small team?

For each score, provide a one-sentence comment explaining the rating.

=== RESPONSE FORMAT ===
Respond ONLY with valid JSON. Generate BOTH Korean and English:
{{
  "problem_ko": "한국어 문제 정의",
  "problem_en": "English problem definition",
  "target_ko": "한국어 타깃 사용자",
  "target_en": "English target users",
  "features_ko": "한국어 핵심 기능 (bullet points with \\n)",
  "features_en": "English core features (bullet points with \\n)",
  "revenue_ko": "한국어 수익 구조",
  "revenue_en": "English revenue model",
  "market_score": 7,
  "market_comment_ko": "한국어 시장성 코멘트",
  "market_comment_en": "English market comment",
  "feasibility_score": 8,
  "feasibility_comment_ko": "한국어 실행성 코멘트",
  "feasibility_comment_en": "English feasibility comment"
}}

- Korean should feel natural (not translated)
- English should feel natural (not translated)
- features should use bullet points separated by \\n
- Scores must be integers 1-10"""
```

- [ ] **Step 2: 커밋**

```bash
git add backend/app/prompts/overview.py
git commit -m "feat: add overview generation prompt (4 sections + appraisal, KO/EN)"
```

---

### Task 2: 개요서 생성 서비스

**Files:**
- Create: `backend/app/services/overview_service.py`

- [ ] **Step 1: 서비스 구현**

```python
# backend/app/services/overview_service.py
import json
import time
import uuid
from openai import OpenAI
from supabase import Client
from app.config import settings
from app.prompts.overview import build_overview_prompt

_openai: OpenAI | None = None

MODEL = "gpt-4o-mini"
PROMPT_VERSION = "overview-v1"
COST_PER_1K_INPUT = 0.00015
COST_PER_1K_OUTPUT = 0.0006


def get_openai() -> OpenAI:
    global _openai
    if _openai is None:
        _openai = OpenAI(api_key=settings.openai_api_key)
    return _openai


async def generate_overview(
    supabase: Client,
    user_id: str,
    tier: str,
    idea: dict,
    source: str = "app",
) -> dict:
    """원석 1개 → 프로젝트 개요서 생성 (한/영 + 감정 점수)."""
    session_id = str(uuid.uuid4())

    prompt = build_overview_prompt(
        title_ko=idea["title_ko"],
        title_en=idea["title_en"],
        summary_ko=idea["summary_ko"],
        summary_en=idea["summary_en"],
        keywords=idea["keyword_combo"],
    )

    client = get_openai()
    start_time = time.time()

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            response_format={"type": "json_object"},
        )

        elapsed_ms = int((time.time() - start_time) * 1000)
        content = response.choices[0].message.content
        result = json.loads(content)

        input_tokens = response.usage.prompt_tokens
        output_tokens = response.usage.completion_tokens
        total_cost = (
            input_tokens / 1000 * COST_PER_1K_INPUT
            + output_tokens / 1000 * COST_PER_1K_OUTPUT
        )

        await _log_ai_usage(
            supabase,
            user_id=user_id,
            tier=tier,
            session_id=session_id,
            feature_type="overview",
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_cost=total_cost,
            response_time_ms=elapsed_ms,
            status="success",
            source=source,
        )

    except Exception:
        elapsed_ms = int((time.time() - start_time) * 1000)
        await _log_ai_usage(
            supabase,
            user_id=user_id,
            tier=tier,
            session_id=session_id,
            feature_type="overview",
            input_tokens=0,
            output_tokens=0,
            total_cost=0,
            response_time_ms=elapsed_ms,
            status="error",
            source=source,
        )
        raise

    # DB 저장
    row = (
        supabase.table("overviews")
        .insert({
            "user_id": user_id,
            "idea_id": idea["id"],
            "problem_ko": result.get("problem_ko", ""),
            "problem_en": result.get("problem_en", ""),
            "target_ko": result.get("target_ko", ""),
            "target_en": result.get("target_en", ""),
            "features_ko": result.get("features_ko", ""),
            "features_en": result.get("features_en", ""),
            "revenue_ko": result.get("revenue_ko", ""),
            "revenue_en": result.get("revenue_en", ""),
            "market_score": result.get("market_score", 0),
            "feasibility_score": result.get("feasibility_score", 0),
            "market_comment_ko": result.get("market_comment_ko", ""),
            "market_comment_en": result.get("market_comment_en", ""),
            "feasibility_comment_ko": result.get("feasibility_comment_ko", ""),
            "feasibility_comment_en": result.get("feasibility_comment_en", ""),
        })
        .execute()
    )

    return row.data[0]


async def _log_ai_usage(supabase: Client, **fields) -> None:
    supabase.table("ai_usage_logs").insert({
        "user_id": fields["user_id"],
        "tier": fields["tier"],
        "session_id": fields["session_id"],
        "feature_type": fields["feature_type"],
        "model": MODEL,
        "prompt_version": PROMPT_VERSION,
        "input_tokens": fields["input_tokens"],
        "output_tokens": fields["output_tokens"],
        "total_cost_usd": fields["total_cost"],
        "response_time_ms": fields["response_time_ms"],
        "status": fields["status"],
        "language": "both",
        "source": fields.get("source", "app"),
    }).execute()
```

- [ ] **Step 2: 커밋**

```bash
git add backend/app/services/overview_service.py
git commit -m "feat: add overview_service (OpenAI generation + DB save + cost logging)"
```

---

### Task 3: Lab 라우터

**Files:**
- Create: `backend/app/routers/lab.py`
- Modify: `backend/app/main.py`
- Modify: `backend/app/models/schemas.py`

- [ ] **Step 1: 라우터 + 스키마 생성**

```python
# backend/app/routers/lab.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import Client
from app.dependencies import get_supabase, get_current_user
from app.services import overview_service

router = APIRouter(prefix="/lab", tags=["lab"])


class OverviewRequest(BaseModel):
    idea_id: str


@router.post("/overview")
async def create_overview(
    req: OverviewRequest,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """원석 → 프로젝트 개요서 생성."""
    # 아이디어 조회 + 소유권 확인
    idea_result = (
        supabase.table("ideas")
        .select("*")
        .eq("id", req.idea_id)
        .eq("user_id", user["id"])
        .execute()
    )

    if not idea_result.data:
        raise HTTPException(status_code=404, detail="Idea not found")

    idea = idea_result.data[0]

    # 이미 개요서가 있는지 확인
    existing = (
        supabase.table("overviews")
        .select("id")
        .eq("idea_id", req.idea_id)
        .eq("user_id", user["id"])
        .execute()
    )

    if existing.data:
        raise HTTPException(
            status_code=409,
            detail={"error": "overview_exists", "message": "이 원석의 개요서가 이미 존재합니다"}
        )

    overview = await overview_service.generate_overview(
        supabase=supabase,
        user_id=user["id"],
        tier=user.get("tier", "free"),
        idea=idea,
        source="app",
    )

    return overview
```

- [ ] **Step 2: schemas.py에 OverviewOut 추가**

```python
class OverviewOut(BaseModel):
    id: str
    idea_id: str
    problem_ko: str
    problem_en: str
    target_ko: str
    target_en: str
    features_ko: str
    features_en: str
    revenue_ko: str
    revenue_en: str
    market_score: int
    feasibility_score: int
    market_comment_ko: str
    market_comment_en: str
    feasibility_comment_ko: str
    feasibility_comment_en: str
```

- [ ] **Step 3: main.py에 lab 라우터 등록**

`from app.routers import mining, ideas, admin, lab` + `app.include_router(lab.router)`

- [ ] **Step 4: 커밋**

```bash
git add backend/app/routers/lab.py backend/app/models/schemas.py backend/app/main.py
git commit -m "feat: add Lab router — POST /lab/overview (overview generation)"
```

---

## Chunk 2: 프론트엔드 — 타입 + API + 훅

### Task 4: Overview 타입

**Files:**
- Create: `apps/mobile/types/overview.ts`

- [ ] **Step 1: 타입 정의**

```typescript
// apps/mobile/types/overview.ts
export interface Overview {
  id: string;
  idea_id: string;
  problem_ko: string;
  problem_en: string;
  target_ko: string;
  target_en: string;
  features_ko: string;
  features_en: string;
  revenue_ko: string;
  revenue_en: string;
  market_score: number;
  feasibility_score: number;
  market_comment_ko: string;
  market_comment_en: string;
  feasibility_comment_ko: string;
  feasibility_comment_en: string;
  created_at: string;
}
```

- [ ] **Step 2: 커밋**

```bash
git add apps/mobile/types/overview.ts
git commit -m "feat: add Overview type definition"
```

---

### Task 5: API 클라이언트 확장

**Files:**
- Modify: `apps/mobile/lib/api.ts`

- [ ] **Step 1: vaultApi + labApi 추가**

api.ts에 추가:

```typescript
// --- Vault API (Supabase 직접 조회) ---

import { supabase } from "./supabase";
import type { Idea } from "../types/api";
import type { Overview } from "../types/overview";

export const vaultApi = {
  async getVaultedIdeas(): Promise<Idea[]> {
    const { data, error } = await supabase
      .from("ideas")
      .select("*")
      .eq("is_vaulted", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getOverviews(): Promise<Overview[]> {
    const { data, error } = await supabase
      .from("overviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async deleteIdea(ideaId: string): Promise<void> {
    const { error } = await supabase
      .from("ideas")
      .delete()
      .eq("id", ideaId);
    if (error) throw error;
  },
};

// --- Lab API (백엔드) ---

export const labApi = {
  createOverview(ideaId: string): Promise<Overview> {
    return apiFetch("/lab/overview", {
      method: "POST",
      body: JSON.stringify({ idea_id: ideaId }),
    });
  },
};
```

Note: vaultApi는 Supabase 직접 조회 (RLS 보호), labApi는 백엔드 경유 (OpenAI 호출).

- [ ] **Step 2: 커밋**

```bash
git add apps/mobile/lib/api.ts
git commit -m "feat: add vaultApi (Supabase direct) + labApi (backend)"
```

---

### Task 6: useVault 훅

**Files:**
- Create: `apps/mobile/hooks/useVault.ts`

- [ ] **Step 1: 훅 생성**

```typescript
// apps/mobile/hooks/useVault.ts
import { useState, useCallback } from "react";
import { vaultApi } from "../lib/api";
import type { Idea } from "../types/api";
import type { Overview } from "../types/overview";

export function useVault() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [overviews, setOverviews] = useState<Overview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVault = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ideasData, overviewsData] = await Promise.all([
        vaultApi.getVaultedIdeas(),
        vaultApi.getOverviews(),
      ]);
      setIdeas(ideasData);
      setOverviews(overviewsData);
    } catch (e) {
      setError("금고 데이터를 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteIdea = async (ideaId: string) => {
    try {
      await vaultApi.deleteIdea(ideaId);
      setIdeas((prev) => prev.filter((i) => i.id !== ideaId));
    } catch {
      setError("원석을 삭제하지 못했습니다");
    }
  };

  return { ideas, overviews, loading, error, loadVault, deleteIdea };
}
```

- [ ] **Step 2: 커밋**

```bash
git add apps/mobile/hooks/useVault.ts
git commit -m "feat: add useVault hook (ideas + overviews + delete)"
```

---

## Chunk 3: 프론트엔드 — Vault 화면들

### Task 7: Vault 메인 홈

**Files:**
- Modify: `apps/mobile/app/(tabs)/vault.tsx`

- [ ] **Step 1: 금고 메인 홈 구현**

최근 원석 미리보기 + 통계 + "전체 보기" 버튼. 간소화 버전 (핀/트레이 제외).

```tsx
// apps/mobile/app/(tabs)/vault.tsx
import { useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight } from "../../constants/theme";
import { useVault } from "../../hooks/useVault";
import { useProfile } from "../../hooks/useProfile";
import { PixelText } from "../../components/PixelText";
import { PixelButton } from "../../components/PixelButton";
import { PixelCard } from "../../components/PixelCard";
import { KeywordChip } from "../../components/shared/KeywordChip";

export default function VaultScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const { ideas, overviews, loading, loadVault } = useVault();
  const language = profile?.language ?? "ko";

  useEffect(() => {
    loadVault();
  }, [loadVault]);

  const recentIdeas = ideas.slice(0, 4);
  const latestIdea = ideas[0];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <PixelText variant="title" style={styles.heading}>금고</PixelText>
        <PixelText variant="body" style={styles.sub}>
          내가 모은 원석과 개요서
        </PixelText>

        {/* 통계 */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <PixelText variant="title">{ideas.length}</PixelText>
            <PixelText variant="caption" style={styles.statLabel}>원석</PixelText>
          </View>
          <View style={styles.statBox}>
            <PixelText variant="title">{overviews.length}</PixelText>
            <PixelText variant="caption" style={styles.statLabel}>개요서</PixelText>
          </View>
        </View>

        {/* 대표 원석 */}
        {latestIdea && (
          <TouchableOpacity
            onPress={() => router.push({
              pathname: "/idea-detail",
              params: { ideaId: latestIdea.id, language },
            })}
          >
            <PixelCard variant="gold" header="최근 반입된 원석">
              <PixelText variant="subtitle">
                {language === "ko" ? latestIdea.title_ko : latestIdea.title_en}
              </PixelText>
              <PixelText variant="body" style={styles.cardSummary}>
                {language === "ko" ? latestIdea.summary_ko : latestIdea.summary_en}
              </PixelText>
              <View style={styles.chips}>
                {latestIdea.keyword_combo.slice(0, 3).map((kc, i) => (
                  <KeywordChip key={i} category={kc.category} label={kc[language]} size="small" />
                ))}
              </View>
            </PixelCard>
          </TouchableOpacity>
        )}

        {/* 전체 보기 */}
        <PixelButton
          title={`전체 보기 (원석 ${ideas.length} · 개요서 ${overviews.length})`}
          variant="secondary"
          onPress={() => router.push({ pathname: "/vault-full", params: { language } })}
          style={styles.fullButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: midnight.bg.primary },
  scroll: { flex: 1 },
  content: { padding: 16 },
  heading: { marginBottom: 4 },
  sub: { color: midnight.text.secondary, marginBottom: 20 },
  statsRow: { flexDirection: "row", marginBottom: 20 },
  statBox: {
    flex: 1,
    backgroundColor: midnight.bg.elevated,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
  },
  statLabel: { color: midnight.text.muted, marginTop: 4 },
  cardSummary: { color: midnight.text.secondary, marginTop: 6, marginBottom: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap" },
  fullButton: { marginTop: 16, alignSelf: "stretch" },
});
```

- [ ] **Step 2: 커밋**

```bash
git add "apps/mobile/app/(tabs)/vault.tsx"
git commit -m "feat: Vault home — stats, latest idea, full view button"
```

---

### Task 8: Vault 전체 보기

**Files:**
- Create: `apps/mobile/app/vault-full.tsx`
- Create: `apps/mobile/components/vault/OverviewCard.tsx`

- [ ] **Step 1: OverviewCard 컴포넌트**

```tsx
// apps/mobile/components/vault/OverviewCard.tsx
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { PixelText } from "../PixelText";
import { midnight } from "../../constants/theme";
import type { Overview } from "../../types/overview";

interface OverviewCardProps {
  overview: Overview;
  language: "ko" | "en";
  onPress: () => void;
}

export function OverviewCard({ overview, language, onPress }: OverviewCardProps) {
  const problem = language === "ko" ? overview.problem_ko : overview.problem_en;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.scores}>
        <PixelText variant="caption" style={styles.score}>
          시장 {overview.market_score}/10
        </PixelText>
        <PixelText variant="caption" style={styles.score}>
          실행 {overview.feasibility_score}/10
        </PixelText>
      </View>
      <PixelText variant="body" numberOfLines={2} style={styles.problem}>
        {problem}
      </PixelText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: midnight.bg.elevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: midnight.border.default,
    padding: 14,
    marginBottom: 10,
  },
  scores: { flexDirection: "row", marginBottom: 6 },
  score: { color: midnight.accent.gold, marginRight: 12 },
  problem: { color: midnight.text.primary },
});
```

- [ ] **Step 2: vault-full.tsx 화면**

```tsx
// apps/mobile/app/vault-full.tsx
import { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight } from "../constants/theme";
import { useVault } from "../hooks/useVault";
import { IdeaCard } from "../components/vault/IdeaCard";
import { OverviewCard } from "../components/vault/OverviewCard";
import { PixelText } from "../components/PixelText";

type Tab = "ideas" | "overviews";

export default function VaultFullScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ language: string }>();
  const language = (params.language ?? "ko") as "ko" | "en";
  const { ideas, overviews, loading, loadVault } = useVault();
  const [tab, setTab] = useState<Tab>("ideas");

  useEffect(() => {
    loadVault();
  }, [loadVault]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <PixelText variant="body" style={styles.back} onPress={() => router.back()}>
          {"← "}금고
        </PixelText>
        <PixelText variant="subtitle">전체 보기</PixelText>
      </View>

      {/* 탭 */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === "ideas" && styles.tabActive]}
          onPress={() => setTab("ideas")}
        >
          <PixelText variant="body" style={tab === "ideas" ? styles.tabTextActive : styles.tabText}>
            원석 ({ideas.length})
          </PixelText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "overviews" && styles.tabActive]}
          onPress={() => setTab("overviews")}
        >
          <PixelText variant="body" style={tab === "overviews" ? styles.tabTextActive : styles.tabText}>
            개요서 ({overviews.length})
          </PixelText>
        </TouchableOpacity>
      </View>

      {tab === "ideas" ? (
        <FlatList
          data={ideas}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => router.push({
                pathname: "/idea-detail",
                params: { ideaId: item.id, language },
              })}
            >
              <PixelText variant="caption" numberOfLines={2}>
                {language === "ko" ? item.title_ko : item.title_en}
              </PixelText>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={overviews}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <OverviewCard
              overview={item}
              language={language}
              onPress={() => router.push({
                pathname: "/overview-result",
                params: { overviewId: item.id, language },
              })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: midnight.bg.primary },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: midnight.border.subtle,
    gap: 12,
  },
  back: { color: midnight.accent.gold },
  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: midnight.border.subtle },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: midnight.accent.gold },
  tabText: { color: midnight.text.muted },
  tabTextActive: { color: midnight.accent.gold },
  grid: { padding: 8 },
  gridItem: {
    flex: 1,
    backgroundColor: midnight.bg.elevated,
    borderRadius: 6,
    padding: 12,
    margin: 4,
    minHeight: 60,
  },
  list: { padding: 16 },
});
```

- [ ] **Step 3: 커밋**

```bash
git add apps/mobile/app/vault-full.tsx apps/mobile/components/vault/OverviewCard.tsx
git commit -m "feat: Vault full view — ideas grid + overviews list with tabs"
```

---

### Task 9: 원석 상세 화면

**Files:**
- Create: `apps/mobile/app/idea-detail.tsx`

- [ ] **Step 1: 원석 상세 구현**

```tsx
// apps/mobile/app/idea-detail.tsx
import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight } from "../constants/theme";
import { supabase } from "../lib/supabase";
import { vaultApi } from "../lib/api";
import { PixelText } from "../components/PixelText";
import { PixelButton } from "../components/PixelButton";
import { KeywordChip } from "../components/shared/KeywordChip";
import type { Idea } from "../types/api";

export default function IdeaDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ ideaId: string; language: string }>();
  const language = (params.language ?? "ko") as "ko" | "en";
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("ideas")
        .select("*")
        .eq("id", params.ideaId)
        .single();
      if (data) setIdea(data as Idea);
      setLoading(false);
    }
    load();
  }, [params.ideaId]);

  const handleDelete = () => {
    Alert.alert("원석 삭제", "이 원석을 금고에서 삭제할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          await vaultApi.deleteIdea(params.ideaId!);
          router.back();
        },
      },
    ]);
  };

  const handleSendToLab = () => {
    router.push({
      pathname: "/lab-entry",
      params: { ideaId: params.ideaId, language },
    });
  };

  if (loading || !idea) return null;

  const title = language === "ko" ? idea.title_ko : idea.title_en;
  const summary = language === "ko" ? idea.summary_ko : idea.summary_en;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <PixelText variant="body" style={styles.back} onPress={() => router.back()}>
          {"← "}금고
        </PixelText>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <PixelText variant="title">{title}</PixelText>
        <PixelText variant="body" style={styles.summary}>{summary}</PixelText>

        <View style={styles.chips}>
          {idea.keyword_combo.map((kc, i) => (
            <KeywordChip key={i} category={kc.category} label={kc[language]} />
          ))}
        </View>

        <PixelButton
          title="실험실로 보내기"
          variant="primary"
          onPress={handleSendToLab}
          style={styles.ctaButton}
        />

        <PixelButton
          title="원석 삭제"
          variant="danger"
          onPress={handleDelete}
          style={styles.deleteButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: midnight.bg.primary },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: midnight.border.subtle,
  },
  back: { color: midnight.accent.gold },
  content: { padding: 16 },
  summary: { color: midnight.text.secondary, marginTop: 8, marginBottom: 16 },
  chips: { flexDirection: "row", flexWrap: "wrap", marginBottom: 24 },
  ctaButton: { marginBottom: 12, alignSelf: "stretch" },
  deleteButton: { alignSelf: "stretch" },
});
```

- [ ] **Step 2: 커밋**

```bash
git add apps/mobile/app/idea-detail.tsx
git commit -m "feat: idea detail — view, delete, send to lab"
```

---

## Chunk 4: 프론트엔드 — Lab 화면들

### Task 10: Lab 로딩 연출

**Files:**
- Create: `apps/mobile/components/lab/LabLoader.tsx`

- [ ] **Step 1: 로딩 컴포넌트**

세계관 메시지가 단계별로 바뀌는 로딩.

```tsx
// apps/mobile/components/lab/LabLoader.tsx
import { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { PixelText } from "../PixelText";
import { midnight } from "../../constants/theme";

const MESSAGES = [
  { ko: "원석의 결을 정리하는 중이에요", en: "Organizing the gem's structure..." },
  { ko: "프로젝트 개요 틀을 맞추고 있어요", en: "Shaping the project outline..." },
  { ko: "읽기 좋은 문서로 다듬는 중이에요", en: "Polishing into a readable document..." },
];

interface LabLoaderProps {
  language: "ko" | "en";
}

export function LabLoader({ language }: LabLoaderProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i < MESSAGES.length - 1 ? i + 1 : i));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={midnight.accent.gold} />
      <PixelText variant="subtitle" style={styles.text}>
        {MESSAGES[index][language]}
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
git add apps/mobile/components/lab/LabLoader.tsx
git commit -m "feat: add LabLoader with worldview stage messages"
```

---

### Task 11: Lab 진입 + 개요서 결과

**Files:**
- Create: `apps/mobile/app/lab-entry.tsx`
- Create: `apps/mobile/app/overview-result.tsx`

- [ ] **Step 1: Lab 진입 화면**

```tsx
// apps/mobile/app/lab-entry.tsx
import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight } from "../constants/theme";
import { supabase } from "../lib/supabase";
import { labApi, ApiClientError } from "../lib/api";
import { PixelText } from "../components/PixelText";
import { PixelButton } from "../components/PixelButton";
import { KeywordChip } from "../components/shared/KeywordChip";
import { LabLoader } from "../components/lab/LabLoader";
import type { Idea } from "../types/api";

export default function LabEntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ ideaId: string; language: string }>();
  const language = (params.language ?? "ko") as "ko" | "en";
  const [idea, setIdea] = useState<Idea | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("ideas")
        .select("*")
        .eq("id", params.ideaId)
        .single();
      if (data) setIdea(data as Idea);
    }
    load();
  }, [params.ideaId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const overview = await labApi.createOverview(params.ideaId!);
      router.replace({
        pathname: "/overview-result",
        params: { overviewId: overview.id, language },
      });
    } catch (e) {
      setIsGenerating(false);
      const msg = e instanceof ApiClientError ? e.message : "개요서 생성에 실패했습니다";
      setError(msg);
    }
  };

  if (isGenerating) return <LabLoader language={language} />;
  if (!idea) return null;

  const title = language === "ko" ? idea.title_ko : idea.title_en;
  const summary = language === "ko" ? idea.summary_ko : idea.summary_en;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <PixelText variant="body" style={styles.back} onPress={() => router.back()}>
          {"← "}돌아가기
        </PixelText>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <PixelText variant="title" style={styles.heading}>
          이 원석을 프로젝트 개요로 다듬어볼까요?
        </PixelText>

        <View style={styles.workbench}>
          <PixelText variant="subtitle">{title}</PixelText>
          <PixelText variant="body" style={styles.summary}>{summary}</PixelText>
          <View style={styles.chips}>
            {idea.keyword_combo.map((kc, i) => (
              <KeywordChip key={i} category={kc.category} label={kc[language]} />
            ))}
          </View>
        </View>

        {error && (
          <PixelText variant="caption" style={styles.error}>{error}</PixelText>
        )}

        <PixelButton
          title="이 원석으로 개요서 만들기"
          variant="primary"
          onPress={handleGenerate}
          style={styles.cta}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: midnight.bg.primary },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: midnight.border.subtle,
  },
  back: { color: midnight.accent.gold },
  content: { padding: 16 },
  heading: { marginBottom: 20 },
  workbench: {
    backgroundColor: midnight.bg.elevated,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  summary: { color: midnight.text.secondary, marginTop: 8, marginBottom: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap" },
  error: { color: midnight.status.error, marginBottom: 12 },
  cta: { alignSelf: "stretch" },
});
```

- [ ] **Step 2: 개요서 결과 화면**

```tsx
// apps/mobile/app/overview-result.tsx
import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight } from "../constants/theme";
import { supabase } from "../lib/supabase";
import { PixelText } from "../components/PixelText";
import { PixelButton } from "../components/PixelButton";
import type { Overview } from "../types/overview";

export default function OverviewResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ overviewId: string; language: string }>();
  const language = (params.language ?? "ko") as "ko" | "en";
  const [overview, setOverview] = useState<Overview | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("overviews")
        .select("*")
        .eq("id", params.overviewId)
        .single();
      if (data) setOverview(data as Overview);
    }
    load();
  }, [params.overviewId]);

  if (!overview) return null;

  const get = (field: string) =>
    overview[`${field}_${language}` as keyof Overview] as string;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <PixelText variant="body" style={styles.back} onPress={() => router.back()}>
          {"← "}돌아가기
        </PixelText>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <PixelText variant="title" style={styles.heading}>
          프로젝트 개요서
        </PixelText>

        {/* 감정 점수 */}
        <View style={styles.scoresRow}>
          <View style={styles.scoreBox}>
            <PixelText variant="title" style={styles.scoreNum}>
              {overview.market_score}
            </PixelText>
            <PixelText variant="caption" style={styles.scoreLabel}>시장성</PixelText>
            <PixelText variant="caption" style={styles.scoreComment}>
              {get("market_comment")}
            </PixelText>
          </View>
          <View style={styles.scoreBox}>
            <PixelText variant="title" style={styles.scoreNum}>
              {overview.feasibility_score}
            </PixelText>
            <PixelText variant="caption" style={styles.scoreLabel}>실행성</PixelText>
            <PixelText variant="caption" style={styles.scoreComment}>
              {get("feasibility_comment")}
            </PixelText>
          </View>
        </View>

        {/* 4섹션 */}
        <Section title="문제 정의" content={get("problem")} />
        <Section title="타깃 사용자" content={get("target")} />
        <Section title="핵심 기능" content={get("features")} />
        <Section title="수익 구조" content={get("revenue")} />

        <PixelButton
          title="금고로 돌아가기"
          variant="secondary"
          onPress={() => router.push("/(tabs)/vault")}
          style={styles.backButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <View style={sectionStyles.container}>
      <PixelText variant="subtitle" style={sectionStyles.title}>{title}</PixelText>
      <PixelText variant="body" style={sectionStyles.content}>{content}</PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: midnight.bg.primary },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: midnight.border.subtle,
  },
  back: { color: midnight.accent.gold },
  content: { padding: 16 },
  heading: { marginBottom: 16 },
  scoresRow: { flexDirection: "row", marginBottom: 24 },
  scoreBox: {
    flex: 1,
    backgroundColor: midnight.bg.elevated,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginHorizontal: 4,
  },
  scoreNum: { color: midnight.accent.gold, fontSize: 28 },
  scoreLabel: { color: midnight.text.muted, marginTop: 4 },
  scoreComment: { color: midnight.text.secondary, marginTop: 6, textAlign: "center" },
  backButton: { marginTop: 24, alignSelf: "stretch" },
});

const sectionStyles = StyleSheet.create({
  container: {
    backgroundColor: midnight.bg.elevated,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  title: { color: midnight.accent.gold, marginBottom: 8 },
  content: { color: midnight.text.primary },
});
```

- [ ] **Step 3: 커밋**

```bash
git add apps/mobile/app/lab-entry.tsx apps/mobile/app/overview-result.tsx
git commit -m "feat: Lab entry + overview result screen (4 sections + appraisal scores)"
```

---

### Task 12: Lab 탭 업데이트 + 최종 통합

- [ ] **Step 1: Lab 탭을 안내 화면으로**

`apps/mobile/app/(tabs)/lab.tsx`를 수정하여 "금고에서 원석을 선택해 실험실로 보내주세요" 안내 표시.

- [ ] **Step 2: DB 마이그레이션 (Amy — Supabase SQL Editor)**

overviews 테이블 + RLS 생성. SQL은 계획서 상단 참조.

- [ ] **Step 3: 최종 커밋 + 푸시**

```bash
git add -A
git commit -m "feat: Sprint 3 — Vault + Lab complete

- Vault home (stats, latest idea, full view)
- Vault full view (ideas grid, overviews list, tabs)
- Idea detail (view, delete, send to lab)
- Lab entry (idea preview + generate CTA)
- LabLoader (worldview stage messages)
- Overview result (4 sections + appraisal scores)
- Backend: POST /lab/overview (OpenAI, KO/EN, 4 sections + scores)
- Overview type + useVault hook + vaultApi + labApi

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
git push
```
