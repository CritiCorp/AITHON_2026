import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { HemasMindPayload } from '@/types/hemas-mind-payload'

interface PayloadState {
  /** The latest payload received from the Communicator Agent */
  current: HemasMindPayload | null
  /** Ring-buffer of the last 10 payloads for history navigation */
  history: HemasMindPayload[]
  isLoading: boolean
  error: string | null

  setPayload: (payload: HemasMindPayload) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearPayload: () => void
}

export const usePayloadStore = create<PayloadState>()(
  devtools(
    (set) => ({
      current: null,
      history: [],
      isLoading: false,
      error: null,

      setPayload: (payload) =>
        set((state) => ({
          current: payload,
          // Push old current into history, cap at 10
          history: state.current
            ? [state.current, ...state.history].slice(0, 10)
            : state.history,
          error: null,
          isLoading: false,
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      clearPayload: () => set({ current: null }),
    }),
    { name: 'payload-store' }
  )
)
