import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { 
  ArrowLeftIcon, 
  LocationIcon, 
  PublicIcon, 
  UpvoteIcon 
} from "../components/SvgIcon";
import { CardSkeleton, Spinner } from "../components/LoadingSkeleton";
import { useTheme } from "../hooks/useTheme";

// Helper function to calculate distance in km (Haversine)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

function PublicReports() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState("Detecting your location...");
  const [userLocation, setUserLocation] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({ lat, lng });
        setLocationStatus("");

        try {
          // Fetch nearby issues (within 10km) using our updated backend endpoint
          const { data } = await axios.get(`http://localhost:5000/api/issues?lat=${lat}&lng=${lng}&radius=10000`);
          setIssues(data);
        } catch (error) {
          console.error("Error fetching nearby issues:", error);
          setLocationStatus("Error fetching reports from the server.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLocationStatus("Unable to fetch your location. Please grant permission to see nearby reports.");
        setLoading(false);
      }
    );
  }, []);

  const handleUpvote = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `http://localhost:5000/api/issues/${id}/upvote`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update UI 
      setIssues((prev) =>
        prev.map((issue) =>
          issue._id === id
            ? {
                ...issue,
                upvotes: Array(data.totalUpvotes).fill("x"), // fake array length for UI
                priority: data.priority,
              }
            : issue
        )
      );
    } catch (error) {
      console.error(error);
      alert("Failed to upvote. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Resolved": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25";
      case "In Progress": return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25";
      default: return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/25";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-800 dark:text-white pb-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-teal-500/[0.03] dark:bg-teal-500/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[128px] pointer-events-none"></div>

      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-4 sticky top-0 z-20 shadow-sm dark:shadow-md">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link 
            to="/dashboard" 
            className="flex items-center text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white transition font-semibold text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1.5" />
            Back
          </Link>
          <span className="text-gray-300 dark:text-gray-600 font-light">|</span>
          <h1 className="text-lg font-black tracking-tight text-slate-805 dark:text-white">Public Reports</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto mt-8 px-4 relative z-10">
        {loading || locationStatus ? (
          <div className="text-center py-20 bg-white/40 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800/80 rounded-2xl p-10 flex flex-col items-center justify-center">
            <Spinner className="w-10 h-10 text-teal-500 dark:text-teal-400 mb-4" />
            <p className="text-slate-500 dark:text-gray-400 text-sm font-medium tracking-wide">{locationStatus || "Fetching public reports near your coordinates..."}</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-2xl p-10 text-center shadow-sm dark:shadow-lg">
             <div className="w-16 h-16 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mb-6 mx-auto">
               <PublicIcon className="w-8 h-8" />
             </div>
             <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">All Clear Nearby!</h2>
             <p className="text-slate-655 dark:text-gray-400 text-sm leading-relaxed font-light max-w-sm mx-auto">There are currently no reported civic issues within a 10km radius of your location.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            <p className="text-gray-500 text-xs font-bold tracking-wider uppercase mb-2">
              Showing {issues.length} issues within 10km radius
            </p>
            {issues.map((issue) => {
              // Calculate distance for UI display
              const dist = userLocation && issue.location?.coordinates
                ? getDistanceFromLatLonInKm(
                    userLocation.lat, userLocation.lng, 
                    issue.location.coordinates[1], issue.location.coordinates[0]
                  ).toFixed(1)
                : "?";

              return (
                <div key={issue._id} className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-2xl p-6 shadow-sm dark:shadow-lg transition duration-300 hover:border-teal-500/20 dark:hover:border-teal-500/20 group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-1.5 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition duration-200">{issue.title}</h2>
                      <div className="flex items-center gap-2.5 text-xs font-semibold">
                        <span className="bg-slate-100 dark:bg-gray-800 text-slate-655 dark:text-gray-300 px-2.5 py-1 rounded-lg">
                          {issue.category}
                        </span>
                        <span className="text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/10">
                          {dist} km away
                        </span>
                      </div>
                    </div>
                    <div className={`px-3.5 py-1.5 border rounded-full text-xs font-bold ${getStatusColor(issue.status)}`}>
                      {issue.status}
                    </div>
                  </div>

                  <p className="text-slate-655 dark:text-gray-400 text-sm mb-4 leading-relaxed font-light line-clamp-3">
                    {issue.description}
                  </p>

                  <div className="flex items-center gap-1.5 mb-4 text-xs font-medium text-slate-500 dark:text-gray-500">
                    <span>Reported by:</span>
                    <span className="text-slate-700 dark:text-gray-300 font-bold">{issue.reportedBy?.name || "A Citizen"}</span>
                  </div>

                  {issue.locationText && (
                    <p className="text-xs text-slate-500 dark:text-gray-550 flex items-center gap-1.5 mb-4 font-medium">
                      <LocationIcon className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
                      {issue.locationText}
                    </p>
                  )}

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-800/60">
                     <button
                       onClick={() => handleUpvote(issue._id)}
                       className="flex items-center gap-2 bg-slate-100 dark:bg-gray-800 hover:bg-emerald-500 hover:text-gray-955 text-slate-800 dark:text-white px-4 py-2 rounded-xl transition duration-200 font-bold text-xs"
                     >
                       <UpvoteIcon className="w-3.5 h-3.5 text-current" />
                       <span>Upvote Issue ({issue.upvotes?.length || 0})</span>
                     </button>

                     <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-455 font-bold uppercase tracking-wider">
                       Priority: <span className="text-slate-850 dark:text-white text-sm font-semibold tracking-normal normal-case">{issue.priority}</span>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicReports;
