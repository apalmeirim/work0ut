import type { Exercise, Section, Workout, WorkoutSet } from '../types/workout'

export function uid() {
  return crypto.randomUUID()
}

export function createSet(exerciseId: string, position: number): WorkoutSet {
  return {
    id: uid(),
    exerciseId,
    position,
    reps: '',
    weight: '',
    restSeconds: '',
  }
}

export function createExercise(sectionId: string, position: number, name = 'New exercise'): Exercise {
  const id = uid()

  return {
    id,
    sectionId,
    name,
    position,
    sets: [createSet(id, 0)],
  }
}

export function createSection(workoutId: string, position: number, title = 'New section'): Section {
  const id = uid()
  return {
    id,
    workoutId,
    title,
    position,
    exercises: [createExercise(id, 0)],
  }
}

export function createEmptyWorkout(userId: string): Workout {
  const workoutId = uid()

  return {
    id: workoutId,
    userId,
    title: '',
    description: '',
    sections: [],
  }
}

export function reorderList<T extends { position: number }>(items: T[], from: number, to: number) {
  if (from < 0 || to < 0 || to >= items.length || from === to) {
    return items
  }

  const next = [...items]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)

  return next.map((item, index) => ({
    ...item,
    position: index,
  }))
}

export function cloneWorkout(workout: Workout) {
  return structuredClone(workout)
}

export function serializeWorkout(workout: Workout) {
  return JSON.stringify(workout)
}

export function sortWorkout(workout: Workout): Workout {
  return {
    ...workout,
    sections: [...workout.sections]
      .sort((a, b) => a.position - b.position)
      .map((section) => ({
        ...section,
        exercises: [...section.exercises]
          .sort((a, b) => a.position - b.position)
          .map((exercise) => ({
            ...exercise,
            sets: [...exercise.sets].sort((a, b) => a.position - b.position),
          })),
      })),
  }
}

export function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function formatStopwatchTime(totalMs: number) {
  const totalCentiseconds = Math.floor(totalMs / 10)
  const minutes = Math.floor(totalCentiseconds / 6000)
  const seconds = Math.floor((totalCentiseconds % 6000) / 100)
  const centiseconds = totalCentiseconds % 100
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
}
