import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-10 mt-6">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
              Dashboard
            </h1>
            <p className="text-gray-400 mt-1">What would you like to do today?</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => navigate("/notifications")}
              className="p-3 bg-gray-900 border border-gray-800 rounded-full hover:bg-gray-800 transition shadow-lg"
              title="Notifications"
            >
              🔔
            </button>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm font-medium hover:text-red-400 hover:border-red-500/50 transition shadow-lg"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-emerald-500 rounded-full inline-block"></span>
            Report a New Issue
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ActionCard 
              title="Road Issue" 
              desc="Potholes, broken paths" 
              icon="🛣️" 
              color="border-orange-500/50 hover:bg-orange-500/10"
              onClick={() => navigate("/report?category=Road")}
            />
            <ActionCard 
              title="Water Issue" 
              desc="Leaks, contamination" 
              icon="💧" 
              color="border-blue-500/50 hover:bg-blue-500/10"
              onClick={() => navigate("/report?category=Water")}
            />
            <ActionCard 
              title="Surroundings" 
              desc="Garbage, fallen trees" 
              icon="🌳" 
              color="border-emerald-500/50 hover:bg-emerald-500/10"
              onClick={() => navigate("/report?category=Surroundings")}
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-500 rounded-full inline-block"></span>
            Explore & Track
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ActionCard 
              title="My Reports" 
              desc="Track your submissions" 
              icon="📋" 
              color="border-purple-500/50 hover:bg-purple-500/10"
              onClick={() => navigate("/my-reports")}
            />
            <ActionCard 
              title="Public Reports" 
              desc="View issues near you" 
              icon="🌍" 
              color="border-teal-500/50 hover:bg-teal-500/10"
              onClick={() => navigate("/public-reports")}
            />
            <ActionCard 
              title="Heat Map" 
              desc="See issue hotspots" 
              icon="🔥" 
              color="border-red-500/50 hover:bg-red-500/10"
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
      className={`text-left p-6 rounded-2xl bg-gray-900 border ${color} transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl group`}
    >
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-bottom-left">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-400">{desc}</p>
    </button>
  );
}

export default Dashboard;
