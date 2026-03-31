import { Clock3, PauseCircle } from 'lucide-react'
import type { RestTimer } from '../types/workout'
import { formatSeconds } from '../lib/utils'

type TimerPanelProps = {
  timer: RestTimer | null
  onClear: () => void
}

export function TimerPanel({ timer, onClear }: TimerPanelProps) {
  if (!timer) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-white/4 p-5 text-sm text-slate-400">
        Start a set rest timer to keep the countdown pinned here while you edit the workout.
      </div>
    )
  }

  const progress = `${Math.max(0, (timer.remaining / timer.duration) * 100)}%`

  return (
    <div className="rounded-3xl border border-mint-400/20 bg-mint-400/10 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-mint-200">Rest timer</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{timer.exerciseName}</h3>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border border-white/15 p-2 text-slate-200 transition hover:border-white/30 hover:bg-white/10"
        >
          <PauseCircle className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-950/70 text-mint-200">
          <Clock3 className="h-6 w-6" />
        </div>
        <div>
          <div className="text-3xl font-semibold text-white">{formatSeconds(timer.remaining)}</div>
          <div className="text-sm text-mint-100/80">{timer.remaining === 1 ? '1 second left' : `${timer.remaining} seconds left`}</div>
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-ink-950/70">
        <div className="h-full rounded-full bg-mint-400 transition-all" style={{ width: progress }} />
      </div>
    </div>
  )
}
