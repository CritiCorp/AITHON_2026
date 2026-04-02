# PharmaCast Analytics API — Endpoint Reference

All endpoints are served from the main FastAPI server (default port **8000**).  
Base path: `/api/analytics`  
Interactive docs: `http://localhost:8000/docs` (tag: **analytics**)

Raw data only — no ML forecast data is used.

---

## KPI Endpoints

### 1. Dashboard Summary
```
GET /api/analytics/kpis/summary
```
**Query params**

| Param      | Type   | Default | Description                        |
|------------|--------|---------|------------------------------------|
| `days`     | int    | 30      | Lookback window (1–365)            |
| `province` | string | —       | Optional province filter           |

**Response**
```json
{
  "total_units_sold": 125000,
  "total_revenue_lkr": 18750000.00,
  "top_selling_drugs": [
    { "drug_id": 1, "drug_name": "Paracetamol 500mg", "units_sold": 34200, "revenue_lkr": 5130000.0 }
  ],
  "low_stock_count": 14,
  "critical_risk_count": 3,
  "date_range": { "from": "2026-03-03", "to": "2026-04-02" },
  "province_filter": null
}
```
**Use for**: KPI summary cards at the top of the dashboard.

---

### 2. Province Demand
```
GET /api/analytics/kpis/province-demand
```
**Query params**

| Param  | Type | Default | Description             |
|--------|------|---------|-------------------------|
| `days` | int  | 30      | Lookback window (1–365) |

**Response**
```json
{
  "provinces": [
    { "province": "Western", "units_sold": 45000, "revenue_lkr": 6750000.0, "pharmacy_count": 12 }
  ],
  "date_range": { "from": "2026-03-03", "to": "2026-04-02" }
}
```
**Use for**: Province-level demand bar chart or choropleth background data.

---

### 3. Category Stockout Risk
```
GET /api/analytics/kpis/category-stockout-risk
```
No query params.

**Response**
```json
{
  "categories": [
    { "atc_category": "J01CA", "total_skus": 5, "below_reorder": 2, "risk_pct": 40.0 }
  ],
  "snapshot_date": "2026-04-02"
}
```
**Use for**: ATC category stockout risk bar chart / table.

---

## Chart Endpoints

### 4. Sales Trend (Line Chart)
```
GET /api/analytics/charts/sales-trend
```
**Query params**

| Param      | Type   | Default | Description                    |
|------------|--------|---------|--------------------------------|
| `days`     | int    | 30      | Lookback window (1–365)        |
| `drug_id`  | int    | —       | Optional single drug filter    |
| `province` | string | —       | Optional province filter       |

**Response**
```json
{
  "series": [
    { "date": "2026-03-03", "units_sold": 4200, "revenue_lkr": 630000.0 }
  ],
  "drug_name": "All Drugs",
  "province": "All Provinces",
  "date_range": { "from": "2026-03-03", "to": "2026-04-02" }
}
```
**Use for**: Line chart — daily actual sales over time.

---

### 5. Top Drugs (Bar Chart)
```
GET /api/analytics/charts/top-drugs
```
**Query params**

| Param      | Type   | Default | Description                    |
|------------|--------|---------|--------------------------------|
| `top`      | int    | 10      | Number of results (1–50)       |
| `days`     | int    | 30      | Lookback window (1–365)        |
| `province` | string | —       | Optional province filter       |

**Response**
```json
{
  "drugs": [
    { "drug_id": 1, "drug_name": "Paracetamol 500mg", "atc_category": "N02BE", "units_sold": 34200, "revenue_lkr": 5130000.0 }
  ],
  "date_range": { "from": "2026-03-03", "to": "2026-04-02" },
  "province_filter": null
}
```
**Use for**: Horizontal or vertical bar chart of top N drugs.

---

### 6. Drug Type Breakdown (Stacked Bar)
```
GET /api/analytics/charts/drug-type-breakdown
```
**Query params**

| Param      | Type   | Default | Description                    |
|------------|--------|---------|--------------------------------|
| `days`     | int    | 60      | Lookback window (7–365)        |
| `province` | string | —       | Optional province filter       |

**Response**
```json
{
  "series": [
    {
      "week": "2026-03-31",
      "chronic_units": 12000,
      "seasonal_units": 8500,
      "chronic_seasonal_units": 1200,
      "other_units": 3200
    }
  ],
  "date_range": { "from": "2026-02-01", "to": "2026-04-02" },
  "province_filter": null
}
```
**Use for**: Stacked bar chart — chronic vs seasonal vs other, grouped by week.

---

### 7. Risk Distribution (Pie / Donut)
```
GET /api/analytics/charts/risk-distribution
```
**Query params**

| Param      | Type   | Default | Description              |
|------------|--------|---------|--------------------------|
| `province` | string | —       | Optional province filter |

**Response**
```json
{
  "distribution": [
    { "risk_level": "critical", "count": 8,   "pct": 3.6  },
    { "risk_level": "high",     "count": 30,  "pct": 13.6 },
    { "risk_level": "medium",   "count": 60,  "pct": 27.5 },
    { "risk_level": "low",      "count": 120, "pct": 55.0 }
  ],
  "total": 218,
  "as_of_date": "2026-04-02",
  "province_filter": null
}
```
**Use for**: Pie or donut chart of risk level breakdown.

---

### 8. Stock Status (Gauge / Card)
```
GET /api/analytics/charts/stock-status
```
**Query params**

| Param             | Type   | Default | Description                             |
|-------------------|--------|---------|-----------------------------------------|
| `province`        | string | —       | Optional province filter                |
| `threshold_days`  | float  | 14.0    | Min days before alert (gauge threshold) |

**Response**
```json
{
  "items": [
    {
      "drug_id": 5,
      "drug_name": "Insulin 100IU/mL",
      "atc_category": "A10BA",
      "is_chronic": true,
      "is_seasonal": false,
      "avg_stock_days": 4.2,
      "min_stock_days": 1.1,
      "pharmacies_below_threshold": 3,
      "total_pharmacies": 8
    }
  ],
  "threshold_days": 14.0,
  "snapshot_date": "2026-04-02",
  "province_filter": null
}
```
**Use for**: Gauge cards per drug showing stock days remaining vs threshold.  
Only returns drugs where at least one pharmacy is below `threshold_days`.

---

### 9. Risk Heatmap
```
GET /api/analytics/charts/risk-heatmap
```
**Query params**

| Param      | Type   | Default | Description              |
|------------|--------|---------|--------------------------|
| `province` | string | —       | Optional province filter |

**Response**
```json
{
  "heatmap": [
    { "province": "Western", "low": 45, "medium": 20, "high": 10, "critical": 3, "avg_risk_score": 0.42 }
  ],
  "as_of_date": "2026-04-02"
}
```
**Use for**: Heatmap grid — province (y-axis) × risk level (x-axis).

---

### 10. Pharmacy Risk Map (Geo)
```
GET /api/analytics/charts/pharmacy-map
```
**Query params**

| Param        | Type   | Default | Description                                  |
|--------------|--------|---------|----------------------------------------------|
| `province`   | string | —       | Optional province filter                     |
| `risk_level` | string | —       | Filter: `low` / `medium` / `high` / `critical` |

**Response**
```json
{
  "pharmacies": [
    {
      "pharmacy_id": 12,
      "pharmacy_name": "Colombo Central Pharmacy",
      "province": "Western",
      "district": "Colombo",
      "lat": 6.9271,
      "lon": 79.8612,
      "pharmacy_type": "Chain",
      "is_urban": true,
      "risk_level": "high",
      "risk_score": 0.78,
      "recommended_reorder_units": 500
    }
  ],
  "as_of_date": "2026-04-02",
  "province_filter": null,
  "risk_level_filter": null
}
```
**Use for**: Interactive map with pharmacy pins coloured by risk level.

---

### 11. Disease–Demand Correlation (Scatter)
```
GET /api/analytics/charts/disease-demand-correlation
```
**Query params**

| Param      | Type   | Default | Description                              |
|------------|--------|---------|------------------------------------------|
| `days`     | int    | 90      | Lookback window (7–365)                  |
| `province` | string | —       | Optional province filter                 |
| `disease`  | string | —       | Disease name (e.g. `Dengue Fever`)       |

**Response**
```json
{
  "points": [
    {
      "date": "2026-03-15",
      "province": "Western",
      "disease_name": "Dengue Fever",
      "reported_cases": 2180,
      "affected_atc": "N02BE",
      "shock_multiplier": 1.8,
      "units_sold": 8400
    }
  ],
  "date_range": { "from": "2026-01-02", "to": "2026-04-02" },
  "province_filter": null,
  "disease_filter": null
}
```
**Use for**: Scatter plot — x: `reported_cases`, y: `units_sold`, colour: `disease_name`.

---

### 12. Seasonal Sales Pattern (Bar)
```
GET /api/analytics/charts/seasonal-pattern
```
**Query params**

| Param      | Type   | Default | Description              |
|------------|--------|---------|--------------------------|
| `province` | string | —       | Optional province filter |

**Response**
```json
{
  "seasons": [
    { "climate_season": "SW_MONSOON",  "total_days": 92, "total_units": 583480, "avg_units_per_day": 6342.2 },
    { "climate_season": "NE_MONSOON",  "total_days": 90, "total_units": 433800, "avg_units_per_day": 4820.0 },
    { "climate_season": "FIM",         "total_days": 45, "total_units": 198000, "avg_units_per_day": 4400.0 },
    { "climate_season": "SIM",         "total_days": 45, "total_units": 171000, "avg_units_per_day": 3800.0 }
  ],
  "province_filter": null
}
```
**Season codes**: `NE_MONSOON` (Dec–Feb), `FIM` (Mar–Apr), `SW_MONSOON` (May–Sep), `SIM` (Oct–Nov)  
**Use for**: Bar chart comparing average daily demand by climate season.

---

## Error Responses

All endpoints return standard HTTP errors:

| Code | Meaning                                        |
|------|------------------------------------------------|
| 422  | Invalid query parameter (FastAPI validation)   |
| 500  | Database query failed (detail contains reason) |

---

## Quick Test

```bash
# Health check
curl http://localhost:8000/api/health

# KPI summary (last 30 days, Western Province)
curl "http://localhost:8000/api/analytics/kpis/summary?days=30&province=Western"

# Top 10 drugs
curl "http://localhost:8000/api/analytics/charts/top-drugs?top=10&days=30"

# Pharmacy map (all critical pharmacies)
curl "http://localhost:8000/api/analytics/charts/pharmacy-map?risk_level=critical"

# Disease vs demand scatter (last 90 days)
curl "http://localhost:8000/api/analytics/charts/disease-demand-correlation?days=90"

# Interactive Swagger UI
open http://localhost:8000/docs
```
