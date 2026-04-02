"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { ChevronDown, Package } from "lucide-react";
import { AddCargoTrackingModal } from "./AddCargoTrackingModal";
import { CargoInfoDialog } from "./CargoInfoDialog";
import { CargoTracking } from "@/types/cargo-tracking";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCargoModalOpen, setIsCargoModalOpen] = useState(false);
  const [cargoTrackingEnabled, setCargoTrackingEnabled] = useState(true);
  const [cargoList, setCargoList] = useState<CargoTracking[]>([]);
  const [selectedCargo, setSelectedCargo] = useState<CargoTracking | null>(null);
  const [selectedCargoRoute, setSelectedCargoRoute] = useState<CargoTracking | null>(null);
  const [loadingCargo, setLoadingCargo] = useState(false);

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

  // Fetch cargo tracking data
  const fetchCargoTracking = async () => {
    try {
      setLoadingCargo(true);
      const response = await fetch("/api/cargo-tracking");
      const result = await response.json();
      if (result.success) {
        setCargoList(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch cargo tracking:", error);
    } finally {
      setLoadingCargo(false);
    }
  };

  useEffect(() => {
    fetchCargoTracking();
  }, []);

  // Add cargo tracking layer to map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !cargoTrackingEnabled) return;

    // Remove existing cargo layers if they exist
    if (map.getLayer("cargo-routes")) {
      map.removeLayer("cargo-routes");
    }
    if (map.getSource("cargo-routes")) {
      map.removeSource("cargo-routes");
    }
    if (map.getLayer("cargo-vehicles")) {
      map.removeLayer("cargo-vehicles");
    }
    if (map.getSource("cargo-vehicles")) {
      map.removeSource("cargo-vehicles");
    }

    // Create feature collection for routes (only if a route is selected)
    const routeFeatures: GeoJSON.Feature[] = [];
    if (selectedCargoRoute?.route) {
      routeFeatures.push({
        type: "Feature",
        properties: { cargoId: selectedCargoRoute.id },
        geometry: {
          type: "LineString",
          coordinates: selectedCargoRoute.route.map((point) => [point.lng, point.lat]),
        },
      });
    }

    // Create feature collection for vehicles
    const vehicleFeatures: GeoJSON.Feature[] = cargoList.map((cargo) => ({
      type: "Feature",
      properties: {
        id: cargo.id,
        vehicle_id: cargo.vehicle_id,
        vehicle_type: cargo.vehicle_type,
        status: cargo.status,
      },
      geometry: {
        type: "Point",
        coordinates: [cargo.current_location.lng, cargo.current_location.lat],
      },
    }));

    // Add route source and layer
    if (routeFeatures.length > 0) {
      map.addSource("cargo-routes", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: routeFeatures,
        },
      });

      map.addLayer({
        id: "cargo-routes",
        type: "line",
        source: "cargo-routes",
        paint: {
          "line-color": "#06b6d4",
          "line-width": 2,
          "line-opacity": 0.7,
          "line-dasharray": [5, 5],
        },
      });
    }

    // Add vehicle source and layer
    map.addSource("cargo-vehicles", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: vehicleFeatures,
      },
    });

    map.addLayer({
      id: "cargo-vehicles",
      type: "circle",
      source: "cargo-vehicles",
      paint: {
        "circle-color": ["case", ["==", ["get", "vehicle_type"], "plane"], "#f59e0b", "#10b981"],
        "circle-radius": 10,
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 2,
        "circle-opacity": 0.9,
      },
    });

    // Add hover effect
    map.on("mouseenter", "cargo-vehicles", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "cargo-vehicles", () => {
      map.getCanvas().style.cursor = "";
    });

    // Handle click on vehicles
    map.on("click", "cargo-vehicles", (event) => {
      const feature = event.features?.[0];
      if (!feature) return;
      const cargoId = String(feature.properties?.id);
      const cargo = cargoList.find((c) => c.id === cargoId);
      if (cargo) {
        setSelectedCargo(cargo);
        setSelectedCargoRoute(cargo);
      }
    });
  }, [cargoTrackingEnabled, cargoList, selectedCargoRoute?.id]);

  // Initial map setup
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

  const handleCargoTrackingSubmit = () => {
    setIsCargoModalOpen(false);
    fetchCargoTracking();
  };

  return (
    <div className={className}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="h-full min-h-[320px] w-full" />

      {/* Top-Left Menu */}
      <div className="absolute top-4 left-4 z-40">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white hover:bg-slate-800 transition-colors"
        >
          <Package size={18} />
          <span>Overlays</span>
          <ChevronDown size={16} className={`transition-transform ${isMenuOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-12 left-0 mt-2 w-48 bg-slate-900 border border-slate-600 rounded-lg shadow-lg overflow-hidden z-50">
            <button
              onClick={() => {
                setIsCargoModalOpen(true);
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors text-white flex items-center gap-2"
            >
              <Package size={16} />
              <span>Add Cargo Tracking</span>
            </button>

            <div className="border-t border-slate-700">
              <label className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={cargoTrackingEnabled}
                  onChange={(e) => setCargoTrackingEnabled(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-white text-sm">Show Cargo Tracking</span>
              </label>
            </div>

            {cargoTrackingEnabled && cargoList.length > 0 && (
              <div className="border-t border-slate-700 max-h-40 overflow-y-auto">
                <div className="px-4 py-2 bg-slate-800 text-xs text-slate-400 font-semibold">
                  Active Shipments ({cargoList.length})
                </div>
                {cargoList.map((cargo) => (
                  <button
                    key={cargo.id}
                    onClick={() => {
                      setSelectedCargoRoute(cargo);
                      setSelectedCargo(cargo);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-700 transition-colors text-xs text-slate-300 border-b border-slate-700 last:border-b-0"
                  >
                    <div className="font-medium text-white">{cargo.vehicle_id}</div>
                    <div className="text-slate-500">{cargo.vehicle_type}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddCargoTrackingModal
        isOpen={isCargoModalOpen}
        onClose={() => setIsCargoModalOpen(false)}
        onSubmit={handleCargoTrackingSubmit}
      />

      <CargoInfoDialog
        cargo={selectedCargo}
        onClose={() => {
          setSelectedCargo(null);
          setSelectedCargoRoute(null);
        }}
      />
    </div>
  );
}
