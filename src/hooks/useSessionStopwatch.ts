import { useEffect, useState } from 'react'
import type { SectionSplits } from '../types/workout'

export function useSessionStopwatch() {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [startedAtMs, setStartedAtMs] = useState<number | null>(null)
  const [splits, setSplits] = useState<SectionSplits>({})

  useEffect(() => {
    if (!isRunning || startedAtMs === null) {
      return undefined
    }

    const interval = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAtMs)
    }, 100)

    return () => window.clearInterval(interval)
  }, [isRunning, startedAtMs])

  function start() {
    if (isRunning) {
      return
    }

    setStartedAtMs(Date.now() - elapsedMs)
    setIsRunning(true)
  }

  function stop() {
    if (!isRunning || startedAtMs === null) {
      return
    }

    setElapsedMs(Date.now() - startedAtMs)
    setIsRunning(false)
    setStartedAtMs(null)
  }

  function reset() {
    setIsRunning(false)
    setElapsedMs(0)
    setStartedAtMs(null)
    setSplits({})
  }

  function split(sectionId: string | undefined) {
    if (!isRunning || !sectionId) {
      return
    }

    const nextElapsed = startedAtMs === null ? elapsedMs : Date.now() - startedAtMs
    setElapsedMs(nextElapsed)
    setSplits((current) => ({
      ...current,
      [sectionId]: nextElapsed,
    }))
  }

  return {
    isRunning,
    elapsedMs,
    splits,
    start,
    stop,
    reset,
    split,
  }
}
