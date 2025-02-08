// File: /app/api/flights/details/[flight]/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * Example route:
 * GET /api/flights/details/AA21?date=2024-06-01
 *
 * This route hits AeroDataBox's flight status endpoint for the specific flight + date.
 * e.g. GET /flights/{flightNumber}/{dateLocal}
 *
 * Then we parse departure & arrival coordinates to map them.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { flight: string } }
) {
  const flightParam = params.flight; // e.g. "AA21"
  const { searchParams } = new URL(req.url);
  const dateLocal = searchParams.get("date") || ""; // e.g. "2024-06-01"

  if (!flightParam) {
    return NextResponse.json(
      { error: "Missing flight param" },
      { status: 400 }
    );
  }
  if (!dateLocal) {
    return NextResponse.json(
      { error: "Missing ?date=YYYY-MM-DD" },
      { status: 400 }
    );
  }

  try {
    const apiKey = process.env.AERODATABOX_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AERODATABOX_API_KEY not configured" },
        { status: 500 }
      );
    }

    // We call the single-day flight status endpoint:
    // e.g. GET /flights/flightNumber/AA21/2024-06-01
    const url = `https://api.aerodatabox.com/flights/flightNumber/${flightParam}/${dateLocal}`;

    const response = await fetch(url, {
      headers: {
        "x-magicapi-key": apiKey,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `AeroDataBox error: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Example shape from Aerodatabox might be:
    // {
    //   "scheduledTimeLocal": "...",
    //   "departure": {
    //       "airport": {
    //          "icao": "...",
    //          "iata": "...",
    //          "position": {
    //             "latitude": 40.7128,
    //             "longitude": -74.0060
    //          },
    //       }
    //   },
    //   "arrival": {
    //       "airport": {
    //          "position": {
    //             "latitude": 37.6213,
    //             "longitude": -122.379
    //          },
    //       }
    //   }
    //   ...
    // }
    // We'll extract lat/lon for departure and arrival.

    let flightData = null;

    // If the endpoint returns an array of flights, pick the first one. Adjust as needed:
    if (Array.isArray(data) && data.length > 0) {
      const f = data[0];
      flightData = {
        flightNumber: flightParam,
        departure: {
          lat: f?.departure?.airport?.position?.latitude,
          lon: f?.departure?.airport?.position?.longitude,
        },
        arrival: {
          lat: f?.arrival?.airport?.position?.latitude,
          lon: f?.arrival?.airport?.position?.longitude,
        },
      };
    } else if (typeof data === "object" && data !== null) {
      // If the response is a single object
      flightData = {
        flightNumber: flightParam,
        departure: {
          lat: data?.departure?.airport?.position?.latitude,
          lon: data?.departure?.airport?.position?.longitude,
        },
        arrival: {
          lat: data?.arrival?.airport?.position?.latitude,
          lon: data?.arrival?.airport?.position?.longitude,
        },
      };
    }

    return NextResponse.json({
      success: true,
      flightData,
    });
  } catch (error: any) {
    console.error("Flight details error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
