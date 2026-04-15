export type ExperienceVein = {
  id: string;
  slug: string;
  codename: string;
  rarity: "common" | "rare" | "golden";
  keywords: Array<{
    category: "ai" | "who" | "domain" | "tech" | "value" | "money";
    label: string;
  }>;
  previewLine: string;
};

export type ExperienceIdea = {
  id: string;
  title: string;
  summary: string;
  signalLine: string;
};
