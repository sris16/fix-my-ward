import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ArrowLeftIcon, 
  ProfileIcon, 
  ReportsIcon, 
  LogoutIcon 
} from "../components/SvgIcon";

function Profile() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ reported: 0 });
  const [profile, setProfile] = useState({
    name: localStorage.getItem("name") || "Citizen",
    email: localStorage.getItem("email") || "citizen@fixmyward.in",
    role: localStorage.getItem("role") || "citizen",
    joined: "May 2026"
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch reports count
        const { data: userIssues } = await axios.get("http://localhost:5000/api/issues/my", { headers });
        setStats({ reported: userIssues.length });

        // Fetch authenticated user credentials
        const { data: me } = await axios.get("http://localhost:5000/api/auth/me", { headers });
        if (me) {
          setProfile({
            name: me.name || "Citizen",
            email: me.email || "citizen@fixmyward.in",
            role: me.role || "citizen",
            joined: me.createdAt ? new Date(me.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : "May 2026"
          });
          localStorage.setItem("name", me.name || "");
          localStorage.setItem("email", me.email || "");
          localStorage.setItem("role", me.role || "");
        }
      } catch (e) {
        console.error("Error loading profile details:", e);
      }
    };
    fetchProfileData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <div 
      className="min-h-screen bg-gray-950 text-white relative overflow-hidden"
      style={{
        backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 0)",
        backgroundSize: "24px 24px"
      }}
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full mix-blend-multiply filter blur-[128px] pointer-events-none"></div>

      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 p-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              to="/dashboard" 
              className="flex items-center text-gray-400 hover:text-white transition font-semibold text-sm"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-1.5" />
              Back
            </Link>
            <span className="text-gray-600 font-light">|</span>
            <h1 className="text-lg font-black tracking-tight">Profile</h1>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto mt-12 px-4 relative z-10">
        <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/80 rounded-2xl p-8 shadow-xl">
          
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full mx-auto mb-3.5 flex items-center justify-center shadow-lg border border-emerald-500/20 text-gray-950 font-black text-2xl">
              {profile.name[0]?.toUpperCase()}
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">{profile.name}</h2>
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mt-0.5">Active Sentinel</p>
          </div>

          {/* Explicit User Details Section */}
          <div className="bg-gray-950/80 border border-gray-800/60 rounded-xl p-4 mb-6 space-y-3.5">
            <div className="flex justify-between text-xs items-center">
              <span className="text-gray-500 font-medium">Name</span>
              <span className="text-white font-extrabold">{profile.name}</span>
            </div>
            <div className="flex justify-between text-xs items-center">
              <span className="text-gray-500 font-medium">Email</span>
              <span className="text-white font-extrabold break-all ml-4 text-right max-w-[180px]">{profile.email}</span>
            </div>
            <div className="flex justify-between text-xs items-center">
              <span className="text-gray-500 font-medium">Role</span>
              <span className="text-emerald-400 font-black uppercase text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {profile.role}
              </span>
            </div>
            <div className="flex justify-between text-xs items-center">
              <span className="text-gray-500 font-medium">Joined</span>
              <span className="text-white font-extrabold">{profile.joined}</span>
            </div>
          </div>

          <div className="flex justify-center gap-6 mb-6">
            <div className="bg-gray-950/40 border border-gray-800/60 rounded-xl p-4 w-full shadow-inner flex flex-col items-center justify-center">
              <p className="text-3xl font-black text-emerald-400 tracking-tight">{stats.reported}</p>
              <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-wider">Issues Reported</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-3.5 bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm"
          >
            <LogoutIcon className="w-4 h-4 text-red-400" />
            Logout Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
