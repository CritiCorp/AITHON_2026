import { NextRequest, NextResponse } from 'next/server'
import { proxyToBackend, ApiError } from '@/lib/api'
import type { HemasMindPayload, ApiResponse } from '@/types/hemas-mind-payload'

/**
 * POST /api/agent
 * Triggers the four-agent pipeline on the Python backend and returns
 * the fully-packaged HemasMindPayload from the Communicator Agent.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { scenario?: string }

    const data = await proxyToBackend<HemasMindPayload>('/api/run-agents', body)

    return NextResponse.json<ApiResponse<HemasMindPayload>>({
      success: true,
      data,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const status = error instanceof ApiError ? error.status : 502

    return NextResponse.json<ApiResponse>(
      { success: false, error: message },
      { status }
    )
  }
}
