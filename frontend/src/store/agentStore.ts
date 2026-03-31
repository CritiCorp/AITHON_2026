import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  AgentName,
  AgentStatus,
  AgentThought,
  AgentStatusUpdate,
} from '@/types/hemas-mind-payload'

interface AgentState {
  /** Live per-agent status map */
  statuses: Record<AgentName, AgentStatus>
  /** Streaming thought log — capped at 200 entries */
  thoughts: AgentThought[]
  /** socket.io connection health */
  isConnected: boolean
  /** True while any agent is actively running */
  isStreaming: boolean

  setAgentStatus: (update: AgentStatusUpdate) => void
  appendThought: (thought: AgentThought) => void
  clearThoughts: () => void
  setConnected: (connected: boolean) => void
  setStreaming: (streaming: boolean) => void
  resetAll: () => void
}

const defaultStatuses: Record<AgentName, AgentStatus> = {
  sentinel: 'idle',
  orchestrator: 'idle',
  operator: 'idle',
  communicator: 'idle',
}

export const useAgentStore = create<AgentState>()(
  devtools(
    (set) => ({
      statuses: { ...defaultStatuses },
      thoughts: [],
      isConnected: false,
      isStreaming: false,

      setAgentStatus: ({ agentName, status }) =>
        set((state) => ({
          statuses: { ...state.statuses, [agentName]: status },
        })),

      appendThought: (thought) =>
        set((state) => ({
          thoughts: [...state.thoughts, thought].slice(-200),
        })),

      clearThoughts: () => set({ thoughts: [] }),

      setConnected: (isConnected) => set({ isConnected }),

      setStreaming: (isStreaming) => set({ isStreaming }),

      resetAll: () =>
        set({
          statuses: { ...defaultStatuses },
          thoughts: [],
          isStreaming: false,
        }),
    }),
    { name: 'agent-store' }
  )
)
