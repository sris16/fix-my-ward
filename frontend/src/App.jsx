import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ReportIssue from "./pages/ReportIssue";
import MyReports from "./pages/MyReports";
import PublicReports from "./pages/PublicReports";
import MapPage from "./pages/MapPage";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Notifications from "./pages/Notifications";

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
    </Routes>
  );
}

export default App;
