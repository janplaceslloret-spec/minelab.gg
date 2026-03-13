import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const activeServers = [
  { name: "Frankfurt", country: "Alemania", coordinates: [8.6821, 50.1109] },
  { name: "Nuremberg", country: "Alemania", coordinates: [11.0767, 49.4521] }
];

const futureServers = [
  { name: "Madrid", country: "España", coordinates: [-3.7038, 40.4168] },
  { name: "Miami", country: "Estados Unidos", coordinates: [-80.1918, 25.7617] }
];

const ServerMap = () => {
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  return (
    <div className="w-full h-full min-h-[300px] flex justify-center items-center relative">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120,
          center: [0, 20]
        }}
        width={800}
        height={400}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup 
          zoom={1.2} 
          center={[10, 30]}
          minZoom={1}
          maxZoom={4}
          translateExtent={[
            [-50, -50],
            [850, 450]
          ]}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#1F2937" /* dark grey countries */
                  stroke="#374151" /* slightly lighter borders */
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: "#374151" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Active Servers */}
          {activeServers.map(({ name, country, coordinates }) => (
            <Marker 
              key={name}
              coordinates={coordinates}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltipContent(`${name} — ${country}\nServidor activo`);
                setTooltipPosition({ x: rect.left, y: rect.top - 10 });
              }}
              onMouseLeave={() => {
                setTooltipContent("");
              }}
              style={{
                default: { outline: "none" },
                hover: { outline: "none", cursor: "pointer" },
                pressed: { outline: "none" }
              }}
            >
              <g>
                <circle r={8} fill="#22C55E" fillOpacity={0.2} className="animate-ping" />
                <circle r={4} fill="#22C55E" filter="drop-shadow(0 0 4px #22C55E)" />
              </g>
            </Marker>
          ))}

          {/* Future Servers */}
          {futureServers.map(({ name, coordinates }) => (
            <Marker 
              key={name} 
              coordinates={coordinates}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltipContent(`${name} — Próximamente`);
                setTooltipPosition({ x: rect.left, y: rect.top - 10 });
              }}
              onMouseLeave={() => {
                setTooltipContent("");
              }}
              style={{
                default: { outline: "none" },
                hover: { outline: "none", cursor: "pointer" },
                pressed: { outline: "none" }
              }}
            >
              <circle r={3} fill="#6B7280" />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* Custom Tooltip */}
      {tooltipContent && (
        <div 
          className="fixed z-50 bg-[#111827] border border-accent-green/30 text-white text-[10px] md:text-xs tracking-wide px-3 py-2 rounded shadow-[0_0_10px_rgba(34,197,94,0.2)] pointer-events-none whitespace-pre-line text-center transform -translate-x-1/2 -translate-y-full"
          style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );
};

export default ServerMap;
