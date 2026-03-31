import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { LoaderCircle, LogOut, TriangleAlert } from 'lucide-react'
import { AuthScreen } from './components/AuthScreen'
import { WorkoutEditor } from './components/WorkoutEditor'
import { WorkoutSidebar } from './components/WorkoutSidebar'
import { useRestTimer } from './hooks/useRestTimer'
import { useWorkoutBuilder } from './hooks/useWorkoutBuilder'
import { deleteWorkout, fetchWorkouts, saveWorkout } from './lib/workouts'
import { hasSupabaseEnv, supabase } from './lib/supabase'
import { cloneWorkout, createEmptyWorkout, serializeWorkout } from './lib/utils'
import type { Workout } from './types/workout'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authWorking, setAuthWorking] = useState(false)
  const [authError, setAuthError] = useState('')
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState('')
  const [saveState, setSaveState] = useState(false)
  const [editorSeed, setEditorSeed] = useState<Workout | null>(null)
  const [savedSnapshot, setSavedSnapshot] = useState('')
  const timer = useRestTimer()

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError) {
        setAuthError(sessionError.message)
      }

      setSession(data.session)
      setAuthLoading(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthLoading(false)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user.id) {
      return
    }

    void loadWorkouts(session.user.id)
  }, [session?.user.id])

  async function loadWorkouts(userId: string) {
    setLoadingData(true)
    setError('')

    try {
      const nextWorkouts = await fetchWorkouts(userId)
      setWorkouts(nextWorkouts)

      if (nextWorkouts.length > 0) {
        const initial = cloneWorkout(nextWorkouts[0])
        setEditorSeed(initial)
        setSavedSnapshot(serializeWorkout(initial))
      } else {
        const freshWorkout = createEmptyWorkout(userId)
        setEditorSeed(freshWorkout)
        setSavedSnapshot('')
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load workouts.')
    } finally {
      setLoadingData(false)
    }
  }

  async function handleAuth(mode: 'signin' | 'signup', email: string, password: string) {
    if (!supabase) {
      setAuthError('Supabase is not configured.')
      return
    }

    setAuthWorking(true)
    setAuthError('')

    const action =
      mode === 'signin'
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password })

    const { error: authRequestError } = await action
    if (authRequestError) {
      setAuthError(authRequestError.message)
    } else if (mode === 'signup') {
      setAuthError('Account created. If email confirmation is enabled, confirm it before signing in.')
    }

    setAuthWorking(false)
  }

  async function handleLogout() {
    if (!supabase) {
      return
    }

    await supabase.auth.signOut()
    setWorkouts([])
    setEditorSeed(null)
    setSavedSnapshot('')
    timer.clear()
  }

  function createWorkout() {
    if (!session?.user.id) {
      return
    }

    const nextWorkout = createEmptyWorkout(session.user.id)
    setEditorSeed(nextWorkout)
    setSavedSnapshot('')
    setError('')
    timer.clear()
  }

  function selectWorkout(workoutId: string) {
    const nextWorkout = workouts.find((workout) => workout.id === workoutId)
    if (!nextWorkout) {
      return
    }

    const cloned = cloneWorkout(nextWorkout)
    setEditorSeed(cloned)
    setSavedSnapshot(serializeWorkout(cloned))
    setError('')
    timer.clear()
  }

  async function handleSave(currentWorkout: Workout) {
    setSaveState(true)
    setError('')

    try {
      const savedWorkout = await saveWorkout(currentWorkout)
      setWorkouts((current) => {
        const existing = current.some((item) => item.id === savedWorkout.id)
        const next = existing
          ? current.map((item) => (item.id === savedWorkout.id ? savedWorkout : item))
          : [savedWorkout, ...current]

        return [...next].sort((a, b) => {
          const aTime = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime()
          const bTime = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime()
          return bTime - aTime
        })
      })

      const cloned = cloneWorkout(savedWorkout)
      setEditorSeed(cloned)
      setSavedSnapshot(serializeWorkout(cloned))
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save workout.')
    } finally {
      setSaveState(false)
    }
  }

  async function handleDelete(currentWorkout: Workout) {
    const existsInLibrary = workouts.some((workout) => workout.id === currentWorkout.id)

    if (!session?.user.id) {
      return
    }

    if (!existsInLibrary) {
      const freshWorkout = createEmptyWorkout(session.user.id)
      setEditorSeed(freshWorkout)
      setSavedSnapshot('')
      timer.clear()
      return
    }

    setError('')
    try {
      await deleteWorkout(currentWorkout.id)
      const remaining = workouts.filter((workout) => workout.id !== currentWorkout.id)
      setWorkouts(remaining)

      if (remaining.length > 0) {
        const cloned = cloneWorkout(remaining[0])
        setEditorSeed(cloned)
        setSavedSnapshot(serializeWorkout(cloned))
      } else {
        const freshWorkout = createEmptyWorkout(session.user.id)
        setEditorSeed(freshWorkout)
        setSavedSnapshot('')
      }
      timer.clear()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete workout.')
    }
  }

  if (!hasSupabaseEnv) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-2xl rounded-[32px] border border-amber-400/30 bg-amber-400/10 p-8 shadow-2xl shadow-black/30">
          <div className="flex items-center gap-3 text-amber-200">
            <TriangleAlert className="h-6 w-6" />
            <h1 className="text-2xl font-semibold text-white">Supabase environment variables are missing</h1>
          </div>
          <p className="mt-4 leading-7 text-slate-200">
            Create a <code className="rounded bg-black/25 px-2 py-1">.env</code> file from{' '}
            <code className="rounded bg-black/25 px-2 py-1">.env.example</code>, then set your Supabase project URL
            and anon key.
          </p>
        </div>
      </div>
    )
  }

  if (authLoading || (session && !editorSeed)) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-slate-300">
        <LoaderCircle className="h-5 w-5 animate-spin" />
        Loading Work0ut...
      </div>
    )
  }

  if (!session) {
    return <AuthScreen onSubmit={handleAuth} loading={authWorking} error={authError} />
  }

  if (!editorSeed) {
    return null
  }

  return (
    <AuthenticatedApp
      sessionEmail={session.user.email ?? 'signed-in user'}
      workouts={workouts}
      editorSeed={editorSeed}
      loadingData={loadingData}
      savedSnapshot={savedSnapshot}
      saveState={saveState}
      error={error}
      timerState={timer}
      onCreateWorkout={createWorkout}
      onSelectWorkout={selectWorkout}
      onSaveWorkout={handleSave}
      onDeleteWorkout={handleDelete}
      onReload={() => loadWorkouts(session.user.id)}
      onLogout={handleLogout}
    />
  )
}

type AuthenticatedAppProps = {
  sessionEmail: string
  workouts: Workout[]
  editorSeed: Workout
  loadingData: boolean
  savedSnapshot: string
  saveState: boolean
  error: string
  timerState: ReturnType<typeof useRestTimer>
  onCreateWorkout: () => void
  onSelectWorkout: (workoutId: string) => void
  onSaveWorkout: (workout: Workout) => Promise<void>
  onDeleteWorkout: (workout: Workout) => Promise<void>
  onReload: () => Promise<void>
  onLogout: () => Promise<void>
}

function AuthenticatedApp({
  sessionEmail,
  workouts,
  editorSeed,
  loadingData,
  savedSnapshot,
  saveState,
  error,
  timerState,
  onCreateWorkout,
  onSelectWorkout,
  onSaveWorkout,
  onDeleteWorkout,
  onReload,
  onLogout,
}: AuthenticatedAppProps) {
  const { workout, dispatch } = useWorkoutBuilder(editorSeed)
  const isDirty = savedSnapshot !== serializeWorkout(workout)

  return (
    <div className="min-h-screen px-4 py-4 lg:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1800px] gap-6 lg:grid-cols-[320px_1fr]">
        <WorkoutSidebar
          workouts={workouts}
          activeWorkoutId={workout.id}
          isDirty={isDirty}
          isSaving={saveState}
          onCreateWorkout={onCreateWorkout}
          onSelectWorkout={onSelectWorkout}
          onSaveWorkout={() => void onSaveWorkout(workout)}
          onDeleteWorkout={() => void onDeleteWorkout(workout)}
          onRefresh={() => void onReload()}
        />

        <main className="rounded-[36px] border border-white/10 bg-white/4 p-5 shadow-2xl shadow-black/30 backdrop-blur lg:p-6">
          <header className="mb-6 flex flex-wrap items-center justify-start gap-4 px-5 py-4">
            <div className="flex flex-wrap items-center gap-3">
              {loadingData ? <div className="text-sm text-slate-400">Refreshing library...</div> : null}
              {error ? <div className="rounded-full bg-rose-500/15 px-4 py-2 text-sm text-rose-200">{error}</div> : null}
              <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">{sessionEmail}</div>
              <button
                type="button"
                onClick={() => void onLogout()}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/8"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </header>

          <WorkoutEditor
            key={workout.id}
            workout={workout}
            timer={timerState.timer}
            onClearTimer={timerState.clear}
            onUpdateTitle={(value) => dispatch({ type: 'update-meta', field: 'title', value })}
            onAddSection={() => dispatch({ type: 'add-section' })}
            onUpdateSection={(sectionId, title) => dispatch({ type: 'update-section', sectionId, title })}
            onMoveSection={(sectionId, direction) => dispatch({ type: 'move-section', sectionId, direction })}
            onRemoveSection={(sectionId) => dispatch({ type: 'remove-section', sectionId })}
            onAddExercise={(sectionId) => dispatch({ type: 'add-exercise', sectionId })}
            onUpdateExercise={(sectionId, exerciseId, name) =>
              dispatch({ type: 'update-exercise', sectionId, exerciseId, name })
            }
            onMoveExercise={(sectionId, exerciseId, direction) =>
              dispatch({ type: 'move-exercise', sectionId, exerciseId, direction })
            }
            onRemoveExercise={(sectionId, exerciseId) =>
              dispatch({ type: 'remove-exercise', sectionId, exerciseId })
            }
            onAddSet={(sectionId, exerciseId) => dispatch({ type: 'add-set', sectionId, exerciseId })}
            onUpdateSet={(sectionId, exerciseId, setId, field, value) =>
              dispatch({ type: 'update-set', sectionId, exerciseId, setId, field, value })
            }
            onRemoveSet={(sectionId, exerciseId, setId) =>
              dispatch({ type: 'remove-set', sectionId, exerciseId, setId })
            }
            onStartTimer={(exerciseId, exerciseName, setId, duration) =>
              timerState.start(setId, exerciseId, exerciseName, duration)
            }
          />
        </main>
      </div>
    </div>
  )
}

export default App
