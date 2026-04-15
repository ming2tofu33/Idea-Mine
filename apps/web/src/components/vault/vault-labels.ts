type LocalizedText = {
  en: string;
};

type LocalizedCount = {
  en: (value: number) => string;
};

const copy = (value: string): LocalizedText => ({ en: value });
const copyCount = (formatter: (value: number) => string): LocalizedCount => ({ en: formatter });

export type VaultLanguage = "en";

export const VAULT_LABELS = {
  eyebrow: copy("VAULT"),
  title: copy("The Vault"),
  subtitle: copy("Store and manage the ideas you've mined"),
  ideasCount: copyCount((count) => `${count} ideas`),
  workflow: {
    raw: copy("Raw"),
    overview: copy("Overview"),
    appraisal: copy("Appraisal"),
    fullOverview: copy("Full overview"),
  },
  overviewComplete: copy("Overview ready"),
  rawStone: copy("Raw stone"),
  deleteConfirm: copy("Delete?"),
  deleting: copy("..."),
  loadFailed: copy("Couldn't load the vault"),
  unknownError: copy("Unknown error"),
  emptyTitle: copy("No ideas yet"),
  emptyHint: copy("Mine some ideas you like and bring them into the vault"),
  goToMine: copy("Go to the Mine"),
  demoSampleNotice: copy("This is a sample vault"),
  demoFreshNotice: copy("Your real vault fills up with the ideas you mine after signing in"),
  demoMyVaultCta: copy("Open my vault ->"),
} as const;
