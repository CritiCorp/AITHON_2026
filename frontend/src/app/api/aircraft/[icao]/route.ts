import { NextRequest, NextResponse } from "next/server";

const ADSB_API_BASE = "https://opendata.adsb.fi/api/v2";

export async function GET(request: NextRequest, { params }: { params: { icao: string } }) {
  try {
    const icao = params.icao.toLowerCase();

    // Validate ICAO code format (should be 6 hex characters)
    if (!/^[0-9a-f]{6}$/i.test(icao)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ICAO code format. Must be 6 hexadecimal characters (e.g., 461E1A or 750209)",
        },
        { status: 400 },
      );
    }

    // Fetch aircraft data from adsb.fi API using hex endpoint
    // Note: Using /hex/ endpoint which returns data in 'ac' array format
    const response = await fetch(`${ADSB_API_BASE}/hex/${icao}`);

    if (!response.ok) {
      return NextResponse.json({ success: false, error: `API error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();

    // Check if response contains aircraft data in 'ac' array
    if (!data.ac || !Array.isArray(data.ac) || data.ac.length === 0) {
      return NextResponse.json({ success: false, error: "Aircraft not currently being tracked" }, { status: 404 });
    }

    // Extract the first aircraft record from the ac array
    const aircraftRecord = data.ac[0] as any;

    // Validate required fields
    if (aircraftRecord.lat === undefined || aircraftRecord.lon === undefined) {
      return NextResponse.json({ success: false, error: "Aircraft location data unavailable" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        icao: aircraftRecord.hex || icao,
        reg: aircraftRecord.r || "N/A",
        callsign: (aircraftRecord.flight || "").trim() || "N/A",
        lat: aircraftRecord.lat,
        lon: aircraftRecord.lon,
        alt_baro: aircraftRecord.alt_baro || 0,
        track: aircraftRecord.track || 0,
        gs: aircraftRecord.gs || 0,
        seen: aircraftRecord.seen || 0,
        rssi: aircraftRecord.rssi || 0,
        // Additional fields from adsb.fi
        type: aircraftRecord.t || "Unknown",
        desc: aircraftRecord.desc || "Unknown Aircraft",
        squawk: aircraftRecord.squawk || "N/A",
      },
    });
  } catch (error) {
    console.error("Error fetching aircraft data:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch aircraft data from adsb.fi" }, { status: 500 });
  }
}
