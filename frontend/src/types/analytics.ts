/**
 * TypeScript interfaces for all /api/analytics/* endpoint responses.
 * Mirrors the ENDPOINTS.md contract exactly.
 */

export interface DateRange {
  from: string
  to: string
}

// ── KPI Endpoints ─────────────────────────────────────────────

export interface TopSellingDrug {
  drug_id: number
  drug_name: string
  units_sold: number
  revenue_lkr: number
}

export interface KpiSummaryResponse {
  total_units_sold: number
  total_revenue_lkr: number
  top_selling_drugs: TopSellingDrug[]
  low_stock_count: number
  critical_risk_count: number
  date_range: DateRange
  province_filter: string | null
}

export interface ProvinceDemandItem {
  province: string
  units_sold: number
  revenue_lkr: number
  pharmacy_count: number
}

export interface ProvinceDemandResponse {
  provinces: ProvinceDemandItem[]
  date_range: DateRange
}

export interface CategoryStockoutItem {
  atc_category: string
  total_skus: number
  below_reorder: number
  risk_pct: number
}

export interface CategoryStockoutRiskResponse {
  categories: CategoryStockoutItem[]
  snapshot_date: string
}

// ── Chart Endpoints ───────────────────────────────────────────

export interface SalesTrendPoint {
  date: string
  units_sold: number
  revenue_lkr: number
}

export interface SalesTrendResponse {
  series: SalesTrendPoint[]
  drug_name: string
  province: string
  date_range: DateRange
}

export interface TopDrugItem {
  drug_id: number
  drug_name: string
  atc_category: string
  units_sold: number
  revenue_lkr: number
}

export interface TopDrugsResponse {
  drugs: TopDrugItem[]
  date_range: DateRange
  province_filter: string | null
}

export interface DrugTypeWeekPoint {
  week: string
  chronic_units: number
  seasonal_units: number
  chronic_seasonal_units: number
  other_units: number
}

export interface DrugTypeBreakdownResponse {
  series: DrugTypeWeekPoint[]
  date_range: DateRange
  province_filter: string | null
}

export interface RiskDistributionItem {
  risk_level: 'critical' | 'high' | 'medium' | 'low'
  count: number
  pct: number
}

export interface RiskDistributionResponse {
  distribution: RiskDistributionItem[]
  total: number
  as_of_date: string
  province_filter: string | null
}

export interface StockStatusItem {
  drug_id: number
  drug_name: string
  atc_category: string
  is_chronic: boolean
  is_seasonal: boolean
  avg_stock_days: number
  min_stock_days: number
  pharmacies_below_threshold: number
  total_pharmacies: number
}

export interface StockStatusResponse {
  items: StockStatusItem[]
  threshold_days: number
  snapshot_date: string
  province_filter: string | null
}

export interface RiskHeatmapItem {
  province: string
  low: number
  medium: number
  high: number
  critical: number
  avg_risk_score: number
}

export interface RiskHeatmapResponse {
  heatmap: RiskHeatmapItem[]
  as_of_date: string
}

export interface PharmacyMapItem {
  pharmacy_id: number
  pharmacy_name: string
  province: string
  district: string
  lat: number
  lon: number
  pharmacy_type: string
  is_urban: boolean
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  risk_score: number
  recommended_reorder_units: number
}

export interface PharmacyMapResponse {
  pharmacies: PharmacyMapItem[]
  as_of_date: string
  province_filter: string | null
  risk_level_filter: string | null
}

export interface DiseaseDemandPoint {
  date: string
  province: string
  disease_name: string
  reported_cases: number
  affected_atc: string
  shock_multiplier: number
  units_sold: number
}

export interface DiseaseDemandCorrelationResponse {
  points: DiseaseDemandPoint[]
  date_range: DateRange
  province_filter: string | null
  disease_filter: string | null
}

export interface SeasonItem {
  climate_season: 'NE_MONSOON' | 'FIM' | 'SW_MONSOON' | 'SIM'
  total_days: number
  total_units: number
  avg_units_per_day: number
}

export interface SeasonalPatternResponse {
  seasons: SeasonItem[]
  province_filter: string | null
}

export interface ExpiryTimelineItem {
  drug_name: string
  atc_category: string
  expiry_bucket: 'expired' | '0-7 days' | '7-30 days' | '30-90 days' | '90+ days'
  nearest_expiry: string
  total_units: number
  pharmacy_count: number
}

export interface ExpiryTimelineResponse {
  items: ExpiryTimelineItem[]
  province_filter: string | null
  days_ahead: number
  as_of_date: string
}
