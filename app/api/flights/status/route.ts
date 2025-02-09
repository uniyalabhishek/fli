// File: /app/api/flights/status/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * Example usage on client:
 *   GET /api/flights/status?flightNo=AA123&dateLocal=2025-02-10
 *
 * We'll call aggregator:
 *   GET https://api.magicapi.dev/api/v1/aedbx/aerodatabox/flights/Number/AA123
 *     ?dateLocal=2025-02-10
 *     &dateLocalRole=Both
 *     &withAircraftImage=false
 *     &withLocation=false
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const flightNo = searchParams.get("flightNo");
  const dateLocal = searchParams.get("dateLocal");

  if (!flightNo || !dateLocal) {
    return NextResponse.json(
      { success: false, error: "Need ?flightNo= and ?dateLocal=" },
      { status: 400 }
    );
  }

  try {
    const apiKey = process.env.AERODATABOX_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "No AERODATABOX_API_KEY set" },
        { status: 500 }
      );
    }

    // Build aggregator URL:
    // e.g. https://api.magicapi.dev/api/v1/aedbx/aerodatabox/flights/Number/AA123?dateLocal=2025-02-10&dateLocalRole=Both...
    const url = `https://api.magicapi.dev/api/v1/aedbx/aerodatabox/flights/Number/${encodeURIComponent(
      flightNo
    )}?dateLocal=${encodeURIComponent(
      dateLocal
    )}&dateLocalRole=Both&withAircraftImage=false&withLocation=false`;

    const resp = await fetch(url, {
      headers: {
        "x-magicapi-key": apiKey,
      },
    });

    // aggregator returns 400 if flight coverage not found
    if (!resp.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Aggregator error: ${resp.status} — possibly out of coverage or invalid flight`,
        },
        { status: 400 }
      );
    }

    // Typically an array of flights
    const data = await resp.json();
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Flight status error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
