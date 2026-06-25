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
import { useTheme } from "../hooks/useTheme";

function MyReports() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

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
      case "Resolved": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25";
      case "In Progress": return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25";
      default: return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/25";
    }
  };

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
          <h1 className="text-lg font-black tracking-tight text-slate-800 dark:text-white">My Reports</h1>
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
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-2xl p-10 text-center shadow-sm dark:shadow-lg">
             <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 mx-auto">
               <ReportsIcon className="w-8 h-8" />
             </div>
             <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">No Reports Yet</h2>
             <p className="text-slate-655 dark:text-gray-400 mb-6 leading-relaxed font-light text-sm max-w-sm mx-auto">You haven't reported any civic issues yet. Be the voice of your neighborhood.</p>
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
              <div key={issue._id} className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-2xl p-6 shadow-sm dark:shadow-lg transition duration-300 hover:border-gray-300 dark:hover:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-1.5">{issue.title}</h2>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className="bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 px-2.5 py-1 rounded-lg">
                        {issue.category}
                      </span>
                      <span className="text-slate-500 dark:text-gray-500">
                        {new Date(issue.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
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

                {issue.locationText && (
                  <p className="text-xs text-slate-500 dark:text-gray-500 flex items-center gap-1.5 mb-4 font-medium">
                    <LocationIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                    {issue.locationText}
                  </p>
                )}

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-800/60">
                   <div className="flex items-center gap-2">
                     <span className="text-slate-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Priority:</span>
                     <span className="text-slate-800 dark:text-white text-sm font-semibold">{issue.priority}</span>
                   </div>
                   <div className="flex items-center gap-1.5 text-emerald-650 dark:text-emerald-400 font-bold text-xs bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/10">
                     <UpvoteIcon className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
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
