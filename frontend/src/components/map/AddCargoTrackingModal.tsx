"use client";

import { useState, useEffect } from "react";
import { Invoice, VehicleType } from "@/types/cargo-tracking";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AddCargoTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    vehicle_id: string;
    vehicle_type: VehicleType;
    invoice_id: string;
    current_location: { lat: number; lng: number };
  }) => void;
}

export function AddCargoTrackingModal({ isOpen, onClose, onSubmit }: AddCargoTrackingModalProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<string>("");
  const [vehicleId, setVehicleId] = useState<string>("");
  const [vehicleType, setVehicleType] = useState<VehicleType>("plane");
  const [icaoCode, setIcaoCode] = useState<string>("");
  const [aircraftData, setAircraftData] = useState<any>(null);
  const [validatingIcao, setValidatingIcao] = useState(false);
  const [icaoError, setIcaoError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      fetchInvoices();
    }
  }, [isOpen]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/invoices");
      const result = await response.json();
      if (result.success) {
        setInvoices(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
      setError("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  // Validate ICAO code and fetch aircraft data
  const validateAndFetchAircraft = async (code: string) => {
    setIcaoCode(code.toUpperCase());
    setAircraftData(null);
    setIcaoError("");

    if (!code) return;

    // Validate format (6 hex characters)
    if (!/^[0-9A-F]{6}$/i.test(code)) {
      setIcaoError("ICAO code must be 6 hexadecimal characters (e.g., 461E1A)");
      return;
    }

    try {
      setValidatingIcao(true);
      const response = await fetch(`/api/aircraft/${code}`);
      const result = await response.json();

      if (result.success) {
        setAircraftData(result.data);
        setIcaoError("");
      } else {
        setIcaoError(result.error || "Failed to fetch aircraft data");
      }
    } catch (err) {
      console.error("Error validating ICAO code:", err);
      setIcaoError("Error validating ICAO code");
    } finally {
      setValidatingIcao(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!vehicleId.trim()) {
      setError("Please enter a vehicle identifier");
      return;
    }

    if (!selectedInvoice) {
      setError("Please select an invoice");
      return;
    }

    if (vehicleType === "plane") {
      if (!icaoCode.trim()) {
        setError("Please enter ICAO code for the plane");
        return;
      }
      if (!aircraftData) {
        setError("Please validate the ICAO code to get real aircraft location");
        return;
      }
    }

    try {
      setIsSubmitting(true);

      // Use aircraft data if available (for planes), otherwise use default
      const currentLocation = aircraftData
        ? { lat: aircraftData.lat, lng: aircraftData.lon }
        : { lat: 6.9271, lng: 79.8612 };

      const response = await fetch("/api/cargo-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle_id: vehicleId,
          vehicle_type: vehicleType,
          invoice_id: selectedInvoice,
          icao_code: vehicleType === "plane" ? icaoCode : undefined,
          current_location: currentLocation,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSubmit({
          vehicle_id: vehicleId,
          vehicle_type: vehicleType,
          invoice_id: selectedInvoice,
          current_location: currentLocation,
        });
        // Reset form
        setVehicleId("");
        setSelectedInvoice("");
        setVehicleType("plane");
        setIcaoCode("");
        setAircraftData(null);
        setIcaoError("");
        onClose();
      } else {
        setError(result.error || "Failed to add cargo tracking");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-md bg-slate-900 p-6 border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Add Cargo Tracking</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Invoice Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Select Invoice</label>
            {loading ? (
              <div className="text-slate-400 text-sm">Loading invoices...</div>
            ) : (
              <select
                value={selectedInvoice}
                onChange={(e) => setSelectedInvoice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">-- Select an invoice --</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoice_number} (${inv.total_amount.toLocaleString()})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Vehicle ID */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Vehicle Identifier</label>
            <input
              type="text"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              placeholder="e.g., PLANE-777 or SHIP-001"
              className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Vehicle Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Vehicle Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="plane"
                  checked={vehicleType === "plane"}
                  onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                  className="w-4 h-4"
                />
                <span className="text-slate-300">Plane</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="ship"
                  checked={vehicleType === "ship"}
                  onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                  className="w-4 h-4"
                />
                <span className="text-slate-300">Ship</span>
              </label>
            </div>
          </div>

          {/* ICAO Code (for planes) */}
          {vehicleType === "plane" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">ICAO Code (6-digit hex)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={icaoCode}
                  onChange={(e) => validateAndFetchAircraft(e.target.value)}
                  placeholder="e.g., 461E1A"
                  maxLength={6}
                  className="flex-1 px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 uppercase"
                />
                {validatingIcao && (
                  <div className="flex items-center text-slate-400 text-sm">
                    <span>Loading...</span>
                  </div>
                )}
                {aircraftData && <div className="flex items-center text-green-400 text-sm font-medium">✓ Found</div>}
              </div>
              {icaoError && <div className="text-xs text-red-400">{icaoError}</div>}

              {/* Aircraft Details */}
              {aircraftData && (
                <div className="mt-3 p-3 bg-slate-800 rounded-md border border-green-700/30">
                  <h4 className="text-sm font-semibold text-green-400 mb-2">✈️ Aircraft Found</h4>
                  <div className="space-y-1 text-xs text-slate-300">
                    {aircraftData.desc && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Aircraft:</span>
                        <span className="font-medium">{aircraftData.desc}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Callsign:</span>
                      <span className="font-medium">{aircraftData.callsign || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Registration:</span>
                      <span className="font-medium">{aircraftData.reg || "N/A"}</span>
                    </div>
                    {aircraftData.squawk && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Squawk:</span>
                        <span className="font-medium font-mono">{aircraftData.squawk}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-700 my-1 pt-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Current Location:</span>
                        <span className="font-medium text-sky-300">
                          {aircraftData.lat?.toFixed(4)}°, {aircraftData.lon?.toFixed(4)}°
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Altitude:</span>
                      <span className="font-medium">
                        {aircraftData.alt_baro ? `${aircraftData.alt_baro} ft` : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ground Speed:</span>
                      <span className="font-medium">{aircraftData.gs ? `${aircraftData.gs} kts` : "N/A"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Invoice Details */}
          {selectedInvoice && (
            <div className="mt-4 p-3 bg-slate-800 rounded-md border border-slate-700">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Invoice Items:</h4>
              <div className="space-y-1 text-xs text-slate-400">
                {invoices
                  .find((i) => i.id === selectedInvoice)
                  ?.items.map((item) => (
                    <div key={item.drug_id} className="flex justify-between">
                      <span>{item.drug_name}</span>
                      <span>
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-2 bg-red-900 bg-opacity-30 border border-red-700 rounded-md text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1 border-slate-600">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-sky-600 hover:bg-sky-700">
              {isSubmitting ? "Adding..." : "Add Cargo"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
