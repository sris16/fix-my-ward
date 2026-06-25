import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { 
  ArrowLeftIcon, 
  LocationIcon, 
  GpsIcon, 
  CloseIcon, 
  TrashIcon, 
  UpvoteIcon 
} from "../components/SvgIcon";
import { Spinner, FullPageSpinner } from "../components/LoadingSkeleton";
import { useTheme } from "../hooks/useTheme";

// Helper: Haversine distance in km
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
  return R * c; 
}
function deg2rad(deg) { return deg * (Math.PI/180); }

// Map Sub-components
function LocationMarker({ setCoords }) {
  useMapEvents({
    click(e) {
      setCoords({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return null;
}
function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords.latitude && coords.longitude) {
      map.setView([coords.latitude, coords.longitude], 15);
    }
  }, [coords, map]);
  return null;
}

function ReportIssue() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const defaultCategory = searchParams.get("category") || "Road";

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: defaultCategory,
    locationText: "",
  });

  const [coords, setCoords] = useState({ latitude: "", longitude: "" });
  const [photos, setPhotos] = useState([]); // Base64 strings
  
  const [loading, setLoading] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [isFullscreenMap, setIsFullscreenMap] = useState(false);
  const [duplicateSuggestions, setDuplicateSuggestions] = useState(null);

  // Auto-fetch address when coordinates change
  useEffect(() => {
    if (coords.latitude && coords.longitude) {
      const fetchAddress = async () => {
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`);
          if (res.data && res.data.display_name) {
            // Take the first few parts of the address for a cleaner look
            const shortAddress = res.data.display_name.split(",").slice(0, 3).join(",");
            setForm(prev => ({ ...prev, locationText: shortAddress }));
          }
        } catch (e) {
          console.error("Geocoding error:", e);
        }
      };
      fetchAddress();
    }
  }, [coords.latitude, coords.longitude]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Handle Photo Upload (Base64)
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 4) {
      return alert("You can only upload a maximum of 4 images.");
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (indexToRemove) => {
    setPhotos(photos.filter((_, index) => index !== indexToRemove));
  };

  // High Accuracy GPS
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setIsGpsLoading(false);
      },
      () => {
        alert("Unable to fetch location. Please ensure location permissions are granted.");
        setIsGpsLoading(false);
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  // 1. Submit Clicked
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) return alert("Please fill required fields.");
    if (!coords.latitude || !coords.longitude) return alert("Please select a location on the map.");

    setLoading(true);

    try {
      // Client-Side Duplicate Detection
      const { data: existingIssues } = await axios.get("http://localhost:5000/api/issues");
      
      const duplicates = existingIssues.filter(issue => {
        if (issue.category !== form.category || !issue.location?.coordinates) return false;
        const [lng, lat] = issue.location.coordinates;
        const distance = getDistanceFromLatLonInKm(coords.latitude, coords.longitude, lat, lng);
        return distance < 0.3; // 300m threshold
      });

      if (duplicates.length > 0) {
        setDuplicateSuggestions(duplicates);
        setLoading(false);
      } else {
        await executeSubmit(false); // No duplicates, submit fresh
      }
    } catch (err) {
      alert("Error checking for duplicates.");
      setLoading(false);
    }
  };

  // 2. Execute Submission (Fresh or Forced)
  const executeSubmit = async (forceSubmit = false) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        title: form.title,
        category: form.category,
        description: form.description,
        locationText: form.locationText,
        lat: Number(coords.latitude),
        lng: Number(coords.longitude),
        photos: photos,
        forceSubmit,
      };

      await axios.post("http://localhost:5000/api/issues", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Issue reported successfully!");
      navigate("/my-reports");
    } catch (error) {
      alert(error.response?.data?.message || "Error reporting issue");
    } finally {
      setLoading(false);
    }
  };

  // 3. Upvote Existing Duplicate
  const handleUpvoteExisting = async (issueId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/api/issues/${issueId}/upvote`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Existing issue upvoted successfully!");
      navigate("/my-reports");
    } catch (err) {
      alert("Failed to upvote.");
    } finally {
      setLoading(false);
    }
  };

  // Dynamic placeholder based on category
  const getPlaceholder = () => {
    switch(form.category) {
      case "Road": return "e.g. Large pothole near bus stop";
      case "Water": return "e.g. Broken pipe leaking water continuously";
      case "Garbage": return "e.g. Overflowing garbage bin on main street";
      case "Electricity": return "e.g. Street light not working for 3 days";
      case "Surroundings": return "e.g. Fallen tree branch blocking the pathway";
      default: return "Describe the issue clearly in a few words";
    }
  };

  const { theme } = useTheme();

  return (
    <div 
      className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-800 dark:text-white pb-12"
      style={{
        backgroundImage: theme === "dark"
          ? "radial-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 0)"
          : "radial-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 0)",
        backgroundSize: "24px 24px"
      }}
    >
      {loading && <FullPageSpinner message="Submitting report and checking nearby suggestions..." />}

      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-4 sticky top-0 z-20 shadow-sm dark:shadow-md">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link 
            to="/dashboard" 
            className="flex items-center text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white transition font-semibold text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1.5" />
            Back
          </Link>
          <span className="text-gray-300 dark:text-gray-600 font-light">|</span>
          <h1 className="text-lg font-black tracking-tight text-slate-800 dark:text-white">Report an Issue</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto mt-8 px-4 relative z-10">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900/60 backdrop-blur-md border border-gray-200 dark:border-gray-800/80 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-8">
          
          {/* 1. ISSUE DETAILS */}
          <section>
            <h2 className="text-sm font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-2 border-b border-gray-200 dark:border-gray-800/85 pb-2 mb-4">
              <span className="w-1.5 h-3 bg-emerald-500 rounded-full inline-block"></span>
              1. Issue Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1.5">Category (Read-Only)</label>
                <input
                  type="text"
                  value={form.category}
                  readOnly
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800/80 text-slate-500 dark:text-gray-500 cursor-not-allowed outline-none font-semibold text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1.5">Title *</label>
                <input
                  name="title"
                  placeholder={getPlaceholder()}
                  value={form.title}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors font-medium text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1.5">Description *</label>
                <textarea
                  name="description"
                  placeholder="Describe the issue clearly"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors font-medium text-sm resize-none"
                  required
                />
              </div>
            </div>
          </section>

          {/* 2. LOCATION SECTION */}
          <section>
            <h2 className="text-sm font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase flex justify-between items-center border-b border-gray-200 dark:border-gray-800/85 pb-2 mb-4">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-3 bg-emerald-500 rounded-full inline-block"></span>
                2. Location *
              </span>
              <button 
                type="button" 
                onClick={handleUseMyLocation} 
                className="text-xs bg-emerald-500/10 text-emerald-605 dark:text-emerald-400 hover:bg-emerald-500/20 px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition border border-emerald-500/10 hover:border-emerald-500/20"
              >
                {isGpsLoading ? (
                  <Spinner className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <GpsIcon className="w-3.5 h-3.5" />
                )}
                {isGpsLoading ? "Locating..." : "Use GPS"}
              </button>
            </h2>
            
            <div className="space-y-4">
              <div className="h-64 border border-gray-200 dark:border-gray-800/85 rounded-xl relative overflow-hidden group z-0">
                <MapContainer center={coords.latitude ? [coords.latitude, coords.longitude] : [11.0168, 76.9558]} zoom={13} className="h-full w-full z-0">
                  <TileLayer attribution="© OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker setCoords={setCoords} />
                  <RecenterMap coords={coords} />
                  {coords.latitude && <Marker position={[coords.latitude, coords.longitude]} />}
                </MapContainer>
                <button 
                  type="button" 
                  onClick={() => setIsFullscreenMap(true)} 
                  className="absolute bottom-4 right-4 bg-white/95 dark:bg-gray-900/90 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-xl font-bold text-sm shadow-xl z-[400] opacity-80 group-hover:opacity-100 transition duration-300 text-slate-800 dark:text-white"
                >
                  Fullscreen Map
                </button>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-1">Latitude</label>
                  <input readOnly value={coords.latitude} className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 text-gray-500 text-xs cursor-not-allowed font-mono" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-1">Longitude</label>
                  <input readOnly value={coords.longitude} className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 text-gray-500 text-xs cursor-not-allowed font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1.5">Location Text (Optional)</label>
                <input
                  name="locationText"
                  placeholder="e.g. Near Sai Baba Colony signal"
                  value={form.locationText}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors font-medium text-sm"
                />
              </div>
            </div>
          </section>

          {/* 3. PHOTO UPLOAD */}
          <section>
            <h2 className="text-sm font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-2 border-b border-gray-200 dark:border-gray-800/85 pb-2 mb-4">
              <span className="w-1.5 h-3 bg-emerald-500 rounded-full inline-block"></span>
              3. Visual Evidence
            </h2>
            
            <div className="mb-4">
              <label className="block w-full border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-emerald-500/50 hover:bg-gray-100/30 dark:hover:bg-gray-900/30 rounded-2xl p-6 text-center cursor-pointer transition duration-300">
                <span className="text-slate-500 dark:text-gray-400 font-semibold text-sm block mb-1">Click to upload photos (Max 4)</span>
                <span className="text-xs text-slate-400 dark:text-gray-500">Supports JPG, PNG</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {photos.map((src, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl border border-gray-200 dark:border-gray-800/80 overflow-hidden group">
                    <img src={src} alt="Preview" className="object-cover w-full h-full" />
                    <button 
                      type="button" 
                      onClick={() => removePhoto(idx)} 
                      className="absolute top-1.5 right-1.5 bg-red-500/90 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition duration-200"
                      title="Remove image"
                    >
                      <CloseIcon className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <button 
            type="submit" 
            disabled={loading} 
            className={`w-full py-4 rounded-xl font-bold text-gray-950 transition-all transform hover:-translate-y-0.5 ${
              loading
                ? "bg-emerald-500/50 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)]"
            }`}
          >
            {loading ? "Processing..." : "Submit Report"}
          </button>
        </form>
      </div>

      {/* Fullscreen Map Modal */}
      {isFullscreenMap && (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col">
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center shadow-md z-10 shrink-0">
            <h3 className="font-bold text-slate-900 dark:text-white">Select Location (Click Map)</h3>
            <button 
              onClick={() => setIsFullscreenMap(false)} 
              className="bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 px-4 py-2 rounded-xl font-bold text-sm border border-gray-200 dark:border-gray-700 transition text-slate-800 dark:text-white"
            >
              Close map
            </button>
          </div>
          <div className="flex-grow relative z-0">
            <MapContainer center={coords.latitude ? [coords.latitude, coords.longitude] : [11.0168, 76.9558]} zoom={13} className="h-full w-full z-0">
              <TileLayer attribution="© OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker setCoords={setCoords} />
              <RecenterMap coords={coords} />
              {coords.latitude && <Marker position={[coords.latitude, coords.longitude]} />}
            </MapContainer>
          </div>
        </div>
      )}

      {/* Duplicate Detection Modal */}
      {duplicateSuggestions && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-fadeIn">
            <div className="w-12 h-12 bg-orange-500/10 text-orange-655 dark:text-orange-400 border border-orange-500/20 rounded-full flex items-center justify-center text-2xl mb-4 mx-auto">
              ⚠️
            </div>
            <h2 className="text-2xl font-black text-center mb-2 tracking-tight text-slate-900 dark:text-white">Similar Issue Detected!</h2>
            <p className="text-slate-655 dark:text-gray-400 text-center text-sm mb-6 leading-relaxed">
              There is an existing issue reported within 300 meters matching your category. Upvoting is recommended to avoid duplicates.
            </p>

            <div className="bg-slate-50 dark:bg-gray-950/80 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-emerald-600 dark:text-emerald-400 text-base">{duplicateSuggestions[0].title}</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400 mt-1.5 leading-relaxed line-clamp-2">{duplicateSuggestions[0].description}</p>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                disabled={loading} 
                onClick={() => handleUpvoteExisting(duplicateSuggestions[0]._id)} 
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold text-gray-950 transition-colors flex items-center justify-center gap-2"
              >
                <UpvoteIcon className="w-4 h-4 text-gray-950" />
                Upvote Existing Issue
              </button>
              
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                <span className="mx-3 text-[10px] text-slate-400 dark:text-gray-600 font-bold uppercase tracking-wider">or</span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
              </div>

              <button 
                disabled={loading} 
                onClick={() => executeSubmit(true)} 
                className="w-full py-3 bg-transparent border border-gray-200 dark:border-gray-800 hover:bg-slate-100 dark:hover:bg-gray-850 hover:border-gray-300 dark:hover:border-gray-700 text-slate-700 dark:text-gray-300 rounded-xl font-bold transition-all"
              >
                This is a different issue, Submit New
              </button>
              
              <button 
                disabled={loading} 
                onClick={() => setDuplicateSuggestions(null)} 
                className="w-full py-2 text-slate-550 hover:text-slate-800 dark:text-gray-500 dark:hover:text-white text-sm font-semibold transition-colors mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportIssue;