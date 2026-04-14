create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  barcode text not null unique,
  product_name text,
  -- Legacy compatibility for existing seed/data loaders.
  name text,
  brand text,
  category text,
  size_count text,
  absorbency text,
  ingredients_list text,
  material_composition text,
  bleaching_method text,
  synthetic_materials text,
  preservatives text,
  fragrance_type text,
  antibacterial_agents text,
  ph_level text,
  usda_organic boolean,
  gots_certified boolean,
  oeko_tex_certified boolean,
  gyno_approved boolean,
  image_url text,
  score integer,
  organic text,
  certifications text,
  source_url text,
  verified boolean default false
);

create table if not exists public.ingredients (
  ingredient_id uuid primary key default gen_random_uuid(),
  ingredient_name text not null,
  inci_name text not null,
  impact_score integer,
  classification text,
  plain_english_summary text,
  study_title text,
  pubmed_link text,
  year_published integer,
  evidence_strength text,
  conflicting_evidence text,
  notes text
);

create unique index if not exists ingredients_inci_name_idx
  on public.ingredients (inci_name);

create table if not exists public.product_ingredients (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(ingredient_id) on delete cascade,
  unique (product_id, ingredient_id)
);

create table if not exists public.scoring_rules (
  id uuid primary key default gen_random_uuid(),
  min_score integer not null,
  max_score integer not null,
  rating text not null,
  color text
);

create table if not exists public.saved_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_id uuid not null references public.products(id) on delete cascade,
  saved_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.product_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_name text not null,
  brand text,
  barcode text,
  category text,
  image_url text,
  ingredients text,
  submitted_at timestamptz not null default now(),
  status text not null default 'pending',
  review_notes text
);

create table if not exists public.flagged_ingredients (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  ingredient_name text,
  inci_name text,
  flagged_at timestamptz not null default now(),
  status text not null default 'Pending'
);
