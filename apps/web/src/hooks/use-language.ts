"use client";

import { useSyncExternalStore } from "react";
import { useProfile } from "./use-profile";
import type { UserProfile } from "@/types/api";

type Language = "ko" | "en";

const GUEST_LANG_KEY = "idea-mine:guest-lang";

// --- External store for guest language ---
// 모든 useLanguage 호출이 동일한 store를 구독하므로, 한 곳에서 토글하면
// 모든 consumer가 재렌더된다. useState 기반의 로컬 상태와 다른 핵심 차이점.

let currentGuestLang: Language = "ko";
const listeners = new Set<() => void>();

// 모듈 로드 시 localStorage에서 초기값 읽기 (클라이언트에서만)
if (typeof window !== "undefined") {
  try {
    const stored = window.localStorage.getItem(GUEST_LANG_KEY);
    if (stored === "en") {
      currentGuestLang = "en";
    }
  } catch {
    // ignore
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Language {
  return currentGuestLang;
}

// 서버 렌더링 시 사용되는 스냅샷. 하이드레이션 중에도 첫 렌더에 사용된다.
// "ko"로 고정해서 SSR과 첫 클라이언트 렌더가 반드시 일치하도록 함.
// 하이드레이션 완료 후 React가 자동으로 getSnapshot 값으로 재렌더.
function getServerSnapshot(): Language {
  return "ko";
}

function setGuestLangExternal(next: Language): void {
  currentGuestLang = next;
  try {
    window.localStorage.setItem(GUEST_LANG_KEY, next);
  } catch {
    // ignore
  }
  listeners.forEach((listener) => listener());
}

/**
 * 언어 상태를 추상화하는 훅.
 * - 로그인 유저: profile.language (DB) + updateLanguage mutation
 * - 게스트: 모듈 레벨 external store (localStorage 백업)
 *
 * External store 패턴을 쓰는 이유:
 * 1. 여러 컴포넌트가 동일한 guest lang 상태를 공유해야 함
 *    (AppHeader 토글 → DemoVault/DemoLab/DemoMine 전부 재렌더)
 * 2. SSR/CSR hydration safety (getServerSnapshot은 항상 "ko" 반환)
 */
export function useLanguage(profile?: UserProfile | null) {
  const { profile: hookProfile, updateLanguage, isUpdatingLanguage } = useProfile();
  const effectiveProfile = profile ?? hookProfile;

  const guestLang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const lang: Language = effectiveProfile?.language ?? guestLang;

  const setLang = (next: Language) => {
    if (effectiveProfile) {
      updateLanguage(next);
    } else {
      setGuestLangExternal(next);
    }
  };

  const toggle = () => setLang(lang === "ko" ? "en" : "ko");

  return {
    lang,
    setLang,
    toggle,
    isUpdating: isUpdatingLanguage,
    isGuest: !effectiveProfile,
  };
}
