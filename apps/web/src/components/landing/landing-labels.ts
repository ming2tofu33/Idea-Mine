export type LandingLanguage = "en";

type Localized = {
  en: string;
};

type LocalizedList = {
  en: string[];
};

const copy = (value: string): Localized => ({ en: value });
const copyList = (values: string[]): LocalizedList => ({ en: values });

export const LANDING_LABELS = {
  hero: {
    headline: copy("Discover new AI product ideas every day, then turn the best ones into execution docs right away."),
    support: copy("Start with today's picks, save the promising ones in Vault, and expand them in Lab into a project overview and a full execution document."),
    primaryCta: {
      guest: copy("See today's ideas"),
      member: copy("See today's ideas"),
    },
    secondaryCta: copy("See how it flows"),
    preview: {
      pathLabel: copy("Mine -> Vault -> Lab"),
      shell: copy("Today / idea desk"),
      title: copy("Ideas worth opening first"),
      readyCount: copy("3 ideas today"),
      selectedSignal: copy("Today's chosen idea"),
      selectedTitle: copy("Pricing friction detector for creator SaaS"),
      ready: copy("Ready for docs"),
      whyTitle: copy("Why now"),
      whyBody: copy("The pain is clear, the buyer is visible, and the direction is strong enough to move straight into a project overview."),
      nextTitle: copy("Documents that follow"),
      nextBody: copy("It moves into a project overview, product design, technical blueprint, and execution roadmap."),
      signals: [
        {
          title: copy("Pricing friction detector"),
          detail: copy("Clear hesitation before purchase, with an obvious monetization angle."),
          status: {
            active: copy("Selected"),
            inactive: copy("Queued"),
          },
        },
        {
          title: copy("Repurchase reminder automation"),
          detail: copy("The return trigger is obvious, but the conversion signal needs a little more proof."),
          status: {
            active: copy("Selected"),
            inactive: copy("Queued"),
          },
        },
        {
          title: copy("Micro SaaS onboarding alert"),
          detail: copy("The problem is visible, but it is a lower priority for today."),
          status: {
            active: copy("Selected"),
            inactive: copy("Queued"),
          },
        },
      ],
    },
  },
  whyToday: {
    title: copy("Why open it today"),
    copy: copy("It puts the ideas worth opening first in front of you."),
    reasons: [
      {
        index: "01",
        title: copy("Fresh picks arrive every day"),
        copy: copy("The daily picks keep changing, so there is always a reason to come back tomorrow."),
      },
      {
        index: "02",
        title: copy("You can get the first result in 30 seconds"),
        copy: copy("Instead of collecting random notes, you can quickly start with ideas that already look worth your time."),
      },
      {
        index: "03",
        title: copy("Good ideas become assets right away"),
        copy: copy("Save the promising ones in Vault and expand them in Lab into usable execution documents."),
      },
    ],
  },
  flow: {
    title: copy("How ideas turn into working assets"),
    copy: copy("Choose in Mine, keep it in Vault, and turn it into documents in Lab."),
    steps: [
      {
        id: "01",
        title: copy("Discover"),
        copy: copy("Pick the ideas worth opening first in Mine."),
        outcome: copy("Today's picks"),
      },
      {
        id: "02",
        title: copy("Save"),
        copy: copy("Store the promising ones in Vault and compare them again later."),
        outcome: copy("Idea assets"),
      },
      {
        id: "03",
        title: copy("Document"),
        copy: copy("Expand the strongest idea into a project overview and a full execution document."),
        outcome: copy("Ready to act"),
      },
    ],
    selectedIdeaLabel: copy("Today's chosen idea"),
    selectedIdeaTitle: copy("Pricing friction detector for creator SaaS"),
    docsLabel: copy("Documents that follow"),
    docs: copyList([
      "Project overview",
      "Product design",
      "Technical blueprint",
      "Execution roadmap",
    ]),
  },
  returnLoop: {
    title: copy("Why you will want to come back tomorrow"),
    copy: copy("New ideas keep arriving, saved ideas keep stacking up, and the strongest ones keep turning into deeper documents."),
    beats: [
      {
        title: copy("Today"),
        copy: copy("Discover a new idea."),
      },
      {
        title: copy("Tomorrow"),
        copy: copy("Another strong idea is waiting."),
      },
      {
        title: copy("Ongoing"),
        copy: copy("The best ideas keep turning into documents and direction."),
      },
    ],
  },
  finalCta: {
    title: copy("Start with today's ideas."),
    primaryCta: {
      guest: copy("See today's ideas"),
      member: copy("See today's ideas"),
    },
  },
} satisfies {
  hero: {
    headline: Localized;
    support: Localized;
    primaryCta: { guest: Localized; member: Localized };
    secondaryCta: Localized;
    preview: {
      pathLabel: Localized;
      shell: Localized;
      title: Localized;
      readyCount: Localized;
      selectedSignal: Localized;
      selectedTitle: Localized;
      ready: Localized;
      whyTitle: Localized;
      whyBody: Localized;
      nextTitle: Localized;
      nextBody: Localized;
      signals: Array<{
        title: Localized;
        detail: Localized;
        status: { active: Localized; inactive: Localized };
      }>;
    };
  };
  whyToday: {
    title: Localized;
    copy: Localized;
    reasons: Array<{ index: string; title: Localized; copy: Localized }>;
  };
  flow: {
    title: Localized;
    copy: Localized;
    steps: Array<{ id: string; title: Localized; copy: Localized; outcome: Localized }>;
    selectedIdeaLabel: Localized;
    selectedIdeaTitle: Localized;
    docsLabel: Localized;
    docs: LocalizedList;
  };
  returnLoop: {
    title: Localized;
    copy: Localized;
    beats: Array<{ title: Localized; copy: Localized }>;
  };
  finalCta: {
    title: Localized;
    primaryCta: { guest: Localized; member: Localized };
  };
};
