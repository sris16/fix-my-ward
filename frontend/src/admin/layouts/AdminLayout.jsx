import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  DashboardIcon,
  IssuesIcon,
  DepartmentsIcon,
  AnalyticsIcon,
  CitizensIcon,
  LiveMonitorIcon,
  NotificationsIcon,
  SettingsIcon,
  MenuCollapseIcon,
  MenuExpandIcon,
  HamburgerIcon
} from "../components/layout/AdminIcons";
import {
  SunIcon,
  MoonIcon,
  BellIcon,
  LogoutIcon,
  ProfileIcon,
  CloseIcon
} from "../../components/SvgIcon";

export default function AdminLayout() {
  const { theme, toggleTheme } = useTheme();
  const { admin, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem("admin-sidebar-collapsed") === "true";
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Sync collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem("admin-sidebar-collapsed", isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  // Close menus on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: DashboardIcon },
    { name: "Issue Management", path: "/admin/issues", icon: IssuesIcon },
    { name: "Departments", path: "/admin/departments", icon: DepartmentsIcon },
    { name: "Analytics", path: "/admin/analytics", icon: AnalyticsIcon },
    { name: "Citizens", path: "/admin/citizens", icon: CitizensIcon },
    { name: "Live Monitor", path: "/admin/live-monitor", icon: LiveMonitorIcon },
    { name: "Notifications", path: "/admin/notifications", icon: NotificationsIcon },
    { name: "Settings", path: "/admin/settings", icon: SettingsIcon },
  ];

  const adminName = admin?.name || "Admin Officer";
  const adminEmail = admin?.email || "admin@fixmyward.gov.in";
  const adminRole = admin?.role ? admin.role.toUpperCase() : "ADMIN";
  const adminDept = admin?.department || "Municipal Operations";

  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const avatarInitials = getInitials(adminName);

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-800 dark:text-white flex transition-colors duration-200">
      
      {/* Background Radial Lights */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/[0.02] dark:bg-emerald-500/[0.03] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-teal-500/[0.015] dark:bg-teal-500/[0.02] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[150px] pointer-events-none z-0"></div>

      {/* MOBILE SIDEBAR DRAWER OVERLAY */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-950/65 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 lg:z-30 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800/80 transition-all duration-300 shadow-sm dark:shadow-xl
          ${isSidebarCollapsed ? "w-[72px]" : "w-64"}
          ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800/80 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/25 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4.5 h-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col">
                <span className="text-[11px] font-black tracking-[0.25em] text-slate-900 dark:text-white leading-none">FMW COMMAND</span>
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-450 uppercase leading-none mt-1">ADMIN PORTAL</span>
              </div>
            )}
          </div>
          
          {/* Mobile close button */}
          <button 
            className="lg:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-slate-500 dark:text-gray-400"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition duration-150 group relative
                  ${isActive 
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15" 
                    : "text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800/40 hover:text-slate-800 dark:hover:text-white border border-transparent"
                  }
                `}
                title={isSidebarCollapsed ? item.name : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-emerald-500 dark:text-emerald-400" : "text-slate-400 dark:text-gray-500 group-hover:text-slate-700 dark:group-hover:text-gray-300"}`} />
                {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
                
                {/* Active left indicator strip */}
                {isActive && (
                  <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-emerald-500 rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800/80 bg-slate-50/50 dark:bg-gray-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-gray-950 font-black text-xs shadow-md shrink-0">
              {avatarInitials}
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <h4 className="text-[11px] font-extrabold text-slate-800 dark:text-white truncate">{adminName}</h4>
                <p className="text-[9px] text-gray-500 truncate">{adminDept}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN WRAPPER CONTAINER */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 relative z-10
          ${isSidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64"}
        `}
      >
        {/* TOP NAVBAR */}
        <header className="h-16 bg-white/80 dark:bg-gray-900/60 backdrop-blur-md border-b border-gray-200 dark:border-gray-800/80 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm dark:shadow-md transition-colors duration-200">
          
          {/* Left Area: Navigation Toggles */}
          <div className="flex items-center gap-3">
            {/* Hamburger trigger for Mobile */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 bg-slate-50 dark:bg-gray-800/50 hover:bg-slate-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl text-slate-500 dark:text-gray-400"
            >
              <HamburgerIcon className="w-4.5 h-4.5" />
            </button>

            {/* Collapse / Expand trigger for Desktop */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:block p-2 bg-slate-50 dark:bg-gray-800/50 hover:bg-slate-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl text-slate-500 dark:text-gray-400"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <MenuExpandIcon className="w-4.5 h-4.5" /> : <MenuCollapseIcon className="w-4.5 h-4.5" />}
            </button>

            {/* Quick Location / Context details */}
            <span className="hidden md:inline-block text-[11px] bg-slate-100 dark:bg-gray-800/60 text-slate-600 dark:text-gray-300 border border-slate-200/50 dark:border-gray-800 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider">
              Coimbatore Command Center &middot; {adminRole}
            </span>
          </div>

          {/* Right Area: Actions (Search, Theme, Alerts, Avatar, Logout) */}
          <div className="flex items-center gap-3">
            
            {/* Mock Search Box */}
            <div className="relative hidden md:block w-48 lg:w-60">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 dark:text-gray-500 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search command panel..."
                className="w-full bg-slate-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded-xl py-1.5 pl-9 pr-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition"
              />
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 bg-slate-50 dark:bg-gray-800/50 hover:bg-slate-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white transition"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <SunIcon className="w-4 h-4 text-emerald-450" /> : <MoonIcon className="w-4 h-4 text-emerald-600" />}
            </button>

            {/* Notification Bell with simulated list */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 bg-slate-50 dark:bg-gray-800/50 hover:bg-slate-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white transition relative"
              >
                <BellIcon className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              </button>

              {/* Notification Overlay Menu */}
              {showNotifications && (
                <div className="absolute right-0 mt-2.5 w-76 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-50 p-4 text-left animate-scale-in">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Critical Alerts</h4>
                    <span className="text-[9px] bg-red-500/10 text-red-650 dark:text-red-400 px-2 py-0.5 rounded-full font-bold">
                      2 Unresolved
                    </span>
                  </div>
                  <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                    <div className="p-2 bg-slate-50 dark:bg-gray-950/40 rounded-xl border border-transparent hover:border-red-500/20 transition">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        <span className="text-[10px] font-black text-red-550 dark:text-red-400 uppercase tracking-wide">Critical Road</span>
                      </div>
                      <p className="text-[11px] font-medium leading-normal">Pothole near Signal reported with 45 upvotes.</p>
                      <span className="text-[9px] text-gray-500 block mt-1">12 minutes ago</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 text-center">
                    <Link
                      to="/admin/notifications"
                      onClick={() => setShowNotifications(false)}
                      className="text-[10px] text-emerald-600 dark:text-emerald-450 hover:underline font-bold uppercase"
                    >
                      View All Alerts
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown Trigger */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 dark:border-gray-800 flex items-center justify-center bg-gradient-to-tr from-emerald-500 to-teal-500 text-gray-950 font-black text-xs hover:opacity-90 transition shadow-sm"
              >
                {avatarInitials}
              </button>

              {/* Profile Dropdown Card */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2.5 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-50 p-3 text-left animate-scale-in">
                  <div className="px-2 py-1.5 border-b border-gray-150 dark:border-gray-800/80 mb-2">
                    <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">{adminName}</p>
                    <p className="text-[10px] text-gray-500 truncate leading-tight mt-0.5">{adminEmail}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      {adminDept}
                    </span>
                  </div>
                  <Link
                    to="/admin/settings"
                    onClick={() => setShowProfileDropdown(false)}
                    className="flex items-center gap-2 px-2 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800/60 hover:text-slate-800 dark:hover:text-white transition"
                  >
                    <ProfileIcon className="w-4 h-4 text-slate-400 dark:text-gray-500" />
                    Admin Settings
                  </Link>
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-2 py-2 mt-1 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition"
                  >
                    <LogoutIcon className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Quick Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-gray-800/50 hover:bg-red-500/10 border border-gray-200 dark:border-gray-800 hover:border-red-500/20 rounded-xl text-xs font-bold text-slate-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition"
              title="Sign out of command panel"
            >
              <LogoutIcon className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto relative z-10">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
