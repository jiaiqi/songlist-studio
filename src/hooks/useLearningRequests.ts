import { useCallback, useEffect, useMemo, useState } from 'react'
import { listLearningRequests } from '@/lib/db'
import type { LearningRequest, LearningRequestStatus } from '@/types'

export type LearningRequestFilters = {
  query: string
  status: 'all' | LearningRequestStatus
}

const initialFilters: LearningRequestFilters = {
  query: '',
  status: 'all',
}

export function useLearningRequests() {
  const [requests, setRequests] = useState<LearningRequest[]>([])
  const [filters, setFilters] = useState<LearningRequestFilters>(initialFilters)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    const nextRequests = await listLearningRequests()
    setRequests(nextRequests)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const filteredRequests = useMemo(() => {
    const query = filters.query.trim().toLowerCase()

    return requests.filter((request) => {
      const matchesQuery =
        !query ||
        request.songTitle.toLowerCase().includes(query) ||
        request.artist?.toLowerCase().includes(query) ||
        request.requesterName?.toLowerCase().includes(query)

      const matchesStatus = filters.status === 'all' || request.status === filters.status

      return matchesQuery && matchesStatus
    })
  }, [filters, requests])

  return {
    filteredRequests,
    filters,
    isLoading,
    refresh,
    requests,
    setFilters,
  }
}
