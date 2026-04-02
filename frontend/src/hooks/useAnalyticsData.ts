'use client'

import { useState, useEffect } from 'react'
import type {
  KpiSummaryResponse,
  ProvinceDemandResponse,
  CategoryStockoutRiskResponse,
  SalesTrendResponse,
  TopDrugsResponse,
  DrugTypeBreakdownResponse,
  RiskDistributionResponse,
  StockStatusResponse,
  RiskHeatmapResponse,
  PharmacyMapResponse,
  DiseaseDemandCorrelationResponse,
  SeasonalPatternResponse,
} from '@/types/analytics'

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

function useFetch<T>(url: string, params?: Record<string, string>): FetchState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const paramsKey = JSON.stringify(params ?? {})

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const query = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.set(k, v)
      })
    }
    const fullUrl = query.toString() ? `${url}?${query}` : url

    fetch(fullUrl)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (!json.success) throw new Error(json.error ?? 'Unknown error')
        return json.data as T
      })
      .then((d) => {
        if (!cancelled) {
          setData(d)
          setLoading(false)
        }
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setError(e.message)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, paramsKey, tick])

  return { data, loading, error, refetch: () => setTick((t) => t + 1) }
}

// ── KPI hooks ───────────────────────────────────────────────

export function useKpiSummary(days?: number, province?: string) {
  return useFetch<KpiSummaryResponse>('/api/analytics/kpis/summary', {
    ...(days !== undefined ? { days: String(days) } : {}),
    ...(province ? { province } : {}),
  })
}

export function useProvinceDemand(days?: number) {
  return useFetch<ProvinceDemandResponse>('/api/analytics/kpis/province-demand', {
    ...(days !== undefined ? { days: String(days) } : {}),
  })
}

export function useCategoryStockoutRisk() {
  return useFetch<CategoryStockoutRiskResponse>(
    '/api/analytics/kpis/category-stockout-risk'
  )
}

// ── Chart hooks ─────────────────────────────────────────────

export function useSalesTrend(days?: number, drugId?: string, province?: string) {
  return useFetch<SalesTrendResponse>('/api/analytics/charts/sales-trend', {
    ...(days !== undefined ? { days: String(days) } : {}),
    ...(drugId ? { drug_id: drugId } : {}),
    ...(province ? { province } : {}),
  })
}

export function useTopDrugs(top?: number, days?: number, province?: string) {
  return useFetch<TopDrugsResponse>('/api/analytics/charts/top-drugs', {
    ...(top !== undefined ? { top: String(top) } : {}),
    ...(days !== undefined ? { days: String(days) } : {}),
    ...(province ? { province } : {}),
  })
}

export function useDrugTypeBreakdown(days?: number, province?: string) {
  return useFetch<DrugTypeBreakdownResponse>(
    '/api/analytics/charts/drug-type-breakdown',
    {
      ...(days !== undefined ? { days: String(days) } : {}),
      ...(province ? { province } : {}),
    }
  )
}

export function useRiskDistribution(province?: string) {
  return useFetch<RiskDistributionResponse>(
    '/api/analytics/charts/risk-distribution',
    { ...(province ? { province } : {}) }
  )
}

export function useStockStatus(province?: string, thresholdDays?: number) {
  return useFetch<StockStatusResponse>('/api/analytics/charts/stock-status', {
    ...(province ? { province } : {}),
    ...(thresholdDays !== undefined ? { threshold_days: String(thresholdDays) } : {}),
  })
}

export function useRiskHeatmap(province?: string) {
  return useFetch<RiskHeatmapResponse>('/api/analytics/charts/risk-heatmap', {
    ...(province ? { province } : {}),
  })
}

export function usePharmacyMap(province?: string, riskLevel?: string) {
  return useFetch<PharmacyMapResponse>('/api/analytics/charts/pharmacy-map', {
    ...(province ? { province } : {}),
    ...(riskLevel ? { risk_level: riskLevel } : {}),
  })
}

export function useDiseaseDemandCorrelation(
  days?: number,
  province?: string,
  disease?: string
) {
  return useFetch<DiseaseDemandCorrelationResponse>(
    '/api/analytics/charts/disease-demand-correlation',
    {
      ...(days !== undefined ? { days: String(days) } : {}),
      ...(province ? { province } : {}),
      ...(disease ? { disease } : {}),
    }
  )
}

export function useSeasonalPattern(province?: string) {
  return useFetch<SeasonalPatternResponse>(
    '/api/analytics/charts/seasonal-pattern',
    { ...(province ? { province } : {}) }
  )
}
