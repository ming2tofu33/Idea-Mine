alter table public.ideas
  add column idea_line_ko text,
  add column idea_line_en text;

update public.ideas
set
  idea_line_ko = coalesce(nullif(summary_ko, ''), title_ko),
  idea_line_en = coalesce(nullif(summary_en, ''), title_en)
where idea_line_ko is null
   or idea_line_en is null;

alter table public.ideas
  alter column idea_line_ko set not null,
  alter column idea_line_en set not null;
