export interface FullOverview {
  id: string;
  overview_id: string;
  // Narrative
  concept: string;
  problem: string;
  target_user: string;
  features_must: string[];    // JSON parsed
  features_should: string[];
  features_later: string[];
  user_flow: string[];
  screens: string[];
  business_model: string;
  business_rules: string[];
  mvp_scope: string;
  // Technical
  tech_stack: Record<string, string>;
  data_model_sql: string;
  api_endpoints: string[];
  file_structure: string;
  external_services: string[];
  auth_flow: string[];
  created_at: string;
}
