import { useEffect, useReducer } from 'react'
import type { Workout } from '../types/workout'
import { cloneWorkout, createExercise, createSection, createSet, reorderList } from '../lib/utils'

type Action =
  | { type: 'replace'; workout: Workout }
  | { type: 'update-meta'; field: 'title' | 'description'; value: string }
  | { type: 'add-section' }
  | { type: 'update-section'; sectionId: string; title: string }
  | { type: 'remove-section'; sectionId: string }
  | { type: 'move-section'; sectionId: string; direction: -1 | 1 }
  | { type: 'add-exercise'; sectionId: string }
  | { type: 'update-exercise'; sectionId: string; exerciseId: string; name: string }
  | { type: 'remove-exercise'; sectionId: string; exerciseId: string }
  | { type: 'move-exercise'; sectionId: string; exerciseId: string; direction: -1 | 1 }
  | {
      type: 'update-set'
      sectionId: string
      exerciseId: string
      setId: string
      field: 'reps' | 'weight' | 'restSeconds'
      value: string
    }
  | { type: 'add-set'; sectionId: string; exerciseId: string }
  | { type: 'remove-set'; sectionId: string; exerciseId: string; setId: string }
  | { type: 'move-set'; sectionId: string; exerciseId: string; setId: string; direction: -1 | 1 }

function reducer(state: Workout, action: Action): Workout {
  switch (action.type) {
    case 'replace':
      return cloneWorkout(action.workout)
    case 'update-meta':
      return {
        ...state,
        [action.field]: action.value,
      }
    case 'add-section':
      return {
        ...state,
        sections: [
          ...state.sections,
          createSection(state.id, state.sections.length, `Section ${state.sections.length + 1}`),
        ],
      }
    case 'update-section':
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.sectionId ? { ...section, title: action.title } : section,
        ),
      }
    case 'remove-section':
      return {
        ...state,
        sections: state.sections
          .filter((section) => section.id !== action.sectionId)
          .map((section, index) => ({ ...section, position: index })),
      }
    case 'move-section': {
      const index = state.sections.findIndex((section) => section.id === action.sectionId)
      return {
        ...state,
        sections: reorderList(state.sections, index, index + action.direction),
      }
    }
    case 'add-exercise':
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.sectionId
            ? {
                ...section,
                exercises: [
                  ...section.exercises,
                  createExercise(section.id, section.exercises.length, `Exercise ${section.exercises.length + 1}`),
                ],
              }
            : section,
        ),
      }
    case 'update-exercise':
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.sectionId
            ? {
                ...section,
                exercises: section.exercises.map((exercise) =>
                  exercise.id === action.exerciseId ? { ...exercise, name: action.name } : exercise,
                ),
              }
            : section,
        ),
      }
    case 'remove-exercise':
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.sectionId
            ? {
                ...section,
                exercises: section.exercises
                  .filter((exercise) => exercise.id !== action.exerciseId)
                  .map((exercise, index) => ({ ...exercise, position: index })),
              }
            : section,
        ),
      }
    case 'move-exercise':
      return {
        ...state,
        sections: state.sections.map((section) => {
          if (section.id !== action.sectionId) {
            return section
          }

          const index = section.exercises.findIndex((exercise) => exercise.id === action.exerciseId)
          return {
            ...section,
            exercises: reorderList(section.exercises, index, index + action.direction),
          }
        }),
      }
    case 'update-set':
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.sectionId
            ? {
                ...section,
                exercises: section.exercises.map((exercise) =>
                  exercise.id === action.exerciseId
                    ? {
                        ...exercise,
                        sets: exercise.sets.map((set) =>
                          set.id === action.setId ? { ...set, [action.field]: action.value } : set,
                        ),
                      }
                    : exercise,
                ),
              }
            : section,
        ),
      }
    case 'add-set':
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.sectionId
            ? {
                ...section,
                exercises: section.exercises.map((exercise) =>
                  exercise.id === action.exerciseId
                    ? {
                        ...exercise,
                        sets: [...exercise.sets, createSet(exercise.id, exercise.sets.length)],
                      }
                    : exercise,
                ),
              }
            : section,
        ),
      }
    case 'remove-set':
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.sectionId
            ? {
                ...section,
                exercises: section.exercises.map((exercise) =>
                  exercise.id === action.exerciseId
                    ? {
                        ...exercise,
                        sets: exercise.sets
                          .filter((set) => set.id !== action.setId)
                          .map((set, index) => ({ ...set, position: index })),
                      }
                    : exercise,
                ),
              }
            : section,
        ),
      }
    case 'move-set':
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.sectionId
            ? {
                ...section,
                exercises: section.exercises.map((exercise) => {
                  if (exercise.id !== action.exerciseId) {
                    return exercise
                  }

                  const index = exercise.sets.findIndex((set) => set.id === action.setId)
                  return {
                    ...exercise,
                    sets: reorderList(exercise.sets, index, index + action.direction),
                  }
                }),
              }
            : section,
        ),
      }
    default:
      return state
  }
}

export function useWorkoutBuilder(sourceWorkout: Workout) {
  const [workout, dispatch] = useReducer(reducer, sourceWorkout, cloneWorkout)

  useEffect(() => {
    dispatch({ type: 'replace', workout: sourceWorkout })
  }, [sourceWorkout])

  return { workout, dispatch }
}
