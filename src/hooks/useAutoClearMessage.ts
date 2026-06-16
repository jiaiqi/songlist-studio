import { useEffect, useRef } from 'react'

export function useAutoClearMessage(message: string, onClear: () => void, delay = 5000) {
  const savedOnClear = useRef(onClear)
  savedOnClear.current = onClear

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => savedOnClear.current(), delay)
    return () => clearTimeout(timer)
  }, [message, delay])
}
