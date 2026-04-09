export type ExperienceVein = {
  id: string;
  slug: string;
  codename: string;
  rarity: "common" | "rare" | "golden";
  keywords: Array<{
    category: "ai" | "who" | "domain" | "tech" | "value" | "money";
    ko: string;
    en: string;
  }>;
  previewLineKo: string;
  previewLineEn: string;
};

export type ExperienceIdea = {
  id: string;
  titleKo: string;
  titleEn: string;
  summaryKo: string;
  summaryEn: string;
  signalLineKo: string;
  signalLineEn: string;
};
