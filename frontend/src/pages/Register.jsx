import { useState, useEffect } from "react";
import axiosInstance from "axios";
import { useNavigate, Link } from "react-router-dom";
import { EyeIcon, EyeOffIcon, PublicIcon } from "../components/SvgIcon";
import { Spinner } from "../components/LoadingSkeleton";
import { useTheme } from "../hooks/useTheme";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();

  const navigate = useNavigate();

  // Handle Returning User Flow (detect existing session)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setLoading(true);
    setError("");

    try {
      await axiosInstance.post("http://localhost:5000/api/auth/register", form);
      
      alert("Registration successful! Please login with your credentials.");
      
      // Navigate strictly to login as per capstone requirements
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Email may already be registered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950 text-slate-800 dark:text-white relative overflow-hidden px-4"
      style={{
        backgroundImage: theme === "dark"
          ? "radial-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 0)"
          : "radial-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 0)",
        backgroundSize: "24px 24px"
      }}
    >
      {/* Visual background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/[0.03] dark:bg-emerald-500/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[128px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/[0.03] dark:bg-teal-500/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[128px] pointer-events-none"></div>
      
      <div className="bg-white dark:bg-gray-900/60 backdrop-blur-md border border-gray-200 dark:border-gray-800/80 p-8 sm:p-10 rounded-3xl shadow-sm dark:shadow-2xl w-full max-w-md z-10 transition duration-300">
        
        {/* Branding Badge */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-3.5 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <PublicIcon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-605 dark:text-emerald-400">Fix My Ward</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-2">Create Account</h2>
          <p className="text-slate-500 dark:text-gray-400 mt-1 text-xs">Join Fix My Ward to report community issues</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl mb-6 text-xs text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium text-sm"
                required
                minLength="6"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-slate-850 dark:hover:text-white transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOffIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {/* Real-time Interactive Password Feedback */}
            {form.password && form.password.length < 6 && (
              <p className="text-[10px] text-orange-655 dark:text-orange-400 mt-1.5 font-semibold tracking-wide flex items-center gap-1.5">
                ⚠️ Password must be at least 6 characters
              </p>
            )}
            {form.password && form.password.length >= 6 && (
              <p className="text-[10px] text-emerald-650 dark:text-emerald-400 mt-1.5 font-semibold tracking-wide flex items-center gap-1.5">
                ✓ Secure password strength verified
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-gray-950 transition-all transform hover:-translate-y-0.5 mt-6 flex items-center justify-center gap-2 ${
              loading 
                ? "bg-emerald-500/50 cursor-not-allowed" 
                : "bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)]"
            }`}
          >
            {loading && <Spinner className="w-4 h-4 text-gray-950" />}
            {loading ? "Creating Account..." : "Register Account"}
          </button>
        </form>

        <p className="text-center text-slate-500 dark:text-gray-500 text-xs mt-8">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-605 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-extrabold hover:underline transition">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
