-- Coverage intelligence. Does not modify 20260817120000_init_platform.sql.

create type public.market_state_status as enum ('active', 'growing', 'inactive');
create type public.coverage_source as enum ('manual', 'vendor', 'combined');
create type public.coverage_capability as enum ('active', 'limited', 'unavailable', 'suspended');
create type public.vendor_coverage_status as enum ('proposed', 'active', 'suspended', 'inactive');
create type public.coverage_verification_status as enum ('unverified', 'reviewing', 'verified', 'rejected');
create type public.coverage_request_status as enum (
  'new', 'reviewing', 'sourcing', 'coverage_found', 'unable_to_cover', 'converted', 'closed'
);
create type public.coverage_gap_status as enum ('open', 'sourcing', 'resolved', 'closed');
create type public.coverage_gap_source as enum (
  'coverage_request', 'service_request', 'quote_request', 'work_order', 'manual'
);
create type public.coverage_request_urgency as enum ('routine', 'priority', 'emergency');

create or replace function public.normalize_county_name(p_value text)
returns text
language sql
immutable
as $$
  select nullif(
    trim(both ' ' from regexp_replace(
      regexp_replace(
        regexp_replace(lower(coalesce(p_value, '')), '[^a-z0-9 ]', ' ', 'g'),
        '\s+', ' ',
        'g'
      ),
      '\s+(county|parish|borough)$',
      '',
      'g'
    )),
    ''
  );
$$;

create or replace function public.display_county_name(p_value text)
returns text
language plpgsql
immutable
as $$
declare
  n text := public.normalize_county_name(p_value);
begin
  if n is null then
    return null;
  end if;
  if n in ('district of columbia', 'washington dc', 'washington d c', 'dc') then
    return 'District of Columbia';
  end if;
  return initcap(n) || ' County';
end;
$$;

create table public.market_states (
  id uuid primary key default gen_random_uuid(),
  state_code char(2) not null unique,
  state_name text not null,
  status public.market_state_status not null default 'growing',
  display_order integer not null default 100,
  public_visible boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.market_states (state_code, state_name, status, display_order, public_visible)
values
  ('NC', 'North Carolina', 'growing', 1, true),
  ('TX', 'Texas', 'growing', 2, true),
  ('GA', 'Georgia', 'growing', 3, true),
  ('OH', 'Ohio', 'growing', 4, true),
  ('WA', 'Washington', 'growing', 5, true);

create table public.coverage_areas (
  id uuid primary key default gen_random_uuid(),
  state_code char(2) not null,
  county_name text not null,
  normalized_county_name text not null,
  status text not null default 'tracked',
  source public.coverage_source not null default 'combined',
  public_visible boolean not null default true,
  notes_internal text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (state_code, normalized_county_name)
);

create table public.manual_coverage (
  id uuid primary key default gen_random_uuid(),
  state_code char(2) not null,
  county_name text not null,
  normalized_county_name text not null,
  service_category text not null,
  status public.coverage_capability not null default 'active',
  public_visible boolean not null default true,
  verified_by uuid references public.profiles (id) on delete set null,
  verified_at timestamptz,
  notes_internal text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (state_code, normalized_county_name, service_category)
);

create table public.vendor_coverage (
  id uuid primary key default gen_random_uuid(),
  vendor_organization_id uuid not null references public.organizations (id) on delete cascade,
  vendor_profile_id uuid references public.vendor_profiles (id) on delete set null,
  vendor_application_id uuid references public.vendor_applications (id) on delete set null,
  state_code char(2) not null,
  county_name text not null,
  normalized_county_name text not null,
  service_category text not null,
  status public.vendor_coverage_status not null default 'proposed',
  verification_status public.coverage_verification_status not null default 'unverified',
  verified_by uuid references public.profiles (id) on delete set null,
  verified_at timestamptz,
  effective_from timestamptz,
  effective_until timestamptz,
  travel_radius_miles integer,
  emergency_available boolean,
  notes_internal text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (vendor_organization_id, state_code, normalized_county_name, service_category)
);

create table public.coverage_services (
  id uuid primary key default gen_random_uuid(),
  coverage_area_id uuid not null references public.coverage_areas (id) on delete cascade,
  service_category text not null,
  status public.coverage_capability not null default 'unavailable',
  source public.coverage_source not null default 'combined',
  verified_at timestamptz,
  verified_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (coverage_area_id, service_category)
);

create table public.coverage_requests (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique,
  first_name text not null,
  last_name text not null,
  company text,
  email text not null,
  phone text not null,
  property_address text,
  city text not null,
  state_code char(2) not null,
  county_name text not null,
  normalized_county_name text not null,
  zip text,
  service_category text not null,
  number_of_properties text,
  urgency public.coverage_request_urgency not null default 'routine',
  description text not null,
  coverage_result_at_submission text not null,
  status public.coverage_request_status not null default 'new',
  source text not null default 'website',
  converted_quote_request_id uuid references public.quote_requests (id) on delete set null,
  converted_service_request_id uuid references public.service_requests (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.coverage_gaps (
  id uuid primary key default gen_random_uuid(),
  state_code char(2) not null,
  county_name text not null,
  normalized_county_name text not null,
  service_category text not null,
  source_type public.coverage_gap_source not null default 'coverage_request',
  source_entity_id uuid,
  active_request_count integer not null default 1,
  priority public.coverage_request_urgency not null default 'routine',
  status public.coverage_gap_status not null default 'open',
  created_at timestamptz not null default timezone('utc', now()),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles (id) on delete set null,
  notes_internal text,
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index coverage_gaps_open_unique
  on public.coverage_gaps (state_code, normalized_county_name, service_category)
  where status in ('open', 'sourcing');

create index idx_manual_coverage_lookup
  on public.manual_coverage (state_code, normalized_county_name, service_category);
create index idx_vendor_coverage_lookup
  on public.vendor_coverage (state_code, normalized_county_name, service_category, verification_status, status);
create index idx_vendor_coverage_org
  on public.vendor_coverage (vendor_organization_id, verification_status);
create index idx_coverage_requests_status
  on public.coverage_requests (status, created_at desc);
create index idx_coverage_requests_reference
  on public.coverage_requests (reference_number);
create index idx_coverage_gaps_status
  on public.coverage_gaps (status, priority, created_at);

create or replace view public.v_effective_coverage as
with vendor_active as (
  select
    vc.state_code,
    vc.county_name,
    vc.normalized_county_name,
    vc.service_category,
    vc.vendor_organization_id
  from public.vendor_coverage vc
  join public.organizations o on o.id = vc.vendor_organization_id
  join public.vendor_profiles vp on vp.organization_id = vc.vendor_organization_id
  where vc.status = 'active'
    and vc.verification_status = 'verified'
    and (vc.effective_until is null or vc.effective_until > timezone('utc', now()))
    and (vc.effective_from is null or vc.effective_from <= timezone('utc', now()))
    and o.type = 'vendor'
    and o.status = 'active'
    and coalesce(vp.onboarding_status, 'pending') in ('approved', 'active', 'onboarded', 'complete', 'completed')
),
manual_active as (
  select
    mc.state_code,
    mc.county_name,
    mc.normalized_county_name,
    mc.service_category,
    mc.status as capability
  from public.manual_coverage mc
  where mc.public_visible
    and mc.status in ('active', 'limited')
)
select
  coalesce(m.state_code, v.state_code) as state_code,
  coalesce(m.county_name, v.county_name) as county_name,
  coalesce(m.normalized_county_name, v.normalized_county_name) as normalized_county_name,
  coalesce(m.service_category, v.service_category) as service_category,
  case
    when bool_or(coalesce(m.capability, 'unavailable') = 'active')
      or count(distinct v.vendor_organization_id) filter (where v.vendor_organization_id is not null) > 0
      then 'active'::text
    when bool_or(coalesce(m.capability, 'unavailable') = 'limited')
      then 'limited'::text
    else 'unavailable'::text
  end as coverage_status,
  count(distinct v.vendor_organization_id) filter (where v.vendor_organization_id is not null)::integer as vendor_count,
  bool_or(m.capability is not null) as manual_support
from manual_active m
full outer join vendor_active v
  on v.state_code = m.state_code
 and v.normalized_county_name = m.normalized_county_name
 and v.service_category = m.service_category
group by 1, 2, 3, 4;

create or replace view public.v_public_coverage as
select
  state_code,
  county_name,
  service_category,
  case coverage_status
    when 'active' then 'covered'
    when 'limited' then 'limited'
    else 'not_established'
  end as public_status
from public.v_effective_coverage
where coverage_status in ('active', 'limited');

create or replace function public.coverage_public_status(
  p_state text,
  p_county text,
  p_service text
)
returns table (
  status text,
  market_state boolean,
  county_name text,
  state_code text,
  service_category text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce((
      select case e.coverage_status
        when 'active' then 'covered'
        when 'limited' then 'limited'
        else 'not_established'
      end
      from public.v_effective_coverage e
      where e.state_code = upper(trim(p_state))
        and e.normalized_county_name = public.normalize_county_name(p_county)
        and e.service_category = trim(p_service)
      limit 1
    ), 'not_established') as status,
    exists (
      select 1
      from public.market_states ms
      where ms.state_code = upper(trim(p_state))
        and ms.public_visible
        and ms.status in ('active', 'growing')
    ) as market_state,
    coalesce(
      (
        select e.county_name
        from public.v_effective_coverage e
        where e.state_code = upper(trim(p_state))
          and e.normalized_county_name = public.normalize_county_name(p_county)
          and e.service_category = trim(p_service)
        limit 1
      ),
      public.display_county_name(p_county)
    ) as county_name,
    upper(trim(p_state)) as state_code,
    trim(p_service) as service_category;
$$;

create or replace function public.record_coverage_gap(
  p_state text,
  p_county text,
  p_service text,
  p_source public.coverage_gap_source,
  p_source_id uuid,
  p_priority public.coverage_request_urgency default 'routine'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_state char(2) := upper(trim(p_state));
  v_norm text := public.normalize_county_name(p_county);
  v_county text := public.display_county_name(p_county);
  v_id uuid;
  v_covered boolean;
begin
  if v_norm is null then
    return null;
  end if;

  select exists (
    select 1
    from public.v_effective_coverage e
    where e.state_code = v_state
      and e.normalized_county_name = v_norm
      and e.service_category = trim(p_service)
      and e.coverage_status in ('active', 'limited')
  ) into v_covered;

  if v_covered then
    return null;
  end if;

  update public.coverage_gaps
    set active_request_count = coverage_gaps.active_request_count + 1,
        priority = case
          when p_priority = 'emergency' or coverage_gaps.priority = 'emergency' then 'emergency'::public.coverage_request_urgency
          when p_priority = 'priority' or coverage_gaps.priority = 'priority' then 'priority'::public.coverage_request_urgency
          else coverage_gaps.priority
        end,
        updated_at = timezone('utc', now())
    where state_code = v_state
      and normalized_county_name = v_norm
      and service_category = trim(p_service)
      and status in ('open', 'sourcing')
    returning id into v_id;

  if v_id is not null then
    return v_id;
  end if;

  insert into public.coverage_gaps (
    state_code, county_name, normalized_county_name, service_category,
    source_type, source_entity_id, active_request_count, priority, status
  ) values (
    v_state, coalesce(v_county, initcap(v_norm)), v_norm, trim(p_service),
    p_source, p_source_id, 1, p_priority, 'open'
  )
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.resolve_coverage_gaps(
  p_state text,
  p_county text,
  p_service text,
  p_actor uuid default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  update public.coverage_gaps
    set status = 'resolved',
        resolved_at = timezone('utc', now()),
        resolved_by = p_actor,
        updated_at = timezone('utc', now())
    where state_code = upper(trim(p_state))
      and normalized_county_name = public.normalize_county_name(p_county)
      and service_category = trim(p_service)
      and status in ('open', 'sourcing');
  get diagnostics n = row_count;
  return n;
end;
$$;

create or replace function public.sync_coverage_gap_resolution()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_table_name = 'manual_coverage' then
    if new.status in ('active', 'limited') and new.public_visible then
      perform public.resolve_coverage_gaps(new.state_code, new.county_name, new.service_category, new.verified_by);
    end if;
  elsif tg_table_name = 'vendor_coverage' then
    if new.status = 'active' and new.verification_status = 'verified' then
      perform public.resolve_coverage_gaps(new.state_code, new.county_name, new.service_category, new.verified_by);
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_manual_coverage_resolve
  after insert or update on public.manual_coverage
  for each row execute function public.sync_coverage_gap_resolution();

create trigger trg_vendor_coverage_resolve
  after insert or update on public.vendor_coverage
  for each row execute function public.sync_coverage_gap_resolution();

create or replace function public.prevent_vendor_self_verify()
returns trigger
language plpgsql
as $$
begin
  if new.verification_status = 'verified'
     and (tg_op = 'INSERT' or old.verification_status is distinct from 'verified')
     and not public.is_internal_staff() then
    raise exception 'Only TrueFix360 staff can verify vendor coverage.';
  end if;
  if new.verification_status = 'verified' and new.status = 'proposed' then
    new.status := 'active';
  end if;
  return new;
end;
$$;

create trigger trg_vendor_coverage_no_self_verify
  before insert or update on public.vendor_coverage
  for each row execute function public.prevent_vendor_self_verify();

create trigger trg_market_states_updated before update on public.market_states
  for each row execute function public.set_updated_at();
create trigger trg_coverage_areas_updated before update on public.coverage_areas
  for each row execute function public.set_updated_at();
create trigger trg_manual_coverage_updated before update on public.manual_coverage
  for each row execute function public.set_updated_at();
create trigger trg_vendor_coverage_updated before update on public.vendor_coverage
  for each row execute function public.set_updated_at();
create trigger trg_coverage_services_updated before update on public.coverage_services
  for each row execute function public.set_updated_at();
create trigger trg_coverage_requests_updated before update on public.coverage_requests
  for each row execute function public.set_updated_at();
create trigger trg_coverage_gaps_updated before update on public.coverage_gaps
  for each row execute function public.set_updated_at();

alter table public.market_states enable row level security;
alter table public.coverage_areas enable row level security;
alter table public.manual_coverage enable row level security;
alter table public.vendor_coverage enable row level security;
alter table public.coverage_services enable row level security;
alter table public.coverage_requests enable row level security;
alter table public.coverage_gaps enable row level security;

create policy market_states_public_read on public.market_states
  for select to anon, authenticated
  using (public_visible = true);

create policy market_states_staff on public.market_states
  for all to authenticated
  using (public.is_internal_staff())
  with check (public.is_internal_staff());

create policy coverage_areas_staff on public.coverage_areas
  for all to authenticated
  using (public.is_internal_staff())
  with check (public.is_internal_staff());

create policy manual_coverage_staff on public.manual_coverage
  for all to authenticated
  using (public.is_internal_staff())
  with check (public.is_internal_staff());

create policy vendor_coverage_staff on public.vendor_coverage
  for all to authenticated
  using (public.is_internal_staff())
  with check (public.is_internal_staff());

create policy vendor_coverage_self_select on public.vendor_coverage
  for select to authenticated
  using (public.is_org_member(vendor_organization_id));

create policy vendor_coverage_self_update on public.vendor_coverage
  for update to authenticated
  using (
    public.is_org_member(vendor_organization_id)
    and verification_status in ('unverified', 'reviewing', 'rejected')
  )
  with check (
    public.is_org_member(vendor_organization_id)
    and verification_status in ('unverified', 'reviewing', 'rejected')
  );

create policy coverage_services_staff on public.coverage_services
  for all to authenticated
  using (public.is_internal_staff())
  with check (public.is_internal_staff());

create policy coverage_requests_staff on public.coverage_requests
  for all to authenticated
  using (public.is_internal_staff())
  with check (public.is_internal_staff());

create policy coverage_gaps_staff on public.coverage_gaps
  for all to authenticated
  using (public.is_internal_staff())
  with check (public.is_internal_staff());

grant select on public.market_states to anon, authenticated;
grant select on public.v_public_coverage to authenticated;
grant select on public.v_effective_coverage to authenticated;
grant select, insert, update, delete on public.manual_coverage to authenticated;
grant select, insert, update, delete on public.vendor_coverage to authenticated;
grant select, insert, update, delete on public.coverage_areas to authenticated;
grant select, insert, update, delete on public.coverage_services to authenticated;
grant select, insert, update, delete on public.coverage_requests to authenticated;
grant select, insert, update, delete on public.coverage_gaps to authenticated;

revoke all on public.v_effective_coverage from anon;
revoke all on public.v_public_coverage from anon;
revoke all on public.manual_coverage from anon;
revoke all on public.vendor_coverage from anon;
revoke all on public.coverage_requests from anon;
revoke all on public.coverage_gaps from anon;

grant execute on function public.coverage_public_status(text, text, text) to anon, authenticated, service_role;
grant execute on function public.record_coverage_gap(text, text, text, public.coverage_gap_source, uuid, public.coverage_request_urgency) to authenticated, service_role;
grant execute on function public.resolve_coverage_gaps(text, text, text, uuid) to authenticated, service_role;
grant execute on function public.normalize_county_name(text) to anon, authenticated, service_role;
grant execute on function public.display_county_name(text) to anon, authenticated, service_role;
