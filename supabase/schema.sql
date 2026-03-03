-- Enable required extensions
create extension if not exists "pgcrypto";

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Users can view any profile" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- WORKSPACES
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.workspaces enable row level security;

create policy "Members can view workspace" on public.workspaces for select using (
  exists (select 1 from public.memberships where workspace_id = id and user_id = auth.uid())
);
create policy "Authenticated users can create workspaces" on public.workspaces for insert with check (auth.uid() = created_by);

-- MEMBERSHIPS
create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  unique(workspace_id, user_id)
);
alter table public.memberships enable row level security;

create policy "Members can view memberships in their workspace" on public.memberships for select using (
  exists (select 1 from public.memberships m where m.workspace_id = memberships.workspace_id and m.user_id = auth.uid())
);
create policy "Users can insert own membership" on public.memberships for insert with check (auth.uid() = user_id);

-- EVENTS
-- status: 'pending' | 'happening' | 'at_risk' | 'expired'
create table public.events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  title text not null,
  description text,
  location text,
  event_date date not null,
  event_time time not null,
  min_attendees int not null default 2 check (min_attendees >= 2),
  max_attendees int check (max_attendees is null or max_attendees >= min_attendees),
  status text not null default 'pending' check (status in ('pending', 'happening', 'at_risk', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.events enable row level security;

create policy "Members can view events in their workspace" on public.events for select using (
  exists (select 1 from public.memberships where workspace_id = events.workspace_id and user_id = auth.uid())
);
create policy "Members can create events in their workspace" on public.events for insert with check (
  auth.uid() = created_by and
  exists (select 1 from public.memberships where workspace_id = events.workspace_id and user_id = auth.uid())
);
create policy "Event creator can update" on public.events for update using (auth.uid() = created_by);

-- RSVPS
-- status: 'in' | 'maybe'
create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('in', 'maybe')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id, user_id)
);
alter table public.rsvps enable row level security;

create policy "Members can view RSVPs for events in their workspace" on public.rsvps for select using (
  exists (
    select 1 from public.events e
    join public.memberships m on m.workspace_id = e.workspace_id
    where e.id = rsvps.event_id and m.user_id = auth.uid()
  )
);
create policy "Authenticated users can manage own RSVPs" on public.rsvps for insert with check (auth.uid() = user_id);
create policy "Users can update own RSVPs" on public.rsvps for update using (auth.uid() = user_id);
create policy "Users can delete own RSVPs" on public.rsvps for delete using (auth.uid() = user_id);

-- TRIGGERS

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Recompute event status after RSVP changes
create or replace function public.recompute_event_status()
returns trigger as $$
declare
  v_event_id uuid;
  v_in_count int;
  v_min int;
  v_event_date date;
  v_new_status text;
begin
  v_event_id := coalesce(new.event_id, old.event_id);

  select min_attendees, event_date into v_min, v_event_date
  from public.events where id = v_event_id;

  -- Don't update expired events
  if v_event_date < current_date then
    return coalesce(new, old);
  end if;

  select count(*) into v_in_count
  from public.rsvps where event_id = v_event_id and status = 'in';

  if v_in_count >= v_min then
    v_new_status := 'happening';
  else
    -- Check if it was previously happening (at_risk) or still pending
    select case when status = 'happening' or status = 'at_risk' then 'at_risk' else 'pending' end
    into v_new_status
    from public.events where id = v_event_id;

    -- If nobody has confirmed yet, keep it pending
    if v_in_count = 0 then
      v_new_status := 'pending';
    end if;
  end if;

  update public.events set status = v_new_status, updated_at = now() where id = v_event_id;

  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger on_rsvp_change
  after insert or update or delete on public.rsvps
  for each row execute function public.recompute_event_status();

-- RPCs

-- Get events with RSVP counts for a workspace
create or replace function public.get_events_with_counts(p_workspace_id uuid)
returns table (
  id uuid,
  workspace_id uuid,
  created_by uuid,
  title text,
  description text,
  location text,
  event_date date,
  event_time time,
  min_attendees int,
  max_attendees int,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  in_count bigint,
  maybe_count bigint,
  current_user_rsvp text,
  creator_name text,
  creator_avatar text
) as $$
begin
  return query
  select
    e.id, e.workspace_id, e.created_by, e.title, e.description, e.location,
    e.event_date, e.event_time, e.min_attendees, e.max_attendees, e.status,
    e.created_at, e.updated_at,
    coalesce(sum(case when r.status = 'in' then 1 else 0 end), 0)::bigint as in_count,
    coalesce(sum(case when r.status = 'maybe' then 1 else 0 end), 0)::bigint as maybe_count,
    (select r2.status from public.rsvps r2 where r2.event_id = e.id and r2.user_id = auth.uid()) as current_user_rsvp,
    p.full_name as creator_name,
    p.avatar_url as creator_avatar
  from public.events e
  left join public.rsvps r on r.event_id = e.id
  left join public.profiles p on p.id = e.created_by
  where e.workspace_id = p_workspace_id
    and exists (select 1 from public.memberships m where m.workspace_id = p_workspace_id and m.user_id = auth.uid())
  group by e.id, p.full_name, p.avatar_url
  order by e.event_date asc, e.event_time asc;
end;
$$ language plpgsql security definer;

-- Join workspace by invite code
create or replace function public.join_workspace_by_code(p_invite_code text)
returns uuid as $$
declare
  v_workspace_id uuid;
begin
  select id into v_workspace_id from public.workspaces where invite_code = p_invite_code;

  if v_workspace_id is null then
    raise exception 'Invalid invite code';
  end if;

  insert into public.memberships (workspace_id, user_id, role)
  values (v_workspace_id, auth.uid(), 'member')
  on conflict (workspace_id, user_id) do nothing;

  return v_workspace_id;
end;
$$ language plpgsql security definer;

-- Expire past events
create or replace function public.expire_past_events()
returns void as $$
begin
  update public.events
  set status = 'expired', updated_at = now()
  where event_date < current_date and status != 'expired';
end;
$$ language plpgsql security definer;

-- Enable Realtime
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.rsvps;

-- Indexes for performance
create index idx_memberships_user on public.memberships(user_id);
create index idx_memberships_workspace on public.memberships(workspace_id);
create index idx_events_workspace on public.events(workspace_id);
create index idx_events_date on public.events(event_date);
create index idx_rsvps_event on public.rsvps(event_id);
create index idx_rsvps_user on public.rsvps(user_id);
