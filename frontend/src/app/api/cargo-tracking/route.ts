import { NextRequest, NextResponse } from "next/server";
import { CargoTracking, CargoTrackingRequest } from "@/types/cargo-tracking";

// In-memory store for cargo tracking data
const cargoTrackingStore: Map<string, CargoTracking> = new Map();

// Mock data: sample cargo tracking entries
const mockCargoData: CargoTracking[] = [
  {
    id: "cargo-001",
    vehicle_id: "PLANE-777",
    vehicle_type: "plane",
    invoice_id: "INV-2026-001",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    status: "in_transit",
    current_location: {
      lat: 6.9271,
      lng: 79.8612,
      timestamp: new Date().toISOString(),
    },
    destination: {
      lat: 7.2906,
      lng: 80.6337,
    },
    route: [
      { lat: 6.8, lng: 79.7, timestamp: new Date(Date.now() - 7200000).toISOString() },
      { lat: 6.85, lng: 79.75, timestamp: new Date(Date.now() - 3600000).toISOString() },
      { lat: 6.9, lng: 79.8, timestamp: new Date(Date.now() - 1800000).toISOString() },
      { lat: 6.9271, lng: 79.8612, timestamp: new Date().toISOString() },
    ],
    inventory: [
      { drug_id: "PARA-001", drug_name: "Paracetamol 500mg", quantity: 5000, unit: "tablets" },
      { drug_id: "IBPR-001", drug_name: "Ibuprofen 400mg", quantity: 3000, unit: "tablets" },
    ],
  },
];

// Initialize with mock data
mockCargoData.forEach((cargo) => {
  cargoTrackingStore.set(cargo.id, cargo);
});

export async function POST(request: NextRequest) {
  try {
    const body: CargoTrackingRequest = await request.json();

    const cargoId = `cargo-${Date.now()}`;
    const newCargo: CargoTracking = {
      id: cargoId,
      vehicle_id: body.vehicle_id,
      vehicle_type: body.vehicle_type,
      invoice_id: body.invoice_id,
      icao_code: body.icao_code,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: "in_transit",
      current_location: {
        lat: body.current_location.lat,
        lng: body.current_location.lng,
        timestamp: new Date().toISOString(),
      },
      destination: body.destination,
      route: [
        {
          lat: body.current_location.lat,
          lng: body.current_location.lng,
          timestamp: new Date().toISOString(),
        },
      ],
      inventory: [],
    };

    cargoTrackingStore.set(cargoId, newCargo);

    return NextResponse.json({
      success: true,
      data: newCargo,
    });
  } catch (error) {
    console.error("Error creating cargo tracking:", error);
    return NextResponse.json({ success: false, error: "Failed to create cargo tracking" }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const cargoList = Array.from(cargoTrackingStore.values());
    return NextResponse.json({
      success: true,
      data: cargoList,
    });
  } catch (error) {
    console.error("Error fetching cargo tracking:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch cargo tracking" }, { status: 500 });
  }
}
