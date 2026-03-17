-- Managed Postgres schema (Supabase-compatible)
create type membership_role as enum ('coach', 'athlete', 'pending');
create type assignment_status as enum ('not_started', 'in_progress', 'completed', 'blocked');
create type schedule_type as enum ('one_time', 'recurring');
create type calendar_event_type as enum ('training', 'game', 'special');
create type generic_event_status as enum ('planned', 'completed', 'cancelled');
create type team_membership_role as enum ('coach', 'athlete');
create type event_participant_role as enum ('player', 'coach', 'staff');
create type attendance_status as enum ('planned', 'present', 'absent', 'late', 'excused');

create table if not exists users (
  id uuid primary key,
  email text unique not null,
  full_name text not null,
  locale text not null default 'en',
  created_at timestamptz not null default now()
);

create table if not exists workspaces (
  id uuid primary key,
  name text not null,
  coach_id uuid not null references users(id),
  created_at timestamptz not null default now()
);

create table if not exists workspace_members (
  id uuid primary key,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role membership_role not null,
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table if not exists sports (
  id text primary key,
  key text unique not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists clubs (
  id text primary key,
  sport_id text not null references sports(id),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists leagues (
  id text primary key,
  sport_id text not null references sports(id),
  name text not null,
  level text not null,
  created_at timestamptz not null default now()
);

create table if not exists seasons (
  id text primary key,
  label text not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists teams (
  id text primary key,
  sport_id text not null references sports(id),
  club_id text not null references clubs(id),
  league_id text not null references leagues(id),
  season_id text not null references seasons(id),
  workspace_id uuid unique not null references workspaces(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists team_memberships (
  id text primary key,
  team_id text not null references teams(id) on delete cascade,
  club_id text not null references clubs(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role team_membership_role not null,
  source_workspace_member_id uuid unique not null references workspace_members(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (team_id, user_id)
);

create table if not exists tasks (
  id uuid primary key,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null,
  description text,
  detailed_instructions text,
  resources jsonb not null default '[]'::jsonb,
  schedule_type schedule_type not null,
  due_date date,
  recurrence_rule text,
  archived boolean not null default false,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now()
);

create table if not exists task_assignments (
  id uuid primary key,
  task_id uuid not null references tasks(id) on delete cascade,
  athlete_id uuid not null references users(id),
  status assignment_status not null default 'not_started',
  assigned_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (task_id, athlete_id)
);

create table if not exists progress_updates (
  id uuid primary key,
  assignment_id uuid not null references task_assignments(id) on delete cascade,
  status assignment_status not null,
  note text,
  submitted_at timestamptz not null default now(),
  created_by uuid not null references users(id)
);

create table if not exists progress_metrics (
  id uuid primary key,
  update_id uuid not null references progress_updates(id) on delete cascade,
  metric_key text not null,
  metric_value numeric not null,
  unit text,
  unique (update_id, metric_key)
);

create table if not exists coach_feedback (
  id uuid primary key,
  update_id uuid not null references progress_updates(id) on delete cascade,
  coach_id uuid not null references users(id),
  comment text not null,
  visibility text not null default 'athlete',
  created_at timestamptz not null default now()
);

create table if not exists calendar_events (
  id uuid primary key,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null,
  description text,
  event_type calendar_event_type not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  location text,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists generic_event_types (
  id text primary key,
  key text unique not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists generic_events (
  id text primary key,
  source_calendar_event_id uuid unique not null references calendar_events(id) on delete cascade,
  event_type_id text not null references generic_event_types(id),
  sport_id text not null references sports(id),
  club_id text not null references clubs(id),
  team_id text not null references teams(id) on delete cascade,
  season_id text not null references seasons(id),
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  location text,
  status generic_event_status not null default 'planned',
  created_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists event_participants (
  id text primary key,
  event_id text not null references generic_events(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  participant_role event_participant_role not null,
  attendance_status attendance_status not null default 'planned',
  source_workspace_member_id uuid references workspace_members(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);
