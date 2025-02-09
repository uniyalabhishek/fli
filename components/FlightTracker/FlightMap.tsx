// File: /components/FlightTracker/FlightMap.tsx
"use client";

import React, { useMemo } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { Map, Marker, Source, Layer } from "react-map-gl/mapbox";

type FlightMapProps = {
  center: [number, number]; // [lat, lon]
  zoom: number;
  departure?: [number, number]; // coords
  arrival?: [number, number];
};

export default function FlightMap({
  center,
  zoom,
  departure,
  arrival,
}: FlightMapProps) {
  // read from environment
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

  // construct a GeoJSON route if we have departure + arrival
  const routeGeoJSON = useMemo(() => {
    if (!departure || !arrival) return null;

    return {
      type: "Feature",
      geometry: {
        type: "LineString",
        // for geojson, we use [lon, lat]
        coordinates: [
          [departure[1], departure[0]],
          [arrival[1], arrival[0]],
        ],
      },
      properties: {},
    };
  }, [departure, arrival]);

  return (
    <Map
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={{
        longitude: center[1], // again, for mapbox: [lon, lat]
        latitude: center[0],
        zoom,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/streets-v11"
    >
      {/* Markers */}
      {departure && (
        <Marker longitude={departure[1]} latitude={departure[0]} color="red" />
      )}
      {arrival && (
        <Marker longitude={arrival[1]} latitude={arrival[0]} color="blue" />
      )}

      {/* Route line */}
      {routeGeoJSON && (
        <Source id="flightRoute" type="geojson" data={routeGeoJSON}>
          <Layer
            id="routeLine"
            type="line"
            paint={{
              "line-color": "#ff0000",
              "line-width": 3,
            }}
          />
        </Source>
      )}
    </Map>
  );
}
