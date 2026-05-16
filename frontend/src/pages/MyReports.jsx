import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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
      case "Resolved": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50";
      case "In Progress": return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      default: return "bg-orange-500/20 text-orange-400 border-orange-500/50";
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-12">
      <header className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link to="/dashboard" className="text-gray-400 hover:text-white transition">
            ← Back
          </Link>
          <h1 className="text-xl font-bold">My Reports</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto mt-8 px-4">
        {loading ? (
          <div className="text-center text-gray-500 py-20">Loading your reports...</div>
        ) : issues.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center shadow-lg">
             <div className="text-6xl mb-4">📋</div>
             <h2 className="text-2xl font-bold mb-2">No Reports Yet</h2>
             <p className="text-gray-400 mb-6">You haven't reported any civic issues yet.</p>
             <Link 
               to="/report" 
               className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold transition shadow-lg hover:shadow-emerald-500/20"
             >
               Report an Issue
             </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {issues.map((issue) => (
              <div key={issue._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg transition hover:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">{issue.title}</h2>
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded">
                        {issue.category}
                      </span>
                      <span className="text-gray-500">
                        {new Date(issue.createdAt).toLocaleDateString()}
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

                {issue.locationText && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-4">
                    📍 {issue.locationText}
                  </p>
                )}

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-800">
                   <div className="flex items-center gap-2">
                     <span className="text-gray-400 text-sm font-medium">Priority:</span>
                     <span className="text-white text-sm">{issue.priority}</span>
                   </div>
                   <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm bg-yellow-500/10 px-3 py-1 rounded-lg">
                     👍 {issue.upvotes?.length || 0}
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
