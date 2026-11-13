-- RUN ONCE IN YOUR OWN SUPABASE PROJECT: SQL Editor > New query > Run
-- 12 fixed questions. Responses can be INSERTED publicly but READ only by admins.

create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null check (length(trim(full_name)) between 1 and 120),
  age integer not null check (age between 1 and 120),
  gender text not null check (gender in ('Male','Female','Other','Prefer not to say')),
  email text not null check (length(trim(email)) between 3 and 254),
  phone text not null check (length(trim(phone)) between 1 and 40),
  district text not null check (length(trim(district)) between 1 and 120),
  qualification text not null check (qualification in ('SSC','HSC','Diploma','Undergraduate','Postgraduate','Other')),
  university text not null check (length(trim(university)) between 1 and 255),
  department text not null check (length(trim(department)) between 1 and 255),
  academic_year text not null check (academic_year in ('1st Year','2nd Year','3rd Year','4th Year','5th Year','Other')),
  occupation text not null check (occupation in ('Student','Employed','Self-employed','Unemployed','Other')),
  feedback text check (feedback is null or length(feedback) <= 2000),
  consented boolean not null check (consented = true)
);

-- Admin users are added ONLY from SQL Editor after creating them in Auth > Users.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create index if not exists survey_responses_created_at_idx
  on public.survey_responses(created_at desc);

alter table public.survey_responses enable row level security;
alter table public.admin_users enable row level security;

-- Least-privilege grants: public users cannot read, update, or delete responses.
revoke all on table public.survey_responses from public, anon, authenticated;
revoke all on table public.admin_users from public, anon, authenticated;
grant insert on table public.survey_responses to anon, authenticated;
grant select on table public.survey_responses to authenticated;
grant select on table public.admin_users to authenticated;

-- Clean policies if this script is re-run.
drop policy if exists "Anyone can submit a response" on public.survey_responses;
drop policy if exists "Admins can read survey responses" on public.survey_responses;
drop policy if exists "Admins can read own membership" on public.admin_users;

create policy "Anyone can submit a response"
  on public.survey_responses for insert to anon, authenticated
  with check (consented = true);

create policy "Admins can read own membership"
  on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Admins can read survey responses"
  on public.survey_responses for select to authenticated
  using (
    exists (
      select 1 from public.admin_users as a
      where a.user_id = (select auth.uid())
    )
  );

-- IMPORTANT: After adding your admin account in Authentication > Users,
-- open SQL Editor and run the following as a SEPARATE query, replacing the UUID:
-- insert into public.admin_users (user_id)
-- values ('PASTE-YOUR-ADMIN-USER-UUID-HERE');
