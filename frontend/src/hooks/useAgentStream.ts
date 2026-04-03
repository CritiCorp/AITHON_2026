'use client'

import { useEffect, useRef, useCallback } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useAgentStore } from '@/store/agentStore'
import { usePayloadStore } from '@/store/payloadStore'
import type { AgentStreamEvent, Granularity } from '@/types/hemas-mind-payload'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:8000'

/**
 * Manages the socket.io connection to the Python backend.
 * Dispatches incoming AgentStreamEvents to the appropriate Zustand store:
 *   - 'thought'  → agentStore.appendThought
 *   - 'status'   → agentStore.setAgentStatus
 *   - 'payload'  → payloadStore.setPayload  (final packaged result)
 *   - 'error'    → console + stops streaming flag
 */
export function useAgentStream() {
  const socketRef = useRef<Socket | null>(null)

  const { setConnected, setStreaming, setAgentStatus, appendThought, resetAll } =
    useAgentStore()
  const { setPayload } = usePayloadStore()

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return

    const socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
    })

    socket.on('connect', () => setConnected(true))

    socket.on('disconnect', () => {
      setConnected(false)
      setStreaming(false)
    })

    socket.on('agent_event', (event: AgentStreamEvent) => {
      switch (event.type) {
        case 'thought':
          appendThought(event.data)
          break
        case 'status':
          setAgentStatus(event.data)
          if (event.data.status === 'running') setStreaming(true)
          break
        case 'payload':
          setPayload(event.data)
          setStreaming(false)
          break
        case 'error':
          console.error('[AgentStream]', event.data)
          setStreaming(false)
          break
      }
    })

    socketRef.current = socket
  }, [setConnected, setStreaming, setAgentStatus, appendThought, setPayload])

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect()
    socketRef.current = null
    resetAll()
  }, [resetAll])

  /**
   * Emit a trigger_run event to kick off the agent pipeline.
   * Resets all agent state so the UI is clean for the new run.
   */
  const triggerRun = useCallback(
    (scenario = 'dengue_outbreak', granularity: Granularity = 'daily') => {
      if (!socketRef.current?.connected) return
      resetAll()
      setStreaming(true)
      socketRef.current.emit('trigger_run', { scenario, granularity })
    },
    [resetAll, setStreaming]
  )

  // Connect on mount, clean up on unmount
  useEffect(() => {
    connect()
    return () => {
      socketRef.current?.disconnect()
    }
  }, [connect])

  return { connect, disconnect, triggerRun }
}
