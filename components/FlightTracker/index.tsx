// File: /components/FlightTracker/index.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import the map to avoid SSR errors
const FlightMap = dynamic(() => import("./FlightMap"), { ssr: false });

export default function FlightTracker() {
  // user input states
  const [flightNo, setFlightNo] = useState("");
  const [dateLocal, setDateLocal] = useState("2025-02-10");
  const [errorMsg, setErrorMsg] = useState("");

  // map states
  const [center, setCenter] = useState<[number, number]>([39.8283, -98.5795]); // roughly center US
  const [zoom, setZoom] = useState(3);

  const [departure, setDeparture] = useState<[number, number]>();
  const [arrival, setArrival] = useState<[number, number]>();

  // handle EXACT flight search
  const handleSearchFlight = async () => {
    if (!flightNo.trim()) {
      setErrorMsg("Please enter a flightNo, e.g. AA123");
      return;
    }
    setErrorMsg("");
    // reset old map markers
    setDeparture(undefined);
    setArrival(undefined);

    try {
      // calls /app/api/flights/status route
      // e.g. GET /api/flights/status?flightNo=AA123&dateLocal=2025-02-10
      const url = `/api/flights/status?flightNo=${encodeURIComponent(
        flightNo
      )}&dateLocal=${encodeURIComponent(dateLocal)}`;

      const res = await fetch(url);
      const json = await res.json();
      if (!json.success) {
        setErrorMsg(
          json.error || "Flight not found or aggregator coverage missing."
        );
        return;
      }

      // aggregator returns an array of flight objects
      if (!Array.isArray(json.data) || json.data.length < 1) {
        setErrorMsg(
          "No flights returned. Possibly out of coverage or invalid date."
        );
        return;
      }

      const flight = json.data[0]; // pick first flight
      const depLat = flight?.departure?.airport?.location?.lat;
      const depLon = flight?.departure?.airport?.location?.lon;
      const arrLat = flight?.arrival?.airport?.location?.lat;
      const arrLon = flight?.arrival?.airport?.location?.lon;

      if (depLat && depLon && arrLat && arrLon) {
        setDeparture([depLat, depLon]);
        setArrival([arrLat, arrLon]);

        // recenter map near the midpoint
        const midLat = (depLat + arrLat) / 2;
        const midLon = (depLon + arrLon) / 2;
        setCenter([midLat, midLon]);
        setZoom(4);
      } else {
        setErrorMsg("Could not parse lat/lon from aggregator response.");
      }
    } catch (err: any) {
      console.error("Flight detail error:", err);
      setErrorMsg("Error fetching flight or aggregator coverage problem.");
    }
  };

  return (
    <div className="flex flex-col w-full h-screen">
      {/* top half: map */}
      <div className="w-full h-1/2">
        <FlightMap
          center={center}
          zoom={zoom}
          departure={departure}
          arrival={arrival}
        />
      </div>

      {/* bottom half: form + potential errors */}
      <div className="flex flex-col p-4 bg-white h-1/2 text-black shadow-lg">
        <label className="font-medium mb-1 text-gray-700">Flight Number</label>
        <input
          className="border border-gray-300 rounded p-2 mb-4 outline-none focus:border-blue-500"
          placeholder="e.g. AA123"
          value={flightNo}
          onChange={(e) => setFlightNo(e.target.value)}
        />

        <label className="font-medium mb-1 text-gray-700">
          Date (YYYY-MM-DD)
        </label>
        <input
          type="date"
          className="border border-gray-300 rounded p-2 mb-4 outline-none focus:border-blue-500"
          value={dateLocal}
          onChange={(e) => setDateLocal(e.target.value)}
        />

        <button
          onClick={handleSearchFlight}
          className="bg-blue-600 text-white py-2 px-4 rounded font-semibold hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
        {errorMsg && (
          <p className="text-red-600 mt-2 font-semibold">{errorMsg}</p>
        )}
      </div>
    </div>
  );
}
