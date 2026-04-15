"use client";

import type { UserProfile } from "@/types/api";

type Language = "en";

export function useLanguage(profile?: UserProfile | null) {
  const lang: Language = "en";

  return {
    lang,
    setLang: () => {},
    toggle: () => {},
    isUpdating: false,
    isGuest: !profile,
  };
}
