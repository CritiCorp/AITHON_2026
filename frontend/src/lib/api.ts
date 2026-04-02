/**
 * Typed fetch wrapper for all backend calls.
 *
 * Client-side code calls the Next.js API routes (/api/...).
 * The API routes call proxyToBackend() server-side to reach Python.
 */
import type {
  ApiResponse,
  HemasMindPayload,
  PurchaseOrder,
} from '@/types/hemas-mind-payload'

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new ApiError(res.status, text)
  }

  return res.json() as Promise<ApiResponse<T>>
}

// ── Client-side calls (hit Next.js API routes) ────────────────

export async function triggerAgentRun(
  scenario = 'dengue_outbreak'
): Promise<ApiResponse<HemasMindPayload>> {
  return request<HemasMindPayload>('/api/agent', {
    method: 'POST',
    body: JSON.stringify({ scenario }),
  })
}

export async function generatePurchaseOrder(
  body: Record<string, unknown>
): Promise<ApiResponse<PurchaseOrder>> {
  return request<PurchaseOrder>('/api/procurement/generate-po', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// ── Server-side proxy helpers (used only inside Next.js API routes) ──

export async function proxyToBackend<T>(
  path: string,
  body: unknown
): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new ApiError(res.status, text)
  }

  return res.json() as Promise<T>
}

export async function proxyToBackendGet<T>(
  path: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${BACKEND_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') url.searchParams.set(k, v)
    })
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new ApiError(res.status, text)
  }

  return res.json() as Promise<T>
}
