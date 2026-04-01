import { type NextRequest, NextResponse } from 'next/server'
import type { ApiResponse } from '@/types/hemas-mind-payload'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const res = await fetch(`${BACKEND_URL}/api/forecast/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    return NextResponse.json(data as ApiResponse, { status: res.status })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Forecast run failed'
    return NextResponse.json<ApiResponse>({ success: false, error: message }, { status: 502 })
  }
}
