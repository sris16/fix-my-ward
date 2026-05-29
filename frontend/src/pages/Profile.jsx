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

  useEffect(() => {
    // Just fetch user's reports to show a stat
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5000/api/issues/my", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats({ reported: data.length });
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
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
        <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/80 rounded-2xl p-8 shadow-xl text-center">
          <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg border border-emerald-500/20 text-gray-950">
            <ProfileIcon className="w-12 h-12 text-gray-950" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">Citizen</h2>
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-8">Active Member</p>

          <div className="flex justify-center gap-6 mb-8">
            <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-4 w-full shadow-inner flex flex-col items-center justify-center">
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
