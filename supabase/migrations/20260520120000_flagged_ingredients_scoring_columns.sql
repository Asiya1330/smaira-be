-- Claude scoring metadata on flagged_ingredients (ingredients-score API).
alter table public.flagged_ingredients
  add column if not exists impact_score text,
  add column if not exists classification text,
  add column if not exists confidence text,
  add column if not exists brief_reasoning text,
  add column if not exists needs_human_review boolean not null default false;

alter table public.product_submissions
  add column if not exists scan_count integer not null default 1,
  add column if not exists retrieval_source text;


alter table public.product_submissions
  add column if not exists submitter_role text not null default 'user';

alter table public.ingredients
  add column if not exists short_description text;