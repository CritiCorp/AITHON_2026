"use client";

import { useEffect, useMemo, useRef } from "react";
import maplibregl from "maplibre-gl";

export type MapPoint = {
  id: string;
  name: string;
  lng: number;
  lat: number;
  detail?: string;
};

type SriLankaInteractiveMapProps = {
  points?: MapPoint[];
  className?: string;
};

const DEFAULT_POINTS: MapPoint[] = [
  {
    id: "colombo-hub",
    name: "Colombo Regional Hub",
    lat: 6.9271,
    lng: 79.8612,
    detail: "Placeholder supply node",
  },
  {
    id: "kandy-hub",
    name: "Kandy Distribution Point",
    lat: 7.2906,
    lng: 80.6337,
    detail: "Placeholder supply node",
  },
  {
    id: "galle-hub",
    name: "Galle Distribution Point",
    lat: 6.0535,
    lng: 80.221,
    detail: "Placeholder supply node",
  },
];

export function SriLankaInteractiveMap({ points = DEFAULT_POINTS, className }: SriLankaInteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const pointFeatureCollection = useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: "FeatureCollection",
      features: points.map((point) => ({
        type: "Feature",
        properties: {
          id: point.id,
          name: point.name,
          detail: point.detail ?? "No details provided",
        },
        geometry: {
          type: "Point",
          coordinates: [point.lng, point.lat],
        },
      })),
    }),
    [points],
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "osm-tiles",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [80.7718, 7.8731],
      zoom: 7,
      minZoom: 1,
      maxZoom: 14,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

    map.on("load", () => {
      map.resize();

      map.addSource("supply-points", {
        type: "geojson",
        data: pointFeatureCollection,
      });

      map.addLayer({
        id: "supply-point-circles",
        type: "circle",
        source: "supply-points",
        paint: {
          "circle-color": "#0ea5e9",
          "circle-stroke-color": "#082f49",
          "circle-stroke-width": 2,
          "circle-radius": 7,
        },
      });

      map.on("mouseenter", "supply-point-circles", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "supply-point-circles", () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("click", "supply-point-circles", (event) => {
        const feature = event.features?.[0];
        if (!feature || feature.geometry.type !== "Point") return;

        const coordinates = feature.geometry.coordinates as [number, number];
        const name = String(feature.properties?.name ?? "Location");
        const detail = String(feature.properties?.detail ?? "");

        new maplibregl.Popup({ offset: 12 })
          .setLngLat(coordinates)
          .setHTML(`<strong>${name}</strong><br/>${detail}`)
          .addTo(map);
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [pointFeatureCollection]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const source = map.getSource("supply-points") as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    source.setData(pointFeatureCollection);
  }, [pointFeatureCollection]);

  return (
    <div className={className}>
      <div ref={mapContainerRef} className="h-full min-h-[320px] w-full" />
    </div>
  );
}
