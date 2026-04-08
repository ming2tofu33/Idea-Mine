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

// --- Overview ---

export interface Overview {
  id: string;
  idea_id: string;
  user_id: string;
  concept_ko: string;
  concept_en: string;
  problem_ko: string;
  problem_en: string;
  target_ko: string;
  target_en: string;
  features_ko: string;
  features_en: string;
  differentiator_ko: string;
  differentiator_en: string;
  revenue_ko: string;
  revenue_en: string;
  mvp_scope_ko: string;
  mvp_scope_en: string;
  created_at: string;
  updated_at: string;
}

// --- Appraisal ---

export type AppraisalDepth = "basic_free" | "basic" | "precise_lite" | "precise_pro";

export interface Appraisal {
  id: string;
  overview_id: string;
  depth: AppraisalDepth;
  market_fit_ko: string;
  market_fit_en: string;
  problem_fit_ko?: string;
  problem_fit_en?: string;
  feasibility_ko: string;
  feasibility_en: string;
  differentiation_ko?: string;
  differentiation_en?: string;
  scalability_ko?: string;
  scalability_en?: string;
  risk_ko: string;
  risk_en: string;
}

// --- Full Overview ---

export interface FullOverview {
  id: string;
  user_id: string;
  overview_id: string;
  concept: string;
  problem: string;
  target_user: string;
  features_must: string[];
  features_should: string[];
  features_later: string[];
  user_flow: string[];
  screens: string[];
  business_model: string;
  business_rules: string[];
  mvp_scope: string;
  tech_stack: Record<string, string>;
  data_model_sql: string;
  api_endpoints: string[];
  file_structure: string;
  external_services: string[];
  auth_flow: string[];
  created_at: string;
  updated_at: string;
}

// --- Error ---

export interface ApiError {
  error: string;
  message: string;
  retry_after?: number;
}

// --- Usage Info ---

export interface UsageInfo {
  tier: string;
  overviews: { used: number; limit: number };
  generations: { used: number; limit: number };
}

// --- User Profile ---

export type UserTier = "free" | "lite" | "pro";
export type UserRole = "user" | "admin";

export interface UserProfile {
  id: string;
  nickname: string;
  language: "ko" | "en";
  tier: UserTier;
  role: UserRole;
  persona_tier: UserTier | null;
  miner_level: number;
  streak_days: number;
}

// --- Product Design (제품 설계서) ---

export interface ProductDesign {
  id: string;
  user_id: string;
  overview_id: string;
  user_flow: string[];
  screens: string[];
  features_must: string[];
  features_should: string[];
  features_later: string[];
  business_model: string;
  business_rules: string[];
  mvp_scope: string;
  axes: {
    interface_complexity: string;
    business_complexity: string;
    technical_complexity: string;
  } | null;
  created_at: string;
}

// --- Blueprint (기술 청사진) ---

export interface Blueprint {
  id: string;
  user_id: string;
  design_id: string;
  tech_stack: string[];
  data_model_sql: string;
  api_endpoints: string[];
  file_structure: string;
  external_services: string[];
  auth_flow: string[];
  created_at: string;
}

// --- Roadmap (실행 로드맵) ---

export interface Roadmap {
  id: string;
  user_id: string;
  blueprint_id: string;
  phase_0: string[];
  phase_1: string[];
  phase_2: string[];
  validation_checkpoints: string[];
  estimated_complexity: string;
  first_sprint_tasks: string[];
  created_at: string;
}

// --- Admin Cost Summary ---

export interface CostByFeature {
  feature_type: string;
  cost: number;
  calls: number;
}

export interface CostByDateFeature {
  date: string;
  mining?: number;
  overview?: number;
  appraisal?: number;
  full_overview?: number;
  [key: string]: string | number | undefined;
}

export interface CostLogEntry {
  id: string;
  feature_type: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_cost_usd: number;
  status: string;
  created_at: string;
}

export interface CostSummaryResponse {
  total_cost_usd: number;
  total_calls: number;
  avg_cost_per_call: number;
  by_feature: CostByFeature[];
  by_date_feature: CostByDateFeature[];
  recent_logs: CostLogEntry[];
}
