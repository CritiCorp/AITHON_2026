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
          flatBase: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap contributors",
          },
          terrestrialBase: {
            type: "raster",
            tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"],
            tileSize: 256,
            attribution: "Tiles &copy; Esri &mdash; Source: Esri, USGS, NOAA",
          },
        },
        layers: [
          {
            id: "flat-base-tiles",
            type: "raster",
            source: "flatBase",
            minzoom: 0,
            maxzoom: 19,
          },
          {
            id: "terrestrial-base-tiles",
            type: "raster",
            source: "terrestrialBase",
            minzoom: 0,
            maxzoom: 19,
            layout: {
              visibility: "none",
            },
          },
        ],
      },
      center: [80.7718, 7.8731],
      zoom: 7,
      minZoom: 0,
      maxZoom: 14,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

    map.on("load", () => {
      map.resize();

      const setBasemap = (mode: "flat" | "terrestrial") => {
        map.setLayoutProperty("flat-base-tiles", "visibility", mode === "flat" ? "visible" : "none");
        map.setLayoutProperty("terrestrial-base-tiles", "visibility", mode === "terrestrial" ? "visible" : "none");
      };

      class BasemapControl implements maplibregl.IControl {
        private container?: HTMLDivElement;

        onAdd() {
          const container = document.createElement("div");
          container.className = "maplibregl-ctrl maplibregl-ctrl-group";
          container.style.padding = "6px";
          container.style.background = "rgba(15, 23, 42, 0.88)";

          const select = document.createElement("select");
          select.setAttribute("aria-label", "Basemap style");
          select.style.background = "transparent";
          select.style.color = "#e2e8f0";
          select.style.border = "0";
          select.style.outline = "none";
          select.style.fontSize = "12px";
          select.style.padding = "2px 4px";
          select.innerHTML = '<option value="flat">Flat (OSM)</option><option value="terrestrial">Terrestrial</option>';

          select.addEventListener("change", (event) => {
            const value = (event.target as HTMLSelectElement).value as "flat" | "terrestrial";
            setBasemap(value);
          });

          container.appendChild(select);
          this.container = container;
          return container;
        }

        onRemove() {
          if (this.container?.parentNode) {
            this.container.parentNode.removeChild(this.container);
          }
          this.container = undefined;
        }
      }

      map.addControl(new BasemapControl(), "top-right");

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
