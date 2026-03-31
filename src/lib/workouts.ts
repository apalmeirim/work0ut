import type { Workout } from '../types/workout'
import { sortWorkout } from './utils'
import { supabase } from './supabase'

type DatabaseSet = {
  id: string
  exercise_id: string
  position: number
  reps: string | null
  weight: string | null
  rest_seconds: number | null
}

type DatabaseExercise = {
  id: string
  section_id: string
  name: string
  position: number
  sets: DatabaseSet[] | null
}

type DatabaseSection = {
  id: string
  workout_id: string
  title: string
  position: number
  exercises: DatabaseExercise[] | null
}

type DatabaseWorkout = {
  id: string
  user_id: string
  title: string
  description: string | null
  created_at: string
  updated_at: string
  sections: DatabaseSection[] | null
}

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }

  return supabase
}

function mapWorkout(row: DatabaseWorkout): Workout {
  return sortWorkout({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sections:
      row.sections?.map((section) => ({
        id: section.id,
        workoutId: section.workout_id,
        title: section.title,
        position: section.position,
        exercises:
          section.exercises?.map((exercise) => ({
            id: exercise.id,
            sectionId: exercise.section_id,
            name: exercise.name,
            position: exercise.position,
            sets:
              exercise.sets?.map((set) => ({
                id: set.id,
                exerciseId: set.exercise_id,
                position: set.position,
                reps: set.reps ?? '',
                weight: set.weight ?? '',
                restSeconds: set.rest_seconds?.toString() ?? '',
              })) ?? [],
          })) ?? [],
      })) ?? [],
  })
}

const workoutSelect = `
  id,
  user_id,
  title,
  description,
  created_at,
  updated_at,
  sections:workout_sections(
    id,
    workout_id,
    title,
    position,
    exercises:workout_exercises(
      id,
      section_id,
      name,
      position,
      sets:exercise_sets(
        id,
        exercise_id,
        position,
        reps,
        weight,
        rest_seconds
      )
    )
  )
`

export async function fetchWorkouts(userId: string) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('workouts')
    .select(workoutSelect)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data as DatabaseWorkout[]).map(mapWorkout)
}

export async function saveWorkout(workout: Workout) {
  const client = requireSupabase()

  const workoutPayload = {
    id: workout.id,
    user_id: workout.userId,
    title: workout.title.trim() || 'Untitled workout',
    description: workout.description.trim(),
  }

  const { error: workoutError } = await client.from('workouts').upsert(workoutPayload)
  if (workoutError) {
    throw workoutError
  }

  const { error: deleteSectionsError } = await client.from('workout_sections').delete().eq('workout_id', workout.id)
  if (deleteSectionsError) {
    throw deleteSectionsError
  }

  const sectionRows = workout.sections.map((section, sectionIndex) => ({
    id: section.id,
    workout_id: workout.id,
    title: section.title.trim() || `Section ${sectionIndex + 1}`,
    position: sectionIndex,
  }))

  if (sectionRows.length > 0) {
    const { error: sectionError } = await client.from('workout_sections').insert(sectionRows)
    if (sectionError) {
      throw sectionError
    }
  }

  const exerciseRows = workout.sections.flatMap((section) =>
    section.exercises.map((exercise, exerciseIndex) => ({
      id: exercise.id,
      section_id: section.id,
      name: exercise.name.trim() || `Exercise ${exerciseIndex + 1}`,
      position: exerciseIndex,
    })),
  )

  if (exerciseRows.length > 0) {
    const { error: exerciseError } = await client.from('workout_exercises').insert(exerciseRows)
    if (exerciseError) {
      throw exerciseError
    }
  }

  const setRows = workout.sections.flatMap((section) =>
    section.exercises.flatMap((exercise) =>
      exercise.sets.map((set, setIndex) => ({
        id: set.id,
        exercise_id: exercise.id,
        position: setIndex,
        reps: set.reps.trim(),
        weight: set.weight.trim(),
        rest_seconds: Number.parseInt(set.restSeconds || '0', 10) || 0,
      })),
    ),
  )

  if (setRows.length > 0) {
    const { error: setError } = await client.from('exercise_sets').insert(setRows)
    if (setError) {
      throw setError
    }
  }

  const { data, error } = await client.from('workouts').select(workoutSelect).eq('id', workout.id).single()
  if (error) {
    throw error
  }

  return mapWorkout(data as DatabaseWorkout)
}

export async function deleteWorkout(workoutId: string) {
  const client = requireSupabase()
  const { error } = await client.from('workouts').delete().eq('id', workoutId)

  if (error) {
    throw error
  }
}
