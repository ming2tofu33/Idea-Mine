export type LandingLanguage = "ko" | "en";

type Localized = {
  ko: string;
  en: string;
};

export const LANDING_LABELS = {
  hero: {
    headline: {
      ko: "매일 새로운 AI 서비스 아이디어를 발견하고, 좋은 아이디어는 바로 실행 문서로 정리하세요.",
      en: "Discover new AI product ideas every day, then turn the best ones into execution docs right away.",
    },
    support: {
      ko: "오늘의 추천에서 아이디어를 고르고, 괜찮은 아이디어는 Vault에 저장한 뒤 Lab에서 프로젝트 개요서와 풀 개요서로 확장하세요.",
      en: "Start with today's picks, save the promising ones in Vault, and expand them in Lab into a project overview and a full execution document.",
    },
    primaryCta: {
      guest: {
        ko: "오늘의 아이디어 보기",
        en: "See today's ideas",
      },
      member: {
        ko: "오늘의 아이디어 보기",
        en: "See today's ideas",
      },
    },
    secondaryCta: {
      ko: "어떻게 이어지는지 보기",
      en: "See how it flows",
    },
    preview: {
      pathLabel: {
        ko: "Mine -> Vault -> Lab",
        en: "Mine -> Vault -> Lab",
      },
      shell: {
        ko: "Today / idea desk",
        en: "Today / idea desk",
      },
      title: {
        ko: "오늘 먼저 볼 아이디어",
        en: "Ideas worth opening first",
      },
      readyCount: {
        ko: "오늘의 추천 3개",
        en: "3 ideas today",
      },
      selectedSignal: {
        ko: "오늘 고른 아이디어",
        en: "Today's chosen idea",
      },
      selectedTitle: {
        ko: "크리에이터 SaaS 가격 문제 탐지 도구",
        en: "Pricing friction detector for creator SaaS",
      },
      ready: {
        ko: "문서화 가능",
        en: "Ready for docs",
      },
      whyTitle: {
        ko: "왜 지금 볼까",
        en: "Why now",
      },
      whyBody: {
        ko: "문제가 선명하고, 누가 돈을 낼지 보이며, 바로 프로젝트 개요서로 넘길 만한 방향이 보입니다.",
        en: "The pain is clear, the buyer is visible, and the direction is strong enough to move straight into a project overview.",
      },
      nextTitle: {
        ko: "바로 이어지는 문서",
        en: "Documents that follow",
      },
      nextBody: {
        ko: "프로젝트 개요서, 제품 설계서, 기술 청사진, 실행 로드맵으로 이어집니다.",
        en: "It moves into a project overview, product design, technical blueprint, and execution roadmap.",
      },
      signals: [
        {
          title: {
            ko: "크리에이터 SaaS 가격 문제 탐지 도구",
            en: "Pricing friction detector",
          },
          detail: {
            ko: "구매 직전의 망설임이 선명하고, 수익화 방향도 바로 보입니다.",
            en: "Clear hesitation before purchase, with an obvious monetization angle.",
          },
          status: {
            active: {
              ko: "선택됨",
              en: "Selected",
            },
            inactive: {
              ko: "대기 중",
              en: "Queued",
            },
          },
        },
        {
          title: {
            ko: "1인 쇼핑몰 재구매 리마인드 자동화",
            en: "Repurchase reminder automation",
          },
          detail: {
            ko: "반복 구매를 만드는 계기는 뚜렷하지만, 전환 신호는 조금 더 봐야 합니다.",
            en: "The return trigger is obvious, but the conversion signal needs a little more proof.",
          },
          status: {
            active: {
              ko: "선택됨",
              en: "Selected",
            },
            inactive: {
              ko: "대기 중",
              en: "Queued",
            },
          },
        },
        {
          title: {
            ko: "마이크로 SaaS 온보딩 개선 알림",
            en: "Micro SaaS onboarding alert",
          },
          detail: {
            ko: "문제는 보이지만 오늘 우선순위는 조금 낮습니다.",
            en: "The problem is visible, but it is a lower priority for today.",
          },
          status: {
            active: {
              ko: "선택됨",
              en: "Selected",
            },
            inactive: {
              ko: "대기 중",
              en: "Queued",
            },
          },
        },
      ],
    },
  },
  whyToday: {
    title: {
      ko: "오늘 들어와 볼 이유",
      en: "Why open it today",
    },
    copy: {
      ko: "오늘 먼저 볼 만한 아이디어를 골라서 보여줍니다.",
      en: "It puts the ideas worth opening first in front of you.",
    },
    reasons: [
      {
        index: "01",
        title: {
          ko: "매일 새로운 추천이 들어옵니다",
          en: "Fresh picks arrive every day",
        },
        copy: {
          ko: "내일 다시 들어올 이유가 생기도록, 오늘의 추천은 계속 바뀝니다.",
          en: "The daily picks keep changing, so there is always a reason to come back tomorrow.",
        },
      },
      {
        index: "02",
        title: {
          ko: "30초 안에 첫 결과를 볼 수 있습니다",
          en: "You can get the first result in 30 seconds",
        },
        copy: {
          ko: "무작위 메모를 쌓는 대신, 먼저 볼 가치가 있는 아이디어부터 빠르게 고를 수 있습니다.",
          en: "Instead of collecting random notes, you can quickly start with ideas that already look worth your time.",
        },
      },
      {
        index: "03",
        title: {
          ko: "좋은 아이디어는 바로 자산이 됩니다",
          en: "Good ideas become assets right away",
        },
        copy: {
          ko: "괜찮은 아이디어는 Vault에 쌓아두고, Lab에서 실행 문서로 확장할 수 있습니다.",
          en: "Save the promising ones in Vault and expand them in Lab into usable execution documents.",
        },
      },
    ],
  },
  flow: {
    title: {
      ko: "발견한 아이디어를 자산으로 바꾸는 흐름",
      en: "How ideas turn into working assets",
    },
    copy: {
      ko: "Mine에서 고르고, Vault에 저장하고, Lab에서 문서로 정리합니다.",
      en: "Choose in Mine, keep it in Vault, and turn it into documents in Lab.",
    },
    steps: [
      {
        id: "01",
        title: {
          ko: "발견",
          en: "Discover",
        },
        copy: {
          ko: "Mine에서 오늘 먼저 볼 아이디어를 고릅니다.",
          en: "Pick the ideas worth opening first in Mine.",
        },
        outcome: {
          ko: "오늘의 추천",
          en: "Today's picks",
        },
      },
      {
        id: "02",
        title: {
          ko: "저장",
          en: "Save",
        },
        copy: {
          ko: "괜찮은 아이디어를 Vault에 모아두고 다시 비교합니다.",
          en: "Store the promising ones in Vault and compare them again later.",
        },
        outcome: {
          ko: "아이디어 자산",
          en: "Idea assets",
        },
      },
      {
        id: "03",
        title: {
          ko: "문서화",
          en: "Document",
        },
        copy: {
          ko: "좋은 아이디어를 프로젝트 개요서와 풀 개요서로 확장합니다.",
          en: "Expand the strongest idea into a project overview and a full execution document.",
        },
        outcome: {
          ko: "바로 실행",
          en: "Ready to act",
        },
      },
    ],
    selectedIdeaLabel: {
      ko: "오늘 고른 아이디어",
      en: "Today's chosen idea",
    },
    selectedIdeaTitle: {
      ko: "크리에이터 SaaS 가격 문제 탐지 도구",
      en: "Pricing friction detector for creator SaaS",
    },
    docsLabel: {
      ko: "이어지는 문서",
      en: "Documents that follow",
    },
    docs: {
      ko: ["프로젝트 개요서", "제품 설계서", "기술 청사진", "실행 로드맵"],
      en: ["Project overview", "Product design", "Technical blueprint", "Execution roadmap"],
    },
  },
  returnLoop: {
    title: {
      ko: "내일도 다시 들어오게 되는 이유",
      en: "Why you will want to come back tomorrow",
    },
    copy: {
      ko: "매일 새로운 아이디어가 들어오고, 저장한 아이디어는 쌓이고, 좋은 아이디어는 더 깊은 문서로 이어집니다.",
      en: "New ideas keep arriving, saved ideas keep stacking up, and the strongest ones keep turning into deeper documents.",
    },
    beats: [
      {
        title: {
          ko: "오늘",
          en: "Today",
        },
        copy: {
          ko: "새로운 아이디어를 발견합니다.",
          en: "Discover a new idea.",
        },
      },
      {
        title: {
          ko: "내일",
          en: "Tomorrow",
        },
        copy: {
          ko: "또 볼 만한 아이디어가 들어옵니다.",
          en: "Another strong idea is waiting.",
        },
      },
      {
        title: {
          ko: "계속",
          en: "Ongoing",
        },
        copy: {
          ko: "좋은 아이디어는 문서와 방향으로 이어집니다.",
          en: "The best ideas keep turning into documents and direction.",
        },
      },
    ],
  },
  finalCta: {
    title: {
      ko: "오늘의 아이디어부터 시작하세요.",
      en: "Start with today's ideas.",
    },
    primaryCta: {
      guest: {
        ko: "오늘의 아이디어 보기",
        en: "See today's ideas",
      },
      member: {
        ko: "오늘의 아이디어 보기",
        en: "See today's ideas",
      },
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
    docs: { ko: string[]; en: string[] };
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
