import { useEffect, useState } from 'react'
import type { RestTimer } from '../types/workout'

export function useRestTimer() {
  const [timer, setTimer] = useState<RestTimer | null>(null)

  useEffect(() => {
    if (!timer) {
      return undefined
    }

    const interval = window.setInterval(() => {
      setTimer((current) => {
        if (!current) {
          return null
        }

        if (current.remaining <= 1) {
          return null
        }

        return {
          ...current,
          remaining: current.remaining - 1,
        }
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [timer])

  function start(setId: string, exerciseId: string, exerciseName: string, duration: number) {
    if (duration <= 0) {
      return
    }

    setTimer({
      setId,
      exerciseId,
      exerciseName,
      duration,
      remaining: duration,
    })
  }

  function clear() {
    setTimer(null)
  }

  return {
    timer,
    start,
    clear,
  }
}
