/**
 * Mine 페이지 다국어 라벨
 *
 * 향후 언어 토글이 추가될 때까지 기본은 "ko".
 * 각 컴포넌트에서 `lang` prop으로 전달받아 사용.
 */

export type MineLanguage = "ko" | "en";

export const MINE_LABELS = {
  // StatusRail
  rerolls: { ko: "리롤", en: "rerolls" },
  generations: { ko: "채굴", en: "generations" },
  sectorScanActive: { ko: "광맥 스캔 중", en: "sector scan active" },

  // SectorScanStage header
  sectorScanShell: { ko: "광맥 스캔", en: "sector scan shell" },
  acquiringSignatures: { ko: "광맥을 탐지하는 중", en: "acquiring signatures" },
  signalLoss: { ko: "신호 유실", en: "signal loss" },
  detectedTargets: {
    ko: (n: number) => `${n}개 광맥 탐지됨`,
    en: (n: number) => `${n} detected targets`,
  },
  targetMapStable: { ko: "스캔 완료", en: "target map stable" },
  scanPending: { ko: "스캔 대기", en: "scan pending" },
  lockingTarget: { ko: "광맥 잠금 중", en: "locking target" },
  awaitingLock: { ko: "대기 중", en: "awaiting lock" },

  // SectorScanStage warning/error
  scanWarning: { ko: "스캔 경고", en: "scan warning" },
  scanInterrupted: { ko: "스캔 중단", en: "scan interrupted" },
  targetAcquisitionFailed: {
    ko: "광맥 탐지에 실패했습니다.",
    en: "Target acquisition failed.",
  },
  sectorFeedDropped: {
    ko: "스캔이 완료되기 전에 연결이 끊어졌습니다.",
    en: "The sector feed dropped before the scan could lock.",
  },

  // VeinSignalNode position labels
  positionLabels: {
    top: { ko: "주 광맥", en: "apex return" },
    left: { ko: "좌측 광맥", en: "lateral echo" },
    right: { ko: "우측 광맥", en: "edge echo" },
  },
  detectedTarget: { ko: "탐지된 광맥", en: "detected target" },
  locked: { ko: "선택됨", en: "locked" },
  available: { ko: "선택 가능", en: "available" },
  signals: {
    ko: (n: number) => `키워드 ${n}개`,
    en: (n: number) => `${n} signals`,
  },

  // SelectedVeinPanel
  targetAnalysis: { ko: "광맥 분석", en: "target analysis" },
  veinCodenames: {
    ko: ["광맥 1", "광맥 2", "광맥 3"],
    en: ["Target Alpha", "Target Beta", "Target Gamma"],
  },
  instructionWithSecondary: {
    ko: (primary: string, secondary: string) =>
      `${primary}와(과) ${secondary}를 조합하여 아이디어를 탐색합니다.`,
    en: (primary: string, secondary: string) =>
      `Use ${primary} with ${secondary} to open the next idea path.`,
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
  awaitingLockDesc: {
    ko: "스캔이 완료되면 광맥이 표시됩니다.",
    en: "The scan shell is waiting for a vein to resolve.",
  },
  targetLost: { ko: "광맥 유실", en: "Target lost." },
  targetLostDesc: {
    ko: "스캔 완료 전에 연결이 끊어졌습니다.",
    en: "The sector feed dropped before a target could be locked.",
  },

  // Rarity labels
  rarity: {
    common: { ko: "일반", en: "Common" },
    rare: { ko: "희귀", en: "Rare" },
    golden: { ko: "골든", en: "Golden" },
    legend: { ko: "전설", en: "Legend" },
  },

  // Support block
  supportEyebrow: { ko: "안내", en: "Support" },
  supportHowItWorks: { ko: "사용법", en: "How it works" },
  supportSystemNote: { ko: "시스템 안내", en: "System note" },

  supportReady: {
    title: {
      ko: "스캔 안내 및 시스템 메모",
      en: "Scan guidance and system notes.",
    },
    intro: {
      ko: "현재 광맥에 대한 안내입니다.",
      en: "Quiet guidance for the current sector. Keep the main stage in focus and use this block for orientation only.",
    },
    primary: {
      ko: "광맥을 선택하고 상세 패널을 확인한 후, 새 광맥이 필요할 때만 다시 스캔하세요.",
      en: "Select a target, review the detail panel, and reroll only when you need a fresh sector.",
    },
    secondary: {
      ko: "선택된 광맥에 핑크 시그널이 집중됩니다.",
      en: "Pink signal energy stays concentrated on the selected vein and the primary mine action.",
    },
  },
  supportLoading: {
    title: {
      ko: "스캔 안내",
      en: "Scan guidance and system notes.",
    },
    intro: {
      ko: "스캔이 진행 중입니다. 잠시 기다려주세요.",
      en: "The field is warming up. Use this block for orientation while the stage resolves.",
    },
    primary: {
      ko: "스캔이 완료될 때까지 잠시 기다려주세요.",
      en: "Wait for the sector scan to settle before choosing a target.",
    },
    secondary: {
      ko: "아직 선택된 광맥이 없습니다.",
      en: "No target is locked yet, so the support block stays informational.",
    },
  },
  supportError: {
    title: {
      ko: "스캔 오류 안내",
      en: "Scan guidance and recovery notes.",
    },
    intro: {
      ko: "신호가 끊어졌습니다.",
      en: "The field lost signal. This block stays calm and only explains the next safe step.",
    },
    primary: {
      ko: "다시 스캔하여 광맥을 복구하세요.",
      en: "Use reroll to recover the sector, then reassess the targets.",
    },
    secondary: {
      ko: "다시 스캔 후 광맥을 선택해주세요.",
      en: "Use reroll to recover the sector before trying another selection.",
    },
  },
  supportEmpty: {
    title: {
      ko: "스캔 안내",
      en: "Scan guidance and system notes.",
    },
    intro: {
      ko: "탐지된 광맥이 없습니다.",
      en: "No target is available yet. Keep this block as orientation while the sector repopulates.",
    },
    primary: {
      ko: "새로운 광맥이 나타날 때까지 기다려주세요.",
      en: "Wait for a fresh sector before selecting a target.",
    },
    secondary: {
      ko: "스캔이 완료되면 새 광맥이 표시됩니다.",
      en: "A fresh sector will appear here once the scan resolves.",
    },
  },

  // Mining result page (/mine/[veinId])
  resultEyebrow: { ko: "채굴 결과", en: "MINING RESULT" },
  resultTitle: { ko: "추출된 아이디어", en: "Extracted ideas" },
  resultSubtitle: {
    ko: "마음에 드는 아이디어를 선택해 금고에 반입하세요",
    en: "Pick the ideas you like and bring them into your vault",
  },
  backToMine: { ko: "광산으로 돌아가기", en: "Back to the Mine" },
  loadingPhase1: { ko: "광맥을 분석하는 중...", en: "Analyzing the vein..." },
  loadingPhase2: {
    ko: "결정 구조를 스캔하는 중...",
    en: "Scanning the crystal structure...",
  },
  loadingPhase3: {
    ko: "아이디어 결정을 추출하는 중...",
    en: "Extracting idea crystals...",
  },
  miningFailed: { ko: "채굴에 실패했습니다", en: "Mining failed" },
  goBack: { ko: "돌아가기", en: "Go back" },
  unknownError: { ko: "알 수 없는 오류", en: "Unknown error" },
  selectedSuffix: { ko: "개 선택됨", en: "selected" },
  vaulting: { ko: "반입 중...", en: "Vaulting..." },
  vaultIntake: { ko: "금고에 반입 💎", en: "Vault them 💎" },
  vaultSuccess: { ko: "금고에 반입 완료!", en: "Saved to the vault!" },
} as const;
