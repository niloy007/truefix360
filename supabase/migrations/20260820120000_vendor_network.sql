-- Vendor database extensions + authenticated Shared Vendor Network
-- Safe for existing vendor_profiles / vendor_applications / coverage data.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.vendor_operational_status as enum (
    'active',
    'inactive',
    'pending',
    'do_not_use'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.vendor_source as enum (
    'manual',
    'vendor_application',
    'shared_network'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.vendor_network_permission as enum (
    'viewer',
    'contributor',
    'manager'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.vendor_network_submission_status as enum (
    'pending',
    'approved',
    'rejected',
    'needs_info'
  );
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Extend vendor_profiles
-- ---------------------------------------------------------------------------

alter table public.vendor_profiles
  add column if not exists alternate_phone text,
  add column if not exists preferred boolean not null default false,
  add column if not exists vendor_status public.vendor_operational_status not null default 'active',
  add column if not exists shared_network_visible boolean not null default false,
  add column if not exists source public.vendor_source not null default 'manual',
  add column if not exists source_submission_id uuid,
  add column if not exists created_by uuid references public.profiles (id) on delete set null,
  add column if not exists coverage_states text[] not null default '{}',
  add column if not exists coverage_counties text[] not null default '{}',
  add column if not exists coverage_cities text[] not null default '{}',
  add column if not exists coverage_zips text[] not null default '{}',
  add column if not exists service_radius_miles integer,
  add column if not exists home_zip text,
  add column if not exists trip_fee_enabled boolean not null default false,
  add column if not exists trip_fee_amount numeric(10, 2),
  add column if not exists trip_fee_notes text,
  add column if not exists standard_availability text,
  add column if not exists emergency_available boolean not null default false,
  add column if not exists after_hours_available boolean not null default false,
  add column if not exists weekend_available boolean not null default false,
  add column if not exists license_number text,
  add column if not exists license_state text,
  add column if not exists license_expires_on date,
  add column if not exists insurance_expires_on date,
  add column if not exists w9_status text,
  add column if not exists public_notes text,
  add column if not exists phone_normalized text,
  add column if not exists email_normalized text;

-- Backfill source from approved applications
update public.vendor_profiles vp
set source = 'vendor_application'
from public.vendor_applications va
where va.vendor_organization_id = vp.organization_id
  and vp.source = 'manual';

-- Align vendor_status with organization status where inactive/suspended
update public.vendor_profiles vp
set vendor_status = case
  when o.status = 'inactive' then 'inactive'::public.vendor_operational_status
  when o.status = 'suspended' then 'do_not_use'::public.vendor_operational_status
  else vp.vendor_status
end
from public.organizations o
where o.id = vp.organization_id
  and o.type = 'vendor';

-- Normalize phone/email for existing rows
update public.vendor_profiles
set
  phone_normalized = nullif(regexp_replace(coalesce(primary_phone, ''), '\D', '', 'g'), ''),
  email_normalized = nullif(lower(trim(coalesce(primary_email, ''))), '')
where phone_normalized is null or email_normalized is null;

-- ---------------------------------------------------------------------------
-- Share links
-- ---------------------------------------------------------------------------

create table if not exists public.vendor_network_links (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  token_hash text not null unique,
  permission public.vendor_network_permission not null default 'viewer',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz,
  revoked_at timestamptz,
  last_accessed_at timestamptz
);

create index if not exists idx_vendor_network_links_created
  on public.vendor_network_links (created_at desc);

create index if not exists idx_vendor_network_links_active
  on public.vendor_network_links (revoked_at, expires_at);

-- ---------------------------------------------------------------------------
-- Network submissions (separate from vendor_applications)
-- ---------------------------------------------------------------------------

create table if not exists public.vendor_network_submissions (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text,
  phone text not null,
  alternate_phone text,
  email text,
  website text,
  address text,
  city text,
  state text,
  zip text,
  service_categories text[] not null default '{}',
  coverage_states text[] not null default '{}',
  coverage_counties text[] not null default '{}',
  coverage_cities text[] not null default '{}',
  coverage_zips text[] not null default '{}',
  service_radius_miles integer,
  home_zip text,
  trip_fee_enabled boolean not null default false,
  trip_fee_amount numeric(10, 2),
  trip_fee_notes text,
  standard_availability text,
  emergency_available boolean not null default false,
  after_hours_available boolean not null default false,
  weekend_available boolean not null default false,
  notes text,
  status public.vendor_network_submission_status not null default 'pending',
  submitted_by uuid references public.profiles (id) on delete set null,
  submitted_by_email text,
  submitted_by_name text,
  network_link_id uuid references public.vendor_network_links (id) on delete set null,
  submitted_at timestamptz not null default timezone('utc', now()),
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  resulting_vendor_organization_id uuid references public.organizations (id) on delete set null,
  phone_normalized text,
  email_normalized text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Link source_submission_id after submissions table exists
do $$ begin
  alter table public.vendor_profiles
    add constraint vendor_profiles_source_submission_fk
    foreign key (source_submission_id)
    references public.vendor_network_submissions (id)
    on delete set null;
exception when duplicate_object then null;
end $$;

create index if not exists idx_vendor_profiles_status
  on public.vendor_profiles (vendor_status);

create index if not exists idx_vendor_profiles_shared
  on public.vendor_profiles (shared_network_visible)
  where shared_network_visible = true;

create index if not exists idx_vendor_profiles_preferred
  on public.vendor_profiles (preferred)
  where preferred = true;

create index if not exists idx_vendor_profiles_phone_norm
  on public.vendor_profiles (phone_normalized)
  where phone_normalized is not null;

create index if not exists idx_vendor_profiles_email_norm
  on public.vendor_profiles (email_normalized)
  where email_normalized is not null;

create index if not exists idx_vendor_profiles_state
  on public.vendor_profiles (state);

create index if not exists idx_vendor_network_submissions_status
  on public.vendor_network_submissions (status, submitted_at desc);

create index if not exists idx_vendor_network_submissions_phone
  on public.vendor_network_submissions (phone_normalized)
  where phone_normalized is not null;

create index if not exists idx_vendor_network_submissions_email
  on public.vendor_network_submissions (email_normalized)
  where email_normalized is not null;

create trigger trg_vendor_network_submissions_updated
  before update on public.vendor_network_submissions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.vendor_network_links enable row level security;
alter table public.vendor_network_submissions enable row level security;

drop policy if exists vendor_network_links_staff on public.vendor_network_links;
create policy vendor_network_links_staff on public.vendor_network_links
  for all to authenticated
  using (public.is_internal_staff())
  with check (public.is_internal_staff());

drop policy if exists vendor_network_submissions_staff on public.vendor_network_submissions;
create policy vendor_network_submissions_staff on public.vendor_network_submissions
  for all to authenticated
  using (public.is_internal_staff())
  with check (public.is_internal_staff());

grant select, insert, update, delete on public.vendor_network_links to authenticated;
grant select, insert, update, delete on public.vendor_network_submissions to authenticated;

revoke all on public.vendor_network_links from anon;
revoke all on public.vendor_network_submissions from anon;
