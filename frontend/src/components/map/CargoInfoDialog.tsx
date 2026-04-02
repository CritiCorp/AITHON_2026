"use client";

import { CargoTracking } from "@/types/cargo-tracking";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

interface CargoInfoDialogProps {
  cargo: CargoTracking | null;
  onClose: () => void;
}

export function CargoInfoDialog({ cargo, onClose }: CargoInfoDialogProps) {
  if (!cargo) return null;

  const vehicleIcon = cargo.vehicle_type === "plane" ? "✈️" : "🚢";
  const statusColors = {
    in_transit: "bg-blue-900 text-blue-200",
    delivered: "bg-green-900 text-green-200",
    delayed: "bg-red-900 text-red-200",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-md bg-slate-900 border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{vehicleIcon}</span>
            <div>
              <h2 className="font-bold text-white">{cargo.vehicle_id}</h2>
              <p className="text-xs text-slate-400">{cargo.vehicle_type}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Status:</span>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[cargo.status]}`}>
              {cargo.status.replace("_", " ").toUpperCase()}
            </span>
          </div>

          {/* Current Location */}
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">Current Location</h3>
            <div className="bg-slate-800 p-3 rounded text-sm text-slate-300 space-y-1">
              <p>
                <span className="text-slate-400">Latitude:</span> {cargo.current_location.lat.toFixed(4)}°
              </p>
              <p>
                <span className="text-slate-400">Longitude:</span> {cargo.current_location.lng.toFixed(4)}°
              </p>
              <p className="text-xs text-slate-500">
                Updated: {new Date(cargo.current_location.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Destination */}
          {cargo.destination && (
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">Destination</h3>
              <div className="bg-slate-800 p-3 rounded text-sm text-slate-300 space-y-1">
                <p>
                  <span className="text-slate-400">Latitude:</span> {cargo.destination.lat.toFixed(4)}°
                </p>
                <p>
                  <span className="text-slate-400">Longitude:</span> {cargo.destination.lng.toFixed(4)}°
                </p>
              </div>
            </div>
          )}

          {/* Inventory */}
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">Cargo Contents</h3>
            <div className="bg-slate-800 p-3 rounded space-y-2">
              {cargo.inventory.length > 0 ? (
                cargo.inventory.map((item) => (
                  <div key={item.drug_id} className="flex justify-between items-start text-xs">
                    <div>
                      <p className="text-white font-medium">{item.drug_name}</p>
                      <p className="text-slate-400">{item.drug_id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sky-300 font-medium">{item.quantity.toLocaleString()}</p>
                      <p className="text-slate-400">{item.unit}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs italic">No inventory items</p>
              )}
            </div>
          </div>

          {/* Route Info */}
          {cargo.route && cargo.route.length > 0 && (
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">Journey Progress</h3>
              <div className="bg-slate-800 p-3 rounded text-xs">
                <p className="text-slate-300">{cargo.route.length} waypoints tracked</p>
                <p className="text-slate-500 mt-1">
                  Started: {new Date(cargo.route[0].timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-slate-500 border-t border-slate-700 pt-3">
            <p>Invoice: {cargo.invoice_id}</p>
            <p>Created: {new Date(cargo.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800 p-4 border-t border-slate-700">
          <Button onClick={onClose} className="w-full bg-sky-600 hover:bg-sky-700">
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
