import { useCallback, useEffect, useState, type SetStateAction } from 'react'

// ── localStorage-backed state hook ───────────────────────────────────────────
// All prototype data persists in the browser. Swap for a real backend later
// without changing the UI: this hook is the only storage boundary.

export function useLocalStorage<T>(key: string, initial: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw !== null) return JSON.parse(raw) as T
    } catch {
      // ignore corrupted storage
    }
    return typeof initial === 'function' ? (initial as () => T)() : initial
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage may be full/blocked; keep in-memory state
    }
  }, [key, value])

  const set = useCallback(
    (next: T | ((prev: T) => T)) => setValue(next as SetStateAction<T>),
    [],
  )

  return [value, set] as const
}
