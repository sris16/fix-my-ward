import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../hooks/useTheme";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { SunIcon, MoonIcon } from "../../../components/SvgIcon";

export default function Login() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { login, isAuthenticated, error: authError, setError } = useAdminAuth();

  const [email, setEmail] = useState("admin@fixmyward.gov.in");
  const [password, setPassword] = useState("adminpassword123");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");
    if (setError) setError("");

    if (!email.trim() || !password.trim()) {
      setValidationError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate("/admin/dashboard", { replace: true });
    }
  };

  const displayError = validationError || authError;

  return (
    <div 
      className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-800 dark:text-white flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-200"
      style={{
        backgroundImage: theme === "dark" 
          ? "radial-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 0)" 
          : "radial-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 0)",
        backgroundSize: "24px 24px"
      }}
    >
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/[0.03] dark:bg-emerald-500/5 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-teal-500/[0.03] dark:bg-teal-500/5 rounded-full filter blur-[100px] pointer-events-none"></div>

      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6">
        <button 
          onClick={toggleTheme}
          className="p-2.5 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl transition text-slate-500 dark:text-gray-400"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <SunIcon className="w-4 h-4 text-emerald-400" /> : <MoonIcon className="w-4 h-4 text-emerald-600" />}
        </button>
      </div>

      <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800/80 rounded-3xl p-8 shadow-xl relative z-10">
        
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 dark:text-emerald-450 rounded-2xl flex items-center justify-center border border-emerald-500/25 mb-4 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>
          <span className="text-[12px] font-black tracking-[0.25em] text-slate-900 dark:text-white uppercase leading-none">FIXMYWARD</span>
          <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/25 px-2.5 py-0.5 rounded-full mt-2">
            ADMIN PANEL
          </span>
        </div>

        <div className="mb-6 text-center">
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Command Login</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-light">Access the municipal oversight dashboard</p>
        </div>

        {displayError && (
          <div className="bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 p-3 rounded-2xl mb-4 text-xs font-semibold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>{displayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Secure Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Access Token / Password
              </label>
              <a href="#" className="text-[10px] text-emerald-600 dark:text-emerald-450 hover:underline font-bold uppercase">
                Forgot Token?
              </a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-gray-950 text-xs font-extrabold rounded-xl transition duration-150 shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Authorizing...</span>
                </>
              ) : (
                <span>Access Command Dashboard</span>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 text-center text-[10px] text-gray-450 dark:text-gray-550 font-medium">
        <span>Fix My Ward Authority Management Portal &middot; Coimbatore Corporation</span>
      </div>
    </div>
  );
}
