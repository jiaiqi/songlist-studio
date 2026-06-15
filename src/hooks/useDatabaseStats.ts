import { useEffect, useState } from 'react'
import { getDatabaseStats } from '@/lib/db'

type DatabaseStats = Awaited<ReturnType<typeof getDatabaseStats>>

const initialStats: DatabaseStats = {
  learningRequestCount: 0,
  songCount: 0,
  playlistCount: 0,
  publishedPlaylistCount: 0,
}

export function useDatabaseStats() {
  const [stats, setStats] = useState<DatabaseStats>(initialStats)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    getDatabaseStats()
      .then((nextStats) => {
        if (isMounted) setStats(nextStats)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return { stats, isLoading }
}
