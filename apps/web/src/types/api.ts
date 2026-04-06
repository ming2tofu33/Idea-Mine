/**
 * IDEA MINE API Types
 * Synced with backend/app/models/schemas.py
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

export type VeinRarity = "common" | "rare" | "golden" | "legend";

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

export type IdeaTierType = "stable" | "expansion" | "pivot" | "rare";

export interface KeywordComboEntry {
  category: string;
  slug: string;
  ko: string;
  en: string;
}

export interface Idea {
  id: string;
  title_ko: string;
  title_en: string;
  summary_ko: string;
  summary_en: string;
  keyword_combo: KeywordComboEntry[];
  tier_type: IdeaTierType;
  sort_order: number;
  is_vaulted: boolean;
}

export interface MineResponse {
  ideas: Idea[];
  vein_id: string;
}

// --- Vault ---

export interface VaultResponse {
  vaulted_count: number;
  idea_ids: string[];
}

// --- Error ---

export interface ApiError {
  error: string;
  message: string;
  retry_after?: number;
}
