type LocalizedText = {
  en: string;
};

const copy = (value: string): LocalizedText => ({ en: value });

export type LabLanguage = "en";

export const LAB_LABELS = {
  eyebrow: copy("LAB"),
  title: copy("The Lab"),
  subtitle: copy("Analyze and refine the ideas you've collected"),
  pendingOverview: copy("Pending overview"),
  recentDocuments: copy("Recent documents"),
  overview: copy("Overview"),
  generateOverview: copy("Generate overview"),
  noIdeasTitle: copy("No ideas yet"),
  allOverviewsTitle: copy("Every idea already has an overview"),
  noIdeasDesc: copy("Save some ideas in the vault first"),
  newIdeasDesc: copy("Mine some new ideas"),
  goToMine: copy("Go to the Mine"),
  noDocumentsYet: copy("No documents generated yet"),
  demoSampleNotice: copy("This is a sample lab"),
  demoFreshNotice: copy("Your real lab fills with overviews and appraisals of your own ideas"),
  demoMyLabCta: copy("Open my lab ->"),
} as const;
