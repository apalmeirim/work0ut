import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import type { Exercise, RestTimer } from '../types/workout'
import { SetRow } from './SetRow'

type ExerciseCardProps = {
  exercise: Exercise
  index: number
  count: number
  timer: RestTimer | null
  onUpdateName: (name: string) => void
  onMove: (direction: -1 | 1) => void
  onRemove: () => void
  onAddSet: () => void
  onUpdateSet: (setId: string, field: 'reps' | 'weight' | 'restSeconds', value: string) => void
  onRemoveSet: (setId: string) => void
  onStartTimer: (setId: string, duration: number) => void
}

export function ExerciseCard({
  exercise,
  index,
  count,
  timer,
  onAddSet,
  onMove,
  onRemove,
  onRemoveSet,
  onStartTimer,
  onUpdateName,
  onUpdateSet,
}: ExerciseCardProps) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-ink-900/80 p-5 shadow-lg shadow-black/20">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={exercise.name}
          onChange={(event) => onUpdateName(event.target.value)}
          className="min-w-[220px] flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-semibold text-white outline-none focus:border-sky-400"
          placeholder="Exercise name"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="rounded-xl border border-white/10 p-2 text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === count - 1}
            className="rounded-xl border border-white/10 p-2 text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-xl border border-rose-400/30 p-2 text-rose-200 transition hover:bg-rose-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {exercise.sets.map((set) => (
          <SetRow
            key={set.id}
            set={set}
            isTimerActive={timer?.setId === set.id}
            onChange={(field, value) => onUpdateSet(set.id, field, value)}
            onRemove={() => onRemoveSet(set.id)}
            onStartTimer={() => onStartTimer(set.id, Number.parseInt(set.restSeconds || '0', 10) || 0)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAddSet}
        className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-dashed border-sky-400/30 px-4 py-2 text-sm font-medium text-sky-200 transition hover:bg-sky-400/10"
      >
        <Plus className="h-4 w-4" />
        Set
      </button>
    </div>
  )
}
