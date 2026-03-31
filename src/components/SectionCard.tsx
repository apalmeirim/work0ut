import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import type { RestTimer, Section } from '../types/workout'
import { formatStopwatchTime } from '../lib/utils'
import { ExerciseCard } from './ExerciseCard'

type SectionCardProps = {
  section: Section
  index: number
  count: number
  timer: RestTimer | null
  splitTime?: number
  onUpdateTitle: (title: string) => void
  onMove: (direction: -1 | 1) => void
  onRemove: () => void
  onAddExercise: () => void
  onUpdateExercise: (exerciseId: string, name: string) => void
  onMoveExercise: (exerciseId: string, direction: -1 | 1) => void
  onRemoveExercise: (exerciseId: string) => void
  onAddSet: (exerciseId: string) => void
  onUpdateSet: (exerciseId: string, setId: string, field: 'reps' | 'weight' | 'restSeconds', value: string) => void
  onMoveSet: (exerciseId: string, setId: string, direction: -1 | 1) => void
  onRemoveSet: (exerciseId: string, setId: string) => void
  onStartTimer: (exerciseId: string, exerciseName: string, setId: string, duration: number) => void
}

export function SectionCard({
  section,
  index,
  count,
  timer,
  splitTime,
  onAddExercise,
  onAddSet,
  onMove,
  onMoveExercise,
  onMoveSet,
  onRemove,
  onRemoveExercise,
  onRemoveSet,
  onStartTimer,
  onUpdateExercise,
  onUpdateSet,
  onUpdateTitle,
}: SectionCardProps) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-white/6 p-6 shadow-2xl shadow-black/20 backdrop-blur">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={section.title}
          onChange={(event) => onUpdateTitle(event.target.value)}
          className="min-w-[240px] flex-1 rounded-2xl border border-white/10 bg-ink-950/80 px-4 py-3 text-2xl font-semibold text-white outline-none focus:border-sky-400"
          placeholder="Section title"
        />
        <div className="flex items-center gap-2">
          {splitTime !== undefined ? (
            <div className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
              {formatStopwatchTime(splitTime)}
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="rounded-xl border border-white/10 p-2 text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === count - 1}
            className="rounded-xl border border-white/10 p-2 text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-xl border border-rose-400/30 p-2 text-rose-200 transition hover:bg-rose-500/10"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {section.exercises.map((exercise, exerciseIndex) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            index={exerciseIndex}
            count={section.exercises.length}
            timer={timer}
            onUpdateName={(name) => onUpdateExercise(exercise.id, name)}
            onMove={(direction) => onMoveExercise(exercise.id, direction)}
            onRemove={() => onRemoveExercise(exercise.id)}
            onAddSet={() => onAddSet(exercise.id)}
            onUpdateSet={(setId, field, value) => onUpdateSet(exercise.id, setId, field, value)}
            onMoveSet={(setId, direction) => onMoveSet(exercise.id, setId, direction)}
            onRemoveSet={(setId) => onRemoveSet(exercise.id, setId)}
            onStartTimer={(setId, duration) => onStartTimer(exercise.id, exercise.name, setId, duration)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAddExercise}
        className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-dashed border-sky-400/30 px-4 py-2 text-sm font-medium text-sky-200 transition hover:bg-sky-400/10"
      >
        <Plus className="h-4 w-4" />
        Exercise
      </button>
    </section>
  )
}
