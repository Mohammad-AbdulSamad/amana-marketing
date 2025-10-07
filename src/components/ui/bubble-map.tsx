"use client";
import dynamic from "next/dynamic";
import React from "react";

const LeafletMap = dynamic(() => import("./leaflet-map"), { ssr: false });


interface BubbleMapDataPoint {
  region: string;
  country: string;
  value: number;
  revenue?: number;
  spend?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  roas?: number;
  lat?: number;
  lng?: number;
}

interface BubbleMapProps {
  title: string;
  data: BubbleMapDataPoint[];
  metric: "revenue" | "spend" | "impressions" | "clicks" | "conversions";
  className?: string;
  height?: number;
  formatValue?: (value: number) => string;
}

const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  "Abu Dhabi": { lat: 24.4539, lng: 54.3773 },
  Dubai: { lat: 25.2048, lng: 55.2708 },
  Sharjah: { lat: 25.3463, lng: 55.4209 },
  Riyadh: { lat: 24.7136, lng: 46.6753 },
  Doha: { lat: 25.2854, lng: 51.531 },
  "Kuwait City": { lat: 29.3759, lng: 47.9774 },
  Manama: { lat: 26.2285, lng: 50.586 },
};

export const BubbleMap: React.FC<BubbleMapProps> = ({
  title,
  data,
  metric,
  className = "",
  height = 500,
  formatValue = (value) => value.toLocaleString(),
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}
      >
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-96 text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  // Merge with city coordinates
  const enriched = data
    .map((d) => ({
      ...d,
      ...(cityCoordinates[d.region] || {}),
    }))
    .filter((d) => d.lat && d.lng);

  const values = enriched.map((d) => d[metric] || d.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);

  const getColor = (value: number) => {
    const normalized = (value - minValue) / (maxValue - minValue);
    if (normalized > 0.7) return "#ef4444"; // red
    if (normalized > 0.4) return "#f59e0b"; // yellow
    return "#10b981"; // green
  };

  const getRadius = (value: number) => {
    if (maxValue === minValue) return 10;
    const normalized = (value - minValue) / (maxValue - minValue);
    return 6 + normalized * 25; // radius range
  };

  return (
    <div
      className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}
    >
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>

      <div
        className="rounded-xl overflow-hidden border border-gray-700"
        style={{ height }}
      >
       <LeafletMap
      points={enriched.map((point) => ({
      lat: point.lat!,
      lng: point.lng!,
      label: point.region,
      color: getColor(point[metric] || point.value),
      radius: getRadius(point[metric] || point.value),
      tooltip: `${point.region} - ${formatValue(point[metric] || point.value)}`,
    }))}
    height={height}
    />
      </div>
    </div>
  );
};
