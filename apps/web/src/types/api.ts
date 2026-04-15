/**
 * IDEA MINE API Types
 * Synced with backend/app/models/schemas.py
 */

// --- Keywords ---

export interface Keyword {
  id: string;
  slug: string;
  category: "ai" | "who" | "domain" | "tech" | "value" | "money";
  label: string;
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

export interface KeywordComboEntry {
  category: string;
  slug: string;
  label: string;
}

export interface Idea {
  id: string;
  idea_line: string;
  title: string;
  summary: string;
  keyword_combo: KeywordComboEntry[];
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
  concept: string;
  problem: string;
  target: string;
  features: string;
  differentiator: string;
  revenue: string;
  mvp_scope: string;
  created_at: string;
  updated_at: string;
}

// --- Appraisal ---

export type AppraisalDepth = "basic_free" | "basic" | "precise_lite" | "precise_pro";

export interface Appraisal {
  id: string;
  overview_id: string;
  depth: AppraisalDepth;
  market_fit: string;
  problem_fit?: string;
  feasibility: string;
  differentiation?: string;
  scalability?: string;
  risk: string;
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
  tier: UserTier;
  role: UserRole;
  persona_tier: UserTier | null;
  miner_level: number;
  streak_days: number;
}

// --- Product Design ---

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

// --- Blueprint ---

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

// --- Roadmap ---

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
