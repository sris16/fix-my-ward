import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { 
  ArrowLeftIcon, 
  LocationIcon, 
  ReportsIcon, 
  UpvoteIcon 
} from "../components/SvgIcon";
import { CardSkeleton } from "../components/LoadingSkeleton";

function MyReports() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyIssues = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5000/api/issues/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIssues(data);
      } catch (error) {
        console.error("Error fetching my issues:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyIssues();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Resolved": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
      case "In Progress": return "bg-blue-500/10 text-blue-400 border-blue-500/25";
      default: return "bg-orange-500/10 text-orange-400 border-orange-500/25";
    }
  };

  return (
    <div 
      className="min-h-screen bg-gray-950 text-white pb-12"
      style={{
        backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 0)",
        backgroundSize: "24px 24px"
      }}
    >
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 p-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link 
            to="/dashboard" 
            className="flex items-center text-gray-400 hover:text-white transition font-semibold text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1.5" />
            Back
          </Link>
          <span className="text-gray-600 font-light">|</span>
          <h1 className="text-lg font-black tracking-tight">My Reports</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto mt-8 px-4 relative z-10">
        {loading ? (
          <div className="grid gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/80 rounded-2xl p-10 text-center shadow-lg">
             <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-6 mx-auto">
               <ReportsIcon className="w-8 h-8" />
             </div>
             <h2 className="text-2xl font-bold tracking-tight text-white mb-2">No Reports Yet</h2>
             <p className="text-gray-400 mb-6 leading-relaxed font-light text-sm max-w-sm mx-auto">You haven't reported any civic issues yet. Be the voice of your neighborhood.</p>
             <Link 
               to="/report" 
               className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-bold rounded-xl transition shadow-lg hover:shadow-emerald-500/25 transform hover:-translate-y-0.5"
             >
               Report an Issue
             </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {issues.map((issue) => (
              <div key={issue._id} className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/80 rounded-2xl p-6 shadow-lg transition duration-300 hover:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight mb-1.5">{issue.title}</h2>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className="bg-gray-800 text-gray-300 px-2.5 py-1 rounded-lg">
                        {issue.category}
                      </span>
                      <span className="text-gray-500">
                        {new Date(issue.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </span>
                    </div>
                  </div>
                  <div className={`px-3.5 py-1.5 border rounded-full text-xs font-bold ${getStatusColor(issue.status)}`}>
                    {issue.status}
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-4 leading-relaxed font-light line-clamp-3">
                  {issue.description}
                </p>

                {issue.locationText && (
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-4 font-medium">
                    <LocationIcon className="w-3.5 h-3.5 text-gray-500" />
                    {issue.locationText}
                  </p>
                )}

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-800/60">
                   <div className="flex items-center gap-2">
                     <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Priority:</span>
                     <span className="text-white text-sm font-semibold">{issue.priority}</span>
                   </div>
                   <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/10">
                     <UpvoteIcon className="w-3.5 h-3.5 text-emerald-400" />
                     <span>{issue.upvotes?.length || 0} Upvotes</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyReports;
