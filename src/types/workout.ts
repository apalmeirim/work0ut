export type WorkoutSet = {
  id: string
  exerciseId: string
  position: number
  reps: string
  weight: string
  restSeconds: string
}

export type Exercise = {
  id: string
  sectionId: string
  name: string
  position: number
  sets: WorkoutSet[]
}

export type Section = {
  id: string
  workoutId: string
  title: string
  position: number
  exercises: Exercise[]
}

export type Workout = {
  id: string
  userId: string
  title: string
  description: string
  createdAt?: string
  updatedAt?: string
  sections: Section[]
}

export type RestTimer = {
  setId: string
  exerciseId: string
  exerciseName: string
  duration: number
  remaining: number
}

export type SectionSplits = Record<string, number>
