import { NextRequest, NextResponse } from "next/server";
import { Invoice } from "@/types/cargo-tracking";

const mockInvoices: Invoice[] = [
  {
    id: "INV-2026-001",
    invoice_number: "INV-2026-001",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    total_amount: 45000,
    status: "pending",
    items: [
      {
        drug_id: "PARA-001",
        drug_name: "Paracetamol 500mg",
        quantity: 5000,
        unit: "tablets",
        unit_price: 5,
      },
      {
        drug_id: "IBPR-001",
        drug_name: "Ibuprofen 400mg",
        quantity: 3000,
        unit: "tablets",
        unit_price: 8,
      },
    ],
  },
  {
    id: "INV-2026-002",
    invoice_number: "INV-2026-002",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    total_amount: 62000,
    status: "pending",
    items: [
      {
        drug_id: "AMOX-001",
        drug_name: "Amoxicillin 500mg",
        quantity: 4000,
        unit: "capsules",
        unit_price: 10,
      },
      {
        drug_id: "ERYTH-001",
        drug_name: "Erythromycin 250mg",
        quantity: 2200,
        unit: "tablets",
        unit_price: 12,
      },
    ],
  },
  {
    id: "INV-2026-003",
    invoice_number: "INV-2026-003",
    created_at: new Date(Date.now() - 259200000).toISOString(),
    total_amount: 38000,
    status: "shipped",
    items: [
      {
        drug_id: "DIPHENHY-001",
        drug_name: "Diphenhydramine 25mg",
        quantity: 6000,
        unit: "tablets",
        unit_price: 4,
      },
      {
        drug_id: "LORAT-001",
        drug_name: "Loratadine 10mg",
        quantity: 2000,
        unit: "tablets",
        unit_price: 7,
      },
    ],
  },
  {
    id: "INV-2026-004",
    invoice_number: "INV-2026-004",
    created_at: new Date(Date.now() - 345600000).toISOString(),
    total_amount: 55000,
    status: "pending",
    items: [
      {
        drug_id: "METFOR-001",
        drug_name: "Metformin 500mg",
        quantity: 3500,
        unit: "tablets",
        unit_price: 6,
      },
      {
        drug_id: "GLIBENC-001",
        drug_name: "Glibenclamide 5mg",
        quantity: 2000,
        unit: "tablets",
        unit_price: 11,
      },
    ],
  },
];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: mockInvoices,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch invoices" }, { status: 500 });
  }
}
