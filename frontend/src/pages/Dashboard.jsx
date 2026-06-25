import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import {
  RoadIcon,
  WaterIcon,
  SurroundingsIcon,
  ReportsIcon,
  PublicIcon,
  HeatmapIcon,
  BellIcon,
  LogoutIcon,
  LocationIcon,
  ProfileIcon,
  ArrowRightIcon,
  UpvoteIcon,
  SunIcon,
  MoonIcon,
  CloseIcon,
} from "../components/SvgIcon";
import { Spinner } from "../components/LoadingSkeleton";
import { useTheme } from "../hooks/useTheme";

function Dashboard() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);
  const [myIssues, setMyIssues] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState("map"); // "map" | "heatmap"
  const [greeting, setGreeting] = useState("Welcome");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  // User Profile extracted from database or token payload
  const [profile, setProfile] = useState({
    name: localStorage.getItem("name") || "Citizen",
    email: localStorage.getItem("email") || "citizen@fixmyward.in",
    id: "FMW-827391",
    joined: "May 2026",
    location: "Coimbatore Central",
    role: localStorage.getItem("role") || "citizen"
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    navigate("/login");
  };

  useEffect(() => {
    // ⏰ Dynamic time of day greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    // Close notification dropdown when clicking outside
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);

    // ESC key closes report modal
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsReportModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch current user details from /api/auth/me securely
        let userDetails = { 
          name: localStorage.getItem("name") || "Citizen", 
          email: localStorage.getItem("email") || "citizen@fixmyward.in",
          role: localStorage.getItem("role") || "citizen"
        };
        
        try {
          const { data: me } = await axios.get("http://localhost:5000/api/auth/me", { headers });
          if (me) {
            userDetails = me;
            localStorage.setItem("name", me.name || "");
            localStorage.setItem("email", me.email || "");
            localStorage.setItem("role", me.role || "");
          }
        } catch (meError) {
          console.error("Error fetching current user profile from /me:", meError);
        }

        // Fetch all issues
        const { data: allIssues } = await axios.get("http://localhost:5000/api/issues");
        setIssues(allIssues);

        // Fetch user's issues
        const { data: userIssues } = await axios.get("http://localhost:5000/api/issues/my", { headers });
        setMyIssues(userIssues);

        // Fetch notifications
        const { data: notifs } = await axios.get("http://localhost:5000/api/notifications", { headers });
        setNotifications(notifs);

        setProfile({
          name: userDetails.name || "Citizen",
          email: userDetails.email || "citizen@fixmyward.in",
          id: userDetails._id ? `FMW-${userDetails._id.slice(-6).toUpperCase()}` : "FMW-827391",
          joined: userDetails.createdAt ? new Date(userDetails.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : "May 2026",
          location: "Coimbatore Central",
          role: userDetails.role || "citizen"
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error("Error marking notification as read:", e);
    }
  };

  // Metric Calculation & Gamification
  const totalReported = myIssues.length;
  const pendingCount = myIssues.filter(i => i.status !== "Resolved").length;
  const resolvedCount = myIssues.filter(i => i.status === "Resolved").length;
  const totalCommunityVotes = myIssues.reduce((acc, issue) => acc + (issue.upvotes?.length || 0), 0);
  
  // High-fidelity SaaS Impact Score: (Resolved * 25) + (Submitted * 10) + (Upvotes * 5)
  const impactScore = (resolvedCount * 25) + (totalReported * 10) + (totalCommunityVotes * 5);
  
  // Tier Levels: Each 50 points yields a Level
  const currentLevel = Math.floor(impactScore / 50) + 1;
  const currentLevelFloor = (currentLevel - 1) * 50;
  const nextLevelFloor = currentLevel * 50;
  const levelProgress = Math.min(((impactScore - currentLevelFloor) / 50) * 100, 100);

  // Badge Status Calculation
  const badges = [
    { id: "active", title: "Active Citizen", desc: "Reported 1+ civic issues", earned: totalReported >= 1, color: "from-emerald-400 to-teal-500" },
    { id: "first", title: "First Sentinel", desc: "Your initial community submission", earned: totalReported >= 1, color: "from-blue-400 to-indigo-500" },
    { id: "supporter", title: "Community Supporter", desc: "Earned 1+ verification votes", earned: totalCommunityVotes >= 1, color: "from-amber-400 to-orange-500" },
    { id: "reporter", title: "Top Sentinel", desc: "Reported 5+ community issues", earned: totalReported >= 5, color: "from-purple-500 to-pink-500" }
  ];

  // Issue Counts by Category for the premium analytics SVG chart
  const roadCount = issues.filter(i => i.category === "Road").length;
  const waterCount = issues.filter(i => i.category === "Water").length;
  const surroundingsCount = issues.filter(i => i.category === "Surroundings").length;
  const maxCategoryCount = Math.max(roadCount, waterCount, surroundingsCount, 1);

  // Calculate percentage of category charts
  const roadPercent = (roadCount / maxCategoryCount) * 100;
  const waterPercent = (waterCount / maxCategoryCount) * 100;
  const surroundingsPercent = (surroundingsCount / maxCategoryCount) * 100;

  // Notification states
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div 
      className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-800 dark:text-white pb-16 relative overflow-hidden"
      style={{
        backgroundImage: theme === "dark" 
          ? "radial-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 0)" 
          : "radial-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 0)",
        backgroundSize: "24px 24px"
      }}
    >
      {/* Background radial glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/[0.03] dark:bg-emerald-500/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-teal-500/[0.03] dark:bg-teal-500/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[180px] pointer-events-none"></div>

      {/* Modern SaaS Topbar Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-md border-b border-gray-200 dark:border-gray-800/80 sticky top-0 z-30 shadow-sm dark:shadow-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <PublicIcon className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <span className="text-sm font-black tracking-[0.2em] text-slate-900 dark:text-white">FIXMYWARD</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-bold ml-2">CITIZEN</span>
          </div>

          <div className="flex items-center gap-4 relative" ref={dropdownRef}>
            
            {/* Theme Switcher Button */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 bg-gray-100 dark:bg-gray-900/60 hover:bg-gray-200 dark:hover:bg-gray-800/80 border border-gray-200 dark:border-gray-800 rounded-xl transition text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <SunIcon className="w-4 h-4 text-emerald-400" /> : <MoonIcon className="w-4 h-4 text-emerald-600" />}
            </button>

            {/* Notification Bell Dropdown Button */}
            <button 
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-2.5 bg-gray-100 dark:bg-gray-900/60 hover:bg-gray-200 dark:hover:bg-gray-800/80 border border-gray-200 dark:border-gray-800 rounded-xl transition text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white relative"
              title="Toggle notifications dropdown"
            >
              <BellIcon className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-gray-950 text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Premium Interactive Notification Dropdown */}
            {showNotifDropdown && (
              <div className="absolute right-0 top-14 w-80 bg-white dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl dark:shadow-2xl z-40 p-4 text-left overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Recent Alerts</h4>
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                    {unreadNotifications} new
                  </span>
                </div>
                
                <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-[11px] text-gray-500 italic py-4 text-center">No alerts logged in your ward.</p>
                  ) : (
                    notifications.slice(0, 4).map((notif) => (
                      <div 
                      key={notif._id} 
                      className={`p-2.5 rounded-xl border transition-colors flex items-start gap-2.5 ${
                        notif.read 
                          ? "bg-gray-50/50 dark:bg-gray-950/20 border-transparent text-slate-400 dark:text-gray-500" 
                          : "bg-gray-50 dark:bg-gray-950/75 border-gray-200 dark:border-gray-800/80 text-slate-700 dark:text-gray-300"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.read ? "bg-gray-300 dark:bg-gray-800" : "bg-emerald-500"}`}></span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium leading-relaxed break-words">{notif.message}</p>
                        <span className="text-[9px] text-gray-400 dark:text-gray-600 block mt-1">
                          {new Date(notif.createdAt).toLocaleDateString(undefined, { dateStyle: 'short' })}
                        </span>
                      </div>
                        {!notif.read && (
                          <button 
                            onClick={() => handleMarkAsRead(notif._id)}
                            className="text-[9px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold uppercase shrink-0"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 text-center">
                  <Link 
                    to="/notifications" 
                    onClick={() => setShowNotifDropdown(false)}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-bold hover:underline"
                  >
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}

            <button 
              onClick={() => navigate("/profile")}
              className="p-2.5 bg-gray-100 dark:bg-gray-900/60 hover:bg-gray-200 dark:hover:bg-gray-800/80 border border-gray-200 dark:border-gray-800 rounded-xl transition text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white flex items-center gap-1.5 text-xs font-bold"
              title="Profile Settings"
            >
              <ProfileIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              Profile
            </button>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 dark:bg-gray-900/60 hover:bg-red-500/10 border border-gray-200 dark:border-gray-800 hover:border-red-500/20 rounded-xl text-xs font-bold text-slate-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition"
            >
              <LogoutIcon className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 mt-8 relative z-10">
        
        {/* Dynamic Greeting & Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Welcome motivational banner */}
          <div className="lg:col-span-2 bg-gradient-to-r from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-gray-900/40 backdrop-blur-sm border border-emerald-500/20 dark:border-emerald-500/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm dark:shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.01] dark:bg-emerald-500/[0.02] rounded-full filter blur-3xl pointer-events-none group-hover:bg-emerald-500/[0.02] dark:group-hover:bg-emerald-500/[0.04] transition duration-500"></div>
            <div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-emerald-500/20">Citizen Champion</span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-4 mb-2 leading-tight">
                {greeting}, {profile.name}
              </h1>
              <p className="text-slate-600 dark:text-gray-400 text-sm font-light leading-relaxed max-w-lg mb-6">
                Your actions build a cleaner, safer, and highly organized city. Report civic complaints instantly, verify duplicate reports nearby, and track resolution timelines in real-time.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setIsReportModalOpen(true)} 
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-extrabold text-xs rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <span>Report New Issue</span>
                <ArrowRightIcon className="w-3 h-3 text-gray-950" />
              </button>
              <button 
                onClick={() => navigate("/public-reports")} 
                className="px-5 py-2.5 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-slate-800 dark:text-white border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 font-bold text-xs rounded-xl transition"
              >
                Explore Local Issues
              </button>
            </div>
          </div>

          {/* Gamified Citizen Profile Panel (Upgraded) */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-3xl p-6 flex flex-col justify-between shadow-sm dark:shadow-xl">
            <div className="flex items-center gap-3.5 pb-4 border-b border-gray-200 dark:border-gray-800/60">
              <div className="w-12 h-12 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center border border-emerald-500/20 text-gray-950 font-black text-xl shadow-md">
                {profile.name[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight break-all">{profile.name}</h3>
                <span className="text-[9px] text-gray-500 font-bold block uppercase tracking-wider mt-0.5">{profile.id}</span>
              </div>
            </div>

            <div className="space-y-3.5 my-4">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Name</span>
                <span className="text-slate-700 dark:text-gray-300 font-bold">{profile.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Email</span>
                <span className="text-slate-700 dark:text-gray-300 font-bold truncate max-w-[140px]">{profile.email}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Role</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold uppercase text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
                  {profile.role}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Joined Ward</span>
                <span className="text-slate-700 dark:text-gray-300 font-bold">{profile.joined}</span>
              </div>
              <div className="flex justify-between text-xs pt-1">
                <span className="text-emerald-600 dark:text-emerald-400 font-black">Level {currentLevel} Sentinel</span>
                <span className="text-gray-500 font-medium">{impactScore} pts</span>
              </div>
              
              {/* Dynamic Level Progress Bar */}
              <div className="w-full">
                <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-950 rounded-full overflow-hidden border border-gray-200 dark:border-gray-800/80">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${levelProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-1">
                  <span>Tier Progress</span>
                  <span>{Math.round(levelProgress)}% to Level {currentLevel + 1}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-gray-800/60 flex justify-between items-center text-xs">
              <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Impact Rating</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black">{impactScore > 100 ? "Gold Shield" : impactScore > 40 ? "Silver Shield" : "Bronze Sentinel"}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Trust and Achievements Badges Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Community Impact Card & Scores */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-emerald-500 rounded-full inline-block"></span>
                Neighborhood Trust Index
              </h3>
              
              <div className="flex items-center gap-4 my-5">
                <div className="relative w-16 h-16 rounded-full border-4 border-emerald-500/20 dark:border-emerald-500/10 border-t-emerald-500 border-r-emerald-500 border-b-emerald-500 flex items-center justify-center font-black text-emerald-600 dark:text-emerald-400 text-xl shadow-sm dark:shadow-md">
                  94%
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-white">Coimbatore Dispatch Speed</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">Municipal authorities review 94% of reported duplications within 24h.</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800/60 grid grid-cols-2 gap-4 text-center">
              <div className="bg-gray-50 dark:bg-gray-950/40 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800/50">
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{resolvedCount}</span>
                <p className="text-[9px] text-gray-500 uppercase font-bold mt-0.5">Your Resolutions</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-950/40 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800/50">
                <span className="text-lg font-black text-teal-600 dark:text-teal-400">{impactScore}</span>
                <p className="text-[9px] text-gray-500 uppercase font-bold mt-0.5">Impact Score</p>
              </div>
            </div>
          </div>

          {/* Achievement and badge system */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm dark:shadow-xl">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-3 bg-teal-500 rounded-full inline-block"></span>
              Civic Sentinel Badges
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
              {badges.map((badge) => (
                <div 
                  key={badge.id}
                  className={`p-4 rounded-2xl border text-center transition flex flex-col items-center justify-between group h-full ${
                    badge.earned 
                      ? "bg-slate-50 dark:bg-gray-950/80 border-emerald-500/20 shadow-sm dark:shadow-lg" 
                      : "bg-slate-50/50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800/60 opacity-40"
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg shadow-md border ${
                    badge.earned 
                      ? `bg-gradient-to-tr ${badge.color} text-gray-950 border-white/10 group-hover:scale-105 transition-transform duration-300` 
                      : "bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-800"
                  }`}>
                    {badge.earned ? "✓" : "🔒"}
                  </div>
                  <div className="mt-3">
                    <h4 className="text-[11px] font-extrabold text-slate-800 dark:text-white leading-tight">{badge.title}</h4>
                    <p className="text-[9px] text-gray-500 leading-snug mt-1 max-w-[100px] mx-auto">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Trends & Nearby issues split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Premium Analytics CSS/SVG Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm dark:shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-emerald-500 rounded-full inline-block"></span>
                  Reporting Velocity Analytics
                </h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Complaint distributions across Coimbatore</p>
              </div>
              
              <div className="flex items-center gap-4 text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-orange-400 inline-block"></span>Road ({roadCount})</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-400 inline-block"></span>Water ({waterCount})</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block"></span>Environs ({surroundingsCount})</span>
              </div>
            </div>

            {/* Custom 3D SVG Bar Chart */}
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-bold">
                  <span className="text-gray-500 dark:text-gray-400">Road Complaints</span>
                  <span className="text-orange-500">{roadCount} registered</span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-1000"
                    style={{ width: `${roadPercent}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-bold">
                  <span className="text-gray-500 dark:text-gray-400">Water Leaks & Outages</span>
                  <span className="text-blue-500">{waterCount} registered</span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: `${waterPercent}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-bold">
                  <span className="text-gray-500 dark:text-gray-400">Surroundings & Sanitation</span>
                  <span className="text-emerald-500">{surroundingsCount} registered</span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: `${surroundingsPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation Action Panel & Alerts */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-teal-500 rounded-full inline-block"></span>
                Nearby Civic Recommendations
              </h3>

              <div className="space-y-3.5 mt-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-950/60 border border-gray-200 dark:border-gray-800/80 rounded-2xl flex items-start gap-2.5">
                  <span className="text-emerald-500 dark:text-emerald-400 text-xs mt-0.5">💡</span>
                  <div>
                    <h4 className="text-[11px] font-extrabold text-slate-800 dark:text-white">Validate Local Water Leaks</h4>
                    <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">A water pipe leak reported nearby is seeking verification votes to advance dispatch tier.</p>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-950/60 border border-gray-200 dark:border-gray-800/80 rounded-2xl flex items-start gap-2.5">
                  <span className="text-emerald-500 dark:text-emerald-400 text-xs mt-0.5">📍</span>
                  <div>
                    <h4 className="text-[11px] font-extrabold text-slate-800 dark:text-white">Submit a Pothole Coordinate</h4>
                    <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">Coimbatore Central has open service windows for Road repairs this week.</p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate("/public-reports")}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-gray-950 text-xs font-bold rounded-xl transition mt-5 flex items-center justify-center gap-1.5"
            >
              Verify Public Reports
              <ArrowRightIcon className="w-3.5 h-3.5 text-gray-950" />
            </button>
          </div>
        </div>

        {/* Main Dashboard Interactive Split Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Interactive Map Widget & Activity Feed */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* SaaS Interactive Mini Map Widget */}
            <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl">
              <div className="p-5 border-b border-gray-200 dark:border-gray-800/80 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-extrabold tracking-wider uppercase text-slate-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="w-1.5 h-3.5 bg-emerald-500 rounded-full inline-block"></span>
                    Live Proximity Monitor
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Real-time local complaints visual overview</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveTab("map")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeTab === "map" 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                        : "text-gray-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    Markers
                  </button>
                  <button 
                    onClick={() => setActiveTab("heatmap")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeTab === "heatmap" 
                        ? "bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/20" 
                        : "text-gray-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    Heatmap
                  </button>
                </div>
              </div>

              <div className="h-72 w-full relative z-10 bg-gray-100 dark:bg-gray-950">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center">

                    <p className="text-xs text-gray-500 uppercase tracking-widest animate-pulse">Loading map overlays...</p>
                  </div>
                ) : (
                  <MapContainer
                    center={[11.0168, 76.9558]} 
                    zoom={12}
                    style={{ height: "100%", width: "100%" }}
                    zoomControl={false}
                  >
                    <TileLayer
                      key={theme}
                      attribution={theme === "dark" ? "© CartoDB" : "© OpenStreetMap"}
                      url={theme === "dark" 
                        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png" 
                        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      }
                    />
                    {issues.map((issue) => {
                      if (!issue.location?.coordinates) return null;
                      const [lng, lat] = issue.location.coordinates;

                      if (activeTab === "heatmap") {
                        const intensity = issue.upvotes?.length || 0;
                        const radius = 25 + (intensity * 5);
                        const color = intensity > 5 ? "#ef4444" : intensity > 2 ? "#f97316" : "#eab308";
                        
                        return (
                          <CircleMarker
                            key={`mini-heat-${issue._id}`}
                            center={[lat, lng]}
                            radius={radius}
                            stroke={false}
                            pathOptions={{ fillColor: color, fillOpacity: 0.2 }}
                          />
                        );
                      }

                      return (
                        <CircleMarker
                          key={`mini-mark-${issue._id}`}
                          center={[lat, lng]}
                          radius={6}
                          pathOptions={{
                            color: "#10b981",
                            fillColor: "#10b981",
                            fillOpacity: 0.8,
                            weight: 2
                          }}
                        >
                          <Popup>
                            <div className="p-1 min-w-[120px] text-gray-950">
                              <h4 className="font-extrabold text-xs">{issue.title}</h4>
                              <p className="text-[10px] text-gray-500 uppercase font-bold mt-0.5">{issue.category}</p>
                            </div>
                          </Popup>
                        </CircleMarker>
                      );
                    })}
                  </MapContainer>
                )}
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-950/40 border-t border-gray-200 dark:border-gray-800/80 flex items-center justify-between text-xs">
                <span className="text-gray-500">Monitor tracking {issues.length} active neighborhood nodes</span>
                <Link to="/map" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-bold hover:underline transition flex items-center gap-1">
                  Fullscreen Map view
                  <ArrowRightIcon className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Recent Civic Activity Timeline (Upgraded) */}
            <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm dark:shadow-xl">
              <h2 className="text-sm font-extrabold tracking-wider uppercase text-slate-700 dark:text-gray-300 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-teal-500 rounded-full inline-block"></span>
                Dynamic Activity Log
              </h2>

              {loading ? (
                <div className="space-y-4">
                  <div className="h-10 bg-gray-100 dark:bg-gray-800/50 rounded-xl animate-pulse"></div>
                  <div className="h-10 bg-gray-100 dark:bg-gray-800/50 rounded-xl animate-pulse"></div>
                </div>
              ) : myIssues.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-4 text-center">No reports registered to your account yet.</p>
              ) : (
                <div className="space-y-5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-200 dark:before:bg-gray-800">
                  {myIssues.slice(0, 4).map((issue) => (
                    <div key={issue._id} className="relative pl-8 flex items-start justify-between group">
                      <span className="absolute left-1.5 top-2 w-3.5 h-3.5 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center group-hover:scale-110 transition duration-200"></span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight break-all">{issue.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 font-light leading-relaxed">
                          Verification Score: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+{issue.upvotes?.length || 0} votes</span> &middot; Filed in {profile.location}
                        </p>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold mt-1 inline-block">
                          Created {new Date(issue.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`px-2.5 py-1 border rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          issue.status === "Resolved" 
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                            : issue.status === "In Progress"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                            : "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                        }`}>
                          {issue.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Quick Action grid & Trust Impact metrics */}
          <div className="space-y-8">
            
            {/* Quick Actions Panel */}
            <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm dark:shadow-xl">
              <h2 className="text-sm font-extrabold tracking-wider uppercase text-slate-700 dark:text-gray-300 mb-5 flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-emerald-500 rounded-full inline-block"></span>
                Quick Issue Triggers
              </h2>

              <div className="space-y-3">
                <QuickActionButton 
                  title="Report Road Pothole" 
                  icon={<RoadIcon className="w-4 h-4 text-orange-400" />} 
                  onClick={() => navigate("/report?category=Road")} 
                />
                <QuickActionButton 
                  title="Report Water Leak" 
                  icon={<WaterIcon className="w-4 h-4 text-blue-400" />} 
                  onClick={() => navigate("/report?category=Water")} 
                />
                <QuickActionButton 
                  title="Report Trash Accumulation" 
                  icon={<SurroundingsIcon className="w-4 h-4 text-emerald-400" />} 
                  onClick={() => navigate("/report?category=Surroundings")} 
                />
              </div>
            </div>

            {/* Nearby Issues Summary Widget */}
            <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm dark:shadow-xl">
              <h2 className="text-sm font-extrabold tracking-wider uppercase text-slate-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-teal-500 rounded-full inline-block"></span>
                Public Ward Issues
              </h2>

              {loading ? (
                <div className="space-y-3">
                  <div className="h-8 bg-gray-150 dark:bg-gray-800/40 rounded-xl animate-pulse"></div>
                  <div className="h-8 bg-gray-150 dark:bg-gray-800/40 rounded-xl animate-pulse"></div>
                </div>
              ) : issues.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No public ward complaints registered.</p>
              ) : (
                <div className="space-y-3">
                  {issues.slice(0, 3).map((issue) => (
                    <div 
                      key={`nearby-${issue._id}`}
                      className="p-3 bg-gray-50 dark:bg-gray-950/60 hover:bg-gray-100 dark:hover:bg-gray-900 border border-gray-200 dark:border-gray-800/80 rounded-2xl transition flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <h4 className="font-extrabold text-slate-800 dark:text-white truncate break-all">{issue.title}</h4>
                        <span className="text-[9px] text-gray-500 dark:text-gray-400 font-bold block mt-0.5">{issue.category} &middot; {issue.status}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 bg-white dark:bg-gray-900 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-800 shrink-0">
                        <UpvoteIcon className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                        <span className="text-[10px] text-slate-700 dark:text-gray-300 font-black">{issue.upvotes?.length || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Core Track Actions */}
            <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm dark:shadow-xl">
              <h2 className="text-sm font-extrabold tracking-wider uppercase text-slate-700 dark:text-gray-300 mb-5 flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-emerald-500 rounded-full inline-block"></span>
                Core Submissions
              </h2>

              <div className="grid grid-cols-2 gap-3.5">
                <Link 
                  to="/my-reports" 
                  className="bg-gray-50 dark:bg-gray-950/80 hover:bg-gray-100 dark:hover:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 p-4 rounded-2xl text-center transition group flex flex-col items-center justify-center"
                >
                  <ReportsIcon className="w-6 h-6 text-purple-500 dark:text-purple-400 mb-2 group-hover:scale-105 transition-transform" />
                  <span className="text-xs font-bold text-slate-800 dark:text-white">My Actions</span>
                </Link>
                <Link 
                  to="/public-reports" 
                  className="bg-gray-50 dark:bg-gray-950/80 hover:bg-gray-100 dark:hover:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 p-4 rounded-2xl text-center transition group flex flex-col items-center justify-center"
                >
                  <PublicIcon className="w-6 h-6 text-teal-500 dark:text-teal-400 mb-2 group-hover:scale-105 transition-transform" />
                  <span className="text-xs font-bold text-slate-800 dark:text-white">Public Feed</span>
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Category Selection Modal */}
      {isReportModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-gray-950/80 backdrop-blur-md animate-fade-in"
          onClick={() => setIsReportModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl animate-scale-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsReportModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800/60 transition"
              title="Close Modal"
            >
              <CloseIcon className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                What type of issue would you like to report?
              </h2>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1.5 font-medium">
                Select a category below to report and locate a new civic issue.
              </p>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              {/* Road Issue Card */}
              <div 
                onClick={() => {
                  setIsReportModalOpen(false);
                  navigate("/report?category=Road");
                }}
                className="bg-slate-50 dark:bg-gray-950/40 hover:bg-orange-500/[0.02] dark:hover:bg-orange-500/[0.04] border border-gray-200 dark:border-gray-800/80 hover:border-orange-500/30 dark:hover:border-orange-500/30 rounded-2xl p-5 text-center cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex flex-col items-center group"
              >
                <div className="w-12 h-12 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center border border-orange-500/20 group-hover:scale-110 transition-transform">
                  <RoadIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-4 mb-2">🚧 Road Issue</h3>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-relaxed font-light">
                  Potholes, damaged roads, traffic signs, road markings, road obstructions.
                </p>
              </div>

              {/* Water Issue Card */}
              <div 
                onClick={() => {
                  setIsReportModalOpen(false);
                  navigate("/report?category=Water");
                }}
                className="bg-slate-50 dark:bg-gray-950/40 hover:bg-blue-500/[0.02] dark:hover:bg-blue-500/[0.04] border border-gray-200 dark:border-gray-800/80 hover:border-blue-500/30 dark:hover:border-blue-500/30 rounded-2xl p-5 text-center cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex flex-col items-center group"
              >
                <div className="w-12 h-12 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <WaterIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-4 mb-2">💧 Water Issue</h3>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-relaxed font-light">
                  Water leakage, pipe bursts, drainage problems, sewage overflow, water contamination.
                </p>
              </div>

              {/* Surroundings Issue Card */}
              <div 
                onClick={() => {
                  setIsReportModalOpen(false);
                  navigate("/report?category=Surroundings");
                }}
                className="bg-slate-50 dark:bg-gray-950/40 hover:bg-emerald-500/[0.02] dark:hover:bg-emerald-500/[0.04] border border-gray-200 dark:border-gray-800/80 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 rounded-2xl p-5 text-center cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex flex-col items-center group"
              >
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <SurroundingsIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-4 mb-2">🌿 Surroundings Issue</h3>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-relaxed font-light">
                  Garbage accumulation, fallen trees, street cleanliness, public environment issues.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Metric Card
function MetricCard({ title, value, desc, icon }) {
  return (
    <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-2xl p-5 shadow-sm dark:shadow-lg relative group overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/[0.01] rounded-full filter blur-xl group-hover:bg-emerald-500/[0.02] transition"></div>
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{title}</span>
        <div className="w-7 h-7 bg-gray-50 dark:bg-gray-950 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-800">
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{value}</h3>
      <p className="text-[10px] text-gray-500 font-medium mt-1 leading-none">{desc}</p>
    </div>
  );
}

// Reusable Quick Action Button
function QuickActionButton({ title, icon, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-950/60 hover:bg-gray-100 dark:hover:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 rounded-2xl text-left transition group"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-8 h-8 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-800 group-hover:scale-105 transition-transform">
          {icon}
        </div>
        <span className="text-xs font-bold text-slate-800 dark:text-white tracking-tight">{title}</span>
      </div>
      <ArrowRightIcon className="w-3.5 h-3.5 text-gray-500 group-hover:text-slate-800 dark:group-hover:text-white transition-colors" />
    </button>
  );
}

export default Dashboard;
