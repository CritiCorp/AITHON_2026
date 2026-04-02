// ================================================================
// Cargo Tracking Types — vehicle tracking and inventory management
// ================================================================

export interface Invoice {
  id: string;
  invoice_number: string;
  created_at: string;
  total_amount: number;
  status: "pending" | "completed" | "shipped";
  items: InvoiceItem[];
}

export interface InvoiceItem {
  drug_id: string;
  drug_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
}

export type VehicleType = "plane" | "ship";

export interface CargoTracking {
  id: string;
  vehicle_id: string;
  vehicle_type: VehicleType;
  invoice_id: string;
  created_at: string;
  updated_at: string;
  status: "in_transit" | "delivered" | "delayed";
  current_location: {
    lat: number;
    lng: number;
    timestamp: string;
  };
  destination?: {
    lat: number;
    lng: number;
  };
  route?: Array<{
    lat: number;
    lng: number;
    timestamp: string;
  }>;
  inventory: {
    drug_id: string;
    drug_name: string;
    quantity: number;
    unit: string;
  }[];
}

export interface CargoTrackingRequest {
  vehicle_id: string;
  vehicle_type: VehicleType;
  invoice_id: string;
  current_location: {
    lat: number;
    lng: number;
  };
  destination?: {
    lat: number;
    lng: number;
  };
}

export interface CargoTrackingResponse {
  success: boolean;
  data?: CargoTracking;
  error?: string;
}
