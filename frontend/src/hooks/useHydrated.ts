import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'

/**
 * Tracks whether Zustand persist has finished rehydrating from storage.
 *
 * Uses Zustand v5's persist.onFinishHydration for reliable hydration detection.
 * Includes a safety fallback (2s max wait) so the app can never get stuck
 * on the loading spinner if something goes wrong with the hydration event.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false)
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Already hydrated? Done immediately.
    try {
      if (useAuthStore.persist.hasHydrated()) {
        setHydrated(true)
        return
      }
    } catch {
      // If persist API is somehow unavailable, force hydrated after a tick
      fallbackTimerRef.current = setTimeout(() => setHydrated(true), 100)
      return
    }

    // Subscribe to the official Zustand v5 hydration-finish event
    let unsub = () => {}
    try {
      unsub = useAuthStore.persist.onFinishHydration(() => {
        if (fallbackTimerRef.current) {
          clearTimeout(fallbackTimerRef.current)
          fallbackTimerRef.current = null
        }
        setHydrated(true)
      })
    } catch {
      // If subscription fails, fall back to timer
      fallbackTimerRef.current = setTimeout(() => setHydrated(true), 500)
      return
    }

    // Safety net: no matter what, become hydrated after 2 seconds
    // so the user is never permanently stuck on a spinner.
    fallbackTimerRef.current = setTimeout(() => {
      setHydrated(true)
    }, 2000)

    return () => {
      unsub()
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current)
      }
    }
  }, [])

  return hydrated
}
