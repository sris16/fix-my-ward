import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Issues from "../pages/Issues";
import Departments from "../pages/Departments";
import Analytics from "../pages/Analytics";
import Citizens from "../pages/Citizens";
import LiveMonitor from "../pages/LiveMonitor";
import Notifications from "../pages/Notifications";
import Settings from "../pages/Settings";
import AccessDenied from "../pages/AccessDenied/AccessDenied";
import NotFound from "../pages/NotFound/NotFound";
import Loading from "../pages/Loading/Loading";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="issues" element={<Issues />} />
        <Route path="departments" element={<Departments />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="citizens" element={<Citizens />} />
        <Route path="live-monitor" element={<LiveMonitor />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="access-denied" element={<AccessDenied />} />
        <Route path="loading" element={<Loading />} />
        {/* Wildcard fallback maps to the Admin 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
