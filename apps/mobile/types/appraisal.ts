export type AppraisalDepth = "basic" | "precise" | "deep";

export interface Appraisal {
  id: string;
  overview_id: string;
  depth: AppraisalDepth;
  market_fit_ko: string;
  market_fit_en: string;
  problem_fit_ko: string;
  problem_fit_en: string;
  feasibility_ko: string;
  feasibility_en: string;
  differentiation_ko: string;
  differentiation_en: string;
  scalability_ko: string;
  scalability_en: string;
  risk_ko: string;
  risk_en: string;
  created_at: string;
}
