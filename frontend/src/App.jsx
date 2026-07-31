import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import axios from "axios";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy-loaded Citizen pages
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ReportIssue = lazy(() => import("./pages/ReportIssue"));
const MyReports = lazy(() => import("./pages/MyReports"));
const PublicReports = lazy(() => import("./pages/PublicReports"));
const MapPage = lazy(() => import("./pages/MapPage"));
const Profile = lazy(() => import("./pages/Profile"));
const Notifications = lazy(() => import("./pages/Notifications"));
const AdminRoutes = lazy(() => import("./admin/routes/AdminRoutes"));

// Fallback loader component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-900 text-emerald-400">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-sm font-medium text-slate-300">Loading module...</span>
    </div>
  </div>
);

function App() {
  // Handle edge cases: Expired Sessions
  // Setup global axios interceptor to catch 401 Unauthorized responses
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Session expired or corrupted
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          window.location.href = "/register"; // Force redirect to registration
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Root Route: Auto-detect session or go to Registration */}
        <Route 
          path="/" 
          element={
            localStorage.getItem("token") ? <Navigate to="/dashboard" /> : <Navigate to="/register" />
          } 
        />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <ReportIssue />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/my-reports"
          element={
            <ProtectedRoute>
              <MyReports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/public-reports"
          element={
            <ProtectedRoute>
              <PublicReports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <MapPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Admin Portal Nested Routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </Suspense>
  );
}

export default App;

