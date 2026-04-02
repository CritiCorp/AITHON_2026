import { NextRequest, NextResponse } from 'next/server'
import { proxyToBackendGet, ApiError } from '@/lib/api'
import type { TopDrugsResponse } from '@/types/analytics'

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams)
    const data = await proxyToBackendGet<TopDrugsResponse>(
      '/api/analytics/charts/top-drugs',
      params
    )
    return NextResponse.json({ success: true, data })
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 502
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status }
    )
  }
}
