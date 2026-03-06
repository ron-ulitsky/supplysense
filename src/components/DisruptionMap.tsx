"use client";

import React, { memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from "react-simple-maps";
import { mockDisruptions } from "@/data/mockData";

// TopoJSON for world map 
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const DisruptionMap = () => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'var(--danger-color)';
      case 'high': return '#ff9800'; // High priority orange
      case 'medium': return 'var(--warning-color)';
      case 'low': return 'var(--success-color)';
      default: return 'var(--success-color)';
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <ComposableMap
        projectionConfig={{ scale: 140 }}
        style={{ width: "100%", height: "100%", background: 'transparent' }}
      >
        <ZoomableGroup center={[0, 0]} zoom={1.2}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="rgba(255, 255, 255, 0.05)"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "rgba(255, 255, 255, 0.1)", outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>
          {mockDisruptions.map((disruption) => (
            <Marker key={disruption.id} coordinates={disruption.coordinates}>
              <circle r={4} fill={getSeverityColor(disruption.severity)} stroke="#fff" strokeWidth={1} />
              <circle r={12} fill={getSeverityColor(disruption.severity)} opacity={0.4} className="pulse-animation" />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
      <style jsx global>{`
        @keyframes mapPulse {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .pulse-animation {
          animation: mapPulse 2s infinite ease-out;
          transform-origin: center;
        }
      `}</style>
    </div>
  );
};

export default memo(DisruptionMap);
