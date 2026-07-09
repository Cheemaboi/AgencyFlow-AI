alter table public.profiles
  add column if not exists job_title text,
  add column if not exists theme_preference text not null default 'light'
    check (theme_preference in ('light', 'dark')),
  add column if not exists email_notifications boolean not null default true;

alter table public.organizations
  add column if not exists brand_tagline text;
