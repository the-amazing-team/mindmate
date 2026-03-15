-- ─────────────────────────────────────────────────────────────────────────────
--  MindMate — Supabase schema (aligned with ERD)
--  Run in Supabase SQL Editor before deploying
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists vector;

-- ── users ─────────────────────────────────────────────────────────────────────
-- Supabase auth.users is the base; this table extends it
create table if not exists users (
  id               uuid primary key references auth.users on delete cascade,
  email            text unique,
  password_hash    text,
  name             text,
  age_group        text,
  personality_type text check (personality_type in ('introvert','extrovert','ambivert')),
  created_at       timestamptz default now()
);
alter table users enable row level security;
create policy "own user" on users for all using (auth.uid() = id);

-- Auto-create user row on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into users (id, email, name, age_group, personality_type)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'age_group',
    new.raw_user_meta_data->>'personality_type'
  )
  on conflict (id) do nothing;
  return new;
end;$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── user_goals ────────────────────────────────────────────────────────────────
create table if not exists user_goals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users on delete cascade not null,
  goal_type  text not null,
  created_at timestamptz default now()
);
alter table user_goals enable row level security;
create policy "own goals" on user_goals for all using (auth.uid() = user_id);

-- ── journal_entries ───────────────────────────────────────────────────────────
create table if not exists journal_entries (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references users on delete cascade not null,
  title        text,
  overall_mood text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
alter table journal_entries enable row level security;
create policy "own entries" on journal_entries for all using (auth.uid() = user_id);
alter publication supabase_realtime add table journal_entries;

-- ── journal_sections ─────────────────────────────────────────────────────────
-- Each entry is split into sections (paragraphs/topics)
-- Pipeline A processes each section independently
create table if not exists journal_sections (
  id               uuid primary key default gen_random_uuid(),
  journal_entry_id uuid references journal_entries on delete cascade not null,
  content          text not null,
  section_order    int  not null default 0,
  created_at       timestamptz default now()
);
alter table journal_sections enable row level security;
create policy "own sections" on journal_sections for all
  using (auth.uid() = (select user_id from journal_entries where id = journal_entry_id));
alter publication supabase_realtime add table journal_sections;

-- ── ai_reflections ────────────────────────────────────────────────────────────
-- One AI reflection per journal section (Pipeline A: reflection_generation)
create table if not exists ai_reflections (
  id              uuid primary key default gen_random_uuid(),
  section_id      uuid references journal_sections on delete cascade unique not null,
  reflection_text text,
  created_at      timestamptz default now()
);
alter table ai_reflections enable row level security;
create policy "own reflections" on ai_reflections for all
  using (auth.uid() = (
    select je.user_id from journal_sections js
    join journal_entries je on je.id = js.journal_entry_id
    where js.id = section_id
  ));
alter publication supabase_realtime add table ai_reflections;

-- ── emotion_analysis ─────────────────────────────────────────────────────────
-- One emotion record per journal section (Pipeline A: emotion_detection)
create table if not exists emotion_analysis (
  id              uuid primary key default gen_random_uuid(),
  section_id      uuid references journal_sections on delete cascade unique not null,
  primary_emotion text,
  emotion_score   float check (emotion_score between 0 and 1),
  created_at      timestamptz default now()
);
alter table emotion_analysis enable row level security;
create policy "own emotions" on emotion_analysis for all
  using (auth.uid() = (
    select je.user_id from journal_sections js
    join journal_entries je on je.id = js.journal_entry_id
    where js.id = section_id
  ));
alter publication supabase_realtime add table emotion_analysis;

-- ── journal_embeddings ────────────────────────────────────────────────────────
-- One embedding per journal section (Pipeline A: store_embedding → Pipeline C: vector search)
create table if not exists journal_embeddings (
  id         uuid primary key default gen_random_uuid(),
  section_id uuid references journal_sections on delete cascade not null,
  embedding  vector(1536)
);
alter table journal_embeddings enable row level security;
create policy "own embeddings" on journal_embeddings for all
  using (auth.uid() = (
    select je.user_id from journal_sections js
    join journal_entries je on je.id = js.journal_entry_id
    where js.id = section_id
  ));
create index if not exists journal_embeddings_vector_idx
  on journal_embeddings using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- RPC: vector similarity search (used by Pipeline C)
create or replace function match_journal_sections(
  query_embedding  vector(1536),
  match_user_id    uuid,
  match_threshold  float  default 0.70,
  match_count      int    default 5
)
returns table (
  section_id      uuid,
  content         text,
  primary_emotion text,
  emotion_score   float,
  entry_id        uuid,
  created_at      timestamptz,
  similarity      float
)
language sql stable as $$
  select
    js.id          as section_id,
    js.content,
    ea.primary_emotion,
    ea.emotion_score,
    js.journal_entry_id as entry_id,
    js.created_at,
    1 - (je2.embedding <=> query_embedding) as similarity
  from journal_embeddings je2
  join journal_sections   js on js.id = je2.section_id
  left join emotion_analysis ea on ea.section_id = js.id
  join journal_entries    ent on ent.id = js.journal_entry_id
  where ent.user_id = match_user_id
    and 1 - (je2.embedding <=> query_embedding) > match_threshold
  order by je2.embedding <=> query_embedding
  limit match_count;
$$;

-- ── insights ─────────────────────────────────────────────────────────────────
-- Pipeline B output
create table if not exists insights (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references users on delete cascade not null,
  insight_type text not null,  -- 'weekly_summary' | 'pattern' | 'recommendation'
  insight_text text,
  created_at   timestamptz default now()
);
alter table insights enable row level security;
create policy "own insights" on insights for all using (auth.uid() = user_id);

-- ── accountability_tasks ──────────────────────────────────────────────────────
create table if not exists accountability_tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references users on delete cascade not null,
  description text not null,
  due_date    timestamptz,
  status      text check (status in ('pending','done','skipped')) default 'pending',
  created_at  timestamptz default now()
);
alter table accountability_tasks enable row level security;
create policy "own tasks" on accountability_tasks for all using (auth.uid() = user_id);

-- ── ai_checkins ───────────────────────────────────────────────────────────────
-- Pipeline D: checkin_notification output
create table if not exists ai_checkins (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references users on delete cascade not null,
  trigger_reason text,
  message        text,
  created_at     timestamptz default now()
);
alter table ai_checkins enable row level security;
create policy "own checkins" on ai_checkins for all using (auth.uid() = user_id);

-- ── ai_call_schedules ─────────────────────────────────────────────────────────
-- Pipeline D: ai_call output
create table if not exists ai_call_schedules (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references users on delete cascade not null,
  scheduled_at   timestamptz not null,
  call_type      text check (call_type in ('check_in','therapy','crisis')) default 'check_in',
  trigger_source text,
  status         text check (status in ('pending','completed','cancelled','missed')) default 'pending',
  created_at     timestamptz default now()
);
alter table ai_call_schedules enable row level security;
create policy "own schedules" on ai_call_schedules for all using (auth.uid() = user_id);

-- ── ai_call_logs ──────────────────────────────────────────────────────────────
create table if not exists ai_call_logs (
  id               uuid primary key default gen_random_uuid(),
  schedule_id      uuid references ai_call_schedules on delete cascade not null,
  call_started_at  timestamptz,
  call_ended_at    timestamptz,
  duration_seconds int,
  summary          text,
  created_at       timestamptz default now()
);
alter table ai_call_logs enable row level security;
create policy "own call logs" on ai_call_logs for all
  using (auth.uid() = (select user_id from ai_call_schedules where id = schedule_id));

-- ── ai_call_transcripts ───────────────────────────────────────────────────────
create table if not exists ai_call_transcripts (
  id         uuid primary key default gen_random_uuid(),
  call_log_id uuid references ai_call_logs on delete cascade not null,
  speaker    text check (speaker in ('user','ai')),
  message    text,
  created_at timestamptz default now()
);
alter table ai_call_transcripts enable row level security;
create policy "own transcripts" on ai_call_transcripts for all
  using (auth.uid() = (
    select acs.user_id from ai_call_logs acl
    join ai_call_schedules acs on acs.id = acl.schedule_id
    where acl.id = call_log_id
  ));

-- ── plugins ───────────────────────────────────────────────────────────────────
create table if not exists plugins (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  description      text,
  creator_id       uuid references users on delete set null,
  iframe_url       text,
  api_permissions  jsonb default '{}',
  price            float default 0,
  status           text check (status in ('active','inactive','review')) default 'active',
  created_at       timestamptz default now()
);
alter table plugins enable row level security;
create policy "read plugins" on plugins for select using (true);

-- ── plugin_installs ───────────────────────────────────────────────────────────
create table if not exists plugin_installs (
  id           uuid primary key default gen_random_uuid(),
  plugin_id    uuid references plugins on delete cascade not null,
  user_id      uuid references users on delete cascade not null,
  installed_at timestamptz default now(),
  unique(plugin_id, user_id)
);
alter table plugin_installs enable row level security;
create policy "own installs" on plugin_installs for all using (auth.uid() = user_id);

-- ── plugin_transactions ───────────────────────────────────────────────────────
create table if not exists plugin_transactions (
  id         uuid primary key default gen_random_uuid(),
  plugin_id  uuid references plugins on delete cascade not null,
  buyer_id   uuid references users on delete cascade not null,
  amount     float not null,
  created_at timestamptz default now()
);
alter table plugin_transactions enable row level security;
create policy "own transactions" on plugin_transactions for all using (auth.uid() = buyer_id);

-- ── streak helper ─────────────────────────────────────────────────────────────
alter table users add column if not exists streak     int default 0;
alter table users add column if not exists last_entry timestamptz;

create or replace function update_streak(uid uuid)
returns void language plpgsql security definer as $$
declare
  last_date date;
  today     date := current_date;
begin
  select last_entry::date into last_date from users where id = uid;
  if last_date is null or last_date < today then
    update users set
      streak     = case when last_date = today - 1 then streak + 1 else 1 end,
      last_entry = now()
    where id = uid;
  end if;
end;$$;
