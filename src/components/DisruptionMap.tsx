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

interface DisruptionMapProps {
  hoveredId?: string | null;
  onHover?: (id: string | null) => void;
}

const DisruptionMap = ({ hoveredId, onHover }: DisruptionMapProps) => {
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
          {mockDisruptions.map((disruption) => {
            const isHovered = hoveredId === disruption.id;
            return (
              <Marker key={disruption.id} coordinates={disruption.coordinates}>
                <g
                  onMouseEnter={() => onHover?.(disruption.id)}
                  onMouseLeave={() => onHover?.(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle r={isHovered ? 7 : 4} fill={getSeverityColor(disruption.severity)} stroke="#fff" strokeWidth={isHovered ? 2 : 1} style={{ transition: 'r 0.2s, stroke-width 0.2s' }} />
                  <circle r={isHovered ? 18 : 12} fill={getSeverityColor(disruption.severity)} opacity={isHovered ? 0.6 : 0.4} className="pulse-animation" />
                  {isHovered && (
                    <text textAnchor="middle" y={-14} style={{ fontSize: '8px', fill: '#fff', fontWeight: 'bold', pointerEvents: 'none' }}>
                      {disruption.title.length > 30 ? disruption.title.slice(0, 30) + '…' : disruption.title}
                    </text>
                  )}
                </g>
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>
      <style jsx global>{`
        @keyframes mapPulse {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .pulse-animation {
          animation: mapPulse 2s infinite ease-out;
          transform-origin: 50% 50%;
          transform-box: fill-box;
        }
      `}</style>
    </div>
  );
};

export default memo(DisruptionMap);
