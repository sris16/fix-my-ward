import React from "react";
import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import { AdminAuthProvider, useAdminAuth } from "../context/AdminAuthContext";
import AdminLayout from "../layouts/AdminLayout";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Issues from "../pages/Issues";
import IssueDetails from "../pages/Issues/IssueDetails";
import Departments from "../pages/Departments";
import Analytics from "../pages/Analytics";
import Citizens from "../pages/Citizens";
import LiveMonitor from "../pages/LiveMonitor";
import Notifications from "../pages/Notifications";
import Settings from "../pages/Settings";
import AccessDenied from "../pages/AccessDenied/AccessDenied";
import NotFound from "../pages/NotFound/NotFound";
import Loading from "../pages/Loading/Loading";

// 🔐 Protected Route guard for Admin Portal
const AdminProtectedRoute = () => {
  const { admin, token, loading } = useAdminAuth();

  if (loading) {
    return <Loading />;
  }

  if (!token || !admin) {
    return <Navigate to="/admin/login" replace />;
  }

  if (admin.role !== "admin") {
    return <Navigate to="/admin/access-denied" replace />;
  }

  return <Outlet />;
};

export default function AdminRoutes() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        
        {/* Protected Admin Routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="issues" element={<Issues />} />
            <Route path="issues/:id" element={<IssueDetails />} />
            <Route path="departments" element={<Departments />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="citizens" element={<Citizens />} />
            <Route path="live-monitor" element={<LiveMonitor />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="access-denied" element={<AccessDenied />} />
        <Route path="loading" element={<Loading />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AdminAuthProvider>
  );
}
