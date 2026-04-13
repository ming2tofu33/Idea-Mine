create or replace function public.sync_idea_one_liners()
returns trigger
language plpgsql
as $$
begin
  if new.idea_line_ko is null or btrim(new.idea_line_ko) = '' then
    new.idea_line_ko := coalesce(nullif(new.summary_ko, ''), nullif(new.title_ko, ''), '');
  end if;

  if new.idea_line_en is null or btrim(new.idea_line_en) = '' then
    new.idea_line_en := coalesce(nullif(new.summary_en, ''), nullif(new.title_en, ''), '');
  end if;

  return new;
end;
$$;

drop trigger if exists sync_idea_one_liners_before_write on public.ideas;

create trigger sync_idea_one_liners_before_write
before insert or update on public.ideas
for each row
execute function public.sync_idea_one_liners();
