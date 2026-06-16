import { useCallback, useEffect, useMemo, useState } from 'react'
import { listSongs } from '@/lib/db'
import type { Song } from '@/types'
import { useDebounce } from './useDebounce'

export type SongFilters = {
  genre: string
  language: string
  mood: string
  proficiency: 'all' | Song['proficiency']
  query: string
  status: 'all' | Song['status']
}

const initialFilters: SongFilters = {
  genre: '',
  language: '',
  mood: '',
  proficiency: 'all',
  query: '',
  status: 'all',
}

export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([])
  const [filters, setFilters] = useState<SongFilters>(initialFilters)
  const [isLoading, setIsLoading] = useState(true)

  const debouncedQuery = useDebounce(filters.query, 300)
  const debouncedGenre = useDebounce(filters.genre, 300)
  const debouncedLanguage = useDebounce(filters.language, 300)
  const debouncedMood = useDebounce(filters.mood, 300)

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
    const query = debouncedQuery.trim().toLowerCase()
    const genre = debouncedGenre.trim().toLowerCase()
    const language = debouncedLanguage.trim().toLowerCase()
    const mood = debouncedMood.trim().toLowerCase()

    return songs.filter((song) => {
      const matchesQuery =
        !query ||
        song.title.toLowerCase().includes(query) ||
        song.artist?.toLowerCase().includes(query) ||
        song.genre?.toLowerCase().includes(query)

      const matchesStatus = filters.status === 'all' || song.status === filters.status
      const matchesGenre = !genre || song.genre?.toLowerCase().includes(genre)
      const matchesLanguage = !language || song.language?.toLowerCase().includes(language)
      const matchesMood = !mood || song.mood?.toLowerCase().includes(mood)
      const matchesProficiency =
        filters.proficiency === 'all' || song.proficiency === filters.proficiency

      return (
        matchesQuery &&
        matchesStatus &&
        matchesGenre &&
        matchesLanguage &&
        matchesMood &&
        matchesProficiency
      )
    })
  }, [
    debouncedQuery,
    debouncedGenre,
    debouncedLanguage,
    debouncedMood,
    filters.status,
    filters.proficiency,
    songs,
  ])

  return {
    filters,
    filteredSongs,
    isLoading,
    refresh,
    setFilters,
    songs,
  }
}
