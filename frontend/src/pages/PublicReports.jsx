import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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
      case "Resolved": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50";
      case "In Progress": return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      default: return "bg-orange-500/20 text-orange-400 border-orange-500/50";
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 pointer-events-none"></div>

      <header className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link to="/dashboard" className="text-gray-400 hover:text-white transition">
            ← Back
          </Link>
          <h1 className="text-xl font-bold">Public Reports Near You</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto mt-8 px-4 relative z-10">
        {loading || locationStatus ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4 animate-bounce">🌍</div>
            <p className="text-gray-400">{locationStatus || "Loading nearby reports..."}</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center shadow-lg">
             <div className="text-6xl mb-4">🌟</div>
             <h2 className="text-2xl font-bold mb-2">All Good Here!</h2>
             <p className="text-gray-400 mb-6">There are no reported civic issues within 10km of your location.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            <p className="text-gray-400 text-sm mb-2 font-medium tracking-wide uppercase">
              Showing {issues.length} issues within 10km
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
                <div key={issue._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg transition hover:border-teal-500/30 group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1 group-hover:text-teal-400 transition">{issue.title}</h2>
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded">
                          {issue.category}
                        </span>
                        <span className="text-teal-500 bg-teal-500/10 px-2 py-1 rounded font-bold">
                          {dist} km away
                        </span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 border rounded-full text-xs font-bold ${getStatusColor(issue.status)}`}>
                      {issue.status}
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {issue.description}
                  </p>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-gray-500 text-xs">Reported by:</span>
                    <span className="text-gray-300 text-sm font-medium">{issue.reportedBy?.name || "A Citizen"}</span>
                  </div>

                  {issue.locationText && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mb-4">
                      📍 {issue.locationText}
                    </p>
                  )}

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-800">
                     <button
                       onClick={() => handleUpvote(issue._id)}
                       className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition shadow-sm font-bold text-sm"
                     >
                       👍 Upvote <span className="bg-gray-900 text-yellow-500 px-2 py-0.5 rounded-lg ml-1">{issue.upvotes?.length || 0}</span>
                     </button>

                     <div className="flex items-center gap-2 text-sm text-gray-400">
                       Priority: <span className="text-white">{issue.priority}</span>
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
