'use client'

import { useCallback, useState } from 'react'
import type { AgentAction, ApiResponse } from '@/types/hemas-mind-payload'
import { usePayloadStore } from '@/store/payloadStore'

interface ActionState {
  isLoading: boolean
  result: ApiResponse | null
  error: string | null
}

const idle: ActionState = { isLoading: false, result: null, error: null }

/**
 * Executes action buttons declared in the HemasMindPayload.
 * Merges the action's static payload with live context (metadata + alert)
 * from the current payload before sending.
 */
export function useActionHandler() {
  const [states, setStates] = useState<Record<string, ActionState>>({})
  const { current: payload } = usePayloadStore()

  const handleAction = useCallback(
    async (action: AgentAction): Promise<ApiResponse | null> => {
      setStates((prev) => ({ ...prev, [action.id]: { ...idle, isLoading: true } }))

      try {
        const body: Record<string, unknown> = {
          ...action.payload,
          // Inject live context so the backend knows what product/run this is for
          metadata: payload?.metadata,
          alert: payload?.alert,
        }

        const res = await fetch(action.endpoint, {
          method: action.method,
          headers: { 'Content-Type': 'application/json' },
          body: action.method === 'POST' ? JSON.stringify(body) : undefined,
        })

        const data = (await res.json()) as ApiResponse
        setStates((prev) => ({
          ...prev,
          [action.id]: { isLoading: false, result: data, error: null },
        }))
        return data
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Action failed'
        setStates((prev) => ({
          ...prev,
          [action.id]: { isLoading: false, result: null, error },
        }))
        return null
      }
    },
    [payload]
  )

  const getActionState = useCallback(
    (actionId: string): ActionState => states[actionId] ?? idle,
    [states]
  )

  return { handleAction, getActionState }
}
