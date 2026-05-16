import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";

function MapPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const isHeatmap = searchParams.get("view") === "heatmap";

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/issues");
        setIssues(data);
      } catch (error) {
        console.error("Error fetching issues for map:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  const toggleView = () => {
    if (isHeatmap) {
      navigate("/map");
    } else {
      navigate("/map?view=heatmap");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 p-4 shrink-0 z-20 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-gray-400 hover:text-white transition">
            ← Back
          </Link>
          <h1 className="text-xl font-bold">City Issue Map</h1>
        </div>
        <button 
          onClick={toggleView}
          className={`px-4 py-2 rounded-full text-sm font-bold transition shadow-lg ${
            isHeatmap 
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/50 hover:bg-blue-500/30" 
              : "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
          }`}
        >
          {isHeatmap ? "📍 Switch to Marker View" : "🔥 Switch to Heatmap"}
        </button>
      </header>

      <div className="flex-grow relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950/80 z-30">
            <p className="text-emerald-400 font-bold animate-pulse">Loading Map Data...</p>
          </div>
        )}

        {/* Provide a solid height to ensure map renders in all scenarios */}
        <MapContainer
          center={[11.0168, 76.9558]} // Coimbatore coords as placeholder
          zoom={13}
          style={{ height: "calc(100vh - 73px)", width: "100%", zIndex: 10 }}
        >
          <TileLayer
            key={isHeatmap ? "dark-tiles" : "light-tiles"}
            attribution="© OpenStreetMap"
            url={
              isHeatmap 
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png" 
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            }
          />

          {issues.map((issue) => {
            if (!issue.location?.coordinates) return null;
            const [lng, lat] = issue.location.coordinates;

            if (isHeatmap) {
              // Pseudo-heatmap using large overlapping low-opacity circles
              // The more votes/priority, the bigger/redder
              const intensity = issue.upvotes?.length || 0;
              const radius = 30 + (intensity * 5);
              const color = intensity > 5 ? "#ef4444" : intensity > 2 ? "#f97316" : "#eab308";
              
              return (
                <CircleMarker
                  key={`heat-${issue._id}`}
                  center={[lat, lng]}
                  radius={radius}
                  stroke={false}
                  pathOptions={{
                    fillColor: color,
                    fillOpacity: 0.3,
                  }}
                />
              );
            }

            // Normal Marker View
            return (
              <Marker key={issue._id} position={[lat, lng]}>
                <Popup className="custom-popup">
                  <div className="p-1">
                    <h3 className="font-bold text-gray-900 mb-1">{issue.title}</h3>
                    <p className="text-xs text-gray-600 mb-2">{issue.category}</p>
                    <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                      👍 {issue.upvotes?.length || 0}
                    </span>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapPage;
