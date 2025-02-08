// File: /app/api/flights/search/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * Example route:
 * GET /api/flights/search?flightNumber=AA21
 *
 * This route hits AeroDataBox's "Search flight numbers by term" endpoint:
 *    GET /flights/search/term?search=AA21
 *
 * We'll parse the results and return them to the client.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const flightNumber = searchParams.get("flightNumber");
  if (!flightNumber) {
    return NextResponse.json(
      { error: "Missing 'flightNumber' query param" },
      { status: 400 }
    );
  }

  try {
    // AeroDataBox docs: /flights/search/term?search={flightNumber}
    const apiKey = process.env.AERODATABOX_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AERODATABOX_API_KEY not configured" },
        { status: 500 }
      );
    }

    const url = `https://api.aerodatabox.com/flights/search/term?search=${flightNumber}`;
    const response = await fetch(url, {
      headers: {
        "x-magicapi-key": apiKey, // or "X-RapidAPI-Key" depending on your plan
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `AeroDataBox error: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();

    // 'data' might be an object with flight suggestions, or array
    // For a real flightNumber like 'AA21', the structure from AeroDataBox might look like:
    // {
    //    "matches": [
    //      { "flightNumber": "AA21", "description": "American Airlines flight 21" },
    //      ...
    //    ],
    // }

    return NextResponse.json({
      success: true,
      results: data.matches || [],
    });
  } catch (error: any) {
    console.error("Flight search error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
