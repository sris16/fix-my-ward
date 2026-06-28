import React from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { useTheme } from "../../../hooks/useTheme";
import { dummyIssues } from "../../data/issues";
import { PageHeader } from "../../components/ui/PageHeader";

export default function LiveMonitor() {
  const { theme } = useTheme();

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-140px)]">
      <div className="shrink-0">
        <PageHeader 
          title="Live Monitor" 
          subtitle="Real-time geographic tracking of civic complaints across wards"
        />
      </div>
      
      <div className="flex-1 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800/80 rounded-3xl overflow-hidden shadow-lg relative min-h-[350px]">
        <MapContainer
          center={[11.0168, 76.9558]} 
          zoom={13}
          style={{ height: "100%", width: "100%", zIndex: 1 }}
          zoomControl={true}
        >
          <TileLayer
            key={theme}
            attribution={theme === "dark" ? "© CartoDB" : "© OpenStreetMap"}
            url={theme === "dark" 
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png" 
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            }
          />
          {dummyIssues.map((issue) => {
            if (!issue.coordinates) return null;
            const [lng, lat] = issue.coordinates;
            const color = 
              issue.priority === "Critical" 
                ? "#ef4444" 
                : issue.priority === "High" 
                ? "#f97316" 
                : "#eab308";

            return (
              <CircleMarker
                key={issue.id}
                center={[lat, lng]}
                radius={8}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.7,
                  weight: 2
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[150px] text-gray-950">
                    <h4 className="font-extrabold text-xs">{issue.title}</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Category: {issue.category}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Priority: {issue.priority}</p>
                    <p className="text-[10px] text-gray-550 mt-1 font-light">{issue.locationName}</p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
