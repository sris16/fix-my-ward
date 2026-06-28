import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../hooks/useTheme";

export default function NotFound() {
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-slate-500/[0.02] rounded-full filter blur-[80px] pointer-events-none"></div>

      <div className="max-w-md bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800/80 rounded-3xl p-8 shadow-lg relative z-10 space-y-6">
        <div className="w-16 h-16 bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-gray-800 mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">404</h1>
          <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">Page Not Found</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto font-light leading-relaxed">
            The page you are looking for doesn't exist or has been relocated to another sub-terminal coordinate.
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
