/**
 * Simplified Sri Lanka province boundaries for map choropleth overlays.
 * Polygons are approximate — accurate enough for visualization at zoom 7.
 * Feature IDs (0–8) are required for MapLibre feature-state hover support.
 */

export const SRI_LANKA_PROVINCES: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      id: 0,
      type: 'Feature',
      properties: { province: 'Northern' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[79.65, 8.35], [81.45, 8.35], [81.45, 9.85], [79.65, 9.85], [79.65, 8.35]]],
      },
    },
    {
      id: 1,
      type: 'Feature',
      properties: { province: 'North Western' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[79.65, 7.50], [80.44, 7.50], [80.44, 8.35], [79.65, 8.35], [79.65, 7.50]]],
      },
    },
    {
      id: 2,
      type: 'Feature',
      properties: { province: 'North Central' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.44, 7.75], [81.08, 7.75], [81.08, 8.35], [80.44, 8.35], [80.44, 7.75]]],
      },
    },
    {
      id: 3,
      type: 'Feature',
      properties: { province: 'Eastern' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[81.08, 6.25], [81.92, 6.25], [81.92, 8.35], [81.08, 8.35], [81.08, 6.25]]],
      },
    },
    {
      id: 4,
      type: 'Feature',
      properties: { province: 'Western' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[79.65, 6.08], [80.20, 6.08], [80.20, 7.50], [79.65, 7.50], [79.65, 6.08]]],
      },
    },
    {
      id: 5,
      type: 'Feature',
      properties: { province: 'Central' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.20, 7.00], [81.08, 7.00], [81.08, 7.75], [80.20, 7.75], [80.20, 7.00]]],
      },
    },
    {
      id: 6,
      type: 'Feature',
      properties: { province: 'Sabaragamuwa' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.20, 6.25], [80.62, 6.25], [80.62, 7.00], [80.20, 7.00], [80.20, 6.25]]],
      },
    },
    {
      id: 7,
      type: 'Feature',
      properties: { province: 'Uva' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.62, 6.25], [81.08, 6.25], [81.08, 7.00], [80.62, 7.00], [80.62, 6.25]]],
      },
    },
    {
      id: 8,
      type: 'Feature',
      properties: { province: 'Southern' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[79.65, 5.90], [81.92, 5.90], [81.92, 6.25], [79.65, 6.25], [79.65, 5.90]]],
      },
    },
  ],
}

/** Approximate centroid [lng, lat] for each province label */
export const PROVINCE_CENTROIDS: Record<string, [number, number]> = {
  'Northern':      [80.55, 9.10],
  'North Western': [80.03, 7.90],
  'North Central': [80.76, 8.05],
  'Eastern':       [81.50, 7.30],
  'Western':       [79.92, 6.80],
  'Central':       [80.64, 7.38],
  'Sabaragamuwa':  [80.41, 6.62],
  'Uva':           [80.85, 6.62],
  'Southern':      [80.75, 6.07],
}
