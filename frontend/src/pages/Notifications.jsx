import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { 
  ArrowLeftIcon, 
  BellIcon, 
  EyeIcon, 
  CloseIcon 
} from "../components/SvgIcon";
import { CardSkeleton } from "../components/LoadingSkeleton";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔔 Mark as read
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `http://localhost:5000/api/notifications/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 🔁 Update UI instantly
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, read: true } : n
        )
      );

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const token = localStorage.getItem("token");

        const { data } = await axios.get(
          "http://localhost:5000/api/notifications",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setNotifications(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  return (
    <div 
      className="bg-gray-950 text-white min-h-screen pb-12"
      style={{
        backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 0)",
        backgroundSize: "24px 24px"
      }}
    >
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 p-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link 
            to="/dashboard" 
            className="flex items-center text-gray-400 hover:text-white transition font-semibold text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1.5" />
            Back
          </Link>
          <span className="text-gray-600 font-light">|</span>
          <h1 className="text-lg font-black tracking-tight">Notifications</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto mt-8 px-4 relative z-10">
        {loading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/80 rounded-2xl p-10 text-center shadow-lg">
             <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-6 mx-auto">
               <BellIcon className="w-8 h-8" />
             </div>
             <h2 className="text-2xl font-bold tracking-tight text-white mb-2">No Notifications</h2>
             <p className="text-gray-400 text-sm leading-relaxed font-light max-w-sm mx-auto">You're all caught up! There are no updates or alerts for your reports right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`p-5 rounded-2xl border transition duration-200 relative group flex items-start gap-4 ${
                  n.read 
                    ? "bg-gray-900/40 border-gray-800/60 opacity-75" 
                    : "bg-gray-900/80 border-emerald-500/20 shadow-lg shadow-emerald-500/[0.02]"
                }`}
              >
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0 animate-pulse"></span>
                )}
                
                <div className="flex-grow">
                  <p className="text-sm font-medium text-white leading-relaxed">{n.message}</p>
                  
                  {!n.read && (
                    <button
                      onClick={() => markAsRead(n._id)}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-gray-950 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl font-bold transition duration-200"
                    >
                      <EyeIcon className="w-3.5 h-3.5" />
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;