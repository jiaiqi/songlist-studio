import { useCallback, useEffect, useMemo, useState } from 'react'
import { listSongs } from '@/lib/db'
import type { Song } from '@/types'

export type SongFilters = {
  query: string
  status: 'all' | Song['status']
}

const initialFilters: SongFilters = {
  query: '',
  status: 'all',
}

export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([])
  const [filters, setFilters] = useState<SongFilters>(initialFilters)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    const nextSongs = await listSongs()
    setSongs(nextSongs)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const filteredSongs = useMemo(() => {
    const query = filters.query.trim().toLowerCase()

    return songs.filter((song) => {
      const matchesQuery =
        !query ||
        song.title.toLowerCase().includes(query) ||
        song.artist?.toLowerCase().includes(query) ||
        song.genre?.toLowerCase().includes(query)

      const matchesStatus = filters.status === 'all' || song.status === filters.status

      return matchesQuery && matchesStatus
    })
  }, [filters, songs])

  return {
    filters,
    filteredSongs,
    isLoading,
    refresh,
    setFilters,
    songs,
  }
}
