import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../hooks/useTheme";

export default function AccessDenied() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <div 
      className="min-h-[70vh] flex flex-col justify-center items-center p-6 text-center relative overflow-hidden"
      style={{
        backgroundImage: theme === "dark" 
          ? "radial-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 0)" 
          : "radial-gradient(rgba(0, 0, 0, 0.01) 1px, transparent 0)",
        backgroundSize: "24px 24px"
      }}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-500/[0.02] rounded-full filter blur-[80px] pointer-events-none"></div>

      <div className="max-w-md bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800/80 rounded-3xl p-8 shadow-lg relative z-10 space-y-6">
        <div className="w-16 h-16 bg-red-500/10 text-red-550 dark:text-red-400 rounded-2xl flex items-center justify-center border border-red-500/25 mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black text-red-550 dark:text-red-400 tracking-tighter">403</h1>
          <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">Access Denied</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto font-light leading-relaxed">
            You do not have permission to access this page. Please contact your administrator for credentials or security configurations.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-extrabold text-xs rounded-xl shadow-md transition duration-150"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
