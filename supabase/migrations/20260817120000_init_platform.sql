-- TrueFix360 production platform schema
-- Apply in the Supabase SQL editor or with the Supabase CLI.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.organization_type as enum ('internal', 'client', 'vendor');
create type public.organization_status as enum ('active', 'inactive', 'suspended');
create type public.membership_role as enum ('admin', 'staff', 'client', 'vendor_admin', 'crew');
create type public.membership_status as enum ('invited', 'active', 'disabled');
create type public.record_status as enum ('active', 'inactive');

create type public.contact_status as enum ('new', 'reviewing', 'responded', 'closed');
create type public.quote_status as enum (
  'new', 'reviewing', 'contacted', 'qualified', 'converted', 'declined', 'closed'
);
create type public.vendor_application_status as enum (
  'submitted', 'reviewing', 'more_information_needed', 'approved', 'declined', 'onboarded'
);
create type public.service_request_status as enum (
  'submitted', 'reviewing', 'accepted', 'converted', 'closed', 'cancelled'
);
create type public.work_order_status as enum (
  'new', 'sourcing', 'offered', 'assigned', 'scheduled', 'en_route', 'on_site',
  'estimate_required', 'awaiting_client_approval', 'approved', 'in_progress',
  'completed', 'cancelled'
);
create type public.assignment_status as enum (
  'offered', 'accepted', 'declined', 'withdrawn', 'completed'
);
create type public.estimate_status as enum (
  'draft', 'submitted', 'internal_review', 'sent_to_client', 'approved', 'declined', 'withdrawn'
);
create type public.invitation_status as enum ('pending', 'accepted', 'expired', 'revoked');
create type public.visibility_scope as enum ('internal', 'client', 'vendor', 'shared');
create type public.file_category as enum (
  'before', 'during', 'after', 'estimate', 'invoice', 'supporting', 'completion',
  'quote', 'w9', 'general_liability', 'workers_comp', 'business_license', 'other'
);
create type public.notification_provider as enum ('email', 'whatsapp');
create type public.notification_status as enum ('pending', 'sent', 'failed', 'skipped');
create type public.priority_level as enum ('routine', 'priority', 'emergency');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.reference_counters (
  kind text primary key,
  year integer not null,
  last_value integer not null default 0
);

create or replace function public.next_reference(p_kind text, p_prefix text)
returns text
language plpgsql
as $$
declare
  y integer := extract(year from timezone('utc', now()))::integer;
  n integer;
begin
  insert into public.reference_counters as c (kind, year, last_value)
  values (p_kind, y, 1)
  on conflict (kind) do update
    set year = y,
        last_value = case when c.year = y then c.last_value + 1 else 1 end
  returning last_value into n;

  return p_prefix || '-' || y::text || '-' || lpad(n::text, 6, '0');
end;
$$;

-- ---------------------------------------------------------------------------
-- Identity
-- ---------------------------------------------------------------------------

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.organization_type not null,
  status public.organization_status not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.organizations (id, name, type, status)
values (
  'a0000000-0000-4000-8000-000000000001',
  'TrueFix360',
  'internal',
  'active'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  last_name text,
  display_name text,
  phone text,
  avatar_url text,
  first_login_at timestamptz,
  last_login_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.membership_role not null,
  status public.membership_status not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, user_id, role)
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  role public.membership_role not null,
  invited_by uuid references public.profiles (id) on delete set null,
  status public.invitation_status not null default 'pending',
  accepted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.client_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations (id) on delete cascade,
  billing_email text,
  billing_phone text,
  billing_address text,
  internal_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.vendor_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations (id) on delete cascade,
  legal_name text,
  primary_contact_name text,
  primary_email text,
  primary_phone text,
  website text,
  address text,
  city text,
  state text,
  zip text,
  service_categories text[] not null default '{}',
  coverage text,
  insurance_status text,
  workers_comp_status text,
  onboarding_status text not null default 'pending',
  internal_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, display_name)
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'first_name', ''),
    nullif(new.raw_user_meta_data->>'last_name', ''),
    coalesce(
      nullif(new.raw_user_meta_data->>'display_name', ''),
      nullif(trim(concat(new.raw_user_meta_data->>'first_name', ' ', new.raw_user_meta_data->>'last_name')), ''),
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Auth helper functions (SECURITY DEFINER, locked search_path)
-- ---------------------------------------------------------------------------

create or replace function public.is_internal_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships m
    join public.organizations o on o.id = m.organization_id
    where m.user_id = auth.uid()
      and m.status = 'active'
      and o.type = 'internal'
      and o.status = 'active'
      and m.role in ('admin', 'staff')
  );
$$;

create or replace function public.has_org_role(p_org uuid, p_roles public.membership_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships m
    where m.user_id = auth.uid()
      and m.organization_id = p_org
      and m.status = 'active'
      and m.role = any (p_roles)
  );
$$;

create or replace function public.is_org_member(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships m
    where m.user_id = auth.uid()
      and m.organization_id = p_org
      and m.status = 'active'
  );
$$;

-- ---------------------------------------------------------------------------
-- Public submissions
-- ---------------------------------------------------------------------------

create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique,
  first_name text not null,
  last_name text not null default '',
  company text,
  email text not null,
  phone text not null,
  topic text not null,
  message text not null,
  status public.contact_status not null default 'new',
  source text not null default 'website',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique,
  first_name text not null,
  last_name text not null,
  company text,
  email text not null,
  phone text not null,
  property_address text not null,
  city text not null,
  state text not null,
  zip text not null,
  property_type text not null,
  occupancy_status text not null,
  service_category text not null,
  requested_service text not null,
  description text not null,
  urgency text not null,
  preferred_date date,
  number_of_properties text not null,
  preferred_contact_method text not null,
  status public.quote_status not null default 'new',
  source text not null default 'website',
  converted_service_request_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.vendor_applications (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique,
  company_name text not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  website text,
  address text not null,
  city text not null,
  state text not null,
  zip text not null,
  business_type text not null,
  years_in_business text not null,
  crew_count text not null,
  insurance_status text not null,
  workers_comp_status text not null,
  services text[] not null default '{}',
  states_covered text not null,
  counties_cities text not null,
  travel_radius text not null,
  willing_to_travel text not null,
  trip_charge_required text not null,
  normal_hours text not null,
  emergency_availability text not null,
  weekend_availability text not null,
  experience text not null,
  status public.vendor_application_status not null default 'submitted',
  internal_notes text,
  vendor_organization_id uuid references public.organizations (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.quote_attachments (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null references public.quote_requests (id) on delete cascade,
  storage_path text not null,
  original_name text not null,
  mime_type text not null,
  size_bytes integer not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.form_idempotency (
  key text primary key,
  entity_type text not null,
  entity_id uuid not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.form_rate_limits (
  bucket_key text not null,
  window_start timestamptz not null,
  hit_count integer not null default 1,
  primary key (bucket_key, window_start)
);

-- ---------------------------------------------------------------------------
-- Operations
-- ---------------------------------------------------------------------------

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  client_organization_id uuid not null references public.organizations (id) on delete cascade,
  address1 text not null,
  address2 text,
  city text not null,
  state text not null,
  zip text not null,
  property_type text,
  occupancy_status text,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique,
  client_organization_id uuid not null references public.organizations (id) on delete restrict,
  property_id uuid references public.properties (id) on delete set null,
  originating_quote_id uuid references public.quote_requests (id) on delete set null,
  service_category text not null,
  issue text not null,
  description text not null,
  priority public.priority_level not null default 'routine',
  preferred_schedule text,
  client_reference text,
  client_nte numeric(12, 2),
  status public.service_request_status not null default 'submitted',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.quote_requests
  add constraint quote_requests_converted_fk
  foreign key (converted_service_request_id)
  references public.service_requests (id)
  on delete set null;

create table public.work_orders (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique,
  client_organization_id uuid not null references public.organizations (id) on delete restrict,
  property_id uuid references public.properties (id) on delete set null,
  originating_service_request_id uuid references public.service_requests (id) on delete set null,
  service_category text not null,
  title text not null,
  scope text,
  priority public.priority_level not null default 'routine',
  status public.work_order_status not null default 'new',
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  client_reference text,
  client_nte numeric(12, 2),
  internal_notes text,
  client_visible_notes text,
  vendor_visible_notes text,
  access_instructions text,
  resident_contact_name text,
  resident_contact_phone text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.work_order_assignments (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders (id) on delete cascade,
  vendor_organization_id uuid not null references public.organizations (id) on delete restrict,
  assigned_user_id uuid references public.profiles (id) on delete set null,
  status public.assignment_status not null default 'offered',
  offered_at timestamptz not null default timezone('utc', now()),
  accepted_at timestamptz,
  declined_at timestamptz,
  completed_at timestamptz,
  decline_reason text,
  unique (work_order_id, vendor_organization_id)
);

create table public.work_order_events (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders (id) on delete cascade,
  event text not null,
  actor_user_id uuid references public.profiles (id) on delete set null,
  previous_status public.work_order_status,
  new_status public.work_order_status,
  note text,
  visibility public.visibility_scope not null default 'internal',
  created_at timestamptz not null default timezone('utc', now())
);

create table public.estimates (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique,
  work_order_id uuid not null references public.work_orders (id) on delete cascade,
  vendor_organization_id uuid references public.organizations (id) on delete set null,
  submitted_by uuid references public.profiles (id) on delete set null,
  amount numeric(12, 2),
  description text,
  labor_material_explanation text,
  status public.estimate_status not null default 'draft',
  internal_adjusted_amount numeric(12, 2),
  client_sell_amount numeric(12, 2),
  client_visible_scope text,
  client_comment text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.work_order_files (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders (id) on delete cascade,
  uploaded_by uuid references public.profiles (id) on delete set null,
  organization_id uuid references public.organizations (id) on delete set null,
  category public.file_category not null default 'supporting',
  storage_path text not null,
  original_name text not null,
  mime_type text not null,
  size_bytes integer not null,
  caption text,
  visibility public.visibility_scope not null default 'internal',
  created_at timestamptz not null default timezone('utc', now())
);

create table public.vendor_documents (
  id uuid primary key default gen_random_uuid(),
  vendor_organization_id uuid not null references public.organizations (id) on delete cascade,
  uploaded_by uuid references public.profiles (id) on delete set null,
  category public.file_category not null,
  storage_path text not null,
  original_name text not null,
  mime_type text not null,
  size_bytes integer not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.service_request_files (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references public.service_requests (id) on delete cascade,
  uploaded_by uuid references public.profiles (id) on delete set null,
  storage_path text not null,
  original_name text not null,
  mime_type text not null,
  size_bytes integer not null,
  created_at timestamptz not null default timezone('utc', now())
);

-- ---------------------------------------------------------------------------
-- Notifications + audit
-- ---------------------------------------------------------------------------

create table public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  provider public.notification_provider not null,
  recipient text not null,
  status public.notification_status not null default 'pending',
  provider_message_id text,
  sanitized_error text,
  attempted_at timestamptz not null default timezone('utc', now()),
  delivered_at timestamptz
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles (id) on delete set null,
  organization_id uuid references public.organizations (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

-- ---------------------------------------------------------------------------
-- Confidential views (column isolation)
-- ---------------------------------------------------------------------------

create or replace view public.client_facing_estimates
with (security_barrier = true) as
select
  e.id,
  e.reference_number,
  e.work_order_id,
  e.status,
  e.client_sell_amount,
  e.client_visible_scope,
  e.client_comment,
  e.created_at,
  e.updated_at
from public.estimates e
join public.work_orders w on w.id = e.work_order_id
where public.is_internal_staff()
   or public.is_org_member(w.client_organization_id);

create or replace view public.vendor_facing_estimates
with (security_barrier = true) as
select
  e.id,
  e.reference_number,
  e.work_order_id,
  e.vendor_organization_id,
  e.amount,
  e.description,
  e.labor_material_explanation,
  e.status,
  e.created_at,
  e.updated_at
from public.estimates e
where public.is_internal_staff()
   or (
     e.vendor_organization_id is not null
     and public.is_org_member(e.vendor_organization_id)
   );

create or replace view public.client_facing_work_orders
with (security_barrier = true) as
select
  w.id,
  w.reference_number,
  w.client_organization_id,
  w.property_id,
  w.originating_service_request_id,
  w.service_category,
  w.title,
  w.scope,
  w.priority,
  w.status,
  w.scheduled_start,
  w.scheduled_end,
  w.client_reference,
  w.client_visible_notes,
  w.created_at,
  w.updated_at
from public.work_orders w
where public.is_internal_staff()
   or public.is_org_member(w.client_organization_id);

create or replace view public.vendor_facing_work_orders
with (security_barrier = true) as
select
  w.id,
  w.reference_number,
  w.property_id,
  w.service_category,
  w.title,
  w.priority,
  w.status,
  w.scheduled_start,
  w.scheduled_end,
  w.vendor_visible_notes,
  w.access_instructions,
  w.resident_contact_name,
  w.resident_contact_phone,
  w.created_at,
  w.updated_at
from public.work_orders w
where public.is_internal_staff()
   or exists (
     select 1
     from public.work_order_assignments a
     where a.work_order_id = w.id
       and public.is_org_member(a.vendor_organization_id)
       and a.status in ('offered', 'accepted', 'completed')
   );

create or replace view public.vendor_facing_properties
with (security_barrier = true) as
select
  p.id,
  p.address1,
  p.address2,
  p.city,
  p.state,
  p.zip,
  p.property_type,
  p.occupancy_status
from public.properties p
where public.is_internal_staff()
   or exists (
     select 1
     from public.work_orders w
     join public.work_order_assignments a on a.work_order_id = w.id
     where w.property_id = p.id
       and public.is_org_member(a.vendor_organization_id)
       and a.status in ('offered', 'accepted', 'completed')
   );

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index idx_memberships_user on public.organization_memberships (user_id);
create index idx_memberships_org on public.organization_memberships (organization_id);
create index idx_invitations_email on public.invitations (email);
create index idx_contact_status on public.contact_submissions (status, created_at desc);
create index idx_contact_reference on public.contact_submissions (reference_number);
create index idx_quote_status on public.quote_requests (status, created_at desc);
create index idx_quote_reference on public.quote_requests (reference_number);
create index idx_vendor_app_status on public.vendor_applications (status, created_at desc);
create index idx_vendor_app_reference on public.vendor_applications (reference_number);
create index idx_properties_client on public.properties (client_organization_id);
create index idx_service_requests_client on public.service_requests (client_organization_id, status);
create index idx_service_requests_reference on public.service_requests (reference_number);
create index idx_work_orders_client on public.work_orders (client_organization_id, status);
create index idx_work_orders_reference on public.work_orders (reference_number);
create index idx_work_orders_created on public.work_orders (created_at desc);
create index idx_assignments_vendor on public.work_order_assignments (vendor_organization_id, status);
create index idx_assignments_wo on public.work_order_assignments (work_order_id);
create index idx_wo_events_wo on public.work_order_events (work_order_id, created_at);
create index idx_estimates_wo on public.estimates (work_order_id);
create index idx_estimates_vendor on public.estimates (vendor_organization_id);
create index idx_wo_files_wo on public.work_order_files (work_order_id);
create index idx_vendor_docs_org on public.vendor_documents (vendor_organization_id);
create index idx_notifications_created on public.notification_deliveries (attempted_at desc);
create index idx_notifications_status on public.notification_deliveries (status, event_type);
create index idx_audit_created on public.audit_logs (created_at desc);
create index idx_audit_entity on public.audit_logs (entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

create trigger trg_organizations_updated before update on public.organizations
  for each row execute function public.set_updated_at();
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_invitations_updated before update on public.invitations
  for each row execute function public.set_updated_at();
create trigger trg_client_accounts_updated before update on public.client_accounts
  for each row execute function public.set_updated_at();
create trigger trg_vendor_profiles_updated before update on public.vendor_profiles
  for each row execute function public.set_updated_at();
create trigger trg_contact_updated before update on public.contact_submissions
  for each row execute function public.set_updated_at();
create trigger trg_quotes_updated before update on public.quote_requests
  for each row execute function public.set_updated_at();
create trigger trg_vendor_apps_updated before update on public.vendor_applications
  for each row execute function public.set_updated_at();
create trigger trg_properties_updated before update on public.properties
  for each row execute function public.set_updated_at();
create trigger trg_service_requests_updated before update on public.service_requests
  for each row execute function public.set_updated_at();
create trigger trg_work_orders_updated before update on public.work_orders
  for each row execute function public.set_updated_at();
create trigger trg_estimates_updated before update on public.estimates
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.invitations enable row level security;
alter table public.client_accounts enable row level security;
alter table public.vendor_profiles enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.quote_requests enable row level security;
alter table public.vendor_applications enable row level security;
alter table public.quote_attachments enable row level security;
alter table public.form_idempotency enable row level security;
alter table public.form_rate_limits enable row level security;
alter table public.properties enable row level security;
alter table public.service_requests enable row level security;
alter table public.service_request_files enable row level security;
alter table public.work_orders enable row level security;
alter table public.work_order_assignments enable row level security;
alter table public.work_order_events enable row level security;
alter table public.estimates enable row level security;
alter table public.work_order_files enable row level security;
alter table public.vendor_documents enable row level security;
alter table public.notification_deliveries enable row level security;
alter table public.audit_logs enable row level security;

-- No policies for anon on business tables. Public inserts go through service role.

create policy profiles_self_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_internal_staff());

create policy profiles_self_update on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy orgs_member_select on public.organizations
  for select to authenticated
  using (public.is_internal_staff() or public.is_org_member(id));

create policy memberships_visible on public.organization_memberships
  for select to authenticated
  using (
    public.is_internal_staff()
    or user_id = auth.uid()
    or public.is_org_member(organization_id)
  );

create policy invitations_staff on public.invitations
  for all to authenticated
  using (public.is_internal_staff())
  with check (public.is_internal_staff());

create policy client_accounts_staff on public.client_accounts
  for all to authenticated
  using (public.is_internal_staff())
  with check (public.is_internal_staff());

create policy vendor_profiles_staff on public.vendor_profiles
  for all to authenticated
  using (public.is_internal_staff())
  with check (public.is_internal_staff());

create policy submissions_staff_contact on public.contact_submissions
  for all to authenticated
  using (public.is_internal_staff())
  with check (public.is_internal_staff());

create policy submissions_staff_quote on public.quote_requests
  for all to authenticated
  using (public.is_internal_staff())
  with check (public.is_internal_staff());

create policy submissions_staff_vendor_app on public.vendor_applications
  for all to authenticated
  using (public.is_internal_staff())
  with check (public.is_internal_staff());

create policy quote_attachments_staff on public.quote_attachments
  for all to authenticated
  using (public.is_internal_staff())
  with check (public.is_internal_staff());

create policy properties_staff on public.properties
  for all to authenticated
  using (public.is_internal_staff())
  with check (public.is_internal_staff());

create policy properties_client on public.properties
  for select to authenticated
  using (public.is_org_member(client_organization_id));

create policy service_requests_staff on public.service_requests
  for all to authenticated
  using (public.is_internal_staff())
  with check (public.is_internal_staff());

create policy service_requests_client_select on public.service_requests
  for select to authenticated
  using (public.is_org_member(client_organization_id));

create policy service_requests_client_insert on public.service_requests
  for insert to authenticated
  with check (public.is_org_member(client_organization_id));

create policy service_request_files_staff on public.service_request_files
  for all to authenticated
  using (public.is_internal_staff())
  with check (public.is_internal_staff());

create policy service_request_files_client on public.service_request_files
  for select to authenticated
  using (
    exists (
      select 1 from public.service_requests sr
      where sr.id = service_request_id
        and public.is_org_member(sr.client_organization_id)
    )
  );

create policy work_orders_staff on public.work_orders
  for all to authenticated
  using (public.is_internal_staff())
  with check (public.is_internal_staff());

create policy assignments_staff on public.work_order_assignments
  for all to authenticated
  using (public.is_internal_staff())
  with check (public.is_internal_staff());

create policy assignments_vendor_select on public.work_order_assignments
  for select to authenticated
  using (public.is_org_member(vendor_organization_id));

create policy assignments_vendor_update on public.work_order_assignments
  for update to authenticated
  using (public.is_org_member(vendor_organization_id))
  with check (public.is_org_member(vendor_organization_id));

create policy wo_events_staff on public.work_order_events
  for all to authenticated
  using (public.is_internal_staff())
  with check (public.is_internal_staff());

create policy wo_events_client on public.work_order_events
  for select to authenticated
  using (
    visibility in ('client', 'shared')
    and exists (
      select 1 from public.work_orders w
      where w.id = work_order_id
        and public.is_org_member(w.client_organization_id)
    )
  );

create policy wo_events_vendor on public.work_order_events
  for select to authenticated
  using (
    visibility in ('vendor', 'shared')
    and exists (
      select 1 from public.work_order_assignments a
      where a.work_order_id = work_order_events.work_order_id
        and public.is_org_member(a.vendor_organization_id)
    )
  );

create policy estimates_staff on public.estimates
  for all to authenticated
  using (public.is_internal_staff())
  with check (public.is_internal_staff());

create policy wo_files_staff on public.work_order_files
  for all to authenticated
  using (public.is_internal_staff())
  with check (public.is_internal_staff());

create policy wo_files_client on public.work_order_files
  for select to authenticated
  using (
    visibility in ('client', 'shared')
    and exists (
      select 1 from public.work_orders w
      where w.id = work_order_id
        and public.is_org_member(w.client_organization_id)
    )
  );

create policy wo_files_vendor_select on public.work_order_files
  for select to authenticated
  using (
    visibility in ('vendor', 'shared')
    and exists (
      select 1 from public.work_order_assignments a
      where a.work_order_id = work_order_files.work_order_id
        and public.is_org_member(a.vendor_organization_id)
    )
  );

create policy wo_files_vendor_insert on public.work_order_files
  for insert to authenticated
  with check (
    exists (
      select 1 from public.work_order_assignments a
      where a.work_order_id = work_order_files.work_order_id
        and public.is_org_member(a.vendor_organization_id)
        and a.status in ('accepted', 'completed')
    )
  );

create policy vendor_docs_staff on public.vendor_documents
  for all to authenticated
  using (public.is_internal_staff())
  with check (public.is_internal_staff());

create policy vendor_docs_self on public.vendor_documents
  for select to authenticated
  using (public.is_org_member(vendor_organization_id));

create policy vendor_docs_upload on public.vendor_documents
  for insert to authenticated
  with check (
    public.has_org_role(vendor_organization_id, array['vendor_admin', 'crew']::public.membership_role[])
  );

create policy notifications_staff on public.notification_deliveries
  for all to authenticated
  using (public.is_internal_staff())
  with check (public.is_internal_staff());

create policy audit_staff on public.audit_logs
  for select to authenticated
  using (public.is_internal_staff());

-- Grants: authenticated may use views; base estimate/work-order financial columns
-- remain queryable by staff via table policies. Application serializers still omit
-- confidential columns. Views provide an additional isolation surface.

grant select on public.client_facing_estimates to authenticated;
grant select on public.vendor_facing_estimates to authenticated;
grant select on public.client_facing_work_orders to authenticated;
grant select on public.vendor_facing_work_orders to authenticated;
grant select on public.vendor_facing_properties to authenticated;

revoke all on public.form_idempotency from anon, authenticated;
revoke all on public.form_rate_limits from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'quote-attachments',
    'quote-attachments',
    false,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  ),
  (
    'vendor-documents',
    'vendor-documents',
    false,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  ),
  (
    'work-order-files',
    'work-order-files',
    false,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  )
on conflict (id) do nothing;

create policy storage_quote_staff on storage.objects
  for select to authenticated
  using (
    bucket_id = 'quote-attachments'
    and public.is_internal_staff()
  );

create policy storage_vendor_docs_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'vendor-documents'
    and (
      public.is_internal_staff()
      or public.is_org_member((storage.foldername(name))[1]::uuid)
    )
  );

create policy storage_vendor_docs_write on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'vendor-documents'
    and public.is_org_member((storage.foldername(name))[1]::uuid)
  );

create policy storage_wo_files_staff on storage.objects
  for select to authenticated
  using (
    bucket_id = 'work-order-files'
    and public.is_internal_staff()
  );

create policy storage_wo_files_write_auth on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'work-order-files'
    and auth.uid() is not null
  );
