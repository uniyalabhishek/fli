// File: /components/FlightTracker/index.tsx
"use client";

import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";

/**
 * Simple L.icon fallback to fix default marker.
 * (Leaflet's default marker is usually not visible in some bundlers).
 */
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconAnchor: [12, 41],
  iconSize: [25, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
L.Marker.prototype.options.icon = DefaultIcon;

type FlightSearchResult = {
  flightNumber: string;
  description?: string;
};

type FlightRoute = {
  flightNumber: string;
  departure: { lat: number; lon: number };
  arrival: { lat: number; lon: number };
};

export default function FlightTracker() {
  const [flightNumber, setFlightNumber] = useState("");
  const [searchResults, setSearchResults] = useState<FlightSearchResult[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [flightRoute, setFlightRoute] = useState<FlightRoute | null>(null);

  const [mapCenter, setMapCenter] = useState<[number, number]>([
    39.8283, -98.5795,
  ]); // approximate center of USA
  const [mapZoom, setMapZoom] = useState(4);

  const handleSearch = async () => {
    if (!flightNumber.trim()) return;

    try {
      const res = await fetch(
        `/api/flights/search?flightNumber=${flightNumber}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        // Each result is { flightNumber, description }
        setSearchResults(data.results);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Error searching flights:", err);
      setSearchResults([]);
    }
  };

  const handleSelectFlight = async (flight: string) => {
    setSelectedFlight(flight);
    // For demonstration, let's pick a specific date or let user specify date.
    const date = "2024-06-01"; // Hard-coded example date
    try {
      const res = await fetch(`/api/flights/details/${flight}?date=${date}`);
      const data = await res.json();
      if (data.success && data.flightData) {
        setFlightRoute(data.flightData);
        // Center the map between departure + arrival
        const latMid =
          (data.flightData.departure.lat + data.flightData.arrival.lat) / 2;
        const lonMid =
          (data.flightData.departure.lon + data.flightData.arrival.lon) / 2;
        setMapCenter([latMid, lonMid]);
        setMapZoom(5);
      } else {
        setFlightRoute(null);
      }
    } catch (err) {
      console.error("Error fetching flight details:", err);
      setFlightRoute(null);
    }
  };

  // Map polyline positions
  const routePositions: [number, number][] = [];
  if (flightRoute?.departure && flightRoute?.arrival) {
    routePositions.push(
      [flightRoute.departure.lat, flightRoute.departure.lon],
      [flightRoute.arrival.lat, flightRoute.arrival.lon]
    );
  }

  return (
    <div className="flex flex-col w-full h-screen">
      {/* Top half = map container */}
      <div className="w-full h-1/2">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution='Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Show departure + arrival markers */}
          {flightRoute && (
            <>
              <Marker
                position={[
                  flightRoute.departure.lat,
                  flightRoute.departure.lon,
                ]}
              >
                <Popup>
                  <div>
                    <p>Departure Airport</p>
                  </div>
                </Popup>
              </Marker>
              <Marker
                position={[flightRoute.arrival.lat, flightRoute.arrival.lon]}
              >
                <Popup>
                  <div>
                    <p>Arrival Airport</p>
                  </div>
                </Popup>
              </Marker>
              <Polyline
                pathOptions={{ color: "red" }}
                positions={routePositions}
              />
            </>
          )}
        </MapContainer>
      </div>

      {/* Bottom half = search + results */}
      <div className="w-full h-1/2 flex flex-col p-4 bg-white">
        <div className="mb-2 text-black">
          <label className="block mb-1 text-sm font-medium">
            Flight Number
          </label>
          <input
            type="text"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
            placeholder="e.g. AA2112"
          />
        </div>
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white py-2 px-4 rounded mb-4 w-32"
        >
          Search
        </button>

        {/* Results list */}
        <div className="flex-1 overflow-auto border rounded p-2 text-sm text-black">
          {searchResults.map((res, idx) => (
            <div
              key={idx}
              className="border-b border-gray-300 py-2 cursor-pointer"
              onClick={() => handleSelectFlight(res.flightNumber)}
            >
              <p className="font-semibold">{res.flightNumber}</p>
              <p>{res.description || "No description"}</p>
            </div>
          ))}
          {searchResults.length === 0 && (
            <p className="text-gray-500 italic">
              No flights found yet or none matching your search.
            </p>
          )}
        </div>

        {/* Display selected flight info */}
        {selectedFlight && (
          <div className="mt-2 text-sm text-black">
            Selected Flight: <strong>{selectedFlight}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
