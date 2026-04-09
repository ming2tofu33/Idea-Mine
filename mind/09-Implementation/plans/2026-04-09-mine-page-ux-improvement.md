---
title: Mine Page UX Improvement Plan
tags:
  - implementation
  - web
  - ux
---

# Mine 페이지 UI/UX 개선 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mine 페이지의 5가지 UX 문제(광맥 카드 가독성, 영/한 혼용, 레이더 공간 낭비, Support 섹션 과다 노출, 코드네임 불명확)를 해결하고, 다국어(ko/en) 지원 기반을 마련한다.

**Architecture:** `mine-labels.ts` 다국어 라벨 파일을 만들고, 기존 하드코딩된 영문 라벨을 교체. 광맥 카드 가독성을 위해 레이더 동심원 크기 축소 + 카드 너비 확장. Support 섹션에 접기 토글 추가.

**Tech Stack:** React, Next.js, Tailwind CSS v4, Framer Motion

---

### Task 1: 다국어 라벨 파일 생성

**Files:**
- Create: `apps/web/src/components/mine/mine-labels.ts`

**Step 1: 라벨 파일 작성**

모든 Mine 페이지 하드코딩 문자열을 ko/en으로 정리:

```typescript
export type MineLanguage = "ko" | "en";

const labels = {
  // StatusRail
  rerolls: { ko: "리롤", en: "rerolls" },
  generations: { ko: "채굴", en: "generations" },
  sectorScanActive: { ko: "광맥 스캔 중", en: "sector scan active" },

  // SectorScanStage header
  sectorScanShell: { ko: "광맥 스캔", en: "sector scan shell" },
  acquiringSignatures: { ko: "광맥을 탐지하는 중", en: "acquiring signatures" },
  signalLoss: { ko: "신호 유실", en: "signal loss" },
  detectedTargets: { ko: (n: number) => `${n}개 광맥 탐지됨`, en: (n: number) => `${n} detected targets` },
  targetMapStable: { ko: "스캔 완료", en: "target map stable" },
  scanPending: { ko: "스캔 대기", en: "scan pending" },
  lockingTarget: { ko: "광맥 잠금 중", en: "locking target" },
  awaitingLock: { ko: "대기 중", en: "awaiting lock" },

  // SectorScanStage warning/error
  scanWarning: { ko: "스캔 경고", en: "scan warning" },
  scanInterrupted: { ko: "스캔 중단", en: "scan interrupted" },
  targetAcquisitionFailed: { ko: "광맥 탐지에 실패했습니다.", en: "Target acquisition failed." },
  sectorFeedDropped: { ko: "스캔이 완료되기 전에 연결이 끊어졌습니다.", en: "The sector feed dropped before the scan could lock." },

  // VeinSignalNode position labels
  positionLabels: {
    top: { ko: "주 광맥", en: "apex return" },
    left: { ko: "좌측 광맥", en: "lateral echo" },
    right: { ko: "우측 광맥", en: "edge echo" },
  },
  detectedTarget: { ko: "탐지된 광맥", en: "detected target" },
  locked: { ko: "선택됨", en: "locked" },
  available: { ko: "선택 가능", en: "available" },
  signals: { ko: (n: number) => `키워드 ${n}개`, en: (n: number) => `${n} signals` },

  // SelectedVeinPanel
  targetAnalysis: { ko: "광맥 분석", en: "target analysis" },
  veinCodenames: {
    ko: ["광맥 1", "광맥 2", "광맥 3"],
    en: ["Target Alpha", "Target Beta", "Target Gamma"],
  },
  instructionWithSecondary: {
    ko: (primary: string, secondary: string) => `${primary}와(과) ${secondary}를 조합하여 아이디어를 탐색합니다.`,
    en: (primary: string, secondary: string) => `Use ${primary} with ${secondary} to open the next idea path.`,
  },
  instructionSingle: {
    ko: "이 광맥으로 아이디어를 탐색합니다.",
    en: "Use this signal to open the next idea path.",
  },
  scanNote: { ko: "스캔 메모", en: "scan note" },
  scanNoteContent: {
    ko: "광맥을 선택하면 바로 아이디어를 채굴할 수 있습니다.",
    en: "Open the target to route directly into the idea build.",
  },
  mineTarget: { ko: "채굴하기", en: "MINE TARGET" },
  mineLocked: { ko: "채굴 불가", en: "MINE LOCKED" },
  rescanSectors: { ko: "다시 스캔", en: "RESCAN SECTORS" },
  rescanning: { ko: "스캔 중...", en: "RESCANNING" },
  retryScan: { ko: "다시 시도", en: "RETRY SCAN" },
  retrying: { ko: "재시도 중...", en: "RETRYING" },

  // SelectedVeinPanel empty/error states
  awaitingLockTitle: { ko: "광맥 대기 중", en: "Awaiting lock." },
  awaitingLockDesc: { ko: "스캔이 완료되면 광맥이 표시됩니다.", en: "The scan shell is waiting for a vein to resolve." },
  targetLost: { ko: "광맥 유실", en: "Target lost." },
  targetLostDesc: { ko: "스캔 완료 전에 연결이 끊어졌습니다.", en: "The sector feed dropped before a target could be locked." },

  // Rarity labels
  rarity: {
    common: { ko: "일반", en: "Common" },
    rare: { ko: "희귀", en: "Rare" },
    golden: { ko: "골든", en: "Golden" },
    legend: { ko: "전설", en: "Legend" },
  },

  // Support block
  support: {
    eyebrow: { ko: "안내", en: "Support" },
    howItWorks: { ko: "사용법", en: "How it works" },
    systemNote: { ko: "시스템 안내", en: "System note" },
  },
  supportReady: {
    title: { ko: "스캔 안내 및 시스템 메모", en: "Scan guidance and system notes." },
    intro: { ko: "현재 광맥에 대한 안내입니다.", en: "Quiet guidance for the current sector." },
    primary: { ko: "광맥을 선택하고 상세 패널을 확인한 후, 새 광맥이 필요할 때만 다시 스캔하세요.", en: "Select a target, review the detail panel, and reroll only when you need a fresh sector." },
    secondary: { ko: "선택된 광맥에 핑크 시그널이 집중됩니다.", en: "Pink signal energy stays concentrated on the selected vein and the primary mine action." },
  },
  supportLoading: {
    title: { ko: "스캔 안내", en: "Scan guidance and system notes." },
    intro: { ko: "스캔이 진행 중입니다. 잠시 기다려주세요.", en: "The field is warming up." },
    primary: { ko: "스캔이 완료될 때까지 잠시 기다려주세요.", en: "Wait for the sector scan to settle before choosing a target." },
    secondary: { ko: "아직 선택된 광맥이 없습니다.", en: "No target is locked yet, so the support block stays informational." },
  },
  supportError: {
    title: { ko: "스캔 오류 안내", en: "Scan guidance and recovery notes." },
    intro: { ko: "신호가 끊어졌습니다.", en: "The field lost signal." },
    primary: { ko: "다시 스캔하여 광맥을 복구하세요.", en: "Use reroll to recover the sector, then reassess the targets." },
    secondary: { ko: "다시 스캔 후 광맥을 선택해주세요.", en: "Use reroll to recover the sector before trying another selection." },
  },
  supportEmpty: {
    title: { ko: "스캔 안내", en: "Scan guidance and system notes." },
    intro: { ko: "탐지된 광맥이 없습니다.", en: "No target is available yet." },
    primary: { ko: "새로운 광맥이 나타날 때까지 기다려주세요.", en: "Wait for a fresh sector before selecting a target." },
    secondary: { ko: "스캔이 완료되면 새 광맥이 표시됩니다.", en: "A fresh sector will appear here once the scan resolves." },
  },
} as const;

export function t(key: keyof typeof labels, lang: MineLanguage = "ko") {
  return (labels[key] as Record<MineLanguage, unknown>)[lang];
}

export function getLabels(lang: MineLanguage) {
  return Object.fromEntries(
    Object.entries(labels).map(([key, value]) => {
      if (typeof value === "object" && "ko" in value && "en" in value) {
        return [key, value[lang]];
      }
      return [key, value];
    })
  );
}

export { labels as MINE_LABELS };
```

**Step 2: 커밋**

```bash
git add apps/web/src/components/mine/mine-labels.ts
git commit -m "feat: Mine 페이지 다국어 라벨 파일 (ko/en)"
```

---

### Task 2: 광맥 카드 가독성 개선 — 레이더 축소 + 카드 확장

**Files:**
- Modify: `apps/web/src/components/mine/sector-scan-stage.tsx`
- Modify: `apps/web/src/components/mine/vein-signal-node.tsx`

**Step 1: 레이더 동심원 크기 축소**

`sector-scan-stage.tsx` 87~92줄, 동심원 크기를 약 30% 축소:

```
420px → 300px
320px → 230px
220px → 160px
120px → 90px
```

**Step 2: 광맥 카드 최대 너비 확장**

`vein-signal-node.tsx` 81줄:
```
sm:max-w-[240px] → sm:max-w-[280px]
lg:w-[min(270px,46vw)] → lg:w-[min(300px,42vw)]
```

`sector-scan-stage.tsx` ScanGhostNode 36줄도 동일하게:
```
sm:max-w-[240px] → sm:max-w-[280px]
lg:w-[min(270px,46vw)] → lg:w-[min(300px,42vw)]
```

**Step 3: 광맥 카드 텍스트 잘림 방지**

`vein-signal-node.tsx` 124줄의 키워드 표시:
기존: `max-h-10 overflow-hidden` (2줄 잘림)
변경: `line-clamp-2` (말줄임 처리)

**Step 4: 커밋**

```bash
git add apps/web/src/components/mine/sector-scan-stage.tsx apps/web/src/components/mine/vein-signal-node.tsx
git commit -m "style: Mine 레이더 축소 + 광맥 카드 확장"
```

---

### Task 3: 영문 라벨 → 다국어 적용 (VeinSignalNode)

**Files:**
- Modify: `apps/web/src/components/mine/vein-signal-node.tsx`

**Step 1: 라벨 import + 적용**

```typescript
import { MINE_LABELS, type MineLanguage } from "./mine-labels";
```

props에 `lang: MineLanguage` 추가.

교체 대상:
- L21~25 `POSITION_LABELS` → `MINE_LABELS.positionLabels[position][lang]`
- L31~54 `RARITY_STYLES` 내 `label` → `MINE_LABELS.rarity[vein.rarity][lang]`
- L144 `{vein.keywords.length} signals` → 다국어 signals 라벨
- L149 `detected target` → `MINE_LABELS.detectedTarget[lang]`
- L150 `locked` / `available` → `MINE_LABELS.locked[lang]` / `MINE_LABELS.available[lang]`

**Step 2: 커밋**

```bash
git add apps/web/src/components/mine/vein-signal-node.tsx
git commit -m "feat: VeinSignalNode 다국어 라벨 적용"
```

---

### Task 4: 영문 라벨 → 다국어 적용 (SectorScanStage)

**Files:**
- Modify: `apps/web/src/components/mine/sector-scan-stage.tsx`

**Step 1: 라벨 import + 적용**

props에 `lang: MineLanguage` 추가. 부모 page.tsx에서 전달.

교체 대상:
- L98 `sector scan shell` → `MINE_LABELS.sectorScanShell[lang]`
- L102 `acquiring signatures` → `MINE_LABELS.acquiringSignatures[lang]`
- L104 `signal loss` → `MINE_LABELS.signalLoss[lang]`
- L105 `${veins.length} detected targets` → `MINE_LABELS.detectedTargets[lang](veins.length)`
- L110 `target map stable` / `scan pending` → 다국어
- L127~129 ghost node labels → 다국어
- L131 `locking target` → 다국어
- L142~149 에러 메시지들 → 다국어

**Step 2: VeinSignalNode에 lang prop 전달**

L175~181에서 `<VeinSignalNode ... lang={lang} />` 추가.

**Step 3: 커밋**

```bash
git add apps/web/src/components/mine/sector-scan-stage.tsx
git commit -m "feat: SectorScanStage 다국어 라벨 적용"
```

---

### Task 5: 영문 라벨 → 다국어 적용 (SelectedVeinPanel)

**Files:**
- Modify: `apps/web/src/components/mine/selected-vein-panel.tsx`

**Step 1: 라벨 import + 적용**

props에 `lang: MineLanguage` 추가.

교체 대상:
- L29~47 RARITY_META labels → `MINE_LABELS.rarity[rarity][lang]`
- L50~56 VEIN_CODENAMES → `MINE_LABELS.veinCodenames[lang][index]`
- L121, 159, 207 `target analysis` / `scan interrupted` → 다국어
- L124~128 에러 메시지들 → 다국어
- L189~193 instruction 문구 → `MINE_LABELS.instructionWithSecondary[lang](...)`
- L246~251 scan note → 다국어
- L262~272 버튼 라벨 (MINE TARGET, RESCAN SECTORS 등) → 다국어

**Step 2: 커밋**

```bash
git add apps/web/src/components/mine/selected-vein-panel.tsx
git commit -m "feat: SelectedVeinPanel 다국어 라벨 적용"
```

---

### Task 6: 영문 라벨 → 다국어 적용 (MineSupportBlock + page.tsx)

**Files:**
- Modify: `apps/web/src/components/mine/mine-support-block.tsx`
- Modify: `apps/web/src/app/(app)/mine/page.tsx`

**Step 1: MineSupportBlock 다국어화**

props에 `lang: MineLanguage` 추가.
`SUPPORT_COPY` 객체의 문자열을 `MINE_LABELS`에서 가져오도록 변경.

**Step 2: Support 섹션 접기 기능 추가**

```typescript
const [collapsed, setCollapsed] = useState(true); // 기본 접힘
```

헤더 영역을 클릭 가능한 토글로 변경:
```tsx
<button onClick={() => setCollapsed(!collapsed)} className="w-full cursor-pointer ...">
  <div className="flex items-center justify-between">
    <div>
      <p className="...">{eyebrow}</p>
      <h3 className="...">{title}</h3>
    </div>
    <ChevronDown className={`h-4 w-4 transition-transform ${!collapsed ? "rotate-180" : ""}`} />
  </div>
</button>

{!collapsed && (
  <div className="mt-4 grid gap-3 md:grid-cols-2">
    <SupportTile ... />
    <SupportTile ... />
  </div>
)}
```

**Step 3: page.tsx에서 lang prop 전달**

현재 useProfile 훅이나 프로필에서 language를 가져와야 함. 방법:
- `useQuery`로 프로필을 가져와 `profile?.language ?? "ko"` 사용
- 또는 일단 `"ko"` 하드코딩 후, 토글 UI는 별도 Task로

page.tsx StatusRail에도 다국어 적용:
- L87 `rerolls` → `MINE_LABELS.rerolls[lang]`
- L100 `generations` → `MINE_LABELS.generations[lang]`

**Step 4: 커밋**

```bash
git add apps/web/src/components/mine/mine-support-block.tsx apps/web/src/app/(app)/mine/page.tsx
git commit -m "feat: MineSupportBlock 다국어 + 접기 기능, page.tsx lang 전달"
```

---

### Task 7: 코드네임 개선

**Files:**
- Modify: `apps/web/src/components/mine/vein-signal-node.tsx` (이미 Task 3에서 수정)

VeinSignalNode의 포지션 라벨이 Task 3에서 이미 다국어로 변경됨:
- "apex return" → "주 광맥" (ko)
- "lateral echo" → "좌측 광맥" (ko)
- "edge echo" → "우측 광맥" (ko)

SelectedVeinPanel의 "Target Alpha/Beta/Gamma"도 Task 5에서 변경됨:
- → "광맥 1/2/3" (ko)

이 Task에서는 변경사항 없음 — Task 3, 5에서 이미 처리.

---

### Task 8: Playwright 스크린샷으로 최종 검증

**Step 1: 서버 실행 확인**

```bash
cd apps/web && npx next dev --port 3000
```

**Step 2: Playwright로 데스크톱 + 모바일 스크린샷 캡처**

- 데스크톱 (1280×800)
- 모바일 (375×812)

**Step 3: 체크리스트**

- [ ] 광맥 카드 3개의 키워드가 잘리지 않고 온전히 보이는가
- [ ] 한국어 라벨이 올바르게 표시되는가 ("채굴하기", "다시 스캔" 등)
- [ ] 레이더 동심원이 축소되어 카드와 겹치지 않는가
- [ ] Support 섹션이 기본 접힌 상태인가
- [ ] Support 헤더 클릭으로 펼치기/접기가 되는가
- [ ] 코드네임이 "광맥 1/2/3"으로 표시되는가
- [ ] 영어 모드("en")로 전환 시 영문 라벨이 올바른가

---

## 구현 순서 요약

| Task | 내용 | 파일 수 |
|------|------|---------|
| 1 | mine-labels.ts 다국어 파일 생성 | 1 (신규) |
| 2 | 레이더 축소 + 카드 확장 (가독성) | 2 |
| 3 | VeinSignalNode 다국어 | 1 |
| 4 | SectorScanStage 다국어 | 1 |
| 5 | SelectedVeinPanel 다국어 | 1 |
| 6 | MineSupportBlock 다국어 + 접기 + page.tsx | 2 |
| 7 | 코드네임 개선 (Task 3,5에서 이미 처리) | 0 |
| 8 | Playwright 검증 | 0 |

## 건드리지 않는 것

- MineBackground, Meteorite3D (시각 효과)
- keyword-chip, idea-card (기존 컴포넌트)
- 백엔드 API
- 모바일 앱 (apps/mobile)
- 언어 토글 UI (별도 구현 예정)
