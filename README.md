# work0ut

work0ut is a desktop workout builder MVP built with Electron, React, Vite, Tailwind CSS, and Supabase.

## 1. High-level architecture

- Desktop shell: Electron loads the React/Vite app in a native desktop window. In development it points to `http://127.0.0.1:5173`; in production it loads the compiled `dist/index.html`.
- Frontend: React functional components and hooks manage authentication, workout editing, reordering, and rest timers.
- Backend: Supabase provides email/password auth, PostgreSQL storage, and row-level security so each user only sees their own workouts.

## 2. Database schema and relationships

### Tables

- `workouts`: top-level workout record owned by a Supabase auth user.
- `workout_sections`: ordered sections inside a workout such as Warmup or Strength.
- `workout_exercises`: ordered exercises inside each section.
- `exercise_sets`: ordered set prescriptions inside each exercise, including reps, weight, and optional rest timer.

### Relationships

- `workouts.user_id -> auth.users.id`
- `workout_sections.workout_id -> workouts.id`
- `workout_exercises.section_id -> workout_sections.id`
- `exercise_sets.exercise_id -> workout_exercises.id`

All child relationships use `on delete cascade`, so deleting a workout removes its sections, exercises, and sets automatically.

### Exact SQL to run in Supabase

Paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) into the Supabase SQL Editor and run it as a single script.

## 3. Step-by-step Supabase setup

1. Create a new Supabase project.
2. Open `SQL Editor` in Supabase.
3. Paste the full SQL from [`supabase/schema.sql`](./supabase/schema.sql).
4. Run the script.
5. Open `Authentication > Providers > Email`.
6. Make sure `Email` is enabled.
7. For fastest MVP testing, turn `Confirm email` off.
8. Open `Project Settings > API`.
9. Copy:
   - `Project URL`
   - `anon public` key
10. In this project root, create `.env` from `.env.example`.
11. Set:
   - `VITE_SUPABASE_URL=your_project_url`
   - `VITE_SUPABASE_ANON_KEY=your_anon_key`

No OAuth redirect setup is required because this app uses email/password auth directly inside the desktop window.

## 4. Desktop app setup

### How Electron integrates with React

- `electron/main.cjs` creates the native window.
- `electron/preload.cjs` exposes a minimal safe API to the renderer.
- React is the renderer app in `src/`.
- Vite handles frontend development and production bundling.
- Electron Builder packages the final desktop app.

### Local setup

1. Install Node.js 20+.
2. Run `npm install`.
3. Create `.env` from `.env.example` and add your Supabase values.

## 5. Frontend project structure

```text
work0ut/
├─ electron/
│  ├─ main.cjs
│  └─ preload.cjs
├─ src/
│  ├─ components/
│  │  ├─ AuthScreen.tsx
│  │  ├─ ExerciseCard.tsx
│  │  ├─ SectionCard.tsx
│  │  ├─ SetRow.tsx
│  │  ├─ TimerPanel.tsx
│  │  ├─ WorkoutEditor.tsx
│  │  └─ WorkoutSidebar.tsx
│  ├─ hooks/
│  │  ├─ useRestTimer.ts
│  │  └─ useWorkoutBuilder.ts
│  ├─ lib/
│  │  ├─ supabase.ts
│  │  ├─ utils.ts
│  │  └─ workouts.ts
│  ├─ types/
│  │  └─ workout.ts
│  ├─ App.tsx
│  ├─ index.css
│  ├─ main.tsx
│  └─ vite-env.d.ts
├─ supabase/
│  └─ schema.sql
├─ .env.example
├─ package.json
└─ vite.config.ts
```

## 6. Code files

All code files are complete in this workspace. The core entry points are:

- [`src/App.tsx`](./src/App.tsx)
- [`src/components/WorkoutEditor.tsx`](./src/components/WorkoutEditor.tsx)
- [`src/lib/workouts.ts`](./src/lib/workouts.ts)
- [`electron/main.cjs`](./electron/main.cjs)
- [`supabase/schema.sql`](./supabase/schema.sql)

## 7. Run locally in desktop dev mode

```bash
npm install
# create .env from .env.example and add Supabase values
npm run dev
```

This starts Vite and then launches Electron against the local frontend dev server.

## 8. Build installers

### Production build

```bash
npm run build:desktop
```

Artifacts are written to `release/`.

### Installer outputs

- Windows: `.exe` via NSIS
- macOS: `.dmg`
- Linux: `.AppImage`

### Important packaging note

Electron can only reliably produce native installers for the current host OS in a standard setup:

- Build Windows installers on Windows
- Build macOS installers on macOS
- Build Linux packages on Linux
