type LocalizedText = {
  en: string;
};

type LocalizedTextList = {
  en: string[];
};

type LocalizedCount = {
  en: (value: number) => string;
};

type LocalizedInstruction = {
  en: (primary: string, secondary: string) => string;
};

const copy = (value: string): LocalizedText => ({ en: value });
const copyList = (values: string[]): LocalizedTextList => ({ en: values });
const copyCount = (formatter: (value: number) => string): LocalizedCount => ({ en: formatter });
const copyInstruction = (
  formatter: (primary: string, secondary: string) => string,
): LocalizedInstruction => ({ en: formatter });

export type MineLanguage = "en";

export const MINE_LABELS = {
  rerolls: copy("rerolls"),
  generations: copy("generations"),
  sectorScanActive: copy("sector scan active"),
  sectorScanShell: copy("sector scan shell"),
  acquiringSignatures: copy("acquiring signatures"),
  signalLoss: copy("signal loss"),
  detectedTargets: copyCount((count) => `${count} detected targets`),
  targetMapStable: copy("target map stable"),
  scanPending: copy("scan pending"),
  lockingTarget: copy("locking target"),
  awaitingLock: copy("awaiting lock"),
  scanWarning: copy("scan warning"),
  scanInterrupted: copy("scan interrupted"),
  targetAcquisitionFailed: copy("Target acquisition failed."),
  sectorFeedDropped: copy("The sector feed dropped before the scan could lock."),
  positionLabels: {
    top: copy("apex return"),
    left: copy("lateral echo"),
    right: copy("edge echo"),
  },
  detectedTarget: copy("detected target"),
  locked: copy("locked"),
  available: copy("available"),
  signals: copyCount((count) => `${count} signals`),
  targetAnalysis: copy("target analysis"),
  veinCodenames: copyList(["Target Alpha", "Target Beta", "Target Gamma"]),
  instructionWithSecondary: copyInstruction(
    (primary, secondary) => `Use ${primary} with ${secondary} to open the next idea path.`,
  ),
  instructionSingle: copy("Use this signal to open the next idea path."),
  scanNote: copy("scan note"),
  scanNoteContent: copy("Open the target to route directly into the idea build."),
  mineTarget: copy("MINE TARGET"),
  mineLocked: copy("MINE LOCKED"),
  rescanSectors: copy("RESCAN SECTORS"),
  rescanning: copy("RESCANNING"),
  retryScan: copy("RETRY SCAN"),
  retrying: copy("RETRYING"),
  awaitingLockTitle: copy("Awaiting lock."),
  awaitingLockDesc: copy("The scan shell is waiting for a vein to resolve."),
  targetLost: copy("Target lost."),
  targetLostDesc: copy("The sector feed dropped before a target could be locked."),
  rarity: {
    common: copy("Common"),
    rare: copy("Rare"),
    golden: copy("Golden"),
    legend: copy("Legend"),
  },
  supportEyebrow: copy("Support"),
  supportHowItWorks: copy("How it works"),
  supportSystemNote: copy("System note"),
  supportReady: {
    title: copy("Scan guidance and system notes."),
    intro: copy(
      "Quiet guidance for the current sector. Keep the main stage in focus and use this block for orientation only.",
    ),
    primary: copy(
      "Select a target, review the detail panel, and reroll only when you need a fresh sector.",
    ),
    secondary: copy(
      "Pink signal energy stays concentrated on the selected vein and the primary mine action.",
    ),
  },
  supportLoading: {
    title: copy("Scan guidance and system notes."),
    intro: copy("The field is warming up. Use this block for orientation while the stage resolves."),
    primary: copy("Wait for the sector scan to settle before choosing a target."),
    secondary: copy("No target is locked yet, so the support block stays informational."),
  },
  supportError: {
    title: copy("Scan guidance and recovery notes."),
    intro: copy("The field lost signal. This block stays calm and only explains the next safe step."),
    primary: copy("Use reroll to recover the sector, then reassess the targets."),
    secondary: copy("Use reroll to recover the sector before trying another selection."),
  },
  supportEmpty: {
    title: copy("Scan guidance and system notes."),
    intro: copy(
      "No target is available yet. Keep this block as orientation while the sector repopulates.",
    ),
    primary: copy("Wait for a fresh sector before selecting a target."),
    secondary: copy("A fresh sector will appear here once the scan resolves."),
  },
  demoSampleNotice: copy("This is a sample vein"),
  demoFreshNotice: copy("Real veins open every day after you sign in"),
  demoMyVeinsCta: copy("See my veins ->"),
  resultEyebrow: copy("MINING RESULT"),
  resultTitle: copy("Extracted ideas"),
  resultSubtitle: copy("Pick the ideas you like and bring them into your vault"),
  backToMine: copy("Back to the Mine"),
  loadingPhase1: copy("Analyzing the vein..."),
  loadingPhase2: copy("Scanning the crystal structure..."),
  loadingPhase3: copy("Extracting idea crystals..."),
  miningFailed: copy("Mining failed"),
  goBack: copy("Go back"),
  unknownError: copy("Unknown error"),
  selectedSuffix: copy("selected"),
  vaulting: copy("Vaulting..."),
  vaultIntake: copy("Vault them?"),
  vaultSuccess: copy("Saved to the vault!"),
} as const;
