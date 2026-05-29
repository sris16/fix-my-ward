import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import { 
  ArrowLeftIcon, 
  LocationIcon, 
  HeatmapIcon, 
  UpvoteIcon 
} from "../components/SvgIcon";
import { Spinner } from "../components/LoadingSkeleton";

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
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 p-4 shrink-0 z-20 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link 
            to="/dashboard" 
            className="flex items-center text-gray-400 hover:text-white transition font-semibold text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1.5" />
            Back
          </Link>
          <span className="text-gray-600 font-light">|</span>
          <h1 className="text-lg font-black tracking-tight">City Issue Map</h1>
        </div>
        <button 
          onClick={toggleView}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg border ${
            isHeatmap 
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" 
              : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
          }`}
        >
          {isHeatmap ? (
            <>
              <LocationIcon className="w-3.5 h-3.5 text-emerald-400" />
              Switch to Markers
            </>
          ) : (
            <>
              <HeatmapIcon className="w-3.5 h-3.5 text-red-400" />
              Switch to Heatmap
            </>
          )}
        </button>
      </header>

      <div className="flex-grow relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/90 z-30 backdrop-blur-sm">
            <Spinner className="w-8 h-8 text-emerald-400 mb-2" />
            <p className="text-emerald-400/80 font-bold text-xs uppercase tracking-widest">Loading Map Datasets...</p>
          </div>
        )}

        {/* Provide a solid height to ensure map renders in all scenarios */}
        <MapContainer
          center={[11.0168, 76.9558]} // Coimbatore coords as placeholder
          zoom={13}
          style={{ height: "calc(100vh - 73px)", width: "100%", zIndex: 10 }}
        >
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
          />

          {issues.map((issue) => {
            if (!issue.location?.coordinates) return null;
            const [lng, lat] = issue.location.coordinates;

            if (isHeatmap) {
              // Pseudo-heatmap using large overlapping low-opacity circles
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
                    fillOpacity: 0.25,
                  }}
                />
              );
            }

            // Normal Marker View
            return (
              <Marker key={issue._id} position={[lat, lng]}>
                <Popup className="custom-popup">
                  <div className="p-2 min-w-[160px] bg-gray-900 text-white rounded-xl border border-gray-800 shadow-xl">
                    <h3 className="font-extrabold text-sm text-white mb-1.5 tracking-tight">{issue.title}</h3>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-2.5">{issue.category}</p>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-gray-800/80">
                      <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                        <UpvoteIcon className="w-3.5 h-3.5 text-emerald-400" />
                        {issue.upvotes?.length || 0} votes
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">
                        {issue.priority}
                      </span>
                    </div>
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
