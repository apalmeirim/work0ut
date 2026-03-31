import { FilePlus2, RefreshCcw, Save, Trash2 } from 'lucide-react'
import type { Workout } from '../types/workout'

type WorkoutSidebarProps = {
  workouts: Workout[]
  activeWorkoutId: string
  isDirty: boolean
  isSaving: boolean
  onCreateWorkout: () => void
  onSelectWorkout: (workoutId: string) => void
  onSaveWorkout: () => void
  onDeleteWorkout: () => void
  onRefresh: () => void
}

export function WorkoutSidebar({
  workouts,
  activeWorkoutId,
  isDirty,
  isSaving,
  onCreateWorkout,
  onDeleteWorkout,
  onRefresh,
  onSaveWorkout,
  onSelectWorkout,
}: WorkoutSidebarProps) {
  return (
    <aside className="flex h-full flex-col rounded-[32px] border border-white/10 bg-ink-950/85 p-5 shadow-2xl shadow-black/30">
      <div className="mb-5 flex items-center gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-white">work0ut</h2>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <button
          type="button"
          onClick={onCreateWorkout}
          aria-label="New workout"
          title="New workout"
          className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3 font-semibold text-ink-950 transition hover:bg-paper-200"
        >
          <FilePlus2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onSaveWorkout}
          disabled={isSaving}
          aria-label={isSaving ? 'Saving workout' : isDirty ? 'Save changes' : 'Saved'}
          title={isSaving ? 'Saving workout' : isDirty ? 'Save changes' : 'Saved'}
          className="inline-flex items-center justify-center rounded-2xl bg-sky-400 px-4 py-3 font-semibold text-ink-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onRefresh}
          aria-label="Reload workouts"
          title="Reload workouts"
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/8"
        >
          <RefreshCcw className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDeleteWorkout}
          aria-label="Delete workout"
          title="Delete workout"
          className="inline-flex items-center justify-center rounded-2xl border border-rose-400/25 px-4 py-3 text-sm font-medium text-rose-200 transition hover:bg-rose-500/10"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h3 className="text-sm uppercase tracking-[0.18em] text-slate-400">Saved</h3>
        <span className="text-sm text-slate-500">{workouts.length}</span>
      </div>

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
        {workouts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-400">
            No saved workouts yet.
          </div>
        ) : null}

        {workouts.map((workout) => {
          const isActive = workout.id === activeWorkoutId
          return (
            <button
              key={workout.id}
              type="button"
              onClick={() => onSelectWorkout(workout.id)}
              className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                isActive
                  ? 'border-sky-400/50 bg-sky-400/10'
                  : 'border-white/8 bg-white/4 hover:border-white/15 hover:bg-white/8'
              }`}
            >
              <div className="font-semibold text-white">{workout.title}</div>
              <div className="mt-1 text-sm text-slate-400">{workout.sections.length} sections</div>
              <div className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                {workout.updatedAt || workout.createdAt
                  ? `Updated ${new Date(workout.updatedAt ?? workout.createdAt ?? '').toLocaleString()}`
                  : 'Unsaved draft'}
              </div>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
