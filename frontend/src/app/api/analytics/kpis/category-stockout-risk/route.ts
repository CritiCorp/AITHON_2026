import { NextResponse } from 'next/server'
import { proxyToBackendGet, ApiError } from '@/lib/api'
import type { CategoryStockoutRiskResponse } from '@/types/analytics'

export async function GET() {
  try {
    const data = await proxyToBackendGet<CategoryStockoutRiskResponse>(
      '/api/analytics/kpis/category-stockout-risk'
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
