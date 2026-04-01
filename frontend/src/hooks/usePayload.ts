'use client'

import { useCallback, useState } from 'react'
import { usePayloadStore } from '@/store/payloadStore'
import type { HemasMindPayload } from '@/types/hemas-mind-payload'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'

/**
 * REST polling hook for fetching the latest HemasMindPayload.
 * Use this as a fallback when the WebSocket connection is unavailable.
 */
export function usePayload() {
  const { setPayload, setLoading, setError } = usePayloadStore()
  const [isFetching, setIsFetching] = useState(false)

  const fetchPayload = useCallback(
    async (scenario = 'dengue_outbreak'): Promise<HemasMindPayload | null> => {
      setIsFetching(true)
      setLoading(true)

      try {
        const res = await fetch(`${BACKEND_URL}/api/run-agents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scenario }),
        })

        if (!res.ok) {
          throw new Error(`Backend responded ${res.status}: ${res.statusText}`)
        }

        const payload = (await res.json()) as HemasMindPayload
        setPayload(payload)
        return payload
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch payload'
        setError(msg)
        return null
      } finally {
        setIsFetching(false)
      }
    },
    [setPayload, setLoading, setError]
  )

  return { fetchPayload, isFetching }
}
