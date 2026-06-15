import { useCallback, useEffect, useState } from 'react'
import { listPlaylists } from '@/lib/db'
import type { Playlist } from '@/types'

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    const nextPlaylists = await listPlaylists()
    setPlaylists(nextPlaylists)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { isLoading, playlists, refresh }
}
