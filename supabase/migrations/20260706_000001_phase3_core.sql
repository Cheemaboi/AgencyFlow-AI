create extension if not exists "pgcrypto";

create type public.app_role as enum ('admin', 'team_member', 'client');
create type public.project_stage as enum ('backlog', 'in_progress', 'review', 'approved', 'delivered');
create type public.task_state as enum ('todo', 'in_progress', 'ready', 'blocked', 'done');
create type public.approval_state as enum ('pending_review', 'needs_changes', 'approved', 'archived');
create type public.invoice_status as enum ('draft', 'due', 'paid', 'overdue');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null default 'team_member',
  invited_email text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, profile_id)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  contact_email text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  name text not null,
  summary text,
  stage public.project_stage not null default 'backlog',
  budget_cents integer,
  due_date date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null default 'team_member',
  created_at timestamptz not null default timezone('utc', now()),
  unique (project_id, profile_id)
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  stage public.project_stage not null default 'backlog',
  summary text,
  client_visible boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  status text,
  due_date date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  description text,
  state public.task_state not null default 'todo',
  assignee_profile_id uuid references public.profiles(id) on delete set null,
  due_date date,
  client_visible boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.conversation_participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (conversation_id, profile_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  author_profile_id uuid references public.profiles(id) on delete set null,
  body text not null,
  internal_only boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.meeting_notes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  summary text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.files (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null,
  name text not null,
  storage_path text not null,
  file_type text,
  status public.approval_state not null default 'pending_review',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.file_versions (
  id uuid primary key default gen_random_uuid(),
  file_id uuid not null references public.files(id) on delete cascade,
  version_label text not null,
  storage_path text not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  file_version_id uuid references public.file_versions(id) on delete set null,
  requested_by uuid references public.profiles(id) on delete set null,
  title text not null,
  state public.approval_state not null default 'pending_review',
  due_date date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.approval_reviewers (
  id uuid primary key default gen_random_uuid(),
  approval_request_id uuid not null references public.approval_requests(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (approval_request_id, profile_id)
);

create table public.approval_comments (
  id uuid primary key default gen_random_uuid(),
  approval_request_id uuid not null references public.approval_requests(id) on delete cascade,
  author_profile_id uuid references public.profiles(id) on delete set null,
  body text not null,
  internal_only boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  invoice_number text,
  status public.invoice_status not null default 'draft',
  amount_cents integer not null default 0,
  due_date date,
  issued_at date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount_cents integer not null default 0,
  paid_at timestamptz,
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  prompt_type text not null,
  input_summary text,
  output_text text,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index idx_organization_members_organization_id on public.organization_members (organization_id);
create index idx_clients_organization_id on public.clients (organization_id);
create index idx_projects_organization_id on public.projects (organization_id);
create index idx_workspaces_project_id on public.workspaces (project_id);
create index idx_tasks_workspace_id on public.tasks (workspace_id);
create index idx_conversations_organization_id on public.conversations (organization_id);
create index idx_messages_conversation_id on public.messages (conversation_id);
create index idx_files_workspace_id on public.files (workspace_id);
create index idx_file_versions_file_id on public.file_versions (file_id);
create index idx_approval_requests_workspace_id on public.approval_requests (workspace_id);
create index idx_invoices_organization_id on public.invoices (organization_id);
create index idx_notifications_profile_id on public.notifications (profile_id);
create index idx_ai_generations_organization_id on public.ai_generations (organization_id);
create index idx_activity_logs_organization_id on public.activity_logs (organization_id);

create or replace function public.current_profile_id()
returns uuid
language sql
stable
as $$
  select id from public.profiles where auth_user_id = auth.uid() limit 1
$$;

create or replace function public.is_org_member(target_organization uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.organization_members om
    join public.profiles p on p.id = om.profile_id
    where om.organization_id = target_organization
      and p.auth_user_id = auth.uid()
  )
$$;

create or replace function public.has_org_role(target_organization uuid, allowed_roles public.app_role[])
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.organization_members om
    join public.profiles p on p.id = om.profile_id
    where om.organization_id = target_organization
      and om.role = any(allowed_roles)
      and p.auth_user_id = auth.uid()
  )
$$;

create trigger organizations_set_updated_at before update on public.organizations
for each row execute function public.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger organization_members_set_updated_at before update on public.organization_members
for each row execute function public.set_updated_at();
create trigger clients_set_updated_at before update on public.clients
for each row execute function public.set_updated_at();
create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_updated_at();
create trigger workspaces_set_updated_at before update on public.workspaces
for each row execute function public.set_updated_at();
create trigger milestones_set_updated_at before update on public.milestones
for each row execute function public.set_updated_at();
create trigger tasks_set_updated_at before update on public.tasks
for each row execute function public.set_updated_at();
create trigger conversations_set_updated_at before update on public.conversations
for each row execute function public.set_updated_at();
create trigger messages_set_updated_at before update on public.messages
for each row execute function public.set_updated_at();
create trigger meeting_notes_set_updated_at before update on public.meeting_notes
for each row execute function public.set_updated_at();
create trigger files_set_updated_at before update on public.files
for each row execute function public.set_updated_at();
create trigger approval_requests_set_updated_at before update on public.approval_requests
for each row execute function public.set_updated_at();
create trigger approval_comments_set_updated_at before update on public.approval_comments
for each row execute function public.set_updated_at();
create trigger invoices_set_updated_at before update on public.invoices
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_profile_id uuid;
  new_organization_id uuid;
  organization_label text;
begin
  insert into public.profiles (auth_user_id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  returning id into new_profile_id;

  organization_label := coalesce(
    nullif(new.raw_user_meta_data->>'organization_name', ''),
    concat(coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), ' Workspace')
  );

  insert into public.organizations (name, slug, created_by)
  values (
    organization_label,
    lower(regexp_replace(organization_label, '[^a-zA-Z0-9]+', '-', 'g')),
    new.id
  )
  returning id into new_organization_id;

  insert into public.organization_members (organization_id, profile_id, role, invited_email)
  values (new_organization_id, new_profile_id, 'admin', new.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.workspaces enable row level security;
alter table public.milestones enable row level security;
alter table public.tasks enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.meeting_notes enable row level security;
alter table public.files enable row level security;
alter table public.file_versions enable row level security;
alter table public.approval_requests enable row level security;
alter table public.approval_reviewers enable row level security;
alter table public.approval_comments enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;
alter table public.ai_generations enable row level security;
alter table public.activity_logs enable row level security;

create policy "profiles select self or org peers" on public.profiles
for select using (
  auth.uid() is not null and (
    auth_user_id = auth.uid()
    or exists (
      select 1
      from public.organization_members self_member
      join public.profiles self_profile on self_profile.id = self_member.profile_id
      join public.organization_members target_member on target_member.organization_id = self_member.organization_id
      where self_profile.auth_user_id = auth.uid()
        and target_member.profile_id = public.profiles.id
    )
  )
);

create policy "profiles update self" on public.profiles
for update using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

create policy "organization members can read organizations" on public.organizations
for select using (public.is_org_member(id));

create policy "admins manage organizations" on public.organizations
for update using (public.has_org_role(id, array['admin']::public.app_role[]))
with check (public.has_org_role(id, array['admin']::public.app_role[]));

create policy "members read membership" on public.organization_members
for select using (public.is_org_member(organization_id));

create policy "admins manage membership" on public.organization_members
for all using (public.has_org_role(organization_id, array['admin']::public.app_role[]))
with check (public.has_org_role(organization_id, array['admin']::public.app_role[]));

create policy "members read clients" on public.clients
for select using (public.is_org_member(organization_id));

create policy "team manages clients" on public.clients
for all using (public.has_org_role(organization_id, array['admin', 'team_member']::public.app_role[]))
with check (public.has_org_role(organization_id, array['admin', 'team_member']::public.app_role[]));

create policy "members read projects" on public.projects
for select using (public.is_org_member(organization_id));

create policy "team manages projects" on public.projects
for all using (public.has_org_role(organization_id, array['admin', 'team_member']::public.app_role[]))
with check (public.has_org_role(organization_id, array['admin', 'team_member']::public.app_role[]));

create policy "project members readable by org members" on public.project_members
for select using (
  exists (
    select 1
    from public.projects p
    where p.id = project_id
      and public.is_org_member(p.organization_id)
  )
);

create policy "team manages project members" on public.project_members
for all using (
  exists (
    select 1
    from public.projects p
    where p.id = project_id
      and public.has_org_role(p.organization_id, array['admin', 'team_member']::public.app_role[])
  )
)
with check (
  exists (
    select 1
    from public.projects p
    where p.id = project_id
      and public.has_org_role(p.organization_id, array['admin', 'team_member']::public.app_role[])
  )
);

create policy "members read workspaces" on public.workspaces
for select using (
  exists (
    select 1 from public.projects p
    where p.id = project_id and public.is_org_member(p.organization_id)
  )
);

create policy "team manages workspaces" on public.workspaces
for all using (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and public.has_org_role(p.organization_id, array['admin', 'team_member']::public.app_role[])
  )
)
with check (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and public.has_org_role(p.organization_id, array['admin', 'team_member']::public.app_role[])
  )
);

create policy "workspace-linked tables readable by members" on public.milestones
for select using (
  exists (
    select 1
    from public.workspaces w
    join public.projects p on p.id = w.project_id
    where w.id = workspace_id and public.is_org_member(p.organization_id)
  )
);

create policy "workspace-linked milestones managed by team" on public.milestones
for all using (
  exists (
    select 1
    from public.workspaces w
    join public.projects p on p.id = w.project_id
    where w.id = workspace_id
      and public.has_org_role(p.organization_id, array['admin', 'team_member']::public.app_role[])
  )
)
with check (
  exists (
    select 1
    from public.workspaces w
    join public.projects p on p.id = w.project_id
    where w.id = workspace_id
      and public.has_org_role(p.organization_id, array['admin', 'team_member']::public.app_role[])
  )
);

create policy "tasks readable by workspace members" on public.tasks
for select using (
  exists (
    select 1
    from public.workspaces w
    join public.projects p on p.id = w.project_id
    where w.id = workspace_id and public.is_org_member(p.organization_id)
  )
);

create policy "tasks managed by team" on public.tasks
for all using (
  exists (
    select 1
    from public.workspaces w
    join public.projects p on p.id = w.project_id
    where w.id = workspace_id
      and public.has_org_role(p.organization_id, array['admin', 'team_member']::public.app_role[])
  )
)
with check (
  exists (
    select 1
    from public.workspaces w
    join public.projects p on p.id = w.project_id
    where w.id = workspace_id
      and public.has_org_role(p.organization_id, array['admin', 'team_member']::public.app_role[])
  )
);

create policy "conversation tables readable by org members" on public.conversations
for select using (public.is_org_member(organization_id));

create policy "conversation tables managed by team" on public.conversations
for all using (public.has_org_role(organization_id, array['admin', 'team_member']::public.app_role[]))
with check (public.has_org_role(organization_id, array['admin', 'team_member']::public.app_role[]));

create policy "participants readable by conversation members" on public.conversation_participants
for select using (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id and public.is_org_member(c.organization_id)
  )
);

create policy "team manages participants" on public.conversation_participants
for all using (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and public.has_org_role(c.organization_id, array['admin', 'team_member']::public.app_role[])
  )
)
with check (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and public.has_org_role(c.organization_id, array['admin', 'team_member']::public.app_role[])
  )
);

create policy "messages readable by org conversation members" on public.messages
for select using (
  exists (
    select 1
    from public.conversations c
    where c.id = conversation_id
      and public.is_org_member(c.organization_id)
      and (
        not internal_only
        or public.has_org_role(c.organization_id, array['admin', 'team_member']::public.app_role[])
      )
  )
);

create policy "team manages messages" on public.messages
for all using (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and public.has_org_role(c.organization_id, array['admin', 'team_member']::public.app_role[])
  )
)
with check (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and public.has_org_role(c.organization_id, array['admin', 'team_member']::public.app_role[])
  )
);

create policy "meeting notes readable by workspace members" on public.meeting_notes
for select using (
  exists (
    select 1
    from public.workspaces w
    join public.projects p on p.id = w.project_id
    where w.id = workspace_id and public.is_org_member(p.organization_id)
  )
);

create policy "team manages meeting notes" on public.meeting_notes
for all using (
  exists (
    select 1
    from public.workspaces w
    join public.projects p on p.id = w.project_id
    where w.id = workspace_id
      and public.has_org_role(p.organization_id, array['admin', 'team_member']::public.app_role[])
  )
)
with check (
  exists (
    select 1
    from public.workspaces w
    join public.projects p on p.id = w.project_id
    where w.id = workspace_id
      and public.has_org_role(p.organization_id, array['admin', 'team_member']::public.app_role[])
  )
);

create policy "files readable by workspace members" on public.files
for select using (
  exists (
    select 1
    from public.workspaces w
    join public.projects p on p.id = w.project_id
    where w.id = workspace_id and public.is_org_member(p.organization_id)
  )
);

create policy "team manages files" on public.files
for all using (
  exists (
    select 1
    from public.workspaces w
    join public.projects p on p.id = w.project_id
    where w.id = workspace_id
      and public.has_org_role(p.organization_id, array['admin', 'team_member']::public.app_role[])
  )
)
with check (
  exists (
    select 1
    from public.workspaces w
    join public.projects p on p.id = w.project_id
    where w.id = workspace_id
      and public.has_org_role(p.organization_id, array['admin', 'team_member']::public.app_role[])
  )
);

create policy "file versions readable by workspace members" on public.file_versions
for select using (
  exists (
    select 1
    from public.files f
    join public.workspaces w on w.id = f.workspace_id
    join public.projects p on p.id = w.project_id
    where f.id = file_id and public.is_org_member(p.organization_id)
  )
);

create policy "team manages file versions" on public.file_versions
for all using (
  exists (
    select 1
    from public.files f
    join public.workspaces w on w.id = f.workspace_id
    join public.projects p on p.id = w.project_id
    where f.id = file_id
      and public.has_org_role(p.organization_id, array['admin', 'team_member']::public.app_role[])
  )
)
with check (
  exists (
    select 1
    from public.files f
    join public.workspaces w on w.id = f.workspace_id
    join public.projects p on p.id = w.project_id
    where f.id = file_id
      and public.has_org_role(p.organization_id, array['admin', 'team_member']::public.app_role[])
  )
);

create policy "approvals readable by workspace members" on public.approval_requests
for select using (
  exists (
    select 1
    from public.workspaces w
    join public.projects p on p.id = w.project_id
    where w.id = workspace_id and public.is_org_member(p.organization_id)
  )
);

create policy "team manages approvals" on public.approval_requests
for all using (
  exists (
    select 1
    from public.workspaces w
    join public.projects p on p.id = w.project_id
    where w.id = workspace_id
      and public.has_org_role(p.organization_id, array['admin', 'team_member']::public.app_role[])
  )
)
with check (
  exists (
    select 1
    from public.workspaces w
    join public.projects p on p.id = w.project_id
    where w.id = workspace_id
      and public.has_org_role(p.organization_id, array['admin', 'team_member']::public.app_role[])
  )
);

create policy "reviewers readable by workspace members" on public.approval_reviewers
for select using (
  exists (
    select 1
    from public.approval_requests ar
    join public.workspaces w on w.id = ar.workspace_id
    join public.projects p on p.id = w.project_id
    where ar.id = approval_request_id and public.is_org_member(p.organization_id)
  )
);

create policy "team manages reviewers" on public.approval_reviewers
for all using (
  exists (
    select 1
    from public.approval_requests ar
    join public.workspaces w on w.id = ar.workspace_id
    join public.projects p on p.id = w.project_id
    where ar.id = approval_request_id
      and public.has_org_role(p.organization_id, array['admin', 'team_member']::public.app_role[])
  )
)
with check (
  exists (
    select 1
    from public.approval_requests ar
    join public.workspaces w on w.id = ar.workspace_id
    join public.projects p on p.id = w.project_id
    where ar.id = approval_request_id
      and public.has_org_role(p.organization_id, array['admin', 'team_member']::public.app_role[])
  )
);

create policy "approval comments hide internal notes from clients" on public.approval_comments
for select using (
  exists (
    select 1
    from public.approval_requests ar
    join public.workspaces w on w.id = ar.workspace_id
    join public.projects p on p.id = w.project_id
    where ar.id = approval_request_id
      and public.is_org_member(p.organization_id)
      and (
        not internal_only
        or public.has_org_role(p.organization_id, array['admin', 'team_member']::public.app_role[])
      )
  )
);

create policy "team manages approval comments" on public.approval_comments
for all using (
  exists (
    select 1
    from public.approval_requests ar
    join public.workspaces w on w.id = ar.workspace_id
    join public.projects p on p.id = w.project_id
    where ar.id = approval_request_id
      and public.has_org_role(p.organization_id, array['admin', 'team_member']::public.app_role[])
  )
)
with check (
  exists (
    select 1
    from public.approval_requests ar
    join public.workspaces w on w.id = ar.workspace_id
    join public.projects p on p.id = w.project_id
    where ar.id = approval_request_id
      and public.has_org_role(p.organization_id, array['admin', 'team_member']::public.app_role[])
  )
);

create policy "members read invoices" on public.invoices
for select using (public.is_org_member(organization_id));

create policy "team manages invoices" on public.invoices
for all using (public.has_org_role(organization_id, array['admin', 'team_member']::public.app_role[]))
with check (public.has_org_role(organization_id, array['admin', 'team_member']::public.app_role[]));

create policy "members read payments through invoices" on public.payments
for select using (
  exists (
    select 1 from public.invoices i
    where i.id = invoice_id and public.is_org_member(i.organization_id)
  )
);

create policy "team manages payments" on public.payments
for all using (
  exists (
    select 1 from public.invoices i
    where i.id = invoice_id
      and public.has_org_role(i.organization_id, array['admin', 'team_member']::public.app_role[])
  )
)
with check (
  exists (
    select 1 from public.invoices i
    where i.id = invoice_id
      and public.has_org_role(i.organization_id, array['admin', 'team_member']::public.app_role[])
  )
);

create policy "users read own notifications" on public.notifications
for select using (
  profile_id = public.current_profile_id()
);

create policy "system or self update notifications" on public.notifications
for update using (
  profile_id = public.current_profile_id()
)
with check (
  profile_id = public.current_profile_id()
);

create policy "members read ai generations" on public.ai_generations
for select using (public.is_org_member(organization_id));

create policy "team manages ai generations" on public.ai_generations
for all using (public.has_org_role(organization_id, array['admin', 'team_member']::public.app_role[]))
with check (public.has_org_role(organization_id, array['admin', 'team_member']::public.app_role[]));

create policy "members read activity logs" on public.activity_logs
for select using (public.is_org_member(organization_id));

create policy "team manages activity logs" on public.activity_logs
for all using (public.has_org_role(organization_id, array['admin', 'team_member']::public.app_role[]))
with check (public.has_org_role(organization_id, array['admin', 'team_member']::public.app_role[]));
