export type AppraisalDepth = "basic_free" | "basic" | "precise_lite" | "precise_pro";

export interface Appraisal {
  id: string;
  overview_id: string;
  depth: AppraisalDepth;
  // 3축 (basic_free에서도 포함)
  market_fit_ko: string;
  market_fit_en: string;
  feasibility_ko: string;
  feasibility_en: string;
  risk_ko: string;
  risk_en: string;
  // 추가 3축 (basic 이상에서만)
  problem_fit_ko?: string;
  problem_fit_en?: string;
  differentiation_ko?: string;
  differentiation_en?: string;
  scalability_ko?: string;
  scalability_en?: string;
  created_at: string;
}

/** 감정 축 정의 — UI 표시 순서 및 라벨 */
export const APPRAISAL_AXES = {
  market_fit: { ko: "시장성", en: "Market Fit", icon: "📊" },
  problem_fit: { ko: "문제 적합성", en: "Problem Fit", icon: "🎯" },
  feasibility: { ko: "실행 가능성", en: "Feasibility", icon: "🔧" },
  differentiation: { ko: "차별화 가능성", en: "Differentiation", icon: "💎" },
  scalability: { ko: "확장성", en: "Scalability", icon: "📈" },
  risk: { ko: "리스크", en: "Risk", icon: "⚠️" },
} as const;

/** basic_free에서 보여주는 3축 */
export const FREE_AXES = ["market_fit", "feasibility", "risk"] as const;

/** basic 이상에서 보여주는 6축 */
export const FULL_AXES = [
  "market_fit",
  "problem_fit",
  "feasibility",
  "differentiation",
  "scalability",
  "risk",
] as const;
