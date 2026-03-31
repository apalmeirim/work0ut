import { Plus } from 'lucide-react'
import type { RestTimer, Workout } from '../types/workout'
import { useSessionStopwatch } from '../hooks/useSessionStopwatch'
import { SessionStopwatchPanel } from './SessionStopwatchPanel'
import { TimerPanel } from './TimerPanel'
import { SectionCard } from './SectionCard'

type WorkoutEditorProps = {
  workout: Workout
  timer: RestTimer | null
  onClearTimer: () => void
  onUpdateTitle: (value: string) => void
  onAddSection: () => void
  onUpdateSection: (sectionId: string, title: string) => void
  onMoveSection: (sectionId: string, direction: -1 | 1) => void
  onRemoveSection: (sectionId: string) => void
  onAddExercise: (sectionId: string) => void
  onUpdateExercise: (sectionId: string, exerciseId: string, name: string) => void
  onMoveExercise: (sectionId: string, exerciseId: string, direction: -1 | 1) => void
  onRemoveExercise: (sectionId: string, exerciseId: string) => void
  onAddSet: (sectionId: string, exerciseId: string) => void
  onUpdateSet: (
    sectionId: string,
    exerciseId: string,
    setId: string,
    field: 'reps' | 'weight' | 'restSeconds',
    value: string,
  ) => void
  onMoveSet: (sectionId: string, exerciseId: string, setId: string, direction: -1 | 1) => void
  onRemoveSet: (sectionId: string, exerciseId: string, setId: string) => void
  onStartTimer: (exerciseId: string, exerciseName: string, setId: string, duration: number) => void
}

export function WorkoutEditor({
  workout,
  timer,
  onAddExercise,
  onAddSection,
  onAddSet,
  onClearTimer,
  onMoveExercise,
  onMoveSection,
  onMoveSet,
  onRemoveExercise,
  onRemoveSection,
  onRemoveSet,
  onStartTimer,
  onUpdateExercise,
  onUpdateTitle,
  onUpdateSection,
  onUpdateSet,
}: WorkoutEditorProps) {
  const stopwatch = useSessionStopwatch()
  const nextSplitSectionId = workout.sections.find((section) => stopwatch.splits[section.id] === undefined)?.id

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="rounded-[32px] border border-white/10 bg-white/6 p-6 shadow-2xl shadow-black/20 backdrop-blur">
          <input
            value={workout.title}
            onChange={(event) => onUpdateTitle(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-ink-950/70 px-5 py-4 font-display text-4xl font-semibold text-white outline-none focus:border-sky-400"
            placeholder="Workout title"
          />
        </section>

        {workout.sections.map((section, sectionIndex) => (
          <SectionCard
            key={section.id}
            section={section}
            index={sectionIndex}
            count={workout.sections.length}
            timer={timer}
            splitTime={stopwatch.splits[section.id]}
            onUpdateTitle={(title) => onUpdateSection(section.id, title)}
            onMove={(direction) => onMoveSection(section.id, direction)}
            onRemove={() => onRemoveSection(section.id)}
            onAddExercise={() => onAddExercise(section.id)}
            onUpdateExercise={(exerciseId, name) => onUpdateExercise(section.id, exerciseId, name)}
            onMoveExercise={(exerciseId, direction) => onMoveExercise(section.id, exerciseId, direction)}
            onRemoveExercise={(exerciseId) => onRemoveExercise(section.id, exerciseId)}
            onAddSet={(exerciseId) => onAddSet(section.id, exerciseId)}
            onUpdateSet={(exerciseId, setId, field, value) => onUpdateSet(section.id, exerciseId, setId, field, value)}
            onMoveSet={(exerciseId, setId, direction) => onMoveSet(section.id, exerciseId, setId, direction)}
            onRemoveSet={(exerciseId, setId) => onRemoveSet(section.id, exerciseId, setId)}
            onStartTimer={(exerciseId, exerciseName, setId, duration) =>
              onStartTimer(exerciseId, exerciseName, setId, duration)
            }
          />
        ))}

        <button
          type="button"
          onClick={onAddSection}
          className="inline-flex items-center gap-2 rounded-2xl border border-dashed border-sky-400/30 px-5 py-3 font-medium text-sky-200 transition hover:bg-sky-400/10"
        >
          <Plus className="h-4 w-4" />
            Section
        </button>
      </div>

      <div className="xl:sticky xl:top-6 xl:h-fit">
        <TimerPanel timer={timer} onClear={onClearTimer} />
        <SessionStopwatchPanel
          isRunning={stopwatch.isRunning}
          elapsedMs={stopwatch.elapsedMs}
          onStart={stopwatch.start}
          onStop={stopwatch.stop}
          onReset={stopwatch.reset}
          onSplit={() => stopwatch.split(nextSplitSectionId)}
        />
      </div>
    </div>
  )
}
