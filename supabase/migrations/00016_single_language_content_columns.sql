begin;

drop trigger if exists sync_idea_one_liners_before_write on public.ideas;
drop function if exists public.sync_idea_one_liners();

alter table public.ideas
  drop column if exists idea_line_ko,
  drop column if exists title_ko,
  drop column if exists summary_ko;

alter table public.overviews
  drop column if exists concept_ko,
  drop column if exists problem_ko,
  drop column if exists target_ko,
  drop column if exists features_ko,
  drop column if exists differentiator_ko,
  drop column if exists revenue_ko,
  drop column if exists mvp_scope_ko;

alter table public.appraisals
  drop column if exists market_fit_ko,
  drop column if exists problem_fit_ko,
  drop column if exists feasibility_ko,
  drop column if exists differentiation_ko,
  drop column if exists scalability_ko,
  drop column if exists risk_ko;

alter table public.ideas rename column idea_line_en to idea_line;
alter table public.ideas rename column title_en to title;
alter table public.ideas rename column summary_en to summary;

alter table public.overviews rename column concept_en to concept;
alter table public.overviews rename column problem_en to problem;
alter table public.overviews rename column target_en to target;
alter table public.overviews rename column features_en to features;
alter table public.overviews rename column differentiator_en to differentiator;
alter table public.overviews rename column revenue_en to revenue;
alter table public.overviews rename column mvp_scope_en to mvp_scope;

alter table public.appraisals rename column market_fit_en to market_fit;
alter table public.appraisals rename column problem_fit_en to problem_fit;
alter table public.appraisals rename column feasibility_en to feasibility;
alter table public.appraisals rename column differentiation_en to differentiation;
alter table public.appraisals rename column scalability_en to scalability;
alter table public.appraisals rename column risk_en to risk;

commit;
