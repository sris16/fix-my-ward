import { useNavigate } from "react-router-dom";
import {
  RoadIcon,
  WaterIcon,
  SurroundingsIcon,
  ReportsIcon,
  PublicIcon,
  HeatmapIcon,
  BellIcon,
  LogoutIcon,
} from "../components/SvgIcon";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div 
      className="min-h-screen bg-gray-950 text-white p-6 relative overflow-hidden"
      style={{
        backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 0)",
        backgroundSize: "24px 24px"
      }}
    >
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-10 mt-6 border-b border-gray-900 pb-6">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Citizen Portal
            </h1>
            <p className="text-gray-400 mt-1 text-sm font-medium">Empowering your voice in community decisions</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate("/notifications")}
              className="p-3 bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-xl hover:bg-gray-800 hover:border-gray-700 transition shadow-lg text-gray-400 hover:text-white"
              title="Notifications"
            >
              <BellIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center px-4 py-2.5 bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-xl text-sm font-bold text-red-400 hover:text-red-300 hover:border-red-500/30 transition shadow-lg"
            >
              <LogoutIcon className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </header>

        <div className="mb-10">
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2.5 text-gray-300 tracking-wide uppercase text-xs">
            <span className="w-1.5 h-4 bg-emerald-500 rounded-full inline-block"></span>
            Report a New Issue
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <ActionCard 
              title="Road Issue" 
              desc="Potholes, broken paths" 
              icon={<RoadIcon className="w-8 h-8 text-orange-400" />} 
              color="border-orange-500/20 hover:border-orange-500/40 bg-orange-500/[0.02] hover:bg-orange-500/[0.06]"
              onClick={() => navigate("/report?category=Road")}
            />
            <ActionCard 
              title="Water Issue" 
              desc="Leaks, contamination" 
              icon={<WaterIcon className="w-8 h-8 text-blue-400" />} 
              color="border-blue-500/20 hover:border-blue-500/40 bg-blue-500/[0.02] hover:bg-blue-500/[0.06]"
              onClick={() => navigate("/report?category=Water")}
            />
            <ActionCard 
              title="Surroundings" 
              desc="Garbage, fallen trees" 
              icon={<SurroundingsIcon className="w-8 h-8 text-emerald-400" />} 
              color="border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/[0.02] hover:bg-emerald-500/[0.06]"
              onClick={() => navigate("/report?category=Surroundings")}
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2.5 text-gray-300 tracking-wide uppercase text-xs">
            <span className="w-1.5 h-4 bg-teal-500 rounded-full inline-block"></span>
            Explore & Track
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <ActionCard 
              title="My Reports" 
              desc="Track your submissions" 
              icon={<ReportsIcon className="w-8 h-8 text-purple-400" />} 
              color="border-purple-500/20 hover:border-purple-500/40 bg-purple-500/[0.02] hover:bg-purple-500/[0.06]"
              onClick={() => navigate("/my-reports")}
            />
            <ActionCard 
              title="Public Reports" 
              desc="View issues near you" 
              icon={<PublicIcon className="w-8 h-8 text-teal-400" />} 
              color="border-teal-500/20 hover:border-teal-500/40 bg-teal-500/[0.02] hover:bg-teal-500/[0.06]"
              onClick={() => navigate("/public-reports")}
            />
            <ActionCard 
              title="Heat Map" 
              desc="See issue hotspots" 
              icon={<HeatmapIcon className="w-8 h-8 text-red-400" />} 
              color="border-red-500/20 hover:border-red-500/40 bg-red-500/[0.02] hover:bg-red-500/[0.06]"
              onClick={() => navigate("/map?view=heatmap")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Card Component
function ActionCard({ title, desc, icon, color, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`text-left p-6 rounded-2xl bg-gray-900/60 backdrop-blur-sm border ${color} transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl group`}
    >
      <div className="mb-4 group-hover:scale-105 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-1.5 tracking-tight">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed font-light">{desc}</p>
    </button>
  );
}

export default Dashboard;
