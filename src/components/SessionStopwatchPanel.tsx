import { Flag, Pause, Play, RotateCcw } from 'lucide-react'
import { formatStopwatchTime } from '../lib/utils'

type SessionStopwatchPanelProps = {
  isRunning: boolean
  elapsedMs: number
  onStart: () => void
  onStop: () => void
  onReset: () => void
  onSplit: () => void
}

export function SessionStopwatchPanel({
  isRunning,
  elapsedMs,
  onReset,
  onSplit,
  onStart,
  onStop,
}: SessionStopwatchPanelProps) {
  return (
    <section className="mt-6 rounded-3xl border border-white/10 bg-ink-950/85 p-5 shadow-2xl shadow-black/20">
      <div className="flex flex-col items-center gap-5">
        <div className="min-w-0 overflow-hidden text-center text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {formatStopwatchTime(elapsedMs)}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onStart}
            disabled={isRunning}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400 text-ink-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Start timer"
          >
            <Play className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onStop}
            disabled={!isRunning}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 text-slate-200 transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Pause timer"
          >
            <Pause className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 text-slate-200 transition hover:bg-white/8"
            aria-label="Reset timer"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onSplit}
            disabled={!isRunning}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 text-slate-200 transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Split timer"
          >
            <Flag className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  )
}
