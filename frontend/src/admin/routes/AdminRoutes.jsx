import React, { lazy, Suspense } from "react";
import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import { AdminAuthProvider, useAdminAuth } from "../context/AdminAuthContext";
import AdminLayout from "../layouts/AdminLayout";
import Loading from "../pages/Loading/Loading";

// Lazy-loaded Admin pages
const Login = lazy(() => import("../pages/Login"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Issues = lazy(() => import("../pages/Issues"));
const IssueDetails = lazy(() => import("../pages/Issues/IssueDetails"));
const Departments = lazy(() => import("../pages/Departments"));
const DepartmentDetails = lazy(() => import("../pages/Departments/DepartmentDetails"));
const Analytics = lazy(() => import("../pages/Analytics"));
const Citizens = lazy(() => import("../pages/Citizens"));
const CitizenProfile = lazy(() => import("../pages/Citizens/CitizenProfile"));
const LiveMonitor = lazy(() => import("../pages/LiveMonitor"));
const Notifications = lazy(() => import("../pages/Notifications"));
const Settings = lazy(() => import("../pages/Settings"));
const AccessDenied = lazy(() => import("../pages/AccessDenied/AccessDenied"));
const NotFound = lazy(() => import("../pages/NotFound/NotFound"));

// 🔐 Protected Route guard for Admin Portal
const AdminProtectedRoute = () => {
  const { admin, token, loading } = useAdminAuth();

  if (loading) {
    return <Loading />;
  }

  if (!token || !admin) {
    return <Navigate to="/admin/login" replace />;
  }

  const validAdminRoles = [
    "admin",
    "super-admin",
    "Super Administrator",
    "Municipal Commissioner",
    "Department Manager",
    "Department Officer",
    "Viewer"
  ];

  if (!validAdminRoles.includes(admin.role)) {
    return <Navigate to="/admin/access-denied" replace />;
  }

  return <Outlet />;
};

export default function AdminRoutes() {
  return (
    <AdminAuthProvider>
      <Suspense fallback={<Loading />}>
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
              <Route path="departments/:departmentName" element={<DepartmentDetails />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="citizens" element={<Citizens />} />
              <Route path="citizens/:id" element={<CitizenProfile />} />
              <Route path="live-monitor" element={<LiveMonitor />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          <Route path="access-denied" element={<AccessDenied />} />
          <Route path="loading" element={<Loading />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AdminAuthProvider>
  );
}

