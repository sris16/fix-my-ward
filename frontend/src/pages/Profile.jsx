import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

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
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 pointer-events-none"></div>

      <header className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-gray-400 hover:text-white transition">
              ← Back
            </Link>
            <h1 className="text-xl font-bold">Profile</h1>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto mt-12 px-4 relative z-10">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl text-center">
          <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl shadow-lg">
            👤
          </div>
          <h2 className="text-2xl font-bold mb-1">Citizen</h2>
          <p className="text-gray-400 text-sm mb-8">Active Member</p>

          <div className="flex justify-center gap-6 mb-8">
            <div className="bg-gray-800 rounded-xl p-4 w-32 shadow-inner">
              <p className="text-3xl font-black text-emerald-400">{stats.reported}</p>
              <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">Issues Reported</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-3 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-xl font-bold transition shadow-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
