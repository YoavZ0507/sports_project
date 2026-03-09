-- Managed Postgres schema (Supabase-compatible)
create type membership_role as enum ('coach', 'athlete', 'pending');
create type assignment_status as enum ('not_started', 'in_progress', 'completed', 'blocked');
create type schedule_type as enum ('one_time', 'recurring');

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
