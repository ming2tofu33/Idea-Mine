/**
 * IDEA MINE API Types
 * backend/app/models/schemas.py 와 동기화
 */

// --- Keywords ---

export interface Keyword {
  id: string;
  slug: string;
  category: "ai" | "who" | "domain" | "tech" | "value" | "money";
  ko: string;
  en: string;
  is_premium: boolean;
}

// --- Veins ---

export type VeinRarity = "common" | "uncommon" | "rare";

export interface Vein {
  id: string;
  slot_index: number;
  keyword_ids: string[];
  keywords: Keyword[];
  rarity: VeinRarity;
  is_selected: boolean;
}

export interface TodayVeinsResponse {
  veins: Vein[];
  rerolls_used: number;
  rerolls_max: number;
  generations_used: number;
  generations_max: number;
}

export interface RerollResponse {
  veins: Vein[];
  rerolls_used: number;
  rerolls_max: number;
}

// --- Ideas ---

export type IdeaTierType = "stable" | "expanded" | "pivot" | "rare";

export interface Idea {
  id: string;
  title: string;
  summary: string;
  keyword_combo: KeywordComboEntry[];
  tier_type: IdeaTierType;
  sort_order: number;
  is_vaulted: boolean;
  language: string;
}

export interface KeywordComboEntry {
  category: string;
  slug: string;
  ko: string;
  en: string;
}

export interface MineResponse {
  ideas: Idea[];
  vein_id: string;
}

// --- Errors ---

export interface ApiError {
  error: string;
  message: string;
  retry_after?: number;
}

// --- User Profile ---

export type UserTier = "free" | "lite" | "pro";

export interface UserProfile {
  id: string;
  nickname: string;
  language: "ko" | "en";
  tier: UserTier;
  miner_level: number;
  consecutive_days: number;
  role: "user" | "admin";
}

// --- Daily State ---

export interface DailyState {
  rerolls_used: number;
  rerolls_max: number;
  generations_used: number;
  generations_max: number;
}

// --- Vault ---

export interface VaultRequest {
  idea_ids: string[];
  vein_id: string;
}

export interface VaultResponse {
  vaulted_count: number;
  idea_ids: string[];
}
