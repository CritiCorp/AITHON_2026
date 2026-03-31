import { NextRequest, NextResponse } from 'next/server'
import { proxyToBackend, ApiError } from '@/lib/api'
import type { PurchaseOrder, ApiResponse } from '@/types/hemas-mind-payload'

/**
 * POST /api/procurement/generate-po
 * Proxies the "Generate Purchase Order" action to the Python backend.
 * The request body includes action.payload merged with payload context
 * (see useActionHandler).
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>

    const data = await proxyToBackend<PurchaseOrder>(
      '/api/procurement/generate-po',
      body
    )

    return NextResponse.json<ApiResponse<PurchaseOrder>>({
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
