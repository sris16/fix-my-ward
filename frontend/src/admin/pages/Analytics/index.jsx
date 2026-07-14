import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { StatCard } from "../../components/ui/StatCard";
import { Table } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { PriorityBadge } from "../../components/ui/PriorityBadge";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

const API_BASE_URL = "http://localhost:5000/api/admin/analytics";

export default function Analytics() {
  const { token } = useAdminAuth();

  // Navigation tab state ('dashboard' | 'reports')
  const [activeTab, setActiveTab] = useState("dashboard");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [timeframe, setTimeframe] = useState("weekly"); // 'daily' | 'weekly' | 'monthly' | 'yearly'

  // Dashboard Data states
  const [overview, setOverview] = useState({});
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [trends, setTrends] = useState([]);
  const [distributions, setDistributions] = useState({
    statusDistribution: [],
    priorityDistribution: []
  });

  // Phase 9: Reports & Export Filter States
  const [reportFilters, setReportFilters] = useState({
    department: "ALL",
    category: "ALL",
    priority: "ALL",
    status: "ALL",
    startDate: "",
    endDate: ""
  });
  const [reportsData, setReportsData] = useState({
    summary: {},
    reports: []
  });
  const [loadingReports, setLoadingReports] = useState(false);

  // Fetch Executive Dashboard Telemetry
  const fetchAnalyticsDashboard = async () => {
    if (!token) return;
    setLoading(true);
    setError(false);

    try {
      const [ovRes, catRes, deptRes, trendRes, distRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/overview`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/categories`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/departments`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/trends?timeframe=${timeframe}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/distributions`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (ovRes.data.success) setOverview(ovRes.data);
      if (catRes.data.success) setCategories(catRes.data.categories || []);
      if (deptRes.data.success) setDepartments(deptRes.data.departments || []);
      if (trendRes.data.success) setTrends(trendRes.data.trends || []);
      if (distRes.data.success) {
        setDistributions({
          statusDistribution: distRes.data.statusDistribution || [],
          priorityDistribution: distRes.data.priorityDistribution || []
        });
      }
    } catch (err) {
      console.error("Failed to fetch analytics telemetry:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Phase 9: Fetch Filtered Reports Dataset
  const fetchReportsData = async () => {
    if (!token) return;
    setLoadingReports(true);

    try {
      const params = new URLSearchParams();
      if (reportFilters.department !== "ALL") params.append("department", reportFilters.department);
      if (reportFilters.category !== "ALL") params.append("category", reportFilters.category);
      if (reportFilters.priority !== "ALL") params.append("priority", reportFilters.priority);
      if (reportFilters.status !== "ALL") params.append("status", reportFilters.status);
      if (reportFilters.startDate) params.append("startDate", reportFilters.startDate);
      if (reportFilters.endDate) params.append("endDate", reportFilters.endDate);

      const res = await axios.get(`${API_BASE_URL}/reports?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setReportsData({
          summary: res.data.summary || {},
          reports: res.data.reports || []
        });
      }
    } catch (err) {
      console.error("Failed to generate analytics report dataset:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsDashboard();
  }, [token, timeframe]);

  useEffect(() => {
    if (activeTab === "reports") {
      fetchReportsData();
    }
  }, [token, activeTab, reportFilters]);

  // Phase 9: Export CSV Logic
  const handleExportCSV = () => {
    const { reports } = reportsData;
    if (!reports || reports.length === 0) return;

    const headers = [
      "Ticket ID",
      "Issue Title",
      "Category",
      "Assigned Department",
      "Priority Severity",
      "Lifecycle Status",
      "Assigned Officer",
      "Reported Citizen",
      "Ward / Location",
      "Created Date"
    ];

    const escapeCSV = (field) => {
      if (field === null || field === undefined) return "";
      const stringified = String(field);
      if (stringified.includes(",") || stringified.includes('"') || stringified.includes("\n")) {
        return `"${stringified.replace(/"/g, '""')}"`;
      }
      return stringified;
    };

    const csvRows = [
      headers.join(","),
      ...reports.map((row) =>
        [
          escapeCSV(row.ticketId),
          escapeCSV(row.title),
          escapeCSV(row.category),
          escapeCSV(row.department),
          escapeCSV(row.priority),
          escapeCSV(row.status),
          escapeCSV(row.assignedOfficer),
          escapeCSV(row.reportedBy),
          escapeCSV(row.locationText),
          escapeCSV(row.createdAt ? new Date(row.createdAt).toISOString().split("T")[0] : "")
        ].join(",")
      )
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Fix_My_Ward_Analytics_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Phase 9: Export PDF / Print Preview Logic
  const handleExportPDF = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  // Custom Recharts Tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-slate-700/80 text-xs backdrop-blur-md">
          <p className="font-black text-emerald-400 mb-1">{label}</p>
          {payload.map((entry, idx) => (
            <p key={idx} className="flex justify-between gap-4 py-0.5">
              <span className="text-gray-300 font-medium">{entry.name}:</span>
              <strong className="font-mono text-white font-black">{entry.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading && activeTab === "dashboard") {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-3xl w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (error && activeTab === "dashboard") {
    return (
      <EmptyState
        title="Error Loading Intelligence Telemetry"
        description="Unable to connect to municipal analytics engines or aggregate metrics. Please verify your connection or retry."
        action={
          <button
            onClick={fetchAnalyticsDashboard}
            className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-700 transition"
          >
            Retry Request
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Top Bar & Module Switcher (Dashboard vs Reports) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Municipal Intelligence Platform
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-light mt-0.5">
            Real-time urban telemetry, division efficiency curves, and executive audit reporting for Coimbatore
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-250 dark:border-gray-800 shadow-inner">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
              activeTab === "dashboard"
                ? "bg-white dark:bg-gray-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-emerald-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C19.496 3 20 3.504 20 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Visual Telemetry
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
              activeTab === "reports"
                ? "bg-white dark:bg-gray-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-blue-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Reports & Export Center
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EXECUTIVE VISUAL DASHBOARD (PHASES 2-8, 10)                        */}
      {/* ========================================================================= */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          
          {/* Timeframe Switcher */}
          <div className="flex justify-between items-center bg-slate-50/80 dark:bg-gray-900/40 p-3 rounded-2xl border border-gray-200 dark:border-gray-800">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 pl-2">
              Time Series Granularity
            </span>
            <div className="flex items-center gap-1.5">
              {["daily", "weekly", "monthly", "yearly"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                    timeframe === tf
                      ? "bg-emerald-500 text-gray-950 shadow-sm"
                      : "text-slate-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Executive Hero KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Registered Complaints"
              value={overview.totalIssues || 0}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              }
              trend="+4.2% volume trend"
              color="blue"
            />

            <StatCard
              title="Global Resolution Rate"
              value={`${overview.resolutionRate || 0}%`}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-emerald-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              trend="SLA Target: ≥ 85%"
              color="green"
            />

            <StatCard
              title="Average Resolution Time"
              value={overview.averageResolutionTime || "24h"}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-amber-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              trend={`${overview.verified || 0} currently verified`}
              color="yellow"
            />

            <StatCard
              title="Citizen Engagement Base"
              value={overview.citizenParticipationCount || 0}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-purple-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              }
              trend={`${overview.officerCount || 7} active field officers`}
              color="purple"
            />
          </div>

          {/* Phase 5 Time Series Trend Curves (Area Chart) */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <SectionTitle title="Operational Trend Curves" subtitle={`Chronological volume progression over ${timeframe} intervals`} />
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-blue-500">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Reports Created
                </span>
                <span className="flex items-center gap-1.5 text-emerald-500">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Resolved
                </span>
                <span className="flex items-center gap-1.5 text-amber-500">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> Verified
                </span>
              </div>
            </div>

            <div className="h-80 w-full pt-4">
              {trends.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  No trend telemetry available for the selected timeframe.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                    <XAxis dataKey="period" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="reportsCreated" name="Created" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCreated)" />
                    <Area type="monotone" dataKey="reportsResolved" name="Resolved" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorResolved)" />
                    <Area type="monotone" dataKey="reportsVerified" name="Verified" stroke="#f59e0b" strokeWidth={2} fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Category Analytics & Department Workload Grid (Bar Charts) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Phase 3 Category Breakdown Bar Chart */}
            <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <SectionTitle title="Volume by Civic Category" subtitle="Distribution across urban infrastructure segments" />
                <div className="h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categories.slice(0, 7)} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} horizontal={true} vertical={false} />
                      <XAxis type="number" stroke="#64748b" fontSize={11} allowDecimals={false} />
                      <YAxis type="category" dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} width={100} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Total Issues" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={16} />
                      <Bar dataKey="resolvedPercentage" name="Resolved %" fill="#10b981" radius={[0, 8, 8, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-150 dark:border-gray-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                {categories.slice(0, 3).map((cat, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 dark:bg-gray-950/70 rounded-xl border border-gray-150 dark:border-gray-800">
                    <span className="text-[10px] text-gray-500 uppercase block font-bold truncate">{cat.category}</span>
                    <span className="font-black text-slate-800 dark:text-white">{cat.count} cases ({cat.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Phase 4 Department Performance Bar Chart */}
            <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <SectionTitle title="Department Efficiency Ratios" subtitle="Assigned vs. resolved metrics across municipal teams" />
                <div className="h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departments} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                      <XAxis dataKey="department" stroke="#64748b" fontSize={10} angle={-25} textAnchor="end" interval={0} />
                      <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="top" height={30} iconType="circle" />
                      <Bar dataKey="assigned" name="Assigned" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={18} />
                      <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[6, 6, 0, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-150 dark:border-gray-800/80 flex items-center justify-between text-xs text-gray-500">
                <span>Average Division SLA: <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">≥ 78% Efficiency</strong></span>
                <span>Staff Roster: <strong className="text-slate-800 dark:text-gray-300 font-extrabold">{overview.officerCount} Active Staff</strong></span>
              </div>
            </div>

          </div>

          {/* Priority & Status Distributions (Pie & Donut Charts) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Status Donut Chart */}
            <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <SectionTitle title="Lifecycle Status Distribution" subtitle="Active ticket breakdown by workflow stage" />
                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributions.statusDistribution.filter((d) => d.count > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="count"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {distributions.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || "#3b82f6"} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-gray-150 dark:border-gray-800/80 text-[11px]">
                {distributions.statusDistribution.map((item, idx) => (
                  <span key={idx} className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-gray-300">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }}></span>
                    {item.name}: <strong className="text-slate-900 dark:text-white">{item.count}</strong>
                  </span>
                ))}
              </div>
            </div>

            {/* Priority Pie Chart */}
            <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <SectionTitle title="Severity Priority Breakdown" subtitle="Hazard weighting distribution across reported cases" />
                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributions.priorityDistribution.filter((d) => d.count > 0)}
                        cx="50%"
                        cy="50%"
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="count"
                        label={({ name, count }) => `${name}: ${count}`}
                      >
                        {distributions.priorityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || "#f59e0b"} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-gray-150 dark:border-gray-800/80 text-[11px]">
                {distributions.priorityDistribution.map((item, idx) => (
                  <span key={idx} className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-gray-300">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }}></span>
                    {item.name}: <strong className="text-slate-900 dark:text-white">{item.count}</strong>
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Executive Summary Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden">
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="space-y-2 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-6 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                CITIZEN ENGAGEMENT
              </span>
              <h3 className="text-base font-black text-white">
                {overview.citizenParticipationCount || 11} Active Citizen Reporters
              </h3>
              <p className="text-xs text-gray-400 font-light leading-relaxed">
                Coimbatore citizens are actively logging civic complaints across all 100 wards, fostering direct municipal accountability.
              </p>
            </div>

            <div className="space-y-2 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-6 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md border border-blue-500/20">
                SLA RESOLUTION SPEED
              </span>
              <h3 className="text-base font-black text-white">
                {overview.averageResolutionTime || "24h"} Average Closeout SLA
              </h3>
              <p className="text-xs text-gray-400 font-light leading-relaxed">
                Continuous field worker tracking and department triage have streamlined ticket resolution speeds citywide.
              </p>
            </div>

            <div className="space-y-2 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                TRIAGE VERIFICATION
              </span>
              <h3 className="text-base font-black text-white">
                {overview.verificationRate || 27}% Verified & Allocated
              </h3>
              <p className="text-xs text-gray-400 font-light leading-relaxed">
                Every submitted ticket undergoes administrative inspection before dispatch to municipal field crews.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REPORTS & EXPORT CENTER (PHASES 9 & 10)                            */}
      {/* ========================================================================= */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          
          {/* Print/Export Header Banner */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2.5 py-0.5 rounded-md border border-blue-500/20">
                  EXECUTIVE AUDIT GENERATOR
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-800 dark:text-white mt-1">
                Filtered Data Reports & Export Center
              </h2>
              <p className="text-xs text-gray-500 font-light">
                Filter municipal complaints across date ranges, departments, and priority severities. Export instantly as CSV or formatted PDF.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end print:hidden">
              <button
                onClick={handleExportCSV}
                disabled={!reportsData.reports || reportsData.reports.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-gray-950 font-black text-xs rounded-xl shadow-md transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Export CSV ({reportsData.reports ? reportsData.reports.length : 0})
              </button>

              <button
                onClick={handleExportPDF}
                disabled={!reportsData.reports || reportsData.reports.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl shadow-md border border-slate-700 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-blue-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                </svg>
                Print / Export PDF
              </button>
            </div>
          </div>

          {/* Multi-Parameter Filter Bar (Phase 9 & 10) */}
          <div className="bg-slate-50/80 dark:bg-gray-900/50 p-5 rounded-3xl border border-gray-250 dark:border-gray-800 shadow-sm space-y-4 print:hidden">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase text-slate-700 dark:text-gray-300">
                Filter Audit Report Criteria
              </span>
              {(reportFilters.department !== "ALL" ||
                reportFilters.category !== "ALL" ||
                reportFilters.priority !== "ALL" ||
                reportFilters.status !== "ALL" ||
                reportFilters.startDate ||
                reportFilters.endDate) && (
                <button
                  onClick={() =>
                    setReportFilters({
                      department: "ALL",
                      category: "ALL",
                      priority: "ALL",
                      status: "ALL",
                      startDate: "",
                      endDate: ""
                    })
                  }
                  className="text-[10px] font-black text-red-500 bg-red-500/10 px-2.5 py-1 rounded-lg hover:bg-red-500/20 transition"
                >
                  ✕ Reset All Criteria
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div>
                <label className="block text-[9.5px] font-black uppercase text-gray-500 mb-1">Department</label>
                <select
                  value={reportFilters.department}
                  onChange={(e) => setReportFilters({ ...reportFilters, department: e.target.value })}
                  className="w-full bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded-xl px-2.5 py-2 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Departments</option>
                  <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                  <option value="Water Supply Board">Water Supply Board</option>
                  <option value="Sanitation & Solid Waste">Sanitation & Solid Waste</option>
                  <option value="Electrical Works">Electrical Works</option>
                  <option value="Stormwater Drainage">Stormwater Drainage</option>
                  <option value="Parks & Forestry">Parks & Forestry</option>
                  <option value="Public Health">Public Health</option>
                  <option value="Unassigned">Unassigned Department</option>
                </select>
              </div>

              <div>
                <label className="block text-[9.5px] font-black uppercase text-gray-500 mb-1">Civic Category</label>
                <select
                  value={reportFilters.category}
                  onChange={(e) => setReportFilters({ ...reportFilters, category: e.target.value })}
                  className="w-full bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded-xl px-2.5 py-2 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Road Damage">Road Damage</option>
                  <option value="Garbage & Solid Waste">Garbage & Solid Waste</option>
                  <option value="Water Leakage & Supply">Water Leakage & Supply</option>
                  <option value="Street Lights">Street Lights</option>
                  <option value="Drainage & Stormwater">Drainage & Stormwater</option>
                  <option value="Public Health">Public Health</option>
                  <option value="Parks & Recreation">Parks & Recreation</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[9.5px] font-black uppercase text-gray-500 mb-1">Priority Severity</label>
                <select
                  value={reportFilters.priority}
                  onChange={(e) => setReportFilters({ ...reportFilters, priority: e.target.value })}
                  className="w-full bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded-xl px-2.5 py-2 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-[9.5px] font-black uppercase text-gray-500 mb-1">Lifecycle Status</label>
                <select
                  value={reportFilters.status}
                  onChange={(e) => setReportFilters({ ...reportFilters, status: e.target.value })}
                  className="w-full bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded-xl px-2.5 py-2 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Verified">Verified</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-[9.5px] font-black uppercase text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={reportFilters.startDate}
                  onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })}
                  className="w-full bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[9.5px] font-black uppercase text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={reportFilters.endDate}
                  onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })}
                  className="w-full bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Filtered Report Summary Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900/60 p-4 rounded-2xl border border-gray-250 dark:border-gray-800 shadow-sm text-center">
              <span className="text-xl font-black text-slate-900 dark:text-white block">
                {reportsData.summary?.totalCount || 0}
              </span>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Matching Records</p>
            </div>
            <div className="bg-white dark:bg-gray-900/60 p-4 rounded-2xl border border-gray-250 dark:border-gray-800 shadow-sm text-center">
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 block">
                {reportsData.summary?.resolvedCount || 0}
              </span>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Resolved Issues</p>
            </div>
            <div className="bg-white dark:bg-gray-900/60 p-4 rounded-2xl border border-gray-250 dark:border-gray-800 shadow-sm text-center">
              <span className="text-xl font-black text-red-600 dark:text-red-400 block">
                {reportsData.summary?.criticalCount || 0}
              </span>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Critical Cases</p>
            </div>
            <div className="bg-white dark:bg-gray-900/60 p-4 rounded-2xl border border-gray-250 dark:border-gray-800 shadow-sm text-center">
              <span className="text-xl font-black text-blue-600 dark:text-blue-400 block">
                {reportsData.summary?.averageResolutionTime || "24h"}
              </span>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Filter SLA Average</p>
            </div>
          </div>

          {/* Tabular Reports Dataset Table */}
          {loadingReports ? (
            <div className="p-12 bg-white dark:bg-gray-900/60 border border-gray-250 dark:border-gray-800 rounded-3xl text-center text-xs text-gray-400 animate-pulse font-bold">
              Generating filtered audit report dataset...
            </div>
          ) : !reportsData.reports || reportsData.reports.length === 0 ? (
            <EmptyState
              title="No Matching Audit Records Found"
              description="There are no municipal complaint records matching your selected filters or date range criteria."
              action={
                <button
                  onClick={() =>
                    setReportFilters({
                      department: "ALL",
                      category: "ALL",
                      priority: "ALL",
                      status: "ALL",
                      startDate: "",
                      endDate: ""
                    })
                  }
                  className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-700 transition"
                >
                  Reset All Filters
                </button>
              }
            />
          ) : (
            <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-150 dark:border-gray-800 pb-3">
                <SectionTitle title="Audit Record Roster" subtitle="Exact chronological entries ready for municipal compliance review or CSV export" />
                <span className="text-[11px] font-bold text-gray-500">
                  Total <strong className="text-slate-900 dark:text-white">{reportsData.reports.length}</strong> records
                </span>
              </div>

              <Table
                headers={[
                  "Ticket ID",
                  "Title & Description",
                  "Category",
                  "Department",
                  "Priority",
                  "Status",
                  "Assigned Officer",
                  "Created Date",
                  "Actions"
                ]}
                data={reportsData.reports}
                renderRow={(row) => (
                  <tr
                    key={row.id}
                    onClick={() => window.location.href = `/admin/issues/${row.id}`}
                    className="hover:bg-slate-50/60 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4 text-xs font-black text-slate-900 dark:text-white font-mono whitespace-nowrap">
                      {row.ticketId}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                        {row.title}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate max-w-xs mt-0.5 font-light">
                        {row.description || "No description provided"}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-650 dark:text-gray-300 font-medium whitespace-nowrap">
                      {row.category}
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-slate-800 dark:text-gray-200 whitespace-nowrap">
                      {row.department || "Unassigned"}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <PriorityBadge priority={row.priority} />
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-slate-700 dark:text-gray-300 whitespace-nowrap">
                      {row.assignedOfficer || "Unassigned"}
                    </td>
                    <td className="px-5 py-4 text-[11px] text-gray-500 font-mono whitespace-nowrap">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-xs font-black text-blue-600 hover:underline whitespace-nowrap print:hidden">
                      Inspect &rarr;
                    </td>
                  </tr>
                )}
              />
            </div>
          )}
        </div>
      )}

    </div>
  );
}
