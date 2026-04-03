'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import { Layers, Eye, EyeOff, X, Activity } from 'lucide-react'
import { SRI_LANKA_PROVINCES, PROVINCE_CENTROIDS } from '@/lib/sri-lanka-provinces'
import type { PharmacyMapItem, RiskHeatmapItem, ProvinceDemandItem } from '@/types/analytics'
import { cn } from '@/lib/utils'

// ── Types ───────────────────────────────────────────────────────

type OverlayMode = 'risk' | 'demand' | 'stockout' | 'none'

interface AnalyticsMapProps {
  pharmacies: PharmacyMapItem[]
  riskHeatmap: RiskHeatmapItem[]
  provinceDemand: ProvinceDemandItem[]
  loading?: boolean
  className?: string
}

// ── Constants ───────────────────────────────────────────────────

const RISK_DOT_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#f59e0b',
  low:      '#10b981',
}

const OVERLAY_LABELS: Record<OverlayMode, string> = {
  risk:     'Risk Score',
  demand:   'Demand',
  stockout: 'Critical',
  none:     'Off',
}

// ── Build MapLibre color expression based on overlay mode ────────

function buildFillColor(
  mode: OverlayMode,
  maxUnits: number,
  maxCritical: number,
): maplibregl.ExpressionSpecification | string {
  if (mode === 'risk') {
    return [
      'interpolate', ['linear'], ['get', 'avg_risk_score'],
      0,   '#d1fae5',
      20,  '#6ee7b7',
      40,  '#fde68a',
      60,  '#f97316',
      80,  '#ef4444',
      100, '#7f1d1d',
    ] as maplibregl.ExpressionSpecification
  }
  if (mode === 'demand') {
    const cap = Math.max(maxUnits, 1)
    return [
      'interpolate', ['linear'], ['get', 'units_sold'],
      0,          '#eff6ff',
      cap * 0.20, '#bfdbfe',
      cap * 0.45, '#60a5fa',
      cap * 0.70, '#2563eb',
      cap,        '#1e3a8a',
    ] as maplibregl.ExpressionSpecification
  }
  if (mode === 'stockout') {
    const cap = Math.max(maxCritical, 1)
    return [
      'interpolate', ['linear'], ['get', 'critical_count'],
      0,          '#d1fae5',
      cap * 0.20, '#fde68a',
      cap * 0.50, '#f97316',
      cap,        '#991b1b',
    ] as maplibregl.ExpressionSpecification
  }
  return '#1e293b'
}

// ── Legend rows per mode ─────────────────────────────────────────

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-3 w-5 flex-shrink-0 rounded-sm" style={{ background: color }} />
      <span className="text-xs text-slate-300">{label}</span>
    </div>
  )
}

function OverlayLegend({ mode }: { mode: OverlayMode }) {
  if (mode === 'risk') return (
    <div className="space-y-1">
      <p className="mb-2 text-xs font-semibold text-slate-200 uppercase tracking-wide">Avg Risk Score</p>
      <LegendRow color="#d1fae5" label="0 — Minimal" />
      <LegendRow color="#6ee7b7" label="20 — Low" />
      <LegendRow color="#fde68a" label="40 — Medium" />
      <LegendRow color="#f97316" label="60 — High" />
      <LegendRow color="#ef4444" label="80 — Critical" />
      <LegendRow color="#7f1d1d" label="100 — Extreme" />
    </div>
  )
  if (mode === 'demand') return (
    <div className="space-y-1">
      <p className="mb-2 text-xs font-semibold text-slate-200 uppercase tracking-wide">Units Sold</p>
      <LegendRow color="#eff6ff" label="Lowest" />
      <LegendRow color="#bfdbfe" label="Low" />
      <LegendRow color="#60a5fa" label="Medium" />
      <LegendRow color="#2563eb" label="High" />
      <LegendRow color="#1e3a8a" label="Highest" />
    </div>
  )
  if (mode === 'stockout') return (
    <div className="space-y-1">
      <p className="mb-2 text-xs font-semibold text-slate-200 uppercase tracking-wide">Critical Pharmacies</p>
      <LegendRow color="#d1fae5" label="None" />
      <LegendRow color="#fde68a" label="Few" />
      <LegendRow color="#f97316" label="Moderate" />
      <LegendRow color="#991b1b" label="Many" />
    </div>
  )
  return (
    <div className="space-y-1">
      <p className="mb-2 text-xs font-semibold text-slate-200 uppercase tracking-wide">Pharmacy Risk</p>
      <LegendRow color="#10b981" label="Low" />
      <LegendRow color="#f59e0b" label="Medium" />
      <LegendRow color="#f97316" label="High" />
      <LegendRow color="#ef4444" label="Critical" />
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────

export function AnalyticsMap({
  pharmacies,
  riskHeatmap,
  provinceDemand,
  loading = false,
  className,
}: AnalyticsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const hoveredIdRef = useRef<number | string | null>(null)

  const [mapLoaded, setMapLoaded] = useState(false)
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('risk')
  const [showPharmacies, setShowPharmacies] = useState(true)
  const [showPulse, setShowPulse] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)

  // ── Derived data ────────────────────────────────────────────

  const riskByProvince = useMemo(
    () => Object.fromEntries(riskHeatmap.map((r) => [r.province, r])),
    [riskHeatmap],
  )
  const demandByProvince = useMemo(
    () => Object.fromEntries(provinceDemand.map((d) => [d.province, d])),
    [provinceDemand],
  )
  const maxUnits = useMemo(
    () => Math.max(...provinceDemand.map((d) => d.units_sold), 1),
    [provinceDemand],
  )
  const maxCritical = useMemo(
    () => Math.max(...riskHeatmap.map((r) => r.critical), 1),
    [riskHeatmap],
  )

  // Province GeoJSON enriched with analytics properties
  const provinceGeoJSON = useMemo<GeoJSON.FeatureCollection>(() => {
    return {
      type: 'FeatureCollection',
      features: SRI_LANKA_PROVINCES.features.map((f) => {
        const name = f.properties?.province as string
        const risk = riskByProvince[name]
        const demand = demandByProvince[name]
        return {
          ...f,
          properties: {
            ...f.properties,
            avg_risk_score:  risk?.avg_risk_score  ?? 0,
            critical_count:  risk?.critical         ?? 0,
            high_count:      risk?.high             ?? 0,
            medium_count:    risk?.medium           ?? 0,
            low_count:       risk?.low              ?? 0,
            units_sold:      demand?.units_sold     ?? 0,
            revenue_lkr:     demand?.revenue_lkr    ?? 0,
            pharmacy_count:  demand?.pharmacy_count ?? 0,
          },
        }
      }),
    }
  }, [riskByProvince, demandByProvince])

  // Pharmacy GeoJSON — all pharmacies as points
  const pharmacyGeoJSON = useMemo<GeoJSON.FeatureCollection>(() => ({
    type: 'FeatureCollection',
    features: pharmacies.map((p) => ({
      type: 'Feature',
      properties: {
        name:          p.pharmacy_name,
        province:      p.province,
        district:      p.district,
        risk_level:    p.risk_level,
        risk_score:    p.risk_score,
        reorder_units: p.recommended_reorder_units,
        is_urban:      p.is_urban,
        pharmacy_type: p.pharmacy_type,
      },
      geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
    })),
  }), [pharmacies])

  // Critical-only GeoJSON for pulsing layer
  const criticalGeoJSON = useMemo<GeoJSON.FeatureCollection>(() => ({
    type: 'FeatureCollection',
    features: pharmacies
      .filter((p) => p.risk_level === 'critical')
      .map((p) => ({
        type: 'Feature',
        properties: { name: p.pharmacy_name },
        geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
      })),
  }), [pharmacies])

  // Province centroid GeoJSON for labels
  const centroidGeoJSON = useMemo<GeoJSON.FeatureCollection>(() => ({
    type: 'FeatureCollection',
    features: Object.entries(PROVINCE_CENTROIDS).map(([province, coords]) => ({
      type: 'Feature',
      properties: { province },
      geometry: { type: 'Point', coordinates: coords },
    })),
  }), [])

  // ── Map initialisation ──────────────────────────────────────

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          { id: 'osm-tiles', type: 'raster', source: 'osm', minzoom: 0, maxzoom: 19 },
        ],
      },
      center: [80.77, 7.40],
      zoom: 7,
      minZoom: 5,
      maxZoom: 14,
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    map.on('load', () => {
      // ── Province fill + border ─────────────────────────────

      map.addSource('provinces', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        promoteId: 'province', // use province name as feature ID for feature-state
      })

      // Base fill — color driven by overlay mode (updated via setPaintProperty)
      map.addLayer({
        id: 'province-fill',
        type: 'fill',
        source: 'provinces',
        paint: {
          'fill-color': '#d1fae5',
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hovered'], false],
            0.82,
            0.62,
          ],
        },
      })

      // Hover highlight overlay (white tint)
      map.addLayer({
        id: 'province-fill-hover',
        type: 'fill',
        source: 'provinces',
        paint: {
          'fill-color': '#ffffff',
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hovered'], false],
            0.12,
            0,
          ],
        },
      })

      // Province borders — always visible
      map.addLayer({
        id: 'province-border',
        type: 'line',
        source: 'provinces',
        paint: {
          'line-color': '#334155',
          'line-width': 1.5,
          'line-opacity': 0.9,
        },
      })

      // Hover border — brighter on hover
      map.addLayer({
        id: 'province-border-hover',
        type: 'line',
        source: 'provinces',
        paint: {
          'line-color': '#e2e8f0',
          'line-width': 2.5,
          'line-opacity': [
            'case',
            ['boolean', ['feature-state', 'hovered'], false],
            1,
            0,
          ],
        },
      })

      // ── Province labels ────────────────────────────────────

      map.addSource('province-labels', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })

      map.addLayer({
        id: 'province-label',
        type: 'symbol',
        source: 'province-labels',
        layout: {
          'text-field': ['get', 'province'],
          'text-size': 11,
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-max-width': 8,
          'text-anchor': 'center',
        },
        paint: {
          'text-color': '#f8fafc',
          'text-halo-color': '#0f172a',
          'text-halo-width': 1.5,
          'text-opacity': 0.85,
        },
      })

      // ── Pharmacy dots ──────────────────────────────────────

      map.addSource('pharmacies', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })

      map.addLayer({
        id: 'pharmacy-dots',
        type: 'circle',
        source: 'pharmacies',
        paint: {
          'circle-color': [
            'match', ['get', 'risk_level'],
            'critical', '#ef4444',
            'high',     '#f97316',
            'medium',   '#f59e0b',
            'low',      '#10b981',
            '#94a3b8',
          ],
          'circle-radius': [
            'interpolate', ['linear'], ['get', 'risk_score'],
            0,   3,
            30,  4,
            60,  5.5,
            85,  7,
            100, 9,
          ],
          'circle-stroke-color': [
            'match', ['get', 'risk_level'],
            'critical', '#fca5a5',
            'high',     '#fdba74',
            '#0f172a',
          ],
          'circle-stroke-width': [
            'match', ['get', 'risk_level'],
            'critical', 1.5,
            'high', 1,
            0.5,
          ],
          'circle-opacity': 0.88,
        },
      })

      // ── Pulsing dot image for critical pharmacies ──────────

      const PULSE_SIZE = 90
      const pulsingDot = {
        width: PULSE_SIZE,
        height: PULSE_SIZE,
        data: new Uint8Array(PULSE_SIZE * PULSE_SIZE * 4),
        context: null as CanvasRenderingContext2D | null,

        onAdd() {
          const canvas = document.createElement('canvas')
          canvas.width = this.width
          canvas.height = this.height
          this.context = canvas.getContext('2d')
        },

        render() {
          const t = (performance.now() % 1800) / 1800
          const center = this.width / 2
          const coreR = center * 0.18
          const ctx = this.context
          if (!ctx) return false

          ctx.clearRect(0, 0, this.width, this.height)

          // Expanding outer ring
          const ringR = center * 0.62 * t + coreR
          ctx.beginPath()
          ctx.arc(center, center, ringR, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(239, 68, 68, ${0.55 * (1 - t)})`
          ctx.fill()

          // Middle glow
          ctx.beginPath()
          ctx.arc(center, center, coreR * 1.6, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(239, 68, 68, 0.5)'
          ctx.fill()

          // Core dot
          ctx.beginPath()
          ctx.arc(center, center, coreR, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(239, 68, 68, 0.95)'
          ctx.fill()

          // White centre spark
          ctx.beginPath()
          ctx.arc(center, center, coreR * 0.45, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
          ctx.fill()

          this.data = ctx.getImageData(0, 0, this.width, this.height).data
          map.triggerRepaint()
          return true
        },
      }

      map.addImage('pulse-dot', pulsingDot as Parameters<typeof map.addImage>[1], { pixelRatio: 2 })

      map.addSource('critical-pharmacies', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })

      map.addLayer({
        id: 'critical-pulse',
        type: 'symbol',
        source: 'critical-pharmacies',
        layout: {
          'icon-image': 'pulse-dot',
          'icon-size': 1,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      })

      // ── Province hover interactions ────────────────────────

      map.on('mousemove', 'province-fill', (e) => {
        map.getCanvas().style.cursor = 'pointer'
        const feature = e.features?.[0]
        if (!feature) return
        const name = feature.properties?.province as string | undefined
        if (!name) return

        // Clear previous hover state
        if (hoveredIdRef.current !== null) {
          map.setFeatureState(
            { source: 'provinces', id: hoveredIdRef.current },
            { hovered: false },
          )
        }
        map.setFeatureState({ source: 'provinces', id: name }, { hovered: true })
        hoveredIdRef.current = name
      })

      map.on('mouseleave', 'province-fill', () => {
        map.getCanvas().style.cursor = ''
        if (hoveredIdRef.current !== null) {
          map.setFeatureState(
            { source: 'provinces', id: hoveredIdRef.current },
            { hovered: false },
          )
          hoveredIdRef.current = null
        }
      })

      map.on('click', 'province-fill', (e) => {
        const name = e.features?.[0]?.properties?.province as string | undefined
        if (name) setSelectedProvince((prev) => (prev === name ? null : name))
      })

      // ── Pharmacy click popup ───────────────────────────────

      map.on('click', 'pharmacy-dots', (e) => {
        const f = e.features?.[0]
        if (!f || f.geometry.type !== 'Point') return
        const coords = f.geometry.coordinates as [number, number]
        const p = f.properties as Record<string, unknown>
        const riskColor = RISK_DOT_COLORS[p.risk_level as string] ?? '#94a3b8'
        new maplibregl.Popup({ offset: 10, maxWidth: '240px' })
          .setLngLat(coords)
          .setHTML(`
            <div style="font-size:12px;line-height:1.5">
              <div style="font-weight:700;margin-bottom:4px">${p.name}</div>
              <div style="color:#94a3b8">${p.district} · ${p.province}</div>
              <div style="margin-top:6px;display:flex;align-items:center;gap:6px">
                <span style="width:10px;height:10px;border-radius:50%;background:${riskColor};display:inline-block"></span>
                <span style="font-weight:600;color:${riskColor};text-transform:capitalize">${p.risk_level} risk</span>
                <span style="color:#94a3b8">· score ${p.risk_score}</span>
              </div>
              ${p.reorder_units ? `<div style="margin-top:4px;color:#f59e0b">Reorder: ${Number(p.reorder_units).toLocaleString()} units</div>` : ''}
              <div style="margin-top:2px;color:#64748b;font-size:11px">${p.pharmacy_type ?? ''} ${p.is_urban ? '· Urban' : '· Rural'}</div>
            </div>
          `)
          .addTo(map)
        e.stopPropagation()
      })

      map.on('mouseenter', 'pharmacy-dots', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'pharmacy-dots', () => {
        map.getCanvas().style.cursor = ''
      })

      setMapLoaded(true)
    })

    mapRef.current = map
    return () => {
      setMapLoaded(false)
      map.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Update province source data ─────────────────────────────

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return
    const src = map.getSource('provinces') as maplibregl.GeoJSONSource | undefined
    src?.setData(provinceGeoJSON)
    const lbl = map.getSource('province-labels') as maplibregl.GeoJSONSource | undefined
    lbl?.setData(centroidGeoJSON)
  }, [provinceGeoJSON, centroidGeoJSON, mapLoaded])

  // ── Update pharmacy source data ─────────────────────────────

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return
    const pharSrc = map.getSource('pharmacies') as maplibregl.GeoJSONSource | undefined
    pharSrc?.setData(pharmacyGeoJSON)
    const critSrc = map.getSource('critical-pharmacies') as maplibregl.GeoJSONSource | undefined
    critSrc?.setData(criticalGeoJSON)
  }, [pharmacyGeoJSON, criticalGeoJSON, mapLoaded])

  // ── Update province fill colour when overlay mode or data changes ──

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return
    const color = buildFillColor(overlayMode, maxUnits, maxCritical)
    map.setPaintProperty('province-fill', 'fill-color', color)
  }, [overlayMode, maxUnits, maxCritical, mapLoaded])

  // ── Toggle pharmacy layer ───────────────────────────────────

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return
    map.setLayoutProperty('pharmacy-dots', 'visibility', showPharmacies ? 'visible' : 'none')
  }, [showPharmacies, mapLoaded])

  // ── Toggle critical pulse layer ─────────────────────────────

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return
    map.setLayoutProperty('critical-pulse', 'visibility', showPulse && showPharmacies ? 'visible' : 'none')
  }, [showPulse, showPharmacies, mapLoaded])

  // ── Selected province data ──────────────────────────────────

  const selectedData = selectedProvince
    ? {
        risk:   riskByProvince[selectedProvince]   ?? null,
        demand: demandByProvince[selectedProvince] ?? null,
      }
    : null

  // ── Render ──────────────────────────────────────────────────

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Map canvas */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Loading veil */}
      {loading && !mapLoaded && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/70">
          <div className="flex items-center gap-3 rounded-lg border border-slate-600 bg-slate-800/90 px-5 py-3">
            <Activity className="h-4 w-4 animate-pulse text-cyan-400" />
            <span className="text-sm text-slate-200">Loading analytics…</span>
          </div>
        </div>
      )}

      {/* ── Overlay controls (top-left) ────────────────────── */}
      <div className="absolute left-3 top-3 z-20 flex flex-col gap-2">

        {/* Toggle controls visibility button */}
        <button
          onClick={() => setShowControls((v) => !v)}
          className="flex items-center gap-1.5 self-start rounded-md border border-slate-600 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-200 backdrop-blur transition-colors hover:bg-slate-800"
        >
          <Layers className="h-3.5 w-3.5" />
          {showControls ? 'Hide layers' : 'Layers'}
        </button>

        {showControls && (
          <div className="w-52 rounded-lg border border-slate-600 bg-slate-900/92 p-3 backdrop-blur shadow-2xl space-y-3">

            {/* Province overlay mode */}
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Province overlay
              </p>
              <div className="grid grid-cols-2 gap-1">
                {(['risk', 'demand', 'stockout', 'none'] as OverlayMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setOverlayMode(mode)}
                    className={cn(
                      'rounded px-2 py-1 text-[11px] font-medium transition-colors',
                      overlayMode === mode
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700',
                    )}
                  >
                    {OVERLAY_LABELS[mode]}
                  </button>
                ))}
              </div>
            </div>

            {/* Pharmacy dot toggle */}
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Layers
              </p>
              <div className="space-y-1.5">
                <label className="flex cursor-pointer items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-slate-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    Pharmacy dots
                  </span>
                  <button
                    onClick={() => setShowPharmacies((v) => !v)}
                    className={cn(
                      'rounded p-0.5 transition-colors',
                      showPharmacies ? 'text-cyan-400 hover:text-cyan-300' : 'text-slate-500 hover:text-slate-400',
                    )}
                  >
                    {showPharmacies ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                </label>

                <label className="flex cursor-pointer items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-slate-300">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-400" />
                    Critical pulse
                  </span>
                  <button
                    onClick={() => setShowPulse((v) => !v)}
                    disabled={!showPharmacies}
                    className={cn(
                      'rounded p-0.5 transition-colors',
                      !showPharmacies && 'opacity-30',
                      showPulse ? 'text-cyan-400 hover:text-cyan-300' : 'text-slate-500 hover:text-slate-400',
                    )}
                  >
                    {showPulse ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                </label>
              </div>
            </div>

            {/* Stats summary */}
            {pharmacies.length > 0 && (
              <div className="border-t border-slate-700 pt-2 grid grid-cols-2 gap-1.5">
                {(
                  [
                    { label: 'Critical', count: pharmacies.filter(p => p.risk_level === 'critical').length, color: '#ef4444' },
                    { label: 'High',     count: pharmacies.filter(p => p.risk_level === 'high').length,     color: '#f97316' },
                    { label: 'Medium',   count: pharmacies.filter(p => p.risk_level === 'medium').length,   color: '#f59e0b' },
                    { label: 'Low',      count: pharmacies.filter(p => p.risk_level === 'low').length,      color: '#10b981' },
                  ] as { label: string; count: number; color: string }[]
                ).map(({ label, count, color }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: color }} />
                    <span className="text-[11px] text-slate-400">{label}: <span className="font-semibold text-slate-200">{count}</span></span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Legend (bottom-left) ────────────────────────────── */}
      <div className="absolute bottom-8 left-3 z-20 rounded-lg border border-slate-600 bg-slate-900/92 p-3 backdrop-blur shadow-xl min-w-[140px]">
        <OverlayLegend mode={overlayMode} />
      </div>

      {/* ── Province info panel (right side, on click) ───────── */}
      {selectedProvince && selectedData && (
        <div className="absolute right-12 top-3 z-20 w-60 rounded-lg border border-slate-600 bg-slate-900/96 p-4 backdrop-blur shadow-2xl">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-100">{selectedProvince}</h3>
              <p className="text-xs text-slate-400">Province details</p>
            </div>
            <button
              onClick={() => setSelectedProvince(null)}
              className="rounded p-0.5 text-slate-500 hover:text-slate-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Risk score bar */}
          {selectedData.risk && (
            <div className="mb-3">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-slate-400">Avg risk score</span>
                <span className={cn(
                  'font-bold',
                  selectedData.risk.avg_risk_score >= 75 ? 'text-red-400' :
                  selectedData.risk.avg_risk_score >= 50 ? 'text-orange-400' :
                  selectedData.risk.avg_risk_score >= 25 ? 'text-amber-400' : 'text-green-400',
                )}>
                  {selectedData.risk.avg_risk_score.toFixed(1)}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${selectedData.risk.avg_risk_score}%`,
                    background: selectedData.risk.avg_risk_score >= 75 ? '#ef4444' :
                                selectedData.risk.avg_risk_score >= 50 ? '#f97316' :
                                selectedData.risk.avg_risk_score >= 25 ? '#f59e0b' : '#10b981',
                  }}
                />
              </div>
            </div>
          )}

          {/* Risk breakdown */}
          {selectedData.risk && (
            <div className="mb-3 grid grid-cols-2 gap-1.5">
              {([
                { label: 'Critical', value: selectedData.risk.critical, color: '#ef4444' },
                { label: 'High',     value: selectedData.risk.high,     color: '#f97316' },
                { label: 'Medium',   value: selectedData.risk.medium,   color: '#f59e0b' },
                { label: 'Low',      value: selectedData.risk.low,      color: '#10b981' },
              ] as { label: string; value: number; color: string }[]).map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-1.5 rounded bg-slate-800 px-2 py-1">
                  <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: color }} />
                  <span className="text-[11px] text-slate-400">{label}</span>
                  <span className="ml-auto text-[11px] font-bold text-slate-200">{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Demand stats */}
          {selectedData.demand ? (
            <div className="border-t border-slate-700 pt-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Units sold</span>
                <span className="font-semibold text-slate-200">
                  {selectedData.demand.units_sold.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Revenue</span>
                <span className="font-semibold text-slate-200">
                  LKR {(selectedData.demand.revenue_lkr / 1_000_000).toFixed(1)}M
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Pharmacies</span>
                <span className="font-semibold text-slate-200">
                  {selectedData.demand.pharmacy_count}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No demand data</p>
          )}
        </div>
      )}
    </div>
  )
}
