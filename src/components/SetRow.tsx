import { Play, Trash2 } from 'lucide-react'
import type { WorkoutSet } from '../types/workout'

type SetRowProps = {
  set: WorkoutSet
  isTimerActive: boolean
  onChange: (field: 'reps' | 'weight' | 'restSeconds', value: string) => void
  onRemove: () => void
  onStartTimer: () => void
}

export function SetRow({
  set,
  isTimerActive,
  onChange,
  onRemove,
  onStartTimer,
}: SetRowProps) {
  return (
    <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 xl:grid-cols-[1fr_1fr_1fr_auto]">
      <label className="block">
        <input
          value={set.reps}
          onChange={(event) => onChange('reps', event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-ink-950/80 px-3 py-2.5 text-white outline-none focus:border-sky-400"
          placeholder="Reps"
        />
      </label>

      <label className="block">
        <input
          value={set.weight}
          onChange={(event) => onChange('weight', event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-ink-950/80 px-3 py-2.5 text-white outline-none focus:border-sky-400"
          placeholder="Weight"
        />
      </label>

      <label className="block">
        <input
          type="number"
          min="0"
          value={set.restSeconds}
          onChange={(event) => onChange('restSeconds', event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-ink-950/80 px-3 py-2.5 text-white outline-none focus:border-sky-400"
          placeholder="Rest"
        />
      </label>

      <div className="flex items-center justify-center gap-2 self-stretch">
        <button
          type="button"
          onClick={onStartTimer}
          className={`inline-flex h-11 w-11 items-center justify-center rounded-xl transition ${
            isTimerActive ? 'bg-mint-400 text-ink-950' : 'border border-white/10 text-slate-200 hover:bg-white/10'
          }`}
          aria-label="Start rest timer"
          title="Start rest timer"
        >
          <Play className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-rose-400/30 text-rose-200 transition hover:bg-rose-500/10"
          aria-label="Delete set"
          title="Delete set"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
