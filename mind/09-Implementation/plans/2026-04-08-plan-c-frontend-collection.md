# Plan C: 프론트엔드 — 컬렉션 UI (Task 7~10)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 5개 문서 컬렉션 뷰(개요/감정/설계/청사진/로드맵)를 구현하고, 티어별 해금 + "나머지 전부 생성" 패키지 경험을 만든다.

**Architecture:** Lab의 아이디어 상세 페이지를 컬렉션 뷰로 재구성. 각 문서는 아코디언으로 펼치기/접기. 잠금 문서는 미리보기 카드 + 업셀 CTA. Pro의 "나머지 전부 생성"은 연쇄 로딩 UX.

**Tech Stack:** Next.js 16, React, TypeScript, Tailwind, Framer Motion, React Query, lucide-react

---

### Task 7: 타입 + API 확장

**Files:**
- Modify: `apps/web/src/types/api.ts`
- Modify: `apps/web/src/lib/api.ts`

**Step 1: 타입 추가** (`types/api.ts`에 append)

```typescript
// --- Product Design ---

export interface ProductDesign {
  id: string;
  user_id: string;
  overview_id: string;
  user_flow: string[];
  screens: string[];
  features_must: string[];
  features_should: string[];
  features_later: string[];
  business_model: string;
  business_rules: string[];
  mvp_scope: string;
  axes: { interface_complexity: string; business_complexity: string; technical_complexity: string } | null;
  created_at: string;
}

// --- Blueprint ---

export interface Blueprint {
  id: string;
  user_id: string;
  design_id: string;
  tech_stack: string[];
  data_model_sql: string;
  api_endpoints: string[];
  file_structure: string;
  external_services: string[];
  auth_flow: string[];
  created_at: string;
}

// --- Roadmap ---

export interface Roadmap {
  id: string;
  user_id: string;
  blueprint_id: string;
  phase_0: string[];
  phase_1: string[];
  phase_2: string[];
  validation_checkpoints: string[];
  estimated_complexity: string;
  first_sprint_tasks: string[];
  created_at: string;
}

// --- Collection Status ---

export interface CollectionStatus {
  hasOverview: boolean;
  hasAppraisal: boolean;
  hasDesign: boolean;
  hasBlueprint: boolean;
  hasRoadmap: boolean;
  completionCount: number; // 0~5
}
```

**Step 2: API 추가** (`lib/api.ts`에 append)

```typescript
// --- Collection API ---

export const collectionApi = {
  // 생성
  createDesign: (overviewId: string) =>
    apiFetch<ProductDesign>("/lab/design", {
      method: "POST",
      body: JSON.stringify({ overview_id: overviewId }),
    }),

  createBlueprint: (designId: string) =>
    apiFetch<Blueprint>("/lab/blueprint", {
      method: "POST",
      body: JSON.stringify({ design_id: designId }),
    }),

  createRoadmap: (blueprintId: string) =>
    apiFetch<Roadmap>("/lab/roadmap", {
      method: "POST",
      body: JSON.stringify({ blueprint_id: blueprintId }),
    }),

  generateAll: (overviewId: string) =>
    apiFetch<{ design: ProductDesign; blueprint: Blueprint; roadmap: Roadmap }>(
      "/lab/generate-all",
      { method: "POST", body: JSON.stringify({ overview_id: overviewId }) },
    ),

  // 조회 (Supabase direct)
  async getDesignsByOverview(overviewId: string): Promise<ProductDesign[]> {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    const { data, error } = await supabase
      .from("product_designs")
      .select("*")
      .eq("overview_id", overviewId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as ProductDesign[];
  },

  async getBlueprintsByDesign(designId: string): Promise<Blueprint[]> {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    const { data, error } = await supabase
      .from("blueprints")
      .select("*")
      .eq("design_id", designId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Blueprint[];
  },

  async getRoadmapsByBlueprint(blueprintId: string): Promise<Roadmap[]> {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    const { data, error } = await supabase
      .from("roadmaps")
      .select("*")
      .eq("blueprint_id", blueprintId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Roadmap[];
  },

  // 삭제
  async deleteDesign(id: string): Promise<void> {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    await supabase.from("product_designs").delete().eq("id", id);
  },

  async deleteBlueprint(id: string): Promise<void> {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    await supabase.from("blueprints").delete().eq("id", id);
  },

  async deleteRoadmap(id: string): Promise<void> {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    await supabase.from("roadmaps").delete().eq("id", id);
  },
};
```

**Commit:**
```bash
git add apps/web/src/types/api.ts apps/web/src/lib/api.ts
git commit -m "feat: collection types and API (ProductDesign, Blueprint, Roadmap)"
```

---

### Task 8: 컬렉션 뷰 페이지

**Files:**
- Create: `apps/web/src/app/(app)/lab/collection/[ideaId]/page.tsx`

**이 페이지가 Lab에서 아이디어를 선택했을 때 보이는 메인 뷰.**

**구조:**
```
┌─────────────────────────────────────┐
│ Breadcrumb: Lab > 컬렉션 > 아이디어  │
│                                     │
│ 아이디어 제목                        │
│ 완성도: ■■□□□ 2/5                   │
│                                     │
│ ▼ 개요서                    ✓ 완료  │
│   (펼치면 7섹션 표시)               │
│                                     │
│ ▼ 감정서                    ✓ 완료  │
│   (펼치면 6축 표시)                 │
│                                     │
│ ▶ 제품 설계서         [생성] 또는 🔒 │
│   (Lite+: 생성 버튼, Free: 잠금)    │
│                                     │
│ ▶ 기술 청사진         [생성] 또는 🔒 │
│   (Pro: 생성, 나머지: 잠금)          │
│                                     │
│ ▶ 실행 로드맵         [생성] 또는 🔒 │
│   (Pro: 생성, 나머지: 잠금)          │
│                                     │
│ [나머지 전부 생성] (Pro, 미완성일 때) │
│ [📋 전체 복사] (5/5일 때)           │
└─────────────────────────────────────┘
```

**컴포넌트 분리:**
- `CollectionItem` — 하나의 문서 카드 (아코디언)
- `LockedItem` — 잠금 미리보기 카드
- `CompletionBar` — ■■□□□ 완성도 표시
- `GenerateAllButton` — "나머지 전부 생성" + 연쇄 로딩
- `CopyAllButton` — "전체 복사" (마크다운)

**데이터 로딩:**
```typescript
// 5개 쿼리를 병렬로
const overviews = useQuery(["overviews", ideaId], ...);
const appraisals = useQuery(["appraisals", overviewId], ...);
const designs = useQuery(["designs", overviewId], ...);
const blueprints = useQuery(["blueprints", designId], ...);
const roadmaps = useQuery(["roadmaps", blueprintId], ...);
```

**Commit:**
```bash
git add apps/web/src/app/(app)/lab/collection/
git commit -m "feat: collection view page with accordion documents"
```

---

### Task 9: 잠금 미리보기 카드

**Files:**
- Create: `apps/web/src/components/lab/locked-item.tsx`

**각 잠금 문서의 미리보기 디자인:**

```tsx
interface LockedItemProps {
  title: string;           // "기술 청사진"
  description: string;     // "기술 스택, DB 설계, API..."
  requiredTier: "lite" | "pro";
  icon: React.ReactNode;
}
```

**스타일:**
- 카드: `bg-surface-1/20 border border-dashed border-line-steel/20 rounded-xl p-5`
- 블러 효과: 설명 텍스트가 살짝 blur(2px)
- 잠금 아이콘: Lock from lucide-react
- CTA: "Lite에서 해금" 또는 "Pro에서 해금" 버튼
- 각 문서별 미리보기 문구:
  - 제품 설계: "사용자 흐름, 화면 목록, 비즈니스 규칙 — 뭘 만들지 정하는 문서"
  - 기술 청사진: "기술 스택, DB 설계, API, 파일 구조 — 어떻게 만들지 설계하는 문서"
  - 실행 로드맵: "Phase별 Sprint, 검증 포인트 — 뭐부터 만들지 계획하는 문서"

**Commit:**
```bash
git add apps/web/src/components/lab/locked-item.tsx
git commit -m "feat: locked item card with blur preview and upsell CTA"
```

---

### Task 10: "나머지 전부 생성" 연쇄 로딩 UX

**Files:**
- Create: `apps/web/src/components/lab/generate-all-loading.tsx`

**"나머지 전부 생성" 클릭 시 보이는 전체 화면 로딩:**

```
┌─────────────────────────────────────┐
│         프로젝트 컬렉션 생성 중       │
│                                     │
│  [✓] 축 분류 완료                    │
│  [✓] 제품 설계서 완료                │
│  [▶] 기술 청사진 생성 중...          │  ← 현재 단계 강조
│  [□] 실행 로드맵 대기                │
│  [□] 품질 검증 대기                  │
│                                     │
│  ████████████░░░░░░░░ 60%           │
│                                     │
│  52초 경과...                       │
└─────────────────────────────────────┘
```

**구현:**
- `POST /lab/generate-all`은 단일 API 호출 (서버에서 순차 실행)
- 프론트는 예상 시간 기반으로 진행 단계 시뮬레이션:
  - 0~5초: "축 분류 중..."
  - 5~35초: "제품 설계서 생성 중..."
  - 35~65초: "기술 청사진 생성 중..."
  - 65~80초: "실행 로드맵 생성 중..."
  - 80초+: "품질 검증 중..."
- 완료 시: 5/5 🎉 + 컬렉션 뷰로 전환

**Commit:**
```bash
git add apps/web/src/components/lab/generate-all-loading.tsx
git commit -m "feat: generate-all chain loading UX with step progress"
```

---

## 최종: Lab 네비게이션 업데이트

기존 Lab 페이지에서 "개요 생성" 대신 **"컬렉션 보기"**로 연결:

**Modify:** `apps/web/src/app/(app)/lab/page.tsx`

- 아이디어 클릭 → `/lab/collection/[ideaId]` 이동 (기존: `/lab/overview/[ideaId]`)
- 기존 overview/appraisal/full 페이지는 유지 (컬렉션 뷰에서 각 문서 펼칠 때 inline으로 표시하거나, 상세 보기로 링크)

**Commit:**
```bash
git add apps/web/src/app/(app)/lab/
git commit -m "feat: lab navigation → collection view as default"
```

---

## 전체 검증

1. `npm run build` 성공
2. Free 유저: 개요+감정만 보이고, 나머지 3개는 잠금 미리보기
3. Lite 유저: 개요+감정+제품 설계 가능, 나머지 2개 잠금
4. Pro 유저: "나머지 전부 생성" → 5/5 완성 → "전체 복사"
5. 바이브 코딩 테스트: 전체 복사 → Claude Code에 넣으면 프로젝트 시작 가능
