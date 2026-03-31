'use client'

/**
 * MOCK SEED HOOK — remove this file when the Python backend is live.
 *
 * Seeding checklist (3 steps to go live):
 *   1. Delete  src/lib/mock-data.ts
 *   2. Delete  src/hooks/useMockSeed.ts   ← this file
 *   3. Remove  useMockSeed()  call in src/app/dashboard/page.tsx
 */

import { useEffect } from 'react'
import { usePayloadStore } from '@/store/payloadStore'
import { useAgentStore } from '@/store/agentStore'
import { MOCK_PAYLOAD, MOCK_THOUGHTS } from '@/lib/mock-data'

const ENABLED = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

/** Seeds stores with mock data once on mount when NEXT_PUBLIC_USE_MOCK=true. */
export function useMockSeed() {
  const { setPayload } = usePayloadStore()
  const { appendThought, setAgentStatus, setConnected } = useAgentStore()

  useEffect(() => {
    if (!ENABLED) return

    // Simulate connection
    setConnected(true)

    // Replay agent statuses from the mock summary
    const { agentSummary } = MOCK_PAYLOAD
    ;(['sentinel', 'orchestrator', 'operator', 'communicator'] as const).forEach(
      (name) => {
        setAgentStatus({
          agentName: name,
          status: agentSummary[name].status,
          timestamp: agentSummary[name].completedAt ?? new Date().toISOString(),
        })
      }
    )

    // Replay thought stream with realistic delays (compressed 10×)
    const now = Date.now()
    MOCK_THOUGHTS.forEach((thought) => {
      const originalAge = now - new Date(thought.timestamp).getTime()
      // Compress: max 3s gap between entries so the stream fills quickly
      const delay = Math.min(originalAge / 10, 3000)
      setTimeout(() => appendThought(thought), delay)
    })

    // Set payload after the last thought has been appended (~3.5s)
    const lastDelay =
      Math.min(
        (now - new Date(MOCK_THOUGHTS[MOCK_THOUGHTS.length - 1].timestamp).getTime()) / 10,
        3000
      ) + 500
    setTimeout(() => setPayload(MOCK_PAYLOAD), lastDelay)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally run once on mount
}
