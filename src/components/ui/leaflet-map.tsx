"use client";
import React from "react";
import {
  MapContainer as RLMapContainer,
  TileLayer as RLTileLayer,
  CircleMarker as RLCircleMarker,
  Tooltip as RLTooltip,
  MapContainerProps,
  TileLayerProps,
  CircleMarkerProps,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// --- Explicit type aliases (fix for React 19 typing conflict) ---
const MapContainer = RLMapContainer as React.FC<MapContainerProps>;
const TileLayer = RLTileLayer as React.FC<TileLayerProps>;
const CircleMarker = RLCircleMarker as React.FC<CircleMarkerProps>;
const Tooltip = RLTooltip;

interface Point {
  lat: number;
  lng: number;
  label: string;
  color: string;
  radius: number;
  tooltip: string;
}

interface LeafletMapProps {
  points: Point[];
  height?: number;
}

export default function LeafletMap({ points, height = 500 }: LeafletMapProps) {
  return (
    <MapContainer
      center={[25, 50]}
      zoom={4}
      scrollWheelZoom
      style={{ height: `${height}px`, width: "100%" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
      />
      {points.map((p, i) => (
        <CircleMarker
          key={i}
          center={[p.lat, p.lng]}
          radius={p.radius}
          pathOptions={{
            color: p.color,
            fillColor: p.color,
            fillOpacity: 0.6,
          }}
        >
          <Tooltip>{p.tooltip}</Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
