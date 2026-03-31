create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workout_sections (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts (id) on delete cascade,
  title text not null,
  position integer not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint workout_sections_position_unique unique (workout_id, position)
);

create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.workout_sections (id) on delete cascade,
  name text not null,
  position integer not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint workout_exercises_position_unique unique (section_id, position)
);

create table if not exists public.exercise_sets (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.workout_exercises (id) on delete cascade,
  position integer not null,
  reps text not null default '',
  weight text not null default '',
  rest_seconds integer not null default 0 check (rest_seconds >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint exercise_sets_position_unique unique (exercise_id, position)
);

create index if not exists workouts_user_id_idx on public.workouts (user_id);
create index if not exists workout_sections_workout_id_idx on public.workout_sections (workout_id);
create index if not exists workout_exercises_section_id_idx on public.workout_exercises (section_id);
create index if not exists exercise_sets_exercise_id_idx on public.exercise_sets (exercise_id);

drop trigger if exists set_workouts_updated_at on public.workouts;
create trigger set_workouts_updated_at
before update on public.workouts
for each row
execute function public.set_updated_at();

drop trigger if exists set_workout_sections_updated_at on public.workout_sections;
create trigger set_workout_sections_updated_at
before update on public.workout_sections
for each row
execute function public.set_updated_at();

drop trigger if exists set_workout_exercises_updated_at on public.workout_exercises;
create trigger set_workout_exercises_updated_at
before update on public.workout_exercises
for each row
execute function public.set_updated_at();

drop trigger if exists set_exercise_sets_updated_at on public.exercise_sets;
create trigger set_exercise_sets_updated_at
before update on public.exercise_sets
for each row
execute function public.set_updated_at();

alter table public.workouts enable row level security;
alter table public.workout_sections enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.exercise_sets enable row level security;

drop policy if exists "Users can read own workouts" on public.workouts;
create policy "Users can read own workouts"
on public.workouts
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own workouts" on public.workouts;
create policy "Users can insert own workouts"
on public.workouts
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own workouts" on public.workouts;
create policy "Users can update own workouts"
on public.workouts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own workouts" on public.workouts;
create policy "Users can delete own workouts"
on public.workouts
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can manage own sections" on public.workout_sections;
create policy "Users can manage own sections"
on public.workout_sections
for all
using (
  exists (
    select 1
    from public.workouts
    where workouts.id = workout_sections.workout_id
      and workouts.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.workouts
    where workouts.id = workout_sections.workout_id
      and workouts.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage own exercises" on public.workout_exercises;
create policy "Users can manage own exercises"
on public.workout_exercises
for all
using (
  exists (
    select 1
    from public.workout_sections
    join public.workouts on workouts.id = workout_sections.workout_id
    where workout_sections.id = workout_exercises.section_id
      and workouts.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.workout_sections
    join public.workouts on workouts.id = workout_sections.workout_id
    where workout_sections.id = workout_exercises.section_id
      and workouts.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage own sets" on public.exercise_sets;
create policy "Users can manage own sets"
on public.exercise_sets
for all
using (
  exists (
    select 1
    from public.workout_exercises
    join public.workout_sections on workout_sections.id = workout_exercises.section_id
    join public.workouts on workouts.id = workout_sections.workout_id
    where workout_exercises.id = exercise_sets.exercise_id
      and workouts.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.workout_exercises
    join public.workout_sections on workout_sections.id = workout_exercises.section_id
    join public.workouts on workouts.id = workout_sections.workout_id
    where workout_exercises.id = exercise_sets.exercise_id
      and workouts.user_id = auth.uid()
  )
);
